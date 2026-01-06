/**
 * 智能路由预加载器
 * 根据用户行为和权限智能预加载路由组件
 */

import { Router } from 'vue-router'
import { performanceMonitor } from './performance-monitor'

interface PreloadStrategy {
  immediate: string[]      // 立即预加载
  idle: string[]          // 空闲时预加载
  hover: string[]         // 鼠标悬停时预加载
  userBehavior: string[]  // 基于用户行为预加载
}

interface PreloadConfig {
  maxConcurrent: number   // 最大并发预加载数
  cacheSize: number      // 缓存大小
  timeout: number        // 预加载超时时间
  priority: 'high' | 'medium' | 'low'
}

interface RouteMetrics {
  path: string
  visitCount: number
  avgLoadTime: number
  lastVisited: number
  priority: number
}

export class RoutePreloader {
  private router: Router | null = null
  private preloadCache = new Map<string, Promise<any>>()
  private routeMetrics = new Map<string, RouteMetrics>()
  private abortController = new AbortController()
  // private _isPreloading = false
  
  private config: PreloadConfig = {
    maxConcurrent: 1,
    cacheSize: 20,
    timeout: 2000,
    priority: 'medium'
  }
  
  private strategy: PreloadStrategy = {
    immediate: ['/dashboard', '/class', '/teacher'],
    idle: ['/enrollment-plan', '/enrollment', '/parent'],
    hover: ['/system/users', '/system/roles', '/statistics'],
    userBehavior: []
  }
  
  constructor(router?: Router) {
    if (router) {
      this.init(router)
    }
  }
  
