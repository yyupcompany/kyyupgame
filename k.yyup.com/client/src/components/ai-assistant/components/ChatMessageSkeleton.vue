<!--
  AI 助手消息骨架屏组件
  在消息加载时显示，提升感知性能
-->

<template>
  <div class="ai-message-skeleton" :class="[`ai-message-skeleton--${type}`, `ai-message-skeleton--${size}`]">
    <!-- 头像骨架 -->
    <div class="ai-message-skeleton__avatar" :class="`avatar-${type}`"></div>

    <!-- 内容骨架 -->
    <div class="ai-message-skeleton__content">
      <!-- 头部信息 -->
      <div class="ai-message-skeleton__header">
        <div class="ai-message-skeleton__name ai-skeleton"></div>
        <div class="ai-message-skeleton__time ai-skeleton"></div>
      </div>

      <!-- 文本行 -->
      <div
        v-for="i in lines"
        :key="i"
        class="ai-message-skeleton__line ai-skeleton"
        :class="getLineClass(i, lines)"
      ></div>

      <!-- 附件骨架 -->
      <div v-if="showAttachment" class="ai-message-skeleton__attachment ai-skeleton"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'user' | 'assistant' | 'system'
  size?: 'small' | 'medium' | 'large'
  lines?: number
  showAttachment?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'assistant',
  size: 'medium',
  lines: 3,
  showAttachment: false
})

const getLineClass = (index: number, total: number) => {
  if (index === 1) return 'ai-message-skeleton__line--short'
  if (index === total) return 'ai-message-skeleton__line--medium'
  return 'ai-message-skeleton__line--long'
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
@use '../styles/ai-assistant-enhanced.scss' as *;

.ai-message-skeleton {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  animation: pulse-fade 1.5s ease-in-out infinite;

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    @extend .ai-skeleton;

    &.avatar-user {
      background: linear-gradient(135deg, #667eea 25%, #764ba2 50%, #667eea 75%);
      background-size: 200% 100%;
    }

    &.avatar-assistant {
      background: linear-gradient(135deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
      background-size: 200% 100%;
    }

    &.avatar-system {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  &__name {
    width: 80px;
    height: 14px;
    border-radius: 4px;
  }

  &__time {
    width: 60px;
    height: 12px;
    border-radius: 4px;
  }

  &__line {
    height: 14px;
    border-radius: 4px;

    &--short {
      width: 40%;
    }

    &--medium {
      width: 70%;
    }

    &--long {
      width: 100%;
    }
  }

  &__attachment {
    width: 120px;
    height: 80px;
    border-radius: var(--radius-md);
    margin-top: var(--spacing-sm);
  }

  // 尺寸变体
  &--small {
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);

    .ai-message-skeleton__avatar {
      width: 32px;
      height: 32px;
    }

    .ai-message-skeleton__line {
      height: 12px;
    }
  }

  &--large {
    padding: var(--spacing-lg);
    gap: var(--spacing-md);

    .ai-message-skeleton__avatar {
      width: 48px;
      height: 48px;
    }

    .ai-message-skeleton__line {
      height: 16px;
    }
  }

  // 类型变体
  &--user {
    flex-direction: row-reverse;

    .ai-message-skeleton__content {
      align-items: flex-end;
    }
  }

  &--system {
    justify-content: center;

    .ai-message-skeleton__avatar {
      display: none;
    }

    .ai-message-skeleton__content {
      align-items: center;
      flex-direction: row;
      gap: var(--spacing-md);
    }

    .ai-message-skeleton__header {
      display: none;
    }
  }
}
</style>
