<template>
  <s-layout class="page" title="" navbar="">
    <view class="filter-shell">
      <view class="filter-header">
        <button class="icon-btn ss-reset-button" @tap="goBack">
          <text class="cicon-close"></text>
        </button>
        <view class="header-title">筛选</view>
        <button class="reset-link ss-reset-button" @tap="reset">重置</button>
      </view>

      <scroll-view class="filter-scroll" scroll-y>
        <view class="section">
          <view class="section-title">服务类型</view>
          <view class="grid three">
            <button
              v-for="item in targetTypes"
              :key="item.value"
              class="option ss-reset-button"
              :class="{ active: form.targetType === item.value }"
              @tap="form.targetType = item.value"
            >
              {{ item.label }}
            </button>
          </view>
        </view>

        <view class="section">
          <view class="section-title">科目</view>
          <view class="chip-row">
            <button
              v-for="subject in subjects"
              :key="subject"
              class="chip ss-reset-button"
              :class="{ active: form.subjects.includes(subject) }"
              @tap="toggleArray('subjects', subject)"
            >
              {{ subject }}
              <text v-if="form.subjects.includes(subject)" class="cicon-check-round"></text>
            </button>
          </view>
        </view>

        <view class="section">
          <view class="section-title">年级</view>
          <view class="chip-row">
            <button
              v-for="grade in grades"
              :key="grade"
              class="chip ss-reset-button"
              :class="{ active: form.grades.includes(grade) }"
              @tap="toggleArray('grades', grade)"
            >
              {{ grade }}
              <text v-if="form.grades.includes(grade)" class="cicon-check-round"></text>
            </button>
          </view>
        </view>

        <view class="section">
          <view class="section-title">授课方式</view>
          <view class="grid two">
            <button
              v-for="mode in modes"
              :key="mode.value"
              class="option ss-reset-button"
              :class="{ active: form.modes.includes(mode.value) }"
              @tap="toggleArray('modes', mode.value)"
            >
              {{ mode.label }}
            </button>
          </view>
        </view>

        <view class="section">
          <view class="section-title">价格区间</view>
          <view class="price-row">
            <input v-model="form.priceMin" type="number" placeholder="最低" />
            <text>-</text>
            <input v-model="form.priceMax" type="number" placeholder="最高" />
            <text class="unit">元/时</text>
          </view>
        </view>

        <view class="section">
          <view class="section-title">距离范围</view>
          <view class="grid three">
            <button
              v-for="distance in distances"
              :key="distance.value"
              class="option ss-reset-button"
              :class="{ active: form.distanceKm === distance.value }"
              @tap="form.distanceKm = distance.value"
            >
              {{ distance.label }}
            </button>
          </view>
        </view>

        <view class="section">
          <view class="section-title">排序</view>
          <view class="grid three">
            <button
              v-for="sort in sorts"
              :key="sort.value"
              class="option ss-reset-button"
              :class="{ active: form.sortType === sort.value }"
              @tap="form.sortType = sort.value"
            >
              {{ sort.label }}
            </button>
          </view>
        </view>

        <view class="section switch-section">
          <button class="switch-row ss-reset-button" @tap="form.certified = !form.certified">
            <view>
              <view class="switch-title">仅看认证教师</view>
              <view class="switch-desc">优先展示已通过平台认证的老师</view>
            </view>
            <view class="switch" :class="{ active: form.certified }">
              <view></view>
            </view>
          </button>
          <view class="line"></view>
          <button
            class="switch-row ss-reset-button"
            @tap="form.freeTrialEnabled = !form.freeTrialEnabled"
          >
            <view>
              <view class="switch-title">支持试课</view>
              <view class="switch-desc">筛选提供试课或试听的老师</view>
            </view>
            <view class="switch" :class="{ active: form.freeTrialEnabled }">
              <view></view>
            </view>
          </button>
        </view>
      </scroll-view>

      <view class="footer">
        <button class="ghost-btn ss-reset-button" @tap="reset">重置</button>
        <button class="primary-btn ss-reset-button" @tap="apply">
          查看结果
          <text v-if="activeFilterCount" class="count">{{ activeFilterCount }}</text>
        </button>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import { tutorGradeOptions, tutorSubjectOptions } from '@/sheep/api/tutor/utils';

  const targetTypes = [
    { label: '全部', value: 'all' },
    { label: '找老师', value: 'tutor' },
    { label: '找家长', value: 'req' },
  ];

  const subjects = [...tutorSubjectOptions, '政治', '历史', '地理'];

  const grades = ['学龄前', ...tutorGradeOptions, '初一', '初二', '初三', '高一', '高二', '高三'];

  const modes = [
    { label: '上门', value: 'offline' },
    { label: '在线', value: 'online' },
    { label: '均可', value: 'both' },
  ];

  const distances = [
    { label: '1公里内', value: 1 },
    { label: '3公里内', value: 3 },
    { label: '5公里内', value: 5 },
    { label: '10公里内', value: 10 },
    { label: '不限', value: 999 },
  ];

  const sorts = [
    { label: '综合', value: 'default' },
    { label: '最新', value: 'latest' },
    { label: '距离最近', value: 'distance' },
  ];

  const defaultForm = {
    targetType: 'all',
    subjects: [],
    grades: [],
    modes: [],
    priceMin: '',
    priceMax: '',
    distanceKm: 999,
    certified: false,
    freeTrialEnabled: false,
    sortType: 'default',
  };

  const form = reactive({ ...defaultForm });

  const activeFilterCount = computed(() => {
    return (
      (form.targetType !== 'all' ? 1 : 0) +
      form.subjects.length +
      form.grades.length +
      form.modes.length +
      (form.priceMin || form.priceMax ? 1 : 0) +
      (form.distanceKm !== 999 ? 1 : 0) +
      (form.certified ? 1 : 0) +
      (form.freeTrialEnabled ? 1 : 0) +
      (form.sortType !== 'default' ? 1 : 0)
    );
  });

  function hydrate(saved = {}) {
    Object.assign(form, {
      ...defaultForm,
      ...saved,
      subjects: Array.isArray(saved.subjects)
        ? saved.subjects
        : saved.subject
        ? [saved.subject]
        : [],
      grades: Array.isArray(saved.grades) ? saved.grades : saved.grade ? [saved.grade] : [],
      modes: Array.isArray(saved.modes)
        ? saved.modes
        : saved.mode && saved.mode !== 'all'
        ? [saved.mode]
        : [],
      distanceKm: saved.distanceKm || defaultForm.distanceKm,
    });
  }

  function toggleArray(key, value) {
    const list = form[key];
    const index = list.indexOf(value);
    if (index >= 0) {
      list.splice(index, 1);
      return;
    }
    list.push(value);
  }

  function reset() {
    hydrate({});
  }

  function goBack() {
    uni.navigateBack();
  }

  function apply() {
    const filters = {
      ...form,
      subjects: [...form.subjects],
      grades: [...form.grades],
      modes: [...form.modes],
    };
    uni.setStorageSync('tutor_filter', filters);
    uni.$emit('tutor-filter-updated', filters);
    uni.navigateBack();
  }

  onLoad(() => {
    hydrate(uni.getStorageSync('tutor_filter') || {});
  });
