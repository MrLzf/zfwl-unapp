const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('package exposes uni-app cli scripts for H5 and WeChat mini program verification', () => {
  assert.equal(pkg.scripts.test, 'node tests/run-tutor-tests.cjs');
  assert.equal(pkg.scripts.dev, 'npm run dev:h5');
  assert.equal(pkg.scripts['dev:h5'], 'cross-env UNI_INPUT_DIR=. uni');
  assert.equal(pkg.scripts['build:h5'], 'cross-env UNI_INPUT_DIR=. uni build');
  assert.equal(pkg.scripts['dev:mp-weixin'], 'cross-env UNI_INPUT_DIR=. uni -p mp-weixin');
  assert.equal(pkg.scripts['build:mp-weixin'], 'cross-env UNI_INPUT_DIR=. uni build -p mp-weixin');
});

test('package includes a tutor regression runner used by npm test', () => {
  assert.ok(fs.existsSync(path.join(root, 'tests/run-tutor-tests.cjs')));
});

test('package declares the uni-app runtime and vite cli dependencies needed outside HBuilderX', () => {
  const dependencies = pkg.dependencies || {};
  const devDependencies = pkg.devDependencies || {};

  ['@dcloudio/uni-app', '@dcloudio/uni-h5', '@dcloudio/uni-mp-weixin', 'vue'].forEach((name) =>
    assert.ok(dependencies[name], `${name} should be declared in dependencies`),
  );

  ['@dcloudio/vite-plugin-uni', 'cross-env', 'vite', 'sass'].forEach((name) =>
    assert.ok(devDependencies[name], `${name} should be declared in devDependencies`),
  );
});
