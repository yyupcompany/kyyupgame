#!/usr/bin/env node

/**
 * 快速测试所有角色的Centers页面访问权限
 * 测试 admin, principal, teacher, parent 四个角色
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:5173'

const roles = [
  { name: 'admin', button: '管理员' },
  { name: 'principal', button: '园长' },
  { name: 'teacher', button: '教师' },
  { name: 'parent', button: '家长' }
]

async function testAllRoles() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('   所有角色Centers页面访问测试')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')

  const browser = await chromium.launch()
  const results = []

  for (const role of roles) {
    console.log(`测试角色: ${role.name} (${role.button})`)
    const page = await browser.newPage({
      viewport: { width: 375, height: 667 },
      isMobile: true
    })

    try {
      // 捕获控制台日志
      const consoleLogs = []
      page.on('console', msg => {
        consoleLogs.push({
          type: msg.type(),
          text: msg.text()
        })
      })

      // 访问登录页面
      await page.goto(`${BASE_URL}/mobile/login`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      console.log(`  点击快捷登录按钮: ${role.button}`)
      // 点击快捷登录按钮
      await page.locator('button', { hasText: role.button }).click()
      await page.waitForTimeout(3000)

      // 打印控制台日志
      console.log('  控制台日志:')
      consoleLogs.forEach(log => {
        console.log(`    [${log.type}] ${log.text}`)
      })

      // 打印localStorage中的用户信息用于调试
      const userInfo = await page.evaluate(() => {
        return {
          token: localStorage.getItem('kindergarten_token'),
          user: localStorage.getItem('kindergarten_user'),
          role: localStorage.getItem('user_role')
        }
      })
      console.log(`  LocalStorage用户信息:`, JSON.stringify(userInfo, null, 2))

      // 检查当前URL
      const currentUrl = page.url()
      console.log(`  当前URL: ${currentUrl}`)

      // 检查是否有403提示
      const bodyText = await page.textContent('body')
      const has403 = bodyText.includes('403') || bodyText.includes('无权访问') || bodyText.includes('权限不足')

      if (has403) {
        console.log(`  ❌ 检测到403错误`)
        results.push({ role: role.name, success: false, url: currentUrl, error: '403错误' })
      } else if (currentUrl.includes('/mobile/centers')) {
        console.log(`  ✅ 成功访问Centers页面`)
        results.push({ role: role.name, success: true, url: currentUrl })
      } else {
        console.log(`  ⚠️  未重定向到Centers页面`)
        results.push({ role: role.name, success: false, url: currentUrl, error: '未访问Centers' })
      }

      // 截图保存
      const screenshotPath = `/tmp/${role.name}-login-test.png`
      await page.screenshot({ path: screenshotPath, fullPage: true })
      console.log(`  截图已保存: ${screenshotPath}`)

    } catch (error) {
      console.log(`  ❌ 异常: ${error.message}`)
      results.push({ role: role.name, success: false, error: error.message })
    } finally {
      await page.close()
    }

    console.log('')
  }

  await browser.close()

  // 输出总结
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('测试结果总结')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')

  results.forEach(result => {
    const status = result.success ? '✅ 通过' : '❌ 失败'
    console.log(`${result.role}: ${status}`)
    if (!result.success && result.error) {
      console.log(`  错误: ${result.error}`)
    }
    if (result.url) {
      console.log(`  URL: ${result.url}`)
    }
    console.log('')
  })

  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  console.log(`总计: ${passed} 通过, ${failed} 失败`)
  console.log('')

  return results
}

testAllRoles().catch(error => {
  console.error('测试失败:', error)
  process.exit(1)
})
