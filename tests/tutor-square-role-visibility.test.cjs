const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const squarePage = fs.readFileSync(path.join(root, 'pages/index/square.vue'), 'utf8');

assert.match(
  squarePage,
  /<view v-if="!isLogin" class="login-gate">[\s\S]*立即登录 \/ 注册[\s\S]*<\/view>/,
  'guests should only see the login gate',
);
assert.match(
  squarePage,
  /<template v-else-if="!profile\?\.role">[\s\S]*先选择身份[\s\S]*<\/template>/,
  'logged-in users without a tutor role should see the identity entry',
);
assert.match(
  squarePage,
  /const targetType = computed\(\(\) => \(isTeacher\.value \? 'req' : 'tutor'\)\)/,
  'square target type should be derived from the current tutor role',
);
assert.doesNotMatch(squarePage, /class="type-tabs"/, 'role-specific square should hide type tabs');
assert.doesNotMatch(
  squarePage,
  /displayItems\.value\.slice\(0, 5\)/,
  'guests should not receive a preview list',
);
assert.match(
  squarePage,
  /if \(!isLogin\.value \|\| !profile\.value\?\.role\) \{\s*return;\s*\}/,
  'square should not load market data for guests or users without a tutor role',
);
assert.match(
  squarePage,
  /<view class="top-bar" @tap="goCity">[\s\S]*<view class="title-line">[\s\S]*<text class="page-title">\{\{ pageTitle \}\}<\/text>[\s\S]*class="city-chip"/,
  'square title area should be the location switch entry',
);
assert.doesNotMatch(squarePage, /class="city-btn/);

console.log('tutor square role visibility regression checks passed');
