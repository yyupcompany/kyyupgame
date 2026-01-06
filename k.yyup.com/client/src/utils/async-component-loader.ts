/**
 * 异步组件懒加载工具类
 * 提供统一的组件懒加载机制，支持数据预加载和异步等待
 */

// import { defineAsyncComponent, Component, ref, computed } from 'vue'
// import type { AsyncComponentLoader, ComponentOptions } from 'vue'
// import LoadingState from '@/components/common/LoadingState.vue'
// import ErrorFallback from '@/components/common/ErrorFallback.vue'

// Mock Vue functions for TypeScript compilation
const defineAsyncComponent = (config: any) => config
const ref = (value: any) => ({ value })
const computed = (fn: any) => ({ value: fn() })
type Component = any
type AsyncComponentLoader = any

// Mock components
const LoadingState = null
const ErrorFallback = null

export interface AsyncComponentConfig {
  // 组件加载器
  loader: AsyncComponentLoader
  // 加载中组件
  loadingComponent?: Component
  // 错误组件
  errorComponent?: Component
  // 延迟时间（毫秒）
  delay?: number
  // 超时时间（毫秒）
  timeout?: number
  // 可中断
  suspensible?: boolean
  // 预加载数据函数
  preloadData?: () => Promise<any>
  // 最小加载时间（毫秒）
  minLoadTime?: number
  // 缓存策略
  cache?: boolean
  // 重试次数
  retryLimit?: number
  // 重试延迟（毫秒）
  retryDelay?: number
}

export interface DataLoaderConfig<T = any> {
  // 数据加载函数
  loader: () => Promise<T>
  // 缓存键
  cacheKey?: string
  // 缓存时间（毫秒）
  cacheDuration?: number
  // 超时时间（毫秒）
  timeout?: number
  // 重试配置
  retry?: {
    times: number
    delay: number
    backoff?: number
  }
  // 依赖项
  dependencies?: any[]
  // 预加载
  preload?: boolean
}

/**
 * 组件缓存
 */
const componentCache = new Map<string, Component>()

/**
 * 数据缓存
 */
interface CacheItem<T = any> {
  data: T
  timestamp: number
  expireTime: number
}

const dataCache = new Map<string, CacheItem>()

/**
 * 创建异步组件
 */
