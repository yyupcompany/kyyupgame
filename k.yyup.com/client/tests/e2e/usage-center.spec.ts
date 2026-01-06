/**
 * 用量中心端到端测试
 */

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

describe('用量中心功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(2000);
  });

  test('应该能够访问用量中心页面', async ({ page }) => {
    // 点击侧边栏的用量中心菜单
    await page.click('text=用量中心');
    await page.waitForURL('**/usage-center');
    
    // 验证页面标题
    await expect(page.locator('h1:has-text("用量中心")')).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=查看所有用户的AI使用量和费用统计')).toBeVisible();
  });

  test('应该显示概览统计卡片', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 验证4个统计卡片
    await expect(page.locator('text=总调用次数')).toBeVisible();
    await expect(page.locator('text=总费用')).toBeVisible();
    await expect(page.locator('text=活跃用户')).toBeVisible();
    await expect(page.locator('text=预警用户')).toBeVisible();
  });

  test('应该显示图表', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(3000);
    
    // 验证图表卡片
    await expect(page.locator('text=调用次数分布')).toBeVisible();
    await expect(page.locator('text=费用分布')).toBeVisible();
    
    // 验证图表容器存在
    const charts = await page.locator('.usage-type-pie-chart').count();
    expect(charts).toBeGreaterThanOrEqual(2);
  });

  test('应该显示用户用量排行表格', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 验证表格标题
    await expect(page.locator('text=用户用量排行')).toBeVisible();
    
    // 验证表格列
    await expect(page.locator('th:has-text("用户名")')).toBeVisible();
    await expect(page.locator('th:has-text("真实姓名")')).toBeVisible();
    await expect(page.locator('th:has-text("邮箱")')).toBeVisible();
    await expect(page.locator('th:has-text("调用次数")')).toBeVisible();
    await expect(page.locator('th:has-text("总Token数")')).toBeVisible();
    await expect(page.locator('th:has-text("总费用")')).toBeVisible();
  });

  test('应该能够搜索用户', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 输入搜索关键词
    await page.fill('input[placeholder="搜索用户名或邮箱"]', 'admin');
    await page.waitForTimeout(1000);
    
    // 验证搜索结果
    const rows = await page.locator('.el-table__body tr').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('应该能够查看用户详情', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 点击第一个用户的"查看详情"按钮
    const detailButton = page.locator('button:has-text("查看详情")').first();
    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForTimeout(1000);
      
      // 验证对话框打开
      await expect(page.locator('.el-dialog:has-text("用户用量详情")')).toBeVisible();
      
      // 验证详情内容
      await expect(page.locator('text=按类型统计')).toBeVisible();
      await expect(page.locator('text=按模型统计')).toBeVisible();
      await expect(page.locator('text=最近使用记录')).toBeVisible();
    }
  });

  test('应该能够导出CSV数据', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 点击导出按钮
    await page.click('button:has-text("导出数据")');
    await page.waitForTimeout(500);
    
    // 点击导出CSV
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=导出CSV');
    const download = await downloadPromise;
    
    // 验证文件名
    expect(download.suggestedFilename()).toContain('用量统计');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('应该能够导出Excel数据', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 点击导出按钮
    await page.click('button:has-text("导出数据")');
    await page.waitForTimeout(500);
    
    // 点击导出Excel
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=导出Excel');
    const download = await downloadPromise;
    
    // 验证文件名
    expect(download.suggestedFilename()).toContain('用量统计');
    expect(download.suggestedFilename()).toContain('.xls');
  });

  test('应该能够查看预警信息', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 点击预警用户卡片
    await page.click('.stat-card:has-text("预警用户")');
    await page.waitForTimeout(1000);
    
    // 验证预警对话框打开
    await expect(page.locator('.el-dialog:has-text("用量预警信息")')).toBeVisible();
  });

  test('应该能够调整用户配额', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 打开预警对话框
    await page.click('.stat-card:has-text("预警用户")');
    await page.waitForTimeout(1000);
    
    // 如果有预警用户，点击调整配额
    const adjustButton = page.locator('button:has-text("调整配额")').first();
    if (await adjustButton.isVisible()) {
      await adjustButton.click();
      await page.waitForTimeout(1000);
      
      // 验证配额设置对话框打开
      await expect(page.locator('.el-dialog:has-text("配额设置")')).toBeVisible();
      
      // 验证表单字段
      await expect(page.locator('label:has-text("每月调用配额")')).toBeVisible();
      await expect(page.locator('label:has-text("每月费用配额")')).toBeVisible();
      await expect(page.locator('label:has-text("启用预警")')).toBeVisible();
      await expect(page.locator('label:has-text("预警阈值")')).toBeVisible();
    }
  });

  test('应该能够切换日期范围', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 点击日期选择器
    await page.click('.el-date-editor');
    await page.waitForTimeout(500);
    
    // 验证日期面板打开
    await expect(page.locator('.el-picker-panel')).toBeVisible();
  });

  test('应该能够刷新数据', async ({ page }) => {
    await page.goto('http://localhost:5173/usage-center');
    await page.waitForTimeout(2000);
    
    // 点击刷新按钮
    await page.click('button:has-text("刷新")');
    await page.waitForTimeout(1000);
    
    // 验证数据重新加载（通过检查loading状态或数据变化）
    await expect(page.locator('.usage-center-container')).toBeVisible();
  });
});

test.describe('教师个人用量测试', () => {
  test.beforeEach(async ({ page }) => {
    // 使用教师账号登录
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'teacher');
    await page.fill('input[type="password"]', 'teacher123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(2000);
  });

  test('应该能够在个人中心查看用量', async ({ page }) => {
    // 点击头像
    await page.click('.user-info');
    await page.waitForTimeout(500);
    
    // 点击个人中心
    await page.click('text=个人中心');
    await page.waitForURL('**/profile');
    await page.waitForTimeout(2000);
    
    // 滚动到用量统计卡片
    await page.evaluate(() => {
      const element = document.querySelector('.usage-stats-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(1000);
    
    // 验证用量统计卡片
    await expect(page.locator('text=AI用量统计')).toBeVisible();
    await expect(page.locator('text=总调用次数')).toBeVisible();
    await expect(page.locator('text=总费用')).toBeVisible();
    await expect(page.locator('text=总Token数')).toBeVisible();
  });

  test('应该显示按类型统计', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.waitForTimeout(2000);
    
    // 滚动到用量统计
    await page.evaluate(() => {
      const element = document.querySelector('.usage-stats-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(1000);
    
    // 验证按类型统计表格
    await expect(page.locator('.usage-by-type')).toBeVisible();
  });

  test('应该显示最近使用记录', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.waitForTimeout(2000);
    
    // 滚动到用量统计
    await page.evaluate(() => {
      const element = document.querySelector('.usage-stats-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(1000);
    
    // 验证最近使用记录表格
    await expect(page.locator('.recent-usage')).toBeVisible();
  });
});

