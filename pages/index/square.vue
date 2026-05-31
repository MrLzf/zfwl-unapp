<template>
  <s-layout title="" navbar="" tabbar="/pages/index/square" class="square-page">
    <view class="square-shell">
      <view class="top-bar">
        <view>
          <view class="page-title">{{ pageTitle }}</view>
          <view class="page-subtitle">{{ city.name || '杭州' }} · 同城高匹配信息</view>
        </view>
        <button class="city-btn ss-reset-button" @tap="goCity">
          <text class="cicon-location-on"></text>
          <text>{{ city.name || '切换' }}</text>
        </button>
      </view>

      <view v-if="!isLogin" class="login-gate">
        <view class="gate-icon"><text class="cicon-lock"></text></view>
        <view class="gate-title">登录后查看同城家教信息</view>
        <view class="gate-desc">登录后可根据您的身份查看老师简历或家长需求。</view>
        <button class="state-btn ss-reset-button" @tap="showLogin">立即登录 / 注册</button>
      </view>

      <template v-else-if="!profile?.role">
        <view class="login-gate">
          <view class="gate-icon"><text class="cicon-my"></text></view>
          <view class="gate-title">先选择身份</view>
          <view class="gate-desc">家长可查看老师列表，教师可查看家教需求列表。</view>
          <button class="state-btn ss-reset-button" @tap="goIdentity">去选择身份</button>
        </view>
      </template>

      <template v-else>
        <view class="filter-card">
          <view class="search-box">
            <text class="cicon-search"></text>
            <input
              v-model="keyword"
              placeholder="搜索科目、年级、区域"
              confirm-type="search"
              @confirm="reload"
            />
          </view>

          <view class="dropdown-row">
            <button class="dropdown-btn ss-reset-button" @tap="openPicker('subject')">
              {{ activeSubject || '学科' }}
              <text class="cicon-drop-down"></text>
            </button>
            <button class="dropdown-btn ss-reset-button" @tap="openPicker('distance')">
              {{ distanceText }}
              <text class="cicon-drop-down"></text>
            </button>
            <button class="dropdown-btn ss-reset-button" @tap="openPicker('sort')">
              {{ sortText }}
              <text class="cicon-drop-down"></text>
            </button>
            <button
              class="advanced-btn ss-reset-button"
              :class="{ active: activeFilterCount }"
              @tap="goFilter"
            >
              <text class="cicon-filter"></text>
              <text>筛选</text>
              <text v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</text>
            </button>
          </view>
        </view>

        <view v-if="state.usingMock && displayItems.length" class="offline-tip">
          当前展示本地示例数据，服务恢复后会自动同步最新信息。
        </view>

        <view v-if="state.errorMsg && !displayItems.length" class="state-card">
          <view class="state-icon danger"><text class="cicon-warn"></text></view>
          <view class="state-title">加载失败</view>
          <view class="state-desc">{{ state.errorMsg }}</view>
          <button class="state-btn ss-reset-button" @tap="reload">重新加载</button>
        </view>

        <view v-else-if="state.loading && !displayItems.length" class="skeleton-list">
          <view v-for="item in 4" :key="item" class="skeleton-card"></view>
        </view>

        <view v-else-if="displayItems.length" class="list">
          <view
            v-for="(item, index) in displayItems"
            :key="`${item.type}-${item.id}-${index}`"
            class="result-card"
            :class="{ urgent: item.urgent }"
            @tap="goDetail(item)"
          >
            <view class="result-top">
              <image class="avatar" :src="item.avatar" mode="aspectFill" />
              <view class="result-main">
                <view class="title-row">
                  <text class="result-title">{{
                    item.type === 'tutor' ? item.name : item.title
                  }}</text>
                  <text v-if="item.urgent" class="urgent-tag">加急</text>
                  <text v-if="item.verified" class="verify-tag">认证</text>
                </view>
                <view class="result-meta">
                  {{ item.district }} · {{ formatDistance(item.distance) }} ·
                  {{ modeText(item.mode) }}
                </view>
                <view class="tag-row">
                  <text>{{ item.grade || item.education }}</text>
                  <text v-for="subject in item.subjects" :key="subject">{{ subject }}</text>
                  <text v-if="item.hasFreeTrial">试课</text>
                </view>
              </view>
              <view class="price">
                <text>¥{{ item.budget || item.price }}</text>
                <text>/时</text>
              </view>
            </view>
            <view v-if="item.type === 'req' && item.address" class="result-desc">
              上课地址：{{ item.address }}
            </view>
            <view class="result-desc">{{ item.description }}</view>
            <view class="result-foot">
              <view class="mini-user">
                <text class="cicon-time"></text>
                <text>{{ item.createdAt }}</text>
              </view>
              <view class="mini-user">
                <text class="cicon-location-on"></text>
                <text>{{ item.city || city.name || '同城' }}</text>
              </view>
            </view>
          </view>
        </view>

        <s-empty v-else text="暂无符合条件的信息" icon="/static/data-empty.png" />

        <uni-load-more
          v-if="displayItems.length"
          :status="state.loadStatus"
          :content-text="{
            contentdown: '上拉加载更多',
            contentrefresh: '加载中',
            contentnomore: '没有更多了',
          }"
          @tap="loadMore"
        />
      </template>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { showAuthModal } from '@/sheep/hooks/useModal';
  import TutorMarketApi from '@/sheep/api/tutor/market';
  import { getCachedLocation, getLocationPayload } from '@/sheep/api/tutor/location';
  import { tutorItems, tutorSubjects } from '@/sheep/api/tutor/mock-data';
  import {
    formatDistance,
    getPageList,
    modeKey,
    modeText,
    normalizeDemand,
    normalizeResume,
    TUTOR_ROLE,
  } from '@/sheep/api/tutor/utils';

  const userStore = sheep.$store('user');
  const isLogin = computed(() => userStore.isLogin);
  const profile = computed(() => userStore.tutorProfile);
  const isTeacher = computed(() => userStore.tutorProfile?.role === TUTOR_ROLE.TEACHER);
  const targetType = computed(() => (isTeacher.value ? 'req' : 'tutor'));

  const keyword = ref('');
  const activeSubject = ref('');
  const activeDistance = ref(999);
  const activeSort = ref('default');
  const city = ref({});
  const filters = ref({});
  const lastQueryKey = ref('');

  const state = reactive({
    list: [],
    loading: false,
    errorMsg: '',
    pageNo: 1,
    pageSize: 8,
    total: 0,
    loadStatus: 'more',
    usingMock: false,
  });

  const pageTitle = computed(() => (isTeacher.value ? '需求广场' : '老师广场'));

  const distanceText = computed(() =>
    activeDistance.value === 999 ? '距离' : `${activeDistance.value}km内`,
  );
  const sortText = computed(() => {
    return { default: '排序', latest: '最新', distance: '距离最近' }[activeSort.value] || '排序';
  });

  const activeFilterCount = computed(() => {
    const advanced = filters.value || {};
    return (
      (advanced.targetType && advanced.targetType !== 'all' ? 1 : 0) +
      (advanced.subjects?.length || 0) +
      (advanced.grades?.length || 0) +
      (advanced.modes?.length || 0) +
      (advanced.priceMin || advanced.priceMax ? 1 : 0) +
      (advanced.distanceKm && advanced.distanceKm !== 999 ? 1 : 0) +
      (advanced.certified ? 1 : 0) +
      (advanced.freeTrialEnabled ? 1 : 0) +
      (advanced.sortType && advanced.sortType !== 'default' ? 1 : 0)
    );
  });

  const displayItems = computed(() => {
    const key = keyword.value.trim();
    if (!key) return state.list;
    return state.list.filter((item) =>
      [
        item.title,
        item.name,
        item.grade,
        item.education,
        item.district,
        item.city,
        ...(item.subjects || []),
      ]
        .filter(Boolean)
        .some((text) => String(text).includes(key)),
    );
  });

  function openPicker(type) {
    if (type === 'subject') {
      uni.showActionSheet({
        itemList: ['全部', ...tutorSubjects.slice(0, 5)],
        success: ({ tapIndex }) => {
          activeSubject.value = tapIndex === 0 ? '' : tutorSubjects.slice(0, 5)[tapIndex - 1];
          reload();
        },
      });
      return;
    }
    if (type === 'distance') {
      const labels = ['全部', '1km内', '3km内', '5km内', '10km内'];
      const values = [999, 1, 3, 5, 10];
      uni.showActionSheet({
        itemList: labels,
        success: ({ tapIndex }) => {
          activeDistance.value = values[tapIndex];
          reload();
        },
      });
      return;
    }
    const labels = ['综合排序', '最新发布', '距离最近'];
    const values = ['default', 'latest', 'distance'];
    uni.showActionSheet({
      itemList: labels,
      success: ({ tapIndex }) => {
        activeSort.value = values[tapIndex];
        reload();
      },
    });
  }

  function goCity() {
    uni.navigateTo({ url: '/pages/tutor/city/index' });
  }

  function goIdentity() {
    uni.navigateTo({ url: '/pages/tutor/identity/index' });
  }

  function goFilter() {
    uni.navigateTo({ url: '/pages/tutor/filter/index' });
  }

  function showLogin() {
    showAuthModal();
  }

  function goDetail(item) {
    uni.navigateTo({
      url: `/pages/tutor/detail/index?type=${item.type}&targetType=${item.targetType}&id=${item.id}`,
    });
  }

  function getTeachMode() {
    const modes = filters.value?.modes || [];
    if (modes.length !== 1) return undefined;
    return { offline: 1, online: 2, both: 3 }[modeKey(modes[0])];
  }

  function buildParams(targetType) {
    const advanced = filters.value || {};
    const currentCity = city.value || {};
    const location = getLocationPayload(currentCity);
    const distanceKm =
      activeDistance.value !== 999
        ? activeDistance.value
        : advanced.distanceKm !== 999
        ? advanced.distanceKm
        : undefined;
    return {
      pageNo: state.pageNo,
      pageSize: state.pageSize,
      cityCode: currentCity.code,
      subject: activeSubject.value || advanced.subjects?.[0],
      grade: targetType === 'req' ? advanced.grades?.[0] : undefined,
      teachMode: getTeachMode(),
      priceMin: advanced.priceMin,
      priceMax: advanced.priceMax,
      distanceKm,
      certified: targetType === 'tutor' ? advanced.certified || undefined : undefined,
      freeTrialEnabled: targetType === 'tutor' ? advanced.freeTrialEnabled || undefined : undefined,
      sortType: activeSort.value !== 'default' ? activeSort.value : advanced.sortType,
      longitude: location.longitude,
      latitude: location.latitude,
    };
  }

  function getQueryKey() {
    const location = getCachedLocation();
    return JSON.stringify({
      city: city.value?.code,
      longitude: location.longitude,
      latitude: location.latitude,
      filters: filters.value,
      type: targetType.value,
      subject: activeSubject.value,
      distance: activeDistance.value,
      sort: activeSort.value,
    });
  }

  function normalizePageResult(result, type) {
    const list = getPageList(result?.data).map((item, index) =>
      type === 'tutor' ? normalizeResume(item, index) : normalizeDemand(item, index),
    );
    return {
      list,
      total: Number(result?.data?.total ?? list.length),
    };
  }

  async function fetchRemoteList() {
    if (targetType.value === 'req') {
      const result = await TutorMarketApi.getDemandPage(buildParams('req'));
      return result?.code === 0 ? normalizePageResult(result, 'req') : null;
    }
    const result = await TutorMarketApi.getResumePage(buildParams('tutor'));
    return result?.code === 0 ? normalizePageResult(result, 'tutor') : null;
  }

  function fetchLocalList() {
    let list = tutorItems.map((item, index) =>
      item.type === 'tutor' ? normalizeResume(item, index) : normalizeDemand(item, index),
    );
    const advanced = filters.value || {};
    list = list.filter((item) => item.type === targetType.value);
    if (activeSubject.value)
      list = list.filter((item) => item.subjects.includes(activeSubject.value));
    if (advanced.subjects?.length) {
      list = list.filter((item) =>
        advanced.subjects.some((subject) => item.subjects.includes(subject)),
      );
    }
    if (advanced.grades?.length) {
      list = list.filter((item) =>
        advanced.grades.some((grade) => String(item.grade || '').includes(grade)),
      );
    }
    if (advanced.modes?.length) {
      list = list.filter((item) => {
        const key = modeKey(item.mode);
        return advanced.modes.some((mode) => mode === 'both' || key === mode || key === 'both');
      });
    }
    if (advanced.priceMin || advanced.priceMax) {
      const min = Number(advanced.priceMin || 0);
      const max = Number(advanced.priceMax || 99999);
      list = list.filter(
        (item) =>
          Number(item.budget || item.price || 0) >= min &&
          Number(item.budget || item.price || 0) <= max,
      );
    }
    const distanceLimit =
      activeDistance.value !== 999
        ? activeDistance.value
        : advanced.distanceKm !== 999
        ? advanced.distanceKm
        : undefined;
    if (distanceLimit)
      list = list.filter((item) => Number(item.distance || 999) <= Number(distanceLimit));
    if (advanced.certified) list = list.filter((item) => item.type !== 'tutor' || item.verified);
    if (advanced.freeTrialEnabled)
      list = list.filter((item) => item.type !== 'tutor' || item.hasFreeTrial);
    const sortType = activeSort.value !== 'default' ? activeSort.value : advanced.sortType;
    if (sortType === 'distance')
      list.sort((a, b) => Number(a.distance || 999) - Number(b.distance || 999));
    if (sortType === 'latest')
      list.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    const start = (state.pageNo - 1) * state.pageSize;
    const end = start + state.pageSize;
    return {
      list: list.slice(start, end),
      total: list.length,
    };
  }

  async function loadList(refresh = false) {
    if (state.loading) return;
    if (refresh) {
      state.pageNo = 1;
      state.loadStatus = 'more';
    }
    state.loading = true;
    state.errorMsg = '';
    try {
      const page = await fetchRemoteList();
      const data = page || fetchLocalList();
      state.usingMock = !page;
      state.list = refresh ? data.list : [...state.list, ...data.list];
      state.total = data.total;
      state.loadStatus = state.list.length < state.total ? 'more' : 'noMore';
      if (!page && !data.list.length) {
        state.errorMsg = '暂时无法连接服务，请稍后重试';
      }
    } catch (error) {
      const data = fetchLocalList();
      state.usingMock = true;
      state.list = refresh ? data.list : [...state.list, ...data.list];
      state.total = data.total;
      state.loadStatus = state.list.length < state.total ? 'more' : 'noMore';
      if (!data.list.length) {
        state.errorMsg = '网络请求出错，请稍后重试';
      }
    } finally {
      state.loading = false;
    }
  }

  function loadContext() {
    city.value = uni.getStorageSync('tutor_city') || {};
    filters.value = uni.getStorageSync('tutor_filter') || {};
  }

  function reload() {
    state.list = [];
    if (!isLogin.value || !profile.value?.role) {
      return;
    }
    loadList(true);
  }

  function loadMore() {
    if (state.loading || state.loadStatus === 'noMore') return;
    state.pageNo += 1;
    loadList(false);
  }

  onShow(() => {
    loadContext();
    const queryKey = getQueryKey();
    if (queryKey !== lastQueryKey.value || !state.list.length) {
      lastQueryKey.value = queryKey;
      reload();
    }
  });

  onPullDownRefresh(async () => {
    loadContext();
    await loadList(true);
    uni.stopPullDownRefresh();
  });

  onReachBottom(loadMore);
