<template>
  <h4 class="app-card-title">
    <slot />
  </h4>
</template>

<script setup lang="ts">
// AppCardTitle组件
</script>

<style scoped lang="scss">
.app-card-title {
  font-size: var(--text-lg, var(--text-xl));
  font-weight: 600;
  color: var(--text-primary, var(--text-primary));
  margin: 0;
}
</style>