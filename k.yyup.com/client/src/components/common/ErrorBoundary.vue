<template>
  <div class="error-boundary">
    <!-- 当有错误时显示错误界面 -->
    <div v-if="hasError" class="error-container">
      <EmptyState 
        :type="errorType"
        :title="errorTitle"
        :description="errorDescription"
        :primary-action="primaryAction"
        :secondary-action="secondaryAction"
        size="large"
      >
        <template #extra v-if="showDetails">
          <div class="error-details">
            <el-collapse v-model="detailsExpanded">
              <el-collapse-item title="错误详情" name="details">
                <div class="error-detail-content">
                  <div class="error-info">
                    <strong>错误类型:</strong> {{ errorInfo.type }}
                  </div>
                  <div class="error-info" v-if="errorInfo.message">
                    <strong>错误信息:</strong> {{ errorInfo.message }}
                  </div>
                  <div class="error-info" v-if="errorInfo.stack && isDev">
                    <strong>错误堆栈:</strong>
                    <pre class="error-stack">{{ errorInfo.stack }}</pre>
                  </div>
                  <div class="error-info">
                    <strong>时间:</strong> {{ errorInfo.time }}
                  </div>
                  <div class="error-info">
                    <strong>页面:</strong> {{ errorInfo.route }}
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </template>
      </EmptyState>
    </div>
    
    <!-- 正常情况下显示子组件 -->
    <div v-else class="error-boundary-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured, onMounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import EmptyState from './EmptyState.vue'
import { ErrorHandler, ErrorCode, type ErrorInfo } from '@/utils/errorHandler'

interface Props {
  // 是否显示详细错误信息
  showDetails?: boolean
  // 是否自动重试
  autoRetry?: boolean
  // 重试次数
  maxRetries?: number
  // 重试间隔（毫秒）
  retryDelay?: number
  // 是否显示通知
  showNotification?: boolean
  // 自定义错误处理器
  onError?: (error: Error, errorInfo: any) => void
  // 自定义恢复处理器
  onRecover?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: true,
  autoRetry: false,
  maxRetries: 3,
  retryDelay: 1000,
  showNotification: true
})

const emit = defineEmits<{
  error: [error: Error, errorInfo: any]
  recover: []
  retry: [attempt: number]
}>()

const route = useRoute()
const router = useRouter()

// 状态管理
const hasError = ref(false)
const errorInfo = ref<any>({})
const retryCount = ref(0)
const detailsExpanded = ref([])

// 环境判断
const isDev = computed(() => import.meta.env.DEV)

// 错误类型计算
const errorType = computed(() => {
  if (!hasError.value) return 'no-data'
  
  const errorCode = errorInfo.value.code
  switch (errorCode) {
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.TIMEOUT:
      return 'network'
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.INSUFFICIENT_PERMISSION:
      return 'forbidden'
    case ErrorCode.NOT_FOUND:
      return 'error'
    default:
      return 'error'
  }
})

// 错误标题计算
const errorTitle = computed(() => {
  if (!hasError.value) return ''
  
  const errorCode = errorInfo.value.code
  switch (errorCode) {
    case ErrorCode.NETWORK_ERROR:
      return '网络连接异常'
    case ErrorCode.TIMEOUT:
      return '请求超时'
    case ErrorCode.UNAUTHORIZED:
      return '未授权访问'
    case ErrorCode.INSUFFICIENT_PERMISSION:
      return '权限不足'
    case ErrorCode.NOT_FOUND:
      return '页面不存在'
    case ErrorCode.VALIDATION_ERROR:
      return '数据验证失败'
    default:
      return '页面出现错误'
  }
})

// 错误描述计算
const errorDescription = computed(() => {
  if (!hasError.value) return ''
  
  return errorInfo.value.userMessage || 
         ErrorHandler.createUserFriendlyMessage(errorInfo.value.originalError) ||
         '页面遇到了一些问题，请尝试刷新页面或联系管理员'
})

// 主要操作按钮
const primaryAction = computed(() => {
  if (!hasError.value) return undefined
  
  const errorCode = errorInfo.value.code
  
  return {
    text: getActionText(errorCode),
    handler: () => handlePrimaryAction(errorCode)
  }
})

// 次要操作按钮
const secondaryAction = computed(() => {
  if (!hasError.value) return undefined
  
  return {
    text: '返回首页',
    handler: () => router.push('/')
  }
})

// 获取操作按钮文本
const getActionText = (errorCode: ErrorCode): string => {
  switch (errorCode) {
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.TIMEOUT:
      return '重试'
    case ErrorCode.UNAUTHORIZED:
      return '重新登录'
    case ErrorCode.NOT_FOUND:
      return '刷新页面'
    default:
      return '重新加载'
  }
}

// 处理主要操作
const handlePrimaryAction = (errorCode: ErrorCode) => {
  switch (errorCode) {
    case ErrorCode.UNAUTHORIZED:
      handleReauth()
      break
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.TIMEOUT:
      handleRetry()
      break
    default:
      handleRefresh()
  }
}

