<template>
  <s-layout class="city-page" title="选择城市" navbar="inner">
    <view class="search-wrap">
      <view class="search-box ss-flex ss-col-center">
        <text class="cicon-search search-icon"></text>
        <input
          v-model="state.keyword"
          class="search-input"
          placeholder="搜索城市"
          confirm-type="search"
        />
      </view>
    </view>

    <view v-if="hotCities.length" class="section">
      <view class="section-title">热门城市</view>
      <view class="hot-grid">
        <button
          v-for="city in hotCities"
          :key="city.code"
          class="city-chip"
          :class="{ disabled: !city.opened }"
          @tap="selectCity(city)"
        >
          {{ city.name }}
        </button>
      </view>
    </view>

    <view class="section">
      <view class="section-title">全部城市</view>
      <view v-if="filteredCities.length" class="city-list">
        <view
          v-for="city in filteredCities"
          :key="city.code"
          class="city-row ss-flex ss-row-between ss-col-center"
          @tap="selectCity(city)"
        >
          <view>
            <view class="city-name">{{ city.name }}</view>
            <view class="city-meta">{{ city.province }} · {{ city.code }}</view>
          </view>
          <text v-if="city.opened" class="status open">已开通</text>
          <text v-else class="status closed">即将开放</text>
        </view>
      </view>
      <s-empty v-else text="暂无城市" icon="/static/data-empty.png" />
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import TutorCityApi from '@/sheep/api/tutor/city';

  const state = reactive({
    keyword: '',
    cities: [],
  });

  const hotCities = computed(() => state.cities.filter((city) => city.hot));

  const filteredCities = computed(() => {
    const keyword = state.keyword.trim().toLowerCase();
    if (!keyword) {
      return state.cities;
    }
    return state.cities.filter((city) => {
      return (
        city.name.toLowerCase().includes(keyword) ||
        city.code.toLowerCase().includes(keyword) ||
        city.pinyin.toLowerCase().includes(keyword)
      );
    });
  });

  async function getCityList() {
    const { code, data } = await TutorCityApi.getCityList();
    if (code !== 0) {
      return;
    }
    state.cities = data || [];
  }

  function selectCity(city) {
    if (!city.opened) {
      uni.showToast({
        title: '该城市即将开放',
        icon: 'none',
      });
      return;
    }
    uni.setStorageSync('tutor_city', city);
    uni.showToast({
      title: `已选择${city.name}`,
      icon: 'none',
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 300);
  }

  onLoad(() => {
    getCityList();
  });
</script>

<style lang="scss" scoped>
  .city-page {
    background: #f6f7fb;
    min-height: 100vh;
  }

  .search-wrap {
    padding: 20rpx 24rpx 8rpx;
  }

  .search-box {
    height: 76rpx;
    padding: 0 24rpx;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #ebeef5;
  }

  .search-icon {
    color: #8a9099;
    font-size: 30rpx;
    margin-right: 12rpx;
  }

  .search-input {
    flex: 1;
    height: 76rpx;
    font-size: 28rpx;
    color: #1f2937;
  }

  .section {
    padding: 24rpx;
  }

  .section-title {
    margin-bottom: 16rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: #111827;
  }

  .hot-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16rpx;
  }

  .city-chip {
    height: 64rpx;
    line-height: 64rpx;
    padding: 0;
    border-radius: 8rpx;
    background: #fff;
    color: #2563eb;
    font-size: 26rpx;
    border: 1px solid #dbeafe;
  }

  .city-chip.disabled {
    color: #9ca3af;
    border-color: #e5e7eb;
  }

  .city-list {
    overflow: hidden;
    border-radius: 12rpx;
    background: #fff;
  }

  .city-row {
    min-height: 96rpx;
    padding: 18rpx 24rpx;
    border-bottom: 1px solid #f1f5f9;
  }

  .city-row:last-child {
    border-bottom: 0;
  }

  .city-name {
    font-size: 28rpx;
    font-weight: 500;
    color: #111827;
  }

  .city-meta {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #8a9099;
  }

  .status {
    font-size: 24rpx;
  }

  .status.open {
    color: #10b981;
  }

  .status.closed {
    color: #9ca3af;
  }
</style>
