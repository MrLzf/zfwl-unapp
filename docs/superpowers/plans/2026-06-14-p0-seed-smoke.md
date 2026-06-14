# P0 Seed Smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add repeatable commands for creating tutor P0 test data and running the local P0 smoke checks.

**Architecture:** Keep the scripts in the mobile repo because the mobile app is the primary P0 surface. Scripts use real local backend API calls instead of direct database writes, while admin-only transitions use admin API calls with the existing local test authorization.

**Tech Stack:** Node.js CommonJS scripts, built-in `fetch`, `node:test`, uni-app npm scripts, local Spring Boot API.

---

### Task 1: Contract Test

**Files:**
- Create: `D:\work\jiajiao\zfwl-unapp\tests\tutor-p0-scripts.test.cjs`
- Modify: `D:\work\jiajiao\zfwl-unapp\package.json`

- [x] **Step 1: Add a failing contract test**

Create `tests/tutor-p0-scripts.test.cjs` asserting that `package.json` exposes `seed:p0`, `smoke:p0`, and `verify:p0`, and that `scripts/seed-tutor-p0.cjs` and `scripts/smoke-tutor-p0.cjs` contain the expected API calls.

- [x] **Step 2: Run the contract test**

Run `node tests\tutor-p0-scripts.test.cjs`.

Expected before implementation: exit code `1` because the scripts and npm commands do not exist.

### Task 2: API Scripts

**Files:**
- Create: `D:\work\jiajiao\zfwl-unapp\scripts\seed-tutor-p0.cjs`
- Create: `D:\work\jiajiao\zfwl-unapp\scripts\smoke-tutor-p0.cjs`
- Modify: `D:\work\jiajiao\zfwl-unapp\package.json`

- [x] **Step 1: Implement shared HTTP helpers inside each script**

Use built-in `fetch`, `JSON.stringify`, tenant header `tenant-id: 1`, and clear error messages that include HTTP status, API code, and API message.

- [x] **Step 2: Implement `seed-tutor-p0.cjs`**

The script logs in two fresh SMS users, initializes parent/teacher tutor profiles in Shanghai, submits teacher certification, publishes one parent demand and one teacher resume, audits them through admin APIs, adjusts points, and prints a JSON summary.

- [x] **Step 3: Implement `smoke-tutor-p0.cjs`**

The script checks backend, mobile H5, admin root, app square lists, detail endpoints when available, admin support APIs, and optional authenticated endpoints when a token is available. It prints a compact JSON result and exits non-zero on failed required checks.

- [x] **Step 4: Add npm commands**

Add `seed:p0`, `smoke:p0`, and `verify:p0` to `package.json`.

`verify:p0` directly chains the three Node scripts to avoid nested npm wrapper failures on Windows.

### Task 3: Verification

**Files:**
- No additional files expected.

- [x] **Step 1: Run focused contract test**

Run `node tests\tutor-p0-scripts.test.cjs`; expected exit code `0`.

- [x] **Step 2: Run all mobile source tests**

Run `npm test`; expected exit code `0`.

- [x] **Step 3: Run smoke command**

Run `npm run smoke:p0`; expected exit code `0` with local services running.

- [x] **Step 4: Run seed command**

Run `npm run seed:p0`; expected exit code `0` when local backend is running and online DB/Redis are reachable.

- [x] **Step 5: Run whitespace check**

Run `git diff --check`; expected no whitespace errors.

### Execution Evidence

- `node tests\tutor-p0-scripts.test.cjs`: passed.
- `node tests\run-tutor-tests.cjs`: passed.
- `npm run smoke:p0`: passed before and after seeding.
- `npm run seed:p0`: passed, creating audited demand/resume data and reciprocal contact records.
- `npm run verify:p0`: passed end-to-end (`smoke -> seed -> smoke`) after switching it to direct Node script chaining.
- `git diff --check`: passed with only existing Windows line-ending warnings.
