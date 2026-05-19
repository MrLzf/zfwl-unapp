<template>
  <s-layout title="家教" navbar="normal" tabbar="/pages/index/index" class="tutor-home">
    <view class="hero">
      <view class="hero-top ss-flex ss-row-between ss-col-center">
        <view>
          <view class="city" @tap="goCity">
            {{ city.name || '选择城市' }}
            <text class="cicon-forward"></text>
          </view>
          <view class="subtitle">找老师、找家长，从真实资料开始</view>
        </view>
        <button class="identity-btn ss-reset-button" @tap="goIdentity">
          {{ profile?.roleName || '选择身份' }}
        </button>
      </view>

      <view class="search-card ss-flex ss-col-center" @tap="goCity">
        <text class="cicon-search"></text>
        <text class="search-text">按城市、科目、年级筛选家教信息</text>
      </view>
    </view>

    <view class="quick-grid">
      <button class="quick-item ss-reset-button" @tap="goIdentity">
        <view class="quick-title">我是家长</view>
        <view class="quick-desc">发布辅导需求</view>
      </button>
      <button class="quick-item ss-reset-button" @tap="goIdentity">
        <view class="quick-title">我是老师</view>
        <view class="quick-desc">完善教师简历</view>
      </button>
    </view>

    <view class="section">
      <view class="section-title">当前进度</view>
      <view class="status-list">
        <view class="status-item ss-flex ss-row-between ss-col-center">
          <text>服务城市</text>
          <text>{{ city.name || '未选择' }}</text>
        </view>
        <view class="status-item ss-flex ss-row-between ss-col-center">
          <text>家教身份</text>
          <text>{{ profile?.roleName || '未选择' }}</text>
        </view>
        <view class="status-item ss-flex ss-row-between ss-col-center">
          <text>定位状态</text>
          <text>{{ profile?.longitude && profile?.latitude ? '已更新' : '未更新' }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">推荐信息</view>
      <view class="empty-panel">
        <s-empty text="需求和简历广场正在接入中" icon="/static/data-empty.png" />
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { reactive, toRefs } from 'vue';
  import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
  import TutorProfileApi from '@/sheep/api/tutor/profile';

  const state = reactive({
    city: {},
    profile: null,
  });

  const { city, profile } = toRefs(state);

  function loadCity() {
    state.city = uni.getStorageSync('tutor_city') || {};
  }

  async function loadProfile() {
    const token = uni.getStorageSync('token');
    if (!token) {
      state.profile = null;
      return;
    }
    const { code, data } = await TutorProfileApi.getProfile();
    if (code !== 0) {
      return;
    }
    state.profile = data || null;
    if (data?.cityCode) {
      state.city = {
        id: data.cityId,
        code: data.cityCode,
        name: data.cityName,
      };
      uni.setStorageSync('tutor_city', state.city);
      uni.setStorageSync('tutor_profile', data);
    }
  }

  function goCity() {
    uni.navigateTo({
      url: '/pages/tutor/city/index',
    });
  }

  function goIdentity() {
    uni.navigateTo({
      url: '/pages/tutor/identity/index',
    });
  }

  async function refresh() {
    loadCity();
    await loadProfile();
  }

  onShow(refresh);

  onPullDownRefresh(async () => {
    await refresh();
    uni.stopPullDownRefresh();
  });
</script>

<style lang="scss" scoped>
  .tutor-home {
    min-height: 100vh;
    background: #f6f7fb;
  }

  .hero {
    padding: 28rpx 24rpx 32rpx;
    background: #ffffff;
  }

  .city {
    color: #111827;
    font-size: 38rpx;
    font-weight: 700;
  }

  .subtitle {
    margin-top: 10rpx;
    color: #6b7280;
    font-size: 26rpx;
  }

  .identity-btn {
    height: 64rpx;
    padding: 0 24rpx;
    border-radius: 32rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 26rpx;
  }

  .search-card {
    height: 84rpx;
    margin-top: 28rpx;
    padding: 0 24rpx;
    border-radius: 12rpx;
    background: #f3f4f6;
    color: #6b7280;
    font-size: 26rpx;
  }

  .search-text {
    margin-left: 12rpx;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
    padding: 24rpx;
  }

  .quick-item {
    min-height: 150rpx;
    padding: 24rpx;
    border-radius: 12rpx;
    text-align: left;
    background: #ffffff;
    border: 1px solid #edf0f5;
  }

  .quick-title {
    color: #111827;
    font-size: 32rpx;
    font-weight: 700;
  }

  .quick-desc {
    margin-top: 14rpx;
    color: #6b7280;
    font-size: 25rpx;
  }

  .section {
    padding: 0 24rpx 24rpx;
  }

  .section-title {
    margin-bottom: 16rpx;
    color: #111827;
    font-size: 30rpx;
    font-weight: 700;
  }

  .status-list,
  .empty-panel {
    border-radius: 12rpx;
    background: #ffffff;
    border: 1px solid #edf0f5;
  }

  .status-item {
    padding: 24rpx;
    color: #4b5563;
    font-size: 26rpx;
    border-bottom: 1px solid #f1f5f9;
  }

  .status-item:last-child {
    border-bottom: 0;
  }

  .empty-panel {
    padding: 40rpx 0;
  }
</style>
