import { TASK_STATUS } from "../core/constants.js";
import { createBlankScene, createSceneDraft } from "../core/mock-generators.js";
import { createBrowserStore } from "../core/store.js";
import { detectRuntimeMode } from "../core/test-mode.js";
import { makeHref, readTaskId } from "../core/formatters.js";
import { renderBriefCard, renderFeedbackBanner, renderGuardPanel, renderPreview, renderSceneRailItem, renderSystemNotice, renderTimelineItem } from "../core/ui.js";

const mode = detectRuntimeMode();
const store = createBrowserStore();
const workspace = store.prepareRuntime(mode);
const taskId = readTaskId(window.location.search) || workspace.currentTaskId;

const noticeMount = document.querySelector("#storyboardNotice");
const guardMount = document.querySelector("#storyboardGuard");
const briefMount = document.querySelector("#briefStrip");
const feedbackMount = document.querySelector("#feedbackBanner");
const sceneRail = document.querySelector("#sceneRail");
const previewStage = document.querySelector("#previewStage");
const timeline = document.querySelector("#timeline");
const form = document.querySelector("#sceneEditor");
const sceneStatus = document.querySelector("#sceneStatus");

let task = null;
let selectedSceneId = "";
let sceneDraft = null;
let dirty = false;

function renderGuard() {
  if (!taskId || !store.getTask(taskId)) {
    guardMount.innerHTML = renderGuardPanel({
      eyebrow: "Missing Task",
      title: "先从任务或路线页进入 storyboard。",
      body: "当前没有 taskId，或者这个任务不存在。先回首页，或从路线页继续。",
      actions: [
        { label: "返回首页", href: makeHref("/index.html"), kind: "btn-primary" },
        { label: "创建任务", href: makeHref("/new-project.html"), kind: "btn-ghost" }
      ]
    });
    return true;
  }

  task = store.getTask(taskId);
  if (!task.selectedAngleId) {
    guardMount.innerHTML = renderGuardPanel({
      eyebrow: "Missing Route",
      title: "这个任务还没选路线。",
      body: "storyboard 需要先选定一条路线，才能生成镜头骨架。",
      actions: [
        { label: "返回路线页", href: makeHref("/angles.html", { task: task.id }), kind: "btn-primary" },
        { label: "返回首页", href: makeHref("/index.html"), kind: "btn-ghost" }
      ]
    });
    return true;
  }

  if (!task.scenes.length) {
    guardMount.innerHTML = renderGuardPanel({
      eyebrow: "Missing Scenes",
      title: "当前任务还没有镜头骨架。",
      body: "先回路线页重新选路线，或者让系统先基于当前路线生成 scenes。",
      actions: [
        { label: "返回路线页", href: makeHref("/angles.html", { task: task.id }), kind: "btn-primary" }
      ]
    });
    return true;
  }

  return false;
}

function currentScene() {
  return task.scenes.find((scene) => scene.id === selectedSceneId) || task.scenes[0];
}

function setDraftFromScene(scene) {
  sceneDraft = createSceneDraft(scene);
  dirty = false;
}

function readDraftFromForm() {
  const data = new FormData(form);
  sceneDraft.title = data.get("title").toString();
  sceneDraft.beat = data.get("beat").toString();
  sceneDraft.script = data.get("script").toString();
  sceneDraft.subtitle = data.get("subtitle").toString();
  sceneDraft.languageVariants.zh = data.get("subtitleZh").toString();
  sceneDraft.languageVariants.en = data.get("subtitleEn").toString();
  sceneDraft.audio.voice = data.get("voice").toString();
  sceneDraft.audio.music = data.get("music").toString();
  sceneDraft.audio.notes = data.get("audioNotes").toString();
  sceneDraft.prompt = data.get("prompt").toString();
  sceneDraft.imageModel = data.get("imageModel").toString();
  sceneDraft.videoModel = data.get("videoModel").toString();
  sceneDraft.duration = Number(data.get("duration"));
  dirty = true;
}

function writeDraftIntoTask(draftTask) {
  const scene = draftTask.scenes.find((item) => item.id === sceneDraft.id);
  if (!scene) return;
  Object.assign(scene, sceneDraft);
}

function saveCurrentScene({ afterSave } = {}) {
  readDraftFromForm();
  const result = store.saveTask(task.id, task.revision, (draftTask) => {
    writeDraftIntoTask(draftTask);
    draftTask.status = draftTask.feedbackSummary ? TASK_STATUS.FEEDBACK_REVIEW : TASK_STATUS.STORYBOARD;
  });
  if (!result.ok) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "这个任务刚被别的标签页更新过，当前修改没有落盘。请刷新后重试。" });
    task = result.task || store.getTask(task.id);
    return false;
  }
  task = result.task;
  selectedSceneId = sceneDraft.id;
  setDraftFromScene(currentScene());
  renderTask();
  afterSave?.();
  return true;
}

