<template>
  <s-layout class="identity-page" title="家教身份" navbar="inner">
    <view class="section">
      <view class="section-title">当前城市</view>
      <view class="city-row ss-flex ss-row-between ss-col-center" @tap="goCity">
        <view>
          <view class="city-name">{{ state.city.name || '请选择服务城市' }}</view>
          <view class="city-meta">
            {{
              state.city.province
                ? `${state.city.province} · ${state.city.code}`
                : '仅展示已开通城市'
            }}
          </view>
        </view>
        <text class="cicon-forward"></text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">选择身份</view>
      <view class="role-list">
        <button
          v-for="role in roles"
          :key="role.value"
          class="role-item"
          :class="{ active: state.form.role === role.value, disabled: state.profile?.role }"
          :disabled="Boolean(state.profile?.role)"
          @tap="selectRole(role.value)"
        >
          <view class="role-head ss-flex ss-row-between ss-col-center">
            <text class="role-name">{{ role.name }}</text>
            <text v-if="state.form.role === role.value" class="role-check">已选择</text>
          </view>
          <view class="role-desc">{{ role.desc }}</view>
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

    <view class="footer">
      <button v-if="!state.profile" class="primary-btn" @tap="submitProfile">确认身份</button>
      <button v-else class="primary-btn ghost" @tap="updateLocation">更新定位</button>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import TutorProfileApi from '@/sheep/api/tutor/profile';

  const roles = [
    {
      value: 1,
      name: '家长',
      desc: '发布孩子辅导需求，查找合适老师。',
    },
    {
      value: 2,
      name: '教师',
      desc: '完善授课信息，展示简历并联系家长。',
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
    return `${state.profile.longitude}, ${state.profile.latitude}`;
  });

  function loadCity() {
    state.city = uni.getStorageSync('tutor_city') || {};
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
    const { code, data } = await TutorProfileApi.initProfile({
      role: state.form.role,
      cityCode: state.city.code,
    });
    if (code !== 0) {
      return;
    }
    state.profile = data;
    userStore.setTutorProfile(data);
    uni.switchTab({
      url: '/pages/index/index',
    });
  }

  function updateLocation() {
    if (!state.profile) {
      return;
    }
    uni.getLocation({
      type: 'gcj02',
      success: async (res) => {
        const { code, data } = await TutorProfileApi.updateLocation({
          cityCode: state.city?.code || state.profile.cityCode,
          longitude: res.longitude,
          latitude: res.latitude,
          locationAddress: '',
        });
        if (code !== 0) {
          return;
        }
        state.profile = data;
        userStore.setTutorProfile(data);
      },
      fail: () => {
        uni.showToast({
          title: '定位授权失败',
          icon: 'none',
        });
      },
    });
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

  .section {
    padding: 24rpx;
  }

  .section-title {
    margin-bottom: 16rpx;
    color: #111827;
    font-size: 28rpx;
    font-weight: 600;
  }

  .city-row,
  .profile-box {
    border-radius: 12rpx;
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
    font-weight: 600;
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
    margin: 0;
    padding: 24rpx;
    text-align: left;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #edf0f5;
  }

  .role-item.active {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .role-item.disabled {
    opacity: 0.82;
  }

  .role-head {
    margin-bottom: 10rpx;
  }

  .role-name {
    color: #111827;
    font-size: 32rpx;
    font-weight: 600;
  }

  .role-check {
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

  .footer {
    padding: 24rpx;
  }

  .primary-btn {
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 12rpx;
    color: #fff;
    background: #2563eb;
    font-size: 30rpx;
    font-weight: 600;
  }

  .primary-btn.ghost {
    color: #2563eb;
    background: #fff;
    border: 1px solid #bfdbfe;
  }
</style>
