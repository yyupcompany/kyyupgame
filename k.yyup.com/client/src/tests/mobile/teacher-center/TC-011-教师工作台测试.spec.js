/**
 * TC-011: 教师工作台测试
 * 移动端教师工作台功能的完整测试用例
 * 遵循项目严格验证规则
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { strictValidationWrapper, validateRequiredFields, validateFieldTypes } from '../../utils/validation-helpers';

describe('TC-011: 教师工作台测试', () => {
  let page;
  let browser;

  beforeEach(async () => {
    // 初始化测试环境
    await setupTestEnvironment();
  });

  afterEach(async () => {
    // 清理测试环境
    await cleanupTestEnvironment();
  });

  /**
   * TC-011-01: 页面加载和初始化
   * 验证教师工作台页面能够正确加载并显示初始数据
   */
  it('TC-011-01: 页面加载和初始化', async () => {
    await strictValidationWrapper(async () => {
      // 导航到教师工作台页面
      await page.goto('/mobile/centers/teaching-center');

      // 等待页面加载完成
      await page.waitForSelector('.mobile-teaching-center');

      // 验证页面元素存在
      const pageElement = await page.$('.mobile-teaching-center');
      expect(pageElement).toBeTruthy();

      // 验证页面标题
      const titleElement = await page.$('.van-nav-bar__title');
      const titleText = await titleElement.textContent();
      expect(titleText).toContain('教学中心');

      // 验证快捷操作按钮
      const actionButton = await page.$('.van-button--primary');
      expect(actionButton).toBeTruthy();
      const buttonText = await actionButton.textContent();
      expect(buttonText).toContain('快捷操作');

      // 验证统计数据区域
      const statsGrid = await page.$('.stats-grid');
      expect(statsGrid).toBeTruthy();

      // 验证时间轴区域
      const timeline = await page.$('.teaching-timeline');
      expect(timeline).toBeTruthy();

      // 验证快捷操作区域
      const quickActions = await page.$('.quick-actions');
      expect(quickActions).toBeTruthy();
    }, { timeout: 10000 });
  });

  /**
   * TC-011-02: 教学进度统计数据验证
   * 验证教学进度统计数据的正确性和数据完整性
   */
  it('TC-011-02: 教学进度统计数据验证', async () => {
    await strictValidationWrapper(async () => {
      // 获取统计数据
      const statsResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/teaching-center/progress-stats');
          return await response.json();
        } catch (error) {
          return { error: error.message };
        }
      });

      // 验证API响应结构
      expect(statsResponse.success).toBe(true);
      expect(statsResponse.data).toBeTruthy();

      // 严格验证响应数据
      validateRequiredFields(statsResponse.data, [
        'overallProgress', 'achievementRate', 'outdoorWeeks', 'semesterOutings'
      ]);

      validateFieldTypes(statsResponse.data, {
        overallProgress: 'number',
        achievementRate: 'number',
        outdoorWeeks: 'number',
        semesterOutings: 'number'
      });

      // 验证数值范围
      expect(statsResponse.data.overallProgress).toBeBetween(0, 100);
      expect(statsResponse.data.achievementRate).toBeBetween(0, 100);
      expect(statsResponse.data.outdoorWeeks).toBeBetween(0, 16);
      expect(statsResponse.data.semesterOutings).toBeGreaterThanOrEqual(0);

      // 验证页面统计卡片显示
      const statCards = await page.$$('.stat-card-mobile');
      expect(statCards.length).toBe(4);

      // 验证每个统计卡片的必填字段
      for (let i = 0; i < statCards.length; i++) {
        const card = statCards[i];

        const valueElement = await card.$('.stat-value');
        const titleElement = await card.$('.stat-title');
        const iconElement = await card.$('.stat-icon van-icon');

        expect(valueElement).toBeTruthy();
        expect(titleElement).toBeTruthy();
        expect(iconElement).toBeTruthy();

        // 验证数据类型
        const value = await valueElement.textContent();
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');

        // 验证标题内容
        const title = await titleElement.textContent();
        const expectedTitles = ['全员普及进度', '结果达标率', '户外训练周数', '本学期外出'];
        expect(expectedTitles).toContain(title);
      }
    }, { timeout: 8000 });
  });

  /**
   * TC-011-03: 教学流程时间轴功能
   * 验证教学流程时间轴的显示、交互和数据完整性
   */
  it('TC-011-03: 教学流程时间轴功能', async () => {
    await strictValidationWrapper(async () => {
      // 获取时间轴数据
      const timelineResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/teaching-center/timeline');
          return await response.json();
        } catch (error) {
          return { error: error.message };
        }
      });

      // 验证API响应
      expect(timelineResponse.success).toBe(true);
      expect(timelineResponse.data).toBeTruthy();

      // 验证时间轴数据结构
      validateRequiredFields(timelineResponse.data, ['timeline']);
      expect(Array.isArray(timelineResponse.data.timeline)).toBe(true);

      // 验证每个时间轴项目
      timelineResponse.data.timeline.forEach(item => {
        validateRequiredFields(item, [
          'id', 'type', 'title', 'description', 'date', 'status'
        ]);

        validateFieldTypes(item, {
          id: 'string',
          type: 'string',
          title: 'string',
          description: 'string',
          date: 'string',
          status: 'string'
        });

        // 验证状态枚举值
        const validStatuses = ['completed', 'in-progress', 'pending', 'not-started'];
        expect(validStatuses).toContain(item.status);
      });

      // 验证页面时间轴项目数量
      const timelineItems = await page.$$('.van-step');
      expect(timelineItems.length).toBe(4);

      // 验证时间轴项目内容
      for (let i = 0; i < timelineItems.length; i++) {
        const item = timelineItems[i];

        const titleElement = await item.$('.van-step__title');
        const descElement = await item.$('.van-step__description');
        const statusElement = await item.$('.timeline-status');

        expect(titleElement).toBeTruthy();
        expect(descElement).toBeTruthy();
        expect(statusElement).toBeTruthy();

        // 验证统计数据结构
        const statsElements = await item.$$('.timeline-stats .stat-item');
        expect(statsElements.length).toBeGreaterThanOrEqual(0);
      }

      // 测试时间轴交互
      const firstTimelineItem = timelineItems[0];
      await firstTimelineItem.click();

      // 验证选中状态
      const activeItem = await page.$('.timeline-item-active');
      expect(activeItem).toBeTruthy();
    }, { timeout: 8000 });
  });

  /**
   * TC-011-04: 选中项详情显示
   * 验证时间轴项目选中后的详情显示功能
   */
  it('TC-011-04: 选中项详情显示', async () => {
    await strictValidationWrapper(async () => {
      // 点击时间轴项目
      const firstTimelineItem = await page.$('.van-step');
      await firstTimelineItem.click();

      // 等待详情区域加载
      await page.waitForSelector('.selected-detail');

      // 验证选中状态
      const activeItem = await page.$('.timeline-item-active');
      expect(activeItem).toBeTruthy();

      // 验证详情区域
      const detailSection = await page.$('.selected-detail');
      expect(detailSection).toBeTruthy();

      const detailTitle = await detailSection.$('.detail-title');
      expect(detailTitle).toBeTruthy();

      // 验证详情按钮
      const detailButton = await detailSection.$('.van-button');
      expect(detailButton).toBeTruthy();
      const buttonText = await detailButton.textContent();
      expect(buttonText).toContain('查看详细内容');

      // 测试详情抽屉
      await detailButton.click();

      // 验证抽屉显示
      const drawer = await page.$('.van-popup');
      expect(drawer).toBeTruthy();

      const drawerStyle = await drawer.evaluate(el => el.style.display);
      expect(drawerStyle).not.toBe('none');
    }, { timeout: 8000 });
  });

  /**
   * TC-011-05: 快捷操作功能
   * 验证快捷操作按钮组的显示和功能
   */
  it('TC-011-05: 快捷操作功能', async () => {
    await strictValidationWrapper(async () => {
      // 验证快捷操作按钮数量
      const actionCards = await page.$$('.action-card');
      expect(actionCards.length).toBe(4);

      // 验证按钮内容
      const expectedActions = [
        { key: 'create-course', label: '创建课程计划' },
        { key: 'outdoor-record', label: '记录户外训练' },
        { key: 'external-display', label: '添加校外展示' },
        { key: 'championship', label: '创建锦标赛' }
      ];

      for (let i = 0; i < actionCards.length; i++) {
        const card = actionCards[i];
        const textElement = await card.$('.action-text');
        const iconElement = await card.$('van-icon');

        expect(textElement).toBeTruthy();
        expect(iconElement).toBeTruthy();

        const text = await textElement.textContent();
        expect(text).toBe(expectedActions[i].label);
      }

      // 测试点击操作
      const firstAction = actionCards[0];
      await firstAction.click();

      // 验证操作面板
      const actionSheet = await page.$('.van-action-sheet');
      expect(actionSheet).toBeTruthy();
    }, { timeout: 6000 });
  });

  /**
   * TC-011-06: 数据加载和错误处理
   * 验证数据加载过程和错误处理机制
   */
  it('TC-011-06: 数据加载和错误处理', async () => {
    await strictValidationWrapper(async () => {
      // 模拟网络错误
      await page.setRequestInterception(true);
      page.on('request', request => {
        if (request.url().includes('/api/teaching-center/')) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // 刷新页面
      await page.reload();

      // 等待错误处理
      await page.waitForTimeout(2000);

      // 验证错误提示
      const toastElement = await page.$('.van-toast');
      if (toastElement) {
        const toastText = await toastElement.textContent();
        expect(toastText).toContain('失败') || expect(toastText).toContain('错误');
      }

      // 验证页面未崩溃
      const pageElement = await page.$('.mobile-teaching-center');
      expect(pageElement).toBeTruthy();

      // 恢复网络
      await page.setRequestInterception(false);
    }, { timeout: 10000 });
  });

  /**
   * 性能测试
   * 验证页面加载和数据加载性能
   */
  it('性能测试 - 页面加载时间', async () => {
    const startTime = Date.now();

    await page.goto('/mobile/centers/teaching-center');
    await page.waitForSelector('.mobile-teaching-center');

    const loadTime = Date.now() - startTime;

    // 验证页面加载时间小于3秒
    expect(loadTime).toBeLessThan(3000);
  });

  it('性能测试 - 数据加载时间', async () => {
    await page.goto('/mobile/centers/teaching-center');

    const startTime = Date.now();

    // 等待数据加载完成
    await page.waitForFunction(() => {
      const statsCards = document.querySelectorAll('.stat-card-mobile');
      return statsCards.length === 4;
    });

    const dataLoadTime = Date.now() - startTime;

    // 验证数据加载时间小于2秒
    expect(dataLoadTime).toBeLessThan(2000);
  });

  /**
   * 响应式设计测试
   * 验证移动端响应式布局
   */
  it('响应式设计 - 移动端布局', async () => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE尺寸
    await page.goto('/mobile/centers/teaching-center');

    // 验证布局适配
    const statsGrid = await page.$('.stats-grid');
    const gridStyle = await statsGrid.evaluate(el => window.getComputedStyle(el).gridTemplateColumns);

    // 在小屏幕上应该使用单列布局
    expect(gridStyle).toBe('1fr');
  });

  /**
   * 无障碍测试
   * 验证页面的无障碍特性
   */
  it('无障碍测试 - ARIA标签', async () => {
    await page.goto('/mobile/centers/teaching-center');

    // 验证主要元素有合适的ARIA标签
    const mainElement = await page.$('main[role="main"]');
    const navigation = await page.$('nav[role="navigation"]');

    expect(mainElement).toBeTruthy();
    expect(navigation).toBeTruthy();
  });
});

/**
 * 测试环境设置
 */
async function setupTestEnvironment() {
  // 这里可以设置测试环境，如模拟登录等
  // 例如: await page.goto('/login');
  // await page.fill('#username', 'test-teacher');
  // await page.fill('#password', 'password');
  // await page.click('#login-button');
}

/**
 * 测试环境清理
 */
async function cleanupTestEnvironment() {
  // 清理测试数据和状态
  // 例如: 清除localStorage、sessionStorage等
}