import { TEMPLATE_CATALOG } from "../core/mock-data.js";
import { parseStoreUrl } from "../core/mock-generators.js";
import { createBrowserStore } from "../core/store.js";
import { makeHref } from "../core/formatters.js";
import { detectRuntimeMode, waitForLatency } from "../core/test-mode.js";
import { renderBriefCard, renderSystemNotice } from "../core/ui.js";

const mode = detectRuntimeMode();
const store = createBrowserStore();
const workspace = store.prepareRuntime(mode);

const params = new URLSearchParams(window.location.search);
const preselectedAppId = params.get("app") || "";
const preselectedApp = preselectedAppId ? store.getSavedApp(preselectedAppId) : null;

const stepButtons = document.querySelectorAll("[data-step-target]");
const stepSections = document.querySelectorAll("[data-step-section]");
const nextButtons = document.querySelectorAll("[data-next-step]");
const prevButtons = document.querySelectorAll("[data-prev-step]");
const savedAppList = document.querySelector("#wizardSavedApps");
const selectedAppCard = document.querySelector("#selectedAppCard");
const parseButton = document.querySelector("#detectStoreButton");
const detectedCard = document.querySelector("#detectedAppCard");
const templateGrid = document.querySelector("#templateGrid");
const templateFields = document.querySelector("#templateFields");
const summaryMount = document.querySelector("#wizardSummary");
const briefPreview = document.querySelector("#briefPreview");
const noticeMount = document.querySelector("#wizardNotice");
const form = document.querySelector("#wizardForm");

const savedDraft = store.getWizardDraft();

let draft = savedDraft || {
  step: 1,
  sourceMode: preselectedApp ? "saved" : "manual",
  selectedAppId: preselectedApp?.id || "",
  projectTitle: preselectedApp ? `${preselectedApp.name} / 新任务` : "",
  storeUrl: "",
  appData: preselectedApp || {
    icon: "📱",
    name: "",
    category: "",
    sourceLabel: "Manual",
    sourceUrl: "",
    description: "",
    audience: "",
    pain: "",
    promise: "",
    mustInclude: "",
    suggestedTemplate: "T2"
  },
  templateId: preselectedApp?.suggestedTemplate || "T2",
  targetPlatform: "meta",
  creativeGoal: "angle expansion",
  targetAudience: preselectedApp?.audience || "",
  corePain: preselectedApp?.pain || "",
  corePromise: preselectedApp?.promise || "",
  cta: "Download now",
  mustInclude: preselectedApp?.mustInclude || "",
  mustAvoid: "避免夸大承诺或违规暗示。",
  referenceAds: "",
  storySeed: "",
  templateSpecific: {}
};

function syncTemplateFields() {
  const fields = TEMPLATE_CATALOG[draft.templateId].fields;
  templateFields.innerHTML = fields.map((field) => `
    <label class="field">
      <span>${field.label}</span>
      <textarea data-template-field="${field.id}" placeholder="${field.placeholder}">${draft.templateSpecific[field.id] || ""}</textarea>
    </label>
  `).join("");
}

function renderSavedApps() {
  savedAppList.innerHTML = workspace.savedApps.map((app) => `
    <button class="picker-card ${app.id === draft.selectedAppId ? "active" : ""}" type="button" data-select-app="${app.id}">
      <div class="app-id">
        <span class="app-icon">${app.icon}</span>
        <div>
          <strong>${app.name}</strong>
          <small>${app.sourceLabel}</small>
        </div>
      </div>
      <span class="muted">${app.category}</span>
    </button>
  `).join("");
}

function renderSelectedApp() {
  if (!draft.appData.name) {
    selectedAppCard.innerHTML = `<div class="empty-inline">选择一个已保存 App，或贴商店链接识别新的产品。</div>`;
    return;
  }
  selectedAppCard.innerHTML = `
    <article class="mini-card">
      <div class="app-id">
        <span class="app-icon">${draft.appData.icon}</span>
        <div>
          <strong>${draft.appData.name}</strong>
          <small>${draft.appData.sourceLabel}</small>
        </div>
      </div>
      <p class="muted">${draft.appData.description || "补充产品描述。"}</p>
    </article>
  `;
}

