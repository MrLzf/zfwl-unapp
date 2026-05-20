import request from '@/sheep/request';

const TutorParentProfileApi = {
  getProfile: () => {
    return request({
      url: '/tutor/parent-profile/get',
      method: 'GET',
      custom: {
        auth: true,
        showLoading: false,
      },
    });
  },
  saveProfile: (data) => {
    return request({
      url: '/tutor/parent-profile/save',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '保存中',
        showSuccess: true,
        successMsg: '家长资料已保存',
      },
    });
  },
};

export default TutorParentProfileApi;
