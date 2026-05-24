import request from '@/sheep/request';

const TutorPostApi = {
  createDemand: (data) => {
    return request({
      url: '/tutor/demands',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '提交审核中',
        showSuccess: true,
        successMsg: '需求已提交审核',
      },
    });
  },
  updateDemand: (id, data) => {
    return request({
      url: `/tutor/demands/${id}`,
      method: 'PUT',
      data,
      custom: {
        auth: true,
        loadingMsg: '保存中',
        showSuccess: true,
        successMsg: '需求已更新',
      },
    });
  },
  offlineDemand: (id) => {
    return request({
      url: `/tutor/demands/${id}`,
      method: 'DELETE',
      custom: {
        auth: true,
        loadingMsg: '下架中',
        showSuccess: true,
        successMsg: '需求已下架',
      },
    });
  },
  getMyDemandList: () => {
    return request({
      url: '/tutor/demands/my',
      method: 'GET',
      custom: {
        auth: true,
        showLoading: false,
        showError: false,
      },
    });
  },
  createResume: (data) => {
    return request({
      url: '/tutor/resumes',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '提交审核中',
        showSuccess: true,
        successMsg: '简历已提交审核',
      },
    });
  },
  updateResume: (id, data) => {
    return request({
      url: `/tutor/resumes/${id}`,
      method: 'PUT',
      data,
      custom: {
        auth: true,
        loadingMsg: '保存中',
        showSuccess: true,
        successMsg: '简历已更新',
      },
    });
  },
  offlineResume: (id) => {
    return request({
      url: `/tutor/resumes/${id}`,
      method: 'DELETE',
      custom: {
        auth: true,
        loadingMsg: '下架中',
        showSuccess: true,
        successMsg: '简历已下架',
      },
    });
  },
  getMyResumeList: () => {
    return request({
      url: '/tutor/resumes/my',
      method: 'GET',
      custom: {
        auth: true,
        showLoading: false,
        showError: false,
      },
    });
  },
};

export default TutorPostApi;
