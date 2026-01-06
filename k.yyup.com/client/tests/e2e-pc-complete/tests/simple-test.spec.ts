import { test, expect } from '@playwright/test'

test('简单测试验证架构', async ({ page }) => {
  console.log('🧪 开始执行简单架构测试')

  // 测试浏览器启动
  await page.goto('http://localhost:5173')

  // 等待页面加载
  await page.waitForTimeout(2000)

  // 检查页面标题
  const title = await page.title()
  console.log(`页面标题: ${title}`)

  // 基本验证
  expect(title).toBeTruthy()

  console.log('✅ 简单测试架构验证完成')
})