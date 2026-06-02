<template>
  <s-layout class="page" title="" navbar="">
    <view class="wallet-header">
      <button class="back-btn ss-reset-button" @tap="goBack">
        <text class="cicon-back"></text>
      </button>
      <view class="balance-label">钱包余额（元�?/view>
      <view class="balance">{{ fenToYuan(balance) }}</view>
      <view class="balance-desc">余额可用于支付家教服务费�?/view>
    </view>

    <view class="section">
      <view class="section-title">充值套�?/view>
      <view class="package-list">
        <view
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-item"
          :class="{ active: selectedPackage === pkg.id }"
          @tap="selectPackage(pkg)"
        >
          <view class="pkg-pay">{{ fenToYuan(pkg.payPrice) }} �?/view>
          <view v-if="pkg.bonusPrice" class="pkg-bonus">�?{{ fenToYuan(pkg.bonusPrice) }} �?/view>
          <view class="pkg-total">到账 {{ fenToYuan(pkg.payPrice + pkg.bonusPrice) }} �?/view>
        </view>
      </view>
      <button
        class="recharge-btn ss-reset-button"
        :disabled="!selectedPackage"
        @tap="handleRecharge"
      >
        立即充�?      </button>
    </view>

    <view class="section">
      <view class="section-title">充值记�?/view>
      <view v-if="rechargeList.length" class="record-list">
        <view v-for="item in rechargeList" :key="item.id" class="record-item">
          <view>
            <view class="record-title">充�?/view>
            <view class="record-time">{{ formatTime(item.createTime) }}</view>
          </view>
          <view class="record-amount income">
            +{{ fenToYuan(item.totalPrice) }}
          </view>
        </view>
      </view>
      <s-empty v-else text="暂无充值记�? icon="/static/data-empty.png" />
    </view>
  </s-layout>
</template>

<script setup>
  import { ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import dayjs from 'dayjs';
  import PayWalletApi from '@/sheep/api/pay/wallet';

  const balance = ref(0);
  const packages = ref([]);
  const selectedPackage = ref(null);
  const rechargeList = ref([]);

  function fenToYuan(fen) {
    if (fen == null) return '0.00';
    return (Number(fen) / 100).toFixed(2);
  }

  function formatTime(time) {
    if (!time) return '';
    return dayjs(time).format('YYYY-MM-DD HH:mm');
  }

  async function loadWallet() {
    try {
      const res = await PayWalletApi.getWallet();
      if (res?.code === 0 && res.data) {
        balance.value = res.data.balance || 0;
      }
    } catch (e) {
      console.error('loadWallet failed', e);
    }
  }

  async function loadPackages() {
    try {
      const res = await PayWalletApi.getRechargePackageList();
      if (res?.code === 0 && res.data) {
        packages.value = res.data || [];
      }
    } catch (e) {
      console.error('loadPackages failed', e);
    }
  }

  async function loadRechargeHistory() {
    try {
      const res = await PayWalletApi.getRechargePage({ pageNo: 1, pageSize: 20 });
      if (res?.code === 0 && res.data) {
        rechargeList.value = res.data.list || [];
      }
    } catch (e) {
      console.error('loadRechargeHistory failed', e);
    }
  }

  function selectPackage(pkg) {
    selectedPackage.value = pkg.id;
  }

  async function handleRecharge() {
    if (!selectedPackage.value) {
      uni.showToast({ title: '请选择充值套�?, icon: 'none' });
      return;
    }
    try {
      const res = await PayWalletApi.createRecharge({ packageId: selectedPackage.value });
      if (res?.code === 0 && res.data) {
        const { payOrderId, payPrice } = res.data;
        if (payOrderId) {
          // 调用微信支付
          uni.showToast({ title: '充值订单已创建，请完成支付', icon: 'none' });
          await loadWallet();
          await loadRechargeHistory();
        }
      }
    } catch (e) {
      console.error('handleRecharge failed', e);
      uni.showToast({ title: '充值失败，请重�?, icon: 'none' });
    }
  }

  function goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
      return;
    }
    uni.switchTab({ url: '/pages/index/user' });
  }

  onShow(() => {
    loadWallet();
    loadPackages();
    loadRechargeHistory();
  });
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f8fafc;
  }

  .wallet-header {
    position: relative;
    padding: calc(var(--status-bar-height) + 20rpx) 32rpx 92rpx;
    color: #ffffff;
    background: linear-gradient(145deg, #059669 0%, #10b981 60%, #34d399 100%);
  }

  .back-btn {
    width: 62rpx;
    height: 62rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 34rpx;
  }

  .balance-label {
    margin-top: 20rpx;
    font-size: 26rpx;
    opacity: 0.9;
  }

  .balance {
    margin-top: 12rpx;
    font-size: 76rpx;
    font-weight: 900;
    line-height: 1;
  }

  .balance-desc {
    margin-top: 18rpx;
    width: 86%;
    font-size: 24rpx;
    line-height: 38rpx;
    opacity: 0.86;
  }

  .section {
    margin: 24rpx;
  }

  .section-title {
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
    margin-bottom: 20rpx;
  }

  .package-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .package-item {
    flex: 0 0 calc(50% - 8rpx);
    padding: 28rpx 20rpx;
    border-radius: 16rpx;
    background: #ffffff;
    border: 2rpx solid #e8eef0;
    text-align: center;
  }

  .package-item.active {
    border-color: #10b981;
    background: #f0fdf4;
  }

  .pkg-pay {
    color: #0f172a;
    font-size: 34rpx;
    font-weight: 900;
  }

  .pkg-bonus {
    margin-top: 8rpx;
    color: #f59e0b;
    font-size: 24rpx;
    font-weight: 800;
  }

  .pkg-total {
    margin-top: 4rpx;
    color: #94a3b8;
    font-size: 22rpx;
  }

  .recharge-btn {
    margin-top: 28rpx;
    width: 100%;
    height: 88rpx;
    border-radius: 16rpx;
    color: #ffffff;
    background: #10b981;
    font-size: 30rpx;
    font-weight: 900;
  }

  .recharge-btn[disabled] {
    background: #cbd5e1;
    color: #94a3b8;
  }

  .record-list {
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
    overflow: hidden;
  }

  .record-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding: 28rpx;
    border-bottom: 1px solid #eef2f7;
  }

  .record-item:last-child {
    border-bottom: 0;
  }

  .record-title {
    color: #0f172a;
    font-size: 28rpx;
    font-weight: 800;
  }

  .record-time {
    margin-top: 8rpx;
    color: #94a3b8;
    font-size: 23rpx;
  }

  .record-amount {
    flex-shrink: 0;
    color: #ef4444;
    font-size: 32rpx;
    font-weight: 900;
  }

  .record-amount.income {
    color: #16a34a;
  }
</style>
