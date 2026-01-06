/**
 * 内容验证器
 * 验证页面内容是否正常显示
 */

import type { Page } from 'playwright'

export interface ContentValidationResult {
  isEmpty: boolean
  hasSkeleton: boolean
  hasError: boolean
  hasLoading: boolean
  hasData: boolean
  missingData: string[]
  emptyCards: number
  emptyTables: number
  issues: string[]
}

/**
 * 内容验证器类
 */
export class ContentValidator {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * 验证页面内容
   */
  async validate(): Promise<ContentValidationResult> {
    const result: ContentValidationResult = {
      isEmpty: false,
      hasSkeleton: false,
      hasError: false,
      hasLoading: false,
      hasData: false,
      missingData: [],
      emptyCards: 0,
      emptyTables: 0,
      issues: []
    }

    console.log('  → 开始验证页面内容...')

    // 1. 检查页面是否空白
    result.isEmpty = await this.checkIsEmpty()

    if (result.isEmpty) {
      result.issues.push('页面内容为空')
      console.log('    ⚠️ 页面内容为空')
      return result
    }

    // 2. 检查骨架屏
    result.hasSkeleton = await this.checkHasSkeleton()
    if (result.hasSkeleton) {
      result.issues.push('页面仍显示骨架屏（可能加载未完成）')
      console.log('    ⚠️ 页面仍显示骨架屏')
    }

    // 3. 检查错误消息
    result.hasError = await this.checkHasError()
    if (result.hasError) {
      result.issues.push('页面显示错误消息')
      console.log('    ⚠️ 页面显示错误消息')
    }

    // 4. 检查加载状态
    result.hasLoading = await this.checkHasLoading()
    if (result.hasLoading) {
      result.issues.push('页面仍在加载中（可能超时）')
      console.log('    ⚠️ 页面仍在加载中')
    }

    // 5. 检查数据
    const dataCheck = await this.checkData()
    result.hasData = dataCheck.hasData
    result.emptyCards = dataCheck.emptyCards
    result.emptyTables = dataCheck.emptyTables
    result.missingData = dataCheck.missing

    if (!result.hasData) {
      result.issues.push('页面没有显示任何数据')
      console.log('    ⚠️ 页面没有显示任何数据')
    }

    if (result.emptyCards > 0) {
      result.issues.push(`发现 ${result.emptyCards} 个空数据卡片`)
      console.log(`    ⚠️ 发现 ${result.emptyCards} 个空数据卡片`)
    }

    if (result.emptyTables > 0) {
      result.issues.push(`发现 ${result.emptyTables} 个空数据表格`)
      console.log(`    ⚠️ 发现 ${result.emptyTables} 个空数据表格`)
    }

    console.log('  ✓ 内容验证完成')

    return result
  }

  /**
   * 检查页面是否为空
   */
  private async checkIsEmpty(): Promise<boolean> {
    try {
      // 检查body文本内容
      const bodyText = await this.page.evaluate(() => {
        return document.body.textContent || ''
      })

      const cleanText = bodyText.replace(/\s+/g, '').trim()
      return cleanText.length < 20
    } catch {
      return true
    }
  }

