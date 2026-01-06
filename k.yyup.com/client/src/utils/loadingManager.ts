/**
 * 加载状态管理器
 * 统一管理全局和局部加载状态，提供更好的用户体验
 */

import { ref, reactive, computed } from 'vue'
import type { App } from 'vue'

// 加载配置接口
export interface LoadingConfig {
  text?: string
  detail?: string
  type?: 'spinner' | 'dots' | 'wave' | 'skeleton' | 'progress'
  size?: 'small' | 'medium' | 'large'
  overlay?: boolean
  delay?: number // 延迟显示时间（毫秒）
  minDuration?: number // 最小显示时间（毫秒）
  timeout?: number // 超时时间（毫秒）
  onTimeout?: () => void
  color?: string
  backgroundColor?: string
  zIndex?: number
}

// 加载状态项
interface LoadingItem {
  id: string
  config: LoadingConfig
  startTime: number
  delayTimer?: number
  minDurationTimer?: number
  timeoutTimer?: number
  visible: boolean
}

/**
 * 加载状态管理器类
 */
export class LoadingManager {
  private static instance: LoadingManager
  private loadingItems = reactive(new Map<string, LoadingItem>())
  private globalLoading = ref(false)
  private autoId = 0

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager()
    }
    return LoadingManager.instance
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `loading_${++this.autoId}_${Date.now()}`
  }

  /**
   * 显示加载状态
   */
  show(config: LoadingConfig = {}): string {
    const id = this.generateId()
    const finalConfig: LoadingConfig = {
      text: '加载中...',
      type: 'spinner',
      size: 'medium',
      overlay: false,
      delay: 200,
      minDuration: 500,
      timeout: 30000,
      ...config
    }

    const item: LoadingItem = {
      id,
      config: finalConfig,
      startTime: Date.now(),
      visible: false
    }

    this.loadingItems.set(id, item)

    // 延迟显示
    if (finalConfig.delay && finalConfig.delay > 0) {
      item.delayTimer = window.setTimeout(() => {
        item.visible = true
        this.updateGlobalState()
      }, finalConfig.delay)
    } else {
      item.visible = true
      this.updateGlobalState()
    }

    // 设置超时
    if (finalConfig.timeout && finalConfig.timeout > 0) {
      item.timeoutTimer = window.setTimeout(() => {
        if (finalConfig.onTimeout) {
          finalConfig.onTimeout()
        } else {
          console.warn(`Loading timeout: ${id}`)
        }
        this.hide(id)
      }, finalConfig.timeout)
    }

    return id
  }

  /**
   * 隐藏加载状态
   */
  hide(id: string): void {
    const item = this.loadingItems.get(id)
    if (!item) return

    const now = Date.now()
    const elapsed = now - item.startTime
    const minDuration = item.config.minDuration || 0

    // 清理定时器
    if (item.delayTimer) {
      clearTimeout(item.delayTimer)
    }
    if (item.timeoutTimer) {
      clearTimeout(item.timeoutTimer)
    }

    // 如果还没达到最小显示时间，延迟隐藏
    if (item.visible && elapsed < minDuration) {
      item.minDurationTimer = window.setTimeout(() => {
        this.loadingItems.delete(id)
        this.updateGlobalState()
      }, minDuration - elapsed)
    } else {
      this.loadingItems.delete(id)
      this.updateGlobalState()
    }
  }

  /**
   * 隐藏所有加载状态
   */
  hideAll(): void {
    const ids = Array.from(this.loadingItems.keys())
    ids.forEach(id => this.hide(id))
  }

  /**
   * 更新加载状态
   */
  update(id: string, config: Partial<LoadingConfig>): void {
    const item = this.loadingItems.get(id)
    if (!item) return

    Object.assign(item.config, config)
  }

  /**
   * 检查是否正在加载
   */
  isLoading(id?: string): boolean {
    if (id) {
      const item = this.loadingItems.get(id)
      return item?.visible || false
    }
    return this.globalLoading.value
  }

  /**
   * 获取所有可见的加载项
   */
  getVisibleItems(): LoadingItem[] {
    return Array.from(this.loadingItems.values()).filter(item => item.visible)
  }

  /**
   * 获取全局加载状态
   */
  getGlobalLoading() {
    return computed(() => this.globalLoading.value)
  }

  /**
   * 更新全局状态
   */
  private updateGlobalState(): void {
    this.globalLoading.value = Array.from(this.loadingItems.values()).some(item => item.visible)
  }

  /**
   * 获取加载统计
   */
  getStats() {
    return {
      total: this.loadingItems.size,
      visible: this.getVisibleItems().length,
      items: Array.from(this.loadingItems.values()).map(item => ({
        id: item.id,
        visible: item.visible,
        duration: Date.now() - item.startTime,
        config: { ...item.config }
      }))
    }
  }
}

// 导出单例实例
export const loadingManager = LoadingManager.getInstance()

/**
 * 加载状态组合式函数
 */
