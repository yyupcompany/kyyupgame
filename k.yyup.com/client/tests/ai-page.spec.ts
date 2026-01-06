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

describe('AI页面测试', () => {
  test('应该正常显示AI页面', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto('http://localhost:5173/login')
    
    // 2. 登录admin用户
    await page.fill('input[placeholder*="用户名"]', 'admin')
    await page.fill('input[placeholder*="密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    
    // 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 3. 访问AI页面
    await page.goto('http://localhost:5173/ai')
    
    // 4. 验证页面元素
    console.log('🧪 检查页面元素...')
    
    // 检查头部
    const header = page.locator('.global-header')
    await expect(header).toBeVisible()
    console.log('✅ 头部导航显示')
    
    // 检查左侧面板
    const sidebar = page.locator('.quick-query-sidebar')
    await expect(sidebar).toBeVisible()
    console.log('✅ 左侧快捷查询面板显示')
    
    // 检查对话区域
    const chatMessages = page.locator('.chat-messages')
    await expect(chatMessages).toBeVisible()
    console.log('✅ 对话区域显示')
    
    // 检查输入区域
    const chatInput = page.locator('.chat-input-area')
    await expect(chatInput).toBeVisible()
    console.log('✅ 输入区域显示')
    
    // 检查输入框
    const inputBox = page.locator('textarea, input[type="text"]')
    await expect(inputBox.first()).toBeVisible()
    console.log('✅ 输入框显示')
    
    console.log('\n🎉 所有测试通过！')
  })
})
