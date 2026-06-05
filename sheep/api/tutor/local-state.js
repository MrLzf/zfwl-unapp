import dayjs from 'dayjs';
import { normalizeDemand, normalizeResume, maskMobile } from '@/sheep/api/tutor/utils';

const KEYS = {
  favorites: 'tutor_local_favorites',
  history: 'tutor_local_history',
  contacts: 'tutor_local_contacts',
  matches: 'tutor_local_matches',
  reviews: 'tutor_local_reviews',
  points: 'tutor_local_points',
};

export function isNumericId(id) {
  return /^\d+$/.test(String(id || ''));
}

export function getTargetType(itemOrType) {
  if (typeof itemOrType === 'string') {
    if (itemOrType === 'resume' || itemOrType === 'tutor') return 'resume';
    return 'demand';
  }
  return itemOrType?.targetType || (itemOrType?.type === 'tutor' ? 'resume' : 'demand');
}

export function getUiType(targetType) {
  return getTargetType(targetType) === 'resume' ? 'tutor' : 'req';
}

export function targetKey(targetType, targetId) {
  return `${getTargetType(targetType)}:${targetId}`;
}

function readList(key) {
  const value = uni.getStorageSync(key);
  return Array.isArray(value) ? value : [];
}

function writeList(key, list) {
  uni.setStorageSync(key, list);
}

function normalizeLocalItem(item, index = 0) {
  if (!item) return null;
  return item.type === 'tutor' || item.targetType === 'resume'
    ? normalizeResume(item, index)
    : normalizeDemand(item, index);
}

export function getLocalItem(targetType, targetId) {
  const type = getTargetType(targetType);
  const key = targetKey(type, targetId);
  const sources = [
    ...readList(KEYS.favorites),
    ...readList(KEYS.history),
    ...readList(KEYS.contacts),
  ];
  const found = sources.find((item) => item.key === key || (String(item.id) === String(targetId) && getTargetType(item) === type));
  if (found) return normalizeLocalItem(found);
  return null;
}

export function getLocalPoints() {
  const stored = uni.getStorageSync(KEYS.points);
  return typeof stored === 'number' ? stored : 50;
}

export function setLocalPoints(points) {
  uni.setStorageSync(KEYS.points, Math.max(0, Number(points) || 0));
}

export function recordLocalHistory(item) {
  const normalized = normalizeLocalItem(item);
  if (!normalized) return;
  const key = targetKey(normalized.targetType, normalized.id);
  const next = [
    {
      ...normalized,
      key,
      local: true,
      viewedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
    ...readList(KEYS.history).filter((record) => record.key !== key),
  ].slice(0, 50);
  writeList(KEYS.history, next);
}

export function getLocalHistory() {
  return readList(KEYS.history);
}

export function clearLocalHistory() {
  writeList(KEYS.history, []);
}

export function isLocalFavorite(targetType, targetId) {
  const key = targetKey(targetType, targetId);
  return readList(KEYS.favorites).some((item) => item.key === key);
}

export function addLocalFavorite(item) {
  const normalized = normalizeLocalItem(item);
  const key = targetKey(normalized.targetType, normalized.id);
  const list = readList(KEYS.favorites).filter((record) => record.key !== key);
  writeList(
    KEYS.favorites,
    [
      {
        ...normalized,
        key,
        local: true,
        favoriteAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      ...list,
    ].slice(0, 100),
  );
}

export function removeLocalFavorite(targetType, targetId) {
  const key = targetKey(targetType, targetId);
  writeList(
    KEYS.favorites,
    readList(KEYS.favorites).filter((item) => item.key !== key),
  );
}

export function getLocalFavorites() {
  return readList(KEYS.favorites);
}

export function viewLocalContact(item) {
  const normalized = normalizeLocalItem(item);
  const key = targetKey(normalized.targetType, normalized.id);
  const now = dayjs();
  const existing = readList(KEYS.contacts).find(
    (record) => record.key === key && dayjs(record.freeReuseUntil).isAfter(now),
  );
  const reused = Boolean(existing);
  const points = getLocalPoints();
  if (!reused && points < 10) {
    return {
      code: 1040005001,
      msg: '积分不足，无法查看联系方式',
    };
  }
  if (!reused) {
    setLocalPoints(points - 10);
  }
  const contact = {
    targetType: normalized.targetType,
    targetId: normalized.id,
    targetUserId: normalized.userId || normalized.id,
    mobile: normalized.fullPhone || normalized.contactPhone,
    wechat: normalized.fullWechat || `tutor_${String(normalized.id).replace(/\W/g, '')}`,
    pointCost: reused ? 0 : 10,
    reused,
    safetyTip: '请核验对方身份，线下见面选择公共场所，未确认前不要提前转账。',
  };
  if (!reused) {
    const record = {
      ...normalized,
      ...contact,
      key,
      local: true,
      id: Date.now(),
      contactName: normalized.contactName || normalized.name || normalized.parentName,
      pointCost: 10,
      freeReuseUntil: now.add(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
      createTime: now.format('YYYY-MM-DD HH:mm:ss'),
    };
    writeList(KEYS.contacts, [record, ...readList(KEYS.contacts)].slice(0, 100));
    createLocalMatch(normalized);
  }
  return {
    code: 0,
    data: contact,
  };
}

function createLocalMatch(item) {
  const key = targetKey(item.targetType, item.id);
  const exists = readList(KEYS.matches).some((match) => match.key === key);
  if (exists) return;
  writeList(KEYS.matches, [
    {
      ...item,
      key,
      local: true,
      id: Date.now(),
      matchId: Date.now(),
      status: 10,
      statusName: '已交换联系方式',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
    ...readList(KEYS.matches),
  ]);
}

export function getLocalContacts() {
  return readList(KEYS.contacts);
}

export function getLocalMatches() {
  return readList(KEYS.matches);
}

export function confirmLocalMatch(matchIdOrKey) {
  const list = readList(KEYS.matches);
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const next = list.map((match) => {
    if (String(match.id) !== String(matchIdOrKey) && match.key !== matchIdOrKey) return match;
    return {
      ...match,
      status: 30,
      statusName: '匹配成功',
      matchedTime: now,
    };
  });
  writeList(KEYS.matches, next);
  return next.find(
    (match) => String(match.id) === String(matchIdOrKey) || match.key === matchIdOrKey,
  );
}

export function getLocalReviews() {
  return readList(KEYS.reviews);
}

export function addLocalReview(data) {
  const review = {
    id: Date.now(),
    ...data,
    local: true,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  };
  writeList(KEYS.reviews, [review, ...readList(KEYS.reviews)].slice(0, 100));
  return review;
}

export function maskContact(item = {}) {
  return {
    mobile: item.contactPhone || maskMobile(item.fullPhone || ''),
    wechat:
      item.contactWechat ||
      (item.fullWechat ? `${String(item.fullWechat).slice(0, 3)}***` : '查看后展示'),
  };
}
