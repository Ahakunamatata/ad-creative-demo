import { createBrowserStore } from "../core/store.js";
import { buildAnglesForTask, buildScenesFromAngle } from "../core/mock-generators.js";
import { readTaskId, makeHref } from "../core/formatters.js";
import { detectRuntimeMode } from "../core/test-mode.js";
import { renderBriefCard, renderGuardPanel, renderRouteCard, renderRoutePreview, renderSystemNotice } from "../core/ui.js";

const mode = detectRuntimeMode();
const store = createBrowserStore();
const workspace = store.prepareRuntime(mode);
const taskId = readTaskId(window.location.search) || workspace.currentTaskId;

const noticeMount = document.querySelector("#routeNotice");
const guardMount = document.querySelector("#routeGuard");
const briefMount = document.querySelector("#briefMount");
const routeList = document.querySelector("#routeList");
const routePreview = document.querySelector("#routePreview");
const statusMount = document.querySelector("#chosenStatus");
const moreButton = document.querySelector("#moreAngles");
const modal = document.querySelector("#moreAnglesModal");
const promptInput = document.querySelector("#anglePrompt");
const generateMoreButton = document.querySelector("#generateMoreAngles");
const closeButtons = document.querySelectorAll("[data-close-modal]");

function renderGuard() {
  if (!taskId || !store.getTask(taskId)) {
    guardMount.innerHTML = renderGuardPanel({
      eyebrow: "Missing Task",
      title: "先选择一个任务再看路线。",
      body: "当前没有 taskId，或者这个任务已经不存在。先回首页，再从任务卡或创建页进入。",
      actions: [
        { label: "返回首页", href: makeHref("/index.html"), kind: "btn-primary" },
        { label: "创建任务", href: makeHref("/new-project.html"), kind: "btn-ghost" }
      ]
    });
    return true;
  }

  const task = store.getTask(taskId);
  if (!task.brief) {
    guardMount.innerHTML = renderGuardPanel({
      eyebrow: "Missing Brief",
      title: "这个任务还没有 brief。",
      body: "路线页需要先有完整 brief，才能生成脚本方向。请先回到创建页补齐任务信息。",
      actions: [
        { label: "返回创建页", href: makeHref("/new-project.html", { app: task.savedAppId }), kind: "btn-primary" },
        { label: "返回首页", href: makeHref("/index.html"), kind: "btn-ghost" }
      ]
    });
    return true;
  }
  return false;
}

function renderTask() {
  const task = store.getTask(taskId);
  if (!task) return;
  store.setCurrentTask(task.id);
  briefMount.innerHTML = renderBriefCard(task);
  routeList.innerHTML = task.angleOptions.map((angle) => renderRouteCard(angle, task.selectedAngleId)).join("");
  const selected = task.angleOptions.find((item) => item.id === task.selectedAngleId) || task.angleOptions[0];
  routePreview.innerHTML = renderRoutePreview(selected, task.id);
  statusMount.innerHTML = `
    <div class="status-card">
      <span class="eyebrow">当前路线</span>
      <strong>${selected.title}</strong>
      <p class="muted">${selected.hook}</p>
      <p class="muted warning-line">如果你已经改过 storyboard，重新选路线会替换当前镜头骨架。</p>
    </div>
  `;
  const headerEnter = document.querySelector("#enterStoryboard");
  headerEnter?.setAttribute("href", makeHref("/storyboard.html", { task: task.id }));
  headerEnter?.addEventListener("click", () => {
    store.ensureScenesFromSelectedAngle(task.id);
  }, { once: true });
  document.querySelector("#enterStoryboardFromPreview")?.addEventListener("click", () => {
    store.ensureScenesFromSelectedAngle(task.id);
  });
}

routeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-route-select]");
  if (!button) return;
  const angleId = button.dataset.routeSelect;
  const current = store.getTask(taskId);
  const selected = current.angleOptions.find((item) => item.id === angleId);
  if (!selected) return;
  const result = store.saveTask(taskId, current.revision, (draft) => {
    draft.selectedAngleId = angleId;
    draft.scenes = buildScenesFromAngle(draft, selected);
    draft.status = "storyboard";
  });
  if (!result.ok) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "这个任务刚在别的标签页被改过，请刷新后再选路线。" });
    return;
  }
  renderTask();
});

moreButton.addEventListener("click", () => modal.classList.add("open"));
closeButtons.forEach((button) => {
  button.addEventListener("click", () => modal.classList.remove("open"));
});

generateMoreButton.addEventListener("click", () => {
  const current = store.getTask(taskId);
  if (!current) return;
  const prompt = promptInput.value.trim();
  generateMoreButton.disabled = true;
  generateMoreButton.textContent = "生成中...";
  const result = store.saveTask(taskId, current.revision, (draft) => {
    draft.angleOptions = buildAnglesForTask(draft, { prompt });
    draft.selectedAngleId = draft.angleOptions[0]?.id || "";
    draft.status = "routes_ready";
  });
  generateMoreButton.disabled = false;
  generateMoreButton.textContent = "生成新路线";
  modal.classList.remove("open");
  if (!result.ok) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "路线列表在别的标签页发生了变化，请刷新后再试。" });
    return;
  }
  renderTask();
});

if (!renderGuard()) {
  noticeMount.innerHTML = renderSystemNotice(workspace.uiDrafts.systemNotice);
  renderTask();
  store.clearSystemNotice();
}
