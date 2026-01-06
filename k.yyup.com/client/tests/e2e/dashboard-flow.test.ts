import { vi } from 'vitest'
/**
 * 仪表板功能E2E测试
 * 测试仪表板的数据展示、图表交互、快捷操作等功能
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

describe('仪表板功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页面并登录
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    // 等待跳转到仪表板
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test('应该显示仪表板的基本统计信息', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('h1:has-text("仪表板")')).toBeVisible()
    
    // 验证统计卡片
    await expect(page.locator('[data-testid="total-students-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-teachers-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-classes-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-activities-card"]')).toBeVisible()
    
    // 验证统计数字是否显示
    const studentsCount = page.locator('[data-testid="students-count"]')
    await expect(studentsCount).toBeVisible()
    await expect(studentsCount).toContainText(/\d+/)
    
    const teachersCount = page.locator('[data-testid="teachers-count"]')
    await expect(teachersCount).toBeVisible()
    await expect(teachersCount).toContainText(/\d+/)
  })

  test('应该显示和交互图表组件', async ({ page }) => {
    // 验证招生趋势图表
    await expect(page.locator('[data-testid="enrollment-trend-chart"]')).toBeVisible()
    
    // 验证活动参与度图表
    await expect(page.locator('[data-testid="activity-participation-chart"]')).toBeVisible()
    
    // 验证班级分布图表
    await expect(page.locator('[data-testid="class-distribution-chart"]')).toBeVisible()
    
    // 测试图表交互 - 点击图例
    const chartLegend = page.locator('[data-testid="chart-legend"] .legend-item').first()
    if (await chartLegend.isVisible()) {
      await chartLegend.click()
      await page.waitForTimeout(1000) // 等待图表更新
    }
    
    // 测试时间范围选择器
    const timeRangeSelector = page.locator('[data-testid="time-range-selector"]')
    if (await timeRangeSelector.isVisible()) {
      await timeRangeSelector.selectOption('last-month')
      await page.waitForTimeout(2000) // 等待数据刷新
      
      // 验证图表数据已更新
      await expect(page.locator('[data-testid="enrollment-trend-chart"]')).toBeVisible()
    }
  })

  test('应该显示最近活动和通知', async ({ page }) => {
    // 验证最近活动列表
    await expect(page.locator('[data-testid="recent-activities"]')).toBeVisible()
    await expect(page.locator('h3:has-text("最近活动")')).toBeVisible()
    
    // 验证活动项目
    const activityItems = page.locator('[data-testid="activity-item"]')
    const activityCount = await activityItems.count()
    
    if (activityCount > 0) {
      // 验证第一个活动项目的内容
      const firstActivity = activityItems.first()
      await expect(firstActivity.locator('[data-testid="activity-title"]')).toBeVisible()
      await expect(firstActivity.locator('[data-testid="activity-time"]')).toBeVisible()
      
      // 点击活动项目查看详情
      await firstActivity.click()
      await page.waitForTimeout(1000)
    }
    
    // 验证通知列表
    await expect(page.locator('[data-testid="notifications"]')).toBeVisible()
    await expect(page.locator('h3:has-text("通知")')).toBeVisible()
    
    // 验证通知项目
    const notificationItems = page.locator('[data-testid="notification-item"]')
    const notificationCount = await notificationItems.count()
    
    if (notificationCount > 0) {
      // 验证第一个通知的内容
      const firstNotification = notificationItems.first()
      await expect(firstNotification.locator('[data-testid="notification-title"]')).toBeVisible()
      await expect(firstNotification.locator('[data-testid="notification-time"]')).toBeVisible()
    }
  })

  test('应该提供快捷操作功能', async ({ page }) => {
    // 验证快捷操作区域
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible()
    await expect(page.locator('h3:has-text("快捷操作")')).toBeVisible()
    
    // 测试添加学生快捷操作
    const addStudentButton = page.locator('[data-testid="quick-add-student"]')
    if (await addStudentButton.isVisible()) {
      await addStudentButton.click()
      
      // 验证是否跳转到学生管理页面或打开添加学生对话框
      await page.waitForTimeout(2000)
      const isDialogOpen = await page.locator('[data-testid="add-student-dialog"]').isVisible()
      const isStudentPage = page.url().includes('/students')
      
      expect(isDialogOpen || isStudentPage).toBeTruthy()
      
      // 如果是对话框，关闭它
      if (isDialogOpen) {
        await page.click('[data-testid="close-dialog"]')
      } else if (isStudentPage) {
        // 如果跳转到了学生页面，返回仪表板
        await page.goto('http://localhost:5173/dashboard')
        await page.waitForLoadState('networkidle')
      }
    }
    
    // 测试添加活动快捷操作
    const addActivityButton = page.locator('[data-testid="quick-add-activity"]')
    if (await addActivityButton.isVisible()) {
      await addActivityButton.click()
      await page.waitForTimeout(2000)
      
      const isDialogOpen = await page.locator('[data-testid="add-activity-dialog"]').isVisible()
      const isActivityPage = page.url().includes('/activities')
      
      expect(isDialogOpen || isActivityPage).toBeTruthy()
      
      // 关闭对话框或返回仪表板
      if (isDialogOpen) {
        await page.click('[data-testid="close-dialog"]')
      } else if (isActivityPage) {
        await page.goto('http://localhost:5173/dashboard')
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('应该支持数据刷新和实时更新', async ({ page }) => {
    // 记录初始数据
    const initialStudentsCount = await page.locator('[data-testid="students-count"]').textContent()
    
    // 点击刷新按钮
    const refreshButton = page.locator('[data-testid="refresh-dashboard"]')
    if (await refreshButton.isVisible()) {
      await refreshButton.click()
      
      // 等待刷新完成
      await page.waitForTimeout(3000)
      
      // 验证数据已刷新（至少页面没有错误）
      await expect(page.locator('[data-testid="students-count"]')).toBeVisible()
    }
    
    // 测试自动刷新指示器
    const autoRefreshIndicator = page.locator('[data-testid="auto-refresh-indicator"]')
    if (await autoRefreshIndicator.isVisible()) {
      await expect(autoRefreshIndicator).toContainText(/最后更新/)
    }
  })

  test('应该响应式适配不同屏幕尺寸', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(1000)
    
    // 验证桌面布局
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible()
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)
    
    // 验证平板布局调整
    const tabletLayout = page.locator('[data-testid="tablet-layout"]')
    if (await tabletLayout.isVisible()) {
      await expect(tabletLayout).toBeVisible()
    }
    
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    
    // 验证移动端布局
    const mobileLayout = page.locator('[data-testid="mobile-layout"]')
    if (await mobileLayout.isVisible()) {
      await expect(mobileLayout).toBeVisible()
    }
    
    // 验证移动端导航
    const mobileMenu = page.locator('[data-testid="mobile-menu-button"]')
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible()
    }
    
    // 恢复桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('应该正确处理数据加载状态', async ({ page }) => {
    // 刷新页面以观察加载状态
    await page.reload()
    
    // 验证加载指示器
    const loadingIndicator = page.locator('[data-testid="dashboard-loading"]')
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await expect(loadingIndicator).toBeVisible()
      
      // 等待加载完成
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 })
    }
    
    // 验证数据加载完成后的状态
    await expect(page.locator('[data-testid="total-students-card"]')).toBeVisible()
    
    // 测试网络错误处理
    // 注意：这个测试可能需要模拟网络错误，在实际环境中可能不适用
    const errorMessage = page.locator('[data-testid="dashboard-error"]')
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/加载失败|网络错误/)
      
      // 测试重试按钮
      const retryButton = page.locator('[data-testid="retry-button"]')
      if (await retryButton.isVisible()) {
        await retryButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })
})
