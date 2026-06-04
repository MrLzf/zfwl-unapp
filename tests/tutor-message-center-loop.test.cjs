const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const api = fs.readFileSync(path.join(root, 'sheep/api/tutor/message.js'), 'utf8');
const summaryPage = fs.readFileSync(path.join(root, 'pages/index/message.vue'), 'utf8');
const categoryPage = fs.readFileSync(path.join(root, 'pages/tutor/messages/index.vue'), 'utf8');
const tabbar = fs.readFileSync(path.join(root, 'sheep/components/s-tabbar/s-tabbar.vue'), 'utf8');
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
assert.match(summaryPage, /\.message-title-row\s*{[^}]*min-width: 0/s, 'summary title row should shrink inside card');
assert.match(
  summaryPage,
  /\.message-title\s*{[^}]*overflow: hidden[^}]*text-overflow: ellipsis[^}]*white-space: nowrap/s,
  'summary title should ellipsize when timestamp is long',
);
assert.match(
  summaryPage,
  /\.latest-time\s*{[^}]*flex-shrink: 0/s,
  'summary timestamp should keep its width without deforming content',
);
assert.match(summaryPage, /result\.data\?\.categories/, 'summary should read backend categories');
assert.match(summaryPage, /result\?\.code !== 0/, 'summary should guard failed responses');
assert.match(tabbar, /TutorMessageApi\.getSummary/, 'tabbar should refresh total unread count');
assert.match(
  tabbar,
  /result\.data\?\.totalUnread/,
  'tabbar should read backend total unread count',
);
assert.match(tabbar, /class="tabbar-badge"/, 'tabbar should render the message unread badge');

assert.match(categoryPage, /onReachBottom/, 'category page should load more at page bottom');
assert.match(categoryPage, /markCategoryRead/, 'category page should support category read-all');
assert.match(
  categoryPage,
  /item\.readStatus \? '' : 'unread'/,
  'category page should bind backend read status',
);
assert.match(categoryPage, /\.message-card\.unread/, 'category page should style unread items');
assert.match(
  categoryPage,
  /markRead\(item\.id\)\.then/,
  'message click read should be non-blocking',
);
assert.match(categoryPage, /actionRoutes\[item\.action\]/, 'navigation should read backend action');
assert.match(categoryPage, /result\?\.code !== 0/, 'category page should guard failed responses');

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
