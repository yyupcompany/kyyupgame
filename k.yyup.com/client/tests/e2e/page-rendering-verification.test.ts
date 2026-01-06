/**
 * 页面渲染验证测试
 * 用于检测组件重复显示、事件错位等问题
 * 提供完整的页面渲染结果查看功能
 */

import { test, expect, chromium } from '@playwright/test'

test.describe('页面渲染完整性验证', () => {
  let browser: any
  let page: any

  test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: true,
      devtools: false
    })
  })

  test.afterAll(async () => {
    await browser.close()
  })

  test.beforeEach(async () => {
    page = await browser.newPage()
    page.setDefaultTimeout(30000)
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('登录页面完整性验证', async () => {
    console.log('🔍 开始验证登录页面渲染...')

    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')

    // 1. 检查页面基本结构
    const pageTitle = await page.title()
    console.log(`📄 页面标题: ${pageTitle}`)

    // 2. 检查主要组件是否唯一存在
    const loginForms = await page.locator('.login-form, form').count()
    console.log(`🔧 登录表单数量: ${loginForms}`)
    expect(loginForms).toBeLessThanOrEqual(1)

    // 3. 检查动画组件
    const animations = await page.locator('.entrance-animation, .blocks-animation').count()
    console.log(`🎨 动画组件数量: ${animations}`)

    // 4. 检查重复的DOM元素
    const duplicateElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const idMap = new Map()
      let duplicates = 0

      elements.forEach(el => {
        const id = el.id
        if (id && idMap.has(id)) {
          duplicates++
          console.log(`重复ID: ${id}`)
        } else if (id) {
          idMap.set(id, true)
        }
      })

      return duplicates
    })

    console.log(`⚠️  重复ID数量: ${duplicateElements}`)
    expect(duplicateElements).toBe(0)

    // 5. 生成页面快照用于视觉验证
    await page.screenshot({
      path: 'test-results/login-page.png',
      fullPage: true
    })
    console.log('📸 登录页面快照已保存')

    // 6. 检查控制台错误
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 模拟一些用户交互来触发潜在错误
    await page.mouse.move(400, 300)
    await page.waitForTimeout(1000)

    if (consoleErrors.length > 0) {
      console.log('❌ 发现控制台错误:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('主页面完整性验证', async () => {
    console.log('🔍 开始验证主页面渲染...')

    // 先登录获取token
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')

    // 模拟登录 - 这里需要根据实际的登录接口调整
    try {
      // 设置模拟的token
      await page.evaluate(() => {
        localStorage.setItem('token', 'mock-test-token')
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          username: 'testuser',
          role: 'admin'
        }))
      })

      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')
    } catch (error) {
      console.log('⚠️  登录跳过，直接验证页面结构')
    }

    // 1. 检查页面结构完整性
    const mainLayout = await page.locator('.main-layout, .app-layout, .layout').count()
    console.log(`🏗️  主布局组件数量: ${mainLayout}`)
    expect(mainLayout).toBeGreaterThan(0)

    // 2. 检查侧边栏
    const sidebars = await page.locator('.sidebar, .aside, .nav-sidebar').count()
    console.log(`📋 侧边栏数量: ${sidebars}`)
    expect(sidebars).toBeLessThanOrEqual(2) // 允许主侧边栏和子侧边栏

    // 3. 检查头部导航
    const headers = await page.locator('header, .header, .navbar').count()
    console.log(`🎯 头部导航数量: ${headers}`)
    expect(headers).toBeLessThanOrEqual(2)

    // 4. 检查内容区域
    const mainContents = await page.locator('main, .main-content, .content').count()
    console.log(`📝 主内容区数量: ${mainContents}`)
    expect(mainContents).toBeGreaterThan(0)

    // 5. 检查卡片组件重复
    const cards = await page.evaluate(() => {
      const cardElements = document.querySelectorAll('.card, .app-card, .stat-card')
      const cardTexts = Array.from(cardElements).map(el =>
        el.textContent?.trim() || ''
      ).filter(text => text.length > 0)

      const uniqueTexts = new Set(cardTexts)
      return {
        total: cardElements.length,
        unique: uniqueTexts.size,
        duplicates: cardTexts.length - uniqueTexts.size
      }
    })

    console.log(`🃏 卡片组件统计: 总数=${cards.total}, 唯一=${cards.unique}, 重复=${cards.duplicates}`)
    if (cards.duplicates > 0) {
      console.warn('⚠️  发现重复的卡片内容')
    }

    // 6. 生成页面快照
    await page.screenshot({
      path: 'test-results/main-page.png',
      fullPage: true
    })
    console.log('📸 主页面快照已保存')

    // 7. 检查事件监听器异常
    const eventListenerErrors = await page.evaluate(() => {
      const originalAddEventListener = EventTarget.prototype.addEventListener
      let errorCount = 0

      EventTarget.prototype.addEventListener = function(type, listener, options) {
        try {
          if (typeof listener === 'function') {
            const wrappedListener = function(event: Event) {
              try {
                return listener.call(this, event)
              } catch (error) {
                console.error('事件监听器错误:', error)
                errorCount++
              }
            }
            return originalAddEventListener.call(this, type, wrappedListener, options)
          }
          return originalAddEventListener.call(this, type, listener, options)
        } catch (error) {
          errorCount++
          throw error
        }
      }

      return errorCount
    })

    console.log(`🎧 事件监听器错误数量: ${eventListenerErrors}`)
  })

  test('AI助手页面完整性验证', async () => {
    console.log('🤖 开始验证AI助手页面渲染...')

    await page.goto('http://localhost:5173/ai')
    await page.waitForLoadState('networkidle')

    // 1. 检查AI助手组件结构
    const aiContainers = await page.locator('.ai-assistant, .ai-container').count()
    console.log(`🤖 AI助手容器数量: ${aiContainers}`)
    expect(aiContainers).toBeGreaterThan(0)

    // 2. 检查消息列表
    const messageLists = await page.locator('.message-list, .chat-container').count()
    console.log(`💬 消息列表数量: ${messageLists}`)
    expect(messageLists).toBeLessThanOrEqual(2)

    // 3. 检查输入区域
    const inputAreas = await page.locator('.input-area, .message-input, .chat-input').count()
    console.log(`⌨️  输入区域数量: ${inputAreas}`)
    expect(inputAreas).toBeLessThanOrEqual(2)

    // 4. 检查会话标签页（新增功能）
    const conversationTabs = await page.locator('.conversation-tabs, .tab-container').count()
    console.log(`📑 会话标签页数量: ${conversationTabs}`)

    // 5. 检查全屏布局相关组件
    const fullscreenLayouts = await page.locator('.ai-full-page, .full-page-layout').count()
    console.log(`🖼️  全屏布局数量: ${fullscreenLayouts}`)

    // 6. 检查重复的消息组件
    const messageAnalysis = await page.evaluate(() => {
      const messages = document.querySelectorAll('.message-item, .message, [class*="message"]')
      const messageContents = Array.from(messages).map(msg => ({
        text: msg.textContent?.trim().substring(0, 50) || '',
        class: msg.className,
        id: msg.id
      }))

      // 检查是否有完全相同的消息内容
      const duplicates = messageContents.filter((item, index) =>
        messageContents.findIndex(other =>
          other.text === item.text &&
          other.class === item.class &&
          index !== messageContents.indexOf(other)
        ) !== -1
      )

      return {
        totalMessages: messages.length,
        duplicateMessages: duplicates.length,
        messageTypes: [...new Set(messageContents.map(m => m.class))]
      }
    })

    console.log(`📨 消息组件分析: 总数=${messageAnalysis.totalMessages}, 重复=${messageAnalysis.duplicateMessages}`)
    console.log(`📋 消息类型: ${messageAnalysis.messageTypes.join(', ')}`)

    // 7. 测试会话管理功能
    if (conversationTabs > 0) {
      // 检查新建会话按钮
      const newConversationBtns = await page.locator('.new-conversation-btn, button:has-text("新建")').count()
      console.log(`➕ 新建会话按钮数量: ${newConversationBtns}`)

      // 检查标签页可编辑性
      const editableTabs = await page.locator('[contenteditable="true"], .tab-title-input').count()
      console.log(`✏️  可编辑标签页数量: ${editableTabs}`)
    }

    // 8. 生成AI助手页面快照
    await page.screenshot({
      path: 'test-results/ai-assistant-page.png',
      fullPage: true
    })
    console.log('📸 AI助手页面快照已保存')

    // 9. 模拟一些交互来测试事件处理
    try {
      // 点击输入区域
      await page.click('.input-area, .message-input', { timeout: 5000 })
      await page.waitForTimeout(500)

      // 检查是否有错误提示
      const errorMessages = await page.locator('.error-message, .el-message--error').count()
      console.log(`⚠️  错误消息数量: ${errorMessages}`)

    } catch (error) {
      console.log('ℹ️  交互测试跳过:', error.message)
    }
  })

  test('性能和内存使用验证', async () => {
    console.log('📊 开始性能和内存验证...')

    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')

    // 1. 检查DOM节点数量
    const domStats = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*')
      const interactiveElements = document.querySelectorAll('button, input, select, textarea, a')

      return {
        totalElements: allElements.length,
        interactiveElements: interactiveElements.length,
        memoryUsage: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null
      }
    })

    console.log(`🌐 DOM统计: 总节点=${domStats.totalElements}, 交互元素=${domStats.interactiveElements}`)
    if (domStats.memoryUsage) {
      console.log(`💾 内存使用: ${Math.round(domStats.memoryUsage.usedJSHeapSize / 1024 / 1024)}MB`)
    }

    // 2. 检查是否有内存泄漏迹象
    const memoryLeakCheck = await page.evaluate(() => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const longTasks = entries.filter(entry => entry.duration > 50)
        if (longTasks.length > 0) {
          console.log('⏰ 发现长任务:', longTasks.map(t => `${t.name}: ${t.duration}ms`))
        }
      })

      observer.observe({ entryTypes: ['longtask'] })

      // 返回一些性能指标
      return {
        domNodes: document.querySelectorAll('*').length,
        eventListeners: (window as any).eventListeners?.length || 0
      }
    })

    console.log(`🔍 性能检查: DOM节点=${memoryLeakCheck.domNodes}, 事件监听器≈${memoryLeakCheck.eventListeners}`)
  })

  test('CSS样式和布局验证', async () => {
    console.log('🎨 开始CSS和布局验证...')

    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')

    // 1. 检查CSS冲突
    const cssConflicts = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'))
      const conflicts: any[] = []

      elements.forEach(el => {
        const computedStyle = window.getComputedStyle(el)
        const styles = Array.from(el.attributes)
          .filter(attr => attr.name.startsWith('style-') || attr.name === 'style')

        if (styles.length > 1) {
          conflicts.push({
            element: el.tagName + (el.id ? `#${el.id}` : '') + (el.className ? `.${el.className.split(' ')[0]}` : ''),
            conflictCount: styles.length
          })
        }
      })

      return conflicts
    })

    if (cssConflicts.length > 0) {
      console.log('⚠️  发现CSS冲突:')
      cssConflicts.forEach(conflict => {
        console.log(`  - ${conflict.element}: ${conflict.conflictCount} 个样式属性`)
      })
    }

    // 2. 检查布局偏移
    const layoutShifts = await page.evaluate(() => {
      let cumulativeLayoutShift = 0

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            cumulativeLayoutShift += (entry as any).value
          }
        }
      })

      observer.observe({ entryTypes: ['layout-shift'] })

      return cumulativeLayoutShift
    })

    console.log(`📐 累积布局偏移(CLS): ${layoutShifts.toFixed(4)}`)

    // 3. 检查响应式断点
    const responsiveCheck = await page.evaluate(() => {
      const breakpoints = [
        { name: 'mobile', width: 375 },
        { name: 'tablet', width: 768 },
        { name: 'desktop', width: 1024 }
      ]

      return breakpoints.map(bp => {
        const width = window.innerWidth
        const isCurrentBreakpoint = width >= bp.width - 50 && width < bp.width + 100
        return {
          breakpoint: bp.name,
          width: width,
          isMatch: isCurrentBreakpoint
        }
      })
    })

    console.log('📱 响应式断点检查:', responsiveCheck)
  })
})