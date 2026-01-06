import { vi } from 'vitest'
/**
 * AI助手无头浏览器测试
 * 直接测试5173端口的前端AI助手功能，找到具体问题
 */

import { test, expect, Page, Browser } from '@playwright/test'

const FRONTEND_URL = 'https://localhost:5173'
const BACKEND_URL = 'https://shlxlyzagqnc.sealoshzh.site'

// 测试用户凭据
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
}

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

describe('🤖 AI助手无头浏览器完整测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 设置页面超时
    page.setDefaultTimeout(30000)
    
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 控制台错误: ${msg.text()}`)
      }
    })
    
    // 监听网络错误
    page.on('requestfailed', request => {
      console.log(`❌ 网络请求失败: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
    })
    
    // 监听响应错误
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP错误: ${response.status()} ${response.url()}`)
      }
    })
  })

  test('步骤1: 用户登录系统', async ({ page }) => {
    console.log('🚀 开始用户登录流程测试...')
    
    try {
      // 访问前端首页
      console.log(`📱 访问前端应用: ${FRONTEND_URL}`)
      await page.goto(FRONTEND_URL)
      
      // 等待页面加载
      await page.waitForLoadState('networkidle')
      console.log('✅ 前端页面加载完成')
      
      // 检查是否需要登录
      const isLoginPage = await page.locator('input[type="password"]').isVisible()
      
      if (isLoginPage) {
        console.log('🔐 检测到登录页面，开始登录...')
        
        // 填写用户名
        await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]', TEST_USER.username)
        console.log(`👤 填写用户名: ${TEST_USER.username}`)
        
        // 填写密码
        await page.fill('input[type="password"]', TEST_USER.password)
        console.log(`🔑 填写密码: ${TEST_USER.password}`)
        
        // 点击登录按钮
        await page.click('button:has-text("登录"), button:has-text("登陆"), button[type="submit"]')
        console.log('🖱️ 点击登录按钮')
        
        // 等待登录成功
        await page.waitForURL('**/dashboard**', { timeout: 15000 })
        console.log('✅ 登录成功，跳转到仪表板')
      } else {
        console.log('✅ 用户已登录，直接进入系统')
      }
      
      // 验证登录状态
      await expect(page.locator('body')).toBeVisible()
      
    } catch (error) {
      console.error('❌ 用户登录过程中出现错误:', error)
      throw error
    }
  })

  test('步骤2: 导航到AI助手页面', async ({ page }) => {
    console.log('🧭 开始导航到AI助手页面...')
    
    try {
      // 先登录
      await page.goto(FRONTEND_URL)
      await loginIfNeeded(page)
      
      // 查找AI助手入口
      console.log('🔍 查找AI助手菜单入口...')
      
      // 尝试多种可能的AI助手入口
      const possibleSelectors = [
        'a:has-text("AI助手")',
        'a:has-text("AI智能助手")', 
        'a:has-text("智能助手")',
        '[href*="/ai"]',
        '[href*="/assistant"]',
        '.sidebar a:has-text("AI")',
        '.menu-item:has-text("AI")'
      ]
      
      let aiAssistantLink = null
      for (const selector of possibleSelectors) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          aiAssistantLink = element
          console.log(`✅ 找到AI助手入口: ${selector}`)
          break
        }
      }
      
      if (aiAssistantLink) {
        // 点击AI助手链接
        await aiAssistantLink.click()
        console.log('🖱️ 点击AI助手菜单')
        
        // 等待页面加载
        await page.waitForLoadState('networkidle')
        console.log('✅ AI助手页面加载完成')
        
        // 验证是否成功进入AI助手页面
        const currentUrl = page.url()
        console.log(`📍 当前页面URL: ${currentUrl}`)
        
        if (currentUrl.includes('/ai') || currentUrl.includes('/assistant')) {
          console.log('✅ 成功进入AI助手页面')
        } else {
          console.log('⚠️ 可能未正确跳转到AI助手页面')
        }
      } else {
        console.log('❌ 未找到AI助手菜单入口')
        
        // 尝试直接访问AI助手页面
        const aiUrls = ['/ai', '/assistant', '/ai-assistant']
        for (const aiUrl of aiUrls) {
          try {
            await page.goto(`${FRONTEND_URL}${aiUrl}`)
            await page.waitForLoadState('networkidle')
            console.log(`✅ 直接访问AI助手页面成功: ${aiUrl}`)
            break
          } catch (error) {
            console.log(`❌ 直接访问失败: ${aiUrl}`)
          }
        }
      }
      
    } catch (error) {
      console.error('❌ 导航到AI助手页面失败:', error)
      throw error
    }
  })

  test('步骤3: 测试AI助手页面UI组件', async ({ page }) => {
    console.log('🎨 开始测试AI助手页面UI组件...')
    
    try {
      // 登录并导航到AI助手页面
      await page.goto(FRONTEND_URL)
      await loginIfNeeded(page)
      await navigateToAIAssistant(page)
      
      console.log('🔍 检查页面基本元素...')
      
      // 检查页面标题
      const pageTitle = await page.locator('h1, .page-title').first().textContent()
      console.log(`📄 页面标题: ${pageTitle}`)
      
      // 检查AI助手功能标签页
      const tabs = [
        'AI对话',
        '专家咨询', 
        '记忆管理',
        '活动策划'
      ]
      
      console.log('🏷️ 检查功能标签页...')
      for (const tab of tabs) {
        const tabElement = page.locator(`.el-tabs__item:has-text("${tab}"), .tab:has-text("${tab}"), button:has-text("${tab}")`).first()
        if (await tabElement.isVisible()) {
          console.log(`✅ 找到标签页: ${tab}`)
        } else {
          console.log(`❌ 未找到标签页: ${tab}`)
        }
      }
      
      // 检查对话区域
      console.log('💬 检查对话区域...')
      const chatArea = page.locator('.chat-panel, .chat-area, .conversation, .messages').first()
      if (await chatArea.isVisible()) {
        console.log('✅ 找到对话区域')
      } else {
        console.log('❌ 未找到对话区域')
      }
      
      // 检查输入框
      console.log('⌨️ 检查消息输入框...')
      const inputBox = page.locator('input[placeholder*="输入"], textarea[placeholder*="输入"], .message-input, .chat-input').first()
      if (await inputBox.isVisible()) {
        console.log('✅ 找到消息输入框')
      } else {
        console.log('❌ 未找到消息输入框')
      }
      
      // 检查发送按钮
      console.log('📤 检查发送按钮...')
      const sendButton = page.locator('button:has-text("发送"), button:has-text("提交"), .send-btn, .submit-btn').first()
      if (await sendButton.isVisible()) {
        console.log('✅ 找到发送按钮')
      } else {
        console.log('❌ 未找到发送按钮')
      }
      
    } catch (error) {
      console.error('❌ UI组件检查失败:', error)
      throw error
    }
  })

  test('步骤4: 测试活动策划功能', async ({ page }) => {
    console.log('🎯 开始测试活动策划功能...')
    
    try {
      // 登录并导航到AI助手页面
      await page.goto(FRONTEND_URL)
      await loginIfNeeded(page)
      await navigateToAIAssistant(page)
      
      // 点击活动策划标签页
      console.log('🏷️ 切换到活动策划标签页...')
      const activityTab = page.locator('.el-tabs__item:has-text("活动策划"), .tab:has-text("活动策划"), button:has-text("活动策划")').first()
      if (await activityTab.isVisible()) {
        await activityTab.click()
        console.log('✅ 成功切换到活动策划标签页')
        await page.waitForTimeout(1000)
      } else {
        console.log('❌ 未找到活动策划标签页')
        return
      }
      
      // 填写活动策划表单
      console.log('📝 填写活动策划表单...')
      
      const testActivityData = {
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童及家长',
        budget: '2000',
        duration: '2小时',
        location: '幼儿园活动室',
        requirements: '音响设备,投影仪',
        preferredStyle: 'fun'
      }
      
      // 填写活动类型
      const activityTypeInput = page.locator('input[placeholder*="活动类型"], input[name*="type"], .activity-type input').first()
      if (await activityTypeInput.isVisible()) {
        await activityTypeInput.fill(testActivityData.activityType)
        console.log(`✅ 填写活动类型: ${testActivityData.activityType}`)
      }
      
      // 填写目标受众
      const audienceInput = page.locator('input[placeholder*="受众"], input[name*="audience"], .target-audience input').first()
      if (await audienceInput.isVisible()) {
        await audienceInput.fill(testActivityData.targetAudience)
        console.log(`✅ 填写目标受众: ${testActivityData.targetAudience}`)
      }
      
      // 填写预算
      const budgetInput = page.locator('input[placeholder*="预算"], input[name*="budget"], .budget input').first()
      if (await budgetInput.isVisible()) {
        await budgetInput.fill(testActivityData.budget)
        console.log(`✅ 填写预算: ${testActivityData.budget}`)
      }
      
      // 查找并点击生成按钮
      console.log('🚀 查找生成活动方案按钮...')
      const generateButton = page.locator('button:has-text("生成"), button:has-text("策划"), button:has-text("开始"), .generate-btn').first()
      
      if (await generateButton.isVisible()) {
        console.log('✅ 找到生成按钮，准备点击...')
        
        // 监听网络请求
        page.on('request', request => {
          if (request.url().includes('/api/activity-planner')) {
            console.log(`📡 发送活动策划请求: ${request.method()} ${request.url()}`)
          }
        })
        
        page.on('response', response => {
          if (response.url().includes('/api/activity-planner')) {
            console.log(`📨 活动策划响应: ${response.status()} ${response.url()}`)
          }
        })
        
        // 点击生成按钮
        await generateButton.click()
        console.log('🖱️ 点击生成活动方案按钮')
        
        // 等待响应
        try {
          await page.waitForResponse(response => 
            response.url().includes('/api/activity-planner') && response.status() !== 404,
            { timeout: 30000 }
          )
          console.log('✅ 收到活动策划API响应')
        } catch (error) {
          console.log('⏰ 等待API响应超时，检查错误状态')
        }
        
        // 检查结果显示
        await page.waitForTimeout(3000)
        
        // 查找结果显示区域
        const resultArea = page.locator('.result, .plan-result, .activity-plan, .generated-content').first()
        if (await resultArea.isVisible()) {
          const resultText = await resultArea.textContent()
          console.log(`✅ 找到结果显示区域`)
          console.log(`📄 结果内容预览: ${resultText?.substring(0, 200)}...`)
        } else {
          console.log('❌ 未找到结果显示区域')
        }
        
        // 检查错误消息
        const errorMessage = page.locator('.error, .el-message--error, .error-message, .alert-error').first()
        if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent()
          console.log(`❌ 发现错误消息: ${errorText}`)
        }
        
      } else {
        console.log('❌ 未找到生成活动方案按钮')
      }
      
    } catch (error) {
      console.error('❌ 活动策划功能测试失败:', error)
      throw error
    }
  })

  test('步骤5: 测试AI对话功能', async ({ page }) => {
    console.log('💬 开始测试AI对话功能...')
    
    try {
      // 登录并导航到AI助手页面
      await page.goto(FRONTEND_URL)
      await loginIfNeeded(page)
      await navigateToAIAssistant(page)
      
      // 确保在AI对话标签页
      console.log('🏷️ 切换到AI对话标签页...')
      const chatTab = page.locator('.el-tabs__item:has-text("AI对话"), .tab:has-text("AI对话"), button:has-text("AI对话")').first()
      if (await chatTab.isVisible()) {
        await chatTab.click()
        console.log('✅ 成功切换到AI对话标签页')
        await page.waitForTimeout(1000)
      }
      
      // 查找消息输入框
      console.log('🔍 查找消息输入框...')
      const messageInput = page.locator(
        'input[placeholder*="输入消息"], textarea[placeholder*="输入消息"], ' +
        'input[placeholder*="请输入"], textarea[placeholder*="请输入"], ' +
        '.message-input input, .chat-input input, .message-input textarea, .chat-input textarea'
      ).first()
      
      if (await messageInput.isVisible()) {
        console.log('✅ 找到消息输入框')
        
        // 输入测试消息
        const testMessage = "你好，我想了解一下幼儿园的教育理念和特色课程，能详细介绍一下吗？"
        await messageInput.fill(testMessage)
        console.log(`💬 输入测试消息: ${testMessage}`)
        
        // 查找发送按钮
        const sendButton = page.locator(
          'button:has-text("发送"), button:has-text("提交"), ' +
          '.send-btn, .submit-btn, button[type="submit"]'
        ).first()
        
        if (await sendButton.isVisible()) {
          console.log('✅ 找到发送按钮')
          
          // 监听网络请求
          page.on('request', request => {
            if (request.url().includes('/api/ai/') || request.url().includes('/api/conversation')) {
              console.log(`📡 发送AI对话请求: ${request.method()} ${request.url()}`)
            }
          })
          
          page.on('response', response => {
            if (response.url().includes('/api/ai/') || response.url().includes('/api/conversation')) {
              console.log(`📨 AI对话响应: ${response.status()} ${response.url()}`)
            }
          })
          
          // 点击发送按钮
          await sendButton.click()
          console.log('🖱️ 点击发送按钮')
          
          // 等待响应
          await page.waitForTimeout(3000)
          
          // 检查消息显示
          const messageArea = page.locator('.messages, .chat-messages, .conversation, .chat-area').first()
          if (await messageArea.isVisible()) {
            const messageText = await messageArea.textContent()
            console.log('✅ 找到消息显示区域')
            console.log(`💬 消息内容: ${messageText}`)
          } else {
            console.log('❌ 未找到消息显示区域')
          }
          
        } else {
          console.log('❌ 未找到发送按钮')
        }
        
      } else {
        console.log('❌ 未找到消息输入框')
      }
      
    } catch (error) {
      console.error('❌ AI对话功能测试失败:', error)
      throw error
    }
  })

  test('步骤6: 分析网络请求和错误', async ({ page }) => {
    console.log('🔍 开始分析网络请求和错误...')
    
    const networkLogs: any[] = []
    const consoleErrors: string[] = []
    
    // 监听所有网络请求
    page.on('request', request => {
      networkLogs.push({
        type: 'request',
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toISOString()
      })
    })
    
    page.on('response', response => {
      networkLogs.push({
        type: 'response',
        status: response.status(),
        url: response.url(),
        timestamp: new Date().toISOString()
      })
    })
    
    page.on('requestfailed', request => {
      networkLogs.push({
        type: 'failed',
        method: request.method(),
        url: request.url(),
        error: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      })
    })
    
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    try {
      // 登录并导航到AI助手页面
      await page.goto(FRONTEND_URL)
      await loginIfNeeded(page)
      await navigateToAIAssistant(page)
      
      // 尝试触发AI功能
      await triggerAIFunctions(page)
      
      // 等待所有请求完成
      await page.waitForTimeout(5000)
      
      // 分析网络日志
      console.log('\n📊 网络请求分析:')
      console.log('=' * 50)
      
      const apiRequests = networkLogs.filter(log => 
        log.url.includes('/api/') && 
        (log.url.includes('/ai') || log.url.includes('/activity-planner'))
      )
      
      console.log(`🌐 API请求总数: ${apiRequests.length}`)
      
      apiRequests.forEach(log => {
        if (log.type === 'request') {
          console.log(`📤 ${log.method} ${log.url}`)
        } else if (log.type === 'response') {
          const statusIcon = log.status >= 400 ? '❌' : '✅'
          console.log(`📥 ${statusIcon} ${log.status} ${log.url}`)
        } else if (log.type === 'failed') {
          console.log(`💥 FAILED ${log.method} ${log.url} - ${log.error}`)
        }
      })
      
      // 分析错误
      console.log('\n🚨 错误分析:')
      console.log('=' * 50)
      
      const errorResponses = networkLogs.filter(log => 
        log.type === 'response' && log.status >= 400
      )
      
      console.log(`❌ HTTP错误数量: ${errorResponses.length}`)
      errorResponses.forEach(error => {
        console.log(`   ${error.status} ${error.url}`)
      })
      
      console.log(`🔴 控制台错误数量: ${consoleErrors.length}`)
      consoleErrors.forEach(error => {
        console.log(`   ${error}`)
      })
      
      // 总结问题
      console.log('\n🎯 问题总结:')
      console.log('=' * 50)
      
      if (errorResponses.length > 0) {
        console.log('📋 发现的主要问题:')
        
        const status500 = errorResponses.filter(r => r.status === 500)
        const status404 = errorResponses.filter(r => r.status === 404)
        const status400 = errorResponses.filter(r => r.status === 400)
        
        if (status500.length > 0) {
          console.log(`   • 服务器内部错误 (500): ${status500.length} 个`)
          console.log('     → 可能是后端AI模型配置问题')
        }
        
        if (status404.length > 0) {
          console.log(`   • 接口不存在 (404): ${status404.length} 个`)
          console.log('     → 可能是API路由配置问题')
        }
        
        if (status400.length > 0) {
          console.log(`   • 请求参数错误 (400): ${status400.length} 个`)
          console.log('     → 可能是前端请求格式问题')
        }
      } else {
        console.log('✅ 未发现明显的网络错误')
      }
      
      if (consoleErrors.length > 0) {
        console.log(`🔴 发现 ${consoleErrors.length} 个前端错误，需要检查控制台`)
      } else {
        console.log('✅ 未发现前端JavaScript错误')
      }
      
    } catch (error) {
      console.error('❌ 网络分析失败:', error)
      throw error
    }
  })
})

// 辅助函数：登录（如果需要）
async function loginIfNeeded(page: Page) {
  const isLoginPage = await page.locator('input[type="password"]').isVisible()
  
  if (isLoginPage) {
    await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]', TEST_USER.username)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button:has-text("登录"), button:has-text("登陆"), button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 15000 })
  }
}

// 辅助函数：导航到AI助手页面
async function navigateToAIAssistant(page: Page) {
  const possibleSelectors = [
    'a:has-text("AI助手")',
    'a:has-text("AI智能助手")',
    '[href*="/ai"]',
    '.sidebar a:has-text("AI")'
  ]
  
  for (const selector of possibleSelectors) {
    const element = page.locator(selector).first()
    if (await element.isVisible()) {
      await element.click()
      await page.waitForLoadState('networkidle')
      return
    }
  }
  
  // 如果找不到，尝试直接访问
  await page.goto(`${FRONTEND_URL}/ai`)
  await page.waitForLoadState('networkidle')
}

// 辅助函数：触发AI功能
async function triggerAIFunctions(page: Page) {
  // 尝试触发活动策划
  const activityTab = page.locator('button:has-text("活动策划"), .el-tabs__item:has-text("活动策划")').first()
  if (await activityTab.isVisible()) {
    await activityTab.click()
    await page.waitForTimeout(1000)
    
    // 填写简单表单并提交
    const generateBtn = page.locator('button:has-text("生成"), .generate-btn').first()
    if (await generateBtn.isVisible()) {
      await generateBtn.click()
      await page.waitForTimeout(2000)
    }
  }
  
  // 尝试触发AI对话
  const chatTab = page.locator('button:has-text("AI对话"), .el-tabs__item:has-text("AI对话")').first()
  if (await chatTab.isVisible()) {
    await chatTab.click()
    await page.waitForTimeout(1000)
    
    const messageInput = page.locator('input[placeholder*="输入"], textarea[placeholder*="输入"]').first()
    if (await messageInput.isVisible()) {
      await messageInput.fill('测试消息')
      
      const sendBtn = page.locator('button:has-text("发送"), .send-btn').first()
      if (await sendBtn.isVisible()) {
        await sendBtn.click()
        await page.waitForTimeout(2000)
      }
    }
  }
}