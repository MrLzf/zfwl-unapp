# Browse History Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep browse history consistent between backend records and local fallback storage.

**Architecture:** Add backend delete and clear operations plus target-level deduplication. Make the frontend prefer backend history and use local data only during request failure.

**Tech Stack:** Spring Boot, MyBatis Plus, Mockito, Vue 3, uni-app, Node.js source regression checks

---

### Task 1: Add failing regression checks

- [ ] Add frontend history sync checks.
- [ ] Add backend history service tests.
- [ ] Run both checks and confirm they fail.

### Task 2: Implement backend history management

- [ ] Add mapper deletion helpers.
- [ ] Deduplicate before recording.
- [ ] Add single-delete and clear service methods.
- [ ] Add controller DELETE endpoints.

### Task 3: Implement frontend sync behavior

- [ ] Add API delete and clear methods.
- [ ] Prefer remote history after successful requests.
- [ ] Delete and clear both remote and local history.

### Task 4: Verify

- [ ] Run focused backend tests.
- [ ] Run all tutor frontend regression scripts.
- [ ] Run Prettier checks and `git diff --check`.
