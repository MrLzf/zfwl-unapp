<template>
  <s-layout class="page" title="教师资料" navbar="inner">
    <view class="hero">
      <view class="title">教师资料</view>
      <view class="subtitle">完善教学能力、授课偏好和服务范围，帮助家长更快了解你。</view>
    </view>
    <view class="form-card">
      <label v-for="field in textFields" :key="field.key" class="field">
        <text>{{ field.label }}</text>
        <input
          v-model="form[field.key]"
          :type="field.type || 'text'"
          :placeholder="field.placeholder"
        />
      </label>
      <label class="field">
        <text>授课模式</text>
        <input v-model="form.teachModes" placeholder="例如：1,2（1 上门，2 在线，3 均可）" />
      </label>
      <label class="switch-row">
        <text>有教师资格证</text
        ><switch
          :checked="form.hasTeacherCertificate"
          @change="form.hasTeacherCertificate = $event.detail.value"
        />
      </label>
      <label class="switch-row">
        <text>支持试课</text
        ><switch
          :checked="form.freeTrialEnabled"
          @change="form.freeTrialEnabled = $event.detail.value"
        />
      </label>
      <label v-if="form.freeTrialEnabled" class="field">
        <text>试课时长（分钟）</text
        ><input v-model="form.freeTrialMinutes" type="number" placeholder="例如：30" />
      </label>
      <label class="field">
        <text>教学介绍</text
        ><textarea v-model="form.intro" placeholder="介绍教学经验、方法和优势" />
      </label>
    </view>
    <button class="primary-btn ss-reset-button" @tap="submit">保存资料</button>
  </s-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import TutorTeacherProfileApi from '@/sheep/api/tutor/teacher-profile';

  const textFields = [
    { key: 'educationLevel', label: '最高学历', placeholder: '例如：硕士' },
    { key: 'schoolName', label: '学校', placeholder: '例如：浙江大学' },
    { key: 'major', label: '专业', placeholder: '例如：数学' },
    { key: 'subjects', label: '可授科目', placeholder: '例如：数学,物理' },
    { key: 'hourlyPriceMin', label: '最低时薪', type: 'number', placeholder: '例如：150' },
    { key: 'hourlyPriceMax', label: '最高时薪', type: 'number', placeholder: '例如：300' },
    { key: 'serviceRadiusKm', label: '服务半径（公里）', type: 'number', placeholder: '例如：10' },
    { key: 'teachingYears', label: '教龄', type: 'number', placeholder: '例如：3' },
  ];
  const form = reactive({
    educationLevel: '',
    schoolName: '',
    major: '',
    hasTeacherCertificate: false,
    subjects: '',
    teachModes: '',
    hourlyPriceMin: '',
    hourlyPriceMax: '',
    serviceRadiusKm: '',
    freeTrialEnabled: false,
    freeTrialMinutes: '',
    teachingYears: '',
    intro: '',
  });
  function fillForm(data = {}) {
    Object.keys(form).forEach((key) => (form[key] = data[key] ?? form[key]));
  }
  async function ensureTeacherProfile() {
    const profile = await sheep.$store('user').getTutorProfile({ silent: true });
    if (!profile?.role) {
      uni.showToast({ title: '请先选择家教身份', icon: 'none' });
      uni.navigateTo({ url: '/pages/tutor/identity/index' });
      return false;
    }
    if (profile.role !== 2) {
      uni.showToast({ title: '当前身份不是教师', icon: 'none' });
      return false;
    }
    return true;
  }
  async function loadProfile() {
    if (!(await ensureTeacherProfile())) return;
    const { code, data } = await TutorTeacherProfileApi.getProfile();
    if (code === 0 && data) fillForm(data);
  }
  const numberRules = {
    hourlyPriceMin: { label: '最低时薪', min: 0, max: 99999 },
    hourlyPriceMax: { label: '最高时薪', min: 0, max: 99999 },
    serviceRadiusKm: { label: '服务半径', min: 0, max: 200 },
    freeTrialMinutes: { label: '试课时长', min: 0, max: 240 },
    teachingYears: { label: '教龄', min: 0, max: 80 },
  };
  function validate() {
    const required = [
      'educationLevel',
      'subjects',
      'teachModes',
      'hourlyPriceMin',
      'hourlyPriceMax',
      'serviceRadiusKm',
      'intro',
    ];
    if (
      required.some((key) => String(form[key]).trim() === '') ||
      (form.freeTrialEnabled && String(form.freeTrialMinutes).trim() === '')
    ) {
      uni.showToast({ title: '请填写完整必填项', icon: 'none' });
      return false;
    }
    for (const [key, rule] of Object.entries(numberRules)) {
      if (form[key] === '' && (key !== 'freeTrialMinutes' || !form.freeTrialEnabled)) continue;
      const value = Number(form[key]);
      if (!Number.isFinite(value)) {
        uni.showToast({ title: `请输入有效的${rule.label}`, icon: 'none' });
        return false;
      }
      if (value < rule.min || value > rule.max) {
        uni.showToast({ title: `${rule.label}范围为 ${rule.min}..${rule.max}`, icon: 'none' });
        return false;
      }
    }
    if (Number(form.hourlyPriceMax) < Number(form.hourlyPriceMin)) {
      uni.showToast({ title: '最高时薪不能低于最低时薪', icon: 'none' });
      return false;
    }
    return true;
  }
  async function submit() {
    if (!(await ensureTeacherProfile()) || !validate()) return;
    const numberFields = [
      'hourlyPriceMin',
      'hourlyPriceMax',
      'serviceRadiusKm',
      'freeTrialMinutes',
      'teachingYears',
    ];
    const payload = { ...form };
    numberFields.forEach(
      (key) => (payload[key] = payload[key] === '' ? null : Number(payload[key])),
    );
    const { code, data } = await TutorTeacherProfileApi.saveProfile(payload);
    if (code === 0 && data) fillForm(data);
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
  .field,
  .switch-row {
    display: block;
    margin-bottom: 24rpx;
    color: #111827;
    font-size: 26rpx;
    font-weight: 700;
  }
  .field text {
    display: block;
    margin-bottom: 12rpx;
  }
  .field input,
  .field textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 0 20rpx;
    border: 1px solid #e2e8f0;
    border-radius: 10rpx;
    background: #f8fafc;
    font-size: 26rpx;
  }
  .field input {
    height: 78rpx;
  }
  .field textarea {
    min-height: 180rpx;
    padding-top: 18rpx;
  }
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
