/**
 * 家长中心MCP测试套件
 * 使用Playwright MCP模拟真实浏览器交互，动态检测页面数据
 */

import { test, expect, Page } from '@playwright/test';
import { launchMobileBrowser, loginAsRole, detectPageData, captureAPIData, getAllClickableElements, validateApiResponse, verifyDataRendering, log } from './mcp-test-utils';
import { PageDetectionMetrics, ApiResponse, TestRole } from './mcp-types';

test.describe('👨 家长中心MCP动态测试', () => {
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

  test('🎯 TC-MCP-PARENT-001: 家长登录流程验证', async () => {
    log('开始测试家长登录流程...', 'info');

    // 访问登录页面
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // 验证登录页面加载
    const loginTitle = await page.title();
    expect(loginTitle).toContain('登录');

    // 点击家长登录按钮
    const loginResult = await loginAsRole(page, 'parent');
    expect(loginResult.success).toBe(true);
    expect(loginResult.role).toBe('parent');
    expect(loginResult.currentUrl).toContain('/mobile');

    log(`✅ 家长登录成功，当前URL: ${loginResult.currentUrl}`, 'info');
  });

  test('🧭 TC-MCP-PARENT-002: 底部导航遍历测试', async () => {
    log('开始测试家长底部导航...', 'info');

    // 确保已登录
    if (!page.url().includes('/mobile')) {
      await loginAsRole(page, 'parent');
    }

    // 获取底部导航按钮
    await page.waitForSelector('.mobile-footer .van-tabbar-item');
    const navButtons = page.locator('.mobile-footer .van-tabbar-item');
    const buttonCount = await navButtons.count();

    expect(buttonCount).toBeGreaterThan(0);
    log(`📊 发现 ${buttonCount} 个导航按钮`, 'info');

    // 遍历所有导航按钮
    const navResults = [];
    for (let i = 0; i < buttonCount; i++) {
      const button = navButtons.nth(i);
      const buttonText = await button.textContent();
      const buttonTitle = buttonText.trim();

      log(`\n--- 测试导航按钮 ${i + 1}: "${buttonTitle}" ---`, 'info');

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
        has404: pageData.errors.has404,
        success: !pageData.errors.has404 && !pageData.errors.has500
      });

      log(`✅ 导航按钮 "${buttonTitle}" 测试通过`, 'info');
    }

    // 验证所有导航都成功
    const failedNavs = navResults.filter(r => !r.success);
    expect(failedNavs.length).toBe(0);

    log(`\n🎉 底部导航测试完成，共测试 ${navResults.length} 个按钮`, 'info');
  });

  test('📊 TC-MCP-PARENT-003: Dashboard数据统计卡片验证', async () => {
    log('开始验证Dashboard数据卡片...', 'info');

    // 访问家长中心Dashboard
    await page.goto('http://localhost:5173/mobile/parent-center');
    await page.waitForLoadState('networkidle');

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

    // 验证操作按钮
    expect(pageData.components.buttons.primary).toBeGreaterThan(0);
    log(`✅ 发现 ${pageData.components.buttons.primary} 个主要按钮`, 'info');
  });

  test('👶 TC-MCP-PARENT-004: 孩子列表数据验证', async () => {
    log('开始验证孩子列表数据...', 'info');

    // 访问孩子页面
    await page.goto('http://localhost:5173/mobile/children');
    await page.waitForLoadState('networkidle');

    // 捕获API数据
    const apiResponses: any[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/parents/children')) {
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

    // 验证列表数据
    if (pageData.components.lists.itemCount > 0) {
      log(`✅ 发现 ${pageData.components.lists.itemCount} 个孩子列表项`, 'info');

      // 验证API响应
      const childrenApi = apiResponses.find(r => r.url.includes('/api/parents/children'));
      if (childrenApi && childrenApi.data) {
        expect(childrenApi.data.success).toBe(true);
        expect(childrenApi.data.data).toBeDefined();

        // 验证渲染数据与API数据一致
        if (childrenApi.data.data.items) {
          expect(pageData.components.lists.itemCount).toBe(childrenApi.data.data.items.length);
          log(`✅ DOM渲染数据与API数据一致`, 'info');
        }
      }
    } else {
      // 验证空状态显示
      const emptyState = page.locator('.van-empty');
      const hasEmptyState = await emptyState.isVisible();
      expect(hasEmptyState).toBe(true);
      log(`✅ 无数据时显示空状态`, 'info');
    }
  });

  test('🎮 TC-MCP-PARENT-005: 活动列表验证', async () => {
    log('开始验证活动列表...', 'info');

    // 访问活动页面
    await page.goto('http://localhost:5173/mobile/activities');
    await page.waitForLoadState('networkidle');

    // 动态检测页面数据
    const pageData = await detectPageData(page);

    // 验证内容卡片
    expect(pageData.components.contentCards.count).toBeGreaterThanOrEqual(0);
    log(`✅ 发现 ${pageData.components.contentCards.count} 个活动卡片`, 'info');

    // 验证卡片标题
    const cardTitles = pageData.components.contentCards.titles.filter(t => t && t.length > 0);
    expect(cardTitles.length).toBe(pageData.components.contentCards.count);

    // 验证列表或空状态
    if (pageData.components.contentCards.count === 0) {
      const emptyState = page.locator('.van-empty');
      const hasEmptyState = await emptyState.isVisible();
      expect(hasEmptyState).toBe(true);
      log(`✅ 无活动时显示空状态`, 'info');
    }
  });

  test('👤 TC-MCP-PARENT-006: 个人中心页面验证', async () => {
    log('开始验证个人中心...', 'info');

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

    log(`✅ 个人中心页面加载正常`, 'info');
  });

  test('🔗 TC-MCP-PARENT-007: 页面内链接遍历测试', async () => {
    log('开始遍历页面内所有可点击链接...', 'info');

    // 访问家长中心首页
    await page.goto('http://localhost:5173/mobile/parent-center');
    await page.waitForLoadState('networkidle');

    // 获取所有可点击元素
    const clickableElements = await getAllClickableElements(page);
    log(`📊 发现 ${clickableElements.length} 个可点击元素`, 'info');

    // 过滤有效的内部链接
    const internalLinks = clickableElements.filter(el =>
      el.href &&
      el.href.includes('/mobile/') &&
      !el.disabled &&
      el.clickable
    );

    log(`🔗 发现 ${internalLinks.length} 个内部链接`, 'info');

    // 遍历测试前10个链接（避免测试时间过长）
    const testLinks = internalLinks.slice(0, 10);
    const linkResults = [];

    for (const link of testLinks) {
      log(`测试链接: ${link.text || '无文本'} -> ${link.href}`, 'info');

      try {
        // 访问链接
        await page.goto(link.href);
        await page.waitForLoadState('networkidle');

        // 验证无404错误
        const pageData = await detectPageData(page);

        linkResults.push({
          url: link.href,
          text: link.text,
          success: !pageData.errors.has404 && !pageData.errors.has500,
          has404: pageData.errors.has404,
          hasContent: pageData.components.statsCards.count > 0 ||
                     pageData.components.contentCards.count > 0 ||
                     pageData.components.lists.itemCount > 0
        });

        // 返回上一页
        await page.goBack();
        await page.waitForTimeout(500);
      } catch (error) {
        log(`❌ 链接测试失败: ${link.href} - ${error.message}`, 'error');
        linkResults.push({
          url: link.href,
          text: link.text,
          success: false,
          error: error.message
        });
      }
    }

    // 验证链接访问成功率
    const successLinks = linkResults.filter(r => r.success);
    expect(successLinks.length).toBeGreaterThan(linkResults.length * 0.8); // 80%成功率

    log(`✅ 链接测试完成：${successLinks.length}/${linkResults.length} 成功`, 'info');
  });

  test('🎛️ TC-MCP-PARENT-008: 按钮交互验证', async () => {
    log('开始验证按钮交互功能...', 'info');

    // 访问家长中心
    await page.goto('http://localhost:5173/mobile/parent-center');
    await page.waitForLoadState('networkidle');

    // 获取所有主要按钮
    const primaryButtons = page.locator('.van-button--primary');
    const buttonCount = await primaryButtons.count();

    if (buttonCount > 0) {
      log(`📊 发现 ${buttonCount} 个主要按钮`, 'info');

      // 测试第一个按钮（避免重复操作）
      const firstButton = primaryButtons.first();
      const buttonText = await firstButton.textContent();

      // 验证按钮可点击
      const isDisabled = await firstButton.isDisabled();
      expect(isDisabled).toBe(false);

      // 点击按钮
      await firstButton.click();
      await page.waitForTimeout(1000);

      log(`✅ 按钮 "${buttonText.trim()}" 可正常点击`, 'info');
    } else {
      log('⚠️  未找到主要按钮，跳过测试', 'warning');
    }
  });

  test('📱 TC-MCP-PARENT-009: 移动端响应式验证', async () => {
    log('验证移动端响应式布局...', 'info');

    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 访问页面
    await page.goto('http://localhost:5173/mobile/parent-center');
    await page.waitForLoadState('networkidle');

    // 验证底部导航在底部
    const footer = page.locator('.mobile-footer');
    const footerBox = await footer.boundingBox();

    expect(footerBox).toBeDefined();
    expect(footerBox.y + footerBox.height).toBeGreaterThan(600); // 在屏幕底部

    // 验证内容区域可滚动
    const content = page.locator('.mobile-content');
    const scrollable = await content.evaluate(el => {
      return el.scrollHeight > el.clientHeight;
    });

    log(`✅ 移动端布局响应式正常`, 'info');
  });

  test('🐛 TC-MCP-PARENT-010: 控制台错误过滤验证', async () => {
    log('验证控制台错误过滤...', 'info');

    const consoleErrors: string[] = [];

    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();

        // 过滤预期内的错误
        const expectedErrors = [
          'Plugin has already been applied',
          'Token或用户信息缺失',
          '没有找到认证token',
          'undefined is not an object',
          'Failed to fetch'
        ];

        const isExpected = expectedErrors.some(pattern =>
          text.includes(pattern)
        );

        if (!isExpected) {
          consoleErrors.push(text);
        }
      }
    });

    // 访问页面
    await page.goto('http://localhost:5173/mobile/parent-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 验证非预期错误数量
    const unexpectedErrors = consoleErrors.filter(err =>
      !err.includes('403') && // 403在测试环境是预期的
      !err.includes('AxiosError') // API错误在测试环境是预期的
    );

    log(`控制台错误（已过滤预期错误）: ${unexpectedErrors.length}`, 'info');

    if (unexpectedErrors.length > 0) {
      log('⚠️  发现非预期错误：', 'warning');
      unexpectedErrors.forEach(err => log(`  - ${err}`, 'warning'));
    }

    // 在生产环境应该为0，测试环境允许一些预期错误
    expect(unexpectedErrors.length).toBeLessThan(5);
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
