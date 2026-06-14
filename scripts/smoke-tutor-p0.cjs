#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function readDotenv(file) {
  if (!fs.existsSync(file)) return {};
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
      return env;
    }, {});
}

const fileEnv = readDotenv(path.join(root, '.env'));
const apiBase = process.env.TUTOR_P0_API_BASE || fileEnv.TUTOR_DEV_BASE_URL || 'http://localhost:48080';
const h5Base = process.env.TUTOR_P0_H5_URL || fileEnv.TUTOR_H5_URL || 'http://localhost:3000';
const adminBase = process.env.TUTOR_P0_ADMIN_URL || 'http://localhost/';
const appApi = `${apiBase.replace(/\/$/, '')}/app-api`;
const adminApi = `${apiBase.replace(/\/$/, '')}/admin-api`;
const tenantId = process.env.TUTOR_P0_TENANT_ID || '1';
const adminToken = process.env.TUTOR_P0_ADMIN_TOKEN || 'test1';
const smsCode = process.env.TUTOR_P0_SMS_CODE || '9999';
const cityCode = process.env.TUTOR_P0_CITY_CODE || '310100';
const smokeMobile =
  process.env.TUTOR_P0_SMOKE_MOBILE ||
  `139${String(Date.now()).slice(-8)}`;

const checks = [];

function headers(token) {
  return {
    'Content-Type': 'application/json',
    'tenant-id': tenantId,
    ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}),
  };
}

async function record(name, fn, required = true) {
  try {
    const data = await fn();
    checks.push({ name, required, ok: true, ...data });
  } catch (error) {
    checks.push({ name, required, ok: false, error: error.message });
  }
}

async function httpStatus(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return { status: response.status };
}

async function apiGet(url, token) {
  const response = await fetch(url, { headers: headers(token) });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error(`non-JSON HTTP ${response.status}: ${text.slice(0, 120)}`);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${payload.msg || text}`);
  if (payload.code !== 0) throw new Error(`code ${payload.code}: ${payload.msg || payload.message || text}`);
  const data = payload.data;
  const size = Array.isArray(data) ? data.length : Array.isArray(data?.list) ? data.list.length : undefined;
  const total = data && typeof data === 'object' && 'total' in data ? data.total : undefined;
  return { code: payload.code, size, total, firstId: data?.list?.[0]?.id || data?.[0]?.id };
}

async function apiPost(url, body, token) {
  const response = await fetch(url, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error(`non-JSON HTTP ${response.status}: ${text.slice(0, 120)}`);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${payload.msg || text}`);
  if (payload.code !== 0) throw new Error(`code ${payload.code}: ${payload.msg || payload.message || text}`);
  return payload.data;
}

async function appSmokeLogin() {
  try {
    await apiPost(`${appApi}/member/auth/send-sms-code`, { mobile: smokeMobile, scene: 1 });
  } catch (error) {
    if (!/短信发送过于频繁/.test(error.message)) throw error;
  }
  let login;
  try {
    login = await apiPost(`${appApi}/member/auth/sms-login`, {
      mobile: smokeMobile,
      code: smsCode,
      tutorRole: 1,
      tutorCityCode: cityCode,
    });
  } catch (error) {
    if (!/身份已选择/.test(error.message)) throw error;
    login = await apiPost(`${appApi}/member/auth/sms-login`, {
      mobile: smokeMobile,
      code: smsCode,
    });
  }
  try {
    await apiPost(`${appApi}/tutor/profile/init`, { role: 1, cityCode }, login.accessToken);
  } catch (error) {
    if (!/身份已选择/.test(error.message)) throw error;
  }
  return { token: login.accessToken };
}

async function main() {
  await record('backend tenant', () =>
    apiGet(`${appApi}/system/tenant/get-by-website?website=localhost:3000`),
  );
  await record('mobile h5', () => httpStatus(`${h5Base}/#/pages/index/user`));
  await record('admin root', () => httpStatus(adminBase));

  let appToken;
  await record('app smoke login', async () => {
    const data = await appSmokeLogin();
    appToken = data.token;
    return { token: Boolean(appToken) };
  });

  await record('app cities', () => apiGet(`${appApi}/tutor/cities`));
  await record('app demand square', () => apiGet(`${appApi}/tutor/square/demands?pageNo=1&pageSize=5`, appToken));
  await record('app resume square', () => apiGet(`${appApi}/tutor/square/resumes?pageNo=1&pageSize=5`, appToken));

  await record('admin permission', () => apiGet(`${adminApi}/system/auth/get-permission-info`, adminToken));
  await record('admin certification', () =>
    apiGet(`${adminApi}/tutor/certification/page?pageNo=1&pageSize=5`, adminToken),
  );
  await record('admin demand', () => apiGet(`${adminApi}/tutor/demand/page?pageNo=1&pageSize=5`, adminToken));
  await record('admin resume', () => apiGet(`${adminApi}/tutor/resume/page?pageNo=1&pageSize=5`, adminToken));
  await record('admin contacts', () => apiGet(`${adminApi}/tutor/contacts/page?pageNo=1&pageSize=5`, adminToken));
  await record('admin matches', () => apiGet(`${adminApi}/tutor/matches/page?pageNo=1&pageSize=5`, adminToken));
  await record('admin reviews', () => apiGet(`${adminApi}/tutor/reviews/page?pageNo=1&pageSize=5`, adminToken));
  await record('admin profiles', () => apiGet(`${adminApi}/tutor/profiles/page?pageNo=1&pageSize=5`, adminToken));
  await record('admin dashboard', () => apiGet(`${adminApi}/tutor/dashboard/summary`, adminToken));

  const demand = checks.find((item) => item.name === 'app demand square')?.firstId;
  const resume = checks.find((item) => item.name === 'app resume square')?.firstId;
  if (demand) {
    await record('app demand detail', () => apiGet(`${appApi}/tutor/detail/demand/${demand}`, appToken), false);
  }
  if (resume) {
    await record('app resume detail', () => apiGet(`${appApi}/tutor/detail/resume/${resume}`, appToken), false);
  }

  const failures = checks.filter((item) => item.required && !item.ok);
  const result = {
    ok: failures.length === 0,
    apiBase,
    h5Base,
    adminBase,
    checks,
    failures,
  };
  console.log(JSON.stringify(result, null, 2));
  if (failures.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exitCode = 1;
});
