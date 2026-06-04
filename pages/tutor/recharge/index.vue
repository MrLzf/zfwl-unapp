<template>
  <s-layout class="page" title="积分充值" navbar="inner">
    <view class="hero">
      <view class="eyebrow">当前积分</view>
      <view class="balance">{{ pointBalance }}</view>
      <view class="desc">充值后可用于查看联系方式、购买加急置顶等服务。</view>
    </view>

    <view class="section">
      <view class="section-title">选择积分包</view>
      <view class="package-grid">
        <button
          v-for="item in packages"
          :key="item.id"
          class="package ss-reset-button"
          :class="{ active: selectedPackage?.id === item.id }"
          @tap="selectedPackage = item"
        >
          <view class="points">{{ item.points }} 积分</view>
          <view class="price">¥{{ item.price }}</view>
          <view v-if="item.giftPoints" class="gift">赠 {{ item.giftPoints }} 积分</view>
        </button>
      </view>
    </view>

    <view class="section">
      <view class="section-title">支付方式</view>
      <view class="pay-row active">
        <text class="cicon-wechat"></text>
        <view>
          <view class="pay-title">微信支付</view>
          <view class="pay-desc">支付成功后自动到账</view>
        </view>
      </view>
    </view>

    <button class="primary-btn ss-reset-button" :disabled="state.submitting" @tap="createOrder">
      {{ state.submitting ? '处理中' : '立即充值' }}
    </button>
    <view v-if="state.resultText" class="result">{{ state.resultText }}</view>
  </s-layout>
</template>

<script setup>
  import { computed, ref, reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import TutorP1Api from '@/sheep/api/tutor/p1';
  import { getLocalPoints } from '@/sheep/api/tutor/local-state';

  const userStore = sheep.$store('user');
  const pointBalance = computed(() => userStore.userInfo?.point ?? getLocalPoints());
  const selectedPackage = ref(null);
  const state = reactive({ packages: [], submitting: false, resultText: '' });

  const fallbackPackages = [
    { id: 'p100', points: 100, giftPoints: 0, price: 9.9 },
    { id: 'p300', points: 300, giftPoints: 30, price: 29.9 },
    { id: 'p680', points: 680, giftPoints: 100, price: 68 },
  ];
  const packages = computed(() => (state.packages.length ? state.packages : fallbackPackages));

  async function loadPackages() {
    await userStore.getInfo?.();
    const result = await TutorP1Api.getPointPackages();
    if (result?.code === 0 && Array.isArray(result.data) && result.data.length) {
      state.packages = result.data;
    }
    selectedPackage.value = packages.value[0] || null;
  }

  async function requestPayment(order) {
    if (!order?.payParams) return true;
    return new Promise((resolve) => {
      uni.requestPayment({
        ...order.payParams,
        success: () => resolve(true),
        fail: () => resolve(false),
      });
    });
  }

  async function createOrder() {
    if (!selectedPackage.value) {
      uni.showToast({ title: '请选择积分包', icon: 'none' });
      return;
    }
    state.submitting = true;
    state.resultText = '';
    try {
      const result = await TutorP1Api.createPointRechargeOrder({
        packageId: selectedPackage.value.id,
        payChannel: 'wechat',
      });
      if (result?.code !== 0) {
        state.resultText = result?.msg || '暂时无法创建充值订单';
        return;
      }
      const paid = await requestPayment(result.data);
      if (!paid) {
        state.resultText = '支付未完成，可稍后重新发起。';
        return;
      }
      if (result.data?.id) await TutorP1Api.getPointRechargeOrder(result.data.id);
      await userStore.getInfo?.();
      state.resultText = '支付成功，积分到账状态已刷新。';
    } finally {
      state.submitting = false;
    }
  }

  onShow(loadPackages);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f7f8fb;
  }
  .hero {
    padding: 36rpx 30rpx;
    color: #fff;
    background: #176b5b;
  }
  .eyebrow,
  .desc {
    font-size: 24rpx;
    opacity: 0.85;
  }
  .balance {
    margin-top: 10rpx;
    font-size: 72rpx;
    font-weight: 900;
  }
  .desc {
    margin-top: 12rpx;
    line-height: 38rpx;
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
  .package-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
    margin-top: 22rpx;
  }
  .package {
    padding: 26rpx 18rpx;
    border-radius: 14rpx;
    border: 1px solid #dbe3e8;
    background: #fff;
    text-align: left;
  }
  .package.active {
    border-color: #176b5b;
    background: #eefaf6;
  }
  .points {
    color: #111827;
    font-size: 32rpx;
    font-weight: 900;
  }
  .price {
    margin-top: 8rpx;
    color: #f97316;
    font-size: 28rpx;
    font-weight: 900;
  }
  .gift,
  .pay-desc,
  .result {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }
  .pay-row {
    display: flex;
    align-items: center;
    gap: 18rpx;
    margin-top: 22rpx;
    padding: 22rpx;
    border-radius: 14rpx;
    background: #f8fafc;
  }
  .pay-row text {
    color: #16a34a;
    font-size: 42rpx;
  }
  .pay-title {
    color: #111827;
    font-size: 28rpx;
    font-weight: 800;
  }
  .primary-btn {
    height: 88rpx;
    margin: 30rpx 24rpx 0;
    border-radius: 16rpx;
    color: #fff;
    background: #176b5b;
    font-size: 30rpx;
    font-weight: 900;
  }
  .primary-btn[disabled] {
    opacity: 0.7;
  }
  .result {
    margin: 20rpx 24rpx;
    text-align: center;
  }
</style>
