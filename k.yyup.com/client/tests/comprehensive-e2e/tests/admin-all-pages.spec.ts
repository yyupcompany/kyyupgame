import { test } from '@playwright/test'
import { chromium } from '@playwright/test'
import { TEST_USERS, type UserRole } from '../config/test-users'
import { LoginHelper } from '../utils/login-helper'
import { ConsoleMonitor } from '../utils/console-monitor'
import { DataChecker } from '../utils/data-checker'
import { NetworkMonitor } from '../utils/network-monitor'
import { ContentValidator } from '../utils/content-validator'
import { ButtonChecker } from '../utils/button-checker'

test.describe('Admin角色 - 所有页面测试', () => {
  let page: any
  let context: any
  let loginHelper: any = null

  test.beforeAll(async () => {
    const browser = await chromium.launch()
    context = await browser.newContext()
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test('测试Admin角色所有23个页面', async () => {
    const role: UserRole = 'admin'
    const pages = [
      '/dashboard',
      '/centers',
      '/centers/business',
      '/centers/activity',
      '/centers/enrollment',
      '/centers/customer-pool',
      '/centers/task',
      '/centers/document-center',
      '/centers/finance',
      '/centers/marketing',
      '/centers/call-center',
      '/centers/media',
      '/centers/principal-media-center',
      '/centers/personnel',
      '/centers/teaching',
      '/centers/assessment',
      '/centers/attendance',
      '/centers/analytics',
      '/centers/usage',
      '/group',
      '/centers/inspection',
      '/centers/system',
      '/centers/ai'
    ]

    console.log('')
    console.log('='.repeat(60))
    console.log('开始测试Admin角色所有23个页面')
    console.log('='.repeat(60))

    // 登录（只登录一次）
    loginHelper = new LoginHelper(page, context)
    const loginResult = await loginHelper.login(role)
    if (!loginResult.success) {
      throw new Error('登录失败: ' + loginResult.error)
    }
    console.log('登录成功: ' + loginResult.username)

    // 测试每个页面
    const results = []
    for (let i = 0; i < pages.length; i++) {
      const path = pages[i]
      console.log('')
      console.log('进度: ' + (i + 1) + '/' + pages.length)
      console.log('测试页面: ' + path)
      console.log('─'.repeat(60))

      try {
        // 导航到页面
        await page.goto(path)
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
          path,
          success: !hasErrors,
          buttonIssues: buttonResult.issues.length,
          consoleErrors: consoleResult.total,
          contentIssues: contentResult.issues.length,
          dataIssues: dataResult.totalIssues,
          networkRequests: networkResult.totalRequests
        })

        console.log('  按钮: ' + buttonResult.totalButtons + ' 个, ' + buttonResult.issues.length + ' 个问题')
        console.log('  控制台: ' + consoleResult.total + ' 个错误')
        console.log('  内容: ' + contentResult.issues.length + ' 个问题')
        console.log('  数据: ' + dataResult.totalIssues + ' 个问题')
        console.log('  网络: ' + networkResult.totalRequests + ' 个请求')
        console.log('  ✓ 测试完成')

      } catch (error) {
        console.log('  ✗ 测试失败: ' + error)
        results.push({
          path,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }

      // 等待一下再测试下一个页面
      await page.waitForTimeout(500)
    }

    // 生成报告
    console.log('')
    console.log('='.repeat(60))
    console.log('测试结果汇总')
    console.log('='.repeat(60))
    console.log('总页面数: ' + pages.length)
    console.log('成功数: ' + results.filter(r => r.success).length)
    console.log('失败数: ' + results.filter(r => !r.success).length)

    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length
    const successRate = ((successCount / pages.length) * 100).toFixed(2)

    console.log('成功率: ' + successRate + '%')
  })
})
