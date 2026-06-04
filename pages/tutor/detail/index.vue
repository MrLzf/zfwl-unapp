<template>
  <s-layout class="detail-page" title="" navbar="">
    <view class="detail-shell">
      <view class="detail-header">
        <button class="icon-btn ss-reset-button" @tap="goBack">
          <text class="cicon-back"></text>
        </button>
        <text class="header-title">{{ isTutor ? '老师详情' : '需求详情' }}</text>
        <view class="header-spacer"></view>
      </view>

      <view v-if="state.errorMsg" class="state-card">
        <view class="state-icon"><text class="cicon-warn"></text></view>
        <view class="state-title">详情加载失败</view>
        <view class="state-desc">{{ state.errorMsg }}</view>
        <button class="state-btn ss-reset-button" @tap="loadDetail">重新加载</button>
      </view>

      <scroll-view v-else class="detail-scroll" scroll-y>
        <view v-if="state.loading" class="loading-card">加载中...</view>

        <block v-else>
          <view class="profile-card">
            <view class="profile-main">
              <image class="avatar" :src="detail.avatar" mode="aspectFill" />
              <view class="profile-info">
                <view class="profile-name">{{ isTutor ? detail.name : detail.parentName }}</view>
                <view class="profile-desc">
                  {{ detail.title || detail.education || detail.grade }}
                </view>
                <view class="badge-row">
                  <text v-if="detail.verified">平台认证</text>
                  <text v-if="detail.urgent">加急需求</text>
                  <text v-if="detail.hasFreeTrial">支持试课</text>
                  <text>{{ modeText(detail.mode) }}</text>
                </view>
              </view>
            </view>
            <view class="price-line">
              <view>
                <text class="price">{{ priceText }}</text>
                <text v-if="priceText !== '价格面议'" class="price-unit">/小时</text>
              </view>
              <text class="role-tag">{{ isTutor ? '老师简历' : '家长需求' }}</text>
            </view>
          </view>

          <view class="panel">
            <view class="panel-title">基本信息</view>
            <view class="info-grid">
              <view class="info-item">
                <text class="info-label">授课科目</text>
                <text class="info-value">{{ detail.subjects.join('、') }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">距离</text>
                <text class="info-value">{{ formatDistance(detail.distance) }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">{{ isTutor ? '学历资历' : '学生年级' }}</text>
                <text class="info-value">{{ detail.education || detail.grade }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">{{ isTutor ? '评分' : '上课频次' }}</text>
                <text class="info-value">{{
                  isTutor
                    ? `${detail.score || '5.0'} 分 · ${detail.reviewCount || 0} 条`
                    : detail.frequency
                }}</text>
              </view>
              <view v-if="!isTutor && detail.address" class="info-item">
                <text class="info-label">上课地址</text>
                <text class="info-value">{{ detail.address }}</text>
              </view>
            </view>
          </view>

          <view class="panel contact-panel">
            <view class="panel-head">
              <view class="panel-title">联系方式</view>
              <text class="unlock-tag" :class="{ active: state.contactUnlocked }">
                {{ isOwner ? '本人发布' : state.contactUnlocked ? '已解锁' : '默认脱敏' }}
              </text>
            </view>
            <view class="contact-row">
              <view class="contact-icon"><text class="cicon-phone"></text></view>
              <view>
                <view class="contact-label">手机号码</view>
                <view class="contact-value">{{ contactPreview.mobile }}</view>
              </view>
            </view>
            <view class="contact-row">
              <view class="contact-icon wechat"><text class="cicon-chat"></text></view>
              <view>
                <view class="contact-label">微信号</view>
                <view class="contact-value">{{ contactPreview.wechat }}</view>
              </view>
            </view>
            <view v-if="!isOwner && !state.contactUnlocked" class="contact-tip">
              查看完整联系方式需扣除 10 积分，30 天内复看免费。
            </view>
          </view>

          <view class="panel">
            <view class="panel-title">{{ isTutor ? '教学介绍' : '需求说明' }}</view>
            <view class="description">{{ detail.description }}</view>
          </view>

          <view class="panel">
            <view class="panel-title">匹配标签</view>
            <view class="tag-row">
              <text v-for="tag in detail.expectations" :key="tag">{{ tag }}</text>
            </view>
          </view>

          <view class="safe-panel">
            <view class="safe-title">联系安全提醒</view>
            <view class="safe-text">
              {{
                state.safetyTip || '请优先核验身份，线下见面选择公共场所，未确认前不要提前转账。'
              }}
            </view>
          </view>
        </block>
      </scroll-view>

      <view v-if="!isOwner && !state.errorMsg" class="action-bar">
        <button
          class="minor-btn ss-reset-button"
          :class="{ active: state.isFavorited }"
          @tap="toggleFavorite"
        >
          <text class="cicon-favorite"></text>
          <text>{{ state.isFavorited ? '已收藏' : '收藏' }}</text>
        </button>
        <button class="minor-btn ss-reset-button" @tap="confirmMatch">
          <text class="cicon-check-round"></text>
          <text>匹配</text>
        </button>
        <button class="contact-btn ss-reset-button" @tap="viewContact">
          <text class="cicon-phone"></text>
          <text>{{ state.contactUnlocked ? '复看联系方式' : '查看联系方式' }}</text>
        </button>
      </view>

      <view v-if="state.showConfirmModal" class="modal-mask">
        <view class="modal-card">
          <view class="modal-head">
            <view class="modal-title">查看联系方式</view>
            <button class="modal-close ss-reset-button" @tap="state.showConfirmModal = false">
              <text class="cicon-close"></text>
            </button>
          </view>
          <view class="modal-desc">
            本次将扣除 <text>10 积分</text>，30 天内再次查看同一联系人不重复扣分。
          </view>
          <view class="point-box">
            <view class="point-line">
              <text>当前积分</text>
              <text>{{ pointBalance }} 分</text>
            </view>
            <view class="point-line">
              <text>查看后剩余</text>
              <text>{{ Math.max(pointBalance - 10, 0) }} 分</text>
            </view>
          </view>
          <view v-if="state.contactError" class="error-line">{{ state.contactError }}</view>
          <view class="modal-actions">
            <button class="ghost-btn ss-reset-button" @tap="state.showConfirmModal = false"
              >取消</button
            >
            <button
              v-if="pointBalance >= 10"
              class="primary-btn ss-reset-button"
              :disabled="state.contactLoading"
              @tap="confirmViewContact"
            >
              {{ state.contactLoading ? '处理中' : '确认查看' }}
            </button>
            <button v-else class="primary-btn ss-reset-button" @tap="goPoints">去获取积分</button>
          </view>
          <button v-if="pointBalance < 10" class="service-link ss-reset-button" @tap="goService">
            积分不足，联系平台客服
          </button>
        </view>
      </view>

      <view v-if="state.showContactModal" class="modal-mask">
        <view class="modal-card">
          <view class="modal-head">
            <view class="modal-title">联系方式</view>
            <button class="modal-close ss-reset-button" @tap="state.showContactModal = false">
              <text class="cicon-close"></text>
            </button>
          </view>
          <view class="contact-box">
            <view class="contact-row unlocked">
              <view class="contact-icon"><text class="cicon-phone"></text></view>
              <view>
                <view class="contact-label">手机号码</view>
                <view class="contact-value">{{ contactPreview.mobile }}</view>
              </view>
              <button class="copy-btn ss-reset-button" @tap="copyText(contactPreview.mobile)"
                >复制</button
              >
            </view>
            <view class="contact-row unlocked">
              <view class="contact-icon wechat"><text class="cicon-chat"></text></view>
              <view>
                <view class="contact-label">微信号</view>
                <view class="contact-value">{{ contactPreview.wechat }}</view>
              </view>
              <button class="copy-btn ss-reset-button" @tap="copyText(contactPreview.wechat)"
                >复制</button
              >
            </view>
          </view>
          <view class="safe-modal">{{ state.contact?.safetyTip || state.safetyTip }}</view>
          <button class="primary-full ss-reset-button" @tap="state.showContactModal = false"
            >知道了</button
          >
        </view>
      </view>

      <view v-if="state.showReviewModal" class="modal-mask">
        <view class="modal-card">
          <view class="modal-head">
            <view class="modal-title">评价本次匹配</view>
            <button class="modal-close ss-reset-button" @tap="state.showReviewModal = false">
              <text class="cicon-close"></text>
            </button>
          </view>
          <view class="star-row">
            <button
              v-for="star in 5"
              :key="star"
              class="star ss-reset-button"
              :class="{ active: reviewForm.rating >= star }"
              @tap="reviewForm.rating = star"
            >
              ★
            </button>
          </view>
          <view class="tag-row review-tags">
            <button
              v-for="tag in reviewTags"
              :key="tag"
              class="review-tag ss-reset-button"
              :class="{ active: reviewForm.tags.includes(tag) }"
              @tap="toggleReviewTag(tag)"
            >
              {{ tag }}
            </button>
          </view>
          <textarea v-model="reviewForm.content" placeholder="说说沟通或试课体验" maxlength="500" />
          <button class="primary-full ss-reset-button" @tap="submitReview">提交评价</button>
        </view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { showAuthModal } from '@/sheep/hooks/useModal';
  import TutorMarketApi from '@/sheep/api/tutor/market';
  import TutorInteractionApi from '@/sheep/api/tutor/interaction';
  import { getLocationPayload } from '@/sheep/api/tutor/location';
  import {
    addLocalFavorite,
    addLocalReview,
    confirmLocalMatch,
    getLocalItem,
    getLocalMatches,
    getLocalPoints,
    getTargetType,
    isLocalFavorite,
    isNumericId,
    maskContact,
    recordLocalHistory,
    removeLocalFavorite,
    targetKey,
    viewLocalContact,
  } from '@/sheep/api/tutor/local-state';
  import {
    formatDistance,
    formatPriceRange,
    modeText,
    normalizeDemand,
    normalizeResume,
  } from '@/sheep/api/tutor/utils';

  const userStore = sheep.$store('user');
  const reviewTags = ['沟通顺畅', '信息真实', '耐心负责', '时间稳定', '效果明显'];

  const state = reactive({
    id: '',
    type: 'req',
    targetType: 'demand',
    loading: false,
    errorMsg: '',
    detail: normalizeDemand({}),
    contactUnlocked: false,
    contact: null,
    safetyTip: '',
    isFavorited: false,
    usingLocal: false,
    showConfirmModal: false,
    showContactModal: false,
    showReviewModal: false,
    contactLoading: false,
    contactError: '',
    currentMatch: null,
  });

  const reviewForm = reactive({
    rating: 5,
    tags: [],
    content: '',
  });

  const isLogin = computed(() => userStore.isLogin);
  const detail = computed(() => state.detail || {});
  const isTutor = computed(() => state.targetType === 'resume' || state.detail?.type === 'tutor');
  const isOwner = computed(
    () =>
      detail.value.userId &&
      userStore.tutorProfile?.userId &&
      String(detail.value.userId) === String(userStore.tutorProfile?.userId),
  );
  const priceText = computed(() =>
    isTutor.value
      ? formatPriceRange(
          detail.value.hourlyPriceMin,
          detail.value.hourlyPriceMax,
          detail.value.price,
        )
      : formatPriceRange(detail.value.budgetMin, detail.value.budgetMax, detail.value.budget),
  );
  const pointBalance = computed(() => {
    if (state.usingLocal || !isNumericId(state.id)) {
      return getLocalPoints();
    }
    return userStore.userInfo?.point ?? getLocalPoints();
  });
  const contactPreview = computed(() => {
    if ((isOwner.value || state.contactUnlocked) && state.contact) {
      return {
        mobile: state.contact.mobile || state.detail.fullPhone || state.detail.contactPhone,
        wechat:
          state.contact.wechat || state.detail.fullWechat || state.detail.contactWechat || '未填写',
      };
    }
    return maskContact(state.detail);
  });

  function goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
      return;
    }
    uni.switchTab({ url: '/pages/index/square' });
  }

  function normalizeDetailPayload(payload = {}) {
    const targetType = payload.targetType || state.targetType;
    if (targetType === 'resume') {
      return normalizeResume(payload.resume || payload, 0);
    }
    return normalizeDemand(payload.demand || payload, 0);
  }

  async function loadFavorite() {
    state.isFavorited = isLocalFavorite(state.targetType, state.id);
    if (!isLogin.value || state.usingLocal || !isNumericId(state.id)) return;
    const result = await TutorInteractionApi.getFavoriteList();
    if (result?.code === 0) {
      state.isFavorited = (result.data || []).some(
        (item) =>
          item.targetType === state.targetType && String(item.targetId) === String(state.id),
      );
    }
  }

  async function loadDetail() {
    state.loading = true;
    state.errorMsg = '';
    try {
      let loaded = null;
      if (isNumericId(state.id)) {
        const city = uni.getStorageSync('tutor_city') || {};
        const location = getLocationPayload(city);
        const result = await TutorMarketApi.getDetail(state.targetType, state.id, {
          longitude: location.longitude,
          latitude: location.latitude,
        });
        if (result?.code === 0) {
          loaded = normalizeDetailPayload(result.data);
          state.usingLocal = false;
          state.contactUnlocked = Boolean(result.data?.contactUnlocked);
          state.contact = result.data?.contact || null;
          state.safetyTip = result.data?.safetyTip || '';
        }
      }
      if (!loaded) {
        loaded = getLocalItem(state.targetType, state.id);
        state.usingLocal = true;
        state.contactUnlocked = false;
        state.contact = null;
        state.safetyTip = '请核验对方身份，线下见面选择公共场所，未确认前不要提前转账。';
      }
      state.detail = loaded;
      state.targetType = loaded.targetType || state.targetType;
      state.type = loaded.type || state.type;
      recordLocalHistory(loaded);
      await loadFavorite();
    } catch (error) {
      const loaded = getLocalItem(state.targetType, state.id);
      if (loaded) {
        state.usingLocal = true;
        state.detail = loaded;
        recordLocalHistory(loaded);
        await loadFavorite();
      } else {
        state.errorMsg = '网络请求出错，请稍后重试';
      }
    } finally {
      state.loading = false;
    }
  }

  function requireLogin() {
    if (isLogin.value) return true;
    showAuthModal();
    return false;
  }

  async function toggleFavorite() {
    if (!requireLogin()) return;
    const payload = {
      targetType: state.targetType,
      targetId: isNumericId(state.id) ? Number(state.id) : state.id,
    };
    const next = !state.isFavorited;
    state.isFavorited = next;
    if (!state.usingLocal && isNumericId(state.id)) {
      const result = next
        ? await TutorInteractionApi.addFavorite(payload)
        : await TutorInteractionApi.removeFavorite(payload);
      if (result && result.code !== 0) {
        state.isFavorited = !next;
        uni.showToast({ title: result.msg || '操作失败', icon: 'none' });
        return;
      }
    }
    if (next) {
      addLocalFavorite(state.detail);
    } else {
      removeLocalFavorite(state.targetType, state.id);
    }
    uni.showToast({ title: next ? '已收藏' : '已取消收藏', icon: 'none' });
  }

  function viewContact() {
    if (!requireLogin()) return;
    state.contactError = '';
    if (state.contactUnlocked) {
      state.showContactModal = true;
      return;
    }
    state.showConfirmModal = true;
  }

  async function confirmViewContact() {
    state.contactLoading = true;
    state.contactError = '';
    try {
      let result = null;
      if (!state.usingLocal && isNumericId(state.id)) {
        result = await TutorInteractionApi.viewContact({
          targetType: state.targetType,
          targetId: Number(state.id),
        });
      } else {
        result = viewLocalContact(state.detail);
      }
      if (result?.code === 0) {
        state.contact = result.data;
        state.contactUnlocked = true;
        state.showConfirmModal = false;
        state.showContactModal = true;
        await userStore.updateUserData?.();
        uni.showToast({
          title: result.data?.reused ? '复看免费' : '已扣除 10 积分',
          icon: 'none',
        });
        return;
      }
      state.contactError = result?.msg || '暂时无法查看联系方式';
    } finally {
      state.contactLoading = false;
    }
  }

  function goPoints() {
    state.showConfirmModal = false;
    uni.navigateTo({ url: '/pages/user/wallet/score?scene=insufficient' });
  }

  function goService() {
    state.showConfirmModal = false;
    uni.switchTab({ url: '/pages/index/message' });
  }

  function copyText(text) {
    if (!text || text === '未填写' || text === '查看后展示') return;
    uni.setClipboardData({
      data: String(text),
      success: () => uni.showToast({ title: '已复制', icon: 'none' }),
    });
  }

  async function findCurrentMatch() {
    const key = targetKey(state.targetType, state.id);
    if (state.usingLocal || !isNumericId(state.id)) {
      return getLocalMatches().find((match) => match.key === key);
    }
    const result = await TutorInteractionApi.getMatchList();
    if (result?.code !== 0) return null;
    return (result.data || []).find((match) =>
      state.targetType === 'demand'
        ? String(match.demandId) === String(state.id)
        : String(match.resumeId) === String(state.id),
    );
  }

  async function confirmMatch() {
    if (!requireLogin()) return;
    if (!state.contactUnlocked) {
      uni.showModal({
        title: '先查看联系方式',
        content: '确认匹配前需要先使用积分查看联系方式，平台会据此生成匹配记录。',
        confirmText: '去查看',
        success: (res) => res.confirm && viewContact(),
      });
      return;
    }
    const match = await findCurrentMatch();
    if (!match) {
      uni.showToast({ title: '暂无可确认的匹配记录', icon: 'none' });
      return;
    }
    if (!state.usingLocal && isNumericId(state.id)) {
      const result = await TutorInteractionApi.confirmMatch(match.id);
      if (result?.code !== 0) {
        uni.showToast({ title: result?.msg || '确认失败', icon: 'none' });
        return;
      }
      state.currentMatch = result.data;
    } else {
      state.currentMatch = confirmLocalMatch(match.id || match.key);
    }
    if (isReviewableMatch(state.currentMatch)) {
      uni.showToast({ title: '匹配已确认', icon: 'none' });
      state.showReviewModal = true;
    } else {
      uni.showToast({ title: '已确认，等待对方确认后可评价', icon: 'none' });
    }
  }

  function isReviewableMatch(match) {
    return Number(match?.status) === 40 || Boolean(match?.matchedTime);
  }

  function toggleReviewTag(tag) {
    const index = reviewForm.tags.indexOf(tag);
    if (index >= 0) {
      reviewForm.tags.splice(index, 1);
      return;
    }
    reviewForm.tags.push(tag);
  }

  async function submitReview() {
    const match = state.currentMatch || (await findCurrentMatch());
    if (!match) {
      uni.showToast({ title: '请先确认匹配', icon: 'none' });
      return;
    }
    if (!isReviewableMatch(match)) {
      uni.showToast({ title: '等待对方确认后可评价', icon: 'none' });
      return;
    }
    const payload = {
      matchId: match.id || match.matchId,
      rating: reviewForm.rating,
      tags: reviewForm.tags.join(','),
      content: reviewForm.content,
      anonymousDisplay: false,
      targetTitle: state.detail.title || state.detail.name,
    };
    if (!state.usingLocal && isNumericId(state.id)) {
      const result = await TutorInteractionApi.createReview(payload);
      if (result?.code !== 0) {
        uni.showToast({ title: result?.msg || '评价失败', icon: 'none' });
        return;
      }
    } else {
      addLocalReview(payload);
    }
    state.showReviewModal = false;
    reviewForm.rating = 5;
    reviewForm.tags = [];
    reviewForm.content = '';
    uni.showToast({ title: '评价已提交', icon: 'none' });
  }

  onLoad((options = {}) => {
    state.type = options.type || 'req';
    state.targetType = getTargetType(options.targetType || options.type || 'demand');
    state.id = options.id || 'req-r3';
    loadDetail();
  });
</script>

<style lang="scss" scoped>
  .detail-page,
  .detail-shell {
    min-height: 100vh;
    background: #f8fafc;
  }

  .detail-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: calc(var(--status-bar-height) + 88rpx);
    padding: var(--status-bar-height) 24rpx 0;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.92);
    border-bottom: 1px solid #eef2f7;
    backdrop-filter: blur(12px);
  }

  .header-title {
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
  }

  .icon-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #334155;
    font-size: 34rpx;
  }

  .header-spacer {
    width: 64rpx;
    height: 64rpx;
  }

  .detail-scroll {
    height: 100vh;
    box-sizing: border-box;
    padding: calc(var(--status-bar-height) + 108rpx) 24rpx 170rpx;
  }

  .profile-card,
  .panel,
  .safe-panel,
  .loading-card,
  .state-card {
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .profile-card {
    padding: 26rpx;
  }

  .profile-main,
  .price-line,
  .badge-row,
  .action-bar,
  .panel-head,
  .contact-row,
  .modal-head,
  .modal-actions,
  .point-line {
    display: flex;
    align-items: center;
  }

  .avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 56rpx;
    flex-shrink: 0;
    background: #e5e7eb;
  }

  .profile-info {
    min-width: 0;
    flex: 1;
    margin-left: 20rpx;
  }

  .profile-name {
    color: #0f172a;
    font-size: 38rpx;
    font-weight: 900;
    line-height: 50rpx;
  }

  .profile-desc {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 34rpx;
  }

  .badge-row {
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 16rpx;
  }

  .badge-row text,
  .tag-row text,
  .role-tag,
  .unlock-tag {
    padding: 7rpx 12rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 21rpx;
    font-weight: 700;
  }

  .price-line {
    justify-content: space-between;
    margin-top: 26rpx;
    padding-top: 22rpx;
    border-top: 1px solid #eef2f7;
  }

  .price {
    color: #f97316;
    font-size: 44rpx;
    font-weight: 900;
  }

  .price-unit {
    margin-left: 6rpx;
    color: #94a3b8;
    font-size: 23rpx;
  }

  .panel,
  .safe-panel,
  .loading-card {
    margin-top: 18rpx;
    padding: 26rpx;
  }

  .panel-head {
    justify-content: space-between;
  }

  .panel-title,
  .safe-title {
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
  }

  .unlock-tag {
    color: #64748b;
    background: #f1f5f9;
  }

  .unlock-tag.active {
    color: #16a34a;
    background: #dcfce7;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24rpx 18rpx;
    margin-top: 24rpx;
  }

  .info-label {
    display: block;
    margin-bottom: 8rpx;
    color: #94a3b8;
    font-size: 23rpx;
  }

  .info-value {
    display: block;
    color: #334155;
    font-size: 26rpx;
    line-height: 36rpx;
  }

  .contact-panel {
    background: #ffffff;
  }

  .contact-row {
    gap: 18rpx;
    margin-top: 20rpx;
    padding: 18rpx;
    border-radius: 14rpx;
    background: #f8fafc;
  }

  .contact-row.unlocked {
    justify-content: space-between;
  }

  .contact-icon {
    width: 58rpx;
    height: 58rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #2563eb;
    background: #eff6ff;
    font-size: 28rpx;
  }

  .contact-icon.wechat {
    color: #16a34a;
    background: #dcfce7;
  }

  .contact-label {
    color: #94a3b8;
    font-size: 22rpx;
  }

  .contact-value {
    margin-top: 4rpx;
    color: #0f172a;
    font-size: 29rpx;
    font-weight: 800;
  }

  .contact-tip,
  .safe-text,
  .description {
    margin-top: 18rpx;
    color: #475569;
    font-size: 26rpx;
    line-height: 44rpx;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 20rpx;
  }

  .safe-panel {
    background: #fff7ed;
    border-color: #fed7aa;
  }

  .safe-title,
  .safe-text {
    color: #9a3412;
  }

  .loading-card {
    text-align: center;
    color: #64748b;
  }

  .state-card {
    margin: calc(var(--status-bar-height) + 128rpx) 24rpx 0;
    padding: 56rpx 34rpx;
    text-align: center;
  }

  .state-icon {
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border-radius: 50%;
    color: #dc2626;
    background: #fef2f2;
    font-size: 40rpx;
  }

  .state-title {
    margin-top: 20rpx;
    color: #0f172a;
    font-size: 31rpx;
    font-weight: 900;
  }

  .state-desc {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .state-btn {
    height: 72rpx;
    margin-top: 24rpx;
    padding: 0 34rpx;
    border-radius: 999rpx;
    color: #ffffff;
    background: #2563eb;
    font-size: 25rpx;
    font-weight: 800;
  }

  .action-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    gap: 14rpx;
    padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
    background: #ffffff;
    border-top: 1px solid #eef2f7;
  }

  .minor-btn {
    width: 96rpx;
    height: 88rpx;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 20rpx;
    line-height: 1;
  }

  .minor-btn text:first-child {
    margin-bottom: 6rpx;
    font-size: 34rpx;
  }

  .minor-btn text:last-child {
    line-height: 28rpx;
  }

  .minor-btn.active {
    color: #f59e0b;
  }

  .contact-btn {
    min-width: 0;
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    border-radius: 16rpx;
    color: #ffffff;
    background: #2563eb;
    box-shadow: 0 14rpx 30rpx rgba(37, 99, 235, 0.22);
    font-size: 28rpx;
    font-weight: 900;
  }

  .modal-mask {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 36rpx;
    background: rgba(15, 23, 42, 0.52);
  }

  .modal-card {
    width: 100%;
    padding: 32rpx;
    border-radius: 24rpx;
    background: #ffffff;
    box-sizing: border-box;
  }

  .modal-head {
    justify-content: space-between;
  }

  .modal-title {
    color: #0f172a;
    font-size: 34rpx;
    font-weight: 900;
  }

  .modal-close {
    width: 56rpx;
    height: 56rpx;
    color: #94a3b8;
    font-size: 30rpx;
  }

  .modal-desc {
    margin-top: 22rpx;
    color: #475569;
    font-size: 26rpx;
    line-height: 42rpx;
  }

  .modal-desc text {
    color: #f97316;
    font-weight: 900;
  }

  .point-box,
  .safe-modal {
    margin-top: 22rpx;
    padding: 20rpx;
    border-radius: 14rpx;
    background: #eff6ff;
  }

  .point-line {
    justify-content: space-between;
    color: #475569;
    font-size: 25rpx;
  }

  .point-line + .point-line {
    margin-top: 14rpx;
  }

  .point-line text:last-child {
    color: #2563eb;
    font-weight: 900;
  }

  .error-line {
    margin-top: 18rpx;
    color: #dc2626;
    font-size: 24rpx;
    text-align: center;
  }

  .modal-actions {
    gap: 16rpx;
    margin-top: 28rpx;
  }

  .ghost-btn,
  .primary-btn,
  .primary-full {
    height: 82rpx;
    border-radius: 14rpx;
    font-size: 28rpx;
    font-weight: 900;
  }

  .ghost-btn,
  .primary-btn {
    flex: 1;
  }

  .ghost-btn {
    color: #334155;
    background: #f1f5f9;
  }

  .primary-btn,
  .primary-full {
    color: #ffffff;
    background: #2563eb;
  }

  .primary-btn[disabled] {
    opacity: 0.7;
  }

  .primary-full {
    width: 100%;
    margin-top: 24rpx;
  }

  .service-link {
    width: 100%;
    margin-top: 18rpx;
    color: #2563eb;
    font-size: 24rpx;
  }

  .contact-box {
    margin-top: 8rpx;
  }

  .copy-btn {
    margin-left: auto;
    color: #2563eb;
    font-size: 24rpx;
    font-weight: 800;
  }

  .safe-modal {
    color: #9a3412;
    background: #fff7ed;
    font-size: 24rpx;
    line-height: 38rpx;
  }

  .star-row {
    display: flex;
    gap: 12rpx;
    margin: 22rpx 0;
  }

  .star {
    color: #cbd5e1;
    font-size: 52rpx;
  }

  .star.active {
    color: #f59e0b;
  }

  .review-tags {
    margin-top: 0;
  }

  .review-tag {
    height: 58rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 24rpx;
  }

  .review-tag.active {
    color: #ffffff;
    background: #2563eb;
    border-color: #2563eb;
  }

  textarea {
    width: 100%;
    min-height: 160rpx;
    margin-top: 20rpx;
    padding: 18rpx 20rpx;
    border-radius: 14rpx;
    color: #0f172a;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    box-sizing: border-box;
    font-size: 26rpx;
    line-height: 38rpx;
  }
</style>
