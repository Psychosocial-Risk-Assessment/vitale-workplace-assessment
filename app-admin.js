const companyInput = document.getElementById("company");
const questionnaireSelect = document.getElementById("questionnaire");
const generateBtn = document.getElementById("generate-btn");
const errorMsg = document.getElementById("error-msg");
const linkResult = document.getElementById("link-result");
const linkOutput = document.getElementById("link-output");
const copyBtn = document.getElementById("copy-btn");
const shareBtn = document.getElementById("share-btn");
const linkHint = document.getElementById("link-hint");

const qrModal = document.getElementById("qr-modal");
const qrModalClose = document.getElementById("qr-modal-close");
const qrCanvas = document.getElementById("qr-canvas");
const qrLink = document.getElementById("qr-link");
const qrCopyBtn = document.getElementById("qr-copy-btn");
const qrShareBtn = document.getElementById("qr-share-btn");
const qrError = document.getElementById("qr-error");

const { buildQuestionnaireUrl } = window.LinkService;

function buildUrl() {
  return buildQuestionnaireUrl({
    company: companyInput.value.trim(),
    questionnaireId: questionnaireSelect.value,
  });
}

function resetLinkUi() {
  generateBtn.disabled = false;
  copyBtn.textContent = "Copiar";
  if (shareBtn) shareBtn.textContent = "Compartilhar";
  linkOutput.value = "";
  linkResult.classList.remove("is-visible");
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {}
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

async function shareUrl(text, title) {
  if (navigator.share) {
    try {
      await navigator.share({ title: title || "Questionário Vitale", url: text });
      return { mode: "native" };
    } catch (err) {
      if (err && err.name === "AbortError") return { mode: "canceled" };
    }
  }

  const copied = await copyToClipboard(text);
  if (copied) return { mode: "clipboard" };

  return { mode: "manual", text };
}

function renderQrCode(text, targetEl) {
  if (typeof qrcode !== "function") {
    return { ok: false, reason: "qrcode-missing" };
  }

  targetEl.innerHTML = "";
  const canvas = document.createElement("canvas");
  targetEl.appendChild(canvas);

  try {
    const qr = qrcode(0, "H");
    qr.addData(text);
    qr.make();

    composeQrWithLogo(canvas, qr);
    return { ok: true };
  } catch (_) {
    targetEl.innerHTML = "";
    return { ok: false, reason: "qrcode-failed" };
  }
}

function composeQrWithLogo(canvas, qr) {
  const QR_SIZE = 280;
  const CELL = 6;
  const MODULE_COUNT = qr.getModuleCount();
  const MARGIN = 4;
  const totalModules = MODULE_COUNT + MARGIN * 2;
  const baseSize = CELL * totalModules;

  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

  canvas.width = QR_SIZE * dpr;
  canvas.height = QR_SIZE * dpr;
  canvas.style.width = QR_SIZE + "px";
  canvas.style.height = QR_SIZE + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);

  const offset = (QR_SIZE - baseSize) / 2;

  ctx.fillStyle = "#1a1a1a";
  for (let r = 0; r < MODULE_COUNT; r++) {
    for (let c = 0; c < MODULE_COUNT; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(
          offset + (c + MARGIN) * CELL,
          offset + (r + MARGIN) * CELL,
          CELL,
          CELL
        );
      }
    }
  }

  const logoArea = QR_SIZE * 0.32;
  const logoPadding = 10;
  const logoSize = logoArea - logoPadding * 2;
  const logoX = (QR_SIZE - logoArea) / 2;
  const logoY = (QR_SIZE - logoArea) / 2;

  const bgRadius = 10;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, logoX, logoY, logoArea, logoArea, bgRadius);
  ctx.fill();

  drawCenteredLogo(canvas, ctx, QR_SIZE, logoSize, () => {
    canvas.dataset.ready = "true";
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCenteredLogo(canvas, ctx, canvasSize, logoSize, onLoad) {
  const img = new Image();
  img.src = "assets/logope.png";
  img.decoding = "async";

  const draw = () => {
    const ratio = Math.min(logoSize / img.naturalWidth, logoSize / img.naturalHeight);
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    const x = (canvasSize - w) / 2;
    const y = (canvasSize - h) / 2;

    ctx.drawImage(img, x, y, w, h);
    if (typeof onLoad === "function") onLoad();
  };

  if (img.complete && img.naturalWidth > 0) {
    draw();
  } else {
    img.onload = draw;
    img.onerror = () => {
      if (typeof onLoad === "function") onLoad();
    };
  }
}

function openQrModal(url) {
  if (!qrModal) return;
  if (qrLink) qrLink.value = url;

  if (qrError) {
    qrError.hidden = true;
    qrError.textContent = "";
  }

  const result = renderQrCode(url, qrCanvas);

  if (!result.ok) {
    if (qrError) {
      qrError.hidden = false;
      qrError.textContent =
        "Não foi possível gerar o QR Code neste navegador. Use o link abaixo para compartilhar.";
    }
  }

  qrModal.classList.add("is-open");
  qrModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  setTimeout(() => qrModalClose && qrModalClose.focus(), 0);
}

function closeQrModal() {
  if (!qrModal) return;
  qrModal.classList.remove("is-open");
  qrModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

generateBtn.addEventListener("click", () => {
  const company = companyInput.value.trim();

  if (!company) {
    errorMsg.classList.add("is-visible");
    companyInput.focus();
    return;
  }

  errorMsg.classList.remove("is-visible");

  const url = buildUrl();

  linkOutput.value = url;
  linkResult.classList.add("is-visible");
  linkHint.textContent =
    "Envie este link por WhatsApp, e-mail ou QR code. Funciona em celular e computador.";
});

copyBtn.addEventListener("click", async () => {
  if (!linkOutput.value) return;

  const ok = await copyToClipboard(linkOutput.value);

  if (ok) {
    copyBtn.textContent = "Copiado!";
    generateBtn.disabled = true;
    if (shareBtn) shareBtn.disabled = true;
  } else {
    linkOutput.focus();
    linkOutput.select();
    copyBtn.textContent = "Selecione e copie (Ctrl+C)";
  }
});

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    if (!linkOutput.value) return;
    shareBtn.disabled = true;

    const result = await shareUrl(linkOutput.value, "Avaliação de Riscos Psicossociais (NR-1)");

    shareBtn.disabled = false;

    if (result.mode === "native") {
      shareBtn.textContent = "Compartilhar";
      generateBtn.disabled = true;
    } else if (result.mode === "clipboard") {
      shareBtn.textContent = "Link copiado!";
      generateBtn.disabled = true;
      copyBtn.textContent = "Copiar";
    } else if (result.mode === "manual") {
      linkOutput.focus();
      linkOutput.select();
      shareBtn.textContent = "Selecione e copie (Ctrl+C)";
    }
  });
}

