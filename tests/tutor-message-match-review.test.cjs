const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const mobileRoot = path.resolve(__dirname, '..');
const backendRoot = path.resolve(mobileRoot, '..', 'zfwl');
const readMobile = (file) => fs.readFileSync(path.join(mobileRoot, file), 'utf8');
const readBackend = (file) => fs.readFileSync(path.join(backendRoot, file), 'utf8');

const messageHome = readMobile('pages/index/message.vue');
const messageList = readMobile('pages/tutor/messages/index.vue');
const messageService = readBackend(
  'yudao-module-tutor/src/main/java/cn/iocoder/yudao/module/tutor/service/message/TutorMessageServiceImpl.java',
);
const messageController = readBackend(
  'yudao-module-tutor/src/main/java/cn/iocoder/yudao/module/tutor/controller/app/message/AppTutorMessageController.java',
);
const messageReq = readBackend(
  'yudao-module-tutor/src/main/java/cn/iocoder/yudao/module/tutor/controller/app/message/vo/AppTutorMessagePageReqVO.java',
);
const notifyService = readBackend(
  'yudao-module-tutor/src/main/java/cn/iocoder/yudao/module/tutor/service/notify/TutorNotifyServiceImpl.java',
);
const notifySql = readBackend('sql/mysql/tutor_notify.sql');

assert.match(messageService, /Arrays\.asList\("audit", "contact", "match", "review", "point"\)/);
assert.match(messageController, /audit\|contact\|match\|review\|point/);
assert.match(messageReq, /audit\|contact\|match\|review\|point/);

assert.match(messageHome, /category: 'match'[\s\S]*title: '匹配通知'/);
assert.match(messageHome, /category: 'review'[\s\S]*title: '评价通知'/);
assert.match(messageList, /match_reviews: '\/pages\/tutor\/reviews\/index'/);

assert.match(
  notifyService,
  /buildCommonParams\("match", "match_reviews", "match:" \+ matchId, "match", matchId\)/,
);
assert.match(
  notifyService,
  /buildCommonParams\("review", "match_reviews", "review:" \+ rating, "match", null\)/,
);
assert.match(notifySql, /"matchId","category","action","bizId","targetType","targetId"/);
assert.match(
  notifySql,
  /"reviewerUserId","rating","category","action","bizId","targetType","targetId"/,
);

console.log('tutor match and review message regression checks passed');
