const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const contactsPage = fs.readFileSync(path.join(root, 'pages/tutor/contacts/index.vue'), 'utf8');
const favoritesPage = fs.readFileSync(path.join(root, 'pages/tutor/favorites/index.vue'), 'utf8');
const historyPage = fs.readFileSync(path.join(root, 'pages/tutor/history/index.vue'), 'utf8');
const reviewsPage = fs.readFileSync(path.join(root, 'pages/tutor/reviews/index.vue'), 'utf8');
const userPage = fs.readFileSync(path.join(root, 'pages/index/user.vue'), 'utf8');
const localState = fs.readFileSync(path.join(root, 'sheep/api/tutor/local-state.js'), 'utf8');

test('local state exposes a reusable demo-only target filter', () => {
  assert.match(localState, /export function isLocalDemoTarget\(item = \{\}\)/);
  assert.match(localState, /return !isNumericId\(targetId\);/);
});

test('contact and favorite lists only merge demo local records with successful remote data', () => {
  assert.match(contactsPage, /getLocalContacts\(\)\.filter\(isLocalDemoTarget\)\.map\(normalizeRecord\)/);
  assert.match(contactsPage, /if \(!record\) return null;/);
  assert.match(favoritesPage, /getLocalFavorites\(\)\.filter\(isLocalDemoTarget\)\.map\(normalizeFavorite\)/);
  assert.match(historyPage, /getLocalHistory\(\)\.filter\(isLocalDemoTarget\)\.map\(normalizeHistory\)/);
  assert.doesNotMatch(contactsPage, /new Map\(\[\.\.\.remote,\s*\.\.\.localRecords\]/);
  assert.doesNotMatch(favoritesPage, /new Map\(\[\.\.\.localItems,\s*\.\.\.remote\]/);
});

test('reviews and user contact count exclude numeric local records from production totals', () => {
  assert.match(reviewsPage, /getLocalMatches\(\)\.filter\(isLocalDemoTarget\)\.map\(normalizeMatch\)/);
  assert.match(reviewsPage, /getLocalReviews\(\)\.filter\(isLocalDemoTarget\)\.map\(normalizeReview\)/);
  assert.match(userPage, /const localContacts = getLocalContacts\(\)\.filter\(isLocalDemoTarget\);/);
});
