<template>
  <s-layout class="page" title="我的发布" navbar="inner">
    <view class="header">
      <view>
        <view class="title">我的发布</view>
        <view class="subtitle">查看审核进度、展示状态和联系数据</view>
      </view>
      <button class="publish-btn ss-reset-button" @tap="goPublish">
        <text class="cicon-add"></text>
        <text>发布</text>
      </button>
    </view>

    <view class="tabs">
      <button
        v-for="item in tabs"
        :key="item.value"
        class="tab ss-reset-button"
        :class="{ active: active === item.value }"
        @tap="active = item.value"
      >
        {{ item.label }} ({{ tabCount(item.value) }})
      </button>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <view class="stat-value">{{ filteredItems.length }}</view>
        <view class="stat-label">发布总数</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ totalViews }}</view>
        <view class="stat-label">总浏览</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ totalContacts }}</view>
        <view class="stat-label">联系方式查看</view>
      </view>
    </view>

    <view v-if="filteredItems.length" class="list">
      <view v-for="item in filteredItems" :key="`${item.type}-${item.id}`" class="card">
        <view class="card-head" @tap="goDetail(item)">
          <view class="card-main">
            <view class="title-row">
              <view class="card-title">{{ item.title || item.name }}</view>
              <text class="type-tag">{{ item.type === 'req' ? '需求' : '简历' }}</text>
            </view>
            <view class="meta">{{ item.cityName || item.district }} · {{ subjectText(item) }}</view>
          </view>
          <text class="status" :class="item.statusMeta.className">{{ item.statusMeta.text }}</text>
        </view>

        <view class="desc" @tap="goDetail(item)">{{ item.description }}</view>
        <view v-if="item.type === 'req' && item.address" class="desc" @tap="goDetail(item)">
          上课地址：{{ item.address }}
        </view>

        <view v-if="item.rejectReason" class="reject-reason">
          拒绝原因：{{ item.rejectReason }}
        </view>

        <view class="card-foot">
          <view class="metrics">
            <text class="metric"><text class="cicon-eye"></text>{{ item.viewCount || 0 }}</text>
            <text class="metric"
              ><text class="cicon-phone"></text>{{ item.contactViewCount || 0 }}</text
            >
            <text class="metric"
              ><text class="cicon-check-round"></text>{{ item.matchCount || 0 }}</text
            >
          </view>
          <view class="actions">
            <button class="action-btn ss-reset-button" @tap="goDetail(item)">查看</button>
            <button class="action-btn ss-reset-button" @tap="buyValueService(item)">推广</button>
            <button
              v-if="canOffline(item)"
              class="action-btn danger ss-reset-button"
              @tap="offline(item)"
            >
              下架
            </button>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <s-empty text="暂无发布" icon="/static/data-empty.png" />
      <button class="primary-btn ss-reset-button" @tap="goPublish">立即发布</button>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import TutorPostApi from '@/sheep/api/tutor/post';
  import {
    TUTOR_PUBLISH_STATUS,
    getStatusMeta,
    modeText,
    normalizeDemand,
    normalizeResume,
    toSubjectList,
  } from '@/sheep/api/tutor/utils';

  const active = ref('all');
  const state = reactive({
    demands: [],
    resumes: [],
  });

  const tabs = [
    { label: '全部', value: 'all' },
    { label: '家长需求', value: 'req' },
    { label: '教师简历', value: 'tutor' },
  ];

  const allItems = computed(() => [...state.demands, ...state.resumes]);

  const filteredItems = computed(() => {
    return allItems.value.filter((item) => active.value === 'all' || item.type === active.value);
  });

  const totalViews = computed(() =>
    filteredItems.value.reduce((total, item) => total + Number(item.viewCount || 0), 0),
  );
  const totalContacts = computed(() =>
    filteredItems.value.reduce((total, item) => total + Number(item.contactViewCount || 0), 0),
  );

  function tabCount(type) {
    if (type === 'all') {
      return allItems.value.length;
    }
    return allItems.value.filter((item) => item.type === type).length;
  }

  function subjectText(item) {
    const subjects = toSubjectList(item.subjects);
    const price =
      item.type === 'req'
        ? `¥${item.budgetMin || item.budget}-${item.budgetMax || item.budget}/时`
        : `¥${item.hourlyPrice || item.price}/时`;
    return `${subjects.join('、') || '未填科目'} · ${modeText(
      item.teachMode || item.mode,
    )} · ${price}`;
  }

  function canOffline(item) {
    return item.status !== TUTOR_PUBLISH_STATUS.OFFLINE;
  }

  function goDetail(item) {
    uni.navigateTo({ url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}` });
  }

  function buyValueService(item) {
    const targetType = item.type === 'req' ? 'demand' : 'resume';
    uni.navigateTo({
      url: `/pages/tutor/value-service/index?targetType=${targetType}&targetId=${
        item.id
      }&title=${encodeURIComponent(item.title || item.name || '')}`,
    });
  }

  function goPublish() {
    uni.switchTab({ url: '/pages/index/publish' });
  }

  async function offline(item) {
    uni.showModal({
      title: '确认下架',
      content: '下架后该信息将不再展示在广场，可重新发布新内容。',
      confirmText: '下架',
      confirmColor: '#dc2626',
      success: async (res) => {
        if (!res.confirm) {
          return;
        }
        const result =
          item.type === 'req'
            ? await TutorPostApi.offlineDemand(item.id)
            : await TutorPostApi.offlineResume(item.id);
        if (result?.code === 0) {
          await loadPosts();
        }
      },
    });
  }

  function normalizeWithStatus(item, type, index) {
    const normalized = type === 'req' ? normalizeDemand(item, index) : normalizeResume(item, index);
    return {
      ...normalized,
      type,
      statusMeta: getStatusMeta(item),
    };
  }

  async function loadPosts() {
    const [demands, resumes] = await Promise.all([
      TutorPostApi.getMyDemandList(),
      TutorPostApi.getMyResumeList(),
    ]);
    state.demands = Array.isArray(demands?.data)
      ? demands.data.map((item, index) => normalizeWithStatus(item, 'req', index))
      : [];
    state.resumes = Array.isArray(resumes?.data)
      ? resumes.data.map((item, index) => normalizeWithStatus(item, 'tutor', index))
      : [];
  }

  onShow(loadPosts);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding: 24rpx;
    background: #fff;
    border-bottom: 1px solid #eef2f7;
  }

  .title {
    color: #111827;
    font-size: 36rpx;
    font-weight: 900;
  }

  .subtitle {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .publish-btn {
    height: 62rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 0 20rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 24rpx;
    font-weight: 800;
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
    font-size: 24rpx;
    font-weight: 800;
  }

  .tab.active,
  .primary-btn {
    color: #fff;
    background: #2563eb;
  }

  .stats-card {
    display: flex;
    justify-content: space-around;
    margin: 0 24rpx 24rpx;
    padding: 24rpx 0;
    border-radius: 20rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    color: #111827;
    font-size: 34rpx;
    font-weight: 900;
  }

  .stat-label {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 0 24rpx 40rpx;
  }

  .card {
    padding: 24rpx;
    border-radius: 20rpx;
    background: #fff;
    border: 1px solid #e8eef0;
    box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.04);
  }

  .card-head,
  .title-row,
  .card-foot,
  .metrics,
  .actions {
    display: flex;
    align-items: center;
  }

  .card-head {
    justify-content: space-between;
    gap: 16rpx;
  }

  .card-main {
    min-width: 0;
    flex: 1;
  }

  .title-row {
    gap: 10rpx;
  }

  .card-title {
    overflow: hidden;
    color: #111827;
    font-size: 30rpx;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .type-tag,
  .status {
    flex-shrink: 0;
    padding: 5rpx 12rpx;
    border-radius: 999rpx;
    font-size: 21rpx;
    font-weight: 800;
  }

  .type-tag {
    color: #2563eb;
    background: #eff6ff;
  }

  .status.active {
    color: #047857;
    background: #ecfdf5;
  }

  .status.pending,
  .status.draft {
    color: #b45309;
    background: #fffbeb;
  }

  .status.rejected {
    color: #dc2626;
    background: #fef2f2;
  }

  .status.offline {
    color: #64748b;
    background: #f1f5f9;
  }

  .meta,
  .desc,
  .reject-reason {
    margin-top: 14rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .desc {
    display: -webkit-box;
    overflow: hidden;
    color: #475569;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .reject-reason {
    padding: 16rpx;
    border-radius: 14rpx;
    color: #991b1b;
    background: #fef2f2;
  }

  .card-foot {
    justify-content: space-between;
    gap: 16rpx;
    margin-top: 18rpx;
    padding-top: 18rpx;
    border-top: 1px solid #f1f5f9;
  }

  .metrics {
    min-width: 0;
    flex-wrap: wrap;
    gap: 16rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .metric {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }

  .actions {
    flex-shrink: 0;
    gap: 10rpx;
  }

  .action-btn {
    height: 54rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 23rpx;
    font-weight: 800;
  }

  .action-btn.danger {
    color: #dc2626;
    background: #fef2f2;
  }

  .empty-wrap {
    padding: 60rpx 24rpx;
  }

  .primary-btn {
    width: 100%;
    height: 84rpx;
    margin-top: 24rpx;
    border-radius: 999rpx;
    font-size: 28rpx;
    font-weight: 900;
  }
</style>
