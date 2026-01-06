<template>
  <div class="mobile-error" :class="[`error-${type}`, { fullscreen }]">
    <!-- 背景遮罩 -->
    <div
      v-if="showOverlay"
      class="error-overlay"
      :style="{ backgroundColor: overlayColor }"
    ></div>

    <!-- 错误内容容器 -->
    <div class="error-container" :class="[`container-${size}`, { 'with-actions': hasActions }]">
      <!-- 错误图标 -->
      <div class="error-icon">
        <!-- 内置错误图标 -->
        <div v-if="useBuiltinIcon" class="builtin-icon" :class="iconClass">
          <van-icon :name="iconName" :size="iconSize" :color="iconColor" />
        </div>

        <!-- 自定义图标插槽 -->
        <slot name="icon" v-else>
          <van-icon name="warning-o" :size="iconSize" :color="iconColor" />
        </slot>
      </div>

      <!-- 错误信息 -->
      <div class="error-content">
        <!-- 错误标题 -->
        <h3 v-if="title" class="error-title">{{ title }}</h3>

        <!-- 错误描述 -->
        <p v-if="description" class="error-description">{{ description }}</p>

        <!-- 错误详情 -->
        <div v-if="showDetails && details" class="error-details">
          <div class="details-header" @click="toggleDetails">
            <span>错误详情</span>
            <van-icon
              :name="showDetailsContent ? 'arrow-up' : 'arrow-down'"
              size="16px"
            />
          </div>
          <div v-show="showDetailsContent" class="details-content">
            <pre>{{ details }}</pre>
          </div>
        </div>

        <!-- 自定义内容插槽 -->
        <slot name="content"></slot>
      </div>

      <!-- 操作按钮 -->
      <div v-if="hasActions" class="error-actions">
        <!-- 重试按钮 -->
        <van-button
          v-if="showRetry"
          type="primary"
          :size="buttonSize"
          :loading="retrying"
          @click="handleRetry"
        >
          {{ retryText }}
        </van-button>

        <!-- 取消按钮 -->
        <van-button
          v-if="showCancel"
          :size="buttonSize"
          @click="handleCancel"
        >
          {{ cancelText }}
        </van-button>

        <!-- 自定义操作插槽 -->
        <slot name="actions"></slot>
      </div>

      <!-- 关闭按钮（仅全屏模式） -->
      <div
        v-if="fullscreen && showClose"
        class="error-close"
        @click="handleClose"
      >
        <van-icon name="close" size="18px" color="var(--text-secondary)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  type?: 'network' | 'permission' | 'not-found' | 'server' | 'validation' | 'custom'
  size?: 'small' | 'medium' | 'large'
  title?: string
  description?: string
  details?: string
  showDetails?: boolean
  showRetry?: boolean
  retryText?: string
  showCancel?: boolean
  cancelText?: string
  showOverlay?: boolean
  overlayColor?: string
  fullscreen?: boolean
  showClose?: boolean
  useBuiltinIcon?: boolean
  retrying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'custom',
  size: 'medium',
  title: '',
  description: '',
  details: '',
  showDetails: false,
  showRetry: true,
  retryText: '重试',
  showCancel: false,
  cancelText: '取消',
  showOverlay: false,
  overlayColor: 'rgba(0, 0, 0, 0.3)',
  fullscreen: false,
  showClose: true,
  useBuiltinIcon: true,
  retrying: false
})

const emit = defineEmits<{
  retry: []
  cancel: []
  close: []
}>()

const showDetailsContent = ref(false)

// 计算属性
const iconSize = computed(() => {
  const sizeMap = {
    small: '32px',
    medium: '48px',
    large: '64px'
  }
  return sizeMap[props.size]
})

const iconColor = computed(() => {
  const colorMap = {
    network: 'var(--warning-color)',
    permission: 'var(--danger-color)',
    'not-found': 'var(--text-secondary)',
    server: 'var(--danger-color)',
    validation: 'var(--warning-color)',
    custom: 'var(--primary-color)'
  }
  return colorMap[props.type]
})

const iconName = computed(() => {
  const nameMap = {
    network: 'warning-o',
    permission: 'lock',
    'not-found': 'search-fail',
    server: 'close-circle',
    validation: 'info-o',
    custom: 'warning-o'
  }
  return nameMap[props.type]
})

