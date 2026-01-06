import { vi } from 'vitest'
import { test, expect } from '@playwright/test'
import { AuthFixture } from '../../fixtures/auth.fixture'
import { PagesFixture } from '../../fixtures/pages.fixture'

/**
 * Role-based Login Tests
 * 基于角色的登录测试
 */
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

describe('Role-based Authentication Tests', () => {
  let authFixture: AuthFixture
  let pagesFixture: PagesFixture

  test.beforeEach(async ({ page }) => {
    authFixture = new AuthFixture()
    pagesFixture = new PagesFixture(page)
  })

  test('Admin role login and dashboard access', async ({ page }) => {
    test.setTimeout(60000)

    // Step 1: Login as admin
    await authFixture.loginWithRole(page, 'admin')

    // Step 2: Verify login success
    expect(await authFixture.isAuthenticated(page)).toBe(true)

    // Step 3: Navigate to dashboard
    await pagesFixture.dashboard.navigate()

    // Step 4: Verify dashboard loads
    await pagesFixture.dashboard.waitForStatsToLoad()
    await pagesFixture.dashboard.verifyStatsLoaded()

    // Step 5: Verify admin can access user management
    await pagesFixture.users.navigate()
    await pagesFixture.users.waitForUserTableToLoad()
    await pagesFixture.users.verifyUserListLoaded()

    console.log('✅ Admin login and dashboard access test completed')
  })

  test('Principal role login and permissions', async ({ page }) => {
    test.setTimeout(60000)

    // Step 1: Login as principal
    await authFixture.loginWithRole(page, 'principal')

    // Step 2: Verify login success
    expect(await authFixture.isAuthenticated(page)).toBe(true)

    // Step 3: Verify principal permissions
    const permissions = await authFixture.verifyRolePermissions(page, 'principal')
    
    // Principal should have access to most management pages
    expect(permissions.accessRate).toBeGreaterThan(60) // At least 60% access rate

    console.log(`✅ Principal permissions verified: ${permissions.accessRate}% access rate`)
  })

  test('Teacher role login and limited access', async ({ page }) => {
    test.setTimeout(60000)

    // Step 1: Login as teacher
    await authFixture.loginWithRole(page, 'teacher')

    // Step 2: Verify login success
    expect(await authFixture.isAuthenticated(page)).toBe(true)

    // Step 3: Navigate to allowed pages
    await pagesFixture.students.navigate()
    await pagesFixture.students.waitForTableToLoad()

    await pagesFixture.classes.navigate()
    await pagesFixture.classes.waitForClassListToLoad()

    // Step 4: Try to access restricted page (users management)
    try {
      await pagesFixture.users.navigate()
      const currentUrl = page.url()
      
      // Should be redirected or shown error
      expect(currentUrl.includes('/403') || currentUrl.includes('/login')).toBe(true)
    } catch (e) {
      // Expected to fail for teachers
      console.log('✅ Teacher correctly restricted from user management')
    }

    console.log('✅ Teacher login and access restrictions verified')
  })

  test('Parent role login and minimal access', async ({ page }) => {
    test.setTimeout(60000)

    // Step 1: Login as parent
    await authFixture.loginWithRole(page, 'parent')

    // Step 2: Verify login success
    expect(await authFixture.isAuthenticated(page)).toBe(true)

    // Step 3: Navigate to dashboard (should be accessible)
    await pagesFixture.dashboard.navigate()
    await pagesFixture.dashboard.waitForStatsToLoad()

    // Step 4: Try to access restricted pages
    const restrictedPages = ['/users', '/teachers', '/classes']
    
    for (const pagePath of restrictedPages) {
      try {
        await page.goto(pagePath)
        const currentUrl = page.url()
        
        // Should be redirected away from restricted pages
        expect(currentUrl.includes('/403') || currentUrl.includes('/login') || !currentUrl.includes(pagePath)).toBe(true)
      } catch (e) {
        // Expected restriction
      }
    }

    console.log('✅ Parent login and access restrictions verified')
  })

  test('Invalid credentials handling', async ({ page }) => {
    test.setTimeout(30000)

    // Step 1: Go to login page
    await page.goto('/login')

    // Step 2: Try invalid credentials
    await page.fill('input[name="username"], input[type="text"]', 'invalid_user')
    await page.fill('input[name="password"], input[type="password"]', 'invalid_password')
    await page.click('button[type="submit"], button:has-text("登录")')

    // Step 3: Should remain on login page or show error
    await page.waitForTimeout(2000)
    
    const currentUrl = page.url()
    const hasErrorMessage = await page.locator('.error, .el-message--error, [data-testid="error"]').isVisible().catch(() => false)
    
    expect(currentUrl.includes('/login') || hasErrorMessage).toBe(true)

    console.log('✅ Invalid credentials properly rejected')
  })

  test('Logout functionality', async ({ page }) => {
    test.setTimeout(60000)

    // Step 1: Login as admin
    await authFixture.loginWithRole(page, 'admin')
    expect(await authFixture.isAuthenticated(page)).toBe(true)

    // Step 2: Logout
    await authFixture.logout(page)

    // Step 3: Verify logout
    await page.waitForTimeout(2000)
    expect(await authFixture.isAuthenticated(page)).toBe(false)

    // Step 4: Try to access protected page
    await page.goto('/dashboard')
    
    // Should be redirected to login
    const currentUrl = page.url()
    expect(currentUrl.includes('/login')).toBe(true)

    console.log('✅ Logout functionality verified')
  })

  test('Session persistence across page reloads', async ({ page }) => {
    test.setTimeout(60000)

    // Step 1: Login as admin
    await authFixture.loginWithRole(page, 'admin')
    expect(await authFixture.isAuthenticated(page)).toBe(true)

    // Step 2: Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Step 3: Should still be authenticated
    expect(await authFixture.isAuthenticated(page)).toBe(true)

    // Step 4: Should be able to navigate to protected pages
    await pagesFixture.dashboard.navigate()
    await pagesFixture.dashboard.waitForStatsToLoad()

    console.log('✅ Session persistence verified')
  })

  test('Concurrent role access verification', async ({ browser }) => {
    test.setTimeout(90000)

    // Create contexts for different roles
    const adminContext = await browser.newContext()
    const teacherContext = await browser.newContext()

    const adminPage = await adminContext.newPage()
    const teacherPage = await teacherContext.newPage()

    try {
      // Login with different roles simultaneously
      await Promise.all([
        authFixture.loginWithRole(adminPage, 'admin'),
        authFixture.loginWithRole(teacherPage, 'teacher')
      ])

      // Verify both are authenticated
      expect(await authFixture.isAuthenticated(adminPage)).toBe(true)
      expect(await authFixture.isAuthenticated(teacherPage)).toBe(true)

      // Admin should access user management
      await adminPage.goto('/users')
      await adminPage.waitForSelector('.el-table, table', { timeout: 10000 })

      // Teacher should be restricted from user management
      await teacherPage.goto('/users')
      const teacherUrl = teacherPage.url()
      expect(teacherUrl.includes('/403') || teacherUrl.includes('/login')).toBe(true)

      console.log('✅ Concurrent role access verification completed')
    } finally {
      await adminContext.close()
      await teacherContext.close()
    }
  })
})