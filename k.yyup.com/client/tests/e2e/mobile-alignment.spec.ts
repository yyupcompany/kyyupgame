import { test, expect } from '@playwright/test';

/**
 * 移动端与桌面端对齐测试
 *
 * 测试目标:
 * 1. 验证各角色快捷登录功能
 * 2. 验证新增路由可访问性
 * 3. 检测控制台错误
 * 4. 验证页面正常显示
 */

// 快捷登录账号配置
const ACCOUNTS = {
  admin: { username: 'admin', password: '123456' },
  principal: { username: 'principal', password: '123456' },
  teacher: { username: 'teacher', password: '123456' },
  parent: { username: 'test_parent', password: '123456' }
};

test.describe('移动端对齐测试', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ 控制台错误:', msg.text());
      }
    });
    consoleErrors = [];
  });

  /**
   * 测试用例1: Admin角色登录测试
   */
  test('Admin角色登录和页面访问', async ({ page }) => {
    console.log('📋 测试用例1: Admin角色登录');

    // 访问登录页面
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // 点击Admin快捷登录按钮
    const adminBtn = page.locator('.admin-btn');
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();

    // 等待登录和跳转
    await page.waitForTimeout(3000);

    // 验证登录成功（URL包含/mobile或/centers）
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(mobile|centers)/);

    console.log('✅ Admin登录成功，当前URL:', currentUrl);

    // 检查控制台错误
    expect(consoleErrors.length).toBe(0);
  });

  /**
   * 测试用例2: Principal角色登录测试
   */
  test('Principal角色登录和页面访问', async ({ page }) => {
    console.log('📋 测试用例2: Principal角色登录');

    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const principalBtn = page.locator('.principal-btn');
    await expect(principalBtn).toBeVisible();
    await principalBtn.click();

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(mobile|centers)/);

    console.log('✅ Principal登录成功，当前URL:', currentUrl);

    // 验证可以访问园长中心
    await page.goto('http://localhost:5173/mobile/centers/principal-center');
    await page.waitForTimeout(2000);

    const title = await page.title();
    expect(title).toBeTruthy();

    expect(consoleErrors.length).toBe(0);
  });

  /**
   * 测试用例3: Teacher角色登录测试
   */
  test('Teacher角色登录和页面访问', async ({ page }) => {
    console.log('📋 测试用例3: Teacher角色登录');

    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const teacherBtn = page.locator('.teacher-btn');
    await expect(teacherBtn).toBeVisible();
    await teacherBtn.click();

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(mobile|teacher-center)/);

    console.log('✅ Teacher登录成功，当前URL:', currentUrl);

    expect(consoleErrors.length).toBe(0);
  });

  /**
   * 测试用例4: Parent角色登录测试
   */
  test('Parent角色登录和页面访问', async ({ page }) => {
    console.log('📋 测试用例4: Parent角色登录');

    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const parentBtn = page.locator('.parent-btn');
    await expect(parentBtn).toBeVisible();
    await parentBtn.click();

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(mobile|parent-center)/);

    console.log('✅ Parent登录成功，当前URL:', currentUrl);

    expect(consoleErrors.length).toBe(0);
  });

  /**
   * 测试用例5: 新增路由访问测试
   */
  test('新增路由访问测试', async ({ page }) => {
    console.log('📋 测试用例5: 新增路由访问测试');

    const routes = [
      { path: '/mobile/search', name: '全局搜索' },
      { path: '/mobile/error', name: '错误页面' },
      { path: '/mobile/messages', name: '消息中心' },
      { path: '/mobile/notifications', name: '通知中心' }
    ];

    for (const route of routes) {
      console.log(`🔍 测试路由: ${route.path} (${route.name})`);

      await page.goto(`http://localhost:5173${route.path}`);
      await page.waitForTimeout(2000);

      // 检查是否有严重错误（404, 500等）
      const hasError = consoleErrors.some(err =>
        err.includes('404') || err.includes('500')
      );

      expect(hasError).toBeFalsy();
      console.log(`  ✅ ${route.name} - 可访问`);
    }
  });

  /**
   * 测试用例6: 详情页面路由测试
   */
  test('详情页面路由测试', async ({ page }) => {
    console.log('📋 测试用例6: 详情页面路由测试');

    const detailRoutes = [
      { path: '/mobile/centers/student-center/detail/1', name: '学生详情' },
      { path: '/mobile/centers/personnel-center/teacher/1', name: '教师详情' }
    ];

    for (const route of detailRoutes) {
      console.log(`🔍 测试详情路由: ${route.path} (${route.name})`);

      await page.goto(`http://localhost:5173${route.path}`);
      await page.waitForTimeout(2000);

      // 检查页面是否加载（不是404）
      const content = await page.content();
      const is404 = content.includes('404') || content.includes('Not Found');

      expect(is404).toBeFalsy();
      console.log(`  ✅ ${route.name} - 路由存在`);
    }
  });
});

/**
 * 测试配置
 */
test.use({
  viewport: { width: 375, height: 667 }, // 移动端视口
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
});
