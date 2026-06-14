#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const envFile = path.join(root, '.env');

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

const fileEnv = readDotenv(envFile);
const apiBase = process.env.TUTOR_P0_API_BASE || fileEnv.TUTOR_DEV_BASE_URL || 'http://localhost:48080';
const appApi = `${apiBase.replace(/\/$/, '')}/app-api`;
const adminApi = `${apiBase.replace(/\/$/, '')}/admin-api`;
const tenantId = process.env.TUTOR_P0_TENANT_ID || '1';
const adminToken = process.env.TUTOR_P0_ADMIN_TOKEN || 'test1';
const smsCode = process.env.TUTOR_P0_SMS_CODE || '9999';
const cityCode = process.env.TUTOR_P0_CITY_CODE || '310100';
const TUTOR_P0_RUN_ID =
  process.env.TUTOR_P0_RUN_ID ||
  new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

function mobile(prefix, offset) {
  const numeric = String(Number(TUTOR_P0_RUN_ID.replace(/\D/g, '').slice(-8)) + offset)
    .padStart(8, '0')
    .slice(-8);
  return `${prefix}${numeric}`;
}

function headers(token, extra = {}) {
  return {
    'Content-Type': 'application/json',
    'tenant-id': tenantId,
    ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function apiRequest(label, url, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: headers(options.token, options.headers),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`${label} returned non-JSON HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new Error(`${label} failed HTTP ${response.status}: ${payload.msg || text}`);
  }
  if (payload.code !== 0) {
    throw new Error(`${label} failed code ${payload.code}: ${payload.msg || payload.message || text}`);
  }
  return payload.data;
}

async function optional(label, fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    return { ok: false, error: `${label}: ${error.message}` };
  }
}

async function smsLogin(label, mobileNo, role) {
  await apiRequest(`${label} send sms`, `${appApi}/member/auth/send-sms-code`, {
    method: 'POST',
    body: { mobile: mobileNo, scene: 1 },
  });
  const login = await apiRequest(`${label} sms login`, `${appApi}/member/auth/sms-login`, {
    method: 'POST',
    body: {
      mobile: mobileNo,
      code: smsCode,
      tutorRole: role,
      tutorCityCode: cityCode,
    },
  });
  const token = login.accessToken;
  const profile = await optional(`${label} init profile`, () =>
    apiRequest(`${label} init profile`, `${appApi}/tutor/profile/init`, {
      method: 'POST',
      token,
      body: { role, cityCode },
    }),
  );
  const user = await apiRequest(`${label} user`, `${appApi}/member/user/get`, { token });
  return {
    mobile: mobileNo,
    role,
    token,
    userId: user.id,
    nickname: user.nickname,
    profile: login.tutorProfile || profile.data || null,
  };
}

async function auditCertification(id) {
  return apiRequest('audit certification', `${adminApi}/tutor/certification/audit`, {
    method: 'PUT',
    token: adminToken,
    body: { id, status: 20 },
  });
}

async function auditPublish(kind, id) {
  return apiRequest(`audit ${kind}`, `${adminApi}/tutor/${kind}/audit`, {
    method: 'PUT',
    token: adminToken,
    body: { id, auditStatus: 20 },
  });
}

async function adjustPoint(userId, point, remark) {
  return apiRequest(`adjust point ${userId}`, `${adminApi}/tutor/points/adjust`, {
    method: 'PUT',
    token: adminToken,
    body: { userId, point, remark },
  });
}

async function main() {
  const parent = await smsLogin('parent', mobile('136', 11), 1);
  const teacher = await smsLogin('teacher', mobile('133', 22), 2);

  const certification = await apiRequest('submit certification', `${appApi}/tutor/certification/submit`, {
    method: 'POST',
    token: teacher.token,
    body: {
      realName: `Codex老师${TUTOR_P0_RUN_ID.slice(-4)}`,
      idCardNo: `110101199001${TUTOR_P0_RUN_ID.slice(-6)}`,
      educationFileUrl: `https://example.com/tutor-p0/${TUTOR_P0_RUN_ID}/education.pdf`,
      teacherCertFileUrl: `https://example.com/tutor-p0/${TUTOR_P0_RUN_ID}/teacher.pdf`,
    },
  });
  await auditCertification(certification.id);

  const demand = await apiRequest('create demand', `${appApi}/tutor/demands`, {
    method: 'POST',
    token: parent.token,
    body: {
      title: `Codex P0 需求 ${TUTOR_P0_RUN_ID}`,
      grade: '初二',
      subjects: '数学,英语',
      teachMode: 3,
      address: '上海市浦东新区世纪大道100号',
      budgetMin: 120,
      budgetMax: 260,
      description: 'P0 种子数据：需要稳定老师帮助孩子梳理基础并跟进作业。',
      cityCode,
      longitude: 121.4737,
      latitude: 31.2304,
      distanceVisible: true,
      contactMobile: parent.mobile,
      contactWechat: `codex_parent_${TUTOR_P0_RUN_ID.slice(-6)}`,
    },
  });
  await auditPublish('demand', demand.id);

  const resume = await apiRequest('create resume', `${appApi}/tutor/resumes`, {
    method: 'POST',
    token: teacher.token,
    body: {
      title: `Codex P0 老师 ${TUTOR_P0_RUN_ID}`,
      subjects: '数学,英语',
      teachModes: '1,2,3',
      hourlyPrice: 180,
      freeTrialEnabled: true,
      freeTrialMinutes: 30,
      teachingExperience: 'P0 种子数据：熟悉初中数学英语提分，重视错题复盘。',
      availableTimes: '周一至周五晚间，周末全天可协商',
      cityCode,
      longitude: 121.4737,
      latitude: 31.2304,
      serviceRadiusKm: 30,
      contactMobile: teacher.mobile,
      contactWechat: `codex_teacher_${TUTOR_P0_RUN_ID.slice(-6)}`,
    },
  });
  await auditPublish('resume', resume.id);

  await adjustPoint(parent.userId, 300, `Codex P0 seed ${TUTOR_P0_RUN_ID}`);
  await adjustPoint(teacher.userId, 300, `Codex P0 seed ${TUTOR_P0_RUN_ID}`);

  const teacherViewedDemand = await optional('teacher view demand contact', () =>
    apiRequest('teacher view demand contact', `${appApi}/tutor/contact/view`, {
      method: 'POST',
      token: teacher.token,
      body: { targetType: 'demand', targetId: demand.id },
    }),
  );
  const parentViewedResume = await optional('parent view resume contact', () =>
    apiRequest('parent view resume contact', `${appApi}/tutor/contact/view`, {
      method: 'POST',
      token: parent.token,
      body: { targetType: 'resume', targetId: resume.id },
    }),
  );

  const summary = {
    ok: true,
    runId: TUTOR_P0_RUN_ID,
    apiBase,
    cityCode,
    parent: { mobile: parent.mobile, userId: parent.userId },
    teacher: { mobile: teacher.mobile, userId: teacher.userId },
    certificationId: certification.id,
    demandId: demand.id,
    resumeId: resume.id,
    optional: {
      teacherViewedDemand,
      parentViewedResume,
    },
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exitCode = 1;
});
