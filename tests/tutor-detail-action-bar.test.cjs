const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const detailPage = fs.readFileSync(
  path.resolve(__dirname, '../pages/tutor/detail/index.vue'),
  'utf8',
);

assert.match(
  detailPage,
  /\.minor-btn\s*\{[^}]*flex-shrink:\s*0;/s,
  'favorite and match actions should keep their width in the flex action bar',
);

assert.match(
  detailPage,
  /\.minor-btn\s*\{[^}]*line-height:\s*1;/s,
  'favorite and match actions should override the native button line height',
);

assert.match(
  detailPage,
  /\.minor-btn text:last-child\s*\{[^}]*line-height:\s*28rpx;/s,
  'favorite and match labels should fit inside the fixed-height action buttons',
);

console.log('tutor detail action bar regression checks passed');
