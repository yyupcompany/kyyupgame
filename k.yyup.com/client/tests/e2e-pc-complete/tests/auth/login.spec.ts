import { vi } from 'vitest'
/**
 * 登录认证测试
 * 测试所有四个角色的登录功能
 */

import { test, expect } from '@playwright/test'
import { AuthHelpers } from '../../utils/auth-helpers'
import { getTestUser, TEST_USERS } from '../../config/test-users'

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

describe('用户登录认证', () => {
  test.beforeEach(async ({ page }) => {
    // 清除认证状态
    await AuthHelpers.clearAuth(page)
  })

  test.describe('ADMIN管理员登录', () => {
    test('应该能够成功登录', async ({ page }) => {
      const user = getTestUser('admin')

      await AuthHelpers.login(page, 'admin')

      // 验证登录成功
      await expect(page).toHaveURL(/dashboard/)
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-role"]')).toContainText(user.name)
    })

    test('应该能够访问管理员专用页面', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')

      // 测试管理员专用页面访问
      const adminPages = [
        '/user-center',
        '/system-center',
        '/permission-center'
      ]

      for (const pagePath of adminPages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // 确保没有访问被拒绝
        await expect(page.locator('[data-testid="access-denied"]')).not.toBeVisible()
        await expect(page).not.toHaveURL(/login/)
      }
    })

    test('应该拥有正确的权限', async ({ page }) => {
      const { user } = await AuthHelpers.login(page, 'admin')

      // 验证用户权限
      await AuthHelpers.verifyUserPermissions(page, user)
    })
  })

  test.describe('TEACHER教师登录', () => {
    test('应该能够成功登录', async ({ page }) => {
      const user = getTestUser('teacher')

      await AuthHelpers.login(page, 'teacher')

      // 验证登录成功
      await expect(page).toHaveURL(/dashboard/)
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-role"]')).toContainText(user.name)
    })

    test('应该能够访问教师专用页面', async ({ page }) => {
      await AuthHelpers.login(page, 'teacher')

      // 测试教师专用页面访问
      const teacherPages = [
        '/class-center',
        '/student-center',
        '/activity-center'
      ]

      for (const pagePath of teacherPages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // 确保没有访问被拒绝
        await expect(page.locator('[data-testid="access-denied"]')).not.toBeVisible()
        await expect(page).not.toHaveURL(/login/)
      }
    })

    test('应该无法访问管理员页面', async ({ page }) => {
      await AuthHelpers.login(page, 'teacher')

      // 测试应该被拒绝的页面
      const restrictedPages = [
        '/system-center',
        '/permission-center'
      ]

      for (const pagePath of restrictedPages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // 应该被拒绝访问或重定向
        const currentUrl = page.url()
        const isDenied = currentUrl.includes('/403') ||
                        currentUrl.includes('/login') ||
                        await page.locator('[data-testid="access-denied"]').isVisible()

        expect(isDenied).toBeTruthy()
      }
    })
  })

  test.describe('PRINCIPAL园长登录', () => {
    test('应该能够成功登录', async ({ page }) => {
      const user = getTestUser('principal')

      await AuthHelpers.login(page, 'principal')

      // 验证登录成功
      await expect(page).toHaveURL(/dashboard/)
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-role"]')).toContainText(user.name)
    })

    test('应该能够访问园长专用页面', async ({ page }) => {
      await AuthHelpers.login(page, 'principal')

      // 测试园长专用页面访问
      const principalPages = [
        '/enrollment-center',
        '/marketing-center',
        '/report-center'
      ]

      for (const pagePath of principalPages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // 确保没有访问被拒绝
        await expect(page.locator('[data-testid="access-denied"]')).not.toBeVisible()
        await expect(page).not.toHaveURL(/login/)
      }
    })
  })

  test.describe('PARENT家长登录', () => {
    test('应该能够成功登录', async ({ page }) => {
      const user = getTestUser('parent')

      await AuthHelpers.login(page, 'parent')

      // 验证登录成功
      await expect(page).toHaveURL(/dashboard/)
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-role"]')).toContainText(user.name)
    })

    test('应该能够访问家长专用页面', async ({ page }) => {
      await AuthHelpers.login(page, 'parent')

      // 测试家长专用页面访问
      const parentPages = [
        '/parent-center',
        '/parent-center/children',
        '/parent-center/activities'
      ]

      for (const pagePath of parentPages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // 确保没有访问被拒绝
        await expect(page.locator('[data-testid="access-denied"]')).not.toBeVisible()
        await expect(page).not.toHaveURL(/login/)
      }
    })

    test('应该无法访问管理功能页面', async ({ page }) => {
      await AuthHelpers.login(page, 'parent')

      // 测试应该被拒绝的页面
      const restrictedPages = [
        '/user-center',
        '/system-center',
        '/class-center',
        '/enrollment-center'
      ]

      for (const pagePath of restrictedPages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // 应该被拒绝访问或重定向
        const currentUrl = page.url()
        const isDenied = currentUrl.includes('/403') ||
                        currentUrl.includes('/login') ||
                        await page.locator('[data-testid="access-denied"]').isVisible()

        expect(isDenied).toBeTruthy()
      }
    })
  })

  test.describe('登录安全性测试', () => {
    test('应该拒绝错误的用户名', async ({ page }) => {
      await page.goto('/login')

      await page.fill('[data-testid="username-input"]', 'wrong_username')
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password)
      await page.click('[data-testid="login-button"]')

      // 应该显示错误信息
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名或密码错误')
    })

    test('应该拒绝错误的密码', async ({ page }) => {
      await page.goto('/login')

      await page.fill('[data-testid="username-input"]', TEST_USERS.admin.username)
      await page.fill('[data-testid="password-input"]', 'wrong_password')
      await page.click('[data-testid="login-button"]')

      // 应该显示错误信息
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名或密码错误')
    })

    test('应该拒绝空的用户名和密码', async ({ page }) => {
      await page.goto('/login')

      await page.click('[data-testid="login-button"]')

      // 应该显示验证错误
      await expect(page.locator('[data-testid="username-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    })

    test('应该有密码隐藏/显示功能', async ({ page }) => {
      await page.goto('/login')

      const passwordInput = page.locator('[data-testid="password-input"]')
      const toggleButton = page.locator('[data-testid="password-toggle"]')

      await page.fill('[data-testid="username-input"]', TEST_USERS.admin.username)
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password)

      // 默认应该是隐藏的
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // 点击显示密码
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')

      // 再次点击隐藏密码
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  test.describe('会话管理测试', () => {
    test('应该能够正确登出', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')

      // 验证已登录
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()

      // 执行登出
      await AuthHelpers.logout(page)

      // 验证已登出
      await expect(page).toHaveURL(/login/)
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    })

    test('登出后应该无法访问受保护页面', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')
      await AuthHelpers.logout(page)

      // 尝试访问受保护页面
      await page.goto('/dashboard')

      // 应该重定向到登录页面
      await expect(page).toHaveURL(/login/)
    })

    test('应该能够正确切换用户角色', async ({ page }) => {
      // 先以admin身份登录
      await AuthHelpers.login(page, 'admin')
      await expect(page.locator('[data-testid="user-role"]')).toContainText('系统管理员测试')

      // 切换到teacher
      await AuthHelpers.switchUserRole(page, 'admin', 'teacher')
      await expect(page.locator('[data-testid="user-role"]')).toContainText('教师测试')

      // 验证权限变化
      await page.goto('/system-center')
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      const isDenied = currentUrl.includes('/403') ||
                      currentUrl.includes('/login') ||
                      await page.locator('[data-testid="access-denied"]').isVisible()

      expect(isDenied).toBeTruthy()
    })
  })

  test.describe('登录页面UI测试', () => {
    test('应该有完整的登录表单元素', async ({ page }) => {
      await page.goto('/login')

      // 检查所有必要元素
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
      await expect(page.locator('[data-testid="username-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible()

      // 检查标签和占位符
      await expect(page.locator('text=用户名')).toBeVisible()
      await expect(page.locator('text=密码')).toBeVisible()
      await expect(page.locator('[data-testid="login-button"]')).toContainText('登录')
    })

    test('应该支持回车键登录', async ({ page }) => {
      await page.goto('/login')

      await page.fill('[data-testid="username-input"]', TEST_USERS.admin.username)
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password)

      // 在密码框中按回车
      await page.press('[data-testid="password-input"]', 'Enter')

      // 应该能够登录成功
      await expect(page).toHaveURL(/dashboard/)
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
    })

    test('应该有记住我功能', async ({ page }) => {
      await page.goto('/login')

      const rememberCheckbox = page.locator('[data-testid="remember-me"]')
      await expect(rememberCheckbox).toBeVisible()

      // 测试记住我功能
      await rememberCheckbox.check()
      await expect(rememberCheckbox).toBeChecked()
    })
  })
})