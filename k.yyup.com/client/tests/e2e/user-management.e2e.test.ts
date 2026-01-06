/**
 * 用户管理E2E测试
 * 严格验证版本
 * 使用Playwright进行完整的端到端测试
 */

import { test, expect, beforeEach, afterEach } from '@playwright/test';
import { validateApiResponse, validatePaginatedResponse } from '../utils/data-validation';

// 测试配置
const BASE_URL = 'http://localhost:5173';
const API_BASE_URL = 'http://localhost:3000/api';

// 测试数据
const testUser = {
  username: `testuser_${Date.now()}`,
  name: '测试用户',
  email: `testuser_${Date.now()}@example.com`,
  phone: '13800138001',
  password: 'Test123456!',
  role: 'TEACHER'
};

const updatedUserData = {
  name: '更新后的用户',
  email: `updated_${Date.now()}@example.com`,
  phone: '13800138002'
};

test.describe('User Management E2E Tests - Strict Validation', () => {
  let page: any;
  let authToken: string;

  beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 拦截API请求进行验证
    page.on('response', async (response) => {
      const url = response.url();
      
      if (url.includes('/api/users')) {
        try {
          const responseData = await response.json();
          const responseTime = response.timing()?.responseEnd || 0;

          // 验证API响应结构
          if (url.includes('/api/users') && !url.includes('/login')) {
            if (Array.isArray(responseData?.data?.items)) {
              // 分页响应验证
              const paginationValidation = validatePaginatedResponse(responseData);
              if (!paginationValidation.valid) {
                console.warn('Pagination validation failed:', paginationValidation.errors);
              }
            } else {
              // 单个对象响应验证
              const apiValidation = validateApiResponse(responseData);
              if (!apiValidation.valid) {
                console.warn('API validation failed:', apiValidation.errors);
              }
            }
          }

          // 验证响应时间
          if (responseTime > 5000) {
            console.warn(`Slow API response: ${url} took ${responseTime}ms`);
          }

        } catch (error) {
          console.warn('Failed to validate API response:', error);
        }
      }
    });
  });

  afterEach(async () => {
    // 清理测试数据
    if (authToken) {
      try {
        await page.request.delete(`${API_BASE_URL}/users/testuser_${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
      } catch (error) {
        // 忽略清理错误
      }
    }

    await page.close();
  });

  test.beforeAll(async () => {
    // 确保测试环境准备就绪
    console.log('Setting up test environment...');
  });

  test('should complete full user management workflow', async () => {
    // 1. 导航到用户管理页面
    await page.goto(`${BASE_URL}/login`);
    
    // 验证登录页面加载
    await expect(page.locator('h1')).toContainText('登录');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

    // 2. 执行登录
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // 验证登录成功
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // 获取认证token
    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem('authToken');
    });
    expect(localStorage).toBeTruthy();
    authToken = localStorage || '';

    // 3. 导航到用户管理
    await page.click('[data-testid="system-menu"]');
    await page.click('[data-testid="user-management-link"]');

    // 验证用户管理页面加载
    await expect(page).toHaveURL(`${BASE_URL}/system/users`);
    await expect(page.locator('h1')).toContainText('用户管理');
    await expect(page.locator('[data-testid="user-table"]')).toBeVisible();

    // 4. 验证用户列表加载
    await page.waitForSelector('[data-testid="user-table"]');
    const userTable = page.locator('[data-testid="user-table"]');
    await expect(userTable).toBeVisible();

    // 验证表格列
    await expect(page.locator('[data-testid="column-username"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-role"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-actions"]')).toBeVisible();

    // 5. 创建新用户
    await page.click('[data-testid="create-user-button"]');

    // 验证创建对话框打开
    await expect(page.locator('[data-testid="user-form-dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('创建用户');

    // 填写用户表单
    await page.fill('[data-testid="username"]', testUser.username);
    await page.fill('[data-testid="name"]', testUser.name);
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="phone"]', testUser.phone);
    await page.fill('[data-testid="password"]', testUser.password);
    await page.fill('[data-testid="confirmPassword"]', testUser.password);
    
    // 选择角色
    await page.click('[data-testid="role"]');
    await page.click(`text=${testUser.role}`);

    // 验证表单数据
    await expect(page.locator('[data-testid="username"]')).toHaveValue(testUser.username);
    await expect(page.locator('[data-testid="name"]')).toHaveValue(testUser.name);
    await expect(page.locator('[data-testid="email"]')).toHaveValue(testUser.email);
    await expect(page.locator('[data-testid="phone"]')).toHaveValue(testUser.phone);

    // 提交表单
    await page.click('[data-testid="submit-button"]');

    // 验证创建成功消息
    await expect(page.locator('.el-message--success')).toBeVisible();
    await expect(page.locator('.el-message--success')).toContainText('创建成功');

    // 验证对话框关闭
    await expect(page.locator('[data-testid="user-form-dialog"]')).not.toBeVisible();

    // 6. 验证新用户出现在列表中
    await page.reload();
    await page.waitForSelector('[data-testid="user-table"]');

    // 搜索新创建的用户
    await page.fill('[data-testid="search-input"]', testUser.username);
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForTimeout(1000);

    // 验证搜索结果
    const userRow = page.locator(`[data-testid="user-row-${testUser.username}"]`);
    await expect(userRow).toBeVisible();
    await expect(userRow.locator('[data-testid="cell-username"]')).toHaveText(testUser.username);
    await expect(userRow.locator('[data-testid="cell-name"]')).toHaveText(testUser.name);
    await expect(userRow.locator('[data-testid="cell-email"]')).toHaveText(testUser.email);

    // 7. 编辑用户
    await page.click(`[data-testid="edit-user-${testUser.username}"]`);

    // 验证编辑对话框打开
    await expect(page.locator('[data-testid="user-form-dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('编辑用户');

    // 验证表单预填充数据
    await expect(page.locator('[data-testid="username"]')).toHaveValue(testUser.username);
    await expect(page.locator('[data-testid="name"]')).toHaveValue(testUser.name);
    await expect(page.locator('[data-testid="email"]')).toHaveValue(testUser.email);

    // 更新用户信息
    await page.fill('[data-testid="name"]', updatedUserData.name);
    await page.fill('[data-testid="email"]', updatedUserData.email);
    await page.fill('[data-testid="phone"]', updatedUserData.phone);

    // 验证更新后的值
    await expect(page.locator('[data-testid="name"]')).toHaveValue(updatedUserData.name);
    await expect(page.locator('[data-testid="email"]')).toHaveValue(updatedUserData.email);
    await expect(page.locator('[data-testid="phone"]')).toHaveValue(updatedUserData.phone);

    // 提交更新
    await page.click('[data-testid="submit-button"]');

    // 验证更新成功消息
    await expect(page.locator('.el-message--success')).toBeVisible();
    await expect(page.locator('.el-message--success')).toContainText('更新成功');

    // 验证对话框关闭
    await expect(page.locator('[data-testid="user-form-dialog"]')).not.toBeVisible();

    // 8. 验证更新后的用户信息
    await page.reload();
    await page.waitForSelector('[data-testid="user-table"]');
    
    await page.fill('[data-testid="search-input"]', testUser.username);
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);

    const updatedUserRow = page.locator(`[data-testid="user-row-${testUser.username}"]`);
    await expect(updatedUserRow).toBeVisible();
    await expect(updatedUserRow.locator('[data-testid="cell-name"]')).toHaveText(updatedUserData.name);
    await expect(updatedUserRow.locator('[data-testid="cell-email"]')).toHaveText(updatedUserData.email);
    await expect(updatedUserRow.locator('[data-testid="cell-phone"]')).toHaveText(updatedUserData.phone);

    // 9. 测试用户状态切换
    const statusToggle = updatedUserRow.locator('[data-testid="status-toggle"]');
    await statusToggle.click();

    // 验证状态切换确认对话框
    await expect(page.locator('.el-message-box')).toBeVisible();
    await page.click('.el-message-box__btns .el-button--primary');

    // 验证状态切换成功消息
    await expect(page.locator('.el-message--success')).toBeVisible();

    // 10. 测试分页功能
    await page.click('[data-testid="pagination-next"]');
    await page.waitForTimeout(1000);

    // 验证分页导航
    const currentPage = page.locator('[data-testid="current-page"]');
    await expect(currentPage).toBeVisible();

    // 11. 测试每页显示数量
    await page.click('[data-testid="page-size-selector"]');
    await page.click('text=20');
    await page.waitForTimeout(1000);

    // 12. 测试导出功能
    await page.click('[data-testid="export-button"]');
    
    // 验证导出菜单
    await expect(page.locator('[data-testid="export-menu"]')).toBeVisible();
    await page.click('[data-testid="export-excel"]');

    // 验证导出开始消息
    await expect(page.locator('.el-message--info')).toBeVisible();
    await expect(page.locator('.el-message--info')).toContainText('导出');

    // 13. 测试批量操作
    // 选择用户
    const checkbox = updatedUserRow.locator('[data-testid="user-checkbox"]');
    await checkbox.check();

    // 验证批量操作按钮启用
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();

    // 测试批量删除
    await page.click('[data-testid="bulk-delete"]');
    
    // 验证确认对话框
    await expect(page.locator('.el-message-box')).toBeVisible();
    await page.click('.el-message-box__btns .el-button--primary'); // 确认删除

    // 验证删除成功消息
    await expect(page.locator('.el-message--success')).toBeVisible();
    await expect(page.locator('.el-message--success')).toContainText('删除成功');

    // 14. 验证用户已被删除
    await page.reload();
    await page.waitForSelector('[data-testid="user-table"]');
    
    await page.fill('[data-testid="search-input"]', testUser.username);
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);

    // 验证用户不再存在
    await expect(page.locator(`[data-testid="user-row-${testUser.username}"]`)).not.toBeVisible();
    
    // 验证空状态显示
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('没有找到相关用户');
  });

  test('should handle form validation correctly', async () => {
    // 登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // 导航到用户管理
    await page.click('[data-testid="system-menu"]');
    await page.click('[data-testid="user-management-link"]');

    // 打开创建用户对话框
    await page.click('[data-testid="create-user-button"]');

    // 测试必填字段验证
    await page.click('[data-testid="submit-button"]');

    // 验证错误消息
    await expect(page.locator('[data-testid="error-username"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-password"]')).toBeVisible();

    // 测试邮箱格式验证
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-email"]')).toContainText('邮箱格式');

    // 测试手机号格式验证
    await page.fill('[data-testid="phone"]', 'invalid-phone');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-phone"]')).toContainText('手机号格式');

    // 测试密码确认验证
    await page.fill('[data-testid="password"]', 'password123');
    await page.fill('[data-testid="confirmPassword"]', 'different-password');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-confirmPassword"]')).toContainText('密码不一致');

    // 测试表单重置
    await page.click('[data-testid="reset-button"]');
    
    // 验证字段被清空
    await expect(page.locator('[data-testid="username"]')).toBeEmpty();
    await expect(page.locator('[data-testid="name"]')).toBeEmpty();
    await expect(page.locator('[data-testid="email"]')).toBeEmpty();
  });

  test('should handle responsive design correctly', async ({ browser }) => {
    // 测试移动端响应式
    const mobilePage = await browser.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 667 }); // iPhone尺寸

    // 登录
    await mobilePage.goto(`${BASE_URL}/login`);
    await mobilePage.fill('[data-testid="username"]', 'admin');
    await mobilePage.fill('[data-testid="password"]', 'admin123');
    await mobilePage.click('[data-testid="login-button"]');

    // 导航到用户管理
    await mobilePage.click('[data-testid="mobile-menu"]');
    await mobilePage.click('[data-testid="system-menu"]');
    await mobilePage.click('[data-testid="user-management-link"]');

    // 验证移动端布局
    await expect(mobilePage.locator('[data-testid="mobile-user-table"]')).toBeVisible();
    await expect(mobilePage.locator('[data-testid="mobile-filters"]')).toBeVisible();

    // 测试移动端操作
    await mobilePage.click('[data-testid="mobile-filters-toggle"]');
    await expect(mobilePage.locator('[data-testid="filter-panel"]')).toBeVisible();

    await mobilePage.close();
  });

  test('should handle accessibility correctly', async () => {
    // 登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // 导航到用户管理
    await page.click('[data-testid="system-menu"]');
    await page.click('[data-testid="user-management-link"]');

    // 测试键盘导航
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // 测试ARIA标签
    const table = page.locator('[data-testid="user-table"]');
    await expect(table).toHaveAttribute('role', 'table');
    await expect(table).toHaveAttribute('aria-label');

    // 测试屏幕阅读器支持
    const buttons = page.locator('button[aria-label]');
    await expect(buttons.first()).toHaveAttribute('aria-label');

    // 测试颜色对比度（基础检查）
    const createButton = page.locator('[data-testid="create-user-button"]');
    const styles = await createButton.evaluate((el: any) => {
      return window.getComputedStyle(el);
    });
    
    // 验证按钮有足够的颜色对比度（基础检查）
    expect(styles.color).not.toBe('rgb(128, 128, 128)'); // 不是灰色
  });

  test('should handle error scenarios gracefully', async () => {
    // 登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // 导航到用户管理
    await page.click('[data-testid="system-menu"]');
    await page.click('[data-testid="user-management-link"]');

    // 模拟网络错误
    await page.route('**/api/users', route => {
      route.abort('failed');
    });

    // 尝试加载用户列表
    await page.reload();
    await page.waitForTimeout(2000);

    // 验证错误状态显示
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('加载失败');

    // 测试重试功能
    await page.unroute('**/api/users');
    
    await page.click('[data-testid="retry-button"]');
    await page.waitForTimeout(2000);

    // 验证恢复正常
    await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-state"]')).not.toBeVisible();
  });

  test('should handle performance requirements', async () => {
    // 登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // 导航到用户管理并测量性能
    const startTime = Date.now();
    
    await page.click('[data-testid="system-menu"]');
    await page.click('[data-testid="user-management-link"]');

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="user-table"]');

    const loadTime = Date.now() - startTime;

    // 验证性能指标
    expect(loadTime).toBeLessThan(3000); // 页面加载时间 < 3秒

    // 测试表格滚动性能
    await page.evaluate(() => {
      const table = document.querySelector('[data-testid="user-table"]');
      if (table) {
        table.scrollTop = 1000;
      }
    });

    // 测试搜索性能
    const searchStartTime = Date.now();
    
    await page.fill('[data-testid="search-input"]', 'test');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);

    const searchTime = Date.now() - searchStartTime;
    expect(searchTime).toBeLessThan(2000); // 搜索响应时间 < 2秒
  });
});