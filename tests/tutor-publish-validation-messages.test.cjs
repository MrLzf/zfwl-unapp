const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publishPage = fs.readFileSync(path.join(root, 'pages/index/publish.vue'), 'utf8');

[
  '请填写标题',
  '请选择科目',
  '请填写授课科目',
  '请填写手机号',
  '请输入正确的手机号',
  '请选择年级',
  '请填写最低预算',
  '请填写最高预算',
  '请输入正确的预算金额',
  '最低预算不能小于 0',
  '最高预算不能低于最低预算',
  '请填写详细要求',
  '请填写时薪',
  '请输入正确的时薪',
  '请填写服务半径',
  '请输入正确的服务半径',
  '请填写教学经验',
  '请选择试课时长',
].forEach((message) => {
  assert.match(publishPage, new RegExp(message), `publish page should show: ${message}`);
});

['请完善标题和科目', '请完善年级和预算范围', '请填写正确时薪和服务半径'].forEach((message) => {
  assert.doesNotMatch(publishPage, new RegExp(message), `publish page should remove: ${message}`);
});

console.log('tutor publish validation message regression checks passed');
