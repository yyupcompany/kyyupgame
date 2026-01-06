/**
 * 快速AI助手页面测试
 * 跳过登录，直接测试页面加载
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'https://localhost:5173'

test('快速AI页面测试', async ({ page }) => {
  // 监听控制台信息
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ 浏览器错误:', msg.text())
    }
  })
  page.on('pageerror', error => console.log('❌ 页面错误:', error.message))
  
  // 直接访问AI页面（无需登录认证）
  await page.goto(`${BASE_URL}/ai`)
  console.log('✅ 已访问AI页面')
  
  // 等待页面加载
  await page.waitForLoadState('networkidle')
  console.log('✅ 页面网络加载完成')
  
  // 等待Vue应用挂载
  await page.waitForTimeout(5000)
  console.log('✅ 等待Vue应用挂载完成')
  
  // 检查页面标题
  const pageTitle = await page.title()
  console.log('页面标题:', pageTitle)
  
  // 检查页面内容
  const bodyContent = await page.locator('body').innerHTML()
  console.log('页面HTML长度:', bodyContent.length)
  
  if (bodyContent.includes('AI智能助手')) {
    console.log('✅ 找到AI智能助手文本')
  } else {
    console.log('❌ 未找到AI智能助手文本')
  }
  
  // 检查是否有Vue组件
  const appElement = await page.locator('#app').innerHTML()
  console.log('Vue应用内容长度:', appElement.length)
  
  if (appElement.length > 100) {
    console.log('✅ Vue应用已渲染内容')
  } else {
    console.log('❌ Vue应用未正确渲染')
  }
  
  // 截图保存
  await page.screenshot({ path: 'ai-page-debug.png', fullPage: true })
  console.log('✅ 已保存页面截图: ai-page-debug.png')
})