function renderTemplates() {
  templateGrid.innerHTML = Object.values(TEMPLATE_CATALOG).map((template) => `
    <button class="template-card ${template.id === draft.templateId ? "active" : ""}" type="button" data-template="${template.id}">
      <div class="eyebrow">${template.shortLabel}</div>
      <h3>${template.name}</h3>
      <p class="muted">${template.summary}</p>
    </button>
  `).join("");
}

function renderSummary() {
  summaryMount.innerHTML = `
    <div class="sticky-stack">
      <article class="mini-card">
        <div class="eyebrow">当前任务</div>
        <h3>${draft.projectTitle || "未命名任务"}</h3>
        <div class="meta-list compact">
          <div><strong>App</strong><span>${draft.appData.name || "待选择"}</span></div>
          <div><strong>模板</strong><span>${TEMPLATE_CATALOG[draft.templateId].shortLabel}</span></div>
          <div><strong>平台</strong><span>${draft.targetPlatform}</span></div>
          <div><strong>目标</strong><span>${draft.creativeGoal}</span></div>
        </div>
      </article>
      <article class="mini-card">
        <div class="eyebrow">为什么现在这样拆</div>
        <p class="muted">先选 App，再补模板和 brief，最后生成路线。这样用户面对的是逐步确认，不是一整页大表单。</p>
      </article>
    </div>
  `;
}

function populateFormValues() {
  const fieldMap = {
    projectTitle: draft.projectTitle,
    storeUrl: draft.storeUrl,
    targetPlatform: draft.targetPlatform,
    creativeGoal: draft.creativeGoal,
    targetAudience: draft.targetAudience,
    corePain: draft.corePain,
    corePromise: draft.corePromise,
    cta: draft.cta,
    mustInclude: draft.mustInclude,
    mustAvoid: draft.mustAvoid,
    referenceAds: draft.referenceAds,
    storySeed: draft.storySeed
  };

  Object.entries(fieldMap).forEach(([id, value]) => {
    const element = form.querySelector(`#${id}`);
    if (element) {
      element.value = value || "";
    }
  });
}

function renderBriefPreview() {
  if (draft.step !== 4) {
    briefPreview.innerHTML = "";
    return;
  }
  const taskLike = {
    appSnapshot: draft.appData,
    templateId: draft.templateId,
    status: "brief_ready",
    brief: {
      appName: draft.appData.name || "未命名产品",
      appCategory: draft.appData.category || "App",
      sourceLabel: draft.appData.sourceLabel || "Manual",
      targetPlatform: draft.targetPlatform,
      creativeGoal: draft.creativeGoal,
      targetAudience: draft.targetAudience || "待补充",
      corePain: draft.corePain || "待补充",
      corePromise: draft.corePromise || "待补充",
      cta: draft.cta || "Download now",
      mustInclude: draft.mustInclude || "无",
      referenceAds: draft.referenceAds || "暂无"
    }
  };
  briefPreview.innerHTML = renderBriefCard(taskLike);
}

function syncStep() {
  stepButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.stepTarget) === draft.step);
  });
  stepSections.forEach((section) => {
    section.classList.toggle("hidden", Number(section.dataset.stepSection) !== draft.step);
  });
  renderBriefPreview();
  renderSummary();
  populateFormValues();
  store.saveWizardDraft(draft);
}

function updateDraftFromForm() {
  const formData = new FormData(form);
  draft.projectTitle = formData.get("projectTitle")?.toString().trim() || "";
  draft.storeUrl = formData.get("storeUrl")?.toString().trim() || "";
  draft.targetPlatform = formData.get("targetPlatform")?.toString() || "meta";
  draft.creativeGoal = formData.get("creativeGoal")?.toString() || "angle expansion";
  draft.targetAudience = formData.get("targetAudience")?.toString().trim() || "";
  draft.corePain = formData.get("corePain")?.toString().trim() || "";
  draft.corePromise = formData.get("corePromise")?.toString().trim() || "";
  draft.cta = formData.get("cta")?.toString().trim() || "Download now";
  draft.mustInclude = formData.get("mustInclude")?.toString().trim() || "";
  draft.mustAvoid = formData.get("mustAvoid")?.toString().trim() || "";
  draft.referenceAds = formData.get("referenceAds")?.toString().trim() || "";
  draft.storySeed = formData.get("storySeed")?.toString().trim() || "";
  templateFields.querySelectorAll("[data-template-field]").forEach((field) => {
    draft.templateSpecific[field.dataset.templateField] = field.value.trim();
  });
}

