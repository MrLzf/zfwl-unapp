import request from '@/sheep/request';

const TutorPointApi = {
  getTaskList: () =>
    request({
      url: '/tutor/points/tasks',
      method: 'GET',
      custom: { auth: true, showLoading: false },
    }),
};

export default TutorPointApi;
