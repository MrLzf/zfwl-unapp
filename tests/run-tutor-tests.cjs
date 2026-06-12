const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const testsDir = __dirname;
const tests = fs
  .readdirSync(testsDir)
  .filter((name) => /^tutor-.*\.test\.cjs$/.test(name))
  .sort();

for (const testFile of tests) {
  console.log(`RUN ${testFile}`);
  const result = spawnSync(process.execPath, [path.join(testsDir, testFile)], {
    cwd: path.resolve(testsDir, '..'),
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