// 处理重新认证
const handleReauth = () => {
  // 清除认证信息
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken') 
  localStorage.removeItem('userInfo')
  
  // 跳转到登录页
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

// 处理重试
const handleRetry = async () => {
  if (retryCount.value >= props.maxRetries) {
    ElMessage.warning('已达到最大重试次数')
    return
  }
  
  retryCount.value++
  emit('retry', retryCount.value)
  
  try {
    // 等待重试间隔
    await new Promise(resolve => setTimeout(resolve, props.retryDelay))
    
    // 重置错误状态
    hasError.value = false
    errorInfo.value = {}
    
    ElMessage.success('正在重试...')
    
    // 如果有自定义恢复处理器，调用它
    if (props.onRecover) {
      props.onRecover()
    }
    
    emit('recover')
    
  } catch (error) {
    console.error('重试失败:', error)
    ElMessage.error('重试失败，请检查网络连接')
  }
}

// 处理刷新
const handleRefresh = () => {
  window.location.reload()
}

// 捕获组件错误
onErrorCaptured((error: Error, instance: any, info: string) => {
  console.error('组件错误捕获:', error, info)
  
  // 解析错误信息
  const parsedError = ErrorHandler.parseError(error)
  
  // 设置错误状态
  hasError.value = true
  errorInfo.value = {
    ...parsedError,
    originalError: error,
    instance,
    info,
    route: route.fullPath,
    time: new Date().toLocaleString(),
    userMessage: ErrorHandler.createUserFriendlyMessage(error)
  }
  
  // 显示通知
  if (props.showNotification) {
    showErrorNotification(parsedError)
  }
  
  // 调用自定义错误处理器
  if (props.onError) {
    props.onError(error, errorInfo.value)
  }
  
  // 发送错误事件
  emit('error', error, errorInfo.value)
  
  // 阻止错误继续传播
  return false
})

// 显示错误通知
const showErrorNotification = (error: ErrorInfo) => {
  const isNetworkError = error.code === ErrorCode.NETWORK_ERROR || 
                        error.code === ErrorCode.TIMEOUT
  
  if (isNetworkError) {
    ElNotification.error({
      title: '连接错误',
      message: '网络连接出现问题，请检查网络后重试',
      duration: 5000,
      showClose: true
    })
  } else {
    ElNotification.error({
      title: '页面错误',
      message: error.message || '页面遇到了一些问题',
      duration: 4000,
      showClose: true
    })
  }
}

// 提供错误边界上下文
provide('errorBoundary', {
  captureError: (error: Error) => {
    hasError.value = true
    errorInfo.value = {
      ...ErrorHandler.parseError(error),
      originalError: error,
      route: route.fullPath,
      time: new Date().toLocaleString(),
      userMessage: ErrorHandler.createUserFriendlyMessage(error)
    }
  },
  
  clearError: () => {
    hasError.value = false
    errorInfo.value = {}
    retryCount.value = 0
  }
})

// 自动重试机制
onMounted(() => {
  if (props.autoRetry && hasError.value) {
    const networkErrors = [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT]
    if (networkErrors.includes(errorInfo.value.code)) {
      setTimeout(() => {
        handleRetry()
      }, props.retryDelay)
    }
  }
})

// 暴露方法给父组件
defineExpose({
  captureError: (error: Error) => {
    hasError.value = true
    errorInfo.value = {
      ...ErrorHandler.parseError(error),
      originalError: error,
      route: route.fullPath,
      time: new Date().toLocaleString(),
      userMessage: ErrorHandler.createUserFriendlyMessage(error)
    }
  },
  
  clearError: () => {
    hasError.value = false
    errorInfo.value = {}
    retryCount.value = 0
  },
  
  retry: handleRetry,
  
  hasError: () => hasError.value
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.error-boundary {
  width: 100%;
  height: 100%;
  
  .error-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .error-boundary-content {
    width: 100%;
    height: 100%;
  }
}

.error-details {
  margin-top: 1.5rem;
  max-width: 100%; max-width: 600px;
  
  .error-detail-content {
    background: var(--el-bg-color-page);
    border-radius: var(--radius-md);
    padding: 1rem;
    
    .error-info {
      margin-bottom: 0.5rem;
      font-size: var(--text-sm);
      
      strong {
        color: var(--el-text-color-primary);
        margin-right: 0.5rem;
      }
    }
    
    .error-stack {
      background: var(--el-fill-color-darker);
      color: var(--el-text-color-primary);
      padding: 0.5rem;
      border-radius: var(--spacing-xs);
      font-size: var(--text-xs);
      line-height: 1.4;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      max-min-height: 60px; height: auto;
      overflow-y: auto;
    }
  }
}

:deep(.el-collapse) {
  border: none;
  
  .el-collapse-item__header {
    background: var(--el-bg-color);
    border-bottom: var(--z-index-dropdown) solid var(--el-border-color-lighter);
    color: var(--el-text-color-primary);
    font-size: var(--text-sm);
    padding: 0 1rem;
    height: var(--button-height-lg);
    line-height: var(--button-height-lg);
  }
  
  .el-collapse-item__content {
    padding: 1rem;
    background: var(--el-bg-color);
  }
  
  .el-collapse-item__wrap {
    border-bottom: none;
  }
}
</style>