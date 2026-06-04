<template>
  <s-layout class="page" title="VIP 会员" navbar="inner">
    <view class="hero">
      <view class="title">家教 VIP</view>
      <view class="desc">查看联系方式 8 折、优先审核、每月赠送积分。</view>
      <view class="expire">{{
        status.validUntil ? `有效期至 ${status.validUntil}` : '暂未开通'
      }}</view>
    </view>

    <view class="benefits">
      <view v-for="item in benefits" :key="item" class="benefit"
        ><text class="cicon-check-round"></text>{{ item }}</view
      >
    </view>

    <view class="section">
      <button
        v-for="item in products"
        :key="item.id"
        class="product ss-reset-button"
        :class="{ active: selected?.id === item.id }"
        @tap="selected = item"
      >
        <view>
          <view class="name">{{ item.name }}</view>
          <view class="desc"
            >{{ item.durationDays }} 天 · 每月赠 {{ item.monthlyGiftPoints || 0 }} 积分</view
          >
        </view>
        <view class="price">{{
          item.pointPrice ? `${item.pointPrice}积分` : `¥${item.price}`
        }}</view>
      </button>
    </view>

    <button class="primary-btn ss-reset-button" @tap="buy">开通 / 续费</button>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import TutorP1Api from '@/sheep/api/tutor/p1';

  const status = reactive({});
  const state = reactive({ products: [] });
  const selected = ref(null);
  const benefits = [
    '查看联系方式享 8 折',
    '发布内容优先审核',
    '每月赠送会员积分',
    '专属客服优先响应',
  ];
  const fallbackProducts = [
    { id: 'vip_month', name: '月度 VIP', durationDays: 31, monthlyGiftPoints: 50, pointPrice: 199 },
    {
      id: 'vip_quarter',
      name: '季度 VIP',
      durationDays: 93,
      monthlyGiftPoints: 80,
      pointPrice: 499,
    },
  ];
  const products = computed(() => (state.products.length ? state.products : fallbackProducts));

  async function loadVip() {
    const [statusResult, productResult] = await Promise.all([
      TutorP1Api.getVipStatus(),
      TutorP1Api.getVipProducts(),
    ]);
    if (statusResult?.code === 0) Object.assign(status, statusResult.data || {});
    if (productResult?.code === 0 && Array.isArray(productResult.data) && productResult.data.length)
      state.products = productResult.data;
    selected.value = products.value[0] || null;
  }

  async function buy() {
    if (!selected.value) return;
    const result = await TutorP1Api.createVipOrder({ productId: selected.value.id });
    if (result?.code === 0) {
      uni.showToast({ title: '开通成功', icon: 'none' });
      await loadVip();
    } else {
      uni.showToast({ title: result?.msg || '开通失败', icon: 'none' });
    }
  }

  onShow(loadVip);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f7f8fb;
  }
  .hero {
    margin: 24rpx;
    padding: 36rpx;
    border-radius: 18rpx;
    color: #fff;
    background: #26384f;
  }
  .title {
    font-size: 42rpx;
    font-weight: 900;
  }
  .desc {
    margin-top: 12rpx;
    font-size: 25rpx;
    line-height: 40rpx;
    opacity: 0.9;
  }
  .expire {
    margin-top: 22rpx;
    font-size: 26rpx;
    font-weight: 800;
  }
  .benefits,
  .section {
    margin: 24rpx;
    padding: 24rpx;
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #e7edf0;
  }
  .benefit {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 14rpx 0;
    color: #334155;
    font-size: 26rpx;
  }
  .benefit text {
    color: #16a34a;
  }
  .product {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    padding: 24rpx 0;
    text-align: left;
    border-bottom: 1px solid #eef2f7;
  }
  .product:last-child {
    border-bottom: 0;
  }
  .product.active .name {
    color: #176b5b;
  }
  .name {
    color: #111827;
    font-size: 30rpx;
    font-weight: 900;
  }
  .price {
    flex-shrink: 0;
    color: #f97316;
    font-size: 30rpx;
    font-weight: 900;
  }
  .primary-btn {
    height: 88rpx;
    margin: 8rpx 24rpx 0;
    border-radius: 16rpx;
    color: #fff;
    background: #26384f;
    font-size: 30rpx;
    font-weight: 900;
  }
</style>
