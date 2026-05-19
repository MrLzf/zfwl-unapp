<template>
  <s-layout title="我的" navbar="normal" tabbar="/pages/index/user" class="user-page">
    <view class="profile-card ss-flex ss-row-between ss-col-center">
      <view class="ss-flex ss-col-center">
        <image
          class="avatar"
          :src="userInfo.avatar || '/static/data-empty.png'"
          mode="aspectFill"
        />
        <view class="user-meta">
          <view class="nickname">{{ userInfo.nickname || (isLogin ? '家教用户' : '未登录') }}</view>
          <view class="mobile">{{ userInfo.mobile || '登录后管理家教档案' }}</view>
        </view>
      </view>
      <button v-if="!isLogin" class="login-btn ss-reset-button" @tap="showAuth">登录</button>
    </view>

    <view class="summary-grid">
      <view class="summary-item">
        <view class="summary-value">{{ userInfo.point || 0 }}</view>
        <view class="summary-label">积分</view>
      </view>
      <view class="summary-item">
        <view class="summary-value">{{ profile?.roleName || '-' }}</view>
        <view class="summary-label">身份</view>
      </view>
      <view class="summary-item">
        <view class="summary-value">{{ profile?.cityName || '-' }}</view>
        <view class="summary-label">城市</view>
      </view>
    </view>

    <view class="menu-list">
      <view
        class="menu-item ss-flex ss-row-between ss-col-center"
        @tap="go('/pages/tutor/identity/index')"
      >
        <text>家教档案</text>
        <text class="cicon-forward"></text>
      </view>
      <view
        class="menu-item ss-flex ss-row-between ss-col-center"
        @tap="go('/pages/tutor/city/index')"
      >
        <text>选择城市</text>
        <text class="cicon-forward"></text>
      </view>
      <view
        class="menu-item ss-flex ss-row-between ss-col-center"
        @tap="go('/pages/user/wallet/score')"
      >
        <text>积分明细</text>
        <text class="cicon-forward"></text>
      </view>
      <view class="menu-item ss-flex ss-row-between ss-col-center" @tap="go('/pages/user/info')">
        <text>账号资料</text>
        <text class="cicon-forward"></text>
      </view>
      <view
        class="menu-item ss-flex ss-row-between ss-col-center"
        @tap="go('/pages/public/setting')"
      >
        <text>系统设置</text>
        <text class="cicon-forward"></text>
      </view>
    </view>

    <button v-if="isLogin" class="logout-btn ss-reset-button" @tap="logout">退出登录</button>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, toRefs } from 'vue';
  import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { showAuthModal } from '@/sheep/hooks/useModal';
  import TutorProfileApi from '@/sheep/api/tutor/profile';

  const state = reactive({
    profile: null,
  });

  const { profile } = toRefs(state);
  const userStore = sheep.$store('user');
  const isLogin = computed(() => userStore.isLogin);
  const userInfo = computed(() => userStore.userInfo);

  function showAuth() {
    showAuthModal();
  }

  function go(url) {
    sheep.$router.go(url);
  }

  async function loadProfile() {
    if (!userStore.isLogin) {
      state.profile = null;
      return;
    }
    const { code, data } = await TutorProfileApi.getProfile();
    if (code === 0) {
      state.profile = data || null;
    }
  }

  async function refresh() {
    await userStore.updateUserData();
    await loadProfile();
  }

  async function logout() {
    await userStore.logout();
    state.profile = null;
  }

  onShow(refresh);

  onPullDownRefresh(async () => {
    await refresh();
    uni.stopPullDownRefresh();
  });
</script>

<style lang="scss" scoped>
  .user-page {
    min-height: 100vh;
    background: #f6f7fb;
  }

  .profile-card {
    margin: 24rpx;
    padding: 28rpx;
    border-radius: 12rpx;
    background: #ffffff;
    border: 1px solid #edf0f5;
  }

  .avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 48rpx;
    background: #f3f4f6;
  }

  .user-meta {
    margin-left: 20rpx;
  }

  .nickname {
    color: #111827;
    font-size: 32rpx;
    font-weight: 700;
  }

  .mobile {
    margin-top: 8rpx;
    color: #6b7280;
    font-size: 24rpx;
  }

  .login-btn {
    height: 64rpx;
    padding: 0 24rpx;
    border-radius: 32rpx;
    color: #ffffff;
    background: #2563eb;
    font-size: 26rpx;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
    padding: 0 24rpx 24rpx;
  }

  .summary-item {
    padding: 24rpx 10rpx;
    border-radius: 12rpx;
    text-align: center;
    background: #ffffff;
    border: 1px solid #edf0f5;
  }

  .summary-value {
    color: #111827;
    font-size: 30rpx;
    font-weight: 700;
  }

  .summary-label {
    margin-top: 10rpx;
    color: #6b7280;
    font-size: 23rpx;
  }

  .menu-list {
    margin: 0 24rpx;
    border-radius: 12rpx;
    background: #ffffff;
    border: 1px solid #edf0f5;
  }

  .menu-item {
    min-height: 92rpx;
    padding: 0 24rpx;
    color: #374151;
    font-size: 28rpx;
    border-bottom: 1px solid #f1f5f9;
  }

  .menu-item:last-child {
    border-bottom: 0;
  }

  .logout-btn {
    height: 84rpx;
    margin: 32rpx 24rpx;
    border-radius: 12rpx;
    color: #ef4444;
    background: #ffffff;
    font-size: 28rpx;
    border: 1px solid #fee2e2;
  }
</style>
