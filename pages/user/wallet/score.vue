<template>
  <s-layout class="page" title="" navbar="">
    <view class="score-header">
      <button class="back-btn ss-reset-button" @tap="goBack">
        <text class="cicon-back"></text>
      </button>
      <view class="balance-label">我的积分</view>
      <view class="balance">{{ pointBalance }}</view>
      <view class="balance-desc">积分可用于查看联系方式，30 天内复看同一联系人免费。</view>
    </view>

    <view v-if="state.insufficient" class="guide-card warning">
      <view>
        <view class="guide-title">积分不足</view>
        <view class="guide-desc">查看联系方式需 10 积分，可选择积分包充值或完成任务获取。</view>
      </view>
      <button class="guide-btn ss-reset-button" @tap="goRecharge">去充值</button>
    </view>

    <view class="guide-card">
      <view>
        <view class="guide-title">积分获取方式</view>
        <view class="guide-desc">每日签到、完善资料、五星评价奖励、积分包充值。</view>
      </view>
      <button class="guide-btn ss-reset-button" @tap="goRecharge">充值</button>
    </view>
    <view class="task-card">
      <view class="guide-title">做任务赚积分</view>
      <view v-for="task in state.tasks" :key="task.type" class="task-item">
        <view
          ><view class="name">{{ task.title }}</view
          ><view class="guide-desc">{{ task.description }}</view
          ><view class="guide-desc">{{
            task.point == null ? '按签到规则奖励' : `完成奖励 +${task.point} 积分`
          }}</view></view
        >
        <button
          v-if="!task.completed || task.type === 'five_star_review'"
          class="guide-btn ss-reset-button"
          @tap="handleTask(task)"
          >{{ task.action === 'sign_in' ? '签到' : '去完成' }}</button
        >
        <text v-else class="done">已完成</text>
      </view>
    </view>

    <view class="tabs">
      <button
        v-for="(tab, index) in tabMaps"
        :key="tab.value"
        class="tab ss-reset-button"
        :class="{ active: state.currentTab === index }"
        @tap="changeTab(index)"
      >
        {{ tab.name }}
      </button>
    </view>

    <view class="list-box">
      <view v-if="state.pagination.list.length">
        <view class="list-item" v-for="item in state.pagination.list" :key="item.id">
          <view>
            <view class="name"
              >{{ item.title }}{{ item.description ? ' - ' + item.description : '' }}</view
            >
            <view class="time">{{ formatTime(item.createTime) }}</view>
          </view>
          <view class="point" :class="{ income: Number(item.point) > 0 }">
            {{ Number(item.point) > 0 ? '+' : '' }}{{ item.point }}
          </view>
        </view>
      </view>
      <s-empty v-else text="暂无积分明细" icon="/static/data-empty.png" />
    </view>

    <uni-load-more
      v-if="state.pagination.list.length"
      :status="state.loadStatus"
      :content-text="{
        contentdown: '上拉加载更多',
        contentrefresh: '加载中',
        contentnomore: '没有更多了',
      }"
      @tap="onLoadMore"
    />
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app';
  import dayjs from 'dayjs';
  import sheep from '@/sheep';
  import PointApi from '@/sheep/api/member/point';
  import SignInApi from '@/sheep/api/member/signin';
  import TutorPointApi from '@/sheep/api/tutor/point';
  import { getLocalPoints } from '@/sheep/api/tutor/local-state';
  import { formatDateTime } from '@/sheep/api/tutor/utils';

  const userInfo = computed(() => sheep.$store('user').userInfo || {});
  const localPoints = ref(getLocalPoints());
  const pointBalance = computed(() =>
    userInfo.value.point === undefined || userInfo.value.point === null
      ? localPoints.value
      : userInfo.value.point,
  );

  const state = reactive({
    insufficient: false,
    currentTab: 0,
    pagination: {
      list: [],
      total: 0,
      pageSize: 10,
      pageNo: 1,
    },
    loadStatus: 'more',
    tasks: [],
  });

  async function getTaskList() {
    const result = await TutorPointApi.getTaskList();
    if (result?.code === 0) state.tasks = result.data || [];
  }

  async function handleTask(task) {
    if (task.action === 'sign_in') {
      const result = await SignInApi.createSignInRecord();
      if (result?.code === 0) {
        const userStore = sheep.$store('user');
        await userStore.getInfo();
        await getTaskList();
        await getLogList(true);
      }
      return;
    }
    if (task.path) uni.navigateTo({ url: task.path });
  }

  const tabMaps = [
    { name: '全部', value: 'all' },
    { name: '收入', value: 'true' },
    { name: '支出', value: 'false' },
  ];

  function formatTime(value) {
    return formatDateTime(value);
  }

  function fallbackRecords() {
    return [
      {
        id: 'local-contact',
        title: '查看联系方式',
        description: '本地示例扣分',
        point: -10,
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        id: 'local-review',
        title: '五星评价奖励',
        description: '待平台入账',
        point: 10,
        createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      },
    ].filter((item) => {
      if (state.currentTab === 1) return item.point > 0;
      if (state.currentTab === 2) return item.point < 0;
      return true;
    });
  }

  async function getLogList(reset = false) {
    if (reset) {
      state.pagination.pageNo = 1;
      state.pagination.list = [];
      state.loadStatus = 'more';
    }
    if (state.loadStatus === 'loading') return;
    state.loadStatus = 'loading';
    const result = await PointApi.getPointRecordPage({
      pageNo: state.pagination.pageNo,
      pageSize: state.pagination.pageSize,
      addStatus: state.currentTab > 0 ? tabMaps[state.currentTab].value : undefined,
    });
    if (result?.code === 0) {
      const list = result.data?.list || [];
      state.pagination.list = reset ? list : [...state.pagination.list, ...list];
      state.pagination.total = Number(result.data?.total || list.length);
    } else if (reset || !state.pagination.list.length) {
      const list = fallbackRecords();
      state.pagination.list = list;
      state.pagination.total = list.length;
    }
    state.loadStatus = state.pagination.list.length < state.pagination.total ? 'more' : 'noMore';
  }

  function changeTab(index) {
    state.currentTab = index;
    getLogList(true);
  }

  function onLoadMore() {
    if (state.loadStatus !== 'more') return;
    state.pagination.pageNo += 1;
    getLogList(false);
  }

  function goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
      return;
    }
    uni.switchTab({ url: '/pages/index/user' });
  }

  function goService() {
    uni.navigateTo({ url: '/pages/tutor/customer-service/index' });
  }

  function goRecharge() {
    uni.navigateTo({ url: '/pages/tutor/recharge/index' });
  }

  async function refreshScorePage() {
    const userStore = sheep.$store('user');
    localPoints.value = getLocalPoints();
    await userStore.getInfo();
    await getTaskList();
    await getLogList(true);
  }

  onLoad((options = {}) => {
    state.insufficient = options.scene === 'insufficient';
  });

  onShow(() => {
    refreshScorePage();
  });

  onReachBottom(onLoadMore);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f8fafc;
  }

  .score-header {
    position: relative;
    padding: calc(var(--status-bar-height) + 20rpx) 32rpx 92rpx;
    color: #ffffff;
    background: linear-gradient(145deg, #1d4ed8 0%, #2563eb 60%, #60a5fa 100%);
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

  .guide-card {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    margin: -46rpx 24rpx 24rpx;
    padding: 26rpx;
    border-radius: 18rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
    box-shadow: 0 16rpx 36rpx rgba(15, 23, 42, 0.08);
  }

  .guide-card + .guide-card {
    margin-top: 0;
    box-shadow: none;
  }

  .guide-card.warning {
    border-color: #fed7aa;
    background: #fff7ed;
  }

  .guide-title {
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
  }

  .guide-desc {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 36rpx;
  }

  .guide-btn {
    flex-shrink: 0;
    height: 66rpx;
    padding: 0 22rpx;
    border-radius: 999rpx;
    color: #ffffff;
    background: #2563eb;
    font-size: 24rpx;
    font-weight: 800;
  }

  .tabs {
    display: flex;
    gap: 10rpx;
    margin: 0 24rpx 20rpx;
    padding: 8rpx;
    border-radius: 16rpx;
    background: #e2e8f0;
  }
  .task-card {
    margin: 0 24rpx 24rpx;
    padding: 26rpx;
    border-radius: 18rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }
  .task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    padding: 22rpx 0;
    border-bottom: 1px solid #eef2f7;
  }
  .task-item:last-child {
    border-bottom: 0;
  }
  .done {
    color: #16a34a;
    font-size: 24rpx;
    font-weight: 800;
  }

  .tab {
    flex: 1;
    height: 68rpx;
    border-radius: 12rpx;
    color: #64748b;
    font-size: 26rpx;
    font-weight: 800;
  }

  .tab.active {
    color: #2563eb;
    background: #ffffff;
  }

  .list-box {
    margin: 0 24rpx 24rpx;
    overflow: hidden;
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding: 28rpx;
    border-bottom: 1px solid #eef2f7;
  }

  .list-item:last-child {
    border-bottom: 0;
  }

  .name {
    color: #0f172a;
    font-size: 28rpx;
    font-weight: 800;
    line-height: 38rpx;
  }

  .time {
    margin-top: 8rpx;
    color: #94a3b8;
    font-size: 23rpx;
  }

  .point {
    flex-shrink: 0;
    color: #ef4444;
    font-size: 32rpx;
    font-weight: 900;
  }

  .point.income {
    color: #16a34a;
  }
</style>
