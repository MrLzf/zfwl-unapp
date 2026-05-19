<template>
  <s-layout class="page" title="我的收藏" navbar="inner">
    <view class="list">
      <view v-for="item in items" :key="item.id" class="card" @tap="goDetail(item)">
        <image class="avatar" :src="item.avatar" mode="aspectFill" />
        <view class="main">
          <view class="title">{{ item.title || item.name }}</view>
          <view class="meta"
            >{{ item.district }} · {{ item.distance }}km · {{ item.subjects.join('、') }}</view
          >
          <view class="desc">{{ item.description }}</view>
        </view>
      </view>
    </view>
    <s-empty v-if="!items.length" text="暂无收藏" icon="/static/data-empty.png" />
  </s-layout>
</template>

<script setup>
  import { tutorItems } from '@/sheep/api/tutor/mock-data';

  const items = tutorItems.slice(0, 4);

  function goDetail(item) {
    uni.navigateTo({ url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}` });
  }
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 24rpx;
  }

  .card {
    display: flex;
    gap: 18rpx;
    padding: 24rpx;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 48rpx;
    flex-shrink: 0;
    background: #e5e7eb;
  }

  .main {
    min-width: 0;
    flex: 1;
  }

  .title {
    overflow: hidden;
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta,
  .desc {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 36rpx;
  }

  .desc {
    display: -webkit-box;
    overflow: hidden;
    color: #475569;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
</style>
