<template>
  <s-layout class="page" title="邀请好友" navbar="inner">
    <view class="hero">
      <view class="title">邀请好友加入家教平台</view>
      <view class="desc">好友注册并完成有效行为后，可获得平台积分奖励。</view>
      <view class="code-box">{{ summary.inviteCode || 'TUTOR2026' }}</view>
      <view class="action-row">
        <button class="light-btn ss-reset-button" @tap="copyLink">复制链接</button>
        <button class="light-btn ss-reset-button" open-type="share">分享好友</button>
      </view>
    </view>

    <view class="stats">
      <view
        ><text>{{ summary.inviteCount || 0 }}</text
        ><text>已邀请</text></view
      >
      <view
        ><text>{{ summary.rewardPoints || 0 }}</text
        ><text>累计奖励</text></view
      >
      <view
        ><text>{{ summary.monthCount || 0 }}</text
        ><text>本月有效</text></view
      >
    </view>

    <view class="section">
      <view class="section-title">邀请二维码</view>
      <view class="qr-box">
        <image v-if="summary.qrCodeUrl" :src="summary.qrCodeUrl" mode="aspectFit" />
        <view v-else class="qr-placeholder">二维码生成中</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">邀请记录</view>
      <view v-if="records.length">
        <view v-for="item in records" :key="item.id" class="record">
          <view>
            <view class="name">{{ item.nickname || item.mobile || '新用户' }}</view>
            <view class="time">{{ item.createTime || item.registerTime }}</view>
          </view>
          <text class="reward">+{{ item.rewardPoints || 0 }}</text>
        </view>
      </view>
      <s-empty v-else text="暂无邀请记录" icon="/static/data-empty.png" />
    </view>
  </s-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import { onShow, onShareAppMessage } from '@dcloudio/uni-app';
  import TutorP1Api from '@/sheep/api/tutor/p1';

  const summary = reactive({});
  const records = reactive([]);

  function inviteLink() {
    return (
      summary.inviteLink || `/pages/index/index?inviteCode=${summary.inviteCode || 'TUTOR2026'}`
    );
  }

  function copyLink() {
    uni.setClipboardData({
      data: inviteLink(),
      success: () => uni.showToast({ title: '已复制', icon: 'none' }),
    });
  }

  async function loadInvite() {
    const summaryResult = await TutorP1Api.getInviteSummary();
    if (summaryResult?.code === 0) Object.assign(summary, summaryResult.data || {});
    const recordResult = await TutorP1Api.getInviteRecords({ pageNo: 1, pageSize: 20 });
    records.splice(
      0,
      records.length,
      ...((recordResult?.code === 0 ? recordResult.data?.list || recordResult.data : []) || []),
    );
  }

  onShow(loadInvite);
  onShareAppMessage(() => ({ title: '一起来找靠谱家教', path: inviteLink() }));
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f7f8fb;
  }
  .hero {
    margin: 24rpx;
    padding: 34rpx;
    border-radius: 18rpx;
    color: #fff;
    background: #365f8d;
  }
  .title {
    font-size: 38rpx;
    font-weight: 900;
  }
  .desc {
    margin-top: 14rpx;
    font-size: 25rpx;
    line-height: 40rpx;
    opacity: 0.9;
  }
  .code-box {
    display: inline-flex;
    margin-top: 28rpx;
    padding: 12rpx 20rpx;
    border-radius: 10rpx;
    background: rgba(255, 255, 255, 0.16);
    font-size: 32rpx;
    font-weight: 900;
  }
  .action-row {
    display: flex;
    gap: 16rpx;
    margin-top: 28rpx;
  }
  .light-btn {
    height: 70rpx;
    padding: 0 26rpx;
    border-radius: 999rpx;
    color: #365f8d;
    background: #fff;
    font-size: 25rpx;
    font-weight: 900;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 0 24rpx 24rpx;
    padding: 24rpx 0;
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #e7edf0;
  }
  .stats view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }
  .stats text:first-child {
    color: #111827;
    font-size: 34rpx;
    font-weight: 900;
  }
  .section {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #e7edf0;
  }
  .section-title {
    color: #111827;
    font-size: 30rpx;
    font-weight: 900;
  }
  .qr-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 320rpx;
    margin-top: 20rpx;
    border-radius: 14rpx;
    background: #f8fafc;
  }
  .qr-box image {
    width: 260rpx;
    height: 260rpx;
  }
  .qr-placeholder {
    color: #94a3b8;
    font-size: 26rpx;
  }
  .record {
    display: flex;
    justify-content: space-between;
    gap: 16rpx;
    padding: 24rpx 0;
    border-bottom: 1px solid #eef2f7;
  }
  .record:last-child {
    border-bottom: 0;
  }
  .name {
    color: #111827;
    font-size: 28rpx;
    font-weight: 800;
  }
  .time {
    margin-top: 8rpx;
    color: #94a3b8;
    font-size: 23rpx;
  }
  .reward {
    color: #16a34a;
    font-size: 30rpx;
    font-weight: 900;
  }
</style>
