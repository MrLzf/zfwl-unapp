import request from '@/sheep/request';

const TutorTeacherProfileApi = {
  getProfile: ({ silent = false } = {}) => {
    return request({
      url: '/tutor/teacher-profile/get',
      method: 'GET',
      custom: {
        auth: true,
        showLoading: !silent,
        showError: !silent,
      },
    });
  },
  saveProfile: (data) => {
    return request({
      url: '/tutor/teacher-profile/save',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '保存中',
        showSuccess: true,
        successMsg: '教师资料已保存',
      },
    });
  },
};

export default TutorTeacherProfileApi;
