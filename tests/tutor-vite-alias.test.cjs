const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const config = fs.readFileSync(path.join(root, 'vite.config.js'), 'utf8');

test('vite resolves uni easycom bare sheep imports from the workspace root', () => {
  assert.match(config, /resolve:\s*\{/);
  assert.match(config, /alias:\s*\{/);
  assert.match(config, /['"]@['"]:\s*path\.resolve\(__dirname,\s*['"]\.\/['"]\)/);
  assert.match(config, /['"]sheep['"]:\s*path\.resolve\(__dirname,\s*['"]\.\/sheep['"]\)/);
});
