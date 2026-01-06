/**
 * 数据检查器
 * 检查API数据问题和空数据状态
 */

import type { Page } from 'playwright'

export interface ApiError {
  url: string
  status: number
  message: string
  timestamp: Date
}

export interface DataCheckResult {
  apiErrors: ApiError[]
  emptyDataCards: EmptyDataInfo[]
  emptyTables: EmptyDataInfo[]
  loadingTimeouts: string[]
  totalIssues: number
}

export interface EmptyDataInfo {
  selector: string
  text: string
  location: string
}

/**
 * 数据检查器类
 */
export class DataChecker {
  private page: Page
  private apiErrors: ApiError[] = []
  private interceptedRequests: Set<string> = new Set()

  constructor(page: Page) {
    this.page = page
  }

  /**
   * 开始监听API请求
   */
  startMonitoring(): void {
    console.log('  → 开始监听API请求...')

    // 监听响应
    this.page.on('response', async (response) => {
      const url = response.url()

      // 只关注API请求
      if (!url.includes('/api/')) {
        return
      }

      // 记录已完成的请求
      this.interceptedRequests.add(url)

      // 检查错误响应
      if (response.status() >= 400) {
        try {
          const body = await response.text().catch(() => '')
          let message = `HTTP ${response.status}`

          try {
            const json = JSON.parse(body)
            message = json.message || json.error || message
          } catch {
            // 非JSON响应
          }

          this.apiErrors.push({
            url,
            status: response.status(),
            message: message.slice(0, 200),
            timestamp: new Date()
          })
        } catch {
          this.apiErrors.push({
            url,
            status: response.status(),
            message: `HTTP ${response.status}`,
            timestamp: new Date()
          })
        }
      }
    })

    // 监听请求失败
    this.page.on('requestfailed', (request) => {
      const url = request.url()
      if (url.includes('/api/')) {
        this.apiErrors.push({
          url,
          status: 0,
          message: '请求失败',
          timestamp: new Date()
        })
      }
    })

    console.log('  ✓ API监听已启动')
  }

  /**
   * 执行数据检查
   */
  async check(): Promise<DataCheckResult> {
    const result: DataCheckResult = {
      apiErrors: [...this.apiErrors],
      emptyDataCards: [],
      emptyTables: [],
      loadingTimeouts: [],
      totalIssues: 0
    }

    console.log('  → 开始检查数据问题...')

    // 1. 检查空数据卡片
    result.emptyDataCards = await this.checkEmptyDataCards()
    console.log(`    发现 ${result.emptyDataCards.length} 个空数据卡片`)

    // 2. 检查空表格
    result.emptyTables = await this.checkEmptyTables()
    console.log(`    发现 ${result.emptyTables.length} 个空数据表格`)

    // 3. 检查加载超时
    result.loadingTimeouts = await this.checkLoadingTimeouts()
    if (result.loadingTimeouts.length > 0) {
      console.log(`    发现 ${result.loadingTimeouts.length} 个加载超时`)
    }

    // 4. 统计API错误
    if (result.apiErrors.length > 0) {
      console.log(`    发现 ${result.apiErrors.length} 个API错误`)
    }

    result.totalIssues =
      result.emptyDataCards.length +
      result.emptyTables.length +
      result.loadingTimeouts.length +
      result.apiErrors.length

    console.log('  ✓ 数据检查完成')

    return result
  }

  /**
   * 检查空数据卡片
   */
  private async checkEmptyDataCards(): Promise<EmptyDataInfo[]> {
    const results: EmptyDataInfo[] = []

    const cardSelectors = [
      '.data-card',
      '.stat-card',
      '.info-card',
      '.el-card',
      '[data-card="true"]'
    ]

    for (const selector of cardSelectors) {
      try {
        const cards = await this.page.$$(selector)

        for (const card of cards) {
          const isEmpty = await this.isCardEmpty(card)
          if (isEmpty) {
            const text = await card.evaluate(el => el.textContent?.slice(0, 100) || '')
            const className = await card.evaluate(el => el.className)

            results.push({
              selector: className.slice(0, 50),
              text: text.slice(0, 50),
              location: selector
            })
          }
        }
      } catch {
        continue
      }
    }

    return results
  }

