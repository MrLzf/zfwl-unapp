<template>
  <s-layout class="page" title="增值服务" navbar="inner">
    <view class="target-card">
      <view class="title">{{ targetTitle }}</view>
      <view class="desc">购买后将提升展示权重或标记加急，服务即时生效。</view>
    </view>

    <view class="list">
      <button
        v-for="item in services"
        :key="item.id"
        class="service ss-reset-button"
        :class="{ active: selected?.id === item.id }"
        @tap="selected = item"
      >
        <view>
          <view class="name">{{ item.name }}</view>
          <view class="desc">{{ item.description || `${item.durationHours || 24} 小时有效` }}</view>
        </view>
        <view class="price">{{ item.pointPrice }} 积分</view>
      </button>
    </view>

    <button class="primary-btn ss-reset-button" @tap="buy">确认购买</button>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onLoad, onShow } from '@dcloudio/uni-app';
  import TutorP1Api from '@/sheep/api/tutor/p1';

  const options = reactive({ targetType: 'demand', targetId: '', title: '' });
  const selected = ref(null);
  const state = reactive({ services: [] });
  const targetTitle = computed(() => options.title || '当前发布信息');
  const fallbackServices = [
    {
      id: 'top',
      serviceType: 'top',
      name: '置顶服务',
      pointPrice: 50,
      durationHours: 24,
      description: '列表顶部优先展示',
    },
    {
      id: 'boost',
      serviceType: 'boost',
      name: '加速曝光',
      pointPrice: 30,
      durationHours: 24,
      description: '提升推荐排序权重',
    },
    {
      id: 'urgent',
      serviceType: 'urgent',
      name: '加急标识',
      pointPrice: 20,
      durationHours: 48,
      description: '展示加急标签',
    },
  ];
  const services = computed(() => (state.services.length ? state.services : fallbackServices));

  async function loadServices() {
    const result = await TutorP1Api.getValueServices({ targetType: options.targetType });
    if (result?.code === 0 && Array.isArray(result.data) && result.data.length)
      state.services = result.data;
    selected.value = services.value[0] || null;
  }

  async function buy() {
    if (!selected.value) return;
    const result = await TutorP1Api.createValueServiceOrder({
      serviceType: selected.value.serviceType || selected.value.type || selected.value.id,
      targetType: options.targetType,
      targetId: options.targetId,
    });
    if (result?.code === 0) {
      uni.showToast({ title: '购买成功', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 500);
    } else {
      uni.showToast({ title: result?.msg || '购买失败', icon: 'none' });
    }
  }

  onLoad((query = {}) => Object.assign(options, query));
  onShow(loadServices);
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    background: #f7f8fb;
  }
  .target-card,
  .service {
    margin: 24rpx;
    padding: 26rpx;
    border-radius: 16rpx;
    background: #fff;
    border: 1px solid #e7edf0;
  }
  .title,
  .name {
    color: #111827;
    font-size: 30rpx;
    font-weight: 900;
  }
  .desc {
    margin-top: 8rpx;
    color: #64748b;
    font-size: 24rpx;
    line-height: 36rpx;
  }
  .list {
    display: flex;
    flex-direction: column;
  }
  .service {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    margin-top: 0;
    text-align: left;
  }
  .service.active {
    border-color: #176b5b;
    background: #eefaf6;
  }
  .price {
    flex-shrink: 0;
    color: #f97316;
    font-size: 30rpx;
    font-weight: 900;
  }
  .primary-btn {
    height: 88rpx;
    margin: 8rpx 24rpx 0;
    border-radius: 16rpx;
    color: #fff;
    background: #176b5b;
    font-size: 30rpx;
    font-weight: 900;
  }
</style>
