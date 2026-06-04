<template>
  <!-- 规格弹窗 -->
  <su-popup
    :show="authType !== ''"
    round="24"
    :showClose="false"
    maskBackgroundColor="rgba(15, 23, 42, 0.46)"
    @close="closeAuthModal"
  >
    <view class="login-wrap">
      <!-- 1. 账号密码登录 accountLogin -->
      <account-login
        v-if="authType === 'accountLogin'"
        :agreeStatus="state.protocol"
        @onConfirm="onConfirm"
      />

      <!-- 2. 短信登录  smsLogin -->
      <sms-login
        v-if="authType === 'smsLogin'"
        :agreeStatus="state.protocol"
        @onConfirm="onConfirm"
        @roleChange="state.tutorRole = $event"
      />

      <!-- 3. 忘记密码 resetPassword-->
      <reset-password v-if="authType === 'resetPassword'" />

      <!-- 4. 绑定手机号 changeMobile -->
      <change-mobile v-if="authType === 'changeMobile'" />

      <!-- 5. 修改密码 changePassword-->
      <changePassword v-if="authType === 'changePassword'" />

      <!-- 6. 微信小程序授权 -->
      <mp-authorization v-if="authType === 'mpAuthorization'" />

      <!-- 7. 第三方登录 -->
      <view
        v-if="['accountLogin', 'smsLogin'].includes(authType)"
        class="auto-login-box ss-flex ss-flex-col ss-row-center ss-col-center"
      >
        <!-- 7.1 微信小程序的快捷登录 -->
        <view v-if="sheep.$platform.name === 'WechatMiniProgram'" class="ss-flex register-box">
          <view class="register-title">还没有账号?</view>
          <button
            class="ss-reset-button login-btn"
            open-type="getPhoneNumber"
            :disabled="state.protocol !== true"
            @getphonenumber="getPhoneNumber"
          >
            快捷登录
          </button>
          <view class="circle" />
        </view>

        <!-- 7.2 微信的公众号、App、小程序的登录，基于 openid + code -->
        <button
          v-if="
            ['WechatOfficialAccount', 'WechatMiniProgram', 'App'].includes(sheep.$platform.name) &&
            sheep.$platform.isWechatInstalled
          "
          @tap="thirdLogin('wechat')"
          class="ss-reset-button auto-login-btn"
        >
          <text class="auto-login-text">微信</text>
        </button>

        <!-- 7.3 iOS 登录 TODO 芋艿：等后面搞 App 再弄 -->
        <button
          v-if="sheep.$platform.os === 'ios' && sheep.$platform.name === 'App'"
          @tap="thirdLogin('apple')"
          class="ss-reset-button auto-login-btn"
        >
          <text class="auto-login-text">Apple</text>
        </button>

        <!-- 7.4 支付宝小程序登录 -->
        <button
          v-if="sheep.$platform.name === 'alipayMiniProgram'"
          @tap="thirdLogin('alipay')"
          class="ss-reset-button auto-login-btn"
        >
          <text class="auto-login-text">支付宝</text>
        </button>
      </view>

      <!-- 用户协议的勾选 -->
      <view
        v-if="['accountLogin', 'smsLogin'].includes(authType)"
        class="agreement-box ss-flex ss-flex-col ss-col-center"
        :class="{ shake: currentProtocol }"
      >
        <view class="agreement-title">请选择是否同意以下协议(请联网查看)：</view>

        <view class="agreement-options-container">
          <!-- 同意选项 -->
          <view class="agreement-option" :class="{ selected: state.protocol === true }">
            <view class="radio ss-flex ss-col-center" @tap="onAgree">
              <radio
                :checked="state.protocol === true"
                color="#2563eb"
                style="transform: scale(0.8)"
                @tap.stop="onAgree"
              />
              <view class="agreement-text ss-flex ss-col-center ss-m-l-8">
                我已阅读并同意遵守
                <view class="tcp-text" @tap.stop="onProtocol('用户协议')"> 《用户协议》 </view>
                <view class="agreement-text">与</view>
                <view class="tcp-text" @tap.stop="onProtocol('隐私协议')"> 《隐私协议》 </view>
              </view>
            </view>
          </view>

          <!-- 拒绝选项 -->
          <view
            class="agreement-option"
            :class="{ selected: state.protocol === false, refuse: true }"
          >
            <view class="radio ss-flex ss-col-center" @tap="onRefuse">
              <radio
                :checked="state.protocol === false"
                color="#ff4d4f"
                style="transform: scale(0.8)"
                @tap.stop="onRefuse"
              />
              <view class="agreement-text ss-flex ss-col-center ss-m-l-8">
                我拒绝遵守
                <view class="tcp-text" @tap.stop="onProtocol('用户协议')"> 《用户协议》 </view>
                <view class="agreement-text">与</view>
                <view class="tcp-text" @tap.stop="onProtocol('隐私协议')"> 《隐私协议》 </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="safe-box" />
    </view>
  </su-popup>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import sheep from '@/sheep';
  import accountLogin from './components/account-login.vue';
  import smsLogin from './components/sms-login.vue';
  import resetPassword from './components/reset-password.vue';
  import changeMobile from './components/change-mobile.vue';
  import changePassword from './components/change-password.vue';
  import mpAuthorization from './components/mp-authorization.vue';
  import { closeAuthModal, showAuthModal } from '@/sheep/hooks/useModal';
  import UserApi from '@/sheep/api/member/user';
  import TutorProfileApi from '@/sheep/api/tutor/profile';
  import TutorCityApi from '@/sheep/api/tutor/city';

  const modalStore = sheep.$store('modal');
  // 授权弹窗类型
  const authType = computed(() => modalStore.auth);

  const state = reactive({
    protocol: null, // null表示未选择，true表示同意，false表示拒绝
    tutorRole: 1,
  });

  const currentProtocol = ref(false);
  const tutorRole = computed(() => state.tutorRole);
  const DEFAULT_AVATAR = '/static/data-empty.png';

  // 同意协议
  function onAgree() {
    state.protocol = true;
  }

  // 拒绝协议
  function onRefuse() {
    state.protocol = false;
  }

  // 查看协议
  function onProtocol(title) {
    closeAuthModal();
    sheep.$router.go('/pages/public/richtext', {
      title,
    });
  }

  // 点击登录 / 注册事件
  function onConfirm(e) {
    currentProtocol.value = e;
    setTimeout(() => {
      currentProtocol.value = false;
    }, 1000);
  }

  function checkAgreement() {
    if (state.protocol === true) {
      return true;
    }
    onConfirm(true);
    sheep.$helper.toast(
      state.protocol === false ? '您已拒绝协议，无法继续登录' : '请选择是否同意协议',
    );
    return false;
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

  async function ensureTutorProfile(city) {
    const userStore = sheep.$store('user');
    const profile = await userStore.getTutorProfile();
    if (profile?.role) {
      return true;
    }
    const initRes = await TutorProfileApi.initProfile({
      role: tutorRole.value,
      cityCode: city.code,
    });
    if (initRes.code !== 0) {
      return false;
    }
    userStore.setTutorProfile(initRes.data);
    return true;
  }

  async function completeWechatLogin(city) {
    const userStore = sheep.$store('user');
    const userInfo = (await userStore.getInfo()) || {};
    if (!(await ensureTutorProfile(city))) {
      return;
    }
    if (!userInfo?.avatar) {
      await UserApi.updateUserSilent({ avatar: DEFAULT_AVATAR });
      userInfo.avatar = DEFAULT_AVATAR;
      userStore.userInfo = { ...userStore.userInfo, avatar: DEFAULT_AVATAR };
    }
    closeAuthModal();
    if (!userInfo?.nickname) {
      // #ifdef MP-WEIXIN
      showAuthModal('mpAuthorization');
      // #endif
    }
  }

  // 第三方授权登陆（微信小程序、Apple）
  const thirdLogin = async (provider) => {
    if (!checkAgreement()) {
      return;
    }
    const city = await resolveCity();
    if (!city?.code) {
      sheep.$helper.toast('请先选择服务城市');
      return;
    }
    const loginRes = await sheep.$platform.useProvider(provider).login();
    if (loginRes) {
      await completeWechatLogin(city);
      return;
    }
    sheep.$helper.toast('微信登录失败，请稍后重试');
  };

  // 微信小程序的“手机号快速验证”：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
  const getPhoneNumber = async (e) => {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      sheep.$helper.toast('快捷登录失败');
      return;
    }
    if (!checkAgreement()) {
      return;
    }
    const city = await resolveCity();
    if (!city?.code) {
      sheep.$helper.toast('请先选择服务城市');
      return;
    }
    const result = await sheep.$platform.useProvider().mobileLogin(e.detail, {
      tutorRole: tutorRole.value,
      tutorCityCode: city.code,
    });
    if (result) {
      await completeWechatLogin(city);
      return;
    }
    sheep.$helper.toast('快捷登录失败');
  };
