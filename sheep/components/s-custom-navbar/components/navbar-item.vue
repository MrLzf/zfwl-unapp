<!-- 顶部导航栏 - 单元格 -->
<template>
  <view class="ss-flex ss-col-center">
    <!-- 类型一： 文字 -->
    <view
      v-if="data.type === 'text'"
      class="nav-title inline"
      :style="[{ color: data.textColor, width: width }]"
      @tap="sheep.$router.go(data.url)"
    >
      {{ data.text }}
    </view>
    <!-- 类型二： 图片 -->
    <view
      v-if="data.type === 'image'"
      :style="[{ width: width }]"
      class="menu-icon-wrap ss-flex ss-row-center ss-col-center"
      @tap="sheep.$router.go(data.url)"
    >
      <image class="nav-image" :src="sheep.$url.cdn(data.imgUrl)" mode="aspectFit"></image>
    </view>
    <!-- 类型三： 搜索框 -->
    <view class="ss-flex-1" v-if="data.type === 'search'" :style="[{ width: width }]">
      <view
        class="nav-search ss-flex ss-col-center"
        :style="[
          {
            height: height + 'px',
            borderRadius: (data.borderRadius || 16) + 'rpx',
            background: data.backgroundColor || '#f3f4f6',
            color: data.textColor || '#6b7280',
          },
        ]"
      >
        <text class="cicon-search"></text>
        <text class="nav-search-text">{{ data.placeholder || '搜索家教信息' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
  import sheep from '@/sheep';
  import { computed } from 'vue';

  // 接收参数
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
    width: {
      type: String,
      default: '1px',
    },
  });

  const height = computed(() => sheep.$platform.capsule.height);
</script>

<style lang="scss" scoped>
  .nav-title {
    font-size: 36rpx;
    color: #333;
    text-align: center;
  }

  .menu-icon-wrap {
    .nav-image {
      height: 24px;
    }
  }

  .nav-search {
    padding: 0 20rpx;
    font-size: 26rpx;
  }

  .nav-search-text {
    margin-left: 10rpx;
  }
</style>
