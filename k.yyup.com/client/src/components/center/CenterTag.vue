<template>
  <span :class="['center-tag', `center-tag--${type}`, `center-tag--${size}`, { 'center-tag--plain': plain }]">
    <UnifiedIcon v-if="icon" :name="icon" :size="iconSize" class="center-tag__icon" />
    <slot />
    <UnifiedIcon
      v-if="closable"
      name="close"
      :size="iconSize"
      class="center-tag__close"
      @click.stop="handleClose"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnifiedIcon from './CenterIcon.vue'

interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  closable?: boolean
  plain?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  closable: false,
  plain: false
})

const emit = defineEmits<{
  close: []
}>()

const iconSize = computed(() => {
  const sizeMap = {
    small: 12,
    medium: 14,
    large: 16
  }
  return sizeMap[props.size]
})

const handleClose = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.center-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-full, 9999px);
  font-size: var(--text-sm, 14px);
  font-weight: var(--font-medium, 500);
  white-space: nowrap;
  cursor: default;
  transition: all var(--transition-fast, 150ms ease-in-out);
  user-select: none;

  // Sizes
  &--small {
    padding: 2px 8px;
    font-size: var(--text-xs, 12px);
  }

  &--large {
    padding: 6px 14px;
    font-size: var(--text-base, 16px);
  }

  // Types
  &--primary,
  &.center-tag--primary {
    background: rgba(91, 141, 239, 0.1);
    color: var(--primary-color, #5b8def);
    border: 1px solid rgba(91, 141, 239, 0.2);

    &.center-tag--plain {
      background: transparent;
      color: var(--primary-color, #5b8def);
      border-color: var(--primary-color, #5b8def);
    }
  }

  &--success {
    background: rgba(82, 196, 26, 0.1);
    color: var(--success-color, #52c41a);
    border: 1px solid rgba(82, 196, 26, 0.2);

    &.center-tag--plain {
      background: transparent;
      color: var(--success-color, #52c41a);
      border-color: var(--success-color, #52c41a);
    }
  }

  &--warning {
    background: rgba(230, 162, 60, 0.1);
    color: var(--warning-color, #e6a23c);
    border: 1px solid rgba(230, 162, 60, 0.2);

    &.center-tag--plain {
      background: transparent;
      color: var(--warning-color, #e6a23c);
      border-color: var(--warning-color, #e6a23c);
    }
  }

  &--danger {
    background: rgba(245, 108, 108, 0.1);
    color: var(--danger-color, #f56c6c);
    border: 1px solid rgba(245, 108, 108, 0.2);

    &.center-tag--plain {
      background: transparent;
      color: var(--danger-color, #f56c6c);
      border-color: var(--danger-color, #f56c6c);
    }
  }

  &--info {
    background: rgba(144, 147, 153, 0.1);
    color: var(--info-color, #909399);
    border: 1px solid rgba(144, 147, 153, 0.2);

    &.center-tag--plain {
      background: transparent;
      color: var(--info-color, #909399);
      border-color: var(--info-color, #909399);
    }
  }

  &--default {
    background: var(--bg-color-page, #f7f8fa);
    color: var(--text-primary, #2c3e50);
    border: 1px solid var(--border-color, #dcdfe6);

    &.center-tag--plain {
      background: transparent;
      color: var(--text-secondary, #5a6c7d);
      border-color: var(--border-color, #dcdfe6);
    }
  }

  &__icon {
    flex-shrink: 0;
  }

  &__close {
    flex-shrink: 0;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity var(--transition-fast, 150ms ease-in-out);

    &:hover {
      opacity: 1;
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  html[data-theme="dark"] {
    .center-tag {
      &--default {
        background: var(--bg-secondary-dark, #1e293b);
        color: var(--text-primary-dark, #f8fafc);
        border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));

        &.center-tag--plain {
          background: transparent;
          color: var(--text-secondary-dark, #cbd5e1);
          border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));
        }
      }
    }
  }
}
</style>
