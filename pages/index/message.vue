<template>
  <s-layout title="" navbar="" tabbar="/pages/index/message" class="message-page">
    <view class="message-shell">
      <view class="page-title">消息</view>
      <view class="page-subtitle">审核结果、积分变动和匹配进展会展示在这里。</view>

      <view class="message-list">
        <view v-for="item in messages" :key="item.title" class="message-card">
          <view class="message-icon">
            <text :class="item.icon"></text>
          </view>
          <view class="message-main">
            <view class="message-title">{{ item.title }}</view>
            <view class="message-desc">{{ item.desc }}</view>
          </view>
          <text class="cicon-forward"></text>
        </view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { showAuthModal } from '@/sheep/hooks/useModal';

  const messages = [
    {
      title: '审核通知',
      desc: '教师认证、需求和简历审核结果',
      icon: 'cicon-notice-o',
    },
    {
      title: '联系记录',
      desc: '查看联系方式后的沟通记录',
      icon: 'cicon-chat-o',
    },
    {
      title: '积分提醒',
      desc: '扣积分、奖励和后台调整通知',
      icon: 'cicon-flash-on',
    },
  ];

  onShow(() => {
    if (!sheep.$store('user').isLogin) {
      showAuthModal();
    }
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

  .page-title {
    color: #111827;
    font-size: 42rpx;
    font-weight: 800;
  }

  .page-subtitle {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .message-list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    margin-top: 28rpx;
  }

  .message-card {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-radius: 12rpx;
    color: #94a3b8;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .message-icon {
    width: 76rpx;
    height: 76rpx;
    display: flex;
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
    margin: 0 20rpx;
  }

  .message-title {
    color: #111827;
    font-size: 29rpx;
    font-weight: 800;
  }

  .message-desc {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }
</style>
