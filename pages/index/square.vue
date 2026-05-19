<template>
  <s-layout title="" navbar="" tabbar="/pages/index/square" class="square-page">
    <view class="square-shell">
      <view class="top-bar">
        <view>
          <view class="page-title">家教广场</view>
          <view class="page-subtitle">{{ city.name || '杭州' }} · 推荐同城高匹配信息</view>
        </view>
        <button class="city-btn ss-reset-button" @tap="goCity">
          <text class="cicon-location-on"></text>
          <text>{{ city.name || '切换' }}</text>
        </button>
      </view>

      <view class="search-panel">
        <view class="search-box">
          <text class="cicon-search"></text>
          <input v-model="keyword" placeholder="搜索科目、年级、区域" confirm-type="search" />
        </view>
        <scroll-view class="subject-scroll" scroll-x>
          <button
            v-for="subject in tutorSubjects"
            :key="subject"
            class="subject-chip ss-reset-button"
            :class="{ active: activeSubject === subject }"
            @tap="toggleSubject(subject)"
          >
            {{ subject }}
          </button>
        </scroll-view>
      </view>

      <view class="filter-tabs">
        <button
          v-for="filter in tutorFilters"
          :key="filter.value"
          class="filter-tab ss-reset-button"
          :class="{ active: activeType === filter.value }"
          @tap="activeType = filter.value"
        >
          {{ filter.label }}
        </button>
        <button class="filter-tab ss-reset-button" @tap="goFilter">筛选</button>
      </view>

      <view class="list">
        <view
          v-for="item in filteredItems"
          :key="item.id"
          class="result-card"
          @tap="goDetail(item)"
        >
          <view class="result-top">
            <image class="avatar" :src="item.avatar" mode="aspectFill" />
            <view class="result-main">
              <view class="title-row">
                <text class="result-title">{{ item.title || item.name }}</text>
                <text v-if="item.urgent" class="urgent">急</text>
              </view>
              <view class="result-meta">
                {{ item.district }} · {{ item.distance }}km · {{ modeText(item.mode) }}
              </view>
              <view class="tag-row">
                <text>{{ item.grade || item.education }}</text>
                <text v-for="subject in item.subjects" :key="subject">{{ subject }}</text>
                <text v-if="item.verified">已认证</text>
              </view>
            </view>
            <view class="price">¥{{ item.budget || item.price }}/时</view>
          </view>
          <view class="result-desc">{{ item.description }}</view>
        </view>
      </view>

      <s-empty v-if="!filteredItems.length" text="暂无匹配信息" icon="/static/data-empty.png" />
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
  import { tutorFilters, tutorItems, tutorSubjects } from '@/sheep/api/tutor/mock-data';

  const keyword = ref('');
  const activeType = ref('all');
  const activeSubject = ref('');
  const city = ref({});

  const filteredItems = computed(() => {
    const key = keyword.value.trim();
    return tutorItems.filter((item) => {
      const matchType = activeType.value === 'all' || item.type === activeType.value;
      const matchSubject = !activeSubject.value || item.subjects.includes(activeSubject.value);
      const matchKeyword =
        !key ||
        [item.title, item.name, item.grade, item.education, item.district, ...item.subjects]
          .filter(Boolean)
          .some((text) => String(text).includes(key));
      return matchType && matchSubject && matchKeyword;
    });
  });

  function modeText(mode) {
    return {
      offline: '上门',
      online: '在线',
      both: '上门/在线',
    }[mode];
  }

  function toggleSubject(subject) {
    activeSubject.value = activeSubject.value === subject ? '' : subject;
  }

  function goCity() {
    uni.navigateTo({ url: '/pages/tutor/city/index' });
  }

  function goFilter() {
    uni.navigateTo({ url: '/pages/tutor/filter/index' });
  }

  function goDetail(item) {
    uni.navigateTo({
      url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}`,
    });
  }

  function refresh() {
    city.value = uni.getStorageSync('tutor_city') || {};
  }

  onShow(refresh);
  onPullDownRefresh(() => {
    refresh();
    uni.stopPullDownRefresh();
  });
</script>

<style lang="scss" scoped>
  .square-page,
  .square-shell {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .square-shell {
    padding: calc(var(--status-bar-height) + 24rpx) 24rpx 28rpx;
  }

  .top-bar,
  .result-top,
  .title-row {
    display: flex;
    align-items: center;
  }

  .top-bar {
    justify-content: space-between;
  }

  .page-title {
    color: #111827;
    font-size: 42rpx;
    font-weight: 800;
  }

  .page-subtitle {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .city-btn {
    height: 62rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    color: #0f766e;
    background: #ecfdf5;
    font-size: 24rpx;
    font-weight: 700;
  }

  .search-panel {
    margin-top: 28rpx;
    padding: 20rpx;
    border-radius: 12rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .search-box {
    height: 76rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 0 22rpx;
    border-radius: 10rpx;
    background: #f1f5f9;
    color: #64748b;
  }

  .search-box input {
    flex: 1;
    height: 76rpx;
    color: #111827;
    font-size: 26rpx;
  }

  .subject-scroll {
    width: 100%;
    margin-top: 18rpx;
    white-space: nowrap;
  }

  .subject-chip {
    display: inline-flex;
    align-items: center;
    height: 58rpx;
    margin-right: 12rpx;
    padding: 0 22rpx;
    border-radius: 999rpx;
    color: #475569;
    background: #f8fafc;
    font-size: 24rpx;
  }

  .subject-chip.active,
  .filter-tab.active {
    color: #ffffff;
    background: #0f766e;
  }

  .filter-tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14rpx;
    margin: 22rpx 0;
  }

  .filter-tab {
    height: 64rpx;
    border-radius: 999rpx;
    color: #475569;
    background: #ffffff;
    font-size: 25rpx;
    font-weight: 700;
    border: 1px solid #e2e8f0;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }

  .result-card {
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

  .result-main {
    min-width: 0;
    flex: 1;
    margin: 0 16rpx;
  }

  .title-row {
    gap: 10rpx;
  }

  .result-title {
    overflow: hidden;
    color: #111827;
    font-size: 29rpx;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .urgent {
    flex-shrink: 0;
    padding: 2rpx 10rpx;
    border-radius: 999rpx;
    color: #dc2626;
    background: #fee2e2;
    font-size: 20rpx;
  }

  .result-meta {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .price {
    color: #f97316;
    font-size: 26rpx;
    font-weight: 800;
    white-space: nowrap;
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

  .result-desc {
    display: -webkit-box;
    overflow: hidden;
    margin-top: 20rpx;
    color: #475569;
    font-size: 25rpx;
    line-height: 38rpx;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
</style>