function renderEditor(scene) {
  form.innerHTML = `
    <div class="field-grid two-col">
      <label class="field">
        <span>镜头标题</span>
        <input name="title" value="${scene.title}">
      </label>
      <label class="field">
        <span>镜头职责</span>
        <input name="beat" value="${scene.beat}">
      </label>
    </div>
    <label class="field">
      <span>脚本说明</span>
      <textarea name="script">${scene.script}</textarea>
    </label>
    <label class="field">
      <span>当前字幕</span>
      <input name="subtitle" value="${scene.subtitle}">
    </label>
    <div class="field-grid two-col">
      <label class="field">
        <span>ZH 字幕</span>
        <input name="subtitleZh" value="${scene.languageVariants.zh}">
      </label>
      <label class="field">
        <span>EN 字幕</span>
        <input name="subtitleEn" value="${scene.languageVariants.en}">
      </label>
    </div>
    <div class="field-grid two-col">
      <label class="field">
        <span>配音</span>
        <input name="voice" value="${scene.audio.voice}">
      </label>
      <label class="field">
        <span>音乐 / SFX</span>
        <input name="music" value="${scene.audio.music}">
      </label>
    </div>
    <label class="field">
      <span>声音备注</span>
      <textarea name="audioNotes">${scene.audio.notes}</textarea>
    </label>
    <label class="field">
      <span>${scene.media.type === "image" ? "图提示词" : "视频提示词"}</span>
      <textarea name="prompt">${scene.prompt}</textarea>
    </label>
    <div class="field-grid two-col">
      <label class="field">
        <span>生图模型</span>
        <input name="imageModel" value="${scene.imageModel}">
      </label>
      <label class="field">
        <span>视频模型</span>
        <input name="videoModel" value="${scene.videoModel}">
      </label>
    </div>
    <label class="field">
      <span>时长</span>
      <select name="duration">
        ${[2, 3, 5].map((value) => `<option value="${value}" ${value === scene.duration ? "selected" : ""}>${value}s</option>`).join("")}
      </select>
    </label>
    <div class="button-row">
      <button class="btn btn-primary" type="submit">保存当前镜头</button>
      <button class="btn btn-ghost" type="button" data-editor-action="add-after">在后面新增镜头</button>
      <button class="btn btn-ghost" type="button" data-editor-action="delete">删除当前镜头</button>
    </div>
    <div class="button-row">
      ${scene.media.type === "image"
        ? `<button class="btn btn-secondary" type="button" data-editor-action="to-video">生成视频</button>`
        : `<button class="btn btn-secondary" type="button" data-editor-action="regen-video">重生视频</button><button class="btn btn-ghost" type="button" data-editor-action="to-image">回退为图</button>`}
    </div>
  `;
}

function renderTask() {
  const scene = currentScene();
  briefMount.innerHTML = renderBriefCard(task);
  feedbackMount.innerHTML = renderFeedbackBanner(task.feedbackSummary);
  sceneRail.innerHTML = task.scenes.map((item) => renderSceneRailItem(item, item.id === scene.id)).join("");
  previewStage.innerHTML = renderPreview(scene, task);
  timeline.innerHTML = task.scenes.map((item) => renderTimelineItem(item, item.id === scene.id)).join("");
  sceneStatus.innerHTML = `
    <span class="chip warm">${task.status}</span>
    <span class="chip">${scene.media.type === "image" ? "当前是图镜头" : "当前是视频镜头"}</span>
    <span class="chip">${scene.feedbackStatus}</span>
  `;
  renderEditor(scene);
  document.querySelector("#exportVideo").setAttribute("data-task-id", task.id);
  document.querySelector("#simulateFeedback").setAttribute("data-task-id", task.id);
}

sceneRail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-scene-select]");
  if (!button) return;
  const nextId = button.dataset.sceneSelect;
  if (dirty && !window.confirm("当前镜头还有未保存修改，确认直接切换吗？")) {
    return;
  }
  selectedSceneId = nextId;
  setDraftFromScene(currentScene());
  renderTask();
});

timeline.addEventListener("click", (event) => {
  const select = event.target.closest("[data-scene-select]");
  if (select) {
    if (dirty && !window.confirm("当前镜头还有未保存修改，确认直接切换吗？")) {
      return;
    }
    selectedSceneId = select.dataset.sceneSelect;
    setDraftFromScene(currentScene());
    renderTask();
    return;
  }
  const move = event.target.closest("[data-scene-move]");
  if (!move) return;
  const direction = move.dataset.sceneMove;
  const sceneId = move.dataset.sceneId;
  const result = store.reorderScene(task.id, task.revision, sceneId, direction);
  if (!result.ok) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "顺序更新失败，请刷新后重试。" });
    return;
  }
  task = result.task;
  selectedSceneId = sceneId;
  setDraftFromScene(currentScene());
  renderTask();
});

