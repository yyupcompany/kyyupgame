/**
 * 控制台错误收集工具
 * 用于捕获和分析移动端页面中的JavaScript错误
 */

export interface ConsoleError {
  type: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  timestamp: number
  url?: string
  line?: number
  column?: number
}

export class ConsoleErrorCollector {
  private errors: ConsoleError[] = []
  private warnings: ConsoleError[] = []
  private infos: ConsoleError[] = []
  private listeners: Array<(error: ConsoleError) => void> = []

  /**
   * 开始收集控制台消息
   */
  startCollecting(): void {
    if (typeof window !== 'undefined') {
      // 拦截 console.error
      const originalError = console.error
      console.error = (...args: any[]) => {
        const error: ConsoleError = {
          type: 'error',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
          stack: new Error().stack,
          timestamp: Date.now(),
          url: window.location.href
        }
        this.errors.push(error)
        this.notifyListeners(error)
        originalError.apply(console, args)
      }

      // 拦截 console.warn
      const originalWarn = console.warn
      console.warn = (...args: any[]) => {
        const warning: ConsoleError = {
          type: 'warning',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
          stack: new Error().stack,
          timestamp: Date.now(),
          url: window.location.href
        }
        this.warnings.push(warning)
        this.notifyListeners(warning)
        originalWarn.apply(console, args)
      }

      // 监听 window.onerror
      window.onerror = (message: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) => {
        const errorInfo: ConsoleError = {
          type: 'error',
          message: typeof message === 'string' ? message : 'Unknown error',
          stack: error?.stack,
          timestamp: Date.now(),
          url: source || window.location.href,
          line: lineno,
          column: colno
        }
        this.errors.push(errorInfo)
        this.notifyListeners(errorInfo)
        return false
      }

      // 监听 unhandledrejection
      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        const errorInfo: ConsoleError = {
          type: 'error',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack,
          timestamp: Date.now(),
          url: window.location.href
        }
        this.errors.push(errorInfo)
        this.notifyListeners(errorInfo)
      })
    }
  }

  /**
   * 停止收集控制台消息
   */
  stopCollecting(): void {
    // 恢复原始console方法
    if (typeof window !== 'undefined') {
      // 这里可以恢复原始的console方法
      // 但为了不影响测试，我们暂时不恢复
    }
  }

  /**
   * 添加错误监听器
   */
  addListener(callback: (error: ConsoleError) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 移除错误监听器
   */
  removeListener(callback: (error: ConsoleError) => void): void {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(error: ConsoleError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error)
      } catch (e) {
        // 忽略监听器错误
      }
    })
  }

  /**
   * 获取所有错误
   */
  getAllErrors(): ConsoleError[] {
    return [...this.errors]
  }

  /**
   * 获取所有警告
   */
  getAllWarnings(): ConsoleError[] {
    return [...this.warnings]
  }

  /**
   * 获取所有信息
   */
  getAllInfos(): ConsoleError[] {
    return [...this.infos]
  }

  /**
   * 获取所有控制台消息
   */
  getAllMessages(): ConsoleError[] {
    return [...this.errors, ...this.warnings, ...this.infos]
  }

  /**
   * 按类型过滤消息
   */
  getMessagesByType(type: ConsoleError['type']): ConsoleError[] {
    switch (type) {
      case 'error':
        return this.getAllErrors()
      case 'warning':
        return this.getAllWarnings()
      case 'info':
        return this.getAllInfos()
      default:
        return []
    }
  }

  /**
   * 清空所有收集的消息
   */
  clear(): void {
    this.errors = []
    this.warnings = []
    this.infos = []
  }

  /**
   * 判断是否有错误
   */
  hasErrors(): boolean {
    return this.errors.length > 0
  }

  /**
   * 判断是否有警告
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0
  }

  /**
   * 获取错误统计信息
   */
  getStats(): {
    totalErrors: number
    totalWarnings: number
    totalInfos: number
    totalMessages: number
    uniqueErrorTypes: Set<string>
  } {
    const uniqueErrorTypes = new Set(this.errors.map(e => e.message.split(':')[0]))

    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      totalInfos: this.infos.length,
      totalMessages: this.errors.length + this.warnings.length + this.infos.length,
      uniqueErrorTypes
    }
  }

  /**
   * 生成错误报告
   */
  generateReport(): string {
    const stats = this.getStats()
    const timestamp = new Date().toISOString()

    let report = `控制台错误报告\n`
    report += `生成时间: ${timestamp}\n`
    report += `========================\n\n`

    report += `统计信息:\n`
    report += `- 错误总数: ${stats.totalErrors}\n`
    report += `- 警告总数: ${stats.totalWarnings}\n`
    report += `- 信息总数: ${stats.totalInfos}\n`
    report += `- 唯一错误类型: ${stats.uniqueErrorTypes.size}\n\n`

    if (this.errors.length > 0) {
      report += `错误详情:\n`
      report += `---------\n`
      this.errors.forEach((error, index) => {
        report += `${index + 1}. ${error.message}\n`
        report += `   URL: ${error.url}\n`
        if (error.stack) {
          report += `   Stack: ${error.stack.split('\n').slice(0, 3).join('\n   ')}\n`
        }
        report += `\n`
      })
    }

    if (this.warnings.length > 0) {
      report += `警告详情:\n`
      report += `---------\n`
      this.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning.message}\n\n`
      })
    }

    return report
  }
}

/**
 * 创建控制台错误收集器的单例实例
 */
export const consoleErrorCollector = new ConsoleErrorCollector()

/**
 * 初始化控制台错误收集
 */
export function initConsoleErrorCollection(): void {
  if (typeof window !== 'undefined') {
    consoleErrorCollector.startCollecting()
  }
}

/**
 * 获取控制台错误报告
 */
export function getConsoleErrorReport(): string {
  return consoleErrorCollector.generateReport()
}

/**
 * 检查是否有控制台错误
 */
export function hasConsoleErrors(): boolean {
  return consoleErrorCollector.hasErrors()
}

/**
 * 检查是否有控制台警告
 */
export function hasConsoleWarnings(): boolean {
  return consoleErrorCollector.hasWarnings()
}
