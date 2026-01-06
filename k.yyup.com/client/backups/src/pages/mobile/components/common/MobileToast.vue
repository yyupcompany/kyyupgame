<template>
  <Transition name="toast">
    <div v-if="show" class="mobile-toast" :class="toastClass">
      <div class="mobile-toast-icon">
        <svg v-if="type === 'success'" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <svg v-else-if="type === 'error'" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <svg v-else-if="type === 'warning'" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      <span class="mobile-toast-message">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show?: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  type: 'info'
})

const emit = defineEmits<{
  close: []
}>()

const toastClass = computed(() => {
  return `mobile-toast-${props.type}`
})
</script>

<style lang="scss" scoped>
.mobile-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm) var(--text-lg);
  background-color: var(--black-alpha-80);
  color: var(--bg-color);
  border-radius: var(--spacing-sm);
  font-size: var(--text-base);
  max-width: 280px;
  z-index: 10000;
  backdrop-filter: blur(10px);
  
  &.mobile-toast-success {
    background-color: rgba(76, 175, 80, 0.9);
  }
  
  &.mobile-toast-error {
    background-color: rgba(244, 67, 54, 0.9);
  }
  
  &.mobile-toast-warning {
    background-color: rgba(255, 152, 0, 0.9);
  }
  
  &.mobile-toast-info {
    background-color: rgba(33, 150, 243, 0.9);
  }
}

.mobile-toast-icon {
  width: var(--text-2xl);
  height: var(--text-2xl);
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}

.mobile-toast-message {
  line-height: 1.4;
  word-break: break-word;
}

// 动画
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>
