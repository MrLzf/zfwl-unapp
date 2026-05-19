<template>
  <s-layout title="" navbar="" tabbar="/pages/index/index" class="tutor-home">
    <view class="home-shell">
      <view class="hero">
        <view class="hero-top">
          <view class="city-pill" @tap="goCity">
            <text class="cicon-location-on"></text>
            <text>{{ city.name || '选择城市' }}</text>
            <text class="cicon-forward"></text>
          </view>
          <button class="identity-btn ss-reset-button" @tap="goIdentity">
            {{ profile?.roleName || '选择身份' }}
          </button>
        </view>

        <view class="hero-copy">
          <view class="eyebrow">本地家教供需匹配</view>
          <view class="hero-title">为孩子找到可靠老师，为老师找到合适家庭</view>
          <view class="hero-desc">认证资料、城市筛选、积分查看联系方式，一条链路完成匹配。</view>
        </view>

        <view class="search-box" @tap="goSquare">
          <text class="cicon-search"></text>
          <text>搜索科目、年级、老师或需求</text>
        </view>

        <view class="stats-row">
          <view v-for="item in tutorStats" :key="item.label" class="stat-item">
            <view class="stat-value">{{ item.value }}</view>
            <view class="stat-label">{{ item.label }}</view>
          </view>
        </view>
      </view>

      <view class="quick-actions">
        <button class="action-card parent ss-reset-button" @tap="goPublish('parent')">
          <view class="action-label">我是家长</view>
          <view class="action-title">发布辅导需求</view>
          <view class="action-desc">描述孩子年级、科目和预算</view>
        </button>
        <button class="action-card teacher ss-reset-button" @tap="goPublish('teacher')">
          <view class="action-label">我是老师</view>
          <view class="action-title">创建教师简历</view>
          <view class="action-desc">展示认证、经验和授课范围</view>
        </button>
      </view>

      <view class="section-head">
        <view>
          <view class="section-title">今日推荐</view>
          <view class="section-subtitle">优先展示同城高匹配信息</view>
        </view>
        <button class="text-btn ss-reset-button" @tap="goSquare">全部</button>
      </view>

      <view class="feed-list">
        <view v-for="item in featuredItems" :key="item.id" class="feed-card" @tap="goDetail(item)">
          <view class="feed-main">
            <image class="avatar" :src="item.avatar" mode="aspectFill" />
            <view class="feed-content">
              <view class="feed-title">{{ item.title || item.name }}</view>
              <view class="feed-meta"
                >{{ item.district }} · {{ item.distance }}km · {{ modeText(item.mode) }}</view
              >
              <view class="tag-row">
                <text v-for="tag in item.expectations.slice(0, 2)" :key="tag">{{ tag }}</text>
              </view>
            </view>
            <view class="price">¥{{ item.budget || item.price }}/时</view>
          </view>
        </view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, toRefs } from 'vue';
  import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
  import TutorProfileApi from '@/sheep/api/tutor/profile';
  import { tutorItems, tutorStats } from '@/sheep/api/tutor/mock-data';

  const state = reactive({
    city: {},
    profile: null,
  });

  const { city, profile } = toRefs(state);
  const featuredItems = computed(() => tutorItems.slice(0, 3));

  function loadCity() {
    state.city = uni.getStorageSync('tutor_city') || {};
  }

  async function loadProfile() {
    const token = uni.getStorageSync('token');
    if (!token) {
      state.profile = uni.getStorageSync('tutor_profile') || null;
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

  function modeText(mode) {
    return {
      offline: '上门',
      online: '在线',
      both: '上门/在线',
    }[mode];
  }

  function goCity() {
    uni.navigateTo({ url: '/pages/tutor/city/index' });
  }

  function goIdentity() {
    uni.navigateTo({ url: '/pages/tutor/identity/index' });
  }

  function goSquare() {
    uni.switchTab({ url: '/pages/index/square' });
  }

  function goPublish(role) {
    uni.setStorageSync('tutor_publish_role', role);
    uni.switchTab({ url: '/pages/index/publish' });
  }

  function goDetail(item) {
    uni.navigateTo({
      url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}`,
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
    background: #f5f7f5;
  }

  .home-shell {
    min-height: 100vh;
    padding-bottom: 28rpx;
    background: #f5f7f5;
  }

  .hero {
    padding: calc(var(--status-bar-height) + 24rpx) 24rpx 30rpx;
    color: #ffffff;
    background: linear-gradient(135deg, #0f766e 0%, #155e75 55%, #1f2937 100%);
  }

  .hero-top,
  .feed-main,
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .city-pill,
  .identity-btn {
    min-height: 60rpx;
    display: flex;
    align-items: center;
    border-radius: 999rpx;
    font-size: 25rpx;
  }

  .city-pill {
    gap: 8rpx;
    padding: 0 18rpx;
    color: #ecfeff;
    background: rgba(255, 255, 255, 0.14);
  }

  .identity-btn {
    padding: 0 22rpx;
    color: #0f766e;
    background: #ffffff;
    font-weight: 600;
  }

  .hero-copy {
    padding: 54rpx 0 34rpx;
  }

  .eyebrow {
    margin-bottom: 14rpx;
    color: #a7f3d0;
    font-size: 24rpx;
    font-weight: 600;
  }

  .hero-title {
    max-width: 620rpx;
    font-size: 48rpx;
    font-weight: 800;
    line-height: 64rpx;
  }

  .hero-desc {
    max-width: 600rpx;
    margin-top: 18rpx;
    color: #d1fae5;
    font-size: 26rpx;
    line-height: 40rpx;
  }

  .search-box {
    height: 84rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 0 24rpx;
    border-radius: 12rpx;
    color: #64748b;
    background: #ffffff;
    font-size: 26rpx;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
    margin-top: 24rpx;
  }

  .stat-item {
    padding: 20rpx 8rpx;
    border-radius: 12rpx;
    text-align: center;
    background: rgba(255, 255, 255, 0.13);
  }

  .stat-value {
    font-size: 32rpx;
    font-weight: 800;
  }

  .stat-label {
    margin-top: 8rpx;
    color: #ccfbf1;
    font-size: 22rpx;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
    padding: 24rpx;
  }

  .action-card {
    min-height: 196rpx;
    margin: 0;
    padding: 24rpx;
    border-radius: 12rpx;
    text-align: left;
    border: 1px solid #e2e8f0;
    background: #ffffff;
  }

  .action-card.parent {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  .action-card.teacher {
    border-color: #bae6fd;
    background: #f0f9ff;
  }

  .action-label {
    color: #0f766e;
    font-size: 23rpx;
    font-weight: 700;
  }

  .action-title {
    margin-top: 14rpx;
    color: #111827;
    font-size: 31rpx;
    font-weight: 800;
    line-height: 40rpx;
  }

  .action-desc {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 34rpx;
  }

  .section-head {
    padding: 8rpx 24rpx 18rpx;
  }

  .section-title {
    color: #111827;
    font-size: 32rpx;
    font-weight: 800;
  }

  .section-subtitle {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .text-btn {
    color: #0f766e;
    font-size: 26rpx;
    font-weight: 700;
  }

  .feed-list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 0 24rpx;
  }

  .feed-card {
    padding: 24rpx;
    border-radius: 12rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 44rpx;
    flex-shrink: 0;
    background: #e5e7eb;
  }

  .feed-content {
    min-width: 0;
    flex: 1;
    margin: 0 18rpx;
  }

  .feed-title {
    overflow: hidden;
    color: #111827;
    font-size: 29rpx;
    font-weight: 800;
    line-height: 38rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .feed-meta {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 14rpx;
  }

  .tag-row text {
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    color: #0f766e;
    background: #ecfdf5;
    font-size: 21rpx;
  }

  .price {
    color: #f97316;
    font-size: 26rpx;
    font-weight: 800;
    white-space: nowrap;
  }
</style>
