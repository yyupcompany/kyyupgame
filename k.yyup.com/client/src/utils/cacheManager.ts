/**
 * API缓存管理器
 * 提供内存和本地存储双重缓存机制，优化数据获取性能
 */

// 缓存项接口
interface CacheItem<T = any> {
  data: T
  timestamp: number
  expiry: number
  key: string
  version?: string
}

// 缓存配置接口
interface CacheConfig {
  ttl?: number // 缓存时间（毫秒）
  maxSize?: number // 最大缓存条目数
  storage?: 'memory' | 'localStorage' | 'both'
  version?: string // 缓存版本
  persistent?: boolean // 是否持久化
}

// 缓存统计接口
interface CacheStats {
  memorySize: number
  storageSize: number
  hitRate: number
  totalHits: number
  totalMisses: number
}

/**
 * 缓存管理器类
 */
export class CacheManager {
  private static instance: CacheManager
  private memoryCache = new Map<string, CacheItem>()
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  }
  
  // 默认配置
  private defaultConfig: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 100,
    storage: 'both',
    persistent: false
  }

  private constructor() {
    // 定期清理过期缓存
    this.startCleanupTimer()
    
    // 监听存储变化
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this))
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * 生成缓存键
   */
  private generateKey(namespace: string, key: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : ''
    return `${namespace}:${key}:${this.hashCode(paramStr)}`
  }

  /**
   * 简单哈希函数
   */
  private hashCode(str: string): string {
    let hash = 0
    if (str.length === 0) return hash.toString()
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    return Math.abs(hash).toString(16)
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiry
  }

  /**
   * 从localStorage获取缓存
   */
  private getFromStorage(key: string): CacheItem | null {
    try {
      const stored = localStorage.getItem(`cache:${key}`)
      if (!stored) return null
      
      const item: CacheItem = JSON.parse(stored)
      if (this.isExpired(item)) {
        localStorage.removeItem(`cache:${key}`)
        return null
      }
      
      return item
    } catch (error) {
      console.warn('获取localStorage缓存失败:', error)
      return null
    }
  }

  /**
   * 保存到localStorage
   */
  private saveToStorage(key: string, item: CacheItem): void {
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn('保存localStorage缓存失败:', error)
      // 如果存储满了，清理一些过期项
      this.cleanupStorage()
    }
  }

  /**
   * 从localStorage删除缓存
   */
  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(`cache:${key}`)
    } catch (error) {
      console.warn('删除localStorage缓存失败:', error)
    }
  }

  /**
   * 清理localStorage中的过期缓存
   */
  private cleanupStorage(): void {
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith('cache:'))
      
      for (const storageKey of cacheKeys) {
        const cached = localStorage.getItem(storageKey)
        if (cached) {
          try {
            const item: CacheItem = JSON.parse(cached)
            if (this.isExpired(item)) {
              localStorage.removeItem(storageKey)
            }
          } catch {
            // 格式错误的缓存项，直接删除
            localStorage.removeItem(storageKey)
          }
        }
      }
    } catch (error) {
      console.warn('清理localStorage缓存失败:', error)
    }
  }

  /**
   * 清理内存中的过期缓存
   */
  private cleanupMemory(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    this.memoryCache.forEach((item, key) => {
      if (now > item.expiry) {
        expiredKeys.push(key)
      }
    })
    
    expiredKeys.forEach(key => this.memoryCache.delete(key))
    
    // 如果缓存过多，删除最旧的
    if (this.memoryCache.size > this.defaultConfig.maxSize!) {
      const entries = Array.from(this.memoryCache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toDelete = entries.slice(0, entries.length - this.defaultConfig.maxSize!)
      toDelete.forEach(([key]) => this.memoryCache.delete(key))
    }
  }

  /**
   * 启动定期清理定时器
   */
  private startCleanupTimer(): void {
    // 每5分钟清理一次过期缓存
    setInterval(() => {
      this.cleanupMemory()
      this.cleanupStorage()
    }, 5 * 60 * 1000)
  }

  /**
   * 处理localStorage变化事件
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key?.startsWith('cache:')) {
      const cacheKey = event.key.replace('cache:', '')
      // 如果localStorage中的缓存被删除，也删除内存中的缓存
      if (!event.newValue && this.memoryCache.has(cacheKey)) {
        this.memoryCache.delete(cacheKey)
      }
    }
  }

  /**
   * 获取缓存
   */
  get<T = any>(namespace: string, key: string, params?: any): T | null {
    const cacheKey = this.generateKey(namespace, key, params)
    this.stats.totalRequests++
    
    // 首先检查内存缓存
    let item = this.memoryCache.get(cacheKey)
    
    // 如果内存中没有，检查localStorage
    if (!item) {
      item = this.getFromStorage(cacheKey) || undefined
      if (item) {
        // 将localStorage中的缓存加载到内存
        this.memoryCache.set(cacheKey, item)
      }
    }
    
    if (!item || this.isExpired(item)) {
      this.stats.misses++
      return null
    }
    
    this.stats.hits++
    return item.data
  }

  /**
   * 设置缓存
   */
  set<T = any>(
    namespace: string, 
    key: string, 
    data: T, 
    config: CacheConfig = {},
    params?: any
  ): void {
    const finalConfig = { ...this.defaultConfig, ...config }
    const cacheKey = this.generateKey(namespace, key, params)
    const now = Date.now()
    
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiry: now + finalConfig.ttl!,
      key: cacheKey,
      version: finalConfig.version
    }
    
    // 保存到内存
    if (finalConfig.storage === 'memory' || finalConfig.storage === 'both') {
      this.memoryCache.set(cacheKey, item)
    }
    
    // 保存到localStorage
    if (finalConfig.storage === 'localStorage' || finalConfig.storage === 'both') {
      this.saveToStorage(cacheKey, item)
    }
    
    // 清理过期缓存
    this.cleanupMemory()
  }

  /**
   * 删除指定缓存
   */
  delete(namespace: string, key: string, params?: any): void {
    const cacheKey = this.generateKey(namespace, key, params)
    
    this.memoryCache.delete(cacheKey)
    this.removeFromStorage(cacheKey)
  }

  /**
   * 清空指定命名空间的缓存
   */
  clearNamespace(namespace: string): void {
    // 清理内存缓存
    const memoryKeys = Array.from(this.memoryCache.keys())
    memoryKeys.forEach(key => {
      if (key.startsWith(`${namespace}:`)) {
        this.memoryCache.delete(key)
      }
    })
    
    // 清理localStorage缓存
    try {
      const keys = Object.keys(localStorage)
      const namespaceKeys = keys.filter(key => key.startsWith(`cache:${namespace}:`))
      namespaceKeys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('清理命名空间缓存失败:', error)
    }
  }

  /**
   * 清空所有缓存
   */
  clearAll(): void {
    this.memoryCache.clear()
    
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith('cache:'))
      cacheKeys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('清空所有缓存失败:', error)
    }
    
    // 重置统计
    this.stats = { hits: 0, misses: 0, totalRequests: 0 }
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(namespace: string, key: string, params?: any): boolean {
    return this.get(namespace, key, params) !== null
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const memorySize = this.memoryCache.size
    
    let storageSize = 0
    try {
      const keys = Object.keys(localStorage)
      storageSize = keys.filter(key => key.startsWith('cache:')).length
    } catch (error) {
      console.warn('获取存储大小失败:', error)
    }
    
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0
    
    return {
      memorySize,
      storageSize,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses
    }
  }

  /**
   * 预热缓存（批量设置）
   */
  warmup<T = any>(items: Array<{
    namespace: string
    key: string
    data: T
    config?: CacheConfig
    params?: any
  }>): void {
    items.forEach(({ namespace, key, data, config, params }) => {
      this.set(namespace, key, data, config, params)
    })
  }

  /**
   * 获取缓存键列表
   */
  getKeys(namespace?: string): string[] {
    const keys: string[] = []
    
    // 内存缓存键
    this.memoryCache.forEach((_, key) => {
      if (!namespace || key.startsWith(`${namespace}:`)) {
        keys.push(key)
      }
    })
    
    // localStorage缓存键
    try {
      const storageKeys = Object.keys(localStorage)
      storageKeys.forEach(storageKey => {
        if (storageKey.startsWith('cache:')) {
          const key = storageKey.replace('cache:', '')
          if (!namespace || key.startsWith(`${namespace}:`)) {
            if (!keys.includes(key)) {
              keys.push(key)
            }
          }
        }
      })
    } catch (error) {
      console.warn('获取存储键失败:', error)
    }
    
    return keys
  }
}

