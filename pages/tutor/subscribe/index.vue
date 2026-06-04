<template>
  <s-layout class="page" title="订阅消息" navbar="inner">
    <view class="section">
      <view class="title">通知类型</view>
      <view v-for="item in settings" :key="item.type" class="setting">
        <view>
          <view class="name">{{ item.name }}</view>
          <view class="desc">{{ item.description }}</view>
        </view>
        <switch :checked="item.enabled" color="#176b5b" @change="toggle(item, $event)" />
      </view>
    </view>
    <button class="primary-btn ss-reset-button" @tap="requestWechatSubscribe">授权微信订阅</button>
  </s-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import TutorP1Api from '@/sheep/api/tutor/p1';

  const settings = reactive([
    { type: 'audit', name: '审核结果', description: '教师认证、发布审核结果提醒', enabled: true },
    { type: 'match', name: '匹配进展', description: '匹配确认和联系方式查看提醒', enabled: true },
    { type: 'review', name: '评价消息', description: '收到评价和五星奖励提醒', enabled: true },
    { type: 'demand', name: '新需求推荐', description: '同城相关需求或老师推荐', enabled: false },
  ]);

  async function loadSettings() {
    const result = await TutorP1Api.getSubscribeSettings();
    if (result?.code === 0 && Array.isArray(result.data)) {
      settings.splice(0, settings.length, ...result.data);
    }
  }

  async function toggle(item, event) {
    item.enabled = event.detail.value;
    await TutorP1Api.updateSubscribeSettings({ type: item.type, enabled: item.enabled });
  }

  function requestWechatSubscribe() {
    const events = settings.filter((item) => item.enabled).map((item) => item.name);
    const provider = sheep.$platform.useProvider('wechat');
    if (!provider?.subscribeMessage) {
      uni.showToast({ title: '当前端暂不支持订阅授权', icon: 'none' });
      return;
    }
    provider.subscribeMessage(events, () => {
      uni.showToast({ title: '订阅设置已更新', icon: 'none' });
    });
  }

  onShow(loadSettings);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f7f8fb;
  }
  .section {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #e7edf0;
  }
  .title {
    color: #111827;
    font-size: 32rpx;
    font-weight: 900;
  }
  .setting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding: 28rpx 0;
    border-bottom: 1px solid #eef2f7;
  }
  .setting:last-child {
    border-bottom: 0;
  }
  .name {
    color: #111827;
    font-size: 29rpx;
    font-weight: 800;
  }
  .desc {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 36rpx;
  }
  .primary-btn {
    height: 88rpx;
    margin: 8rpx 24rpx 0;
    border-radius: 16rpx;
    color: #fff;
    background: #176b5b;
    font-size: 30rpx;
    font-weight: 900;
  }
</style>
