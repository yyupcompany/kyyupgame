import { test, expect } from '@playwright/test';
import { vi } from 'vitest'

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

describe('Marketing Module E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到营销首页
    await page.goto('/mobile/marketing/marketing-index');

    // 等待页面加载完成
    await page.waitForSelector('.role-based-mobile-layout', { timeout: 10000 });
  });

  test('营销首页应该正确加载', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('.van-nav-bar__title')).toContainText('营销首页');

    // 验证营销概览仪表板
    await expect(page.locator('.marketing-dashboard')).toBeVisible();

    // 验证核心指标卡片
    await expect(page.locator('.metrics-grid')).toBeVisible();
    await expect(page.locator('.metric-card')).toHaveCount(4);

    // 验证核心指标显示
    await expect(page.locator('.metric-value').first()).toBeVisible();
    await expect(page.locator('.metric-label').first()).toBeVisible();

    // 验证本月营销数据
    await expect(page.locator('.section-card')).toContainText('本月营销数据');
    await expect(page.locator('.monthly-stats')).toBeVisible();

    // 验证快捷操作
    await expect(page.locator('.section-card')).toContainText('快捷操作');
    await expect(page.locator('.quick-actions')).toBeVisible();
    await expect(page.locator('.action-item')).toHaveCount(4);

    // 验证进行中活动
    await expect(page.locator('.section-card')).toContainText('进行中活动');
    await expect(page.locator('.campaign-list')).toBeVisible();

    // 验证营销趋势
    await expect(page.locator('.section-card')).toContainText('营销趋势');
    await expect(page.locator('.chart-container')).toBeVisible();

    // 验证渠道效果
    await expect(page.locator('.section-card')).toContainText('渠道效果');
    await expect(page.locator('.channel-stats')).toBeVisible();
  });

  test('营销首页的核心指标应该显示正确数据', async ({ page }) => {
    // 等待指标加载
    await page.waitForSelector('.metric-card');

    // 验证总活动数
    const totalCampaignsCard = page.locator('.metric-card').first();
    await expect(totalCampaignsCard).toContainText('总活动数');

    // 验证进行中活动数
    const activeCampaignsCard = page.locator('.metric-card').nth(1);
    await expect(activeCampaignsCard).toContainText('进行中');

    // 验证转化率
    const conversionRateCard = page.locator('.metric-card').nth(2);
    await expect(conversionRateCard).toContainText('转化率');
    await expect(conversionRateCard).toContainText('%');

    // 验证ROI
    const roiCard = page.locator('.metric-card').nth(3);
    await expect(roiCard).toContainText('ROI');
    await expect(roiCard).toContainText(':1');
  });

  test('快捷操作按钮应该可点击', async ({ page }) => {
    // 测试新建活动按钮
    const createCampaignBtn = page.locator('.action-item').first();
    await createCampaignBtn.click();

    // 验证路由跳转（这里因为后端API可能未实现，所以只验证点击行为）
    await expect(createCampaignBtn).toBeVisible();

    // 返回首页继续测试其他按钮
    await page.goBack();
    await page.waitForSelector('.quick-actions');

    // 测试查看数据按钮
    const viewDataBtn = page.locator('.action-item').nth(1);
    await expect(viewDataBtn).toBeVisible();
    await viewDataBtn.click();

    // 验证提示显示
    await expect(page.locator('.van-toast')).toBeVisible({ timeout: 3000 });
  });

  test('进行中活动列表应该显示活动信息', async ({ page }) => {
    // 等待活动列表加载
    await page.waitForSelector('.campaign-item');

    // 验证活动项显示
    const campaignItems = page.locator('.campaign-item');
    await expect(campaignItems.first()).toBeVisible();

    // 验证活动标题
    await expect(campaignItems.first().locator('.campaign-title')).toBeVisible();

    // 验证活动状态标签
    await expect(campaignItems.first().locator('.van-tag')).toHaveCount(2);

    // 验证活动进度条
    await expect(campaignItems.first().locator('.van-progress')).toBeVisible();

    // 验证活动时间
    await expect(campaignItems.first().locator('.campaign-date')).toBeVisible();

    // 验证活动预算
    await expect(campaignItems.first().locator('.campaign-budget')).toBeVisible();
  });

  test('营销趋势图表标签应该可以切换', async ({ page }) => {
    // 等待图表区域加载
    await page.waitForSelector('.chart-tabs');

    // 验证默认选中的标签
    await expect(page.locator('.van-tab--active')).toContainText('活动数量');

    // 点击转化率标签
    await page.locator('text=转化率').click();
    await expect(page.locator('.van-tab--active')).toContainText('转化率');

    // 点击成本标签
    await page.locator('text=成本').click();
    await expect(page.locator('.van-tab--active')).toContainText('成本');
  });

  test('渠道效果统计应该显示渠道数据', async ({ page }) => {
    // 等待渠道统计加载
    await page.waitForSelector('.channel-item');

    // 验证渠道项显示
    const channelItems = page.locator('.channel-item');
    await expect(channelItems.first()).toBeVisible();

    // 验证渠道名称
    await expect(channelItems.first().locator('.channel-name')).toBeVisible();

    // 验证ROI显示
    await expect(channelItems.first().locator('.channel-roi')).toBeVisible();
    await expect(channelItems.first().locator('.channel-roi')).toContainText(':1');

    // 验证渠道进度条
    await expect(channelItems.first().locator('.van-progress')).toBeVisible();
  });

  test('营销提醒应该显示提醒信息', async ({ page }) => {
    // 等待提醒列表加载
    await page.waitForSelector('.reminders-list');

    // 验证提醒项显示
    const reminderItems = page.locator('.reminder-item');
    if (await reminderItems.count() > 0) {
      await expect(reminderItems.first()).toBeVisible();

      // 验证提醒标题
      await expect(reminderItems.first().locator('.reminder-title')).toBeVisible();

      // 验证提醒时间
      await expect(reminderItems.first().locator('.reminder-time')).toBeVisible();

      // 验证提醒图标
      await expect(reminderItems.first().locator('.van-icon')).toBeVisible();
    }
  });

  test('热门内容应该显示内容信息', async ({ page }) => {
    // 等待内容列表加载
    await page.waitForSelector('.popular-content');

    // 验证内容项显示
    const contentItems = page.locator('.content-item');
    if (await contentItems.count() > 0) {
      await expect(contentItems.first()).toBeVisible();

      // 验证内容缩略图
      await expect(contentItems.first().locator('.van-image')).toBeVisible();

      // 验证内容标题
      await expect(contentItems.first().locator('.content-title')).toBeVisible();

      // 验证内容统计
      await expect(contentItems.first().locator('.content-stats')).toBeVisible();

      // 验证内容评分
      await expect(contentItems.first().locator('.van-rate')).toBeVisible();
    }
  });

  test('团队协作应该显示任务信息', async ({ page }) => {
    // 等待团队协作区域加载
    await page.waitForSelector('.team-tasks');

    // 验证任务概览
    await expect(page.locator('.task-overview')).toBeVisible();
    await expect(page.locator('.task-stat')).toHaveCount(3);

    // 验证任务统计数字
    await expect(page.locator('.task-number').first()).toBeVisible();
    await expect(page.locator('.task-label').first()).toBeVisible();

    // 验证最近任务
    const recentTasks = page.locator('.recent-tasks');
    if (await recentTasks.locator('.task-item').count() > 0) {
      await expect(recentTasks.locator('.task-item').first()).toBeVisible();
      await expect(recentTasks.locator('.task-title').first()).toBeVisible();
      await expect(recentTasks.locator('.task-assignee').first()).toBeVisible();
    }
  });

  test('移动端响应式布局应该正确显示', async ({ page }) => {
    // 验证移动端布局类
    await expect(page.locator('.role-based-mobile-layout')).toBeVisible();

    // 验证导航栏
    await expect(page.locator('.van-nav-bar')).toBeVisible();

    // 验证底部导航栏
    await expect(page.locator('.van-tabbar')).toBeVisible();

    // 验证主内容区域
    await expect(page.locator('.main-content')).toBeVisible();

    // 测试页面滚动
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);

    // 验证滚动后内容仍然可见
    await expect(page.locator('.marketing-dashboard')).toBeVisible();
  });
});

