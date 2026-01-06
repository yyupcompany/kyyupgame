/**
 * UI检查工具
 * 提供页面UI元素、样式、布局验证等功能
 */

import { test, expect, Page } from '@playwright/test'

export interface UiCheckResult {
  isPassed: boolean
  errors: string[]
  warnings: string[]
  screenshots?: string[]
  elementsFound: number
  elementsMissing: number
}

export interface LayoutCheckResult {
  isResponsive: boolean
  layoutIssues: string[]
  elementPositions: Record<string, { x: number; y: number; width: number; height: number }>
  viewportInfo: { width: number; height: number }
}

export interface StyleCheckResult {
  isConsistent: boolean
  colorIssues: string[]
  fontIssues: string[]
  spacingIssues: string[]
  themeViolations: string[]
}

export class UiCheckers {
  /**
   * 检查页面基本元素是否存在
   */
  static async checkPageElements(page: Page, elementSelectors: Record<string, string>): Promise<UiCheckResult> {
    const result: UiCheckResult = {
      isPassed: true,
      errors: [],
      warnings: [],
      elementsFound: 0,
      elementsMissing: 0
    }

    for (const [name, selector] of Object.entries(elementSelectors)) {
      try {
        const element = page.locator(selector)
        const count = await element.count()

        if (count === 0) {
          result.isPassed = false
          result.errors.push(`Missing element: ${name} (${selector})`)
          result.elementsMissing++
        } else {
          result.elementsFound++
          // 检查元素是否可见
          const isVisible = await element.isVisible()
          if (!isVisible) {
            result.warnings.push(`Element exists but not visible: ${name}`)
          }
        }
      } catch (error) {
        result.isPassed = false
        result.errors.push(`Error checking element ${name}: ${error.message}`)
        result.elementsMissing++
      }
    }

    return result
  }

