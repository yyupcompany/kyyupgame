/**
 * 认证辅助函数
 * 提供用户登录、登出、权限验证等功能
 */

import { test, expect, Page } from '@playwright/test'
import { TestUser, getTestUser, hasPermission } from '../config/test-users'

export class AuthHelpers {
  /**
   * 用户登录
   */
  static async login(page: Page, userRole: keyof typeof TEST_USERS, options?: {
    expectSuccess?: boolean
    checkDashboard?: boolean
  }) {
    const { expectSuccess = true, checkDashboard = true } = options || {}
    const user = getTestUser(userRole)

    // 访问登录页面
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // 检查是否已经在登录页面
    const loginForm = page.locator('[data-testid="login-form"]').first()
    await expect(loginForm).toBeVisible({ timeout: 10000 })

    // 填写登录信息
    await page.fill('[data-testid="username-input"]', user.username)
    await page.fill('[data-testid="password-input"]', user.password)

    // 点击登录按钮
    await page.click('[data-testid="login-button"]')

    // 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 15000 })

    if (expectSuccess) {
      // 验证登录成功
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()

      // 检查用户角色显示
      const roleDisplay = page.locator('[data-testid="user-role"]')
      await expect(roleDisplay).toContainText(user.name)

      if (checkDashboard) {
        // 确保仪表板加载
        await page.waitForSelector('[data-testid="dashboard-stats"]', { timeout: 10000 })
        await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible()
      }
    }

    return { user, page }
  }

  /**
   * 用户登出
   */
  static async logout(page: Page) {
    // 点击用户菜单
    await page.click('[data-testid="user-menu"]')

    // 等待菜单显示
    await page.waitForSelector('[data-testid="logout-menu-item"]', { timeout: 5000 })

    // 点击登出
    await page.click('[data-testid="logout-menu-item"]')

    // 等待登出完成，跳转到登录页面
    await page.waitForURL('**/login', { timeout: 10000 })

    // 验证是否回到登录页面
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
  }

  /**
   * 切换用户角色
   */
  static async switchUserRole(page: Page, fromRole: string, toRole: keyof typeof TEST_USERS) {
    // 先登出当前用户
    await this.logout(page)

    // 等待一下确保完全登出
    await page.waitForTimeout(1000)

    // 登录新用户
    return await this.login(page, toRole)
  }

  /**
   * 验证用户权限
   */
  static async verifyUserPermissions(page: Page, user: TestUser) {
    // 检查动态路由权限API
    const permissionsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/dynamic-permissions/user-permissions')
        return await response.json()
      } catch (error) {
        console.error('Failed to fetch user permissions:', error)
        return null
      }
    })

    expect(permissionsResponse).toBeTruthy()
    expect(permissionsResponse.code).toBe(200)
    expect(permissionsResponse.data).toBeDefined()

    // 验证返回的权限包含用户应有的权限
    const userPermissions = permissionsResponse.data.permissions || []
    user.permissions.forEach(permission => {
      expect(userPermissions).toContain(permission)
    })
  }

  /**
   * 验证角色访问权限
   */
  static async verifyRoleAccess(page: Page, user: TestUser, allowedPaths: string[], deniedPaths: string[]) {
    // 验证允许访问的路径
    for (const path of allowedPaths) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // 检查是否成功加载（没有403或重定向到登录页）
      const currentUrl = page.url()
      expect(currentUrl).not.toContain('/login')
      expect(currentUrl).not.toContain('/403')

      // 检查页面内容是否正确加载
      const mainContent = page.locator('main, .main-content, [data-testid="page-content"]')
      if (await mainContent.count() > 0) {
        await expect(mainContent.first()).toBeVisible()
      }
    }

    // 验证拒绝访问的路径
    for (const path of deniedPaths) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // 检查是否被拒绝访问
      const currentUrl = page.url()
      const isDenied = currentUrl.includes('/403') ||
                      currentUrl.includes('/login') ||
                      await page.locator('[data-testid="access-denied"]').isVisible()

      expect(isDenied).toBeTruthy()
    }
  }

  /**
   * 检查认证状态
   */
  static async checkAuthStatus(page: Page): Promise<boolean> {
    try {
      const response = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/auth/profile')
          return response.ok
        } catch {
          return false
        }
      })
      return response
    } catch {
      return false
    }
  }

  /**
   * 刷新认证Token
   */
  static async refreshToken(page: Page): Promise<boolean> {
    try {
      const response = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          return response.ok
        } catch {
          return false
        }
      })
      return response
    } catch {
      return false
    }
  }

  /**
   * 等待认证完成
   */
  static async waitForAuth(page: Page, timeout: number = 15000): Promise<void> {
    await page.waitForFunction(() => {
      return typeof window !== 'undefined' &&
             window.localStorage.getItem('token') !== null
    }, { timeout })

    // 等待一下确保认证状态稳定
    await page.waitForTimeout(1000)
  }

  /**
   * 清除认证状态
   */
  static async clearAuth(page: Page): Promise<void> {
    await page.evaluate(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('token')
        window.localStorage.removeItem('refreshToken')
        window.localStorage.removeItem('user')
      }
    })

    // 清除cookies
    const context = page.context()
    await context.clearCookies()
  }

  /**
   * 检查会话是否过期
   */
  static async isSessionExpired(page: Page): Promise<boolean> {
    const isExpired = await page.evaluate(() => {
      const token = window.localStorage.getItem('token')
      if (!token) return true

      try {
        // 简单的token过期检查（JWT payload解析）
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        return payload.exp < now
      } catch {
        return true
      }
    })

    return isExpired
  }

  /**
   * 自动重新登录
   */
  static async autoRelogin(page: Page, userRole: keyof typeof TEST_USERS): Promise<void> {
    const isAuthenticated = await this.checkAuthStatus(page)

    if (!isAuthenticated) {
      await this.login(page, userRole)
    } else {
      const isExpired = await this.isSessionExpired(page)
      if (isExpired) {
        await this.clearAuth(page)
        await this.login(page, userRole)
      }
    }
  }
}

// 测试装饰器 - 自动处理认证
export function withAuth(userRole: keyof typeof TEST_USERS) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const page: Page = this.page || args[0]

      // 执行原始测试方法
      try {
        // 先登录
        await AuthHelpers.login(page, userRole)

        // 执行测试
        await method.apply(this, args)
      } finally {
        // 清理：登出
        await AuthHelpers.logout(page)
      }
    }

    return descriptor
  }
}

// 测试钩子 - 在每个测试前自动登录
export const setupAuth = (userRole: keyof typeof TEST_USERS) => {
  test.beforeEach(async ({ page }) => {
    await AuthHelpers.login(page, userRole)
  })

  test.afterEach(async ({ page }) => {
    await AuthHelpers.logout(page)
  })
}