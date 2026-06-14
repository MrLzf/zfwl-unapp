const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const detailPage = fs.readFileSync(
  path.resolve(__dirname, '../pages/tutor/detail/index.vue'),
  'utf8',
);

assert.match(
  detailPage,
  /function syncNavigationTitle\(\)/,
  'detail page should centralize dynamic navigation title updates',
);
assert.match(
  detailPage,
  /uni\.setNavigationBarTitle\(\{\s*title:\s*isTutor\.value\s*\?\s*'老师详情'\s*:\s*'需求详情'/s,
  'detail page should set the H5/native title from the current target type',
);
assert.match(
  detailPage,
  /syncNavigationTitle\(\);\s*\n\s*loadDetail\(\);/,
  'detail page should update title before loading the target detail',
);

console.log('tutor detail dynamic title checks passed');
