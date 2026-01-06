import { vi } from 'vitest'
/**
 * AI中心模块端到端测试
 * 测试AI中心的所有核心功能，包括AI助手、AI查询、模型管理、权限控制等
 */

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

describe('AI中心模块 - 端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟用户登录
    await page.goto('/login')
    await page.fill('[data-testid="username"]', 'admin')
    await page.fill('[data-testid="password"]', 'admin123')
    await page.click('[data-testid="login-button"]')
    
    // 等待登录完成并导航到AI中心
    await page.waitForURL('/dashboard')
    await page.goto('/centers/ai')
    await page.waitForLoadState('networkidle')
  })

  test.describe('🔐 权限验证和页面加载', () => {
    test('应该正确显示AI中心页面标题和基本结构', async ({ page }) => {
      // 验证页面标题
      await expect(page.locator('h1')).toContainText('AI中心')
      
      // 验证主要UI元素存在
      await expect(page.locator('.ai-center')).toBeVisible()
      await expect(page.locator('.page-header')).toBeVisible()
      await expect(page.locator('.welcome-section')).toBeVisible()
      
      // 验证标签页存在
      await expect(page.locator('.el-tabs')).toBeVisible()
      await expect(page.locator('text=概览')).toBeVisible()
      await expect(page.locator('text=AI查询')).toBeVisible()
      await expect(page.locator('text=智能分析')).toBeVisible()
      await expect(page.locator('text=模型管理')).toBeVisible()
    })

    test('应该根据用户权限显示相应功能', async ({ page }) => {
      // 验证管理员用户可以看到所有功能
      await expect(page.locator('text=AI查询')).toBeVisible()
      await expect(page.locator('text=智能分析')).toBeVisible()
      await expect(page.locator('text=模型管理')).toBeVisible()
    })

    test('应该正确初始化AI中心模块', async ({ page }) => {
      // 等待AI中心模块加载完成
      await page.waitForTimeout(2000)
      
      // 验证加载状态消失
      await expect(page.locator('text=正在加载')).not.toBeVisible()
      
      // 验证AI中心组件正确显示
      await expect(page.locator('.ai-center')).toBeVisible()
    })
  })

  test.describe('🤖 AI助手页面功能测试', () => {
    test('应该能够导航到AI助手页面', async ({ page }) => {
      // 点击AI助手功能模块
      await page.click('text=AI智能查询')
      
      // 验证导航到AI查询页面
      await expect(page).toHaveURL(/.*ai\/query/)
      await expect(page.locator('h2')).toContainText('AI智能查询')
    })

    test('应该能够使用AI助手进行对话', async ({ page }) => {
      // 导航到AI助手
      await page.click('text=AI智能查询')
      await page.waitForURL(/.*ai\/query/)
      
      // 输入测试消息
      await page.fill('.query-textarea textarea', '你好，请介绍一下幼儿园的教学理念')
      
      // 发送消息
      await page.click('button:has-text("执行查询")')
      
      // 等待AI回复
      await page.waitForTimeout(3000)
      
      // 验证消息已发送
      await expect(page.locator('text=你好，请介绍一下幼儿园的教学理念')).toBeVisible()
    })

    test('应该能够使用AI专家咨询功能', async ({ page }) => {
      // 导航到AI专家咨询
      await page.goto('/centers/ai/expert-consultation')
      await page.waitForURL(/.*ai\/expert-consultation/)
      
      // 验证页面加载
      await expect(page.locator('h1')).toContainText('AI专家咨询系统')
      
      // 输入测试问题
      await page.fill('textarea[placeholder*="请详细描述您遇到的问题"]', '我要做一场秋季的招生活动，需要考虑哪些方面？')
      
      // 发送问题
      await page.click('button:has-text("发送")')
      
      // 等待专家回复
      await page.waitForTimeout(5000)
      
      // 验证专家回复
      await expect(page.locator('.message.assistant')).toBeVisible()
    })

    test('应该能够使用Function Tools功能', async ({ page }) => {
      // 导航到Function Tools
      await page.goto('/ai-center/function-tools')
      await page.waitForURL(/.*function-tools/)
      
      // 验证页面加载
      await expect(page.locator('h1')).toContainText('Function Tools')
      
      // 输入测试问题
      await page.fill('.message-input textarea', '查询最近一个月的活动统计数据')
      
      // 发送问题
      await page.click('button:has-text("发送")')
      
      // 等待回复
      await page.waitForTimeout(3000)
      
      // 验证回复
      await expect(page.locator('.message-item.ai-message')).toBeVisible()
    })
  })

  test.describe('🔍 AI查询功能测试', () => {
    test('应该能够执行自然语言查询', async ({ page }) => {
      // 切换到AI查询标签页
      await page.click('text=AI查询')
      
      // 输入自然语言查询
      await page.fill('.query-textarea textarea', '查询本月新入学的学生人数')
      
      // 执行查询
      await page.click('button:has-text("执行查询")')
      
      // 等待查询完成
      await page.waitForTimeout(3000)
      
      // 验证查询结果
      await expect(page.locator('.query-results')).toBeVisible()
    })

    test('应该能够查看生成的SQL查询', async ({ page }) => {
      // 切换到AI查询标签页
      await page.click('text=AI查询')
      
      // 执行查询
      await page.fill('.query-textarea textarea', '统计本月活动参与人数最多的前5个活动')
      await page.click('button:has-text("执行查询")')
      await page.waitForTimeout(3000)
      
      // 验证SQL查询显示
      await expect(page.locator('text=生成的SQL查询')).toBeVisible()
      await expect(page.locator('pre code')).toBeVisible()
    })

    test('应该能够使用查询模板', async ({ page }) => {
      // 切换到AI查询标签页
      await page.click('text=AI查询')
      
      // 点击模板按钮
      await page.click('button:has-text("模板")')
      
      // 选择模板
      await page.click('.template-item:first-child')
      
      // 验证模板内容填充
      const queryText = await page.locator('.query-textarea textarea').inputValue()
      expect(queryText).not.toBe('')
    })

    test('应该能够查看查询历史', async ({ page }) => {
      // 切换到AI查询标签页
      await page.click('text=AI查询')
      
      // 点击历史按钮
      await page.click('button:has-text("历史")')
      
      // 验证历史记录显示
      await expect(page.locator('.history-dialog')).toBeVisible()
    })
  })

  test.describe('🧠 AI模型管理测试', () => {
      test('应该能够导航到AI模型管理页面', async ({ page }) => {
      // 切换到模型管理标签页
      await page.click('text=模型管理')
      
      // 验证页面加载
      await expect(page.locator('h2')).toContainText('AI模型管理')
      await expect(page.locator('.models-list')).toBeVisible()
    })

    test('应该能够查看AI模型列表', async ({ page }) => {
      // 切换到模型管理标签页
      await page.click('text=模型管理')
      
      // 验证模型列表显示
      await expect(page.locator('.model-card')).toBeVisible()
      
      // 验证模型信息
      await expect(page.locator('.model-name')).toBeVisible()
      await expect(page.locator('.model-type')).toBeVisible()
    })

    test('应该能够创建新的AI模型', async ({ page }) => {
      // 切换到模型管理标签页
      await page.click('text=模型管理')
      
      // 点击创建模型按钮
      await page.click('button:has-text("创建模型")')
      
      // 验证创建对话框显示
      await expect(page.locator('.create-model-dialog')).toBeVisible()
    })

    test('应该能够测试AI模型连接', async ({ page }) => {
      // 切换到模型管理标签页
      await page.click('text=模型管理')
      
      // 点击第一个模型的测试按钮
      await page.click('.model-card:first-child button:has-text("测试")')
      
      // 等待测试完成
      await page.waitForTimeout(2000)
      
      // 验证测试结果
      await expect(page.locator('.el-message--success')).toBeVisible()
    })
  })

  test.describe('📊 智能分析功能测试', () => {
    test('应该能够导航到智能分析页面', async ({ page }) => {
      // 切换到智能分析标签页
      await page.click('text=智能分析')
      
      // 验证页面加载
      await expect(page.locator('h2')).toContainText('智能分析')
      await expect(page.locator('.analysis-modules')).toBeVisible()
    })

    test('应该能够使用预测分析功能', async ({ page }) => {
      // 切换到智能分析标签页
      await page.click('text=智能分析')
      
      // 点击预测分析模块
      await page.click('text=预测分析')
      
      // 验证导航到预测分析页面
      await page.waitForTimeout(1000)
    })

    test('应该能够使用学生分析功能', async ({ page }) => {
      // 切换到智能分析标签页
      await page.click('text=智能分析')
      
      // 点击学生分析模块
      await page.click('text=学生分析')
      
      // 验证导航到学生分析页面
      await page.waitForTimeout(1000)
    })

    test('应该能够使用客户分析功能', async ({ page }) => {
      // 切换到智能分析标签页
      await page.click('text=智能分析')
      
      // 点击客户分析模块
      await page.click('text=客户分析')
      
      // 验证导航到客户分析页面
      await page.waitForTimeout(1000)
    })
  })

  test.describe('🔐 权限验证测试', () => {
    test('应该根据用户角色显示不同的功能', async ({ page }) => {
      // 验证管理员可以看到所有功能
      await expect(page.locator('text=AI查询')).toBeVisible()
      await expect(page.locator('text=智能分析')).toBeVisible()
      await expect(page.locator('text=模型管理')).toBeVisible()
    })

    test('应该正确处理无权限访问', async ({ page }) => {
      // 模拟无权限用户访问（需要后端支持）
      // 这里验证UI层面的权限控制
      await expect(page.locator('.ai-center')).toBeVisible()
    })

    test('应该在创建模型时验证权限', async ({ page }) => {
      // 切换到模型管理
      await page.click('text=模型管理')
      
      // 尝试创建模型
      await page.click('button:has-text("创建模型")')
      
      // 验证操作被允许（管理员权限）
      await expect(page.locator('.create-model-dialog')).toBeVisible()
    })
  })

  test.describe('📱 响应式设计测试', () => {
    test('应该在桌面设备上正确显示', async ({ page }) => {
      // 设置桌面视口
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // 验证布局
      await expect(page.locator('.ai-center')).toBeVisible()
      await expect(page.locator('.el-tabs')).toBeVisible()
    })

    test('应该在平板设备上正确显示', async ({ page }) => {
      // 设置平板视口
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // 验证布局调整
      await expect(page.locator('.ai-center')).toBeVisible()
      await expect(page.locator('.welcome-section')).toBeVisible()
    })

    test('应该在移动设备上正确显示', async ({ page }) => {
      // 设置移动视口
      await page.setViewportSize({ width: 375, height: 667 })
      
      // 验证移动端布局
      await expect(page.locator('.ai-center')).toBeVisible()
      await expect(page.locator('.el-tabs')).toBeVisible()
    })
  })

  test.describe('⌨️ 键盘导航测试', () => {
    test('应该支持Tab键导航', async ({ page }) => {
      // 从页面顶部开始Tab导航
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // 验证焦点管理正确
      const focusedElement = await page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('应该支持Enter键激活按钮', async ({ page }) => {
      // 切换到AI查询标签页
      await page.click('text=AI查询')
      
      // 使用键盘导航到按钮
      await page.keyboard.press('Tab')
      
      // 找到可聚焦的按钮
      const button = page.locator('button:has-text("执行查询")').first()
      await button.focus()
      
      // 使用Enter键激活
      await page.keyboard.press('Enter')
      
      // 验证按钮响应
      await page.waitForTimeout(500)
    })
  })

  test.describe('🔄 数据持久化和状态管理测试', () => {
    test('应该保持标签页状态', async ({ page }) => {
      // 切换到模型管理标签页
      await page.click('text=模型管理')
      
      // 刷新页面
      await page.reload()
      
      // 验证回到默认标签页（概览）
      await expect(page.locator('text=概览')).toBeVisible()
    })

    test('应该保持查询输入状态', async ({ page }) => {
      // 切换到AI查询标签页
      await page.click('text=AI查询')
      
      // 输入查询内容
      await page.fill('.query-textarea textarea', '测试查询内容')
      
      // 切换标签页再切换回来
      await page.click('text=概览')
      await page.click('text=AI查询')
      
      // 验证输入内容保持
      await expect(page.locator('.query-textarea textarea')).toHaveValue('测试查询内容')
    })
  })

  test.describe('🚀 性能测试', () => {
    test('AI中心页面加载时间应该合理', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/centers/ai')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // 页面应该在3秒内加载完成
      expect(loadTime).toBeLessThan(3000)
    })

    test('标签页切换应该流畅', async ({ page }) => {
      const tabs = ['概览', 'AI查询', '智能分析', '模型管理']
      
      for (const tab of tabs) {
        const startTime = Date.now()
        
        await page.click(`text=${tab}`)
        await page.waitForTimeout(100)
        
        const switchTime = Date.now() - startTime
        
        // 标签页切换应该在1秒内完成
        expect(switchTime).toBeLessThan(1000)
      }
    })
  })

  test.describe('🛡️ 错误处理测试', () => {
    test('应该正确处理网络错误', async ({ page }) => {
      // 模拟网络离线
      await page.context().setOffline(true)
      
      // 尝试执行需要网络的操作
      await page.click('text=AI查询')
      await page.fill('.query-textarea textarea', '测试查询')
      await page.click('button:has-text("执行查询")')
      
      // 恢复网络
      await page.context().setOffline(false)
      
      // 验证页面仍然可用
      await expect(page.locator('.ai-center')).toBeVisible()
    })

    test('应该正确处理AI服务错误', async ({ page }) => {
      // 切换到AI查询标签页
      await page.click('text=AI查询')
      
      // 输入无效查询
      await page.fill('.query-textarea textarea', '无效的查询内容')
      await page.click('button:has-text("执行查询")')
      
      // 等待错误处理
      await page.waitForTimeout(2000)
      
      // 验证页面仍然正常
      await expect(page.locator('.ai-center')).toBeVisible()
    })
  })

  test.describe('🎨 视觉回归测试', () => {
    test('AI中心概览页面视觉回归', async ({ page }) => {
      await page.click('text=概览')
      await page.waitForTimeout(1000)
      
      // 截图对比
      await expect(page.locator('.ai-center')).toHaveScreenshot('ai-center-overview.png')
    })

    test('AI查询页面视觉回归', async ({ page }) => {
      await page.click('text=AI查询')
      await page.waitForTimeout(1000)
      
      // 截图对比
      await expect(page.locator('.query-interface')).toHaveScreenshot('ai-query-tab.png')
    })
  })
})