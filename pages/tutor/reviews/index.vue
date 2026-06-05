<template>
  <s-layout class="page" title="匹配与评价" navbar="inner">
    <view class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab ss-reset-button"
        :class="{ active: activeTab === tab.value }"
        @tap="activeTab = tab.value"
      >
        {{ tab.label }} ({{ tab.count }})
      </button>
    </view>

    <view v-if="activeTab === 'matches'" class="content">
      <view class="tip-card">双方确认匹配后即可评价。五星好评会触发平台积分奖励规则。</view>
      <view v-if="state.loading" class="state-card">加载中...</view>
      <view v-else-if="matches.length" class="list">
        <view v-for="item in matches" :key="item.key" class="match-card">
          <view class="match-head">
            <view>
              <view class="name">{{ item.title || item.name || targetTitle(item) }}</view>
              <view class="meta"
                >{{ item.targetType === 'resume' ? '教师简历' : '家长需求' }} ·
                {{ formatDate(item.createTime) || '刚刚' }}</view
              >
            </view>
            <text class="status" :class="{ success: isMatched(item) }">{{
              item.statusName || '已交换联系方式'
            }}</text>
          </view>
          <view class="match-info">
            <text>{{ item.cityName || item.city || item.district || '同城' }}</text>
            <text>{{ item.subjects?.join('、') || '科目待完善' }}</text>
            <text>{{
              item.matchedTime ? `匹配于 ${formatDate(item.matchedTime)}` : '等待双方确认'
            }}</text>
          </view>
          <view class="actions">
            <button class="ghost-btn ss-reset-button" @tap="goDetail(item)">查看详情</button>
            <button
              class="primary-btn ss-reset-button"
              :class="{ done: isReviewed(item) }"
              :disabled="isReviewed(item)"
              @tap="handleMatchAction(item)"
            >
              {{ isReviewed(item) ? '已评价' : isMatched(item) ? '去评价' : '确认匹配' }}
            </button>
          </view>
        </view>
      </view>
      <view v-else class="empty-wrap">
        <s-empty text="暂无可确认的匹配" icon="/static/data-empty.png" />
      </view>
    </view>

    <view v-else class="content">
      <view class="score-card">
        <view>
          <view class="score">{{ avgRating }}</view>
          <view class="subtitle">平均评分</view>
        </view>
        <view class="score-stats">
          <view>{{ reviews.length }} 条评价</view>
          <view>{{ fiveStarCount }} 条五星</view>
        </view>
      </view>

      <view v-if="state.loading" class="state-card">加载中...</view>
      <view v-else-if="reviews.length" class="list">
        <view v-for="item in reviews" :key="item.id" class="review-card">
          <view class="review-head">
            <text class="name">{{ item.targetTitle || `匹配 #${item.matchId}` }}</text>
            <text class="rating">{{ item.rating }} 分</text>
          </view>
          <view class="stars">
            <text v-for="star in 5" :key="star" :class="{ active: item.rating >= star }">★</text>
          </view>
          <view v-if="item.tags" class="tag-row">
            <text v-for="tag in String(item.tags).split(',').filter(Boolean)" :key="tag">{{
              tag
            }}</text>
          </view>
          <view class="content-text">{{ item.content || '暂无文字评价' }}</view>
          <view class="meta">{{ formatDate(item.createTime) }}</view>
        </view>
      </view>
      <view v-else class="empty-wrap">
        <s-empty text="暂无评价" icon="/static/data-empty.png" />
      </view>
    </view>

    <view v-if="state.showReviewModal" class="modal-mask">
      <view class="modal-card">
        <view class="modal-title">提交评价</view>
        <view class="star-row">
          <button
            v-for="star in 5"
            :key="star"
            class="star ss-reset-button"
            :class="{ active: form.rating >= star }"
            @tap="form.rating = star"
          >
            ★
          </button>
        </view>
        <view class="tag-row edit-tags">
          <button
            v-for="tag in reviewTags"
            :key="tag"
            class="edit-tag ss-reset-button"
            :class="{ active: form.tags.includes(tag) }"
            @tap="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </view>
        <textarea v-model="form.content" placeholder="说说本次沟通或试课体验" maxlength="500" />
        <view class="modal-actions">
          <button class="ghost-btn ss-reset-button" @tap="state.showReviewModal = false"
            >取消</button
          >
          <button class="primary-btn ss-reset-button" @tap="submitReview">提交评价</button>
        </view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import TutorInteractionApi from '@/sheep/api/tutor/interaction';
  import {
    addLocalReview,
    confirmLocalMatch,
    getLocalItem,
    getLocalMatches,
    getLocalReviews,
    getTargetType,
    getUiType,
    isNumericId,
    targetKey,
  } from '@/sheep/api/tutor/local-state';
  import { formatDateTime, normalizeDemand, normalizeResume } from '@/sheep/api/tutor/utils';

  const activeTab = ref('matches');
  const reviewTags = ['沟通顺畅', '信息真实', '耐心负责', '反馈及时', '效果明显'];
  const state = reactive({
    loading: false,
    matches: [],
    reviews: [],
    currentMatch: null,
    showReviewModal: false,
  });
  const form = reactive({
    rating: 5,
    tags: [],
    content: '',
  });

  const matches = computed(() => state.matches);
  const reviews = computed(() => state.reviews);
  const tabs = computed(() => [
    { label: '匹配确认', value: 'matches', count: matches.value.length },
    { label: '我的评价', value: 'reviews', count: reviews.value.length },
  ]);
  const fiveStarCount = computed(
    () => reviews.value.filter((item) => Number(item.rating) === 5).length,
  );
  const reviewedMatchIds = computed(() => new Set(reviews.value.map((item) => String(item.matchId))));
  const avgRating = computed(() => {
    if (!reviews.value.length) return '0.0';
    const total = reviews.value.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / reviews.value.length).toFixed(1);
  });

  function normalizeMatch(item, index = 0) {
    const targetType = item.targetType || (item.resumeId ? 'resume' : 'demand');
    const targetId = item.targetId || item.resumeId || item.demandId || item.id;
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
      id: item.id || item.matchId,
      targetId,
      targetType,
      key: item.key || targetKey(targetType, targetId),
      title: item.title || normalized.title || normalized.name,
    };
  }

  function normalizeReview(item) {
    return {
      ...item,
      targetTitle: item.targetTitle || `匹配 #${item.matchId}`,
    };
  }

  async function load() {
    state.loading = true;
    const localMatches = getLocalMatches().map(normalizeMatch);
    const matchResult = await TutorInteractionApi.getMatchList();
    state.matches =
      matchResult?.code === 0 ? (matchResult.data || []).map(normalizeMatch) : localMatches;

    const localReviews = getLocalReviews().map(normalizeReview);
    const reviewResult = await TutorInteractionApi.getMyReviewList();
    state.reviews =
      reviewResult?.code === 0
        ? [...(reviewResult.data || []).map(normalizeReview), ...localReviews]
        : localReviews;
    state.loading = false;
  }

  function isMatched(item) {
    return Number(item.status) === 40 || Boolean(item.matchedTime);
  }

  function isReviewed(item) {
    return reviewedMatchIds.value.has(String(item.id));
  }

  function targetTitle(item) {
    return item.targetType === 'resume'
      ? `教师简历 #${item.targetId}`
      : `家长需求 #${item.targetId}`;
  }

  function formatDate(value) {
    return formatDateTime(value);
  }

  function goDetail(item) {
    uni.navigateTo({
      url: `/pages/tutor/detail/index?type=${getUiType(item.targetType)}&targetType=${getTargetType(
        item.targetType,
      )}&id=${item.targetId}`,
    });
  }

  async function handleMatchAction(item) {
    if (isReviewed(item)) {
      return;
    }
    if (isMatched(item)) {
      openReview(item);
      return;
    }
    if (!item.local && isNumericId(item.id)) {
      const result = await TutorInteractionApi.confirmMatch(item.id);
      if (result?.code !== 0) {
        uni.showToast({ title: result?.msg || '确认失败', icon: 'none' });
        return;
      }
      Object.assign(item, result.data, { statusName: result.data?.statusName || '已确认' });
    } else {
      const updated = confirmLocalMatch(item.id || item.key);
      Object.assign(item, updated || {}, { statusName: '匹配成功' });
    }
    if (isMatched(item)) {
      uni.showToast({ title: '匹配已确认', icon: 'none' });
      openReview(item);
    } else {
      uni.showToast({ title: '已确认，等待对方确认后可评价', icon: 'none' });
    }
  }

  function openReview(item) {
    state.currentMatch = item;
    form.rating = 5;
    form.tags = [];
    form.content = '';
    state.showReviewModal = true;
  }

  function toggleTag(tag) {
    const index = form.tags.indexOf(tag);
    if (index >= 0) {
      form.tags.splice(index, 1);
      return;
    }
    form.tags.push(tag);
  }

  async function submitReview() {
    if (!state.currentMatch) return;
    if (isReviewed(state.currentMatch)) {
      uni.showToast({ title: '已评价，请勿重复提交', icon: 'none' });
      state.showReviewModal = false;
      return;
    }
    const payload = {
      matchId: state.currentMatch.id,
      rating: form.rating,
      tags: form.tags.join(','),
      content: form.content,
      anonymousDisplay: false,
      targetTitle: state.currentMatch.title || state.currentMatch.name,
    };
    if (!state.currentMatch.local && isNumericId(state.currentMatch.id)) {
      const result = await TutorInteractionApi.createReview(payload);
      if (result?.code !== 0) {
        uni.showToast({ title: result?.msg || '评价失败', icon: 'none' });
        return;
      }
      state.reviews.unshift(normalizeReview(result.data || payload));
    } else {
      state.reviews.unshift(addLocalReview(payload));
    }
    state.showReviewModal = false;
    activeTab.value = 'reviews';
    uni.showToast({
      title: form.rating === 5 ? '评价已提交，五星奖励待入账' : '评价已提交',
      icon: 'none',
    });
  }

  onShow(load);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f8fafc;
  }

  .tabs {
    display: flex;
    gap: 10rpx;
    margin: 24rpx;
    padding: 8rpx;
    border-radius: 16rpx;
    background: #e2e8f0;
  }

  .tab {
    flex: 1;
    height: 68rpx;
    border-radius: 12rpx;
    color: #64748b;
    font-size: 26rpx;
    font-weight: 800;
  }

  .tab.active {
    color: #2563eb;
    background: #ffffff;
  }

  .content {
    padding-bottom: 24rpx;
  }

  .tip-card,
  .score-card,
  .match-card,
  .review-card,
  .state-card {
    margin: 24rpx;
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .tip-card {
    padding: 20rpx 24rpx;
    color: #1d4ed8;
    background: #eff6ff;
    border-color: #bfdbfe;
    font-size: 24rpx;
    line-height: 38rpx;
  }

  .score-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx;
  }

  .score {
    color: #f97316;
    font-size: 54rpx;
    font-weight: 900;
  }

  .subtitle,
  .meta,
  .content-text {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 38rpx;
  }

  .score-stats {
    color: #64748b;
    font-size: 24rpx;
    line-height: 44rpx;
    text-align: right;
  }

  .match-card,
  .review-card {
    padding: 26rpx;
  }

  .match-head,
  .actions,
  .review-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
  }

  .name {
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
  }

  .status,
  .rating {
    flex-shrink: 0;
    color: #f97316;
    font-size: 24rpx;
    font-weight: 900;
  }

  .status.success {
    color: #16a34a;
  }

  .match-info {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 20rpx;
  }

  .match-info text,
  .tag-row text {
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 22rpx;
  }

  .actions {
    margin-top: 22rpx;
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

  .primary-btn.done {
    color: #64748b;
    background: #e2e8f0;
  }

  .stars {
    margin-top: 12rpx;
    color: #cbd5e1;
    font-size: 28rpx;
  }

  .stars text.active {
    color: #f59e0b;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 14rpx;
  }

  .state-card {
    padding: 48rpx;
    color: #64748b;
    text-align: center;
  }

  .empty-wrap {
    padding-top: 80rpx;
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

  .modal-title {
    color: #0f172a;
    font-size: 34rpx;
    font-weight: 900;
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

  .edit-tags {
    margin-top: 0;
  }

  .edit-tag {
    height: 58rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 24rpx;
  }

  .edit-tag.active {
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

  .modal-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 24rpx;
  }
</style>
