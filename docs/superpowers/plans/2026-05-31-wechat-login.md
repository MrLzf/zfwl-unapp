# WeChat Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add WeChat Mini Program quick login and silent bound-account login while preserving tutor profile onboarding.

**Architecture:** Keep the existing WeChat provider as the API boundary and add tutor onboarding fields to mobile-number login. Move shared post-login tutor profile initialization into the auth modal, where SMS and WeChat identity selection already live. Reuse the existing `mpAuthorization` modal when nickname or avatar is incomplete.

**Tech Stack:** uni-app Vue 3, JavaScript, Pinia, Node.js built-in test runner

---

## File Structure

- Create: `tests/tutor-wechat-login.test.cjs`
  - Static contract tests for WeChat provider forwarding and auth-modal onboarding orchestration.
- Modify: `sheep/platform/provider/wechat/miniProgram.js`
  - Forward tutor onboarding fields during WeChat mobile-number quick login.
- Modify: `sheep/components/s-auth-modal/components/sms-login.vue`
  - Emit tutor identity changes to the parent modal.
- Modify: `sheep/components/s-auth-modal/s-auth-modal.vue`
  - Own selected identity, city resolution, tutor profile initialization, and shared WeChat post-login handling.

### Task 1: Add Failing WeChat Login Contract Tests

**Files:**

- Create: `tests/tutor-wechat-login.test.cjs`

- [ ] **Step 1: Write failing static contract tests**

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('wechat mobile login forwards tutor onboarding fields', () => {
  const source = read('sheep/platform/provider/wechat/miniProgram.js');
  assert.match(source, /const mobileLogin = async \(e, extra = \{\}\) =>/);
  assert.match(
    source,
    /AuthUtil\.weixinMiniAppLogin\(e\.code, codeResult\.code, 'default', extra\)/,
  );
});

