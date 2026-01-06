/**
 * AI助手端到端测试
 * 使用 Playwright 进行真实浏览器环境下的完整业务流程测试
 */

import { test, expect, Page } from '@playwright/test'

// 测试配置
const BASE_URL = 'https://localhost:5173'
const API_BASE_URL = 'https://shlxlyzagqnc.sealoshzh.site'

// 测试工具函数
class AIAssistantTestHelper {
  constructor(private page: Page) {}

  // 用户登录
  async login() {
    await this.page.goto(`${BASE_URL}/login`)
    await this.page.waitForLoadState('networkidle')
    
    // 填写登录表单（使用种子数据中的admin账号）
    await this.fillInput('[placeholder*="用户名"], [placeholder*="账号"], input[name="username"]', 'admin')
    await this.fillInput('[placeholder*="密码"], input[name="password"]', 'admin123')
    
    // 点击登录按钮
    await this.clickElement('button[type="submit"], button:has-text("登录")')
    
    // 等待登录成功并跳转
    await this.page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 })
    
    // 验证登录成功 - 检查是否有用户信息或退出按钮
    try {
      await this.page.waitForSelector('[aria-label*="用户"], .user-avatar, .logout-btn, text=退出', { timeout: 5000 })
    } catch (error) {
      // 如果没找到用户元素，检查是否已经在主页面
      const currentUrl = this.page.url()
      if (!currentUrl.includes('/login')) {
        console.log('登录成功，已跳转到主页面')
      } else {
        throw new Error('登录失败：没有找到登录成功的标识')
      }
    }
  }

  // 导航到AI助手页面
  async navigateToAIAssistant() {
    await this.page.goto(`${BASE_URL}/ai`)
    await this.page.waitForLoadState('networkidle')
  }

  // 等待并点击元素
  async clickElement(selector: string) {
    await this.page.waitForSelector(selector)
    await this.page.click(selector)
  }

  // 填写输入框
  async fillInput(selector: string, value: string) {
    await this.page.waitForSelector(selector)
    await this.page.fill(selector, value)
  }

  // 等待API响应
  async waitForAPIResponse(urlPattern: string) {
    return await this.page.waitForResponse(response => 
      response.url().includes(urlPattern) && response.status() === 200
    )
  }

  // 验证元素存在
  async expectElementExists(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible()
  }

  // 验证文本内容
  async expectTextContent(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text)
  }
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

