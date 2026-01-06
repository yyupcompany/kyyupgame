/**
 * 四角色完整测试
 * 对admin、园长、教师、家长四个角色进行完整的元素级、功能级和数据验证测试
 * 只使用Chromium浏览器
 */

import { test, expect, Page, BrowserContext } from '@playwright/test'
import { chromium } from '@playwright/test'
import { createLoginHelper, type LoginResult } from '../utils/login-helper'
import { createButtonChecker, type ButtonCheckResult } from '../utils/button-checker'
import { createConsoleMonitor, type ConsoleMonitorResult } from '../utils/console-monitor'
import { createContentValidator, type ContentValidationResult } from '../utils/content-validator'
import { createDataChecker, type DataCheckResult } from '../utils/data-checker'
import { createNetworkMonitor, type NetworkMonitorResult } from '../utils/network-monitor'
import { createTestReporter, type PageTestResult } from '../utils/reporter'
import type { UserRole } from '../config/test-users'
import { TEST_USERS } from '../config/test-users'
import { getRoutesForRole } from '../config/page-routes'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

/**
 * 测试配置
 */
const TEST_CONFIG = {
  baseURL: 'http://localhost:5173',
  timeout: 30000,
  screenshotDir: join(process.cwd(), 'client', 'tests', 'comprehensive-e2e', 'screenshots'),
  reportDir: join(process.cwd(), 'client', 'tests', 'comprehensive-e2e', 'reports')
}

/**
 * 确保目录存在
 */
function ensureDirectories(): void {
  if (!existsSync(TEST_CONFIG.screenshotDir)) {
    mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true })
  }
  if (!existsSync(TEST_CONFIG.reportDir)) {
    mkdirSync(TEST_CONFIG.reportDir, { recursive: true })
  }
}

/**
 * 测试单个页面
 */
async function testPage(
  page: Page,
  context: BrowserContext,
  role: UserRole,
  path: string,
  title: string
): Promise<PageTestResult> {
  console.log(`\n  📄 测试页面: ${path}`)
  console.log(`  ──────────────────────────────────`)

  const startTime = Date.now()

  // 创建监控工具
  const buttonChecker = createButtonChecker(page)
  const consoleMonitor = createConsoleMonitor(page)
  const contentValidator = createContentValidator(page)
  const dataChecker = createDataChecker(page)
  const networkMonitor = createNetworkMonitor(page)

  // 开始监控
  console.log('  → 启动监控工具...')
  consoleMonitor.start()
  dataChecker.startMonitoring()
  networkMonitor.startMonitoring()
  networkMonitor.setCurrentPage(path)

  // 导航到页面
  console.log(`  → 导航到 ${path}...`)
  try {
    await page.goto(`${TEST_CONFIG.baseURL}${path}`)
    await page.waitForLoadState('networkidle', { timeout: TEST_CONFIG.timeout })
  } catch (error) {
    console.error(`  ✗ 页面加载失败: ${error}`)
    return {
      path,
      title,
      timestamp: new Date(),
      buttonIssues: { totalButtons: 0, issues: [], summary: { disabled: 0, noSize: 0, noEvent: 0, hidden: 0, blocked: 0, noText: 0 } },
      consoleErrors: { total: 0, javascript: [], warnings: [], api: [], resource: [] },
      contentIssues: { isEmpty: true, hasSkeleton: false, hasError: true, hasLoading: false, hasData: false, emptyCards: 0, emptyTables: 0, issues: ['页面加载失败'] },
      dataIssues: { apiErrors: [], emptyDataCards: [], emptyTables: [], loadingTimeouts: [], totalIssues: 1 },
      hasErrors: true
    }
  }

  // 等待页面稳定
  await page.waitForTimeout(2000)

  // 执行测试
  console.log('  → 执行测试...')

  // 1. 按钮检测
  console.log('    1/5 检测按钮...')
  const buttonIssues = await buttonChecker.checkAllButtons()

  // 2. 控制台错误检测
  console.log('    2/5 检测控制台错误...')
  const consoleErrors = consoleMonitor.getResult()

  // 3. 内容验证
  console.log('    3/5 验证内容...')
  const contentIssues = await contentValidator.validate()

  // 4. 数据检查
  console.log('    4/5 检查数据...')
  const dataIssues = await dataChecker.check()

  // 5. 网络监控
  console.log('    5/5 监控网络请求...')
  const networkResult = networkMonitor.getResult()

  // 停止监控
  consoleMonitor.stop()
  dataChecker.stopMonitoring()
  networkMonitor.stopMonitoring()

  // 截图
  const screenshotPath = join(TEST_CONFIG.screenshotDir, role, `${path.replace(/\//g, '-')}.png`)
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true })
  } catch (error) {
    console.error(`  ✗ 截图失败: ${error}`)
  }

  // 判断是否有错误
  const hasErrors =
    buttonIssues.issues.length > 0 ||
    consoleErrors.total > 0 ||
    contentIssues.issues.length > 0 ||
    dataIssues.totalIssues > 0 ||
    networkResult.summary.failedRequests > 0

  const duration = Date.now() - startTime
  console.log(`  ✓ 测试完成 (${duration}ms)`)
  console.log(`    按钮: ${buttonIssues.totalButtons} 个, ${buttonIssues.issues.length} 个问题`)
  console.log(`    控制台: ${consoleErrors.total} 个错误`)
  console.log(`    内容: ${contentIssues.issues.length} 个问题`)
  console.log(`    数据: ${dataIssues.totalIssues} 个问题`)
  console.log(`    网络: ${networkResult.totalRequests} 个请求, ${networkResult.summary.failedRequests} 个失败`)

  // 打印详细报告
  if (hasErrors) {
    buttonIssues.printReport(buttonIssues)
    consoleErrors.printReport(consoleErrors)
    contentIssues.printReport(contentIssues)
    dataIssues.printReport(dataIssues)
    networkMonitor.printReport(networkResult)
  }

  return {
    path,
    title,
    timestamp: new Date(),
    buttonIssues,
    consoleErrors,
    contentIssues,
    dataIssues,
    hasErrors
  }
}

