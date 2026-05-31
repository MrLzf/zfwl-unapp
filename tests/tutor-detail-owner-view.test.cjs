const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const detailPage = fs.readFileSync(path.join(root, 'pages/tutor/detail/index.vue'), 'utf8');

assert.match(
  detailPage,
  /const isOwner = computed\(/,
  'detail page should compute whether the current user owns the post',
);
assert.match(
  detailPage,
  /String\(detail\.value\.userId\) === String\(userStore\.tutorProfile\?\.userId\)/,
  'owner detection should compare the post owner with the current tutor profile',
);
assert.match(
  detailPage,
  /v-if="!isOwner && !state\.errorMsg"\s+class="action-bar"/,
  'owner detail should hide the bottom interaction bar',
);
assert.match(
  detailPage,
  /v-if="!isOwner && !state\.contactUnlocked"\s+class="contact-tip"/,
  'owner detail should hide the masked-contact explanation',
);
assert.match(
  detailPage,
  /\{\{ isOwner \? '本人发布' : state\.contactUnlocked \? '已解锁' : '默认脱敏' \}\}/,
  'owner detail should label full contact details clearly',
);

console.log('tutor detail owner-view regression checks passed');
