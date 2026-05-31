const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publishPage = fs.readFileSync(path.join(root, 'pages/index/publish.vue'), 'utf8');
const squarePage = fs.readFileSync(path.join(root, 'pages/index/square.vue'), 'utf8');
const myPostsPage = fs.readFileSync(path.join(root, 'pages/tutor/my-posts/index.vue'), 'utf8');
const detailPage = fs.readFileSync(path.join(root, 'pages/tutor/detail/index.vue'), 'utf8');
const utils = fs.readFileSync(path.join(root, 'sheep/api/tutor/utils.js'), 'utf8');

assert.match(
  publishPage,
  /v-if="postType === 'parent' && form\.teachMode !== 2"[\s\S]*?<text>上课地址<\/text>[\s\S]*?v-model="form\.address"/,
  'parent publish should show address input for home-capable teaching modes',
);
assert.match(
  publishPage,
  /if \(form\.teachMode !== 2 && !form\.address\.trim\(\)\)[\s\S]*?请输入上课地址/,
  'parent publish should require address for home-capable teaching modes',
);
assert.match(
  publishPage,
  /address: form\.teachMode === 2 \? '' : form\.address\.trim\(\)/,
  'parent publish should submit address and clear it for online-only demands',
);
assert.match(utils, /address: item\.address \|\| ''/, 'demand normalization should retain address');
assert.match(squarePage, /item\.address/, 'square demand card should display public address');
assert.match(myPostsPage, /item\.address/, 'my demand posts should display public address');
assert.match(detailPage, /detail\.address/, 'demand detail should display public address');

console.log('tutor parent publish address regression checks passed');
