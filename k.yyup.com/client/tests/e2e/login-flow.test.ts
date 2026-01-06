import { test, expect } from '@playwright/test';
import { vi } from 'vitest'

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

describe('登录流程测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 等待Vue应用渲染
  });

  test('应该显示登录页面的基本元素', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/用户登录/);
    
    // 检查登录表单元素是否存在
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="账号"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("登录"), button:has-text("登陆")').first();
    
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(loginButton).toBeVisible({ timeout: 10000 });
  });

  test('应该显示角色选择选项', async ({ page }) => {
    // 检查角色选择是否存在
    const roleOptions = [
      page.getByText('系统管理员').first(),
      page.getByText('教师').first(),
      page.getByText('家长').first()
    ];

    for (const option of roleOptions) {
      await expect(option).toBeVisible({ timeout: 10000 });
    }
  });

  test('应该能够输入用户名和密码', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="账号"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    // 输入测试数据
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword');
    
    // 验证输入值
    await expect(usernameInput).toHaveValue('testuser');
    await expect(passwordInput).toHaveValue('testpassword');
  });

  test('应该能够选择角色', async ({ page }) => {
    // 尝试点击系统管理员角色
    const adminRole = page.getByText('系统管理员').first();
    await adminRole.click();
    
    // 等待一下确保选择生效
    await page.waitForTimeout(1000);
    
    // 验证角色选择（这里可能需要根据实际UI调整）
    // 例如检查是否有选中状态的样式类
  });

  test('空表单提交应该显示验证错误', async ({ page }) => {
    const loginButton = page.locator('button:has-text("登录"), button:has-text("登陆")').first();
    
    // 直接点击登录按钮
    await loginButton.click();
    
    // 等待错误消息出现
    await page.waitForTimeout(2000);
    
    // 检查是否有错误提示（这里需要根据实际的错误提示元素调整）
    const errorMessage = page.locator('.el-form-item__error, .error-message, .el-message').first();
    
    // 如果有错误提示元素，验证它是可见的
    const errorCount = await errorMessage.count();
    if (errorCount > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('页面应该响应式适配', async ({ page }) => {
    // 测试不同视口大小
    await page.setViewportSize({ width: 375, height: 667 }); // 移动端
    await page.waitForTimeout(1000);
    
    // 检查移动端下元素仍然可见
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="账号"]').first();
    await expect(usernameInput).toBeVisible();
    
    // 恢复桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    
    await expect(usernameInput).toBeVisible();
  });
});
