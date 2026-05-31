<template>
  <s-layout class="identity-page" title="家教身份" navbar="inner">
    <view class="hero">
      <view class="hero-title">{{ state.profile ? '家教档案' : '选择你的家教身份' }}</view>
      <view class="hero-subtitle">
        {{
          state.profile
            ? '身份类型首次选择后由平台保护，如需调整请联系平台处理。'
            : '身份决定首页推荐和发布表单，首次选择后由平台保护，不会被误改。'
        }}
      </view>
    </view>

    <view class="section">
      <view class="section-title">服务城市</view>
      <view class="city-row ss-flex ss-row-between ss-col-center" @tap="goCity">
        <view>
          <view class="city-name">{{ state.city.name || '请选择服务城市' }}</view>
          <view class="city-meta">
            {{
              state.city.province
                ? `${state.city.province} · ${state.city.code}`
                : '定位失败时也可以手动选择'
            }}
          </view>
        </view>
        <text class="cicon-forward"></text>
      </view>
    </view>

    <view v-if="!state.profile" class="section">
      <view class="section-title">身份类型</view>
      <view class="role-list">
        <button
          v-for="role in roles"
          :key="role.value"
          class="role-item ss-reset-button"
          :class="{ active: state.form.role === role.value, locked: Boolean(state.profile?.role) }"
          :disabled="Boolean(state.profile?.role)"
          @tap="selectRole(role.value)"
        >
          <view class="role-icon" :class="role.color">
            <text :class="role.icon"></text>
          </view>
          <view class="role-body">
            <view class="role-head ss-flex ss-row-between ss-col-center">
              <text class="role-name">{{ role.name }}</text>
              <text v-if="state.form.role === role.value" class="role-check">已选择</text>
            </view>
            <view class="role-desc">{{ role.desc }}</view>
          </view>
        </button>
      </view>
    </view>

    <view v-if="state.profile" class="section">
      <view class="section-title">我的档案</view>
      <view class="profile-box">
        <view class="profile-line ss-flex ss-row-between">
          <text>身份</text>
          <text>{{ state.profile.roleName }}</text>
        </view>
        <view class="profile-line ss-flex ss-row-between">
          <text>城市</text>
          <text>{{ state.profile.cityName }}</text>
        </view>
        <view class="profile-line ss-flex ss-row-between">
          <text>定位</text>
          <text>{{ locationText }}</text>
        </view>
      </view>
    </view>

    <view class="tips">
      <view class="tip-title">身份说明</view>
      <view class="tip-line">家长可发布找老师需求，查看教师联系方式。</view>
      <view class="tip-line">教师需通过认证后发布授课简历，联系家长需求。</view>
    </view>

    <view class="footer">
      <button v-if="!state.profile" class="primary-btn ss-reset-button" @tap="submitProfile">
        确认身份并进入首页
      </button>
      <button v-else class="primary-btn ghost ss-reset-button" @tap="updateLocation">
        更新定位
      </button>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { requestTencentLocation, setCachedLocation } from '@/sheep/api/tutor/location';
  import TutorProfileApi from '@/sheep/api/tutor/profile';
  import { TUTOR_ROLE } from '@/sheep/api/tutor/utils';

  const roles = [
    {
      value: TUTOR_ROLE.PARENT,
      name: '我是家长/学生',
      desc: '发布孩子辅导需求，按科目、城市和距离查找合适老师。',
      icon: 'cicon-group',
      color: 'parent',
    },
    {
      value: TUTOR_ROLE.TEACHER,
      name: '我是老师',
      desc: '完善教师资料和认证，发布授课简历并联系家长需求。',
      icon: 'cicon-book',
      color: 'teacher',
    },
  ];

  const state = reactive({
    city: {},
    profile: null,
    form: {
      role: null,
    },
  });
  const userStore = sheep.$store('user');

  const locationText = computed(() => {
    if (!state.profile?.longitude || !state.profile?.latitude) {
      return '未更新';
    }
    return `${Number(state.profile.longitude).toFixed(4)}, ${Number(state.profile.latitude).toFixed(
      4,
    )}`;
  });

  function loadCity() {
    state.city = uni.getStorageSync('tutor_city') || uni.getStorageSync('tutor_located_city') || {};
  }

  async function loadProfile() {
    const data = await userStore.getTutorProfile({ silent: false });
    state.profile = data || null;
    if (data) {
      state.form.role = data.role;
      state.city = {
        id: data.cityId,
        code: data.cityCode,
        name: data.cityName,
      };
    }
  }

  function goCity() {
    uni.navigateTo({
      url: '/pages/tutor/city/index',
    });
  }

  function selectRole(role) {
    if (state.profile?.role) {
      return;
    }
    state.form.role = role;
  }

  async function submitProfile() {
    if (!state.city?.code) {
      uni.showToast({
        title: '请先选择城市',
        icon: 'none',
      });
      return;
    }
    if (!state.form.role) {
      uni.showToast({
        title: '请选择身份',
        icon: 'none',
      });
      return;
    }
    const result = await TutorProfileApi.initProfile({
      role: state.form.role,
      cityCode: state.city.code,
    });
    if (result?.code !== 0) {
      return;
    }
    state.profile = result.data;
    userStore.setTutorProfile(result.data);
    uni.switchTab({
      url: '/pages/index/index',
    });
  }

  async function updateLocation() {
    if (!state.profile) {
      return;
    }
    try {
      const location = await requestTencentLocation();
      setCachedLocation({
        ...location,
        cityCode: state.city?.code || state.profile.cityCode,
        cityName: state.city?.name || state.profile.cityName,
      });
      const result = await TutorProfileApi.updateLocation({
        cityCode: state.city?.code || state.profile.cityCode,
        longitude: location.longitude,
        latitude: location.latitude,
        locationAddress: state.city?.name || '',
      });
      if (result?.code !== 0) {
        return;
      }
      state.profile = result.data;
      userStore.setTutorProfile(result.data);
    } catch (error) {
      uni.showToast({
        title: '定位授权失败',
        icon: 'none',
      });
    }
  }

  onShow(() => {
    loadCity();
    loadProfile();
  });
