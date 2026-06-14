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
    /AuthUtil\.weixinMiniAppLogin\(\s*e\.code,\s*codeResult\.code,\s*'default',\s*extra,\s*\)/s,
  );
});

test('auth modal initializes tutor profile after wechat login', () => {
  const source = read('sheep/components/s-auth-modal/s-auth-modal.vue');
  assert.match(source, /const tutorRole = computed\(\(\) => state\.tutorRole\)/);
  assert.match(
    source,
    /TutorProfileApi\.initProfile\(\{\s*role: tutorRole\.value,\s*cityCode: city\.code,/s,
  );
  assert.doesNotMatch(source, /UserApi\.updateUserSilent\(\{\s*avatar: DEFAULT_AVATAR\s*\}\)/);
  assert.match(source, /await completeWechatLogin\(city\)/);
});

test('wechat mobile login requires agreement and forwards tutor onboarding fields', () => {
  const source = read('sheep/components/s-auth-modal/s-auth-modal.vue');
  assert.match(source, /:disabled="state\.protocol !== true"/);
  assert.match(source, /if \(!checkAgreement\(\)\) \{\s*return;\s*\}/);
  assert.match(
    source,
    /mobileLogin\(e\.detail, \{\s*tutorRole: tutorRole\.value,\s*tutorCityCode: city\.code,/s,
  );
});

test('sms login does not require profile name or avatar update', () => {
  const source = read('sheep/components/s-auth-modal/components/sms-login.vue');
  assert.doesNotMatch(source, /placeholder="请输入您的姓名"/);
  assert.doesNotMatch(source, /请输入姓名/);
  assert.doesNotMatch(source, /state\.model\.name/);
  assert.doesNotMatch(source, /payload\.avatar = DEFAULT_AVATAR/);
  assert.doesNotMatch(source, /UserApi\.updateUserSilent/);
  assert.doesNotMatch(source, /await syncUserInfo\(\)/);
});

test('wechat authorization form falls back to the default avatar', () => {
  const source = read('sheep/components/s-auth-modal/components/mp-authorization.vue');
  assert.match(source, /const DEFAULT_AVATAR = '\/static\/data-empty\.png'/);
  assert.match(source, /avatar: userInfo\.value\.avatar \|\| DEFAULT_AVATAR/);
  assert.doesNotMatch(source, /请选择头像/);
  assert.match(source, /avatar: state\.model\.avatar \|\| DEFAULT_AVATAR/);
});
