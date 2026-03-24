import test from "node:test";
import assert from "node:assert/strict";

import { buildAnglesForTask, buildBriefFromDraft, buildFeedbackSummary, buildScenesFromAngle, parseStoreUrl } from "../../demo/scripts/core/mock-generators.js";

test("parseStoreUrl returns known store sample", () => {
  const parsed = parseStoreUrl("https://apps.apple.com/us/app/trackmate-360");
  assert.equal(parsed.name, "TrackMate 360");
  assert.equal(parsed.suggestedTemplate, "T2");
});

test("buildBriefFromDraft merges app data and brief inputs", () => {
  const brief = buildBriefFromDraft({
    appData: {
      name: "TrackMate 360",
      category: "Location Tracking",
      sourceLabel: "App Store",
      sourceUrl: "https://apps.apple.com/us/app/trackmate-360",
      audience: "US women",
      pain: "pain",
      promise: "promise",
      mustInclude: "map UI"
    },
    targetPlatform: "meta",
    creativeGoal: "angle expansion",
    targetAudience: "US women 25-34",
    corePain: "lost signal",
    corePromise: "verify faster",
    cta: "Download now",
    mustInclude: "map UI",
    mustAvoid: "none",
    referenceAds: "competitor",
    storySeed: "night scene",
    templateSpecific: {}
  });

  assert.equal(brief.appName, "TrackMate 360");
  assert.equal(brief.corePain, "lost signal");
  assert.equal(brief.targetPlatform, "meta");
});

test("buildAnglesForTask creates four route options", () => {
  const task = {
    id: "task-1",
    templateId: "T1",
    brief: {
      corePain: "找不到手机",
      corePromise: "拍手就能找到",
      targetAudience: "Android users",
      cta: "Try it free",
      templateSpecific: {}
    }
  };
  const angles = buildAnglesForTask(task);
  assert.equal(angles.length, 4);
  assert.match(angles[0].hook, /找不到手机/);
});

test("buildScenesFromAngle creates mixed image and video scenes", () => {
  const task = {
    id: "task-1",
    templateId: "T2",
    brief: {
      corePain: "怀疑伴侣失联",
      corePromise: "快速确认位置",
      targetAudience: "US women",
      cta: "Download now",
      templateSpecific: {
        scenarioSeed: "深夜突然关机"
      }
    }
  };
  const angle = buildAnglesForTask(task)[0];
  const scenes = buildScenesFromAngle(task, angle);
  assert.equal(scenes.length, 5);
  assert.equal(scenes[0].media.type, "image");
  assert.equal(scenes[1].media.type, "video");
});

test("buildFeedbackSummary returns replay guidance", () => {
  const summary = buildFeedbackSummary({ selectedAngleId: "task-1-angle-1" });
  assert.equal(summary.metrics.ctr, "0.87%");
  assert.equal(summary.notes.length, 3);
});
