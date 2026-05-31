# Inner Navbar Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make shared inner navigation readable on light-background tutor pages.

**Architecture:** Replace scroll-derived white text defaults with an explicit `dark` prop. Style the shared capsule for contrast without changing page-level button colors.

**Tech Stack:** Vue 3, uni-app, SCSS, Node.js source regression checks

---

### Task 1: Add failing regression check

- [ ] Add `tests/tutor-inner-navbar-contrast.test.cjs`.
- [ ] Run it and confirm it fails.

### Task 2: Fix shared inner navbar

- [ ] Add a `dark` prop defaulting to `false`.
- [ ] Bind text classes to the explicit prop.
- [ ] Remove scroll-derived text inversion.
- [ ] Add capsule background and border contrast.

### Task 3: Verify

- [ ] Run all tutor frontend regression scripts.
- [ ] Run Prettier checks.
- [ ] Run `git diff --check`.
