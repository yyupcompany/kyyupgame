/**
 * 控制台监控器
 * 监听并捕获页面控制台的所有错误和警告
 */

import type { Page, ConsoleMessage } from 'playwright'

export interface ConsoleError {
  type: 'error' | 'warning' | 'api' | 'resource'
  message: string
  location?: string
  stack?: string
  url?: string
  status?: number
  timestamp: Date
}

export interface ConsoleMonitorResult {
  javascript: ConsoleError[]
  warnings: ConsoleError[]
  api: ConsoleError[]
  resource: ConsoleError[]
  unhandled: ConsoleError[]
  total: number
}

/**
 * 控制台监控器类
 */
export class ConsoleMonitor {
  private page: Page
  private errors: ConsoleError[] = []
  private warnings: ConsoleError[] = []
  private apiErrors: ConsoleError[] = []
  private resourceErrors: ConsoleError[] = []
  private unhandledErrors: ConsoleError[] = []
  private isMonitoring = false

  constructor(page: Page) {
    this.page = page
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.isMonitoring) {
      return
    }

    console.log('  → 开始监控控制台...')
    this.isMonitoring = true

    // 监听console消息
    this.page.on('console', (msg: ConsoleMessage) => {
      this.handleConsoleMessage(msg)
    })

    // 监听页面错误
    this.page.on('pageerror', (error: Error) => {
      this.handlePageError(error)
    })

    // 监听请求失败
    this.page.on('responsefailed', (response) => {
      this.handleResponseFailed(response)
    })

    // 监听响应错误
    this.page.on('response', async (response) => {
      if (response.status() >= 400) {
        await this.handleResponseError(response)
      }
    })

    // 监听未捕获的Promise rejection
    this.page.on('pageerror', (error) => {
      if (error.message.includes('Uncaught') || error.message.includes('Unhandled')) {
        this.unhandledErrors.push({
          type: 'error',
          message: error.message,
          stack: error.stack,
          timestamp: new Date()
        })
      }
    })

