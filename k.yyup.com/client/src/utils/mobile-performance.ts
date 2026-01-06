/**
 * 移动端性能优化工具
 * Mobile Performance Optimization Utilities
 * 
 * 提供移动端特定的性能优化功能
 */

/**
 * 图片懒加载管理器
 */
export class LazyImageLoader {
  private observer: IntersectionObserver
  private images: Set<HTMLImageElement> = new Set()

  constructor(options?: IntersectionObserverInit) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0.1
    }

    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      ...defaultOptions,
      ...options
    })
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        this.loadImage(img)
        this.observer.unobserve(img)
        this.images.delete(img)
      }
    })
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src
    if (src) {
      img.src = src
      img.classList.add('loaded')
      img.removeAttribute('data-src')
    }
  }

  public observe(img: HTMLImageElement) {
    this.images.add(img)
    this.observer.observe(img)
  }

  public disconnect() {
    this.observer.disconnect()
    this.images.clear()
  }
}

/**
 * 虚拟滚动管理器（用于长列表）
 */
export class VirtualScrollManager {
  private container: HTMLElement
  private itemHeight: number
  private visibleCount: number
  private totalCount: number
  private startIndex = 0
  private endIndex = 0
  private renderCallback: (startIndex: number, endIndex: number) => void

  constructor(
    container: HTMLElement,
    itemHeight: number,
    renderCallback: (startIndex: number, endIndex: number) => void
  ) {
    this.container = container
    this.itemHeight = itemHeight
    this.renderCallback = renderCallback
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2 // 额外渲染2项以确保平滑滚动
    this.totalCount = 0

    this.container.addEventListener('scroll', this.handleScroll.bind(this), { passive: true })
  }

  private handleScroll() {
    const scrollTop = this.container.scrollTop
    const newStartIndex = Math.floor(scrollTop / this.itemHeight)
    const newEndIndex = Math.min(newStartIndex + this.visibleCount, this.totalCount)

    if (newStartIndex !== this.startIndex || newEndIndex !== this.endIndex) {
      this.startIndex = newStartIndex
      this.endIndex = newEndIndex
      this.renderCallback(this.startIndex, this.endIndex)
    }
  }

  public setTotalCount(count: number) {
    this.totalCount = count
    this.container.style.height = `${count * this.itemHeight}px`
    this.handleScroll() // 重新计算可见范围
  }

  public scrollToIndex(index: number) {
    const scrollTop = index * this.itemHeight
    this.container.scrollTop = scrollTop
  }

  public destroy() {
    this.container.removeEventListener('scroll', this.handleScroll.bind(this))
  }
}

/**
 * 预加载管理器
 */
export class PreloadManager {
  private preloadQueue: Array<{ url: string; type: 'image' | 'script' | 'style' }> = []
  private maxConcurrent = 3
  private currentLoading = 0

  public addToQueue(url: string, type: 'image' | 'script' | 'style' = 'image') {
    this.preloadQueue.push({ url, type })
    this.processQueue()
  }

  private async processQueue() {
    if (this.currentLoading >= this.maxConcurrent || this.preloadQueue.length === 0) {
      return
    }

    const item = this.preloadQueue.shift()
    if (!item) return

    this.currentLoading++

    try {
      await this.preloadResource(item.url, item.type)
    } catch (error) {
      console.warn('预加载失败:', item.url, error)
    } finally {
      this.currentLoading--
      this.processQueue() // 继续处理队列
    }
  }

  private preloadResource(url: string, type: 'image' | 'script' | 'style'): Promise<void> {
    return new Promise((resolve, reject) => {
      let element: HTMLElement

      switch (type) {
        case 'image':
          element = new Image()
          element.onload = () => resolve()
          element.onerror = () => reject(new Error(`Failed to load image: ${url}`))
          ;(element as HTMLImageElement).src = url
          break

        case 'script':
          element = document.createElement('script')
          element.onload = () => resolve()
          element.onerror = () => reject(new Error(`Failed to load script: ${url}`))
          ;(element as HTMLScriptElement).src = url
          document.head.appendChild(element)
          break

        case 'style':
          element = document.createElement('link')
          element.onload = () => resolve()
          element.onerror = () => reject(new Error(`Failed to load style: ${url}`))
          const linkElement = element as HTMLLinkElement
          linkElement.rel = 'stylesheet'
          linkElement.href = url
          document.head.appendChild(element)
          break

        default:
          reject(new Error(`Unsupported preload type: ${type}`))
      }
    })
  }

  public clearQueue() {
    this.preloadQueue = []
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private prefix = 'mobile_cache_'
  private maxAge = 24 * 60 * 60 * 1000 // 24小时

  public set<T>(key: string, data: T, customMaxAge?: number): void {
    const cacheData = {
      data,
      timestamp: Date.now(),
      maxAge: customMaxAge || this.maxAge
    }

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheData))
    } catch (error) {
      // localStorage可能已满，尝试清理过期数据
      this.cleanup()
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('无法保存到缓存:', error)
      }
    }
  }

  public get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.prefix + key)
      if (!cached) return null

      const cacheData = JSON.parse(cached)
      const now = Date.now()

      if (now - cacheData.timestamp > cacheData.maxAge) {
        localStorage.removeItem(this.prefix + key)
        return null
      }

      return cacheData.data as T
    } catch (error) {
      console.warn('缓存读取失败:', error)
      return null
    }
  }

  public delete(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  public cleanup(): void {
    const keys = Object.keys(localStorage)
    const now = Date.now()

    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const cacheData = JSON.parse(cached)
            if (now - cacheData.timestamp > cacheData.maxAge) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          // 损坏的缓存数据，直接删除
          localStorage.removeItem(key)
        }
      }
    })
  }

  public clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

