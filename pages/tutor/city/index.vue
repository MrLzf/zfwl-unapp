<template>
  <s-layout class="city-page" title="选择城市" navbar="inner">
    <view class="search-wrap">
      <view class="search-box ss-flex ss-col-center">
        <text class="cicon-search search-icon"></text>
        <input
          v-model="state.keyword"
          class="search-input"
          placeholder="搜索城市名字/拼音"
          confirm-type="search"
        />
      </view>
    </view>

    <view class="section">
      <view class="section-title">当前定位城市</view>
      <view class="location-card">
        <view class="location-main">
          <view class="city-name">
            {{ state.locatedCity?.name || state.currentCity?.name || '暂未定位' }}
          </view>
          <view class="city-meta">
            {{
              state.locatedCity
                ? `${state.locatedCity.province || ''} · ${state.locatedCity.code}`
                : '定位失败时可手动选择服务城市'
            }}
          </view>
        </view>
        <button class="locate-btn ss-reset-button" :disabled="state.locating" @tap="locateCity">
          <text class="cicon-location-on"></text>
          <text>{{ state.locating ? '定位中' : '重新定位' }}</text>
        </button>
      </view>
      <view v-if="state.currentCity?.name" class="selected-tip">
        当前选择：{{ state.currentCity.name }}
      </view>
    </view>

    <view v-if="hotCities.length" class="section">
      <view class="section-title">热门城市</view>
      <view class="hot-grid">
        <button
          v-for="city in hotCities"
          :key="city.code"
          class="city-chip ss-reset-button"
          :class="{ disabled: !city.opened, selected: state.currentCity?.code === city.code }"
          @tap="selectCity(city)"
        >
          {{ city.name }}
        </button>
      </view>
    </view>

    <view class="section">
      <view class="section-title">全部城市</view>
      <view v-if="groupedCities.length" class="city-list">
        <view v-for="group in groupedCities" :key="group.letter" class="city-group">
          <view class="letter-row">{{ group.letter }}</view>
          <view
            v-for="city in group.cities"
            :key="city.code"
            class="city-row ss-flex ss-row-between ss-col-center"
            :class="{ selected: state.currentCity?.code === city.code }"
            @tap="selectCity(city)"
          >
            <view>
              <view class="city-name">{{ city.name }}</view>
              <view class="city-meta">{{ city.province }} · {{ city.pinyin || city.code }}</view>
            </view>
            <text v-if="city.opened" class="status open">已开通</text>
            <text v-else class="status closed">即将开放</text>
          </view>
        </view>
      </view>
      <s-empty v-else text="暂无城市" icon="/static/data-empty.png" />
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import TutorCityApi from '@/sheep/api/tutor/city';
  import {
    getLocationPayload,
    requestTencentLocation,
    setCachedLocation,
  } from '@/sheep/api/tutor/location';
  import TutorProfileApi from '@/sheep/api/tutor/profile';
  import { fallbackTutorCities, nearestCityByLocation } from '@/sheep/api/tutor/utils';

  const userStore = sheep.$store('user');

  const state = reactive({
    keyword: '',
    cities: [],
    currentCity: null,
    locatedCity: null,
    locating: false,
  });

  const hotCities = computed(() => state.cities.filter((city) => city.hot));

  const filteredCities = computed(() => {
    const keyword = state.keyword.trim().toLowerCase();
    const cities = [...state.cities].sort((a, b) => (a.sort || 0) - (b.sort || 0));
    if (!keyword) {
      return cities;
    }
    return cities.filter((city) => {
      return (
        String(city.name || '')
          .toLowerCase()
          .includes(keyword) ||
        String(city.code || '')
          .toLowerCase()
          .includes(keyword) ||
        String(city.pinyin || '')
          .toLowerCase()
          .includes(keyword)
      );
    });
  });

  const groupedCities = computed(() => {
    const map = filteredCities.value.reduce((result, city) => {
      const letter = String(city.pinyin || city.name || '#')
        .slice(0, 1)
        .toUpperCase();
      const key = /^[A-Z]$/.test(letter) ? letter : '#';
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(city);
      return result;
    }, {});
    return Object.keys(map)
      .sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
      .map((letter) => ({ letter, cities: map[letter] }));
  });

  function normalizeCities(cities = []) {
    return cities.map((city) => {
      const fallback = fallbackTutorCities.find((item) => item.code === city.code) || {};
      return {
        ...fallback,
        ...city,
        opened: city.opened !== false,
        hot: Boolean(city.hot),
      };
    });
  }

  async function getCityList() {
    const result = await TutorCityApi.getCityList();
    if (result?.code === 0 && Array.isArray(result.data) && result.data.length) {
      state.cities = normalizeCities(result.data);
      return;
    }
    state.cities = fallbackTutorCities;
  }

  function loadCurrentCity() {
    state.currentCity = uni.getStorageSync('tutor_city') || null;
    state.locatedCity = uni.getStorageSync('tutor_located_city') || null;
  }

  function syncLocalProfileCity(selected) {
    const profile = userStore.tutorProfile || uni.getStorageSync('tutor_profile');
    if (!profile) {
      return;
    }
    userStore.setTutorProfile({
      ...profile,
      cityId: selected.id,
      cityCode: selected.code,
      cityName: selected.name,
    });
  }

  async function syncRemoteProfileCity(selected) {
    if (!userStore.isLogin || !userStore.tutorProfile?.role) {
      return;
    }
    const profile = userStore.tutorProfile || {};
    const location = getLocationPayload(profile);
    const result = await TutorProfileApi.updateLocation({
      cityCode: selected.code,
      longitude: location.longitude,
      latitude: location.latitude,
      locationAddress: selected.name,
    });
    if (result?.code === 0) {
      userStore.setTutorProfile(result.data);
      return true;
    }
    return false;
  }

  async function selectCity(city) {
    if (!city.opened) {
      uni.showToast({
        title: '该城市即将开放',
        icon: 'none',
      });
      return;
    }
    const selected = {
      id: city.id,
      code: city.code,
      name: city.name,
      pinyin: city.pinyin,
      province: city.province,
      opened: city.opened,
      hot: city.hot,
    };
    state.currentCity = selected;
    uni.setStorageSync('tutor_city', selected);
    syncLocalProfileCity(selected);
    try {
      const synced = await syncRemoteProfileCity(selected);
      uni.showToast({
        title: synced === false ? '城市已本地切换，档案同步失败' : `已选择${city.name}`,
        icon: 'none',
      });
    } catch (error) {
      uni.showToast({
        title: '城市已本地切换，档案同步失败',
        icon: 'none',
      });
    }
    setTimeout(() => {
      uni.navigateBack();
    }, 300);
  }

  async function locateCity() {
    state.locating = true;
    try {
      const location = await requestTencentLocation();
      const matched =
        nearestCityByLocation(state.cities, location.longitude, location.latitude) ||
        state.cities.find((city) => city.opened);
      if (!matched) {
        uni.showToast({ title: '暂未匹配到开通城市', icon: 'none' });
        return;
      }
      state.locatedCity = matched;
      uni.setStorageSync('tutor_located_city', matched);
      setCachedLocation({
        ...location,
        cityCode: matched.code,
        cityName: matched.name,
      });
      if (!state.currentCity?.code && matched.opened) {
        state.currentCity = matched;
        uni.setStorageSync('tutor_city', matched);
      }
      uni.showToast({ title: `定位到${matched.name}`, icon: 'none' });
    } catch (error) {
      uni.showToast({
        title: '定位授权失败，请手动选择城市',
        icon: 'none',
      });
    } finally {
      state.locating = false;
    }
  }

  onLoad(async () => {
    loadCurrentCity();
    await getCityList();
    if (!state.currentCity?.code && !state.locatedCity?.code) {
      locateCity();
    }
  });
