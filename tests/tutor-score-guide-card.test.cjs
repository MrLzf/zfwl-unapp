const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scorePage = fs.readFileSync(path.join(root, 'pages/user/wallet/score.vue'), 'utf8');

assert.match(scorePage, /<view class="guide-title">积分获取方式<\/view>/);
assert.doesNotMatch(scorePage, /P0 获取方式/);
assert.match(
  scorePage,
  /\.guide-card\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1;/s,
  'floating guide card should render above the score header',
);

console.log('tutor score guide card regression checks passed');
