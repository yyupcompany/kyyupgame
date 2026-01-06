<!--
  AI 加载消息组件 - Qoder简约风格
-->

<template>
  <div class="event-row loading">
    <div class="event-header">
      <span class="event-spinner"></span>
      <span class="event-label">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: '正在思考...'
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入

.event-row {
  padding: var(--spacing-xs) 0;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 0 var(--spacing-xs);
  height: 24px;
}

.event-spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.event-label {
  flex: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