const qrTrigger = document.getElementById("qr-trigger");
if (qrTrigger) {
  qrTrigger.addEventListener("click", () => {
    if (!linkOutput.value) return;
    openQrModal(linkOutput.value);
  });
}

if (qrModalClose) qrModalClose.addEventListener("click", closeQrModal);
if (qrModal) {
  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal || e.target.classList.contains("qr-modal__overlay")) {
      closeQrModal();
    }
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && qrModal && qrModal.classList.contains("is-open")) {
    closeQrModal();
  }
});

if (qrCopyBtn) {
  qrCopyBtn.addEventListener("click", async () => {
    if (!qrLink || !qrLink.value) return;
    const ok = await copyToClipboard(qrLink.value);
    if (ok) {
      qrCopyBtn.textContent = "Copiado!";
    } else {
      qrLink.focus();
      qrLink.select();
      qrCopyBtn.textContent = "Selecione e copie (Ctrl+C)";
    }
  });
}

if (qrShareBtn) {
  qrShareBtn.addEventListener("click", async () => {
    if (!qrLink || !qrLink.value) return;
    qrShareBtn.disabled = true;

    const result = await shareUrl(qrLink.value, "Avaliação de Riscos Psicossociais (NR-1)");

    qrShareBtn.disabled = false;

    if (result.mode === "native") {
      qrShareBtn.textContent = "Compartilhar";
    } else if (result.mode === "clipboard") {
      qrShareBtn.textContent = "Link copiado!";
    } else if (result.mode === "manual") {
      qrLink.focus();
      qrLink.select();
      qrShareBtn.textContent = "Selecione e copie (Ctrl+C)";
    }
  });
}

companyInput.addEventListener("input", () => {
  errorMsg.classList.remove("is-visible");

  if (generateBtn.disabled) {
    generateBtn.disabled = false;
    copyBtn.textContent = "Copiar";
    if (shareBtn) shareBtn.textContent = "Compartilhar";

    linkOutput.value = "";
    linkResult.classList.remove("is-visible");
  }
});
