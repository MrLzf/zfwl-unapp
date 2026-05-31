<template>
  <view v-if="tabbarItems.length" class="tutor-tabbar-wrap">
    <view class="tutor-tabbar" :style="tabbarStyle">
      <button
        v-for="item in tabbarItems"
        :key="item.url"
        class="tabbar-item ss-reset-button"
        :class="{ active: isActive(item), center: item.center }"
        @tap="goTab(item)"
      >
        <view v-if="item.center" class="center-bubble">
          <text :class="item.activeIcon || item.icon"></text>
        </view>
        <template v-else>
          <text
            class="tabbar-icon"
            :class="isActive(item) ? item.activeIcon || item.icon : item.icon"
          ></text>
        </template>
        <text class="tabbar-text">{{ item.text }}</text>
      </button>
    </view>
    <view class="tabbar-placeholder"></view>
  </view>
</template>

<script setup>
  import { computed } from 'vue';
  import sheep from '@/sheep';

  const props = defineProps({
    path: {
      type: String,
      default: '',
    },
  });

  const fallbackItems = [
    {
      text: '首页',
      url: '/pages/index/index',
      icon: 'cicon-home-o',
      activeIcon: 'cicon-home',
    },
    {
      text: '广场',
      url: '/pages/index/square',
      icon: 'cicon-discover-o',
      activeIcon: 'cicon-discover',
    },
    {
      text: '发布',
      url: '/pages/index/publish',
      icon: 'cicon-add',
      activeIcon: 'cicon-add',
      center: true,
    },
    {
      text: '消息',
      url: '/pages/index/message',
      icon: 'cicon-chat-o',
      activeIcon: 'cicon-chat',
    },
    {
      text: '我的',
      url: '/pages/index/user',
      icon: 'cicon-my-o',
      activeIcon: 'cicon-my',
    },
  ];

  const tabbar = computed(() => sheep.$store('app').template.basic?.tabbar || {});

  const tabbarItems = computed(() => {
    const items = tabbar.value.items?.length ? tabbar.value.items : fallbackItems;
    return items.map((item, index) => ({
      ...fallbackItems[index],
      ...item,
      center: item.center || index === 2,
    }));
  });

  const activeColor = computed(() => tabbar.value.style?.activeColor || '#2563eb');
  const inactiveColor = computed(() => tabbar.value.style?.color || '#94a3b8');

  const tabbarStyle = computed(() => ({
    '--tabbar-active-color': activeColor.value,
    '--tabbar-inactive-color': inactiveColor.value,
    background: tabbar.value.style?.bgColor || '#ffffff',
  }));

  function normalize(url) {
    return String(url || '').split('?')[0];
  }

  function isActive(item) {
    return normalize(item.url) === normalize(props.path);
  }

  function goTab(item) {
    if (isActive(item)) {
      return;
    }
    sheep.$router.go(item.url);
  }
</script>

<style lang="scss" scoped>
  .tutor-tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 998;
    height: calc(132rpx + env(safe-area-inset-bottom));
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    align-items: start;
    padding: 10rpx 0 env(safe-area-inset-bottom);
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -4rpx 18rpx rgba(15, 23, 42, 0.06);
    box-sizing: border-box;
    overflow: visible;
  }

  .tabbar-placeholder {
    height: calc(132rpx + env(safe-area-inset-bottom));
  }

  .tabbar-item {
    min-width: 0;
    width: 100%;
    height: 112rpx;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 80rpx 28rpx;
    align-items: center;
    justify-items: center;
    color: var(--tabbar-inactive-color);
    font-size: 22rpx;
    line-height: 1;
  }

  .tabbar-item.active {
    color: var(--tabbar-active-color);
  }

  .tabbar-icon {
    height: 80rpx;
    line-height: 80rpx;
    font-size: 44rpx;
  }

  .tabbar-text {
    color: currentColor;
    font-size: 22rpx;
    line-height: 28rpx;
  }

  .tabbar-item.center {
    position: relative;
    overflow: visible;
  }

  .center-bubble {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
    background: var(--tabbar-active-color);
    border: 6rpx solid #fff;
    box-shadow: 0 12rpx 28rpx rgba(37, 99, 235, 0.35);
    box-sizing: border-box;
    transform: translateY(-28rpx);
  }

  .center-bubble text {
    font-size: 46rpx;
    line-height: 46rpx;
  }
</style>
