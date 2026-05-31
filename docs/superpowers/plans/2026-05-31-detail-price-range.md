# Detail Price Range Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show original hourly price ranges on demand and resume detail pages.

**Architecture:** Add a shared `formatPriceRange` formatter in `sheep/api/tutor/utils.js`. Use it in the detail page with parent and teacher range fields while retaining legacy single-value fallbacks.

**Tech Stack:** Vue 3, uni-app, Node.js source regression checks

---

### Task 1: Add the regression check

**Files:**

- Create: `tests/tutor-detail-price-range.test.cjs`

- [ ] Require the shared formatter and detail-page computed value.
- [ ] Require both demand and resume range fields.
- [ ] Run the test and confirm it fails.

### Task 2: Add shared formatting and detail-page wiring

**Files:**

- Modify: `sheep/api/tutor/utils.js`
- Modify: `pages/tutor/detail/index.vue`

- [ ] Add `formatPriceRange`.
- [ ] Add a computed detail price label using the correct range fields.
- [ ] Render the formatted price label.

### Task 3: Verify

- [ ] Run the new regression test.
- [ ] Run all `tests/tutor-*.test.cjs` scripts.
- [ ] Run Prettier checks for touched files.
- [ ] Run `git diff --check`.
