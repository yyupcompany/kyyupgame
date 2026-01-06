<template>
  <Teleport to="body">
    <Transition name="loading-fade">
      <div v-if="hasVisibleLoading" class="global-loading-container">
        <!-- 渲染所有可见的加载状态 -->
        <div
          v-for="item in visibleLoadingItems"
          :key="item.id"
          :class="[
            'global-loading-item',
            { 'global-loading-item--overlay': item.config.overlay }
          ]"
          :style="getItemStyle(item)"
        >
          <LoadingSpinner
            :type="item.config.type"
            :size="item.config.size"
            :overlay="true"
            :text="item.config.text"
            :detail="item.config.detail"
            :progress="item.progress"
            :skeleton-lines="item.config.skeletonLines"
            :color="item.config.color"
            :background-color="item.config.backgroundColor"
            :z-index="item.config.zIndex"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { loadingManager } from '@/utils/loadingManager'

// 获取可见的加载项
const visibleLoadingItems = computed(() => {
  return loadingManager.getVisibleItems().map(item => {
    // 计算进度（如果是progress类型）
    let progress = 0
    if (item.config.type === 'progress' && item.config.timeout) {
      const elapsed = Date.now() - item.startTime
      progress = Math.min((elapsed / item.config.timeout) * 100, 100)
    }
    
    return {
      ...item,
      progress
    }
  })
})

// 是否有可见的加载状态
const hasVisibleLoading = computed(() => {
  return visibleLoadingItems.value.length > 0
})

// 获取加载项样式
const getItemStyle = (item: any) => {
  const style: Record<string, any> = {}
  
  if (item.config.zIndex) {
    style.zIndex = item.config.zIndex
  }
  
  if (item.config.backgroundColor) {
    style.backgroundColor = item.config.backgroundColor
  }
  
  return style
}

// 处理键盘事件（ESC关闭）
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && hasVisibleLoading.value) {
    // 可以添加逻辑来取消某些可取消的加载操作
    const cancelableItems = visibleLoadingItems.value.filter(
      item => item.config.cancelable !== false
    )
    
    if (cancelableItems.length > 0) {
      // 触发取消事件
      cancelableItems.forEach(item => {
        if (item.config.onCancel) {
          item.config.onCancel()
        }
      })
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.global-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: var(--z-index-fixed)9;
}

.global-loading-item {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: auto;
  
  &--overlay {
    background-color: var(--overlay-bg-light);
    backdrop-filter: blur(var(--spacing-xs));
  }
}

// 渐入渐出动画
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity var(--transition-normal) ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .global-loading-item--overlay {
    background-color: var(--overlay-bg-dark);
  }
}

// 移动端适配
@media (max-width: var(--breakpoint-md)) {
  .global-loading-container {
    // 在移动端可能需要调整z-index以适应特定的UI库
    z-index: var(--z-index-dropdown)0;
  }
}
</style>