</script>

<style lang="scss" scoped>
  .identity-page {
    min-height: 100vh;
    background: #f6f7fb;
  }

  .hero {
    margin: 24rpx;
    padding: 30rpx;
    border-radius: 24rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb 0%, #0f766e 100%);
  }

  .hero-title {
    font-size: 40rpx;
    font-weight: 900;
  }

  .hero-subtitle {
    margin-top: 14rpx;
    font-size: 25rpx;
    line-height: 40rpx;
    opacity: 0.9;
  }

  .section {
    padding: 0 24rpx 24rpx;
  }

  .section-title {
    margin-bottom: 16rpx;
    color: #111827;
    font-size: 28rpx;
    font-weight: 700;
  }

  .city-row,
  .profile-box,
  .tips {
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #edf0f5;
  }

  .city-row {
    min-height: 104rpx;
    padding: 20rpx 24rpx;
  }

  .city-name {
    color: #111827;
    font-size: 30rpx;
    font-weight: 700;
  }

  .city-meta {
    margin-top: 8rpx;
    color: #8a9099;
    font-size: 24rpx;
  }

  .role-list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }

  .role-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 22rpx;
    margin: 0;
    padding: 26rpx;
    text-align: left;
    border-radius: 20rpx;
    background: #fff;
    border: 1px solid #edf0f5;
  }

  .role-item.active {
    border-color: #2563eb;
    background: #eff6ff;
    box-shadow: 0 12rpx 24rpx rgba(37, 99, 235, 0.08);
  }

  .role-item.locked {
    opacity: 0.9;
  }

  .role-icon {
    width: 108rpx;
    height: 108rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 54rpx;
    color: #fff;
  }

  .role-icon text {
    font-size: 50rpx;
  }

  .role-icon.parent {
    background: #2563eb;
  }

  .role-icon.teacher {
    background: #f97316;
  }

  .role-body {
    min-width: 0;
    flex: 1;
  }

  .role-head {
    margin-bottom: 10rpx;
  }

  .role-name {
    color: #111827;
    font-size: 31rpx;
    font-weight: 800;
  }

  .role-check {
    flex-shrink: 0;
    color: #2563eb;
    font-size: 24rpx;
  }

  .role-desc {
    color: #6b7280;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .profile-box {
    padding: 4rpx 24rpx;
  }

  .profile-line {
    padding: 22rpx 0;
    color: #4b5563;
    font-size: 26rpx;
    border-bottom: 1px solid #f1f5f9;
  }

  .profile-line:last-child {
    border-bottom: 0;
  }

  .tips {
    margin: 0 24rpx 24rpx;
    padding: 24rpx;
    background: #fffbeb;
    border-color: #fde68a;
  }

  .tip-title {
    color: #92400e;
    font-size: 27rpx;
    font-weight: 800;
  }

  .tip-line {
    margin-top: 10rpx;
    color: #92400e;
    font-size: 24rpx;
    line-height: 36rpx;
  }

  .footer {
    padding: 0 24rpx 32rpx;
  }

  .primary-btn {
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 999rpx;
    color: #fff;
    background: #2563eb;
    box-shadow: 0 14rpx 30rpx rgba(37, 99, 235, 0.22);
    font-size: 30rpx;
    font-weight: 800;
  }

  .primary-btn.ghost {
    color: #2563eb;
    background: #fff;
    border: 1px solid #bfdbfe;
    box-shadow: none;
  }
</style>
