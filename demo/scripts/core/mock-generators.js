import { TASK_STATUS } from "./constants.js";
import { TEMPLATE_CATALOG, STORE_SAMPLES } from "./mock-data.js";
import { deepClone } from "./formatters.js";

export function parseStoreUrl(url = "") {
  const value = url.trim();
  if (!value) return null;
  if (STORE_SAMPLES[value]) {
    return {
      ...deepClone(STORE_SAMPLES[value]),
      sourceUrl: value
    };
  }
  const slug = value.split("/").filter(Boolean).pop() || "mobile-app";
  const guessedName = slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    icon: "📱",
    name: guessedName,
    category: value.includes("play.google.com") ? "Android App" : "Mobile App",
    sourceLabel: value.includes("play.google.com") ? "Google Play" : "App Store",
    sourceUrl: value,
    description: "基于商店链接识别了基础产品信息，建议人工再确认痛点和核心承诺。",
    audience: "待补充",
    pain: "需要人工补充更具体的用户痛点。",
    promise: "需要人工补充产品承诺与转化点。",
    mustInclude: "品牌 icon、核心 UI",
    suggestedTemplate: "T1"
  };
}

export function buildBriefFromDraft(draft) {
  const app = draft.appData;
  return {
    appName: app.name,
    appCategory: app.category,
    sourceLabel: app.sourceLabel,
    sourceUrl: app.sourceUrl,
    targetPlatform: draft.targetPlatform,
    creativeGoal: draft.creativeGoal,
    targetAudience: draft.targetAudience || app.audience,
    corePain: draft.corePain || app.pain,
    corePromise: draft.corePromise || app.promise,
    cta: draft.cta || "Download now",
    mustInclude: draft.mustInclude || app.mustInclude,
    mustAvoid: draft.mustAvoid || "避免夸大承诺或看起来像监控。",
    referenceAds: draft.referenceAds || "暂无",
    storySeed: draft.storySeed || "",
    templateSpecific: deepClone(draft.templateSpecific || {})
  };
}

function outlineByTemplate(task, variant) {
  const { brief, templateId } = task;
  if (templateId === "T3") {
    return [
      `保留 winner 开场骨架，但把 hook 改成更贴近 ${brief.targetAudience} 的说法`,
      `中段继续强调“${brief.corePain}”的损耗`,
      `产品演示保持原逻辑，只替换用词与镜头节奏 (${variant})`,
      `结尾 CTA 更直接地推动安装`
    ];
  }
  if (templateId === "T2") {
    return [
      `用“${brief.templateSpecific?.scenarioSeed || brief.corePain}”作为开场情境`,
      `把冲突持续放大，让用户感到问题正在恶化`,
      `让产品自然介入，承接“${brief.corePromise}”`,
      `给出关键信息揭示，让用户明确知道发生了什么`,
      `最后给出结果和 CTA`
    ];
  }
  return [
    `第一镜头直接打出“${brief.corePain}”`,
    `第二镜头解释为什么这个问题反复发生`,
    `第三镜头展示产品如何快速介入`,
    `第四镜头给出结果和 CTA`
  ];
}

export function buildAnglesForTask(task, { prompt = "" } = {}) {
  const suffix = prompt ? ` / 强调：${prompt}` : "";
  const base = [
    {
      id: `${task.id}-angle-1`,
      title: "直接痛点切入",
      hook: `开场 2 秒直接把“${task.brief.corePain.slice(0, 20)}”打出来${suffix}`,
      emotion: "高压、真实、投放原生感",
      rationale: "先测最直接的痛点表达，最快看出前 3 秒留存。",
      risk: "如果演绎过重，会显得戏剧化过头。",
      scenes: outlineByTemplate(task, "pain")
    },
    {
      id: `${task.id}-angle-2`,
      title: "反差揭示路线",
      hook: `先让用户以为没问题，再突然给出反差信息${suffix}`,
      emotion: "悬念、转折、信息揭示",
      rationale: "适合做 hook 变体，与平铺直叙形成明显差异。",
      risk: "需要控制节奏，避免前戏过长。",
      scenes: outlineByTemplate(task, "reveal")
    },
    {
      id: `${task.id}-angle-3`,
      title: "结果先行路线",
      hook: `开场先给结果，再倒推为什么需要这个 App${suffix}`,
      emotion: "确定、爽感、快速兑现",
      rationale: "更偏转化表达，适合预算敏感阶段优先测。",
      risk: "如果结果不够可信，容易被判定为过度承诺。",
      scenes: outlineByTemplate(task, "result")
    },
    {
      id: `${task.id}-angle-4`,
      title: "对话口播路线",
      hook: `用一句像真实用户吐槽的口播开场，再自然转产品解法${suffix}`,
      emotion: "更口语、更像自拍视频",
      rationale: "适合 TikTok / Meta 原生口播质感，利于多语言字幕版。",
      risk: "如果台词写得太像广告，会失去自然感。",
      scenes: outlineByTemplate(task, "dialogue")
    }
  ];
  if (!prompt) return base;
  return base.map((angle, index) => ({
    ...angle,
    id: `${task.id}-angle-more-${index + 1}`,
    title: `${angle.title} · 扩展版`
  }));
}

function buildSceneTitle(templateId, order) {
  if (templateId === "T2") {
    return ["她怎么还没回", "消息未回", "打开地图", "位置揭示", "下一步行动"][order - 1] || `Scene ${order}`;
  }
  if (templateId === "T3") {
    return ["保留开场", "换痛点说法", "保留演示", "结尾 CTA"][order - 1] || `Scene ${order}`;
  }
  return ["Panic hook", "问题升级", "产品介入", "结果兑现"][order - 1] || `Scene ${order}`;
}

