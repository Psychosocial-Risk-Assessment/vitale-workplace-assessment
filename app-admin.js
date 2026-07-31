const companyInput = document.getElementById("company");
const questionnaireSelect = document.getElementById("questionnaire");
const generateBtn = document.getElementById("generate-btn");
const errorMsg = document.getElementById("error-msg");
const linkResult = document.getElementById("link-result");
const linkOutput = document.getElementById("link-output");
const copyBtn = document.getElementById("copy-btn");
const linkHint = document.getElementById("link-hint");

function buildQuestionnaireUrl(companyName, questionnaireId) {
  const base = new URL("questionnaire.html", window.location.href);
  base.searchParams.set("company", companyName.trim());
  base.searchParams.set("questionnaire", questionnaireId);
  return base.toString();
}

function resetLinkUi() {
  generateBtn.disabled = false;
  copyBtn.textContent = "Copiar";
  linkOutput.value = "";
  linkResult.classList.remove("is-visible");
}

generateBtn.addEventListener("click", () => {
  const company = companyInput.value.trim();

  if (!company) {
    errorMsg.classList.add("is-visible");
    companyInput.focus();
    return;
  }

  errorMsg.classList.remove("is-visible");

  const url = buildQuestionnaireUrl(company, questionnaireSelect.value);

  linkOutput.value = url;
  linkResult.classList.add("is-visible");
  linkHint.textContent =
    "Envie este link por WhatsApp, e-mail ou QR code. Funciona em celular e computador.";
});

copyBtn.addEventListener("click", async () => {
  if (!linkOutput.value) return;

  try {
    await navigator.clipboard.writeText(linkOutput.value);
  } catch {
    linkOutput.select();
    document.execCommand("copy");
  }

  copyBtn.textContent = "Copiado!";
  generateBtn.disabled = true;
});

companyInput.addEventListener("input", () => {
  errorMsg.classList.remove("is-visible");

  if (generateBtn.disabled) {
    generateBtn.disabled = false;
    copyBtn.textContent = "Copiar";

    linkOutput.value = "";
    linkResult.classList.remove("is-visible");
  }
});