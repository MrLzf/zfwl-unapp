const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const pagesJson = read('pages.json');

[
  'pages/tutor/trial/index.vue',
  'pages/tutor/appointments/index.vue',
  'pages/tutor/escrow/index.vue',
].forEach((file) => assert.ok(exists(file), `${file} should exist for P2 scale operations`));

assert.ok(exists('sheep/api/tutor/p2.js'), 'P2 API wrapper should exist');

[
  'trial/index',
  'appointments/index',
  'escrow/index',
].forEach((page) => assert.ok(pagesJson.includes(page), `${page} should be registered in pages.json`));

const detailPage = read('pages/tutor/detail/index.vue');
assert.ok(detailPage.includes('/pages/tutor/trial/index'), 'detail page should expose trial booking entry');
assert.ok(detailPage.includes('teacherLevelName'), 'detail page should display teacher level');

const userPage = read('pages/index/user.vue');
assert.ok(userPage.includes('/pages/tutor/appointments/index'), 'user center should link appointments');
assert.ok(userPage.includes('/pages/tutor/escrow/index'), 'user center should link escrow orders');

const p2Api = read('sheep/api/tutor/p2.js');
[
  'createTrialAppointment',
  'getMyTrialAppointments',
  'confirmTrialAppointment',
  'createEscrowTrade',
  'confirmEscrowComplete',
  'applyEscrowRefund',
].forEach((name) => assert.ok(p2Api.includes(name), `${name} should be exported by P2 API`));

console.log('tutor P2 mobile scale-ops contract ok');
