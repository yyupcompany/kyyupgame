/**
 * Resize事件处理工具类
 * 用于统一管理窗口resize事件，避免ResizeObserver循环错误
 */

export class ResizeHandler {
  private listeners = new Set<() => void>()
  private debounceTimer: NodeJS.Timeout | null = null
  private initialized = false

  constructor(private debounceDelay: number = 100) {}

  /**
   * 初始化resize处理器
   */
  private init(): void {
    if (this.initialized) return
    
    const debouncedHandler = () => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      
      this.debounceTimer = setTimeout(() => {
        this.listeners.forEach(listener => {
          try {
            listener()
          } catch (error) {
            console.warn('Resize listener error:', error)
          }
        })
      }, this.debounceDelay)
    }

    window.addEventListener('resize', debouncedHandler, { passive: true })
    this.initialized = true
  }

  /**
   * 添加resize监听器
   */
  addListener(listener: () => void): () => void {
    this.init()
    this.listeners.add(listener)
    
    // 返回清理函数
    return () => this.removeListener(listener)
  }

  /**
   * 移除resize监听器
   */
  removeListener(listener: () => void): void {
    this.listeners.delete(listener)
  }

  /**
   * 清理所有监听器
   */
  destroy(): void {
    this.listeners.clear()
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }
}

// 全局实例
export const globalResizeHandler = new ResizeHandler()

/**
 * Vue组合式函数：使用resize监听器
 */
export function useResize(callback: () => void) {
  const cleanup = globalResizeHandler.addListener(callback)
  
  return {
    cleanup
  }
}