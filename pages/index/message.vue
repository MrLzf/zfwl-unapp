<template>
  <s-layout title="" navbar="" tabbar="/pages/index/message" class="message-page">
    <view class="message-shell">
      <view class="page-head">
        <view>
          <view class="page-title">消息</view>
          <view class="page-subtitle">审核结果、联系记录和积分变动</view>
        </view>
        <text class="read-all" @tap="markAllRead">全部已读</text>
      </view>

      <view v-if="error" class="state-card">
        <text>消息加载失败</text>
        <text class="retry" @tap="retry">重试</text>
      </view>
      <view v-else class="message-list">
        <view
          v-for="item in categories"
          :key="item.category"
          class="message-card"
          @tap="openCategory(item)"
        >
          <view class="message-icon"><text :class="item.icon"></text></view>
          <view class="message-main">
            <view class="message-title-row">
              <text class="message-title">{{ item.title }}</text>
              <text class="latest-time">{{ item.latestTime || '' }}</text>
            </view>
            <view class="message-desc">{{ item.latestContent || item.placeholder }}</view>
          </view>
          <text v-if="item.unreadCount" class="unread-count">{{
            item.unreadCount > 99 ? '99+' : item.unreadCount
          }}</text>
          <text class="cicon-forward"></text>
        </view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { showAuthModal } from '@/sheep/hooks/useModal';
  import TutorMessageApi from '@/sheep/api/tutor/message';

  const baseCategories = [
    {
      category: 'audit',
      title: '审核通知',
      placeholder: '教师认证、需求和简历审核结果',
      icon: 'cicon-notice-o',
    },
    {
      category: 'contact',
      title: '联系记录',
      placeholder: '查看联系方式后的沟通记录',
      icon: 'cicon-chat-o',
    },
    {
      category: 'point',
      title: '积分提醒',
      placeholder: '扣积分、奖励和后台调整通知',
      icon: 'cicon-flash-on',
    },
  ];
  const categories = ref(baseCategories.map((item) => ({ ...item, unreadCount: 0 })));
  const error = ref(false);

  async function loadSummary() {
    error.value = false;
    try {
      const result = await TutorMessageApi.getSummary();
      if (result?.code !== 0) {
        error.value = true;
        return;
      }
      const rows = result.data?.categories || [];
      categories.value = baseCategories.map((item) => ({
        ...item,
        ...(rows.find((row) => row.category === item.category) || {}),
      }));
    } catch {
      error.value = true;
    }
  }
  function retry() {
    loadSummary();
  }
  async function markAllRead() {
    const result = await TutorMessageApi.markAllRead();
    if (result?.code !== 0) {
      uni.showToast({ title: '操作失败，请重试', icon: 'none' });
      return;
    }
    categories.value = categories.value.map((item) => ({ ...item, unreadCount: 0 }));
  }
  function openCategory(item) {
    uni.navigateTo({
      url: `/pages/tutor/messages/index?category=${item.category}&title=${item.title}`,
    });
  }
  onShow(() => {
    if (!sheep.$store('user').isLogin) return showAuthModal();
    loadSummary();
  });
</script>

<style lang="scss" scoped>
  .message-page,
  .message-shell {
    min-height: 100vh;
    background: #f5f7f5;
  }
  .message-shell {
    padding: calc(var(--status-bar-height) + 28rpx) 24rpx 40rpx;
  }
  .page-head,
  .message-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .page-title {
    color: #111827;
    font-size: 42rpx;
    font-weight: 800;
  }
  .page-subtitle,
  .message-desc,
  .latest-time {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }
  .read-all,
  .retry {
    color: #0f766e;
    font-size: 25rpx;
  }
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    margin-top: 28rpx;
  }
  .message-card,
  .state-card {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border: 1px solid #e8eef0;
    border-radius: 12rpx;
    background: #fff;
  }
  .state-card {
    justify-content: space-between;
    margin-top: 28rpx;
    color: #64748b;
  }
  .message-icon {
    display: flex;
    width: 76rpx;
    height: 76rpx;
    align-items: center;
    justify-content: center;
    border-radius: 18rpx;
    color: #0f766e;
    background: #ecfdf5;
    font-size: 36rpx;
  }
  .message-main {
    min-width: 0;
    flex: 1;
    margin: 0 18rpx;
  }
  .message-title {
    color: #111827;
    font-size: 29rpx;
    font-weight: 800;
  }
  .message-desc {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .latest-time {
    margin-left: 12rpx;
    white-space: nowrap;
  }
  .unread-count {
    min-width: 28rpx;
    padding: 2rpx 8rpx;
    border-radius: 20rpx;
    color: #fff;
    background: #ef4444;
    font-size: 20rpx;
    text-align: center;
  }
  .cicon-forward {
    margin-left: 10rpx;
    color: #94a3b8;
  }
</style>
