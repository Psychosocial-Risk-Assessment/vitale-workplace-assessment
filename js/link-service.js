(function (root) {
  "use strict";

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
