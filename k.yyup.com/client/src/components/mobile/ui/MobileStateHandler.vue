<template>
  <div class="mobile-state-handler" :class="{ fullscreen }">
    <!-- 加载状态 -->
    <MobileLoading
      v-if="loading"
      :type="loadingType"
      :size="loadingSize"
      :color="loadingColor"
      :text="loadingText"
      :show-overlay="showOverlay"
      :overlay-color="overlayColor"
      :fullscreen="fullscreen"
      :show-progress="showProgress"
      :progress="progress"
    >
      <template v-if="$slots.loadingIcon" #icon>
        <slot name="loadingIcon"></slot>
      </template>
    </MobileLoading>

    <!-- 错误状态 -->
    <MobileError
      v-else-if="error"
      :type="errorType"
      :size="errorSize"
      :title="errorTitle"
      :description="errorDescription"
      :details="errorDetails"
      :show-details="showErrorDetails"
      :show-retry="showRetry"
      :retry-text="retryText"
      :show-cancel="showCancel"
      :cancel-text="cancelText"
      :show-overlay="showOverlay"
      :overlay-color="overlayColor"
      :fullscreen="fullscreen"
      :retrying="retrying"
      @retry="handleRetry"
      @cancel="handleCancel"
      @close="handleClose"
    >
      <template v-if="$slots.errorIcon" #icon>
        <slot name="errorIcon"></slot>
      </template>
      <template v-if="$slots.errorContent" #content>
        <slot name="errorContent"></slot>
      </template>
      <template v-if="$slots.errorActions" #actions>
        <slot name="errorActions"></slot>
      </template>
    </MobileError>

    <!-- 空状态 -->
    <div v-else-if="empty" class="empty-state">
      <!-- 空状态图标 -->
      <div class="empty-icon">
        <slot name="emptyIcon">
          <van-empty
            :image="emptyImage"
            :image-size="emptyImageSize"
            :description="emptyText"
          />
        </slot>
      </div>

      <!-- 空状态内容 -->
      <div v-if="$slots.emptyContent" class="empty-content">
        <slot name="emptyContent"></slot>
      </div>

      <!-- 空状态操作 -->
      <div v-if="$slots.emptyActions" class="empty-actions">
        <slot name="emptyActions"></slot>
      </div>
    </div>

    <!-- 正常内容 -->
    <div v-else class="content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MobileLoading from './MobileLoading.vue'
import MobileError from './MobileError.vue'

interface Props {
  // 状态控制
  loading?: boolean
  error?: boolean
  empty?: boolean

  // 加载相关
  loadingType?: 'spinner' | 'circle' | 'dots' | 'pulse' | 'skeleton' | 'custom'
  loadingSize?: 'small' | 'medium' | 'large'
  loadingColor?: string
  loadingText?: string
  showProgress?: boolean
  progress?: number

  // 错误相关
  errorType?: 'network' | 'permission' | 'not-found' | 'server' | 'validation' | 'custom'
  errorSize?: 'small' | 'medium' | 'large'
  errorTitle?: string
  errorDescription?: string
  errorDetails?: string
  showErrorDetails?: boolean
  showRetry?: boolean
  retryText?: string
  showCancel?: boolean
  cancelText?: string
  retrying?: boolean

  // 空状态相关
  emptyText?: string
  emptyImage?: string
  emptyImageSize?: number

  // 通用配置
  showOverlay?: boolean
  overlayColor?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: false,
  empty: false,
  loadingType: 'spinner',
  loadingSize: 'medium',
  loadingColor: 'var(--primary-color)',
  loadingText: '加载中...',
  showProgress: false,
  progress: undefined,
  errorType: 'custom',
  errorSize: 'medium',
  errorTitle: '',
  errorDescription: '',
  errorDetails: '',
  showErrorDetails: false,
  showRetry: true,
  retryText: '重试',
  showCancel: false,
  cancelText: '取消',
  retrying: false,
  emptyText: '暂无数据',
  emptyImage: 'default',
  emptyImageSize: 100,
  showOverlay: false,
  overlayColor: 'rgba(0, 0, 0, 0.3)',
  fullscreen: false
})

const emit = defineEmits<{
  retry: []
  cancel: []
  close: []
}>()

// 计算默认错误信息
const defaultErrorTitle = computed(() => {
  if (props.errorTitle) return props.errorTitle

  const titleMap = {
    network: '网络连接失败',
    permission: '权限不足',
    'not-found': '页面不存在',
    server: '服务器错误',
    validation: '数据验证失败',
    custom: '操作失败'
  }
  return titleMap[props.errorType] || '操作失败'
})

const defaultErrorDescription = computed(() => {
  if (props.errorDescription) return props.errorDescription

  const descriptionMap = {
    network: '请检查网络连接后重试',
    permission: '您没有权限执行此操作',
    'not-found': '您访问的页面不存在或已被移除',
    server: '服务器暂时无法响应，请稍后重试',
    validation: '请检查输入信息是否正确',
    custom: '操作过程中出现错误'
  }
  return descriptionMap[props.errorType] || '操作过程中出现错误'
})

// 事件处理
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

.mobile-state-handler {
  position: relative;
  width: 100%;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-modal);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: var(--mobile-padding-lg);
    text-align: center;

    .empty-icon {
      margin-bottom: var(--mobile-gap);
    }

    .empty-content {
      margin-bottom: var(--mobile-gap);
      color: var(--text-secondary);
      font-size: var(--mobile-text-base);
      line-height: 1.5;
    }

    .empty-actions {
      display: flex;
      flex-direction: column;
      gap: var(--mobile-gap-sm);
      align-items: center;

      :deep(.van-button) {
        min-width: 120px;
      }
    }
  }

  .content-wrapper {
    width: 100%;
  }
}

/* 响应式适配 */
@media (max-width: 479px) {
  .mobile-state-handler {
    .empty-state {
      min-height: 250px;
      padding: var(--mobile-padding);

      .empty-content {
        font-size: var(--mobile-text-sm);
      }

      .empty-actions {
        :deep(.van-button) {
          width: 100%;
          max-width: 200px;
        }
      }
    }
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 600px) {
  .mobile-state-handler {
    .empty-state {
      min-height: 200px;
      padding: var(--mobile-gap);
    }
  }
}
</style>