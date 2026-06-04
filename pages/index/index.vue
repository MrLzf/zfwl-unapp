<template>
  <s-layout title="" navbar="" tabbar="/pages/index/index" class="tutor-home">
    <view class="home-shell">
      <view class="hero" :class="{ teacher: isTeacher }">
        <view class="hero-top">
          <view class="city-pill" @tap="goCity">
            <text class="cicon-location-on"></text>
            <text>{{ city.name || '选择城市' }}</text>
            <text class="cicon-drop-down"></text>
          </view>
          <button class="message-btn ss-reset-button" @tap="goMessages">
            <text class="cicon-chat-o"></text>
          </button>
        </view>

        <view class="search-box" @tap="goSearch">
          <text class="cicon-search"></text>
          <text>{{ searchPlaceholder }}</text>
        </view>
      </view>

      <view class="content">
        <view v-if="showSetupCard" class="setup-card">
          <view>
            <view class="setup-title">先选择身份，推荐会更准</view>
            <view class="setup-desc">家长看优质老师，老师看同城需求。</view>
          </view>
          <button class="setup-btn ss-reset-button" @tap="goIdentity">去选择</button>
        </view>

        <view class="quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.label"
            class="quick-item ss-reset-button"
            @tap="handleAction(action)"
          >
            <view class="quick-icon" :class="action.color">
              <text :class="action.icon"></text>
            </view>
            <view class="quick-label">{{ action.label }}</view>
          </button>
        </view>

        <view class="banner-wrap">
          <swiper
            class="banner-swiper"
            circular
            autoplay
            :interval="3200"
            :current="currentBanner"
            @change="onBannerChange"
          >
            <swiper-item v-for="banner in banners" :key="banner.id">
              <view class="banner-card" :class="banner.color" @tap="handleBanner(banner)">
                <view class="banner-copy">
                  <view class="banner-tag">
                    <text :class="banner.icon"></text>
                    <text>{{ banner.tag }}</text>
                  </view>
                  <view class="banner-title">{{ banner.title }}</view>
                  <view class="banner-subtitle">{{ banner.subtitle }}</view>
                </view>
                <button class="banner-btn ss-reset-button" @tap.stop="handleBanner(banner)">
                  {{ banner.buttonText }}
                </button>
              </view>
            </swiper-item>
          </swiper>

          <view class="dots">
            <view
              v-for="(_, index) in banners"
              :key="index"
              class="dot"
              :class="{ active: currentBanner === index }"
            ></view>
          </view>
        </view>

        <view class="section-head">
          <view class="section-title">
            <text :class="primarySection.icon"></text>
            <text>{{ primarySection.title }}</text>
          </view>
          <button class="link-btn ss-reset-button" @tap="goSquare">查看全部</button>
        </view>

        <view v-if="isTeacher" class="request-list">
          <view
            v-for="(item, index) in hotRequests"
            :key="item.id"
            class="request-card"
            :class="{ locked: isLocked(index) }"
            @tap="goDetail(item, index)"
          >
            <view class="lock-mask" v-if="isLocked(index)">
              <text class="cicon-lock"></text>
              <text>登录后查看更多</text>
            </view>
            <view class="request-top">
              <view class="request-main">
                <view class="request-title">
                  <text v-if="item.urgent" class="urgent">急</text>
                  <text>{{ item.title }}</text>
                </view>
                <view class="request-meta">
                  {{ item.grade }} · {{ item.subject }} · {{ item.frequency }}
                </view>
              </view>
              <view class="price">¥{{ item.budget }}/时</view>
            </view>
            <view class="request-foot">
              <view class="mini-user">
                <image class="mini-avatar" :src="item.avatar" mode="aspectFill" />
                <text>{{ item.parentName || item.contactName }}</text>
              </view>
              <text>{{ formatDistance(item.distance) }} · {{ modeText(item.mode) }}</text>
            </view>
          </view>
        </view>

        <view v-else class="teacher-grid">
          <view
            v-for="(item, index) in topTeachers"
            :key="item.id"
            class="teacher-card"
            :class="{ locked: isLocked(index) }"
            @tap="goDetail(item, index)"
          >
            <view class="lock-mask" v-if="isLocked(index)">
              <text class="cicon-lock"></text>
              <text>登录后查看更多</text>
            </view>
            <image class="teacher-avatar" :src="item.avatar" mode="aspectFill" />
            <view class="teacher-name">{{ item.name }}</view>
            <view class="teacher-edu">{{ item.education }}</view>
            <view class="rating-row">
              <text class="cicon-star"></text>
              <text>{{ item.score || item.rating || '5.0' }}</text>
              <text class="review-count">({{ item.reviewCount || item.reviews || 0 }})</text>
            </view>
            <view class="subject-row">
              <text v-for="subject in item.subjects.slice(0, 2)" :key="subject">{{ subject }}</text>
            </view>
            <view class="teacher-foot">
              <text>{{ formatDistance(item.distance) }}</text>
              <text class="price">¥{{ item.price }}/时</text>
            </view>
          </view>
        </view>

        <view v-if="!isTeacher" class="section-head secondary">
          <view class="section-title">
            <text class="cicon-flash-on"></text>
            <text>热门需求</text>
          </view>
          <button class="link-btn ss-reset-button" @tap="goSquare">查看全部</button>
        </view>

        <view v-if="!isTeacher" class="request-list compact">
          <view
            v-for="(item, index) in hotRequests.slice(0, 3)"
            :key="item.id"
            class="request-card"
            @tap="goDetail(item, index)"
          >
            <view class="request-top">
              <view class="request-main">
                <view class="request-title">{{ item.title }}</view>
                <view class="request-meta">
                  {{ item.grade }} · {{ item.subject }} · {{ item.frequency }}
                </view>
              </view>
              <view class="price">¥{{ item.budget }}/时</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, toRefs } from 'vue';
  import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { showAuthModal } from '@/sheep/hooks/useModal';
  import TutorMarketApi from '@/sheep/api/tutor/market';
  import { getLocationPayload } from '@/sheep/api/tutor/location';
  import { tutorRequests, tutorTeachers } from '@/sheep/api/tutor/mock-data';
  import {
    TUTOR_ROLE,
    formatDistance,
    getPageList,
    modeText,
    normalizeDemand,
    normalizeResume,
  } from '@/sheep/api/tutor/utils';

  const state = reactive({
    city: {},
    profile: null,
    currentBanner: 0,
    teachers: [],
    requests: [],
  });

  const { city, profile, currentBanner } = toRefs(state);
  const userStore = sheep.$store('user');

  const isTeacher = computed(() => {
    return state.profile?.role === TUTOR_ROLE.TEACHER || state.profile?.roleName === '教师';
  });

  const showSetupCard = computed(() => userStore.isLogin && !state.profile?.role);

  const searchPlaceholder = computed(() =>
    isTeacher.value ? '搜索家长需求、科目或年级' : '搜索科目、老师或年级',
  );

  const quickActions = computed(() => {
    if (!userStore.isLogin || !state.profile?.role) {
      return [
        {
          label: '找老师',
          icon: 'cicon-book',
          color: 'blue',
          path: '/pages/index/square',
          tab: true,
        },
        {
          label: '选择身份',
          icon: 'cicon-my',
          color: 'orange',
          path: '/pages/tutor/identity/index',
          auth: true,
        },
        {
          label: '免费发布',
          icon: 'cicon-flash-on',
          color: 'green',
          auth: true,
        },
      ];
    }
    if (isTeacher.value) {
      return [
        {
          label: '找家长',
          icon: 'cicon-group',
          color: 'orange',
          path: '/pages/index/square',
          tab: true,
        },
        {
          label: '发布简历',
          icon: 'cicon-flash-on',
          color: 'green',
          publishRole: 'teacher',
          auth: true,
        },
        {
          label: '认证',
          icon: 'cicon-check-round',
          color: 'purple',
          path: '/pages/tutor/certification/index',
          auth: true,
        },
      ];
    }
    return [
      {
        label: '找老师',
        icon: 'cicon-book',
        color: 'blue',
        path: '/pages/index/square',
        tab: true,
      },
      {
        label: '发布需求',
        icon: 'cicon-flash-on',
        color: 'green',
        publishRole: 'parent',
        auth: true,
      },
    ];
  });

  const banners = [
    {
      id: 1,
      tag: '限时活动',
      title: '新用户专享',
      subtitle: '首单立减50元',
      buttonText: '立即领取',
      icon: 'cicon-flash-on',
      color: 'warm',
      auth: true,
    },
    {
      id: 2,
      tag: '会员福利',
      title: 'VIP专属',
      subtitle: '查看联系方式享优惠',
      buttonText: '开通会员',
      icon: 'cicon-service-fill',
      color: 'cool',
      auth: true,
    },
    {
      id: 3,
      tag: '推荐好友',
      title: '邀请有礼',
      subtitle: '双方获得积分奖励',
      buttonText: '去邀请',
      icon: 'cicon-service',
      color: 'fresh',
      auth: true,
    },
  ];

  const primarySection = computed(() =>
    isTeacher.value
      ? { title: '热门需求', icon: 'cicon-flash-on' }
      : { title: '优质教师', icon: 'cicon-check-round' },
  );

  const topTeachers = computed(() =>
    (state.teachers.length ? state.teachers : tutorTeachers).slice(0, 6),
  );
  const hotRequests = computed(() =>
    (state.requests.length ? state.requests : tutorRequests).slice(0, 6),
  );

  function loadCity() {
    state.city = uni.getStorageSync('tutor_city') || uni.getStorageSync('tutor_located_city') || {};
  }

  async function loadProfile() {
    if (!userStore.isLogin) {
      state.profile = null;
      return;
    }
    state.profile = await userStore.getTutorProfile();
    if (!state.city?.code && state.profile?.cityCode) {
      state.city = {
        id: state.profile.cityId,
        code: state.profile.cityCode,
        name: state.profile.cityName,
      };
    }
  }

  async function loadRecommendations() {
    const location = getLocationPayload(state.city);
    const params = {
      pageNo: 1,
      pageSize: 6,
      cityCode: state.city?.code,
      longitude: location.longitude,
      latitude: location.latitude,
    };
    const [resumeResult, demandResult] = await Promise.all([
      TutorMarketApi.getResumePage(params),
      TutorMarketApi.getDemandPage(params),
    ]);
    state.teachers =
      resumeResult?.code === 0 && getPageList(resumeResult.data).length
        ? getPageList(resumeResult.data).map(normalizeResume)
        : tutorTeachers;
    state.requests =
      demandResult?.code === 0 && getPageList(demandResult.data).length
        ? getPageList(demandResult.data).map(normalizeDemand)
        : tutorRequests;
  }

  function ensureAuth(callback) {
    if (userStore.isLogin) {
      callback();
      return;
    }
    showAuthModal();
  }

  function isLocked(index) {
    return !userStore.isLogin && index >= 5;
  }

  function handleAction(action) {
    if (action.publishRole) {
      ensureAuth(() => goPublish(action.publishRole));
      return;
    }
    const navigate = () => {
      if (action.tab) {
        uni.switchTab({ url: action.path });
      } else {
        uni.navigateTo({ url: action.path });
      }
    };
    if (action.auth) {
      ensureAuth(navigate);
      return;
    }
    navigate();
  }

  function handleBanner(banner) {
    if (banner.auth) {
      ensureAuth(() => uni.showToast({ title: banner.buttonText, icon: 'none' }));
      return;
    }
    uni.showToast({ title: banner.buttonText, icon: 'none' });
  }

  function onBannerChange(event) {
    state.currentBanner = event.detail.current;
  }

  function goCity() {
    uni.navigateTo({ url: '/pages/tutor/city/index' });
  }

  function goIdentity() {
    uni.navigateTo({ url: '/pages/tutor/identity/index' });
  }

  function goSquare() {
    uni.switchTab({ url: '/pages/index/square' });
  }

  function goSearch() {
    uni.navigateTo({ url: '/pages/tutor/search/index' });
  }

  function goMessages() {
    ensureAuth(() => uni.switchTab({ url: '/pages/index/message' }));
  }

  function goPublish(role) {
    uni.setStorageSync('tutor_publish_role', role);
    uni.switchTab({ url: '/pages/index/publish' });
  }

  function goDetail(item, index = 0) {
    if (isLocked(index)) {
      showAuthModal();
      return;
    }
    uni.navigateTo({
      url: `/pages/tutor/detail/index?type=${item.type}&id=${item.id}`,
    });
  }

  async function refresh() {
    loadCity();
    await loadProfile();
    await loadRecommendations();
  }

  onShow(refresh);

  onPullDownRefresh(async () => {
    await refresh();
    uni.stopPullDownRefresh();
  });
