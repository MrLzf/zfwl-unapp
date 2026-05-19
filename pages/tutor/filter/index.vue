<template>
  <s-layout class="page" title="高级筛选" navbar="inner">
    <view class="section">
      <view class="section-title">服务类型</view>
      <view class="grid">
        <button
          v-for="item in types"
          :key="item.value"
          class="option ss-reset-button"
          :class="{ active: form.type === item.value }"
          @tap="form.type = item.value"
        >
          {{ item.label }}
        </button>
      </view>
    </view>

    <view class="section">
      <view class="section-title">科目</view>
      <view class="chip-row">
        <button
          v-for="subject in tutorSubjects"
          :key="subject"
          class="chip ss-reset-button"
          :class="{ active: form.subject === subject }"
          @tap="form.subject = form.subject === subject ? '' : subject"
        >
          {{ subject }}
        </button>
      </view>
    </view>

    <view class="section">
      <view class="section-title">授课方式</view>
      <view class="grid">
        <button
          v-for="item in modes"
          :key="item.value"
          class="option ss-reset-button"
          :class="{ active: form.mode === item.value }"
          @tap="form.mode = item.value"
        >
          {{ item.label }}
        </button>
      </view>
    </view>

    <view class="section">
      <view class="section-title">价格区间</view>
      <view class="price-row">
        <input v-model="form.minPrice" type="number" placeholder="最低" />
        <text>-</text>
        <input v-model="form.maxPrice" type="number" placeholder="最高" />
      </view>
    </view>

    <view class="footer">
      <button class="ghost-btn ss-reset-button" @tap="reset">重置</button>
      <button class="primary-btn ss-reset-button" @tap="apply">应用筛选</button>
    </view>
  </s-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import { tutorSubjects } from '@/sheep/api/tutor/mock-data';

  const types = [
    { label: '全部', value: 'all' },
    { label: '找老师', value: 'tutor' },
    { label: '找家长', value: 'req' },
  ];

  const modes = [
    { label: '不限', value: 'all' },
    { label: '上门', value: 'offline' },
    { label: '在线', value: 'online' },
    { label: '均可', value: 'both' },
  ];

  const form = reactive({
    type: 'all',
    subject: '',
    mode: 'all',
    minPrice: '',
    maxPrice: '',
  });

  function reset() {
    Object.assign(form, {
      type: 'all',
      subject: '',
      mode: 'all',
      minPrice: '',
      maxPrice: '',
    });
  }

  function apply() {
    uni.setStorageSync('tutor_filter', { ...form });
    uni.showToast({ title: '筛选已保存', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 250);
  }
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .section {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .section-title {
    margin-bottom: 18rpx;
    color: #111827;
    font-size: 29rpx;
    font-weight: 800;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
  }

  .option,
  .chip {
    height: 66rpx;
    border-radius: 999rpx;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 25rpx;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .chip {
    padding: 0 22rpx;
  }

  .option.active,
  .chip.active,
  .primary-btn {
    color: #fff;
    background: #0f766e;
    border-color: #0f766e;
  }

  .price-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
    color: #64748b;
  }

  .price-row input {
    flex: 1;
    height: 76rpx;
    padding: 0 20rpx;
    border-radius: 10rpx;
    color: #111827;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 26rpx;
  }

  .footer {
    display: flex;
    gap: 14rpx;
    padding: 0 24rpx 36rpx;
  }

  .ghost-btn,
  .primary-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    font-weight: 800;
  }

  .ghost-btn {
    color: #0f766e;
    background: #ecfdf5;
  }
</style>
