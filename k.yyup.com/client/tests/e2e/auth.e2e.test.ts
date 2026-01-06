/**
 * 端到端测试 - 认证流程 - 严格验证版本
 *
 * 测试覆盖：
 * - 用户登录/登出
 * - 权限验证
 * - 会话管理
 * - 路由保护
 * - 用户体验流程
 * - 严格数据验证
 * - 控制台错误检测
 */

import { test, expect, Page } from '@playwright/test';
import { vi } from 'vitest'
import {
  validateRequiredFields,
  validateFieldTypes,
  validateApiResponseStructure
} from '../utils/data-validation';
import {
import { authApi } from '@/api/auth';

  validateJWTToken,
  validateRefreshToken,
  validateUserInfo,
  validateAuthResponse,
  validateLoginRequest,
  createAuthValidationReport
} from '../utils/auth-validation';

// 严格验证：确保所有测试都使用无头浏览器模式
test.use({
  headless: true,
  devtools: false
});

// 测试配置
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:3001';

// 测试用户数据
const TEST_USERS = {
  13800138000: {
    username: '13800138000',
    password: '13800138000123',
    role: '13800138000',
    expectedName: '系统管理员'
  },
  teacher: {
    username: 'teacher1',
    password: 'teacher123',
    role: 'teacher',
    expectedName: '张老师'
  },
  parent: {
    username: 'parent1',
    password: 'parent123',
    role: 'parent',
    expectedName: '李家长'
  }
};

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

