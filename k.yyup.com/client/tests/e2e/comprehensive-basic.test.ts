import { test, expect } from '@playwright/test';
import { vi } from 'vitest'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

const TEST_USERS = {
  admin: { username: 'admin', password: 'admin123' },
  teacher: { username: 'teacher', password: 'teacher123' }
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

describe('综合基础功能测试', () => {
  test('完整的管理员登录流程', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // 2. 验证登录页面元素
    await expect(page.locator('[data-testid="username-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    
    // 3. 执行登录
    await page.fill('[data-testid="username-input"]', TEST_USERS.admin.username);
    await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
    await page.click('[data-testid="login-button"]');
    
    // 4. 验证登录成功和跳转
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // 5. 验证用户信息显示
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-role"]')).toBeVisible();
    
    // 6. 验证页面内容
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('综合工作台');
    
    console.log('✅ 管理员完整登录流程测试通过');
  });

  test('完整的教师登录流程', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // 2. 执行教师登录
    await page.fill('[data-testid="username-input"]', TEST_USERS.teacher.username);
    await page.fill('[data-testid="password-input"]', TEST_USERS.teacher.password);
    await page.click('[data-testid="login-button"]');
    
    // 3. 验证登录成功和跳转
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // 4. 验证用户信息显示
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-role"]')).toBeVisible();
    
    console.log('✅ 教师完整登录流程测试通过');
  });

  test('页面导航测试', async ({ page }) => {
    // 先登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username-input"]', TEST_USERS.admin.username);
    await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    // 测试导航到不同页面
    const testPages = [
      { url: '/centers/activity', name: '活动中心' },
      { url: '/centers/teaching', name: '教学中心' },
      { url: '/centers/task', name: '任务中心' }
    ];
    
    for (const testPage of testPages) {
      await page.goto(`${BASE_URL}${testPage.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 验证页面加载成功
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
      expect(pageContent.length).toBeGreaterThan(100);
      
      console.log(`✅ ${testPage.name} 页面导航成功`);
    }
  });

  test('错误处理测试', async ({ page }) => {
    // 访问登录页面
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // 测试错误登录
    await page.fill('[data-testid="username-input"]', 'wronguser');
    await page.fill('[data-testid="password-input"]', 'wrongpass');
    await page.click('[data-testid="login-button"]');
    
    // 等待错误消息出现
    await page.waitForTimeout(2000);
    
    // 验证仍在登录页面
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    // 检查是否有错误消息显示
    const errorElement = page.locator('[data-testid="error-message"]');
    if (await errorElement.isVisible()) {
      console.log('✅ 错误消息显示正常');
    } else {
      console.log('⚠️ 错误消息元素不可见，但登录失败处理正常');
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 访问登录页面
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // 验证移动端登录元素可见
    await expect(page.locator('[data-testid="username-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    
    // 执行登录
    await page.fill('[data-testid="username-input"]', TEST_USERS.admin.username);
    await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
    await page.click('[data-testid="login-button"]');
    
    // 验证移动端登录成功
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    console.log('✅ 移动端响应式设计测试通过');
  });
});
