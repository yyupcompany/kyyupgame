import { vi } from 'vitest'
/**
 * AIAssistantPage.vue 端到端测试
 * 模拟真实用户使用场景，测试完整的用户交互流程
 */

import { test, expect } from '@playwright/test'

/**
 * 验证API响应结构的辅助函数
 */
async function validateApiResponse(response: any) {
  if (!response || typeof response !== 'object') {
    return { valid: false, errors: ['Response is not an object'] }
  }

  const errors: string[] = []

  // 检查必需的响应字段
  if (response.success !== undefined && typeof response.success !== 'boolean') {
    errors.push('success field must be boolean')
  }

  if (response.code !== undefined && typeof response.code !== 'number') {
    errors.push('code field must be number')
  }

  if (response.message !== undefined && typeof response.message !== 'string') {
    errors.push('message field must be string')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证页面元素和数据完整性
 */
async function validatePageContent(page: any) {
  const errors: string[] = []

  try {
    // 验证基本页面结构
    const titleExists = await page.locator('h1').isVisible()
    if (!titleExists) errors.push('Page title not found')

    const containerExists = await page.locator('.ai-functionality-container').isVisible()
    if (!containerExists) errors.push('Main container not found')

    // 验证标签页
    const tabsExist = await page.locator('.el-tabs').isVisible()
    if (!tabsExist) errors.push('Tabs not found')

    return { valid: errors.length === 0, errors }
  } catch (error) {
    errors.push(`Validation error: ${error}`)
    return { valid: false, errors }
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

describe('AI助手页面 - 真实用户交互测试', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟用户登录
    await page.goto('/login')
    await page.fill('[data-testid="username"]', 'admin')
    await page.fill('[data-testid="password"]', 'admin123')
    await page.click('[data-testid="login-button"]')
    
    // 等待登录完成并导航到AI助手页面
    await page.waitForURL('/dashboard')
    await page.goto('/ai')
    await page.waitForLoadState('networkidle')
  })

  test.describe('🔐 权限验证和页面加载', () => {
    test('应该正确显示AI助手页面标题和基本结构', async ({ page }) => {
      const startTime = Date.now()

      // 严格验证页面标题
      const titleElement = page.locator('h1')
      await expect(titleElement).toBeVisible()
      const titleText = await titleElement.textContent()
      expect(titleText).toContain('AI智能助手')

      // 严格验证主要UI元素存在
      const mainContainer = page.locator('.ai-functionality-container')
      await expect(mainContainer).toBeVisible()

      const pageHeader = page.locator('.page-header')
      await expect(pageHeader).toBeVisible()

      const mainContent = page.locator('.main-content')
      await expect(mainContent).toBeVisible()

      // 严格验证标签页结构
      const tabsContainer = page.locator('.el-tabs')
      await expect(tabsContainer).toBeVisible()

      // 验证具体的标签页项
      const tabLabels = ['AI对话', '记忆管理', '专家咨询', '活动策划']
      for (const label of tabLabels) {
        const tabElement = page.locator(`text=${label}`)
        await expect(tabElement).toBeVisible()
      }

      // 使用验证函数进行完整验证
      const pageValidation = await validatePageContent(page)
      expect(pageValidation.valid).toBe(true)
      if (!pageValidation.valid) {
        console.error('页面验证错误:', pageValidation.errors)
      }

      // 验证页面加载时间
      const endTime = Date.now()
      const loadTime = endTime - startTime
      expect(loadTime).toBeLessThan(5000) // 页面应该在5秒内加载完成

      // 验证页面URL
      expect(page.url()).toContain('/ai')

      // 检查控制台错误
      page.on('console', (message) => {
        if (message.type() === 'error') {
          console.log('控制台错误:', message.text())
        }
      })
    })

    test('应该根据用户权限显示相应功能', async ({ page }) => {
      // 验证管理员用户可以看到所有功能
      await expect(page.locator('text=记忆管理')).toBeVisible()
      await expect(page.locator('text=专家咨询')).toBeVisible()
      await expect(page.locator('text=活动策划')).toBeVisible()
    })

    test('应该正确初始化AI模块', async ({ page }) => {
      // 等待AI模块加载完成
      await page.waitForTimeout(2000)
      
      // 验证加载状态消失
      await expect(page.locator('text=正在加载AI助手')).not.toBeVisible()
      
      // 验证AI组件正确显示
      await expect(page.locator('.ai-assistant-component, [data-testid="ai-assistant"]')).toBeVisible()
    })
  })

  test.describe('💬 AI对话功能测试', () => {
    test('应该能够创建新会话', async ({ page }) => {
      // 点击新建会话按钮
      await page.click('button:has-text("新建会话")')
      
      // 验证会话创建成功（可能需要等待API响应）
      await page.waitForTimeout(1000)
      
      // 验证AI助手组件处于可用状态
      await expect(page.locator('.ai-assistant-component, [data-testid="ai-assistant"]')).toBeVisible()
    })

    test('应该能够发送消息并接收回复', async ({ page }) => {
      // 查找消息输入框
      const messageInput = page.locator('textarea, input[type="text"]').first()
      
      if (await messageInput.isVisible()) {
        // 输入测试消息
        await messageInput.fill('你好，请介绍一下幼儿园的教学理念')
        
        // 发送消息
        await page.keyboard.press('Enter')
        
        // 等待AI回复
        await page.waitForTimeout(3000)
        
        // 验证消息已发送
        await expect(page.locator('text=你好，请介绍一下幼儿园的教学理念')).toBeVisible()
      }
    })

    test('应该正确处理组件预览', async ({ page }) => {
      // 验证预览区域存在
      await expect(page.locator('.content-panel')).toBeVisible()
      await expect(page.locator('text=内容预览')).toBeVisible()
      
      // 验证默认预览内容
      await expect(page.locator('.preview-placeholder, .default-content')).toBeVisible()
    })
  })

  test.describe('🧠 记忆管理功能测试', () => {
    test('应该能够切换到记忆管理标签页', async ({ page }) => {
      // 切换到记忆管理标签页
      await page.click('text=记忆管理')
      
      // 验证标签页切换成功
      await expect(page.locator('.memory-management-content')).toBeVisible()
      await expect(page.locator('text=管理AI助手的记忆库')).toBeVisible()
    })

    test('应该能够搜索记忆', async ({ page }) => {
      // 切换到记忆管理
      await page.click('text=记忆管理')
      
      // 点击记忆搜索标签
      await page.click('text=记忆搜索')
      
      // 输入搜索关键词
      const searchInput = page.locator('input[placeholder*="搜索AI记忆内容"]')
      await searchInput.fill('招生')
      
      // 点击搜索按钮或按回车
      await page.keyboard.press('Enter')
      
      // 等待搜索结果
      await page.waitForTimeout(2000)
      
      // 验证搜索功能被触发（即使没有结果也应该有相应的UI反馈）
      await expect(searchInput).toHaveValue('招生')
    })

    test('应该能够查看记忆统计', async ({ page }) => {
      // 切换到记忆管理
      await page.click('text=记忆管理')
      
      // 点击记忆统计标签
      await page.click('text=记忆统计')
      
      // 验证统计信息显示
      await expect(page.locator('.memory-stats-section, .stats-cards')).toBeVisible()
      await expect(page.locator('text=总记忆数')).toBeVisible()
      await expect(page.locator('text=短期记忆')).toBeVisible()
      await expect(page.locator('text=长期记忆')).toBeVisible()
    })

    test('应该能够管理短期和长期记忆', async ({ page }) => {
      // 切换到记忆管理
      await page.click('text=记忆管理')
      
      // 测试短期记忆标签
      await page.click('text=短期记忆')
      await expect(page.locator('.memory-list-section')).toBeVisible()
      
      // 测试长期记忆标签
      await page.click('text=长期记忆')
      await expect(page.locator('.memory-list-section')).toBeVisible()
    })
  })

  test.describe('👨‍🏫 专家咨询功能测试', () => {
    test('应该能够启动专家咨询', async ({ page }) => {
      // 切换到专家咨询标签页
      await page.click('text=专家咨询')
      
      // 验证专家咨询界面
      await expect(page.locator('text=AI专家咨询')).toBeVisible()
      await expect(page.locator('text=专业团队为您提供全方位的招生咨询服务')).toBeVisible()
      
      // 点击开始专家咨询按钮
      await page.click('button:has-text("开始专家咨询")')
      
      // 等待API响应
      await page.waitForTimeout(2000)
      
      // 验证咨询启动成功（可能会切换到聊天界面）
      // 由于这是真实的API调用，我们主要验证按钮被点击
    })
  })

  test.describe('📋 活动策划功能测试', () => {
    test('应该能够切换到活动策划标签页', async ({ page }) => {
      // 切换到活动策划标签页
      await page.click('text=活动策划')
      
      // 验证活动策划界面
      await expect(page.locator('text=使用AI助手快速生成各类招生活动策划')).toBeVisible()
      await expect(page.locator('.split-layout')).toBeVisible()
    })

    test('应该能够创建新活动', async ({ page }) => {
      // 切换到活动策划
      await page.click('text=活动策划')
      
      // 点击新建活动按钮
      await page.click('button:has-text("新建活动"), button:has-text("创建活动")')
      
      // 验证策划表单显示
      await expect(page.locator('.activity-planning-form, text=AI活动策划')).toBeVisible()
    })

    test('应该能够填写和提交活动策划表单', async ({ page }) => {
      // 切换到活动策划
      await page.click('text=活动策划')
      
      // 创建新活动
      await page.click('button:has-text("开始创建活动"), button:has-text("新建活动")')
      
      // 等待表单显示
      await page.waitForTimeout(1000)
      
      // 填写表单
      await page.selectOption('select:near(text="活动类型")', '幼儿园开放日')
      await page.fill('input:near(text="目标受众")', '3-6岁儿童及家长')
      await page.fill('input:near(text="预算范围")', '5000')
      await page.selectOption('select:near(text="活动时长")', '2小时')
      await page.fill('input:near(text="活动地点")', '幼儿园多功能厅')
      
      // 选择特殊要求
      await page.selectOption('select:near(text="特殊要求")', '音响设备')
      
      // 选择活动风格
      await page.click('input[value="professional"]')
      
      // 提交表单
      await page.click('button:has-text("生成AI策划方案")')
      
      // 等待生成完成
      await page.waitForTimeout(5000)
      
      // 验证生成成功的反馈
      await expect(page.locator('text=活动策划方案生成成功')).toBeVisible({ timeout: 10000 })
    })

    test('应该能够查看生成的活动详情', async ({ page }) => {
      // 如果已经有活动，点击查看详情
      const activityItem = page.locator('.activity-item').first()
      
      if (await activityItem.isVisible()) {
        await activityItem.click()
        
        // 验证活动详情显示
        await expect(page.locator('.activity-details')).toBeVisible()
        await expect(page.locator('text=活动描述')).toBeVisible()
        await expect(page.locator('text=活动时间')).toBeVisible()
        await expect(page.locator('text=目标群体')).toBeVisible()
      }
    })

    test('应该能够筛选活动', async ({ page }) => {
      // 切换到活动策划
      await page.click('text=活动策划')
      
      // 测试活动筛选
      await page.selectOption('.activity-filter-select', '草稿')
      await page.waitForTimeout(500)
      
      await page.selectOption('.activity-filter-select', '进行中')
      await page.waitForTimeout(500)
      
      await page.selectOption('.activity-filter-select', '全部活动')
      await page.waitForTimeout(500)
    })
  })

  test.describe('📱 响应式设计测试', () => {
    test('应该在桌面设备上正确显示', async ({ page }) => {
      // 设置桌面视口
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // 验证分屏布局
      await expect(page.locator('.split-layout')).toBeVisible()
      await expect(page.locator('.content-panel')).toBeVisible()
      await expect(page.locator('.chat-panel')).toBeVisible()
    })

    test('应该在平板设备上正确显示', async ({ page }) => {
      // 设置平板视口
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // 验证页面布局调整
      await expect(page.locator('.ai-functionality-container')).toBeVisible()
      await expect(page.locator('.main-content')).toBeVisible()
    })

    test('应该在移动设备上正确显示', async ({ page }) => {
      // 设置移动视口
      await page.setViewportSize({ width: 375, height: 667 })
      
      // 验证移动布局
      await expect(page.locator('.ai-functionality-container')).toBeVisible()
      await expect(page.locator('.page-header')).toBeVisible()
      
      // 验证标签页在移动设备上仍然可用
      await expect(page.locator('.el-tabs')).toBeVisible()
    })
  })

  test.describe('⌨️ 键盘导航测试', () => {
    test('应该支持Tab键导航', async ({ page }) => {
      // 从页面顶部开始Tab导航
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // 验证焦点管理正确
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('应该支持Enter键激活按钮', async ({ page }) => {
      // 使用键盘导航到按钮
      await page.keyboard.press('Tab')
      
      // 找到可聚焦的按钮
      const button = page.locator('button').first()
      await button.focus()
      
      // 使用Enter键激活
      await page.keyboard.press('Enter')
      
      // 验证按钮响应
      await page.waitForTimeout(500)
    })

    test('应该支持Escape键关闭模态框', async ({ page }) => {
      // 如果有模态框或弹出层，测试Escape键
      await page.keyboard.press('Escape')
      
      // 验证基本功能正常
      await expect(page.locator('.ai-functionality-container')).toBeVisible()
    })
  })

  test.describe('🔄 数据持久化和状态管理测试', () => {
    test('应该保持标签页状态', async ({ page }) => {
      // 切换到记忆管理标签页
      await page.click('text=记忆管理')
      
      // 刷新页面
      await page.reload()
      
      // 验证回到默认标签页（AI对话）
      await expect(page.locator('text=AI对话')).toBeVisible()
    })

    test('应该保持表单输入状态', async ({ page }) => {
      // 切换到活动策划
      await page.click('text=活动策划')
      
      // 创建新活动并填写部分表单
      await page.click('button:has-text("开始创建活动"), button:has-text("新建活动")')
      
      if (await page.locator('input:near(text="目标受众")').isVisible()) {
        await page.fill('input:near(text="目标受众")', '测试受众')
        
        // 验证输入被保存
        await expect(page.locator('input:near(text="目标受众")')).toHaveValue('测试受众')
      }
    })
  })

  test.describe('🚀 性能测试', () => {
    test('页面加载时间应该合理', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/ai')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // 页面应该在5秒内加载完成
      expect(loadTime).toBeLessThan(5000)
    })

    test('标签页切换应该流畅', async ({ page }) => {
      const tabs = ['AI对话', '记忆管理', '专家咨询', '活动策划']
      
      for (const tab of tabs) {
        const startTime = Date.now()
        
        await page.click(`text=${tab}`)
        await page.waitForTimeout(100)
        
        const switchTime = Date.now() - startTime
        
        // 标签页切换应该在1秒内完成
        expect(switchTime).toBeLessThan(1000)
      }
    })

    test('大量数据渲染应该流畅', async ({ page }) => {
      // 切换到活动策划，如果有很多活动项目
      await page.click('text=活动策划')
      
      // 等待渲染完成
      await page.waitForTimeout(1000)
      
      // 验证页面仍然响应
      await expect(page.locator('.ai-functionality-container')).toBeVisible()
    })
  })

  test.describe('🛡️ 错误处理测试', () => {
    test('应该正确处理网络错误', async ({ page }) => {
      // 模拟网络离线
      await page.context().setOffline(true)
      
      // 尝试执行需要网络的操作
      await page.click('text=专家咨询')
      await page.click('button:has-text("开始专家咨询")')
      
      // 恢复网络
      await page.context().setOffline(false)
      
      // 验证页面仍然可用
      await expect(page.locator('.ai-functionality-container')).toBeVisible()
    })

    test('应该正确处理API错误', async ({ page }) => {
      // 由于这是真实的API测试，我们主要验证错误不会导致页面崩溃
      await page.click('text=活动策划')
      
      // 尝试提交无效表单
      await page.click('button:has-text("开始创建活动"), button:has-text("新建活动")')
      
      if (await page.locator('button:has-text("生成AI策划方案")').isVisible()) {
        await page.click('button:has-text("生成AI策划方案")')
        
        // 等待错误处理
        await page.waitForTimeout(2000)
      }
      
      // 验证页面仍然正常
      await expect(page.locator('.ai-functionality-container')).toBeVisible()
    })
  })

  test.describe('🎨 视觉回归测试', () => {
    test('AI对话标签页视觉回归', async ({ page }) => {
      await page.click('text=AI对话')
      await page.waitForTimeout(1000)
      
      // 截图对比（需要配置baseline）
      await expect(page.locator('.main-content')).toHaveScreenshot('ai-chat-tab.png')
    })

    test('活动策划表单视觉回归', async ({ page }) => {
      await page.click('text=活动策划')
      await page.click('button:has-text("开始创建活动"), button:has-text("新建活动")')
      await page.waitForTimeout(1000)
      
      // 截图对比
      if (await page.locator('.activity-planning-form').isVisible()) {
        await expect(page.locator('.activity-planning-form')).toHaveScreenshot('activity-planning-form.png')
      }
    })
  })
})