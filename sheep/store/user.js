import { defineStore } from 'pinia';
import $share from '@/sheep/platform/share';
import { clone } from 'lodash-es';
import app from './app';
import { showAuthModal } from '@/sheep/hooks/useModal';
import UserApi from '@/sheep/api/member/user';
import TutorProfileApi from '@/sheep/api/tutor/profile';

const defaultUserInfo = {
  avatar: '',
  nickname: '',
  gender: 0,
  mobile: '',
  point: 0,
};

const user = defineStore({
  id: 'user',
  state: () => ({
    userInfo: clone(defaultUserInfo),
    tutorProfile: uni.getStorageSync('tutor_profile') || null,
    isLogin: !!uni.getStorageSync('token'),
    lastUpdateTime: 0,
  }),

  actions: {
    async getInfo() {
      const { code, data } = await UserApi.getUserInfo();
      if (code !== 0) {
        return;
      }
      this.userInfo = data;
      return data;
    },

    setTutorProfile(profile = null) {
      this.tutorProfile = profile || null;
      if (!profile) {
        uni.removeStorageSync('tutor_profile');
        return this.tutorProfile;
      }
      uni.setStorageSync('tutor_profile', profile);
      if (profile.cityCode) {
        uni.setStorageSync('tutor_city', {
          id: profile.cityId,
          code: profile.cityCode,
          name: profile.cityName,
        });
      }
      return this.tutorProfile;
    },

    async getTutorProfile({ silent = true } = {}) {
      if (!this.isLogin) {
        this.setTutorProfile(null);
        return null;
      }
      const result = silent
        ? await TutorProfileApi.getProfileSilent()
        : await TutorProfileApi.getProfile();
      if (result?.code === 0) {
        this.setTutorProfile(result.data || null);
      }
      return this.tutorProfile;
    },

    setToken(token = '', refreshToken = '') {
      if (token === '') {
        this.isLogin = false;
        uni.removeStorageSync('token');
        uni.removeStorageSync('refresh-token');
      } else {
        this.isLogin = true;
        uni.setStorageSync('token', token);
        uni.setStorageSync('refresh-token', refreshToken);
        this.loginAfter();
      }
      return this.isLogin;
    },

    async updateUserData() {
      if (!this.isLogin) {
        this.resetUserData();
        return;
      }
      const nowTime = new Date().getTime();
      if (this.lastUpdateTime + 5000 > nowTime) {
        return;
      }
      this.lastUpdateTime = nowTime;

      await this.getInfo();
      await this.getTutorProfile();
      return this.userInfo;
    },

    resetUserData() {
      this.setToken();
      this.userInfo = clone(defaultUserInfo);
      this.setTutorProfile(null);
    },

    async loginAfter() {
      await this.updateUserData();
      $share.getShareInfo();

      if (app().platform.bind_mobile && !this.userInfo.mobile) {
        showAuthModal('changeMobile');
      }
    },

    async logout() {
      this.resetUserData();
      return !this.isLogin;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-store',
      },
    ],
  },
});

export default user;
