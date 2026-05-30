const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const userStore = fs.readFileSync(path.join(root, 'sheep/store/user.js'), 'utf8');
const homePage = fs.readFileSync(path.join(root, 'pages/index/index.vue'), 'utf8');

assert.match(
  userStore,
  /if\s*\(profile\.cityCode\s*&&\s*!uni\.getStorageSync\('tutor_city'\)\)/,
  'profile refresh should not overwrite a manually selected tutor_city',
);

assert.match(
  homePage,
  /if\s*\(!state\.city\?\.code\s*&&\s*state\.profile\?\.cityCode\)/,
  'home page should keep the selected city when profile data is refreshed',
);

console.log('tutor city selection regression checks passed');
