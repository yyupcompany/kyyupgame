#!/usr/bin/env node

/**
 * 快速测试 Centers 页面，检查主要的 404 错误
 */

import { chromium } from 'playwright'
import path from 'path'

const PROJECT_ROOT = '/home/zhgue/kyyupgame/k.yyup.com'
const BASE_URL = 'http://localhost:5173'

const centers = [
  '/mobile/centers',
  '/mobile/centers/activity-center/index',  // 直接访问重定向后的URL
  '/mobile/centers/attendance-center',
  '/mobile/centers/teacher-center',
  '/mobile/centers/inspection-center',
  '/mobile/centers/teaching-center',
  '/mobile/centers/document-center',
  '/mobile/centers/task-center'
]

async function quickTest() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('   Centers 快速测试')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')

  console.log('启动浏览器...')
  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 375, height: 667 },
    isMobile: true
  })

  const errors = []
  const successes = []

  for (const centerPath of centers) {
    try {
      console.log(`测试: ${centerPath}...`)

      const response = await page.goto(BASE_URL + centerPath, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      })

      // 检查状态码
      const status = response.status()

      if (status >= 400) {
        console.log(`  ❌ 错误: ${status}`)
        errors.push({ path: centerPath, status })
      } else {
        console.log(`  ✅ 正常: ${status}`)
        successes.push({ path: centerPath, status })
      }

      // 等待页面加载
      await page.waitForTimeout(500)

      // 检查是否有404文本
      const bodyText = await page.textContent('body')
      if (bodyText.includes('404') || bodyText.includes('Page Not Found')) {
        console.log(`  ⚠️  页面包含404内容`)
        errors.push({ path: centerPath, status: '404 in content' })
      }

    } catch (error) {
      console.log(`  ❌ 异常: ${error.message}`)
      errors.push({ path: centerPath, error: error.message })
    }
  }

  console.log('')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('测试结果总结')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('')
  console.log(`成功: ${successes.length}`)
  console.log(`失败: ${errors.length}`)
  console.log('')

  if (errors.length > 0) {
    console.log('失败的路由:')
    errors.forEach(err => {
      console.log(`  - ${err.path}: ${err.status || err.error}`)
    })
  } else {
    console.log('✅ 所有路由都正常！')
  }

  await browser.close()
  console.log('')
}

quickTest().catch(error => {
  console.error('测试失败:', error)
  process.exit(1)
})
