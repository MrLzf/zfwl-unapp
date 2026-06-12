# Local P0 Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the tutoring mobile P0 loop run against a controlled local backend target and verify the mobile H5 experience.

**Architecture:** Add a source-level regression check for local P0 environment targets, update the three repo configs to use localhost in local development, then verify backend, mobile tests, builds, and browser rendering. Keep data/runtime troubleshooting separate from UI polish so environment failures are visible.

**Tech Stack:** Spring Boot 2.7, Maven, MySQL, Redis, Vue 3, Vite, uni-app, Node.js `node:test`, PowerShell

---

### Task 1: Add Local Environment Regression Check

**Files:**
- Create: `D:\work\jiajiao\zfwl-unapp\tests\tutor-local-p0-env.test.cjs`

- [ ] **Step 1: Add the failing test**

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

test('backend local profile does not silently default to online database or redis', () => {
  const yaml = read('zfwl/yudao-server/src/main/resources/application-local.yaml');

  assert.match(yaml, /jdbc:mysql:\/\/\$\{MYSQL_HOST:127\.0\.0\.1\}:\$\{MYSQL_PORT:3306\}/);
  assert.match(yaml, /host: \$\{REDIS_HOST:127\.0\.0\.1\}/);
  assert.doesNotMatch(yaml, /159\.75\.221\.52/);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
node tests\tutor-local-p0-env.test.cjs
```

Expected before config edits: exit code `1`, with failures for `TUTOR_DEV_BASE_URL`, admin `VITE_BASE_URL`, and backend online host references.

### Task 2: Point Local Development Configs To Localhost

**Files:**
- Modify: `D:\work\jiajiao\zfwl-unapp\.env`
- Modify: `D:\work\jiajiao\zlwl-vue\.env.local`
- Modify: `D:\work\jiajiao\zfwl\yudao-server\src\main\resources\application-local.yaml`

- [ ] **Step 1: Update mobile local API and H5 URL**

In `zfwl-unapp/.env`, change only these local-development values:

```dotenv
TUTOR_DEV_BASE_URL=http://localhost:48080
TUTOR_H5_URL=http://localhost:3000
```

Leave `TUTOR_BASE_URL=https://wccprint.top` unchanged because it is the non-development target.

- [ ] **Step 2: Update admin local API**

In `zlwl-vue/.env.local`, change:

```dotenv
VITE_BASE_URL='http://localhost:48080'
```

Leave `VITE_API_URL=/admin-api` unchanged.

- [ ] **Step 3: Update backend local datasource defaults**

In `zfwl/yudao-server/src/main/resources/application-local.yaml`, change the master datasource to environment-variable defaults:

```yaml
          url: jdbc:mysql://${MYSQL_HOST:127.0.0.1}:${MYSQL_PORT:3306}/${MYSQL_DATABASE:ruoyi-vue-pro}?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true&rewriteBatchedStatements=true
          username: ${MYSQL_USERNAME:root}
          password: ${MYSQL_PASSWORD:123456}
```

Change the slave datasource to the same default target:

```yaml
          url: jdbc:mysql://${MYSQL_HOST:127.0.0.1}:${MYSQL_PORT:3306}/${MYSQL_DATABASE:ruoyi-vue-pro}?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&rewriteBatchedStatements=true&nullCatalogMeansCurrent=true
          username: ${MYSQL_USERNAME:root}
          password: ${MYSQL_PASSWORD:123456}
```

Change Redis to environment-variable defaults:

```yaml
    host: ${REDIS_HOST:127.0.0.1}
    port: ${REDIS_PORT:6379}
    database: ${REDIS_DATABASE:0}
    password: ${REDIS_PASSWORD:}
```

- [ ] **Step 4: Re-run the focused environment test**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
node tests\tutor-local-p0-env.test.cjs
```

Expected: exit code `0`.

### Task 3: Verify Static Regression Suite

**Files:**
- No production edits expected.

- [ ] **Step 1: Run all mobile tutor source checks**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
npm test
```

Expected: exit code `0`. If a test fails, read the named test and fix only the behavior related to local P0 flow or record it as unrelated if it predates the work.

- [ ] **Step 2: Check git diffs stay scoped**

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

- [ ] **Step 1: Compile the tutor-backed server surface**

Run:

```powershell
cd D:\work\jiajiao\zfwl
mvn -pl yudao-server -am -DskipTests compile
```

Expected: exit code `0`.

- [ ] **Step 2: Probe local dependency ports**

Run:

```powershell
Test-NetConnection 127.0.0.1 -Port 3306
Test-NetConnection 127.0.0.1 -Port 6379
```

Expected: both `TcpTestSucceeded : True`. If either is false, do not silently use online services; record the missing dependency and continue with compile/build verification.

- [ ] **Step 3: Start the backend when dependencies are reachable**

Run:

```powershell
cd D:\work\jiajiao\zfwl
mvn -pl yudao-server -am spring-boot:run
```

Expected: server listens on `http://localhost:48080`. Keep the process running only if startup succeeds and it is needed for browser smoke tests.

### Task 5: Mobile Build And H5 Visual Smoke

**Files:**
- Modify mobile Vue/CSS files only if visual smoke finds concrete P0 issues.

- [ ] **Step 1: Build H5**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
npm run build:h5
```

Expected: exit code `0`.

- [ ] **Step 2: Build WeChat mini program**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
npm run build:mp-weixin
```

Expected: exit code `0`.

- [ ] **Step 3: Start mobile H5 dev server**

Run:

```powershell
cd D:\work\jiajiao\zfwl-unapp
npm run dev:h5
```

Expected: H5 dev server opens or prints `http://localhost:3000`.

- [ ] **Step 4: Inspect mobile pages in browser**

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

- [ ] **Step 1: Start admin dev server**

Run:

```powershell
cd D:\work\jiajiao\zlwl-vue
pnpm dev
```

Expected: dev server opens or prints the configured local URL.

- [ ] **Step 2: Inspect required admin support pages**

With backend running, verify the admin can reach the tutor review/support surfaces needed for P0:

- Certification review.
- Publish review or post management.
- Point or member data correction.

Expected: pages load without route/menu crashes. API data may be empty if no local seed data exists.

### Task 7: Final Verification And Handoff

**Files:**
- No new edits expected.

- [ ] **Step 1: Run diff whitespace check**

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

- [ ] **Step 2: Summarize exact evidence**

Record:

- Config files changed.
- Commands run and exit codes.
- Local dependency status for MySQL and Redis.
- Local URLs started.
- Browser pages checked.
- Any blockers or external dependencies still required.