</script>

<style lang="scss" scoped>
  .page,
  .filter-shell {
    min-height: 100vh;
    background: #f8fafc;
  }

  .filter-shell {
    display: flex;
    flex-direction: column;
  }

  .filter-header {
    height: calc(var(--status-bar-height) + 92rpx);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--status-bar-height) 24rpx 0;
    box-sizing: border-box;
    background: #ffffff;
    border-bottom: 1px solid #eef2f7;
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

  .header-title {
    color: #0f172a;
    font-size: 34rpx;
    font-weight: 900;
  }

  .reset-link {
    min-width: 64rpx;
    color: #64748b;
    font-size: 25rpx;
  }

  .filter-scroll {
    flex: 1;
    height: 0;
    padding-bottom: 160rpx;
    box-sizing: border-box;
  }

  .section {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 16rpx;
    background: #ffffff;
    border: 1px solid #e8eef0;
  }

  .section-title {
    margin-bottom: 18rpx;
    color: #0f172a;
    font-size: 28rpx;
    font-weight: 900;
  }

  .grid {
    display: grid;
    gap: 14rpx;
  }

  .grid.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .grid.two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .option,
  .chip {
    min-height: 68rpx;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    border-radius: 999rpx;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 25rpx;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .chip {
    padding: 0 22rpx;
  }

  .option.active,
  .chip.active {
    color: #ffffff;
    background: #2563eb;
    border-color: #2563eb;
  }

  .price-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
    color: #94a3b8;
  }

  .price-row input {
    min-width: 0;
    flex: 1;
    height: 76rpx;
    padding: 0 20rpx;
    border-radius: 12rpx;
    color: #0f172a;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 26rpx;
  }

  .unit {
    flex-shrink: 0;
    color: #64748b;
    font-size: 24rpx;
  }

  .switch-section {
    padding: 0;
    overflow: hidden;
  }

  .switch-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding: 26rpx;
    text-align: left;
  }

  .switch-title {
    color: #0f172a;
    font-size: 28rpx;
    font-weight: 800;
  }

  .switch-desc {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 23rpx;
  }

  .switch {
    width: 88rpx;
    height: 48rpx;
    padding: 4rpx;
    border-radius: 999rpx;
    background: #cbd5e1;
    box-sizing: border-box;
    transition: all 0.18s ease;
  }

  .switch view {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 4rpx 10rpx rgba(15, 23, 42, 0.15);
    transition: all 0.18s ease;
  }

  .switch.active {
    background: #2563eb;
  }

  .switch.active view {
    transform: translateX(40rpx);
  }

  .line {
    height: 1px;
    margin: 0 26rpx;
    background: #eef2f7;
  }

  .footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    gap: 16rpx;
    padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
    background: #ffffff;
    border-top: 1px solid #eef2f7;
    box-sizing: border-box;
  }

  .ghost-btn,
  .primary-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 999rpx;
    font-size: 28rpx;
    font-weight: 800;
  }

  .ghost-btn {
    color: #334155;
    background: #f1f5f9;
  }

  .primary-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    color: #ffffff;
    background: #2563eb;
    box-shadow: 0 14rpx 28rpx rgba(37, 99, 235, 0.22);
  }

  .count {
    min-width: 34rpx;
    height: 34rpx;
    line-height: 34rpx;
    border-radius: 999rpx;
    color: #2563eb;
    background: #ffffff;
    font-size: 21rpx;
  }
</style>
