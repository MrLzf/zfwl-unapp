export const TUTOR_ROLE = {
  PARENT: 1,
  TEACHER: 2,
};

export const TUTOR_AUDIT_STATUS = {
  DRAFT: 0,
  WAITING: 10,
  APPROVED: 20,
  REJECTED: 30,
};

export const TUTOR_PUBLISH_STATUS = {
  DRAFT: 0,
  WAIT_AUDIT: 10,
  SHOWING: 20,
  REJECTED: 30,
  OFFLINE: 40,
};

export const tutorModeOptions = [
  { label: '上门', value: 1, key: 'offline' },
  { label: '在线', value: 2, key: 'online' },
  { label: '均可', value: 3, key: 'both' },
];

export const tutorGradeOptions = ['小学', '初中', '高中', '其他'];

export const tutorSubjectOptionsByGrade = {
  小学: ['语文', '数学', '英语', '编程', '钢琴', '美术', '其他'],
  初中: ['语文', '数学', '英语', '物理', '化学', '生物', '编程', '其他'],
  高中: ['语文', '数学', '英语', '物理', '化学', '生物', '编程', '其他'],
  其他: ['其他'],
};

export const tutorSubjectOptions = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '编程',
  '钢琴',
  '美术',
];

export const fallbackTutorCities = [
  {
    id: 1,
    name: '北京',
    code: '110100',
    pinyin: 'beijing',
    province: '北京市',
    opened: true,
    hot: true,
    sort: 10,
    longitude: 116.4074,
    latitude: 39.9042,
  },
  {
    id: 2,
    name: '上海',
    code: '310100',
    pinyin: 'shanghai',
    province: '上海市',
    opened: true,
    hot: true,
    sort: 20,
    longitude: 121.4737,
    latitude: 31.2304,
  },
  {
    id: 3,
    name: '广州',
    code: '440100',
    pinyin: 'guangzhou',
    province: '广东省',
    opened: true,
    hot: true,
    sort: 30,
    longitude: 113.2644,
    latitude: 23.1291,
  },
  {
    id: 4,
    name: '深圳',
    code: '440300',
    pinyin: 'shenzhen',
    province: '广东省',
    opened: true,
    hot: true,
    sort: 40,
    longitude: 114.0579,
    latitude: 22.5431,
  },
  {
    id: 5,
    name: '杭州',
    code: '330100',
    pinyin: 'hangzhou',
    province: '浙江省',
    opened: true,
    hot: true,
    sort: 50,
    longitude: 120.1551,
    latitude: 30.2741,
  },
  {
    id: 6,
    name: '成都',
    code: '510100',
    pinyin: 'chengdu',
    province: '四川省',
    opened: true,
    hot: true,
    sort: 60,
    longitude: 104.0665,
    latitude: 30.5728,
  },
  {
    id: 7,
    name: '武汉',
    code: '420100',
    pinyin: 'wuhan',
    province: '湖北省',
    opened: true,
    hot: true,
    sort: 70,
    longitude: 114.3055,
    latitude: 30.5928,
  },
  {
    id: 8,
    name: '西安',
    code: '610100',
    pinyin: 'xian',
    province: '陕西省',
    opened: true,
    hot: true,
    sort: 80,
    longitude: 108.9398,
    latitude: 34.3416,
  },
  {
    id: 9,
    name: '南京',
    code: '320100',
    pinyin: 'nanjing',
    province: '江苏省',
    opened: false,
    hot: false,
    sort: 90,
    longitude: 118.7969,
    latitude: 32.0603,
  },
];

export function toSubjectList(subjects) {
  if (Array.isArray(subjects)) {
    return subjects.filter(Boolean);
  }
  if (!subjects) {
    return [];
  }
  return String(subjects)
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function modeText(mode) {
  if (mode === 'offline' || mode === 1 || mode === '1') return '上门';
  if (mode === 'online' || mode === 2 || mode === '2') return '在线';
  if (mode === 'both' || mode === 3 || mode === '3') return '上门/在线';
  return '均可';
}

export function modeKey(mode) {
  if (Array.isArray(mode)) {
    const keys = mode.map((item) => modeKey(item));
    if (keys.includes('offline') && keys.includes('online')) return 'both';
    return keys[0] || 'both';
  }
  const text = String(mode || '');
  if (text.includes(',') || text.includes('、')) {
    const parts = text.split(/[,，、]/).map((item) => item.trim());
    const keys = parts.map((item) => modeKey(item));
    if (keys.includes('offline') && keys.includes('online')) return 'both';
    return keys[0] || 'both';
  }
  if (mode === 1 || mode === '1') return 'offline';
  if (mode === 2 || mode === '2') return 'online';
  if (mode === 3 || mode === '3') return 'both';
  if (mode === '上门') return 'offline';
  if (mode === '在线') return 'online';
  if (mode === '均可' || mode === '上门/在线') return 'both';
  return mode || 'both';
}

export function getPageList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}

