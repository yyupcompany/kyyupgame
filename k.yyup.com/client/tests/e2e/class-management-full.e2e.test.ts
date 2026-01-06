/**
 * 端到端测试 - 班级管理模块
 * 严格验证标准升级
 *
 * 测试覆盖：
 * - 班级列表查看和搜索
 * - 班级信息添加、编辑、删除
 * - 学生分配管理
 * - 班级统计信息
 * - 批量操作
 * - 权限验证
 * - 控制台错误检测
 * - API响应验证
 */

import { test, expect, Page } from '@playwright/test';
import {
  validateClassData,
  validateAPIResponse,
  validateRequiredFields,
  validateFieldTypes,
  validatePaginationResponse,
  ConsoleMonitor,
  validatePagePerformance,
  waitForAPICall
} from '../utils/e2e-validation-helpers';

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
const TEST_CLASS = {
  name: 'E2E测试班级',
  code: 'E2E001',
  ageGroup: 'small',
  maxCapacity: 30,
  classroom: 'A101',
  description: '用于E2E测试的班级'
};

test.describe('班级管理模块 E2E 测试 - 严格验证', () => {
  test.beforeEach(async ({ page }) => {
    // 设置控制台监听
    const consoleMonitor = new ConsoleMonitor(page);

    // 清理状态
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test.afterEach(async ({ page }) => {
    // 验证控制台错误
    const consoleMonitor = new ConsoleMonitor(page);
    consoleMonitor.expectNoErrors();
    consoleMonitor.expectNoWarnings();
  });

  test.describe('班级列表功能 - 严格验证', () => {
    test('管理员查看班级列表 - 严格验证', async ({ page }) => {
      const consoleMonitor = new ConsoleMonitor(page);
      const startTime = Date.now();

      // 登录
      await loginAsAdmin(page);

      // 监听API调用
      const apiCallPromise = waitForAPICall(page, '/api/classes');

      // 导航到班级管理页面
      await page.click('[data-testid="nav-classes"]');
      await expect(page).toHaveURL(`${BASE_URL}/classes`);

      // 等待API响应
      const apiResponse = await apiCallPromise;

      // 验证API响应
      expect(apiResponse.status).toBe(200);
      const apiValidation = validateAPIResponse(apiResponse.response);
      expect(apiValidation.valid).toBe(true);

      // 验证分页响应结构
      if (apiResponse.response.data && Array.isArray(apiResponse.response.data.items)) {
        const paginationValidation = validatePaginationResponse(apiResponse.response.data);
        expect(paginationValidation.valid).toBe(true);

        // 验证班级数据结构
        if (apiResponse.response.data.items.length > 0) {
          apiResponse.response.data.items.forEach((classItem: any) => {
            const classValidation = validateClassData(classItem);
            expect(classValidation.valid).toBe(true);
          });
        }
      }

      // 验证页面加载性能
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5秒内加载完成

      // 验证页面元素
      await expect(page.locator('[data-testid="page-title"]')).toContainText('班级管理');
      await expect(page.locator('[data-testid="classes-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-class-button"]')).toBeVisible();

      // 验证表格列存在
      const headerColumns = [
        'ID', '班级名称', '班级编号', '年龄段', '容量', '满员率', '主班教师', '副班教师', '教室', '状态', '开班时间', '操作'
      ];

      for (const column of headerColumns) {
        await expect(page.locator(`[data-testid="table-header-${column}"]`)).toBeVisible();
      }

      // 验证表格数据行存在
      const classRows = page.locator('[data-testid="class-row"]');
      await expect(classRows).toHaveCountGreaterThan(0);

      // 验证表格数据结构
      const rowCount = await classRows.count();
      if (rowCount > 0) {
        const firstRow = classRows.first();

        // 验证必填的单元格存在
        const requiredCells = [
          '[data-testid="class-name"]',
          '[data-testid="class-code"]',
          '[data-testid="class-age-group"]',
          '[data-testid="class-capacity"]',
          '[data-testid="class-status"]'
        ];

        for (const cellSelector of requiredCells) {
          await expect(firstRow.locator(cellSelector)).toBeVisible();
        }
      }

      // 验证控制台无错误
      consoleMonitor.expectNoErrors();
    });

    test('班级搜索功能', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 按名称搜索
      await page.fill('[data-testid="search-input"]', '小班');
      await page.click('[data-testid="search-button"]');
      
      // 验证搜索结果
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      const results = page.locator('[data-testid="class-row"]');
      await expect(results).toHaveCountGreaterThan(0);
      
      // 验证结果中都包含搜索关键词
      const firstResult = results.first();
      await expect(firstResult.locator('[data-testid="class-name"]')).toContainText('小班');
      
      // 清除搜索
      await page.click('[data-testid="clear-search-button"]');
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    });

    test('班级列表筛选功能', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 按年龄段筛选
      await page.click('[data-testid="age-group-filter-dropdown"]');
      await page.click('[data-testid="age-group-filter-small"]');
      
      // 验证筛选结果
      const filteredRows = page.locator('[data-testid="class-row"]');
      await expect(filteredRows).toHaveCountGreaterThan(0);
      
      // 验证所有结果都属于选定年龄段
      const ageGroups = await filteredRows.locator('[data-testid="class-age-group"]').allTextContents();
      expect(ageGroups.every(group => group.includes('小班'))).toBeTruthy();
      
      // 按状态筛选
      await page.click('[data-testid="status-filter-dropdown"]');
      await page.click('[data-testid="status-filter-active"]');
      
      // 按教师筛选
      await page.click('[data-testid="teacher-filter-dropdown"]');
      await page.click('[data-testid="teacher-filter-option-1"]');
    });

    test('班级列表分页功能', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 验证分页组件存在
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      await expect(page.locator('[data-testid="page-info"]')).toBeVisible();
      
      // 测试页面大小更改
      await page.click('[data-testid="page-size-selector"]');
      await page.click('[data-testid="page-size-20"]');
      
      // 验证每页显示数量改变
      const rows = page.locator('[data-testid="class-row"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeLessThanOrEqual(20);
      
      // 测试翻页
      if (await page.locator('[data-testid="next-page-button"]').isEnabled()) {
        await page.click('[data-testid="next-page-button"]');
        await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
      }
    });
  });

  test.describe('班级信息管理 - 严格验证', () => {
    test('添加新班级 - 严格验证', async ({ page }) => {
      const consoleMonitor = new ConsoleMonitor(page);
      const startTime = Date.now();

      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);

      // 监听创建班级的API调用
      const createApiPromise = waitForAPICall(page, '/api/classes');

      // 点击添加班级按钮
      await page.click('[data-testid="add-class-button"]');
      await expect(page.locator('[data-testid="add-class-dialog"]')).toBeVisible();

      // 验证表单必填字段存在
      const requiredFormFields = [
        '[data-testid="class-name-input"]',
        '[data-testid="class-code-input"]',
        '[data-testid="age-group-selector"]',
        '[data-testid="max-capacity-input"]',
        '[data-testid="classroom-input"]'
      ];

      for (const fieldSelector of requiredFormFields) {
        await expect(page.locator(fieldSelector)).toBeVisible();
      }

      // 验证测试数据有效性
      const classDataValidation = validateClassData(TEST_CLASS);
      expect(classDataValidation.valid).toBe(true);

      // 填写班级信息
      await fillClassForm(page, TEST_CLASS);

      // 提交表单前验证表单数据
      const formData = {
        name: await page.locator('[data-testid="class-name-input"]').inputValue(),
        code: await page.locator('[data-testid="class-code-input"]').inputValue(),
        maxCapacity: parseInt(await page.locator('[data-testid="max-capacity-input"]').inputValue()),
        classroom: await page.locator('[data-testid="classroom-input"]').inputValue()
      };

      // 验证表单数据结构
      const requiredFields = ['name', 'code', 'maxCapacity', 'classroom'];
      const fieldsValidation = validateRequiredFields(formData, requiredFields);
      expect(fieldsValidation.valid).toBe(true);

      const typeValidation = validateFieldTypes(formData, {
        name: 'string',
        code: 'string',
        maxCapacity: 'number',
        classroom: 'string'
      });
      expect(typeValidation.valid).toBe(true);

      // 提交表单
      await page.click('[data-testid="save-class-button"]');

      // 等待API响应
      const createApi = await createApiPromise;
      expect(createApi.status).toBe(201); // 期望创建成功状态码

      // 验证API响应结构
      const apiValidation = validateAPIResponse(createApi.response);
      expect(apiValidation.valid).toBe(true);

      // 验证返回的班级数据
      if (createApi.response.data) {
        const responseClassValidation = validateClassData(createApi.response.data);
        expect(responseClassValidation.valid).toBe(true);
      }

      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]')).toContainText('创建成功');

      // 验证创建操作耗时
      const operationTime = Date.now() - startTime;
      expect(operationTime).toBeLessThan(10000); // 10秒内完成

      // 验证班级出现在列表中
      await expect(page.locator(`[data-testid="class-${TEST_CLASS.name}"]`)).toBeVisible();

      // 验证班级详细信息正确显示
      const classRow = page.locator(`[data-testid="class-${TEST_CLASS.name}"]`);
      await expect(classRow.locator('[data-testid="class-name"]')).toContainText(TEST_CLASS.name);
      await expect(classRow.locator('[data-testid="class-code"]')).toContainText(TEST_CLASS.code);
      await expect(classRow.locator('[data-testid="class-classroom"]')).toContainText(TEST_CLASS.classroom);

      // 验证控制台无错误
      consoleMonitor.expectNoErrors();
    });

    test('编辑班级信息', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 找到第一个班级并点击编辑
      const firstClass = page.locator('[data-testid="class-row"]').first();
      await firstClass.locator('[data-testid="edit-class-button"]').click();
      
      await expect(page.locator('[data-testid="edit-class-dialog"]')).toBeVisible();
      
      // 修改班级信息
      const updatedData = {
        ...TEST_CLASS,
        name: '已修改班级',
        maxCapacity: 35
      };
      
      await fillClassForm(page, updatedData, true);
      
      // 保存修改
      await page.click('[data-testid="save-class-button"]');
      
      // 验证修改成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('更新成功');
      
      // 验证修改后的信息
      await expect(page.locator(`[data-testid="class-${updatedData.name}"]`)).toBeVisible();
    });

    test('删除班级', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 记录删除前的班级数量
      const initialCount = await page.locator('[data-testid="class-row"]').count();
      
      // 删除第一个班级
      const firstClass = page.locator('[data-testid="class-row"]').first();
      const className = await firstClass.locator('[data-testid="class-name"]').textContent();
      
      await firstClass.locator('[data-testid="delete-class-button"]').click();
      
      // 确认删除
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-confirmation-text"]')).toContainText(className || '');
      
      await page.click('[data-testid="confirm-delete-button"]');
      
      // 验证删除成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('删除成功');
      
      // 验证班级数量减少
      const finalCount = await page.locator('[data-testid="class-row"]').count();
      expect(finalCount).toBe(initialCount - 1);
    });

    test('查看班级详情', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 点击第一个班级的详情按钮
      const firstClass = page.locator('[data-testid="class-row"]').first();
      await firstClass.locator('[data-testid="view-class-button"]').click();
      
      // 验证班级详情页面
      await expect(page).toHaveURL(/\/classes\/\d+$/);
      await expect(page.locator('[data-testid="class-detail-page"]')).toBeVisible();
      
      // 验证基本信息
      await expect(page.locator('[data-testid="class-name-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="class-code-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="class-age-group-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="class-capacity-display"]')).toBeVisible();
    });
  });

  test.describe('学生管理', () => {
    test('管理班级学生', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 点击第一个班级的学生管理按钮
      const firstClass = page.locator('[data-testid="class-row"]').first();
      await firstClass.locator('[data-testid="manage-students-button"]').click();
      
      // 验证学生管理对话框
      await expect(page.locator('[data-testid="student-management-dialog"]')).toBeVisible();
      
      // 验证班级信息
      await expect(page.locator('[data-testid="class-info"]')).toBeVisible();
      
      // 验证学生列表
      await expect(page.locator('[data-testid="students-table"]')).toBeVisible();
      
      // 测试添加学生
      await page.click('[data-testid="add-student-button"]');
      await expect(page.locator('[data-testid="add-student-dialog"]')).toBeVisible();
      
      // 测试转班
      const firstStudent = page.locator('[data-testid="student-row"]').first();
      await firstStudent.locator('[data-testid="transfer-student-button"]').click();
      await expect(page.locator('[data-testid="transfer-student-dialog"]')).toBeVisible();
      
      // 测试移除学生
      await page.click('[data-testid="remove-student-button"]');
      await expect(page.locator('[data-testid="confirm-remove-dialog"]')).toBeVisible();
    });
  });

  test.describe('批量操作', () => {
    test('批量选择班级', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 测试全选功能
      await page.click('[data-testid="select-all-checkbox"]');
      
      // 验证所有班级被选中
      const checkboxes = page.locator('[data-testid="class-checkbox"]');
      const count = await checkboxes.count();
      
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
      
      // 验证批量操作按钮出现
      await expect(page.locator('[data-testid="bulk-actions-toolbar"]')).toBeVisible();
      await expect(page.locator('[data-testid="selected-count"]')).toContainText(`已选择 ${count} 个班级`);
      
      // 取消全选
      await page.click('[data-testid="select-all-checkbox"]');
      
      // 验证所有班级被取消选择
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    });

    test('批量分配教师', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 选择前3个班级
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="class-checkbox"]').nth(i).click();
      }
      
      // 点击批量分配教师
      await page.click('[data-testid="bulk-assign-teacher-button"]');
      
      // 验证分配教师对话框
      await expect(page.locator('[data-testid="bulk-assign-teacher-dialog"]')).toBeVisible();
      
      // 选择目标教师
      await page.click('[data-testid="target-teacher-selector"]');
      await page.click('[data-testid="teacher-option-2"]');
      
      // 确认分配
      await page.click('[data-testid="confirm-assign-button"]');
      
      // 验证分配成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('批量分配教师成功');
    });

    test('批量删除班级', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 选择一些班级
      await page.click('[data-testid="select-all-checkbox"]');
      
      // 点击批量删除按钮
      await page.click('[data-testid="bulk-delete-button"]');
      
      // 确认批量删除
      await expect(page.locator('[data-testid="confirm-batch-delete-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-confirmation-text"]')).toContainText('确定要删除选中的');
      
      await page.click('[data-testid="confirm-delete-button"]');
      
      // 验证删除成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('批量删除成功');
    });
  });

  test.describe('权限验证', () => {
    test('教师查看班级权限', async ({ page }) => {
      await loginAsTeacher(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 验证页面加载
      await expect(page.locator('[data-testid="classes-table"]')).toBeVisible();
      
      // 验证教师可以看到班级列表
      const classRows = page.locator('[data-testid="class-row"]');
      await expect(classRows).toHaveCountGreaterThan(0);
      
      // 验证教师无法添加班级
      await expect(page.locator('[data-testid="add-class-button"]')).not.toBeVisible();
      
      // 验证教师无法删除班级
      await expect(page.locator('[data-testid="delete-class-button"]').first()).not.toBeVisible();
    });

    test('家长无法访问班级管理页面', async ({ page }) => {
      // 家长登录
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[data-testid="username-input"]', 'parent1');
      await page.fill('[data-testid="password-input"]', 'parent123');
      await page.click('[data-testid="login-button"]');
      
      // 尝试访问班级管理页面
      await page.goto(`${BASE_URL}/classes`);
      
      // 验证被拒绝访问
      await expect(page.locator('[data-testid="403-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="403-message"]')).toContainText('权限不足');
    });
  });

  test.describe('响应式设计', () => {
    test('移动端班级管理界面', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/classes`);
      
      // 验证移动端布局
      await expect(page.locator('[data-testid="mobile-class-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-class-card"]').first()).toBeVisible();
      
      // 验证搜索功能在移动端的可用性
      await page.click('[data-testid="mobile-search-button"]');
      await expect(page.locator('[data-testid="mobile-search-overlay"]')).toBeVisible();
      
      // 测试移动端添加班级
      await page.click('[data-testid="mobile-add-class-fab"]');
      await expect(page.locator('[data-testid="mobile-add-class-bottom-sheet"]')).toBeVisible();
    });
  });

  test.describe('性能测试', () => {
    test('大数据量班级列表加载性能', async ({ page }) => {
      await loginAsAdmin(page);
      
      // 测量页面加载时间
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/classes`);
      await expect(page.locator('[data-testid="classes-table"]')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // 验证加载时间在合理范围内（5秒以内）
      expect(loadTime).toBeLessThan(5000);
      
      // 验证虚拟滚动（如果有大量数据）
      const classRows = page.locator('[data-testid="class-row"]');
      const visibleRows = await classRows.count();
      
      // 验证只加载可见行数（通常不超过50行）
      expect(visibleRows).toBeLessThanOrEqual(50);
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
 * 填写班级表单辅助函数
 */
async function fillClassForm(page: Page, classData: typeof TEST_CLASS, isEdit = false) {
  if (!isEdit) {
    await page.fill('[data-testid="class-name-input"]', classData.name);
    await page.fill('[data-testid="class-code-input"]', classData.code);
  }
  
  // 选择年龄段
  await page.click('[data-testid="age-group-selector"]');
  await page.click(`[data-testid="age-group-option-${classData.ageGroup}"]`);
  
  // 设置最大容量
  await page.fill('[data-testid="max-capacity-input"]', classData.maxCapacity.toString());
  
  // 填写教室
  await page.fill('[data-testid="classroom-input"]', classData.classroom);
  
  // 填写描述
  await page.fill('[data-testid="description-input"]', classData.description);
  
  // 选择主班教师
  await page.click('[data-testid="main-teacher-selector"]');
  await page.click('[data-testid="teacher-option-1"]');
  
  // 选择开班时间
  await page.fill('[data-testid="start-date-input"]', '2024-09-01');
}