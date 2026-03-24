import { formatFeedbackLabel, formatMediaLabel, formatPlatformLabel, formatStatusLabel, formatUpdatedAt, escapeHtml, makeHref } from "./formatters.js";
import { HOME_EXAMPLES, TEMPLATE_CATALOG } from "./mock-data.js";

export function renderSystemNotice(notice) {
  if (!notice) return "";
  return `
    <div class="notice ${escapeHtml(notice.tone || "info")}">
      <strong>${escapeHtml(notice.tone === "warn" ? "注意" : "系统提示")}</strong>
      <p class="muted">${escapeHtml(notice.message)}</p>
    </div>
  `;
}

export function renderTaskCard(task) {
  return `
    <article class="task-card task-card-project" data-task-card="${escapeHtml(task.id)}">
      <div class="task-card-head">
        <div>
          <div class="eyebrow">${escapeHtml(task.appSnapshot.name)}</div>
          <h3>${escapeHtml(task.title)}</h3>
        </div>
        <span class="chip warm">${escapeHtml(formatStatusLabel(task.status))}</span>
      </div>
      <p class="task-summary">${escapeHtml(task.brief.corePain)}</p>
      <div class="task-meta-strip">
        <span><strong>模板</strong>${escapeHtml(TEMPLATE_CATALOG[task.templateId]?.shortLabel || task.templateId)}</span>
        <span><strong>平台</strong>${escapeHtml(formatPlatformLabel(task.brief.targetPlatform))}</span>
        <span><strong>更新</strong>${escapeHtml(formatUpdatedAt(task.updatedAt))}</span>
      </div>
      <div class="button-row">
        <a class="btn btn-ghost" href="${escapeHtml(makeHref("/angles.html", { task: task.id }))}">看路线</a>
        <a class="btn btn-primary" href="${escapeHtml(makeHref("/storyboard.html", { task: task.id }))}">继续制作</a>
      </div>
    </article>
  `;
}

export function renderNewTaskCard() {
  return `
    <article class="task-card create-card task-card-project">
      <div>
        <div class="eyebrow">Create</div>
        <h3>新建一个广告任务</h3>
      </div>
      <p class="task-summary">从已保存 App 开始，或贴一个新的商店链接。先整理 brief，再进入路线选择和 storyboard。</p>
      <div class="button-row">
        <a class="btn btn-primary" href="/new-project.html">创建任务</a>
      </div>
    </article>
  `;
}

export function renderSavedAppCard(app) {
  return `
    <article class="app-card app-card-library">
      <div class="task-card-head">
        <div class="app-id">
          <span class="app-icon">${escapeHtml(app.icon)}</span>
          <div>
            <div class="eyebrow">${escapeHtml(app.sourceLabel)}</div>
            <h3>${escapeHtml(app.name)}</h3>
          </div>
        </div>
        <span class="chip">${escapeHtml(app.category)}</span>
      </div>
      <p class="task-summary">${escapeHtml(app.description)}</p>
      <div class="task-meta-strip">
        <span><strong>受众</strong>${escapeHtml(app.audience)}</span>
        <span><strong>最近使用</strong>${escapeHtml(formatUpdatedAt(app.updatedAt))}</span>
      </div>
      <div class="button-row">
        <a class="btn btn-primary" href="${escapeHtml(makeHref("/new-project.html", { app: app.id }))}">基于此 App 创建任务</a>
      </div>
    </article>
  `;
}

export function renderExampleCards() {
  return HOME_EXAMPLES.map((example) => `
    <article class="mini-card">
      <div class="eyebrow">Example</div>
      <h4>${escapeHtml(example.title)}</h4>
      <p class="muted">${escapeHtml(example.summary)}</p>
    </article>
  `).join("");
}

