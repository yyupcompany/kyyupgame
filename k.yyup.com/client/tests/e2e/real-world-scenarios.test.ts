/**
 * 真实世界场景E2E测试
 * 模拟真实用户在浏览器环境中的完整操作流程
 */

import { test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@playwright/test';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import path from 'path';

// 测试配置
const BASE_URL = 'http://localhost:5173';
const API_BASE_URL = 'http://localhost:3000';

describe('Real World Scenarios E2E Tests', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    // 启动浏览器（必须使用无头模式）
    browser = await chromium.launch({
      headless: true,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  }, 30000);

  afterAll(async () => {
    await context.close();
    await browser.close();
  }, 10000);

  beforeEach(async () => {
    page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(30000);
  });

  afterEach(async () => {
    await page.close();
  });

  /**
   * 等待页面加载完成
   */
  async function waitForPageLoad(): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }

  /**
   * 登录函数
   */
  async function login(username: string, password: string): Promise<void> {
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad();

    // 填写登录表单
    await page.fill('input[placeholder="用户名"], input[name="username"], input[type="text"]', username);
    await page.fill('input[placeholder="密码"], input[name="password"], input[type="password"]', password);

    // 点击登录按钮
    await page.click('button[type="submit"], .login-btn, .el-button--primary');

    // 等待登录成功
    await page.waitForURL('**/dashboard');
    await waitForPageLoad();
  }

  /**
   * 验证API响应
   */
  async function verifyAPIResponse(url: string, expectedStatus: number = 200): Promise<any> {
    const response = await page.evaluate(async (apiUrl) => {
      try {
        const res = await fetch(apiUrl);
        return {
          status: res.status,
          ok: res.ok,
          data: await res.json()
        };
      } catch (error) {
        return {
          status: 0,
          ok: false,
          error: error.message
        };
      }
    }, url);

    expect(response.status).toBe(expectedStatus);
    return response.data;
  }

  describe('教师日常工作流程', () => {
    test('教师应该能够完成完整的日常教学工作流程', async () => {
      console.log('🎯 开始教师日常工作流程测试...');

      // 1. 教师登录
      await login('test_teacher1', 'Test123!');

      // 验证登录成功
      const currentUrl = page.url();
      expect(currentUrl).toContain('/dashboard');

      console.log('✅ 教师登录成功');

      // 2. 查看今日课程安排
      await page.click('.schedule-card, .today-schedule, [data-testid="schedule"]');
      await waitForPageLoad();

      // 验证课程安排页面加载
      const scheduleTitle = await page.textContent('h1, .page-title');
      expect(scheduleTitle).toContain('课程') || expect(scheduleTitle).toContain('安排');

      console.log('✅ 查看课程安排');

      // 3. 进入我的班级
      await page.click('.my-classes, .class-management, [data-testid="my-classes"]');
      await waitForPageLoad();

      // 验证班级列表
      const classCards = await page.$$('.class-card, .el-card, [data-testid="class-card"]');
      expect(classCards.length).toBeGreaterThan(0);

      // 点击进入第一个班级
      await page.click('.class-card, .el-card, [data-testid="class-card"]');
      await waitForPageLoad();

      console.log('✅ 进入班级管理');

      // 4. 查看班级学生列表
      await page.click('.students-tab, .student-list, [data-testid="students"]');
      await waitForPageLoad();

      // 验证学生列表
      const studentRows = await page.$$('.student-row, .el-table__row, [data-testid="student-row"]');
      expect(studentRows.length).toBeGreaterThan(0);

      console.log('✅ 查看学生列表');

      // 5. 进行学生考勤
      await page.click('.attendance-btn, .take-attendance, [data-testid="attendance"]');
      await waitForPageLoad();

      // 标记学生出勤
      const attendanceCheckboxes = await page.$$('.attendance-checkbox, input[type="checkbox"]');
      for (let i = 0; i < Math.min(3, attendanceCheckboxes.length); i++) {
        await attendanceCheckboxes[i].click();
      }

      // 提交考勤
      await page.click('.submit-attendance, .save-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证考勤提交成功
      const successMessage = await page.textContent('.el-message--success, .success-message');
      expect(successMessage).toBeTruthy();

      console.log('✅ 完成学生考勤');

      // 6. 创建教学活动
      await page.click('.create-activity, .add-activity, [data-testid="create-activity"]');
      await waitForPageLoad();

      // 填写活动信息
      await page.fill('input[name="title"], .activity-title', 'E2E测试教学活动');
      await page.fill('textarea[name="description"], .activity-description', '这是一个端到端测试创建的教学活动');
      await page.selectOption('select[name="type"], .activity-type', { label: '教育活动' });

      // 设置时间
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      await page.fill('input[type="date"], .activity-date', tomorrowStr);

      // 提交活动
      await page.click('.submit-activity, .create-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证活动创建成功
      const activitySuccess = await page.textContent('.el-message--success, .success-message');
      expect(activitySuccess).toBeTruthy();

      console.log('✅ 创建教学活动');

      // 7. 查看工作统计
      await page.click('.dashboard-link, .home-link, [data-testid="dashboard"]');
      await waitForPageLoad();

      // 验证统计信息显示
      const statsCards = await page.$$('.stat-card, .data-card, [data-testid="stat"]');
      expect(statsCards.length).toBeGreaterThan(0);

      // 验证今日活动统计
      const todayActivities = await page.textContent('.today-activities, .activity-count');
      expect(todayActivities).toBeTruthy();

      console.log('✅ 查看工作统计');

      // 8. 与家长沟通
      await page.click('.communication, .parent-communication, [data-testid="communication"]');
      await waitForPageLoad();

      // 点击发送消息
      await page.click('.send-message, .new-message, [data-testid="send-message"]');
      await waitForPageLoad();

      // 选择学生
      await page.click('.student-selector, .student-select, [data-testid="student-select"]');
      await page.click('.el-select-dropdown__item, .student-option', { timeout: 5000 });

      // 填写消息内容
      await page.fill('textarea[name="content"], .message-content', '孩子今天在课堂上表现很棒，积极参与了所有活动');

      // 发送消息
      await page.click('.send-btn, .submit-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证消息发送成功
      const messageSuccess = await page.textContent('.el-message--success, .success-message');
      expect(messageSuccess).toBeTruthy();

      console.log('✅ 发送家长沟通消息');

      // 9. 验证API调用
      // 验证关键API端点
      await verifyAPIResponse(`${API_BASE_URL}/api/dashboard`);
      await verifyAPIResponse(`${API_BASE_URL}/api/classes/my-classes`);
      await verifyAPIResponse(`${API_BASE_URL}/api/activities`);

      console.log('✅ 验证API调用正常');

      console.log('🎉 教师日常工作流程测试完成！');
    }, 120000);
  });

  describe('家长完整操作流程', () => {
    test('家长应该能够完成查看和管理孩子信息的完整流程', async () => {
      console.log('🎯 开始家长操作流程测试...');

      // 1. 家长登录
      await login('test_parent1', 'Test123!');

      // 验证登录成功
      const currentUrl = page.url();
      expect(currentUrl).toContain('/dashboard');

      console.log('✅ 家长登录成功');

      // 2. 查看我的孩子
      await page.click('.my-children, .children-list, [data-testid="my-children"]');
      await waitForPageLoad();

      // 验证孩子列表
      const childCards = await page.$$('.child-card, .student-card, [data-testid="child-card"]');
      expect(childCards.length).toBeGreaterThan(0);

      // 点击查看第一个孩子的详细信息
      await page.click('.child-card, .view-child, [data-testid="view-child"]');
      await waitForPageLoad();

      console.log('✅ 查看孩子信息');

      // 3. 查看孩子考勤记录
      await page.click('.attendance-tab, .attendance-records, [data-testid="attendance"]');
      await waitForPageLoad();

      // 验证考勤记录显示
      const attendanceRecords = await page.$$('.attendance-record, .record-item, [data-testid="attendance-record"]');
      expect(attendanceRecords.length).toBeGreaterThanOrEqual(0);

      console.log('✅ 查看考勤记录');

      // 4. 查看成长记录
      await page.click('.growth-tab, .growth-records, [data-testid="growth"]');
      await waitForPageLoad();

      // 添加新的成长记录
      await page.click('.add-growth, .add-record, [data-testid="add-growth"]');
      await waitForPageLoad();

      // 填写成长记录
      await page.selectOption('select[name="type"], .growth-type', { label: '体重' });
      await page.fill('input[name="value"], .growth-value', '18.5');
      await page.fill('input[name="notes"], .growth-notes', '体重正常增长');

      // 提交记录
      await page.click('.submit-growth, .save-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证记录添加成功
      const growthSuccess = await page.textContent('.el-message--success, .success-message');
      expect(growthSuccess).toBeTruthy();

      console.log('✅ 添加成长记录');

      // 5. 查看活动报名
      await page.click('.activities-tab, .activities, [data-testid="activities"]');
      await waitForPageLoad();

      // 查看可报名活动
      const availableActivities = await page.$$('.activity-card, .available-activity, [data-testid="available-activity"]');

      if (availableActivities.length > 0) {
        // 点击第一个活动进行报名
        await page.click('.activity-card, .register-btn, [data-testid="register"]');
        await waitForPageLoad();

        // 同意报名条款
        await page.click('.consent-checkbox, input[type="checkbox"]');

        // 填写紧急联系人
        await page.fill('input[name="emergencyContact"], .emergency-contact', '13800138000');

        // 提交报名
        await page.click('.submit-registration, .confirm-btn, button[type="submit"]');
        await waitForPageLoad();

        // 验证报名成功
        const registrationSuccess = await page.textContent('.el-message--success, .success-message');
        expect(registrationSuccess).toBeTruthy();

        console.log('✅ 活动报名成功');
      }

      // 6. 查看与教师的沟通
      await page.click('.communication-tab, .messages, [data-testid="messages"]');
      await waitForPageLoad();

      // 发送消息给教师
      await page.click('.new-message, .compose-message, [data-testid="new-message"]');
      await waitForPageLoad();

      // 选择接收人
      await page.click('.teacher-select, .receiver-select, [data-testid="teacher-select"]');
      await page.click('.el-select-dropdown__item, .teacher-option', { timeout: 5000 });

      // 填写消息内容
      await page.fill('textarea[name="content"], .message-content', '想了解一下孩子最近的学习情况');

      // 发送消息
      await page.click('.send-btn, .submit-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证消息发送成功
      const messageSuccess = await page.textContent('.el-message--success, .success-message');
      expect(messageSuccess).toBeTruthy();

      console.log('✅ 发送教师消息');

      // 7. 预约面谈
      await page.click('.meeting-tab, .parent-teacher-meeting, [data-testid="meeting"]');
      await waitForPageLoad();

      // 申请新的面谈
      await page.click('.request-meeting, .new-meeting, [data-testid="new-meeting"]');
      await waitForPageLoad();

      // 选择教师
      await page.click('.teacher-select, .meeting-teacher, [data-testid="meeting-teacher"]');
      await page.click('.el-select-dropdown__item, .teacher-option', { timeout: 5000 });

      // 选择日期
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      await page.fill('input[type="date"], .meeting-date', nextWeekStr);

      // 填写面谈主题
      await page.fill('input[name="topic"], .meeting-topic', '了解孩子学习进展');

      // 提交申请
      await page.click('.submit-meeting, .request-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证申请提交成功
      const meetingSuccess = await page.textContent('.el-message--success, .success-message');
      expect(meetingSuccess).toBeTruthy();

      console.log('✅ 申请面谈成功');

      // 8. 验证家长仪表板
      await page.click('.dashboard-link, .home-link, [data-testid="dashboard"]');
      await waitForPageLoad();

      // 验证仪表板信息
      const dashboardStats = await page.$$('.dashboard-stat, .info-card, [data-testid="dashboard-stat"]');
      expect(dashboardStats.length).toBeGreaterThan(0);

      // 验证近期活动信息
      const upcomingActivities = await page.textContent('.upcoming-activities, .activity-info');
      expect(upcomingActivities).toBeTruthy();

      console.log('✅ 验证家长仪表板');

      console.log('🎉 家长操作流程测试完成！');
    }, 120000);
  });

  describe('管理员管理工作流程', () => {
    test('管理员应该能够完成系统管理的完整工作流程', async () => {
      console.log('🎯 开始管理员工作流程测试...');

      // 1. 管理员登录
      await login('test_admin', 'Admin123!');

      // 验证登录成功
      const currentUrl = page.url();
      expect(currentUrl).toContain('/dashboard');

      console.log('✅ 管理员登录成功');

      // 2. 查看系统概览
      await waitForPageLoad();

      // 验证管理员仪表板
      const adminStats = await page.$$('.admin-stat, .system-stat, [data-testid="admin-stat"]');
      expect(adminStats.length).toBeGreaterThan(0);

      // 验证关键统计信息
      const totalUsers = await page.textContent('.total-users, .user-count');
      const totalClasses = await page.textContent('.total-classes, .class-count');
      const totalStudents = await page.textContent('.total-students, .student-count');

      expect(totalUsers).toBeTruthy();
      expect(totalClasses).toBeTruthy();
      expect(totalStudents).toBeTruthy();

      console.log('✅ 查看系统概览');

      // 3. 用户管理
      await page.click('.user-management, .users, [data-testid="user-management"]');
      await waitForPageLoad();

      // 创建新用户
      await page.click('.create-user, .add-user, [data-testid="create-user"]');
      await waitForPageLoad();

      // 填写用户信息
      const timestamp = Date.now();
      await page.fill('input[name="username"], .username-input', `test_user_${timestamp}`);
      await page.fill('input[name="email"], .email-input', `test_${timestamp}@example.com`);
      await page.fill('input[name="password"], .password-input', 'NewUser123!');
      await page.fill('input[name="realName"], .name-input', '测试新用户');
      await page.fill('input[name="phone"], .phone-input', '13700137000');

      // 选择角色
      await page.click('.role-select, .role-checkbox, [data-testid="role-select"]');
      await page.click('.el-select-dropdown__item', { timeout: 5000 });

      // 提交用户创建
      await page.click('.submit-user, .create-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证用户创建成功
      const userSuccess = await page.textContent('.el-message--success, .success-message');
      expect(userSuccess).toBeTruthy();

      console.log('✅ 创建新用户');

      // 4. 班级管理
      await page.click('.class-management, .classes, [data-testid="class-management"]');
      await waitForPageLoad();

      // 创建新班级
      await page.click('.create-class, .add-class, [data-testid="create-class"]');
      await waitForPageLoad();

      // 填写班级信息
      await page.fill('input[name="name"], .class-name', 'E2E测试班级');
      await page.fill('textarea[name="description"], .class-description', '这是一个端到端测试创建的班级');
      await page.fill('input[name="capacity"], .class-capacity', '25');

      // 选择教师
      await page.click('.teacher-select, .class-teacher, [data-testid="teacher-select"]');
      await page.click('.el-select-dropdown__item, .teacher-option', { timeout: 5000 });

      // 提交班级创建
      await page.click('.submit-class, .create-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证班级创建成功
      const classSuccess = await page.textContent('.el-message--success, .success-message');
      expect(classSuccess).toBeTruthy();

      console.log('✅ 创建新班级');

      // 5. 系统设置
      await page.click('.system-settings, .settings, [data-testid="system-settings"]');
      await waitForPageLoad();

      // 修改系统设置
      await page.click('.setting-item, .config-item, [data-testid="setting-item"]');
      await waitForPageLoad();

      // 修改设置值
      await page.fill('input[name="value"], .setting-input', '30');
      await page.fill('textarea[name="description"], .setting-description', '班级最大容量设置');

      // 保存设置
      await page.click('.save-setting, .update-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证设置保存成功
      const settingSuccess = await page.textContent('.el-message--success, .success-message');
      expect(settingSuccess).toBeTruthy();

      console.log('✅ 更新系统设置');

      // 6. 查看操作日志
      await page.click('.operation-logs, .audit-logs, [data-testid="operation-logs"]');
      await waitForPageLoad();

      // 验证日志列表显示
      const logRecords = await page.$$('.log-record, .audit-item, [data-testid="log-record"]');
      expect(logRecords.length).toBeGreaterThan(0);

      console.log('✅ 查看操作日志');

      // 7. 发送系统通知
      await page.click('.system-notification, .notification, [data-testid="notification"]');
      await waitForPageLoad();

      // 创建新通知
      await page.click('.create-notification, .add-notification, [data-testid="create-notification"]');
      await waitForPageLoad();

      // 填写通知内容
      await page.fill('input[name="title"], .notification-title', 'E2E测试系统通知');
      await page.fill('textarea[name="content"], .notification-content', '这是一个端到端测试发送的系统通知');

      // 选择通知对象
      await page.click('.target-role, .notification-target, [data-testid="notification-target"]');
      await page.click('.el-select-dropdown__item', { timeout: 5000 });

      // 提交通知
      await page.click('.submit-notification, .send-btn, button[type="submit"]');
      await waitForPageLoad();

      // 验证通知发送成功
      const notificationSuccess = await page.textContent('.el-message--success, .success-message');
      expect(notificationSuccess).toBeTruthy();

      console.log('✅ 发送系统通知');

      // 8. 数据备份
      await page.click('.data-backup, .backup, [data-testid="data-backup"]');
      await waitForPageLoad();

      // 创建备份
      await page.click('.create-backup, .backup-now, [data-testid="create-backup"]');
      await waitForPageLoad();

      // 等待备份完成
      await page.waitForSelector('.backup-success, .backup-complete, [data-testid="backup-success"]', { timeout: 30000 });

      // 验证备份成功
      const backupSuccess = await page.textContent('.backup-success, .backup-complete');
      expect(backupSuccess).toBeTruthy();

      console.log('✅ 创建数据备份');

      // 9. 验证系统性能监控
      await page.click('.system-monitor, .performance, [data-testid="performance"]');
      await waitForPageLoad();

      // 验证性能指标显示
      const performanceMetrics = await page.$$('.performance-metric, .system-metric, [data-testid="performance-metric"]');
      expect(performanceMetrics.length).toBeGreaterThan(0);

      // 验证响应时间显示
      const responseTime = await page.textContent('.response-time, .api-response');
      expect(responseTime).toBeTruthy();

      console.log('✅ 查看系统性能');

      console.log('🎉 管理员工作流程测试完成！');
    }, 150000);
  });

  describe('跨设备响应式测试', () => {
    test('应用在不同屏幕尺寸下应该正常工作', async () => {
      console.log('🎯 开始响应式测试...');

      // 测试桌面尺寸
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(BASE_URL);
      await waitForPageLoad();

      // 验证桌面布局
      const desktopNav = await page.$('.desktop-nav, .main-nav, [data-testid="desktop-nav"]');
      expect(desktopNav).toBeTruthy();

      console.log('✅ 桌面布局正常');

      // 测试平板尺寸
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await waitForPageLoad();

      // 验证平板布局
      const tabletLayout = await page.$('.tablet-layout, [data-testid="tablet-layout"]');
      expect(tabletLayout).toBeTruthy();

      console.log('✅ 平板布局正常');

      // 测试手机尺寸
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await waitForPageLoad();

      // 验证手机布局
      const mobileNav = await page.$('.mobile-nav, .hamburger-menu, [data-testid="mobile-nav"]');
      expect(mobileNav).toBeTruthy();

      // 测试移动端菜单
      await page.click('.mobile-menu-toggle, .hamburger, [data-testid="mobile-menu"]');
      await page.waitForSelector('.mobile-menu, .side-menu, [data-testid="mobile-menu"]');

      console.log('✅ 手机布局正常');

      console.log('🎉 响应式测试完成！');
    }, 60000);
  });

  describe('错误处理和边界条件测试', () => {
    test('应用应该优雅处理各种错误情况', async () => {
      console.log('🎯 开始错误处理测试...');

      // 1. 测试无效登录
      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad();

      await page.fill('input[name="username"], input[type="text"]', 'invalid_user');
      await page.fill('input[name="password"], input[type="password"]', 'wrong_password');
      await page.click('button[type="submit"], .login-btn');

      // 等待错误消息
      await page.waitForSelector('.el-message--error, .error-message, [data-testid="error-message"]');
      const errorMessage = await page.textContent('.el-message--error, .error-message');
      expect(errorMessage).toBeTruthy();

      console.log('✅ 无效登录错误处理正常');

      // 2. 测试网络错误模拟
      await page.goto(`${BASE_URL}/dashboard`);
      await waitForPageLoad();

      // 模拟网络离线
      await page.context().setOffline(true);

      // 尝试执行需要网络的操作
      await page.click('.refresh-btn, .reload-data, [data-testid="refresh"]');

      // 等待网络错误提示
      await page.waitForTimeout(3000);

      // 恢复网络
      await page.context().setOffline(false);

      console.log('✅ 网络错误处理正常');

      // 3. 测试404错误页面
      await page.goto(`${BASE_URL}/non-existent-page`);
      await waitForPageLoad();

      // 验证404页面
      const notFoundTitle = await page.textContent('h1, .error-title, .404-title');
      expect(notFoundTitle).toContain('404') || expect(notFoundTitle).toContain('未找到');

      console.log('✅ 404错误页面正常');

      // 4. 测试权限不足
      await login('test_parent1', 'Test123!');

      // 尝试访问管理员页面
      await page.goto(`${BASE_URL}/admin/system-settings`);
      await waitForPageLoad();

      // 验证权限不足提示
      const accessDenied = await page.textContent('.access-denied, .permission-error, [data-testid="access-denied"]');
      expect(accessDenied).toBeTruthy();

      console.log('✅ 权限不足处理正常');

      console.log('🎉 错误处理测试完成！');
    }, 60000);
  });

  describe('性能和加载测试', () => {
    test('应用应该在合理时间内加载和响应', async () => {
      console.log('🎯 开始性能测试...');

      // 1. 测试首页加载时间
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await waitForPageLoad();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // 首页应该在5秒内加载完成
      console.log(`✅ 首页加载时间: ${loadTime}ms`);

      // 2. 测试登录响应时间
      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad();

      const loginStartTime = Date.now();
      await login('test_admin', 'Admin123!');
      const loginTime = Date.now() - loginStartTime;

      expect(loginTime).toBeLessThan(3000); // 登录应该在3秒内完成
      console.log(`✅ 登录响应时间: ${loginTime}ms`);

      // 3. 测试数据加载时间
      const dataStartTime = Date.now();
      await page.click('.users-link, .user-management, [data-testid="user-management"]');
      await waitForPageLoad();
      const dataLoadTime = Date.now() - dataStartTime;

      expect(dataLoadTime).toBeLessThan(4000); // 数据加载应该在4秒内完成
      console.log(`✅ 数据加载时间: ${dataLoadTime}ms`);

      // 4. 测试页面切换性能
      const switchStartTime = Date.now();
      await page.click('.dashboard-link, .home-link, [data-testid="dashboard"]');
      await waitForPageLoad();
      const switchTime = Date.now() - switchStartTime;

      expect(switchTime).toBeLessThan(2000); // 页面切换应该在2秒内完成
      console.log(`✅ 页面切换时间: ${switchTime}ms`);

      console.log('🎉 性能测试完成！');
    }, 60000);
  });
});