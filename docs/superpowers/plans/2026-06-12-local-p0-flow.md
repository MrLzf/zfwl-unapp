# Local P0 Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the tutoring mobile P0 loop run against a controlled local backend target and verify the mobile H5 experience.

**Architecture:** Add a source-level regression check for local P0 environment targets, update mobile/admin configs to use the local backend in local development, keep the backend connected to online MySQL and Redis per debugging requirements, then verify backend, mobile tests, builds, and browser rendering.

**Tech Stack:** Spring Boot 2.7, Maven, MySQL, Redis, Vue 3, Vite, uni-app, Node.js `node:test`, PowerShell

---

### Task 1: Add Local Environment Regression Check

**Files:**
- Create: `D:\work\jiajiao\zfwl-unapp\tests\tutor-local-p0-env.test.cjs`

- [x] **Step 1: Add the failing test**

Create `tests/tutor-local-p0-env.test.cjs` with this content:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const mobileRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(mobileRoot, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(workspaceRoot, relativePath), 'utf8');
}

test('mobile development mode targets the local app API', () => {
  const env = read('zfwl-unapp/.env');

  assert.match(env, /^TUTOR_DEV_BASE_URL=http:\/\/localhost:48080$/m);
  assert.match(env, /^TUTOR_API_PATH=\/app-api$/m);
  assert.match(env, /^TUTOR_H5_URL=http:\/\/localhost:3000$/m);
  assert.doesNotMatch(env, /^TUTOR_DEV_BASE_URL=https:\/\/wccprint\.top$/m);
});

test('admin local mode targets the local admin API', () => {
  const envLocal = read('zlwl-vue/.env.local');

  assert.match(envLocal, /^VITE_BASE_URL='http:\/\/localhost:48080'$/m);
  assert.match(envLocal, /^VITE_API_URL=\/admin-api$/m);
  assert.doesNotMatch(envLocal, /^VITE_BASE_URL='http:\/\/159\.75\.221\.52:48080'$/m);
});

