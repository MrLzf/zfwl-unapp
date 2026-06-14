const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const mobileRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(mobileRoot, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(workspaceRoot, relativePath), 'utf8');
}

test('mobile development mode targets the local app API', () => {
  const env = read('zfwl-unapp/.env');

  assert.match(env, /^TUTOR_DEV_BASE_URL=http:\/\/localhost:48080$/m);
  assert.match(env, /^TUTOR_API_PATH=\/app-api$/m);
  assert.match(env, /^TUTOR_H5_URL=http:\/\/localhost:3000$/m);
  assert.doesNotMatch(env, /^TUTOR_DEV_BASE_URL=https:\/\/wccprint\.top$/m);
});

test('admin local mode targets the local admin API', () => {
  const envLocal = read('zlwl-vue/.env.local');

  assert.match(envLocal, /^VITE_BASE_URL='http:\/\/localhost:48080'$/m);
  assert.match(envLocal, /^VITE_API_URL=\/admin-api$/m);
  assert.doesNotMatch(envLocal, /^VITE_BASE_URL='http:\/\/159\.75\.221\.52:48080'$/m);
});

test('backend local profile intentionally uses online database and redis', () => {
  const yaml = read('zfwl/yudao-server/src/main/resources/application-local.yaml');

  assert.match(yaml, /url: jdbc:mysql:\/\/159\.75\.221\.52:3306\/ruoyi-vue-pro\?/);
  assert.match(yaml, /host: 159\.75\.221\.52 # 地址/);
  assert.match(yaml, /password: housekeeping # 密码/);
});
