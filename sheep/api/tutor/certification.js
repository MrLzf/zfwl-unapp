import request from '@/sheep/request';

const TutorCertificationApi = {
  getMyCertification: ({ silent = false } = {}) => {
    return request({
      url: '/tutor/certification/my',
      method: 'GET',
      custom: {
        auth: true,
        showLoading: !silent,
        showError: !silent,
      },
    });
  },
  submitCertification: (data) => {
    return request({
      url: '/tutor/certification/submit',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '提交审核中',
        showSuccess: true,
        successMsg: '认证资料已提交',
      },
    });
  },
};

export default TutorCertificationApi;
