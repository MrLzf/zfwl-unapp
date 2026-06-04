const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const mobileRoot = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(mobileRoot, file), 'utf8');

const utils = read('sheep/api/tutor/utils.js');
const square = read('pages/index/square.vue');
const messageHome = read('pages/index/message.vue');
const messageList = read('pages/tutor/messages/index.vue');
const reviews = read('pages/tutor/reviews/index.vue');
const contacts = read('pages/tutor/contacts/index.vue');
const history = read('pages/tutor/history/index.vue');
const favorites = read('pages/tutor/favorites/index.vue');
const score = read('pages/user/wallet/score.vue');
const balance = read('pages/user/wallet/balance.vue');
const localState = read('sheep/api/tutor/local-state.js');

assert.match(utils, /import dayjs from 'dayjs';/);
assert.match(utils, /export function formatDateTime\(value, fallback = ''\)/);
assert.match(utils, /\/\^\\d\{13\}\$\/\.test\(raw\)[\s\S]*dayjs\(Number\(raw\)\)\.format\('YYYY-MM-DD HH:mm:ss'\)/);
assert.match(utils, /\/\^\\d\{10\}\$\/\.test\(raw\)[\s\S]*dayjs\(Number\(raw\) \* 1000\)\.format\('YYYY-MM-DD HH:mm:ss'\)/);

assert.match(square, /formatDateTime,\s*[\s\S]*normalizeDemand/);
assert.match(square, /\{\{ formatDateTime\(item\.createdAt\) \}\}/);

assert.match(messageHome, /formatDateTime/);
assert.match(messageHome, /\{\{ formatDateTime\(item\.latestTime\) \}\}/);

assert.match(messageList, /formatDateTime/);
assert.match(messageList, /\{\{ formatDateTime\(item\.createTime \|\| item\.time\) \}\}/);

assert.match(reviews, /formatDate\(item\.createTime\) \|\| '刚刚'/);
assert.match(reviews, /function formatDate\(value\) \{\s*return formatDateTime\(value\);\s*\}/);

assert.match(contacts, /formatDate\(item\.createTime\) \|\| '刚刚'/);
assert.match(contacts, /return formatDateTime\(value, '30天内'\);/);
assert.match(contacts, /const formatted = formatDateTime\(value\);[\s\S]*return formatted \? dayjs\(formatted\)\.isBefore\(dayjs\(\)\) : false;/);

assert.match(history, /\{\{ formatDateTime\(item\.viewedAt \|\| item\.createTime\) \}\}/);
assert.match(favorites, /return formatDateTime\(item\.favoriteAt \|\| item\.createTime, '已收藏'\);/);

assert.match(score, /return formatDateTime\(value\);/);
assert.match(balance, /return formatDateTime\(time\);/);

assert.match(localState, /viewedAt: dayjs\(\)\.format\('YYYY-MM-DD HH:mm:ss'\)/);
assert.match(localState, /favoriteAt: dayjs\(\)\.format\('YYYY-MM-DD HH:mm:ss'\)/);

console.log('tutor timestamp formatting regression checks passed');
