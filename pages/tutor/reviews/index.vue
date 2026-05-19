<template>
  <s-layout class="page" title="我的评价" navbar="inner">
    <view class="score-card">
      <view>
        <view class="score">4.9</view>
        <view class="subtitle">当前平均评分</view>
      </view>
      <view class="tags">
        <text>耐心细致</text>
        <text>反馈及时</text>
        <text>效果明显</text>
      </view>
    </view>

    <view class="form-card">
      <view class="section-title">提交评价</view>
      <view class="star-row">
        <button
          v-for="star in 5"
          :key="star"
          class="star ss-reset-button"
          :class="{ active: form.rating >= star }"
          @tap="form.rating = star"
        >
          ★
        </button>
      </view>
      <textarea v-model="form.content" placeholder="说说本次沟通或试课体验" />
      <button class="primary-btn ss-reset-button" @tap="submit">提交评价</button>
    </view>

    <view class="list">
      <view v-for="item in reviews" :key="item.id" class="review-card">
        <view class="review-head">
          <text class="name">{{ item.name }}</text>
          <text class="rating">{{ item.rating }} 分</text>
        </view>
        <view class="content">{{ item.content }}</view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { reactive, ref } from 'vue';

  const form = reactive({
    rating: 5,
    content: '',
  });

  const reviews = ref([
    { id: 1, name: '赵先生', rating: 5, content: '老师沟通很清楚，能给出阶段学习建议。' },
    { id: 2, name: '陈女士', rating: 5, content: '需求描述真实，时间安排也比较明确。' },
  ]);

  function submit() {
    if (!form.content.trim()) {
      uni.showToast({ title: '请填写评价内容', icon: 'none' });
      return;
    }
    reviews.value.unshift({
      id: Date.now(),
      name: '我',
      rating: form.rating,
      content: form.content,
    });
    form.content = '';
    uni.showToast({ title: '评价已提交', icon: 'none' });
  }
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .score-card,
  .form-card,
  .review-card {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .score-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .score {
    color: #f97316;
    font-size: 54rpx;
    font-weight: 900;
  }

  .subtitle,
  .content {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10rpx;
  }

  .tags text {
    padding: 7rpx 12rpx;
    border-radius: 999rpx;
    color: #0f766e;
    background: #ecfdf5;
    font-size: 22rpx;
  }

  .section-title,
  .name {
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .star-row {
    display: flex;
    gap: 12rpx;
    margin: 20rpx 0;
  }

  .star {
    color: #cbd5e1;
    font-size: 48rpx;
  }

  .star.active {
    color: #f59e0b;
  }

  textarea {
    width: 100%;
    min-height: 170rpx;
    box-sizing: border-box;
    padding: 18rpx 20rpx;
    border-radius: 10rpx;
    color: #111827;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 26rpx;
    line-height: 38rpx;
  }

  .primary-btn {
    height: 80rpx;
    margin-top: 20rpx;
    border-radius: 12rpx;
    color: #fff;
    background: #0f766e;
    font-size: 28rpx;
    font-weight: 800;
  }

  .review-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .rating {
    color: #f97316;
    font-size: 25rpx;
    font-weight: 800;
  }
</style>