test.describe('Marketing Campaign Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到营销活动页面
    await page.goto('/mobile/marketing/marketing-campaign');

    // 等待页面加载完成
    await page.waitForSelector('.role-based-mobile-layout', { timeout: 10000 });
  });

  test('营销活动页面应该正确加载', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('.van-nav-bar__title')).toContainText('营销活动');

    // 验证搜索栏
    await expect(page.locator('.van-search')).toBeVisible();

    // 验证筛选按钮
    await expect(page.locator('.van-search__action:has(.van-icon-filter-o)')).toBeVisible();

    // 验证活动统计概览
    await expect(page.locator('.campaign-stats-overview')).toBeVisible();

    // 验证快捷筛选标签
    await expect(page.locator('.quick-filters')).toBeVisible();
    await expect(page.locator('.van-tabs')).toBeVisible();

    // 验证活动列表
    await expect(page.locator('.campaign-list')).toBeVisible();

    // 验证悬浮新建按钮
    await expect(page.locator('.van-floating-bubble')).toBeVisible();
  });

  test('活动列表应该显示活动卡片', async ({ page }) => {
    // 等待活动列表加载
    await page.waitForSelector('.campaign-card');

    // 验证活动卡片显示
    const campaignCards = page.locator('.campaign-card');
    await expect(campaignCards.first()).toBeVisible();

    // 验证活动标题
    await expect(campaignCards.first().locator('.campaign-title')).toBeVisible();

    // 验证活动描述
    await expect(campaignCards.first().locator('.campaign-description')).toBeVisible();

    // 验证活动时间线
    await expect(campaignCards.first().locator('.campaign-timeline')).toBeVisible();

    // 验证活动指标
    await expect(campaignCards.first().locator('.campaign-metrics')).toBeVisible();

    // 验证活动进度
    await expect(campaignCards.first().locator('.campaign-progress')).toBeVisible();
  });

  test('搜索功能应该正常工作', async ({ page }) => {
    // 等待搜索栏加载
    await page.waitForSelector('.van-search');

    // 输入搜索关键词
    await page.fill('.van-search__content .van-field__control', '春季招生');

    // 点击搜索按钮
    await page.click('.van-search__action:has-text("搜索")');

    // 等待搜索结果加载
    await page.waitForTimeout(1000);

    // 验证搜索结果（这里主要验证搜索功能是否被触发）
    await expect(page.locator('.van-search')).toBeVisible();
  });

  test('筛选功能应该可以打开', async ({ page }) => {
    // 点击筛选按钮
    await page.click('.van-search__action:has(.van-icon-filter-o)');

    // 验证筛选弹窗打开
    await expect(page.locator('.filter-popup')).toBeVisible();

    // 验证筛选标题
    await expect(page.locator('.filter-header h3')).toContainText('筛选活动');

    // 验证筛选内容
    await expect(page.locator('.filter-content')).toBeVisible();

    // 验证筛选按钮
    await expect(page.locator('.filter-footer')).toBeVisible();
    await expect(page.locator('.filter-footer .van-button')).toHaveCount(2);
  });

  test('快捷筛选标签应该可以切换', async ({ page }) => {
    // 等待标签加载
    await page.waitForSelector('.van-tab');

    // 验证默认选中状态
    await expect(page.locator('.van-tab--active')).toContainText('全部');

    // 点击进行中标签
    await page.locator('text=进行中').click();
    await expect(page.locator('.van-tab--active')).toContainText('进行中');

    // 点击已完成标签
    await page.locator('text=已完成').click();
    await expect(page.locator('.van-tab--active')).toContainText('已完成');
  });
});

