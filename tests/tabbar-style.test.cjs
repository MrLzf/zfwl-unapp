const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const tabbarSource = fs.readFileSync(
  path.resolve(__dirname, '../sheep/components/s-tabbar/s-tabbar.vue'),
  'utf8',
);

test('tabbar keeps labels aligned while lifting the publish icon', () => {
  assert.match(
    tabbarSource,
    /\.tabbar-item\s*\{[\s\S]*width:\s*100%;[\s\S]*grid-template-columns:\s*1fr;[\s\S]*grid-template-rows:\s*80rpx 28rpx;[\s\S]*justify-items:\s*center;/,
  );
  assert.match(tabbarSource, /\.center-bubble\s*\{[\s\S]*transform:\s*translateY\(-28rpx\);/);
});
