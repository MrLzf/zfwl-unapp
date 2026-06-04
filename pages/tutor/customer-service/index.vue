<template>
  <s-layout class="page" title="在线客服" navbar="inner">
    <view class="service-card">
      <view class="title">{{ isWorkingTime ? '在线客服' : '非工作时间' }}</view>
      <view class="desc">{{
        isWorkingTime
          ? '工作时间 09:00-21:00，可直接咨询平台客服。'
          : '当前为非工作时间，可先查看 FAQ 或留言。'
      }}</view>
    </view>

    <view class="messages">
      <view
        v-for="item in messages"
        :key="item.id"
        class="message"
        :class="{ mine: item.sender === 'user' }"
      >
        <view class="bubble">{{ item.content }}</view>
      </view>
      <view v-if="!messages.length" class="faq">
        <view class="faq-title">常见问题</view>
        <view v-for="item in faqs" :key="item" class="faq-item">{{ item }}</view>
      </view>
    </view>

    <view class="input-bar">
      <input v-model="content" placeholder="请输入咨询内容" confirm-type="send" @confirm="send" />
      <button class="send-btn ss-reset-button" @tap="send">发送</button>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import TutorP1Api from '@/sheep/api/tutor/p1';

  const session = reactive({});
  const messages = reactive([]);
  const content = ref('');
  const faqs = [
    '如何查看联系方式：进入详情页，确认扣积分后展示。',
    '教师如何认证：我的页面进入教师认证并上传材料。',
    '积分不足怎么办：可在积分充值页选择积分包。',
  ];
  const isWorkingTime = computed(() => {
    const hour = new Date().getHours();
    return hour >= 9 && hour < 21;
  });

  async function ensureSession() {
    let result = await TutorP1Api.getCustomerServiceSession();
    if (result?.code !== 0 || !result.data?.id)
      result = await TutorP1Api.createCustomerServiceSession();
    if (result?.code === 0) Object.assign(session, result.data || {});
  }

  async function loadMessages() {
    await ensureSession();
    if (!session.id) return;
    const result = await TutorP1Api.getCustomerServiceMessages(session.id);
    if (result?.code === 0)
      messages.splice(0, messages.length, ...(result.data?.list || result.data || []));
  }

  async function send() {
    const text = content.value.trim();
    if (!text) return;
    if (!session.id) await ensureSession();
    const local = { id: `local-${Date.now()}`, sender: 'user', content: text };
    messages.push(local);
    content.value = '';
    if (!session.id) return;
    const result = await TutorP1Api.sendCustomerServiceMessage(session.id, {
      content: text,
      messageType: 'text',
    });
    if (result?.code !== 0)
      uni.showToast({ title: result?.msg || '留言已保存在本地，稍后重试', icon: 'none' });
  }

  onShow(loadMessages);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    padding-bottom: 120rpx;
    background: #f7f8fb;
  }
  .service-card {
    margin: 24rpx;
    padding: 28rpx;
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #e7edf0;
  }
  .title {
    color: #111827;
    font-size: 32rpx;
    font-weight: 900;
  }
  .desc {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 38rpx;
  }
  .messages {
    padding: 0 24rpx 24rpx;
  }
  .message {
    display: flex;
    margin-bottom: 18rpx;
  }
  .message.mine {
    justify-content: flex-end;
  }
  .bubble {
    max-width: 74%;
    padding: 18rpx 22rpx;
    border-radius: 16rpx;
    color: #334155;
    background: #fff;
    border: 1px solid #e7edf0;
    font-size: 26rpx;
    line-height: 40rpx;
  }
  .mine .bubble {
    color: #fff;
    background: #176b5b;
    border-color: #176b5b;
  }
  .faq {
    padding: 26rpx;
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #e7edf0;
  }
  .faq-title {
    color: #111827;
    font-size: 30rpx;
    font-weight: 900;
  }
  .faq-item {
    margin-top: 18rpx;
    color: #475569;
    font-size: 25rpx;
    line-height: 38rpx;
  }
  .input-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    gap: 16rpx;
    padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 1px solid #e7edf0;
  }
  input {
    flex: 1;
    height: 76rpx;
    padding: 0 22rpx;
    border-radius: 14rpx;
    background: #f1f5f9;
    font-size: 26rpx;
  }
  .send-btn {
    width: 120rpx;
    height: 76rpx;
    border-radius: 14rpx;
    color: #fff;
    background: #176b5b;
    font-size: 26rpx;
    font-weight: 900;
  }
</style>
