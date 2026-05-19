import { defineStore } from 'pinia';
import $share from '@/sheep/platform/share';
import { clone } from 'lodash-es';
import app from './app';
import { showAuthModal } from '@/sheep/hooks/useModal';
import UserApi from '@/sheep/api/member/user';

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
      return this.userInfo;
    },

    resetUserData() {
      this.setToken();
      this.userInfo = clone(defaultUserInfo);
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