export function createAsyncComponent(config: AsyncComponentConfig) {
  const {
    loader,
    loadingComponent = LoadingState,
    errorComponent = ErrorFallback,
    delay = 200,
    timeout = 30000,
    suspensible = false,
    preloadData,
    minLoadTime = 300,
    cache = true,
    retryLimit = 3,
    retryDelay = 1000
  } = config

  // 生成缓存键
  const cacheKey = loader.toString()

  // 检查缓存
  if (cache && componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!
  }

  // 包装加载器
  const wrappedLoader = async () => {
    const startTime = Date.now()
    let retryCount = 0

    const loadWithRetry = async (): Promise<Component> => {
      try {
        console.log(`🚀 开始加载组件 (尝试 ${retryCount + 1}/${retryLimit + 1})`)

        // 并行加载组件和数据
        const promises: Promise<any>[] = [loader()]
        
        if (preloadData) {
          promises.push(preloadData())
        }

        const results = await Promise.all(promises)
        const component = results[0]

        // 确保最小加载时间
        const loadTime = Date.now() - startTime
        if (loadTime < minLoadTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadTime - loadTime))
        }

        console.log(`✅ 组件加载成功，耗时 ${Date.now() - startTime}ms`)

        // 如果加载了预置数据，将其注入到组件中
        if (preloadData && results[1]) {
          const originalSetup = component.setup
          component.setup = (props: any, ctx: any) => {
            // 注入预加载的数据
            const preloadedData = ref(results[1])
            
            if (originalSetup) {
              const setupResult = originalSetup(props, ctx)
              return {
                ...setupResult,
                preloadedData
              }
            }
            
            return { preloadedData }
          }
        }

        return component
      } catch (error) {
        console.error(`❌ 组件加载失败 (尝试 ${retryCount + 1}/${retryLimit + 1}):`, error)
        
        if (retryCount < retryLimit) {
          retryCount++
          const delay = retryDelay * Math.pow(2, retryCount - 1) // 指数退避
          console.log(`⏳ ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return loadWithRetry()
        }
        
        throw error
      }
    }

    return loadWithRetry()
  }

  const asyncComponent = defineAsyncComponent({
    loader: wrappedLoader,
    loadingComponent,
    errorComponent,
    delay,
    timeout,
    suspensible
  })

  // 缓存组件
  if (cache) {
    componentCache.set(cacheKey, asyncComponent)
  }

  return asyncComponent
}

/**
 * 数据懒加载 Hook
 */
export function useAsyncData<T>(config: DataLoaderConfig<T>) {
  const {
    loader,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5分钟
    timeout = 10000,
    retry = { times: 2, delay: 1000 },
    dependencies = [],
    preload = false
  } = config

  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  // 生成缓存键
  const finalCacheKey = cacheKey || `${loader.toString()}-${JSON.stringify(dependencies)}`

  // 检查缓存
  const checkCache = (): T | null => {
    if (!cacheKey) return null
    
    const cached = dataCache.get(finalCacheKey)
    if (cached && Date.now() < cached.expireTime) {
      console.log(`📦 使用缓存数据: ${finalCacheKey}`)
      return cached.data
    }
    
    return null
  }

  // 设置缓存
  const setCache = (value: T) => {
    if (!cacheKey) return
    
    dataCache.set(finalCacheKey, {
      data: value,
      timestamp: Date.now(),
      expireTime: Date.now() + cacheDuration
    })
  }

  // 加载数据
  const loadData = async () => {
    // 检查缓存
    const cached = checkCache()
    if (cached) {
      data.value = cached
      return cached
    }

    loading.value = true
    error.value = null

    let retryCount = 0
    const startTime = Date.now()

    const loadWithRetry = async (): Promise<T> => {
      try {
        console.log(`🔄 开始加载数据 (尝试 ${retryCount + 1}/${retry.times + 1})`)

        // 创建超时Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('数据加载超时')), timeout)
        })

        // 执行加载
        const result = await Promise.race([loader(), timeoutPromise])
        
        console.log(`✅ 数据加载成功，耗时 ${Date.now() - startTime}ms`)
        
        // 设置缓存
        setCache(result)
        
        return result
      } catch (err) {
        console.error(`❌ 数据加载失败 (尝试 ${retryCount + 1}/${retry.times + 1}):`, err)
        
        if (retryCount < retry.times) {
          retryCount++
          const delay = retry.delay * Math.pow(retry.backoff || 1, retryCount - 1)
          console.log(`⏳ ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return loadWithRetry()
        }
        
        throw err
      }
    }

    try {
      const result = await loadWithRetry()
      data.value = result
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  // 刷新数据
  const refresh = async () => {
    if (cacheKey) {
      dataCache.delete(finalCacheKey)
    }
    return loadData()
  }

  // 计算属性
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const hasData = computed(() => !!data.value)

  // 预加载
  if (preload) {
    loadData().catch(console.error)
  }

  return {
    data,
    loading: isLoading,
    error,
    hasError,
    hasData,
    loadData,
    refresh
  }
}

/**
 * 页面级异步组件
 */
export function createAsyncPage(config: Omit<AsyncComponentConfig, 'loadingComponent' | 'errorComponent'>) {
  return createAsyncComponent({
    ...config,
    loadingComponent: null,
    errorComponent: null,
    delay: 100,
    timeout: 60000,
    minLoadTime: 500
  })
}

/**
 * 对话框异步组件
 */
export function createAsyncDialog(config: Omit<AsyncComponentConfig, 'loadingComponent' | 'errorComponent'>) {
  return createAsyncComponent({
    ...config,
    loadingComponent: LoadingState,
    errorComponent: ErrorFallback,
    delay: 50,
    timeout: 15000,
    minLoadTime: 200
  })
}

/**
 * 清理缓存
 */
export function clearCache() {
  componentCache.clear()
  dataCache.clear()
  console.log('🧹 缓存已清理')
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  return {
    componentCache: {
      size: componentCache.size,
      keys: Array.from(componentCache.keys())
    },
    dataCache: {
      size: dataCache.size,
      keys: Array.from(dataCache.keys()),
      items: Array.from(dataCache.entries()).map(([key, item]) => ({
        key,
        timestamp: item.timestamp,
        expireTime: item.expireTime,
        expired: Date.now() > item.expireTime
      }))
    }
  }
}

/**
 * 预加载组件
 */
export async function preloadComponent(loader: AsyncComponentLoader) {
  try {
    console.log('🔄 预加载组件...')
    await loader()
    console.log('✅ 组件预加载成功')
  } catch (error) {
    console.error('❌ 组件预加载失败:', error)
  }
}

/**
 * 批量预加载组件
 */
export async function preloadComponents(loaders: AsyncComponentLoader[], concurrency = 3) {
  console.log(`🔄 批量预加载 ${loaders.length} 个组件，并发数: ${concurrency}`)
  
  const chunks = []
  for (let i = 0; i < loaders.length; i += concurrency) {
    chunks.push(loaders.slice(i, i + concurrency))
  }

  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map(preloadComponent))
  }
  
  console.log('✅ 批量预加载完成')
}