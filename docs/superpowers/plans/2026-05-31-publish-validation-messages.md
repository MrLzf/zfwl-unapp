# Publish Validation Messages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace vague combined publishing validation toasts with specific actionable messages.

**Architecture:** Keep validation inside `pages/index/publish.vue`. Preserve the existing order and rules while splitting combined branches into one branch per error.

**Tech Stack:** Vue 3, uni-app, Node.js source regression checks

---

### Task 1: Add the regression check

**Files:**

- Create: `tests/tutor-publish-validation-messages.test.cjs`

- [ ] Require each approved validation message.
- [ ] Reject the old combined validation messages.
- [ ] Run the test and confirm it fails.

### Task 2: Split publishing validation branches

**Files:**

- Modify: `pages/index/publish.vue`

- [ ] Split common title, subject, and mobile checks.
- [ ] Split parent grade and budget checks.
- [ ] Split teacher hourly price and service radius checks.

### Task 3: Verify

- [ ] Run the new regression test.
- [ ] Run all `tests/tutor-*.test.cjs` scripts.
- [ ] Run Prettier checks for touched files.
- [ ] Run `git diff --check`.
