<!-- 家教短信登录 -->
<template>
  <view class="tutor-login">
    <view class="login-head">
      <view>
        <view class="login-title">欢迎登录</view>
        <view class="login-subtitle">选择身份后，用手机号完成登录并初始化家教档案</view>
      </view>
      <button class="close-btn ss-reset-button" @tap="closeAuthModal">
        <text class="cicon-close"></text>
      </button>
    </view>

    <view class="field-label">选择身份</view>
    <view class="role-grid">
      <button
        v-for="role in roles"
        :key="role.value"
        class="role-card ss-reset-button"
        :class="{ active: state.model.role === role.value }"
        @tap="state.model.role = role.value"
      >
        <text :class="role.icon"></text>
        <text class="role-name">{{ role.label }}</text>
      </button>
    </view>

    <view class="form-list">
      <view class="field">
        <view class="field-label">姓名</view>
        <view class="input-box">
          <text class="cicon-person-o"></text>
          <input v-model="state.model.name" placeholder="请输入您的姓名" maxlength="12" />
        </view>
      </view>

      <view class="field">
        <view class="field-label">手机号</view>
        <view class="input-box">
          <text class="cicon-phone"></text>
          <input
            v-model="state.model.mobile"
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
          />
        </view>
      </view>

      <view class="field">
        <view class="field-label">验证码</view>
        <view class="code-row">
          <view class="input-box code-input">
            <text class="cicon-lock-o"></text>
            <input
              v-model="state.model.code"
              placeholder="请输入验证码"
              type="number"
              maxlength="6"
            />
          </view>
          <button
            class="code-btn ss-reset-button"
            :disabled="state.submitting || props.agreeStatus === false"
            @tap="checkAgreementAndGetSmsCode"
          >
            {{ getSmsTimer('smsLogin') }}
          </button>
        </view>
      </view>
    </view>

    <button class="login-btn ss-reset-button" :disabled="state.submitting" @tap="smsLoginSubmit">
      {{ state.submitting ? '登录中...' : '登录' }}
    </button>
  </view>
</template>

<script setup>
  import { reactive } from 'vue';
  import sheep from '@/sheep';
  import test from '@/sheep/helper/test';
  import { closeAuthModal, getSmsCode, getSmsTimer } from '@/sheep/hooks/useModal';
  import AuthUtil from '@/sheep/api/member/auth';
  import UserApi from '@/sheep/api/member/user';
  import TutorProfileApi from '@/sheep/api/tutor/profile';
  import TutorCityApi from '@/sheep/api/tutor/city';

  const emits = defineEmits(['onConfirm']);

  const props = defineProps({
    agreeStatus: {
      type: [Boolean, null],
      default: null,
    },
  });

  const roles = [
    {
      value: 'parent',
      label: '家长',
      icon: 'cicon-person-o',
    },
    {
      value: 'teacher',
      label: '教师',
      icon: 'cicon-my-o',
    },
  ];

  const state = reactive({
    submitting: false,
    model: {
      role: 'parent',
      name: '',
      mobile: '',
      code: '',
    },
  });

  function checkAgreement() {
    if (props.agreeStatus === true) {
      return true;
    }
    emits('onConfirm', true);
    sheep.$helper.toast(
      props.agreeStatus === false ? '您已拒绝协议，无法继续登录' : '请选择是否同意协议',
    );
    return false;
  }

  function validateBase({ includeCode = false } = {}) {
    if (!state.model.role) {
      sheep.$helper.toast('请选择身份');
      return false;
    }
    if (!state.model.name.trim()) {
      sheep.$helper.toast('请输入姓名');
      return false;
    }
    if (!test.mobile(state.model.mobile)) {
      sheep.$helper.toast('请输入正确手机号');
      return false;
    }
    if (includeCode && !state.model.code) {
      sheep.$helper.toast('请输入验证码');
      return false;
    }
    return true;
  }

  function checkAgreementAndGetSmsCode() {
    if (!checkAgreement() || !validateBase()) {
      return;
    }
    getSmsCode('smsLogin', state.model.mobile);
  }

  async function resolveCity() {
    const cachedCity = uni.getStorageSync('tutor_city');
    if (cachedCity?.code) {
      return cachedCity;
    }
    const { code, data } = await TutorCityApi.getCityList();
    if (code !== 0) {
      return null;
    }
    const cities = data || [];
    const city =
      cities.find((item) => item.opened && item.name === '北京市') ||
      cities.find((item) => item.opened && item.hot) ||
      cities.find((item) => item.opened);
    if (city) {
      uni.setStorageSync('tutor_city', city);
    }
    return city || null;
  }

  async function initTutorProfile() {
    const profileRes = await TutorProfileApi.getProfileSilent();
    if (profileRes.code === 0 && profileRes.data?.role) {
      uni.setStorageSync('tutor_profile', profileRes.data);
      return;
    }

    const city = await resolveCity();
    if (!city?.code) {
      sheep.$helper.toast('登录成功，请先选择服务城市');
      return;
    }

    const role = state.model.role === 'parent' ? 1 : 2;
    const initRes = await TutorProfileApi.initProfile({
      role,
      cityCode: city.code,
    });
    if (initRes.code === 0) {
      uni.setStorageSync('tutor_profile', initRes.data);
    }
  }

  async function syncUserName() {
    const nickname = state.model.name.trim();
    if (!nickname) {
      return;
    }
    await UserApi.updateUserSilent({ nickname });
    await sheep.$store('user').getInfo();
  }

  async function smsLoginSubmit() {
    if (!checkAgreement() || !validateBase({ includeCode: true })) {
      return;
    }
    state.submitting = true;
    try {
      const loginRes = await AuthUtil.smsLogin({
        mobile: state.model.mobile,
        code: state.model.code,
      });
      if (loginRes.code !== 0) {
        return;
      }
      await syncUserName();
      await initTutorProfile();
      closeAuthModal();
    } finally {
      state.submitting = false;
    }
  }