</script>

<style lang="scss" scoped>
  @import './index.scss';

  .shake {
    animation: shake 0.05s linear 4 alternate;
  }

  @keyframes shake {
    from {
      transform: translateX(-10rpx);
    }
    to {
      transform: translateX(10rpx);
    }
  }

  .register-box {
    position: relative;
    justify-content: center;
    .register-btn {
      color: #999999;
      font-size: 30rpx;
      font-weight: 500;
    }
    .register-title {
      color: #999999;
      font-size: 30rpx;
      font-weight: 400;
      margin-right: 24rpx;
    }
    .or-title {
      margin: 0 16rpx;
      color: #999999;
      font-size: 30rpx;
      font-weight: 400;
    }
    .login-btn {
      color: var(--ui-BG-Main);
      font-size: 30rpx;
      font-weight: 500;
    }
    .circle {
      position: absolute;
      right: 0rpx;
      top: 18rpx;
      width: 8rpx;
      height: 8rpx;
      border-radius: 8rpx;
      background: var(--ui-BG-Main);
    }
  }
  .safe-box {
    height: calc(constant(safe-area-inset-bottom) / 5 * 3);
    height: calc(env(safe-area-inset-bottom) / 5 * 3);
  }

  .auto-login-text {
    min-width: 96rpx;
    height: 56rpx;
    padding: 0 18rpx;
    border-radius: 28rpx;
    color: var(--ui-BG-Main);
    background: var(--ui-BG-Main-opacity-1);
    font-size: 24rpx;
    line-height: 56rpx;
    text-align: center;
  }

  .tcp-text {
    color: #64748b;
    font-weight: 600;
  }

  .agreement-text {
    color: $dark-9;
  }

  .agreement-title {
    font-size: 30rpx;
    line-height: 42rpx;
    color: #999999;
    text-align: left;
    width: 100%;
    padding-left: 50rpx;
  }

  .agreement-options-container {
    width: 100%;
    padding: 0 38rpx;
    margin-top: 20rpx;
  }

  .agreement-option {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 14rpx;
    padding: 16rpx 18rpx;
    border-radius: 16rpx;
    border: 2rpx solid transparent;
    background: transparent;
    box-sizing: border-box;
    .radio {
      align-items: flex-start;
      width: 100%;
    }
    .agreement-text {
      flex-wrap: wrap;
      font-size: 28rpx;
      line-height: 40rpx;
      color: #999999;
    }
    radio {
      margin-top: 2rpx;
    }
  }

  .agreement-option.selected {
    background: #eff6ff;
    border-color: #2563eb;
    box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.12);

    .agreement-text {
      color: #1e3a8a;
      font-weight: 600;
    }

    .tcp-text {
      color: #2563eb;
      font-weight: 800;
    }
  }

  .agreement-option.refuse.selected {
    background: #fff1f2;
    border-color: #ff4d4f;
    box-shadow: 0 8rpx 20rpx rgba(255, 77, 79, 0.1);

    .agreement-text,
    .tcp-text {
      color: #b91c1c;
    }
  }
</style>
