import request from '@/sheep/request';

const TutorProfileApi = {
  getProfile: () => {
    return request({
      url: '/tutor/profile/get',
      method: 'GET',
      custom: {
        auth: true,
        showLoading: false,
      },
    });
  },
  getProfileSilent: () => {
    return request({
      url: '/tutor/profile/get',
      method: 'GET',
      custom: {
        auth: true,
        showLoading: false,
        showError: false,
      },
    });
  },
  initProfile: (data) => {
    return request({
      url: '/tutor/profile/init',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '保存中',
        showSuccess: true,
        successMsg: '身份已选择',
      },
    });
  },
  updateLocation: (data) => {
    return request({
      url: '/tutor/profile/location',
      method: 'PUT',
      data,
      custom: {
        auth: true,
        loadingMsg: '定位更新中',
        showSuccess: true,
        successMsg: '定位已更新',
      },
    });
  },
};

export default TutorProfileApi;
