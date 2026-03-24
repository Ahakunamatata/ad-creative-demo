export const TEMPLATE_CATALOG = {
  T1: {
    id: "T1",
    name: "Problem-Solution Hook",
    shortLabel: "Problem-Solution",
    summary: "用强痛点开场，再把产品作为清晰的解法推进。",
    fields: [
      { id: "hookConstraint", label: "Hook 限制", placeholder: "例如：前 2 秒先给人物反应，不先给产品 UI" },
      { id: "storySeed", label: "情境 seed", placeholder: "例如：出门前 30 秒发现手机找不到了" }
    ]
  },
  T2: {
    id: "T2",
    name: "Scenario Breakdown",
    shortLabel: "Scenario",
    summary: "从一个具体剧情切入，把冲突、转折和解决过程拆成路线。",
    fields: [
      { id: "scenarioSeed", label: "核心情境", placeholder: "例如：深夜发现伴侣突然关机失联" },
      { id: "emotionArc", label: "情绪弧线", placeholder: "例如：怀疑 -> 焦虑 -> 查询 -> 确认位置异常" }
    ]
  },
  T3: {
    id: "T3",
    name: "Winner Iteration",
    shortLabel: "Winner Iteration",
    summary: "基于现有 winner 的骨架做局部变化，而不是整条重写。",
    fields: [
      { id: "winnerReference", label: "Winner 参考", placeholder: "例如：winner-042 / 高 CTR 口播版" },
      { id: "lockedElements", label: "必须保留", placeholder: "例如：开场台词、UI 顺序、结尾 CTA" }
    ]
  }
};

export const STORE_SAMPLES = {
  "https://apps.apple.com/us/app/trackmate-360": {
    icon: "🛰️",
    name: "TrackMate 360",
    category: "Location Tracking",
    sourceLabel: "App Store",
    description: "See family location updates, arrival alerts, and movement history in one place.",
    audience: "US women 25-34, relationship anxiety",
    pain: "怀疑伴侣突然失联或撒谎，但没有证据确认。",
    promise: "用实时位置和到达提醒快速验证情况，减少不确定感。",
    mustInclude: "地图 UI、到达提醒、通知弹窗",
    suggestedTemplate: "T2"
  },
  "https://play.google.com/store/apps/details?id=com.clapfind.mobile": {
    icon: "👏",
    name: "ClapFind",
    category: "Utility",
    sourceLabel: "Google Play",
    description: "Clap once, trigger a loud ringtone, and find your phone fast.",
    audience: "Android users 18-44, busy routine",
    pain: "出门前找不到手机，时间和情绪一起失控。",
    promise: "只要拍手，手机就会响铃暴露位置。",
    mustInclude: "拍手动作、铃声音效、手机特写",
    suggestedTemplate: "T1"
  },
  "https://apps.apple.com/us/app/sleepflow-night-reset": {
    icon: "🌙",
    name: "SleepFlow",
    category: "Wellness",
    sourceLabel: "App Store",
    description: "Wind down faster with guided sleep tracks, breathing cues, and nightly routines.",
    audience: "US women 24-38, stressed office workers",
    pain: "睡前脑子停不下来，越想休息越清醒。",
    promise: "用睡前音频和呼吸引导，把入睡准备变成固定流程。",
    mustInclude: "呼吸节奏 UI、夜晚床边、耳机或手机音频画面",
    suggestedTemplate: "T1"
  },
  "https://apps.apple.com/us/app/receipthero-smart-scanner": {
    icon: "🧾",
    name: "ReceiptHero",
    category: "Productivity",
    sourceLabel: "App Store",
    description: "Scan receipts, auto-categorize expenses, and export tax-ready summaries.",
    audience: "Freelancers and small business owners in US",
    pain: "报税前需要手动整理大量票据，重复劳动又慢又乱。",
    promise: "拍照就能自动识别票据并生成分类汇总。",
    mustInclude: "扫描动作、分类结果、导出报表",
    suggestedTemplate: "T3"
  }
};

export const HOME_EXAMPLES = [
  {
    title: "工具类 panic 场景",
    summary: "从 brief 到 storyboard 的完整流程，适合演示 Task 启动和镜头编辑。"
  },
  {
    title: "Winner hook 变体",
    summary: "只替换 hook、字幕和 CTA，适合演示一条 winner 的局部迭代。"
  }
];
