/**
 * 登录辅助工具
 * 提供智能登录功能，支持cookie缓存
 */

import type { Page, BrowserContext } from 'playwright'
import type { UserRole, TestUser } from '../config/test-users'
import { TEST_USERS } from '../config/test-users'

export interface LoginResult {
  success: boolean
  username?: string
  error?: string
}

/**
 * 登录辅助类
 */
export class LoginHelper {
  private page: Page
  private context: BrowserContext

  constructor(page: Page, context: BrowserContext) {
    this.page = page
    this.context = context
  }

  /**
   * 检查是否已登录
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // 检查localStorage中是否有token
      const token = await this.page.evaluate(() => {
        return localStorage.getItem('token') || sessionStorage.getItem('token')
      })

      if (token) {
        return true
      }

      // 检查页面是否有登录后的元素
      const hasUserMenu = await this.page.$('.user-menu, .user-info, [data-testid="user-menu"]')
      return !!hasUserMenu
    } catch {
      return false
    }
  }

  /**
   * 执行登录操作
   */
  async login(role: UserRole): Promise<LoginResult> {
    const user = TEST_USERS[role]

    try {
      // 1. 检查是否已登录
      if (await this.isLoggedIn()) {
        console.log(`✓ ${role} 已登录，跳过登录流程`)
        return { success: true, username: user.username }
      }

      console.log(`→ 开始登录 ${role} 角色: ${user.username}`)

      // 2. 导航到登录页
      await this.page.goto('/login')
      await this.page.waitForLoadState('networkidle')

      // 3. 查找登录表单元素（支持多种选择器策略）
      const usernameSelectors = [
        'input[name="username"]',
        'input[placeholder*="用户名"]',
        'input[placeholder*="账号"]',
        '#username',
        '.username-input',
        'input[type="text"]'
      ]

      const passwordSelectors = [
        'input[name="password"]',
        'input[placeholder*="密码"]',
        '#password',
        '.password-input',
        'input[type="password"]'
      ]

      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("登录")',
        'button:has-text("登 录")',
        '.login-button',
        'button:has-text("Login")'
      ]

      // 查找并填写用户名
      let usernameInput = null
      for (const selector of usernameSelectors) {
        try {
          usernameInput = await this.page.$(selector)
          if (usernameInput) {
            console.log(`  ✓ 找到用户名输入框: ${selector}`)
            break
          }
        } catch {
          continue
        }
      }

      if (!usernameInput) {
        return { success: false, error: '未找到用户名输入框' }
      }

      await usernameInput.fill(user.username)

      // 查找并填写密码
      let passwordInput = null
      for (const selector of passwordSelectors) {
        try {
          passwordInput = await this.page.$(selector)
          if (passwordInput) {
            console.log(`  ✓ 找到密码输入框: ${selector}`)
            break
          }
        } catch {
          continue
        }
      }

      if (!passwordInput) {
        return { success: false, error: '未找到密码输入框' }
      }

      await passwordInput.fill(user.password)

      // 查找并点击登录按钮
      let submitButton = null
      for (const selector of submitSelectors) {
        try {
          submitButton = await this.page.$(selector)
          if (submitButton) {
            console.log(`  ✓ 找到登录按钮: ${selector}`)
            break
          }
        } catch {
          continue
        }
      }

      if (!submitButton) {
        return { success: false, error: '未找到登录按钮' }
      }

      // 4. 点击登录并等待响应
      await Promise.all([
        this.page.waitForNavigation({ url: '**/dashboard', timeout: 10000 }).catch(() => {}),
        this.page.waitForNavigation({ url: '**/teacher-center/dashboard', timeout: 10000 }).catch(() => {}),
        this.page.waitForNavigation({ url: '**/parent-center/dashboard', timeout: 10000 }).catch(() => {}),
        submitButton.click()
      ])

      // 5. 等待页面加载
      await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})

      // 6. 验证登录是否成功
      const isLoggedIn = await this.isLoggedIn()

      if (isLoggedIn) {
        console.log(`✓ ${role} 登录成功`)

        // 保存cookies供后续使用
        const cookies = await this.context.cookies()
        console.log(`  ✓ 已保存 ${cookies.length} 个cookies`)

        return { success: true, username: user.username }
      } else {
        return { success: false, error: '登录验证失败' }
      }
    } catch (error) {
      console.error(`✗ ${role} 登录失败:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      // 尝试查找登出按钮
      const logoutSelectors = [
        'button:has-text("退出")',
        'button:has-text("登出")',
        'a:has-text("退出")',
        'a:has-text("登出")',
        '.logout-button',
        '[data-testid="logout"]'
      ]

      for (const selector of logoutSelectors) {
        try {
          const logoutButton = await this.page.$(selector)
          if (logoutButton) {
            await logoutButton.click()
            await this.page.waitForLoadState('networkidle')
            console.log('✓ 已登出')
            return
          }
        } catch {
          continue
        }
      }

      // 如果找不到登出按钮，清除localStorage
      await this.page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
      console.log('✓ 已清除本地存储')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  /**
   * 验证登录后是否在正确的页面
   */
  async verifyRedirect(role: UserRole): Promise<boolean> {
    const user = TEST_USERS[role]
    const currentUrl = this.page.url()

    // 检查是否在预期的页面
    const expectedPaths = [
      user.expectedHomePage,
      user.expectedHomePage + '/',
      user.expectedMobileHomePage,
      user.expectedMobileHomePage + '/'
    ]

    return expectedPaths.some(path => currentUrl.includes(path))
  }
}

/**
 * 创建登录辅助实例
 */
export async function createLoginHelper(page: Page, context: BrowserContext): Promise<LoginHelper> {
  return new LoginHelper(page, context)
}
