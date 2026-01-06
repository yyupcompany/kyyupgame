/**
 * 错误处理组合式函数
 * 提供组件级别的错误处理能力
 */
import { ref, onErrorCaptured } from 'vue'
import { ErrorHandler, ErrorCode } from '../utils/errorHandler'

export function useErrorHandler() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasError = ref(false)

  // 清除错误状态
  const clearError = () => {
    error.value = null
    hasError.value = false
  }

  // 处理错误
  const handleError = (err: any, showMessage = true) => {
    console.error('组件错误:', err)
    
    const errorInfo = ErrorHandler.handle(err, showMessage)
    error.value = errorInfo.message
    hasError.value = true
    
    return errorInfo
  }

  // 安全执行异步操作
  const safeAsync = async <T>(
    asyncFn: () => Promise<T>,
    options: {
      loadingRef?: typeof isLoading
      showMessage?: boolean
      fallback?: T
    } = {}
  ): Promise<T | undefined> => {
    const { loadingRef = isLoading, showMessage = true, fallback } = options
    
    try {
      loadingRef.value = true
      clearError()
      return await asyncFn()
    } catch (err) {
      handleError(err, showMessage)
      return fallback
    } finally {
      loadingRef.value = false
    }
  }

  // 重试机制
  const retry = async <T>(
    asyncFn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T | undefined> => {
    let lastError: any
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        clearError()
        return await asyncFn()
      } catch (err) {
        lastError = err
        console.warn(`操作失败，第${i + 1}次尝试:`, err)
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }
    
    handleError(lastError, true)
    return undefined
  }

  // 捕获组件内的错误
  onErrorCaptured((err, _instance, info) => {
    console.error('组件内捕获错误:', err, info)
    handleError(err, true)

    // 返回false阻止错误继续传播
    return false
  })

  // 创建错误边界
  const createErrorBoundary = (fallbackComponent?: any) => {
    return {
      onErrorCaptured: (err: any, _instance: any, _info: string) => {
        handleError(err, true)
        return fallbackComponent ? true : false
      }
    }
  }

  // 表单验证错误处理
  const handleFormError = (formErrors: Record<string, string>) => {
    const errorMessage = Object.values(formErrors)[0]
    if (errorMessage) {
      error.value = errorMessage
      hasError.value = true
      ErrorHandler.handleFormErrors(formErrors, true)
    }
    return formErrors
  }

  // 网络错误重试提示
  const handleNetworkError = (err: any) => {
    const errorInfo = ErrorHandler.parseError(err)
    
    if (errorInfo.code === ErrorCode.NETWORK_ERROR || errorInfo.code === ErrorCode.TIMEOUT) {
      return {
        canRetry: true,
        suggestion: ErrorHandler.getRecoverySuggestion(errorInfo.code)
      }
    }
    
    return {
      canRetry: false,
      suggestion: ErrorHandler.getRecoverySuggestion(errorInfo.code)
    }
  }

  return {
    // 状态
    isLoading,
    error,
    hasError,
    
    // 方法
    clearError,
    handleError,
    safeAsync,
    retry,
    createErrorBoundary,
    handleFormError,
    handleNetworkError
  }
}

// 全局错误处理器实例
export const globalErrorHandler = useErrorHandler()