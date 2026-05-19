<template>
  <s-layout class="page" title="教师认证" navbar="inner">
    <view class="hero">
      <view class="title">教师认证</view>
      <view class="subtitle">认证通过后可发布教师简历，并在广场获得认证标识。</view>
    </view>

    <view class="status-card">
      <view class="status-head">
        <text>认证状态</text>
        <text class="status">{{ statusText }}</text>
      </view>
      <view class="status-desc">{{ statusDesc }}</view>
    </view>

    <view class="form-card">
      <label class="field">
        <text>真实姓名</text>
        <input v-model="form.realName" placeholder="请输入真实姓名" />
      </label>
      <label class="field">
        <text>身份证号</text>
        <input v-model="form.idCardNo" placeholder="仅用于平台审核，前端不展示" />
      </label>
      <label class="field">
        <text>最高学历</text>
        <input v-model="form.education" placeholder="例如：浙江大学硕士" />
      </label>
      <label class="field">
        <text>教师资格证/学历证明</text>
        <view class="upload-box" @tap="chooseFile">
          <text class="cicon-add"></text>
          <text>{{ form.fileName || '选择证明材料' }}</text>
        </view>
      </label>
      <label class="field">
        <text>教学说明</text>
        <textarea v-model="form.intro" placeholder="简要说明授课经验、擅长阶段和可授科目" />
      </label>
    </view>

    <button class="primary-btn ss-reset-button" @tap="submit">提交认证</button>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';

  const form = reactive({
    realName: '',
    idCardNo: '',
    education: '',
    fileName: '',
    intro: '',
    status: 'draft',
  });

  const statusText = computed(() => {
    return { draft: '未提交', pending: '审核中', approved: '已通过', rejected: '已拒绝' }[
      form.status
    ];
  });

  const statusDesc = computed(() => {
    return form.status === 'pending'
      ? '平台会在资料提交后进行人工审核，审核结果将通过消息通知。'
      : '请提交真实资料，联系方式和证件信息只用于审核。';
  });

  function chooseFile() {
    uni.chooseImage({
      count: 1,
      success: (res) => {
        form.fileName = res.tempFilePaths?.[0]?.split('/').pop() || '已选择材料';
      },
    });
  }

  function submit() {
    if (!form.realName || !form.idCardNo || !form.education) {
      uni.showToast({ title: '请完善姓名、身份证号和学历', icon: 'none' });
      return;
    }
    form.status = 'pending';
    uni.setStorageSync('tutor_certification_draft', { ...form });
    uni.showToast({ title: '已提交审核', icon: 'none' });
  }

  onShow(() => {
    Object.assign(form, uni.getStorageSync('tutor_certification_draft') || {});
  });
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f5f7f5;
  }

  .hero,
  .status-card,
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

  .subtitle,
  .status-desc {
    margin-top: 12rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .status-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #111827;
    font-size: 28rpx;
    font-weight: 700;
  }

  .status {
    color: #0f766e;
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
  .field textarea,
  .upload-box {
    width: 100%;
    box-sizing: border-box;
    border-radius: 10rpx;
    color: #111827;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 26rpx;
  }

  .field input,
  .upload-box {
    height: 78rpx;
    padding: 0 20rpx;
  }

  .upload-box {
    display: flex;
    align-items: center;
    gap: 10rpx;
    color: #0f766e;
  }

  .field textarea {
    min-height: 180rpx;
    padding: 18rpx 20rpx;
    line-height: 38rpx;
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
