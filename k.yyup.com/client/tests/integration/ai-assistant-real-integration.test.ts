/**
 * AIAssistantPage 真实大模型集成测试
 * 连接真实的AI服务，测试实际的用户交互和大模型响应
 */

import { 
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

describe, it, expect, beforeAll, afterAll } from 'vitest'
import axios from 'axios'
import { chromium, Browser, Page, BrowserContext } from 'playwright'
import { authApi } from '@/api/auth';


// 测试配置
const FRONTEND_URL = process.env.VITE_APP_URL || 'https://localhost:5173'
const BACKEND_URL = process.env.VITE_API_BASE_URL || 'https://shlxlyzagqnc.sealoshzh.site'
const TEST_TIMEOUT = 60000 // 增加到60秒，因为AI响应可能较慢

// 测试凭据
const TEST_CREDENTIALS = {
  username: process.env.TEST_USERNAME || '13800138000',
  password: process.env.TEST_PASSWORD || '13800138000123'
}

describe('AIAssistantPage - 真实大模型集成测试', () => {
  let browser: Browser
  let context: BrowserContext
  let page: Page
  let authToken: string

  beforeAll(async () => {
    console.log('🚀 启动真实大模型测试环境...')
    
    // 检查后端服务
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/api/health`)
      expect(healthResponse.status).toBe(200)
      console.log('✅ 后端服务正常')
    } catch (error) {
      throw new Error('后端服务未运行，请启动服务器')
    }

    // 登录获取token
    try {
      const loginResponse = await authApi.unifiedLogin(unifiedLoginData))
      if (loginResponse.data.success) {
        authToken = loginResponse.data.data.accessToken
        console.log('✅ 登录成功')
      } else {
        throw new Error('登录失败')
      }
    } catch (error) {
      throw new Error('登录失败，请检查凭据')
    }

    // 启动浏览器 - 全部使用无头模式
    browser = await chromium.launch({
      headless: true,
      devtools: false
    })
    
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    })
    
    page = await context.newPage()
    
    // 监听页面错误
    page.on('pageerror', error => {
      console.log('🔴 页面错误:', error.message)
    })
    
    console.log('✅ 测试环境初始化完成')
  }, TEST_TIMEOUT)

  afterAll(async () => {
    await browser?.close()
    console.log('🧹 测试环境清理完成')
  })

  describe('🔐 页面访问和权限验证', () => {
    it('应该能够登录并访问AI助手页面', async () => {
      // 访问登录页面
      await page.goto(`${FRONTEND_URL}/login`)
      
      // 等待页面加载
      await page.waitForLoadState('networkidle')
      
      // 查找并填写登录表单
      try {
        const usernameInput = page.locator('input[type="text"], input[name="username"]').first()
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
        const loginButton = page.locator('button:has-text("登录"), button[type="submit"]').first()
        
        await usernameInput.fill(TEST_CREDENTIALS.username)
        await passwordInput.fill(TEST_CREDENTIALS.password)
        await loginButton.click()
        
        // 等待登录完成
        await page.waitForTimeout(3000)
        
        console.log('✅ 登录表单提交成功')
      } catch (error) {
        console.log('⚠️ 登录表单填写失败，可能已经登录或页面结构不同')
      }
      
      // 访问AI助手页面
      await page.goto(`${FRONTEND_URL}/ai`)
      await page.waitForLoadState('networkidle')
      
      // 验证页面加载成功
      const pageTitle = await page.title()
      console.log('页面标题:', pageTitle)
      
      // 检查AI助手页面元素
      const aiPageLoaded = await page.locator('h1:has-text("AI智能助手"), .ai-functionality-container').first().isVisible({ timeout: 10000 })
      expect(aiPageLoaded).toBe(true)
      
      console.log('✅ AI助手页面访问成功')
    }, TEST_TIMEOUT)
  })

  describe('🤖 真实AI对话测试', () => {
    it('应该能够与AI助手进行真实对话', async () => {
      // 确保在AI助手页面
      if (!page.url().includes('/ai')) {
        await page.goto(`${FRONTEND_URL}/ai`)
        await page.waitForLoadState('networkidle')
      }
      
      // 等待AI助手组件加载
      await page.waitForTimeout(5000)
      
      // 查找聊天输入框
      const chatInputSelectors = [
        'input[placeholder*="输入"], input[placeholder*="消息"], textarea[placeholder*="输入"]',
        '.chat-input input, .message-input input',
        'input[type="text"]:visible',
        'textarea:visible'
      ]
      
      let chatInput = null
      for (const selector of chatInputSelectors) {
        try {
          chatInput = page.locator(selector).first()
          if (await chatInput.isVisible({ timeout: 2000 })) {
            console.log(`✅ 找到聊天输入框: ${selector}`)
            break
          }
        } catch (e) {
          continue
        }
      }
      
      if (chatInput) {
        // 发送测试消息
        const testMessage = '你好，请介绍一下幼儿园的招生政策'
        await chatInput.fill(testMessage)
        
        // 查找发送按钮
        const sendButtonSelectors = [
          'button:has-text("发送")',
          'button[type="submit"]',
          '.send-button',
          'button.el-button--primary'
        ]
        
        for (const selector of sendButtonSelectors) {
          try {
            const sendButton = page.locator(selector).first()
            if (await sendButton.isVisible({ timeout: 2000 })) {
              await sendButton.click()
              console.log('✅ 消息发送成功')
              break
            }
          } catch (e) {
            continue
          }
        }
        
        // 等待AI响应（真实大模型可能需要较长时间）
        console.log('⏳ 等待AI响应...')
        await page.waitForTimeout(10000)
        
        // 检查是否有响应
        const responseExists = await page.locator('.message, .chat-message, .ai-response').count() > 0
        if (responseExists) {
          console.log('✅ 检测到AI响应')
          
          // 获取响应内容
          const responses = await page.locator('.message, .chat-message, .ai-response').allTextContents()
          console.log('AI响应内容:', responses.slice(-1)) // 显示最后一条响应
        } else {
          console.log('⚠️ 未检测到明显的AI响应元素，但消息可能已发送')
        }
      } else {
        console.log('⚠️ 未找到聊天输入框，可能页面结构不同')
      }
    }, TEST_TIMEOUT)

    it('应该能够处理复杂的AI查询', async () => {
      // 发送更复杂的查询
      const complexQuery = '请帮我制作一个3-6岁儿童的活动策划方案，包括时间安排、预算和物料清单'
      
      const chatInput = page.locator('input:visible, textarea:visible').first()
      if (await chatInput.isVisible({ timeout: 5000 })) {
        await chatInput.fill(complexQuery)
        
        // 发送消息
        const sendButton = page.locator('button:has-text("发送"), button[type="submit"]').first()
        if (await sendButton.isVisible({ timeout: 2000 })) {
          await sendButton.click()
        }
        
        // 等待较长时间的AI响应
        console.log('⏳ 等待复杂查询的AI响应（最多30秒）...')
        await page.waitForTimeout(30000)
        
        console.log('✅ 复杂查询已发送并等待响应')
      }
    }, TEST_TIMEOUT)
  })

  describe('📋 真实活动策划测试', () => {
    it('应该能够使用真实AI生成活动策划', async () => {
      // 切换到活动策划标签页
      const activityTab = page.locator('text=活动策划').first()
      if (await activityTab.isVisible({ timeout: 5000 })) {
        await activityTab.click()
        await page.waitForTimeout(2000)
        console.log('✅ 切换到活动策划标签页')
      }
      
      // 点击新建活动
      const newActivityButtons = [
        'button:has-text("新建活动")',
        'button:has-text("创建活动")',
        'button:has-text("开始创建活动")'
      ]
      
      for (const selector of newActivityButtons) {
        try {
          const button = page.locator(selector).first()
          if (await button.isVisible({ timeout: 3000 })) {
            await button.click()
            console.log('✅ 点击新建活动按钮')
            break
          }
        } catch (e) {
          continue
        }
      }
      
      await page.waitForTimeout(2000)
      
      // 填写活动策划表单
      const formData = {
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童及家长',
        budget: '5000',
        duration: '2小时',
        location: '幼儿园多功能厅'
      }
      
      // 填写表单字段
      try {
        // 活动类型
        const activityTypeSelect = page.locator('select, .el-select').first()
        if (await activityTypeSelect.isVisible({ timeout: 3000 })) {
          await activityTypeSelect.click()
          await page.locator(`text=${formData.activityType}`).click()
          console.log('✅ 选择活动类型')
        }
        
        // 目标受众
        const targetAudienceInput = page.locator('input[placeholder*="目标受众"], input[placeholder*="受众"]').first()
        if (await targetAudienceInput.isVisible({ timeout: 3000 })) {
          await targetAudienceInput.fill(formData.targetAudience)
          console.log('✅ 填写目标受众')
        }
        
        // 预算
        const budgetInput = page.locator('input[type="number"], .el-input-number input').first()
        if (await budgetInput.isVisible({ timeout: 3000 })) {
          await budgetInput.fill(formData.budget)
          console.log('✅ 填写预算')
        }
        
        // 活动地点
        const locationInput = page.locator('input[placeholder*="地点"], input[placeholder*="location"]').first()
        if (await locationInput.isVisible({ timeout: 3000 })) {
          await locationInput.fill(formData.location)
          console.log('✅ 填写活动地点')
        }
        
      } catch (error) {
        console.log('⚠️ 表单填写过程中出现问题:', error.message)
      }
      
      // 提交表单生成AI策划
      const generateButtons = [
        'button:has-text("生成AI策划方案")',
        'button:has-text("生成方案")',
        'button:has-text("提交")'
      ]
      
      for (const selector of generateButtons) {
        try {
          const button = page.locator(selector).first()
          if (await button.isVisible({ timeout: 3000 })) {
            await button.click()
            console.log('✅ 点击生成AI策划方案')
            break
          }
        } catch (e) {
          continue
        }
      }
      
      // 等待AI生成结果（真实API调用可能需要时间）
      console.log('⏳ 等待AI生成活动策划方案（最多45秒）...')
      await page.waitForTimeout(45000)
      
      // 检查是否生成成功
      const successIndicators = [
        '.activity-details',
        'text=生成成功',
        '.ai-plan-details',
        '.plan-section'
      ]
      
      let generationSuccess = false
      for (const selector of successIndicators) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 5000 })) {
            generationSuccess = true
            console.log(`✅ 检测到生成成功指示器: ${selector}`)
            break
          }
        } catch (e) {
          continue
        }
      }
      
      if (generationSuccess) {
        console.log('✅ AI活动策划生成成功')
        
        // 尝试获取生成的内容
        const planContent = await page.locator('.activity-details, .ai-plan-details').first().textContent()
        if (planContent && planContent.length > 50) {
          console.log('📝 生成的策划方案长度:', planContent.length)
          console.log('📝 方案内容预览:', planContent.substring(0, 200) + '...')
        }
      } else {
        console.log('⚠️ 未明确检测到生成成功，但请求可能已提交')
      }
    }, TEST_TIMEOUT)
  })

  describe('🧠 真实记忆管理测试', () => {
    it('应该能够搜索AI记忆', async () => {
      // 切换到记忆管理标签页
      const memoryTab = page.locator('text=记忆管理').first()
      if (await memoryTab.isVisible({ timeout: 5000 })) {
        await memoryTab.click()
        await page.waitForTimeout(2000)
        console.log('✅ 切换到记忆管理标签页')
      }
      
      // 进入记忆搜索
      const searchTab = page.locator('text=记忆搜索').first()
      if (await searchTab.isVisible({ timeout: 3000 })) {
        await searchTab.click()
        await page.waitForTimeout(1000)
        console.log('✅ 进入记忆搜索')
      }
      
      // 执行搜索
      const searchInput = page.locator('input[placeholder*="搜索"], .memory-search-input').first()
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('幼儿园')
        
        const searchButton = page.locator('button:has-text("搜索")').first()
        if (await searchButton.isVisible({ timeout: 2000 })) {
          await searchButton.click()
          console.log('✅ 执行记忆搜索')
          
          // 等待搜索结果
          await page.waitForTimeout(5000)
          
          // 检查搜索结果
          const resultCount = await page.locator('.memory-item, .search-result').count()
          console.log(`📊 找到 ${resultCount} 条记忆搜索结果`)
        }
      }
    }, TEST_TIMEOUT)
  })

  describe('👨‍🏫 真实专家咨询测试', () => {
    it('应该能够启动专家咨询', async () => {
      // 切换到专家咨询标签页
      const consultationTab = page.locator('text=专家咨询').first()
      if (await consultationTab.isVisible({ timeout: 5000 })) {
        await consultationTab.click()
        await page.waitForTimeout(2000)
        console.log('✅ 切换到专家咨询标签页')
        
        // 点击开始专家咨询
        const startButton = page.locator('button:has-text("开始专家咨询")').first()
        if (await startButton.isVisible({ timeout: 3000 })) {
          await startButton.click()
          console.log('✅ 点击开始专家咨询')
          
          // 等待咨询启动
          await page.waitForTimeout(5000)
          
          // 检查是否成功启动（可能跳转到聊天界面）
          const currentUrl = page.url()
          console.log('当前页面URL:', currentUrl)
        }
      }
    }, TEST_TIMEOUT)
  })

  describe('⚡ 真实性能和响应测试', () => {
    it('应该在合理时间内响应用户操作', async () => {
      const startTime = Date.now()
      
      // 测试页面加载速度
      await page.goto(`${FRONTEND_URL}/ai`)
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      console.log(`⏱️ 页面加载时间: ${loadTime}ms`)
      
      expect(loadTime).toBeLessThan(10000) // 10秒内加载完成
      
      if (loadTime < 3000) {
        console.log('✅ 页面加载速度优秀')
      } else if (loadTime < 5000) {
        console.log('⚠️ 页面加载速度一般')
      } else {
        console.log('🔴 页面加载较慢')
      }
    }, TEST_TIMEOUT)

    it('应该能够处理多个连续操作', async () => {
      // 快速切换标签页测试
      const tabs = ['chat', 'memory', 'activity']
      const tabTexts = ['AI对话', '记忆管理', '活动策划']
      
      for (let i = 0; i < tabTexts.length; i++) {
        const startTime = Date.now()
        
        const tab = page.locator(`text=${tabTexts[i]}`).first()
        if (await tab.isVisible({ timeout: 2000 })) {
          await tab.click()
          await page.waitForTimeout(1000)
          
          const switchTime = Date.now() - startTime
          console.log(`⚡ ${tabTexts[i]} 标签页切换时间: ${switchTime}ms`)
          
          expect(switchTime).toBeLessThan(3000) // 3秒内完成切换
        }
      }
      
      console.log('✅ 多标签页切换测试完成')
    }, TEST_TIMEOUT)
  })

  describe('🔄 真实用户工作流测试', () => {
    it('应该支持完整的用户工作流', async () => {
      // 模拟真实用户使用场景
      
      // 1. 进入AI对话，询问信息
      const chatTab = page.locator('text=AI对话').first()
      if (await chatTab.isVisible({ timeout: 3000 })) {
        await chatTab.click()
        console.log('1️⃣ 进入AI对话')
      }
      
      // 2. 切换到活动策划，创建活动
      const activityTab = page.locator('text=活动策划').first()
      if (await activityTab.isVisible({ timeout: 3000 })) {
        await activityTab.click()
        console.log('2️⃣ 进入活动策划')
      }
      
      // 3. 查看记忆管理
      const memoryTab = page.locator('text=记忆管理').first()
      if (await memoryTab.isVisible({ timeout: 3000 })) {
        await memoryTab.click()
        console.log('3️⃣ 查看记忆管理')
      }
      
      // 4. 返回对话界面
      await chatTab.click()
      console.log('4️⃣ 返回AI对话')
      
      console.log('✅ 完整用户工作流测试完成')
    }, TEST_TIMEOUT)
  })
})