const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cityPage = fs.readFileSync(path.join(root, 'pages/tutor/city/index.vue'), 'utf8');
const squarePage = fs.readFileSync(path.join(root, 'pages/index/square.vue'), 'utf8');

assert.match(
  cityPage,
  /async function applySelectedCity\(city,\s*\{\s*navigateBack = true,\s*toastTitle\s*}\s*=\s*\{\}\)/,
  'city page should share one city-apply flow between manual selection and location',
);
assert.match(
  cityPage,
  /uni\.setStorageSync\('tutor_city', selected\);/,
  'applying a city should persist the selected square city',
);
assert.match(
  cityPage,
  /await applySelectedCity\(matched,\s*\{\s*navigateBack: false,\s*toastTitle: `定位到\$\{matched\.name\}`,\s*}\);/,
  'locating a city should also update the current selected city without leaving the page',
);
assert.match(
  cityPage,
  /syncLocalProfileCity\(selected\);/,
  'applying a city should keep the local tutor profile in sync',
);
assert.match(
  squarePage,
  /city\.value = uni\.getStorageSync\('tutor_city'\) \|\| uni\.getStorageSync\('tutor_located_city'\) \|\| \{\};/,
  'square should fall back to located city when no selected city exists',
);

console.log('tutor square location sync regression checks passed');
