const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const userPage = fs.readFileSync(path.resolve(__dirname, '../pages/index/user.vue'), 'utf8');

assert.match(userPage, /const menus = \[/);
assert.match(userPage, /if\s*\(isTeacher\.value\)\s*\{\s*menus\.splice\(/s);
assert.match(userPage, /badge:\s*`\$\{userInfo\.value\.point \|\| 0\}积分`/);
assert.doesNotMatch(userPage, /badge:\s*'\+50积分'/);

console.log('tutor user menu role regression checks passed');
