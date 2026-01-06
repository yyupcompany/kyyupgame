import { test, expect } from '@playwright/test';
import { vi } from 'vitest'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

const TEST_ADMIN = {
  username: 'admin',
  password: 'admin123'
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

describe('简单登录测试', () => {
  test('管理员登录并验证跳转', async ({ page }) => {
    // 访问登录页面
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // 填写登录信息
    await page.fill('[data-testid="username-input"]', TEST_ADMIN.username);
    await page.fill('[data-testid="password-input"]', TEST_ADMIN.password);
    
    // 点击登录按钮
    await page.click('[data-testid="login-button"]');
    
    // 等待登录完成和页面跳转
    await page.waitForTimeout(3000);
    
    // 验证跳转到仪表板
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // 验证页面内容存在
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('综合工作台');
    
    console.log('✅ 管理员登录成功并跳转到仪表板');
  });

  test('教师登录并验证跳转', async ({ page }) => {
    // 访问登录页面
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // 填写教师登录信息
    await page.fill('[data-testid="username-input"]', 'teacher');
    await page.fill('[data-testid="password-input"]', 'teacher123');
    
    // 点击登录按钮
    await page.click('[data-testid="login-button"]');
    
    // 等待登录完成和页面跳转
    await page.waitForTimeout(3000);
    
    // 验证跳转到仪表板（教师现在也跳转到仪表板）
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // 验证页面内容存在
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('综合工作台');
    
    console.log('✅ 教师登录成功并跳转到仪表板');
  });

  test('验证用户信息显示', async ({ page }) => {
    // 登录管理员
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('[data-testid="username-input"]', TEST_ADMIN.username);
    await page.fill('[data-testid="password-input"]', TEST_ADMIN.password);
    await page.click('[data-testid="login-button"]');
    
    // 等待跳转到仪表板
    await page.waitForURL(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);
    
    // 验证用户名显示
    const userNameElement = page.locator('[data-testid="user-name"]');
    await expect(userNameElement).toBeVisible();
    
    // 验证用户角色显示
    const userRoleElement = page.locator('[data-testid="user-role"]');
    await expect(userRoleElement).toBeVisible();
    
    console.log('✅ 用户信息显示验证成功');
  });
});