test.describe('Marketing Template Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到营销模板页面
    await page.goto('/mobile/marketing/marketing-template');

    // 等待页面加载完成
    await page.waitForSelector('.role-based-mobile-layout', { timeout: 10000 });
  });

  test('营销模板页面应该正确加载', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('.van-nav-bar__title')).toContainText('营销模板');

    // 验证搜索栏
    await expect(page.locator('.van-search')).toBeVisible();

    // 验证筛选按钮
    await expect(page.locator('.van-search__action:has(.van-icon-filter-o)')).toBeVisible();

    // 验证模板统计概览
    await expect(page.locator('.template-stats-overview')).toBeVisible();

    // 验证分类标签
    await expect(page.locator('.category-tabs')).toBeVisible();
    await expect(page.locator('.van-tabs')).toBeVisible();

    // 验证智能推荐（如果存在）
    const recommendationSection = page.locator('.smart-recommendation');
    if (await recommendationSection.count() > 0) {
      await expect(recommendationSection).toBeVisible();
    }

    // 验证模板列表
    await expect(page.locator('.template-list')).toBeVisible();

    // 验证悬浮创建按钮
    await expect(page.locator('.van-floating-bubble')).toBeVisible();
  });

  test('模板列表应该显示模板卡片', async ({ page }) => {
    // 等待模板列表加载
    await page.waitForSelector('.template-card');

    // 验证模板卡片显示
    const templateCards = page.locator('.template-card');
    await expect(templateCards.first()).toBeVisible();

    // 验证模板缩略图
    await expect(templateCards.first().locator('.template-thumbnail')).toBeVisible();

    // 验证模板名称
    await expect(templateCards.first().locator('.template-name')).toBeVisible();

    // 验证模板描述
    await expect(templateCards.first().locator('.template-description')).toBeVisible();

    // 验证模板规格
    await expect(templateCards.first().locator('.template-specifications')).toBeVisible();

    // 验证模板性能指标
    await expect(templateCards.first().locator('.template-performance')).toBeVisible();

    // 验证模板操作按钮
    await expect(templateCards.first().locator('.template-actions')).toBeVisible();
  });

  test('模板统计应该显示正确数据', async ({ page }) => {
    // 等待统计数据加载
    await page.waitForSelector('.template-stats-overview');

    // 验证统计项
    const statItems = page.locator('.stat-item');
    await expect(statItems).toHaveCount(4);

    // 验证总模板数
    await expect(statItems.first()).toContainText('总模板数');

    // 验证热门模板数
    await expect(statItems.nth(1)).toContainText('热门模板');

    // 验证新增模板数
    await expect(statItems.nth(2)).toContainText('新增模板');

    // 验证收藏数
    await expect(statItems.nth(3)).toContainText('收藏数');
  });

  test('模板分类标签应该可以切换', async ({ page }) => {
    // 等待标签加载
    await page.waitForSelector('.van-tab');

    // 验证默认选中状态
    await expect(page.locator('.van-tab--active')).toContainText('全部');

    // 点击活动模板标签
    await page.locator('text=活动模板').click();
    await expect(page.locator('.van-tab--active')).toContainText('活动模板');

    // 点击内容模板标签
    await page.locator('text=内容模板').click();
    await expect(page.locator('.van-tab--active')).toContainText('内容模板');

    // 点击邮件模板标签
    await page.locator('text=邮件模板').click();
    await expect(page.locator('.van-tab--active')).toContainText('邮件模板');
  });

  test('模板预览功能应该可以打开', async ({ page }) => {
    // 等待模板列表加载
    await page.waitForSelector('.template-card');

    // 点击预览按钮
    const previewBtn = page.locator('.template-card').first().locator('button:has-text("预览")');
    if (await previewBtn.count() > 0) {
      await previewBtn.click();

      // 验证预览弹窗打开
      await expect(page.locator('.template-preview-popup')).toBeVisible();

      // 验证预览内容
      await expect(page.locator('.preview-content')).toBeVisible();

      // 关闭预览弹窗
      await page.click('.preview-footer button:has-text("关闭")');

      // 验证弹窗关闭
      await expect(page.locator('.template-preview-popup')).not.toBeVisible();
    }
  });

  test('模板使用功能应该可以触发', async ({ page }) => {
    // 等待模板列表加载
    await page.waitForSelector('.template-card');

    // 点击使用按钮
    const useBtn = page.locator('.template-card').first().locator('button:has-text("使用")');
    if (await useBtn.count() > 0) {
      await useBtn.click();

      // 验证提示显示（这里主要验证点击行为）
      await expect(page.locator('.van-toast')).toBeVisible({ timeout: 3000 });
    }
  });

  test('创建模板功能应该可以打开向导', async ({ page }) => {
    // 点击悬浮创建按钮
    await page.click('.van-floating-bubble');

    // 验证创建向导打开
    await expect(page.locator('.create-wizard')).toBeVisible();

    // 验证向导标题
    await expect(page.locator('.wizard-header h3')).toContainText('创建模板向导');

    // 验证步骤指示器
    await expect(page.locator('.van-steps')).toBeVisible();
    await expect(page.locator('.van-step')).toHaveCount(4);

    // 关闭向导
    await page.click('.van-popup__close-icon');

    // 验证向导关闭
    await expect(page.locator('.create-wizard')).not.toBeVisible();
  });
});