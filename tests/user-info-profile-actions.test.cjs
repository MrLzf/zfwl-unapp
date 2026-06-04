const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const mobileRoot = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(mobileRoot, file), 'utf8');

const infoPage = read('pages/user/info.vue');
const changePassword = read('sheep/components/s-auth-modal/components/change-password.vue');

assert.ok(!infoPage.includes('name="mobile" label="手机号"'), 'profile page should not show mobile edit row');
assert.ok(!infoPage.includes('function onChangeMobile'), 'profile page should not keep mobile edit handler');
assert.ok(!infoPage.includes("showAuthModal('changeMobile')"), 'profile page should not open change mobile modal');

assert.match(infoPage, /const userStore = sheep\.\$store\('user'\);/);
assert.match(infoPage, /async function persistAvatar\(avatar\)/);
assert.match(infoPage, /await UserApi\.updateUserSilent\(\{ avatar \}\);/);
assert.match(infoPage, /userStore\.userInfo = \{ \.\.\.userStore\.userInfo, avatar \};/);
assert.ok(!infoPage.includes('debugger;'), 'avatar choose handler should not contain debugger');

assert.match(infoPage, /:class="\{ active: Number\(item\.value\) === Number\(state\.model\?\.sex\) \}"/);
assert.match(infoPage, /async function persistGender\(sex\)/);
assert.match(infoPage, /await UserApi\.updateUserSilent\(\{ sex \}\);/);
assert.match(infoPage, /userStore\.userInfo = \{ \.\.\.userStore\.userInfo, sex, gender: sex \};/);
assert.match(infoPage, /onShow\(\(\) => \{\s*getUserInfo\(\);\s*\}\);/);
assert.ok(!infoPage.includes('gender-check'), 'gender selection should not show a check mark');

assert.match(changePassword, /<uni-forms[^>]*class="auth-form"/);
assert.match(changePassword, /<uni-forms-item name="password" label="密码">/);
assert.match(changePassword, /getSmsTimer\('changePassword'\)/);
assert.match(changePassword, /<button\s+class="ss-reset-button auth-submit-btn"/);
assert.match(changePassword, />\s*确认修改\s*<\/button>/);

console.log('user info profile actions regression checks passed');
