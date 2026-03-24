# App UA Storyboard Demo

这是一个用于产品评审的轻量前端 demo，目标是把 App UA 创意生产流程拆成更清晰的四段：

1. 项目入口
2. 创建引导
3. 策略选择
4. Storyboard 工作区

## 目录

- `demo/index.html`：项目入口
- `demo/new-project.html`：创建引导
- `demo/angles.html`：策略选择
- `demo/storyboard.html`：Storyboard 工作区
- `demo/scripts/core/*`：workspace store、mock 生成器、fixture、共享 UI
- `demo/scripts/pages/*`：页面级入口脚本
- `demo/styles.css`：共享样式
- `tests/unit/*`：`node:test` 单测
- `tests/e2e/*`：Playwright 端到端测试

## 本地预览

在仓库根目录执行：

```bash
npm install
npm run dev
```

然后打开：

```text
http://127.0.0.1:4173/index.html
```

## 测试

```bash
npm test
npm run test:e2e
```

## Vercel 部署建议

- Framework Preset：`Other`
- Root Directory：`demo`
- Output Directory：留空
- 当前仓库结构已经按 `demo/` 作为部署根目录组织

如果 Vercel 提示 `Project "ad-creative-demo" already exists`，请改一个新名字，例如：

- `ad-creative-demo-prototype`
- `ad-creative-storyboard-demo`
- `app-ua-storyboard-demo`

## 说明

这是一套 wireframe 级原型，重点是对象、页面和交互逻辑，不是正式生产 UI。
