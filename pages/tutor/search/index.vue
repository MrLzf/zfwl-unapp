<template>
  <s-layout class="page" title="搜索" navbar="inner">
    <view class="search-box">
      <text class="cicon-search"></text>
      <input
        v-model="keyword"
        focus
        placeholder="搜索科目、年级、老师或需求"
        confirm-type="search"
      />
    </view>

    <view v-if="!keyword" class="section">
      <view class="section-title">热门搜索</view>
      <view class="chip-row">
        <button
          v-for="word in hotWords"
          :key="word"
          class="chip ss-reset-button"
          @tap="keyword = word"
        >
          {{ word }}
        </button>
      </view>
    </view>

    <view class="list">
      <view v-for="item in results" :key="item.id" class="card" @tap="goDetail(item)">
        <view class="title">{{ item.title || item.name }}</view>
        <view class="meta"
          >{{ item.district }} · {{ item.subjects.join('、') }} · ¥{{
            item.budget || item.price
          }}/时</view
        >
      </view>
    </view>

    <s-empty v-if="keyword && !results.length" text="暂无搜索结果" icon="/static/data-empty.png" />
  </s-layout>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { tutorItems, tutorSubjects } from '@/sheep/api/tutor/mock-data';

  const keyword = ref('');
  const hotWords = ['高中数学', '英语口语', '物理冲刺', ...tutorSubjects];

  const results = computed(() => {
    const key = keyword.value.trim();
    if (!key) {
      return [];
    }
    return tutorItems.filter((item) =>
      [item.title, item.name, item.grade, item.education, item.district, ...item.subjects]
        .filter(Boolean)
        .some((text) => String(text).includes(key)),
    );
  });

  function goDetail(item) {
    uni.navigateTo({ url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}` });
  }
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .search-box {
    height: 82rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin: 24rpx;
    padding: 0 24rpx;
    border-radius: 12rpx;
    color: #64748b;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .search-box input {
    flex: 1;
    height: 82rpx;
    color: #111827;
    font-size: 27rpx;
  }

  .section {
    padding: 0 24rpx 24rpx;
  }

  .section-title {
    margin-bottom: 16rpx;
    color: #111827;
    font-size: 28rpx;
    font-weight: 800;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
  }

  .chip {
    height: 60rpx;
    padding: 0 22rpx;
    border-radius: 999rpx;
    color: #0f766e;
    background: #ecfdf5;
    font-size: 24rpx;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding: 0 24rpx 24rpx;
  }

  .card {
    padding: 24rpx;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .title {
    color: #111827;
    font-size: 29rpx;
    font-weight: 800;
  }

  .meta {
    margin-top: 12rpx;
    color: #64748b;
    font-size: 24rpx;
  }
</style>
