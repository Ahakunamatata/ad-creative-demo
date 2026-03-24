import { test, expect } from "@playwright/test";

test("home -> wizard -> routes -> storyboard -> export -> feedback", async ({ page }) => {
  await page.goto("/index.html?testMode=1&reset=1&fixture=starter");
  await expect(page.getByRole("heading", { name: "任务与 App 在同一个工作台里管理" })).toBeVisible();

  await page.getByRole("link", { name: "创建任务" }).first().click();
  await expect(page.getByRole("heading", { name: "先选 App，再补这轮测试目标" })).toBeVisible();

  await page.locator('[data-select-app="app-trackmate"]').click();
  await page.getByRole("button", { name: "下一步：模板与输入" }).click();
  await page.getByRole("button", { name: "下一步：创意 brief" }).click();
  await page.getByLabel("创意目标").selectOption("winner iteration");
  await page.getByLabel("参考素材").fill("Competitor hook reference");
  await page.getByRole("button", { name: "下一步：生成路线" }).click();
  await page.getByRole("button", { name: "生成路线并进入下一步" }).click();

  await expect(page.getByRole("heading", { name: "先选脚本走向，再开始做镜头。" })).toBeVisible();
  await page.locator("[data-route-select]").first().click();
  await page.getByRole("link", { name: "进入 Storyboard" }).click();

  await expect(page.getByRole("heading", { name: "同一个工作区里继续做镜头、字幕和节奏复盘" })).toBeVisible();
  await page.getByRole("button", { name: "生成视频" }).click();
  await expect(page.locator("#sceneStatus")).toContainText("当前是视频镜头");
  await page.getByRole("button", { name: "导出最终视频" }).click();
  await page.getByRole("button", { name: "模拟测试结果" }).click();
  await expect(page.getByText("CTR 偏低，前 3 秒流失偏高。")).toBeVisible();
});

test("routes guard renders when task is missing", async ({ page }) => {
  await page.goto("/angles.html?testMode=1&reset=1&fixture=empty");
  await expect(page.getByRole("heading", { name: "先选择一个任务再看路线。" })).toBeVisible();
});

test("storyboard guard renders when scenes are missing", async ({ page }) => {
  await page.goto("/storyboard.html?testMode=1&reset=1&fixture=guard-no-scenes");
  await expect(page.getByRole("heading", { name: "当前任务还没有镜头骨架。" })).toBeVisible();
});
