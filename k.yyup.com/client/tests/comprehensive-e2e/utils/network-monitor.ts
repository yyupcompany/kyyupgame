/**
 * 网络请求监控工具
 * 监控浏览器网络请求，验证数据是否来自API而非硬编码
 */

import type { Page, Request, Response } from 'playwright'

export interface ApiRequest {
  url: string
  method: string
  timestamp: Date
  status?: number
  responseTime?: number
  success: boolean
  error?: string
}

export interface NetworkMonitorResult {
  totalRequests: number
  apiRequests: ApiRequest[]
  hardcodedDataSuspected: boolean
  suspiciousPages: string[]
  summary: {
    successfulRequests: number
    failedRequests: number
    avgResponseTime: number
    apiEndpoints: string[]
  }
}

/**
 * 网络监控器类
 */
export class NetworkMonitor {
  private page: Page
  private requests: Map<string, ApiRequest> = new Map()
  private currentPage: string = ''
  private isMonitoring: boolean = false

  constructor(page: Page) {
    this.page = page
  }

  /**
   * 开始监控网络请求
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('  ⚠️  网络监控已在运行')
      return
    }

    console.log('  → 开始监控网络请求...')
    this.isMonitoring = true
    this.requests.clear()

    // 监听请求
    this.page.on('request', (request) => this.handleRequest(request))

    // 监听响应
    this.page.on('response', (response) => this.handleResponse(response))

    // 监听请求失败
    this.page.on('requestfailed', (request) => this.handleRequestFailed(request))

    console.log('  ✓ 网络监控已启动')
  }

  /**
   * 停止监控网络请求
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return
    }

    console.log('  → 停止网络监控...')
    this.isMonitoring = false

    // 移除所有监听器
    this.page.removeAllListeners('request')
    this.page.removeAllListeners('response')
    this.page.removeAllListeners('requestfailed')

    console.log('  ✓ 网络监控已停止')
  }

  /**
   * 设置当前页面
   */
  setCurrentPage(path: string): void {
    this.currentPage = path
  }

  /**
   * 处理请求
   */
  private handleRequest(request: Request): void {
    const url = request.url()

    // 只记录API请求
    if (!this.isApiRequest(url)) {
      return
    }

    const apiRequest: ApiRequest = {
      url,
      method: request.method(),
      timestamp: new Date(),
      success: false
    }

    this.requests.set(url, apiRequest)
  }

  /**
   * 处理响应
   */
  private handleResponse(response: Response): void {
    const url = response.url()

    // 只处理API请求
    if (!this.isApiRequest(url)) {
      return
    }

    const request = this.requests.get(url)
    if (!request) {
      return
    }

    // 更新请求信息
    request.status = response.status()
    request.success = response.ok()
    request.responseTime = Date.now() - request.timestamp.getTime()

    // 记录错误信息
    if (!response.ok()) {
      response.text().then(body => {
        try {
          const json = JSON.parse(body)
          request.error = json.message || json.error || `HTTP ${response.status()}`
        } catch {
          request.error = `HTTP ${response.status()}`
        }
      }).catch(() => {
        request.error = `HTTP ${response.status()}`
      })
    }
  }

  /**
   * 处理请求失败
   */
  private handleRequestFailed(request: Request): void {
    const url = request.url()

    // 只处理API请求
    if (!this.isApiRequest(url)) {
      return
    }

    const apiRequest = this.requests.get(url)
    if (!apiRequest) {
      return
    }

    apiRequest.success = false
    apiRequest.status = 0
    apiRequest.error = '请求失败'
  }

  /**
   * 检查是否为API请求
   */
  private isApiRequest(url: string): boolean {
    return url.includes('/api/') || url.includes('localhost:3000/api/')
  }

