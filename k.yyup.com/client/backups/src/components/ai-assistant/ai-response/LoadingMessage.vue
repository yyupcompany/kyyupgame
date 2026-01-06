<!--
  AI 加载消息组件
  显示 AI 正在思考的加载状态
-->

<template>
  <div class="ai-loading-message">
    <div class="loading-indicator">
      <!-- 加载动画 -->
      <div class="spinner">
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
        <div class="dot dot-3"></div>
      </div>
    </div>
    <div class="loading-text">
      <span class="thinking-emoji">🤔</span>
      <span class="thinking-text">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: 'AI 正在思考中...'
})

// 计算显示的消息
const displayMessage = computed(() => props.message)
</script>

<style scoped lang="scss">
.ai-loading-message {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  padding: var(--text-sm) var(--text-lg);
  background: linear-gradient(135deg, var(--bg-container) 0%, #c3cfe2 100%);
  border-radius: var(--spacing-sm);
  animation: fadeIn 0.3s ease-in-out;

  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--text-3xl);
    height: var(--text-3xl);

    .spinner {
      display: flex;
      gap: var(--spacing-xs);
      align-items: center;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: var(--radius-full);
        background-color: var(--primary-color);
        animation: bounce 1.4s infinite ease-in-out both;

        &.dot-1 {
          animation-delay: -0.32s;
        }

        &.dot-2 {
          animation-delay: -0.16s;
        }

        &.dot-3 {
          animation-delay: 0s;
        }
      }
    }
  }

  .loading-text {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-base);
    color: var(--text-regular);

    .thinking-emoji {
      font-size: var(--text-lg);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .thinking-text {
      font-weight: 500;
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    opacity: 0.5;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-var(--spacing-xs));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

