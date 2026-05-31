const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = fs.readFileSync(path.join(root, 'pages.json'), 'utf8');
const teacherPage = fs.readFileSync(
  path.join(root, 'pages/tutor/teacher-profile/index.vue'),
  'utf8',
);

assert.match(
  pages,
  /"path":\s*"teacher-profile\/index"/,
  'pages.json should register teacher profile',
);
assert.match(teacherPage, /TutorTeacherProfileApi/, 'teacher page should import its profile API');
assert.match(
  teacherPage,
  /TutorTeacherProfileApi\.getProfile\(/,
  'teacher page should load profile',
);
assert.match(
  teacherPage,
  /TutorTeacherProfileApi\.saveProfile\(/,
  'teacher page should save profile',
);

[
  'educationLevel',
  'schoolName',
  'major',
  'hasTeacherCertificate',
  'subjects',
  'teachModes',
  'hourlyPriceMin',
  'hourlyPriceMax',
  'serviceRadiusKm',
  'freeTrialEnabled',
  'freeTrialMinutes',
  'teachingYears',
  'intro',
].forEach((field) => {
  assert.match(teacherPage, new RegExp(field), `teacher page should cover ${field}`);
});

[
  ['hourlyPriceMin', 0, 99999],
  ['hourlyPriceMax', 0, 99999],
  ['serviceRadiusKm', 0, 200],
  ['freeTrialMinutes', 0, 240],
  ['teachingYears', 0, 80],
].forEach(([field, min, max]) => {
  assert.match(
    teacherPage,
    new RegExp(`${field}:\\s*\\{[\\s\\S]*min:\\s*${min},[\\s\\S]*max:\\s*${max}`),
    `${field} should validate the backend VO range`,
  );
});
assert.match(
  teacherPage,
  /Number\.isFinite\(value\)/,
  'teacher page should reject NaN numeric values before saving',
);
assert.match(
  teacherPage,
  /请输入有效的/,
  'teacher page should show a clear invalid-number message',
);
assert.match(teacherPage, /范围为/, 'teacher page should show a clear out-of-range message');

console.log('tutor teacher profile page regression checks passed');
