<template>
  <s-layout title="" navbar="" tabbar="/pages/index/publish" class="publish-page">
    <view class="publish-shell">
      <view v-if="!isLogin" class="empty-state">
        <view class="empty-icon"><text class="cicon-lock"></text></view>
        <view class="empty-title">登录后才能发布</view>
        <view class="empty-desc">请先登录账号，选择身份后即可免费发布需求或简历。</view>
        <button class="primary-btn ss-reset-button" @tap="showAuth">立即登录 / 注册</button>
      </view>

      <view v-else-if="!profile?.role" class="empty-state">
        <view class="empty-icon blue"><text class="cicon-my"></text></view>
        <view class="empty-title">先选择家教身份</view>
        <view class="empty-desc">家长发布需求，教师发布简历，身份初始化后会自动切换表单。</view>
        <button class="primary-btn ss-reset-button" @tap="goIdentity">去选择身份</button>
      </view>

      <template v-else>
        <view class="page-head">
          <view>
            <view class="page-title">免费发布</view>
            <view class="page-subtitle">{{ headSubtitle }}</view>
          </view>
          <button class="city-pill ss-reset-button" @tap="goCity">
            <text class="cicon-location-on"></text>
            <text>{{ city.name || '选城市' }}</text>
          </button>
        </view>

        <view class="type-switch">
          <button
            class="type-btn ss-reset-button"
            :class="{ active: postType === 'parent', disabled: isTeacher }"
            :disabled="isTeacher"
            @tap="setPostType('parent')"
          >
            家长需求
          </button>
          <button
            class="type-btn ss-reset-button"
            :class="{ active: postType === 'teacher', disabled: !isTeacher }"
            :disabled="!isTeacher"
            @tap="setPostType('teacher')"
          >
            教师简历
          </button>
        </view>

        <view v-if="teacherLocked" class="cert-guard">
          <view class="guard-icon"><text class="cicon-check-round"></text></view>
          <view class="guard-copy">
            <view class="guard-title">教师认证后才能发布简历</view>
            <view class="guard-desc"
              >当前状态：{{ certificationStatusText }}。认证通过后即可展示在广场。</view
            >
          </view>
          <button class="guard-btn ss-reset-button" @tap="goCertification">去认证</button>
        </view>

        <view v-else class="form-panel">
          <view v-if="postType === 'parent'" class="sync-tip">
            <text class="cicon-check-round"></text>
            <text>首次发布会同步保存家长资料，后续可在资料页继续完善。</text>
          </view>

          <label class="field">
            <text>标题</text>
            <input v-model="form.title" :placeholder="titlePlaceholder" maxlength="40" />
          </label>

          <view class="field-grid" v-if="postType === 'parent'">
            <label class="field">
              <text>年级</text>
              <picker :range="gradeOptions" @change="onGradeChange">
                <view class="picker-value">{{ form.grade || '请选择年级' }}</view>
              </picker>
            </label>
            <label class="field">
              <text>科目</text>
              <picker :range="subjectOptions" @change="onSubjectChange">
                <view class="picker-value">
                  {{ form.subjects || (form.grade ? '请选择科目' : '请先选择年级') }}
                </view>
              </picker>
            </label>
          </view>

          <label v-else class="field">
            <text>授课科目</text>
            <input v-model="form.subjects" placeholder="如：数学,物理" maxlength="80" />
          </label>

          <label class="field">
            <text>授课方式</text>
            <view class="mode-row">
              <button
                v-for="mode in modeOptions"
                :key="mode.value"
                class="mode-btn ss-reset-button"
                :class="{ active: form.teachMode === mode.value }"
                @tap="form.teachMode = mode.value"
              >
                {{ mode.label }}
              </button>
            </view>
          </label>

          <label v-if="postType === 'parent'" class="field">
            <text>预算范围（元/小时）</text>
            <view class="budget-row">
              <input v-model="form.budgetMin" type="number" placeholder="最低" />
              <text class="split">至</text>
              <input v-model="form.budgetMax" type="number" placeholder="最高" />
            </view>
          </label>

          <view v-else class="field-grid">
            <label class="field">
              <text>时薪</text>
              <input v-model="form.hourlyPrice" type="number" placeholder="元/小时" />
            </label>
            <label class="field">
              <text>服务半径</text>
              <input v-model="form.serviceRadiusKm" type="number" placeholder="公里" />
            </label>
          </view>

          <view v-if="postType === 'teacher'" class="trial-card">
            <view class="trial-head">
              <view>
                <view class="trial-title">提供免费试课</view>
                <view class="trial-desc">开启后会在教师卡片上高亮展示</view>
              </view>
              <switch :checked="form.freeTrialEnabled" color="#16a34a" @change="onTrialChange" />
            </view>
            <picker
              v-if="form.freeTrialEnabled"
              :range="trialMinutes"
              @change="onTrialMinutesChange"
            >
              <view class="trial-picker">试课时长：{{ form.freeTrialMinutes }}分钟</view>
            </picker>
          </view>

          <label class="field">
            <text>{{ postType === 'parent' ? '详细要求' : '教学经验' }}</text>
            <textarea
              v-model="form.description"
              :placeholder="descriptionPlaceholder"
              maxlength="600"
            />
          </label>

          <label v-if="postType === 'teacher'" class="field">
            <text>可授课时间</text>
            <input v-model="form.availableTimes" placeholder="如：周一三五晚，周末全天" />
          </label>

          <label class="field">
            <text>手机号</text>
            <input v-model="form.contactMobile" type="number" placeholder="用于扣积分后展示" />
          </label>
          <label class="field">
            <text>微信号（选填）</text>
            <input v-model="form.contactWechat" placeholder="可选填，展示前同样会脱敏" />
          </label>
        </view>

        <button
          v-if="!teacherLocked"
          class="primary-btn ss-reset-button"
          :class="{ disabled: submitting }"
          :disabled="submitting"
          @tap="submit"
        >
          {{ submitting ? '提交中...' : '确认发布' }}
        </button>
      </template>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { showAuthModal } from '@/sheep/hooks/useModal';
  import TutorCertificationApi from '@/sheep/api/tutor/certification';
  import { getLocationPayload as getCachedLocationPayload } from '@/sheep/api/tutor/location';
  import TutorPostApi from '@/sheep/api/tutor/post';
  import {
    TUTOR_AUDIT_STATUS,
    TUTOR_PUBLISH_STATUS,
    TUTOR_ROLE,
    tutorGradeOptions,
    tutorModeOptions,
    tutorSubjectOptionsByGrade,
  } from '@/sheep/api/tutor/utils';

  const userStore = sheep.$store('user');
  const gradeOptions = tutorGradeOptions;
  const modeOptions = tutorModeOptions;
  const trialMinutes = [30, 45, 60];

  const state = reactive({
    profile: null,
    certification: null,
    city: {},
    postType: 'parent',
    loadedType: '',
    submitting: false,
    postCount: 0,
  });

  const form = reactive({
    title: '',
    grade: '',
    subjects: '',
    teachMode: 3,
    budgetMin: '',
    budgetMax: '',
    hourlyPrice: '',
    serviceRadiusKm: 10,
    freeTrialEnabled: true,
    freeTrialMinutes: 30,
    description: '',
    availableTimes: '',
    contactMobile: '',
    contactWechat: '',
  });

  const isLogin = computed(() => userStore.isLogin);
  const profile = computed(() => state.profile);
  const city = computed(() => state.city);
  const isTeacher = computed(() => profile.value?.role === TUTOR_ROLE.TEACHER);
  const postType = computed(() => state.postType);
  const submitting = computed(() => state.submitting);
  const certificationApproved = computed(
    () => state.certification?.status === TUTOR_AUDIT_STATUS.APPROVED,
  );
  const teacherLocked = computed(
    () => postType.value === 'teacher' && !certificationApproved.value,
  );

  const headSubtitle = computed(() =>
    postType.value === 'teacher' ? '发布老师简历，接收同城家长咨询' : '发布孩子需求，等待老师联系',
  );
  const titlePlaceholder = computed(() =>
    postType.value === 'teacher' ? '如：985硕士数学老师' : '如：急寻初二数学家教',
  );
  const descriptionPlaceholder = computed(() =>
    postType.value === 'teacher'
      ? '请描述教学经验、擅长阶段、课堂风格和可提供的反馈'
      : '请描述孩子情况、上课时间、老师要求和期望效果',
  );
  const certificationStatusText = computed(
    () => state.certification?.statusName || (state.certification ? '未通过' : '未提交'),
  );
  const subjectOptions = computed(() => tutorSubjectOptionsByGrade[form.grade] || []);

  function resetFormForRole() {
    form.title = '';
    form.grade = '';
    form.subjects = '';
    form.teachMode = 3;
    form.budgetMin = '';
    form.budgetMax = '';
    form.hourlyPrice = '';
    form.serviceRadiusKm = 10;
    form.freeTrialEnabled = true;
    form.freeTrialMinutes = 30;
    form.description = '';
    form.availableTimes = '';
    form.contactMobile = userStore.userInfo?.mobile || '';
    form.contactWechat = '';
  }

  function setPostType(type) {
    if (type === 'teacher' && !isTeacher.value) {
      return;
    }
    if (type === 'parent' && isTeacher.value) {
      return;
    }
    state.postType = type;
  }

  function showAuth() {
    showAuthModal();
  }

  function goIdentity() {
    uni.navigateTo({ url: '/pages/tutor/identity/index' });
  }

  function goCity() {
    uni.navigateTo({ url: '/pages/tutor/city/index' });
  }

  function goCertification() {
    uni.navigateTo({ url: '/pages/tutor/certification/index' });
  }

  function onGradeChange(event) {
    form.grade = gradeOptions[event.detail.value];
    if (!subjectOptions.value.includes(form.subjects)) {
      form.subjects = '';
    }
  }

  function onSubjectChange(event) {
    form.subjects = subjectOptions.value[event.detail.value];
  }

  function onTrialChange(event) {
    form.freeTrialEnabled = event.detail.value;
  }

  function onTrialMinutesChange(event) {
    form.freeTrialMinutes = trialMinutes[event.detail.value];
  }

  function mobileValid(mobile) {
    return /^1\d{10}$/.test(String(mobile || ''));
  }

  function validate() {
    if (!state.city?.code) {
      uni.showToast({ title: '请先选择城市', icon: 'none' });
      return false;
    }
    if (state.postCount >= 3) {
      uni.showToast({ title: '最多保留3条有效发布', icon: 'none' });
      return false;
    }
    if (!form.title.trim()) {
      uni.showToast({ title: '请填写标题', icon: 'none' });
      return false;
    }
    if (!form.subjects.trim()) {
      uni.showToast({
        title: postType.value === 'parent' ? '请选择科目' : '请填写授课科目',
        icon: 'none',
      });
      return false;
    }
    if (!form.contactMobile.trim()) {
      uni.showToast({ title: '请填写手机号', icon: 'none' });
      return false;
    }
    if (!mobileValid(form.contactMobile)) {
      uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    if (postType.value === 'parent') {
      if (!form.grade) {
        uni.showToast({ title: '请选择年级', icon: 'none' });
        return false;
      }
      if (form.budgetMin === '') {
        uni.showToast({ title: '请填写最低预算', icon: 'none' });
        return false;
      }
      if (form.budgetMax === '') {
        uni.showToast({ title: '请填写最高预算', icon: 'none' });
        return false;
      }
      const min = Number(form.budgetMin);
      const max = Number(form.budgetMax);
      if (Number.isNaN(min) || Number.isNaN(max)) {
        uni.showToast({ title: '请输入正确的预算金额', icon: 'none' });
        return false;
      }
      if (min < 0) {
        uni.showToast({ title: '最低预算不能小于 0', icon: 'none' });
        return false;
      }
      if (max < min) {
        uni.showToast({ title: '最高预算不能低于最低预算', icon: 'none' });
        return false;
      }
      if (!form.description.trim()) {
        uni.showToast({ title: '请填写详细要求', icon: 'none' });
        return false;
      }
      return true;
    }
    if (form.hourlyPrice === '') {
      uni.showToast({ title: '请填写时薪', icon: 'none' });
      return false;
    }
    const hourlyPrice = Number(form.hourlyPrice);
    if (Number.isNaN(hourlyPrice) || hourlyPrice <= 0) {
      uni.showToast({ title: '请输入正确的时薪', icon: 'none' });
      return false;
    }
    if (form.serviceRadiusKm === '') {
      uni.showToast({ title: '请填写服务半径', icon: 'none' });
      return false;
    }
    const radius = Number(form.serviceRadiusKm);
    if (Number.isNaN(radius) || radius < 0) {
      uni.showToast({ title: '请输入正确的服务半径', icon: 'none' });
      return false;
    }
    if (!form.description.trim()) {
      uni.showToast({ title: '请填写教学经验', icon: 'none' });
      return false;
    }
    if (form.freeTrialEnabled && !form.freeTrialMinutes) {
      uni.showToast({ title: '请选择试课时长', icon: 'none' });
      return false;
    }
    return true;
  }

  function getLocationPayload() {
    const location = getCachedLocationPayload(state.city);
    return {
      cityCode: state.city.code,
      longitude: location.longitude,
      latitude: location.latitude,
    };
  }

  async function submit() {
    if (teacherLocked.value || !validate()) {
      return;
    }
    state.submitting = true;
    const location = getLocationPayload();
    const common = {
      title: form.title.trim(),
      subjects: form.subjects.trim(),
      contactMobile: form.contactMobile.trim(),
      contactWechat: form.contactWechat.trim(),
      ...location,
    };
    const result =
      postType.value === 'parent'
        ? await TutorPostApi.createDemand({
            ...common,
            grade: form.grade,
            teachMode: form.teachMode,
            budgetMin: Number(form.budgetMin),
            budgetMax: Number(form.budgetMax),
            description: form.description.trim(),
            distanceVisible: true,
          })
        : await TutorPostApi.createResume({
            ...common,
            teachModes: String(form.teachMode),
            hourlyPrice: Number(form.hourlyPrice),
            freeTrialEnabled: form.freeTrialEnabled,
            freeTrialMinutes: form.freeTrialEnabled ? Number(form.freeTrialMinutes) : 0,
            teachingExperience: form.description.trim(),
            availableTimes: form.availableTimes.trim(),
            serviceRadiusKm: Number(form.serviceRadiusKm),
          });
    state.submitting = false;
    if (result?.code === 0) {
      resetFormForRole();
      uni.navigateTo({ url: '/pages/tutor/my-posts/index' });
    }
  }

  async function loadCertification() {
    state.certification = null;
    if (!isTeacher.value) {
      return;
    }
    const result = await TutorCertificationApi.getMyCertification({ silent: true });
    if (result?.code === 0) {
      state.certification = result.data || null;
    }
  }

  async function loadPostCount() {
    state.postCount = 0;
    if (!profile.value?.role) {
      return;
    }
    const result = isTeacher.value
      ? await TutorPostApi.getMyResumeList()
      : await TutorPostApi.getMyDemandList();
    if (Array.isArray(result?.data)) {
      state.postCount = result.data.filter(
        (item) =>
          item.status !== TUTOR_PUBLISH_STATUS.OFFLINE &&
          item.status !== TUTOR_PUBLISH_STATUS.REJECTED,
      ).length;
    }
  }

  async function refresh() {
    state.city = uni.getStorageSync('tutor_city') || uni.getStorageSync('tutor_located_city') || {};
    state.profile = await userStore.getTutorProfile({ silent: true });
    const nextType = isTeacher.value ? 'teacher' : 'parent';
    state.postType = nextType;
    const storedRole = uni.getStorageSync('tutor_publish_role');
    if (!state.profile?.role && storedRole) {
      state.postType = storedRole === 'teacher' ? 'teacher' : 'parent';
    }
    if (state.loadedType !== state.postType) {
      resetFormForRole();
      state.loadedType = state.postType;
    } else if (!form.contactMobile) {
      form.contactMobile = userStore.userInfo?.mobile || '';
    }
    await Promise.all([loadCertification(), loadPostCount()]);
  }

  onShow(refresh);
</script>

<style lang="scss" scoped>
  .publish-page,
  .publish-shell {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .publish-shell {
    padding: calc(var(--status-bar-height) + 28rpx) 24rpx 40rpx;
  }

  .page-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .page-title {
    color: #111827;
    font-size: 42rpx;
    font-weight: 900;
  }

  .page-subtitle {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .city-pill {
    flex-shrink: 0;
    height: 64rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 0 20rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 24rpx;
    font-weight: 800;
  }

  .type-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
    margin: 28rpx 0 20rpx;
    padding: 8rpx;
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .type-btn {
    height: 72rpx;
    border-radius: 12rpx;
    color: #475569;
    font-size: 26rpx;
    font-weight: 800;
  }

  .type-btn.active {
    color: #ffffff;
    background: #2563eb;
  }

  .type-btn.disabled {
    opacity: 0.56;
  }

  .empty-state,
  .cert-guard,
  .form-panel,
  .trial-card {
    border-radius: 20rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .empty-state {
    display: flex;
    min-height: 70vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
    text-align: center;
  }

  .empty-icon {
    width: 132rpx;
    height: 132rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 66rpx;
    color: #0f766e;
    background: #ecfdf5;
  }

  .empty-icon.blue {
    color: #2563eb;
    background: #eff6ff;
  }

  .empty-icon text {
    font-size: 62rpx;
  }

  .empty-title {
    margin-top: 28rpx;
    color: #111827;
    font-size: 34rpx;
    font-weight: 900;
  }

  .empty-desc {
    margin: 16rpx 0 34rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 40rpx;
  }

  .cert-guard {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 24rpx;
    background: #fffbeb;
    border-color: #fde68a;
  }

  .guard-icon {
    width: 76rpx;
    height: 76rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 38rpx;
    color: #fff;
    background: #f97316;
  }

  .guard-copy {
    min-width: 0;
    flex: 1;
  }

  .guard-title {
    color: #92400e;
    font-size: 28rpx;
    font-weight: 900;
  }

  .guard-desc {
    margin-top: 8rpx;
    color: #b45309;
    font-size: 23rpx;
    line-height: 34rpx;
  }

  .guard-btn {
    flex-shrink: 0;
    height: 58rpx;
    padding: 0 20rpx;
    border-radius: 999rpx;
    color: #fff;
    background: #f97316;
    font-size: 23rpx;
    font-weight: 800;
  }

  .form-panel {
    padding: 24rpx;
  }

  .sync-tip {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    margin-bottom: 24rpx;
    padding: 18rpx 20rpx;
    border-radius: 14rpx;
    color: #166534;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    font-size: 24rpx;
    line-height: 36rpx;
  }

  .sync-tip .cicon-check-round {
    flex-shrink: 0;
    margin-top: 2rpx;
    font-size: 28rpx;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }

  .field {
    display: block;
    margin-bottom: 24rpx;
  }

  .field:last-child {
    margin-bottom: 0;
  }

  .field > text {
    display: block;
    margin-bottom: 12rpx;
    color: #111827;
    font-size: 26rpx;
    font-weight: 800;
  }

  .field input,
  .field textarea,
  .picker-value,
  .trial-picker {
    width: 100%;
    box-sizing: border-box;
    border-radius: 14rpx;
    color: #111827;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 26rpx;
  }

  .field input,
  .picker-value,
  .trial-picker {
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 20rpx;
  }

  .field textarea {
    min-height: 190rpx;
    padding: 18rpx 20rpx;
    line-height: 40rpx;
  }

  .mode-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
  }

  .mode-btn {
    height: 68rpx;
    border-radius: 12rpx;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 25rpx;
  }

  .mode-btn.active {
    color: #2563eb;
    background: #eff6ff;
    border-color: #bfdbfe;
    font-weight: 800;
  }

  .budget-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 12rpx;
    align-items: center;
  }

  .split {
    color: #64748b;
    font-size: 25rpx;
  }

  .trial-card {
    margin-bottom: 24rpx;
    padding: 22rpx;
    background: #ecfdf5;
    border-color: #bbf7d0;
  }

  .trial-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  .trial-title {
    color: #065f46;
    font-size: 27rpx;
    font-weight: 900;
  }

  .trial-desc {
    margin-top: 6rpx;
    color: #047857;
    font-size: 23rpx;
  }

  .trial-picker {
    margin-top: 20rpx;
    color: #065f46;
    background: #fff;
    border-color: #bbf7d0;
  }

  .primary-btn {
    width: 100%;
    height: 88rpx;
    margin-top: 28rpx;
    border-radius: 999rpx;
    color: #ffffff;
    background: #2563eb;
    box-shadow: 0 14rpx 30rpx rgba(37, 99, 235, 0.22);
    font-size: 30rpx;
    font-weight: 900;
  }

  .primary-btn.disabled {
    opacity: 0.66;
    box-shadow: none;
  }
</style>
