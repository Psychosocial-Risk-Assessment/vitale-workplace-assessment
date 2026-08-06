// Build-time public config. Values mirror those in `.env` so static hosts
// (VS Code Live Server, GitHub Pages, etc.) can serve them as a normal
// JS file — `.env` is a dotfile and most static servers return 404 for it.
//
// Edit this file when the form's entry IDs change. Do NOT commit real
// secrets here; for an MVP this stays a public Google Form config.

(function () {
  if (typeof window === "undefined") return;

  window.__ENV_CONFIG__ = Object.freeze({
    GOOGLE_FORM_ID: "1FAIpQLSdYGsiXhmDkclGMlpjDypfFFDlrRMzMWjxpg2UZpX69-hut9w",
    GOOGLE_FORM_ENTRY_COMPANY: "entry.1355382990",
    GOOGLE_FORM_ENTRY_QUESTIONNAIRE: "entry.420033818",
    GOOGLE_FORM_ENTRY_GENDER: "entry.1645222977",
    GOOGLE_FORM_ENTRY_AGE: "entry.963709191",
    GOOGLE_FORM_ENTRY_ROLE: "entry.940938778",
    GOOGLE_FORM_ENTRY_COMPANY_TIME: "entry.2054548076",
    GOOGLE_FORM_ENTRY_DEPARTMENT: "entry.351018800",
    GOOGLE_FORM_ENTRY_UNIT: "entry.1950292232",
    GOOGLE_FORM_ENTRY_ANSWERS: "entry.444470611",
  });
})();
