export const tutorStats = [
  { label: '认证老师', value: '286' },
  { label: '本周需求', value: '94' },
  { label: '平均响应', value: '18分' },
];

export const tutorFilters = [
  { label: '全部', value: 'all' },
  { label: '找老师', value: 'tutor' },
  { label: '找家长', value: 'req' },
];

export const tutorSubjects = ['数学', '英语', '物理', '语文', '化学'];

export const tutorRequests = [
  {
    id: 'req-r3',
    type: 'req',
    title: '高三物理冲刺辅导',
    parentName: '孙女士',
    city: '杭州',
    district: '滨江区',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&h=240&q=80',
    grade: '高三',
    subject: '物理',
    subjects: ['物理'],
    distance: 2.3,
    mode: 'both',
    budget: 150,
    frequency: '每周4次',
    createdAt: '3小时前',
    verified: true,
    urgent: true,
    contactName: '孙女士',
    contactPhone: '138****6320',
    fullPhone: '13876546320',
    description:
      '孩子物理基础较弱，希望老师能先补核心概念，再带着做真题。周末和工作日晚间都可以协调，上门优先，也接受线上答疑。',
    expectations: ['有高三冲刺经验', '能做阶段反馈', '沟通耐心'],
  },
  {
    id: 'req-r7',
    type: 'req',
    title: '五年级英语口语陪练',
    parentName: '周先生',
    city: '杭州',
    district: '西湖区',
    avatar:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&h=240&q=80',
    grade: '五年级',
    subject: '英语',
    subjects: ['英语'],
    distance: 4.8,
    mode: 'online',
    budget: 90,
    frequency: '每周2次',
    createdAt: '今天',
    verified: false,
    urgent: false,
    contactName: '周先生',
    contactPhone: '136****9271',
    fullPhone: '13648189271',
    description: '孩子英语阅读还不错，口语表达不够自信，希望找老师做轻松的对话练习。',
    expectations: ['口语标准', '课堂活泼', '可线上授课'],
  },
];

export const tutorTeachers = [
  {
    id: 'tutor-t2',
    type: 'tutor',
    name: '陈老师',
    title: '985 硕士 · 6年高中数学经验',
    city: '杭州',
    district: '拱墅区',
    avatar:
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=240&h=240&q=80',
    education: '浙江大学硕士',
    subjects: ['数学', '物理'],
    distance: 1.6,
    mode: 'offline',
    price: 180,
    createdAt: '1小时前活跃',
    verified: true,
    hasFreeTrial: true,
    score: 4.9,
    contactName: '陈老师',
    contactPhone: '139****2158',
    fullPhone: '13967012158',
    description:
      '擅长高中数学体系化梳理和压轴题拆解，会根据学生错题建立薄弱点清单，课后提供复盘建议。',
    expectations: ['免费试课30分钟', '可上门', '阶段测评'],
  },
  {
    id: 'tutor-t8',
    type: 'tutor',
    name: '林老师',
    title: '重点小学语文老师 · 阅读写作',
    city: '杭州',
    district: '上城区',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&h=240&q=80',
    education: '汉语言文学本科',
    subjects: ['语文'],
    distance: 3.1,
    mode: 'both',
    price: 120,
    createdAt: '昨天活跃',
    verified: true,
    hasFreeTrial: false,
    score: 4.8,
    contactName: '林老师',
    contactPhone: '137****8826',
    fullPhone: '13753318826',
    description: '长期辅导小学阅读理解和作文，课堂节奏温和，重视表达能力和阅读习惯。',
    expectations: ['阅读写作', '可线上', '耐心陪伴'],
  },
];

export const tutorItems = [...tutorRequests, ...tutorTeachers];

export function getTutorItem(id) {
  return tutorItems.find((item) => item.id === id) || tutorRequests[0];
}