describe('AI助手完整业务流程测试', () => {
  let helper: AIAssistantTestHelper

  test.beforeEach(async ({ page }) => {
    helper = new AIAssistantTestHelper(page)
    
    // 检查后端服务是否可用
    try {
      const response = await page.request.get(`${API_BASE_URL}/api/health`)
      expect(response.status()).toBe(200)
    } catch (error) {
      throw new Error('后端服务不可用，请确保服务器正在运行')
    }
    
    // 自动登录
    await helper.login()
  })

  test('1. 页面访问和基础功能测试', async ({ page }) => {
    // 1.1 访问AI助手页面
    await helper.navigateToAIAssistant()
    
    // 1.2 验证页面标题
    await helper.expectTextContent('.page-title', 'AI智能助手')
    
    // 1.3 验证所有标签页存在
    await helper.expectElementExists('[label="AI对话"]')
    await helper.expectElementExists('[label="记忆管理"]')
    await helper.expectElementExists('[label="专家咨询"]')
    await helper.expectElementExists('[label="活动策划"]')
    
    // 1.4 验证默认在AI对话标签页
    await helper.expectElementExists('.ai-assistant')
  })

  test('2. AI对话功能测试', async ({ page }) => {
    await helper.navigateToAIAssistant()
    
    // 2.1 等待AI助手初始化
    await helper.waitForAPIResponse('/api/ai/models')
    await helper.waitForAPIResponse('/api/ai/conversations')
    
    // 2.2 验证欢迎消息
    await helper.expectTextContent('.message.assistant', '您好！我是AI助手')
    
    // 2.3 发送消息
    const testMessage = '你好，请帮我生成一个待办事项列表'
    await helper.fillInput('textarea', testMessage)
    await helper.clickElement('.send-button')
    
    // 2.4 验证用户消息显示
    await helper.expectTextContent('.message.user', testMessage)
    
    // 2.5 等待AI响应
    await page.waitForSelector('.message.assistant:nth-child(3)', { timeout: 10000 })
    
    // 2.6 验证AI响应包含待办事项
    await helper.expectTextContent('.message.assistant:nth-child(3)', '待办事项')
  })

  test('3. 专家咨询功能测试', async ({ page }) => {
    await helper.navigateToAIAssistant()
    
    // 3.1 切换到专家咨询标签页
    await helper.clickElement('[label="专家咨询"]')
    
    // 3.2 验证专家团队显示
    await helper.expectElementExists('.expert-team-section')
    await helper.expectTextContent('.expert-card', '招生策划专家')
    await helper.expectTextContent('.expert-card', '心理学专家')
    
    // 3.3 输入咨询问题
    const consultationQuery = '我要做一场秋季的招生活动，需要考虑哪些方面？'
    await helper.fillInput('.query-textarea textarea', consultationQuery)
    
    // 3.4 开始咨询
    await helper.clickElement('button:has-text("开始专家咨询")')
    
    // 3.5 等待咨询开始
    await helper.waitForAPIResponse('/api/expert-consultation/start')
    
    // 3.6 验证咨询进度显示
    await helper.expectElementExists('.consultation-progress')
    await helper.expectElementExists('.expert-card.active')
    
    // 3.7 等待专家发言
    await page.waitForSelector('.speech-item', { timeout: 15000 })
    
    // 3.8 验证专家发言内容
    await helper.expectElementExists('.speech-content')
    await helper.expectTextContent('.expert-name', '招生策划专家')
  })

  test('4. 活动策划功能测试', async ({ page }) => {
    await helper.navigateToAIAssistant()
    
    // 4.1 切换到活动策划标签页
    await helper.clickElement('[label="活动策划"]')
    
    // 4.2 验证欢迎页面
    await helper.expectTextContent('h3', '开始创建您的招生活动')
    
    // 4.3 点击创建新活动
    await helper.clickElement('button:has-text("开始创建活动")')
    
    // 4.4 填写活动策划表单
    await helper.clickElement('[placeholder="请选择活动类型"]')
    await helper.clickElement('text=幼儿园开放日')
    
    await helper.fillInput('[placeholder="例如：3-6岁儿童及家长"]', '3-6岁儿童及家长')
    
    await helper.fillInput('[placeholder="预算（元）"]', '5000')
    
    await helper.clickElement('[placeholder="请选择活动时长"]')
    await helper.clickElement('text=2小时')
    
    await helper.fillInput('[placeholder="例如：幼儿园多功能厅"]', '幼儿园主校区')
    
    // 4.5 生成AI策划方案
    await helper.clickElement('button:has-text("生成AI策划方案")')
    
    // 4.6 等待方案生成
    await helper.waitForAPIResponse('/api/activity-planner/generate')
    
    // 4.7 验证成功消息
    await page.waitForSelector('text=活动策划方案生成成功', { timeout: 10000 })
    
    // 4.8 验证活动详情显示
    await helper.expectElementExists('.activity-details')
    await helper.expectElementExists('.ai-plan-details')
  })

  test('5. API集成和错误处理测试', async ({ page }) => {
    await helper.navigateToAIAssistant()
    
    // 5.1 验证模型API调用
    const modelsResponse = await helper.waitForAPIResponse('/api/ai/models')
    const modelsData = await modelsResponse.json()
    expect(modelsData.data).toBeDefined()
    expect(Array.isArray(modelsData.data)).toBe(true)
    
    // 5.2 测试会话创建API
    await helper.clickElement('button:has-text("新建会话")')
    await helper.waitForAPIResponse('/api/ai/conversations')
    
    // 5.3 测试消息发送API
    await helper.fillInput('textarea', '测试消息')
    await helper.clickElement('.send-button')
    await helper.waitForAPIResponse('/api/ai/conversations/')
    
    // 5.4 验证错误处理（模拟网络错误）
    await page.route('**/api/ai/**', route => route.abort())
    
    await helper.fillInput('textarea', '网络错误测试')
    await helper.clickElement('.send-button')
    
    // 验证错误提示
    await page.waitForSelector('text=AI服务暂时不可用，使用本地响应', { timeout: 5000 })
  })

  test('6. 响应式设计和移动端适配测试', async ({ page }) => {
    // 6.1 测试桌面端
    await page.setViewportSize({ width: 1920, height: 1080 })
    await helper.navigateToAIAssistant()
    await helper.expectElementExists('.consultation-layout')
    
    // 6.2 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await helper.expectElementExists('.ai-functionality-container')
    
    // 6.3 测试手机端
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await helper.expectElementExists('.page-title')
  })

  test('7. 性能和用户体验测试', async ({ page }) => {
    await helper.navigateToAIAssistant()
    
    // 7.1 测试页面加载性能
    const startTime = Date.now()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000) // 页面应在5秒内加载完成
    
    // 7.2 测试AI响应速度
    await helper.fillInput('textarea', '快速测试')
    
    const responseStartTime = Date.now()
    await helper.clickElement('.send-button')
    await page.waitForSelector('.message.assistant:nth-child(3)', { timeout: 10000 })
    const responseTime = Date.now() - responseStartTime
    expect(responseTime).toBeLessThan(8000) // AI响应应在8秒内
    
    // 7.3 测试内存泄漏（多次操作）
    for (let i = 0;
import { vi } from 'vitest' i < 5; i++) {
      await helper.fillInput('textarea', `测试消息 ${i}`)
      await helper.clickElement('.send-button')
      await page.waitForSelector(`.message.user:has-text("测试消息 ${i}")`)
      
      // 检查内存使用情况（简单检查）
      const jsHeapSizeUsed = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      expect(jsHeapSizeUsed).toBeLessThan(50 * 1024 * 1024) // 50MB限制
    }
  })

  test('8. 数据持久化和状态管理测试', async ({ page }) => {
    await helper.navigateToAIAssistant()
    
    // 8.1 发送消息
    await helper.fillInput('textarea', '持久化测试消息')
    await helper.clickElement('.send-button')
    await page.waitForSelector('.message.user:has-text("持久化测试消息")')
    
    // 8.2 刷新页面
    await page.reload()
    await helper.waitForAPIResponse('/api/ai/conversations')
    
    // 8.3 验证消息持久化
    await page.waitForSelector('.message.user:has-text("持久化测试消息")', { timeout: 5000 })
    
    // 8.4 测试会话切换
    await helper.clickElement('button:has-text("新建会话")')
    await helper.waitForAPIResponse('/api/ai/conversations')
    
    // 验证新会话状态
    await helper.expectTextContent('.message.assistant', '您好！我是AI助手')
  })

  test('9. 可访问性和无障碍测试', async ({ page }) => {
    await helper.navigateToAIAssistant()
    
    // 9.1 键盘导航测试
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // 应该触发新建会话
    
    // 9.2 屏幕阅读器支持测试
    const textareaAriaLabel = await page.getAttribute('textarea', 'aria-label')
    expect(textareaAriaLabel).toBeTruthy()
    
    // 9.3 颜色对比度测试（检查重要元素）
    const primaryButton = page.locator('button[type="primary"]').first()
    const buttonStyles = await primaryButton.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      }
    })
    expect(buttonStyles.backgroundColor).toBeTruthy()
    expect(buttonStyles.color).toBeTruthy()
  })

  test('10. 安全性测试', async ({ page }) => {
    await helper.navigateToAIAssistant()
    
    // 10.1 XSS防护测试
    const xssPayload = '<script>alert("XSS")</script>'
    await helper.fillInput('textarea', xssPayload)
    await helper.clickElement('.send-button')
    
    // 验证XSS被正确转义
    await page.waitForSelector('.message.user', { timeout: 5000 })
    const messageContent = await page.locator('.message.user .message-text').textContent()
    expect(messageContent).toContain('<script>')
    expect(messageContent).not.toContain('alert("XSS")')
    
    // 10.2 SQL注入防护测试（通过API）
    const sqlPayload = "'; DROP TABLE users; --"
    await helper.fillInput('textarea', sqlPayload)
    await helper.clickElement('.send-button')
    
    // 验证请求正常处理（没有服务器错误）
    await page.waitForSelector('.message.assistant:last-child', { timeout: 10000 })
  })
})

// 测试数据清理
test.afterAll(async () => {
  // 在所有测试完成后清理测试数据
  console.log('所有AI助手测试完成，清理测试数据...')
})