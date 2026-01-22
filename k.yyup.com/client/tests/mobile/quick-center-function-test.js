#!/usr/bin/env node

/**
 * 快速测试Centers页面功能 - 简化版
 * 测试页面加载、控制台错误、空白页面
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:5173'

const centers = [
  { path: '/mobile/centers', name: 'Centers首页' },
  { path: '/mobile/centers/activity-center/index', name: '活动中心' },
  { path: '/mobile/centers/attendance-center', name: '考勤中心' },
  { path: '/mobile/centers/teacher-center', name: '教师中心' },
  { path: '/mobile/centers/inspection-center', name: '督导中心' },
  { path: '/mobile/centers/teaching-center', name: '授课中心' },
  { path: '/mobile/centers/document-center', name: '文档中心' },
  { path: '/mobile/centers/task-center', name: '任务中心' }
]

async function quickFunctionTest() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('   Centers功能快速测试')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage({
    viewport: { width: 375, height: 667 },
    isMobile: true
  })

  // 捕获控制台错误
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  // 捕获页面错误
  const pageErrors = []
  page.on('pageerror', error => {
    pageErrors.push(error.message)
  })

  const results = []

  for (const center of centers) {
    console.log(`测试: ${center.name}`)

    try {
      // 访问页面
      const response = await page.goto(BASE_URL + center.path, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      })

      // 等待页面加载
      await page.waitForTimeout(2000)

      // 检查状态码
      const status = response.status()

      // 检查是否有404内容
      const bodyText = await page.textContent('body')
      const has404 = bodyText.includes('404') || bodyText.includes('Page Not Found')

      // 检查是否空白页（内容少于100字符）
      const isBlank = bodyText.trim().length < 100

      // 清空错误数组（为下一次测试做准备）
      const currentConsoleErrors = [...consoleErrors]
      const currentPageErrors = [...pageErrors]
      consoleErrors.length = 0
      pageErrors.length = 0

      // 判断结果
      if (status >= 400) {
        console.log(`  ❌ HTTP错误: ${status}`)
        results.push({ name: center.name, status: 'error', error: `HTTP ${status}` })
      } else if (has404) {
        console.log(`  ❌ 页面包含404内容`)
        results.push({ name: center.name, status: 'error', error: '404 in content' })
      } else if (isBlank) {
        console.log(`  ⚠️  页面可能为空（内容长度: ${bodyText.trim().length}）`)
        results.push({ name: center.name, status: 'warning', error: 'Blank page' })
      } else if (currentConsoleErrors.length > 0) {
        console.log(`  ⚠️  有控制台错误（${currentConsoleErrors.length}个）`)
        results.push({ name: center.name, status: 'warning', error: 'Console errors', details: currentConsoleErrors })
      } else {
        console.log(`  ✅ 正常加载`)
        results.push({ name: center.name, status: 'success' })
      }

      // 打印前50个字符作为预览
      const preview = bodyText.trim().substring(0, 50).replace(/\n/g, ' ')
      console.log(`     预览: ${preview}...`)

    } catch (error) {
      console.log(`  ❌ 异常: ${error.message}`)
      results.push({ name: center.name, status: 'error', error: error.message })
    }
  }

  await browser.close()

  // 输出总结
  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('测试总结')
  console.log('═══════════════════════════════════════════════════════════════')

  const success = results.filter(r => r.status === 'success').length
  const warning = results.filter(r => r.status === 'warning').length
  const error = results.filter(r => r.status === 'error').length

  console.log(`总测试数: ${centers.length}`)
  console.log(`✅ 正常: ${success}`)
  console.log(`⚠️  警告: ${warning}`)
  console.log(`❌ 错误: ${error}`)
  console.log('')

  if (warning > 0 || error > 0) {
    console.log('问题详情:')
    results.filter(r => r.status !== 'success').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`)
      if (r.details) {
        r.details.forEach(d => console.log(`    ${d}`))
      }
    })
  } else {
    console.log('🎉 所有页面都正常加载！')
  }

  return results
}

quickFunctionTest().catch(error => {
  console.error('测试失败:', error)
  process.exit(1)
})
