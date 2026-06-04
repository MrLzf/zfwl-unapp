<template>
  <s-layout title="我的预约">
    <view class="list">
      <view v-for="item in list" :key="item.id" class="item">
        <view class="title">试课预约 #{{ item.id }}</view>
        <view class="meta">{{ item.startTime }} - {{ item.endTime }}</view>
        <view class="meta">状态：{{ statusText(item.status) }}</view>
        <button class="line-btn ss-reset-button" @tap="confirm(item.id)">确认预约</button>
      </view>
      <s-empty v-if="!loading && !list.length" text="暂无试课预约" />
    </view>
  </s-layout>
</template>

<script setup>
  import { ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import TutorP2Api from '@/sheep/api/tutor/p2';

  const loading = ref(false);
  const list = ref([]);

  const statusText = (status) =>
    ['待教师确认', '教师已确认', '家长已确认', '双方确认', '已取消', '异常'][status] || '未知';

  async function load() {
    loading.value = true;
    try {
      const data = await TutorP2Api.getMyTrialAppointments();
      list.value = Array.isArray(data) ? data : data?.list || [];
    } finally {
      loading.value = false;
    }
  }

  async function confirm(id) {
    await TutorP2Api.confirmTrialAppointment(id);
    uni.showToast({ title: '已确认', icon: 'success' });
    load();
  }

  onShow(load);
</script>

<style lang="scss" scoped>
  .list {
    padding: 24rpx;
  }
  .item {
    margin-bottom: 20rpx;
    padding: 24rpx;
    border-radius: 16rpx;
    background: #fff;
  }
  .title {
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 800;
  }
  .meta {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 26rpx;
  }
  .line-btn {
    margin-top: 18rpx;
    height: 64rpx;
    border: 1rpx solid #2563eb;
    border-radius: 10rpx;
    color: #2563eb;
    font-size: 26rpx;
  }
</style>
