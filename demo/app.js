(function () {
  const STORAGE_KEY = "uaStoryboardWorkbenchV4";
  const CURRENT_KEY = "uaStoryboardCurrentProjectId";

  const templateCatalog = {
    T1: {
      id: "T1",
      name: "Problem-Solution Hook",
      summary: "用最短路径把痛点打出来，再用产品给出清晰解法。",
      fields: [
        { id: "hookConstraint", label: "Hook 限制", placeholder: "例如：前 2 秒必须先出现人物反应，而不是产品 UI" }
      ]
    },
    T2: {
      id: "T2",
      name: "Scenario Breakdown",
      summary: "从一个具体情境切入，围绕冲突、转折和结果做完整分镜。",
      fields: [
        { id: "scenarioSeed", label: "核心情境", placeholder: "例如：半夜发现伴侣突然关机失联" },
        { id: "emotionArc", label: "情绪弧线", placeholder: "例如：怀疑 -> 焦虑 -> 发现证据 -> 决定采取行动" }
      ]
    },
    T3: {
      id: "T3",
      name: "Winner Iteration Variant",
      summary: "基于已有 winner 结构做局部扩展，而不是整条重写。",
      fields: [
        { id: "winnerReference", label: "Winner 素材链接", placeholder: "粘贴已有高表现素材链接或编号" },
        { id: "lockElements", label: "必须保留的元素", placeholder: "例如：第一镜头台词、UI 演示顺序、结尾 CTA" }
      ]
    }
  };

  const storeSamples = {
    "https://apps.apple.com/us/app/trackmate-360": {
      icon: "🛰️",
      appName: "TrackMate 360",
      appCategory: "Location Tracking",
      appStore: "App Store",
      description: "See family location updates, arrival alerts, and movement history in one place.",
      corePain: "用户担心伴侣或家人失联，尤其在高压和怀疑场景下没有及时确认手段。",
      corePromise: "用实时位置和到达提醒，快速验证对方位置并减少不确定感。",
      targetAudience: "US women 25-34, relationship anxiety",
      mustInclude: "地图 UI、通知弹窗、到达提醒",
      suggestedTemplate: "T2"
    },
    "https://play.google.com/store/apps/details?id=com.clapfind.mobile": {
      icon: "👏",
      appName: "ClapFind",
      appCategory: "Utility",
      appStore: "Google Play",
      description: "Clap once, trigger a loud ringtone, and find your phone fast.",
      corePain: "手机总是在出门前、加油站或者沙发缝里突然找不到。",
      corePromise: "通过拍手触发铃声，在几秒内定位手机。",
      targetAudience: "Android users 18-44, forgetful, busy routine",
      mustInclude: "拍手动作、铃声音效、手机响起的特写",
      suggestedTemplate: "T1"
    },
    "https://apps.apple.com/us/app/receipthero-smart-scanner": {
      icon: "🧾",
      appName: "ReceiptHero",
      appCategory: "Productivity",
      appStore: "App Store",
      description: "Scan receipts, auto-categorize expenses, and export tax-ready summaries.",
      corePain: "自由职业者和小团队在报税季前需要手动整理大量票据，时间被重复劳动吞掉。",
      corePromise: "拍照即可自动识别票据并生成分类汇总，减少报税准备时间。",
      targetAudience: "Freelancers and small business owners in US",
      mustInclude: "扫描动作、分类结果、导出报表界面",
      suggestedTemplate: "T3"
    }
  };

  const sampleProjects = [
    {
      id: "proj-trackmate",
      name: "TrackMate 情境版 03",
      icon: "🛰️",
      status: "分镜制作中",
      updatedAt: "2026-03-23 10:20 UTC",
      template: "T2",
      appStoreUrl: "https://apps.apple.com/us/app/trackmate-360",
      brief: {
        appName: "TrackMate 360",
        appCategory: "Location Tracking",
        targetPlatform: "meta",
        creativeGoal: "angle expansion",
        targetAudience: "US women 25-34, relationship anxiety",
        corePain: "怀疑伴侣突然失联或撒谎，但没有证据确认。",
        corePromise: "用实时位置和到达提醒快速验证情况，减少不确定感。",
        cta: "Download now",
        referenceAds: "Competitor ad: woman sees partner's phone off + map reveal",
        mustInclude: "地图 UI、通知提醒、女性主角、夜晚街景",
        mustAvoid: "过度指控、违法监听暗示",
        templateSpecific: {
          scenarioSeed: "半夜发现对方关机且迟迟未回消息",
          emotionArc: "怀疑 -> 焦虑 -> 查询 -> 发现位置异常 -> 决定行动"
        }
      },
      angles: [],
      selectedAngleId: "",
      scenes: []
    },
    {
      id: "proj-clapfind",
      name: "ClapFind Hook Sprint",
      icon: "👏",
      status: "待选路线",
      updatedAt: "2026-03-22 18:10 UTC",
      template: "T1",
      appStoreUrl: "https://play.google.com/store/apps/details?id=com.clapfind.mobile",
      brief: {
        appName: "ClapFind",
        appCategory: "Utility",
        targetPlatform: "tiktok",
        creativeGoal: "new hook test",
        targetAudience: "Android users 18-44, forgetful, busy routine",
        corePain: "出门前找不到手机，时间和情绪一起失控。",
        corePromise: "只要拍手，手机就会响铃暴露位置。",
        cta: "Try it free",
        referenceAds: "Utility panic montage, creator-native opening",
        mustInclude: "拍手动作、手机铃声、厨房和车库场景",
        mustAvoid: "夸张到像恶搞",
        templateSpecific: {
          hookConstraint: "前 2 秒必须直接进 panic moment"
        }
      },
      angles: [],
      selectedAngleId: "",
      scenes: []
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createInitialState() {
    const projects = sampleProjects.map((project) => {
      const next = clone(project);
      next.angles = buildAngles(next, "");
      next.selectedAngleId = next.angles[0].id;
      next.scenes = buildScenes(next, next.angles[0]);
      return next;
    });
    return { projects };
  }

  function getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      if (!localStorage.getItem(CURRENT_KEY)) {
        localStorage.setItem(CURRENT_KEY, initial.projects[0].id);
      }
      return initial;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.projects || !Array.isArray(parsed.projects)) throw new Error("invalid");
      return parsed;
    } catch (error) {
      const reset = createInitialState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      localStorage.setItem(CURRENT_KEY, reset.projects[0].id);
      return reset;
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getCurrentProjectId() {
    return new URLSearchParams(window.location.search).get("project") || localStorage.getItem(CURRENT_KEY) || "";
  }

  function setCurrentProject(id) {
    localStorage.setItem(CURRENT_KEY, id);
  }

  function updateProject(projectId, updater) {
    const state = getState();
    const index = state.projects.findIndex((project) => project.id === projectId);
    if (index === -1) return null;
    const draft = clone(state.projects[index]);
    const result = updater(draft) || draft;
    result.updatedAt = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
    state.projects[index] = result;
    saveState(state);
    setCurrentProject(projectId);
    return result;
  }

  function getProject(projectId) {
    const state = getState();
    return state.projects.find((project) => project.id === projectId) || null;
  }

  function formatStatus(project) {
    if (project.pipelineStatus === "rendering") return "生成中";
    if (project.pipelineStatus === "exported") return "已导出";
    if (project.scenes?.some((scene) => scene.performance === "weak")) return "待替换镜头";
    if (project.scenes && project.scenes.length) return project.status || "Storyboard 中";
    if (project.selectedAngleId) return "已选路线";
    return "待选路线";
  }

  function buildAngles(project, prompt) {
    const brief = project.brief;
    const promptTail = prompt ? ` / 扩展提示：${prompt}` : "";
    const base = [
      {
        id: `${project.id}-angle-1`,
        title: "直接痛点切入",
        hook: `开场 2 秒直接展示“${brief.corePain.slice(0, 18)}”的慌乱瞬间`,
        emotion: "高压、真实、贴近投放原生语感",
        why: "适合先测最直接的痛点表达，最快看首屏停留。",
        risk: "如果演绎过重，会显得戏剧化过头。",
        template: project.template,
        scenes: outlineByTemplate(project, "pain")
      },
      {
        id: `${project.id}-angle-2`,
        title: "反差揭示路线",
        hook: "先展示用户自以为没问题，再突然给出反差信息。",
        emotion: "悬念、转折、信息揭示",
        why: "适合做 hook 变体，与平铺直叙形成明显差异。",
        risk: "需要控制节奏，避免前戏过长。",
        template: project.template,
        scenes: outlineByTemplate(project, "reveal")
      },
      {
        id: `${project.id}-angle-3`,
        title: "结果先行路线",
        hook: "开场先给结果，再倒推为什么需要这个 App。",
        emotion: "确定、爽感、快速兑现",
        why: "对转换更友好，适合预算敏感时优先测。",
        risk: "如果结果不够可信，容易被判定为过度承诺。",
        template: project.template,
        scenes: outlineByTemplate(project, "result")
      },
      {
        id: `${project.id}-angle-4`,
        title: "对话口播路线",
        hook: "用一段像真实用户吐槽的对话开场，再自然转到产品解法。",
        emotion: "更口语、更像创作者自拍视频",
        why: "适合 TikTok / Meta 原生感更强的场景，也更适合加字幕版本。",
        risk: "如果台词写得太像广告，会失去自然感。",
        template: project.template,
        scenes: outlineByTemplate(project, "dialogue")
      }
    ];
    if (!prompt) return base;
    return base.map((angle, index) => ({
      ...angle,
      id: `${project.id}-angle-more-${index + 1}`,
      title: `${angle.title} · 扩展版`,
      hook: `${angle.hook}${promptTail}`,
      why: `${angle.why} 并向“${prompt}”方向继续发散。`
    }));
  }

  function outlineByTemplate(project, mode) {
    const pain = project.brief.corePain;
    const promise = project.brief.corePromise;
    const target = project.brief.targetAudience;
    if (project.template === "T3") {
      return [
        `保留 winner 的开场骨架，但把 hook 改成更贴近 ${target} 的说法`,
        `中段继续强调“${pain}”的损耗`,
        `产品演示保持原逻辑，只替换用词与镜头节奏 (${mode})`,
        `结尾 CTA 做更强下载动机`
      ];
    }
    if (project.template === "T2") {
      return [
        `用具体情境把“${pain}”演出来`,
        `放大冲突，让用户感觉问题正在恶化`,
        `让产品自然介入，承接“${promise}”`,
        `给出结果画面与 CTA`
      ];
    }
    return [
      `第一镜头直接打出“${pain}”`,
      `第二镜头解释为什么这个问题反复发生`,
      `第三镜头展示产品如何快速介入`,
      `第四镜头给结果与 CTA`
    ];
  }

  function buildScenes(project, angle) {
    const brief = project.brief;
    const baseScenes = [];
    if (project.template === "T1") {
      baseScenes.push(
        createScene(1, "Hook", "用户突然慌了", brief.corePain, "人物翻包找手机，镜头急促摇动", "Where is my phone?", "手机又不见了", "人物惊慌 + 环境音"),
        createScene(2, "Pain", "问题升级", "时间被浪费，出门节奏全乱", "车库门要关了，人还在找手机", "I am late already", "再找下去就迟到了", "焦虑加深"),
        createScene(3, "Demo", "产品介入", brief.corePromise, "人物一拍手，画外响铃，镜头切到手机震动", "Just clap once", "拍手就能找到", "展示功能动作"),
        createScene(4, "CTA", "结果兑现", "几秒内解决问题，马上出门", "镜头回到人物松一口气，拿起手机", "Try it free today", brief.cta, "收口 CTA")
      );
    } else if (project.template === "T2") {
      baseScenes.push(
        createScene(1, "Scenario", "进入情境", brief.templateSpecific.scenarioSeed || brief.corePain, "夜晚街头，主角盯着手机，没有回复", "He said he was home", "他说他已经到家了", "悬念开场"),
        createScene(2, "Conflict", "冲突升级", brief.corePain, "对话框停在已读前，主角来回踱步", "Something feels off", "事情不对劲", "焦虑升级"),
        createScene(3, "Turn", "产品介入", brief.corePromise, "切到地图 UI 和到达提醒", "Check it now", "立刻确认位置", "转折镜头"),
        createScene(4, "Reveal", "结果揭示", "系统给出明确位置异常", "地图点位停在陌生地点，主角神情变化", "Now I know", "现在我知道了", "结果兑现"),
        createScene(5, "CTA", "下一步行动", "下载应用，减少不确定感", "主角走向车门，镜头压上下载按钮", "Download now", brief.cta, "收尾 CTA")
      );
    } else {
      baseScenes.push(
        createScene(1, "Keep", "保留主 Hook", "沿用 winner 的问题开头，但换一个视角", "保留核心动作，只换成新的开场台词", "I learned this too late", "这个教训来得太晚", "胜出结构锁定"),
        createScene(2, "Refine", "微调痛点表达", brief.corePain, "把问题放到更贴近目标受众的工作情境", "Every receipt is a mess", "票据一团乱", "轻量替换"),
        createScene(3, "Demo", "保留产品演示", brief.corePromise, "扫描、分类、导出动作按 winner 逻辑走", "Snap. Sort. Export.", "拍一张就能整理", "演示不重写"),
        createScene(4, "CTA", "替换 CTA", "把结尾改成更强的尝试动机", "镜头落在导出报表 + CTA", "Start free today", brief.cta, "ROI 导向 CTA")
      );
    }
    return baseScenes.map((scene, index) => ({
      ...scene,
      angleTitle: angle.title,
      duration: index === 0 ? "0-3s" : index === baseScenes.length - 1 ? "11-15s" : `${index * 3 + 1}-${index * 3 + 3}s`
    }));
  }

  function createScene(order, label, goal, summary, visual, vo, subtitle, note) {
    return {
      id: `scene-${order}-${Math.random().toString(36).slice(2, 8)}`,
      order,
      label,
      goal,
      summary,
      visual,
      vo,
      subtitle,
      language: "English",
      altCopy: "",
      voice: "Female / warm tension",
      sound: note,
      assetStatus: order % 2 === 0 ? "待生视频" : "已有分镜图",
      locked: false,
      performance: "untested"
    };
  }

  function renderTemplateSpecific(container, templateId, values) {
    const template = templateCatalog[templateId];
    if (!container || !template) return;
    container.innerHTML = template.fields.map((field) => `
      <div class="field">
        <label for="${field.id}">${field.label}</label>
        <textarea id="${field.id}" data-template-field="${field.id}" placeholder="${field.placeholder}">${values?.[field.id] || ""}</textarea>
      </div>
    `).join("");
  }

  function readTemplateSpecific(container) {
    const data = {};
    if (!container) return data;
    container.querySelectorAll("[data-template-field]").forEach((element) => {
      data[element.dataset.templateField] = element.value.trim();
    });
    return data;
  }

  function parseStoreUrl(url) {
    if (!url) return null;
    if (storeSamples[url]) return clone(storeSamples[url]);
    const slug = url.split("/").filter(Boolean).pop() || "new-app";
    const guessName = slug.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    return {
      icon: "📱",
      appName: guessName,
      appCategory: url.includes("play.google.com") ? "Android App" : "Mobile App",
      appStore: url.includes("play.google.com") ? "Google Play" : "App Store",
      description: "基于商店链接识别到基础产品信息，建议人工再确认痛点与承诺。",
      corePain: "需要人工补充更具体的用户痛点。",
      corePromise: "需要人工补充产品承诺与转化点。",
      targetAudience: "待补充",
      mustInclude: "品牌图标、核心 UI",
      suggestedTemplate: "T1"
    };
  }

  function briefSummaryHtml(project) {
    const brief = project.brief;
    return `
      <div class="card">
        <div class="app-hero">
          <div class="app-icon">${project.icon || "📱"}</div>
          <div>
            <h3>${brief.appName}</h3>
            <div class="project-meta">${brief.appCategory} · ${brief.targetPlatform} · ${templateCatalog[project.template].name}</div>
          </div>
        </div>
        <div class="pill-row">
          <span class="pill">${brief.targetPlatform}</span>
          <span class="pill">${brief.creativeGoal}</span>
          <span class="pill">${templateCatalog[project.template].name}</span>
        </div>
        <div class="kv">
          <strong>目标受众</strong><span>${brief.targetAudience}</span>
          <strong>核心痛点</strong><span>${brief.corePain}</span>
          <strong>核心承诺</strong><span>${brief.corePromise}</span>
          <strong>CTA</strong><span>${brief.cta}</span>
          <strong>必须包含</strong><span>${brief.mustInclude}</span>
          <strong>参考素材</strong><span>${brief.referenceAds}</span>
        </div>
      </div>
    `;
  }

  function exportPackage(project) {
    return {
      project: project.name,
      template: templateCatalog[project.template].name,
      selectedAngleId: project.selectedAngleId,
      scenes: project.scenes.map((scene) => ({
        order: scene.order,
        goal: scene.goal,
        visual: scene.visual,
        vo: scene.vo,
        subtitle: scene.subtitle,
        language: scene.language,
        voice: scene.voice,
        locked: scene.locked
      }))
    };
  }

  function reorderScene(projectId, sceneId, direction) {
    updateProject(projectId, (project) => {
      const index = project.scenes.findIndex((scene) => scene.id === sceneId);
      if (index === -1) return project;
      const nextIndex = direction === "left" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= project.scenes.length) return project;
      const temp = project.scenes[index];
      project.scenes[index] = project.scenes[nextIndex];
      project.scenes[nextIndex] = temp;
      project.scenes = project.scenes.map((scene, order) => ({ ...scene, order: order + 1 }));
      return project;
    });
  }

  function addScene(projectId) {
    updateProject(projectId, (project) => {
      const order = project.scenes.length + 1;
      project.scenes.push(createScene(order, "New", "新增镜头", "补充新的测试镜头", "这里定义新镜头的视觉动作", "Add new line", "新增字幕", "待生成"));
      return project;
    });
  }

  function splitScene(projectId, sceneId) {
    updateProject(projectId, (project) => {
      const index = project.scenes.findIndex((scene) => scene.id === sceneId);
      if (index === -1) return project;
      const original = project.scenes[index];
      const inserted = {
        ...clone(original),
        id: `scene-${Date.now()}`,
        label: `${original.label}-拆分`,
        goal: `${original.goal} / 细化动作`,
        summary: `${original.summary}（拆成补充镜头）`,
        visual: `${original.visual}，并补一个更近的细节镜头`,
        assetStatus: "待生图"
      };
      project.scenes.splice(index + 1, 0, inserted);
      project.scenes = project.scenes.map((scene, order) => ({ ...scene, order: order + 1 }));
      return project;
    });
  }

  function deleteScene(projectId, sceneId) {
    updateProject(projectId, (project) => {
      project.scenes = project.scenes.filter((scene) => scene.id !== sceneId).map((scene, order) => ({ ...scene, order: order + 1 }));
      return project;
    });
  }

  function bootstrapIndex() {
    const projectGrid = document.querySelector("#projectGrid");
    const heroStats = document.querySelector("#heroStats");
    const modal = document.querySelector("#newProjectModal");
    const openModalButton = document.querySelector("#openNewProject");
    const closeModalButtons = document.querySelectorAll("[data-close-modal]");
    const goWizardButton = document.querySelector("#goWizard");

    if (!projectGrid) return;
    const state = getState();
    heroStats.innerHTML = `
      <div class="stat"><span class="tiny">项目总数</span><strong>${state.projects.length}</strong></div>
      <div class="stat"><span class="tiny">待选路线</span><strong>${state.projects.filter((project) => formatStatus(project) === "待选路线").length}</strong></div>
      <div class="stat"><span class="tiny">正在制作</span><strong>${state.projects.filter((project) => project.scenes.length && formatStatus(project) !== "生成中").length}</strong></div>
      <div class="stat"><span class="tiny">平均镜头数</span><strong>${Math.round(state.projects.reduce((sum, project) => sum + (project.scenes?.length || 0), 0) / state.projects.length)}</strong></div>
    `;

    projectGrid.innerHTML = state.projects.map((project) => `
      <div class="card">
        <div class="app-hero">
          <div class="app-icon">${project.icon || "📱"}</div>
          <div>
            <h3>${project.name}</h3>
            <div class="project-meta">${project.brief.appName} · ${templateCatalog[project.template].name}</div>
          </div>
        </div>
        <div class="kv">
          <strong>状态</strong><span>${formatStatus(project)}</span>
          <strong>目标平台</strong><span>${project.brief.targetPlatform}</span>
          <strong>创意目标</strong><span>${project.brief.creativeGoal}</span>
          <strong>最近更新</strong><span>${project.updatedAt}</span>
        </div>
        <div class="button-row">
          <a class="btn btn-secondary" href="./angles.html?project=${project.id}" data-project="${project.id}">看路线</a>
          <a class="btn btn-primary" href="./storyboard.html?project=${project.id}" data-project="${project.id}">继续制作</a>
        </div>
      </div>
    `).join("");

    projectGrid.querySelectorAll("[data-project]").forEach((link) => {
      link.addEventListener("click", () => setCurrentProject(link.dataset.project));
    });

    openModalButton?.addEventListener("click", () => modal.classList.add("open"));
    closeModalButtons.forEach((button) => button.addEventListener("click", () => modal.classList.remove("open")));
    goWizardButton?.addEventListener("click", () => {
      modal.classList.remove("open");
      window.location.href = "./new-project.html";
    });
  }

  function bootstrapNewProject() {
    const form = document.querySelector("#projectWizard");
    if (!form) return;

    const templateGrid = document.querySelector("#templateGrid");
    const templateFields = document.querySelector("#templateFields");
    const parseButton = document.querySelector("#parseStoreButton");
    const storeUrlInput = document.querySelector("#appStoreUrl");
    const parsedCard = document.querySelector("#parsedProductCard");
    const stepButtons = document.querySelectorAll("[data-step-target]");
    const stepSections = document.querySelectorAll("[data-step-section]");
    const nextStepButtons = document.querySelectorAll("[data-next-step]");
    const prevStepButtons = document.querySelectorAll("[data-prev-step]");
    const generateButton = document.querySelector("#generateBrief");
    const briefPreview = document.querySelector("#briefPreview");
    let parsing = false;

    let currentTemplate = "T2";
    let currentStep = 1;

    templateGrid.innerHTML = Object.values(templateCatalog).map((template) => `
      <button type="button" class="template-card ${template.id === currentTemplate ? "active" : ""}" data-template="${template.id}">
        <div class="eyebrow">${template.id}</div>
        <h4>${template.name}</h4>
        <div class="template-meta">${template.summary}</div>
      </button>
    `).join("");

    renderTemplateSpecific(templateFields, currentTemplate, {});
    parsedCard.innerHTML = `<div class="hint">贴入商店链接后，系统会先识别产品资料、推荐模板，并帮你预填核心字段。</div>`;

    function syncSteps() {
      stepButtons.forEach((button) => {
        const active = Number(button.dataset.stepTarget) === currentStep;
        button.classList.toggle("active", active);
      });
      stepSections.forEach((section) => {
        section.classList.toggle("hidden", Number(section.dataset.stepSection) !== currentStep);
      });
      if (currentStep === 4 && briefPreview) {
        const tempProject = {
          template: currentTemplate,
          icon: parseStoreUrl(storeUrlInput.value.trim())?.icon || "📱",
          brief: {
            appName: document.querySelector("#appName").value.trim() || "未命名产品",
            appCategory: document.querySelector("#appCategory").value.trim() || "App",
            targetPlatform: document.querySelector("#targetPlatform").value,
            creativeGoal: document.querySelector("#creativeGoal").value,
            targetAudience: document.querySelector("#targetAudience").value.trim() || "待补充",
            corePain: document.querySelector("#corePain").value.trim() || "待补充",
            corePromise: document.querySelector("#corePromise").value.trim() || "待补充",
            cta: document.querySelector("#cta").value.trim() || "Download now",
            mustInclude: document.querySelector("#mustInclude").value.trim() || "无",
            referenceAds: document.querySelector("#referenceAds").value.trim() || "暂无"
          }
        };
        briefPreview.innerHTML = briefSummaryHtml(tempProject);
      }
    }

    syncSteps();

    stepButtons.forEach((button) => {
      button.addEventListener("click", () => {
        currentStep = Number(button.dataset.stepTarget);
        syncSteps();
      });
    });
    nextStepButtons.forEach((button) => {
      button.addEventListener("click", () => {
        currentStep = Number(button.dataset.nextStep);
        syncSteps();
      });
    });
    prevStepButtons.forEach((button) => {
      button.addEventListener("click", () => {
        currentStep = Number(button.dataset.prevStep);
        syncSteps();
      });
    });

    templateGrid.addEventListener("click", (event) => {
      const target = event.target.closest("[data-template]");
      if (!target) return;
      currentTemplate = target.dataset.template;
      templateGrid.querySelectorAll("[data-template]").forEach((card) => card.classList.toggle("active", card.dataset.template === currentTemplate));
      renderTemplateSpecific(templateFields, currentTemplate, readTemplateSpecific(templateFields));
      const parsed = parseStoreUrl(storeUrlInput.value.trim());
      if (parsed && templateCatalog[parsed.suggestedTemplate]) {
        parsedCard.innerHTML = parsedCard.innerHTML;
      }
    });

    parseButton.addEventListener("click", async () => {
      if (parsing) return;
      const parsed = parseStoreUrl(storeUrlInput.value.trim());
      if (!parsed) {
        parsedCard.innerHTML = `<div class="status status-warn">先输入一个 App Store / Google Play 链接。</div>`;
        return;
      }
      parsing = true;
      parseButton.textContent = "识别中...";
      parsedCard.innerHTML = `
        <div class="card">
          <h3>正在读取产品信息</h3>
          <div class="progress-steps">
            <div class="progress-step active">连接商店页</div>
            <div class="progress-step">提取应用资料</div>
            <div class="progress-step">识别用户痛点与核心承诺</div>
            <div class="progress-step">匹配推荐模板</div>
          </div>
        </div>
      `;
      await new Promise((resolve) => setTimeout(resolve, 850));
      document.querySelector("#appName").value = parsed.appName;
      document.querySelector("#appCategory").value = parsed.appCategory;
      document.querySelector("#targetAudience").value = parsed.targetAudience;
      document.querySelector("#corePain").value = parsed.corePain;
      document.querySelector("#corePromise").value = parsed.corePromise;
      document.querySelector("#mustInclude").value = parsed.mustInclude;
      parsedCard.innerHTML = `
        <div class="card">
          <div class="app-hero">
            <div class="app-icon">${parsed.icon}</div>
            <div>
              <h3>${parsed.appName}</h3>
              <div class="project-meta">${parsed.appStore} · ${parsed.appCategory}</div>
            </div>
          </div>
          <div class="pill-row">
            <span class="pill">${parsed.appStore}</span>
            <span class="pill">推荐：${templateCatalog[parsed.suggestedTemplate].name}</span>
          </div>
          <div class="kv">
            <strong>描述</strong><span>${parsed.description}</span>
            <strong>识别痛点</strong><span>${parsed.corePain}</span>
            <strong>识别承诺</strong><span>${parsed.corePromise}</span>
            <strong>推荐模板</strong><span>${templateCatalog[parsed.suggestedTemplate].name}</span>
          </div>
        </div>
      `;
      currentTemplate = parsed.suggestedTemplate || currentTemplate;
      templateGrid.querySelectorAll("[data-template]").forEach((card) => card.classList.toggle("active", card.dataset.template === currentTemplate));
      renderTemplateSpecific(templateFields, currentTemplate, readTemplateSpecific(templateFields));
      currentStep = 2;
      syncSteps();
      parseButton.textContent = "自动识别";
      parsing = false;
    });

    generateButton.addEventListener("click", () => {
      const formData = new FormData(form);
      const id = `proj-${Date.now()}`;
      const project = {
        id,
        name: formData.get("projectName").toString().trim() || `${formData.get("appName")} 新项目`,
        icon: parseStoreUrl(storeUrlInput.value.trim())?.icon || "📱",
        status: "待选路线",
        updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC",
        template: currentTemplate,
        appStoreUrl: storeUrlInput.value.trim(),
        pipelineStatus: "draft",
        brief: {
          appName: formData.get("appName").toString().trim(),
          appCategory: formData.get("appCategory").toString().trim(),
          targetPlatform: formData.get("targetPlatform").toString(),
          creativeGoal: formData.get("creativeGoal").toString(),
          targetAudience: formData.get("targetAudience").toString().trim(),
          corePain: formData.get("corePain").toString().trim(),
          corePromise: formData.get("corePromise").toString().trim(),
          cta: formData.get("cta").toString().trim(),
          referenceAds: formData.get("referenceAds").toString().trim(),
          mustInclude: formData.get("mustInclude").toString().trim(),
          mustAvoid: formData.get("mustAvoid").toString().trim(),
          templateSpecific: readTemplateSpecific(templateFields)
        },
        angles: [],
        selectedAngleId: "",
        scenes: []
      };
      project.angles = buildAngles(project, "");
      project.selectedAngleId = project.angles[0].id;
      project.scenes = buildScenes(project, project.angles[0]);
      const state = getState();
      state.projects.unshift(project);
      saveState(state);
      setCurrentProject(project.id);
      window.location.href = `./angles.html?project=${project.id}`;
    });
  }

  function bootstrapAngles() {
    const container = document.querySelector("#anglePage");
    if (!container) return;
    const project = getProject(getCurrentProjectId()) || getState().projects[0];
    if (!project) return;
    setCurrentProject(project.id);

    const briefMount = document.querySelector("#briefMount");
    const angleGrid = document.querySelector("#angleGrid");
    const moreButton = document.querySelector("#moreAngles");
    const modal = document.querySelector("#moreAnglesModal");
    const promptInput = document.querySelector("#anglePrompt");
    const generateMoreButton = document.querySelector("#generateMoreAngles");
    const closeButtons = document.querySelectorAll("[data-close-modal]");
    const chosenStatus = document.querySelector("#chosenStatus");
    const enterStoryboard = document.querySelector("#enterStoryboard");
    const selectedRoutePreview = document.querySelector("#selectedRoutePreview");

    briefMount.innerHTML = briefSummaryHtml(project);
    enterStoryboard.href = `./storyboard.html?project=${project.id}`;

    function renderAngles(activeId) {
      const refreshed = getProject(project.id);
      angleGrid.innerHTML = refreshed.angles.map((angle) => `
        <div class="angle-card ${angle.id === activeId ? "active" : ""}" data-angle="${angle.id}">
          <div class="split">
            <div>
              <div class="eyebrow">${templateCatalog[refreshed.template].name}</div>
              <h4>${angle.title}</h4>
            </div>
            <button class="btn btn-ghost" type="button" data-choose="${angle.id}">选这条</button>
          </div>
          <div class="angle-meta">${angle.hook}</div>
          <div class="kv">
            <strong>情绪路线</strong><span>${angle.emotion}</span>
            <strong>为什么测</strong><span>${angle.why}</span>
            <strong>风险提示</strong><span>${angle.risk}</span>
          </div>
          <div class="route-scenes">
            ${angle.scenes.map((scene, index) => `
              <div class="route-scene">
                <strong>Scene ${index + 1}</strong>
                <span>${scene}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("");
      const selected = refreshed.angles.find((angle) => angle.id === activeId) || refreshed.angles[0];
      chosenStatus.innerHTML = `
        <div class="status status-success">
          已选路线：<strong>${selected.title}</strong><br>
          ${selected.hook}
        </div>
      `;
      if (selectedRoutePreview) {
        selectedRoutePreview.innerHTML = `
          <div class="card">
            <div class="split">
              <div>
                <div class="eyebrow">Selected Route</div>
                <h3>${selected.title}</h3>
              </div>
              <a class="btn btn-primary" href="./storyboard.html?project=${refreshed.id}">用这条进入 storyboard</a>
            </div>
            <p class="muted">${selected.why}</p>
            <div class="route-scenes">
              ${selected.scenes.map((scene, index) => `
                <div class="route-scene">
                  <strong>Scene ${index + 1}</strong>
                  <span>${scene}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }
    }

    renderAngles(project.selectedAngleId);

    angleGrid.addEventListener("click", (event) => {
      const choose = event.target.closest("[data-choose]");
      if (!choose) return;
      const angleId = choose.dataset.choose;
      const updated = updateProject(project.id, (draft) => {
        draft.selectedAngleId = angleId;
        draft.status = "已选路线";
        const angle = draft.angles.find((item) => item.id === angleId);
        if (angle) draft.scenes = buildScenes(draft, angle);
        return draft;
      });
      renderAngles(updated.selectedAngleId);
    });

    moreButton.addEventListener("click", () => modal.classList.add("open"));
    closeButtons.forEach((button) => button.addEventListener("click", () => modal.classList.remove("open")));
    generateMoreButton.addEventListener("click", () => {
      const prompt = promptInput.value.trim();
      generateMoreButton.textContent = "生成中...";
      const updated = updateProject(project.id, (draft) => {
        draft.angles = buildAngles(draft, prompt);
        draft.selectedAngleId = draft.angles[0].id;
        draft.scenes = buildScenes(draft, draft.angles[0]);
        return draft;
      });
      renderAngles(updated.selectedAngleId);
      modal.classList.remove("open");
      generateMoreButton.textContent = "生成新路线";
    });
  }

  function bootstrapStoryboard() {
    const container = document.querySelector("#storyboardPage");
    if (!container) return;
    const project = getProject(getCurrentProjectId()) || getState().projects[0];
    if (!project) return;
    setCurrentProject(project.id);

    const sceneList = document.querySelector("#sceneList");
    const timeline = document.querySelector("#timeline");
    const playerMount = document.querySelector("#playerMount");
    const sceneForm = document.querySelector("#sceneForm");
    const packageMount = document.querySelector("#packageMount");
    const feedbackMount = document.querySelector("#feedbackMount");
    const projectBrief = document.querySelector("#workspaceBrief");
    const addSceneButton = document.querySelector("#addScene");
    const exportButton = document.querySelector("#fakeExport");
    const sendToRenderButton = document.querySelector("#sendToRender");
    const replaceWeakScenesButton = document.querySelector("#replaceWeakScenes");
    const backToAngles = document.querySelector("#backToAngles");
    let selectedSceneId = project.scenes[0]?.id || "";

    projectBrief.innerHTML = briefSummaryHtml(project);
    backToAngles.href = `./angles.html?project=${project.id}`;

    function currentProject() {
      return getProject(project.id);
    }

    function renderWorkspace() {
      const current = currentProject();
      if (!current.scenes.length) return;
      const selectedScene = current.scenes.find((scene) => scene.id === selectedSceneId) || current.scenes[0];
      selectedSceneId = selectedScene.id;

      sceneList.innerHTML = current.scenes.map((scene) => `
        <div class="scene-item ${scene.id === selectedSceneId ? "active" : ""}" data-scene="${scene.id}">
          <div class="split">
            <div>
              <div class="eyebrow">Scene ${scene.order}</div>
              <h4>${scene.goal}</h4>
            </div>
            <span class="pill">${scene.assetStatus}</span>
          </div>
          <div class="scene-meta">${scene.visual}</div>
          <div class="scene-toolbar">
            <button class="btn btn-ghost" type="button" data-action="image" data-scene="${scene.id}">更新分镜图</button>
            <button class="btn btn-ghost" type="button" data-action="video" data-scene="${scene.id}">重生视频</button>
            <button class="btn btn-ghost" type="button" data-action="delete" data-scene="${scene.id}">删除</button>
          </div>
        </div>
      `).join("");

      timeline.innerHTML = current.scenes.map((scene) => `
        <div class="timeline-card ${scene.id === selectedSceneId ? "active" : ""}" data-scene="${scene.id}">
          <div class="timeline-thumb"></div>
          <h4>${scene.order}. ${scene.goal}</h4>
          <div class="tiny">${scene.duration} · ${scene.label}</div>
          <div class="timeline-toolbar">
            <button class="btn btn-ghost" type="button" data-shift="left" data-scene="${scene.id}">左移</button>
            <button class="btn btn-ghost" type="button" data-shift="right" data-scene="${scene.id}">右移</button>
            <button class="btn btn-ghost" type="button" data-split="${scene.id}">拆分</button>
          </div>
        </div>
      `).join("");

      playerMount.innerHTML = `
        <div class="player">
          <div class="pill-row">
            <span class="pill">${templateCatalog[current.template].name}</span>
            <span class="pill">${selectedScene.duration}</span>
            <span class="pill">${selectedScene.locked ? "已锁定" : "可迭代"}</span>
            <span class="pill">${selectedScene.assetStatus}</span>
          </div>
          <div class="grid">
            <small>当前镜头预览</small>
            <h3>${selectedScene.goal}</h3>
            <p>${selectedScene.visual}</p>
            <small>VO: ${selectedScene.vo}</small>
            <small>字幕: ${selectedScene.subtitle}</small>
          </div>
          <div class="grid">
            <div class="player-bar"><span></span></div>
            <small>用这里快速校准节奏、信息量和镜头衔接，再决定哪些镜头要重生图片或视频。</small>
          </div>
        </div>
      `;

      sceneForm.innerHTML = `
        <input type="hidden" name="sceneId" value="${selectedScene.id}">
        <div class="field">
          <label>镜头目标</label>
          <input name="goal" value="${selectedScene.goal}">
        </div>
        <div class="field">
          <label>画面描述</label>
          <textarea name="visual">${selectedScene.visual}</textarea>
        </div>
        <div class="field">
          <label>VO / 口播</label>
          <textarea name="vo">${selectedScene.vo}</textarea>
        </div>
        <div class="field-grid two-col">
          <div class="field">
            <label>字幕文案</label>
            <input name="subtitle" value="${selectedScene.subtitle}">
          </div>
          <div class="field">
            <label>多语言版本</label>
            <input name="altCopy" value="${selectedScene.altCopy}" placeholder="例如：Spanish / German 文案">
          </div>
        </div>
        <div class="field-grid two-col">
          <div class="field">
            <label>语言</label>
            <select name="language">
              ${["English", "Spanish", "German", "French"].map((language) => `<option value="${language}" ${selectedScene.language === language ? "selected" : ""}>${language}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>声音设定</label>
            <input name="voice" value="${selectedScene.voice}">
          </div>
        </div>
        <div class="field">
          <label>声音 / 字幕备注</label>
          <textarea name="sound">${selectedScene.sound}</textarea>
        </div>
        <div class="button-row">
          <button type="submit" class="btn btn-primary">保存当前镜头</button>
          <button type="button" class="btn btn-secondary" id="toggleLock">${selectedScene.locked ? "解除锁定" : "锁定镜头"}</button>
        </div>
      `;

      const readyAssets = current.scenes.filter((scene) => scene.assetStatus.includes("已")).length;
      packageMount.textContent = JSON.stringify({
        summary: {
          project: current.name,
          selectedRoute: selectedScene.angleTitle,
          scenes: current.scenes.length,
          readyAssets,
          locale: selectedScene.language,
          generationStatus: current.pipelineStatus || "draft"
        },
        renderTargets: exportPackage(current).scenes
      }, null, 2);
      if (feedbackMount) {
        feedbackMount.innerHTML = current.scenes.map((scene) => `
          <div class="feedback-row">
            <strong>Scene ${scene.order} · ${scene.goal}</strong>
            <span class="tiny">${scene.subtitle}</span>
            <select data-feedback-scene="${scene.id}">
              <option value="untested" ${scene.performance === "untested" ? "selected" : ""}>未测试</option>
              <option value="winner" ${scene.performance === "winner" ? "selected" : ""}>表现好</option>
              <option value="weak" ${scene.performance === "weak" ? "selected" : ""}>表现差</option>
              <option value="stable" ${scene.performance === "stable" ? "selected" : ""}>可保留</option>
            </select>
          </div>
        `).join("");
      }
      document.querySelector("#toggleLock")?.addEventListener("click", () => {
        updateProject(project.id, (draft) => {
          const scene = draft.scenes.find((item) => item.id === selectedSceneId);
          if (scene) scene.locked = !scene.locked;
          return draft;
        });
        renderWorkspace();
      });
    }

    renderWorkspace();

    sceneList.addEventListener("click", (event) => {
      const sceneCard = event.target.closest("[data-scene]");
      if (!sceneCard) return;
      selectedSceneId = sceneCard.dataset.scene;
      const action = event.target.closest("[data-action]");
      if (action) {
        const sceneId = action.dataset.scene;
        const type = action.dataset.action;
        if (type === "delete") {
          deleteScene(project.id, sceneId);
          selectedSceneId = currentProject().scenes[0]?.id || "";
        } else {
          updateProject(project.id, (draft) => {
            const scene = draft.scenes.find((item) => item.id === sceneId);
            if (scene) scene.assetStatus = type === "image" ? "已更新分镜图" : "视频重新排队中";
            return draft;
          });
        }
      }
      renderWorkspace();
    });

    timeline.addEventListener("click", (event) => {
      const sceneCard = event.target.closest("[data-scene]");
      if (sceneCard) selectedSceneId = sceneCard.dataset.scene;
      const shift = event.target.closest("[data-shift]");
      const split = event.target.closest("[data-split]");
      if (shift) {
        reorderScene(project.id, shift.dataset.scene, shift.dataset.shift);
        selectedSceneId = shift.dataset.scene;
      }
      if (split) {
        splitScene(project.id, split.dataset.split);
        selectedSceneId = split.dataset.split;
      }
      renderWorkspace();
    });

    addSceneButton.addEventListener("click", () => {
      addScene(project.id);
      selectedSceneId = currentProject().scenes[currentProject().scenes.length - 1].id;
      renderWorkspace();
    });

    sceneForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(sceneForm);
      const sceneId = data.get("sceneId").toString();
      updateProject(project.id, (draft) => {
        const scene = draft.scenes.find((item) => item.id === sceneId);
        if (!scene) return draft;
        scene.goal = data.get("goal").toString();
        scene.visual = data.get("visual").toString();
        scene.vo = data.get("vo").toString();
        scene.subtitle = data.get("subtitle").toString();
        scene.altCopy = data.get("altCopy").toString();
        scene.language = data.get("language").toString();
        scene.voice = data.get("voice").toString();
        scene.sound = data.get("sound").toString();
        scene.assetStatus = "待重新同步";
        draft.status = "Storyboard 中";
        return draft;
      });
      renderWorkspace();
    });

    feedbackMount?.addEventListener("change", (event) => {
      const select = event.target.closest("[data-feedback-scene]");
      if (!select) return;
      updateProject(project.id, (draft) => {
        const scene = draft.scenes.find((item) => item.id === select.dataset.feedbackScene);
        if (scene) scene.performance = select.value;
        return draft;
      });
      renderWorkspace();
    });

    exportButton.addEventListener("click", () => {
      updateProject(project.id, (draft) => {
        draft.pipelineStatus = "exported";
        draft.status = "已导出";
        return draft;
      });
      const current = currentProject();
      packageMount.textContent = JSON.stringify({
        summary: {
          project: current.name,
          scenes: current.scenes.length,
          exportAt: new Date().toISOString()
        },
        renderTargets: exportPackage(current).scenes
      }, null, 2);
      exportButton.textContent = "已更新生成任务";
      setTimeout(() => {
        exportButton.textContent = "更新生成任务";
      }, 1200);
    });

    sendToRenderButton?.addEventListener("click", () => {
      updateProject(project.id, (draft) => {
        draft.pipelineStatus = "rendering";
        draft.status = "生成中";
        draft.scenes = draft.scenes.map((scene) => ({
          ...scene,
          assetStatus: scene.assetStatus.includes("已") ? scene.assetStatus : "视频排队中"
        }));
        return draft;
      });
      renderWorkspace();
      sendToRenderButton.textContent = "已进入生成链路";
      setTimeout(() => {
        sendToRenderButton.textContent = "进入生成链路";
      }, 1200);
    });

    replaceWeakScenesButton?.addEventListener("click", () => {
      updateProject(project.id, (draft) => {
        draft.scenes = draft.scenes.map((scene) => {
          if (scene.performance !== "weak") return scene;
          return {
            ...scene,
            subtitle: `${scene.subtitle}（新变体）`,
            visual: `${scene.visual}，改成新的表现方式`,
            assetStatus: "待替换镜头",
            performance: "untested"
          };
        });
        draft.status = "待替换镜头";
        return draft;
      });
      renderWorkspace();
      replaceWeakScenesButton.textContent = "已标记替换";
      setTimeout(() => {
        replaceWeakScenesButton.textContent = "替换弱表现镜头";
      }, 1200);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootstrapIndex();
    bootstrapNewProject();
    bootstrapAngles();
    bootstrapStoryboard();
  });
})();
