<template>
  <div class="page-loading-guard">
    <div class="loading-content">
      <el-icon class="loading-icon" size="48">
        <Loading />
      </el-icon>
      <p class="loading-text">{{ loadingText }}</p>
      <div class="loading-progress" v-if="showProgress">
        <el-progress :percentage="progress" :show-text="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

interface Props {
  loadingText?: string
  showProgress?: boolean
  progress?: number
}

withDefaults(defineProps<Props>(), {
  loadingText: '页面加载中...',
  showProgress: false,
  progress: 0
})
</script>

<style scoped lang="scss">
.page-loading-guard {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--white-alpha-90);
  backdrop-filter: blur(var(--spacing-xs));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .loading-content {
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--bg-card);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    min-width: 200px;

    .loading-icon {
      color: var(--color-primary);
      animation: spin 1s linear infinite;
      margin-bottom: var(--spacing-md);
    }

    .loading-text {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--text-primary);
      font-size: var(--font-size-md);
    }

    .loading-progress {
      margin-top: var(--spacing-md);
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
