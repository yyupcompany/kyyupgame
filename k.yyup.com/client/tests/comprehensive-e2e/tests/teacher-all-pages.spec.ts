import { test } from '@playwright/test'
import { chromium } from '@playwright/test'
import { TEST_USERS, type UserRole } from '../config/test-users'
import { createLoginHelper } from '../utils/login-helper'
import { ConsoleMonitor } from '../utils/console-monitor'
import { DataChecker } from '../utils/data-checker'
import { NetworkMonitor } from '../utils/network-monitor'
import { ContentValidator } from '../utils/content-validator'
import { ButtonChecker } from '../utils/button-checker'
import { PAGE_ROUTES } from '../config/page-routes'

test.describe('教师角色 - 所有页面测试', () => {
  let page: any
  let context: any

  test.beforeAll(async () => {
    const browser = await chromium.launch()
    context = await browser.newContext()
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test('测试教师角色所有36个页面', async () => {
    const role: UserRole = 'teacher'
    const pages = PAGE_ROUTES.filter(p => p.roles.includes(role))
    
    console.log('')
    console.log('='.repeat(60))
    console.log('开始测试教师角色所有36个页面')
    console.log('用户: ' + TEST_USERS[role].realName)
    console.log('='.repeat(60))

    // 登录
    const loginHelper = createLoginHelper(page, context)
    const loginResult = await loginHelper.login(role)
    if (!loginResult.success) {
      throw new Error('登录失败: ' + loginResult.error)
    }
    console.log('登录成功: ' + loginResult.username)

    // 测试每个页面
    const results = []
    for (let i = 0; i < pages.length; i++) {
      const pageRoute = pages[i]
      console.log('')
      console.log('进度: ' + (i + 1) + '/' + pages.length)
      console.log('测试页面: ' + pageRoute.path)
      console.log('标题: ' + pageRoute.title)
      console.log('─'.repeat(60))

      try {
        // 导航到页面
        await page.goto(pageRoute.path)
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

        // 创建监控工具
        const buttonChecker = new ButtonChecker(page)
        const consoleMonitor = new ConsoleMonitor(page)
        const contentValidator = new ContentValidator(page)
        const dataChecker = new DataChecker(page)
        const networkMonitor = new NetworkMonitor(page)

        // 启动监控
        consoleMonitor.start()
        dataChecker.startMonitoring()
        networkMonitor.startMonitoring()

        // 执行测试
        const buttonResult = await buttonChecker.checkAllButtons()
        const consoleResult = consoleMonitor.getResult()
        const contentResult = await contentValidator.validate()
        const dataResult = await dataChecker.check()
        const networkResult = await networkMonitor.getResult()

        // 停止监控
        consoleMonitor.stop()
        dataChecker.stopMonitoring()

        // 汇总
        const hasErrors =
          buttonResult.issues.length > 0 ||
          consoleResult.total > 0 ||
          contentResult.issues.length > 0 ||
          dataResult.totalIssues > 0

        results.push({
          path: pageRoute.path,
          success: !hasErrors,
          buttonIssues: buttonResult.issues.length,
          consoleErrors: consoleResult.total,
          contentIssues: contentResult.issues.length,
          dataIssues: dataResult.totalIssues,
          networkRequests: networkResult.totalRequests
        })

        console.log('测试完成')

      } catch (error) {
        console.log('测试失败: ' + error)
        results.push({
          path: pageRoute.path,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }

      // 等待一下再测试下一个页面
      await page.waitForTimeout(500)
    }

    // 生成报告
    console.log('')
    console.log('教师角色测试完成')
    console.log('测试页面数: ' + results.length)
    console.log('成功数: ' + results.filter(r => r.success).length)
    console.log('失败数: ' + results.filter(r => !r.success).length)
  })
})
