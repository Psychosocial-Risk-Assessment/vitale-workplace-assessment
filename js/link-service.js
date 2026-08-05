// ============================================================
// link-service — geração de URL do questionário
// Responsabilidade única: construir a URL absoluta para um
// questionário + empresa, sem tocar na UI.
// ============================================================

(function (root) {
  "use strict";

  /**
   * Builds the absolute URL for an organization's questionnaire.
   *
   * @param {Object} opts
   * @param {string} opts.company   - Nome da empresa (já trimado).
   * @param {string} opts.questionnaireId - ID do questionário (ex.: "copsoq3").
   * @param {string} [opts.baseHref]     - Base URL (default: window.location.href).
   * @param {string} [opts.targetPath]   - Caminho do questionário (default: "questionnaire.html").
   * @returns {string} URL completa.
   */
  function buildQuestionnaireUrl(opts) {
    if (!opts || !opts.company || !opts.questionnaireId) {
      throw new Error("link-service: company and questionnaireId are required");
    }

    const baseHref = opts.baseHref || (typeof window !== "undefined" ? window.location.href : "");
    const targetPath = opts.targetPath || "questionnaire.html";

    const url = new URL(targetPath, baseHref);
    url.searchParams.set("company", String(opts.company).trim());
    url.searchParams.set("questionnaire", String(opts.questionnaireId));
    return url.toString();
  }

  const api = { buildQuestionnaireUrl };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.LinkService = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