/**
 * 防抖和节流工具
 */
export class ThrottleDebounce {
  private timeouts: Map<string, NodeJS.Timeout> = new Map()
  private lastRuns: Map<string, number> = new Map()

  public debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const existingTimeout = this.timeouts.get(key)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      const timeout = setTimeout(() => {
        func.apply(this, args)
        this.timeouts.delete(key)
      }, delay)

      this.timeouts.set(key, timeout)
    }
  }

  public throttle<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const now = Date.now()
      const lastRun = this.lastRuns.get(key) || 0

      if (now - lastRun >= limit) {
        func.apply(this, args)
        this.lastRuns.set(key, now)
      }
    }
  }

  public clear(key?: string) {
    if (key) {
      const timeout = this.timeouts.get(key)
      if (timeout) {
        clearTimeout(timeout)
        this.timeouts.delete(key)
      }
      this.lastRuns.delete(key)
    } else {
      this.timeouts.forEach(timeout => clearTimeout(timeout))
      this.timeouts.clear()
      this.lastRuns.clear()
    }
  }
}

/**
 * 移动端性能监控器
 */
export class MobilePerformanceMonitor {
  private metrics: Map<string, number> = new Map()
  private memoryWarningThreshold = 50 * 1024 * 1024 // 50MB

  public startTiming(label: string) {
    this.metrics.set(`${label}_start`, performance.now())
  }

  public endTiming(label: string): number {
    const start = this.metrics.get(`${label}_start`)
    if (start === undefined) {
      console.warn(`未找到计时器: ${label}`)
      return 0
    }

    const duration = performance.now() - start
    this.metrics.set(label, duration)
    this.metrics.delete(`${label}_start`)
    
    return duration
  }

  public getMetric(label: string): number | undefined {
    return this.metrics.get(label)
  }

  public getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {}
    this.metrics.forEach((value, key) => {
      if (!key.endsWith('_start')) {
        result[key] = value
      }
    })
    return result
  }

  public checkMemoryUsage(): { used: number; limit: number; warning: boolean } {
    // @ts-ignore - performance.memory在某些浏览器中可用
    const memory = (performance as any).memory
    
    if (memory) {
      const used = memory.usedJSHeapSize
      const limit = memory.jsHeapSizeLimit
      const warning = used > this.memoryWarningThreshold
      
      return { used, limit, warning }
    }
    
    return { used: 0, limit: 0, warning: false }
  }

  public logPerformanceSummary() {
    const metrics = this.getAllMetrics()
    const memory = this.checkMemoryUsage()
    
    console.group('📊 移动端性能报告')
    console.log('⏱️ 计时指标:', metrics)
    if (memory.used > 0) {
      console.log('💾 内存使用:', {
        used: `${(memory.used / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.limit / 1024 / 1024).toFixed(2)} MB`,
        warning: memory.warning ? '⚠️ 内存使用过高' : '✅ 内存使用正常'
      })
    }
    console.groupEnd()
  }
}

// 导出单例实例
export const lazyImageLoader = new LazyImageLoader()
export const preloadManager = new PreloadManager()
export const cacheManager = new CacheManager()
export const throttleDebounce = new ThrottleDebounce()
export const performanceMonitor = new MobilePerformanceMonitor()

// 初始化时清理过期缓存
cacheManager.cleanup()

/**
 * 移动端优化初始化函数
 */
export function initMobileOptimizations() {
  // 1. 设置视口meta标签（如果不存在）
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta')
    viewport.name = 'viewport'
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.head.appendChild(viewport)
  }

  // 2. 添加触摸样式优化
  const style = document.createElement('style')
  style.textContent = `
    /* 移动端触摸优化 */
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
    
    /* 滚动优化 */
    .smooth-scroll {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    
    /* 字体渲染优化 */
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    /* 懒加载图片样式 */
    img[data-src] {
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    img[data-src].loaded {
      opacity: 1;
    }
  `
  document.head.appendChild(style)

  // 3. 启用懒加载图片观察器
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img[data-src]').forEach(img => {
      lazyImageLoader.observe(img as HTMLImageElement)
    })
  })

  // 4. 监听性能指标
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
    performanceMonitor.startTiming('page_load')
    
    window.addEventListener('load', () => {
      const loadTime = performanceMonitor.endTiming('page_load')
      console.log(`📱 移动端页面加载时间: ${loadTime.toFixed(2)}ms`)
      
      // 5秒后输出性能报告
      setTimeout(() => {
        performanceMonitor.logPerformanceSummary()
      }, 5000)
    })
  }

  console.log('📱 移动端性能优化初始化完成')
}

// 自动初始化（如果在浏览器环境）
if (typeof window !== 'undefined') {
  initMobileOptimizations()
}