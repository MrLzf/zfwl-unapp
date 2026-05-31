const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publishPage = fs.readFileSync(path.join(root, 'pages/index/publish.vue'), 'utf8');

assert.match(
  publishPage,
  /<button\s+v-if="!isTeacher"\s+class="type-btn ss-reset-button"\s+:class="\{ active: postType === 'parent' \}"/s,
  'parent demand tab should only render for parent users',
);
assert.match(
  publishPage,
  /<button\s+v-if="isTeacher"\s+class="type-btn ss-reset-button"\s+:class="\{ active: postType === 'teacher' \}"/s,
  'teacher resume tab should only render for teacher users',
);
assert.doesNotMatch(
  publishPage,
  /:disabled="!?isTeacher"/,
  'role-specific publish tabs should not render disabled alternatives',
);

console.log('tutor publish role switch regression checks passed');
