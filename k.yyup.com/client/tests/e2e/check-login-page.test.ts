import { test, expect } from '@playwright/test';

test('检查登录页面元素', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  // 等待页面加载完成
  await page.waitForLoadState('networkidle');

  // 等待一段时间让Vue应用渲染完成
  await page.waitForTimeout(5000);

  // 获取页面内容
  const content = await page.content();
  console.log('页面内容:', content.substring(0, 1000));

  // 使用更精确的选择器来避免多个元素匹配的问题
  await expect(page.getByText('系统管理员').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('教师').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('家长').first()).toBeVisible({ timeout: 10000 });
});