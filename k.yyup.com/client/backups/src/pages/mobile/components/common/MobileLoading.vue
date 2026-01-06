<template>
  <div class="mobile-loading-overlay">
    <div class="mobile-loading-content">
      <div class="mobile-loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p v-if="text" class="mobile-loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.mobile-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--black-alpha-50);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.mobile-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--text-lg);
}

.mobile-loading-spinner {
  position: relative;
  width: var(--icon-size); height: var(--icon-size);
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid var(--bg-white);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
  
  &:nth-child(2) {
    animation-delay: 0.1s;
    opacity: 0.8;
  }
  
  &:nth-child(3) {
    animation-delay: 0.2s;
    opacity: 0.6;
  }
}

.mobile-loading-text {
  color: var(--bg-color);
  font-size: var(--text-base);
  margin: 0;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
