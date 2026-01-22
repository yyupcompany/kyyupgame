<template>
  <div class="center-badge-wrapper">
    <slot />
    <span
      v-if="showBadge"
      :class="['center-badge', `center-badge--${type}`, `center-badge--${size}`, { 'center-badge--dot': isDot }]"
    >
      <template v-if="!isDot">
        {{ displayValue }}
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: number
  max?: number
  isDot?: boolean
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'medium' | 'large'
  hidden?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 99,
  isDot: false,
  type: 'danger',
  size: 'medium',
  hidden: false
})

const displayValue = computed(() => {
  if (props.value > props.max) {
    return `${props.max}+`
  }
  return props.value
})

const showBadge = computed(() => {
  if (props.hidden) return false
  if (props.isDot) return true
  return props.value > 0
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.center-badge-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.center-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--danger-color, #f56c6c);
  color: #ffffff;
  border-radius: var(--radius-full, 9999px);
  border: 2px solid var(--bg-color, #ffffff);
  font-weight: var(--font-semibold, 600);
  white-space: nowrap;
  box-shadow: var(--shadow-sm, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
  z-index: 10;

  // Sizes
  &--small {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 10px;
    line-height: 1;
  }

  &--medium {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 11px;
    line-height: 1;
  }

  &--large {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    font-size: 12px;
    line-height: 1;
  }

  // Dot variant
  &--dot {
    min-width: 8px;
    width: 8px;
    height: 8px;
    padding: 0;
    background: var(--danger-color, #f56c6c);
    border-radius: 50%;
  }

  // Types
  &--primary {
    background: var(--primary-color, #5b8def);
  }

  &--success {
    background: var(--success-color, #52c41a);
  }

  &--warning {
    background: var(--warning-color, #e6a23c);
  }

  &--info {
    background: var(--info-color, #909399);
  }

  // Animation
  @keyframes badge-bounce {
    0% {
      transform: translate(50%, -50%) scale(0);
    }
    50% {
      transform: translate(50%, -50%) scale(1.2);
    }
    100% {
      transform: translate(50%, -50%) scale(1);
    }
  }

  animation: badge-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  html[data-theme="dark"] {
    .center-badge {
      border-color: var(--bg-card-dark, #1e293b);
    }
  }
}
</style>
