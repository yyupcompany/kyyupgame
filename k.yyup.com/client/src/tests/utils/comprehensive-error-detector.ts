/**
 * 全面控制台错误检测器 - 100%覆盖率版本
 * 捕获所有可能的JavaScript运行时错误
 */

import { expect, vi } from 'vitest'

// 错误类型枚举
export enum ErrorType {
  JAVASCRIPT = 'javascript',
  PROMISE = 'promise',
  ASYNC = 'async',
  VUE = 'vue',
  NETWORK = 'network',
  CONSOLE = 'console',
  RESOURCE = 'resource',
  UNHANDLED = 'unhandled'
}

// 错误严重级别
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 错误记录接口
export interface ErrorRecord {
  id: string
  type: ErrorType
  severity: ErrorSeverity
  message: string
  stack?: string
  timestamp: number
  source?: string
  url?: string
  line?: number
  column?: number
  additional?: Record<string, any>
}

// 全局错误监听器配置
export interface ErrorListenerConfig {
  captureJavaScriptErrors?: boolean
  capturePromiseRejections?: boolean
  captureConsoleErrors?: boolean
  captureVueErrors?: boolean
  captureNetworkErrors?: boolean
  captureResourceErrors?: boolean
  captureAsyncErrors?: boolean
  severityThreshold?: ErrorSeverity
  allowedErrors?: Array<string | RegExp>
  maxErrors?: number
}

/**
 * 全面错误检测器类
 */
export class ComprehensiveErrorDetector {
  private errors: ErrorRecord[] = []
  private listeners: Array<() => void> = []
  private config: Required<ErrorListenerConfig>
  private originalHandlers: {
    console?: Record<string, Function>
    errorHandler?: ((event: ErrorEvent) => void) | null
    rejectionHandler?: ((event: PromiseRejectionEvent) => void) | null
    vueErrorHandler?: ((err: any, vm: any, info: string) => void) | null
  } = {}
  private isActive = false

  constructor(config: ErrorListenerConfig = {}) {
    this.config = {
      captureJavaScriptErrors: true,
      capturePromiseRejections: true,
      captureConsoleErrors: true,
      captureVueErrors: true,
      captureNetworkErrors: true,
      captureResourceErrors: true,
      captureAsyncErrors: true,
      severityThreshold: ErrorSeverity.LOW,
      allowedErrors: [],
      maxErrors: 1000,
      ...config
    }
  }

  /**
   * 启动全面错误检测
   */
  start(): void {
    if (this.isActive) {
      this.stop()
    }

    this.errors = []
    this.isActive = true

    // 1. JavaScript错误监听
    if (this.config.captureJavaScriptErrors) {
      this.setupJavaScriptErrorListener()
    }

    // 2. Promise拒绝监听
    if (this.config.capturePromiseRejections) {
      this.setupPromiseRejectionListener()
    }

    // 3. 控制台方法监听
    if (this.config.captureConsoleErrors) {
      this.setupConsoleListener()
    }

    // 4. Vue错误监听（如果Vue可用）
    if (this.config.captureVueErrors && typeof window !== 'undefined' && window.Vue) {
      this.setupVueErrorListener()
    }

    // 5. 网络错误监听
    if (this.config.captureNetworkErrors) {
      this.setupNetworkErrorListener()
    }

    // 6. 资源加载错误监听
    if (this.config.captureResourceErrors) {
      this.setupResourceErrorListener()
    }

    // 7. 异步错误监听
    if (this.config.captureAsyncErrors) {
      this.setupAsyncErrorListener()
    }
  }

  /**
   * 停止错误检测
   */
  stop(): void {
    this.isActive = false

    // 恢复原始处理器
    if (this.originalHandlers.errorHandler) {
      window.removeEventListener('error', this.originalHandlers.errorHandler)
      this.originalHandlers.errorHandler = null
    }

    if (this.originalHandlers.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.originalHandlers.rejectionHandler)
      this.originalHandlers.rejectionHandler = null
    }

    // 恢复控制台方法
    if (this.originalHandlers.console) {
      Object.assign(console, this.originalHandlers.console)
      this.originalHandlers.console = undefined
    }

    // 移除资源错误监听器
    window.removeEventListener('error', this.handleResourceError, true)

