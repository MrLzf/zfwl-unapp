const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const navbar = fs.readFileSync(
  path.resolve(__dirname, '../sheep/ui/su-inner-navbar/su-inner-navbar.vue'),
  'utf8',
);

assert.match(navbar, /dark:\s*\{\s*type:\s*Boolean,\s*default:\s*false,/s);
assert.match(navbar, /'text-white': props\.dark,/);
assert.match(navbar, /'text-black': !props\.dark,/);
assert.doesNotMatch(navbar, /isDark:\s*true,/);
assert.doesNotMatch(navbar, /state\.isDark = top < sheep\.\$platform\.navbar/);
assert.match(navbar, /background:\s*rgba\(255,\s*255,\s*255,\s*0\.88\);/);
assert.match(navbar, /border:\s*1px solid rgba\(148,\s*163,\s*184,\s*0\.28\);/);

console.log('tutor inner navbar contrast regression checks passed');
