const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const homePage = fs.readFileSync(path.resolve(__dirname, '../pages/index/index.vue'), 'utf8');

assert.match(
  homePage,
  /const quickActions = computed\(\(\) => \{[\s\S]*if \(!userStore\.isLogin \|\| !state\.profile\?\.role\)/,
  'home quick actions should branch for guests and users without a role',
);
assert.match(
  homePage,
  /if \(isTeacher\.value\) \{[\s\S]*label: '找家长'[\s\S]*label: '发布简历'[\s\S]*label: '认证'/,
  'teacher home quick actions should show teacher-specific entries',
);
assert.match(
  homePage,
  /return \[[\s\S]*label: '找老师'[\s\S]*label: '发布需求'[\s\S]*publishRole: 'parent'/,
  'parent home quick actions should show parent-specific entries',
);
assert.doesNotMatch(
  homePage,
  /label: '找老师'[\s\S]*label: '找家长'[\s\S]*label: isTeacher\.value \? '发布简历' : '发布需求'/,
  'home quick actions should not render all role actions from one shared list',
);

console.log('tutor home role actions regression checks passed');
