import { createBrowserStore } from "../core/store.js";
import { detectRuntimeMode } from "../core/test-mode.js";
import { makeHref } from "../core/formatters.js";
import { renderExampleCards, renderNewTaskCard, renderSavedAppCard, renderSystemNotice, renderTaskCard } from "../core/ui.js";

const mode = detectRuntimeMode();
const store = createBrowserStore();
const workspace = store.prepareRuntime(mode);

const tasksView = document.querySelector("#tasksView");
const appsView = document.querySelector("#appsView");
const taskGrid = document.querySelector("#taskGrid");
const appGrid = document.querySelector("#appGrid");
const taskStats = document.querySelector("#homeStats");
const noticeMount = document.querySelector("#systemNotice");
const tabs = document.querySelectorAll("[data-home-tab]");
const appCount = workspace.savedApps.length;
const taskCount = workspace.tasks.length;
const activeTaskCount = workspace.tasks.filter((task) => ["storyboard", "exported", "feedback_review"].includes(task.status)).length;

function renderStats() {
  taskStats.innerHTML = `
    <article class="stat-card"><span>任务总数</span><strong>${taskCount}</strong></article>
    <article class="stat-card"><span>Saved Apps</span><strong>${appCount}</strong></article>
    <article class="stat-card"><span>在制作中</span><strong>${activeTaskCount}</strong></article>
    <article class="stat-card"><span>当前阶段</span><strong>Front-end Demo</strong></article>
  `;
}

function renderViews() {
  taskGrid.innerHTML = [renderNewTaskCard(), ...workspace.tasks.map(renderTaskCard)].join("");
  appGrid.innerHTML = workspace.savedApps.map(renderSavedAppCard).join("");
  document.querySelector("#exampleCards").innerHTML = renderExampleCards();
  noticeMount.innerHTML = renderSystemNotice(workspace.uiDrafts.systemNotice);
}

function setView(view) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.homeTab === view);
  });
  tasksView.classList.toggle("hidden", view !== "tasks");
  appsView.classList.toggle("hidden", view !== "apps");
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.dataset.homeTab));
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (href?.includes("task=")) {
    const id = new URL(href, window.location.origin).searchParams.get("task");
    if (id) store.setCurrentTask(id);
  }
});

document.querySelector("#startFromScratch")?.setAttribute("href", makeHref("/new-project.html"));

renderStats();
renderViews();
setView("tasks");
store.clearSystemNotice();
