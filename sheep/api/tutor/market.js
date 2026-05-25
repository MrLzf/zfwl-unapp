import request from '@/sheep/request';

function buildQuery(params = {}) {
  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return query ? `?${query}` : '';
}

const TutorMarketApi = {
  getDemandPage: (params = {}) => {
    return request({
      url: `/tutor/square/demands${buildQuery(params)}`,
      method: 'GET',
      custom: {
        showLoading: false,
        showError: false,
        isToken: false,
      },
    });
  },
  getResumePage: (params = {}) => {
    return request({
      url: `/tutor/square/resumes${buildQuery(params)}`,
      method: 'GET',
      custom: {
        showLoading: false,
        showError: false,
        isToken: false,
      },
    });
  },
  getDemandDetail: (id, params = {}) => {
    return request({
      url: `/tutor/square/demands/${id}${buildQuery(params)}`,
      method: 'GET',
      custom: {
        showLoading: false,
        showError: false,
        isToken: false,
      },
    });
  },
  getResumeDetail: (id, params = {}) => {
    return request({
      url: `/tutor/square/resumes/${id}${buildQuery(params)}`,
      method: 'GET',
      custom: {
        showLoading: false,
        showError: false,
        isToken: false,
      },
    });
  },
  getDetail: (targetType, id, params = {}) => {
    return request({
      url: `/tutor/detail/${targetType}/${id}${buildQuery(params)}`,
      method: 'GET',
      custom: {
        showLoading: false,
        showError: false,
        isToken: true,
      },
    });
  },
};

export default TutorMarketApi;