</script>

<style lang="scss" scoped>
  .tutor-login {
    padding: 42rpx 34rpx 28rpx;
    background: #ffffff;
    border-radius: 40rpx 40rpx 0 0;
  }

  .login-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 36rpx;
  }

  .login-title {
    color: #0f172a;
    font-size: 38rpx;
    font-weight: 900;
    line-height: 52rpx;
  }

  .login-subtitle {
    max-width: 520rpx;
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 36rpx;
  }

  .close-btn {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 34rpx;
  }

  .field-label {
    margin-bottom: 14rpx;
    color: #334155;
    font-size: 26rpx;
    font-weight: 600;
  }

  .role-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
    margin-bottom: 28rpx;
  }

  .role-card {
    height: 148rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 16rpx;
    color: #94a3b8;
    background: #ffffff;
    border: 2rpx solid #e2e8f0;
  }

  .role-card text:first-child {
    font-size: 48rpx;
  }

  .role-card.active {
    color: #2563eb;
    background: #eff6ff;
    border-color: #2563eb;
  }

  .role-name {
    margin-top: 16rpx;
    font-size: 28rpx;
    font-weight: 700;
  }

  .field {
    margin-bottom: 24rpx;
  }

  .input-box {
    height: 74rpx;
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 0 24rpx;
    border-radius: 16rpx;
    color: #94a3b8;
    background: #ffffff;
    border: 1px solid #e2e8f0;
  }

  .input-box input {
    min-width: 0;
    flex: 1;
    height: 74rpx;
    color: #0f172a;
    font-size: 27rpx;
  }

  .input-box text {
    font-size: 34rpx;
  }

  .code-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 192rpx;
    gap: 18rpx;
  }

  .code-btn {
    height: 74rpx;
    border-radius: 16rpx;
    color: #ffffff;
    background: #2563eb;
    font-size: 27rpx;
    font-weight: 800;
  }

  .code-btn[disabled] {
    opacity: 0.55;
  }

  .login-btn {
    width: 100%;
    height: 82rpx;
    margin-top: 12rpx;
    border-radius: 16rpx;
    color: #ffffff;
    background: linear-gradient(135deg, #2563eb 0%, #2f80ed 100%);
    box-shadow: 0 16rpx 32rpx rgba(37, 99, 235, 0.22);
    font-size: 30rpx;
    font-weight: 900;
  }

  .login-btn[disabled] {
    opacity: 0.72;
  }
</style>
