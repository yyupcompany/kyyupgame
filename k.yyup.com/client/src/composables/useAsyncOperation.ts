/**
 * 异步操作组合函数
 * 提供统一的异步操作状态管理和错误处理
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

export interface AsyncOperationConfig<T = any> {
  // 操作函数
  operation: (...args: any[]) => Promise<T>
  // 初始化时是否自动执行
  immediate?: boolean
  // 重试配置
  retry?: {
    times: number
    delay: number
    backoff?: number
  }
  // 超时时间（毫秒）
  timeout?: number
  // 成功回调
  onSuccess?: (data: T) => void
  // 错误回调
  onError?: (error: Error) => void
  // 完成回调（无论成功失败）
  onFinally?: () => void
  // 错误消息配置
  errorMessage?: {
    show: boolean
    custom?: (error: Error) => string
  }
  // 缓存配置
  cache?: {
    key: string
    duration: number
  }
  // 防抖配置
  debounce?: {
    delay: number
  }
  // 节流配置
  throttle?: {
    delay: number
  }
}

/**
 * 缓存管理
 */
const operationCache = new Map<string, {
  data: any
  timestamp: number
  expireTime: number
}>()

/**
 * 防抖和节流管理
 */
const debounceTimers = new Map<string, NodeJS.Timeout>()
const throttleTimers = new Map<string, { timer: NodeJS.Timeout | null; lastExec: number }>()

