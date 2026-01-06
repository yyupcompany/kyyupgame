import { test, expect } from '@playwright/test';
import { vi } from 'vitest'

// 使用本地开发服务器URL而不是生产环境URL
const BASE_URL = 'http://localhost:5173';
const API_BASE_URL = 'https://shlxlyzagqnc.sealoshzh.site';

// 登录函数
async function login(page) {
  // 访问登录页面
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // 填写登录信息
  await page.fill('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]', 'admin');
  await page.fill('input[type="password"], input[name="password"]', 'admin123');
  
  // 点击登录按钮
  await page.click('button[type="submit"], button:has-text("登录"), .login-button, .submit-button').first();
  
  // 等待导航完成
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
}

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

describe('人员中心页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await login(page);
    
    // 访问人员中心页面
    await page.goto(`${BASE_URL}/centers/personnel`);
    await page.waitForLoadState('networkidle');
  });

  test('页面加载和基本元素', async ({ page }) => {
    // 检查页面是否加载成功
    await expect(page).toHaveTitle(/人员中心/);
    
    // 检查是否包含中心容器
    await expect(page.locator('.center-container')).toBeVisible({ timeout: 10000 });
    
    // 检查是否包含标签页
    await expect(page.locator('.center-tabs-container')).toBeVisible();
  });

  test('标签页切换功能', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('.center-container', { timeout: 10000 });
    
    // 测试概览标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("概览")');
    await expect(page.locator('.overview-content')).toBeVisible();
    
    // 测试学生管理标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("学生管理")');
    await expect(page.locator('.students-content')).toBeVisible();
    
    // 测试家长管理标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("家长管理")');
    await expect(page.locator('.parents-content')).toBeVisible();
    
    // 测试教师管理标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("教师管理")');
    await expect(page.locator('.teachers-content')).toBeVisible();
    
    // 测试班级管理标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("班级管理")');
    await expect(page.locator('.classes-content')).toBeVisible();
  });

  test('概览页面功能', async ({ page }) => {
    // 确保在概览标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("概览")');
    await page.waitForTimeout(2000);
    
    // 检查统计卡片是否存在
    const statCards = page.locator('.stat-card');
    const count = await statCards.count();
    console.log(`找到 ${count} 个统计卡片`);
    
    // 检查图表区域是否存在
    await expect(page.locator('.charts-grid')).toBeVisible();
    
    // 检查快速操作区域是否存在
    await expect(page.locator('.quick-actions')).toBeVisible();
  });

  test('学生管理页面功能', async ({ page }) => {
    // 切换到学生管理标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("学生管理")');
    await page.waitForTimeout(2000);
    
    // 检查学生列表是否存在
    await expect(page.locator('.students-list')).toBeVisible();
    
    // 检查数据表格是否存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('家长管理页面功能', async ({ page }) => {
    // 切换到家长管理标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("家长管理")');
    await page.waitForTimeout(2000);
    
    // 检查家长列表是否存在
    await expect(page.locator('.parents-list')).toBeVisible();
    
    // 检查数据表格是否存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('教师管理页面功能', async ({ page }) => {
    // 切换到教师管理标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("教师管理")');
    await page.waitForTimeout(2000);
    
    // 检查教师列表是否存在
    await expect(page.locator('.teachers-list')).toBeVisible();
    
    // 检查数据表格是否存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('班级管理页面功能', async ({ page }) => {
    // 切换到班级管理标签页
    await page.click('.center-tabs-container .el-tabs__item:has-text("班级管理")');
    await page.waitForTimeout(2000);
    
    // 检查班级列表是否存在
    await expect(page.locator('.classes-list')).toBeVisible();
    
    // 检查数据表格是否存在
    await expect(page.locator('.el-table')).toBeVisible();
  });
});