  /**
   * 检查页面布局
   */
  static async checkPageLayout(page: Page): Promise<LayoutCheckResult> {
    const result: LayoutCheckResult = {
      isResponsive: true,
      layoutIssues: [],
      elementPositions: {},
      viewportInfo: { width: 0, height: 0 }
    }

    // 获取视口信息
    const viewportSize = page.viewportSize()
    if (viewportSize) {
      result.viewportInfo = { width: viewportSize.width, height: viewportSize.height }
    }

    // 检查关键布局元素
    const layoutElements = {
      header: 'header, .header, [data-testid="header"]',
      sidebar: '.sidebar, .side-nav, [data-testid="sidebar"]',
      main: 'main, .main-content, [data-testid="main-content"]',
      footer: 'footer, .footer, [data-testid="footer"]'
    }

    for (const [name, selector] of Object.entries(layoutElements)) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          const boundingBox = await element.boundingBox()
          if (boundingBox) {
            result.elementPositions[name] = {
              x: boundingBox.x,
              y: boundingBox.y,
              width: boundingBox.width,
              height: boundingBox.height
            }

            // 检查布局合理性
            if (boundingBox.width <= 0 || boundingBox.height <= 0) {
              result.layoutIssues.push(`${name} has zero dimensions`)
            }

            // 检查重叠（简单检查）
            if (name === 'header' && boundingBox.y < 0) {
              result.layoutIssues.push(`${name} is positioned outside viewport`)
            }
          }
        } else {
          result.layoutIssues.push(`${name} element not found or not visible`)
        }
      } catch (error) {
        result.layoutIssues.push(`Error checking ${name}: ${error.message}`)
      }
    }

    // 检查响应式断点
    const viewportWidth = viewportSize?.width || 0
    if (viewportWidth < 768) {
      // 移动端检查
      const sidebar = page.locator('.sidebar, .side-nav').first()
      if (await sidebar.isVisible()) {
        result.isResponsive = false
        result.layoutIssues.push('Sidebar visible on mobile viewport')
      }
    }

    return result
  }

  /**
   * 检查主题和样式一致性
   */
  static async checkThemeConsistency(page: Page): Promise<StyleCheckResult> {
    const result: StyleCheckResult = {
      isConsistent: true,
      colorIssues: [],
      fontIssues: [],
      spacingIssues: [],
      themeViolations: []
    }

    // 检查主题色彩一致性
    const primaryColors = await page.evaluate(() => {
      const getComputedStyle = (element: Element) => window.getComputedStyle(element)
      const elements = document.querySelectorAll('[data-testid="primary-button"], .btn-primary, .primary-color')
      const colors = new Set<string>()

      elements.forEach(el => {
        const bgColor = getComputedStyle(el).backgroundColor
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(bgColor)
        }
      })

      return Array.from(colors)
    })

    if (primaryColors.length > 1) {
      result.isConsistent = false
      result.colorIssues.push(`Inconsistent primary colors: ${primaryColors.join(', ')}`)
    }

    // 检查字体一致性
    const fontFamilies = await page.evaluate(() => {
      const elements = document.querySelectorAll('body, .text-content, h1, h2, h3, p')
      const fonts = new Set<string>()

      elements.forEach(el => {
        const fontFamily = window.getComputedStyle(el).fontFamily
        if (fontFamily) {
          fonts.add(fontFamily)
        }
      })

      return Array.from(fonts)
    })

    if (fontFamilies.length > 3) {
      result.warnings?.push('Too many different font families used')
    }

    // 检查可访问性
    const contrastIssues = await page.evaluate(() => {
      const issues: string[] = []
      const elements = document.querySelectorAll('[data-testid="text-with-bg"]')

      elements.forEach(el => {
        const computedStyle = window.getComputedStyle(el)
        const color = computedStyle.color
        const backgroundColor = computedStyle.backgroundColor

        // 简单的对比度检查（实际应该使用更精确的计算）
        if (color === backgroundColor) {
          issues.push(`Element has same text and background color`)
        }
      })

      return issues
    })

    result.themeViolations.push(...contrastIssues)

    return result
  }

  /**
   * 检查表单元素
   */
  static async checkFormElements(page: Page, formSelector: string = 'form'): Promise<UiCheckResult> {
    const result: UiCheckResult = {
      isPassed: true,
      errors: [],
      warnings: [],
      elementsFound: 0,
      elementsMissing: 0
    }

    const form = page.locator(formSelector).first()
    if (!(await form.isVisible())) {
      result.isPassed = false
      result.errors.push(`Form not found: ${formSelector}`)
      return result
    }

    // 检查表单元素
    const formElements = {
      inputs: 'input[type="text"], input[type="email"], input[type="password"]',
      selects: 'select',
      textareas: 'textarea',
      buttons: 'button, input[type="button"], input[type="submit"]',
      labels: 'label'
    }

    for (const [type, selector] of Object.entries(formElements)) {
      const elements = form.locator(selector)
      const count = await elements.count()

      if (type === 'labels') {
        // 检查标签是否与输入字段关联
        const inputs = await form.locator('input, select, textarea').all()
        const labels = await elements.all()

        for (const input of inputs) {
          const hasLabel = await page.evaluate((el) => {
            const id = el.getAttribute('id')
            if (id) {
              return document.querySelector(`label[for="${id}"]`) !== null
            }
            return false
          }, input)

          if (!hasLabel) {
            result.warnings.push(`Input field without associated label`)
          }
        }
      }

      result.elementsFound += count
    }

    return result
  }

  /**
   * 检查数据表格
   */
  static async checkTableData(page: Page, tableSelector: string = 'table'): Promise<UiCheckResult> {
    const result: UiCheckResult = {
      isPassed: true,
      errors: [],
      warnings: [],
      elementsFound: 0,
      elementsMissing: 0
    }

    const table = page.locator(tableSelector).first()
    if (!(await table.isVisible())) {
      result.isPassed = false
      result.errors.push(`Table not found: ${tableSelector}`)
      return result
    }

    // 检查表格结构
    const thead = table.locator('thead')
    const tbody = table.locator('tbody')
    const headers = table.locator('th')
    const rows = table.locator('tr')

    if (!(await thead.isVisible())) {
      result.warnings.push('Table missing thead')
    }

    if (!(await tbody.isVisible())) {
      result.warnings.push('Table missing tbody')
    }

    const headerCount = await headers.count()
    const rowCount = await rows.count()

    if (headerCount === 0) {
      result.errors.push('Table has no headers')
    }

    if (rowCount <= 1) {
      result.warnings.push('Table has no data rows')
    }

    result.elementsFound = headerCount + rowCount

    return result
  }

  /**
   * 检查导航菜单
   */
  static async checkNavigationMenu(page: Page, navSelector: string = 'nav, .navigation'): Promise<UiCheckResult> {
    const result: UiCheckResult = {
      isPassed: true,
      errors: [],
      warnings: [],
      elementsFound: 0,
      elementsMissing: 0
    }

    const nav = page.locator(navSelector).first()
    if (!(await nav.isVisible())) {
      result.errors.push(`Navigation not found: ${navSelector}`)
      result.isPassed = false
      return result
    }

    // 检查导航链接
    const navLinks = nav.locator('a, [role="menuitem"]')
    const linkCount = await navLinks.count()

    if (linkCount === 0) {
      result.errors.push('Navigation has no clickable items')
      result.isPassed = false
    } else {
      // 检查链接有效性
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = navLinks.nth(i)
        const href = await link.getAttribute('href')

        if (!href && !(await link.getAttribute('onclick'))) {
          result.warnings.push(`Navigation item has no link or action`)
        }
      }
      result.elementsFound = linkCount
    }

    return result
  }

  /**
   * 检查页面加载状态
   */
  static async checkPageLoadingState(page: Page): Promise<{
    isFullyLoaded: boolean
    loadingElements: string[]
    errors: string[]
  }> {
    const result = {
      isFullyLoaded: true,
      loadingElements: [] as string[],
      errors: [] as string[]
    }

    // 检查加载指示器
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-testid="loading"]',
      '.skeleton'
    ]

    for (const selector of loadingSelectors) {
      const elements = page.locator(selector)
      const count = await elements.count()

      if (count > 0) {
        result.isFullyLoaded = false
        result.loadingElements.push(`${selector} (${count} elements)`)
      }
    }

    // 检查错误状态
    const errorSelectors = [
      '.error',
      '[data-testid="error"]',
      '.error-message'
    ]

    for (const selector of errorSelectors) {
      const elements = page.locator(selector)
      const count = await elements.count()

      if (count > 0) {
        result.errors.push(`${selector} (${count} elements)`)
      }
    }

    // 检查网络活动
    const isNetworkIdle = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length > 0
    })

    return result
  }

  /**
   * 检查控制台错误
   */
  static async checkConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('pageerror', error => {
      errors.push(error.message)
    })

    return errors
  }

  /**
   * 执行完整UI检查
   */
  static async performFullUiCheck(page: Page, options: {
    checkLayout?: boolean
    checkTheme?: boolean
    checkForms?: boolean
    checkTables?: boolean
    checkNavigation?: boolean
  } = {}): Promise<{
    elements: UiCheckResult
    layout?: LayoutCheckResult
    theme?: StyleCheckResult
    forms?: UiCheckResult
    tables?: UiCheckResult
    navigation?: UiCheckResult
    loadingState: any
    consoleErrors: string[]
  }> {
    const {
      checkLayout = true,
      checkTheme = true,
      checkForms = true,
      checkTables = true,
      checkNavigation = true
    } = options

    const results: any = {
      loadingState: await this.checkPageLoadingState(page),
      consoleErrors: await this.checkConsoleErrors(page)
    }

    // 基本元素检查
    const basicElements = {
      'Main Content': 'main, .main-content, [data-testid="main"]',
      'Header': 'header, .header, [data-testid="header"]',
      'Page Title': 'h1, .page-title, [data-testid="page-title"]'
    }
    results.elements = await this.checkPageElements(page, basicElements)

    if (checkLayout) {
      results.layout = await this.checkPageLayout(page)
    }

    if (checkTheme) {
      results.theme = await this.checkThemeConsistency(page)
    }

    if (checkForms) {
      results.forms = await this.checkFormElements(page)
    }

    if (checkTables) {
      results.tables = await this.checkTableData(page)
    }

    if (checkNavigation) {
      results.navigation = await this.checkNavigationMenu(page)
    }

    return results
  }
}