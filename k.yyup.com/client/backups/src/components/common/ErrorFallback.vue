<template>
  <div class="error-fallback">
    <el-icon class="error-icon"><Warning /></el-icon>
    <span class="error-text">组件加载失败</span>
    <el-button 
      type="text" 
      size="small" 
      @click="retry"
      class="retry-button"
    >
      重试
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'

const retry = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--text-sm);
  color: var(--danger-color);
  background-color: #fef0f0;
  border: var(--border-width-base) solid #fbc4c4;
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  min-height: var(--spacing-3xl);
}

.error-icon {
  margin-right: var(--spacing-xs);
}

.error-text {
  margin-right: var(--spacing-sm);
}

.retry-button {
  padding: 0 var(--spacing-xs);
  height: auto;
  font-size: var(--text-xs);
}
</style>