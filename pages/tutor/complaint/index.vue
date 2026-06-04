<template>
  <s-layout class="page" title="举报投诉" navbar="inner">
    <view class="section">
      <view class="title">举报原因</view>
      <view class="reason-grid">
        <button
          v-for="item in reasons"
          :key="item"
          class="reason ss-reset-button"
          :class="{ active: form.reason === item }"
          @tap="form.reason = item"
        >
          {{ item }}
        </button>
      </view>
      <textarea v-model="form.content" placeholder="请补充说明具体情况" maxlength="500" />
    </view>

    <view class="section">
      <view class="title">图片证据</view>
      <s-uploader v-model:url="form.imageUrls" fileMediatype="image" limit="3" />
    </view>

    <button class="primary-btn ss-reset-button" @tap="submit">提交举报</button>
  </s-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import TutorP1Api from '@/sheep/api/tutor/p1';

  const reasons = ['虚假信息', '联系方式无效', '资质可疑', '骚扰辱骂', '诱导转账', '其他'];
  const form = reactive({
    targetType: 'demand',
    targetId: '',
    reason: '虚假信息',
    content: '',
    imageUrls: [],
  });

  async function submit() {
    if (!form.content.trim()) {
      uni.showToast({ title: '请填写举报说明', icon: 'none' });
      return;
    }
    const result = await TutorP1Api.createComplaint({
      targetType: form.targetType,
      targetId: form.targetId,
      reason: form.reason,
      content: form.content,
      imageUrls: Array.isArray(form.imageUrls) ? form.imageUrls.join(',') : form.imageUrls,
    });
    if (result?.code === 0) {
      uni.showToast({ title: '举报已提交', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 500);
    } else {
      uni.showToast({ title: result?.msg || '提交失败', icon: 'none' });
    }
  }

  onLoad((query = {}) => {
    form.targetType = query.targetType || form.targetType;
    form.targetId = query.targetId || query.id || '';
  });
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
    font-size: 30rpx;
    font-weight: 900;
  }
  .reason-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
    margin-top: 22rpx;
  }
  .reason {
    height: 68rpx;
    border-radius: 12rpx;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 25rpx;
  }
  .reason.active {
    color: #fff;
    background: #dc2626;
    border-color: #dc2626;
  }
  textarea {
    width: 100%;
    min-height: 190rpx;
    margin-top: 22rpx;
    padding: 20rpx;
    border-radius: 14rpx;
    color: #111827;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    box-sizing: border-box;
    font-size: 26rpx;
    line-height: 40rpx;
  }
  .primary-btn {
    height: 88rpx;
    margin: 8rpx 24rpx 0;
    border-radius: 16rpx;
    color: #fff;
    background: #dc2626;
    font-size: 30rpx;
    font-weight: 900;
  }
</style>
