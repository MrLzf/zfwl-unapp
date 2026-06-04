<template>
  <s-layout title="担保交易">
    <view class="list">
      <view v-for="item in list" :key="item.id" class="item">
        <view class="title">担保订单 #{{ item.id }}</view>
        <view class="meta">金额：{{ amountText(item.amount) }}</view>
        <view class="meta">状态：{{ statusText(item.status) }}</view>
        <view class="actions">
          <button class="line-btn ss-reset-button" @tap="complete(item.id)">确认完成</button>
          <button class="line-btn warn ss-reset-button" @tap="refund(item.id)">退款/争议</button>
        </view>
      </view>
      <s-empty v-if="!loading && !list.length" text="暂无担保交易" />
    </view>
  </s-layout>
</template>

<script setup>
  import { ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import TutorP2Api from '@/sheep/api/tutor/p2';

  const loading = ref(false);
  const list = ref([]);

  const amountText = (amount = 0) => `¥${(Number(amount) / 100).toFixed(2)}`;
  const statusText = (status) =>
    ['待支付', '已担保', '完成待释放', '已释放', '退款中', '已退款', '争议中', '已关闭'][
      status
    ] || '未知';

  async function load() {
    loading.value = true;
    try {
      const data = await TutorP2Api.getMyEscrowTrades();
      list.value = Array.isArray(data) ? data : data?.list || [];
    } finally {
      loading.value = false;
    }
  }

  async function complete(id) {
    await TutorP2Api.confirmEscrowComplete(id);
    uni.showToast({ title: '已确认完成', icon: 'success' });
    load();
  }

  async function refund(id) {
    await TutorP2Api.applyEscrowRefund(id, { refundReason: '用户发起退款/争议' });
    uni.showToast({ title: '已提交', icon: 'success' });
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
  .actions {
    display: flex;
    gap: 16rpx;
    margin-top: 18rpx;
  }
  .line-btn {
    flex: 1;
    height: 64rpx;
    border: 1rpx solid #2563eb;
    border-radius: 10rpx;
    color: #2563eb;
    font-size: 26rpx;
  }
  .warn {
    border-color: #f59e0b;
    color: #b45309;
  }
</style>
