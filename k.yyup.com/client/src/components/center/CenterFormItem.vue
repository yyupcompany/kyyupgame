<template>
  <div :class="['center-form-item', `center-form-item--${size}`, { 'center-form-item--error': hasError }]">
    <label v-if="label" class="center-form-item__label" :for="fieldId">
      <span>{{ label }}</span>
      <span v-if="required" class="center-form-item__required">*</span>
    </label>

    <div class="center-form-item__content">
      <slot />
    </div>

    <div v-if="hasError || $slots.extra" class="center-form-item__extra">
      <div v-if="hasError" class="center-form-item__error">
        <UnifiedIcon name="warning-circle" :size="14" />
        <span>{{ errorMessage }}</span>
      </div>
      <slot name="extra" />
    </div>

    <div v-if="$slots.hint" class="center-form-item__hint">
      <slot name="hint" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, inject } from 'vue'
import UnifiedIcon from './CenterIcon.vue'

interface Props {
  label?: string
  required?: boolean
  errorMessage?: string
  size?: 'small' | 'medium' | 'large'
  prop?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  size: 'medium'
})

const fieldId = computed(() => `field-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => Boolean(props.errorMessage))

// Form context injection
const formContext = inject<any>('center-form', null)

if (formContext && props.prop) {
  formContext.addField({
    prop: props.prop,
    validate: () => {
      // Validation will be handled by parent form
      return !hasError.value
    }
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.center-form-item {
  margin-bottom: var(--spacing-md, 16px);

  &__label {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-sm, 8px);
    font-size: var(--text-sm, 14px);
    font-weight: var(--font-medium, 500);
    color: var(--text-primary, #2c3e50);
    line-height: 1.5;
  }

  &__required {
    color: var(--danger-color, #f56c6c);
    margin-left: 2px;
  }

  &__content {
    position: relative;
  }

  &__extra {
    margin-top: var(--spacing-xs, 4px);
    min-height: 20px;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs, 12px);
    color: var(--danger-color, #f56c6c);
    line-height: 1.5;
  }

  &__hint {
    margin-top: var(--spacing-xs, 4px);
    font-size: var(--text-xs, 12px);
    color: var(--text-tertiary, #8492a6);
    line-height: 1.5;
  }

  &--error {
    .center-form-item__label {
      color: var(--danger-color, #f56c6c);
    }
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  html[data-theme="dark"] {
    .center-form-item {
      &__label {
        color: var(--text-primary-dark, #f8fafc);
      }

      &__hint {
        color: var(--text-muted-dark, #94a3b8);
      }

      &--error {
        .center-form-item__label {
          color: var(--danger-color, #f56c6c);
        }
      }
    }
  }
}
</style>