    console.log('  ✓ 控制台监控已启动')
  }

  /**
   * 处理console消息
   */
  private handleConsoleMessage(msg: ConsoleMessage): void {
    const type = msg.type()
    const text = msg.text()
    const location = msg.location()

    if (type === 'error') {
      this.errors.push({
        type: 'error',
        message: text,
        location: `${location.url}:${location.lineNumber}:${location.columnNumber}`,
        timestamp: new Date()
      })
    } else if (type === 'warning') {
      this.warnings.push({
        type: 'warning',
        message: text,
        location: `${location.url}:${location.lineNumber}:${location.columnNumber}`,
        timestamp: new Date()
      })
    }
  }

  /**
   * 处理页面错误
   */
  private handlePageError(error: Error): void {
    this.errors.push({
      type: 'error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    })
  }

  /**
   * 处理响应失败
   */
  private handleResponseFailed(response: any): void {
    const url = response.url()

    // 只关注API错误
    if (url.includes('/api/')) {
      this.apiErrors.push({
        type: 'api',
        message: `请求失败: ${response.status()}`,
        url,
        status: response.status(),
        timestamp: new Date()
      })
    }

    // 资源加载失败
    if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf)$/)) {
      this.resourceErrors.push({
        type: 'resource',
        message: `资源加载失败: ${url}`,
        url,
        status: response.status(),
        timestamp: new Date()
      })
    }
  }

  /**
   * 处理响应错误
   */
  private async handleResponseError(response: any): Promise<void> {
    const url = response.url()
    const status = response.status()

    // 只关注API错误
    if (!url.includes('/api/')) {
      return
    }

    try {
      const body = await response.text().catch(() => '')
      this.apiErrors.push({
        type: 'api',
        message: `API错误 ${status}: ${body.slice(0, 200)}`,
        url,
        status,
        timestamp: new Date()
      })
    } catch {
      this.apiErrors.push({
        type: 'api',
        message: `API错误 ${status}`,
        url,
        status,
        timestamp: new Date()
      })
    }
  }

  /**
   * 获取所有错误
   */
  getErrors(): ConsoleError[] {
    return [...this.errors]
  }

  /**
   * 获取所有警告
   */
  getWarnings(): ConsoleError[] {
    return [...this.warnings]
  }

  /**
   * 获取所有API错误
   */
  getApiErrors(): ConsoleError[] {
    return [...this.apiErrors]
  }

  /**
   * 获取所有资源错误
   */
  getResourceErrors(): ConsoleError[] {
    return [...this.resourceErrors]
  }

  /**
   * 获取所有未处理的错误
   */
  getUnhandledErrors(): ConsoleError[] {
    return [...this.unhandledErrors]
  }

  /**
   * 获取完整结果
   */
  getResult(): ConsoleMonitorResult {
    return {
      javascript: this.errors,
      warnings: this.warnings,
      api: this.apiErrors,
      resource: this.resourceErrors,
      unhandled: this.unhandledErrors,
      total: this.errors.length + this.warnings.length + this.apiErrors.length + this.resourceErrors.length + this.unhandledErrors.length
    }
  }

  /**
   * 清空所有记录
   */
  clear(): void {
    this.errors = []
    this.warnings = []
    this.apiErrors = []
    this.resourceErrors = []
    this.unhandledErrors = []
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isMonitoring = false
    console.log('  → 控制台监控已停止')
  }

  /**
   * 打印错误报告
   */
  printReport(): void {
    const result = this.getResult()

    console.log('\n  📋 控制台监控报告:')
    console.log(`  总错误数: ${result.total}`)
    console.log('  ──────────────────────────────────')

    if (result.javascript.length > 0) {
      console.log(`  🔴 JavaScript错误 (${result.javascript.length}):`)
      result.javascript.slice(0, 5).forEach(err => {
        console.log(`    - ${err.message.slice(0, 100)}`)
        if (err.location) {
          console.log(`      位置: ${err.location}`)
        }
      })
      if (result.javascript.length > 5) {
        console.log(`    ... 还有 ${result.javascript.length - 5} 个错误`)
      }
    }

    if (result.api.length > 0) {
      console.log(`  🔌 API错误 (${result.api.length}):`)
      result.api.slice(0, 5).forEach(err => {
        console.log(`    - ${err.url} [${err.status}]`)
        console.log(`      ${err.message.slice(0, 100)}`)
      })
      if (result.api.length > 5) {
        console.log(`    ... 还有 ${result.api.length - 5} 个错误`)
      }
    }

    if (result.resource.length > 0) {
      console.log(`  📦 资源加载错误 (${result.resource.length}):`)
      result.resource.forEach(err => {
        console.log(`    - ${err.url}`)
      })
    }

    if (result.warnings.length > 0) {
      console.log(`  ⚠️  警告 (${result.warnings.length}):`)
      result.warnings.slice(0, 3).forEach(warn => {
        console.log(`    - ${warn.message.slice(0, 100)}`)
      })
      if (result.warnings.length > 3) {
        console.log(`    ... 还有 ${result.warnings.length - 3} 个警告`)
      }
    }

    if (result.total === 0) {
      console.log('  ✓ 未发现控制台错误')
    }

    console.log()
  }
}

/**
 * 创建控制台监控器实例
 */
export function createConsoleMonitor(page: Page): ConsoleMonitor {
  return new ConsoleMonitor(page)
}

/**
 * 等待并捕获控制台错误
 */
export async function captureConsoleErrors(page: Page, duration: number = 1000): Promise<ConsoleMonitorResult> {
  const monitor = new ConsoleMonitor(page)
  monitor.start()

  // 等待指定时间
  await page.waitForTimeout(duration)

  const result = monitor.getResult()
  monitor.stop()

  return result
}
