import { test, expect } from '@playwright/test';

test('调试登录页面元素', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  // 等待页面加载完成
  await page.waitForLoadState('networkidle');

  // 等待用户名输入框出现
  await page.waitForSelector('[data-testid="username-input"]', { timeout: 10000 });

  // 检查元素是否存在
  const usernameInput = page.locator('[data-testid="username-input"]');
  const passwordInput = page.locator('[data-testid="password-input"]');
  const loginButton = page.locator('[data-testid="login-button"]');

  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(loginButton).toBeVisible();

  console.log('✅ 找到所有登录页面元素');
});