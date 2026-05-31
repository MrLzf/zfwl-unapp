# User Menu Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the user-center menu relevant to the current tutor role and show live badges.

**Architecture:** Build the user-center list menu in a computed function. Insert teacher certification only for teachers and bind the score badge to store data.

**Tech Stack:** Vue 3, uni-app, Node.js source regression checks

---

### Task 1: Add failing regression check

- [ ] Add `tests/tutor-user-menu-role.test.cjs`.
- [ ] Run it and confirm it fails.

### Task 2: Update user menu generation

- [ ] Build the shared menu array.
- [ ] Insert teacher certification only for teachers.
- [ ] Replace the hard-coded point badge with the live store value.

### Task 3: Verify

- [ ] Run all tutor frontend regression scripts.
- [ ] Run Prettier checks.
- [ ] Run `git diff --check`.
