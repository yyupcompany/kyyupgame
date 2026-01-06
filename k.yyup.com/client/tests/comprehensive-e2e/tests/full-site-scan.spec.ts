/**
 * 全站四角色E2E测试
 * 模拟admin、principal、teacher、parent四个角色进行全面测试
 *
 * 测试目标：
 * 1. 检测不可点击的按钮
 * 2. 捕获控制台错误
 * 3. 检测页面内容显示异常
 * 4. 检测数据问题
 */

import { test, expect } from 'vitest'
import { chromium, type Page, type BrowserContext } from 'playwright'
import type { UserRole } from '../config/test-users'
import { TEST_USERS } from '../config/test-users'
import { getRoutesForRole } from '../config/page-routes'
import { LoginHelper } from '../utils/login-helper'
import { ButtonChecker } from '../utils/button-checker'
import { ConsoleMonitor } from '../utils/console-monitor'
import { ContentValidator } from '../utils/content-validator'
import { DataChecker } from '../utils/data-checker'
import { createTestReporter, type PageTestResult } from '../utils/reporter'

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const PAGE_LOAD_TIMEOUT = 30000
const TEST_DEVICE_TYPE = 'pc' // 可选: 'pc' 或 'mobile'

/**
 * 测试单个角色
 */
async function testRole(role: UserRole) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`开始测试角色: ${role.toUpperCase()}`)
  console.log(`${'='.repeat(60)}\n`)

  // 启动浏览器
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  })

  const context = await browser.newContext({
    viewport: TEST_DEVICE_TYPE === 'mobile'
      ? { width: 375, height: 667 }
      : { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  // 设置默认超时
  page.setDefaultTimeout(PAGE_LOAD_TIMEOUT)

  // 创建测试报告器
  const reporter = createTestReporter(role)

  // 创建检测器
  const loginHelper = new LoginHelper(page, context)
  const consoleMonitor = new ConsoleMonitor(page)
  const dataChecker = new DataChecker(page)

  try {
    // 1. 登录
    console.log(`\n>>> 步骤 1: 登录 ${role} 角色`)
    const loginResult = await loginHelper.login(role)

    if (!loginResult.success) {
      console.error(`✗ ${role} 登录失败: ${loginResult.error}`)
      throw new Error(`登录失败: ${loginResult.error}`)
    }

    console.log(`✓ ${role} 登录成功\n`)

    // 2. 获取该角色的所有路由
    const routes = getRoutesForRole(role, TEST_DEVICE_TYPE)
    console.log(`>>> 步骤 2: 开始测试 ${routes.length} 个页面\n`)

    // 3. 测试每个页面
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]
      console.log(`\n${'-'.repeat(40)}`)
      console.log(`[${i + 1}/${routes.length}] 测试页面: ${route.path}`)
      console.log(`     标题: ${route.title}`)
      console.log(`     描述: ${route.description}`)
      console.log(`${'-'.repeat(40)}`)

      try {
        // 清空之前的监控记录
        consoleMonitor.clear()
        dataChecker.clear()

        // 开始监控
        consoleMonitor.start()
        dataChecker.startMonitoring()

        // 导航到页面
        const fullUrl = `${BASE_URL}${route.path}`
        await page.goto(fullUrl)

        // 等待页面加载
        await page.waitForLoadState('networkidle', { timeout: PAGE_LOAD_TIMEOUT }).catch(() => {
          console.warn('  ⚠️ 页面加载超时，但继续测试')
        })

        // 额外等待确保内容渲染
        await page.waitForTimeout(2000)

        // 执行检测
        const timestamp = new Date()

        // 1. 按钮检测
        const buttonChecker = new ButtonChecker(page)
        const buttonIssues = await buttonChecker.checkAllButtons()

        // 2. 获取控制台错误
        const consoleErrors = consoleMonitor.getResult()

        // 3. 内容验证
        const contentValidator = new ContentValidator(page)
        const contentIssues = await contentValidator.validate()

        // 4. 数据检查
        const dataIssues = await dataChecker.check()

        // 5. 截图（如果有问题）
        const hasErrors =
          buttonIssues.issues.length > 0 ||
          consoleErrors.total > 0 ||
          contentIssues.issues.length > 0 ||
          dataIssues.totalIssues > 0

        const screenshot = hasErrors ? await page.screenshot().catch(() => undefined) : undefined

        // 记录结果
        const pageResult: PageTestResult = {
          path: route.path,
          title: route.title,
          timestamp,
          buttonIssues,
          consoleErrors,
          contentIssues,
          dataIssues,
          screenshot,
          hasErrors
        }

        reporter.addPageResult(pageResult)

        // 打印简要结果
        const resultStatus = hasErrors ? '❌ 发现问题' : '✅ 通过'
        console.log(`\n  结果: ${resultStatus}`)
        console.log(`  - 按钮问题: ${buttonIssues.issues.length}`)
        console.log(`  - 控制台错误: ${consoleErrors.total}`)
        console.log(`  - 内容问题: ${contentIssues.issues.length}`)
        console.log(`  - 数据问题: ${dataIssues.totalIssues}`)

        // 如果有问题，打印详细信息
        if (hasErrors) {
          if (buttonIssues.issues.length > 0) {
            console.log('\n  按钮问题详情:')
            buttonIssues.issues.slice(0, 3).forEach(issue => {
              console.log(`    - ${issue.type}: ${issue.selector}`)
            })
          }

          if (consoleErrors.total > 0) {
            console.log('\n  控制台错误详情:')
            consoleErrors.javascript.slice(0, 3).forEach(err => {
              console.log(`    - ${err.message.slice(0, 80)}`)
            })
          }

          if (contentIssues.issues.length > 0) {
            console.log('\n  内容问题详情:')
            contentIssues.issues.forEach(issue => {
              console.log(`    - ${issue}`)
            })
          }
        }

        // 停止监控
        consoleMonitor.clear()

      } catch (error) {
        console.error(`\n✗ 测试页面 ${route.path} 时出错:`, error)

        // 记录错误
        reporter.addPageResult({
          path: route.path,
          title: route.title,
          timestamp: new Date(),
          buttonIssues: { totalButtons: 0, issues: [], summary: { disabled: 0, noSize: 0, noEvent: 0, hidden: 0, blocked: 0, noText: 0 } },
          consoleErrors: { javascript: [], warnings: [], api: [], resource: [], unhandled: [], total: 0 },
          contentIssues: { isEmpty: true, hasSkeleton: false, hasError: true, hasLoading: false, hasData: false, missingData: [], emptyCards: 0, emptyTables: 0, issues: [(error as Error).message] },
          dataIssues: { apiErrors: [], emptyDataCards: [], emptyTables: [], loadingTimeouts: [], totalIssues: 1 },
          hasErrors: true
        })
      }
    }

    // 4. 生成报告
    console.log(`\n${'='.repeat(60)}`)
    console.log(`${role} 角色测试完成，生成报告...`)
    console.log(`${'='.repeat(60)}\n`)

    await reporter.generate()

    // 打印汇总
    const results = reporter.getResults()
    console.log(`\n📊 ${role.toUpperCase()} 测试汇总:`)
    console.log(`  测试页面: ${results.summary.totalPages}`)
    console.log(`  有问题页面: ${results.summary.pagesWithErrors}`)
    console.log(`  按钮问题: ${results.summary.totalButtonIssues}`)
    console.log(`  控制台错误: ${results.summary.totalConsoleErrors}`)
    console.log(`  内容问题: ${results.summary.totalContentIssues}`)
    console.log(`  数据问题: ${results.summary.totalDataIssues}`)

  } finally {
    // 清理
    await page.close()
    await context.close()
    await browser.close()
  }
}

/**
 * 主测试套件
 */
test.describe('全站四角色E2E测试', () => {
  const roles: UserRole[] = ['admin', 'principal', 'teacher', 'parent']

  test.serial('完整扫描所有角色', async () => {
    console.log('\n' + '='.repeat(60))
    console.log('开始全站四角色E2E测试')
    console.log(`测试地址: ${BASE_URL}`)
    console.log(`设备类型: ${TEST_DEVICE_TYPE}`)
    console.log('='.repeat(60))

    const allResults = {
      admin: null as any,
      principal: null as any,
      teacher: null as any,
      parent: null as any
    }

    // 依次测试每个角色
    for (const role of roles) {
      await testRole(role)
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 所有角色测试完成！')
    console.log('='.repeat(60) + '\n')

    // 这里可以添加生成汇总报告的逻辑
  })

  // 也可以单独测试某个角色
  for (const role of roles) {
    test.describe(`${role}角色`, () => {
      test(`完整扫描 ${role} 角色的所有页面`, async () => {
        await testRole(role)
      })
    })
  }
})
