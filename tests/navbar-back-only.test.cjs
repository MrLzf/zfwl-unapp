const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const mobileRoot = path.resolve(__dirname, '..');
const navbar = fs.readFileSync(path.join(mobileRoot, 'sheep/ui/su-inner-navbar/su-inner-navbar.vue'), 'utf8');

assert.match(navbar, /class="icon-box ss-flex back-only"/);
assert.ok(!navbar.includes('class="line"'), 'inner navbar should not render capsule separator');
assert.ok(!navbar.includes('icon-button-right'), 'inner navbar should not render right menu button');
assert.ok(!navbar.includes('sicon-more'), 'inner navbar should not render more/menu icon');
assert.ok(!navbar.includes('showMenuTools'), 'inner navbar should not open quick menu');
assert.match(navbar, /width: 68rpx;/);
assert.match(navbar, /border-radius: 34rpx;/);
assert.match(navbar, /\.icon-button \{\s*width: 68rpx;/);

console.log('navbar back only regression checks passed');
