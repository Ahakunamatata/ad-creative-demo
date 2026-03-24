import { FEEDBACK_STATUS_LABELS, MEDIA_TYPE_LABELS, PLATFORM_LABELS, TASK_STATUS_LABELS } from "./constants.js";

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatUpdatedAt(value) {
  if (!value) return "刚刚";
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function formatStatusLabel(status) {
  return TASK_STATUS_LABELS[status] || status || "Draft";
}

export function formatPlatformLabel(platform) {
  return PLATFORM_LABELS[platform] || platform || "Meta";
}

export function formatMediaLabel(type) {
  return MEDIA_TYPE_LABELS[type] || type || "分镜图";
}

export function formatFeedbackLabel(status) {
  return FEEDBACK_STATUS_LABELS[status] || status || "未测试";
}

export function makeHref(path, params = {}) {
  const url = new URL(path, "https://demo.local");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return `${url.pathname}${url.search}`;
}

export function readTaskId(search = "") {
  return new URLSearchParams(search).get("task") || "";
}