form.addEventListener("input", () => {
  readDraftFromForm();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  saveCurrentScene();
});

form.addEventListener("click", (event) => {
  const button = event.target.closest("[data-editor-action]");
  if (!button) return;
  event.preventDefault();
  const action = button.dataset.editorAction;

  if (action === "add-after") {
    const result = store.addSceneAfter(task.id, task.revision, currentScene().id);
    if (!result.ok) {
      noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "新增镜头失败，请刷新后重试。" });
      return;
    }
    task = result.task;
    selectedSceneId = task.scenes[Math.min(task.scenes.length - 1, currentScene().order)]?.id || task.scenes.at(-1).id;
    setDraftFromScene(currentScene());
    renderTask();
    return;
  }

  if (action === "delete") {
    if (task.scenes.length === 1) {
      noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "至少保留一个镜头。当前 demo 不允许删成空 storyboard。" });
      return;
    }
    const result = store.deleteScene(task.id, task.revision, currentScene().id);
    if (!result.ok) {
      noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "删除失败，请刷新后重试。" });
      return;
    }
    task = result.task;
    selectedSceneId = task.scenes[0].id;
    setDraftFromScene(currentScene());
    renderTask();
    return;
  }

  const result = store.saveTask(task.id, task.revision, (draftTask) => {
    writeDraftIntoTask(draftTask);
    const scene = draftTask.scenes.find((item) => item.id === sceneDraft.id);
    if (!scene) return;
    if (action === "to-video") {
      scene.media.type = "video";
      scene.media.previewLabel = "Generated from still";
      scene.videoModel = scene.videoModel || "Runway / short motion";
      scene.duration = 3;
    }
    if (action === "regen-video") {
      scene.media.type = "video";
      scene.media.status = "ready";
      scene.media.previewLabel = "Video preview regenerated";
    }
    if (action === "to-image") {
      scene.media.type = "image";
      scene.media.previewLabel = "Static storyboard frame";
      scene.duration = 2;
    }
    draftTask.status = draftTask.feedbackSummary ? TASK_STATUS.FEEDBACK_REVIEW : TASK_STATUS.STORYBOARD;
  });

  if (!result.ok) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "镜头状态更新失败，请刷新后重试。" });
    return;
  }

  task = result.task;
  setDraftFromScene(currentScene());
  renderTask();
});

document.querySelector("#addScene").addEventListener("click", () => {
  const result = store.addSceneAfter(task.id, task.revision, task.scenes.at(-1).id);
  if (!result.ok) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "新增镜头失败，请刷新后重试。" });
    return;
  }
  task = result.task;
  selectedSceneId = task.scenes.at(-1).id;
  setDraftFromScene(currentScene());
  renderTask();
});

document.querySelector("#exportVideo").addEventListener("click", () => {
  if (dirty && !saveCurrentScene()) return;
  const result = store.saveTask(task.id, task.revision, (draftTask) => {
    draftTask.exportState = {
      lastExportedAt: new Date().toISOString(),
      versionLabel: `v${draftTask.revision + 1}`
    };
    draftTask.status = TASK_STATUS.EXPORTED;
  });
  if (!result.ok) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "导出状态更新失败，请刷新后重试。" });
    return;
  }
  task = result.task;
  noticeMount.innerHTML = renderSystemNotice({ tone: "info", message: "已更新最终视频导出状态。你仍然停留在同一个 storyboard 工作区。" });
  setDraftFromScene(currentScene());
  renderTask();
});

document.querySelector("#simulateFeedback").addEventListener("click", () => {
  if (dirty && !saveCurrentScene()) return;
  const result = store.createFeedbackReview(task.id, task.revision);
  if (!result.ok) {
    noticeMount.innerHTML = renderSystemNotice({ tone: "warn", message: "测试结果回流失败，请刷新后重试。" });
    return;
  }
  task = result.task;
  noticeMount.innerHTML = renderSystemNotice({ tone: "info", message: "测试结果已回流到当前 storyboard。直接在同一页继续改镜头。" });
  setDraftFromScene(currentScene());
  renderTask();
});

if (!renderGuard()) {
  task = store.getTask(taskId);
  store.setCurrentTask(task.id);
  selectedSceneId = task.scenes[0].id;
  setDraftFromScene(task.scenes[0]);
  noticeMount.innerHTML = renderSystemNotice(workspace.uiDrafts.systemNotice);
  renderTask();
  store.clearSystemNotice();
}
