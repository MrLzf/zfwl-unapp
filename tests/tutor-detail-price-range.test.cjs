const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const utils = fs.readFileSync(path.join(root, 'sheep/api/tutor/utils.js'), 'utf8');
const detailPage = fs.readFileSync(path.join(root, 'pages/tutor/detail/index.vue'), 'utf8');

assert.match(
  utils,
  /export function formatPriceRange\(min, max, fallback\)/,
  'shared utils should expose a price-range formatter',
);
assert.match(
  utils,
  /return `¥\$\{min\}-\$\{max\}`;/,
  'formatter should render different values as a range',
);
assert.match(utils, /return '价格面议';/, 'formatter should handle missing prices');

assert.match(detailPage, /formatPriceRange,/, 'detail page should import the shared formatter');
assert.match(
  detailPage,
  /const priceText = computed\(\(\) =>/,
  'detail page should compute a price label',
);
['budgetMin', 'budgetMax', 'hourlyPriceMin', 'hourlyPriceMax'].forEach((field) => {
  assert.match(
    detailPage,
    new RegExp(`detail\\.value\\.${field}`),
    `detail page should use ${field}`,
  );
});
assert.match(
  detailPage,
  /\{\{ priceText \}\}/,
  'detail page should render the formatted price label',
);

console.log('tutor detail price range regression checks passed');
