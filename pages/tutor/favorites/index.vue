<template>
  <s-layout class="page" title="我的收藏" navbar="inner">
    <view class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab ss-reset-button"
        :class="{ active: activeTab === tab.value }"
        @tap="activeTab = tab.value"
      >
        {{ tab.label }} ({{ tab.count }})
      </button>
    </view>

    <view v-if="state.loading" class="state-card">加载中...</view>

    <view v-else-if="filteredItems.length" class="list">
      <view v-for="item in filteredItems" :key="item.key" class="card" @tap="goDetail(item)">
        <image class="avatar" :src="item.avatar || '/static/data-empty.png'" mode="aspectFill" />
        <view class="main">
          <view class="title-row">
            <view class="title">{{ item.title || item.name }}</view>
            <text class="type-tag">{{ item.targetType === 'resume' ? '教师' : '需求' }}</text>
          </view>
          <view class="meta"
            >{{ item.cityName || item.city || item.district || '同城' }} ·
            {{ timeText(item) }}</view
          >
          <view class="desc">{{
            item.description || item.subjects?.join('、') || '点击查看详情'
          }}</view>
        </view>
        <button class="heart-btn ss-reset-button" @tap.stop="remove(item)">
          <text class="cicon-favorite"></text>
        </button>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <s-empty
        :text="activeTab === 'resume' ? '还没有收藏教师' : '还没有收藏需求'"
        icon="/static/data-empty.png"
      />
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import TutorInteractionApi from '@/sheep/api/tutor/interaction';
  import {
    getLocalFavorites,
    getLocalItem,
    isLocalDemoTarget,
    getTargetType,
    getUiType,
    isNumericId,
    removeLocalFavorite,
    targetKey,
  } from '@/sheep/api/tutor/local-state';
  import { formatDateTime, normalizeDemand, normalizeResume } from '@/sheep/api/tutor/utils';

  const activeTab = ref('resume');
  const state = reactive({
    loading: false,
    items: [],
  });

  const tabs = computed(() => [
    {
      label: '教师',
      value: 'resume',
      count: state.items.filter((item) => item.targetType === 'resume').length,
    },
    {
      label: '需求',
      value: 'demand',
      count: state.items.filter((item) => item.targetType === 'demand').length,
    },
  ]);

  const filteredItems = computed(() =>
    state.items.filter((item) => item.targetType === activeTab.value),
  );

  function normalizeFavorite(item, index = 0) {
    if (item.type === 'tutor' || item.targetType === 'resume') {
      const source = item.type
        ? item
        : isNumericId(item.targetId)
        ? item
        : getLocalItem('resume', item.targetId);
      if (!source) return null;
      return {
        ...normalizeResume(source, index),
        ...item,
        id: item.targetId || item.id,
        targetType: 'resume',
        key: targetKey('resume', item.targetId || item.id),
      };
    }
    const source = item.type
      ? item
      : isNumericId(item.targetId)
      ? item
      : getLocalItem('demand', item.targetId);
    if (!source) return null;
    return {
      ...normalizeDemand(source, index),
      ...item,
      id: item.targetId || item.id,
      targetType: 'demand',
      key: targetKey('demand', item.targetId || item.id),
    };
  }

  function timeText(item) {
    return formatDateTime(item.favoriteAt || item.createTime, '已收藏');
  }

  async function load() {
    state.loading = true;
    const localItems = getLocalFavorites().filter(isLocalDemoTarget).map(normalizeFavorite).filter(Boolean);
    const result = await TutorInteractionApi.getFavoriteList();
    if (result?.code === 0) {
      const remote = (result.data || []).map(normalizeFavorite).filter(Boolean);
      state.items = [...remote, ...localItems];
    } else {
      state.items = localItems;
    }
    state.loading = false;
  }

  async function remove(item) {
    if (!item.local && isNumericId(item.id)) {
      const result = await TutorInteractionApi.removeFavorite({
        targetType: item.targetType,
        targetId: Number(item.id),
      });
      if (result && result.code !== 0) {
        uni.showToast({ title: result.msg || '取消失败', icon: 'none' });
        return;
      }
    }
    removeLocalFavorite(item.targetType, item.id);
    state.items = state.items.filter((record) => record.key !== item.key);
    uni.showToast({ title: '已取消收藏', icon: 'none' });
  }

  function goDetail(item) {
    uni.navigateTo({
      url: `/pages/tutor/detail/index?type=${getUiType(item.targetType)}&targetType=${getTargetType(
        item.targetType,
      )}&id=${item.id}`,
    });
  }

  onShow(load);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f8fafc;
  }

  .tabs {
    display: flex;
    gap: 10rpx;
    margin: 24rpx;
    padding: 8rpx;
    border-radius: 16rpx;
    background: #e2e8f0;
  }

  .tab {
    flex: 1;
    height: 68rpx;
    border-radius: 12rpx;
    color: #64748b;
    font-size: 26rpx;
    font-weight: 800;
  }

  .tab.active {
    color: #2563eb;
    background: #ffffff;
    box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.08);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 0 24rpx 24rpx;
  }

  .card,
  .state-card {
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .card {
    position: relative;
    display: flex;
    gap: 18rpx;
    padding: 24rpx;
  }

  .avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 48rpx;
    flex-shrink: 0;
    background: #e5e7eb;
  }

  .main {
    min-width: 0;
    flex: 1;
    padding-right: 48rpx;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .title {
    overflow: hidden;
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .type-tag {
    flex-shrink: 0;
    padding: 4rpx 10rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 20rpx;
    font-weight: 700;
  }

  .meta,
  .desc {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 36rpx;
  }

  .desc {
    display: -webkit-box;
    overflow: hidden;
    color: #475569;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .heart-btn {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 54rpx;
    height: 54rpx;
    color: #ef4444;
    font-size: 34rpx;
  }

  .state-card {
    margin: 24rpx;
    padding: 48rpx;
    color: #64748b;
    text-align: center;
  }

  .empty-wrap {
    padding-top: 80rpx;
  }
</style>
