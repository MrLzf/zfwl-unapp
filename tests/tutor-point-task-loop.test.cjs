const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scorePage = fs.readFileSync(path.join(root, 'pages/user/wallet/score.vue'), 'utf8');
const pointApi = fs.readFileSync(path.join(root, 'sheep/api/tutor/point.js'), 'utf8');

assert.match(scorePage, /SignInApi/, 'score page should import member sign-in API');
assert.match(scorePage, /TutorPointApi/, 'score page should import tutor point API');
assert.match(scorePage, /做任务赚积分/, 'score page should render point tasks');
assert.match(
  scorePage,
  /\{\{\s*task\.description\s*\}\}/,
  'score page should render task descriptions',
);
assert.match(
  pointApi,
  /url:\s*'\/tutor\/points\/tasks'/,
  'task API should load tutor task summary',
);
assert.match(
  scorePage,
  /SignInApi\.createSignInRecord\(\)/,
  'sign-in task should call member sign-in API',
);
assert.match(scorePage, /userStore\.getInfo\(\)/, 'successful sign-in should refresh user info');
assert.match(scorePage, /getTaskList\(\)/, 'successful sign-in should refresh point tasks');
assert.match(scorePage, /getLogList\(true\)/, 'successful sign-in should refresh point records');
assert.match(
  scorePage,
  /uni\.navigateTo\(\{\s*url:\s*task\.path\s*\}\)/,
  'navigate action should use the task path returned by backend',
);
assert.match(
  scorePage,
  /task\.type\s*===\s*'five_star_review'/,
  'five-star review task should remain navigable after prior rewards',
);
assert.match(
  scorePage,
  /task\.point\s*==\s*null\s*\?\s*'按签到规则奖励'/,
  'tasks without a fixed point value should render a clear reward description',
);
assert.match(scorePage, /onShow/, 'score page should refresh when returning from task pages');
assert.match(
  scorePage,
  /await\s+userStore\.getInfo\(\)[\s\S]*await\s+getTaskList\(\)[\s\S]*await\s+getLogList\(true\)/,
  'score page refresh should reload user info, tasks, and point records',
);
assert.match(
  scorePage,
  /onShow\(\(\)\s*=>\s*\{[\s\S]*refreshScorePage\(\)/,
  'score page should refresh its data on show',
);

console.log('tutor point task loop regression checks passed');