function buildSceneBeat(task, order) {
  const { brief, templateId } = task;
  if (templateId === "T2") {
    return [
      brief.templateSpecific?.scenarioSeed || brief.corePain,
      brief.corePain,
      brief.corePromise,
      "系统给出明确位置异常",
      "下载应用，减少不确定感"
    ][order - 1];
  }
  if (templateId === "T3") {
    return [
      "沿用 winner 问题开头，但换一个视角",
      brief.corePain,
      brief.corePromise,
      brief.cta
    ][order - 1];
  }
  return [
    brief.corePain,
    "问题还在升级",
    brief.corePromise,
    brief.cta
  ][order - 1];
}

export function buildScenesFromAngle(task, angle) {
  const outline = angle.scenes.slice(0, task.templateId === "T2" ? 5 : 4);
  return outline.map((outlineText, index) => {
    const order = index + 1;
    const type = order % 2 === 0 ? "video" : "image";
    const beat = buildSceneBeat(task, order);
    const title = buildSceneTitle(task.templateId, order);
    const subtitle = task.templateId === "T2"
      ? ["他说已经到家了", "事情不对劲", "先确认位置", "现在我知道了", task.brief.cta][index]
      : ["Where is it?", "This keeps happening", "Here is the fix", task.brief.cta][index];
    return {
      id: `${task.id}-scene-${order}`,
      order,
      title,
      beat,
      script: outlineText,
      subtitle,
      languageVariants: {
        zh: subtitle,
        en: subtitle
      },
      audio: {
        voice: task.templateId === "T2" ? "Female / tense" : "Creator / urgent",
        music: type === "video" ? "Pulse ambient" : "Low tension pad",
        notes: type === "video" ? "保持节奏推进" : "停留 2-3 秒看清关键信息"
      },
      prompt: `${outlineText}，重点表现 ${beat}`,
      imageModel: "Flux / storyboard",
      videoModel: type === "video" ? "Runway / short motion" : "Runway / ready when approved",
      duration: type === "video" ? 3 : 2,
      media: {
        type,
        previewLabel: type === "video" ? "Video preview ready" : "Static storyboard frame",
        posterTone: type === "video" ? "motion" : "still",
        status: "ready"
      },
      feedbackStatus: "untested"
    };
  });
}

export function createSceneDraft(scene) {
  return deepClone(scene);
}

export function createBlankScene(task, sceneId, order) {
  return {
    id: sceneId,
    order,
    title: `New Scene ${order}`,
    beat: "补一个新的测试镜头",
    script: "描述这个镜头要解决的信息任务。",
    subtitle: "新的字幕",
    languageVariants: {
      zh: "新的字幕",
      en: "New subtitle"
    },
    audio: {
      voice: "Creator / calm",
      music: "Warm pulse",
      notes: "默认静态图，确认后再生成视频。"
    },
    prompt: `新镜头 ${order}，保留 ${task.brief.mustInclude}`,
    imageModel: "Flux / storyboard",
    videoModel: "Runway / short motion",
    duration: 2,
    media: {
      type: "image",
      previewLabel: "Static storyboard frame",
      posterTone: "still",
      status: "ready"
    },
    feedbackStatus: "untested"
  };
}

export function buildFeedbackSummary(task) {
  return {
    headline: "CTR 偏低，前 3 秒流失偏高。",
    notes: [
      "开场镜头信息量偏慢，建议更早给出冲突或结果。",
      "Scene 2 的文案更像解释，不像推进，建议压缩 20%。",
      "结尾 CTA 可保留，但中段需要更清晰的产品动作。"
    ],
    metrics: {
      ctr: "0.87%",
      hold3s: "32%",
      cvr: "1.14%"
    },
    appliedAngleId: task.selectedAngleId
  };
}

export function mapLegacyStatus(project) {
  if (project.pipelineStatus === "exported") return TASK_STATUS.EXPORTED;
  if (project.pipelineStatus === "rendering") return TASK_STATUS.STORYBOARD;
  if (project.scenes?.length) return TASK_STATUS.STORYBOARD;
  if (project.angles?.length) return TASK_STATUS.ROUTES_READY;
  return TASK_STATUS.DRAFT;
}

export function mapLegacyScene(taskId, scene, index) {
  const type = scene.assetStatus?.includes("视频") ? "video" : "image";
  return {
    id: scene.id || `${taskId}-scene-${index + 1}`,
    order: scene.order || index + 1,
    title: scene.label || `Scene ${index + 1}`,
    beat: scene.goal || scene.summary || "",
    script: scene.summary || scene.visual || "",
    subtitle: scene.subtitle || "",
    languageVariants: {
      zh: scene.subtitle || "",
      en: scene.altCopy || scene.subtitle || ""
    },
    audio: {
      voice: scene.voice || "Creator / calm",
      music: scene.sound || "",
      notes: scene.sound || ""
    },
    prompt: scene.visual || "",
    imageModel: "Flux / storyboard",
    videoModel: "Runway / short motion",
    duration: type === "video" ? 3 : 2,
    media: {
      type,
      previewLabel: type === "video" ? "Legacy video scene" : "Legacy storyboard frame",
      posterTone: type === "video" ? "motion" : "still",
      status: "ready"
    },
    feedbackStatus: scene.performance || "untested"
  };
}
