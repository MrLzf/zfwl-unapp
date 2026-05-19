<template>
  <s-layout title="" navbar="" tabbar="/pages/index/publish" class="publish-page">
    <view class="publish-shell">
      <view class="page-title">发布信息</view>
      <view class="page-subtitle">先完成基础信息，后续接入审核接口后即可提交到后台。</view>

      <view class="type-switch">
        <button
          class="type-btn ss-reset-button"
          :class="{ active: form.type === 'req' }"
          @tap="form.type = 'req'"
        >
          家长需求
        </button>
        <button
          class="type-btn ss-reset-button"
          :class="{ active: form.type === 'tutor' }"
          @tap="form.type = 'tutor'"
        >
          教师简历
        </button>
      </view>

      <view class="form-panel">
        <label class="field">
          <text>标题</text>
          <input v-model="form.title" :placeholder="titlePlaceholder" />
        </label>
        <label class="field">
          <text>{{ form.type === 'req' ? '年级' : '学历/资历' }}</text>
          <input v-model="form.grade" :placeholder="gradePlaceholder" />
        </label>
        <label class="field">
          <text>科目</text>
          <input v-model="form.subject" placeholder="例如：数学、英语、物理" />
        </label>
        <label class="field">
          <text>{{ form.type === 'req' ? '预算' : '时薪' }}</text>
          <input v-model="form.price" type="number" placeholder="请输入每小时价格" />
        </label>
        <label class="field">
          <text>授课方式</text>
          <view class="mode-row">
            <button
              v-for="mode in modes"
              :key="mode.value"
              class="mode-btn ss-reset-button"
              :class="{ active: form.mode === mode.value }"
              @tap="form.mode = mode.value"
            >
              {{ mode.label }}
            </button>
          </view>
        </label>
        <label class="field">
          <text>详细说明</text>
          <textarea v-model="form.description" placeholder="请描述需求、经验、上课时间或期望" />
        </label>
      </view>

      <button class="submit-btn ss-reset-button" @tap="submit">保存草稿</button>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';

  const modes = [
    { label: '上门', value: 'offline' },
    { label: '在线', value: 'online' },
    { label: '均可', value: 'both' },
  ];

  const form = reactive({
    type: 'req',
    title: '',
    grade: '',
    subject: '',
    price: '',
    mode: 'both',
    description: '',
  });

  const titlePlaceholder = computed(() =>
    form.type === 'req' ? '例如：高三物理冲刺辅导' : '例如：985硕士数学老师',
  );
  const gradePlaceholder = computed(() =>
    form.type === 'req' ? '例如：高三' : '例如：浙江大学硕士',
  );

  function submit() {
    if (!form.title || !form.subject || !form.price) {
      uni.showToast({
        title: '请完善标题、科目和价格',
        icon: 'none',
      });
      return;
    }
    uni.setStorageSync('tutor_publish_draft', { ...form });
    uni.showToast({
      title: '已保存草稿',
      icon: 'none',
    });
  }

  onShow(() => {
    const role = uni.getStorageSync('tutor_publish_role');
    if (role === 'teacher') {
      form.type = 'tutor';
    } else if (role === 'parent') {
      form.type = 'req';
    }
  });
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

  .page-title {
    color: #111827;
    font-size: 42rpx;
    font-weight: 800;
  }

  .page-subtitle {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 25rpx;
    line-height: 38rpx;
  }

  .type-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
    margin: 28rpx 0 20rpx;
    padding: 8rpx;
    border-radius: 12rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .type-btn {
    height: 70rpx;
    border-radius: 10rpx;
    color: #475569;
    font-size: 26rpx;
    font-weight: 700;
  }

  .type-btn.active {
    color: #ffffff;
    background: #0f766e;
  }

  .form-panel {
    padding: 24rpx;
    border-radius: 12rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
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

  .mode-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
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

  .submit-btn {
    width: 100%;
    height: 88rpx;
    margin-top: 28rpx;
    border-radius: 12rpx;
    color: #ffffff;
    background: #0f766e;
    font-size: 30rpx;
    font-weight: 800;
  }
</style>