export function renderBriefCard(task) {
  const brief = task.brief;
  if (!brief) return "";
  return `
    <div class="brief-card">
      <div class="task-card-head">
        <div class="app-id">
          <span class="app-icon">${escapeHtml(task.appSnapshot.icon)}</span>
          <div>
            <div class="eyebrow">${escapeHtml(task.appSnapshot.sourceLabel)}</div>
            <h3>${escapeHtml(brief.appName)}</h3>
          </div>
        </div>
        <span class="chip warm">${escapeHtml(TEMPLATE_CATALOG[task.templateId]?.shortLabel || task.templateId)}</span>
      </div>
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatPlatformLabel(brief.targetPlatform))}</span>
        <span class="chip">${escapeHtml(brief.creativeGoal)}</span>
        <span class="chip">${escapeHtml(formatStatusLabel(task.status))}</span>
      </div>
      <div class="meta-list">
        <div><strong>目标受众</strong><span>${escapeHtml(brief.targetAudience)}</span></div>
        <div><strong>核心痛点</strong><span>${escapeHtml(brief.corePain)}</span></div>
        <div><strong>核心承诺</strong><span>${escapeHtml(brief.corePromise)}</span></div>
        <div><strong>必须包含</strong><span>${escapeHtml(brief.mustInclude)}</span></div>
        <div><strong>参考素材</strong><span>${escapeHtml(brief.referenceAds || "暂无")}</span></div>
      </div>
    </div>
  `;
}

