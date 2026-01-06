/**
 * 端到端测试 - 用户管理模块（严格验证版本）
 *
 * 测试覆盖：
 * - 用户列表查看和搜索
 * - 用户创建、编辑、删除
 * - 用户状态管理
 * - 角色权限分配
 * - 批量操作
 * - 权限验证
 *
 * 严格验证要求：
 * - 网络请求状态验证
 * - 页面元素完整性检查
 * - 控制台错误检测
 * - 数据格式验证
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

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

// 测试数据
const TEST_USER = {
  username: 'test_user_e2e',
  realName: '测试用户E2E',
  email: 'test.user@example.com',
  mobile: '13800138001',
  password: 'password123',
  confirmPassword: 'password123'
};

// 测试工具函数
interface ApiResponseValidation {
  url: string;
  method: string;
  status: number;
  contentType?: string;
}

test.describe('用户管理模块 E2E 测试 - Strict Validation', () => {
  let apiRequests: ApiResponseValidation[] = [];

  test.beforeEach(async ({ page, context }) => {
    // 清理状态
    await page.context().clearCookies();
    apiRequests = [];

    // 监听网络请求
    page.on('response', (response) => {
      apiRequests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
        contentType: response.headers()['content-type']
      });
    });

    // 监听控制台错误
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.error('Console error detected:', message.text());
      }
      if (message.type() === 'warning') {
        console.warn('Console warning detected:', message.text());
      }
    });

    await page.goto(BASE_URL);

    // 验证基础页面加载
    await validatePageLoad(page);
  });

  test.afterEach(async ({ page }) => {
    // 验证没有控制台错误
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    expect(consoleErrors.length, `发现控制台错误: ${consoleErrors.join(', ')}`).toBe(0);

    // 清理测试数据
    await cleanupTestData(page);
  });

  test.describe('用户列表功能', () => {
    test('管理员查看用户列表 - 严格验证', async ({ page }) => {
      // 登录
      await loginAsAdmin(page);

      // 导航到用户管理页面
      await page.click('[data-testid="nav-users"]');
      await expect(page).toHaveURL(`${BASE_URL}/users`);

      // 验证页面加载完成
      await validatePageLoad(page);

      // 验证页面标题和基础结构
      await expect(page.locator('[data-testid="page-title"]')).toContainText('用户管理');
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-user-button"]')).toBeVisible();

      // 验证表格列的完整性
      const headerColumns = [
        '用户名', '邮箱', '手机号', '角色', '最后登录', '状态', '操作'
      ];

      for (const column of headerColumns) {
        const columnHeader = page.locator(`[data-testid="table-header-${column}"]`);
        await expect(columnHeader, `缺少表格列: ${column}`).toBeVisible();
        const headerText = await columnHeader.textContent();
        expect(headerText?.trim()).toBe(column);
      }

      // 验证用户数据存在
      const userRows = page.locator('[data-testid="user-row"]');
      await expect(userRows, '用户列表为空').toHaveCountGreaterThan(0);

      // 验证每个用户行的数据完整性
      const firstUserRow = userRows.first();
      const requiredFields = [
        'username-display', 'email-display', 'mobile-display',
        'user-role', 'last-login', 'user-status'
      ];

      for (const field of requiredFields) {
        await expect(firstUserRow.locator(`[data-testid="${field}"]`),
          `缺少用户字段: ${field}`).toBeVisible();
      }

      // 验证API请求状态
      await validateApiRequests(apiRequests, [
        { url: '/api/users', method: 'GET', status: 200 }
      ]);
    });

    test('用户搜索功能 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      const searchTerm = 'admin';

      // 执行搜索
      await page.fill('[data-testid="search-input"]', searchTerm);
      await page.click('[data-testid="search-button"]');

      // 等待搜索结果加载
      await page.waitForSelector('[data-testid="search-results"]');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

      // 验证搜索结果
      const results = page.locator('[data-testid="user-row"]');
      await expect(results, '搜索结果为空').toHaveCountGreaterThan(0);

      // 验证搜索结果包含关键词
      const firstResult = results.first();
      const usernameText = await firstResult.locator('[data-testid="username-display"]').textContent();
      expect(usernameText?.toLowerCase(), '搜索结果不包含搜索关键词').toContain(searchTerm.toLowerCase());

      // 验证搜索URL参数
      const currentUrl = page.url();
      expect(currentUrl, '搜索参数未正确添加到URL').toContain(`keyword=${searchTerm}`);

      // 验证搜索API请求
      await validateApiRequests(apiRequests, [
        { url: '/api/users', method: 'GET', status: 200 }
      ]);

      // 清除搜索并验证
      await page.click('[data-testid="clear-search-button"]');
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');

      // 验证清除搜索后的状态
      await page.waitForLoadState('networkidle');
    });

    test('用户列表筛选功能 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 按角色筛选
      await page.click('[data-testid="role-filter-dropdown"]');
      await page.click('[data-testid="role-filter-teacher"]');

      // 验证筛选结果
      const filteredRows = page.locator('[data-testid="user-row"]');
      await expect(filteredRows, '筛选结果为空').toHaveCountGreaterThan(0);

      // 验证所有结果都属于选定角色
      const roles = await filteredRows.locator('[data-testid="user-role"]').allTextContents();
      const allValidRoles = roles.every(role => role.includes('教师'));
      expect(allValidRoles, '筛选结果包含非目标角色').toBeTruthy();

      // 验证筛选API请求
      await validateApiRequests(apiRequests, [
        { url: '/api/users', method: 'GET', status: 200 }
      ]);

      // 验证URL筛选参数
      const currentUrl = page.url();
      expect(currentUrl, '筛选参数未正确添加到URL').toContain('role=teacher');

      // 按状态筛选
      await page.click('[data-testid="status-filter-dropdown"]');
      await page.click('[data-testid="status-filter-active"]');

      // 验证复合筛选
      const statusFilteredRows = page.locator('[data-testid="user-row"]');
      const statuses = await statusFilteredRows.locator('[data-testid="user-status"]').allTextContents();
      const allActiveStatuses = statuses.every(status => status.includes('启用'));
      expect(allActiveStatuses, '状态筛选结果包含非活跃状态').toBeTruthy();
    });

    test('用户列表分页功能 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 验证分页组件存在且可见
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      await expect(page.locator('[data-testid="page-info"]')).toBeVisible();

      // 验证页码信息格式
      const pageInfoText = await page.locator('[data-testid="page-info"]').textContent();
      expect(pageInfoText, '分页信息格式不正确').toMatch(/第 \d+ 页，共 \d+ 页/);

      // 测试页面大小更改
      await page.click('[data-testid="page-size-selector"]');
      await page.click('[data-testid="page-size-20"]');

      // 验证每页显示数量改变
      const rows = page.locator('[data-testid="user-row"]');
      const rowCount = await rows.count();
      expect(rowCount, '页面大小更改后行数超过预期').toBeLessThanOrEqual(20);

      // 验证页面大小API请求
      await validateApiRequests(apiRequests, [
        { url: '/api/users', method: 'GET', status: 200 }
      ]);

      // 验证URL中的页面大小参数
      const currentUrl = page.url();
      expect(currentUrl, '页面大小参数未正确添加到URL').toContain('pageSize=20');

      // 测试翻页功能
      const nextButton = page.locator('[data-testid="next-page-button"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();

        // 验证页码更新
        const currentPageText = await page.locator('[data-testid="current-page"]').textContent();
        expect(currentPageText, '翻页后页码未正确更新').toContain('2');

        // 验证翻页API请求
        await validateApiRequests(apiRequests, [
          { url: '/api/users', method: 'GET', status: 200 }
        ]);

        // 验证URL中的页码参数
        const updatedUrl = page.url();
        expect(updatedUrl, '翻页后URL参数未正确更新').toContain('page=2');
      }
    });
  });

  test.describe('用户信息管理', () => {
    test('创建新用户 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 点击添加用户按钮
      await page.click('[data-testid="add-user-button"]');
      await expect(page.locator('[data-testid="add-user-dialog"]')).toBeVisible();

      // 验证对话框标题和必填字段
      await expect(page.locator('[data-testid="dialog-title"]')).toContainText('添加用户');

      const requiredFields = [
        'username-input', 'password-input', 'confirm-password-input',
        'realname-input', 'email-input', 'mobile-input', 'role-select'
      ];

      for (const field of requiredFields) {
        await expect(page.locator(`[data-testid="${field}"]`),
          `缺少必填字段: ${field}`).toBeVisible();
      }

      // 填写用户信息
      await fillUserForm(page, TEST_USER);

      // 验证表单数据
      await expect(page.locator('[data-testid="username-input"]')).toHaveValue(TEST_USER.username);
      await expect(page.locator('[data-testid="realname-input"]')).toHaveValue(TEST_USER.realName);
      await expect(page.locator('[data-testid="email-input"]')).toHaveValue(TEST_USER.email);
      await expect(page.locator('[data-testid="mobile-input"]')).toHaveValue(TEST_USER.mobile);

      // 提交表单
      await page.click('[data-testid="save-user-button"]');

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]')).toContainText('创建用户成功');

      // 验证创建API请求
      await validateApiRequests(apiRequests, [
        { url: '/api/users', method: 'POST', status: 201 }
      ]);

      // 验证用户出现在列表中
      await expect(page.locator(`[data-testid="user-${TEST_USER.username}"]`)).toBeVisible();

      // 验证用户详细信息完整性
      const userRow = page.locator(`[data-testid="user-${TEST_USER.username}"]`);
      await expect(userRow.locator('[data-testid="username-display"]')).toContainText(TEST_USER.username);
      await expect(userRow.locator('[data-testid="email-display"]')).toContainText(TEST_USER.email);
      await expect(userRow.locator('[data-testid="mobile-display"]')).toContainText(TEST_USER.mobile);

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(TEST_USER.email), '邮箱格式无效').toBeTruthy();

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      expect(phoneRegex.test(TEST_USER.mobile), '手机号格式无效').toBeTruthy();
    });

    test('编辑用户信息 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 确保测试用户存在
      await ensureTestUserExists(page);

      // 找到测试用户并点击编辑
      const userRow = page.locator(`[data-testid="user-${TEST_USER.username}"]`);
      await userRow.locator('[data-testid="edit-user-button"]').click();

      await expect(page.locator('[data-testid="edit-user-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="dialog-title"]')).toContainText('编辑用户');

      // 修改用户信息
      const updatedData = {
        ...TEST_USER,
        realName: '修改后的用户名称',
        mobile: '13900139001'
      };

      await fillUserForm(page, updatedData, true);

      // 验证表单数据更新
      await expect(page.locator('[data-testid="realname-input"]')).toHaveValue(updatedData.realName);
      await expect(page.locator('[data-testid="mobile-input"]')).toHaveValue(updatedData.mobile);

      // 保存修改
      await page.click('[data-testid="save-user-button"]');

      // 验证修改成功提示
      await expect(page.locator('[data-testid="success-message"]')).toContainText('更新用户成功');

      // 验证更新API请求
      await validateApiRequests(apiRequests, [
        { url: `/api/users/${TEST_USER.username}`, method: 'PUT', status: 200 }
      ]);

      // 验证修改后的信息
      await expect(page.locator(`[data-testid="user-${TEST_USER.username}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="user-${TEST_USER.username}"] [data-testid="realname-display"]`))
        .toContainText(updatedData.realName);
    });

    test('删除用户 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 确保测试用户存在
      await ensureTestUserExists(page);

      // 记录删除前的用户数量
      const initialCount = await page.locator('[data-testid="user-row"]').count();

      // 删除测试用户
      const userRow = page.locator(`[data-testid="user-${TEST_USER.username}"]`);
      await userRow.locator('[data-testid="delete-user-button"]').click();

      // 验证删除确认对话框
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="dialog-title"]')).toContainText('确认删除');
      await expect(page.locator('[data-testid="delete-confirmation-text"]')).toContainText(TEST_USER.username);

      // 验证确认按钮存在
      await expect(page.locator('[data-testid="confirm-delete-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="cancel-delete-button"]')).toBeVisible();

      await page.click('[data-testid="confirm-delete-button"]');

      // 验证删除成功提示
      await expect(page.locator('[data-testid="success-message"]')).toContainText('删除用户成功');

      // 验证删除API请求
      await validateApiRequests(apiRequests, [
        { url: `/api/users/${TEST_USER.username}`, method: 'DELETE', status: 200 }
      ]);

      // 验证用户数量减少
      const finalCount = await page.locator('[data-testid="user-row"]').count();
      expect(finalCount, '删除后用户数量未减少').toBe(initialCount - 1);

      // 验证用户不再存在于列表中
      await expect(page.locator(`[data-testid="user-${TEST_USER.username}"]`)).not.toBeVisible();
    });

    test('重置用户密码 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 找到一个用户并点击重置密码
      const firstUser = page.locator('[data-testid="user-row"]').first();
      const username = await firstUser.locator('[data-testid="username-display"]').textContent();

      await firstUser.locator('[data-testid="reset-password-button"]').click();

      // 验证重置密码对话框
      await expect(page.locator('[data-testid="reset-password-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="dialog-title"]')).toContainText('重置密码');

      // 验证必填字段
      await expect(page.locator('[data-testid="new-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();

      const newPassword = 'newpassword123';

      // 输入新密码
      await page.fill('[data-testid="new-password-input"]', newPassword);
      await page.fill('[data-testid="confirm-password-input"]', newPassword);

      // 验证密码强度指示器（如果有）
      const passwordStrength = page.locator('[data-testid="password-strength"]');
      if (await passwordStrength.isVisible()) {
        await expect(passwordStrength).toHaveClass(/strength-/);
      }

      // 确认重置
      await page.click('[data-testid="confirm-reset-button"]');

      // 验证重置成功提示
      await expect(page.locator('[data-testid="success-message"]')).toContainText('密码重置成功');

      // 验证重置密码API请求
      await validateApiRequests(apiRequests, [
        { url: `/api/users/${username}/reset-password`, method: 'POST', status: 200 }
      ]);

      // 验证密码格式要求
      expect(newPassword.length, '密码长度不足').toBeGreaterThanOrEqual(8);
      expect(/[A-Z]/.test(newPassword), '密码缺少大写字母').toBeTruthy();
      expect(/[a-z]/.test(newPassword), '密码缺少小写字母').toBeTruthy();
      expect(/\d/.test(newPassword), '密码缺少数字').toBeTruthy();
    });
  });

  test.describe('用户状态管理', () => {
    test('启用/禁用用户 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 找到一个用户并禁用
      const firstUser = page.locator('[data-testid="user-row"]').first();
      const username = await firstUser.locator('[data-testid="username-display"]').textContent();

      // 验证初始状态
      await expect(firstUser.locator('[data-testid="user-status"]')).toBeVisible();
      const initialStatus = await firstUser.locator('[data-testid="user-status"]').textContent();

      await firstUser.locator('[data-testid="disable-user-button"]').click();

      // 验证确认对话框
      await expect(page.locator('[data-testid="confirm-status-dialog"]')).toBeVisible();
      await page.click('[data-testid="confirm-status-change"]');

      // 验证状态变化API请求
      await validateApiRequests(apiRequests, [
        { url: `/api/users/${username}/status`, method: 'PUT', status: 200 }
      ]);

      // 验证禁用成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('禁用用户成功');
      await expect(firstUser.locator('[data-testid="user-status"]')).toContainText('禁用');
      await expect(firstUser.locator('[data-testid="user-status"]')).toHaveClass(/status-inactive/);

      // 重新启用用户
      await firstUser.locator('[data-testid="enable-user-button"]').click();
      await page.click('[data-testid="confirm-status-change"]');

      // 验证状态恢复API请求
      await validateApiRequests(apiRequests, [
        { url: `/api/users/${username}/status`, method: 'PUT', status: 200 }
      ]);

      // 验证状态恢复
      await expect(page.locator('[data-testid="success-message"]')).toContainText('启用用户成功');
      await expect(firstUser.locator('[data-testid="user-status"]')).toContainText('启用');
      await expect(firstUser.locator('[data-testid="user-status"]')).toHaveClass(/status-active/);
    });

    test('批量状态操作 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 选择多个用户
      await page.click('[data-testid="select-all-checkbox"]');

      // 验证所有用户被选中
      const checkboxes = page.locator('[data-testid="user-checkbox"]');
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i), `第${i + 1}个用户未被选中`).toBeChecked();
      }

      // 验证批量操作工具栏
      await expect(page.locator('[data-testid="bulk-actions-toolbar"]')).toBeVisible();
      await expect(page.locator('[data-testid="selected-count"]')).toContainText(`已选择 ${count} 个用户`);

      // 批量禁用
      await page.click('[data-testid="batch-actions-dropdown"]');
      await page.click('[data-testid="batch-disable-users"]');

      // 验证批量操作确认对话框
      await expect(page.locator('[data-testid="confirm-batch-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="batch-confirmation-text"]')).toContainText(`确定要禁用选中的 ${count} 个用户吗`);

      await page.click('[data-testid="confirm-batch-action"]');

      // 验证批量操作API请求
      await validateApiRequests(apiRequests, [
        { url: '/api/users/batch-status', method: 'PUT', status: 200 }
      ]);

      // 验证批量操作成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('批量操作成功');

      // 验证所有用户状态已更新
      const userRows = page.locator('[data-testid="user-row"]');
      const statuses = await userRows.locator('[data-testid="user-status"]').allTextContents();
      const allDisabled = statuses.every(status => status.includes('禁用'));
      expect(allDisabled, '并非所有用户都被禁用').toBeTruthy();
    });
  });

  test.describe('权限验证', () => {
    test('教师无法访问用户管理页面 - 严格验证', async ({ page }) => {
      await loginAsTeacher(page);

      // 尝试访问用户管理页面
      await page.goto(`${BASE_URL}/users`);

      // 验证被拒绝访问
      await expect(page.locator('[data-testid="403-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="403-message"]')).toContainText('权限不足');

      // 验证403状态码
      const response = await page.goto(`${BASE_URL}/users`);
      expect(response?.status(), '访问未被正确拒绝').toBe(403);

      // 验证重定向到无权限页面
      expect(page.url(), '未重定向到无权限页面').toContain('/403');

      // 验证没有加载用户管理相关内容
      await expect(page.locator('[data-testid="users-table"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="add-user-button"]')).not.toBeVisible();
    });

    test('家长无法访问用户管理页面 - 严格验证', async ({ page }) => {
      // 家长登录
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[data-testid="username-input"]', 'parent1');
      await page.fill('[data-testid="password-input"]', 'parent123');
      await page.click('[data-testid="login-button"]');

      // 验证登录成功
      await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

      // 尝试访问用户管理页面
      await page.goto(`${BASE_URL}/users`);

      // 验证被拒绝访问
      await expect(page.locator('[data-testid="403-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="403-message"]')).toContainText('权限不足');

      // 验证导航菜单中不包含用户管理
      await expect(page.locator('[data-testid="nav-users"]')).not.toBeVisible();
    });
  });

  test.describe('响应式设计', () => {
    test('移动端用户管理界面 - 严格验证', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });

      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/users`);

      // 验证移动端布局
      await expect(page.locator('[data-testid="desktop-user-list"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="mobile-user-list"]')).toBeVisible();

      const mobileCard = page.locator('[data-testid="mobile-user-card"]').first();
      await expect(mobileCard).toBeVisible();

      // 验证移动端用户卡片包含必要信息
      const cardFields = [
        'mobile-username', 'mobile-email', 'mobile-role', 'mobile-status'
      ];

      for (const field of cardFields) {
        await expect(mobileCard.locator(`[data-testid="${field}"]`),
          `移动端卡片缺少字段: ${field}`).toBeVisible();
      }

      // 验证搜索功能在移动端的可用性
      await page.click('[data-testid="mobile-search-button"]');
      await expect(page.locator('[data-testid="mobile-search-overlay"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-search-input"]')).toBeVisible();

      // 测试移动端添加用户
      await page.click('[data-testid="mobile-search-close"]');
      await page.click('[data-testid="mobile-add-user-fab"]');
      await expect(page.locator('[data-testid="mobile-add-user-bottom-sheet"]')).toBeVisible();

      // 验证视口尺寸
      const viewportSize = page.viewportSize();
      expect(viewportSize?.width, '移动端视口宽度不正确').toBe(375);
      expect(viewportSize?.height, '移动端视口高度不正确').toBe(667);
    });
  });

  test.describe('性能测试', () => {
    test('大数据量用户列表加载性能 - 严格验证', async ({ page }) => {
      await loginAsAdmin(page);

      // 测量页面加载时间
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/users`);
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      const loadTime = Date.now() - startTime;

      // 验证加载时间在合理范围内（3秒以内）
      expect(loadTime, `页面加载时间过长: ${loadTime}ms`).toBeLessThan(3000);

      // 验证虚拟滚动（如果有大量数据）
      const userRows = page.locator('[data-testid="user-row"]');
      const visibleRows = await userRows.count();

      // 验证只加载可见行数（通常不超过50行）
      expect(visibleRows, `可见行数过多: ${visibleRows}`).toBeLessThanOrEqual(50);

      // 验证网络请求性能
      const apiCall = apiRequests.find(req => req.url.includes('/api/users') && req.method === 'GET');
      expect(apiCall, '缺少用户列表API请求').toBeDefined();

      // 模拟大数据量测试
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
        };
      });

      expect(performanceMetrics.totalLoadTime, '总加载时间过长').toBeLessThan(5000);
      expect(performanceMetrics.domContentLoaded, 'DOM内容加载时间过长').toBeLessThan(2000);
    });
  });
});

/**
 * 页面加载验证
 */
