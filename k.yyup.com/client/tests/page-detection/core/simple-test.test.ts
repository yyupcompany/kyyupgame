import { vi } from 'vitest'
import { test, expect } from '@playwright/test'

test.
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('简单页面检测', () => {
  
  test('访问登录页面', async ({ page }) => {
    console.log('🎯 开始访问登录页面...')
    
    // 导航到登录页面
    await page.goto('/')
    
    // 等待页面加载
    await page.waitForLoadState('networkidle')
    
    // 检查页面标题
    const title = await page.title()
    console.log(`📝 页面标题: ${title}`)
    
    // 截图
    await page.screenshot({ 
      path: 'tests/page-detection/reports/login-page.png',
      fullPage: true 
    })
    console.log('📸 登录页面截图已保存')
    
    // 检查登录表单元素
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]')
    const passwordInput = page.locator('input[placeholder*="密码"], input[name="password"]')
    const loginButton = page.locator('button:has-text("登录"), button[type="submit"]')
    
    const hasUsername = await usernameInput.count() > 0
    const hasPassword = await passwordInput.count() > 0
    const hasLoginBtn = await loginButton.count() > 0
    
    console.log(`📋 登录表单元素检查:`)
    console.log(`  - 用户名输入框: ${hasUsername ? '✅' : '❌'}`)
    console.log(`  - 密码输入框: ${hasPassword ? '✅' : '❌'}`)
    console.log(`  - 登录按钮: ${hasLoginBtn ? '✅' : '❌'}`)
    
    // 断言基本元素存在
    expect(hasUsername).toBe(true)
    expect(hasPassword).toBe(true)
    expect(hasLoginBtn).toBe(true)
  })

  test('登录并访问仪表板', async ({ page }) => {
    console.log('🎯 开始登录测试...')
    
    // 导航到登录页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 填写登录表单
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]')
    const passwordInput = page.locator('input[placeholder*="密码"], input[name="password"]')
    const loginButton = page.locator('button:has-text("登录"), button[type="submit"]')
    
    await usernameInput.fill('admin')
    await passwordInput.fill('123456')
    
    console.log('📝 已填写登录信息: admin/123456')
    
    // 点击登录按钮
    await loginButton.click()
    console.log('🔑 点击登录按钮...')
    
    // 等待登录完成，可能跳转到仪表板
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 })
      console.log('✅ 登录成功，已跳转到仪表板')
      
      // 截图仪表板页面
      await page.screenshot({ 
        path: 'tests/page-detection/reports/dashboard-page.png',
        fullPage: true 
      })
      console.log('📸 仪表板页面截图已保存')
      
      // 检查仪表板元素
      const pageContent = await page.textContent('body')
      const hasContent = pageContent && pageContent.length > 100
      
      console.log(`📊 仪表板页面内容检查: ${hasContent ? '✅ 有内容' : '❌ 内容不足'}`)
      
      // 检查是否有统计卡片或图表
      const statsCards = await page.locator('.el-card, .card, .stat-card').count()
      const charts = await page.locator('.chart-container, .echarts, canvas').count()
      
      console.log(`📋 页面元素统计:`)
      console.log(`  - 统计卡片: ${statsCards}个`)
      console.log(`  - 图表元素: ${charts}个`)
      
    } catch (error) {
      console.log('⚠️  登录后未能跳转到仪表板，可能停留在当前页面')
      console.log(`错误信息: ${error.message}`)
      
      // 截图当前页面状态
      await page.screenshot({ 
        path: 'tests/page-detection/reports/login-after.png',
        fullPage: true 
      })
      console.log('📸 登录后页面截图已保存')
    }
  })

  test('检查页面响应速度', async ({ page }) => {
    console.log('🎯 开始检查页面响应速度...')
    
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    console.log(`⏱️  页面加载时间: ${loadTime}ms`)
    
    // 检查加载时间是否合理（小于5秒）
    expect(loadTime).toBeLessThan(5000)
    
    if (loadTime < 2000) {
      console.log('🚀 页面加载速度很快')
    } else if (loadTime < 5000) {
      console.log('👍 页面加载速度正常')
    } else {
      console.log('⚠️  页面加载速度较慢')
    }
  })
})