test('auth modal initializes tutor profile after wechat login', () => {
  const source = read('sheep/components/s-auth-modal/s-auth-modal.vue');
  assert.match(source, /const tutorRole = computed\(\(\) => state\.tutorRole\)/);
  assert.match(
    source,
    /TutorProfileApi\.initProfile\(\{\s*role: tutorRole\.value,\s*cityCode: city\.code,/s,
  );
  assert.match(source, /await completeWechatLogin\(\)/);
});

test('wechat mobile login requires agreement and forwards tutor onboarding fields', () => {
  const source = read('sheep/components/s-auth-modal/s-auth-modal.vue');
  assert.match(source, /if \(!checkAgreement\(\)\) \{\s*return;\s*\}/);
  assert.match(
    source,
    /mobileLogin\(e\.detail, \{\s*tutorRole: tutorRole\.value,\s*tutorCityCode: city\.code,/s,
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/tutor-wechat-login.test.cjs`

Expected: FAIL because the provider does not accept `extra`, and the auth modal lacks tutor onboarding orchestration.

### Task 2: Forward Tutor Fields Through the WeChat Provider

**Files:**

- Modify: `sheep/platform/provider/wechat/miniProgram.js`
- Test: `tests/tutor-wechat-login.test.cjs`

- [ ] **Step 1: Extend mobile login signature and API forwarding**

```js
const mobileLogin = async (e, extra = {}) => {
  // existing authorization and uni.login checks remain unchanged
  const loginResult = await AuthUtil.weixinMiniAppLogin(e.code, codeResult.code, 'default', extra);
  // existing success handling remains unchanged
};
```

- [ ] **Step 2: Run the focused provider contract**

Run: `node --test tests/tutor-wechat-login.test.cjs`

Expected: Provider forwarding assertion passes; auth-modal assertions still fail.

### Task 3: Share Tutor Identity With the Auth Modal

**Files:**

- Modify: `sheep/components/s-auth-modal/components/sms-login.vue`
- Modify: `sheep/components/s-auth-modal/s-auth-modal.vue`
- Test: `tests/tutor-wechat-login.test.cjs`

- [ ] **Step 1: Add identity change event to SMS form**

```js
const emits = defineEmits(['onConfirm', 'roleChange']);

function selectRole(role) {
  state.model.role = role;
  emits('roleChange', role);
}
```

Update each role card:

```vue
@tap="selectRole(role.value)"
```

- [ ] **Step 2: Store identity in the parent auth modal**

```vue
<sms-login
  v-if="authType === 'smsLogin'"
  :agreeStatus="state.protocol"
  @onConfirm="onConfirm"
  @roleChange="state.tutorRole = $event"
/>
```

```js
const state = reactive({
  protocol: null,
  tutorRole: 1,
});

const tutorRole = computed(() => state.tutorRole);
```

- [ ] **Step 3: Run the focused contract**

Run: `node --test tests/tutor-wechat-login.test.cjs`

Expected: identity assertion passes; post-login assertions remain failing until Task 4.

### Task 4: Add Shared WeChat Tutor Onboarding

**Files:**

- Modify: `sheep/components/s-auth-modal/s-auth-modal.vue`
- Test: `tests/tutor-wechat-login.test.cjs`

- [ ] **Step 1: Add agreement validation helper**

```js
function checkAgreement() {
  if (state.protocol === true) {
    return true;
  }
  onConfirm(true);
  sheep.$helper.toast(
    state.protocol === false ? '您已拒绝协议，无法继续登录' : '请选择是否同意协议',
  );
  return false;
}
```

- [ ] **Step 2: Add city resolution and tutor profile initialization**

```js
async function resolveCity() {
  const cachedCity = uni.getStorageSync('tutor_city');
  if (cachedCity?.code) return cachedCity;
  const { code, data } = await TutorCityApi.getCityList();
  if (code !== 0) return null;
  const cities = data || [];
  const city =
    cities.find((item) => item.opened && item.name === '北京市') ||
    cities.find((item) => item.opened && item.hot) ||
    cities.find((item) => item.opened);
  if (city) uni.setStorageSync('tutor_city', city);
  return city || null;
}

async function ensureTutorProfile(city) {
  const userStore = sheep.$store('user');
  const profile = await userStore.getTutorProfile();
  if (profile?.role) return true;
  const initRes = await TutorProfileApi.initProfile({
    role: tutorRole.value,
    cityCode: city.code,
  });
  if (initRes.code !== 0) return false;
  userStore.setTutorProfile(initRes.data);
  return true;
}
```

- [ ] **Step 3: Add shared post-login completion**

```js
async function completeWechatLogin(city) {
  const userStore = sheep.$store('user');
  const userInfo = await userStore.getInfo();
  if (!(await ensureTutorProfile(city))) return;
  closeAuthModal();
  if (!userInfo?.avatar || !userInfo?.nickname) {
    showAuthModal('mpAuthorization');
  }
}
```

- [ ] **Step 4: Update silent WeChat login**

Resolve the city before calling the provider, then call:

```js
await completeWechatLogin(city);
```

Show `微信登录失败，请稍后重试` when provider login returns false.

- [ ] **Step 5: Update mobile-number quick login**

Validate agreement, resolve the city, and call:

```js
const result = await sheep.$platform.useProvider().mobileLogin(e.detail, {
  tutorRole: tutorRole.value,
  tutorCityCode: city.code,
});
```

On success call:

```js
await completeWechatLogin(city);
```

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/tutor-wechat-login.test.cjs`

Expected: PASS.

### Task 5: Verify Formatting and Regression Coverage

**Files:**

- Verify all touched files

- [ ] **Step 1: Run formatter for touched production files**

Run:

```powershell
npx prettier --write sheep/components/s-auth-modal/s-auth-modal.vue sheep/components/s-auth-modal/components/sms-login.vue sheep/platform/provider/wechat/miniProgram.js tests/tutor-wechat-login.test.cjs
```

Expected: exit code `0`.

- [ ] **Step 2: Run all Node contract tests**

Run: `node --test tests/*.test.cjs`

Expected: all tests PASS.

- [ ] **Step 3: Check whitespace and working tree**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; only planned files are modified or added.

- [ ] **Step 4: Review requirements**

Confirm:

- SMS login remains available.
- WeChat quick login forwards tutor identity and city.
- Silent WeChat login initializes missing tutor profile.
- Missing avatar or nickname opens `mpAuthorization`.
- Rejected authorization and failed login produce clear messages.
