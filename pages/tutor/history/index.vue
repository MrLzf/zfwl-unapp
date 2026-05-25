<template>
  <s-layout class="page" title="浏览历史" navbar="inner">
    <view class="header-row">
      <view>
        <view class="title">浏览历史</view>
        <view class="subtitle">最近查看的教师和需求会自动记录</view>
      </view>
      <button class="clear-btn ss-reset-button" @tap="clear">清空</button>
    </view>

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

    <view v-else-if="filteredItems.length" class="timeline">
      <view v-for="item in filteredItems" :key="item.key" class="history-block">
        <view class="time-line">
          <text class="cicon-time"></text>
          <text>{{ item.viewedAt || item.createTime }}</text>
          <button class="delete-btn ss-reset-button" @tap.stop="remove(item)">删除</button>
        </view>
        <view class="history-card" @tap="goDetail(item)">
          <view class="dot"></view>
          <view class="content">
            <view class="head">
              <text class="card-title">{{ item.title || item.name }}</text>
              <text class="type-tag">{{ item.targetType === 'resume' ? '教师' : '需求' }}</text>
            </view>
            <view class="meta"
              >{{ item.cityName || item.city || item.district || '同城' }} ·
              {{ item.subjects?.join('、') || '点击查看详情' }}</view
            >
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <s-empty text="暂无浏览历史" icon="/static/data-empty.png" />
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import TutorInteractionApi from '@/sheep/api/tutor/interaction';
  import {
    clearLocalHistory,
    getLocalHistory,
    getLocalItem,
    getTargetType,
    getUiType,
    isNumericId,
    targetKey,
  } from '@/sheep/api/tutor/local-state';
  import { normalizeDemand, normalizeResume } from '@/sheep/api/tutor/utils';

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

  function normalizeHistory(item, index = 0) {
    const targetType = getTargetType(item.targetType || item.type);
    if (targetType === 'resume') {
      const source = item.type
        ? item
        : isNumericId(item.targetId)
        ? item
        : getLocalItem('resume', item.targetId);
      return {
        ...normalizeResume(source, index),
        ...item,
        id: item.targetId || item.id,
        targetType,
        key: targetKey(targetType, item.targetId || item.id),
      };
    }
    const source = item.type
      ? item
      : isNumericId(item.targetId)
      ? item
      : getLocalItem('demand', item.targetId);
    return {
      ...normalizeDemand(source, index),
      ...item,
      id: item.targetId || item.id,
      targetType,
      key: targetKey(targetType, item.targetId || item.id),
    };
  }

  async function load() {
    state.loading = true;
    const localItems = getLocalHistory().map(normalizeHistory);
    const result = await TutorInteractionApi.getBrowseHistoryList();
    if (result?.code === 0) {
      const remote = (result.data || []).map(normalizeHistory);
      const map = new Map([...remote, ...localItems].map((item) => [item.key, item]));
      state.items = [...map.values()];
    } else {
      state.items = localItems;
    }
    state.loading = false;
  }

  function remove(item) {
    state.items = state.items.filter((record) => record.key !== item.key);
    const localLeft = getLocalHistory().filter((record) => record.key !== item.key);
    uni.setStorageSync('tutor_local_history', localLeft);
    uni.showToast({ title: '已删除', icon: 'none' });
  }

  function clear() {
    uni.showModal({
      title: '清空浏览历史',
      content: '清空后本地浏览记录将不可恢复。',
      confirmText: '清空',
      success: (res) => {
        if (!res.confirm) return;
        clearLocalHistory();
        state.items = [];
        uni.showToast({ title: '已清空', icon: 'none' });
      },
    });
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

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
  }

  .title {
    color: #0f172a;
    font-size: 36rpx;
    font-weight: 900;
  }

  .subtitle {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .clear-btn,
  .delete-btn {
    color: #ef4444;
    font-size: 25rpx;
    font-weight: 700;
  }

  .tabs {
    display: flex;
    gap: 10rpx;
    margin: 0 24rpx 24rpx;
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
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 0 24rpx 24rpx;
  }

  .time-line {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin: 0 4rpx 10rpx;
    color: #94a3b8;
    font-size: 22rpx;
  }

  .delete-btn {
    margin-left: auto;
  }

  .history-card,
  .state-card {
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .history-card {
    display: flex;
    gap: 18rpx;
    padding: 24rpx;
  }

  .dot {
    width: 16rpx;
    height: 16rpx;
    margin-top: 12rpx;
    border-radius: 8rpx;
    background: #2563eb;
    flex-shrink: 0;
  }

  .content {
    min-width: 0;
    flex: 1;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .card-title {
    overflow: hidden;
    color: #0f172a;
    font-size: 29rpx;
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

  .meta {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 36rpx;
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