  /**
   * 获取监控结果
   */
  getResult(): NetworkMonitorResult {
    const apiRequests = Array.from(this.requests.values())

    const successfulRequests = apiRequests.filter(r => r.success)
    const failedRequests = apiRequests.filter(r => !r.success)
    const responseTimes = successfulRequests
      .map(r => r.responseTime || 0)
      .filter(t => t > 0)

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0

    // 获取所有API端点
    const apiEndpoints = Array.from(
      new Set(apiRequests.map(r => this.extractEndpoint(r.url)))
    )

    // 检测硬编码数据
    const hardcodedDataSuspected = this.detectHardcodedData(apiRequests)

    return {
      totalRequests: apiRequests.length,
      apiRequests,
      hardcodedDataSuspected,
      suspiciousPages: hardcodedDataSuspected ? [this.currentPage] : [],
      summary: {
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        avgResponseTime: Math.round(avgResponseTime),
        apiEndpoints
      }
    }
  }

  /**
   * 提取API端点
   */
  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname
      return path.replace(/^\/api\//, '').split('?')[0]
    } catch {
      return url
    }
  }

  /**
   * 检测硬编码数据
   * 如果页面加载后没有API请求，可能使用了硬编码数据
   */
  private detectHardcodedData(apiRequests: ApiRequest[]): boolean {
    // 如果当前页面有API请求，说明数据来自API
    if (apiRequests.length > 0) {
      return false
    }

    // 如果没有API请求，可能是硬编码数据
    // 但需要排除一些特殊情况：
    // 1. 登录页面
    // 2. 静态页面（如404、500等）
    // 3. 不需要数据的页面

    const staticPages = ['/login', '/404', '/500', '/error']
    const isStaticPage = staticPages.some(page => this.currentPage.includes(page))

    return !isStaticPage
  }

  /**
   * 清空记录
   */
  clear(): void {
    this.requests.clear()
  }

  /**
   * 打印监控报告
   */
  printReport(result: NetworkMonitorResult): void {
    console.log('\n  🌐 网络监控报告:')
    console.log(`  总请求数: ${result.totalRequests}`)
    console.log(`  成功: ${result.summary.successfulRequests}`)
    console.log(`  失败: ${result.summary.failedRequests}`)
    console.log(`  平均响应时间: ${result.summary.avgResponseTime}ms`)
    console.log('  ──────────────────────────────────')

    if (result.apiRequests.length > 0) {
      console.log('\n  API端点:')
      result.summary.apiEndpoints.slice(0, 10).forEach(endpoint => {
        console.log(`    - /api/${endpoint}`)
      })
      if (result.summary.apiEndpoints.length > 10) {
        console.log(`    ... 还有 ${result.summary.apiEndpoints.length - 10} 个端点`)
      }
    }

    if (result.summary.failedRequests > 0) {
      console.log('\n  ❌ 失败的请求:')
      result.apiRequests
        .filter(r => !r.success)
        .slice(0, 5)
        .forEach(req => {
          console.log(`    - ${req.url}`)
          console.log(`      [${req.status}] ${req.error}`)
        })
      if (result.summary.failedRequests > 5) {
        console.log(`    ... 还有 ${result.summary.failedRequests - 5} 个失败请求`)
      }
    }

    if (result.hardcodedDataSuspected) {
      console.log('\n  ⚠️  警告: 可能使用了硬编码数据')
      console.log(`    页面: ${this.currentPage}`)
      console.log('    未检测到API请求，数据可能硬编码在页面中')
    } else {
      console.log('\n  ✓ 数据来源正常')
    }
    console.log()
  }

  /**
   * 获取API请求列表
   */
  getApiRequests(): ApiRequest[] {
    return Array.from(this.requests.values())
  }

  /**
   * 获取失败的API请求
   */
  getFailedRequests(): ApiRequest[] {
    return this.getApiRequests().filter(r => !r.success)
  }

  /**
   * 检查特定API端点是否被调用
   */
  hasEndpoint(endpoint: string): boolean {
    return this.getApiRequests().some(req =>
      this.extractEndpoint(req.url) === endpoint
    )
  }

  /**
   * 获取特定API端点的请求
   */
  getRequestsByEndpoint(endpoint: string): ApiRequest[] {
    return this.getApiRequests().filter(req =>
      this.extractEndpoint(req.url) === endpoint
    )
  }
}

/**
 * 创建网络监控器实例
 */
export function createNetworkMonitor(page: Page): NetworkMonitor {
  return new NetworkMonitor(page)
}
