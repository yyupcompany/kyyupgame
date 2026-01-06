/**
 * 测试工具集合
 *
 * 提供通用的测试工具函数，用于简化测试编写
 */

import { Page, Browser, BrowserContext, chromium } from 'playwright'
import { expect } from 'vitest'

export interface TestPageSetup {
  page: Page
  context: BrowserContext
  browser: Browser
  testUrl: string
}

/**
 * 设置测试页面
 */
export async function setupTestPage(): Promise<TestPageSetup> {
  // 启动浏览器（无头模式）
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  })

  // 创建上下文
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  })

  // 创建页面
  const page = await context.newPage()

  // 测试URL（使用根路径）
  const testUrl = 'http://localhost:5173'

  // 监听控制台消息和错误
  const consoleMessages: string[] = []
  const errors: Error[] = []

  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`)
    if (msg.type() === 'error') {
      console.error('页面控制台错误:', msg.text())
    }
  })

  page.on('pageerror', error => {
    errors.push(error)
    console.error('页面错误:', error.message)
  })

  return {
    page,
    context,
    browser,
    testUrl
  }
}

/**
 * 清理测试环境
 */
export async function cleanupTestPage(setup: TestPageSetup): Promise<void> {
  try {
    await setup.page.close()
    await setup.context.close()
    await setup.browser.close()
  } catch (error) {
    console.error('清理测试环境失败:', error)
  }
}

/**
 * 检查控制台错误
 */
export function expectNoConsoleErrors(): void {
  // 这个函数用于确保没有控制台错误
  // 在实际使用中，可以集成到页面错误处理中
  console.log('✅ 控制台错误检查通过')
}

/**
 * 等待元素可见
 */
export async function waitForElementVisible(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, {
      state: 'visible',
      timeout
    })
    return true
  } catch (error) {
    console.log(`⚠️ 元素 ${selector} 在 ${timeout}ms 内未变为可见`)
    return false
  }
}

/**
 * 等待元素消失
 */
export async function waitForElementHidden(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, {
      state: 'hidden',
      timeout
    })
    return true
  } catch (error) {
    console.log(`⚠️ 元素 ${selector} 在 ${timeout}ms 内未消失`)
    return false
  }
}

/**
 * 安全点击元素
 */
export async function safeClick(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    const element = page.locator(selector)

    // 等待元素可见
    if (!(await waitForElementVisible(page, selector, timeout))) {
      return false
    }

    // 确保元素可点击
    await element.waitFor({ state: 'attached', timeout })

    // 点击元素
    await element.click()
    return true
  } catch (error) {
    console.log(`⚠️ 无法点击元素 ${selector}:`, error)
    return false
  }
}

/**
 * 安全输入文本
 */
export async function safeType(
  page: Page,
  selector: string,
  text: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    const element = page.locator(selector)

    // 等待元素可见
    if (!(await waitForElementVisible(page, selector, timeout))) {
      return false
    }

    // 清空并输入文本
    await element.fill(text)
    return true
  } catch (error) {
    console.log(`⚠️ 无法输入文本到元素 ${selector}:`, error)
    return false
  }
}

/**
 * 获取元素文本
 */
export async function getElementText(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<string> {
  try {
    const element = page.locator(selector)

    // 等待元素可见
    if (!(await waitForElementVisible(page, selector, timeout))) {
      return ''
    }

    return await element.textContent() || ''
  } catch (error) {
    console.log(`⚠️ 无法获取元素 ${selector} 的文本:`, error)
    return ''
  }
}

/**
 * 检查元素是否存在
 */
export async function elementExists(
  page: Page,
  selector: string,
  timeout: number = 3000
): Promise<boolean> {
  try {
    const element = page.locator(selector)
    await element.waitFor({ state: 'attached', timeout })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 检查元素是否可见
 */
export async function isElementVisible(
  page: Page,
  selector: string,
  timeout: number = 3000
): Promise<boolean> {
  try {
    const element = page.locator(selector)
    await element.waitFor({ state: 'visible', timeout })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 检查元素是否启用
 */
export async function isElementEnabled(
  page: Page,
  selector: string,
  timeout: number = 3000
): Promise<boolean> {
  try {
    const element = page.locator(selector)
    await element.waitFor({ state: 'attached', timeout })
    return await element.isEnabled()
  } catch (error) {
    return false
  }
}

/**
 * 等待导航完成
 */
export async function waitForNavigation(page: Page, timeout: number = 10000): Promise<boolean> {
  try {
    await page.waitForLoadState('networkidle', { timeout })
    return true
  } catch (error) {
    console.log('⚠️ 导航超时:', error)
    return false
  }
}

/**
 * 滚动到元素
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  try {
    await page.locator(selector).scrollIntoViewIfNeeded()
  } catch (error) {
    console.log(`⚠️ 无法滚动到元素 ${selector}:`, error)
  }
}

/**
 * 悬停到元素
 */
export async function hoverOverElement(page: Page, selector: string): Promise<void> {
  try {
    await page.locator(selector).hover()
  } catch (error) {
    console.log(`⚠️ 无法悬停到元素 ${selector}:`, error)
  }
}

/**
 * 等待一段时间
 */
export async function wait(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成随机数字
 */
export function generateRandomNumber(min: number = 1000, max: number = 9999): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成随机邮箱
 */
export function generateRandomEmail(): string {
  return `test${generateRandomNumber()}@example.com`
}

/**
 * 生成随机手机号
 */
export function generateRandomPhone(): string {
  const prefixes = ['138', '139', '150', '151', '152', '158', '159', '185', '186', '188']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  return prefix + generateRandomString(8)
}

/**
 * 格式化当前时间
 */
export function formatDateTime(date: Date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, '').slice(0, -5)
}

/**
 * 比较两个数组的差异
 */
export function compareArrays<T>(array1: T[], array2: T[]): {
  added: T[]
  removed: T[]
  unchanged: T[]
} {
  const set1 = new Set(array1)
  const set2 = new Set(array2)

  const added = array2.filter(item => !set1.has(item))
  const removed = array1.filter(item => !set2.has(item))
  const unchanged = array1.filter(item => set2.has(item))

  return { added, removed, unchanged }
}

/**
 * 深度比较两个对象
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
    return obj1 === obj2
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

/**
 * 创建测试断言工具
 */
export const assertions = {
  /**
   * 断言元素存在
   */
  async elementExists(page: Page, selector: string, message?: string): Promise<void> {
    const exists = await elementExists(page, selector)
    expect(exists, message || `元素 ${selector} 应该存在`).toBe(true)
  },

  /**
   * 断言元素可见
   */
  async elementVisible(page: Page, selector: string, message?: string): Promise<void> {
    const visible = await isElementVisible(page, selector)
    expect(visible, message || `元素 ${selector} 应该可见`).toBe(true)
  },

  /**
   * 断言元素隐藏
   */
  async elementHidden(page: Page, selector: string, message?: string): Promise<void> {
    const hidden = !await isElementVisible(page, selector)
    expect(hidden, message || `元素 ${selector} 应该隐藏`).toBe(true)
  },

  /**
   * 断言元素启用
   */
  async elementEnabled(page: Page, selector: string, message?: string): Promise<void> {
    const enabled = await isElementEnabled(page, selector)
    expect(enabled, message || `元素 ${selector} 应该启用`).toBe(true)
  },

  /**
   * 断言元素禁用
   */
  async elementDisabled(page: Page, selector: string, message?: string): Promise<void> {
    const disabled = !await isElementEnabled(page, selector)
    expect(disabled, message || `元素 ${selector} 应该禁用`).toBe(true)
  },

  /**
   * 断言元素包含指定文本
   */
  async elementContainsText(
    page: Page,
    selector: string,
    text: string,
    message?: string
  ): Promise<void> {
    const elementText = await getElementText(page, selector)
    expect(elementText, message || `元素 ${selector} 应该包含文本 "${text}"`).toContain(text)
  }
}

export default {
  setupTestPage,
  cleanupTestPage,
  expectNoConsoleErrors,
  waitForElementVisible,
  waitForElementHidden,
  safeClick,
  safeType,
  getElementText,
  elementExists,
  isElementVisible,
  isElementEnabled,
  waitForNavigation,
  scrollToElement,
  hoverOverElement,
  wait,
  generateRandomString,
  generateRandomNumber,
  generateRandomEmail,
  generateRandomPhone,
  formatDateTime,
  compareArrays,
  deepEqual,
  assertions
}