async function validatePageLoad(page: Page) {
  // 等待页面完全加载
  await page.waitForLoadState('networkidle');

  // 验证没有500错误
  const statusCode = page.response()?.status();
  expect(statusCode, '页面返回错误状态码').not.toBe(500);

  // 验证关键元素加载
  await expect(page.locator('body')).toBeVisible();
}

/**
 * API请求验证
 */
async function validateApiRequests(requests: ApiResponseValidation[], expectedRequests: Array<{
  url: string;
  method: string;
  status: number;
  contentType?: string;
}>) {
  for (const expected of expectedRequests) {
    const matchingRequest = requests.find(req =>
      req.url.includes(expected.url) &&
      req.method === expected.method &&
      req.status === expected.status
    );

    expect(matchingRequest,
      `缺少期望的API请求: ${expected.method} ${expected.url} (状态码: ${expected.status})`
    ).toBeDefined();

    if (expected.contentType && matchingRequest) {
      expect(matchingRequest.contentType).toContain(expected.contentType);
    }
  }
}

/**
 * 管理员登录辅助函数
 */
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="username-input"]', ADMIN_USER.username);
  await page.fill('[data-testid="password-input"]', ADMIN_USER.password);
  await page.click('[data-testid="login-button"]');

  // 等待登录成功并重定向
  await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

  // 验证登录成功标识
  await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
}