// 导出单例实例
export const cacheManager = CacheManager.getInstance()

/**
 * 缓存装饰器
 * 用于自动缓存函数结果
 */
export function cached(
  namespace: string,
  keyGenerator?: (...args: any[]) => string,
  config?: CacheConfig
) {
  return function <T extends (...args: any[]) => any>(
    _target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!
    
    descriptor.value = (function (this: any, ...args: any[]) {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}:${JSON.stringify(args)}`
      
      // 尝试从缓存获取
      const cached = cacheManager.get(namespace, key)
      if (cached !== null) {
        return cached
      }
      
      // 执行原方法
      const result = method.apply(this, args)
      
      // 如果是Promise，等待结果后缓存
      if (result && typeof result.then === 'function') {
        return result.then((data: any) => {
          cacheManager.set(namespace, key, data, config)
          return data
        })
      }
      
      // 直接缓存结果
      cacheManager.set(namespace, key, result, config)
      return result
    } as any) as T
    
    return descriptor
  }
}

/**
 * 缓存组合式函数
 * 用于在Vue组件中使用缓存
 */
export function useCache() {
  const cache = cacheManager
  
  // 缓存API请求
  const cachedRequest = async <T = any>(
    requestFn: () => Promise<T>,
    namespace: string,
    key: string,
    config?: CacheConfig,
    params?: any
  ): Promise<T> => {
    // 尝试从缓存获取
    const cached = cache.get<T>(namespace, key, params)
    if (cached !== null) {
      return cached
    }
    
    // 执行请求
    try {
      const result = await requestFn()
      cache.set(namespace, key, result, config, params)
      return result
    } catch (error) {
      throw error
    }
  }
  
  // 失效缓存
  const invalidateCache = (namespace: string, key?: string, params?: any) => {
    if (key) {
      cache.delete(namespace, key, params)
    } else {
      cache.clearNamespace(namespace)
    }
  }
  
  // 预加载数据
  const preloadData = async <T = any>(
    requestFn: () => Promise<T>,
    namespace: string,
    key: string,
    config?: CacheConfig,
    params?: any
  ) => {
    if (!cache.has(namespace, key, params)) {
      try {
        const result = await requestFn()
        cache.set(namespace, key, result, config, params)
      } catch (error) {
        console.warn('预加载数据失败:', error)
      }
    }
  }
  
  return {
    cache,
    cachedRequest,
    invalidateCache,
    preloadData,
    getStats: () => cache.getStats(),
    clearAll: () => cache.clearAll()
  }
}

// 预定义的缓存配置
export const CACHE_CONFIGS = {
  // 短期缓存（1分钟）
  SHORT: {
    ttl: 1 * 60 * 1000,
    storage: 'memory' as const
  },
  
  // 中期缓存（5分钟）
  MEDIUM: {
    ttl: 5 * 60 * 1000,
    storage: 'both' as const
  },
  
  // 长期缓存（30分钟）
  LONG: {
    ttl: 30 * 60 * 1000,
    storage: 'both' as const,
    persistent: true
  },
  
  // 用户数据缓存
  USER_DATA: {
    ttl: 10 * 60 * 1000,
    storage: 'both' as const,
    persistent: true
  },
  
  // 字典数据缓存（较长时间）
  DICTIONARY: {
    ttl: 60 * 60 * 1000, // 1小时
    storage: 'both' as const,
    persistent: true
  },
  
  // 列表数据缓存
  LIST_DATA: {
    ttl: 3 * 60 * 1000,
    storage: 'memory' as const
  }
}

// 导出类型
export type { CacheConfig }

export default cacheManager