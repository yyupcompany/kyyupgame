<template>
  <div class="page-header">
    <h2 class="page-title">{{ title }}</h2>
    <div class="page-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      required: true
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.page-title {
  font-size: var(--spacing-lg);
  font-weight: bold;
  color: var(--text-color-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style> 