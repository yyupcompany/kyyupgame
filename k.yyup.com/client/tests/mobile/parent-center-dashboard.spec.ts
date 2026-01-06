/**
 * 移动端家长中心仪表板测试
 * 测试目标:
 * 1. 验证页面加载和初始化
 * 2. 验证孩子信息卡片
 * 3. 验证统计卡片
 * 4. 验证快捷操作按钮
 * 5. 验证列表组件
 * 6. 验证空状态处理
 * 7. 检测控制台错误
 */

import { test, expect } from '@playwright/test';

// 测试账号配置
const TEST_ACCOUNTS = {
  parent: { username: 'test_parent', password: '123456' }
};

test.describe('移动端-家长中心仪表板', () => {
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeEach(async ({ page }) => {
    // 监听控制台错误和警告
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ 控制台错误:', msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
        console.log('⚠️ 控制台警告:', msg.text());
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.log('❌ 页面错误:', error.message);
    });

    consoleErrors = [];
    consoleWarnings = [];

    // 登录
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // 使用快捷登录
    const parentBtn = page.locator('.parent-btn');
    await expect(parentBtn).toBeVisible({ timeout: 5000 });
    await parentBtn.click();

    // 等待重定向到家长中心
    await page.waitForURL(/\/(mobile|parent-center)/, { timeout: 10000 });
  });

  test.afterEach(async () => {
    // 检查控制台错误
    expect(consoleErrors.length).toBe(0);
  });

  /**
   * 测试用例1: 验证基本页面元素
   */
  test('验证页面基本元素', async ({ page }) => {
    console.log('📋 测试: 验证页面基本元素');

    // 验证页面标题
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log('✅ 页面标题:', title);

    // 验证导航栏
    const navbar = page.locator('.van-nav-bar');
    await expect(navbar).toBeVisible();

    const navTitle = page.locator('.van-nav-bar__title');
    await expect(navTitle).toBeVisible();

    const titleText = await navTitle.textContent();
    console.log('✅ 导航标题:', titleText);

    // 验证底部导航
    const footer = page.locator('.mobile-footer');
    await expect(footer).toBeVisible();
    console.log('✅ 底部导航栏已显示');
  });

  /**
   * 测试用例2: 验证孩子信息卡片
   */
  test('验证孩子信息卡片', async ({ page }) => {
    console.log('📋 测试: 验证孩子信息卡片');

    // 等待孩子卡片加载
    await page.waitForTimeout(2000);

    const childCards = page.locator('.child-card');
    const cardCount = await childCards.count();

    console.log(`✅ 找到 ${cardCount} 个孩子卡片`);

    if (cardCount > 0) {
      // 验证第一个卡片的结构
      const firstCard = childCards.first();

      // 验证头像
      const avatar = firstCard.locator('.child-avatar');
      await expect(avatar).toBeVisible();

      // 验证姓名
      const name = firstCard.locator('.child-name');
      await expect(name).toBeVisible();
      const nameText = await name.textContent();
      expect(nameText).toBeTruthy();
      console.log('✅ 第一个孩子:', nameText);

      // 验证班级
      const classInfo = firstCard.locator('.child-class');
      await expect(classInfo).toBeVisible();

      // 验证点击查看详情
      await firstCard.click();
      await page.waitForTimeout(1000);

      // 应该跳转到详情页或显示详情面板
      console.log('✅ 卡片点击响应正常');

      // 返回上一页
      await page.goBack();
      await page.waitForTimeout(1000);
    } else {
      // 验证空状态
      const emptyState = page.locator('.van-empty');
      await expect(emptyState).toBeVisible();
      console.log('✅ 空状态显示正常');
    }
  });

  /**
   * 测试用例3: 验证统计卡片组件
   */
  test('验证统计卡片组件', async ({ page }) => {
    console.log('📋 测试: 验证统计卡片组件');

    // 等待统计卡片加载
    await page.waitForTimeout(2000);

    const statCards = page.locator('.stat-card');
    const cardCount = await statCards.count();

    console.log(`✅ 找到 ${cardCount} 个统计卡片`);

    if (cardCount > 0) {
      // 验证卡片结构
      for (let i = 0; i < cardCount; i++) {
        const card = statCards.nth(i);

        // 验证数值
        const value = card.locator('.stat-value');
        await expect(value).toBeVisible();

        // 验证标签
        const label = card.locator('.stat-label');
        await expect(label).toBeVisible();

        // 验证图标
        const icon = card.locator('.stat-icon');
        await expect(icon).toBeVisible();
      }

      console.log('✅ 所有统计卡片结构完整');
    }
  });

  /**
   * 测试用例4: 验证快捷操作按钮
   */
  test('验证快捷操作按钮', async ({ page }) => {
    console.log('📋 测试: 验证快捷操作按钮');

    // 找到快捷操作区域
    const quickActions = page.locator('.quick-actions');
    await expect(quickActions).toBeVisible();

    const actionCards = page.locator('.action-card');
    const actionCount = await actionCards.count();

    console.log(`✅ 找到 ${actionCount} 个快捷操作`);

    if (actionCount > 0) {
      // 验证第一个操作的响应
      const firstAction = actionCards.first();
      await expect(firstAction).toBeVisible();

      const actionText = firstAction.locator('.action-text');
      const text = await actionText.textContent();
      console.log('✅ 第一个操作:', text);

      // 验证按钮点击
      const button = firstAction.locator('.van-button');
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(1000);
        console.log('✅ 快捷操作按钮可点击');

        // 返回上一页
        await page.goBack();
      }
    }
  });

  /**
   * 测试用例5: 验证活动列表
   */
  test('验证活动列表组件', async ({ page }) => {
    console.log('📋 测试: 验证活动列表组件');

    // 等待活动列表加载
    await page.waitForTimeout(2000);

    const activitiesList = page.locator('.recent-activities');
    await expect(activitiesList).toBeVisible();

    const activityItems = page.locator('.activity-item');
    const itemCount = await activityItems.count();

    console.log(`✅ 找到 ${itemCount} 个活动项目`);

    if (itemCount > 0) {
      // 验证活动项结构
      const firstItem = activityItems.first();

      // 验证标题
      const title = firstItem.locator('.activity-title');
      await expect(title).toBeVisible();

      // 验证日期
      const date = firstItem.locator('.activity-date');
      await expect(date).toBeVisible();

      // 验证状态
      const status = firstItem.locator('.activity-status');
      await expect(status).toBeVisible();

      console.log('✅ 活动列表结构完整');
    } else {
      // 验证空状态
      const emptyState = activitiesList.locator('.van-empty');
      if (await emptyState.isVisible()) {
        console.log('✅ 活动列表空状态显示正常');
      }
    }
  });

  /**
   * 测试用例6: 导航到孩子管理页面
   */
  test('导航到孩子管理页面', async ({ page }) => {
    console.log('📋 测试: 导航到孩子管理页面');

    // 点击底部导航的"孩子"Tab
    const footerTabs = page.locator('.mobile-footer .van-tab');
    await expect(footerTabs.first()).toBeVisible();

    // 通常第二个是"孩子"Tab
    if (await footerTabs.nth(1).isVisible()) {
      await footerTabs.nth(1).click();
      await page.waitForTimeout(2000);

      // 验证URL包含children
      const url = page.url();
      expect(url).toMatch(/children/);
      console.log('✅ 成功导航到孩子管理页面');

      // 验证页面元素
      const childrenList = page.locator('.children-list');
      if (await childrenList.isVisible()) {
        console.log('✅ 孩子列表已加载');
      }
    }
  });

  /**
   * 测试用例7: 页面性能测试
   */
  test('页面性能测试', async ({ page }) => {
    console.log('📋 测试: 页面性能测试');

    // 测量页面加载时间
    const startTime = Date.now();

    await page.reload();
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`✅ 页面加载时间: ${loadTime}ms`);

    // 验证加载时间小于3秒
    expect(loadTime).toBeLessThan(3000);

    // 测量数据加载时间
    const dataStartTime = Date.now();

    // 等待主要数据加载
    await page.waitForSelector('.stat-card', { timeout: 10000 });

    const dataLoadTime = Date.now() - dataStartTime;
    console.log(`✅ 数据加载时间: ${dataLoadTime}ms`);

    // 验证数据加载时间小于2秒
    expect(dataLoadTime).toBeLessThan(2000);
  });

  /**
   * 测试用例8: 响应式布局测试
   */
  test('响应式布局测试', async ({ page }) => {
    console.log('📋 测试: 响应式布局测试');

    // 测试不同视口大小
    const viewports = [
      { width: 375, height: 667 },  // iPhone SE
      { width: 414, height: 896 },  // iPhone 11
      { width: 390, height: 844 }   // iPhone 12
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      // 验证布局适应
      const dashboard = page.locator('.mobile-parent-dashboard');
      await expect(dashboard).toBeVisible();

      console.log(`✅ 适配视口: ${viewport.width}x${viewport.height}`);
    }
  });
});

/**
 * 测试配置 - 移动端设备
 */
test.use({
  viewport: { width: 375, height: 667 }, // iPhone SE
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2
});
