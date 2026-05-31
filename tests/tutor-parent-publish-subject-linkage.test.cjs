const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const utils = fs.readFileSync(path.join(root, 'sheep/api/tutor/utils.js'), 'utf8');
const publishPage = fs.readFileSync(path.join(root, 'pages/index/publish.vue'), 'utf8');

assert.match(
  utils,
  /export const tutorGradeOptions = \['小学', '初中', '高中', '其他'\]/,
  'grade options should replace 成人 with 其他',
);
assert.match(
  utils,
  /export const tutorSubjectOptionsByGrade = \{/,
  'shared utils should expose grade-linked subject options',
);
['小学', '初中', '高中', '其他'].forEach((grade) => {
  assert.match(
    utils,
    new RegExp(`${grade}:\\s*\\[[^\\]]*'其他'[^\\]]*\\]`),
    `${grade} subjects should include 其他 as a fallback`,
  );
});
assert.match(
  publishPage,
  /<picker\s+:range="subjectOptions"\s+@change="onSubjectChange">/,
  'parent subject field should use a picker',
);
assert.match(
  publishPage,
  /const subjectOptions = computed\(\(\) => tutorSubjectOptionsByGrade\[form\.grade\] \|\| \[\]\)/,
  'subject picker options should follow the selected grade',
);
assert.match(
  publishPage,
  /if\s*\(!subjectOptions\.value\.includes\(form\.subjects\)\)\s*\{\s*form\.subjects = '';/,
  'changing grade should clear a subject that is invalid for the new grade',
);

console.log('tutor parent publish subject linkage regression checks passed');
