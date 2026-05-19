<template>
  <s-layout class="page" title="联系记录" navbar="inner">
    <view class="summary">
      <view>
        <view class="title">联系记录</view>
        <view class="subtitle">已查看过的联系方式，30 天内复看不重复扣积分。</view>
      </view>
      <view class="count">{{ records.length }}</view>
    </view>

    <view class="list">
      <view v-for="item in records" :key="item.id" class="record-card">
        <view class="card-head">
          <view>
            <view class="name">{{ item.title || item.name }}</view>
            <view class="meta">{{ item.contactName }} · {{ item.fullPhone }}</view>
          </view>
          <text class="cost">-{{ item.pointCost }} 积分</text>
        </view>
        <view class="safe-line">复看有效期至 {{ item.reuseUntil }}</view>
        <view class="actions">
          <button class="ghost-btn ss-reset-button" @tap="goDetail(item)">查看详情</button>
          <button class="primary-btn ss-reset-button" @tap="copyPhone(item.fullPhone)"
            >复制号码</button
          >
        </view>
      </view>
    </view>

    <s-empty v-if="!records.length" text="暂无联系记录" icon="/static/data-empty.png" />
  </s-layout>
</template>

<script setup>
  import { computed } from 'vue';
  import { tutorItems } from '@/sheep/api/tutor/mock-data';

  const records = computed(() =>
    tutorItems.slice(0, 3).map((item, index) => ({
      ...item,
      pointCost: index === 0 ? 10 : 0,
      reuseUntil: '2026-06-18',
    })),
  );

  function goDetail(item) {
    uni.navigateTo({ url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}` });
  }

  function copyPhone(phone) {
    uni.setClipboardData({
      data: phone,
      success: () => uni.showToast({ title: '号码已复制', icon: 'none' }),
    });
  }
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .summary,
  .record-card {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .summary,
  .card-head,
  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
  }

  .title {
    color: #111827;
    font-size: 38rpx;
    font-weight: 800;
  }

  .subtitle,
  .meta,
  .safe-line {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .count {
    width: 82rpx;
    height: 82rpx;
    line-height: 82rpx;
    text-align: center;
    border-radius: 41rpx;
    color: #0f766e;
    background: #ecfdf5;
    font-size: 34rpx;
    font-weight: 800;
  }

  .list {
    padding-bottom: 20rpx;
  }

  .name {
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .cost {
    flex-shrink: 0;
    color: #f97316;
    font-size: 25rpx;
    font-weight: 800;
  }

  .safe-line {
    padding: 16rpx 18rpx;
    border-radius: 10rpx;
    background: #f8fafc;
  }

  .ghost-btn,
  .primary-btn {
    flex: 1;
    height: 72rpx;
    border-radius: 10rpx;
    font-size: 26rpx;
    font-weight: 700;
  }

  .ghost-btn {
    color: #0f766e;
    background: #ecfdf5;
  }

  .primary-btn {
    color: #fff;
    background: #0f766e;
  }
</style>
