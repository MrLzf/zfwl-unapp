import request from '@/sheep/request';

const authSilent = {
  auth: true,
  showLoading: false,
  showError: false,
};

const TutorInteractionApi = {
  addFavorite: (data) => {
    return request({
      url: '/tutor/favorites',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '收藏中',
        showError: false,
      },
    });
  },
  removeFavorite: (data) => {
    return request({
      url: '/tutor/favorites',
      method: 'DELETE',
      data,
      custom: {
        auth: true,
        loadingMsg: '取消中',
        showError: false,
      },
    });
  },
  getFavoriteList: () => {
    return request({
      url: '/tutor/favorites',
      method: 'GET',
      custom: authSilent,
    });
  },
  getBrowseHistoryList: () => {
    return request({
      url: '/tutor/browse-history/my',
      method: 'GET',
      custom: authSilent,
    });
  },
  removeBrowseHistory: (id) => {
    return request({
      url: `/tutor/browse-history/${id}`,
      method: 'DELETE',
      custom: authSilent,
    });
  },
  clearBrowseHistory: () => {
    return request({
      url: '/tutor/browse-history/my',
      method: 'DELETE',
      custom: authSilent,
    });
  },
  viewContact: (data) => {
    return request({
      url: '/tutor/contact/view',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '扣分查看中',
        showError: false,
      },
    });
  },
  getContactRecordList: () => {
    return request({
      url: '/tutor/contact/records',
      method: 'GET',
      custom: authSilent,
    });
  },
  getMatchList: () => {
    return request({
      url: '/tutor/matches/my',
      method: 'GET',
      custom: authSilent,
    });
  },
  confirmMatch: (id) => {
    return request({
      url: `/tutor/matches/${id}/confirm`,
      method: 'POST',
      custom: {
        auth: true,
        loadingMsg: '确认中',
        showError: false,
      },
    });
  },
  createReview: (data) => {
    return request({
      url: '/tutor/reviews',
      method: 'POST',
      data,
      custom: {
        auth: true,
        loadingMsg: '提交评价中',
        showError: false,
      },
    });
  },
  getMyReviewList: () => {
    return request({
      url: '/tutor/reviews/my',
      method: 'GET',
      custom: authSilent,
    });
  },
  getTargetReviewList: (targetUserId) => {
    return request({
      url: `/tutor/reviews/target?targetUserId=${encodeURIComponent(targetUserId)}`,
      method: 'GET',
      custom: {
        showLoading: false,
        showError: false,
        isToken: false,
      },
    });
  },
};

export default TutorInteractionApi;
