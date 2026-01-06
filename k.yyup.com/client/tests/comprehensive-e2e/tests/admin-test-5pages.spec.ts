import { test, expect } from '@playwright/test'
import { chromium } from '@playwright/test'
import { TEST_USERS, type UserRole } from '../config/test-users'
import { createLoginHelper } from '../utils/login-helper'
import { ConsoleMonitor } from '../utils/console-monitor'
import { DataChecker } from '../utils/data-checker'
import { NetworkMonitor } from '../utils/network-monitor'
import { ContentValidator } from '../utils/content-validator'
import { ButtonChecker } from '../utils/button-checker'

test.describe('Admin角色测试 - 前5个页面', () => {
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

  test('测试Admin前5个页面', async () => {
    const role: UserRole = 'admin'
    const pages = [
      '/dashboard',
      '/centers',
      '/centers/business',
      '/centers/activity',
      '/centers/enrollment'
    ]

    console.log('\n🚀 开始Admin角色测试（前5个页面）')
    console.log('='.repeat(60))

    // 登录
    const loginHelper = createLoginHelper(page, context)
    const loginResult = await loginHelper.login(role)
    if (!loginResult.success) {
      throw new Error(\`登录失败: \${loginResult.error}\`)
    }
    console.log(\`✓ 登录成功: \${loginResult.username}\`)

    // 测试每个页面
    for (let i = 0; i < pages.length; i++) {
      const path = pages[i]
      console.log(\`\n进度: \${i + 1}/\${pages.length}\`)
      console.log(\`📄 测试页面: \${path}\`)
      console.log('─'.repeat(60))

      // 导航到页面
      await page.goto(path)
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

      // 执行测试
      console.log('→ 执行测试...')
      console.log('  1/5 检测按钮...')
      const buttonChecker = new ButtonChecker(page)
      const buttonIssues = await buttonChecker.check()
      console.log(\`    找到 \${buttonIssues.totalButtons} 个按钮，\${buttonIssues.issues.length} 个问题\`)

      console.log('  2/5 检测控制台错误...')
      const consoleMonitor = new ConsoleMonitor(page)
      consoleMonitor.start()
      const consoleErrors = await consoleMonitor.getErrors()
      consoleMonitor.stop()
      console.log(\`    发现 \${consoleErrors.total} 个错误\`)

      console.log('  3/5 验证内容...')
      const contentValidator = new ContentValidator(page)
      const contentIssues = await contentValidator.validate()
      console.log(\`    内容验证完成\`)

      console.log('  4/5 检查数据...')
      const dataChecker = new DataChecker(page)
      dataChecker.startMonitoring()
      const dataIssues = await dataChecker.check()
      dataChecker.stopMonitoring()
      console.log(\`    发现 \${dataIssues.totalIssues} 个问题\`)

      console.log('  5/5 监控网络请求...')
      const networkMonitor = new NetworkMonitor(page)
      networkMonitor.startMonitoring()
      await page.waitForTimeout(2000)
      const networkResult = await networkMonitor.stopMonitoring()
      console.log(\`    发现 \${networkResult.totalRequests} 个请求\`)

      // 汇总
      const hasErrors = 
        buttonIssues.issues.length > 0 ||
        consoleErrors.total > 0 ||
        contentIssues.issues.length > 0 ||
        dataIssues.totalIssues > 0

      console.log(\`  ✓ 测试完成\`)
      console.log(\`    按钮: \${buttonIssues.totalButtons} 个, \${buttonIssues.issues.length} 个问题\`)
      console.log(\`    控制台: \${consoleErrors.total} 个错误\`)
      console.log(\`    内容: \${contentIssues.issues.length} 个问题\`)
      console.log(\`    数据: \${dataIssues.totalIssues} 个问题\`)
      console.log(\`    网络: \${networkResult.totalRequests} 个请求\`)

      if (hasErrors) {
        console.log(\`  ⚠️ 页面 \${path} 有问题\`)
      }
    }

    console.log('\n✅ Admin角色测试完成')
  })
})