</script>

<style lang="scss" scoped>
  .square-page,
  .square-shell {
    min-height: 100vh;
    background: #f8fafc;
  }

  .square-shell {
    padding: calc(var(--status-bar-height) + 24rpx) 24rpx 28rpx;
  }

  .top-bar,
  .result-top,
  .title-row,
  .result-foot,
  .dropdown-row,
  .mini-user {
    display: flex;
    align-items: center;
  }

  .top-bar {
    justify-content: space-between;
  }

  .page-title {
    color: #0f172a;
    font-size: 42rpx;
    font-weight: 900;
  }

  .page-subtitle {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
  }

  .city-btn {
    height: 62rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 24rpx;
    font-weight: 700;
  }

  .filter-card {
    margin-top: 28rpx;
    padding: 20rpx;
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .search-box {
    height: 76rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 0 22rpx;
    border-radius: 14rpx;
    background: #f1f5f9;
    color: #64748b;
  }

  .search-box input {
    flex: 1;
    height: 76rpx;
    color: #0f172a;
    font-size: 26rpx;
  }

  .dropdown-row {
    gap: 14rpx;
    margin-top: 18rpx;
  }

  .dropdown-btn,
  .advanced-btn {
    height: 58rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    color: #475569;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    font-size: 24rpx;
  }

  .dropdown-btn {
    flex: 1;
  }

  .advanced-btn {
    position: relative;
    color: #2563eb;
    background: #eff6ff;
    border-color: #bfdbfe;
  }

  .advanced-btn.active {
    color: #ffffff;
    background: #2563eb;
    border-color: #2563eb;
  }

  .filter-count {
    min-width: 30rpx;
    height: 30rpx;
    line-height: 30rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #ffffff;
    font-size: 20rpx;
  }

  .list,
  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }

  .offline-tip {
    margin-bottom: 18rpx;
    padding: 16rpx 20rpx;
    border-radius: 12rpx;
    color: #1d4ed8;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    font-size: 23rpx;
    line-height: 34rpx;
  }

  .result-card,
  .state-card,
  .login-gate,
  .skeleton-card {
    padding: 24rpx;
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .result-card {
    transition: transform 0.16s ease;
  }

  .result-card:active {
    transform: scale(0.98);
  }

  .result-card.urgent {
    border-color: #fed7aa;
    box-shadow: 0 10rpx 26rpx rgba(249, 115, 22, 0.08);
  }

  .avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 48rpx;
    flex-shrink: 0;
    background: #e5e7eb;
  }

  .result-main {
    min-width: 0;
    flex: 1;
    margin: 0 16rpx;
  }

  .title-row {
    gap: 10rpx;
  }

  .result-title {
    overflow: hidden;
    color: #0f172a;
    font-size: 30rpx;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .urgent-tag,
  .verify-tag {
    flex-shrink: 0;
    padding: 3rpx 10rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
    font-weight: 700;
  }

  .urgent-tag {
    color: #ea580c;
    background: #ffedd5;
  }

  .verify-tag {
    color: #2563eb;
    background: #eff6ff;
  }

  .result-meta {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: #f97316;
    white-space: nowrap;
  }

  .price text:first-child {
    font-size: 30rpx;
    font-weight: 900;
  }

  .price text:last-child {
    margin-top: 2rpx;
    color: #94a3b8;
    font-size: 20rpx;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 14rpx;
  }

  .tag-row text {
    padding: 6rpx 12rpx;
    border-radius: 8rpx;
    color: #2563eb;
    background: #eff6ff;
    font-size: 21rpx;
  }

  .result-desc {
    display: -webkit-box;
    overflow: hidden;
    margin-top: 20rpx;
    color: #475569;
    font-size: 25rpx;
    line-height: 38rpx;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .result-foot {
    justify-content: space-between;
    margin-top: 20rpx;
    padding-top: 18rpx;
    border-top: 1px solid #f1f5f9;
  }

  .mini-user {
    gap: 6rpx;
    color: #94a3b8;
    font-size: 22rpx;
  }

  .state-card,
  .login-gate {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48rpx 34rpx;
    text-align: center;
  }

  .state-icon,
  .gate-icon {
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #2563eb;
    background: #eff6ff;
    font-size: 40rpx;
  }

  .state-icon.danger {
    color: #dc2626;
    background: #fef2f2;
  }

  .state-title,
  .gate-title {
    margin-top: 20rpx;
    color: #0f172a;
    font-size: 31rpx;
    font-weight: 900;
  }

  .state-desc,
  .gate-desc {
    margin-top: 10rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 38rpx;
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

  .skeleton-card {
    height: 230rpx;
    background: linear-gradient(90deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%);
    background-size: 200% 100%;
    animation: pulse 1.2s infinite linear;
  }

  @keyframes pulse {
    from {
      background-position: 100% 0;
    }
    to {
      background-position: -100% 0;
    }
  }
</style>
