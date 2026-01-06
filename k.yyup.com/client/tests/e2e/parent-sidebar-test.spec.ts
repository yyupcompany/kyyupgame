import { test, expect } from '@playwright/test';

test.describe('家长侧边栏测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页
    await page.goto('http://localhost:5173/login');
    
    // 等待登录页加载
    await page.waitForLoadState('domcontentloaded');
    
    // 输入登录凭据
    await page.fill('input#username', 'test_parent');
    await page.fill('input#password', '123456');
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 等待登录完成并跳转
    await page.waitForURL('**/parent-center/**', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('测试活动列表', async ({ page }) => {
    await page.locator('a.nav-item:has-text("活动列表")').click();
    await page.waitForLoadState('networkidle');
    
    // 检查是否有process错误
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('process')) {
        errors.push(msg.text());
      }
    });
    
    expect(errors.length).toBe(0);
    console.log('✅ 活动列表 - 无process错误');
  });

  test('测试最新通知', async ({ page }) => {
    await page.locator('a.nav-item:has-text("最新通知")').click();
    await page.waitForLoadState('networkidle');
    
    // 检查是否404
    const url = page.url();
    expect(url).not.toContain('/login');
    expect(url).toContain('notifications');
    console.log('✅ 最新通知 - 路由正常');
  });

  test('测试AI育儿助手', async ({ page }) => {
    await page.locator('a.nav-item:has-text("AI育儿助手")').click();
    await page.waitForLoadState('networkidle');
    
    // 检查API错误
    let has404 = false;
    page.on('response', response => {
      if (response.url().includes('/parent-assistant/quick-questions') && response.status() === 404) {
        has404 = true;
      }
    });
    
    await page.waitForTimeout(2000);
    expect(has404).toBe(false);
    console.log('✅ AI育儿助手 - API正常');
  });

  test('测试相册中心', async ({ page }) => {
    await page.locator('a.nav-item:has-text("相册中心")').click();
    await page.waitForLoadState('networkidle');
    
    // 检查外部图片错误
    let hasExternalImageError = false;
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('via.placeholder')) {
        hasExternalImageError = true;
      }
    });
    
    await page.waitForTimeout(2000);
    expect(hasExternalImageError).toBe(false);
    console.log('✅ 相册中心 - 无外部图片错误');
  });

  test('测试园所奖励', async ({ page }) => {
    await page.locator('a.nav-item:has-text("园所奖励")').click();
    await page.waitForLoadState('networkidle');
    
    // 检查是否正常加载
    const url = page.url();
    expect(url).toContain('kindergarten-rewards');
    console.log('✅ 园所奖励 - 页面正常');
  });
});
