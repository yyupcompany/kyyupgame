import { test, expect, type Page } from '@playwright/test';

test.describe('中心页面API路径检查', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('活动中心 - 检查API调用', async ({ page }) => {
    const apiErrors: string[] = [];

    page.on('response', (response) => {
      if (response.status() === 404) {
        apiErrors.push(`404: ${response.url()}`);
      }
    });

    await page.goto('http://localhost:5173/centers/ActivityCenter');
    await page.waitForTimeout(3000);

    console.log(`\u2705 活动中心 - API错误: ${apiErrors.length}个`);
    if (apiErrors.length > 0) {
      apiErrors.forEach(err => console.log(`  - ${err}`));
    }

    expect(apiErrors.length).toBe(0);
  });

  test('客户池中心 - 检查API调用', async ({ page }) => {
    const apiErrors: string[] = [];

    page.on('response', (response) => {
      if (response.status() === 404) {
        apiErrors.push(`404: ${response.url()}`);
      }
    });

    await page.goto('http://localhost:5173/centers/CustomerPoolCenter');
    await page.waitForTimeout(3000);

    console.log(`\u2705 客户池中心 - API错误: ${apiErrors.length}个`);
    if (apiErrors.length > 0) {
      apiErrors.forEach(err => console.log(`  - ${err}`));
    }

    expect(apiErrors.length).toBe(0);
  });

  test('任务中心 - 检查API调用', async ({ page }) => {
    const apiErrors: string[] = [];

    page.on('response', (response) => {
      if (response.status() === 404) {
        apiErrors.push(`404: ${response.url()}`);
      }
    });

    await page.goto('http://localhost:5173/centers/TaskCenter');
    await page.waitForTimeout(3000);

    console.log(`\u2705 任务中心 - API错误: ${apiErrors.length}个`);
    if (apiErrors.length > 0) {
      apiErrors.forEach(err => console.log(`  - ${err}`));
    }

    expect(apiErrors.length).toBe(0);
  });
});
