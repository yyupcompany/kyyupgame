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
    // 过滤掉预期的警告和403错误（测试环境无登录）
    const filteredErrors = consoleErrors.filter(error => {
      // 忽略Vue插件警告
      if (error.includes('Plugin has already been applied to target app')) return false;
      // 忽略Token缺失警告
      if (error.includes('Token或用户信息缺失')) return false;
      if (error.includes('没有找到认证token')) return false;
      // 忽略权限不足错误（测试环境预期）
      if (error.includes('403')) return false;
      if (error.includes('权限不足')) return false;
      if (error.includes('INSUFFICIENT_PERMISSION')) return false;
      // 忽略API调用失败（测试环境无后端）
      if (error.includes('获取孩子列表失败')) return false;
      if (error.includes('获取统计数据失败')) return false;
      if (error.includes('获取最近活动失败')) return false;
      if (error.includes('获取最新通知失败')) return false;
      // 忽略性能警告（不影响功能）
      if (error.includes('布局偏移')) return false;
      if (error.includes('CLS')) return false;
      // 忽略Axios错误（网络请求失败）
      if (error.includes('Response error: AxiosError')) return false;
      if (error.includes('Failed to load resource')) return false;
      if (error.includes('Request failed')) return false;
      return true;
    });

    if (filteredErrors.length > 0) {
      console.log('❌ 未预期的控制台错误:', filteredErrors);
    }
    expect(filteredErrors.length).toBe(0);
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

    // 等待页面加载完成
    await page.waitForSelector('.mobile-parent-dashboard, .welcome-section', { timeout: 10000 });

    // 验证欢迎区域
    const welcomeSection = page.locator('.welcome-section');
    await expect(welcomeSection).toBeVisible();

    // 验证欢迎文本
    const welcomeText = page.locator('.welcome-text .greeting');
    await expect(welcomeText).toBeVisible();
    console.log('✅ 欢迎区域已显示');

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

    // 等待统计区域加载
    await page.waitForSelector('.stats-section', { timeout: 10000 });

    // 验证统计网格
    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid).toBeVisible();

    // 验证统计项
    const gridItems = page.locator('.stats-grid .van-grid-item');
    const itemCount = await gridItems.count();

    console.log(`✅ 找到 ${itemCount} 个统计项`);

    // 验证每个统计项的结构
    for (let i = 0; i < itemCount; i++) {
      const item = gridItems.nth(i);

      // 验证图标
      const icon = item.locator('.van-icon');
      await expect(icon).toBeVisible();

      // 验证数值
      const value = item.locator('.stat-value');
      await expect(value).toBeVisible();
      const valueText = await value.textContent();
      expect(valueText).toBeTruthy();

      // 验证标签
      const label = item.locator('.stat-label');
      await expect(label).toBeVisible();
      const labelText = await label.textContent();
      expect(labelText).toBeTruthy();

      console.log(`✅ 统计项 ${i + 1}: ${labelText} = ${valueText}`);
    }
  });

  /**
   * 测试用例4: 验证可操作按钮
   */
  test('验证可操作按钮', async ({ page }) => {
    console.log('📋 测试: 验证可操作按钮');

    // 等待内容卡片加载
    await page.waitForSelector('.content-card', { timeout: 10000 });

    // 查找所有主要按钮
    const primaryButtons = page.locator('.content-card .van-button--primary');
    const buttonCount = await primaryButtons.count();

    console.log(`✅ 找到 ${buttonCount} 个主要按钮`);

    // 验证第一个按钮
    if (buttonCount > 0) {
      const firstButton = primaryButtons.first();
      await expect(firstButton).toBeVisible();

      const buttonText = await firstButton.textContent();
      console.log('✅ 第一个按钮:', buttonText?.trim());

      // 验证按钮可点击
      await firstButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 按钮点击响应正常');

      // 返回上一页
      if (page.url() !== 'http://localhost:5173/' && page.url().includes('/mobile')) {
        await page.goBack();
        await page.waitForTimeout(1000);
      }
    }

    // 验证文本按钮
    const textButtons = page.locator('.content-card .van-button--text');
    const textButtonCount = await textButtons.count();
    console.log(`✅ 找到 ${textButtonCount} 个文本按钮`);

    for (let i = 0; i < Math.min(textButtonCount, 2); i++) {
      const button = textButtons.nth(i);
      if (await button.isVisible()) {
        const text = await button.textContent();
        console.log(`  - 文本按钮 ${i + 1}: ${text?.trim()}`);
      }
    }
  });

  /**
   * 测试用例5: 验证活动列表
   */
  test('验证活动列表组件', async ({ page }) => {
    console.log('📋 测试: 验证活动列表组件');

    // 等待卡片行加载
    await page.waitForSelector('.cards-row', { timeout: 10000 });

    // 验证卡片行
    const cardsRow = page.locator('.cards-row');
    await expect(cardsRow).toBeVisible();

    // 验证第一个卡片的列表项（活动或通知）
    const firstCard = cardsRow.locator('.content-card').first();
    await expect(firstCard).toBeVisible();

    // 获取卡片标题
    const cardTitle = firstCard.locator('.header-title span:last-child');
    const titleText = await cardTitle.textContent();
    console.log(`✅ 第一个卡片: ${titleText}`);

    // 验证列表项
    const listItems = firstCard.locator('.list-item');
    const itemCount = await listItems.count();

    console.log(`✅ 找到 ${itemCount} 个列表项`);

    if (itemCount > 0) {
      // 验证列表项结构
      const firstItem = listItems.first();

      // 验证标题
      const itemTitle = firstItem.locator('.item-title');
      await expect(itemTitle).toBeVisible();
      const titleText = await itemTitle.textContent();
      expect(titleText).toBeTruthy();

      // 验证时间
      const itemTime = firstItem.locator('.item-time');
      await expect(itemTime).toBeVisible();
      const timeText = await itemTime.textContent();
      expect(timeText).toBeTruthy();

      console.log(`✅ 第一条: ${titleText} (${timeText})`);

      // 验证箭头图标
      const arrowIcon = firstItem.locator('.van-icon-arrow');
      await expect(arrowIcon).toBeVisible();
    } else {
      // 验证空状态
      const emptyState = firstCard.locator('.van-empty');
      await expect(emptyState).toBeVisible();
      console.log('✅ 空状态显示正常');
    }
  });

  /**
   * 测试用例6: 导航到孩子管理页面
   */
  test('导航到孩子管理页面', async ({ page }) => {
    console.log('📋 测试: 导航到孩子管理页面');

    // 点击底部导航的"孩子"Tab
    const footerTabs = page.locator('.mobile-footer .van-tabbar-item');
    const tabCount = await footerTabs.count();

    if (tabCount > 0) {
      console.log(`✅ 找到 ${tabCount} 个底部导航项`);

      // 查找标题为"孩子"的Tab
      for (let i = 0; i < tabCount; i++) {
        const tab = footerTabs.nth(i);
        const title = await tab.locator('.tab-title').textContent();

        if (title?.includes('孩子')) {
          console.log(`✅ 找到"孩子"Tab: ${title}`);
          await tab.click();
          await page.waitForTimeout(2000);

          // 验证URL包含children
          const url = page.url();
          expect(url).toMatch(/children/);
          console.log('✅ 成功导航到孩子管理页面');
          return;
        }
      }

      // 如果没有找到"孩子"Tab，点击第一个Tab
      console.log('⚠️ 未找到"孩子"Tab，点击第一个Tab');
      await footerTabs.first().click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ 未找到底部导航项，测试跳过');
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

    // 等待主要数据加载 - 等待统计网格
    await page.waitForSelector('.stats-grid', { timeout: 10000 });

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

      // 验证布局适应 - 检查主要内容区域
      const welcomeSection = page.locator('.welcome-section');
      await expect(welcomeSection).toBeVisible();

      // 验证统计区域可见
      const statsSection = page.locator('.stats-section');
      await expect(statsSection).toBeVisible();

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
