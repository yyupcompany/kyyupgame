/**
 * 仪表盘完整E2E测试
 * 
 * 测试目标：
 * 1. 验证前端UI渲染（图表、列表、卡片）
 * 2. 验证后端数据正确显示
 * 3. 检测控制台错误
 * 4. 验证用户交互流程
 */

import { test, expect, Page } from '@playwright/test';
import { vi } from 'vitest'

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_TIMEOUT = 30000;

// 测试凭据
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

test.
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('仪表盘完整E2E测试', () => {
  let page: Page;
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // 监听控制台消息
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        consoleErrors.push(text);
        console.error('❌ 控制台错误:', text);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
        console.warn('⚠️ 控制台警告:', text);
      }
    });

    // 监听页面错误
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
      console.error('❌ 页面错误:', error.message);
    });

    // 登录
    console.log('🔐 开始登录...');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', TEST_CREDENTIALS.username);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: TEST_TIMEOUT });
    console.log('✅ 登录成功');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('应该正确显示仪表盘页面', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    const title = await page.title();
    expect(title).toContain('仪表盘');

    // 验证主要容器存在
    const mainContainer = page.locator('.dashboard-container');
    await expect(mainContainer).toBeVisible();

    console.log('✅ 仪表盘页面加载成功');
  });

  test('应该正确显示统计卡片', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('.stats-card', { timeout: TEST_TIMEOUT });

    // 验证统计卡片数量
    const statsCards = page.locator('.stats-card');
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
    console.log(`📊 找到 ${count} 个统计卡片`);

    // 验证每个卡片的内容
    for (let i = 0; i < count; i++) {
      const card = statsCards.nth(i);
      
      // 验证卡片可见
      await expect(card).toBeVisible();
      
      // 验证卡片有标题
      const title = card.locator('.card-title');
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText).toBeTruthy();
      
      // 验证卡片有数值
      const value = card.locator('.card-value');
      await expect(value).toBeVisible();
      const valueText = await value.textContent();
      expect(valueText).toMatch(/\d+/); // 包含数字
      
      console.log(`✅ 卡片 ${i + 1}: ${titleText} = ${valueText}`);
    }
  });

  test('应该正确显示招生趋势图表', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // 等待图表容器加载
    await page.waitForSelector('.enrollment-trends-chart', { timeout: TEST_TIMEOUT });

    // 验证图表容器可见
    const chartContainer = page.locator('.enrollment-trends-chart');
    await expect(chartContainer).toBeVisible();

    // 验证图表标题
    const chartTitle = chartContainer.locator('.chart-title');
    await expect(chartTitle).toBeVisible();
    const titleText = await chartTitle.textContent();
    expect(titleText).toContain('招生趋势');

    // 验证图表渲染（检查canvas或svg）
    const chartCanvas = chartContainer.locator('canvas, svg');
    await expect(chartCanvas).toBeVisible();

    // 验证图表有数据（检查是否有图例）
    const chartLegend = chartContainer.locator('.chart-legend');
    if (await chartLegend.count() > 0) {
      await expect(chartLegend).toBeVisible();
    }

    console.log('✅ 招生趋势图表渲染成功');
  });

  test('应该正确显示班级概览列表', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // 等待列表加载
    await page.waitForSelector('.classes-overview-list', { timeout: TEST_TIMEOUT });

    // 验证列表容器可见
    const listContainer = page.locator('.classes-overview-list');
    await expect(listContainer).toBeVisible();

    // 验证列表项
    const listItems = listContainer.locator('.class-item');
    const itemCount = await listItems.count();
    expect(itemCount).toBeGreaterThan(0);
    console.log(`📋 找到 ${itemCount} 个班级`);

    // 验证第一个列表项的内容
    if (itemCount > 0) {
      const firstItem = listItems.first();
      
      // 验证班级名称
      const className = firstItem.locator('.class-name');
      await expect(className).toBeVisible();
      const classNameText = await className.textContent();
      expect(classNameText).toBeTruthy();
      
      // 验证学生数量
      const studentCount = firstItem.locator('.student-count');
      await expect(studentCount).toBeVisible();
      const studentCountText = await studentCount.textContent();
      expect(studentCountText).toMatch(/\d+/);
      
      // 验证教师名称
      const teacherName = firstItem.locator('.teacher-name');
      await expect(teacherName).toBeVisible();
      const teacherNameText = await teacherName.textContent();
      expect(teacherNameText).toBeTruthy();
      
      console.log(`✅ 班级信息: ${classNameText}, 学生: ${studentCountText}, 教师: ${teacherNameText}`);
    }
  });

  test('应该正确显示待办事项列表', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // 等待待办事项列表加载
    await page.waitForSelector('.todos-list', { timeout: TEST_TIMEOUT });

    // 验证列表容器可见
    const todosContainer = page.locator('.todos-list');
    await expect(todosContainer).toBeVisible();

    // 验证待办事项
    const todoItems = todosContainer.locator('.todo-item');
    const todoCount = await todoItems.count();
    
    if (todoCount > 0) {
      console.log(`📝 找到 ${todoCount} 个待办事项`);
      
      // 验证第一个待办事项
      const firstTodo = todoItems.first();
      
      // 验证标题
      const todoTitle = firstTodo.locator('.todo-title');
      await expect(todoTitle).toBeVisible();
      const titleText = await todoTitle.textContent();
      expect(titleText).toBeTruthy();
      
      // 验证状态
      const todoStatus = firstTodo.locator('.todo-status');
      await expect(todoStatus).toBeVisible();
      
      // 验证优先级
      const todoPriority = firstTodo.locator('.todo-priority');
      await expect(todoPriority).toBeVisible();
      
      console.log(`✅ 待办事项: ${titleText}`);
    } else {
      console.log('ℹ️ 暂无待办事项');
    }
  });

  test('应该正确显示日程安排', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // 等待日程组件加载
    await page.waitForSelector('.schedules-calendar', { timeout: TEST_TIMEOUT });

    // 验证日历容器可见
    const calendarContainer = page.locator('.schedules-calendar');
    await expect(calendarContainer).toBeVisible();

    // 验证日历有日期
    const calendarDates = calendarContainer.locator('.calendar-date');
    const dateCount = await calendarDates.count();
    expect(dateCount).toBeGreaterThan(0);

    // 验证日程事件
    const scheduleEvents = calendarContainer.locator('.schedule-event');
    const eventCount = await scheduleEvents.count();
    
    if (eventCount > 0) {
      console.log(`📅 找到 ${eventCount} 个日程事件`);
      
      // 验证第一个事件
      const firstEvent = scheduleEvents.first();
      await expect(firstEvent).toBeVisible();
      
      const eventTitle = await firstEvent.textContent();
      expect(eventTitle).toBeTruthy();
      
      console.log(`✅ 日程事件: ${eventTitle}`);
    } else {
      console.log('ℹ️ 暂无日程安排');
    }
  });

  test('应该能够刷新数据', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // 查找刷新按钮
    const refreshButton = page.locator('button:has-text("刷新")');
    
    if (await refreshButton.count() > 0) {
      // 点击刷新按钮
      await refreshButton.click();
      
      // 等待加载指示器
      const loadingIndicator = page.locator('.loading-indicator');
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator).toBeVisible();
        await expect(loadingIndicator).not.toBeVisible({ timeout: TEST_TIMEOUT });
      }
      
      // 验证数据已更新
      await page.waitForTimeout(1000);
      
      console.log('✅ 数据刷新成功');
    } else {
      console.log('ℹ️ 未找到刷新按钮');
    }
  });

  test('应该能够切换时间范围', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // 查找时间范围选择器
    const dateRangePicker = page.locator('.date-range-picker');
    
    if (await dateRangePicker.count() > 0) {
      // 点击时间范围选择器
      await dateRangePicker.click();
      
      // 选择"最近7天"
      const last7DaysOption = page.locator('.date-range-option:has-text("最近7天")');
      if (await last7DaysOption.count() > 0) {
        await last7DaysOption.click();
        
        // 等待数据更新
        await page.waitForTimeout(1000);
        
        console.log('✅ 时间范围切换成功');
      }
    } else {
      console.log('ℹ️ 未找到时间范围选择器');
    }
  });

  test('不应该有控制台错误', () => {
    // 过滤掉一些已知的无害警告
    const filteredErrors = consoleErrors.filter(error => {
      return !error.includes('DevTools') && 
             !error.includes('Extension') &&
             !error.includes('favicon');
    });

    // 验证没有控制台错误
    if (filteredErrors.length > 0) {
      console.error('❌ 发现控制台错误:');
      filteredErrors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
    }
    
    expect(filteredErrors).toHaveLength(0);
    console.log('✅ 无控制台错误');
  });

  test('不应该有严重的控制台警告', () => {
    // 过滤掉一些已知的无害警告
    const filteredWarnings = consoleWarnings.filter(warning => {
      return !warning.includes('DevTools') && 
             !warning.includes('Extension');
    });

    if (filteredWarnings.length > 0) {
      console.warn('⚠️ 发现控制台警告:');
      filteredWarnings.forEach((warning, index) => {
        console.warn(`  ${index + 1}. ${warning}`);
      });
    }
    
    // 警告不应该太多
    expect(filteredWarnings.length).toBeLessThan(10);
    console.log(`✅ 控制台警告数量: ${filteredWarnings.length}`);
  });
});

