<template>
  <s-layout class="page" title="家长资料" navbar="inner">
    <view class="hero">
      <view class="title">家长资料</view>
      <view class="subtitle">保存孩子年级、科目、预算和授课偏好，用于后续快速发布需求。</view>
    </view>

    <view class="form-card">
      <label class="field">
        <text>孩子年级</text>
        <input v-model="form.childGrade" placeholder="例如：高三" maxlength="20" />
      </label>
      <label class="field">
        <text>辅导科目</text>
        <input v-model="form.subjects" placeholder="例如：数学,物理" maxlength="80" />
      </label>
      <label class="field">
        <text>预算范围</text>
        <view class="budget-row">
          <input v-model="form.budgetMin" type="number" placeholder="最低" />
          <text class="split">至</text>
          <input v-model="form.budgetMax" type="number" placeholder="最高" />
        </view>
      </label>
      <label class="field">
        <text>授课模式</text>
        <view class="mode-row">
          <button
            v-for="mode in modes"
            :key="mode.value"
            class="mode-btn ss-reset-button"
            :class="{ active: form.teachMode === mode.value }"
            @tap="form.teachMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </view>
      </label>
      <label class="field">
        <text>补充说明</text>
        <textarea v-model="form.remark" placeholder="例如：周末下午上课，希望老师有高考辅导经验" />
      </label>
    </view>

    <button class="primary-btn ss-reset-button" @tap="submit">保存资料</button>
  </s-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import TutorParentProfileApi from '@/sheep/api/tutor/parent-profile';

  const modes = [
    { label: '上门', value: 1 },
    { label: '在线', value: 2 },
    { label: '均可', value: 3 },
  ];

  const form = reactive({
    childGrade: '',
    subjects: '',
    budgetMin: '',
    budgetMax: '',
    teachMode: 3,
    remark: '',
  });

  function fillForm(data) {
    Object.assign(form, {
      childGrade: data?.childGrade || '',
      subjects: data?.subjects || '',
      budgetMin: data?.budgetMin ?? '',
      budgetMax: data?.budgetMax ?? '',
      teachMode: data?.teachMode || 3,
      remark: data?.remark || '',
    });
  }

  async function ensureParentProfile() {
    const userStore = sheep.$store('user');
    const profile = await userStore.getTutorProfile({ silent: true });
    if (!profile?.role) {
      uni.showToast({ title: '请先选择家教身份', icon: 'none' });
      uni.navigateTo({ url: '/pages/tutor/identity/index' });
      return false;
    }
    if (profile.role !== 1) {
      uni.showToast({ title: '当前身份不是家长', icon: 'none' });
      return false;
    }
    return true;
  }

  async function loadProfile() {
    if (!(await ensureParentProfile())) {
      return;
    }
    const { code, data } = await TutorParentProfileApi.getProfile();
    if (code === 0) {
      fillForm(data);
    }
  }

  function validate() {
    const budgetMin = Number(form.budgetMin);
    const budgetMax = Number(form.budgetMax);
    if (!form.childGrade.trim() || !form.subjects.trim()) {
      uni.showToast({ title: '请填写年级和科目', icon: 'none' });
      return false;
    }
    if (
      form.budgetMin === '' ||
      form.budgetMax === '' ||
      Number.isNaN(budgetMin) ||
      Number.isNaN(budgetMax) ||
      budgetMin < 0 ||
      budgetMax < budgetMin
    ) {
      uni.showToast({ title: '请填写正确预算范围', icon: 'none' });
      return false;
    }
    return true;
  }

  async function submit() {
    if (!(await ensureParentProfile()) || !validate()) {
      return;
    }
    const { code, data } = await TutorParentProfileApi.saveProfile({
      childGrade: form.childGrade.trim(),
      subjects: form.subjects.trim(),
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      teachMode: form.teachMode,
      remark: form.remark.trim(),
    });
    if (code === 0) {
      fillForm(data);
      uni.setStorageSync('tutor_parent_profile', data);
    }
  }

  onShow(loadProfile);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .hero,
  .form-card {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 12rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .title {
    color: #111827;
    font-size: 40rpx;
    font-weight: 800;
  }

  .subtitle {
    margin-top: 12rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .field {
    display: block;
    margin-bottom: 24rpx;
  }

  .field:last-child {
    margin-bottom: 0;
  }

  .field text {
    display: block;
    margin-bottom: 12rpx;
    color: #111827;
    font-size: 26rpx;
    font-weight: 700;
  }

  .field input,
  .field textarea {
    width: 100%;
    box-sizing: border-box;
    border-radius: 10rpx;
    color: #111827;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 26rpx;
  }

  .field input {
    height: 78rpx;
    padding: 0 20rpx;
  }

  .field textarea {
    min-height: 180rpx;
    padding: 18rpx 20rpx;
    line-height: 38rpx;
  }

  .budget-row,
  .mode-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 12rpx;
    align-items: center;
  }

  .split {
    color: #64748b;
    font-size: 25rpx;
  }

  .mode-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .mode-btn {
    height: 68rpx;
    border-radius: 10rpx;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 25rpx;
  }

  .mode-btn.active {
    color: #0f766e;
    background: #ecfdf5;
    border-color: #99f6e4;
    font-weight: 700;
  }

  .primary-btn {
    height: 88rpx;
    margin: 4rpx 24rpx 36rpx;
    border-radius: 12rpx;
    color: #fff;
    background: #0f766e;
    font-size: 30rpx;
    font-weight: 800;
  }
</style>
