import { test, expect } from '@playwright/test';

test('简单测试 - 验证登录页面', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  
  // 检查页面标题
  await expect(page).toHaveTitle(/幼儿园/);
  
  // 检查登录表单存在
  const usernameInput = page.locator('input[type="text"]').first();
  await expect(usernameInput).toBeVisible();
  
  console.log('✅ 登录页面加载正常');
});

test('简单测试 - 检查API调用', async ({ page }) => {
  const apiErrors: string[] = [];
  
  page.on('response', (response) => {
    if (response.status() === 404) {
      apiErrors.push(`404: ${response.url()}`);
    }
  });
  
  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(2000);
  
  console.log(`API错误数量: ${apiErrors.length}`);
  expect(apiErrors.length).toBe(0);
});
