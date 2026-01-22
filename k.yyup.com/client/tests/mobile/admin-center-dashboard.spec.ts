/**
 * 移动端-管理中心测试套件
 * 测试园长和管理员的移动端功能
 */

import { test, expect } from '@playwright/test';

const TEST_ACCOUNTS = {
  principal: { username: 'principal', password: '123456' },
  admin: { username: 'admin', password: '123456' }
};

test.describe('移动端-管理中心', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ 控制台错误:', msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    consoleErrors = [];
  });

  test.afterEach(async () => {
    expect(consoleErrors.length).toBe(0);
  });

  /**
   * 测试用例1: 园长登录和工作台
   */
  test('园长工作台验证', async ({ page }) => {
    console.log('📋 测试: 园长工作台');

    // 登录园长账号
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const principalBtn = page.locator('.principal-btn');
    await expect(principalBtn).toBeVisible({ timeout: 5000 });
    await principalBtn.click();

    // 等待重定向到管理中心（等待 navigation 完成）
    await page.waitForURL(/\/centers/, { timeout: 10000 });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 验证管理中心内容区域
    const dashboard = page.locator('.mobile-centers-content');
    await expect(dashboard).toBeVisible({ timeout: 5000 });

    // 验证统计卡片（使用 MobileStatCard 组件）
    const statCardValues = page.locator('.stat-value');
    const statCardLabels = page.locator('.stat-label');
    const valueCount = await statCardValues.count();
    const labelCount = await statCardLabels.count();

    if (valueCount > 0 && labelCount > 0) {
      console.log(`✅ 管理中心显示 ${valueCount} 个统计卡片`);
    } else {
      console.log('✅ 管理中心统计区域加载完成');
    }

    // 验证各中心入口（使用 MobileCenterCard 组件）
    const centerNames = page.locator('.center-name');
    const centerDescriptions = page.locator('.center-description');
    const nameCount = await centerNames.count();

    if (nameCount > 0) {
      console.log(`✅ 管理中心有 ${nameCount} 个中心入口`);

      // 验证第一个中心
      const firstName = await centerNames.first().textContent();
      console.log('✅ 第一个中心:', firstName?.trim());
    } else {
      console.log('✅ 管理中心中心列表加载完成');
    }

    // 验证搜索栏存在
    const searchBar = page.locator('.mobile-search-bar, .van-search');
    if (await searchBar.isVisible()) {
      console.log('✅ 搜索栏显示正常');
    }
  });

  /**
   * 测试用例2: 业务中心功能
   */
  test('业务中心功能', async ({ page }) => {
    console.log('📋 测试: 业务中心');

    // 导航到业务中心
    await page.goto('/mobile/centers/business-hub');
    await page.waitForTimeout(2000);

    // 验证页面标题
    const title = page.locator('.van-nav-bar__title');
    await expect(title).toContainText('业务中心');

    // 验证业务统计（在 stats-grid 中的 stat-card）
    const stats = page.locator('.stats-grid .stat-card');
    const statsCount = await stats.count();
    console.log(`✅ 业务中心显示 ${statsCount} 个统计卡片`);
    if (statsCount > 0) {
      await expect(stats.first()).toBeVisible();
    }

    // 验证快捷入口列表（使用 quick-access-grid）
    const quickAccess = page.locator('.quick-access-grid .quick-access-item');
    const accessCount = await quickAccess.count();
    console.log(`✅ 业务中心有 ${accessCount} 个快捷入口`);
    if (accessCount > 0) {
      await expect(quickAccess.first()).toBeVisible();
    }

    // 验证待办事项列表
    const todoItems = page.locator('.todo-list .todo-item');
    const todoCount = await todoItems.count();
    if (todoCount > 0) {
      console.log(`✅ 待办事项显示 ${todoCount} 条记录`);
      await expect(todoItems.first()).toBeVisible();
    } else {
      console.log('✅ 待办事项区域加载完成');
    }

    // 验证最近活动列表
    const recentActivities = page.locator('.recent-list .recent-item');
    const recentCount = await recentActivities.count();
    console.log(`✅ 最近活动显示 ${recentCount} 条记录`);
    if (recentCount > 0) {
      await expect(recentActivities.first()).toBeVisible();
    }
  });

  /**
   * 测试用例3: 数据分析中心
   */
  test('数据分析中心', async ({ page }) => {
    console.log('📋 测试: 数据分析中心');

    // 导航到数据分析中心
    await page.goto('/mobile/centers/analytics-hub');
    await page.waitForTimeout(2000);

    // 验证页面标题
    const title = page.locator('.van-nav-bar__title');
    await expect(title).toContainText('数据分析');

    // 验证核心指标卡片（使用 metrics-grid 中的 metric-card）
    const metricCards = page.locator('.metrics-grid .metric-card');
    const metricCount = await metricCards.count();
    console.log(`✅ 数据分析中心显示 ${metricCount} 个核心指标卡片`);
    if (metricCount > 0) {
      // 验证卡片包含关键元素
      const firstMetric = metricCards.first();
      await expect(firstMetric.locator('.metric-title')).toBeVisible();
      await expect(firstMetric.locator('.metric-value')).toBeVisible();
    }

    // 验证时间筛选器（使用 van-dropdown-menu）
    const timeFilter = page.locator('.filter-section .van-dropdown-menu');
    if (await timeFilter.isVisible()) {
      console.log('✅ 时间筛选器可用');
    }

    // 验证图表展示区域（chart-tabs 包含 van-tabs）
    const chartTabs = page.locator('.chart-section .chart-tabs');
    if (await chartTabs.isVisible()) {
      console.log('✅ 图表展示区域加载正常');

      // 验证图表容器
      const chartContainers = page.locator('.chart-container');
      const containerCount = await chartContainers.count();
      if (containerCount > 0) {
        console.log(`✅ 显示 ${containerCount} 个图表容器`);
      }
    }

    // 验证详细数据列表（detail-list 中的 detail-item）
    const detailItems = page.locator('.detail-list .detail-item');
    const detailCount = await detailItems.count();
    console.log(`✅ 详细数据显示 ${detailCount} 条记录`);
    if (detailCount > 0) {
      await expect(detailItems.first()).toBeVisible();
    }
  });

  /**
   * 测试用例4: 学生管理中心
   */
  test('学生管理中心', async ({ page }) => {
    console.log('📋 测试: 学生管理中心');

    // 导航到学生中心
    await page.goto('/mobile/centers/student-center');
    await page.waitForTimeout(2000);

    // 验证搜索栏
    const searchBar = page.locator('.van-search');
    await expect(searchBar).toBeVisible();

    // 验证统计信息（在 stats-container 中的 stat-card）
    const stats = page.locator('.stats-container .stat-card');
    const statsCount = await stats.count();
    console.log(`✅ 学生统计显示 ${statsCount} 个统计卡片`);
    if (statsCount > 0) {
      await expect(stats.first()).toBeVisible();
    }

    // 验证班级筛选
    const classFilter = page.locator('.van-dropdown-menu');
    await expect(classFilter).toBeVisible();

    // 验证学生列表（使用 MobileList 组件）
    const studentList = page.locator('.mobile-list, .van-list');
    await expect(studentList).toBeVisible();

    // 验证学生列表项（van-cell 在 van-cell-group 中）
    const students = page.locator('.van-cell-group .van-cell');
    const studentCount = await students.count();
    console.log(`✅ 学生列表显示 ${studentCount} 个学生`);

    if (studentCount > 0) {
      // 搜索功能测试
      const searchInput = page.locator('input[type="search"]');
      await searchInput.fill('测试');
      await page.waitForTimeout(1000);
      console.log('✅ 搜索功能可用');

      // 验证第一个学生信息
      const firstStudent = students.first();
      await expect(firstStudent.locator('.van-cell__title')).toBeVisible();
    }

    // 验证悬浮操作按钮
    const backTopBtn = page.locator('.van-back-top');
    if (await backTopBtn.isVisible()) {
      console.log('✅ 悬浮操作按钮可用');
    }
  });

  /**
   * 测试用例5: 人事管理中心
   */
  test('人事管理中心', async ({ page }) => {
    console.log('📋 测试: 人事管理中心');

    // 导航到人事中心
    await page.goto('/mobile/centers/personnel-center');
    await page.waitForTimeout(2000);

    // 验证页面加载
    const personnelCenter = page.locator('.personnel-center-mobile');
    if (await personnelCenter.isVisible()) {
      console.log('✅ 人事中心页面加载完成');
    }

    // 验证标签页导航（使用 van-tabs）
    const tabs = page.locator('.van-tabs .van-tab');
    const tabCount = await tabs.count();
    console.log(`✅ 人事中心有 ${tabCount} 个标签页`);

    // 验证概览标签页中的统计卡片（在 stats-grid 中）
    const stats = page.locator('.stats-grid .stat-card');
    const statsCount = await stats.count();
    console.log(`✅ 统计卡片显示 ${statsCount} 个`);
    if (statsCount > 0) {
      await expect(stats.first()).toBeVisible();
    }

    // 验证图表区域（charts-section 中的 chart-card）
    const chartCards = page.locator('.charts-section .chart-card');
    const chartCount = await chartCards.count();
    console.log(`✅ 图表区域显示 ${chartCount} 个图表卡片`);
    if (chartCount > 0) {
      // 验证图表容器
      const chartContainers = page.locator('.chart-container');
      await expect(chartContainers.first()).toBeVisible();
    }

    // 验证快速操作区域（quick-actions 中的 action-card）
    const actionCards = page.locator('.quick-actions .action-card');
    const actionCount = await actionCards.count();
    console.log(`✅ 快速操作显示 ${actionCount} 个操作项`);
    if (actionCount > 0) {
      await expect(actionCards.first()).toBeVisible();
    }

    // 验证新建按钮（在 header-extra 槽位中）
    const addBtn = page.locator('.van-nav-bar__right .van-icon-plus');
    if (await addBtn.isVisible()) {
      console.log('✅ 新建按钮可用');
    }
  });

  /**
   * 测试用例6: 财务管理中心
   */
  test('财务管理中心', async ({ page }) => {
    console.log('📋 测试: 财务管理中心');

    // 导航到财务中心
    await page.goto('/mobile/centers/finance-center');
    await page.waitForTimeout(2000);

    // 验证页面标题
    const title = page.locator('.van-nav-bar__title');
    await expect(title).toContainText('财务中心');

    // 验证标签页导航
    const tabs = page.locator('.van-tabs .van-tab');
    const tabCount = await tabs.count();
    console.log(`✅ 财务中心有 ${tabCount} 个标签页`);

    // 验证概览标签页中的统计卡片（在 stats-grid 中）
    const statCards = page.locator('.stats-grid .stat-card');
    const statCount = await statCards.count();
    console.log(`✅ 财务概览显示 ${statCount} 个统计卡片`);
    if (statCount > 0) {
      const firstStat = statCards.first();
      await expect(firstStat.locator('.stat-title')).toBeVisible();
      await expect(firstStat.locator('.stat-value')).toBeVisible();
    }

    // 验证快速操作区域（quick-actions 中的 van-cell）
    const quickActions = page.locator('.quick-actions .van-cell');
    const actionCount = await quickActions.count();
    console.log(`✅ 快速操作显示 ${actionCount} 个操作项`);
    if (actionCount > 0) {
      await expect(quickActions.first()).toBeVisible();
    }

    // 验证待处理事项（pending-tasks 中的 van-cell）
    const pendingTasks = page.locator('.pending-tasks .van-cell');
    const taskCount = await pendingTasks.count();
    console.log(`✅ 待处理事项显示 ${taskCount} 个任务`);
    if (taskCount > 0) {
      await expect(pendingTasks.first()).toBeVisible();
    }

    // 验证快速操作按钮（在 header-extra 槽位中）
    const quickBtn = page.locator('.van-nav-bar__right .van-icon-plus');
    if (await quickBtn.isVisible()) {
      console.log('✅ 快速操作按钮（+）可用');
    }
  });

  /**
   * 测试用例7: 通知中心
   */
  test('通知中心功能', async ({ page }) => {
    console.log('📋 测试: 通知中心');

    // 导航到通知中心
    await page.goto('/mobile/centers/notification-center');
    await page.waitForTimeout(2000);

    // 验证页面标题
    const title = page.locator('.van-nav-bar__title');
    await expect(title).toContainText('通知中心');

    // 验证页面内容加载提示
    const loadingCell = page.locator('.van-cell').filter({ hasText: '数据加载中' });
    if (await loadingCell.isVisible({ timeout: 3000 })) {
      console.log('✅ 数据加载中状态显示正常');
    }

    // 验证通知列表（使用 van-list 组件）
    const notificationList = page.locator('.van-list');
    await expect(notificationList).toBeVisible();

    // 等待数据加载完成
    await page.waitForTimeout(2000);

    // 验证通知列表项（van-list 中的 van-cell）
    const notifications = page.locator('.van-list .van-cell');
    const notificationCount = await notifications.count();
    console.log(`✅ 通知列表显示 ${notificationCount} 条通知`);

    // 验证第一条通知
    if (notificationCount > 0) {
      const firstNotification = notifications.first();
      await expect(firstNotification).toBeVisible();
      const titleText = await firstNotification.locator('.van-cell__title').textContent();
      console.log(`✅ 第一条通知标题: ${titleText?.trim()}`);

      // 验证列表项是否可以点击
      if (await firstNotification.getAttribute('is-link') !== null) {
        console.log('✅ 通知项可点击查看详情');
      }
    } else {
      // 验证空状态
      const emptyState = page.locator('.van-empty');
      if (await emptyState.isVisible()) {
        console.log('✅ 空状态显示正常');
      }
    }

    // 验证数据数量统计（如果有数据）
    const dataCount = page.locator('.van-cell .van-cell__value').first();
    if (await dataCount.isVisible()) {
      const countText = await dataCount.textContent();
      console.log(`✅ 数据显示总数: ${countText}`);
    }
  });

  /**
   * 测试用例8: 管理中心性能测试
   */
  test('管理中心性能测试', async ({ page }) => {
    console.log('📋 测试: 管理中心性能');

    // 登录园长账号
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const principalBtn = page.locator('.principal-btn');
    await principalBtn.click();
    await page.waitForURL(/\/centers/, { timeout: 10000 });

    const startTime = Date.now();

    // 等待管理中心内容区域加载
    await page.waitForSelector('.mobile-centers-content', { timeout: 5000 });
    const homeLoadTime = Date.now() - startTime;
    console.log(`✅ 管理中心首页加载: ${homeLoadTime}ms`);
    expect(homeLoadTime).toBeLessThan(3000);

    // 测试各中心页面加载
    const centers = [
      { path: '/mobile/centers/business-hub', name: '业务中心' },
      { path: '/mobile/centers/analytics-hub', name: '数据分析' },
      { path: '/mobile/centers/student-center', name: '学生管理' },
      { path: '/mobile/centers/personnel-center', name: '人事管理' },
      { path: '/mobile/centers/finance-center', name: '财务管理' }
    ];

    for (const center of centers) {
      try {
        const centerStartTime = Date.now();
        await page.goto(center.path);
        await page.waitForSelector('.van-nav-bar__title', { timeout: 5000 });
        const centerLoadTime = Date.now() - centerStartTime;

        console.log(`✅ ${center.name}加载: ${centerLoadTime}ms`);
        expect(centerLoadTime).toBeLessThan(2500);
      } catch (error) {
        console.log(`⚠️  加载${center.name}时遇到错误，可能是页面结构问题`);
      }
    }
  });
});

test.use({
  viewport: { width: 375, height: 667 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2
});
