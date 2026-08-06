const ENV_DEFAULTS = Object.freeze({
  GOOGLE_FORM_ID: "",
  GOOGLE_FORM_ENTRY_COMPANY: "",
  GOOGLE_FORM_ENTRY_QUESTIONNAIRE: "",
  GOOGLE_FORM_ENTRY_GENDER: "",
  GOOGLE_FORM_ENTRY_AGE: "",
  GOOGLE_FORM_ENTRY_ROLE: "",
  GOOGLE_FORM_ENTRY_COMPANY_TIME: "",
  GOOGLE_FORM_ENTRY_DEPARTMENT: "",
  GOOGLE_FORM_ENTRY_UNIT: "",
  GOOGLE_FORM_ENTRY_ANSWERS: "",
});

function parseDotEnv(raw) {
  const out = {};
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  });
  return out;
}

function readMetaEnv() {
  const out = {};
  document.querySelectorAll('meta[name^="env:"]').forEach((meta) => {
    const key = meta.getAttribute("name").slice(4);
    out[key] = meta.getAttribute("content") || "";
  });
  return out;
}

function readInlineGlobal() {
  if (typeof window === "undefined") return {};
  const cfg = window.__ENV_CONFIG__;
  if (!cfg || typeof cfg !== "object") return {};
  return { ...cfg };
}

async function loadEnv() {
  const inline = readInlineGlobal();
  const meta = readMetaEnv();
  const dotFile = {};

  try {
    const res = await fetch(".env", { cache: "no-store" });
    if (res.ok) {
      const file = parseDotEnv(await res.text());
      Object.assign(dotFile, file);
    }
  } catch (_) {}

  const resolved = {};
  const missing = [];
  for (const key of Object.keys(ENV_DEFAULTS)) {
    const sources = [inline[key], meta[key], dotFile[key]];
    const found = sources.find(
      (v) => v !== undefined && v !== null && v !== ""
    );
    if (found !== undefined) {
      resolved[key] = found;
    } else {
      resolved[key] = ENV_DEFAULTS[key];
      missing.push(key);
    }
  }

  window.Env = Object.freeze(resolved);

  if (missing.length) {
    console.warn(
      "[env] Variáveis ausentes (usando defaults vazios):",
      missing.join(", ")
    );
  } else {
    console.info(
      `[env] ${Object.keys(resolved).length} variáveis carregadas.`
    );
  }

  return window.Env;
}

window.loadEnv = loadEnv;
window.Env = Object.freeze({ ...ENV_DEFAULTS });