  /**
   * 检查空表格
   */
  private async checkEmptyTables(): Promise<EmptyDataInfo[]> {
    const results: EmptyDataInfo[] = []

    const tableSelectors = [
      '.el-table__empty-text',
      '.no-rows',
      '.empty-table',
      '[data-empty="true"]',
      '.table-empty'
    ]

    for (const selector of tableSelectors) {
      try {
        const elements = await this.page.$$(selector)

        for (const element of elements) {
          const text = await element.evaluate(el => el.textContent?.slice(0, 100) || '')
          const parent = await element.evaluate(el => el.parentElement?.className || '')

          results.push({
            selector: parent.slice(0, 50),
            text: text.slice(0, 50),
            location: selector
          })
        }
      } catch {
        continue
      }
    }

    return results
  }

  /**
   * 检查加载超时
   */
  private async checkLoadingTimeouts(): Promise<string[]> {
    const results: string[] = []

    const loadingSelectors = [
      '.loading',
      '.el-loading-mask',
      '.spinner',
      '[data-loading="true"]'
    ]

    for (const selector of loadingSelectors) {
      try {
        const elements = await this.page.$$(selector)
        for (const element of elements) {
          const isVisible = await element.isVisible()
          if (isVisible) {
            const parent = await element.evaluate(el => el.parentElement?.className || '')
            results.push(parent.slice(0, 50))
          }
        }
      } catch {
        continue
      }
    }

    return results
  }

  /**
   * 检查卡片是否为空
   */
  private async isCardEmpty(card: any): Promise<boolean> {
    try {
      // 检查文本内容
      const text = await card.textContent()
      const isEmpty = !text || text.trim().length < 5 || text.includes('暂无')

      if (isEmpty) {
        return true
      }

      // 检查空状态类
      const hasEmptyClass = await card.evaluate((el: any) => {
        return (
          el.classList.contains('empty') ||
          el.classList.contains('no-data') ||
          el.getAttribute('data-empty') === 'true'
        )
      })

      if (hasEmptyClass) {
        return true
      }

      // 检查是否有空状态子元素
      const hasEmptyChild = await card.$('.empty-state, .no-data, [data-empty="true"]')
      return !!hasEmptyChild
    } catch {
      return false
    }
  }

  /**
   * 获取API错误
   */
  getApiErrors(): ApiError[] {
    return [...this.apiErrors]
  }

  /**
   * 清空记录
   */
  clear(): void {
    this.apiErrors = []
    this.interceptedRequests.clear()
  }

  /**
   * 打印检查报告
   */
  printReport(result: DataCheckResult): void {
    console.log('\n  💾 数据检查报告:')
    console.log(`  总问题数: ${result.totalIssues}`)
    console.log('  ──────────────────────────────────')

    if (result.apiErrors.length > 0) {
      console.log(`\n  🔌 API错误 (${result.apiErrors.length}):`)
      result.apiErrors.slice(0, 5).forEach(err => {
        console.log(`    - ${err.url}`)
        console.log(`      [${err.status}] ${err.message}`)
      })
      if (result.apiErrors.length > 5) {
        console.log(`    ... 还有 ${result.apiErrors.length - 5} 个错误`)
      }
    }

    if (result.emptyDataCards.length > 0) {
      console.log(`\n  📇 空数据卡片 (${result.emptyDataCards.length}):`)
      result.emptyDataCards.slice(0, 3).forEach(card => {
        console.log(`    - ${card.selector}`)
        if (card.text) {
          console.log(`      "${card.text}"`)
        }
      })
      if (result.emptyDataCards.length > 3) {
        console.log(`    ... 还有 ${result.emptyDataCards.length - 3} 个`)
      }
    }

    if (result.emptyTables.length > 0) {
      console.log(`\n  📊 空数据表格 (${result.emptyTables.length}):`)
      result.emptyTables.slice(0, 3).forEach(table => {
        console.log(`    - ${table.selector}`)
        if (table.text) {
          console.log(`      "${table.text}"`)
        }
      })
      if (result.emptyTables.length > 3) {
        console.log(`    ... 还有 ${result.emptyTables.length - 3} 个`)
      }
    }

    if (result.loadingTimeouts.length > 0) {
      console.log(`\n  ⏱️  加载超时 (${result.loadingTimeouts.length}):`)
      result.loadingTimeouts.forEach(loc => {
        console.log(`    - ${loc}`)
      })
    }

    if (result.totalIssues === 0) {
      console.log('  ✓ 未发现数据问题')
    }

    console.log()
  }
}

/**
 * 创建数据检查器实例
 */
export function createDataChecker(page: Page): DataChecker {
  return new DataChecker(page)
}