export function useAsyncOperation<T = any>(config: AsyncOperationConfig<T>) {
  const {
    operation,
    immediate = false,
    retry,
    timeout = 30000,
    onSuccess,
    onError,
    onFinally,
    errorMessage = { show: true },
    cache,
    debounce,
    throttle
  } = config

  // 状态管理
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)
  const abortController = ref<AbortController | null>(null)

  // 计算属性
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const hasData = computed(() => data.value !== null)
  const isEmpty = computed(() => !loading.value && !hasError.value && !hasData.value)

  // 缓存操作
  const getCachedData = (): T | null => {
    if (!cache) return null
    
    const cached = operationCache.get(cache.key)
    if (cached && Date.now() < cached.expireTime) {
      console.log(`📦 使用缓存数据: ${cache.key}`)
      return cached.data
    }
    
    return null
  }

  const setCachedData = (value: T) => {
    if (!cache) return
    
    operationCache.set(cache.key, {
      data: value,
      timestamp: Date.now(),
      expireTime: Date.now() + cache.duration
    })
  }

  // 防抖处理
  const debounceExecute = (fn: Function, args: any[]) => {
    if (!debounce) {
      fn(...args)
      return
    }

    const key = `${operation.toString()}-${JSON.stringify(args)}`
    
    if (debounceTimers.has(key)) {
      clearTimeout(debounceTimers.get(key)!)
    }
    
    const timer = setTimeout(() => {
      fn(...args)
      debounceTimers.delete(key)
    }, debounce.delay)
    
    debounceTimers.set(key, timer)
  }

  // 节流处理
  const throttleExecute = (fn: Function, args: any[]) => {
    if (!throttle) {
      fn(...args)
      return
    }

    const key = `${operation.toString()}-${JSON.stringify(args)}`
    const now = Date.now()
    
    if (!throttleTimers.has(key)) {
      throttleTimers.set(key, { timer: null, lastExec: 0 })
    }
    
    const throttleInfo = throttleTimers.get(key)!
    
    if (now - throttleInfo.lastExec >= throttle.delay) {
      fn(...args)
      throttleInfo.lastExec = now
    } else {
      if (throttleInfo.timer) {
        clearTimeout(throttleInfo.timer)
      }
      
      throttleInfo.timer = setTimeout(() => {
        fn(...args)
        throttleInfo.lastExec = Date.now()
        throttleInfo.timer = null
      }, throttle.delay - (now - throttleInfo.lastExec))
    }
  }

  // 核心执行函数
  const executeOperation = async (...args: any[]): Promise<T> => {
    // 检查缓存
    const cached = getCachedData()
    if (cached) {
      data.value = cached
      return cached
    }

    // 取消之前的请求
    if (abortController.value) {
      abortController.value.abort()
    }

    // 创建新的 AbortController
    abortController.value = new AbortController()
    
    loading.value = true
    error.value = null

    let retryCount = 0
    const maxRetries = retry?.times || 0
    
    const executeWithRetry = async (): Promise<T> => {
      try {
        console.log(`🚀 执行异步操作 (尝试 ${retryCount + 1}/${maxRetries + 1})`)
        
        // 创建超时Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('操作超时')), timeout)
        })

        // 创建取消Promise
        const abortPromise = new Promise<never>((_, reject) => {
          abortController.value?.signal.addEventListener('abort', () => {
            reject(new Error('操作已取消'))
          })
        })

        // 执行操作
        const result = await Promise.race([
          operation(...args),
          timeoutPromise,
          abortPromise
        ])

        console.log('✅ 异步操作执行成功')
        
        // 设置缓存
        setCachedData(result)
        
        return result
      } catch (err: any) {
        console.error(`❌ 异步操作失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, err)

        if (retryCount < maxRetries && err.name !== 'AbortError') {
          retryCount++
          const delay = (retry?.delay || 1000) * Math.pow(retry?.backoff || 1, retryCount - 1)
          console.log(`⏳ ${delay}ms 后重试...`)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return executeWithRetry()
        }
        
        throw err
      }
    }

    try {
      const result = await executeWithRetry()
      data.value = result
      
      // 成功回调
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      const errorObj = err as Error
      error.value = errorObj
      
      // 错误处理
      if (errorObj.name !== 'AbortError') {
        // 显示错误消息
        if (errorMessage.show) {
          const message = errorMessage.custom 
            ? errorMessage.custom(errorObj)
            : `操作失败: ${errorObj.message}`
          ElMessage.error(message)
        }
        
        // 错误回调
        if (onError) {
          onError(errorObj)
        }
      }
      
      throw errorObj
    } finally {
      loading.value = false
      abortController.value = null
      
      // 完成回调
      if (onFinally) {
        onFinally()
      }
    }
  }

  // 包装执行函数
  const execute = (...args: any[]) => {
    if (debounce) {
      debounceExecute(executeOperation, args)
    } else if (throttle) {
      throttleExecute(executeOperation, args)
    } else {
      return executeOperation(...args)
    }
  }

  // 取消操作
  const cancel = () => {
    if (abortController.value) {
      abortController.value.abort()
      console.log('🛑 异步操作已取消')
    }
  }

  // 重置状态
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
    cancel()
  }

  // 刷新（清除缓存并重新执行）
  const refresh = (...args: any[]) => {
    if (cache) {
      operationCache.delete(cache.key)
    }
    return execute(...args)
  }

  // 监听器
  watch(loading, (newLoading) => {
    if (newLoading) {
      console.log('⏳ 异步操作开始...')
    } else {
      console.log('🏁 异步操作结束')
    }
  })

  // 自动执行
  if (immediate) {
    execute()
  }

  // 清理函数
  onUnmounted(() => {
    cancel()
    
    // 清理防抖定时器
    debounceTimers.forEach(timer => clearTimeout(timer))
    debounceTimers.clear()
    
    // 清理节流定时器
    throttleTimers.forEach(info => {
      if (info.timer) clearTimeout(info.timer)
    })
    throttleTimers.clear()
  })

  return {
    // 状态
    loading: isLoading,
    error,
    data,
    hasError,
    hasData,
    isEmpty,
    
    // 方法
    execute,
    cancel,
    reset,
    refresh
  }
}

/**
 * 批量异步操作
 */
export function useBatchAsyncOperation<T = any>(
  operations: Array<() => Promise<T>>,
  options: {
    concurrency?: number
    failFast?: boolean
    onProgress?: (completed: number, total: number) => void
  } = {}
) {
  const {
    concurrency = 3,
    failFast = false,
    onProgress
  } = options

  const loading = ref(false)
  const errors = ref<Error[]>([])
  const results = ref<T[]>([])
  const progress = ref(0)

  const execute = async (): Promise<T[]> => {
    loading.value = true
    errors.value = []
    results.value = []
    progress.value = 0

    const total = operations.length
    let completed = 0

    try {
      const chunks = []
      for (let i = 0; i < operations.length; i += concurrency) {
        chunks.push(operations.slice(i, i + concurrency))
      }

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (operation) => {
          try {
            const result = await operation()
            completed++
            progress.value = (completed / total) * 100
            
            if (onProgress) {
              onProgress(completed, total)
            }
            
            return { success: true, data: result, error: null }
          } catch (error) {
            completed++
            progress.value = (completed / total) * 100
            
            if (onProgress) {
              onProgress(completed, total)
            }
            
            if (failFast) {
              throw error
            }
            
            return { success: false, data: null, error: error as Error }
          }
        })

        const chunkResults = await Promise.all(chunkPromises)
        
        chunkResults.forEach(result => {
          if (result.success) {
            results.value.push(result.data! as any)
          } else {
            errors.value.push(result.error!)
          }
        })
      }

      return results.value as T[]
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errors,
    results,
    progress,
    execute
  }
}

/**
 * 清理所有缓存
 */
export function clearAsyncOperationCache() {
  operationCache.clear()
  console.log('🧹 异步操作缓存已清理')
}

/**
 * 获取缓存统计
 */
export function getAsyncOperationCacheStats() {
  return {
    size: operationCache.size,
    items: Array.from(operationCache.entries()).map(([key, item]) => ({
      key,
      timestamp: item.timestamp,
      expireTime: item.expireTime,
      expired: Date.now() > item.expireTime
    }))
  }
}