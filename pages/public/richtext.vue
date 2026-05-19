<template>
  <s-layout :bgStyle="{ color: '#FFF' }" :title="state.title" class="set-wrap">
    <view class="ss-p-30 richtext">
      <mp-html :content="state.content"></mp-html>
    </view>
  </s-layout>
</template>

<script setup>
  import { onLoad } from '@dcloudio/uni-app';
  import { reactive } from 'vue';

  const state = reactive({
    title: '',
    content: '',
  });

  onLoad((options) => {
    state.title = options.title || '内容详情';
    state.content = options.content ? decodeURIComponent(options.content) : '';
    uni.setNavigationBarTitle({
      title: state.title,
    });
  });
</script>

<style lang="scss" scoped>
  :deep() {
    image {
      display: block;
    }
  }
</style>
