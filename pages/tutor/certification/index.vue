<template>
  <s-layout class="page" title="教师认证" navbar="inner">
    <view class="hero">
      <view class="title">认证中心</view>
      <view class="subtitle">认证通过后可发布教师简历，并在广场获得平台认证标识。</view>
    </view>

    <view v-if="needTeacherProfile" class="guard-card">
      <view class="guard-icon"><text class="cicon-book"></text></view>
      <view class="guard-title">请先选择教师身份</view>
      <view class="guard-desc">教师认证需要先初始化家教档案，选择“我是老师”后再提交资料。</view>
      <button class="primary-btn ss-reset-button" @tap="goIdentity">去选择身份</button>
    </view>

    <template v-else>
      <view class="status-card" :class="statusTheme">
        <view class="status-head">
          <text>认证状态</text>
          <text class="status">{{ statusText }}</text>
        </view>
        <view class="status-desc">{{ statusDesc }}</view>
        <view v-if="state.certification?.rejectReason" class="reject-box">
          {{ state.certification.rejectReason }}
        </view>
      </view>

      <view class="form-card">
        <label class="field">
          <text>真实姓名</text>
          <input v-model="form.realName" :disabled="readonly" placeholder="请输入真实姓名" />
        </label>
        <label class="field">
          <text>身份证号</text>
          <input
            v-model="form.idCardNo"
            :disabled="readonly"
            :placeholder="state.certification?.idCardNoMask || '仅用于平台审核，前端不展示'"
          />
        </label>

        <view class="field">
          <text>学历证明</text>
          <view class="upload-grid">
            <view
              class="upload-box"
              :class="{ done: form.educationFileUrl }"
              @tap="chooseFile('education')"
            >
              <image
                v-if="uploads.education.preview"
                class="upload-preview"
                :src="uploads.education.preview"
                mode="aspectFill"
              />
              <template v-else>
                <text class="cicon-add"></text>
                <text>{{ uploads.education.uploading ? '上传中...' : '上传学历证明' }}</text>
              </template>
            </view>
            <button
              v-if="uploads.education.error"
              class="retry-btn ss-reset-button"
              @tap="retryUpload('education')"
            >
              重新上传
            </button>
          </view>
        </view>

        <view class="field">
          <text>教师资格证</text>
          <view class="upload-grid">
            <view
              class="upload-box"
              :class="{ done: form.teacherCertFileUrl }"
              @tap="chooseFile('teacherCert')"
            >
              <image
                v-if="uploads.teacherCert.preview"
                class="upload-preview"
                :src="uploads.teacherCert.preview"
                mode="aspectFill"
              />
              <template v-else>
                <text class="cicon-add"></text>
                <text>{{ uploads.teacherCert.uploading ? '上传中...' : '上传教师资格证' }}</text>
              </template>
            </view>
            <button
              v-if="uploads.teacherCert.error"
              class="retry-btn ss-reset-button"
              @tap="retryUpload('teacherCert')"
            >
              重新上传
            </button>
          </view>
        </view>
      </view>

      <view class="benefit-card">
        <view class="benefit-title">认证特权</view>
        <view class="benefit-line" v-for="item in benefits" :key="item">
          <text class="cicon-check-round"></text>
          <text>{{ item }}</text>
        </view>
      </view>

      <button
        class="primary-btn ss-reset-button"
        :class="{ disabled: readonly || submitting }"
        :disabled="readonly || submitting"
        @tap="submit"
      >
        {{ submitText }}
      </button>
    </template>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import FileApi from '@/sheep/api/infra/file';
  import TutorCertificationApi from '@/sheep/api/tutor/certification';
  import { TUTOR_AUDIT_STATUS, TUTOR_ROLE } from '@/sheep/api/tutor/utils';

  const userStore = sheep.$store('user');
  const state = reactive({
    profile: null,
    certification: null,
    submitting: false,
  });

  const form = reactive({
    realName: '',
    idCardNo: '',
    educationFileUrl: '',
    teacherCertFileUrl: '',
  });

  const uploads = reactive({
    education: {
      preview: '',
      localPath: '',
      uploading: false,
      error: '',
    },
    teacherCert: {
      preview: '',
      localPath: '',
      uploading: false,
      error: '',
    },
  });

  const benefits = [
    '获得平台认证教师标识',
    '优先展示在推荐结果中',
    '提升家长信任度',
    '解锁简历发布功能',
  ];

  const status = computed(() => state.certification?.status ?? TUTOR_AUDIT_STATUS.DRAFT);
  const readonly = computed(
    () =>
      status.value === TUTOR_AUDIT_STATUS.WAITING || status.value === TUTOR_AUDIT_STATUS.APPROVED,
  );
  const needTeacherProfile = computed(() => state.profile?.role !== TUTOR_ROLE.TEACHER);
  const submitting = computed(() => state.submitting);

  const statusText = computed(() => {
    return (
      {
        [TUTOR_AUDIT_STATUS.DRAFT]: '未提交',
        [TUTOR_AUDIT_STATUS.WAITING]: '审核中',
        [TUTOR_AUDIT_STATUS.APPROVED]: '已通过',
        [TUTOR_AUDIT_STATUS.REJECTED]: '未通过',
      }[status.value] || '未提交'
    );
  });

  const statusTheme = computed(() => {
    return (
      {
        [TUTOR_AUDIT_STATUS.WAITING]: 'pending',
        [TUTOR_AUDIT_STATUS.APPROVED]: 'approved',
        [TUTOR_AUDIT_STATUS.REJECTED]: 'rejected',
      }[status.value] || 'draft'
    );
  });

  const statusDesc = computed(() => {
    if (status.value === TUTOR_AUDIT_STATUS.WAITING) {
      return '资料已提交，平台会在审核完成后通过消息通知你。';
    }
    if (status.value === TUTOR_AUDIT_STATUS.APPROVED) {
      return '教师认证已通过，可以发布教师简历并获得认证标识。';
    }
    if (status.value === TUTOR_AUDIT_STATUS.REJECTED) {
      return '请根据拒绝原因修改资料后重新提交审核。';
    }
    return '请提交真实资料，证件信息仅用于审核和风控。';
  });

  const submitText = computed(() => {
    if (status.value === TUTOR_AUDIT_STATUS.WAITING) return '审核中';
    if (status.value === TUTOR_AUDIT_STATUS.APPROVED) return '认证已通过';
    if (state.submitting) return '提交中...';
    return status.value === TUTOR_AUDIT_STATUS.REJECTED ? '重新提交审核' : '提交认证';
  });

  function fillForm(data) {
    form.realName = data?.realName || '';
    form.idCardNo = '';
    form.educationFileUrl = data?.educationFileUrl || '';
    form.teacherCertFileUrl = data?.teacherCertFileUrl || '';
    uploads.education.preview = data?.educationFileUrl || '';
    uploads.teacherCert.preview = data?.teacherCertFileUrl || '';
  }

  function resolveFileUrl(result) {
    if (!result) return '';
    if (typeof result.data === 'string') return result.data;
    return result.data?.url || result.data?.path || result.url || '';
  }

  function chooseFile(type) {
    if (readonly.value) {
      return;
    }
    uni.chooseImage({
      count: 1,
      success: async (res) => {
        const filePath = res.tempFilePaths?.[0];
        if (!filePath) return;
        uploads[type].localPath = filePath;
        uploads[type].preview = filePath;
        await uploadFile(type, filePath);
      },
    });
  }

  async function uploadFile(type, filePath) {
    const field = type === 'education' ? 'educationFileUrl' : 'teacherCertFileUrl';
    uploads[type].uploading = true;
    uploads[type].error = '';
    const result = await FileApi.uploadFile(filePath, 'tutor/certification');
    const url = resolveFileUrl(result);
    uploads[type].uploading = false;
    if (!url) {
      uploads[type].error = '上传失败';
      uni.showToast({ title: '上传失败，请重试', icon: 'none' });
      return false;
    }
    form[field] = url;
    uploads[type].preview = url;
    return true;
  }

  function retryUpload(type) {
    if (!uploads[type].localPath) {
      chooseFile(type);
      return;
    }
    uploadFile(type, uploads[type].localPath);
  }

  function validate() {
    if (!form.realName.trim()) {
      uni.showToast({ title: '请输入真实姓名', icon: 'none' });
      return false;
    }
    if (!form.idCardNo.trim() && !state.certification?.idCardNoMask) {
      uni.showToast({ title: '请输入身份证号', icon: 'none' });
      return false;
    }
    if (!form.educationFileUrl) {
      uni.showToast({ title: '请上传学历证明', icon: 'none' });
      return false;
    }
    if (!form.teacherCertFileUrl) {
      uni.showToast({ title: '请上传教师资格证', icon: 'none' });
      return false;
    }
    if (uploads.education.uploading || uploads.teacherCert.uploading) {
      uni.showToast({ title: '材料仍在上传中', icon: 'none' });
      return false;
    }
    return true;
  }

  async function submit() {
    if (readonly.value || !validate()) {
      return;
    }
    state.submitting = true;
    const result = await TutorCertificationApi.submitCertification({
      realName: form.realName.trim(),
      idCardNo: form.idCardNo.trim(),
      educationFileUrl: form.educationFileUrl,
      teacherCertFileUrl: form.teacherCertFileUrl,
    });
    state.submitting = false;
    if (result?.code === 0) {
      state.certification = result.data;
      fillForm(result.data);
    }
  }

  function goIdentity() {
    uni.navigateTo({ url: '/pages/tutor/identity/index' });
  }

  async function loadPage() {
    state.profile = await userStore.getTutorProfile({ silent: false });
    if (needTeacherProfile.value) {
      return;
    }
    const result = await TutorCertificationApi.getMyCertification({ silent: true });
    if (result?.code === 0) {
      state.certification = result.data || null;
      fillForm(result.data || {});
    }
  }

  onShow(loadPage);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .hero,
  .status-card,
  .form-card,
  .benefit-card,
  .guard-card {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 20rpx;
    background: #fff;
    border: 1px solid #e8eef0;
  }

  .hero {
    color: #fff;
    background: linear-gradient(135deg, #2563eb 0%, #0f766e 100%);
    border: 0;
  }

  .title {
    font-size: 40rpx;
    font-weight: 900;
  }

  .subtitle,
  .status-desc,
  .guard-desc {
    margin-top: 12rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .hero .subtitle {
    color: rgba(255, 255, 255, 0.9);
  }

  .guard-card {
    text-align: center;
  }

  .guard-icon {
    width: 104rpx;
    height: 104rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10rpx auto 20rpx;
    border-radius: 52rpx;
    color: #2563eb;
    background: #eff6ff;
  }

  .guard-icon text {
    font-size: 54rpx;
  }

  .guard-title {
    color: #111827;
    font-size: 32rpx;
    font-weight: 900;
  }

  .status-card.pending {
    background: #fffbeb;
    border-color: #fde68a;
  }

  .status-card.approved {
    background: #ecfdf5;
    border-color: #bbf7d0;
  }

  .status-card.rejected {
    background: #fef2f2;
    border-color: #fecaca;
  }

  .status-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #111827;
    font-size: 28rpx;
    font-weight: 800;
  }

  .status {
    color: #0f766e;
  }

  .rejected .status {
    color: #dc2626;
  }

  .pending .status {
    color: #b45309;
  }

  .reject-box {
    margin-top: 18rpx;
    padding: 18rpx;
    border-radius: 14rpx;
    color: #991b1b;
    background: #fff;
    font-size: 24rpx;
    line-height: 36rpx;
  }

  .field {
    display: block;
    margin-bottom: 26rpx;
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
  .upload-box {
    width: 100%;
    box-sizing: border-box;
    border-radius: 14rpx;
    color: #111827;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 26rpx;
  }

  .field input {
    height: 82rpx;
    padding: 0 20rpx;
  }

  .upload-grid {
    display: grid;
    gap: 14rpx;
  }

  .upload-box {
    position: relative;
    overflow: hidden;
    height: 196rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    color: #0f766e;
    border-style: dashed;
  }

  .upload-box.done {
    border-style: solid;
    border-color: #bbf7d0;
  }

  .upload-box text:first-child {
    font-size: 46rpx;
  }

  .upload-preview {
    width: 100%;
    height: 100%;
  }

  .retry-btn {
    width: 160rpx;
    height: 58rpx;
    border-radius: 999rpx;
    color: #dc2626;
    background: #fef2f2;
    font-size: 23rpx;
  }

  .benefit-card {
    padding: 24rpx 26rpx;
  }

  .benefit-title {
    margin-bottom: 18rpx;
    color: #111827;
    font-size: 28rpx;
    font-weight: 900;
  }

  .benefit-line {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 12rpx;
    color: #4b5563;
    font-size: 25rpx;
  }

  .benefit-line text:first-child {
    color: #16a34a;
    font-size: 30rpx;
  }

  .primary-btn {
    height: 88rpx;
    margin: 4rpx 24rpx 36rpx;
    border-radius: 999rpx;
    color: #fff;
    background: #2563eb;
    box-shadow: 0 14rpx 30rpx rgba(37, 99, 235, 0.22);
    font-size: 30rpx;
    font-weight: 800;
  }

  .primary-btn.disabled {
    opacity: 0.66;
    box-shadow: none;
  }

  .guard-card .primary-btn {
    width: 100%;
    margin: 28rpx 0 0;
  }
</style>
