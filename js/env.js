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

async function loadEnv() {
  const meta = readMetaEnv();

  try {
    const res = await fetch(".env", { cache: "no-store" });
    if (res.ok) {
      const file = parseDotEnv(await res.text());
      Object.assign(meta, file);
    }
  } catch (_) {}

  const resolved = {};
  const missing = [];
  for (const key of Object.keys(ENV_DEFAULTS)) {
    const fromMeta = meta[key];
    if (fromMeta !== undefined && fromMeta !== "") {
      resolved[key] = fromMeta;
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
  }

  return window.Env;
}

window.loadEnv = loadEnv;
window.Env = Object.freeze({ ...ENV_DEFAULTS });