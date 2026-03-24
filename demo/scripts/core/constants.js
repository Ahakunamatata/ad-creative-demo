export const STORAGE_KEY = "uaStoryboardWorkspaceV1";
export const LEGACY_STORAGE_KEYS = ["uaStoryboardWorkbenchV4", "uaStoryboardWorkbenchV2"];
export const SCHEMA_VERSION = 1;

export const TASK_STATUS = {
  DRAFT: "draft",
  BRIEF_READY: "brief_ready",
  ROUTES_READY: "routes_ready",
  STORYBOARD: "storyboard",
  EXPORTED: "exported",
  FEEDBACK_REVIEW: "feedback_review"
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.DRAFT]: "草稿中",
  [TASK_STATUS.BRIEF_READY]: "Brief 已就绪",
  [TASK_STATUS.ROUTES_READY]: "待选路线",
  [TASK_STATUS.STORYBOARD]: "分镜制作中",
  [TASK_STATUS.EXPORTED]: "已导出",
  [TASK_STATUS.FEEDBACK_REVIEW]: "测试复盘中"
};

export const FEEDBACK_STATUS_LABELS = {
  untested: "未测试",
  weak: "待调整",
  stable: "可保留",
  winner: "表现好"
};

export const MEDIA_TYPE_LABELS = {
  image: "分镜图",
  video: "视频"
};

export const PLATFORM_LABELS = {
  meta: "Meta",
  tiktok: "TikTok",
  google_uac: "Google UAC"
};
