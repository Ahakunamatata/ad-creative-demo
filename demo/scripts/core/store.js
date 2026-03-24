import { LEGACY_STORAGE_KEYS, SCHEMA_VERSION, STORAGE_KEY, TASK_STATUS } from "./constants.js";
import { buildFixtureWorkspace } from "./fixtures.js";
import { deepClone } from "./formatters.js";
import { buildAnglesForTask, buildBriefFromDraft, buildFeedbackSummary, buildScenesFromAngle, createBlankScene, mapLegacyScene, mapLegacyStatus } from "./mock-generators.js";

export function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    }
  };
}

function isValidWorkspace(workspace) {
  return Boolean(
    workspace &&
      workspace.schemaVersion === SCHEMA_VERSION &&
      Array.isArray(workspace.savedApps) &&
      Array.isArray(workspace.tasks) &&
      typeof workspace.uiDrafts === "object" &&
      workspace.meta &&
      workspace.meta.nextIds
  );
}

function makeEmptyWorkspace() {
  return {
    schemaVersion: SCHEMA_VERSION,
    savedApps: [],
    tasks: [],
    currentTaskId: "",
    uiDrafts: {},
    meta: {
      nextIds: {
        app: 1,
        task: 1,
        scene: 1
      }
    }
  };
}

function migrateLegacyProjects(payload) {
  const savedApps = [];
  const savedAppBySource = new Map();

  function upsertSavedApp(project) {
    const sourceUrl = project.appStoreUrl || "";
    if (savedAppBySource.has(sourceUrl)) return savedAppBySource.get(sourceUrl);
    const id = `legacy-app-${savedApps.length + 1}`;
    const app = {
      id,
      icon: project.icon || "📱",
      name: project.brief?.appName || project.name || "Legacy App",
      category: project.brief?.appCategory || "App",
      sourceLabel: sourceUrl.includes("play.google.com") ? "Google Play" : "App Store",
      sourceUrl,
      description: project.brief?.corePromise || "Migrated from legacy demo.",
      audience: project.brief?.targetAudience || "待补充",
      pain: project.brief?.corePain || "待补充",
      promise: project.brief?.corePromise || "待补充",
      mustInclude: project.brief?.mustInclude || "品牌 icon、核心 UI",
      suggestedTemplate: project.template || "T1",
      updatedAt: project.updatedAt || new Date().toISOString()
    };
    savedApps.push(app);
    savedAppBySource.set(sourceUrl, app);
    return app;
  }

  const tasks = (payload.projects || []).map((project, index) => {
    const savedApp = upsertSavedApp(project);
    const task = {
      id: project.id || `legacy-task-${index + 1}`,
      revision: 1,
      title: project.name || `${savedApp.name} / migrated`,
      savedAppId: savedApp.id,
      appSnapshot: deepClone(savedApp),
      templateId: project.template || "T1",
      status: mapLegacyStatus(project),
      brief: project.brief || null,
      angleOptions: (project.angles || []).map((angle) => ({
        id: angle.id,
        title: angle.title,
        hook: angle.hook,
        emotion: angle.emotion,
        rationale: angle.why || "",
        risk: angle.risk || "",
        scenes: angle.scenes || []
      })),
      selectedAngleId: project.selectedAngleId || "",
      scenes: (project.scenes || []).map((scene, sceneIndex) => mapLegacyScene(project.id || `legacy-task-${index + 1}`, scene, sceneIndex)),
      exportState: project.pipelineStatus === "exported" ? { lastExportedAt: project.updatedAt || new Date().toISOString(), versionLabel: "legacy" } : null,
      feedbackSummary: null,
      createdAt: project.updatedAt || new Date().toISOString(),
      updatedAt: project.updatedAt || new Date().toISOString()
    };

    if (!task.angleOptions.length && task.brief) {
      task.angleOptions = buildAnglesForTask(task);
      task.selectedAngleId = task.angleOptions[0]?.id || "";
    }
    return task;
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    savedApps,
    tasks,
    currentTaskId: payload.currentTaskId || tasks[0]?.id || "",
    uiDrafts: {
      systemNotice: {
        tone: "info",
        message: "已从旧版 demo 状态迁移到新的 workspace 结构。"
      }
    },
    meta: {
      nextIds: {
        app: savedApps.length + 1,
        task: tasks.length + 1,
        scene: 20
      }
    }
  };
}

export function createWorkspaceStore({ storage, now = () => new Date().toISOString() }) {
  if (!storage) throw new Error("storage is required");

  function readCurrent() {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return isValidWorkspace(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function saveWorkspace(workspace) {
    storage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }

  function resetWorkspace({ fixture = "starter", notice = null } = {}) {
    const workspace = buildFixtureWorkspace(fixture);
    if (notice) {
      workspace.uiDrafts.systemNotice = notice;
    }
    saveWorkspace(workspace);
    return deepClone(workspace);
  }

  function migrateIfNeeded() {
    const current = readCurrent();
    if (current) return current;

    for (const key of LEGACY_STORAGE_KEYS) {
      const raw = storage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.projects && Array.isArray(parsed.projects)) {
          const migrated = migrateLegacyProjects(parsed);
          saveWorkspace(migrated);
          return migrated;
        }
      } catch (error) {
        // continue to next legacy key
      }
    }

    return resetWorkspace({
      fixture: "starter",
      notice: {
        tone: "info",
        message: "已准备一份默认 demo workspace。"
      }
    });
  }

  function getWorkspace() {
    return deepClone(migrateIfNeeded());
  }

  function prepareRuntime(mode) {
    if (mode?.reset) {
      return resetWorkspace({ fixture: mode.fixture || "starter" });
    }
    if (!readCurrent()) {
      return getWorkspace();
    }
    return deepClone(readCurrent());
  }

  function clearSystemNotice() {
    const workspace = getWorkspace();
    if (!workspace.uiDrafts?.systemNotice) return;
    delete workspace.uiDrafts.systemNotice;
    saveWorkspace(workspace);
  }

  function nextId(workspace, kind) {
    const current = workspace.meta.nextIds[kind] || 1;
    workspace.meta.nextIds[kind] = current + 1;
    return `${kind}-${current}`;
  }

  function listSavedApps() {
    return getWorkspace().savedApps;
  }

  function listTasks() {
    return getWorkspace().tasks;
  }

  function getSavedApp(appId) {
    return getWorkspace().savedApps.find((item) => item.id === appId) || null;
  }

  function getTask(taskId) {
    return getWorkspace().tasks.find((item) => item.id === taskId) || null;
  }

  function setCurrentTask(taskId) {
    const workspace = getWorkspace();
    workspace.currentTaskId = taskId;
    saveWorkspace(workspace);
  }

  function upsertSavedAppFromDraft(workspace, appData) {
    const existingIndex = workspace.savedApps.findIndex((item) => item.sourceUrl && appData.sourceUrl && item.sourceUrl === appData.sourceUrl);
    const next = {
      id: existingIndex >= 0 ? workspace.savedApps[existingIndex].id : nextId(workspace, "app"),
      icon: appData.icon || "📱",
      name: appData.name,
      category: appData.category,
      sourceLabel: appData.sourceLabel,
      sourceUrl: appData.sourceUrl || "",
      description: appData.description || "",
      audience: appData.audience || "待补充",
      pain: appData.pain || "待补充",
      promise: appData.promise || "待补充",
      mustInclude: appData.mustInclude || "品牌 icon、核心 UI",
      suggestedTemplate: appData.suggestedTemplate || "T1",
      updatedAt: now()
    };

    if (existingIndex >= 0) {
      workspace.savedApps[existingIndex] = next;
    } else {
      workspace.savedApps.unshift(next);
    }
    return next;
  }

  function createTaskFromWizardDraft(draft) {
    const workspace = getWorkspace();
    const sourceApp = draft.sourceMode === "saved" && draft.selectedAppId
      ? workspace.savedApps.find((item) => item.id === draft.selectedAppId)
      : null;
    const savedApp = sourceApp || upsertSavedAppFromDraft(workspace, draft.appData);
    const taskId = nextId(workspace, "task");
    const brief = buildBriefFromDraft({
      ...draft,
      appData: sourceApp || savedApp
    });

    const task = {
      id: taskId,
      revision: 1,
      title: draft.projectTitle || `${savedApp.name} / ${draft.templateId}`,
      savedAppId: savedApp.id,
      appSnapshot: deepClone(savedApp),
      templateId: draft.templateId,
      status: TASK_STATUS.ROUTES_READY,
      brief,
      angleOptions: [],
      selectedAngleId: "",
      scenes: [],
      exportState: null,
      feedbackSummary: null,
      createdAt: now(),
      updatedAt: now()
    };
    task.angleOptions = buildAnglesForTask(task);
    task.selectedAngleId = task.angleOptions[0]?.id || "";

    workspace.tasks.unshift(task);
    workspace.currentTaskId = task.id;
    delete workspace.uiDrafts.wizard;
    saveWorkspace(workspace);
    return deepClone(task);
  }

  function saveWizardDraft(draft) {
    const workspace = getWorkspace();
    workspace.uiDrafts.wizard = deepClone(draft);
    saveWorkspace(workspace);
  }

  function getWizardDraft() {
    const workspace = getWorkspace();
    return workspace.uiDrafts.wizard ? deepClone(workspace.uiDrafts.wizard) : null;
  }

  function saveTask(taskId, baseRevision, mutate) {
    const workspace = getWorkspace();
    const index = workspace.tasks.findIndex((item) => item.id === taskId);
    if (index === -1) {
      return { ok: false, code: "missing" };
    }

    const current = workspace.tasks[index];
    if (baseRevision !== undefined && current.revision !== baseRevision) {
      return { ok: false, code: "stale", task: deepClone(current) };
    }

    const draft = deepClone(current);
    mutate(draft, {
      nextId: (kind) => nextId(workspace, kind),
      now
    });
    draft.revision = current.revision + 1;
    draft.updatedAt = now();
    workspace.tasks[index] = draft;
    workspace.currentTaskId = draft.id;
    saveWorkspace(workspace);
    return { ok: true, task: deepClone(draft) };
  }

  function ensureScenesFromSelectedAngle(taskId) {
    const task = getTask(taskId);
    if (!task || task.scenes.length || !task.selectedAngleId) {
      return task;
    }
    const angle = task.angleOptions.find((item) => item.id === task.selectedAngleId);
    if (!angle) return task;
    const result = saveTask(taskId, task.revision, (draft) => {
      draft.scenes = buildScenesFromAngle(draft, angle);
      draft.status = TASK_STATUS.STORYBOARD;
    });
    return result.ok ? result.task : task;
  }

  function addSceneAfter(taskId, baseRevision, afterSceneId) {
    return saveTask(taskId, baseRevision, (draft, helpers) => {
      const index = draft.scenes.findIndex((item) => item.id === afterSceneId);
      const insertAt = index >= 0 ? index + 1 : draft.scenes.length;
      const scene = createBlankScene(draft, helpers.nextId("scene"), insertAt + 1);
      draft.scenes.splice(insertAt, 0, scene);
      draft.scenes = draft.scenes.map((item, sceneIndex) => ({
        ...item,
        order: sceneIndex + 1
      }));
      draft.status = TASK_STATUS.STORYBOARD;
    });
  }

  function deleteScene(taskId, baseRevision, sceneId) {
    return saveTask(taskId, baseRevision, (draft) => {
      draft.scenes = draft.scenes
        .filter((item) => item.id !== sceneId)
        .map((item, index) => ({
          ...item,
          order: index + 1
        }));
      draft.status = TASK_STATUS.STORYBOARD;
    });
  }

  function reorderScene(taskId, baseRevision, sceneId, direction) {
    return saveTask(taskId, baseRevision, (draft) => {
      const index = draft.scenes.findIndex((item) => item.id === sceneId);
      if (index === -1) return;
      const target = direction === "left" ? index - 1 : index + 1;
      if (target < 0 || target >= draft.scenes.length) return;
      const [scene] = draft.scenes.splice(index, 1);
      draft.scenes.splice(target, 0, scene);
      draft.scenes = draft.scenes.map((item, sceneIndex) => ({
        ...item,
        order: sceneIndex + 1
      }));
      draft.status = TASK_STATUS.STORYBOARD;
    });
  }

  function createFeedbackReview(taskId, baseRevision) {
    return saveTask(taskId, baseRevision, (draft) => {
      draft.feedbackSummary = buildFeedbackSummary(draft);
      draft.status = TASK_STATUS.FEEDBACK_REVIEW;
      draft.scenes = draft.scenes.map((scene, index) => ({
        ...scene,
        feedbackStatus: index === 0 ? "weak" : index === draft.scenes.length - 1 ? "winner" : "stable"
      }));
    });
  }

  return {
    getWorkspace,
    prepareRuntime,
    resetWorkspace,
    clearSystemNotice,
    listSavedApps,
    listTasks,
    getSavedApp,
    getTask,
    setCurrentTask,
    createTaskFromWizardDraft,
    saveWizardDraft,
    getWizardDraft,
    saveTask,
    ensureScenesFromSelectedAngle,
    addSceneAfter,
    deleteScene,
    reorderScene,
    createFeedbackReview
  };
}

export function createBrowserStore(options = {}) {
  return createWorkspaceStore({
    storage: options.storage || window.localStorage,
    now: options.now
  });
}
