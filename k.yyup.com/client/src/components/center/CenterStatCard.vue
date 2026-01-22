<template>
  <div :class="['center-stat-card', `center-stat-card--${variant}`]" @click="handleClick">
    <div class="center-stat-card__icon" :style="{ backgroundColor: iconColor }">
      <UnifiedIcon :name="icon" :size="24" color="#ffffff" />
    </div>
    <div class="center-stat-card__content">
      <div class="center-stat-card__label">{{ label }}</div>
      <div class="center-stat-card__value">
        <span v-if="prefix" class="center-stat-card__prefix">{{ prefix }}</span>
        <AnimatedNumber :value="value" :duration="500" />
        <span v-if="suffix" class="center-stat-card__suffix">{{ suffix }}</span>
      </div>
      <div v-if="trend" class="center-stat-card__trend" :class="trendClass">
        <UnifiedIcon :name="trendIcon" :size="14" />
        <span>{{ trend }}</span>
      </div>
    </div>
    <div v-if="$slots.extra" class="center-stat-card__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface Props {
  icon: string
  label: string
  value: number | string
  prefix?: string
  suffix?: string
  trend?: string
  trendUp?: boolean
  trendDown?: boolean
  iconColor?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '',
  suffix: '',
  trend: '',
  trendUp: false,
  trendDown: false,
  iconColor: '',
  variant: 'default',
  clickable: true
})

const emit = defineEmits<{
  click: []
}>()

const trendClass = computed(() => {
  if (props.trendUp) return 'center-stat-card__trend--up'
  if (props.trendDown) return 'center-stat-card__trend--down'
  return ''
})

const trendIcon = computed(() => {
  if (props.trendUp) return 'trend-up'
  if (props.trendDown) return 'trend-down'
  return 'minus'
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

// AnimatedNumber component
const AnimatedNumber = {
  name: 'AnimatedNumber',
  props: {
    value: { type: [Number, String], required: true },
    duration: { type: Number, default: 500 }
  },
  setup(props: any) {
    const displayValue = computed(() => props.value)
    return () => displayValue.value
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.center-stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
  background: var(--bg-color, #ffffff);
  border-radius: var(--radius-xl, 12px);
  padding: var(--spacing-md, 16px);
  border: 1px solid var(--border-color, #dcdfe6);
  box-shadow: var(--shadow-sm, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
  cursor: pointer;
  transition: all var(--transition-base, 200ms ease-in-out);
  user-select: none;

  &:hover {
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    transform: translateY(-2px);
    border-color: var(--primary-color, #5b8def);
  }

  &:active {
    transform: translateY(0);
  }

  &__icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg, 8px);
    background: var(--primary-color, #5b8def);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
  }

  &--primary &__icon {
    background: var(--primary-color, #5b8def);
  }

  &--success &__icon {
    background: var(--success-color, #52c41a);
  }

  &--warning &__icon {
    background: var(--warning-color, #e6a23c);
  }

  &--danger &__icon {
    background: var(--danger-color, #f56c6c);
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: var(--text-sm, 14px);
    font-weight: var(--font-medium, 500);
    color: var(--text-secondary, #5a6c7d);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__value {
    font-size: var(--text-2xl, 24px);
    font-weight: var(--font-bold, 700);
    color: var(--text-primary, #2c3e50);
    line-height: 1.2;
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  &__prefix,
  &__suffix {
    font-size: var(--text-sm, 14px);
    font-weight: var(--font-medium, 500);
    color: var(--text-secondary, #5a6c7d);
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: var(--text-xs, 12px);
    font-weight: var(--font-medium, 500);

    &--up {
      color: var(--success-color, #52c41a);
    }

    &--down {
      color: var(--danger-color, #f56c6c);
    }
  }

  &__extra {
    flex-shrink: 0;
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  html[data-theme="dark"] .center-stat-card {
    background: var(--bg-card-dark, #1e293b);
    border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));

    &__label {
      color: var(--text-secondary-dark, #cbd5e1);
    }

    &__value {
      color: var(--text-primary-dark, #f8fafc);
    }

    &__prefix,
    &__suffix {
      color: var(--text-muted-dark, #94a3b8);
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .center-stat-card {
    padding: var(--spacing-sm, 12px);

    &__icon {
      width: 40px;
      height: 40px;
    }

    &__value {
      font-size: var(--text-xl, 20px);
    }
  }
}
</style>
