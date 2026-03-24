import test from "node:test";
import assert from "node:assert/strict";

import { createMemoryStorage, createWorkspaceStore } from "../../demo/scripts/core/store.js";

test("store bootstraps starter workspace", () => {
  const store = createWorkspaceStore({
    storage: createMemoryStorage()
  });
  const workspace = store.getWorkspace();
  assert.equal(workspace.schemaVersion, 1);
  assert.equal(workspace.savedApps.length, 3);
  assert.equal(workspace.tasks.length, 3);
});

test("store migrates legacy projects payload", () => {
  const legacyStorage = createMemoryStorage({
    uaStoryboardWorkbenchV4: JSON.stringify({
      projects: [
        {
          id: "legacy-project",
          name: "Legacy",
          icon: "📱",
          template: "T1",
          brief: {
            appName: "Legacy App",
            appCategory: "Utility",
            targetAudience: "US",
            corePain: "pain",
            corePromise: "promise",
            mustInclude: "UI"
          },
          angles: [],
          selectedAngleId: "",
          scenes: []
        }
      ]
    })
  });
  const store = createWorkspaceStore({ storage: legacyStorage });
  const workspace = store.getWorkspace();
  assert.equal(workspace.tasks[0].title, "Legacy");
  assert.equal(workspace.savedApps[0].name, "Legacy App");
});

test("createTaskFromWizardDraft persists a task and saved app", () => {
  const store = createWorkspaceStore({
    storage: createMemoryStorage(),
    now: () => "2026-03-24T10:00:00.000Z"
  });
  store.resetWorkspace({ fixture: "empty" });
  const task = store.createTaskFromWizardDraft({
    sourceMode: "manual",
    selectedAppId: "",
    projectTitle: "Manual task",
    templateId: "T1",
    appData: {
      icon: "📱",
      name: "Manual App",
      category: "Utility",
      sourceLabel: "Manual",
      sourceUrl: "",
      description: "desc",
      audience: "Audience",
      pain: "Pain",
      promise: "Promise",
      mustInclude: "UI",
      suggestedTemplate: "T1"
    },
    targetPlatform: "meta",
    creativeGoal: "new hook test",
    targetAudience: "Audience",
    corePain: "Pain",
    corePromise: "Promise",
    cta: "Download now",
    mustInclude: "UI",
    mustAvoid: "none",
    referenceAds: "ref",
    storySeed: "",
    templateSpecific: {
      hookConstraint: "2s panic"
    }
  });
  const workspace = store.getWorkspace();
  assert.equal(workspace.savedApps.length, 1);
  assert.equal(workspace.tasks[0].id, task.id);
  assert.equal(workspace.currentTaskId, task.id);
});

test("saveTask detects stale revisions", () => {
  const store = createWorkspaceStore({
    storage: createMemoryStorage(),
    now: () => "2026-03-24T10:00:00.000Z"
  });
  const task = store.getWorkspace().tasks[0];
  const first = store.saveTask(task.id, task.revision, (draft) => {
    draft.title = "Updated once";
  });
  assert.equal(first.ok, true);
  const stale = store.saveTask(task.id, task.revision, (draft) => {
    draft.title = "Updated twice";
  });
  assert.equal(stale.ok, false);
  assert.equal(stale.code, "stale");
});
