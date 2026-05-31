# Detail Owner View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show unmasked owner contact details and hide irrelevant detail actions for self-published posts.

**Architecture:** Add an owner-contact lookup to the backend contact service and use it before reusable-contact lookup in detail responses. Compute owner state in the frontend from shared user IDs.

**Tech Stack:** Spring Boot, Mockito, Vue 3, uni-app, Node.js source regression checks

---

### Task 1: Add failing regression checks

- [ ] Add backend owner-contact unit tests.
- [ ] Add frontend owner-view source checks.
- [ ] Run both checks and confirm they fail.

### Task 2: Implement backend owner contact lookup

- [ ] Add `getOwnerContact` to `TutorContactService`.
- [ ] Implement demand and resume owner lookups without point records.
- [ ] Use owner contact before reusable contact in detail responses.

### Task 3: Implement frontend owner view

- [ ] Compute `isOwner`.
- [ ] Show owner contact details directly.
- [ ] Hide masked-contact hints and the bottom action bar for owners.

### Task 4: Verify

- [ ] Run backend focused tests.
- [ ] Run all tutor frontend regression scripts.
- [ ] Run Prettier checks and `git diff --check`.
