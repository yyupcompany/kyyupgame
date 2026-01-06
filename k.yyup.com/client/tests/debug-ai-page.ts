/**
 * 调试AI助手页面加载问题
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'https://localhost:5173'

test('调试AI助手页面', async ({ page }) => {
  // 监听控制台错误
  page.on('console', msg => console.log('浏览器控制台:', msg.text()))
  page.on('pageerror', error => console.log('页面错误:', error.message))
  
  // 1. 登录
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('networkidle')
  
  const usernameInput = page.locator('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]').first()
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
  const loginButton = page.locator('button[type="submit"], button:has-text("登录"), .login-button, .submit-button').first()
  
  await usernameInput.fill('admin')
  await passwordInput.fill('admin123')
  await loginButton.click()
  
  // 等待登录完成
  await page.waitForNavigation({ timeout: 10000 })
  
  console.log('登录后URL:', page.url())
  
  // 2. 访问AI助手页面
  await page.goto(`${BASE_URL}/ai`)
  await page.waitForLoadState('networkidle')
  
  console.log('AI页面URL:', page.url())
  
  // 3. 等待页面加载完成
  await page.waitForTimeout(3000)
  
  // 4. 调试页面内容
  const pageTitle = await page.locator('title').textContent()
  console.log('页面标题:', pageTitle)
  
  // 5. 查找页面中的标题元素
  const titleElements = await page.locator('h1, h2, h3, .title, .page-title').all()
  console.log('找到的标题元素数量:', titleElements.length)
  
  for (let i = 0; i < titleElements.length; i++) {
    const text = await titleElements[i].textContent()
    const className = await titleElements[i].getAttribute('class')
    console.log(`标题 ${i + 1}: "${text}" (class: ${className})`)
  }
  
  // 6. 检查是否存在AI智能助手文本
  const aiText = await page.getByText('AI智能助手').first()
  try {
    await aiText.waitFor({ timeout: 5000 })
    console.log('✅ 找到"AI智能助手"文本')
  } catch (error) {
    console.log('❌ 未找到"AI智能助手"文本')
  }
  
  // 7. 检查页面结构
  const aiContainer = await page.locator('.ai-functionality-container, .ai-assistant-page').first()
  try {
    await aiContainer.waitFor({ timeout: 5000 })
    console.log('✅ 找到AI容器')
  } catch (error) {
    console.log('❌ 未找到AI容器')
  }
  
  // 8. 打印页面HTML结构（前500字符）
  const bodyContent = await page.locator('body').innerHTML()
  console.log('页面HTML结构（前500字符）:', bodyContent.substring(0, 500))
})