/**
 * 测试单个角色
 */
async function testRole(
  page: Page,
  context: BrowserContext,
  role: UserRole
): Promise<void> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`开始测试角色: ${role.toUpperCase()}`)
  console.log(`用户: ${TEST_USERS[role].realName}`)
  console.log(`用户名: ${TEST_USERS[role].username}`)
  console.log(`${'='.repeat(60)}`)

  // 创建报告生成器
  const reporter = createTestReporter(role)

  // 登录
  console.log('\n🔐 登录测试')
  console.log('─'.repeat(60))

  const loginHelper = await createLoginHelper(page, context)
  const loginResult: LoginResult = await loginHelper.login(role)

  if (!loginResult.success) {
    console.error(`✗ 登录失败: ${loginResult.error}`)
    throw new Error(`登录失败: ${loginResult.error}`)
  }

  console.log(`✓ 登录成功: ${loginResult.username}`)

  // 等待登录后页面加载
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // 获取角色对应的页面路由
  const routes = getRoutesForRole(role, 'pc')
  console.log(`\n📋 找到 ${routes.length} 个页面需要测试`)

  // 测试每个页面
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    console.log(`\n进度: ${i + 1}/${routes.length}`)

    try {
      const pageResult = await testPage(page, context, role, route.path, route.title)
      reporter.addPageResult(pageResult)
    } catch (error) {
      console.error(`  ✗ 测试页面 ${route.path} 时出错:`, error)

      // 添加失败结果
      reporter.addPageResult({
        path: route.path,
        title: route.title,
        timestamp: new Date(),
        buttonIssues: { totalButtons: 0, issues: [], summary: { disabled: 0, noSize: 0, noEvent: 0, hidden: 0, blocked: 0, noText: 0 } },
        consoleErrors: { total: 0, javascript: [], warnings: [], api: [], resource: [] },
        contentIssues: { isEmpty: true, hasSkeleton: false, hasError: true, hasLoading: false, hasData: false, emptyCards: 0, emptyTables: 0, issues: ['测试异常'] },
        dataIssues: { apiErrors: [], emptyDataCards: [], emptyTables: [], loadingTimeouts: [], totalIssues: 1 },
        hasErrors: true
      })
    }

    // 半自动化：等待用户确认
    // 这里只是模拟，实际运行时会自动继续
    await page.waitForTimeout(1000)
  }

  // 生成报告
  console.log('\n📊 生成测试报告...')
  await reporter.generate()

  // 登出
  console.log('\n🔓 登出...')
  await loginHelper.logout()

  console.log(`\n${'='.repeat(60)}`)
  console.log(`${role.toUpperCase()} 角色测试完成`)
  console.log(`${'='.repeat(60)}\n`)
}