test('backend local profile intentionally uses online database and redis', () => {
  const yaml = read('zfwl/yudao-server/src/main/resources/application-local.yaml');

  assert.match(yaml, /url: jdbc:mysql:\/\/159\.75\.221\.52:3306\/ruoyi-vue-pro\?/);
  assert.match(yaml, /host: 159\.75\.221\.52 # 地址/);
  assert.match(yaml, /password: housekeeping # 密码/);
});
```

- [x] **Step 2: Run the test and confirm it fails**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
node tests\tutor-local-p0-env.test.cjs
```

Expected before config edits: exit code `1`, with failures for `TUTOR_DEV_BASE_URL` and admin `VITE_BASE_URL`.

### Task 2: Point Mobile/Admin Development Configs To Local Backend

**Files:**
- Modify: `D:\work\jiajiao\zfwl-unapp\.env`
- Modify: `D:\work\jiajiao\zlwl-vue\.env.local`

- [x] **Step 1: Update mobile local API and H5 URL**

In `zfwl-unapp/.env`, change only these local-development values:

```dotenv
TUTOR_DEV_BASE_URL=http://localhost:48080
TUTOR_H5_URL=http://localhost:3000
```

Leave `TUTOR_BASE_URL=https://wccprint.top` unchanged because it is the non-development target.

- [x] **Step 2: Update admin local API**

In `zlwl-vue/.env.local`, change:

```dotenv
VITE_BASE_URL='http://localhost:48080'
```

Leave `VITE_API_URL=/admin-api` unchanged.

- [x] **Step 3: Keep backend local profile on online data services**

In `zfwl/yudao-server/src/main/resources/application-local.yaml`, leave the MySQL and Redis targets as the online services:

```yaml
          url: jdbc:mysql://159.75.221.52:3306/ruoyi-vue-pro?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true&rewriteBatchedStatements=true
          username: root
          password: 123LZF456
```

```yaml
    host: 159.75.221.52
    port: 6379
    database: 0
    password: housekeeping
```

- [x] **Step 4: Re-run the focused environment test**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
node tests\tutor-local-p0-env.test.cjs
```

Expected: exit code `0`.

### Task 3: Verify Static Regression Suite

**Files:**
- No production edits expected.

- [x] **Step 1: Run all mobile tutor source checks**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
npm test
```

Expected: exit code `0`. If a test fails, read the named test and fix only the behavior related to local P0 flow or record it as unrelated if it predates the work.

- [x] **Step 2: Check git diffs stay scoped**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
git status --short
cd D:\work\jiajiao\zlwl-vue
git status --short
cd D:\work\jiajiao\zfwl
git status --short
```

Expected: only the new environment test, local environment config edits, and pre-existing user changes are present.

### Task 4: Backend Compile And Startup Probe

**Files:**
- No production edits expected unless startup exposes a local-P0 blocker.

- [x] **Step 1: Compile the tutor-backed server surface**

Run:

```powershell
cd D:\work\jiajiao\zfwl
mvn -pl yudao-server -am -DskipTests compile
```

Expected: exit code `0`.

- [x] **Step 2: Probe local dependency ports**

Run:

```powershell
Test-NetConnection 127.0.0.1 -Port 3306
Test-NetConnection 127.0.0.1 -Port 6379
```

Expected: local ports are not required because the backend uses online MySQL and Redis for this pass. Record local port results only as diagnostic context.

- [x] **Step 3: Start the backend when dependencies are reachable**

Run:

```powershell
cd D:\work\jiajiao\zfwl
mvn -pl yudao-server -am spring-boot:run
```

Expected: server listens on `http://localhost:48080`. Keep the process running only if startup succeeds and it is needed for browser smoke tests.

### Task 5: Mobile Build And H5 Visual Smoke

**Files:**
- Modify mobile Vue/CSS files only if visual smoke finds concrete P0 issues.

- [x] **Step 1: Build H5**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
npm run build:h5
```

Expected: exit code `0`.

- [x] **Step 2: Build WeChat mini program**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
npm run build:mp-weixin
```

Expected: exit code `0`.

- [x] **Step 3: Start mobile H5 dev server**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
npm run dev:h5
```

Expected: H5 dev server opens or prints `http://localhost:3000`.

- [x] **Step 4: Inspect mobile pages in browser**

Use the in-app browser at `http://localhost:3000` with a mobile viewport. Check:

- Home.
- Square.
- Publish.
- Detail.
- Mine.

Expected: no blank screen, major text overlap, broken fixed action area, or unreadable primary controls.

### Task 6: Admin Support Smoke

**Files:**
- Modify admin files only if the required review/correction pages cannot load because of a local-P0 blocker.

- [x] **Step 1: Start admin dev server**

Run:

```powershell
cd D:\work\jiajiao\zlwl-vue
pnpm dev
```

Expected: dev server opens or prints the configured local URL.

- [x] **Step 2: Inspect required admin support pages**

With backend running, verify the admin can reach the tutor review/support surfaces needed for P0:

- Certification review.
- Publish review or post management.
- Point or member data correction.

Expected: pages load without route/menu crashes. API data may be empty if no local seed data exists.

### Task 7: Final Verification And Handoff

**Files:**
- No new edits expected.

- [x] **Step 1: Run diff whitespace check**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
git diff --check
cd D:\work\jiajiao\zlwl-vue
git diff --check
cd D:\work\jiajiao\zfwl
git diff --check
```

Expected: no whitespace errors.

- [x] **Step 2: Summarize exact evidence**

## Execution Evidence

Recorded on 2026-06-12 in local test mode.

- Backend: `http://localhost:48080`, Spring process PID `68088`; local profile uses online MySQL `159.75.221.52:3306` and Redis `159.75.221.52:6379`.
- Mobile H5: `http://localhost:3000`, process PID `49912`; admin frontend: `http://localhost/`, process PID `43852`.
- Environment regression: `node tests\tutor-local-p0-env.test.cjs` passed after local-target config changes.
- Mobile regression: `npm test` passed.
- Backend compile: `mvn -pl yudao-server -am -DskipTests compile` passed with `BUILD SUCCESS`.
- Mobile builds: `npm run build:h5` and `npm run build:mp-weixin` passed; Sass deprecation warnings are pre-existing style-tooling warnings.
- H5 smoke: no-name SMS login with `13656860475` succeeded, token was stored, backend user lookup returned `code=0`, and core pages had no blank screen or login gate.
- Admin support smoke: permission info plus tutor certification, demand, resume, contacts, matches, reviews, profiles, city, and dashboard APIs returned `code=0`.
- Port probes: online MySQL and Redis TCP probes passed; local Redis was not required and was not listening.
- Whitespace: `git diff --check` passed in `zfwl-unapp`, `zfwl`, and `zlwl-vue` with CRLF warnings only.

Record:

- Config files changed.
- Commands run and exit codes.
- Backend data dependency status for online MySQL and Redis.
- Local URLs started.
- Browser pages checked.
- Any blockers or external dependencies still required.