  /**
   * 初始化预加载器
   */
  init(router: Router): void {
    this.router = router
    this.loadRouteMetrics()
    this.setupEventListeners()
    this.startImmediatePreload()
    this.startIdlePreload()
    
    console.log('🚀 路由预加载器已启动')
  }
  
  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.resumePreloading()
      } else {
        this.pausePreloading()
      }
    })
    
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.resumePreloading()
    })
    
    window.addEventListener('offline', () => {
      this.pausePreloading()
    })
    
    // 监听鼠标悬停事件（委托）
    document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true)
    
    // 监听路由变化
    if (this.router) {
      this.router.afterEach((to, _from) => {
        this.updateRouteMetrics(to.path)
        this.predictNextRoutes(to.path)
      })
    }
  }
  
  /**
   * 处理鼠标悬停事件
   */
  private handleMouseEnter(event: Event): void {
    const target = event.target as HTMLElement
    
    // 检查target是否为Element并且有closest方法
    if (!target || typeof target.closest !== 'function') {
      return
    }
    
    const link = target.closest('a[href]') as HTMLAnchorElement
    
    if (link && link.href) {
      try {
        const path = new URL(link.href).pathname
        if (this.strategy.hover.includes(path) || this.shouldPreloadOnHover(path)) {
          this.preloadRoute(path, 'hover')
        }
      } catch (error) {
        console.warn('路由预加载处理失败:', error)
      }
    }
  }
  
  /**
   * 判断是否应该在悬停时预加载
   */
  private shouldPreloadOnHover(path: string): boolean {
    const metrics = this.routeMetrics.get(path)
    if (!metrics) return false
    
    // 如果访问频率高且加载时间长，则预加载
    return metrics.visitCount > 2 && metrics.avgLoadTime > 1000
  }
  
  /**
   * 开始立即预加载
   */
  private async startImmediatePreload(): Promise<void> {
    const startTime = performance.now()
    
    try {
      await Promise.all(
        this.strategy.immediate.map(path => 
          this.preloadRoute(path, 'immediate')
        )
      )
      
      const endTime = performance.now()
      console.log(`✅ 立即预加载完成: ${endTime - startTime}ms`)
      
    } catch (error) {
      console.warn('⚠️ 立即预加载失败:', error)
    }
  }
  
  /**
   * 开始空闲时预加载
   */
  private startIdlePreload(): void {
    if (typeof window === 'undefined') return
    
    // 使用 requestIdleCallback 在空闲时预加载
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.preloadIdleRoutes()
      }, { timeout: 2000 })
    } else {
      // 降级方案
      setTimeout(() => this.preloadIdleRoutes(), 1000)
    }
  }
  
  /**
   * 预加载空闲路由
   */
  private async preloadIdleRoutes(): Promise<void> {
    if (!this.isNetworkEfficient()) {
      console.log('📶 网络状态不佳，跳过空闲预加载')
      return
    }
    
    for (const path of this.strategy.idle) {
      if (this.preloadCache.has(path)) continue
      
      await this.preloadRoute(path, 'idle')
      
      // 在每个预加载之间添加延迟，避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('✅ 空闲预加载完成')
  }
  
  /**
   * 预加载单个路由
   */
  private async preloadRoute(path: string, trigger: string): Promise<void> {
    if (this.preloadCache.has(path)) {
      console.log(`📦 路由已缓存: ${path}`)
      return
    }
    
    if (!this.router) {
      // 静默跳过，不显示警告信息
      return
    }
    
    const startTime = performance.now()
    
    try {
      // 创建预加载Promise
      const preloadPromise = this.performRoutePreload(path)
      this.preloadCache.set(path, preloadPromise)
      
      // 限制缓存大小
      if (this.preloadCache.size > this.config.cacheSize) {
        const firstKey = this.preloadCache.keys().next().value
        if (firstKey) {
          this.preloadCache.delete(firstKey)
        }
      }
      
      await preloadPromise
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      console.log(`⚡ 预加载完成: ${path} (${loadTime.toFixed(2)}ms, ${trigger})`)
      
      // 更新性能指标
      this.updatePreloadMetrics(path, loadTime)
      
    } catch (error) {
      console.warn(`❌ 预加载失败: ${path}`, error)
      this.preloadCache.delete(path)
    }
  }
  
  /**
   * 执行路由预加载
   */
  private async performRoutePreload(path: string): Promise<any> {
    if (!this.router) throw new Error('Router not available')
    
    // 查找匹配的路由
    const matched = this.router.resolve({ path })
    
    if (!matched.matched.length) {
      throw new Error(`Route not found: ${path}`)
    }
    
    // 预加载所有匹配的路由组件
    const preloadPromises = matched.matched.map(route => {
      const component = route.components?.default || route.components?.['default']
      if (typeof component === 'function') {
        return (component as Function)()
      }
      return Promise.resolve(component)
    })
    
    return Promise.all(preloadPromises)
  }
  
  /**
   * 更新路由访问指标
   */
  private updateRouteMetrics(path: string): void {
    const metrics = this.routeMetrics.get(path) || {
      path,
      visitCount: 0,
      avgLoadTime: 0,
      lastVisited: 0,
      priority: 0
    }
    
    metrics.visitCount++
    metrics.lastVisited = Date.now()
    metrics.priority = this.calculateRoutePriority(metrics)
    
    this.routeMetrics.set(path, metrics)
    this.saveRouteMetrics()
  }
  
  /**
   * 计算路由优先级
   */
  private calculateRoutePriority(metrics: RouteMetrics): number {
    const now = Date.now()
    const daysSinceLastVisit = (now - metrics.lastVisited) / (1000 * 60 * 60 * 24)
    
    // 基于访问频率和最近访问时间计算优先级
    let priority = metrics.visitCount * 10
    
    // 最近访问的路由优先级更高
    if (daysSinceLastVisit < 1) priority += 50
    else if (daysSinceLastVisit < 7) priority += 20
    else priority -= 10
    
    // 加载时间长的路由优先级更高（更需要预加载）
    if (metrics.avgLoadTime > 2000) priority += 30
    else if (metrics.avgLoadTime > 1000) priority += 15
    
    return Math.max(0, priority)
  }
  
  /**
   * 预测下一个可能访问的路由
   */
  private predictNextRoutes(currentPath: string): void {
    // 基于路由模式预测
    const predictions = this.predictByPattern(currentPath)
    
    // 基于历史数据预测
    const historicalPredictions = this.predictByHistory(currentPath)
    
    // 合并预测结果
    const allPredictions = [...predictions, ...historicalPredictions]
    
    // 更新用户行为预加载策略
    this.strategy.userBehavior = allPredictions.slice(0, 3)
    
    // 启动预测性预加载
    this.startPredictivePreload()
  }
  
  /**
   * 基于路由模式预测
   */
  private predictByPattern(currentPath: string): string[] {
    const patterns = {
      '/dashboard': ['/class', '/teacher', '/enrollment-plan'],
      '/class': ['/student/detail', '/teacher'],
      '/teacher': ['/class', '/teacher/detail'],
      '/enrollment-plan': ['/enrollment', '/statistics'],
      '/enrollment': ['/customer', '/application'],
      '/parent': ['/parent/children', '/parent/detail'],
      '/system/users': ['/system/roles', '/system/permissions'],
      '/ai': ['/chat', '/system/ai-model-config']
    }
    
    return (patterns as any)[currentPath] || []
  }
  
  /**
   * 基于历史数据预测
   */
  private predictByHistory(currentPath: string): string[] {
    // 获取当前路由后最常访问的路由
    const routeHistory = this.getRouteHistory()
    const nextRoutes: { [key: string]: number } = {}
    
    for (let i = 0; i < routeHistory.length - 1; i++) {
      if (routeHistory[i] === currentPath) {
        const nextRoute = routeHistory[i + 1]
        nextRoutes[nextRoute] = (nextRoutes[nextRoute] || 0) + 1
      }
    }
    
    return Object.entries(nextRoutes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([route]) => route)
  }
  
  /**
   * 启动预测性预加载
   */
  private async startPredictivePreload(): Promise<void> {
    if (!this.isNetworkEfficient() || !this.strategy.userBehavior.length) return
    
    for (const path of this.strategy.userBehavior) {
      if (!this.preloadCache.has(path)) {
        await this.preloadRoute(path, 'prediction')
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
  }
  
  /**
   * 检查网络状态是否适合预加载
   */
  private isNetworkEfficient(): boolean {
    if (typeof navigator === 'undefined') return true
    
    // 检查网络连接类型
    const connection = (navigator as any).connection
    if (connection) {
      // 在慢速网络下禁用预加载
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return false
      }
      
      // 在节省数据模式下禁用预加载
      if (connection.saveData) {
        return false
      }
    }
    
    return navigator.onLine
  }
  
  /**
   * 暂停预加载
   */
  private pausePreloading(): void {
    // this._isPreloading = false
    this.abortController.abort()
    this.abortController = new AbortController()
    console.log('⏸️ 预加载已暂停')
  }
  
  /**
   * 恢复预加载
   */
  private resumePreloading(): void {
    if (!this.isNetworkEfficient()) return

    // this._isPreloading = true
    this.startIdlePreload()
    console.log('▶️ 预加载已恢复')
  }
  
  /**
   * 更新预加载性能指标
   */
  private updatePreloadMetrics(path: string, loadTime: number): void {
    const metrics = this.routeMetrics.get(path)
    if (metrics) {
      // 计算平均加载时间
      const totalTime = metrics.avgLoadTime * (metrics.visitCount - 1) + loadTime
      metrics.avgLoadTime = totalTime / metrics.visitCount
      
      this.routeMetrics.set(path, metrics)
    }
    
    // 上报到性能监控器
    performanceMonitor.trackAPICall(`route:${path}`, 0, loadTime)
  }
  
  /**
   * 加载路由访问指标
   */
  private loadRouteMetrics(): void {
    try {
      const stored = localStorage.getItem('route_metrics')
      if (stored) {
        const data = JSON.parse(stored)
        this.routeMetrics = new Map(data)
      }
    } catch (error) {
      console.warn('Failed to load route metrics:', error)
    }
  }
  
  /**
   * 保存路由访问指标
   */
  private saveRouteMetrics(): void {
    try {
      const data = Array.from(this.routeMetrics.entries())
      localStorage.setItem('route_metrics', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save route metrics:', error)
    }
  }
  
  /**
   * 获取路由历史
   */
  private getRouteHistory(): string[] {
    try {
      const stored = localStorage.getItem('route_history')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
  
  /**
   * 配置预加载策略
   */
  setStrategy(strategy: Partial<PreloadStrategy>): void {
    this.strategy = { ...this.strategy, ...strategy }
    console.log('🎯 预加载策略已更新:', this.strategy)
  }
  
  /**
   * 配置预加载选项
   */
  setConfig(config: Partial<PreloadConfig>): void {
    this.config = { ...this.config, ...config }
    console.log('⚙️ 预加载配置已更新:', this.config)
  }
  
  /**
   * 手动预加载路由
   */
  async manualPreload(paths: string | string[]): Promise<void> {
    if (!this.router) {
      // 静默跳过，不显示警告信息
      return
    }
    
    const pathList = Array.isArray(paths) ? paths : [paths]
    
    for (const path of pathList) {
      await this.preloadRoute(path, 'manual')
    }
  }
  
  /**
   * 清除预加载缓存
   */
  clearCache(): void {
    this.preloadCache.clear()
    console.log('🗑️ 预加载缓存已清除')
  }
  
  /**
   * 获取预加载统计信息
   */
  getStats(): {
    cacheSize: number
    totalMetrics: number
    topRoutes: RouteMetrics[]
    strategy: PreloadStrategy
  } {
    const sortedMetrics = Array.from(this.routeMetrics.values())
      .sort((a, b) => b.priority - a.priority)
    
    return {
      cacheSize: this.preloadCache.size,
      totalMetrics: this.routeMetrics.size,
      topRoutes: sortedMetrics.slice(0, 10),
      strategy: this.strategy
    }
  }
  
  /**
   * 销毁预加载器
   */
  destroy(): void {
    this.pausePreloading()
    this.clearCache()
    this.routeMetrics.clear()
    
    // 清理事件监听器
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', () => {})
      document.removeEventListener('mouseenter', this.handleMouseEnter.bind(this), true)
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => {})
      window.removeEventListener('offline', () => {})
    }
    
    console.log('🔥 路由预加载器已销毁')
  }
}

// 创建全局实例
export const routePreloader = new RoutePreloader()