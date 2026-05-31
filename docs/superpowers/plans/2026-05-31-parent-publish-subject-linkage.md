# Parent Publish Subject Linkage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add grade-linked subject selection to the parent publishing form.

**Architecture:** Store reusable grade and subject rules in `sheep/api/tutor/utils.js`. Keep `pages/index/publish.vue` responsible for picker display and resetting invalid selections.

**Tech Stack:** Vue 3, uni-app picker, Node.js source regression checks

---

### Task 1: Add the regression check

**Files:**

- Create: `tests/tutor-parent-publish-subject-linkage.test.cjs`

- [ ] Assert the shared mapping, fallback options, picker wiring, and invalid-selection reset.
- [ ] Run `node tests/tutor-parent-publish-subject-linkage.test.cjs` and confirm it fails.

### Task 2: Add shared subject rules

**Files:**

- Modify: `sheep/api/tutor/utils.js`

- [ ] Replace `成人` with `其他`.
- [ ] Add `tutorSubjectOptionsByGrade` with the approved lists.

### Task 3: Wire the parent publishing pickers

**Files:**

- Modify: `pages/index/publish.vue`

- [ ] Replace the parent subject input with a picker.
- [ ] Add computed subject options and a subject change handler.
- [ ] Reset an invalid subject when the grade changes.

### Task 4: Verify

- [ ] Run `node tests/tutor-parent-publish-subject-linkage.test.cjs`.
- [ ] Run all `tests/tutor-*.test.cjs` scripts.
- [ ] Run `git diff --check`.
