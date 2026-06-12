<template>
  <s-layout class="page" title="联系记录" navbar="inner">
    <view class="summary">
      <view class="stat">
        <view class="stat-value">{{ records.length }}</view>
        <view class="stat-label">总联系数</view>
      </view>
      <view class="divider"></view>
      <view class="stat">
        <view class="stat-value">{{ totalCost }}</view>
        <view class="stat-label">消费积分</view>
      </view>
    </view>

    <view class="tip-card">
      已查看联系方式 30 天内复看免费。线下沟通前请先核验身份，避免提前转账。
    </view>

    <view v-if="state.loading" class="state-card">加载中...</view>

    <view v-else-if="records.length" class="list">
      <view v-for="item in records" :key="item.key" class="record-card">
        <view class="card-head">
          <view>
            <view class="name">{{ item.title || item.name || targetTitle(item) }}</view>
            <view class="meta"
              >{{ item.targetType === 'resume' ? '教师简历' : '家长需求' }} ·
              {{ formatDate(item.createTime) || '刚刚' }}</view
            >
          </view>
          <text class="cost"
            >{{ Number(item.pointCost || 0) > 0 ? `-${item.pointCost}` : '复看' }} 积分</text
          >
        </view>

        <view class="contact-box">
          <view class="contact-line">
            <text class="cicon-phone"></text>
            <text>{{
              item.mobile || item.fullPhone || item.contactPhone || '进入详情复看号码'
            }}</text>
            <button
              v-if="item.mobile || item.fullPhone"
              class="copy-btn ss-reset-button"
              @tap="copyText(item.mobile || item.fullPhone)"
            >
              复制
            </button>
          </view>
          <view class="contact-line">
            <text class="cicon-chat"></text>
            <text>{{
              item.wechat || item.fullWechat || item.contactWechat || '未填写或进入详情查看'
            }}</text>
            <button
              v-if="item.wechat || item.fullWechat"
              class="copy-btn ss-reset-button"
              @tap="copyText(item.wechat || item.fullWechat)"
            >
              复制
            </button>
          </view>
        </view>

        <view class="safe-line" :class="{ expired: isExpired(item.freeReuseUntil) }">
          {{
            isExpired(item.freeReuseUntil)
              ? '复看有效期已过'
              : `复看有效期至 ${formatDate(item.freeReuseUntil)}`
          }}
        </view>

        <view class="actions">
          <button class="ghost-btn ss-reset-button" @tap="goDetail(item)">查看详情</button>
          <button class="primary-btn ss-reset-button" @tap="goReviews">匹配/评价</button>
        </view>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <s-empty text="暂无联系记录" icon="/static/data-empty.png" />
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import dayjs from 'dayjs';
  import TutorMarketApi from '@/sheep/api/tutor/market';
  import TutorInteractionApi from '@/sheep/api/tutor/interaction';
  import {
    getLocalContacts,
    getLocalItem,
    isLocalDemoTarget,
    getTargetType,
    getUiType,
    isNumericId,
    targetKey,
  } from '@/sheep/api/tutor/local-state';
  import { formatDateTime, normalizeDemand, normalizeResume } from '@/sheep/api/tutor/utils';

  const state = reactive({
    loading: false,
    records: [],
  });

  const records = computed(() => state.records);
  const totalCost = computed(() =>
    records.value.reduce((total, item) => total + Number(item.pointCost || 0), 0),
  );

  function normalizeRecord(item, index = 0) {
    const targetType = getTargetType(item.targetType || item.type);
    const targetId = item.targetId || item.id;
    const source = item.type
      ? item
      : isNumericId(targetId)
      ? item
      : getLocalItem(targetType, targetId);
    if (!source) return null;
    const normalized =
      targetType === 'resume' ? normalizeResume(source, index) : normalizeDemand(source, index);
    return {
      ...normalized,
      ...item,
      id: item.id,
      targetId,
      targetType,
      key: item.key || targetKey(targetType, targetId),
      title: item.title || normalized.title || normalized.name,
    };
  }

  async function load() {
    state.loading = true;
    const localRecords = getLocalContacts().filter(isLocalDemoTarget).map(normalizeRecord).filter(Boolean);
    const result = await TutorInteractionApi.getContactRecordList();
    if (result?.code === 0) {
      const remote = await Promise.all(
        (result.data || []).map((item, index) => hydrateRecord(normalizeRecord(item, index))),
      );
      state.records = [...remote, ...localRecords].filter(Boolean);
    } else {
      state.records = localRecords;
    }
    state.loading = false;
  }

  async function hydrateRecord(record) {
    if (!record) return null;
    if (!isNumericId(record.targetId)) {
      return record;
    }
    const result = await TutorMarketApi.getDetail(record.targetType, record.targetId);
    if (result?.code !== 0) {
      return record;
    }
    const detail = record.targetType === 'resume' ? result.data?.resume : result.data?.demand;
    return {
      ...record,
      ...(record.targetType === 'resume'
        ? normalizeResume(detail || {}, 0)
        : normalizeDemand(detail || {}, 0)),
      ...record,
      title: detail?.title || record.title,
      mobile: result.data?.contact?.mobile || record.mobile,
      wechat: result.data?.contact?.wechat || record.wechat,
    };
  }

  function targetTitle(item) {
    return item.targetType === 'resume'
      ? `教师简历 #${item.targetId}`
      : `家长需求 #${item.targetId}`;
  }

  function formatDate(value) {
    return formatDateTime(value, '30天内');
  }

  function isExpired(value) {
    const formatted = formatDateTime(value);
    return formatted ? dayjs(formatted).isBefore(dayjs()) : false;
  }

  function copyText(text) {
    uni.setClipboardData({
      data: String(text),
      success: () => uni.showToast({ title: '已复制', icon: 'none' }),
    });
  }

  function goDetail(item) {
    uni.navigateTo({
      url: `/pages/tutor/detail/index?type=${getUiType(item.targetType)}&targetType=${
        item.targetType
      }&id=${item.targetId}`,
    });
  }

  function goReviews() {
    uni.navigateTo({ url: '/pages/tutor/reviews/index' });
  }

  onShow(load);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f8fafc;
  }

  .summary,
  .record-card,
  .tip-card,
  .state-card {
    margin: 24rpx;
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .summary {
    display: flex;
    padding: 28rpx 0;
  }

  .stat {
    flex: 1;
    text-align: center;
  }

  .stat-value {
    color: #0f172a;
    font-size: 42rpx;
    font-weight: 900;
  }

  .stat-label {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .divider {
    width: 1px;
    background: #eef2f7;
  }

  .tip-card {
    padding: 20rpx 24rpx;
    color: #1d4ed8;
    background: #eff6ff;
    border-color: #bfdbfe;
    font-size: 24rpx;
    line-height: 38rpx;
  }

  .list {
    padding-bottom: 20rpx;
  }

  .record-card {
    padding: 26rpx;
  }

  .card-head,
  .actions,
  .contact-line {
    display: flex;
    align-items: center;
  }

  .card-head {
    justify-content: space-between;
    gap: 18rpx;
  }

  .name {
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
  }

  .meta {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .cost {
    flex-shrink: 0;
    color: #f97316;
    font-size: 25rpx;
    font-weight: 900;
  }

  .contact-box {
    margin-top: 20rpx;
    padding: 18rpx;
    border-radius: 14rpx;
    background: #f8fafc;
  }

  .contact-line {
    gap: 12rpx;
    color: #334155;
    font-size: 25rpx;
  }

  .contact-line + .contact-line {
    margin-top: 16rpx;
  }

  .contact-line > text:first-child {
    color: #2563eb;
    font-size: 28rpx;
  }

  .copy-btn {
    margin-left: auto;
    color: #2563eb;
    font-size: 24rpx;
    font-weight: 800;
  }

  .safe-line {
    margin-top: 18rpx;
    padding: 16rpx 18rpx;
    border-radius: 12rpx;
    color: #16a34a;
    background: #dcfce7;
    font-size: 24rpx;
  }

  .safe-line.expired {
    color: #dc2626;
    background: #fef2f2;
  }

  .actions {
    gap: 14rpx;
    margin-top: 20rpx;
  }

  .ghost-btn,
  .primary-btn {
    flex: 1;
    height: 74rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: 800;
  }

  .ghost-btn {
    color: #2563eb;
    background: #eff6ff;
  }

  .primary-btn {
    color: #ffffff;
    background: #2563eb;
  }

  .state-card {
    padding: 48rpx;
    color: #64748b;
    text-align: center;
  }

  .empty-wrap {
    padding-top: 80rpx;
  }
</style>
