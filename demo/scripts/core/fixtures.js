import { TASK_STATUS } from "./constants.js";
import { buildAnglesForTask, buildBriefFromDraft, buildFeedbackSummary, buildScenesFromAngle } from "./mock-generators.js";
import { parseStoreUrl } from "./mock-generators.js";

function createSavedApp(id, url, overrides = {}) {
  const parsed = parseStoreUrl(url);
  return {
    id,
    icon: parsed.icon,
    name: parsed.name,
    category: parsed.category,
    sourceLabel: parsed.sourceLabel,
    sourceUrl: parsed.sourceUrl,
    description: parsed.description,
    audience: parsed.audience,
    pain: parsed.pain,
    promise: parsed.promise,
    mustInclude: parsed.mustInclude,
    suggestedTemplate: parsed.suggestedTemplate,
    updatedAt: overrides.updatedAt || "2026-03-24T09:00:00.000Z",
    ...overrides
  };
}

function createTaskBase(id, savedApp, overrides = {}) {
  const templateId = overrides.templateId || savedApp.suggestedTemplate;
  const draft = {
    appData: savedApp,
    targetPlatform: overrides.targetPlatform || "meta",
    creativeGoal: overrides.creativeGoal || "angle expansion",
    targetAudience: overrides.targetAudience || savedApp.audience,
    corePain: overrides.corePain || savedApp.pain,
    corePromise: overrides.corePromise || savedApp.promise,
    cta: overrides.cta || "Download now",
    mustInclude: overrides.mustInclude || savedApp.mustInclude,
    mustAvoid: overrides.mustAvoid || "避免过度夸大或违规承诺。",
    referenceAds: overrides.referenceAds || "暂无",
    storySeed: overrides.storySeed || "",
    templateSpecific: overrides.templateSpecific || {},
    templateId
  };
  const brief = buildBriefFromDraft(draft);
  brief.templateSpecific = draft.templateSpecific;

  const task = {
    id,
    revision: 1,
    title: overrides.title || `${savedApp.name} / ${templateId}`,
    savedAppId: savedApp.id,
    appSnapshot: { ...savedApp },
    templateId,
    status: overrides.status || TASK_STATUS.ROUTES_READY,
    brief,
    angleOptions: [],
    selectedAngleId: "",
    scenes: [],
    exportState: overrides.exportState || null,
    feedbackSummary: overrides.feedbackSummary || null,
    createdAt: overrides.createdAt || "2026-03-24T08:30:00.000Z",
    updatedAt: overrides.updatedAt || "2026-03-24T09:10:00.000Z"
  };
  task.angleOptions = buildAnglesForTask(task);
  task.selectedAngleId = overrides.selectedAngleId || task.angleOptions[0].id;
  if (overrides.withScenes) {
    const angle = task.angleOptions.find((item) => item.id === task.selectedAngleId) || task.angleOptions[0];
    task.scenes = buildScenesFromAngle(task, angle);
  }
  if (overrides.exportedAt) {
    task.exportState = {
      lastExportedAt: overrides.exportedAt,
      versionLabel: "v1"
    };
  }
  if (overrides.feedback) {
    task.feedbackSummary = buildFeedbackSummary(task);
    task.status = TASK_STATUS.FEEDBACK_REVIEW;
    task.scenes = task.scenes.map((scene, index) => ({
      ...scene,
      feedbackStatus: index === 0 ? "weak" : index === task.scenes.length - 1 ? "winner" : "stable"
    }));
  }
  return task;
}

function buildStarterWorkspace() {
  const savedApps = [
    createSavedApp("app-trackmate", "https://apps.apple.com/us/app/trackmate-360"),
    createSavedApp("app-clapfind", "https://play.google.com/store/apps/details?id=com.clapfind.mobile"),
    createSavedApp("app-sleepflow", "https://apps.apple.com/us/app/sleepflow-night-reset")
  ];

  const trackmateTask = createTaskBase("task-trackmate", savedApps[0], {
    title: "FindMy Kids / 路线 1 / T2",
    templateId: "T2",
    withScenes: true,
    status: TASK_STATUS.STORYBOARD,
    templateSpecific: {
      scenarioSeed: "深夜发现对方突然关机，消息迟迟未回",
      emotionArc: "怀疑 -> 焦虑 -> 查询 -> 确认异常"
    }
  });

  const clapfindTask = createTaskBase("task-clapfind", savedApps[1], {
    title: "ClapFind / Panic hook / T1",
    templateId: "T1",
    status: TASK_STATUS.ROUTES_READY,
    creativeGoal: "new hook test",
    templateSpecific: {
      hookConstraint: "前 2 秒先给 panic 反应",
      storySeed: "加油站出发前找不到手机"
    }
  });

  const sleepTask = createTaskBase("task-sleepflow", savedApps[2], {
    title: "SleepFlow / 开场节奏复盘",
    templateId: "T1",
    withScenes: true,
    status: TASK_STATUS.FEEDBACK_REVIEW,
    creativeGoal: "winner iteration",
    templateSpecific: {
      hookConstraint: "前 3 秒不要直接出现 UI",
      storySeed: "脑子停不下来，翻来覆去睡不着"
    },
    feedback: true,
    exportedAt: "2026-03-24T09:30:00.000Z"
  });

  return {
    schemaVersion: 1,
    savedApps,
    tasks: [trackmateTask, clapfindTask, sleepTask],
    currentTaskId: trackmateTask.id,
    uiDrafts: {},
    meta: {
      nextIds: {
        app: 10,
        task: 10,
        scene: 10
      }
    }
  };
}

export function buildFixtureWorkspace(name = "starter") {
  if (name === "empty") {
    return {
      schemaVersion: 1,
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

  const starter = buildStarterWorkspace();

  if (name === "routes-ready") {
    starter.tasks = [starter.tasks[1]];
    starter.currentTaskId = starter.tasks[0].id;
    return starter;
  }

  if (name === "storyboard") {
    starter.tasks = [starter.tasks[0]];
    starter.currentTaskId = starter.tasks[0].id;
    return starter;
  }

  if (name === "feedback-review") {
    starter.tasks = [starter.tasks[2]];
    starter.currentTaskId = starter.tasks[0].id;
    return starter;
  }

  if (name === "guard-no-brief") {
    const task = createTaskBase("task-no-brief", starter.savedApps[0], {
      title: "Broken / no brief",
      withScenes: false
    });
    task.brief = null;
    starter.tasks = [task];
    starter.currentTaskId = task.id;
    return starter;
  }

  if (name === "guard-no-scenes") {
    const task = createTaskBase("task-no-scenes", starter.savedApps[0], {
      title: "Broken / no scenes",
      withScenes: false
    });
    task.status = TASK_STATUS.STORYBOARD;
    starter.tasks = [task];
    starter.currentTaskId = task.id;
    return starter;
  }

  return starter;
}
