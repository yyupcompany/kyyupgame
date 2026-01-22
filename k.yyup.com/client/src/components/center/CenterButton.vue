<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :type="nativeType"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <UnifiedIcon v-if="loading" name="loading" :size="iconSize" class="center-btn__loading" spin />
    <UnifiedIcon v-else-if="icon" :name="icon" :size="iconSize" class="center-btn__icon" />
    <span v-if="$slots.default" class="center-btn__content">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface Props {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text' | 'link'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  plain?: boolean
  round?: boolean
  circle?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  href?: string
  target?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  iconPosition: 'left',
  disabled: false,
  loading: false,
  block: false,
  plain: false,
  round: false,
  circle: false,
  nativeType: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const tag = computed(() => {
  return props.href ? 'a' : 'button'
})

const buttonClasses = computed(() => {
  return [
    'center-btn',
    `center-btn--${props.type}`,
    `center-btn--${props.size}`,
    {
      'center-btn--disabled': props.disabled,
      'center-btn--loading': props.loading,
      'center-btn--block': props.block,
      'center-btn--plain': props.plain,
      'center-btn--round': props.round,
      'center-btn--circle': props.circle,
      'center-btn--icon-only': props.icon && !$slots.default
    }
  ]
})

const iconSize = computed(() => {
  const sizeMap = {
    small: 16,
    medium: 18,
    large: 20
  }
  return sizeMap[props.size]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.center-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: var(--radius-md, 6px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  transition: all var(--transition-base, 200ms ease-in-out);
  border: 1px solid transparent;
  outline: none;
  position: relative;
  overflow: hidden;

  &::-moz-focus-inner {
    border: 0;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color, #5b8def);
    outline-offset: 2px;
  }

  // Sizes
  &--small {
    padding: 6px 12px;
    font-size: var(--text-sm, 14px);
    min-height: 32px;
  }

  &--medium {
    padding: 10px 16px;
    font-size: var(--text-base, 16px);
    min-height: 40px;
  }

  &--large {
    padding: 14px 20px;
    font-size: var(--text-lg, 18px);
    min-height: 48px;
  }

  // Types
  &--primary,
  &.center-btn--primary {
    background: var(--primary-color, #5b8def);
    color: #ffffff;
    border-color: var(--primary-color, #5b8def);

    &:hover:not(.center-btn--disabled) {
      background: var(--primary-hover, #4a7bd8);
      border-color: var(--primary-hover, #4a7bd8);
    }

    &:active:not(.center-btn--disabled) {
      background: var(--primary-dark, #3968c7);
      border-color: var(--primary-dark, #3968c7);
    }
  }

  &--secondary {
    background: var(--bg-color-page, #f7f8fa);
    color: var(--text-primary, #2c3e50);
    border-color: var(--border-color, #dcdfe6);

    &:hover:not(.center-btn--disabled) {
      background: var(--bg-hover, #f0f2f5);
      border-color: var(--primary-color, #5b8def);
      color: var(--primary-color, #5b8def);
    }
  }

  &--success {
    background: var(--success-color, #52c41a);
    color: #ffffff;
    border-color: var(--success-color, #52c41a);

    &:hover:not(.center-btn--disabled) {
      background: var(--success-light, #73d13d);
      border-color: var(--success-light, #73d13d);
    }
  }

  &--warning {
    background: var(--warning-color, #e6a23c);
    color: #ffffff;
    border-color: var(--warning-color, #e6a23c);

    &:hover:not(.center-btn--disabled) {
      background: var(--warning-light, #ebb563);
      border-color: var(--warning-light, #ebb563);
    }
  }

  &--danger {
    background: var(--danger-color, #f56c6c);
    color: #ffffff;
    border-color: var(--danger-color, #f56c6c);

    &:hover:not(.center-btn--disabled) {
      background: var(--danger-light, #f78989);
      border-color: var(--danger-light, #f78989);
    }
  }

  &--text {
    background: transparent;
    color: var(--text-primary, #2c3e50);
    border-color: transparent;

    &:hover:not(.center-btn--disabled) {
      background: rgba(91, 141, 239, 0.1);
      color: var(--primary-color, #5b8def);
    }
  }

  &--link {
    background: transparent;
    color: var(--primary-color, #5b8def);
    border-color: transparent;
    padding: 0;

    &:hover:not(.center-btn--disabled) {
      text-decoration: underline;
    }
  }

  // Modifiers
  &--plain {
    background: transparent;

    &.center-btn--primary {
      color: var(--primary-color, #5b8def);
      border-color: var(--primary-color, #5b8def);

      &:hover:not(.center-btn--disabled) {
        background: var(--primary-color, #5b8def);
        color: #ffffff;
      }
    }
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &--round {
    border-radius: var(--radius-full, 9999px);
  }

  &--circle {
    border-radius: 50%;
    padding: 0;
    min-height: auto;
  }

  &--icon-only {
    padding: 0;
    min-height: auto;
  }

  // States
  &--disabled,
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--loading {
    pointer-events: none;
  }

  &__loading {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  html[data-theme="dark"] {
    .center-btn {
      &--secondary {
        background: var(--bg-card-dark, #1e293b);
        color: var(--text-primary-dark, #f8fafc);
        border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));

        &:hover:not(.center-btn--disabled) {
          background: rgba(139, 92, 246, 0.1);
          border-color: var(--accent-ai, #0ea5e9);
          color: var(--accent-ai, #0ea5e9);
        }
      }

      &--text {
        color: var(--text-primary-dark, #f8fafc);

        &:hover:not(.center-btn--disabled) {
          background: rgba(139, 92, 246, 0.1);
          color: var(--accent-ai, #0ea5e9);
        }
      }
    }
  }
}
</style>
