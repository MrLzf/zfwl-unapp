<template>
  <s-layout class="detail-page" title="" navbar="">
    <view class="detail-shell">
      <view class="detail-header">
        <button class="icon-btn ss-reset-button" @tap="goBack">
          <text class="cicon-back"></text>
        </button>
        <text class="header-title">{{ isTutor ? '老师详情' : '需求详情' }}</text>
        <button class="icon-btn ss-reset-button" @tap="shareDetail">
          <text class="cicon-share"></text>
        </button>
      </view>

      <scroll-view class="detail-scroll" scroll-y>
        <view class="profile-card">
          <view class="profile-main">
            <image class="avatar" :src="detail.avatar" mode="aspectFill" />
            <view class="profile-info">
              <view class="profile-name">{{ detail.title || detail.name }}</view>
              <view class="profile-desc">
                {{ detail.district }} · {{ detail.distance }}km · {{ detail.createdAt }}
              </view>
              <view class="badge-row">
                <text v-if="detail.verified">资料已认证</text>
                <text v-if="detail.urgent">加急需求</text>
                <text v-if="detail.hasFreeTrial">支持试课</text>
              </view>
            </view>
          </view>
          <view class="price-line">
            <view>
              <text class="price">¥{{ detail.budget || detail.price }}</text>
              <text class="price-unit">/小时</text>
            </view>
            <text class="role-tag">{{ isTutor ? '老师简历' : '家长需求' }}</text>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">关键信息</view>
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">授课科目</text>
              <text class="info-value">{{ detail.subjects.join('、') }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">授课方式</text>
              <text class="info-value">{{ modeText(detail.mode) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">{{ isTutor ? '学历资历' : '学生年级' }}</text>
              <text class="info-value">{{ detail.education || detail.grade }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">{{ isTutor ? '评分' : '上课频次' }}</text>
              <text class="info-value">{{
                isTutor ? `${detail.score} 分` : detail.frequency
              }}</text>
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">{{ isTutor ? '教学介绍' : '需求说明' }}</view>
          <view class="description">{{ detail.description }}</view>
        </view>

        <view class="panel">
          <view class="panel-title">匹配标签</view>
          <view class="tag-row">
            <text v-for="tag in detail.expectations" :key="tag">{{ tag }}</text>
          </view>
        </view>

        <view class="safe-panel">
          <view class="safe-title">联系前提醒</view>
          <view class="safe-text">
            查看联系方式会扣除 10 积分，30 天内重复查看不再扣分。请先确认对方信息与需求匹配。
          </view>
        </view>
      </scroll-view>

      <view class="action-bar">
        <button
          class="minor-btn ss-reset-button"
          :class="{ active: isFavorited }"
          @tap="toggleFavorite"
        >
          <text class="cicon-favorite"></text>
          <text>{{ isFavorited ? '已收藏' : '收藏' }}</text>
        </button>
        <button class="minor-btn ss-reset-button" @tap="confirmMatch">
          <text class="cicon-check-round"></text>
          <text>匹配</text>
        </button>
        <button class="contact-btn ss-reset-button" @tap="viewContact">
          <text class="cicon-phone"></text>
          <text>{{ hasViewedContact ? '查看号码' : '查看联系方式' }}</text>
        </button>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, toRefs } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import { getTutorItem } from '@/sheep/api/tutor/mock-data';

  const state = reactive({
    type: 'req',
    id: 'req-r3',
    points: 50,
    detail: getTutorItem('req-r3'),
    isFavorited: false,
    hasViewedContact: false,
  });

  const { detail, isFavorited, hasViewedContact } = toRefs(state);
  const isTutor = computed(() => state.detail.type === 'tutor');

  function modeText(mode) {
    return {
      offline: '上门',
      online: '在线',
      both: '上门/在线均可',
    }[mode];
  }

  function goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
      return;
    }
    uni.switchTab({ url: '/pages/index/index' });
  }

  function shareDetail() {
    uni.setClipboardData({
      data: `/pages/tutor/detail/index?type=${state.detail.type}&id=${state.detail.id}`,
      success: () => {
        uni.showToast({ title: '链接已复制', icon: 'none' });
      },
    });
  }

  function toggleFavorite() {
    state.isFavorited = !state.isFavorited;
    uni.showToast({
      title: state.isFavorited ? '已收藏' : '已取消收藏',
      icon: 'none',
    });
  }

  function confirmMatch() {
    uni.showToast({
      title: '匹配确认已记录',
      icon: 'none',
    });
  }

  function viewContact() {
    if (state.hasViewedContact) {
      uni.showModal({
        title: '联系方式',
        content: `${state.detail.contactName}  ${state.detail.fullPhone}`,
        showCancel: false,
      });
      return;
    }
    uni.showModal({
      title: '查看联系方式',
      content: `本次将扣除 10 积分，当前积分 ${state.points} 分。确认后展示完整号码。`,
      confirmText: '确认查看',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        if (state.points < 10) {
          uni.showToast({ title: '积分不足', icon: 'none' });
          return;
        }
        state.points -= 10;
        state.hasViewedContact = true;
        viewContact();
      },
    });
  }

  onLoad((options = {}) => {
    const incomingId = options.id || 'req-r3';
    state.type = options.type || 'req';
    state.id = incomingId;
    state.detail = getTutorItem(incomingId);
  });
