const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

test('package exposes repeatable tutor p0 seed and smoke commands', () => {
  const pkg = readJson('package.json');

  assert.equal(pkg.scripts['seed:p0'], 'node scripts/seed-tutor-p0.cjs');
  assert.equal(pkg.scripts['smoke:p0'], 'node scripts/smoke-tutor-p0.cjs');
  assert.equal(
    pkg.scripts['verify:p0'],
    'node scripts/smoke-tutor-p0.cjs && node scripts/seed-tutor-p0.cjs && node scripts/smoke-tutor-p0.cjs',
  );
});

test('p0 seed script drives the real local app and admin APIs', () => {
  const source = read('scripts/seed-tutor-p0.cjs');

  assert.match(source, /\/app-api/);
  assert.match(source, /\/admin-api/);
  assert.match(source, /\/member\/auth\/send-sms-code/);
  assert.match(source, /\/member\/auth\/sms-login/);
  assert.match(source, /\/tutor\/profile\/init/);
  assert.match(source, /\/tutor\/certification\/submit/);
  assert.match(source, /\/tutor\/demands/);
  assert.match(source, /\/tutor\/resumes/);
  assert.match(source, /\/tutor\/certification\/audit/);
  assert.match(source, /\/tutor\/\$\{kind\}\/audit/);
  assert.match(source, /auditPublish\('demand'/);
  assert.match(source, /auditPublish\('resume'/);
  assert.match(source, /\/tutor\/points\/adjust/);
  assert.match(source, /TUTOR_P0_RUN_ID/);
});

test('p0 smoke script checks local services and tutor support APIs', () => {
  const source = read('scripts/smoke-tutor-p0.cjs');

  assert.match(source, /http:\/\/localhost:48080/);
  assert.match(source, /http:\/\/localhost:3000/);
  assert.match(source, /http:\/\/localhost\//);
  assert.match(source, /\/app-api/);
  assert.match(source, /\/admin-api/);
  assert.match(source, /\/member\/auth\/send-sms-code/);
  assert.match(source, /\/member\/auth\/sms-login/);
  assert.match(source, /\/tutor\/profile\/init/);
  assert.match(source, /\/tutor\/square\/demands/);
  assert.match(source, /\/tutor\/square\/resumes/);
  assert.match(source, /\/tutor\/certification\/page/);
  assert.match(source, /\/tutor\/profiles\/page/);
  assert.match(source, /process\.exitCode = 1/);
});