</script>

<style lang="scss" scoped>
  .tutor-home,
  .home-shell {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .home-shell {
    padding-bottom: 28rpx;
  }

  .hero {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: calc(var(--status-bar-height) + 44rpx) 30rpx 54rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border-bottom-left-radius: 44rpx;
    border-bottom-right-radius: 44rpx;
  }

  .hero.teacher {
    background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
  }

  .hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32rpx;
  }

  .city-pill,
  .message-btn {
    display: flex;
    align-items: center;
    color: #fff;
  }

  .city-pill {
    gap: 8rpx;
    font-size: 31rpx;
    font-weight: 800;
  }

  .city-pill text:first-child,
  .message-btn text {
    font-size: 36rpx;
  }

  .message-btn {
    width: 58rpx;
    height: 58rpx;
    justify-content: center;
  }

  .search-box {
    height: 84rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 0 30rpx;
    border-radius: 24rpx;
    color: #94a3b8;
    background: #fff;
    font-size: 28rpx;
    box-shadow: 0 16rpx 32rpx rgba(15, 23, 42, 0.08);
  }

  .search-box text:first-child {
    font-size: 36rpx;
  }

  .content {
    margin-top: -22rpx;
    padding-bottom: 24rpx;
  }

  .setup-card {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    margin: 0 30rpx 20rpx;
    padding: 24rpx;
    border-radius: 20rpx;
    color: #0f172a;
    background: #fff;
    box-shadow: 0 14rpx 28rpx rgba(15, 23, 42, 0.1);
  }

  .setup-title {
    font-size: 29rpx;
    font-weight: 900;
  }

  .setup-desc {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .setup-btn {
    flex-shrink: 0;
    height: 62rpx;
    padding: 0 24rpx;
    border-radius: 999rpx;
    color: #fff;
    background: #2563eb;
    font-size: 24rpx;
    font-weight: 800;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18rpx;
    padding: 24rpx 30rpx 28rpx;
    background: #fff;
    border-top-left-radius: 28rpx;
    border-top-right-radius: 28rpx;
  }

  .quick-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14rpx;
  }

  .quick-icon {
    width: 108rpx;
    height: 108rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 28rpx;
    color: #fff;
    box-shadow: 0 16rpx 28rpx rgba(15, 23, 42, 0.12);
  }

  .quick-icon text {
    font-size: 48rpx;
  }

  .quick-icon.blue {
    background: #2f80ed;
  }

  .quick-icon.orange {
    background: #ff6b00;
  }

  .quick-icon.green {
    background: #12c55b;
  }

  .quick-icon.purple {
    background: #a855f7;
  }

  .quick-label {
    color: #334155;
    font-size: 25rpx;
  }

  .banner-wrap {
    padding: 32rpx 30rpx 18rpx;
  }

  .banner-swiper {
    height: 238rpx;
  }

  .banner-card {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 44rpx;
    border-radius: 24rpx;
    color: #fff;
  }

  .banner-copy {
    min-width: 0;
  }

  .banner-card.warm {
    background: linear-gradient(135deg, #ff8a1f 0%, #f02d93 100%);
  }

  .banner-card.cool {
    background: linear-gradient(135deg, #38bdf8 0%, #7c3aed 100%);
  }

  .banner-card.fresh {
    background: linear-gradient(135deg, #22c55e 0%, #0f766e 100%);
  }

  .banner-tag {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 26rpx;
    font-weight: 700;
  }

  .banner-tag text:first-child {
    font-size: 34rpx;
  }

  .banner-title {
    margin-top: 20rpx;
    font-size: 38rpx;
    font-weight: 900;
  }

  .banner-subtitle {
    margin-top: 10rpx;
    font-size: 28rpx;
  }

  .banner-btn {
    flex-shrink: 0;
    min-width: 150rpx;
    height: 72rpx;
    padding: 0 28rpx;
    border-radius: 999rpx;
    color: #f97316;
    background: #fff;
    font-size: 25rpx;
    font-weight: 800;
    box-shadow: 0 12rpx 24rpx rgba(15, 23, 42, 0.16);
  }

  .dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14rpx;
    margin-top: 20rpx;
  }

  .dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 7rpx;
    background: #cbd5e1;
  }

  .dot.active {
    width: 48rpx;
    background: #2563eb;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12rpx 30rpx 22rpx;
  }

  .section-head.secondary {
    padding-top: 34rpx;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 10rpx;
    color: #111827;
    font-size: 34rpx;
    font-weight: 900;
  }

  .section-title text:first-child {
    color: #8b5cf6;
    font-size: 36rpx;
  }

  .link-btn {
    color: #2563eb;
    font-size: 24rpx;
    font-weight: 700;
  }

  .teacher-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20rpx;
    padding: 0 30rpx;
  }

  .teacher-card,
  .request-card {
    position: relative;
    overflow: hidden;
    border-radius: 18rpx;
    background: #fff;
    border: 1px solid #eef2f7;
    box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.08);
  }

  .teacher-card {
    min-width: 0;
    padding: 30rpx 22rpx 24rpx;
    text-align: center;
  }

  .locked > view:not(.lock-mask),
  .locked > image {
    filter: blur(4rpx);
  }

  .lock-mask {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    color: #fff;
    background: rgba(15, 23, 42, 0.52);
    font-size: 24rpx;
    font-weight: 800;
  }

  .lock-mask text:first-child {
    font-size: 42rpx;
  }

  .teacher-avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 56rpx;
    margin-bottom: 22rpx;
    background: #e5e7eb;
  }

  .teacher-name {
    color: #111827;
    font-size: 30rpx;
    font-weight: 900;
  }

  .teacher-edu {
    overflow: hidden;
    margin-top: 10rpx;
    color: #64748b;
    font-size: 22rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rating-row,
  .teacher-foot,
  .request-top,
  .request-foot,
  .mini-user {
    display: flex;
    align-items: center;
  }

  .rating-row {
    justify-content: center;
    gap: 6rpx;
    margin-top: 12rpx;
    color: #f59e0b;
    font-size: 23rpx;
    font-weight: 800;
  }

  .review-count {
    color: #94a3b8;
    font-weight: 500;
  }

  .subject-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8rpx;
    min-height: 38rpx;
    margin-top: 16rpx;
  }

  .subject-row text {
    padding: 5rpx 12rpx;
    border-radius: 7rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 21rpx;
  }

  .teacher-foot {
    justify-content: space-between;
    margin-top: 22rpx;
    color: #94a3b8;
    font-size: 24rpx;
  }

  .price {
    flex-shrink: 0;
    color: #ff5a00;
    font-weight: 900;
  }

  .request-list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding: 0 30rpx;
  }

  .request-list.compact {
    padding-bottom: 24rpx;
  }

  .request-card {
    padding: 24rpx;
  }

  .request-top {
    justify-content: space-between;
    gap: 16rpx;
  }

  .request-main {
    min-width: 0;
    flex: 1;
  }

  .request-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    color: #111827;
    font-size: 29rpx;
    font-weight: 800;
  }

  .request-title text:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .urgent {
    flex-shrink: 0;
    padding: 2rpx 10rpx;
    border-radius: 8rpx;
    color: #fff;
    background: #f97316;
    font-size: 20rpx;
  }

  .request-meta,
  .request-foot {
    color: #64748b;
    font-size: 24rpx;
  }

  .request-meta {
    margin-top: 12rpx;
  }

  .request-foot {
    justify-content: space-between;
    gap: 12rpx;
    margin-top: 20rpx;
    padding-top: 18rpx;
    border-top: 1px solid #f1f5f9;
  }

  .mini-user {
    min-width: 0;
    gap: 8rpx;
  }

  .mini-avatar {
    width: 36rpx;
    height: 36rpx;
    border-radius: 18rpx;
    background: #e5e7eb;
  }
</style>
