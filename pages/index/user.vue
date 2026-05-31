<template>
  <s-layout title="" navbar="" tabbar="/pages/index/user" class="user-page">
    <view class="user-shell">
      <view class="user-hero" :class="{ teacher: isTeacher }">
        <view class="hero-actions">
          <button class="hero-icon ss-reset-button" @tap="go('/pages/tutor/identity/index')">
            <text class="cicon-refresh"></text>
          </button>
          <button class="hero-icon ss-reset-button" @tap="go('/pages/public/setting')">
            <text class="cicon-settings"></text>
          </button>
        </view>

        <view class="profile-main">
          <image
            class="avatar"
            :src="userInfo.avatar || '/static/data-empty.png'"
            mode="aspectFill"
          />
          <view class="user-meta">
            <view class="nickname">
              {{ userInfo.nickname || (isLogin ? '家教用户' : '未登录') }}
              <text v-if="isLogin" class="role-badge">{{ roleText }}</text>
            </view>
            <view class="mobile">{{ userInfo.mobile || '登录后管理家教档案' }}</view>
            <view class="cert-line">{{ certificationText }}</view>
          </view>
        </view>
      </view>

      <button v-if="!isLogin" class="login-card ss-reset-button" @tap="showAuth">
        <view class="login-title">立即登录 / 注册</view>
        <view class="login-desc">登录后选择身份、发布信息并管理联系记录</view>
      </button>

      <view class="summary-card">
        <view class="summary-item" @tap="go('/pages/user/wallet/score')">
          <view class="summary-value">{{ userInfo.point || 0 }}</view>
          <view class="summary-label">我的积分 <text class="cicon-forward"></text></view>
        </view>
        <view class="divider"></view>
        <view class="summary-item" @tap="go('/pages/tutor/my-posts/index')">
          <view class="summary-value">{{ state.postCount }}</view>
          <view class="summary-label">我的发布 <text class="cicon-forward"></text></view>
        </view>
        <view class="divider"></view>
        <view class="summary-item" @tap="go('/pages/tutor/contacts/index')">
          <view class="summary-value">{{ state.contactCount }}</view>
          <view class="summary-label">联系记录 <text class="cicon-forward"></text></view>
        </view>
      </view>

      <view class="stats-card">
        <view class="stat-item">
          <view class="stat-value">{{ profile?.viewCount || 0 }}</view>
          <view class="stat-label">主页浏览</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ profile?.contactViewCount || 0 }}</view>
          <view class="stat-label">被查看</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ profile?.matchRate || '0%' }}</view>
          <view class="stat-label">匹配率</view>
        </view>
      </view>

      <view v-if="isTeacher && !isCertificationApproved" class="cert-banner" @tap="goCertification">
        <view class="cert-icon">
          <text class="cicon-check-round"></text>
        </view>
        <view class="cert-copy">
          <view class="cert-title">完成教师认证</view>
          <view class="cert-desc">认证通过后可发布简历并获得认证标识</view>
        </view>
        <text class="cicon-forward"></text>
      </view>

      <view class="grid-card">
        <view class="card-title">常用功能</view>
        <view class="menu-grid">
          <button
            v-for="item in gridMenus"
            :key="item.label"
            class="grid-item ss-reset-button"
            @tap="go(item.path)"
          >
            <view class="grid-icon" :class="item.color">
              <text :class="item.icon"></text>
            </view>
            <text>{{ item.label }}</text>
          </button>
        </view>
      </view>

      <view class="menu-list">
        <view
          v-for="item in listMenus"
          :key="item.label"
          class="menu-item ss-flex ss-row-between ss-col-center"
          @tap="go(item.path)"
        >
          <view class="menu-left">
            <text class="menu-icon" :class="item.icon"></text>
            <text>{{ item.label }}</text>
          </view>
          <view class="menu-right">
            <text v-if="item.badge" class="menu-badge">{{ item.badge }}</text>
            <text class="cicon-forward"></text>
          </view>
        </view>
      </view>

      <button v-if="isLogin" class="logout-btn ss-reset-button" @tap="logout">退出登录</button>
      <view class="version">家教匹配平台 v1.0.0</view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { showAuthModal } from '@/sheep/hooks/useModal';
  import TutorCertificationApi from '@/sheep/api/tutor/certification';
  import TutorInteractionApi from '@/sheep/api/tutor/interaction';
  import TutorPostApi from '@/sheep/api/tutor/post';
  import { getLocalContacts, targetKey } from '@/sheep/api/tutor/local-state';
  import { TUTOR_AUDIT_STATUS, TUTOR_ROLE } from '@/sheep/api/tutor/utils';

  const userStore = sheep.$store('user');
  const state = reactive({
    certification: null,
    postCount: 0,
    contactCount: 0,
  });

  const isLogin = computed(() => userStore.isLogin);
  const userInfo = computed(() => userStore.userInfo || {});
  const profile = computed(() => userStore.tutorProfile);
  const isTeacher = computed(() => profile.value?.role === TUTOR_ROLE.TEACHER);
  const roleText = computed(() => profile.value?.roleName || '未选择身份');
  const isCertificationApproved = computed(
    () => state.certification?.status === TUTOR_AUDIT_STATUS.APPROVED,
  );

  const certificationText = computed(() => {
    if (!isLogin.value) {
      return '登录后可选择家长或教师身份';
    }
    if (!profile.value?.role) {
      return '未选择家教身份';
    }
    if (!isTeacher.value) {
      return `当前城市：${profile.value.cityName || '-'}`;
    }
    return `教师认证：${state.certification?.statusName || '未提交'}`;
  });

  const gridMenus = computed(() => [
    {
      label: '我的收藏',
      icon: 'cicon-favorite',
      color: 'red',
      path: '/pages/tutor/favorites/index',
    },
    {
      label: '浏览历史',
      icon: 'cicon-time',
      color: 'blue',
      path: '/pages/tutor/history/index',
    },
    {
      label: '我的评价',
      icon: 'cicon-star',
      color: 'green',
      path: '/pages/tutor/reviews/index',
    },
    {
      label: isTeacher.value ? '简历管理' : '需求管理',
      icon: 'cicon-order',
      color: 'purple',
      path: '/pages/tutor/my-posts/index',
    },
  ]);

  const listMenus = computed(() => {
    const menus = [
      {
        label: '家教档案',
        icon: 'cicon-my',
        path: '/pages/tutor/identity/index',
        badge: profile.value?.roleName || '去选择',
      },
      {
        label: '选择城市',
        icon: 'cicon-location-on',
        path: '/pages/tutor/city/index',
        badge: profile.value?.cityName || uni.getStorageSync('tutor_city')?.name || '',
      },
      {
        label: '积分明细',
        icon: 'cicon-coin',
        path: '/pages/user/wallet/score',
        badge: `${userInfo.value.point || 0}积分`,
      },
      {
        label: '账号资料',
        icon: 'cicon-my-o',
        path: '/pages/user/info',
      },
    ];
    if (isTeacher.value) {
      menus.splice(1, 0, {
        label: '教师认证',
        icon: 'cicon-check-round',
        path: '/pages/tutor/certification/index',
        badge: state.certification?.statusName || '未提交',
      });
    }
    return menus;
  });

  function showAuth() {
    showAuthModal();
  }

  function go(url) {
    if (!isLogin.value && !['/pages/tutor/city/index'].includes(url)) {
      showAuthModal();
      return;
    }
    sheep.$router.go(url);
  }

  function goCertification() {
    go('/pages/tutor/certification/index');
  }

  async function loadCertification() {
    state.certification = null;
    if (!isLogin.value || !isTeacher.value) {
      return;
    }
    const result = await TutorCertificationApi.getMyCertification({ silent: true });
    if (result?.code === 0) {
      state.certification = result.data || null;
    }
  }

  async function loadPostCount() {
    state.postCount = 0;
    if (!isLogin.value) {
      return;
    }
    const [demands, resumes] = await Promise.all([
      TutorPostApi.getMyDemandList(),
      TutorPostApi.getMyResumeList(),
    ]);
    const demandCount = Array.isArray(demands?.data) ? demands.data.length : 0;
    const resumeCount = Array.isArray(resumes?.data) ? resumes.data.length : 0;
    state.postCount = demandCount + resumeCount;
  }

  async function loadContactCount() {
    state.contactCount = 0;
    if (!isLogin.value) {
      return;
    }
    const localCount = getLocalContacts().length;
    const result = await TutorInteractionApi.getContactRecordList();
    if (result?.code === 0) {
      const keys = new Set(
        [...(result.data || []), ...getLocalContacts()].map((item) =>
          targetKey(item.targetType || item.type, item.targetId || item.id),
        ),
      );
      state.contactCount = keys.size;
      return;
    }
    state.contactCount = localCount;
  }

  async function loadProfile() {
    if (!isLogin.value) {
      userStore.setTutorProfile(null);
      return;
    }
    await userStore.getTutorProfile({ silent: false });
  }

  async function refresh() {
    await userStore.updateUserData();
    await loadProfile();
    await Promise.all([loadCertification(), loadPostCount(), loadContactCount()]);
  }

  async function logout() {
    await userStore.logout();
  }

  onShow(refresh);

  onPullDownRefresh(async () => {
    await refresh();
    uni.stopPullDownRefresh();
  });
