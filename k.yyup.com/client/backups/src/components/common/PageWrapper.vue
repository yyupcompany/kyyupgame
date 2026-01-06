<template>
  <div class="page-wrapper">
    <!-- 错误边界包装 -->
    <ErrorBoundary
      ref="errorBoundaryRef"
      :show-details="showDetails"
      :auto-retry="autoRetry"
      :max-retries="maxRetries"
      :retry-delay="retryDelay"
      :show-notification="showNotification"
      @error="handleError"
      @recover="handleRecover"
      @retry="handleRetry"
    >
      <!-- 页面加载状态 -->
      <LoadingState
        v-if="pageLoading"
        :variant="loadingVariant"
        :size="loadingSize"
        :text="loadingText"
        :tip="loadingTip"
        :spinner-type="spinnerType"
        :cancelable="cancelable"
        :show-progress="showProgress"
        :progress="progress"
        @cancel="handleCancel"
      />
      
      <!-- 页面内容 -->
      <div v-else class="page-content">
        <!-- 页面标题和操作区域 -->
        <div v-if="showHeader" class="page-header">
          <div class="page-title-section">
            <h1 v-if="title" class="page-title">{{ title }}</h1>
            <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
          </div>
          
          <div v-if="$slots.actions" class="page-actions">
            <slot name="actions" />
          </div>
        </div>
        
        <!-- 页面主体内容 -->
        <div class="page-body">
          <!-- 数据为空时显示空状态 -->
          <EmptyState
            v-if="showEmptyState"
            v-bind="emptyStateConfig"
            @primary-action="handleEmptyPrimaryAction"
            @secondary-action="handleEmptySecondaryAction"
            @extra-action="handleEmptyExtraAction"
          />
          
          <!-- 正常页面内容 -->
          <div v-else class="page-main">
            <slot />
          </div>
        </div>
        
        <!-- 页面底部 -->
        <div v-if="$slots.footer" class="page-footer">
          <slot name="footer" />
        </div>
      </div>
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ErrorBoundary from './ErrorBoundary.vue'
import LoadingState from './LoadingState.vue'
import EmptyState from './EmptyState.vue'
import { usePageState, type PageStateOptions } from '@/composables/usePageState'
import type { EmptyStateConfig } from '@/utils/emptyStateHelper'

interface Props {
  // 页面标题
  title?: string
  // 页面副标题
  subtitle?: string
  // 是否显示页面头部
  showHeader?: boolean
  // 是否显示详细错误信息
  showDetails?: boolean
  // 是否自动重试
  autoRetry?: boolean
  // 最大重试次数
  maxRetries?: number
  // 重试延迟
  retryDelay?: number
  // 是否显示错误通知
  showNotification?: boolean
  
  // 加载状态相关
  pageLoading?: boolean
  loadingVariant?: 'default' | 'minimal' | 'card' | 'page'
  loadingSize?: 'small' | 'medium' | 'large'
  loadingText?: string
  loadingTip?: string
  spinnerType?: 'default' | 'dots' | 'circle' | 'pulse' | 'bars'
  cancelable?: boolean
  showProgress?: boolean
  progress?: number
  
  // 空状态相关
  emptyStateConfig?: EmptyStateConfig
  autoEmptyState?: boolean
  entityName?: string
  
  // 页面状态管理选项
  pageStateOptions?: PageStateOptions
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showDetails: true,
  autoRetry: false,
  maxRetries: 3,
  retryDelay: 1000,
  showNotification: true,
  
  pageLoading: false,
  loadingVariant: 'page',
  loadingSize: 'medium',
  spinnerType: 'default',
  cancelable: false,
  showProgress: false,
  
  autoEmptyState: true,
  entityName: '数据'
})

const emit = defineEmits<{
  error: [error: Error, errorInfo: any]
  recover: []
  retry: [attempt: number]
  cancel: []
  emptyPrimaryAction: []
  emptySecondaryAction: []
  emptyExtraAction: [index: number, action: any]
}>()

const route = useRoute()
const router = useRouter()

// 页面状态管理
const pageState = props.pageStateOptions 
  ? usePageState(props.pageStateOptions)
  : usePageState({ entityName: props.entityName })

// 错误边界引用
const errorBoundaryRef = ref<InstanceType<typeof ErrorBoundary> | null>(null)

// 是否显示空状态
const showEmptyState = computed(() => {
  if (!props.autoEmptyState || props.pageLoading) return false
  
  // 如果有自定义空状态配置，使用它
  if (props.emptyStateConfig) {
    return true
  }
  
  // 否则根据页面状态自动判断
  return pageState.emptyStateConfig.value !== null
})

// 最终的空状态配置
const finalEmptyStateConfig = computed(() => {
  return props.emptyStateConfig || pageState.emptyStateConfig.value || {}
})

// 错误处理
const handleError = (error: Error, errorInfo: any) => {
  console.error('页面错误:', error, errorInfo)
  emit('error', error, errorInfo)
}

// 恢复处理
const handleRecover = () => {
  emit('recover')
}

// 重试处理
const handleRetry = (attempt: number) => {
  emit('retry', attempt)
}

// 取消处理
const handleCancel = () => {
  emit('cancel')
}

// 空状态操作处理
const handleEmptyPrimaryAction = () => {
  emit('emptyPrimaryAction')
}

const handleEmptySecondaryAction = () => {
  emit('emptySecondaryAction')
}

const handleEmptyExtraAction = (index: number, action: any) => {
  emit('emptyExtraAction', index, action)
}

// 提供页面状态给子组件
provide('pageState', pageState)
provide('pageWrapper', {
  showError: (error: Error) => {
    if (errorBoundaryRef.value) {
      errorBoundaryRef.value.captureError(error)
    }
  },
  clearError: () => {
    if (errorBoundaryRef.value) {
      errorBoundaryRef.value.clearError()
    }
  },
  retry: () => {
    if (errorBoundaryRef.value) {
      errorBoundaryRef.value.retry()
    }
  }
})

// 暴露方法给父组件
defineExpose({
  pageState,
  showError: (error: Error) => {
    if (errorBoundaryRef.value) {
      errorBoundaryRef.value.captureError(error)
    }
  },
  clearError: () => {
    if (errorBoundaryRef.value) {
      errorBoundaryRef.value.clearError()
    }
    pageState.resetState()
  },
  retry: () => {
    if (errorBoundaryRef.value) {
      errorBoundaryRef.value.retry()
    }
  }
})
</script>

<style scoped lang="scss">

.page-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; // 防止 flex 子项溢出
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  .page-title-section {
    flex: 1;
    min-width: 0; // 防止标题过长时溢出
    
    .page-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--el-text-color-primary);
      line-height: 1.3;
    }
    
    .page-subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
    }
  }
  
  .page-actions {
    flex-shrink: 0;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }
}

.page-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.page-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    
    .page-actions {
      align-self: stretch;
      justify-content: flex-start;
    }
  }
  
  .page-title-section {
    .page-title {
      font-size: 1.25rem;
    }
    
    .page-subtitle {
      font-size: 0.8rem;
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .page-header {
    margin-bottom: 1rem;
    
    .page-actions {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .page-footer {
    border-top-color: var(--el-border-color);
  }
}
</style>