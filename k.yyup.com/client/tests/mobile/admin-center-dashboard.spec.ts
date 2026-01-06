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

    // 等待重定向
    await page.waitForURL(/\/(mobile|centers)/, { timeout: 10000 });

    // 验证园长工作台
    const dashboard = page.locator('.mobile-centers, .principal-dashboard');
    await expect(dashboard).toBeVisible();

    // 验证数据显示
    const statCards = page.locator('.center-card, .stat-card');
    const cardCount = await statCards.count();
    console.log(`✅ 园长工作台显示 ${cardCount} 个统计卡片`);

    // 验证各中心入口
    const centerLinks = page.locator('.center-link, .van-cell');
    const linkCount = await centerLinks.count();
    console.log(`✅ 园长工作台有 ${linkCount} 个中心入口`);

    if (linkCount > 0) {
      // 验证第一个中心
      const firstLink = centerLinks.first();
      const linkText = await firstLink.textContent();
      console.log('✅ 第一个中心:', linkText?.trim());
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

    // 验证业务中心工作台
    const businessHub = page.locator('.business-hub');
    await expect(businessHub).toBeVisible();

    // 验证业务统计
    const businessStats = page.locator('.business-stats, .van-grid');
    await expect(businessStats).toBeVisible();

    // 验证业务模块列表
    const modules = page.locator('.business-module, .van-cell');
    const moduleCount = await modules.count();
    console.log(`✅ 业务中心显示 ${moduleCount} 个业务模块`);

    // 验证关键业务指标
    const metrics = page.locator('.metric-card');
    const metricCount = await metrics.count();
    if (metricCount > 0) {
      console.log(`✅ 显示 ${metricCount} 个业务指标`);

      // 验证指标数值
      for (let i = 0; i < metricCount; i++) {
        const metric = metrics.nth(i);
        await expect(metric.locator('.metric-value')).toBeVisible();
        await expect(metric.locator('.metric-label')).toBeVisible();
      }
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

    // 验证分析中心工作台
    const analyticsHub = page.locator('.analytics-hub');
    await expect(analyticsHub).toBeVisible();

    // 验证数据概览卡片
    const overviewCards = page.locator('.overview-card, .stat-card');
    const cardCount = await overviewCards.count();
    console.log(`✅ 数据分析中心显示 ${cardCount} 个概览卡片`);

    // 验证图表容器
    const charts = page.locator('.chart-container, .van-skeleton');
    const chartCount = await charts.count();
    if (chartCount > 0) {
      console.log(`✅ 显示 ${chartCount} 个数据图表`);
    }

    // 验证数据筛选
    const filters = page.locator('.filter-section');
    if (await filters.isVisible()) {
      console.log('✅ 数据筛选功能可用');

      // 测试时间筛选
      const timeFilter = filters.locator('.time-filter');
      if (await timeFilter.isVisible()) {
        await timeFilter.click();
        await page.waitForTimeout(500);
        console.log('✅ 时间筛选可点击');
      }
    }

    // 验证数据导出
    const exportBtn = page.locator('.export-btn');
    if (await exportBtn.isVisible()) {
      console.log('✅ 数据导出按钮可用');
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

    // 验证学生中心工作台
    const studentCenter = page.locator('.student-center');
    await expect(studentCenter).toBeVisible();

    // 验证统计信息
    const stats = page.locator('.student-stats, .van-grid');
    await expect(stats).toBeVisible();

    // 验证学生列表
    const studentList = page.locator('.student-list, .van-list');
    await expect(studentList).toBeVisible();

    const students = page.locator('.student-item, .van-cell');
    const studentCount = await students.count();
    console.log(`✅ 学生列表显示 ${studentCount} 个学生`);

    if (studentCount > 0) {
      // 搜索功能测试
      const searchInput = page.locator('input[type="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('测试');
        await page.waitForTimeout(1000);
        console.log('✅ 搜索功能可用');
      }

      // 验证第一个学生信息
      const firstStudent = students.first();
      await expect(firstStudent.locator('.student-name')).toBeVisible();
      await expect(firstStudent.locator('.student-class')).toBeVisible();
    }

    // 验证操作按钮
    const actionBtns = page.locator('.student-action-btn');
    if (await actionBtns.first().isVisible()) {
      console.log('✅ 学生操作按钮可用');
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

    // 验证人事中心工作台
    const personnelCenter = page.locator('.personnel-center');
    await expect(personnelCenter).toBeVisible();

    // 验证教师统计
    const teacherStats = page.locator('.teacher-stats, .van-grid');
    await expect(teacherStats).toBeVisible();

    // 验证教师列表
    const teacherList = page.locator('.teacher-list, .van-list');
    await expect(teacherList).toBeVisible();

    const teachers = page.locator('.teacher-item, .van-cell');
    const teacherCount = await teachers.count();
    console.log(`✅ 教师列表显示 ${teacherCount} 个教师`);

    // 验证教师信息卡片
    if (teacherCount > 0) {
      const firstTeacher = teachers.first();
      await expect(firstTeacher.locator('.teacher-name')).toBeVisible();
      await expect(firstTeacher.locator('.teacher-role')).toBeVisible();
      await expect(firstTeacher.locator('.teacher-status')).toBeVisible();

      console.log('✅ 教师信息卡片完整');
    }

    // 验证功能按钮
    const addBtn = page.locator('.add-teacher-btn');
    const importBtn = page.locator('.import-teachers-btn');

    if (await addBtn.isVisible()) {
      console.log('✅ 添加教师按钮可用');
    }
    if (await importBtn.isVisible()) {
      console.log('✅ 导入教师按钮可用');
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

    // 验证财务中心工作台
    const financeCenter = page.locator('.finance-center');
    await expect(financeCenter).toBeVisible();

    // 验证财务概览
    const financeOverview = page.locator('.finance-overview, .van-grid');
    await expect(financeOverview).toBeVisible();

    // 验证关键财务指标
    const keyMetrics = page.locator('.key-metric');
    const metricCount = await keyMetrics.count();
    console.log(`✅ 显示 ${metricCount} 个关键财务指标`);

    if (metricCount > 0) {
      for (let i = 0; i < metricCount; i++) {
        const metric = keyMetrics.nth(i);
        await expect(metric.locator('.metric-amount')).toBeVisible();
        await expect(metric.locator('.metric-label')).toBeVisible();
      }
    }

    // 验证收支明细
    const transactionList = page.locator('.transaction-list, .van-list');
    if (await transactionList.isVisible()) {
      const transactions = page.locator('.transaction-item, .van-cell');
      const count = await transactions.count();
      console.log(`✅ 收支明细显示 ${count} 条记录`);

      if (count > 0) {
        await expect(transactions.first().locator('.transaction-amount')).toBeVisible();
      }
    }

    // 测试账单导出
    const exportBtn = page.locator('.export-bill-btn');
    if (await exportBtn.isVisible()) {
      console.log('✅ 账单导出功能可用');
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

    // 验证通知中心工作台
    const notificationCenter = page.locator('.notification-center');
    await expect(notificationCenter).toBeVisible();

    // 验证通知类型选项卡
    const typeTabs = page.locator('.notification-type-tab, .van-tab');
    const tabCount = await typeTabs.count();
    console.log(`✅ 通知中心有 ${tabCount} 个类型选项卡`);

    // 验证通知列表
    const notificationList = page.locator('.notification-list, .van-list');
    await expect(notificationList).toBeVisible();

    // 验证通知项
    const notifications = page.locator('.notification-item, .van-cell');
    const notificationCount = await notifications.count();
    console.log(`✅ 通知列表显示 ${notificationCount} 条通知`);

    // 验证第一条通知
    if (notificationCount > 0) {
      const firstNotification = notifications.first();
      await expect(firstNotification.locator('.notification-title')).toBeVisible();
      await expect(firstNotification.locator('.notification-time')).toBeVisible();

      // 标记已读测试
      const markAsReadBtn = firstNotification.locator('.mark-as-read-btn');
      if (await markAsReadBtn.isVisible()) {
        await markAsReadBtn.click();
        await page.waitForTimeout(500);
        console.log('✅ 标记已读功能可用');
      }
    }

    // 验证批量操作
    const batchActions = page.locator('.batch-action-btn');
    if (await batchActions.first().isVisible()) {
      console.log('✅ 批量操作功能可用');
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
    await page.waitForURL(/\/(mobile|centers)/, { timeout: 10000 });

    const startTime = Date.now();

    // 首页加载
    await page.waitForLoadState('networkidle');
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
      const centerStartTime = Date.now();
      await page.goto(center.path);
      await page.waitForLoadState('domcontentloaded');
      const centerLoadTime = Date.now() - centerStartTime;

      console.log(`✅ ${center.name}加载: ${centerLoadTime}ms`);
      expect(centerLoadTime).toBeLessThan(2500);
    }
  });
});

test.use({
  viewport: { width: 375, height: 667 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2
});
