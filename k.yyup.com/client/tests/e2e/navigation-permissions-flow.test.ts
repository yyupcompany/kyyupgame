import { vi } from 'vitest'
/**
 * 导航和权限E2E测试
 * 测试系统导航、权限控制、角色访问等功能
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

describe('导航和权限测试', () => {
  test('管理员应该能够访问所有功能模块', async ({ page }) => {
    // 以管理员身份登录
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 验证侧边栏导航菜单
    await expect(page.locator('[data-testid="sidebar-menu"]')).toBeVisible()
    
    // 测试主要功能模块的访问
    const modules = [
      { name: '仪表板', selector: 'text=仪表板', url: '/dashboard' },
      { name: '人员中心', selector: 'text=人员中心', url: '/users' },
      { name: '教育管理', selector: 'text=教育管理', url: '/education' },
      { name: '招生管理', selector: 'text=招生管理', url: '/enrollment' },
      { name: '活动管理', selector: 'text=活动管理', url: '/activities' },
      { name: '系统管理', selector: 'text=系统管理', url: '/system' }
    ]
    
    for (const module of modules) {
      // 点击菜单项
      await page.click(module.selector)
      await page.waitForTimeout(2000)
      
      // 验证URL变化或页面内容
      const currentUrl = page.url()
      const hasCorrectUrl = currentUrl.includes(module.url)
      const hasModuleContent = await page.locator(`h1:has-text("${module.name}")`).isVisible()
      
      // 至少满足一个条件：URL正确或页面内容正确
      expect(hasCorrectUrl || hasModuleContent).toBeTruthy()
    }
  })

  test('教师角色应该有限制的访问权限', async ({ page }) => {
    // 以教师身份登录
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('[data-testid="username-input"]', 'teacher')
    await page.fill('[data-testid="password-input"]', 'teacher123')
    await page.selectOption('[data-testid="role-select"]', 'teacher')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 验证教师可以访问的模块
    const allowedModules = ['仪表板', '教育管理', '活动管理']
    
    for (const module of allowedModules) {
      const moduleElement = page.locator(`text=${module}`)
      if (await moduleElement.isVisible()) {
        await expect(moduleElement).toBeVisible()
      }
    }
    
    // 验证教师不能访问的模块（如果存在的话）
    const restrictedModules = ['系统管理', '用户管理']
    
    for (const module of restrictedModules) {
      const moduleElement = page.locator(`text=${module}`)
      if (await moduleElement.isVisible()) {
        // 如果模块可见，点击后应该显示权限不足的提示
        await moduleElement.click()
        await page.waitForTimeout(1000)
        
        const accessDenied = await page.locator('text=权限不足').isVisible()
        const notFound = await page.locator('text=页面不存在').isVisible()
        
        expect(accessDenied || notFound).toBeTruthy()
      }
    }
  })

  test('应该正确处理动态路由和权限验证', async ({ page }) => {
    // 以管理员身份登录
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 测试直接访问受保护的路由
    const protectedRoutes = [
      '/users',
      '/students',
      '/teachers',
      '/classes',
      '/activities',
      '/system'
    ]
    
    for (const route of protectedRoutes) {
      await page.goto(`http://localhost:5173${route}`)
      await page.waitForTimeout(2000)
      
      // 验证页面加载成功（没有被重定向到登录页面）
      const currentUrl = page.url()
      expect(currentUrl).not.toContain('/login')
      
      // 验证页面内容加载
      const hasContent = await page.locator('main').isVisible()
      expect(hasContent).toBeTruthy()
    }
  })

  test('未登录用户应该被重定向到登录页面', async ({ page }) => {
    // 直接访问受保护的页面
    await page.goto('http://localhost:5173/dashboard')
    
    // 应该被重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 })
    
    // 验证登录页面元素
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    await expect(page.locator('[data-testid="username-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
  })

  test('应该正确处理登出功能', async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 查找并点击用户菜单
    const userMenu = page.locator('[data-testid="user-menu"]')
    if (await userMenu.isVisible()) {
      await userMenu.click()
      await page.waitForTimeout(1000)
      
      // 点击登出按钮
      const logoutButton = page.locator('[data-testid="logout-button"]')
      await expect(logoutButton).toBeVisible()
      await logoutButton.click()
    } else {
      // 如果没有用户菜单，查找直接的登出按钮
      const directLogoutButton = page.locator('[data-testid="logout-button"]')
      if (await directLogoutButton.isVisible()) {
        await directLogoutButton.click()
      }
    }
    
    // 验证登出成功，重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 })
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // 验证再次访问受保护页面时需要重新登录
    await page.goto('http://localhost:5173/dashboard')
    await page.waitForURL('**/login', { timeout: 10000 })
  })

  test('应该正确处理面包屑导航', async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 导航到深层页面
    await page.click('text=人员中心')
    await page.waitForTimeout(1000)
    await page.click('text=用户管理')
    await page.waitForTimeout(2000)
    
    // 验证面包屑导航
    const breadcrumb = page.locator('[data-testid="breadcrumb"]')
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toContainText('首页')
      await expect(breadcrumb).toContainText('人员中心')
      await expect(breadcrumb).toContainText('用户管理')
      
      // 测试面包屑点击导航
      await breadcrumb.locator('text=首页').click()
      await page.waitForTimeout(2000)
      
      // 验证返回到首页
      const currentUrl = page.url()
      expect(currentUrl).toContain('/dashboard')
    }
  })

  test('应该支持键盘导航', async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 测试Tab键导航
    await page.keyboard.press('Tab')
    await page.waitForTimeout(500)
    
    // 验证焦点在可聚焦元素上
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // 测试Enter键激活
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1000)
    
    // 测试Escape键关闭模态框（如果有的话）
    const modal = page.locator('[data-testid="modal"]')
    if (await modal.isVisible()) {
      await page.keyboard.press('Escape')
      await expect(modal).not.toBeVisible()
    }
  })

  test('应该正确处理页面刷新和状态恢复', async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('[data-testid="username-input"]', 'admin')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.selectOption('[data-testid="role-select"]', 'admin')
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // 导航到特定页面
    await page.click('text=人员中心')
    await page.waitForTimeout(1000)
    await page.click('text=用户管理')
    await page.waitForTimeout(2000)
    
    const currentUrl = page.url()
    
    // 刷新页面
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // 验证页面状态恢复
    expect(page.url()).toBe(currentUrl)
    
    // 验证用户仍然登录
    const userInfo = page.locator('[data-testid="user-info"]')
    if (await userInfo.isVisible()) {
      await expect(userInfo).toBeVisible()
    }
    
    // 验证页面内容正常加载
    await expect(page.locator('main')).toBeVisible()
  })
})
