import request from '@/sheep/request';

const authSilent = { auth: true, showLoading: false, showError: false };
const authLoading = (loadingMsg) => ({
  auth: true,
  showLoading: true,
  loadingMsg,
  showError: false,
});

const buildQuery = (params = {}) => {
  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return query ? `?${query}` : '';
};

const TutorP1Api = {
  getPointPackages: () =>
    request({ url: '/tutor/point-packages', method: 'GET', custom: authSilent }),
  createPointRechargeOrder: (data) =>
    request({
      url: '/tutor/point-recharge/orders',
      method: 'POST',
      data,
      custom: authLoading('创建订单中'),
    }),
  getPointRechargeOrder: (id) =>
    request({
      url: `/tutor/point-recharge/orders/${encodeURIComponent(id)}`,
      method: 'GET',
      custom: authSilent,
    }),
  getInviteSummary: () =>
    request({ url: '/tutor/invite/summary', method: 'GET', custom: authSilent }),
  getInviteRecords: (params = {}) =>
    request({
      url: `/tutor/invite/records${buildQuery(params)}`,
      method: 'GET',
      custom: authSilent,
    }),
  getValueServices: (params = {}) =>
    request({
      url: `/tutor/value-services${buildQuery(params)}`,
      method: 'GET',
      custom: authSilent,
    }),
  createValueServiceOrder: (data) =>
    request({
      url: '/tutor/value-services/orders',
      method: 'POST',
      data,
      custom: authLoading('购买服务中'),
    }),
  getVipProducts: () => request({ url: '/tutor/vip/products', method: 'GET', custom: authSilent }),
  getVipStatus: () => request({ url: '/tutor/vip/status', method: 'GET', custom: authSilent }),
  createVipOrder: (data) =>
    request({
      url: '/tutor/vip/orders',
      method: 'POST',
      data,
      custom: authLoading('开通会员中'),
    }),
  getSubscribeSettings: () =>
    request({ url: '/tutor/subscribe/settings', method: 'GET', custom: authSilent }),
  updateSubscribeSettings: (data) =>
    request({
      url: '/tutor/subscribe/settings',
      method: 'PUT',
      data,
      custom: authLoading('保存设置中'),
    }),
  getCustomerServiceSession: () =>
    request({ url: '/tutor/customer-service/sessions/current', method: 'GET', custom: authSilent }),
  createCustomerServiceSession: () =>
    request({
      url: '/tutor/customer-service/sessions',
      method: 'POST',
      custom: authLoading('连接客服中'),
    }),
  getCustomerServiceMessages: (sessionId) =>
    request({
      url: `/tutor/customer-service/sessions/${encodeURIComponent(sessionId)}/messages`,
      method: 'GET',
      custom: authSilent,
    }),
  sendCustomerServiceMessage: (sessionId, data) =>
    request({
      url: `/tutor/customer-service/sessions/${encodeURIComponent(sessionId)}/messages`,
      method: 'POST',
      data,
      custom: authLoading('发送中'),
    }),
  createComplaint: (data) =>
    request({
      url: '/tutor/complaints',
      method: 'POST',
      data,
      custom: authLoading('提交举报中'),
    }),
};

export default TutorP1Api;
