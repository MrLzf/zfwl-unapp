import request from '@/sheep/request';

const PointApi = {
  // 获得用户积分记录分页
  getPointRecordPage: (params = {}) => {
    const queryString = Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    return request({
      url: `/member/point/record/page${queryString ? `?${queryString}` : ''}`,
      method: 'GET',
    });
  },
};

export default PointApi;
