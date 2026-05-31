import request from '@/sheep/request';

const custom = { auth: true, showLoading: false, showError: false };

const TutorMessageApi = {
  getSummary: () => request({ url: '/tutor/messages/summary', method: 'GET', custom }),
  getPage: ({ category, pageNo, pageSize }) =>
    request({
      url: `/tutor/messages/page?category=${encodeURIComponent(
        category,
      )}&pageNo=${pageNo}&pageSize=${pageSize}`,
      method: 'GET',
      custom,
    }),
  markRead: (id) =>
    request({
      url: `/tutor/messages/read?id=${encodeURIComponent(id)}`,
      method: 'PUT',
      custom,
    }),
  markAllRead: (category) =>
    request({
      url: `/tutor/messages/read-all${category ? `?category=${encodeURIComponent(category)}` : ''}`,
      method: 'PUT',
      custom,
    }),
};

export default TutorMessageApi;