/**
 * 测试所有角色
 */
test.describe('四角色完整测试', () => {
  let page: Page
  let context: BrowserContext

  test.beforeAll(async ({ browser }) => {
    console.log('\n🚀 开始四角色完整测试')
    console.log('='.repeat(60))

    // 确保目录存在
    ensureDirectories()

    // 创建浏览器上下文
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    })

    // 创建页面
    page = await context.newPage()
  })

  test.afterAll(async () => {
    console.log('\n🎉 所有测试完成')
    console.log('='.repeat(60))

    // 关闭页面和上下文
    await page.close()
    await context.close()
  })

  /**
   * Admin角色测试
   */
  test('Admin角色测试', async () => {
    await testRole(page, context, 'admin')
  })

  /**
   * 园长角色测试
   */
  test('园长角色测试', async () => {
    await testRole(page, context, 'principal')
  })

  /**
   * 教师角色测试
   */
  test('教师角色测试', async () => {
    await testRole(page, context, 'teacher')
  })

  /**
   * 家长角色测试
   */
  test('家长角色测试', async () => {
    await testRole(page, context, 'parent')
  })
})

/**
 * 单独测试Admin角色
 */
test.describe('Admin角色测试', () => {
  let page: Page
  let context: BrowserContext

  test.beforeAll(async ({ browser }) => {
    console.log('\n🚀 开始Admin角色测试')
    console.log('='.repeat(60))

    ensureDirectories()

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    })

    page = await context.newPage()
  })

  test.afterAll(async () => {
    console.log('\n🎉 Admin角色测试完成')
    console.log('='.repeat(60))

    await page.close()
    await context.close()
  })

  test('测试Admin角色所有页面', async () => {
    await testRole(page, context, 'admin')
  })
})

/**
 * 单独测试园长角色
 */
test.describe('园长角色测试', () => {
  let page: Page
  let context: BrowserContext

  test.beforeAll(async ({ browser }) => {
    console.log('\n🚀 开始园长角色测试')
    console.log('='.repeat(60))

    ensureDirectories()

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    })

    page = await context.newPage()
  })

  test.afterAll(async () => {
    console.log('\n🎉 园长角色测试完成')
    console.log('='.repeat(60))

    await page.close()
    await context.close()
  })

  test('测试园长角色所有页面', async () => {
    await testRole(page, context, 'principal')
  })
})

/**
 * 单独测试教师角色
 */
test.describe('教师角色测试', () => {
  let page: Page
  let context: BrowserContext

  test.beforeAll(async ({ browser }) => {
    console.log('\n🚀 开始教师角色测试')
    console.log('='.repeat(60))

    ensureDirectories()

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    })

    page = await context.newPage()
  })

  test.afterAll(async () => {
    console.log('\n🎉 教师角色测试完成')
    console.log('='.repeat(60))

    await page.close()
    await context.close()
  })

  test('测试教师角色所有页面', async () => {
    await testRole(page, context, 'teacher')
  })
})

/**
 * 单独测试家长角色
 */
test.describe('家长角色测试', () => {
  let page: Page
  let context: BrowserContext

  test.beforeAll(async ({ browser }) => {
    console.log('\n🚀 开始家长角色测试')
    console.log('='.repeat(60))

    ensureDirectories()

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    })

    page = await context.newPage()
  })

  test.afterAll(async () => {
    console.log('\n🎉 家长角色测试完成')
    console.log('='.repeat(60))

    await page.close()
    await context.close()
  })

  test('测试家长角色所有页面', async () => {
    await testRole(page, context, 'parent')
  })
})
