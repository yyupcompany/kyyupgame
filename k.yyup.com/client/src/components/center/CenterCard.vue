<template>
  <div :class="['center-card', { 'center-card--clickable': clickable, 'center-card--bordered': bordered, 'center-card--hoverable': hoverable }]" @click="handleClick">
    <div v-if="$slots.header" class="center-card__header">
      <slot name="header" />
    </div>
    <div class="center-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="center-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  clickable?: boolean
  bordered?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false,
  bordered: false,
  hoverable: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.center-card {
  background: var(--bg-color, #ffffff);
  border-radius: var(--radius-xl, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
  padding: var(--spacing-lg, 24px);
  transition: all var(--transition-base, 200ms ease-in-out);

  &--bordered {
    border: 1px solid var(--border-color, #dcdfe6);
  }

  &--clickable {
    cursor: pointer;
    user-select: none;
  }

  &--hoverable:hover,
  &--clickable:hover {
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    transform: translateY(-2px);
  }

  &__header {
    margin-bottom: var(--spacing-md, 16px);
    padding-bottom: var(--spacing-md, 16px);
    border-bottom: 1px solid var(--border-color, #dcdfe6);

    :deep(.center-card__title) {
      font-size: var(--text-lg, 18px);
      font-weight: var(--font-semibold, 600);
      color: var(--text-primary, #2c3e50);
      margin: 0;
    }
  }

  &__body {
    flex: 1;
  }

  &__footer {
    margin-top: var(--spacing-md, 16px);
    padding-top: var(--spacing-md, 16px);
    border-top: 1px solid var(--border-color, #dcdfe6);
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  html[data-theme="dark"] .center-card {
    background: var(--bg-card-dark, #1e293b);
    border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));

    &__header,
    &__footer {
      border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));
    }

    :deep(.center-card__title) {
      color: var(--text-primary-dark, #f8fafc);
    }
  }
}
</style>