const iconClass = computed(() => {
  const classMap = {
    network: 'icon-warning',
    permission: 'icon-danger',
    'not-found': 'icon-secondary',
    server: 'icon-danger',
    validation: 'icon-warning',
    custom: 'icon-primary'
  }
  return classMap[props.type]
})

const buttonSize = computed(() => {
  return props.size === 'large' ? 'large' : 'normal'
})

const hasActions = computed(() => {
  return props.showRetry || props.showCancel || !!$slots.actions
})

// 方法
const toggleDetails = () => {
  showDetailsContent.value = !showDetailsContent.value
}

const handleRetry = () => {
  emit('retry')
}

const handleCancel = () => {
  emit('cancel')
}

const handleClose = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-error {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: var(--mobile-padding);

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-modal);
    min-height: 100vh;
    padding: var(--mobile-padding-lg);
  }

  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }

  .error-container {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 400px;
    width: 100%;

    &.container-small {
      .error-title {
        font-size: var(--mobile-text-base);
      }

      .error-description {
        font-size: var(--mobile-text-sm);
      }
    }

    &.container-medium {
      .error-title {
        font-size: var(--mobile-text-lg);
      }

      .error-description {
        font-size: var(--mobile-text-base);
      }
    }

    &.container-large {
      .error-title {
        font-size: var(--mobile-text-xl);
      }

      .error-description {
        font-size: var(--mobile-text-lg);
      }
    }

    &.with-actions {
      background: var(--bg-color);
      border-radius: var(--mobile-radius-lg);
      box-shadow: var(--mobile-shadow-lg);
      padding: var(--mobile-padding-lg);
    }
  }

  .error-icon {
    margin-bottom: var(--mobile-gap);

    .builtin-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--bg-color-light);

      &.icon-warning {
        background: rgba(255, 193, 7, 0.1);
      }

      &.icon-danger {
        background: rgba(220, 53, 69, 0.1);
      }

      &.icon-secondary {
        background: var(--bg-color-page);
      }

      &.icon-primary {
        background: rgba(64, 158, 255, 0.1);
      }
    }
  }

  .error-content {
    margin-bottom: var(--mobile-gap);

    .error-title {
      margin: 0 0 var(--mobile-gap-sm) 0;
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      line-height: 1.3;
    }

    .error-description {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .error-details {
      margin-top: var(--mobile-gap);
      background: var(--bg-color-light);
      border-radius: var(--mobile-radius-md);
      overflow: hidden;

      .details-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--mobile-gap-sm) var(--mobile-gap);
        cursor: pointer;
        user-select: none;
        font-size: var(--mobile-text-sm);
        color: var(--text-secondary);
        transition: background-color var(--mobile-transition-fast);

        &:hover {
          background: var(--bg-color-page);
        }
      }

      .details-content {
        padding: var(--mobile-gap);
        border-top: 1px solid var(--border-color-light);
        background: var(--bg-color);

        pre {
          margin: 0;
          font-size: var(--mobile-text-xs);
          color: var(--text-tertiary);
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 200px;
          overflow-y: auto;
        }
      }
    }
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: var(--mobile-gap-sm);
    width: 100%;

    :deep(.van-button) {
      width: 100%;
      min-height: 44px;
    }
  }

  .error-close {
    position: absolute;
    top: var(--mobile-gap);
    right: var(--mobile-gap);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--bg-color);
    cursor: pointer;
    transition: all var(--mobile-transition-fast);

    &:hover {
      background: var(--bg-color-light);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

/* 错误类型样式 */
.mobile-error {
  &.error-network {
    .error-icon {
      animation: shake 0.5s ease-in-out;
    }
  }

  &.error-permission {
    .error-icon {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  &.error-server {
    .error-icon {
      animation: bounceIn 0.6s ease-out;
    }
  }
}

/* 动画定义 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

/* 响应式适配 */
@media (max-width: 479px) {
  .mobile-error {
    .error-container {
      &.with-actions {
        margin: 0 var(--mobile-gap);
        max-width: calc(100vw - 32px);
      }

      .error-icon {
        .builtin-icon {
          width: 64px;
          height: 64px;
        }
      }
    }
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 600px) {
  .mobile-error {
    .error-container {
      .error-icon {
        margin-bottom: var(--mobile-gap-sm);

        .builtin-icon {
          width: 60px;
          height: 60px;
        }
      }

      .error-content {
        margin-bottom: var(--mobile-gap-sm);
      }
    }
  }
}
</style>