</script>

<style lang="scss" scoped>
  .city-page {
    min-height: 100vh;
    background: #f6f7fb;
  }

  .search-wrap {
    padding: 20rpx 24rpx 8rpx;
  }

  .search-box {
    height: 76rpx;
    padding: 0 24rpx;
    border-radius: 38rpx;
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
    font-weight: 700;
    color: #111827;
  }

  .location-card,
  .city-list {
    overflow: hidden;
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #edf0f5;
  }

  .location-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding: 24rpx;
  }

  .location-main {
    min-width: 0;
    flex: 1;
  }

  .locate-btn {
    flex-shrink: 0;
    height: 62rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 0 22rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 24rpx;
    font-weight: 700;
  }

  .selected-tip {
    margin-top: 14rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .hot-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16rpx;
  }

  .city-chip {
    height: 68rpx;
    line-height: 68rpx;
    padding: 0;
    border-radius: 12rpx;
    background: #fff;
    color: #334155;
    font-size: 26rpx;
    border: 1px solid #e2e8f0;
  }

  .city-chip.selected,
  .city-row.selected {
    color: #2563eb;
    background: #eff6ff;
    border-color: #bfdbfe;
  }

  .city-chip.disabled {
    color: #9ca3af;
    border-color: #e5e7eb;
    background: #f8fafc;
  }

  .city-row {
    min-height: 96rpx;
    padding: 18rpx 24rpx;
    border-bottom: 1px solid #f1f5f9;
  }

  .letter-row {
    padding: 12rpx 24rpx;
    color: #64748b;
    background: #f8fafc;
    font-size: 22rpx;
    font-weight: 800;
  }

  .city-group:last-child .city-row:last-child {
    border-bottom: 0;
  }

  .city-name {
    font-size: 30rpx;
    font-weight: 700;
    color: #111827;
  }

  .city-meta {
    margin-top: 8rpx;
    font-size: 23rpx;
    color: #8a9099;
  }

  .status {
    flex-shrink: 0;
    font-size: 24rpx;
  }

  .status.open {
    color: #10b981;
  }

  .status.closed {
    color: #9ca3af;
  }
</style>