export function renderRouteCard(angle, selectedAngleId) {
  const selected = angle.id === selectedAngleId;
  return `
    <article class="route-card ${selected ? "selected" : ""}" data-route-card="${escapeHtml(angle.id)}">
      <div class="task-card-head">
        <div>
          <div class="eyebrow">${selected ? "已选路线" : "候选路线"}</div>
          <h3>${escapeHtml(angle.title)}</h3>
        </div>
        <button class="btn ${selected ? "btn-secondary" : "btn-ghost"}" type="button" data-route-select="${escapeHtml(angle.id)}">${selected ? "当前路线" : "选择这条"}</button>
      </div>
      <p>${escapeHtml(angle.hook)}</p>
      <div class="meta-grid">
        <span><strong>情绪推进</strong>${escapeHtml(angle.emotion)}</span>
        <span><strong>测试理由</strong>${escapeHtml(angle.rationale)}</span>
        <span><strong>风险提醒</strong>${escapeHtml(angle.risk)}</span>
      </div>
      <div class="route-outline">
        ${angle.scenes.map((scene, index) => `
          <div class="route-scene">
            <strong>镜头 ${index + 1}</strong>
            <span>${escapeHtml(scene)}</span>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

export function renderRoutePreview(angle, taskId) {
  return `
    <div class="selected-route">
      <div class="task-card-head">
        <div>
          <div class="eyebrow">已选路线</div>
          <h3>${escapeHtml(angle.title)}</h3>
        </div>
        <a class="btn btn-primary" href="${escapeHtml(makeHref("/storyboard.html", { task: taskId }))}" id="enterStoryboardFromPreview">进入 Storyboard</a>
      </div>
      <p class="muted">${escapeHtml(angle.hook)}</p>
      <div class="meta-grid">
        <span><strong>情绪推进</strong>${escapeHtml(angle.emotion)}</span>
        <span><strong>测试理由</strong>${escapeHtml(angle.rationale)}</span>
        <span><strong>风险提醒</strong>${escapeHtml(angle.risk)}</span>
      </div>
    </div>
  `;
}

export function renderGuardPanel({ eyebrow = "Guard", title, body, actions = [] }) {
  return `
    <section class="panel empty-state">
      <div class="eyebrow">${escapeHtml(eyebrow)}</div>
      <h2>${escapeHtml(title)}</h2>
      <p class="muted">${escapeHtml(body)}</p>
      <div class="button-row">
        ${actions.map((action) => action.href
          ? `<a class="btn ${escapeHtml(action.kind || "btn-primary")}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`
          : `<button class="btn ${escapeHtml(action.kind || "btn-primary")}" type="button" data-guard-action="${escapeHtml(action.action || "")}">${escapeHtml(action.label)}</button>`
        ).join("")}
      </div>
    </section>
  `;
}

export function renderSceneRailItem(scene, active) {
  return `
    <button class="scene-rail-item ${active ? "active" : ""}" type="button" data-scene-select="${escapeHtml(scene.id)}">
      <div class="task-card-head">
        <div>
          <small>镜头 ${escapeHtml(String(scene.order))}</small>
          <strong>${escapeHtml(scene.title)}</strong>
        </div>
        <span class="chip ${scene.feedbackStatus === "weak" ? "danger" : scene.feedbackStatus === "winner" ? "success" : ""}">${escapeHtml(formatMediaLabel(scene.media.type))}</span>
      </div>
      <span class="muted">${escapeHtml(scene.beat)}</span>
      <div class="chip-row">
        <span class="chip">${escapeHtml(formatFeedbackLabel(scene.feedbackStatus))}</span>
        <span class="chip">${escapeHtml(scene.duration)}s</span>
      </div>
    </button>
  `;
}

export function renderTimelineItem(scene, active) {
  return `
    <article class="timeline-item ${active ? "active" : ""}" data-scene-select="${escapeHtml(scene.id)}">
      <div class="timeline-thumb ${escapeHtml(scene.media.type)}">${escapeHtml(formatMediaLabel(scene.media.type))}</div>
      <strong>${escapeHtml(String(scene.order))}. ${escapeHtml(scene.title)}</strong>
      <span class="muted">${escapeHtml(scene.subtitle)}</span>
      <div class="button-row compact">
        <button class="btn btn-ghost" type="button" data-scene-move="left" data-scene-id="${escapeHtml(scene.id)}">左移</button>
        <button class="btn btn-ghost" type="button" data-scene-move="right" data-scene-id="${escapeHtml(scene.id)}">右移</button>
      </div>
    </article>
  `;
}

export function renderPreview(scene, task) {
  return `
    <div class="preview-stage ${escapeHtml(scene.media.type)}">
      <div class="preview-overlay">
        <div class="chip-row">
          <span class="chip warm">${escapeHtml(TEMPLATE_CATALOG[task.templateId]?.shortLabel || task.templateId)}</span>
          <span class="chip">${escapeHtml(formatMediaLabel(scene.media.type))}</span>
          <span class="chip">${escapeHtml(scene.duration)}s</span>
          <span class="chip">${escapeHtml(scene.media.status)}</span>
        </div>
        <h3>${escapeHtml(scene.title)}</h3>
        <p>${escapeHtml(scene.beat)}</p>
        <div class="preview-script">
          <strong>脚本</strong>
          <span>${escapeHtml(scene.script)}</span>
        </div>
        <div class="preview-script">
          <strong>字幕</strong>
          <span>${escapeHtml(scene.subtitle)}</span>
        </div>
      </div>
    </div>
  `;
}

export function renderFeedbackBanner(feedbackSummary) {
  if (!feedbackSummary) return "";
  return `
    <section class="panel feedback-banner">
      <div class="task-card-head">
        <div>
          <div class="eyebrow">测试回流</div>
          <h2>${escapeHtml(feedbackSummary.headline)}</h2>
        </div>
        <div class="chip-row">
          <span class="chip">${escapeHtml(feedbackSummary.metrics.ctr)}</span>
          <span class="chip">${escapeHtml(feedbackSummary.metrics.hold3s)}</span>
          <span class="chip">${escapeHtml(feedbackSummary.metrics.cvr)}</span>
        </div>
      </div>
      <div class="soft-list">
        ${feedbackSummary.notes.map((note) => `<div class="soft-item"><span>${escapeHtml(note)}</span></div>`).join("")}
      </div>
    </section>
  `;
}
