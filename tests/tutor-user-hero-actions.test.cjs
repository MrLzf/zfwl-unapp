const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const userPage = fs.readFileSync(path.join(root, 'pages/index/user.vue'), 'utf8');

assert.doesNotMatch(userPage, /class="hero-actions"/);
assert.doesNotMatch(userPage, /class="hero-icon ss-reset-button"/);
assert.match(
  userPage,
  /<view class="user-hero" :class="\{ teacher: isTeacher, tappable: !isLogin \}" @tap="handleHeroTap">/,
  'logged-out user hero should be tappable for auth',
);
assert.match(
  userPage,
  /function handleHeroTap\(\) \{[\s\S]*if \(!isLogin\.value\) \{[\s\S]*showAuthModal\(\);[\s\S]*\}/,
  'user hero tap should only open auth before login',
);
assert.match(userPage, /label: '家教档案'[\s\S]*path: '\/pages\/tutor\/identity\/index'/);

console.log('tutor user hero actions regression checks passed');
