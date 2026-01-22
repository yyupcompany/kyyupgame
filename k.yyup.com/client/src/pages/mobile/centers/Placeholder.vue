<template>
  <div class="mobile-placeholder">
    <div class="header">
      <van-nav-bar
        :title="$route.meta.title || '页面'"
        left-arrow
        @click-left="$router.back()"
      />
    </div>
    <div class="content">
      <van-empty description="功能开发中，敬请期待" />
      <div style="padding: 20px;">
        <van-button type="primary" @click="$router.back()" block>
          返回
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';

.mobile-placeholder {
  @include mobile-layout;
  min-height: 100vh;
  background: var(--van-background-2, #f5f5f5);
}

.content {
  @include mobile-padding(20px, 0);
  @include mobile-container;
  text-align: center;

  // 平板设备上增加内边距
  @include mobile-lg {
    padding: 40px 0;
  }
}
</style>