export function useLoading() {
  const manager = loadingManager

  // 简单加载状态
  const loading = ref(false)
  const loadingText = ref('')

  // 显示加载
  const showLoading = (config?: LoadingConfig): string => {
    loading.value = true
    if (config?.text) {
      loadingText.value = config.text
    }
    return manager.show(config)
  }

  // 隐藏加载
  const hideLoading = (id?: string): void => {
    loading.value = false
    loadingText.value = ''
    if (id) {
      manager.hide(id)
    }
  }

  // 带加载状态的异步操作
  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    config?: LoadingConfig
  ): Promise<T> => {
    const id = showLoading(config)
    try {
      const result = await asyncFn()
      return result
    } finally {
      hideLoading(id)
    }
  }

  // 批量操作的加载状态
  const withBatchLoading = async <T>(
    operations: Array<() => Promise<T>>,
    config?: LoadingConfig & { 
      concurrent?: boolean
      onProgress?: (completed: number, total: number) => void
    }
  ): Promise<T[]> => {
    const { concurrent = false, onProgress, ...loadingConfig } = config || {}
    const total = operations.length
    let completed = 0

    const progressConfig: LoadingConfig = {
      ...loadingConfig,
      type: 'progress',
      text: `处理中... ${completed}/${total}`
    }

    const id = showLoading(progressConfig)

    try {
      const updateProgress = () => {
        const progress = (completed / total) * 100
        manager.update(id, {
          text: `处理中... ${completed}/${total}`,
          detail: `进度: ${Math.round(progress)}%`
        })
        if (onProgress) {
          onProgress(completed, total)
        }
      }

      if (concurrent) {
        // 并发执行
        const promises = operations.map(async (op) => {
          const result = await op()
          completed++
          updateProgress()
          return result
        })
        return await Promise.all(promises)
      } else {
        // 串行执行
        const results: T[] = []
        for (const operation of operations) {
          const result = await operation()
          results.push(result)
          completed++
          updateProgress()
        }
        return results
      }
    } finally {
      hideLoading(id)
    }
  }

  return {
    loading,
    loadingText,
    showLoading,
    hideLoading,
    withLoading,
    withBatchLoading,
    isLoading: (id?: string) => manager.isLoading(id),
    getStats: () => manager.getStats()
  }
}

/**
 * 请求加载状态装饰器
 */
export function loadingWrapper(config?: LoadingConfig) {
  return function <T extends (...args: any[]) => Promise<any>>(
    _target: any,
    _propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!

    descriptor.value = (async function (this: any, ...args: any[]) {
      const { withLoading } = useLoading()
      return withLoading(() => method.apply(this, args), config)
    } as any) as T

    return descriptor
  }
}

/**
 * 全局加载组件混入
 */
export const GlobalLoadingMixin = {
  computed: {
    $globalLoading() {
      return loadingManager.getGlobalLoading()
    }
  },
  methods: {
    $showLoading(config?: LoadingConfig) {
      return loadingManager.show(config)
    },
    $hideLoading(id?: string) {
      if (id) {
        loadingManager.hide(id)
      } else {
        loadingManager.hideAll()
      }
    },
    $withLoading<T>(asyncFn: () => Promise<T>, config?: LoadingConfig): Promise<T> {
      return useLoading().withLoading(asyncFn, config)
    }
  }
}

/**
 * 预定义的加载配置
 */
export const LOADING_CONFIGS = {
  // 页面加载
  PAGE: {
    text: '页面加载中...',
    type: 'spinner' as const,
    overlay: true,
    delay: 300,
    minDuration: 800
  },

  // 数据获取
  DATA: {
    text: '数据加载中...',
    type: 'dots' as const,
    delay: 200,
    minDuration: 500
  },

  // 保存操作
  SAVE: {
    text: '保存中...',
    type: 'spinner' as const,
    delay: 100,
    minDuration: 800
  },

  // 删除操作
  DELETE: {
    text: '删除中...',
    type: 'spinner' as const,
    delay: 100,
    minDuration: 500
  },

  // 文件上传
  UPLOAD: {
    text: '上传中...',
    type: 'progress' as const,
    delay: 0,
    minDuration: 0,
    timeout: 60000
  },

  // 列表加载
  LIST: {
    text: '加载列表...',
    type: 'skeleton' as const,
    delay: 300,
    minDuration: 500,
    skeletonLines: 5
  },

  // 搜索
  SEARCH: {
    text: '搜索中...',
    type: 'wave' as const,
    delay: 500,
    minDuration: 300
  },

  // 导出
  EXPORT: {
    text: '导出中...',
    type: 'progress' as const,
    overlay: true,
    delay: 0,
    timeout: 120000
  }
}

/**
 * Vue插件安装
 */
export const LoadingPlugin = {
  install(app: App) {
    // 全局属性
    app.config.globalProperties.$loading = loadingManager
    app.config.globalProperties.$showLoading = (config?: LoadingConfig) => loadingManager.show(config)
    app.config.globalProperties.$hideLoading = (id?: string) => {
      if (id) {
        loadingManager.hide(id)
      } else {
        loadingManager.hideAll()
      }
    }

    // 全局组合式函数
    app.provide('useLoading', useLoading)
  }
}

export default loadingManager