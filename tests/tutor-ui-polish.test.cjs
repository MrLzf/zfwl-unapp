const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const publishPage = read('pages/index/publish.vue');
const messagePage = read('pages/index/message.vue');
const userPage = read('pages/index/user.vue');
const userInfoPage = read('pages/user/info.vue');

assert.match(
  publishPage,
  /\.publish-shell\s*\{[\s\S]*padding:[^;]*calc\(220rpx \+ env\(safe-area-inset-bottom\)\)/,
  'publish page should reserve enough bottom padding above the custom tabbar',
);
assert.match(
  publishPage,
  /\.picker-value\s*\{[\s\S]*overflow:\s*hidden;[\s\S]*text-overflow:\s*ellipsis;[\s\S]*white-space:\s*nowrap;/,
  'publish picker text should stay on one line without clipped characters',
);
assert.match(
  publishPage,
  /\.picker-value\s*\{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;/,
  'publish picker text should be vertically centered for mini program rendering',
);

assert.match(
  messagePage,
  /const loading = ref\(false\);/,
  'message center should expose loading state while fetching summaries',
);
assert.match(
  messagePage,
  /class="message-card"[\s\S]*:class="\{ loading: navigatingCategory === item\.category \}"/,
  'message cards should show feedback after tapping a category',
);

assert.match(
  userPage,
  /\.nickname\s*\{[\s\S]*flex-wrap:\s*wrap;/,
  'user hero nickname and role badge should wrap instead of crowding',
);
assert.match(
  userPage,
  /\.mobile,\s*\n\s*\.cert-line\s*\{[\s\S]*word-break:\s*break-all;/,
  'user hero mobile and certification text should not overflow',
);

assert.match(
  userInfoPage,
  /from '@\/sheep\/components\/s-uploader\/choose-and-upload-file\.js';/,
  'avatar upload helper import should include the .js extension for mini program analysis',
);

console.log('tutor ui polish regression checks passed');
