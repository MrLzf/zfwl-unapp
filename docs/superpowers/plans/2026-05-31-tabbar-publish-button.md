# Tabbar Publish Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all bottom navigation labels on one row while lifting the center publish icon by `28rpx`.

**Architecture:** Keep the existing tabbar template and behavior unchanged. Adjust only scoped SCSS in `s-tabbar.vue`: give each item a stable icon slot, place labels consistently, and translate the center bubble upward without moving its label.

**Tech Stack:** Uni-app, Vue 3, scoped SCSS

---

### Task 1: Align tabbar labels and lift the publish icon

**Files:**
- Modify: `sheep/components/s-tabbar/s-tabbar.vue`
- Test: `tests/tabbar-style.test.cjs`

- [ ] **Step 1: Add a source-level style regression test**

Create `tests/tabbar-style.test.cjs` with assertions for the stable icon slot and `translateY(-28rpx)` center bubble offset.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/tabbar-style.test.cjs`

Expected: FAIL because the current tabbar styles do not contain the new alignment rules.

- [ ] **Step 3: Apply the minimal scoped SCSS changes**

Update `sheep/components/s-tabbar/s-tabbar.vue` so `.tabbar-item` uses a grid with a fixed icon row and text row. Set `.center-bubble` to `transform: translateY(-28rpx)` while keeping the center label in the shared text row.

- [ ] **Step 4: Run focused verification**

Run: `node --test tests/tabbar-style.test.cjs`

Expected: PASS.

- [ ] **Step 5: Run formatting verification**

Run: `npm run prettier -- --check sheep/components/s-tabbar/s-tabbar.vue tests/tabbar-style.test.cjs`

Expected: PASS.
