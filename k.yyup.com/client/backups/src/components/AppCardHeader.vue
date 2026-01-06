<template>
  <div class="app-card-header">
    <slot />
  </div>
</template>

<script setup lang="ts">
// AppCardHeader组件
</script>

<style scoped lang="scss">
.app-card-header {
  padding: var(--spacing-lg, var(--text-3xl)) var(--spacing-lg, var(--text-3xl)) var(--spacing-md, var(--text-lg));
  border-bottom: var(--border-width-base) solid var(--border-color, #ebeef5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>