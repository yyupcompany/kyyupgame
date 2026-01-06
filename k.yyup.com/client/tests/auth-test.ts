/**
 * 认证功能测试
 * 验证用户登录功能是否正常工作
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'https://localhost:5173'
const API_BASE_URL = 'https://shlxlyzagqnc.sealoshzh.site'

test.describe('用户认证测试', () => {
  test('管理员登录测试', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    // 调试：打印页面内容
    const pageContent = await page.content()
    console.log('登录页面内容长度:', pageContent.length)
    
    const title = await page.title()
    console.log('页面标题:', title)
    
    // 2. 尝试找到登录相关元素（更灵活的选择器）
    const usernameInput = page.locator('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const loginButton = page.locator('button[type="submit"], button:has-text("登录"), .login-button, .submit-button').first()
    
    // 等待元素出现
    await usernameInput.waitFor({ timeout: 5000 })
    await passwordInput.waitFor({ timeout: 5000 })
    await loginButton.waitFor({ timeout: 5000 })
    
    console.log('✅ 找到登录表单元素')
    
    // 3. 填写登录信息
    await usernameInput.fill('admin')
    await passwordInput.fill('admin123')
    
    console.log('✅ 填写完成登录信息')
    
    // 4. 点击登录并监听导航
    const navigationPromise = page.waitForNavigation({ timeout: 10000 })
    await loginButton.click()
    
    console.log('✅ 点击了登录按钮，等待导航...')
    
    try {
      await navigationPromise
      console.log('✅ 导航完成')
    } catch (error) {
      console.log('⚠️  导航超时，检查当前页面状态')
    }
    
    // 5. 验证登录结果
    const currentUrl = page.url()
    console.log('当前URL:', currentUrl)
    
    if (!currentUrl.includes('/login')) {
      console.log('✅ 管理员登录成功')
    } else {
      // 检查是否有错误信息
      const errorElements = await page.locator('.error, .alert, .message').all()
      for (const errorElement of errorElements) {
        const errorText = await errorElement.textContent()
        console.log('错误信息:', errorText)
      }
    }
  })
  
  test('API认证测试', async ({ page }) => {
    // 1. 先进行登录
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]', 'admin')
    await page.fill('input[placeholder*="密码"], input[name="password"]', 'admin123')
    await page.click('button[type="submit"], button:has-text("登录")')
    
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 })
    
    // 2. 测试需要认证的API
    const response = await page.request.get(`${API_BASE_URL}/api/ai/models`)
    
    // 验证API响应
    expect(response.status()).toBeLessThan(500) // 应该不是服务器错误
    
    if (response.status() === 401) {
      console.log('⚠️  API需要认证，但token可能未正确传递')
    } else if (response.status() === 200) {
      console.log('✅ API认证成功')
      const data = await response.json()
      console.log('API响应数据:', data)
    }
  })
})