</script>

<style lang="scss" scoped>
  .detail-page,
  .detail-shell {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .detail-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: calc(var(--status-bar-height) + 88rpx);
    padding: var(--status-bar-height) 24rpx 0;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.92);
    border-bottom: 1px solid #eef2f7;
  }

  .header-title {
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .icon-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #334155;
    font-size: 34rpx;
  }

  .detail-scroll {
    height: 100vh;
    box-sizing: border-box;
    padding: calc(var(--status-bar-height) + 108rpx) 24rpx 170rpx;
  }

  .profile-card,
  .panel,
  .safe-panel {
    border-radius: 12rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .profile-card {
    padding: 26rpx;
  }

  .profile-main,
  .price-line,
  .badge-row,
  .action-bar {
    display: flex;
    align-items: center;
  }

  .avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 56rpx;
    flex-shrink: 0;
    background: #e5e7eb;
  }

  .profile-info {
    min-width: 0;
    flex: 1;
    margin-left: 20rpx;
  }

  .profile-name {
    color: #111827;
    font-size: 36rpx;
    font-weight: 800;
    line-height: 48rpx;
  }

  .profile-desc {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .badge-row {
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 16rpx;
  }

  .badge-row text,
  .tag-row text,
  .role-tag {
    padding: 7rpx 12rpx;
    border-radius: 999rpx;
    color: #0f766e;
    background: #ecfdf5;
    font-size: 21rpx;
  }

  .price-line {
    justify-content: space-between;
    margin-top: 26rpx;
    padding-top: 22rpx;
    border-top: 1px solid #eef2f7;
  }

  .price {
    color: #f97316;
    font-size: 44rpx;
    font-weight: 900;
  }

  .price-unit {
    margin-left: 6rpx;
    color: #94a3b8;
    font-size: 23rpx;
  }

  .panel,
  .safe-panel {
    margin-top: 18rpx;
    padding: 26rpx;
  }

  .panel-title,
  .safe-title {
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24rpx 18rpx;
    margin-top: 24rpx;
  }

  .info-label {
    display: block;
    margin-bottom: 8rpx;
    color: #94a3b8;
    font-size: 23rpx;
  }

  .info-value {
    display: block;
    color: #334155;
    font-size: 26rpx;
    line-height: 36rpx;
  }

  .description,
  .safe-text {
    margin-top: 18rpx;
    color: #475569;
    font-size: 26rpx;
    line-height: 44rpx;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 20rpx;
  }

  .safe-panel {
    background: #fffbeb;
    border-color: #fde68a;
  }

  .safe-title {
    color: #92400e;
  }

  .safe-text {
    color: #92400e;
  }

  .action-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    gap: 14rpx;
    padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
    background: #ffffff;
    border-top: 1px solid #eef2f7;
  }

  .minor-btn {
    width: 96rpx;
    height: 88rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 20rpx;
  }

  .minor-btn text:first-child {
    margin-bottom: 6rpx;
    font-size: 34rpx;
  }

  .minor-btn.active {
    color: #f59e0b;
  }

  .contact-btn {
    min-width: 0;
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    border-radius: 12rpx;
    color: #ffffff;
    background: #0f766e;
    box-shadow: 0 14rpx 30rpx rgba(15, 118, 110, 0.22);
    font-size: 28rpx;
    font-weight: 800;
  }
</style>
