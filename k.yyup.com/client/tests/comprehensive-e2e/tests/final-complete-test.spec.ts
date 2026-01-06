import { test, expect } from '@playwright/test'
import { createLoginHelper } from '../utils/login-helper'
import { createButtonChecker } from '../utils/button-checker'
import { createConsoleMonitor } from '../utils/console-monitor'
import { createContentValidator } from '../utils/content-validator'
import { createDataChecker } from '../utils/data-checker'
import { createNetworkMonitor } from '../utils/network-monitor'

test('快速测试 - Admin角色Dashboard页面', async ({ page, context }) => {
  console.log('\n🚀 快速测试开始')
  console.log('='.repeat(60))

  // 创建登录辅助器
  const loginHelper = await createLoginHelper(page, context)

  // 登录
  console.log('\n🔐 登录测试')
  const loginResult = await loginHelper.login('admin')
  console.log(`登录结果: ${loginResult.success ? '成功' : '失败'}`)

  expect(loginResult.success).toBe(true)

  // 等待页面加载
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // 导航到dashboard
  console.log('\n📄 测试Dashboard页面')
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // 创建监控工具
  const buttonChecker = createButtonChecker(page)
  const consoleMonitor = createConsoleMonitor(page)
  const contentValidator = createContentValidator(page)
  const dataChecker = createDataChecker(page)
  const networkMonitor = createNetworkMonitor(page)

  // 开始监控
  console.log('\n🔍 启动监控工具...')
  consoleMonitor.start()
  dataChecker.startMonitoring()
  networkMonitor.startMonitoring()
  networkMonitor.setCurrentPage('/dashboard')

  // 执行测试
  console.log('\n🧪 执行测试...')

  // 按钮检测
  console.log('  1. 检测按钮...')
  const buttonResult = await buttonChecker.checkAllButtons()
  console.log(`     找到 ${buttonResult.totalButtons} 个按钮，${buttonResult.issues.length} 个问题`)

  // 控制台错误检测
  console.log('  2. 检测控制台错误...')
  const consoleResult = consoleMonitor.getResult()
  console.log(`     发现 ${consoleResult.total} 个错误`)

  // 内容验证
  console.log('  3. 验证内容...')
  const contentResult = await contentValidator.validate()
  console.log(`     内容验证完成`)

  // 数据检查
  console.log('  4. 检查数据...')
  const dataResult = await dataChecker.check()
  console.log(`     发现 ${dataResult.totalIssues} 个问题`)

  // 网络监控
  console.log('  5. 监控网络请求...')
  const networkResult = networkMonitor.getResult()
  console.log(`     发现 ${networkResult.totalRequests} 个API请求`)

  // 停止监控
  consoleMonitor.stop()
  dataChecker.stopMonitoring()
  networkMonitor.stopMonitoring()

  // 打印汇总
  console.log('\n📊 测试汇总:')
  console.log(`  按钮问题: ${buttonResult.issues.length}`)
  console.log(`  控制台错误: ${consoleResult.total}`)
  console.log(`  数据问题: ${dataResult.totalIssues}`)
  console.log(`  API请求: ${networkResult.totalRequests}`)

  console.log('\n✅ 快速测试完成')
})