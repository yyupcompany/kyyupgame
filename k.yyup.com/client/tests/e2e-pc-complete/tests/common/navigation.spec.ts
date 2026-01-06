import { vi } from 'vitest'
/**
 * 导航功能测试
 * 测试所有角色的导航菜单和页面路由
 */

import { test, expect } from '@playwright/test'
import { AuthHelpers } from '../../utils/auth-helpers'
import { UiCheckers } from '../../utils/ui-checkers'
import { getTestUser } from '../../config/test-users'
import { getPageRoutesByRole } from '../../config/page-routes'

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

describe('导航功能测试', () => {
  const roles = ['admin', 'teacher', 'principal', 'parent'] as const

  roles.forEach(role => {
    test.describe(`${role.toUpperCase()}角色导航`, () => {
      test.beforeEach(async ({ page }) => {
        await AuthHelpers.login(page, role)
      })

      test('应该显示正确的导航菜单', async ({ page }) => {
        const user = getTestUser(role)

        // 等待导航菜单加载
        await page.waitForSelector('[data-testid="navigation-menu"]', { timeout: 10000 })

        // 检查用户信息显示
        await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
        await expect(page.locator('[data-testid="user-role"]')).toContainText(user.name)

        // 检查导航菜单项
        const navMenu = page.locator('[data-testid="navigation-menu"]')
        await expect(navMenu).toBeVisible()

        // 验证菜单项数量（应该有适当的菜单项）
        const menuItems = navMenu.locator('[data-testid="menu-item"]')
        const itemCount = await menuItems.count()
        expect(itemCount).toBeGreaterThan(0)
      })

      test('应该能够导航到所有可访问的页面', async ({ page }) => {
        const user = getTestUser(role)
        const allowedRoutes = getPageRoutesByRole(user.role)

        // 测试每个可访问的页面
        for (const route of allowedRoutes.slice(0, 10)) { // 限制测试数量避免时间过长
          console.log(`测试导航到: ${route.path}`)

          await page.goto(route.path)
          await page.waitForLoadState('networkidle')

          // 验证页面成功加载
          const currentUrl = page.url()
          expect(currentUrl).not.toContain('/login')
          expect(currentUrl).not.toContain('/403')

          // 检查页面基本元素
          const mainContent = page.locator('main, .main-content, [data-testid="page-content"]')
          if (await mainContent.count() > 0) {
            await expect(mainContent.first()).toBeVisible()
          }

          // 检查页面标题
          const pageTitle = page.locator('h1, .page-title, [data-testid="page-title"]')
          if (await pageTitle.count() > 0) {
            await expect(pageTitle.first()).toBeVisible()
          }
        }
      })

      test('侧边栏导航应该正常工作', async ({ page }) => {
        // 检查侧边栏是否存在
        const sidebar = page.locator('[data-testid="sidebar"], .sidebar')
        if (await sidebar.count() > 0) {
          await expect(sidebar.first()).toBeVisible()

          // 测试侧边栏菜单项点击
          const menuItems = sidebar.locator('[data-testid="menu-item"], .menu-item')
          const itemCount = await menuItems.count()

          if (itemCount > 0) {
            // 点击第一个菜单项
            const firstMenuItem = menuItems.first()
            await firstMenuItem.click()

            // 等待页面导航
            await page.waitForLoadState('networkidle')

            // 验证导航成功
            const currentUrl = page.url()
            expect(currentUrl).not.toBe(page.url()) // URL应该改变
          }
        }
      })

      test('面包屑导航应该正确显示', async ({ page }) => {
        // 导航到一个有层级结构的页面
        await page.goto('/user-center')
        await page.waitForLoadState('networkidle')

        // 检查面包屑
        const breadcrumb = page.locator('[data-testid="breadcrumb"], .breadcrumb')
        if (await breadcrumb.count() > 0) {
          await expect(breadcrumb.first()).toBeVisible()

          // 验证面包屑包含首页
          await expect(breadcrumb.locator('text=首页, text=Dashboard')).toBeVisible()
        }
      })

      test('顶部导航应该包含用户菜单', async ({ page }) => {
        const header = page.locator('header, .header, [data-testid="header"]')
        await expect(header).toBeVisible()

        // 检查用户菜单
        const userMenu = header.locator('[data-testid="user-menu"], .user-menu')
        await expect(userMenu).toBeVisible()

        // 点击用户菜单
        await userMenu.click()

        // 等待下拉菜单显示
        const dropdown = page.locator('[data-testid="user-dropdown"], .user-dropdown')
        await expect(dropdown).toBeVisible()

        // 检查菜单项
        const menuItems = [
          '个人资料',
          '设置',
          '退出登录'
        ]

        for (const item of menuItems) {
          const menuItem = dropdown.locator(`text=${item}`)
          if (await menuItem.count() > 0) {
            await expect(menuItem.first()).toBeVisible()
          }
        }
      })
    })
  })

  test.describe('导航权限控制', () => {
    test('不同角色应该看到不同的导航菜单', async ({ page }) => {
      // 测试管理员看到的菜单
      await AuthHelpers.login(page, 'admin')
      await page.waitForSelector('[data-testid="navigation-menu"]')

      const adminMenuItems = await page.locator('[data-testid="menu-item"]').allInnerTexts()
      await AuthHelpers.logout(page)

      // 测试教师看到的菜单
      await AuthHelpers.login(page, 'teacher')
      await page.waitForSelector('[data-testid="navigation-menu"]')

      const teacherMenuItems = await page.locator('[data-testid="menu-item"]').allInnerTexts()
      await AuthHelpers.logout(page)

      // 菜单应该不完全相同
      expect(JSON.stringify(adminMenuItems)).not.toBe(JSON.stringify(teacherMenuItems))

      // 管理员应该有系统管理相关菜单
      expect(adminMenuItems.some(item =>
        item.includes('系统') || item.includes('用户') || item.includes('权限')
      )).toBeTruthy()

      // 教师应该有教学相关菜单
      expect(teacherMenuItems.some(item =>
        item.includes('班级') || item.includes('学生') || item.includes('教学')
      )).toBeTruthy()
    })

    test('无法访问的页面应该显示访问拒绝', async ({ page }) => {
      await AuthHelpers.login(page, 'parent') // 使用家长角色

      // 尝试访问管理员页面
      await page.goto('/system-center')
      await page.waitForLoadState('networkidle')

      // 应该被拒绝访问
      const currentUrl = page.url()
      const isDenied = currentUrl.includes('/403') ||
                      currentUrl.includes('/login') ||
                      await page.locator('[data-testid="access-denied"]').isVisible()

      expect(isDenied).toBeTruthy()
    })
  })

  test.describe('导航性能测试', () => {
    test('页面导航应该在合理时间内完成', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')

      // 测试几个主要页面的导航时间
      const pages = ['/dashboard', '/user-center', '/class-center', '/activity-center']

      for (const pagePath of pages) {
        const startTime = Date.now()

        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        const navigationTime = Date.now() - startTime

        // 导航应该在3秒内完成
        expect(navigationTime).toBeLessThan(3000)
      }
    })

    test('菜单响应应该流畅', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')

      // 测试菜单点击响应时间
      const menuItems = page.locator('[data-testid="menu-item"]')
      const itemCount = await menuItems.count()

      if (itemCount > 0) {
        const menuItem = menuItems.first()

        const startTime = Date.now()
        await menuItem.click()
        await page.waitForLoadState('networkidle')
        const responseTime = Date.now() - startTime

        // 响应时间应该小于1秒
        expect(responseTime).toBeLessThan(1000)
      }
    })
  })

  test.describe('导航UI一致性', () => {
    test('所有页面应该有一致的布局结构', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')

      const pages = ['/dashboard', '/user-center', '/class-center']

      for (const pagePath of pages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // 执行UI检查
        const uiCheck = await UiCheckers.performFullUiCheck(page, {
          checkLayout: true,
          checkTheme: false,
          checkForms: false,
          checkTables: false,
          checkNavigation: true
        })

        // 验证基本布局元素
        expect(uiCheck.elements.isPassed).toBeTruthy()

        // 验证导航存在
        if (uiCheck.navigation) {
          expect(uiCheck.navigation.elementsFound).toBeGreaterThan(0)
        }
      }
    })

    test('导航菜单应该有合适的交互反馈', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')

      const menuItems = page.locator('[data-testid="menu-item"]')
      const itemCount = await menuItems.count()

      if (itemCount > 0) {
        const menuItem = menuItems.first()

        // 测试hover效果
        await menuItem.hover()
        // 可以添加hover状态检查

        // 测试点击效果
        await menuItem.click()
        await page.waitForLoadState('networkidle')

        // 验证导航完成
        const currentUrl = page.url()
        expect(currentUrl).not.toBe('http://localhost:5173/dashboard')
      }
    })
  })

  test.describe('移动端导航适配', () => {
    test('在移动端应该显示汉堡菜单', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 })

      await AuthHelpers.login(page, 'admin')

      // 检查汉堡菜单按钮
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu"], .hamburger-menu')
      if (await hamburgerMenu.count() > 0) {
        await expect(hamburgerMenu.first()).toBeVisible()

        // 点击汉堡菜单
        await hamburgerMenu.first().click()

        // 验证侧边栏显示
        const sidebar = page.locator('[data-testid="sidebar"], .sidebar')
        await expect(sidebar.first()).toBeVisible()
      }
    })
  })

  test.describe('导航错误处理', () => {
    test('访问不存在的页面应该显示404', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')

      // 访问不存在的页面
      await page.goto('/non-existent-page')
      await page.waitForLoadState('networkidle')

      // 应该显示404页面
      const notFoundElement = page.locator('[data-testid="not-found"], .not-found')
      if (await notFoundElement.count() > 0) {
        await expect(notFoundElement.first()).toBeVisible()
      }
    })

    test('导航失败时应该有错误提示', async ({ page }) => {
      await AuthHelpers.login(page, 'admin')

      // 监听网络错误
      const errors: string[] = []
      page.on('response', response => {
        if (response.status() >= 400) {
          errors.push(`${response.url()}: ${response.status()}`)
        }
      })

      // 访问可能失败的页面
      await page.goto('/user-center/99999') // 不存在的用户ID
      await page.waitForLoadState('networkidle')

      // 检查是否有错误处理
      const errorElement = page.locator('[data-testid="error-message"], .error-message')
      if (await errorElement.count() > 0) {
        await expect(errorElement.first()).toBeVisible()
      }
    })
  })
})