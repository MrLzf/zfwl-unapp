const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const historyPage = fs.readFileSync(path.join(root, 'pages/tutor/history/index.vue'), 'utf8');
const interactionApi = fs.readFileSync(path.join(root, 'sheep/api/tutor/interaction.js'), 'utf8');

assert.match(interactionApi, /removeBrowseHistory:\s*\(id\)\s*=>/);
assert.match(interactionApi, /url:\s*`\/tutor\/browse-history\/\$\{id\}`/);
assert.match(interactionApi, /clearBrowseHistory:\s*\(\)\s*=>/);
assert.match(interactionApi, /url:\s*'\/tutor\/browse-history\/my'/);
assert.match(historyPage, /state\.items = remote;/);
assert.doesNotMatch(historyPage, /new Map\(\[\.\.\.remote,\s*\.\.\.localItems\]/);
assert.match(historyPage, /historyId:\s*item\.id,/);
assert.match(historyPage, /await TutorInteractionApi\.removeBrowseHistory\(item\.historyId\)/);
assert.match(historyPage, /await TutorInteractionApi\.clearBrowseHistory\(\)/);
assert.match(historyPage, /清空后浏览记录将不可恢复。/);

console.log('tutor history sync regression checks passed');
