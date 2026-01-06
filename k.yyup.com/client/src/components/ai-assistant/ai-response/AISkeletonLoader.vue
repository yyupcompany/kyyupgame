<!--
  AI助手骨架屏加载组件
  在AI思考时显示占位加载效果
-->

<template>
  <div class="ai-skeleton-loader">
    <!-- 头部骨架 -->
    <div class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-info">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
    </div>

    <!-- 内容骨架 - 根据类型显示不同布局 -->
    <div class="skeleton-content" :class="contentClass">
      <template v-if="type === 'thinking'">
        <!-- 思考过程骨架 -->
        <div class="thinking-dots">
          <span v-for="i in 3" :key="i" class="dot"></span>
        </div>
        <div class="skeleton-text line-1"></div>
        <div class="skeleton-text line-2"></div>
        <div class="skeleton-text line-3 short"></div>
      </template>

      <template v-else-if="type === 'searching'">
        <!-- 搜索骨架 -->
        <div class="search-icon">
          <UnifiedIcon name="search" :size="24" />
        </div>
        <div class="skeleton-text line-2"></div>
        <div class="skeleton-text line-2"></div>
      </template>

      <template v-else-if="type === 'processing'">
        <!-- 处理中骨架 -->
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="skeleton-text line-2"></div>
        <div class="skeleton-text line-3"></div>
      </template>

      <template v-else>
        <!-- 默认骨架 -->
        <div class="skeleton-text line-1"></div>
        <div class="skeleton-text line-2"></div>
        <div class="skeleton-text line-3 short"></div>
      </template>
    </div>

    <!-- 状态提示 -->
    <div v-if="statusText" class="skeleton-status">
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnifiedIcon from '@/components/common/UnifiedIcon.vue'

// ==================== Props ====================
interface Props {
  type?: 'thinking' | 'searching' | 'processing' | 'default'  // 骨架类型
  statusText?: string  // 状态提示文字
  animated?: boolean   // 是否显示动画
}

const props = withDefaults(defineProps<Props>(), {
  type: 'thinking',
  statusText: '',
  animated: true
})

// ==================== 计算属性 ====================
const contentClass = computed(() => {
  return `content-${props.type}`
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入

.ai-skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--border-color);
  max-width: 80%;
}

// 头部骨架
.skeleton-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.skeleton-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-hover) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.skeleton-title {
  width: 120px;
  height: 16px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-hover) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

.skeleton-subtitle {
  width: 80px;
  height: 12px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-hover) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  animation-delay: 0.1s;
}

// 内容骨架
.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-left: 52px; // 头像宽度 + 间距
}

.skeleton-text {
  height: 14px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-hover) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;

  &.line-1 {
    width: 70%;
  }

  &.line-2 {
    width: 85%;
  }

  &.line-3 {
    width: 60%;
  }

  &.short {
    width: 40%;
  }
}

// 思考动画
.thinking-dots {
  display: flex;
  gap: 6px;
  padding: var(--spacing-sm) 0;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary-color);
    animation: dot-bounce 1.4s ease-in-out infinite;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 搜索图标
.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  animation: pulse 2s ease-in-out infinite;
}

// 进度条
.progress-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-md);

  .progress-fill {
    height: 100%;
    width: 30%;
    background: linear-gradient(90deg, var(--primary-color), var(--accent-marketing-light));
    border-radius: 2px;
    animation: progress-move 2s ease-in-out infinite;
  }
}

@keyframes progress-move {
  0% {
    width: 10%;
    margin-left: 0;
  }
  50% {
    width: 60%;
    margin-left: 20%;
  }
  100% {
    width: 10%;
    margin-left: 90%;
  }
}

// 状态提示
.skeleton-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--spacing-sm);
  border-top: var(--border-width) solid var(--border-color);

  .status-text {
    font-size: var(--text-xs);
    color: var(--text-placeholder);
  }
}

// 骨架闪烁动画
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 脉冲动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

// 暗黑主题适配
.dark {
  .ai-skeleton-loader {
    background: rgba(40, 40, 50, 0.8);
  }

  .skeleton-text,
  .skeleton-title,
  .skeleton-subtitle {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 200% 100%;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .ai-skeleton-loader {
    max-width: 90%;
    padding: var(--spacing-md);
  }

  .skeleton-content {
    padding-left: 44px;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .ai-skeleton-loader {
    max-width: 95%;
  }

  .skeleton-content {
    padding-left: 0;
  }

  .skeleton-header {
    gap: var(--spacing-sm);
  }

  .skeleton-avatar {
    width: 32px;
    height: 32px;
  }
}

// 减少动画偏好
@media (prefers-reduced-motion: reduce) {
  .skeleton-avatar,
  .skeleton-title,
  .skeleton-subtitle,
  .skeleton-text {
    animation: none;
    background: var(--bg-tertiary);
  }

  .thinking-dots .dot,
  .search-icon,
  .progress-fill {
    animation: none;
  }
}
</style>
