const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const manifest = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../manifest.json'), 'utf8'),
);
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'),
);

const androidPermissions =
  manifest['app-plus']?.distribute?.android?.permissions?.map((item) => {
    const matched = item.match(/android\.permission\.([A-Z_]+)/);
    return matched?.[1] || item;
  }) || [];

const forbiddenPermissions = [
  'ACCESS_MOCK_LOCATION',
  'CHANGE_NETWORK_STATE',
  'CHANGE_WIFI_STATE',
  'FLASHLIGHT',
  'GET_ACCOUNTS',
  'GET_TASKS',
  'MODIFY_AUDIO_SETTINGS',
  'MOUNT_UNMOUNT_FILESYSTEMS',
  'READ_CONTACTS',
  'READ_LOGS',
  'READ_PHONE_STATE',
  'READ_SMS',
  'RECEIVE_BOOT_COMPLETED',
  'RECEIVE_USER_PRESENT',
  'RECORD_AUDIO',
  'SEND_SMS',
  'SYSTEM_ALERT_WINDOW',
  'WAKE_LOCK',
  'WRITE_CONTACTS',
  'WRITE_SETTINGS',
  'WRITE_SMS',
];

for (const permission of forbiddenPermissions) {
  assert.ok(
    !androidPermissions.includes(permission),
    `manifest.json should not request android.permission.${permission} for tutor launch`,
  );
}

for (const expectedPermission of [
  'ACCESS_COARSE_LOCATION',
  'ACCESS_FINE_LOCATION',
  'ACCESS_NETWORK_STATE',
  'ACCESS_WIFI_STATE',
  'CAMERA',
  'INTERNET',
]) {
  assert.ok(
    androidPermissions.includes(expectedPermission),
    `manifest.json should keep android.permission.${expectedPermission}`,
  );
}

assert.equal(
  manifest['mp-weixin']?.permission?.['scope.userLocation']?.desc,
  '用于获取当前位置，计算家教信息与您的距离',
);
assert.deepEqual(manifest['mp-weixin']?.requiredPrivateInfos, ['chooseAddress', 'getLocation']);

assert.notEqual(manifest['app-plus']?.distribute?.ios?.idfa, true, 'iOS IDFA should stay disabled for tutor P0');
assert.ok(
  !manifest['app-plus']?.distribute?.ios?.privacyDescription?.NSUserTrackingUsageDescription,
  'iOS tracking usage description should not be present when IDFA is disabled',
);

assert.equal(
  packageJson.dcloudext?.declaration?.permissions,
  '定位、相机、网络、拨号、存储',
  'package permission declaration should match the minimized native permission scope',
);

console.log('tutor manifest permission contract ok');
