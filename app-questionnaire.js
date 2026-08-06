function readGoogleFormEntries() {
  return {
    company: window.Env.GOOGLE_FORM_ENTRY_COMPANY || "",
    questionnaire: window.Env.GOOGLE_FORM_ENTRY_QUESTIONNAIRE || "",
    gender: window.Env.GOOGLE_FORM_ENTRY_GENDER || "",
    age: window.Env.GOOGLE_FORM_ENTRY_AGE || "",
    role: window.Env.GOOGLE_FORM_ENTRY_ROLE || "",
    companyTime: window.Env.GOOGLE_FORM_ENTRY_COMPANY_TIME || "",
    department: window.Env.GOOGLE_FORM_ENTRY_DEPARTMENT || "",
    unit: window.Env.GOOGLE_FORM_ENTRY_UNIT || "",
    answers: window.Env.GOOGLE_FORM_ENTRY_ANSWERS || "",
  };
}

let GOOGLE_FORM_ID = "";
let GOOGLE_FORM_ENTRIES = readGoogleFormEntries();

const qs = new URLSearchParams(window.location.search);
const companyParam = qs.get("company");
const questionnaireParam = qs.get("questionnaire");

const els = {
  error: document.getElementById("state-error"),
  errorDetail: document.getElementById("state-error-detail"),
  loading: document.getElementById("state-loading"),
  done: document.getElementById("state-done"),
  sending: document.getElementById("state-sending"),
  shell: document.getElementById("q-shell"),
  company: document.getElementById("q-company"),
  title: document.getElementById("q-title"),
  gaugeCurrent: document.getElementById("gauge-current"),
  gaugeTotal: document.getElementById("gauge-total"),
  gaugePercent: document.getElementById("gauge-percent"),
  gaugeFill: document.getElementById("gauge-fill"),
  qIndex: document.getElementById("q-index"),
  qText: document.getElementById("q-text"),
  qOptions: document.getElementById("q-options"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  employeeShell: document.getElementById("employee-shell"),
  employeeGender: document.getElementById("employee-gender"),
  employeeAge: document.getElementById("employee-age"),
  employeeRole: document.getElementById("employee-role"),
  employeeCompanyTime: document.getElementById("employee-company-time"),
  employeeDepartment: document.getElementById("employee-department"),
  employeeUnit: document.getElementById("employee-unit"),
  btnStart: document.getElementById("btn-start-questionnaire"),
};

function showOnly(stateEl) {
  [els.error, els.loading, els.done, els.sending, els.employeeShell, els.shell].forEach((el) => {
    if (!el) return;
    el.style.display = el === stateEl ? "flex" : "none";
  });
}

function readEmployeeForm() {
  return [
    { el: els.employeeGender, value: els.employeeGender.value.trim() },
    { el: els.employeeAge, value: els.employeeAge.value.trim() },
    { el: els.employeeRole, value: els.employeeRole.value.trim() },
    { el: els.employeeCompanyTime, value: els.employeeCompanyTime.value.trim() },
    { el: els.employeeDepartment, value: els.employeeDepartment.value.trim() },
    { el: els.employeeUnit, value: els.employeeUnit.value.trim() },
  ];
}

function validateEmployee() {
  const fields = readEmployeeForm();

  fields.forEach(({ el }) => el.classList.remove("is-invalid"));
  const empty = fields.filter(({ value }) => !value);

  if (empty.length) {
    empty.forEach(({ el }) => el.classList.add("is-invalid"));
    return null;
  }

  const [fGender, fAge, fRole, fCompanyTime, fDepartment, fUnit] = fields;
  return {
    gender: fGender.value,
    age: fAge.value,
    role: fRole.value,
    companyTime: fCompanyTime.value,
    department: fDepartment.value,
    unit: fUnit.value,
  };
}

function fail(message) {
  els.errorDetail.textContent = message;
  showOnly(els.error);
}

function bootstrapAfterEnv() {
  GOOGLE_FORM_ID = window.Env.GOOGLE_FORM_ID || "";
  GOOGLE_FORM_ENTRIES = readGoogleFormEntries();

  if (!companyParam || !questionnaireParam) {
    fail("Este link está sem os parâmetros de empresa ou questionário. Peça o link correto a quem organizou a avaliação.");
  } else {
    loadQuestionnaire(questionnaireParam);
  }
}

function bootstrap() {
  if (typeof window.loadEnv === "function") {
    window.loadEnv().then(bootstrapAfterEnv);
  } else {
    bootstrapAfterEnv();
  }
}

bootstrap();

let state = {
  data: null,
  questions: [],
  currentIndex: 0,
  responses: {},
  employee: {
    gender: "",
    age: "",
    role: "",
    companyTime: "",
    department: "",
    unit: "",
  },
};

async function loadQuestionnaire(id) {
  const safeId = id.replace(/[^a-z0-9_-]/gi, "");

  try {
    const res = await fetch(`data/${safeId}.json`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("not found");

    const data = await res.json();

    if (!data.sections || !data.sections.length)
      throw new Error("empty");

    state.data = data;

    state.questions = data.sections.flatMap(section =>
      section.questions.map(question => ({
        ...question,
        sectionId: section.id,
        sectionTitle: section.title
      }))
    );

    showEmployeeForm();

  } catch {
    fail(`Não encontramos o questionário "${id}". Verifique se o arquivo data/${safeId}.json existe.`);
  }
}

function showEmployeeForm() {
  showOnly(els.employeeShell);
}

function handleStart() {
  const employee = validateEmployee();
  if (!employee) return;
  state.employee = employee;
  startQuestionnaire();
}

if (els.btnStart) {
  els.btnStart.addEventListener("click", handleStart);
}

function startQuestionnaire() {
  els.company.textContent = companyParam;
  els.gaugeTotal.textContent = state.questions.length;
  showOnly(els.shell);
  renderQuestion();
}

function renderQuestion() {
  const total = state.questions.length;
  const question = state.questions[state.currentIndex];
  const scale = state.data.scales[question.scaleId];

  els.qIndex.textContent =
    `Pergunta ${String(state.currentIndex + 1).padStart(2, "0")}`;

  els.qText.textContent = question.text;

  els.gaugeCurrent.textContent = state.currentIndex + 1;

  const percent = Math.round(((state.currentIndex + 1) / total) * 100);

  els.gaugeFill.style.width = `${percent}%`;
  els.gaugePercent.textContent = `${percent}%`;

  els.qOptions.innerHTML = "";

  if (question.type === "textarea" || question.type === "open") {

    const textarea = document.createElement("textarea");
    textarea.className = "q-textarea";
    textarea.rows = 5;
    textarea.value = state.responses[question.id] || "";

    textarea.addEventListener("input", (e) => {
      state.responses[question.id] = e.target.value;
      renderQuestion();
    });

    els.qOptions.appendChild(textarea);

  } else if (scale) {

    scale.forEach((opt) => {

      const selected = state.responses[question.id] === opt.value;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "q-option" + (selected ? " is-selected" : "");
      button.innerHTML =
        `<span class="q-option__dot"></span><span class="q-option__text">${opt.label}</span>`;

      button.addEventListener("click", () => {
        state.responses[question.id] = opt.value;
        renderQuestion();
      });

      els.qOptions.appendChild(button);

    });

  }

  els.btnPrev.disabled = state.currentIndex === 0;

  const isLast = state.currentIndex === total - 1;

  els.btnNext.textContent = isLast ? "Enviar" : "Próximo";
  els.btnNext.classList.toggle("q-btn--submit", isLast);

  const answered =
    state.responses[question.id] !== undefined &&
    state.responses[question.id] !== "";

  els.btnNext.disabled = !answered;
}

els.btnPrev.addEventListener("click", () => {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderQuestion();
  }
});

els.btnNext.addEventListener("click", () => {

  const total = state.questions.length;

  if (state.currentIndex === total - 1) {
    submitResponses();
    return;
  }

  state.currentIndex++;
  renderQuestion();

});

function buildExportAnswers() {
  return state.questions.map((question) => {

    const value = state.responses[question.id];

    const option = state.data.scales[question.scaleId]
      ?.find(scale => scale.value === value);

    return {
      section: question.sectionTitle,
      question: question.text,
      value,
      label: option?.label ?? ""
    };

  });
}

async function submitResponses() {

  console.log("=== submitResponses ===");

  showOnly(els.sending);

  const payload = {
    company: companyParam,
    questionnaire: state.data.id,
    submittedAt: new Date().toISOString(),
    employee: { ...state.employee },
    answers: buildExportAnswers(),
  };

  const hasFormConfig =
  GOOGLE_FORM_ID &&
  Object.values(GOOGLE_FORM_ENTRIES).every(Boolean);

  if (hasFormConfig) {

    try {

      const params = new URLSearchParams();

      const answersText = payload.answers
        .map(
          (answer) => `Seção: ${answer.section}
Pergunta: ${answer.question}
Valor: ${answer.value}
Resposta: ${answer.label}`
        )
        .join("\n\n");

      const fieldsToSend = {
        company: payload.company,
        questionnaire: payload.questionnaire,
        gender: payload.employee.gender,
        age: payload.employee.age,
        role: payload.employee.role,
        companyTime: payload.employee.companyTime,
        department: payload.employee.department,
        unit: payload.employee.unit,
        answers: answersText,
      };

      for (const [key, value] of Object.entries(fieldsToSend)) {
        const entryId = GOOGLE_FORM_ENTRIES[key];
        if (entryId) params.append(entryId, value);
      }

      const submitUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;
      const body = params.toString();
      const startedAt = performance.now();

      console.log("[submit] Enviando respostas ao Google Forms", {
        url: submitUrl,
        bodyBytes: body.length,
        fields: Object.keys(fieldsToSend),
      });

      await fetch(submitUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const elapsed = Math.round(performance.now() - startedAt);
      console.log(
        `[submit] Requisição finalizada em ${elapsed}ms. ` +
          `Com mode:"no-cors" a resposta é opaca (status 0); ` +
          `confirme os dados na aba "Respostas" do Google Forms.`
      );

    } catch (err) {

      console.error("[submit] Falha ao enviar para o Google Forms:", err);
      console.log("[submit] Payload completo (para debug):", payload);

    }

  } else {

    console.warn(
      "[submit] Google Forms não configurado — nenhum envio foi realizado.",
      {
        hasFormId: Boolean(GOOGLE_FORM_ID),
        missingEntries: Object.entries(GOOGLE_FORM_ENTRIES)
          .filter(([, v]) => !v)
          .map(([k]) => k),
      }
    );
    console.log("[submit] Payload (modo local):", payload);

  }

  showOnly(els.done);

}
