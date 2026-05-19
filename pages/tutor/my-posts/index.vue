<template>
  <s-layout class="page" title="我的发布" navbar="inner">
    <view class="tabs">
      <button
        v-for="item in tabs"
        :key="item.value"
        class="tab ss-reset-button"
        :class="{ active: active === item.value }"
        @tap="active = item.value"
      >
        {{ item.label }}
      </button>
    </view>

    <view class="list">
      <view v-for="item in filteredItems" :key="item.id" class="card" @tap="goDetail(item)">
        <view class="card-head">
          <view class="title">{{ item.title || item.name }}</view>
          <text class="status">{{ item.statusText || '展示中' }}</text>
        </view>
        <view class="meta"
          >{{ item.district }} · {{ item.subjects.join('、') }} · ¥{{
            item.budget || item.price
          }}/时</view
        >
        <view class="desc">{{ item.description }}</view>
      </view>
    </view>

    <s-empty v-if="!filteredItems.length" text="暂无发布" icon="/static/data-empty.png" />
    <button class="primary-btn ss-reset-button" @tap="goPublish">发布新信息</button>
  </s-layout>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { tutorItems } from '@/sheep/api/tutor/mock-data';

  const active = ref('all');
  const tabs = [
    { label: '全部', value: 'all' },
    { label: '家长需求', value: 'req' },
    { label: '教师简历', value: 'tutor' },
  ];

  const localDraft = uni.getStorageSync('tutor_publish_draft');
  const items = computed(() => {
    const drafts = localDraft
      ? [
          {
            id: 'draft',
            type: localDraft.type,
            title: localDraft.title,
            subjects: [localDraft.subject],
            budget: localDraft.price,
            price: localDraft.price,
            district: '草稿',
            description: localDraft.description || '本地保存的发布草稿',
            statusText: '草稿',
          },
        ]
      : [];
    return [...drafts, ...tutorItems];
  });

  const filteredItems = computed(() => {
    return items.value.filter((item) => active.value === 'all' || item.type === active.value);
  });

  function goDetail(item) {
    if (item.id === 'draft') {
      goPublish();
      return;
    }
    uni.navigateTo({ url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}` });
  }

  function goPublish() {
    uni.switchTab({ url: '/pages/index/publish' });
  }
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
    padding: 24rpx;
  }

  .tab {
    height: 68rpx;
    border-radius: 999rpx;
    color: #475569;
    background: #fff;
    border: 1px solid #e2e8f0;
    font-size: 25rpx;
    font-weight: 700;
  }

  .tab.active,
  .primary-btn {
    color: #fff;
    background: #0f766e;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 0 24rpx 120rpx;
  }

  .card {
    padding: 24rpx;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .title {
    min-width: 0;
    flex: 1;
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .status {
    flex-shrink: 0;
    color: #0f766e;
    font-size: 24rpx;
  }

  .meta,
  .desc {
    margin-top: 14rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .desc {
    color: #475569;
  }

  .primary-btn {
    position: fixed;
    left: 24rpx;
    right: 24rpx;
    bottom: calc(24rpx + env(safe-area-inset-bottom));
    height: 88rpx;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 800;
  }
</style>