</script>

<style lang="scss" scoped>
  .user-page,
  .user-shell {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .user-shell {
    padding-bottom: 32rpx;
  }

  .user-hero {
    position: relative;
    padding: calc(var(--status-bar-height) + 54rpx) 30rpx 74rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border-bottom-left-radius: 52rpx;
    border-bottom-right-radius: 52rpx;
  }

  .user-hero.teacher {
    background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
  }

  .hero-actions {
    position: absolute;
    top: calc(var(--status-bar-height) + 24rpx);
    right: 30rpx;
    display: flex;
    gap: 24rpx;
  }

  .hero-icon {
    width: 52rpx;
    height: 52rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.86);
  }

  .hero-icon text {
    font-size: 34rpx;
  }

  .profile-main {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }

  .avatar {
    width: 124rpx;
    height: 124rpx;
    border-radius: 62rpx;
    background: rgba(255, 255, 255, 0.22);
    border: 4rpx solid rgba(255, 255, 255, 0.32);
  }

  .user-meta {
    min-width: 0;
    flex: 1;
  }

  .nickname {
    display: flex;
    align-items: center;
    gap: 10rpx;
    color: #fff;
    font-size: 36rpx;
    font-weight: 900;
  }

  .role-badge {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    color: #fff;
    background: rgba(255, 255, 255, 0.18);
    font-size: 20rpx;
    font-weight: 500;
  }

  .mobile,
  .cert-line {
    margin-top: 10rpx;
    color: rgba(255, 255, 255, 0.82);
    font-size: 24rpx;
  }

  .login-card,
  .summary-card,
  .stats-card,
  .cert-banner,
  .grid-card,
  .menu-list {
    margin: 24rpx;
    border-radius: 24rpx;
    background: #fff;
    border: 1px solid #e8eef0;
    box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.05);
  }

  .login-card {
    width: auto;
    display: block;
    margin-top: -44rpx;
    padding: 28rpx;
    text-align: left;
  }

  .login-title {
    color: #111827;
    font-size: 30rpx;
    font-weight: 900;
  }

  .login-desc {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .summary-card {
    position: relative;
    z-index: 2;
    display: flex;
    margin-top: -42rpx;
    padding: 26rpx 0;
  }

  .summary-item {
    min-width: 0;
    flex: 1;
    text-align: center;
  }

  .summary-value {
    color: #111827;
    font-size: 40rpx;
    font-weight: 900;
  }

  .summary-label {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .divider {
    width: 1px;
    margin: 12rpx 0;
    background: #eef2f7;
  }

  .stats-card {
    display: flex;
    justify-content: space-around;
    padding: 26rpx 0;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    color: #1f2937;
    font-size: 32rpx;
    font-weight: 900;
  }

  .stat-label {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .cert-banner {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 24rpx;
    background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%);
    border-color: #fed7aa;
  }

  .cert-icon {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 36rpx;
    color: #fff;
    background: #f97316;
  }

  .cert-copy {
    min-width: 0;
    flex: 1;
  }

  .cert-title {
    color: #92400e;
    font-size: 28rpx;
    font-weight: 900;
  }

  .cert-desc {
    margin-top: 6rpx;
    color: #b45309;
    font-size: 23rpx;
  }

  .grid-card {
    padding: 26rpx;
  }

  .card-title {
    margin-bottom: 26rpx;
    color: #111827;
    font-size: 28rpx;
    font-weight: 900;
  }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24rpx 12rpx;
  }

  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    color: #4b5563;
    font-size: 23rpx;
  }

  .grid-icon {
    width: 66rpx;
    height: 66rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 33rpx;
  }

  .grid-icon text {
    font-size: 36rpx;
  }

  .grid-icon.red {
    color: #ef4444;
    background: #fef2f2;
  }

  .grid-icon.blue {
    color: #2563eb;
    background: #eff6ff;
  }

  .grid-icon.green {
    color: #16a34a;
    background: #ecfdf5;
  }

  .grid-icon.purple {
    color: #9333ea;
    background: #faf5ff;
  }

  .menu-list {
    overflow: hidden;
  }

  .menu-item {
    min-height: 96rpx;
    padding: 0 24rpx;
    color: #374151;
    font-size: 27rpx;
    border-bottom: 1px solid #f1f5f9;
  }

  .menu-item:last-child {
    border-bottom: 0;
  }

  .menu-left,
  .menu-right {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .menu-icon {
    color: #2563eb;
    font-size: 34rpx;
  }

  .menu-badge {
    padding: 4rpx 12rpx;
    border-radius: 999rpx;
    color: #fff;
    background: #ef4444;
    font-size: 20rpx;
  }

  .logout-btn {
    height: 84rpx;
    margin: 32rpx 24rpx 0;
    border-radius: 18rpx;
    color: #ef4444;
    background: #ffffff;
    font-size: 28rpx;
    border: 1px solid #fee2e2;
  }

  .version {
    margin-top: 28rpx;
    color: #9ca3af;
    text-align: center;
    font-size: 22rpx;
  }
</style>
