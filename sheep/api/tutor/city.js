import request from '@/sheep/request';

const TutorCityApi = {
  getCityList: () => {
    return request({
      url: '/tutor/cities',
      method: 'GET',
      custom: {
        showLoading: false,
        isToken: false,
      },
    });
  },
};

export default TutorCityApi;
