/**
 * 测试夹具
 * 提供测试用的浏览器、页面和认证工具
 */

import { test as base } from 'vitest'
import { chromium, type BrowserContext, type Page } from 'playwright'
import type { UserRole } from '../config/test-users'
import { LoginHelper } from '../utils/login-helper'
import { ButtonChecker } from '../utils/button-checker'
import { ConsoleMonitor } from '../utils/console-monitor'
import { ContentValidator } from '../utils/content-validator'
import { DataChecker } from '../utils/data-check'

// 测试夹具接口
export interface TestFixtures {
  browserContext: BrowserContext
  page: Page
  loginHelper: (role: UserRole) => Promise<LoginResult>
  buttonChecker: ButtonChecker
  consoleMonitor: ConsoleMonitor
  contentValidator: ContentValidator
  dataChecker: DataChecker
}

export interface LoginResult {
  success: boolean
  username?: string
  error?: string
}

// 扩展vitest测试
export const test = base.extend<TestFixtures>({
  // 创建浏览器上下文
  browserContext: async ({}, use) => {
    const browser = await chromium.launch({
      headless: true,
      devtools: false
    })

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })

    await use(context)

    await context.close()
    await browser.close()
  },

  // 创建页面
  page: async ({ browserContext }, use) => {
    const page = await browserContext.newPage()
    await use(page)
    await page.close()
  },

  // 创建登录辅助器
  loginHelper: async ({ page, browserContext }, use) => {
    const login = async (role: UserRole): Promise<LoginResult> => {
      const helper = new LoginHelper(page, browserContext)
      return await helper.login(role)
    }

    await use(login)
  },

  // 创建按钮检测器
  buttonChecker: async ({ page }, use) => {
    const checker = new ButtonChecker(page)
    await use(checker)
  },

  // 创建控制台监控器
  consoleMonitor: async ({ page }, use) => {
    const monitor = new ConsoleMonitor(page)
    monitor.start()
    await use(monitor)
    monitor.stop()
  },

  // 创建内容验证器
  contentValidator: async ({ page }, use) => {
    const validator = new ContentValidator(page)
    await use(validator)
  },

  // 创建数据检查器
  dataChecker: async ({ page }, use) => {
    const checker = new DataChecker(page)
    checker.startMonitoring()
    await use(checker)
  }
})

// 导出类型
export type { TestFixtures }
