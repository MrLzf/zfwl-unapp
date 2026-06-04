const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const reviewsPage = fs.readFileSync(path.join(root, 'pages/tutor/reviews/index.vue'), 'utf8');
const detailPage = fs.readFileSync(path.join(root, 'pages/tutor/detail/index.vue'), 'utf8');

assert.match(
  reviewsPage,
  /function isMatched\(item\) \{\s*return Number\(item\.status\) === 40 \|\| Boolean\(item\.matchedTime\);\s*\}/,
  'reviews page should only treat both-confirmed matches as reviewable',
);
assert.match(
  reviewsPage,
  /const reviewedMatchIds = computed\(\(\) => new Set\([\s\S]*reviews\.value\.map\(\(item\) => String\(item\.matchId\)\)[\s\S]*\)\);/,
  'reviews page should derive reviewed match ids from my reviews',
);
assert.match(
  reviewsPage,
  /function isReviewed\(item\) \{\s*return reviewedMatchIds\.value\.has\(String\(item\.id\)\);\s*\}/,
  'reviews page should identify matches that current user already reviewed',
);
assert.match(
  reviewsPage,
  /\{\{ isReviewed\(item\) \? '已评价' : isMatched\(item\) \? '去评价' : '确认匹配' \}\}/,
  'reviewed matches should show reviewed instead of go review',
);
assert.doesNotMatch(
  reviewsPage,
  /return Number\(item\.status\) >= 30/,
  'teacher-only confirmation must not be treated as reviewable',
);
assert.match(
  reviewsPage,
  /if \(isMatched\(item\)\) \{\s*openReview\(item\);\s*return;\s*\}[\s\S]*if \(isMatched\(item\)\) \{[\s\S]*openReview\(item\);[\s\S]*\} else \{[\s\S]*等待对方确认/s,
  'after confirming one side, reviews page should wait unless the backend returns both-confirmed status',
);
assert.match(
  detailPage,
  /if \(isReviewableMatch\(state\.currentMatch\)\) \{[\s\S]*state\.showReviewModal = true;[\s\S]*\} else \{[\s\S]*等待对方确认/s,
  'detail page should open review modal only after both sides confirm',
);

console.log('tutor review match status regression checks passed');