export function getStatusMeta(item = {}) {
  const status = item.status;
  const auditStatus = item.auditStatus;
  if (status === TUTOR_PUBLISH_STATUS.SHOWING) {
    return { text: item.statusName || '展示中', className: 'active' };
  }
  if (status === TUTOR_PUBLISH_STATUS.OFFLINE) {
    return { text: item.statusName || '已下架', className: 'offline' };
  }
  if (status === TUTOR_PUBLISH_STATUS.REJECTED || auditStatus === TUTOR_AUDIT_STATUS.REJECTED) {
    return { text: item.auditStatusName || item.statusName || '审核拒绝', className: 'rejected' };
  }
  if (status === TUTOR_PUBLISH_STATUS.WAIT_AUDIT || auditStatus === TUTOR_AUDIT_STATUS.WAITING) {
    return { text: item.auditStatusName || item.statusName || '审核中', className: 'pending' };
  }
  return { text: item.statusText || item.statusName || '草稿', className: 'draft' };
}

export function maskMobile(mobile = '') {
  return String(mobile).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
}

export function formatDistance(distance) {
  if (distance === undefined || distance === null || distance === '') {
    return '同城';
  }
  const value = Number(distance);
  if (Number.isNaN(value)) {
    return '同城';
  }
  return `${value.toFixed(1)}km`;
}

export function normalizeDemand(item = {}, index = 0) {
  const subjects = toSubjectList(item.subjects || item.subject);
  const budget = item.budget || item.budgetMax || item.budgetMin || item.price || 0;
  return {
    ...item,
    id: item.id || `req-${index}`,
    type: 'req',
    targetType: 'demand',
    title: item.title || '家长需求',
    parentName: item.parentName || item.contactName || '家长用户',
    avatar: item.avatar || '/static/data-empty.png',
    grade: item.grade || '未填写年级',
    subject: item.subject || subjects[0] || '科目',
    subjects,
    distance: item.distanceKm ?? item.distance,
    mode: modeKey(item.teachMode || item.mode),
    budget,
    frequency: item.frequency || '频次面议',
    createdAt: item.createdAt || item.createTime || '刚刚',
    district: item.district || item.cityName || item.city || '同城',
    verified: item.verified ?? true,
    urgent: item.urgent ?? false,
    contactName: item.contactName || item.parentName || '联系人',
    contactPhone: item.contactMobileMask || item.contactPhone || '',
    contactWechat: item.contactWechatMask || item.contactWechat || '',
    fullPhone: item.contactMobile || item.fullPhone || item.contactMobileMask || '',
    fullWechat: item.contactWechat || item.fullWechat || item.contactWechatMask || '',
    description: item.description || '暂无详细说明',
    expectations: item.expectations || ['沟通耐心', '时间稳定'],
    statusMeta: getStatusMeta(item),
  };
}

export function normalizeResume(item = {}, index = 0) {
  const subjects = toSubjectList(item.subjects || item.subject);
  const price = item.hourlyPrice || item.price || item.hourlyPriceMax || item.hourlyPriceMin || 0;
  return {
    ...item,
    id: item.id || `tutor-${index}`,
    type: 'tutor',
    targetType: 'resume',
    name: item.name || item.teacherName || '家教老师',
    title: item.title || item.name || '教师简历',
    city: item.cityName || item.city || '同城',
    district: item.district || item.cityName || item.city || '同城',
    avatar: item.avatar || '/static/data-empty.png',
    education: item.education || item.educationLevel || '学历待完善',
    subjects,
    distance: item.distanceKm ?? item.distance,
    mode: modeKey(item.teachMode || item.teachModes || item.mode),
    price,
    createdAt: item.createdAt || item.createTime || '刚刚活跃',
    verified: item.verified ?? item.certificationStatus === TUTOR_AUDIT_STATUS.APPROVED,
    hasFreeTrial: item.hasFreeTrial ?? item.freeTrialEnabled,
    freeTrialMinutes: item.freeTrialMinutes,
    score: item.score || item.ratingAvg || item.rating || '5.0',
    reviewCount: item.reviewCount || item.reviews || 0,
    contactName: item.contactName || item.name || '联系人',
    contactPhone: item.contactMobileMask || item.contactPhone || '',
    contactWechat: item.contactWechatMask || item.contactWechat || '',
    fullPhone: item.contactMobile || item.fullPhone || item.contactMobileMask || '',
    fullWechat: item.contactWechat || item.fullWechat || item.contactWechatMask || '',
    description: item.teachingExperience || item.description || item.intro || '暂无教学介绍',
    expectations: item.expectations || ['免费沟通', '可试听', '课后反馈'],
    statusMeta: getStatusMeta(item),
  };
}

export function nearestCityByLocation(cities = [], longitude, latitude) {
  if (!longitude || !latitude || !cities.length) {
    return null;
  }
  const availableCities = cities.filter((city) => city.longitude && city.latitude);
  if (!availableCities.length) {
    return null;
  }
  return availableCities
    .map((city) => ({
      ...city,
      locationDistance:
        Math.pow(Number(city.longitude) - Number(longitude), 2) +
        Math.pow(Number(city.latitude) - Number(latitude), 2),
    }))
    .sort((a, b) => a.locationDistance - b.locationDistance)[0];
}
