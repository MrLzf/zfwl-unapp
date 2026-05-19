<template>
  <s-layout class="page" title="浏览历史" navbar="inner">
    <view class="toolbar">
      <text>最近浏览</text>
      <button class="clear-btn ss-reset-button" @tap="clear">清空</button>
    </view>

    <view class="timeline">
      <view v-for="item in items" :key="item.id" class="history-row" @tap="goDetail(item)">
        <view class="dot"></view>
        <view class="content">
          <view class="head">
            <text class="title">{{ item.title || item.name }}</text>
            <text class="time">{{ item.viewedAt }}</text>
          </view>
          <view class="meta">{{ item.district }} · {{ item.subjects.join('、') }}</view>
        </view>
      </view>
    </view>

    <s-empty v-if="!items.length" text="暂无浏览历史" icon="/static/data-empty.png" />
  </s-layout>
</template>

<script setup>
  import { ref } from 'vue';
  import { tutorItems } from '@/sheep/api/tutor/mock-data';

  const items = ref(
    tutorItems.slice(0, 5).map((item, index) => ({
      ...item,
      viewedAt: index === 0 ? '刚刚' : `${index + 1}小时前`,
    })),
  );

  function clear() {
    items.value = [];
    uni.showToast({ title: '已清空', icon: 'none' });
  }

  function goDetail(item) {
    uni.navigateTo({ url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}` });
  }
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .clear-btn {
    color: #0f766e;
    font-size: 25rpx;
    font-weight: 700;
  }

  .timeline {
    margin: 0 24rpx;
    padding: 8rpx 0;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .history-row {
    display: flex;
    gap: 18rpx;
    padding: 22rpx 24rpx;
    border-bottom: 1px solid #f1f5f9;
  }

  .history-row:last-child {
    border-bottom: 0;
  }

  .dot {
    width: 14rpx;
    height: 14rpx;
    margin-top: 12rpx;
    border-radius: 7rpx;
    background: #0f766e;
    flex-shrink: 0;
  }

  .content {
    min-width: 0;
    flex: 1;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .title {
    overflow: hidden;
    color: #111827;
    font-size: 28rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .time,
  .meta {
    color: #64748b;
    font-size: 24rpx;
  }

  .time {
    flex-shrink: 0;
  }

  .meta {
    margin-top: 8rpx;
  }
</style>
