const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const detailPage = fs.readFileSync(
  path.resolve(__dirname, '../pages/tutor/detail/index.vue'),
  'utf8',
);

test('numeric server detail ids do not silently fall back to local contact and history state', () => {
  assert.match(detailPage, /const canUseLocalFallback = computed\(\(\) => !isNumericId\(state\.id\)\);/);
  assert.match(detailPage, /if \(!loaded && canUseLocalFallback\.value\)\s*\{/);
  assert.match(detailPage, /if \(canUseLocalFallback\.value\)\s*\{\s*recordLocalHistory\(loaded\);/s);
  assert.match(detailPage, /else if \(canUseLocalFallback\.value\)\s*\{\s*result = viewLocalContact\(state\.detail\);/s);
});

test('contact success toast uses the point cost returned by the backend', () => {
  assert.match(detailPage, /function formatPointCostToast\(contact\)/);
  assert.match(detailPage, /title: formatPointCostToast\(result\.data\),/);
  assert.doesNotMatch(detailPage, /已扣除 10 积分/);
});
