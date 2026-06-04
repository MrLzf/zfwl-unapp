<template>
  <s-layout :title="title">
    <view class="page">
      <view class="toolbar"
        ><text>{{ title }}</text
        ><text class="read-all" @tap="markCategoryRead">全部已读</text></view
      >
      <view v-if="error" class="state"
        ><text>消息加载失败</text><text class="action" @tap="load(true)">重试</text></view
      >
      <view v-else-if="!messages.length && !loading" class="state">暂无消息</view>
      <view
        v-for="item in messages"
        :key="item.id"
        :class="['message-card', item.readStatus ? '' : 'unread']"
        @tap="openMessage(item)"
      >
        <view class="message-head"
          ><text class="message-title">{{ item.title || title }}</text
          ><text class="message-time">{{ item.createTime || item.time || '' }}</text></view
        >
        <view class="message-content">{{ item.content }}</view>
      </view>
      <view v-if="messages.length" class="load-more" @tap="loadMore">{{
        loading ? '加载中...' : finished ? '没有更多了' : '加载更多'
      }}</view>
    </view>
  </s-layout>
</template>

<script setup>
  import { ref } from 'vue';
  import { onLoad, onReachBottom } from '@dcloudio/uni-app';
  import TutorMessageApi from '@/sheep/api/tutor/message';

  const actionRoutes = {
    certification_detail: '/pages/tutor/certification/index',
    my_posts: '/pages/tutor/my-posts/index',
    contact_records: '/pages/tutor/contacts/index',
    match_reviews: '/pages/tutor/reviews/index',
    point_records: '/pages/user/wallet/score',
  };
  const category = ref('');
  const title = ref('消息');
  const messages = ref([]);
  const pageNo = ref(1);
  const pageSize = 10;
  const loading = ref(false);
  const finished = ref(false);
  const error = ref(false);
  async function load(reset = false) {
    if (loading.value || (!reset && finished.value)) return;
    if (reset) {
      pageNo.value = 1;
      finished.value = false;
      messages.value = [];
    }
    loading.value = true;
    error.value = false;
    try {
      const result = await TutorMessageApi.getPage({
        category: category.value,
        pageNo: pageNo.value,
        pageSize,
      });
      if (result?.code !== 0) {
        error.value = true;
        return;
      }
      const payload = result.data || {};
      const rows = payload.list || [];
      messages.value.push(...rows);
      finished.value =
        rows.length < pageSize || messages.value.length >= (payload.total || Infinity);
      pageNo.value += 1;
    } catch {
      error.value = true;
    } finally {
      loading.value = false;
    }
  }
  function loadMore() {
    load();
  }
  async function markCategoryRead() {
    const result = await TutorMessageApi.markAllRead(category.value);
    if (result?.code !== 0) {
      uni.showToast({ title: '操作失败，请重试', icon: 'none' });
      return;
    }
    messages.value = messages.value.map((item) => ({ ...item, readStatus: true }));
  }
  function openMessage(item) {
    if (!item.readStatus) {
      TutorMessageApi.markRead(item.id).then((result) => {
        if (result?.code === 0) item.readStatus = true;
      });
    }
    const path = actionRoutes[item.action];
    if (path) uni.navigateTo({ url: path });
  }
  onLoad((options) => {
    category.value = options.category || '';
    title.value = options.title || '消息';
    load(true);
  });
  onReachBottom(loadMore);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    padding: 24rpx;
    background: #f5f7f5;
  }
  .toolbar,
  .message-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .toolbar {
    margin-bottom: 20rpx;
    color: #111827;
    font-size: 30rpx;
    font-weight: 700;
  }
  .read-all,
  .action {
    color: #0f766e;
    font-size: 25rpx;
    font-weight: 400;
  }
  .message-card {
    margin-bottom: 16rpx;
    padding: 24rpx;
    border-left: 6rpx solid transparent;
    border-radius: 12rpx;
    background: #fff;
  }
  .message-card.unread {
    border-left-color: #0f766e;
    background: #f0fdfa;
  }
  .message-title {
    color: #111827;
    font-size: 28rpx;
    font-weight: 700;
  }
  .message-time,
  .message-content,
  .state,
  .load-more {
    color: #64748b;
    font-size: 24rpx;
  }
  .message-content {
    margin-top: 12rpx;
    line-height: 38rpx;
  }
  .state,
  .load-more {
    padding: 40rpx 0;
    text-align: center;
  }
  .action {
    margin-left: 20rpx;
  }
</style>