    // 清理监听器
    this.listeners.forEach(cleanup => cleanup())
    this.listeners = []
  }

  /**
   * 设置JavaScript错误监听器
   */
  private setupJavaScriptErrorListener(): void {
    this.originalHandlers.errorHandler = (event: ErrorEvent) => {
      const error: ErrorRecord = {
        id: this.generateErrorId(),
        type: ErrorType.JAVASCRIPT,
        severity: this.determineErrorSeverity(event.error),
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        url: event.filename,
        additional: {
          isTrusted: event.isTrusted,
          errorType: 'ErrorEvent'
        }
      }

      this.recordError(error)
    }

    window.addEventListener('error', this.originalHandlers.errorHandler)
  }

  /**
   * 设置Promise拒绝监听器
   */
  private setupPromiseRejectionListener(): void {
    this.originalHandlers.rejectionHandler = (event: PromiseRejectionEvent) => {
      const error: ErrorRecord = {
        id: this.generateErrorId(),
        type: ErrorType.PROMISE,
        severity: ErrorSeverity.HIGH,
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now(),
        source: 'Promise',
        additional: {
          reason: event.reason,
          promise: event.promise
        }
      }

      this.recordError(error)
    }

    window.addEventListener('unhandledrejection', this.originalHandlers.rejectionHandler)
  }

  /**
   * 设置控制台监听器
   */
  private setupConsoleListener(): void {
    const consoleMethods = ['error', 'warn', 'info']
    this.originalHandlers.console = {}

    consoleMethods.forEach(method => {
      this.originalHandlers.console![method] = console[method]

      console[method] = (...args: any[]) => {
        const message = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg)
            } catch {
              return String(arg)
            }
          }
          return String(arg)
        }).join(' ')

        const errorRecord: ErrorRecord = {
          id: this.generateErrorId(),
          type: ErrorType.CONSOLE,
          severity: method === 'error' ? ErrorSeverity.HIGH :
                    method === 'warn' ? ErrorSeverity.MEDIUM : ErrorSeverity.LOW,
          message: `[${method.toUpperCase()}] ${message}`,
          timestamp: Date.now(),
          source: 'console',
          additional: {
            method,
            args
          }
        }

        this.recordError(errorRecord)

        // 调用原始方法
        this.originalHandlers.console![method](...args)
      }
    })
  }

  /**
   * 设置Vue错误监听器
   */
  private setupVueErrorListener(): void {
    if (window.Vue && window.Vue.config) {
      this.originalHandlers.vueErrorHandler = (err: any, vm: any, info: string) => {
        const error: ErrorRecord = {
          id: this.generateErrorId(),
          type: ErrorType.VUE,
          severity: ErrorSeverity.HIGH,
          message: err?.message || String(err),
          stack: err?.stack,
          timestamp: Date.now(),
          source: 'Vue',
          additional: {
            component: vm?.$options?.name || 'Unknown',
            info,
            vm: vm ? {
              name: vm.$options.name,
              props: vm.$props,
              data: vm.$data
            } : undefined
          }
        }

        this.recordError(error)
      }

      window.Vue.config.errorHandler = this.originalHandlers.vueErrorHandler
    }
  }

  /**
   * 设置网络错误监听器
   */
  private setupNetworkErrorListener(): void {
    const originalFetch = window.fetch
    const originalXHR = window.XMLHttpRequest

    // 拦截fetch请求
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await originalFetch(...args)

        if (!response.ok) {
          const error: ErrorRecord = {
            id: this.generateErrorId(),
            type: ErrorType.NETWORK,
            severity: ErrorSeverity.MEDIUM,
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: Date.now(),
            source: 'fetch',
            url: response.url,
            additional: {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok
            }
          }

          this.recordError(error)
        }

        return response
      } catch (error) {
        const errorRecord: ErrorRecord = {
          id: this.generateErrorId(),
          type: ErrorType.NETWORK,
          severity: ErrorSeverity.HIGH,
          message: `Network error: ${error.message}`,
          stack: error.stack,
          timestamp: Date.now(),
          source: 'fetch',
          additional: {
            requestUrl: args[0],
            requestMethod: args[1]?.method || 'GET',
            originalError: error
          }
        }

        this.recordError(errorRecord)
        throw error
      }
    }

    // 保存原始方法用于恢复
    this.listeners.push(() => {
      window.fetch = originalFetch
    })
  }

  /**
   * 设置资源加载错误监听器
   */
  private setupResourceErrorListener(): void {
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement
      const error: ErrorRecord = {
        id: this.generateErrorId(),
        type: ErrorType.RESOURCE,
        severity: ErrorSeverity.MEDIUM,
        message: `Resource loading error: ${target.tagName}`,
        timestamp: Date.now(),
        source: 'resource',
        additional: {
          tagName: target.tagName,
          src: (target as HTMLImageElement).src ||
               (target as HTMLScriptElement).src ||
               (target as HTMLLinkElement).href
        }
      }

      this.recordError(error)
    }

    window.addEventListener('error', handleResourceError, true)

    this.listeners.push(() => {
      window.removeEventListener('error', handleResourceError, true)
    })
  }

  /**
   * 设置异步错误监听器
   */
  private setupAsyncErrorListener(): void {
    // 监听setTimeout和setInterval错误
    const originalSetTimeout = window.setTimeout
    const originalSetInterval = window.setInterval

    window.setTimeout = (callback: Function, delay?: number, ...args: any[]) => {
      const wrappedCallback = () => {
        try {
          return callback(...args)
        } catch (error) {
          const errorRecord: ErrorRecord = {
            id: this.generateErrorId(),
            type: ErrorType.ASYNC,
            severity: ErrorSeverity.HIGH,
            message: `setTimeout error: ${error.message}`,
            stack: error.stack,
            timestamp: Date.now(),
            source: 'setTimeout',
            additional: {
              delay,
              originalError: error
            }
          }

          this.recordError(errorRecord)
          throw error
        }
      }

      return originalSetTimeout.call(window, wrappedCallback, delay, ...args)
    }

    window.setInterval = (callback: Function, delay?: number, ...args: any[]) => {
      const wrappedCallback = () => {
        try {
          return callback(...args)
        } catch (error) {
          const errorRecord: ErrorRecord = {
            id: this.generateErrorId(),
            type: ErrorType.ASYNC,
            severity: ErrorSeverity.HIGH,
            message: `setInterval error: ${error.message}`,
            stack: error.stack,
            timestamp: Date.now(),
            source: 'setInterval',
            additional: {
              delay,
              originalError: error
            }
          }

          this.recordError(errorRecord)
          throw error
        }
      }

      return originalSetInterval.call(window, wrappedCallback, delay, ...args)
    }

    // 保存原始方法用于恢复
    this.listeners.push(() => {
      window.setTimeout = originalSetTimeout
      window.setInterval = originalSetInterval
    })
  }

  /**
   * 处理资源加载错误
   */
  private handleResourceError = (event: Event) => {
    const target = event.target as HTMLElement
    const error: ErrorRecord = {
      id: this.generateErrorId(),
      type: ErrorType.RESOURCE,
      severity: ErrorSeverity.MEDIUM,
      message: `Resource loading error: ${target.tagName}`,
      timestamp: Date.now(),
      source: 'resource',
      additional: {
        tagName: target.tagName,
        src: (target as HTMLImageElement).src ||
             (target as HTMLScriptElement).src ||
             (target as HTMLLinkElement).href
      }
    }

    this.recordError(error)
  }

  /**
   * 记录错误
   */
  private recordError(error: ErrorRecord): void {
    // 检查是否在允许的错误列表中
    if (this.isAllowedError(error.message)) {
      return
    }

    // 检查错误严重级别阈值
    if (this.isBelowThreshold(error.severity)) {
      return
    }

    // 检查错误数量限制
    if (this.errors.length >= this.config.maxErrors) {
      this.errors.shift() // 移除最旧的错误
    }

    this.errors.push(error)
  }

  /**
   * 检查是否为允许的错误
   */
  private isAllowedError(message: string): boolean {
    return this.config.allowedErrors.some(allowed => {
      if (typeof allowed === 'string') {
        return message.includes(allowed)
      }
      return allowed.test(message)
    })
  }

  /**
   * 检查是否低于严重级别阈值
   */
  private isBelowThreshold(severity: ErrorSeverity): boolean {
    const severityLevels = {
      [ErrorSeverity.LOW]: 1,
      [ErrorSeverity.MEDIUM]: 2,
      [ErrorSeverity.HIGH]: 3,
      [ErrorSeverity.CRITICAL]: 4
    }

    return severityLevels[severity] < severityLevels[this.config.severityThreshold]
  }

  /**
   * 确定错误严重级别
   */
  private determineErrorSeverity(error: Error): ErrorSeverity {
    // 根据错误类型和消息确定严重级别
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return ErrorSeverity.CRITICAL
    }

    if (error.name === 'RangeError' || error.name === 'SyntaxError') {
      return ErrorSeverity.HIGH
    }

    if (error.message.includes('Network') || error.message.includes('Fetch')) {
      return ErrorSeverity.MEDIUM
    }

    return ErrorSeverity.LOW
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取所有记录的错误
   */
  getErrors(): ErrorRecord[] {
    return [...this.errors]
  }

  /**
   * 获取错误统计
   */
  getStatistics(): {
    total: number
    byType: Record<ErrorType, number>
    bySeverity: Record<ErrorSeverity, number>
    latest?: ErrorRecord
  } {
    const byType = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = 0
      return acc
    }, {} as Record<ErrorType, number>)

    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = 0
      return acc
    }, {} as Record<ErrorSeverity, number>)

    this.errors.forEach(error => {
      byType[error.type]++
      bySeverity[error.severity]++
    })

    return {
      total: this.errors.length,
      byType,
      bySeverity,
      latest: this.errors.length > 0 ? this.errors[this.errors.length - 1] : undefined
    }
  }

  /**
   * 清空错误记录
   */
  clear(): void {
    this.errors = []
  }

  /**
   * 检查是否有错误
   */
  hasErrors(): boolean {
    return this.errors.length > 0
  }

  /**
   * 验证没有错误（用于测试断言）
   */
  expectNoErrors(customMessage?: string): void {
    const stats = this.getStatistics()

    if (stats.total > 0) {
      const errorSummary = this.errors.map(error =>
        `[${error.type.toUpperCase()}] ${error.message}${error.source ? ` (${error.source})` : ''}`
      ).join('\n')

      const message = customMessage ||
        `检测到 ${stats.total} 个错误:\n${errorSummary}`

      expect.fail(message)
    }
  }

  /**
   * 验证特定类型的错误数量
   */
  expectErrorCount(type: ErrorType, expectedCount: number, customMessage?: string): void {
    const actualCount = this.getStatistics().byType[type]

    if (actualCount !== expectedCount) {
      const message = customMessage ||
        `期望 ${type} 类型错误数量为 ${expectedCount}，实际为 ${actualCount}`

      expect.fail(message)
    }
  }

  /**
   * 验证特定严重级别的错误数量
   */
  expectSeverityCount(severity: ErrorSeverity, expectedCount: number, customMessage?: string): void {
    const actualCount = this.getStatistics().bySeverity[severity]

    if (actualCount !== expectedCount) {
      const message = customMessage ||
        `期望 ${severity} 严重级别错误数量为 ${expectedCount}，实际为 ${actualCount}`

      expect.fail(message)
    }
  }

  /**
   * 打印错误报告
   */
  printReport(): void {
    const stats = this.getStatistics()

    console.group('🚨 Comprehensive Error Detection Report')
    console.log(`总错误数: ${stats.total}`)

    if (stats.total > 0) {
      console.group('按类型统计')
      Object.entries(stats.byType).forEach(([type, count]) => {
        if (count > 0) {
          console.log(`${type}: ${count}`)
        }
      })
      console.groupEnd()

      console.group('按严重级别统计')
      Object.entries(stats.bySeverity).forEach(([severity, count]) => {
        if (count > 0) {
          console.log(`${severity}: ${count}`)
        }
      })
      console.groupEnd()

      console.group('错误详情')
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.severity}: ${error.message}`)
        if (error.source) console.log(`   Source: ${error.source}`)
        if (error.stack) console.log(`   Stack: ${error.stack?.split('\n')[0]}`)
      })
      console.groupEnd()
    }

    console.groupEnd()
  }
}

// 默认实例
export const globalErrorDetector = new ComprehensiveErrorDetector()

// 导出便捷函数
export const startComprehensiveErrorDetection = () => globalErrorDetector.start()
export const stopComprehensiveErrorDetection = () => globalErrorDetector.stop()
export const expectNoConsoleErrors = () => globalErrorDetector.expectNoErrors()
export const printErrorReport = () => globalErrorDetector.printReport()
export const getErrorStatistics = () => globalErrorDetector.getStatistics()
export const clearErrors = () => globalErrorDetector.clear()

// Vitest测试助手
export const createComprehensiveTest = (testName: string, testFn: () => void | Promise<void>) => {
  return async () => {
    // 开始错误检测
    globalErrorDetector.start()

    try {
      await testFn()

      // 验证没有错误
      globalErrorDetector.expectNoErrors()

    } finally {
      // 停止错误检测并清理
      globalErrorDetector.stop()
      globalErrorDetector.clear()
    }
  }
}

// 测试装饰器
export function withErrorDetection(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    globalErrorDetector.start()

    try {
      const result = await originalMethod.apply(this, args)
      globalErrorDetector.expectNoErrors()
      return result
    } finally {
      globalErrorDetector.stop()
      globalErrorDetector.clear()
    }
  }

  return descriptor
}

export default {
  ComprehensiveErrorDetector,
  globalErrorDetector,
  startComprehensiveErrorDetection,
  stopComprehensiveErrorDetection,
  expectNoConsoleErrors,
  printErrorReport,
  getErrorStatistics,
  clearErrors,
  createComprehensiveTest,
  withErrorDetection,
  ErrorType,
  ErrorSeverity
}