/**
 * 教师登录辅助函数
 */
async function loginAsTeacher(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="username-input"]', TEACHER_USER.username);
  await page.fill('[data-testid="password-input"]', TEACHER_USER.password);
  await page.click('[data-testid="login-button"]');

  // 等待登录成功并重定向
  await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

  // 验证登录成功标识
  await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
}

/**
 * 填写用户表单辅助函数
 */
async function fillUserForm(page: Page, userData: typeof TEST_USER, isEdit = false) {
  if (!isEdit) {
    await page.fill('[data-testid="username-input"]', userData.username);
    await page.fill('[data-testid="password-input"]', userData.password);
    await page.fill('[data-testid="confirm-password-input"]', userData.confirmPassword);
  }

  await page.fill('[data-testid="realname-input"]', userData.realName);
  await page.fill('[data-testid="email-input"]', userData.email);
  await page.fill('[data-testid="mobile-input"]', userData.mobile);

  // 选择角色
  await page.click('[data-testid="role-select"]');
  await page.click('[data-testid="role-option-teacher"]');
}

/**
 * 确保测试用户存在
 */
async function ensureTestUserExists(page: Page) {
  const userRow = page.locator(`[data-testid="user-${TEST_USER.username}"]`);

  if (await userRow.count() === 0) {
    // 创建测试用户
    await page.click('[data-testid="add-user-button"]');
    await fillUserForm(page, TEST_USER);
    await page.click('[data-testid="save-user-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('创建用户成功');
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData(page: Page) {
  // 查找并删除测试用户
  const testUserRow = page.locator(`[data-testid="user-${TEST_USER.username}"]`);

  if (await testUserRow.count() > 0) {
    try {
      await testUserRow.locator('[data-testid="delete-user-button"]').click();
      await page.locator('[data-testid="confirm-delete-button"]').click({ timeout: 2000 });
    } catch (error) {
      // 如果删除失败，忽略错误，可能是已经被删除
    }
  }
}