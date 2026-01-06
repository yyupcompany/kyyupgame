/**
 * 端到端测试 - 活动管理模块
 * 
 * 测试覆盖：
 * - 活动列表和日历视图
 * - 活动创建、编辑、删除
 * - 活动报名和参与管理
 * - 活动评价和反馈
 * - 活动统计和报告
 * - 权限验证和工作流
 */

import { test, expect, Page } from '@playwright/test';
import { vi } from 'vitest'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

// 测试用户
const ADMIN_USER = {
  username: 'admin',
  password: 'admin123'
};

const TEACHER_USER = {
  username: 'teacher1',
  password: 'teacher123'
};

// 测试活动数据
const TEST_ACTIVITY = {
  title: 'E2E测试活动',
  description: '这是一个用于E2E测试的活动',
  type: '户外活动',
  date: '2024-12-25',
  startTime: '09:00',
  endTime: '11:00',
  location: '幼儿园操场',
  maxParticipants: 30,
  targetAge: '3-6岁',
  organizer: '张老师',
  materials: '彩纸、胶水、剪刀',
  notes: '请穿运动服'
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

describe('活动管理模块 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test.describe('活动列表功能', () => {
    test('查看活动列表', async ({ page }) => {
      await loginAsAdmin(page);
      
      // 导航到活动管理页面
      await page.click('[data-testid="nav-activities"]');
      await expect(page).toHaveURL(`${BASE_URL}/activities`);
      
      // 验证页面加载
      await expect(page.locator('[data-testid="activities-page-title"]')).toContainText('活动管理');
      await expect(page.locator('[data-testid="activities-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-activity-button"]')).toBeVisible();
      
      // 验证视图切换按钮
      await expect(page.locator('[data-testid="list-view-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="calendar-view-button"]')).toBeVisible();
      
      // 验证表格列
      const columns = ['活动名称', '类型', '日期', '时间', '地点', '参与人数', '状态', '操作'];
      for (const column of columns) {
        await expect(page.locator(`[data-testid="table-header-${column}"]`)).toBeVisible();
      }
      
      // 验证至少有一些活动数据
      const activityRows = page.locator('[data-testid="activity-row"]');
      await expect(activityRows).toHaveCountGreaterThan(0);
    });

    test('日历视图切换', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 切换到日历视图
      await page.click('[data-testid="calendar-view-button"]');
      
      // 验证日历视图
      await expect(page.locator('[data-testid="activities-calendar"]')).toBeVisible();
      await expect(page.locator('[data-testid="calendar-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-month"]')).toBeVisible();
      
      // 验证日历导航
      await expect(page.locator('[data-testid="prev-month-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-month-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="today-button"]')).toBeVisible();
      
      // 测试月份切换
      const currentMonth = await page.locator('[data-testid="current-month"]').textContent();
      await page.click('[data-testid="next-month-button"]');
      const nextMonth = await page.locator('[data-testid="current-month"]').textContent();
      expect(nextMonth).not.toBe(currentMonth);
      
      // 回到今天
      await page.click('[data-testid="today-button"]');
      
      // 切换回列表视图
      await page.click('[data-testid="list-view-button"]');
      await expect(page.locator('[data-testid="activities-table"]')).toBeVisible();
    });

    test('活动搜索和筛选', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 按标题搜索
      await page.fill('[data-testid="search-input"]', '圣诞');
      await page.click('[data-testid="search-button"]');
      
      // 验证搜索结果
      const searchResults = page.locator('[data-testid="activity-row"]');
      await expect(searchResults).toHaveCountGreaterThan(0);
      
      // 验证结果包含搜索关键词
      const firstResult = searchResults.first();
      await expect(firstResult.locator('[data-testid="activity-title"]')).toContainText('圣诞');
      
      // 按类型筛选
      await page.click('[data-testid="type-filter-dropdown"]');
      await page.click('[data-testid="type-filter-outdoor"]');
      
      // 验证筛选结果
      const filteredResults = page.locator('[data-testid="activity-row"]');
      const types = await filteredResults.locator('[data-testid="activity-type"]').allTextContents();
      expect(types.every(type => type.includes('户外'))).toBeTruthy();
      
      // 按状态筛选
      await page.click('[data-testid="status-filter-dropdown"]');
      await page.click('[data-testid="status-filter-upcoming"]');
      
      // 按日期范围筛选
      await page.fill('[data-testid="date-range-start"]', '2024-12-01');
      await page.fill('[data-testid="date-range-end"]', '2024-12-31');
      await page.click('[data-testid="apply-date-filter"]');
      
      // 清除所有筛选
      await page.click('[data-testid="clear-filters-button"]');
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    });
  });

  test.describe('活动管理操作', () => {
    test('创建新活动', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 点击添加活动按钮
      await page.click('[data-testid="add-activity-button"]');
      await expect(page.locator('[data-testid="add-activity-dialog"]')).toBeVisible();
      
      // 填写活动信息
      await fillActivityForm(page, TEST_ACTIVITY);
      
      // 上传活动图片
      await page.setInputFiles('[data-testid="activity-image-upload"]', {
        name: 'activity.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('mock image data')
      });
      
      // 保存活动
      await page.click('[data-testid="save-activity-button"]');
      
      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]')).toContainText('活动创建成功');
      
      // 验证活动出现在列表中
      await expect(page.locator(`[data-testid="activity-${TEST_ACTIVITY.title}"]`)).toBeVisible();
      
      // 验证活动详细信息
      const activityRow = page.locator(`[data-testid="activity-${TEST_ACTIVITY.title}"]`);
      await expect(activityRow.locator('[data-testid="activity-title"]')).toContainText(TEST_ACTIVITY.title);
      await expect(activityRow.locator('[data-testid="activity-type"]')).toContainText(TEST_ACTIVITY.type);
      await expect(activityRow.locator('[data-testid="activity-date"]')).toContainText('12月25日');
    });

    test('编辑活动信息', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 找到第一个活动并点击编辑
      const firstActivity = page.locator('[data-testid="activity-row"]').first();
      await firstActivity.locator('[data-testid="edit-activity-button"]').click();
      
      await expect(page.locator('[data-testid="edit-activity-dialog"]')).toBeVisible();
      
      // 修改活动信息
      const updatedActivity = {
        ...TEST_ACTIVITY,
        title: '已修改的活动',
        maxParticipants: 50
      };
      
      await fillActivityForm(page, updatedActivity, true);
      
      // 保存修改
      await page.click('[data-testid="save-activity-button"]');
      
      // 验证修改成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('活动更新成功');
      
      // 验证修改后的信息
      await expect(page.locator(`[data-testid="activity-${updatedActivity.title}"]`)).toBeVisible();
    });

    test('复制活动', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 找到第一个活动并点击复制
      const firstActivity = page.locator('[data-testid="activity-row"]').first();
      const originalTitle = await firstActivity.locator('[data-testid="activity-title"]').textContent();
      
      await firstActivity.locator('[data-testid="copy-activity-button"]').click();
      
      // 验证复制对话框
      await expect(page.locator('[data-testid="copy-activity-dialog"]')).toBeVisible();
      
      // 修改复制后的活动标题
      await page.fill('[data-testid="activity-title-input"]', `${originalTitle} (副本)`);
      
      // 确认复制
      await page.click('[data-testid="confirm-copy-button"]');
      
      // 验证复制成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('活动复制成功');
      
      // 验证复制的活动出现在列表中
      await expect(page.locator(`[data-testid="activity-${originalTitle} (副本)"]`)).toBeVisible();
    });

    test('删除活动', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 记录删除前的活动数量
      const initialCount = await page.locator('[data-testid="activity-row"]').count();
      
      // 删除第一个活动
      const firstActivity = page.locator('[data-testid="activity-row"]').first();
      const activityTitle = await firstActivity.locator('[data-testid="activity-title"]').textContent();
      
      await firstActivity.locator('[data-testid="delete-activity-button"]').click();
      
      // 确认删除
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-confirmation-text"]')).toContainText(activityTitle || '');
      
      await page.click('[data-testid="confirm-delete-button"]');
      
      // 验证删除成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('活动删除成功');
      
      // 验证活动数量减少
      const finalCount = await page.locator('[data-testid="activity-row"]').count();
      expect(finalCount).toBe(initialCount - 1);
    });

    test('查看活动详情', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 点击第一个活动的详情
      const firstActivity = page.locator('[data-testid="activity-row"]').first();
      await firstActivity.locator('[data-testid="view-activity-button"]').click();
      
      // 验证活动详情页面
      await expect(page).toHaveURL(/\/activities\/\d+$/);
      await expect(page.locator('[data-testid="activity-detail-page"]')).toBeVisible();
      
      // 验证基本信息
      await expect(page.locator('[data-testid="activity-title-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-description-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-date-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-location-display"]')).toBeVisible();
      
      // 验证参与者列表
      await expect(page.locator('[data-testid="participants-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="participants-count"]')).toBeVisible();
      
      // 验证活动图片
      await expect(page.locator('[data-testid="activity-images"]')).toBeVisible();
      
      // 验证评价和反馈
      await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible();
    });
  });

  test.describe('活动报名管理', () => {
    test('管理活动报名', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 点击第一个活动的报名管理
      const firstActivity = page.locator('[data-testid="activity-row"]').first();
      await firstActivity.locator('[data-testid="manage-registration-button"]').click();
      
      // 验证报名管理页面
      await expect(page.locator('[data-testid="registration-management-dialog"]')).toBeVisible();
      
      // 验证报名统计
      await expect(page.locator('[data-testid="registration-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-registrations"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirmed-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-count"]')).toBeVisible();
      
      // 验证报名列表
      await expect(page.locator('[data-testid="registrations-table"]')).toBeVisible();
      
      // 测试批准报名
      const firstRegistration = page.locator('[data-testid="registration-row"]').first();
      if (await firstRegistration.locator('[data-testid="approve-button"]').isVisible()) {
        await firstRegistration.locator('[data-testid="approve-button"]').click();
        await expect(page.locator('[data-testid="success-message"]')).toContainText('报名已批准');
      }
      
      // 测试拒绝报名
      const secondRegistration = page.locator('[data-testid="registration-row"]').nth(1);
      if (await secondRegistration.locator('[data-testid="reject-button"]').isVisible()) {
        await secondRegistration.locator('[data-testid="reject-button"]').click();
        
        // 填写拒绝原因
        await page.fill('[data-testid="reject-reason-input"]', '活动已满');
        await page.click('[data-testid="confirm-reject-button"]');
        
        await expect(page.locator('[data-testid="success-message"]')).toContainText('报名已拒绝');
      }
      
      // 测试导出报名名单
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-registrations-button"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/registrations.*\.xlsx$/);
    });

    test('手动添加参与者', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 进入活动报名管理
      const firstActivity = page.locator('[data-testid="activity-row"]').first();
      await firstActivity.locator('[data-testid="manage-registration-button"]').click();
      
      // 点击添加参与者
      await page.click('[data-testid="add-participant-button"]');
      
      // 验证添加参与者对话框
      await expect(page.locator('[data-testid="add-participant-dialog"]')).toBeVisible();
      
      // 搜索并选择学生
      await page.fill('[data-testid="student-search-input"]', '张小明');
      await page.click('[data-testid="search-students-button"]');
      
      // 选择学生
      await page.click('[data-testid="student-option-1"]');
      
      // 确认添加
      await page.click('[data-testid="confirm-add-button"]');
      
      // 验证添加成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('参与者添加成功');
      
      // 验证参与者出现在列表中
      await expect(page.locator('[data-testid="participant-张小明"]')).toBeVisible();
    });
  });

  test.describe('活动评价和反馈', () => {
    test('查看活动评价', async ({ page }) => {
      await loginAsAdmin(page);
      
      // 进入活动详情页面
      await page.goto(`${BASE_URL}/activities/1`);
      
      // 滚动到评价区域
      await page.locator('[data-testid="reviews-section"]').scrollIntoViewIfNeeded();
      
      // 验证评价统计
      await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-reviews"]')).toBeVisible();
      await expect(page.locator('[data-testid="rating-distribution"]')).toBeVisible();
      
      // 验证评价列表
      const reviews = page.locator('[data-testid="review-item"]');
      await expect(reviews).toHaveCountGreaterThan(0);
      
      // 验证评价内容
      const firstReview = reviews.first();
      await expect(firstReview.locator('[data-testid="reviewer-name"]')).toBeVisible();
      await expect(firstReview.locator('[data-testid="review-rating"]')).toBeVisible();
      await expect(firstReview.locator('[data-testid="review-content"]')).toBeVisible();
      await expect(firstReview.locator('[data-testid="review-date"]')).toBeVisible();
    });

    test('回复评价', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities/1`);
      
      // 找到第一个评价并点击回复
      const firstReview = page.locator('[data-testid="review-item"]').first();
      await firstReview.locator('[data-testid="reply-button"]').click();
      
      // 填写回复内容
      await page.fill('[data-testid="reply-input"]', '感谢您的反馈，我们会继续努力！');
      
      // 提交回复
      await page.click('[data-testid="submit-reply-button"]');
      
      // 验证回复成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('回复提交成功');
      
      // 验证回复显示
      await expect(firstReview.locator('[data-testid="admin-reply"]')).toBeVisible();
      await expect(firstReview.locator('[data-testid="reply-content"]')).toContainText('感谢您的反馈');
    });
  });

  test.describe('活动统计报告', () => {
    test('查看活动统计', async ({ page }) => {
      await loginAsAdmin(page);
      
      // 导航到活动统计页面
      await page.click('[data-testid="nav-activities"]');
      await page.click('[data-testid="activity-statistics-tab"]');
      
      // 验证统计页面
      await expect(page.locator('[data-testid="activity-statistics-page"]')).toBeVisible();
      
      // 验证概览统计
      await expect(page.locator('[data-testid="total-activities-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-activities-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-participants-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="average-rating-card"]')).toBeVisible();
      
      // 验证图表
      await expect(page.locator('[data-testid="activities-by-month-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="activities-by-type-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="participation-trend-chart"]')).toBeVisible();
      
      // 验证热门活动排行
      await expect(page.locator('[data-testid="popular-activities-ranking"]')).toBeVisible();
      
      // 测试时间范围筛选
      await page.click('[data-testid="time-range-selector"]');
      await page.click('[data-testid="last-month-option"]');
      
      // 验证统计数据更新
      await expect(page.locator('[data-testid="statistics-updated"]')).toBeVisible();
    });

    test('导出活动报告', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities/statistics`);
      
      // 设置报告参数
      await page.click('[data-testid="report-settings-button"]');
      await page.check('[data-testid="include-participants"]');
      await page.check('[data-testid="include-reviews"]');
      
      // 选择日期范围
      await page.fill('[data-testid="report-start-date"]', '2024-01-01');
      await page.fill('[data-testid="report-end-date"]', '2024-12-31');
      
      // 生成并下载报告
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="generate-report-button"]');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/activity_report.*\.pdf$/);
    });
  });

  test.describe('权限验证', () => {
    test('教师权限限制', async ({ page }) => {
      await loginAsTeacher(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 验证教师可以查看活动列表
      await expect(page.locator('[data-testid="activities-table"]')).toBeVisible();
      
      // 验证教师可以创建活动
      await expect(page.locator('[data-testid="add-activity-button"]')).toBeVisible();
      
      // 验证教师不能删除其他人的活动
      const firstActivity = page.locator('[data-testid="activity-row"]').first();
      const deleteButton = firstActivity.locator('[data-testid="delete-activity-button"]');
      
      // 如果活动不是该教师创建的，删除按钮应该不可见或禁用
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toBeDisabled();
      }
      
      // 验证教师不能访问系统级统计
      await expect(page.locator('[data-testid="system-statistics-button"]')).not.toBeVisible();
    });

    test('家长查看活动', async ({ page }) => {
      // 家长登录
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[data-testid="username-input"]', 'parent1');
      await page.fill('[data-testid="password-input"]', 'parent123');
      await page.click('[data-testid="login-button"]');
      
      // 导航到活动页面
      await page.click('[data-testid="nav-activities"]');
      
      // 验证家长只能查看公开活动
      await expect(page.locator('[data-testid="public-activities-list"]')).toBeVisible();
      
      // 验证家长可以报名参加活动
      const firstActivity = page.locator('[data-testid="activity-card"]').first();
      await expect(firstActivity.locator('[data-testid="register-button"]')).toBeVisible();
      
      // 验证家长不能创建或编辑活动
      await expect(page.locator('[data-testid="add-activity-button"]')).not.toBeVisible();
    });
  });

  test.describe('响应式设计', () => {
    test('移动端活动管理界面', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 验证移动端布局
      await expect(page.locator('[data-testid="mobile-activities-view"]')).toBeVisible();
      
      // 验证移动端活动卡片
      await expect(page.locator('[data-testid="mobile-activity-card"]').first()).toBeVisible();
      
      // 测试移动端搜索
      await page.click('[data-testid="mobile-search-button"]');
      await expect(page.locator('[data-testid="mobile-search-overlay"]')).toBeVisible();
      
      // 测试移动端添加活动
      await page.click('[data-testid="mobile-add-activity-fab"]');
      await expect(page.locator('[data-testid="mobile-add-activity-form"]')).toBeVisible();
    });

    test('平板端日历视图', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/activities`);
      
      // 切换到日历视图
      await page.click('[data-testid="calendar-view-button"]');
      
      // 验证平板端日历布局
      await expect(page.locator('[data-testid="tablet-calendar-view"]')).toBeVisible();
      
      // 测试侧边栏显示
      await expect(page.locator('[data-testid="calendar-sidebar"]')).toBeVisible();
    });
  });
});

/**
 * 管理员登录辅助函数
 */
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="username-input"]', ADMIN_USER.username);
  await page.fill('[data-testid="password-input"]', ADMIN_USER.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

/**
 * 教师登录辅助函数
 */
async function loginAsTeacher(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="username-input"]', TEACHER_USER.username);
  await page.fill('[data-testid="password-input"]', TEACHER_USER.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

/**
 * 填写活动表单辅助函数
 */
async function fillActivityForm(page: Page, activity: typeof TEST_ACTIVITY, isEdit = false) {
  if (!isEdit) {
    await page.fill('[data-testid="activity-title-input"]', activity.title);
  }
  
  // 填写描述
  await page.fill('[data-testid="activity-description-input"]', activity.description);
  
  // 选择活动类型
  await page.click('[data-testid="activity-type-selector"]');
  await page.click(`[data-testid="type-option-${activity.type}"]`);
  
  // 设置日期和时间
  await page.fill('[data-testid="activity-date-input"]', activity.date);
  await page.fill('[data-testid="start-time-input"]', activity.startTime);
  await page.fill('[data-testid="end-time-input"]', activity.endTime);
  
  // 填写地点
  await page.fill('[data-testid="location-input"]', activity.location);
  
  // 设置最大参与人数
  await page.fill('[data-testid="max-participants-input"]', activity.maxParticipants.toString());
  
  // 填写目标年龄
  await page.fill('[data-testid="target-age-input"]', activity.targetAge);
  
  // 填写组织者
  await page.fill('[data-testid="organizer-input"]', activity.organizer);
  
  // 填写所需材料
  await page.fill('[data-testid="materials-input"]', activity.materials);
  
  // 填写备注
  await page.fill('[data-testid="notes-input"]', activity.notes);
}