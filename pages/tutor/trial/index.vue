<template>
  <s-layout class="trial-page" title="预约试课">
    <view class="form-card">
      <view class="field">
        <text>预约时间</text>
        <picker mode="date" @change="onDateChange">
          <view class="picker">{{ form.date || '选择日期' }}</view>
        </picker>
      </view>
      <view class="field">
        <text>开始时间</text>
        <picker mode="time" @change="onTimeChange">
          <view class="picker">{{ form.time || '选择时间' }}</view>
        </picker>
      </view>
      <view class="field">
        <text>联系方式</text>
        <input v-model="form.contactMobile" placeholder="用于教师确认试课" />
      </view>
      <view class="field">
        <text>备注</text>
        <textarea v-model="form.remark" placeholder="说明孩子年级、科目和希望试课内容" />
      </view>
      <button class="primary-btn ss-reset-button" @tap="submit">提交预约</button>
    </view>
  </s-layout>
</template>

<script setup>
  import { reactive } from 'vue';
  import TutorP2Api from '@/sheep/api/tutor/p2';

  const form = reactive({
    resumeId: '',
    teacherUserId: '',
    date: '',
    time: '',
    contactMobile: '',
    remark: '',
  });

  onLoad((options) => {
    form.resumeId = options.resumeId || options.id || '';
    form.teacherUserId = options.teacherUserId || '';
  });

  function onDateChange(event) {
    form.date = event.detail.value;
  }

  function onTimeChange(event) {
    form.time = event.detail.value;
  }

  async function submit() {
    if (!form.date || !form.time || !form.contactMobile) {
      uni.showToast({ title: '请补全预约信息', icon: 'none' });
      return;
    }
    await TutorP2Api.createTrialAppointment({
      resumeId: form.resumeId,
      teacherUserId: form.teacherUserId,
      startTime: `${form.date} ${form.time}:00`,
      contactMobile: form.contactMobile,
      remark: form.remark,
    });
    uni.showToast({ title: '预约已提交', icon: 'success' });
    setTimeout(() => uni.navigateTo({ url: '/pages/tutor/appointments/index' }), 400);
  }
</script>

<style lang="scss" scoped>
  .trial-page {
    background: #f6f7fb;
  }
  .form-card {
    margin: 24rpx;
    padding: 28rpx;
    background: #fff;
    border-radius: 16rpx;
  }
  .field {
    margin-bottom: 28rpx;
    text {
      display: block;
      margin-bottom: 12rpx;
      color: #334155;
      font-size: 28rpx;
      font-weight: 700;
    }
    input,
    textarea,
    .picker {
      min-height: 84rpx;
      padding: 0 20rpx;
      border: 1rpx solid #dbe3ef;
      border-radius: 12rpx;
      background: #fff;
      color: #0f172a;
      line-height: 84rpx;
    }
    textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: 160rpx;
      padding-top: 18rpx;
      line-height: 1.5;
    }
  }
  .primary-btn {
    height: 88rpx;
    border-radius: 12rpx;
    background: #2563eb;
    color: #fff;
    font-size: 30rpx;
    font-weight: 800;
  }
</style>
