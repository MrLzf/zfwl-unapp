const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const api = fs.readFileSync(path.join(root, 'sheep/api/tutor/message.js'), 'utf8');
const summaryPage = fs.readFileSync(path.join(root, 'pages/index/message.vue'), 'utf8');
const categoryPage = fs.readFileSync(path.join(root, 'pages/tutor/messages/index.vue'), 'utf8');
const pages = fs.readFileSync(path.join(root, 'pages.json'), 'utf8');

[
  '/tutor/messages/summary',
  '/tutor/messages/page',
  '/tutor/messages/read?id=',
  '/tutor/messages/read-all',
].forEach((endpoint) => {
  assert.match(api, new RegExp(endpoint.replace(/[?]/g, '\\?')), `api should include ${endpoint}`);
});

['audit', 'contact', 'point'].forEach((category) => {
  assert.match(
    summaryPage,
    new RegExp(`category: '${category}'`),
    `summary should include ${category}`,
  );
});

assert.match(summaryPage, /markAllRead/, 'summary should support global read-all');
assert.match(summaryPage, /retry/, 'summary should expose retry');
assert.match(summaryPage, /unread-count/, 'summary should render unread badges');
assert.match(summaryPage, /latestContent/, 'summary should render latest content');
assert.match(summaryPage, /latestTime/, 'summary should render latest time');

assert.match(categoryPage, /onReachBottom/, 'category page should load more at page bottom');
assert.match(categoryPage, /markCategoryRead/, 'category page should support category read-all');
assert.match(categoryPage, /item\.read \? '' : 'unread'/, 'category page should bind unread items');
assert.match(categoryPage, /\.message-card\.unread/, 'category page should style unread items');
assert.match(
  categoryPage,
  /markRead\(item\.id\)\.catch/,
  'message click read should be non-blocking',
);

[
  "certification_detail: '/pages/tutor/certification/index'",
  "my_posts: '/pages/tutor/my-posts/index'",
  "contact_records: '/pages/tutor/contacts/index'",
  "point_records: '/pages/user/wallet/score'",
].forEach((mapping) => {
  assert.match(categoryPage, new RegExp(mapping), `category page should map ${mapping}`);
});

assert.match(
  pages,
  /"path": "messages\/index"/,
  'pages.json should register message category page',
);

console.log('tutor message center loop regression checks passed');
