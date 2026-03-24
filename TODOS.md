# TODOS

## Product

### Task version history + feedback lineage

**What:** Record each export, feedback result, and follow-up storyboard revision as linked task versions instead of overwriting only the latest state.

**Why:** Users need to compare iterations and understand which tested version led to which scene changes.

**Context:** The V1 lightweight demo intentionally keeps only the latest task state. The reviewed plan already includes `Task`, `exportState`, and `feedbackSummary`; this follow-up should add a version chain without breaking the lightweight local-first workflow.

**Effort:** M
**Priority:** P2
**Depends on:** Lightweight storyboard, export, and feedback flow landing first

### App workspace

**What:** Promote `SavedApp` into a first-class workspace so one app can own and compare multiple creative tasks.

**Why:** The long-term product is app-centric UA iteration, not a flat list of unrelated tasks.

**Context:** The current plan already includes `savedApps[]`, `tasks[]`, `savedAppId`, and `appSnapshot`, so the data relationship exists. The missing piece is the UI and navigation model that lets users manage many tasks under one app.

**Effort:** M
**Priority:** P3
**Depends on:** Lightweight demo shipping with stable `savedApps` and `tasks` state

## Platform

### Replace mock parsing and generation with real backend services

**What:** Replace the front-end mock app parsing, brief generation, route generation, scene generation, export, and feedback flows with real backend services.

**Why:** This is the step from clickable demo to internally usable product.

**Context:** The current review intentionally keeps all parsing and generation flows mocked in the browser with `localStorage` and deterministic test mode. When moving to real services, preserve the current page flow and guard/error states while adding APIs, retries, auth, and user-facing failure handling.

**Effort:** L
**Priority:** P2
**Depends on:** Current lightweight front-end demo and test harness landing first

## Completed
