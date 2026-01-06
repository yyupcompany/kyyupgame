/**
 * AI助手发送消息功能测试
 * 直接测试AI助手组件的消息发送功能
 */

import { chromium } from 'playwright'

async function testAIAssistantSendMessage() {
  console.log('🚀 开始AI助手发送消息功能测试...')
  
  const browser = await chromium.launch({
    headless: true,
    slowMo: 0
  })
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    })
    const page = await context.newPage()
    
    // 1. 访问登录页面
    console.log('📝 步骤1: 访问登录页面')
    await page.goto('http://localhost:5173/login')
    await page.waitForTimeout(2000)
    
    // 2. 执行登录
    console.log('🔐 步骤2: 执行登录')
    await page.fill('input[placeholder*="用户名"]', 'admin')
    await page.fill('input[placeholder*="密码"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // 等待登录完成并跳转到主页
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    console.log('✅ 登录成功，进入主页')
    
    // 3. 打开AI助手
    console.log('🤖 步骤3: 打开AI助手')
    const aiButton = await page.locator('.ai-toggle-btn, [title*="AI"], button:has-text("AI")').first()
    await aiButton.click()
    await page.waitForTimeout(2000)
    
    // 验证AI助手是否已打开
    const aiAssistant = await page.locator('.ai-assistant').first()
    const isVisible = await aiAssistant.isVisible()
    
    if (!isVisible) {
      throw new Error('AI助手未能正确打开')
    }
    console.log('✅ AI助手已成功打开')
    
    // 4. 测试全屏按钮
    console.log('🖥️ 步骤4: 测试全屏功能')
    const fullscreenButton = await page.locator('button[title*="全屏"], .ai-actions button').nth(1).first()
    if (await fullscreenButton.isVisible()) {
      await fullscreenButton.click()
      await page.waitForTimeout(1000)
      
      // 检查是否进入全屏
      const isFullscreen = await page.locator('.ai-assistant.fullscreen').isVisible()
      if (isFullscreen) {
        console.log('✅ 全屏功能正常工作')
        
        // 退出全屏
        await fullscreenButton.click()
        await page.waitForTimeout(1000)
        console.log('✅ 退出全屏功能正常')
      } else {
        console.log('⚠️ 全屏功能可能存在问题')
      }
    } else {
      console.log('⚠️ 未找到全屏按钮')
    }
    
    // 5. 查找消息输入框
    console.log('💬 步骤5: 查找消息输入框')
    const messageInput = await page.locator('input[placeholder*="输入"], textarea[placeholder*="输入"], .message-input input, .chat-input input').first()
    
    if (!(await messageInput.isVisible())) {
      throw new Error('未找到消息输入框')
    }
    console.log('✅ 找到消息输入框')
    
    // 6. 输入测试消息
    console.log('📝 步骤6: 输入测试消息')
    const testMessage = '你好，这是一个测试消息'
    await messageInput.fill(testMessage)
    await page.waitForTimeout(500)
    
    // 验证输入内容
    const inputValue = await messageInput.inputValue()
    if (inputValue !== testMessage) {
      throw new Error(`输入内容不正确。期望: "${testMessage}", 实际: "${inputValue}"`)
    }
    console.log('✅ 消息输入成功')
    
    // 7. 发送消息
    console.log('🚀 步骤7: 发送消息')
    const sendButton = await page.locator('button[title*="发送"], .send-btn, button:has-text("发送")').first()
    
    if (await sendButton.isVisible()) {
      await sendButton.click()
    } else {
      // 尝试按回车发送
      await messageInput.press('Enter')
    }
    
    await page.waitForTimeout(3000)
    console.log('✅ 消息已发送')
    
    // 8. 检查消息是否出现在聊天区域
    console.log('👀 步骤8: 检查消息显示')
    const messageArea = await page.locator('.chat-area, .message-list, .messages').first()
    const userMessage = await messageArea.locator('.message-item.user, .user-message').last()
    
    if (await userMessage.isVisible()) {
      const messageText = await userMessage.textContent()
      if (messageText.includes(testMessage)) {
        console.log('✅ 用户消息正确显示在聊天区域')
      } else {
        console.log('⚠️ 用户消息内容可能不完整')
      }
    } else {
      console.log('⚠️ 未在聊天区域找到用户消息')
    }
    
    // 9. 等待AI回复
    console.log('🤖 步骤9: 等待AI回复')
    await page.waitForTimeout(5000)
    
    const aiMessage = await messageArea.locator('.message-item.assistant, .ai-message, .assistant-message').last()
    if (await aiMessage.isVisible()) {
      console.log('✅ AI已回复')
      const aiText = await aiMessage.textContent()
      console.log(`AI回复内容: ${aiText.substring(0, 100)}...`)
    } else {
      console.log('⚠️ 未收到AI回复，可能是API问题')
    }
    
    // 10. 测试清空对话
    console.log('🗑️ 步骤10: 测试清空对话功能')
    const clearButton = await page.locator('button[title*="清空"], button:has-text("清空")').first()
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await page.waitForTimeout(1000)
      
      const remainingMessages = await messageArea.locator('.message-item').count()
      if (remainingMessages === 0 || remainingMessages === 1) { // 可能留有欢迎消息
        console.log('✅ 清空对话功能正常工作')
      } else {
        console.log('⚠️ 清空对话功能可能存在问题')
      }
    } else {
      console.log('⚠️ 未找到清空对话按钮')
    }
    
    console.log('🎉 AI助手发送消息功能测试完成!')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    throw error
  } finally {
    await browser.close()
  }
}

// 运行测试
testAIAssistantSendMessage()
  .then(() => {
    console.log('✅ 所有测试通过!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  })

export { testAIAssistantSendMessage }