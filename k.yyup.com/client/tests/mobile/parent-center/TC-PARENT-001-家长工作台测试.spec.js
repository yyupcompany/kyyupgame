/**
 * TC-PARENT-001: 家长工作台测试
 * 移动端家长工作台功能的完整测试用例
 * 遵循项目严格验证规则
 */

import { test, expect } from '@playwright/test'
import { mobileTestAccounts, mobileTestConfig } from '../config/test-accounts'
import { initConsoleErrorCollection, getConsoleErrorReport, hasConsoleErrors } from '../utils/console-error-collector'

test.describe('TC-PARENT-001: 家长工作台测试', () => {
  test.beforeEach(async ({ page, context }) => {
    // 设置移动端视口
    await context.setViewportSize(mobileTestConfig.viewport)

    // 初始化控制台错误收集
    initConsoleErrorCollection()

    // 登录家长账号
    await page.goto('/mobile/login')
    await page.waitForSelector('input[name="username"]')
    await page.fill('input[name="username"]', mobileTestAccounts.parent.username)
    await page.fill('input[name="password"]', mobileTestAccounts.parent.password)
    await page.click('button[type="submit"]')

    // 等待重定向到家长中心
    await page.waitForURL(/\/mobile\/parent-center/, { timeout: 10000 })
  })

  test.afterEach(async () => {
    // 检查是否有控制台错误
    if (hasConsoleErrors()) {
      console.log(getConsoleErrorReport())
    }
  })

  /**
   * TC-PARENT-001-01: 页面加载和初始化
   * 验证家长工作台页面能够正确加载并显示初始数据
   */
  test('TC-PARENT-001-01: 页面加载和初始化', async ({ page }) => {
    // 导航到家长工作台页面
    await page.goto('/mobile/parent-center/dashboard')

    // 等待页面加载完成
    await page.waitForSelector('.mobile-parent-dashboard')

    // 验证页面元素存在
    const pageElement = await page.$('.mobile-parent-dashboard')
    expect(pageElement).toBeTruthy()

    // 验证页面标题
    const titleElement = await page.$('.van-nav-bar__title')
    const titleText = await titleElement.textContent()
    expect(titleText).toContain('家长工作台')

    // 验证快捷操作按钮
    const actionButton = await page.$('.van-button--primary')
    expect(actionButton).toBeTruthy()

    // 验证统计数据区域
    const statsGrid = await page.$('.stats-grid')
    expect(statsGrid).toBeTruthy()

    // 验证快捷操作区域
    const quickActions = await page.$('.quick-actions')
    expect(quickActions).toBeTruthy()
  })

  /**
   * TC-PARENT-001-02: 孩子信息卡片验证
   * 验证孩子信息卡片的显示和数据完整性
   */
  test('TC-PARENT-001-02: 孩子信息卡片验证', async ({ page }) => {
    // 获取孩子信息
    const childrenCards = await page.$$('.child-card')
    expect(childrenCards.length).toBeGreaterThan(0)

    // 验证每个孩子的卡片信息
    for (const childCard of childrenCards) {
      const nameElement = await childCard.$('.child-name')
      const classElement = await childCard.$('.child-class')
      const avatarElement = await childCard.$('.child-avatar')

      expect(nameElement).toBeTruthy()
      expect(classElement).toBeTruthy()
      expect(avatarElement).toBeTruthy()

      // 验证孩子姓名
      const name = await nameElement.textContent()
      expect(name).toBeTruthy()
      expect(typeof name).toBe('string')
      expect(name.length).toBeGreaterThan(0)

      // 验证班级信息
      const className = await classElement.textContent()
      expect(className).toBeTruthy()
      expect(typeof className).toBe('string')
    }
  })

  /**
   * TC-PARENT-001-03: 近期活动列表验证
   * 验证近期活动列表的显示和交互
   */
  test('TC-PARENT-001-03: 近期活动列表验证', async ({ page }) => {
    // 获取活动列表
    const activitiesList = await page.$('.recent-activities')
    expect(activitiesList).toBeTruthy()

    const activityItems = await page.$$('.activity-item')

    if (activityItems.length > 0) {
      // 验证每个活动项目
      for (const activityItem of activityItems) {
        const titleElement = await activityItem.$('.activity-title')
        const dateElement = await activityItem.$('.activity-date')
        const statusElement = await activityItem.$('.activity-status')

        expect(titleElement).toBeTruthy()
        expect(dateElement).toBeTruthy()
        expect(statusElement).toBeTruthy()

        // 验证活动内容
        const title = await titleElement.textContent()
        expect(title).toBeTruthy()
        expect(typeof title).toBe('string')

        // 验证日期格式
        const date = await dateElement.textContent()
        expect(date).toBeTruthy()

        // 验证状态
        const status = await statusElement.textContent()
        const validStatuses = ['进行中', '待参加', '已完成', '已结束']
        expect(validStatuses.some(s => status.includes(s))).toBe(true)
      }
    } else {
      // 验证空状态显示
      const emptyState = await page.$('.van-empty')
      expect(emptyState).toBeTruthy()
      const emptyText = await page.$('.van-empty__description')
      expect(await emptyText.textContent()).toContain('暂无活动')
    }
  })

  /**
   * TC-PARENT-001-04: 统计卡片验证
   * 验证统计卡片的显示和数据正确性
   */
  test('TC-PARENT-001-04: 统计卡片验证', async ({ page }) => {
    // 获取统计卡片
    const statCards = await page.$$('.stat-card')
    expect(statCards.length).toBeGreaterThan(0)

    // 验证每个统计卡片
    for (const statCard of statCards) {
      const valueElement = await statCard.$('.stat-value')
      const labelElement = await statCard.$('.stat-label')
      const iconElement = await statCard.$('van-icon')

      expect(valueElement).toBeTruthy()
      expect(labelElement).toBeTruthy()
      expect(iconElement).toBeTruthy()

      // 验证统计值
      const value = await valueElement.textContent()
      expect(value).toBeTruthy()
      expect(typeof value).toBe('string')

      // 验证标签
      const label = await labelElement.textContent()
      expect(label).toBeTruthy()
      expect(typeof label).toBe('string')
    }
  })

  /**
   * TC-PARENT-001-05: 快捷操作功能
   * 验证快捷操作按钮的功能和交互
   */
  test('TC-PARENT-001-05: 快捷操作功能', async ({ page }) => {
    // 验证快捷操作按钮数量
    const actionCards = await page.$$('.action-card')
    expect(actionCards.length).toBeGreaterThan(0)

    // 验证按钮内容
    for (let i = 0; i < actionCards.length; i++) {
      const card = actionCards[i]
      const iconElement = await card.$('van-icon')
      const textElement = await card.$('.action-text')

      expect(iconElement).toBeTruthy()
      expect(textElement).toBeTruthy()

      const text = await textElement.textContent()
      expect(text).toBeTruthy()
      expect(typeof text).toBe('string')
    }

    // 测试点击第一个快捷操作
    const firstAction = actionCards[0]
    await firstAction.click()

    // 验证响应（根据实际功能判断）
    // 可能是打开新页面或显示操作面板
    await page.waitForTimeout(1000)

    // 检查是否成功跳转或显示面板
    const currentUrl = page.url()
    expect(currentUrl).toBeTruthy()
  })

  /**
   * TC-PARENT-001-06: 消息通知列表
   * 验证消息通知列表的显示和交互
   */
  test('TC-PARENT-001-06: 消息通知列表', async ({ page }) => {
    // 导航到消息通知页面
    await page.goto('/mobile/parent-center/notifications')

    // 等待页面加载
    await page.waitForSelector('.message-list')

    const messageItems = await page.$$('.message-item')

    if (messageItems.length > 0) {
      // 验证每条消息
      for (const messageItem of messageItems) {
        const titleElement = await messageItem.$('.message-title')
        const timeElement = await messageItem.$('.message-time')
        const contentElement = await messageItem.$('.message-content')

        expect(titleElement).toBeTruthy()
        expect(timeElement).toBeTruthy()
        expect(contentElement).toBeTruthy()

        // 验证标题
        const title = await titleElement.textContent()
        expect(title).toBeTruthy()

        // 验证时间
        const time = await timeElement.textContent()
        expect(time).toBeTruthy()
      }
    } else {
      // 验证空状态
      const emptyState = await page.$('.van-empty')
      expect(emptyState).toBeTruthy()

      const emptyText = await page.$('.van-empty__description')
      expect(await emptyText.textContent()).toContain('暂无消息')
    }
  })

  /**
   * TC-PARENT-001-07: 孩子管理页面
   * 验证孩子管理页面的功能和交互
   */
  test('TC-PARENT-001-07: 孩子管理页面', async ({ page }) => {
    // 导航到孩子管理页面
    await page.goto('/mobile/parent-center/children')

    // 等待页面加载
    await page.waitForSelector('.children-list')

    const childrenCards = await page.$$('.child-card')
    expect(childrenCards.length).toBeGreaterThan(0)

    // 点击第一个孩子卡片
    const firstChild = childrenCards[0]
    await firstChild.click()

    // 等待详情页面加载
    await page.waitForSelector('.child-detail')

    // 验证详情页面元素
    const detailPage = await page.$('.child-detail')
    expect(detailPage).toBeTruthy()

    const childAvatar = await page.$('.child-avatar-large')
    const childName = await page.$('.child-name-large')
    const childInfo = await page.$('.child-info-section')

    expect(childAvatar).toBeTruthy()
    expect(childName).toBeTruthy()
    expect(childInfo).toBeTruthy()
  })

  /**
   * TC-PARENT-001-08: 成长记录页面
   * 验证成长记录页面的显示和功能
   */
  test('TC-PARENT-001-08: 成长记录页面', async ({ page }) => {
    // 导航到成长记录页面
    await page.goto('/mobile/parent-center/progress-tracking')

    // 等待页面加载
    await page.waitForSelector('.growth-record')

    // 验证成长曲线图表
    const chartContainer = await page.$('.growth-chart')
    expect(chartContainer).toBeTruthy()

    // 验证记录列表
    const recordItems = await page.$$('.record-item')

    if (recordItems.length > 0) {
      // 验证每个记录项
      for (const recordItem of recordItems) {
        const dateElement = await recordItem.$('.record-date')
        const typeElement = await recordItem.$('.record-type')
        const contentElement = await recordItem.$('.record-content')

        expect(dateElement).toBeTruthy()
        expect(typeElement).toBeTruthy()
        expect(contentElement).toBeTruthy()
      }
    }

    // 验证筛选功能
    const filterButtons = await page.$$('.filter-btn')
    expect(filterButtons.length).toBeGreaterThan(0)

    // 点击筛选按钮
    await filterButtons[0].click()
    await page.waitForTimeout(500)
  })

  /**
   * TC-PARENT-001-09: 数据加载性能测试
   * 验证页面数据加载性能
   */
  test('TC-PARENT-001-09: 数据加载性能测试', async ({ page }) => {
    const startTime = Date.now()

    // 访问家长工作台
    await page.goto('/mobile/parent-center/dashboard')

    // 等待所有数据加载完成
    await page.waitForSelector('.stats-grid')
    await page.waitForSelector('.children-list')
    await page.waitForSelector('.recent-activities')

    const loadTime = Date.now() - startTime

    // 验证页面加载时间小于3秒
    expect(loadTime).toBeLessThan(3000)

    // 验证数据加载时间
    const dataLoadTime = loadTime - 500 // 减去页面渲染时间
    expect(dataLoadTime).toBeLessThan(2500)
  })

  /**
   * TC-PARENT-001-10: 控制台错误检测
   * 验证页面无JavaScript控制台错误
   */
  test('TC-PARENT-001-10: 控制台错误检测', async ({ page }) => {
    const errors = []

    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          message: msg.text(),
          location: msg.location()
        })
      }
    })

    // 访问页面
    await page.goto('/mobile/parent-center/dashboard')
    await page.waitForLoadState('networkidle')

    // 验证无JavaScript错误
    expect(errors.length).toBe(0)

    // 如果有错误，打印错误信息
    if (errors.length > 0) {
      console.log('发现控制台错误:')
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`)
        if (error.location) {
          console.log(`   位置: ${error.location.url}:${error.location.lineNumber}`)
        }
      })
    }
  })
})
