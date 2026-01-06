/**
 * 移动端-教师中心测试套件
 * 测试教师中心的完整功能
 */

import { test, expect } from '@playwright/test';

const TEST_ACCOUNTS = {
  teacher: { username: 'teacher', password: '123456' }
};

test.describe('移动端-教师中心', () => {
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

    // 登录教师账号
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    const teacherBtn = page.locator('.teacher-btn');
    await expect(teacherBtn).toBeVisible({ timeout: 5000 });
    await teacherBtn.click();

    // 等待重定向到教师中心
    await page.waitForURL(/\/(mobile|teacher-center)/, { timeout: 10000 });
  });

  test.afterEach(async () => {
    expect(consoleErrors.length).toBe(0);
  });

  /**
   * 测试用例1: 教师工作台验证
   */
  test('教师工作台验证', async ({ page }) => {
    console.log('📋 测试: 教师工作台');

    // 验证工作台元素
    const dashboard = page.locator('.mobile-teacher-dashboard, .mobile-teaching-center');
    await expect(dashboard).toBeVisible();

    // 验证统计卡片
    const statCards = page.locator('.stat-card, .task-stats-card');
    const cardCount = await statCards.count();
    console.log(`✅ 找到 ${cardCount} 个统计卡片`);

    // 验证任务概览
    const taskOverview = page.locator('.task-overview, .van-grid');
    await expect(taskOverview).toBeVisible();

    // 验证快捷操作
    const quickActions = page.locator('.quick-actions, .van-grid');
    await expect(quickActions).toBeVisible();

    console.log('✅ 教师工作台加载正常');
  });

  /**
   * 测试用例2: 任务管理功能
   */
  test('任务管理功能', async ({ page }) => {
    console.log('📋 测试: 任务管理');

    // 导航到任务页面
    await page.goto('/mobile/teacher-center/tasks');
    await page.waitForTimeout(2000);

    // 验证任务列表加载
    const taskList = page.locator('.task-list, .van-list');
    await expect(taskList).toBeVisible();

    // 验证任务项
    const taskItems = page.locator('.task-item, .van-cell');
    const itemCount = await taskItems.count();
    console.log(`✅ 找到 ${itemCount} 个任务`);

    if (itemCount > 0) {
      // 验证第一个任务的详情
      const firstTask = taskItems.first();
      await expect(firstTask.locator('.task-title')).toBeVisible();
      await expect(firstTask.locator('.task-status')).toBeVisible();
    }

    // 测试创建任务按钮
    const createBtn = page.locator('.create-task-btn, .van-button--primary');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ 创建任务按钮可点击');
    }
  });

  /**
   * 测试用例3: 考勤管理功能
   */
  test('考勤管理功能', async ({ page }) => {
    console.log('📋 测试: 考勤管理');

    // 导航到考勤页面
    await page.goto('/mobile/teacher-center/attendance');
    await page.waitForTimeout(2000);

    // 验证考勤选项卡
    const tabs = page.locator('.van-tab');
    await expect(tabs.first()).toBeVisible();

    // 验证统计信息
    const stats = page.locator('.attendance-stats, .van-grid');
    await expect(stats).toBeVisible();

    // 验证学生考勤列表
    const studentList = page.locator('.student-attendance-list');
    if (await studentList.isVisible()) {
      const students = page.locator('.student-item');
      const count = await students.count();
      console.log(`✅ 考勤列表显示 ${count} 个学生`);

      // 验证第一个学生的考勤状态
      if (count > 0) {
        const firstStudent = students.first();
        await expect(firstStudent.locator('.attendance-status')).toBeVisible();
      }
    }

    // 测试签到功能
    const checkinBtn = page.locator('.checkin-btn, .van-button--primary');
    if (await checkinBtn.isVisible()) {
      console.log('✅ 签到按钮可用');
    }
  });

  /**
   * 测试用例4: 客户池管理
   */
  test('客户池管理功能', async ({ page }) => {
    console.log('📋 测试: 客户池管理');

    // 导航到客户池
    await page.goto('/mobile/teacher-center/customer-pool');
    await page.waitForTimeout(2000);

    // 验证客户列表
    const customerList = page.locator('.customer-list, .van-list');
    await expect(customerList).toBeVisible();

    // 验证客户卡片
    const customerCards = page.locator('.customer-card, .van-cell');
    const cardCount = await customerCards.count();
    console.log(`✅ 找到 ${cardCount} 个客户`);

    if (cardCount > 0) {
      // 验证第一个客户的信息
      const firstCustomer = customerCards.first();
      await expect(firstCustomer.locator('.customer-name')).toBeVisible();
      await expect(firstCustomer.locator('.customer-status')).toBeVisible();

      // 点击查看详情
      await firstCustomer.click();
      await page.waitForTimeout(1000);
      console.log('✅ 客户卡片可点击查看详情');

      // 返回
      await page.goBack();
    }

    // 验证筛选功能
    const filterBtn = page.locator('.filter-btn');
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ 筛选功能可用');
    }
  });

  /**
   * 测试用例5: 客户跟进功能
   */
  test('客户跟进功能', async ({ page }) => {
    console.log('📋 测试: 客户跟进');

    // 导航到客户跟进
    await page.goto('/mobile/teacher-center/customer-tracking');
    await page.waitForTimeout(2000);

    // 验证跟进列表
    const trackingList = page.locator('.tracking-list, .van-list');
    await expect(trackingList).toBeVisible();

    // 验证统计面板
    const statsPanel = page.locator('.stats-panel, .van-grid');
    await expect(statsPanel).toBeVisible();

    // 验证转化漏斗
    const funnel = page.locator('.conversion-funnel');
    if (await funnel.isVisible()) {
      console.log('✅ 转化漏斗显示正常');

      const funnelSteps = page.locator('.funnel-step');
      const stepCount = await funnelSteps.count();
      console.log(`✅ 转化漏斗有 ${stepCount} 个步骤`);
    }

    // 测试AI建议面板
    const aiPanel = page.locator('.ai-suggestion-panel');
    if (await aiPanel.isVisible()) {
      console.log('✅ AI建议面板加载正常');
    }
  });

  /**
   * 测试用例6: 活动中心功能
   */
  test('活动中心功能', async ({ page }) => {
    console.log('📋 测试: 活动中心');

    // 导航到活动中心
    await page.goto('/mobile/teacher-center/activities');
    await page.waitForTimeout(2000);

    // 验证活动选项卡
    const tabs = page.locator('.van-tab');
    await expect(tabs.first()).toBeVisible();

    // 验证活动统计卡片
    const statCards = page.locator('.activity-stat-card');
    const statCount = await statCards.count();
    console.log(`✅ 找到 ${statCount} 个活动统计卡片`);

    // 验证活动列表
    const activityList = page.locator('.activity-list, .van-list');
    await expect(activityList).toBeVisible();

    // 验证我的活动
    const myActivities = page.locator('.my-activities');
    if (await myActivities.isVisible()) {
      const activities = page.locator('.activity-item');
      const count = await activities.count();
      console.log(`✅ 我的活动中有 ${count} 个活动`);

      // 验证第一个活动
      if (count > 0) {
        const firstActivity = activities.first();
        await expect(firstActivity.locator('.activity-title')).toBeVisible();
        await expect(firstActivity.locator('.activity-time')).toBeVisible();
      }
    }

    // 测试创建活动按钮
    const createBtn = page.locator('.create-activity-btn, .van-button--primary');
    if (await createBtn.isVisible()) {
      console.log('✅ 创建活动按钮可用');
    }
  });

  /**
   * 测试用例7: 创意课程功能
   */
  test('创意课程功能', async ({ page }) => {
    console.log('📋 测试: 创意课程');

    // 导航到创意课程
    await page.goto('/mobile/teacher-center/creative-curriculum');
    await page.waitForTimeout(2000);

    // 验证AI助手面板
    const aiAssistant = page.locator('.ai-assistant-panel');
    if (await aiAssistant.isVisible()) {
      console.log('✅ AI课程助手已加载');

      // 验证课程建议
      const suggestions = page.locator('.curriculum-suggestion');
      const suggestionCount = await suggestions.count();
      console.log(`✅ AI提供了 ${suggestionCount} 个课程建议`);
    }

    // 验证课程列表
    const curriculumList = page.locator('.curriculum-list, .van-list');
    if (await curriculumList.isVisible()) {
      const items = page.locator('.curriculum-item');
      const itemCount = await items.count();
      console.log(`✅ 课程列表显示 ${itemCount} 个课程`);
    }

    // 测试创建课程按钮
    const createBtn = page.locator('.create-curriculum-btn');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ 创建课程功能可用');
    }
  });

  /**
   * 测试用例8: 页面性能测试
   */
  test('教师中心性能测试', async ({ page }) => {
    console.log('📋 测试: 教师中心性能');

    const startTime = Date.now();

    // 访问教师工作台
    await page.goto('/mobile/teacher-center');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`✅ 教师工作台加载时间: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(3000);

    // 测试各个子页面加载
    const pages = [
      { path: '/mobile/teacher-center/tasks', name: '任务管理' },
      { path: '/mobile/teacher-center/attendance', name: '考勤管理' },
      { path: '/mobile/teacher-center/customer-pool', name: '客户池' },
      { path: '/mobile/teacher-center/activities', name: '活动中心' }
    ];

    for (const p of pages) {
      const pageStartTime = Date.now();
      await page.goto(p.path);
      await page.waitForLoadState('domcontentloaded');
      const pageLoadTime = Date.now() - pageStartTime;

      console.log(`✅ ${p.name}加载时间: ${pageLoadTime}ms`);
      expect(pageLoadTime).toBeLessThan(2500);
    }
  });
});

test.use({
  viewport: { width: 375, height: 667 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2
});