function validateBeforeGenerate() {
  updateDraftFromForm();
  if (!draft.appData.name) return "先选择一个 App，或先识别产品链接。";
  if (!draft.targetAudience || !draft.corePain || !draft.corePromise) {
    return "目标受众、核心痛点和核心承诺都需要补齐。";
  }
  return "";
}

savedAppList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-select-app]");
  if (!button) return;
  const app = workspace.savedApps.find((item) => item.id === button.dataset.selectApp);
  if (!app) return;
  draft.sourceMode = "saved";
  draft.selectedAppId = app.id;
  draft.appData = {
    ...app
  };
  draft.projectTitle = draft.projectTitle || `${app.name} / 新任务`;
  draft.templateId = app.suggestedTemplate || draft.templateId;
  draft.targetAudience = draft.targetAudience || app.audience;
  draft.corePain = draft.corePain || app.pain;
  draft.corePromise = draft.corePromise || app.promise;
  draft.mustInclude = draft.mustInclude || app.mustInclude;
  renderSavedApps();
  renderSelectedApp();
  renderTemplates();
  syncTemplateFields();
  populateFormValues();
  renderSummary();
});

templateGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-template]");
  if (!button) return;
  draft.templateId = button.dataset.template;
  renderTemplates();
  syncTemplateFields();
  renderSummary();
});

parseButton.addEventListener("click", async () => {
  updateDraftFromForm();
  const parsed = parseStoreUrl(draft.storeUrl);
  if (!parsed) {
    detectedCard.innerHTML = `<div class="notice warn"><strong>缺少链接</strong><p class="muted">先输入一个 App Store 或 Google Play 链接。</p></div>`;
    return;
  }
  parseButton.disabled = true;
  parseButton.textContent = "识别中...";
  detectedCard.innerHTML = `
    <div class="progress-card">
      <div class="eyebrow">Parsing</div>
      <div class="progress-step active">连接商店页</div>
      <div class="progress-step">识别产品资料</div>
      <div class="progress-step">提炼痛点与承诺</div>
      <div class="progress-step">推荐模板</div>
    </div>
  `;
  await waitForLatency(mode);
  draft.sourceMode = "store";
  draft.selectedAppId = "";
  draft.appData = parsed;
  draft.templateId = parsed.suggestedTemplate || draft.templateId;
  draft.targetAudience = parsed.audience;
  draft.corePain = parsed.pain;
  draft.corePromise = parsed.promise;
  draft.mustInclude = parsed.mustInclude;
  renderTemplates();
  syncTemplateFields();
  renderSelectedApp();
  populateFormValues();
  detectedCard.innerHTML = `
    <article class="mini-card">
      <div class="app-id">
        <span class="app-icon">${parsed.icon}</span>
        <div>
          <strong>${parsed.name}</strong>
          <small>${parsed.sourceLabel} · 推荐 ${TEMPLATE_CATALOG[draft.templateId].shortLabel}</small>
        </div>
      </div>
      <p class="muted">${parsed.description}</p>
    </article>
  `;
  parseButton.disabled = false;
  parseButton.textContent = "自动识别";
  renderSummary();
});

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateDraftFromForm();
    draft.step = Number(button.dataset.nextStep);
    syncStep();
  });
});

prevButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateDraftFromForm();
    draft.step = Number(button.dataset.prevStep);
    syncStep();
  });
});

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateDraftFromForm();
    draft.step = Number(button.dataset.stepTarget);
    syncStep();
  });
});

document.querySelector("#generateTask").addEventListener("click", () => {
  const error = validateBeforeGenerate();
  if (error) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: error });
    return;
  }
  const task = store.createTaskFromWizardDraft(draft);
  window.location.href = makeHref("/angles.html", { task: task.id });
});

noticeMount.innerHTML = renderSystemNotice(workspace.uiDrafts.systemNotice);
renderSavedApps();
renderSelectedApp();
renderTemplates();
syncTemplateFields();
syncStep();
store.clearSystemNotice();
