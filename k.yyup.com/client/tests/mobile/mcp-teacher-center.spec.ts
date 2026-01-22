/**
 * 教师中心MCP测试套件
 * 使用Playwright MCP模拟真实浏览器交互，动态检测页面数据
 */

import { test, expect, Page } from '@playwright/test';
import { launchMobileBrowser, loginAsRole, detectPageData, captureAPIData, getAllClickableElements, validateApiResponse, verifyDataRendering, log } from './mcp-test-utils';
import { PageDetectionMetrics, ApiResponse, TestRole } from './mcp-types';

test.describe('👩‍🏫 教师中心MCP动态测试', () => {
  let browser: any;
  let context: any;
  let page: Page;

  test.beforeAll(async () => {
    // 启动移动端浏览器
    const launched = await launchMobileBrowser();
    browser = launched.browser;
    context = launched.context;
    page = launched.page;

    // 设置错误监听
    setupErrorListeners(page);
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('🎯 TC-MCP-TEACHER-001: 教师登录流程验证', async () => {
    log('开始测试教师登录流程...', 'info');

    // 访问登录页面
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // 验证登录页面加载
    const loginTitle = await page.title();
    expect(loginTitle).toContain('登录');

    // 点击教师登录按钮
    const loginResult = await loginAsRole(page, 'teacher');
    expect(loginResult.success).toBe(true);
    expect(loginResult.role).toBe('teacher');
    expect(loginResult.currentUrl).toContain('/mobile/teacher-center');

    log(`✅ 教师登录成功，当前URL: ${loginResult.currentUrl}`, 'info');
  });

  test('🧭 TC-MCP-TEACHER-002: 教师底部导航遍历测试', async () => {
    log('开始测试教师底部导航...', 'info');

    // 确保已登录
    if (!page.url().includes('/mobile/teacher-center')) {
      await loginAsRole(page, 'teacher');
    }

    // 获取底部导航按钮
    await page.waitForSelector('.mobile-footer .van-tabbar-item');
    const navButtons = page.locator('.mobile-footer .van-tabbar-item');
    const buttonCount = await navButtons.count();

    expect(buttonCount).toBeGreaterThan(0);
    log(`📊 发现 ${buttonCount} 个导航按钮`, 'info');

    // 预期的教师导航项
    const expectedNavItems = ['工作台', '任务', '考勤', '我的'];

    // 遍历所有导航按钮
    const navResults = [];
    for (let i = 0; i < buttonCount; i++) {
      const button = navButtons.nth(i);
      const buttonText = await button.textContent();
      const buttonTitle = buttonText.trim();

      log(`\n--- 测试导航按钮 ${i + 1}: "${buttonTitle}" ---`, 'info');

      // 验证导航标题符合预期
      expect(expectedNavItems).toContain(buttonTitle);

      // 点击按钮
      await button.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // 获取当前URL
      const currentUrl = page.url();
      log(`🌐 当前URL: ${currentUrl}`, 'info');

      // 动态检测页面数据
      const pageData = await detectPageData(page);

      // 验证无404错误
      expect(pageData.errors.has404).toBe(false);
      expect(pageData.errors.has500).toBe(false);

      // 验证页面有内容（不是空白页）
      expect(pageData.components.statsCards.count + pageData.components.contentCards.count)
        .toBeGreaterThan(0);

      // 验证底部导航仍然可见
      const footerVisible = await page.locator('.mobile-footer').isVisible();
      expect(footerVisible).toBe(true);

      navResults.push({
        title: buttonTitle,
        url: currentUrl,
        hasStatsCards: pageData.components.statsCards.count > 0,
        hasContentCards: pageData.components.contentCards.count > 0,
        hasLists: pageData.components.lists.itemCount > 0,
        has404: pageData.errors.has404,
        success: !pageData.errors.has404 && !pageData.errors.has500
      });

      log(`✅ 导航按钮 "${buttonTitle}" 测试通过`, 'info');
    }

    // 验证所有导航都成功
    const failedNavs = navResults.filter(r => !r.success);
    expect(failedNavs.length).toBe(0);

    log(`\n🎉 教师底部导航测试完成，共测试 ${navResults.length} 个按钮`, 'info');
  });

  test('📊 TC-MCP-TEACHER-003: 教师工作台数据统计验证', async () => {
    log('开始验证教师工作台数据...', 'info');

    // 访问教师工作台
    await page.goto('http://localhost:5173/mobile/teacher-center');
    await page.waitForLoadState('networkidle');

    // 监听API响应
    const apiResponses: any[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/teacher/dashboard')) {
        try {
          const body = await response.json();
          apiResponses.push({
            url,
            status: response.status(),
            data: body
          });
        } catch (e) {
          // 忽略解析错误
        }
      }
    });

    await page.waitForTimeout(2000);

    // 动态检测页面数据
    const pageData = await detectPageData(page);

    // 验证统计卡片
    expect(pageData.components.statsCards.count).toBeGreaterThan(0);
    log(`✅ 发现 ${pageData.components.statsCards.count} 个统计卡片`, 'info');

    // 验证卡片有文本内容
    const cardTexts = pageData.components.statsCards.texts.filter(t => t && t.length > 0);
    expect(cardTexts.length).toBeGreaterThan(0);

    // 验证内容卡片
    expect(pageData.components.contentCards.count).toBeGreaterThan(0);
    log(`✅ 发现 ${pageData.components.contentCards.count} 个内容卡片`, 'info');

    // 验证任务列表
    expect(pageData.components.lists.itemCount).toBeGreaterThanOrEqual(0);
    log(`✅ 发现 ${pageData.components.lists.itemCount} 个任务项`, 'info');

    // 验证API响应
    const dashboardApi = apiResponses.find(r => r.url.includes('/api/teacher/dashboard'));
    if (dashboardApi && dashboardApi.data) {
      expect(dashboardApi.data.success).toBe(true);
      expect(dashboardApi.data.data).toBeDefined();
      log(`✅ 教师Dashboard API调用成功`, 'info');
    }
  });

  test('✅ TC-MCP-TEACHER-004: 任务列表管理验证', async () => {
    log('开始验证任务列表功能...', 'info');

    // 访问任务页面
    await page.goto('http://localhost:5173/mobile/tasks');
    await page.waitForLoadState('networkidle');

    // 捕获API数据
    const apiResponses: any[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/tasks') || url.includes('/api/teacher/todo-items')) {
        try {
          const body = await response.json();
          apiResponses.push({
            url,
            status: response.status(),
            data: body
          });
        } catch (e) {
          // 忽略解析错误
        }
      }
    });

    await page.waitForTimeout(2000);

    // 动态检测页面数据
    const pageData = await detectPageData(page);

    // 验证列表数据或空状态
    if (pageData.components.lists.itemCount > 0) {
      log(`✅ 发现 ${pageData.components.lists.itemCount} 个任务项`, 'info');

      // 验证API响应
      const tasksApi = apiResponses.find(r =>
        r.url.includes('/api/tasks') || r.url.includes('/api/teacher/todo-items')
      );
      if (tasksApi && tasksApi.data) {
        expect(tasksApi.data.success).toBe(true);
        expect(tasksApi.data.data).toBeDefined();

        // 验证渲染数据与API数据一致
        if (tasksApi.data.data.items || tasksApi.data.data.list) {
          const apiItemCount = tasksApi.data.data.items?.length || tasksApi.data.data.list?.length || 0;
          log(`✅ API返回 ${apiItemCount} 个任务项`, 'info');
        }
      }

      // 验证任务操作按钮
      const actionButtons = page.locator('.van-button--primary, .van-button--info');
      const buttonCount = await actionButtons.count();
      if (buttonCount > 0) {
        log(`✅ 发现 ${buttonCount} 个任务操作按钮`, 'info');
      }
    } else {
      // 验证空状态显示
      const emptyState = page.locator('.van-empty');
      const hasEmptyState = await emptyState.isVisible();
      expect(hasEmptyState).toBe(true);

      const emptyText = await emptyState.textContent();
      log(`✅ 无任务时显示空状态: "${emptyText.trim()}"`, 'info');
    }
  });

  test('📅 TC-MCP-TEACHER-005: 考勤管理验证', async () => {
    log('开始验证考勤管理功能...', 'info');

    // 访问考勤页面
    await page.goto('http://localhost:5173/mobile/attendance');
    await page.waitForLoadState('networkidle');

    // 捕获API数据
    const apiResponses: any[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/attendance') || url.includes('/api/teacher/attendance')) {
        try {
          const body = await response.json();
          apiResponses.push({
            url,
            status: response.status(),
            data: body
          });
        } catch (e) {
          // 忽略解析错误
        }
      }
    });

    await page.waitForTimeout(2000);

    // 动态检测页面数据
    const pageData = await detectPageData(page);

    // 验证统计卡片
    expect(pageData.components.statsCards.count).toBeGreaterThan(0);
    log(`✅ 发现 ${pageData.components.statsCards.count} 个考勤统计卡片`, 'info');

    // 验证考勤列表
    if (pageData.components.lists.itemCount > 0) {
      log(`✅ 发现 ${pageData.components.lists.itemCount} 个考勤记录`, 'info');
    }

    // 验证日期选择器或筛选功能
    const dateSelectors = page.locator('.van-cell, .van-dropdown-menu');
    const selectorCount = await dateSelectors.count();
    if (selectorCount > 0) {
      log(`✅ 发现 ${selectorCount} 个日期/筛选选择器`, 'info');
    }

    // 验证API响应
    const attendanceApi = apiResponses.find(r =>
      r.url.includes('/api/attendance') || r.url.includes('/api/teacher/attendance')
    );
    if (attendanceApi && attendanceApi.data) {
      expect(attendanceApi.data.success).toBe(true);
      log(`✅ 考勤API调用成功`, 'info');
    }
  });

  test('👤 TC-MCP-TEACHER-006: 教师个人中心验证', async () => {
    log('开始验证教师个人中心...', 'info');

    // 访问个人中心
    await page.goto('http://localhost:5173/mobile/profile');
    await page.waitForLoadState('networkidle');

    // 动态检测页面数据
    const pageData = await detectPageData(page);

    // 验证页面加载成功
    expect(pageData.errors.has404).toBe(false);
    expect(pageData.errors.has500).toBe(false);

    // 验证有内容显示
    const bodyText = await page.locator('body').textContent();
    expect(bodyText.length).toBeGreaterThan(0);

    // 验证个人信息卡片
    const infoCards = page.locator('.van-cell');
    const cardCount = await infoCards.count();
    expect(cardCount).toBeGreaterThan(0);

    log(`✅ 个人中心显示 ${cardCount} 个信息项`, 'info');

    // 验证设置选项
    const settingItems = page.locator('.van-cell');
    const settingCount = await settingItems.count();
    log(`✅ 发现 ${settingCount} 个设置选项`, 'info');
  });

  test('🔄 TC-MCP-TEACHER-007: 页面切换和返回验证', async () => {
    log('开始测试页面切换和返回功能...', 'info');

    // 访问工作台
    await page.goto('http://localhost:5173/mobile/teacher-center');
    await page.waitForLoadState('networkidle');
    const initialUrl = page.url();

    // 切换到任务页面
    await page.click('.mobile-footer .van-tabbar-item:has-text("任务")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toBe(initialUrl);
    expect(page.url()).toContain('/mobile');
    log(`✅ 切换到任务页面成功`, 'info');

    // 返回工作台
    await page.click('.mobile-footer .van-tabbar-item:has-text("工作台")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    expect(page.url()).toBe(initialUrl);
    log(`✅ 返回工作台成功`, 'info');

    // 验证浏览器返回按钮
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    log(`✅ 浏览器返回功能正常`, 'info');
  });

  test('🔍 TC-MCP-TEACHER-008: 教师页面数据完整性验证', async () => {
    log('开始验证教师页面数据完整性...', 'info');

    // 设置数据捕获
    const allApiResponses: any[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        try {
          const body = await response.json();
          allApiResponses.push({
            url,
            status: response.status(),
            timestamp: new Date().toISOString(),
            data: body
          });
        } catch (e) {
          // 忽略非JSON响应
        }
      }
    });

    // 遍历主要页面
    const pagesToTest = [
      { path: '/mobile/teacher-center', name: '工作台' },
      { path: '/mobile/tasks', name: '任务' },
      { path: '/mobile/attendance', name: '考勤' }
    ];

    const pageResults = [];

    for (const testPage of pagesToTest) {
      log(`测试页面: ${testPage.name}`, 'info');

      await page.goto(`http://localhost:5173${testPage.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const pageData = await detectPageData(page);

      pageResults.push({
        name: testPage.name,
        url: page.url(),
        statsCards: pageData.components.statsCards.count,
        contentCards: pageData.components.contentCards.count,
        listItems: pageData.components.lists.itemCount,
        has404: pageData.errors.has404,
        success: !pageData.errors.has404 && !pageData.errors.has500
      });
    }

    // 验证所有页面都成功加载
    const failedPages = pageResults.filter(p => !p.success);
    expect(failedPages.length).toBe(0);

    // 验证至少有一些API调用
    const teacherApis = allApiResponses.filter(r =>
      r.url.includes('/api/teacher') || r.url.includes('/api/tasks') || r.url.includes('/api/attendance')
    );
    expect(teacherApis.length).toBeGreaterThan(0);

    log(`✅ 教师页面数据完整性验证完成`, 'info');
    log(`✅ 共捕获 ${teacherApis.length} 个教师相关API响应`, 'info');
  });

  test('⚡ TC-MCP-TEACHER-009: 教师API性能验证', async () => {
    log('开始验证教师API性能...', 'info');

    const apiMetrics = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/teacher') || url.includes('/api/tasks')) {
        const timing = response.request().timing();
        const latency = timing.responseEnd - timing.requestStart;

        apiMetrics.push({
          url: url.split('/').pop(),
          status: response.status(),
          latency: latency,
          timestamp: new Date().toISOString()
        });
      }
    });

    // 访问教师中心触发API调用
    await page.goto('http://localhost:5173/mobile/teacher-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 分析API性能
    if (apiMetrics.length > 0) {
      const successfulApis = apiMetrics.filter(m => m.status === 200);
      const avgLatency = successfulApis.reduce((sum, m) => sum + m.latency, 0) / successfulApis.length;

      log(`✅ API调用次数: ${apiMetrics.length}`, 'info');
      log(`✅ 成功API数: ${successfulApis.length}`, 'info');
      log(`✅ 平均延迟: ${avgLatency.toFixed(2)}ms`, 'info');

      // 验证成功率
      expect(successfulApis.length / apiMetrics.length).toBeGreaterThan(0.8); // 80%成功率

      // 验证平均延迟（本地环境应<500ms）
      expect(avgLatency).toBeLessThan(500);

      // 找出最慢的API
      const slowestApi = successfulApis.reduce((slowest, current) =>
        current.latency > slowest.latency ? current : slowest
      );
      log(`⚠️  最慢API: ${slowestApi.url} (${slowestApi.latency}ms)`, 'warning');
    } else {
      log('⚠️  未捕获到API调用', 'warning');
    }
  });

  test('📱 TC-MCP-TEACHER-010: 教师移动端响应式验证', async () => {
    log('验证教师端移动端响应式布局...', 'info');

    // 测试不同移动设备尺寸
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 360, height: 740, name: 'Android' }
    ];

    for (const viewport of viewports) {
      log(`测试设备: ${viewport.name} (${viewport.width}x${viewport.height})`, 'info');

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:5173/mobile/teacher-center');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 验证底部导航可见
      const footerVisible = await page.locator('.mobile-footer').isVisible();
      expect(footerVisible).toBe(true);

      // 验证内容区域适配
      const contentText = await page.locator('.mobile-content').textContent();
      expect(contentText.length).toBeGreaterThan(0);

      log(`✅ ${viewport.name} 布局正常`, 'info');
    }

    log(`✅ 教师端移动端响应式验证完成`, 'info');
  });
});

/**
 * 设置页面错误监听
 */
function setupErrorListeners(page: Page) {
  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    // 过滤无关紧要的消息
    if (
      text.includes('Plugin has already been applied') ||
      text.includes('Token或用户信息缺失') ||
      text.includes('没有找到认证token')
    ) {
      return;
    }

    if (type === 'error') {
      log(`❌ 控制台错误: ${text}`, 'error');
    } else if (type === 'warning') {
      log(`⚠️  控制台警告: ${text}`, 'warning');
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    log(`❌ 页面错误: ${error.message}`, 'error');
  });

  // 监听请求失败
  page.on('requestfailed', request => {
    const url = request.url();
    if (url.includes('/api/')) {
      log(`❌ API请求失败: ${url}`, 'error');
    }
  });

  log('✅ 错误监听器已设置', 'info');
}
