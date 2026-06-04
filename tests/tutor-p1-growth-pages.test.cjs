const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('p1 tutor api exposes recharge invite services vip subscribe customer and complaint contracts', () => {
  const source = read('sheep/api/tutor/p1.js');

  [
    '/tutor/point-packages',
    '/tutor/point-recharge/orders',
    '/tutor/invite/summary',
    '/tutor/value-services',
    '/tutor/value-services/orders',
    '/tutor/vip/products',
    '/tutor/vip/orders',
    '/tutor/subscribe/settings',
    '/tutor/customer-service/sessions',
    '/tutor/complaints',
  ].forEach((url) => assert.match(source, new RegExp(url.replace(/[/?]/g, '\\$&'))));
});

test('pages.json registers app-101 to app-107 pages', () => {
  const source = read('pages.json');

  [
    'recharge/index',
    'invite/index',
    'value-service/index',
    'vip/index',
    'subscribe/index',
    'customer-service/index',
    'complaint/index',
  ].forEach((page) => assert.match(source, new RegExp(`"path":\\s*"${page}"`)));
});

test('detail and my posts expose complaint and value service purchase entrances', () => {
  const detail = read('pages/tutor/detail/index.vue');
  const myPosts = read('pages/tutor/my-posts/index.vue');

  assert.match(detail, /goComplaint\(\)/);
  assert.match(detail, /goValueService\(\)/);
  assert.match(detail, /\/pages\/tutor\/complaint\/index\?targetType=/);
  assert.match(detail, /\/pages\/tutor\/value-service\/index\?targetType=/);
  assert.match(myPosts, /buyValueService\(item\)/);
  assert.match(myPosts, /\/pages\/tutor\/value-service\/index\?targetType=/);
});

test('user center exposes recharge invite vip subscribe and customer service entries', () => {
  const source = read('pages/index/user.vue');

  [
    '/pages/tutor/recharge/index',
    '/pages/tutor/invite/index',
    '/pages/tutor/vip/index',
    '/pages/tutor/subscribe/index',
    '/pages/tutor/customer-service/index',
  ].forEach((url) => assert.match(source, new RegExp(url.replace(/[/?]/g, '\\$&'))));
});
