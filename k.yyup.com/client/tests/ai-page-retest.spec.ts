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

describe('AI页面完整测试', () => {
  test('应该正常显示AI页面', async ({ page }) => {
    console.log('\n🧪 开始AI页面完整测试...\n')
    
    // 1. 访问登录页面
    console.log('✅ 步骤1: 访问登录页面')
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(1000)
    console.log('   ✅ 登录页面已加载\n')
    
    // 2. 登录admin用户
    console.log('✅ 步骤2: 登录admin用户')
    const usernameInput = page.locator('input[type="text"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const loginButton = page.locator('button:has-text("登录")').first()
    
    await usernameInput.fill('admin')
    await passwordInput.fill('admin123')
    await loginButton.click()
    
    // 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 30000 })
    await page.waitForTimeout(2000)
    console.log('   ✅ 登录成功\n')
    
    // 3. 访问AI页面
    console.log('✅ 步骤3: 访问AI页面')
    await page.goto('http://localhost:5173/ai', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(3000)
    console.log('   ✅ AI页面已加载\n')
    
    // 4. 检查页面元素
    console.log('✅ 步骤4: 检查页面元素\n')
    
    // 检查头部
    const header = page.locator('.global-header')
    const headerVisible = await header.isVisible().catch(() => false)
    console.log(`   ${headerVisible ? '✅' : '❌'} 头部导航: ${headerVisible ? '显示' : '未显示'}`)
    
    // 检查左侧面板
    const sidebar = page.locator('.quick-query-sidebar')
    const sidebarVisible = await sidebar.isVisible().catch(() => false)
    console.log(`   ${sidebarVisible ? '✅' : '❌'} 左侧快捷查询面板: ${sidebarVisible ? '显示' : '未显示'}`)
    
    // 检查对话区域
    const chatMessages = page.locator('.chat-messages')
    const chatMessagesVisible = await chatMessages.isVisible().catch(() => false)
    console.log(`   ${chatMessagesVisible ? '✅' : '❌'} 对话区域: ${chatMessagesVisible ? '显示' : '未显示'}`)
    
    // 检查输入区域
    const chatInput = page.locator('.chat-input-area')
    const chatInputVisible = await chatInput.isVisible().catch(() => false)
    console.log(`   ${chatInputVisible ? '✅' : '❌'} 输入区域: ${chatInputVisible ? '显示' : '未显示'}`)
    
    // 检查输入框
    const inputBox = page.locator('textarea, input[type="text"]').first()
    const inputBoxVisible = await inputBox.isVisible().catch(() => false)
    console.log(`   ${inputBoxVisible ? '✅' : '❌'} 输入框: ${inputBoxVisible ? '显示' : '未显示'}`)
    
    console.log('\n')
    
    // 5. 验证结果
    const allVisible = headerVisible && sidebarVisible && chatMessagesVisible && chatInputVisible && inputBoxVisible
    
    if (allVisible) {
      console.log('🎉 所有元素都正常显示！')
      console.log('\n✅ 测试通过！AI页面修复成功！\n')
    } else {
      console.log('⚠️  部分元素未显示')
      console.log('\n❌ 测试失败！请检查以下内容：\n')
      if (\!headerVisible) console.log('   - 头部导航未显示')
      if (\!sidebarVisible) console.log('   - 左侧快捷查询面板未显示')
      if (\!chatMessagesVisible) console.log('   - 对话区域未显示')
      if (\!chatInputVisible) console.log('   - 输入区域未显示')
      if (\!inputBoxVisible) console.log('   - 输入框未显示')
      console.log()
    }
    
    // 6. 截图
    console.log('✅ 步骤5: 保存截图')
    await page.screenshot({ path: '/tmp/ai_page_screenshot.png', fullPage: true })
    console.log('   ✅ 截图已保存到 /tmp/ai_page_screenshot.png\n')
    
    // 验证
    expect(allVisible).toBe(true)
  })
})
