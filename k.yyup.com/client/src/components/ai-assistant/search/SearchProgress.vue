<template>
  <div class="search-progress">
    <!-- 搜索进度组件 -->
    <div v-if="visible" class="progress-container">
      <div class="progress-header">
        <UnifiedIcon name="search" :size="16" />
        <span class="progress-text">{{ message }}</span>
      </div>
      <el-progress
        v-if="percentage !== undefined"
        :percentage="percentage"
        :stroke-width="4"
        :show-text="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  visible?: boolean
  message?: string
  percentage?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  message: '搜索中...',
  percentage: undefined
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.search-progress {
  .progress-container {
    padding: var(--text-sm);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
    margin: var(--spacing-sm) 0;
  }

  .progress-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);

    .search-icon {
      color: var(--el-color-primary);
    }

    .progress-text {
      font-size: var(--text-base);
      color: var(--text-regular);
    }
  }
}
</style>