  /**
   * 检查是否有骨架屏
   */
  private async checkHasSkeleton(): Promise<boolean> {
    const skeletonSelectors = [
      '.skeleton',
      '.el-skeleton',
      '[data-skeleton="true"]',
      '.loading-skeleton',
      '.skeleton-loader'
    ]

    for (const selector of skeletonSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element && await element.isVisible()) {
          return true
        }
      } catch {
        continue
      }
    }

    return false
  }

  /**
   * 检查是否有错误消息
   */
  private async checkHasError(): Promise<boolean> {
    const errorSelectors = [
      '.error-message',
      '.el-message--error',
      '.error-state',
      '[data-error="true"]',
      '.error-boundary',
      '.error-container'
    ]

    for (const selector of errorSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element && await element.isVisible()) {
          return true
        }
      } catch {
        continue
      }
    }

    // 检查文本中的错误提示
    const errorTexts = [
      '错误',
      'Error',
      '失败',
      'Failed',
      '无法加载',
      '加载失败',
      '暂无权限',
      '404',
      '500'
    ]

    const pageText = await this.page.evaluate(() => document.body.textContent || '')
    return errorTexts.some(text => pageText.includes(text))
  }

  /**
   * 检查是否仍在加载
   */
  private async checkHasLoading(): Promise<boolean> {
    const loadingSelectors = [
      '.loading',
      '.el-loading-mask',
      '.spinner',
      '[data-loading="true"]',
      '.loading-overlay',
      '.is-loading'
    ]

    for (const selector of loadingSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element && await element.isVisible()) {
          return true
        }
      } catch {
        continue
      }
    }

    return false
  }

  /**
   * 检查数据内容
   */
  private async checkData(): Promise<{
    hasData: boolean
    emptyCards: number
    emptyTables: number
    missing: string[]
  }> {
    const result = {
      hasData: false,
      emptyCards: 0,
      emptyTables: 0,
      missing: [] as string[]
    }

    try {
      // 检查数据卡片
      const cardSelectors = [
        '.data-card',
        '.stat-card',
        '.info-card',
        '.card',
        '.el-card'
      ]

      for (const selector of cardSelectors) {
        const cards = await this.page.$$(selector)
        for (const card of cards) {
          const isEmpty = await this.isElementEmpty(card)
          if (isEmpty) {
            result.emptyCards++
            const cardClass = await card.evaluate(el => el.className)
            result.missing.push(`空卡片: ${cardClass.slice(0, 50)}`)
          }
        }
      }

      // 检查表格
      const tableSelectors = [
        '.el-table__empty-text',
        '.no-rows',
        '.empty-table',
        '[data-empty="true"]'
      ]

      for (const selector of tableSelectors) {
        const emptyTables = await this.page.$$(selector)
        result.emptyTables += emptyTables.length
      }

      // 检查是否有任何数据展示元素
      const dataSelectors = [
        '.data-list',
        '.list-item',
        '.table-row',
        '.chart',
        '.graph',
        '[data-has-data="true"]'
      ]

      let hasDataElement = false
      for (const selector of dataSelectors) {
        const element = await this.page.$(selector)
        if (element) {
          const isVisible = await element.isVisible()
          if (isVisible) {
            hasDataElement = true
            break
          }
        }
      }

      // 检查是否有"暂无数据"提示
      const hasNoDataText = await this.page.evaluate(() => {
        const bodyText = document.body.textContent || ''
        return bodyText.includes('暂无数据') ||
               bodyText.includes('无数据') ||
               bodyText.includes('No data')
      })

      result.hasData = hasDataElement || !hasNoDataText

    } catch (error) {
      console.error('    检查数据时出错:', error)
    }

    return result
  }

  /**
   * 检查元素是否为空
   */
  private async isElementEmpty(element: any): Promise<boolean> {
    try {
      const text = await element.textContent()
      const isEmpty = !text || text.trim().length === 0 || text.includes('暂无')

      // 检查是否有空状态类
      const hasEmptyClass = await element.evaluate((el: any) => {
        return (
          el.classList.contains('empty') ||
          el.classList.contains('no-data') ||
          el.getAttribute('data-empty') === 'true' ||
          el.querySelector('.empty-state, .no-data, [data-empty="true"]')
        )
      })

      return isEmpty || hasEmptyClass
    } catch {
      return false
    }
  }

  /**
   * 打印验证报告
   */
  printReport(result: ContentValidationResult): void {
    console.log('\n  📄 内容验证报告:')
    console.log('  ──────────────────────────────────')

    const status = {
      isEmpty: result.isEmpty ? '❌ 空白' : '✓',
      hasSkeleton: result.hasSkeleton ? '⚠️ 骨架屏' : '✓',
      hasError: result.hasError ? '❌ 错误' : '✓',
      hasLoading: result.hasLoading ? '⚠️ 加载中' : '✓',
      hasData: result.hasData ? '✓ 有数据' : '❌ 无数据'
    }

    Object.entries(status).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`)
    })

    if (result.emptyCards > 0) {
      console.log(`  空数据卡片: ${result.emptyCards}`)
    }

    if (result.emptyTables > 0) {
      console.log(`  空数据表格: ${result.emptyTables}`)
    }

    if (result.issues.length > 0) {
      console.log('\n  发现的问题:')
      result.issues.forEach(issue => {
        console.log(`    - ${issue}`)
      })
    }

    console.log()
  }
}

/**
 * 创建内容验证器实例
 */
export function createContentValidator(page: Page): ContentValidator {
  return new ContentValidator(page)
}