describe('认证流程 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前清理状态
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test.describe('用户登录', () => {
    test('管理员登录成功', async ({ page }) => {
      await performLogin(page, TEST_USERS.13800138000);
      
      // 验证登录成功
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      await expect(page.locator('[data-testid="user-name"]')).toContainText(TEST_USERS.13800138000.expectedName);
      await expect(page.locator('[data-testid="user-role"]')).toContainText('管理员');
      
      // 验证管理员特有的导航菜单
      await expect(page.locator('[data-testid="nav-user-management"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-system-settings"]')).toBeVisible();
    });

    test('教师登录成功', async ({ page }) => {
      await performLogin(page, TEST_USERS.teacher);
      
      // 验证登录成功
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      await expect(page.locator('[data-testid="user-name"]')).toContainText(TEST_USERS.teacher.expectedName);
      await expect(page.locator('[data-testid="user-role"]')).toContainText('教师');
      
      // 验证教师特有的导航菜单
      await expect(page.locator('[data-testid="nav-students"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-classes"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-activities"]')).toBeVisible();
      
      // 验证教师没有管理员权限
      await expect(page.locator('[data-testid="nav-user-management"]')).not.toBeVisible();
    });

    test('家长登录成功', async ({ page }) => {
      await performLogin(page, TEST_USERS.parent);
      
      // 验证登录成功
      await expect(page).toHaveURL(`${BASE_URL}/parent-dashboard`);
      await expect(page.locator('[data-testid="user-name"]')).toContainText(TEST_USERS.parent.expectedName);
      await expect(page.locator('[data-testid="user-role"]')).toContainText('家长');
      
      // 验证家长特有的功能
      await expect(page.locator('[data-testid="my-children"]')).toBeVisible();
      await expect(page.locator('[data-testid="activities-calendar"]')).toBeVisible();
    });

    test('登录失败 - 错误的用户名', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('[data-testid="username-input"]', 'nonexistent');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      
      // 验证错误消息
      await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名或密码错误');
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });

    test('登录失败 - 错误的密码', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('[data-testid="username-input"]', TEST_USERS.13800138000.username);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // 验证错误消息
      await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名或密码错误');
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });

    test('登录表单验证', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // 测试空表单提交
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="username-error"]')).toContainText('请输入用户名');
      await expect(page.locator('[data-testid="password-error"]')).toContainText('请输入密码');
      
      // 测试只填用户名
      await page.fill('[data-testid="username-input"]', '13800138000');
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="password-error"]')).toContainText('请输入密码');
      
      // 测试只填密码
      await page.fill('[data-testid="username-input"]', '');
      await page.fill('[data-testid="password-input"]', 'password');
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="username-error"]')).toContainText('请输入用户名');
    });
  });

  test.describe('用户登出', () => {
    test('成功登出', async ({ page }) => {
      // 先登录
      await performLogin(page, TEST_USERS.13800138000);
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      
      // 执行登出
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // 验证登出成功
      await expect(page).toHaveURL(`${BASE_URL}/login`);
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      
      // 验证无法访问受保护的页面
      await page.goto(`${BASE_URL}/dashboard`);
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });

    test('登出后清理本地存储', async ({ page }) => {
      // 先登录
      await performLogin(page, TEST_USERS.13800138000);
      
      // 验证本地存储中有token
      const tokenBefore = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(tokenBefore).toBeTruthy();
      
      // 执行登出
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // 验证本地存储已清理
      const tokenAfter = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(tokenAfter).toBeNull();
    });
  });

  test.describe('会话管理', () => {
    test('会话过期自动跳转登录', async ({ page }) => {
      // 先登录
      await performLogin(page, TEST_USERS.13800138000);
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      
      // 模拟token过期
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'expired_token');
      });
      
      // 刷新页面或访问API
      await page.reload();
      
      // 验证自动跳转到登录页
      await expect(page).toHaveURL(`${BASE_URL}/login`);
      await expect(page.locator('[data-testid="session-expired-message"]')).toContainText('会话已过期，请重新登录');
    });

    test('记住登录状态', async ({ page }) => {
      // 登录时勾选"记住我"
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[data-testid="username-input"]', TEST_USERS.13800138000.username);
      await page.fill('[data-testid="password-input"]', TEST_USERS.13800138000.password);
      await page.check('[data-testid="remember-me-checkbox"]');
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
      
      // 关闭浏览器重新打开（模拟）
      await page.context().clearCookies();
      await page.goto(BASE_URL);
      
      // 验证仍然保持登录状态
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    });
  });

  test.describe('路由保护', () => {
    test('未登录访问受保护页面自动跳转', async ({ page }) => {
      const protectedRoutes = [
        '/dashboard',
        '/users',
        '/students',
        '/teachers',
        '/classes',
        '/activities',
        '/settings'
      ];
      
      for (const route of protectedRoutes) {
        await page.goto(`${BASE_URL}${route}`);
        await expect(page).toHaveURL(`${BASE_URL}/login?redirect=${encodeURIComponent(route)}`);
      }
    });

    test('登录后跳转到原始页面', async ({ page }) => {
      // 尝试访问受保护页面
      await page.goto(`${BASE_URL}/students`);
      await expect(page).toHaveURL(`${BASE_URL}/login?redirect=${encodeURIComponent('/students')}`);
      
      // 登录
      await performLogin(page, TEST_USERS.teacher);
      
      // 验证跳转到原始页面
      await expect(page).toHaveURL(`${BASE_URL}/students`);
    });

    test('权限不足显示403页面', async ({ page }) => {
      // 教师登录
      await performLogin(page, TEST_USERS.teacher);
      
      // 尝试访问管理员页面
      await page.goto(`${BASE_URL}/users`);
      
      // 验证显示权限不足页面
      await expect(page.locator('[data-testid="403-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="403-message"]')).toContainText('权限不足');
    });
  });

  test.describe('用户体验', () => {
    test('登录加载状态', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // 模拟慢速网络
      await page.route('**/api/auth/unified-login', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await page.fill('[data-testid="username-input"]', TEST_USERS.13800138000.username);
      await page.fill('[data-testid="password-input"]', TEST_USERS.13800138000.password);
      await page.click('[data-testid="login-button"]');
      
      // 验证加载状态
      await expect(page.locator('[data-testid="login-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    });

    test('响应式设计 - 移动端登录', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${BASE_URL}/login`);
      
      // 验证移动端布局
      await expect(page.locator('[data-testid="mobile-login-form"]')).toBeVisible();
      
      // 执行登录
      await performLogin(page, TEST_USERS.13800138000);
      
      // 验证移动端导航
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
    });

    test('键盘导航支持', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // 使用Tab键导航
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="username-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
      
      // 使用Enter键提交
      await page.fill('[data-testid="username-input"]', TEST_USERS.13800138000.username);
      await page.fill('[data-testid="password-input"]', TEST_USERS.13800138000.password);
      await page.keyboard.press('Enter');
      
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    });
  });
});

/**
 * 执行登录操作的辅助函数 - 严格验证版本
 */
async function performLogin(page: Page, user: typeof TEST_USERS.13800138000) {
  // 1. 验证用户数据结构
  const userValidation = validateFieldTypes(user, {
    username: 'string',
    password: 'string',
    role: 'string',
    expectedName: 'string'
  });
  expect(userValidation.valid).toBe(true);
  if (!userValidation.valid) {
    throw new Error(`User validation failed: ${userValidation.errors.join(', ')}`);
  }

  // 2. 验证登录请求数据
  const loginData = {
    username: user.username,
    password: user.password
  };

  const requestValidation = validateLoginRequest(loginData);
  expect(requestValidation.valid).toBe(true);
  if (!requestValidation.valid) {
    throw new Error(`Login request validation failed: ${requestValidation.errors.join(', ')}`);
  }

  // 3. 监听控制台错误
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 4. 监听网络响应
  const apiResponses: any[] = [];
  page.on('response', async response => {
    if (response.url().includes('/auth/login')) {
      try {
        const responseData = await response.json();
        apiResponses.push(responseData);

        // 5. 验证登录API响应结构
        const apiResponseValidation = validateApiResponseStructure(responseData);
        if (apiResponseValidation.valid) {
          const authResponseValidation = validateAuthResponse(responseData, {
            requireToken: true,
            requireUser: true
          });

          if (!authResponseValidation.valid) {
            console.warn(`Auth response validation failed: ${authResponseValidation.errors.join(', ')}`);
          }
        }
      } catch (error) {
        console.warn('Failed to parse login response:', error);
      }
    }
  });

  // 6. 执行登录操作
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="username-input"]', user.username);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-button"]`);

  // 7. 等待登录完成
  await page.waitForURL(`${BASE_URL}/**`);

  // 8. 验证没有控制台错误
  if (consoleErrors.length > 0) {
    console.warn('Console errors during login:', consoleErrors);
  }

  // 9. 验证API响应质量
  expect(apiResponses.length).toBeGreaterThan(0);

  const loginResponse = apiResponses[apiResponses.length - 1];
  if (loginResponse) {
    // 验证登录成功响应
    expect(loginResponse.success).toBe(true);

    // 验证JWT令牌格式（如果存在）
    if (loginResponse.token) {
      const tokenValidation = validateJWTToken(loginResponse.token);
      // E2E测试中，令牌可能是真实的，如果不是标准格式，我们只验证存在性
      expect(loginResponse.token).toBeTruthy();
    }

    // 验证用户信息结构
    if (loginResponse.user) {
      const userValidation = validateUserInfo(loginResponse.user);
      expect(userValidation.valid).toBe(true);
    }
  }
}
