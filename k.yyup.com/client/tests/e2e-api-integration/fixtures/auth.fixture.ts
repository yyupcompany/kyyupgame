import { Page, expect } from '@playwright/test'

/**
 * Authentication Fixture for E2E Tests
 * E2E测试认证夹具类
 */
export class AuthFixture {
  private readonly credentials = {
    admin: {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      expectedPages: ['dashboard', 'users', 'students', 'teachers', 'classes']
    },
    principal: {
      username: 'principal',
      password: 'principal123',
      role: 'principal',
      expectedPages: ['dashboard', 'students', 'teachers', 'classes', 'activities']
    },
    teacher: {
      username: 'teacher',
      password: 'teacher123',
      role: 'teacher',
      expectedPages: ['dashboard', 'students', 'classes', 'activities']
    },
    parent: {
      username: 'parent',
      password: 'parent123',
      role: 'parent',
      expectedPages: ['dashboard', 'students', 'activities']
    }
  }

  /**
   * Login with specific role credentials
   * 使用特定角色凭据登录
   */
  async loginWithRole(page: Page, role: keyof typeof this.credentials, baseURL: string = 'http://localhost:5173') {
    const credential = this.credentials[role]
    if (!credential) {
      throw new Error(`Unknown role: ${role}`)
    }

    console.log(`🔐 Logging in as ${role}...`)

    // Navigate to login page
    await page.goto(`${baseURL}/login`)
    
    // Wait for login form to be visible
    await page.waitForSelector('[data-testid="login-form"], .login-form, form', { timeout: 10000 })

    // Fill login credentials (try multiple selector strategies)
    const usernameSelectors = [
      '[data-testid="username"]',
      'input[name="username"]',
      'input[placeholder*="用户名"]',
      'input[placeholder*="账号"]',
      '.el-input__inner[type="text"]',
      'input[type="text"]'
    ]

    const passwordSelectors = [
      '[data-testid="password"]',
      'input[name="password"]',
      'input[placeholder*="密码"]',
      '.el-input__inner[type="password"]',
      'input[type="password"]'
    ]

    let usernameInput = null
    for (const selector of usernameSelectors) {
      try {
        usernameInput = await page.locator(selector).first()
        if (await usernameInput.isVisible()) break
      } catch (e) {
        continue
      }
    }

    let passwordInput = null
    for (const selector of passwordSelectors) {
      try {
        passwordInput = await page.locator(selector).first()
        if (await passwordInput.isVisible()) break
      } catch (e) {
        continue
      }
    }

    if (!usernameInput || !passwordInput) {
      throw new Error('Could not find username or password input fields')
    }

    // Clear and fill inputs
    await usernameInput.fill('')
    await usernameInput.fill(credential.username)
    await passwordInput.fill('')
    await passwordInput.fill(credential.password)

    // Find and click login button
    const loginButtonSelectors = [
      '[data-testid="login-btn"]',
      'button[type="submit"]',
      'button:has-text("登录")',
      'button:has-text("登入")',
      'button:has-text("Login")',
      '.el-button--primary',
      '.login-btn',
      'button:last-of-type'
    ]

    let loginButton = null
    for (const selector of loginButtonSelectors) {
      try {
        loginButton = await page.locator(selector).first()
        if (await loginButton.isVisible()) break
      } catch (e) {
        continue
      }
    }

    if (!loginButton) {
      throw new Error('Could not find login button')
    }

    await loginButton.click()

    // Wait for navigation to dashboard or home page
    await page.waitForURL(/\/(dashboard|home|main)/, { timeout: 15000 })

    console.log(`✅ Successfully logged in as ${role}`)
  }

  /**
   * Logout from the application
   * 从应用程序登出
   */
  async logout(page: Page) {
    console.log('🚪 Logging out...')

    const logoutSelectors = [
      '[data-testid="logout"]',
      '.logout-btn',
      'button:has-text("退出")',
      'button:has-text("登出")',
      'button:has-text("Logout")',
      '.el-dropdown-menu__item:has-text("退出")'
    ]

    // Try to find user menu first
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '.user-avatar',
      '.user-info',
      '.el-dropdown-trigger'
    ]

    let userMenuFound = false
    for (const selector of userMenuSelectors) {
      try {
        const userMenu = page.locator(selector).first()
        if (await userMenu.isVisible()) {
          await userMenu.click()
          userMenuFound = true
          break
        }
      } catch (e) {
        continue
      }
    }

    // Wait a bit for dropdown to appear
    if (userMenuFound) {
      await page.waitForTimeout(500)
    }

    // Try to click logout
    for (const selector of logoutSelectors) {
      try {
        const logoutBtn = page.locator(selector).first()
        if (await logoutBtn.isVisible()) {
          await logoutBtn.click()
          break
        }
      } catch (e) {
        continue
      }
    }

    // Wait for redirect to login page
    try {
      await page.waitForURL(/\/login/, { timeout: 10000 })
      console.log('✅ Successfully logged out')
    } catch (e) {
      console.warn('⚠️ Logout may not have completed properly')
    }
  }

  /**
   * Check if user is authenticated
   * 检查用户是否已认证
   */
  async isAuthenticated(page: Page): Promise<boolean> {
    try {
      // Check for authenticated state indicators
      const authIndicators = [
        '[data-testid="user-menu"]',
        '.user-avatar',
        '.user-info',
        '.logout-btn'
      ]

      for (const selector of authIndicators) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          return true
        }
      }

      // Check current URL
      const url = page.url()
      return !url.includes('/login')
    } catch (e) {
      return false
    }
  }

  /**
   * Get available user roles
   * 获取可用用户角色
   */
  getAvailableRoles(): string[] {
    return Object.keys(this.credentials)
  }

  /**
   * Get expected pages for a role
   * 获取角色预期可访问的页面
   */
  getExpectedPagesForRole(role: keyof typeof this.credentials): string[] {
    return this.credentials[role]?.expectedPages || []
  }

  /**
   * Verify role permissions
   * 验证角色权限
   */
  async verifyRolePermissions(page: Page, role: keyof typeof this.credentials) {
    const expectedPages = this.getExpectedPagesForRole(role)
    const accessiblePages: string[] = []
    const inaccessiblePages: string[] = []

    for (const pageName of expectedPages) {
      try {
        await page.goto(`${page.url().split('/')[0]}//${page.url().split('/')[2]}/${pageName}`)
        await page.waitForLoadState('networkidle', { timeout: 5000 })
        
        // Check if page loaded successfully (not redirected to login or 403)
        const currentUrl = page.url()
        if (!currentUrl.includes('/login') && !currentUrl.includes('/403')) {
          accessiblePages.push(pageName)
        } else {
          inaccessiblePages.push(pageName)
        }
      } catch (e) {
        inaccessiblePages.push(pageName)
      }
    }

    return {
      accessible: accessiblePages,
      inaccessible: inaccessiblePages,
      accessRate: (accessiblePages.length / expectedPages.length) * 100
    }
  }
}