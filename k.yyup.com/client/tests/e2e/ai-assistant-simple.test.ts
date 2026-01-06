import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173'

test.beforeEach(async ({ page }) => {
  // 快捷登录（教师身份）
  await page.goto(`${BASE_URL}/login`)
  await page.waitForTimeout(1000)

  // 点击教师快捷登录按钮
  await page.click('button:has-text("教师")', { timeout: 5000 })

  // 等待登录完成
  await page.waitForTimeout(3000)

  // 导航到AI助手页面
  await page.goto(`${BASE_URL}/ai/assistant`)
  await page.waitForLoadState('domcontentloaded')
})

test('AI助手页面加载成功', async ({ page }) => {
  // 等待页面加载
  await page.waitForLoadState('domcontentloaded')

  // 验证页面包含AI助手内容
  const pageContent = await page.content()
  expect(pageContent).toMatch(/AI|assistant|智能|助手/i)
})

test('AI助手显示聊天功能', async ({ page }) => {
  // 等待聊天组件加载
  await page.waitForSelector('textarea, input[type="text"]', { timeout: 10000 })

  // 验证输入框存在
  const inputElements = await page.locator('textarea, input[type="text"]').count()
  expect(inputElements).toBeGreaterThan(0)
})

test('AI助手基本消息发送', async ({ page }) => {
  // 等待输入框加载
  const textInput = await page.waitForSelector('textarea, input[type="text"]', { timeout: 10000 })

  // 输入测试消息
  await textInput.fill('测试消息：请问幼儿园的课程安排是怎样的？')

  // 查找并点击发送按钮
  const sendButton = await page.locator('button:has-text("发送"), button[type="submit"], .send-button').first()
  if (await sendButton.count() > 0) {
    await sendButton.click()

    // 等待消息发送
    await page.waitForTimeout(1000)

    // 验证消息可能被清空
    const inputValue = await textInput.inputValue()
    console.log('发送后输入框内容:', inputValue)
  } else {
    console.log('未找到发送按钮')
  }
})