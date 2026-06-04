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

const TutorP2Api = {
  createTrialAppointment: (data) =>
    request({
      url: '/tutor/trial-appointments',
      method: 'POST',
      data,
      custom: authLoading('提交预约中'),
    }),
  getMyTrialAppointments: (params = {}) =>
    request({
      url: `/tutor/trial-appointments/my${buildQuery(params)}`,
      method: 'GET',
      custom: authSilent,
    }),
  confirmTrialAppointment: (id) =>
    request({
      url: `/tutor/trial-appointments/${encodeURIComponent(id)}/confirm`,
      method: 'POST',
      custom: authLoading('确认预约中'),
    }),
  createEscrowTrade: (data) =>
    request({
      url: '/tutor/escrow-trades',
      method: 'POST',
      data,
      custom: authLoading('创建担保交易中'),
    }),
  getMyEscrowTrades: (params = {}) =>
    request({
      url: `/tutor/escrow-trades/my${buildQuery(params)}`,
      method: 'GET',
      custom: authSilent,
    }),
  confirmEscrowComplete: (id) =>
    request({
      url: `/tutor/escrow-trades/${encodeURIComponent(id)}/complete`,
      method: 'POST',
      custom: authLoading('确认完成中'),
    }),
  applyEscrowRefund: (id, data) =>
    request({
      url: `/tutor/escrow-trades/${encodeURIComponent(id)}/refund`,
      method: 'POST',
      data,
      custom: authLoading('提交退款/争议中'),
    }),
};

export default TutorP2Api;
