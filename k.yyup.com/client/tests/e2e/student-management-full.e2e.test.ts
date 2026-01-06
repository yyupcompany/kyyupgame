/**
 * 端到端测试 - 学生管理模块
 * 
 * 测试覆盖：
 * - 学生列表查看和搜索
 * - 学生信息添加、编辑、删除
 * - 学生档案管理
 * - 班级分配
 * - 批量操作
 * - 数据导入导出
 * - 权限验证
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

// 测试数据
const TEST_STUDENT = {
  name: '测试学生',
  gender: '男',
  birthday: '2020-01-15',
  idNumber: '123456202001150001',
  parentName: '测试家长',
  parentPhone: '13800138000',
  address: '测试地址123号',
  classId: '1',
  enrollmentDate: '2024-09-01'
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

describe('学生管理模块 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test.describe('学生列表功能', () => {
    test('管理员查看学生列表', async ({ page }) => {
      // 登录
      await loginAsAdmin(page);
      
      // 导航到学生管理页面
      await page.click('[data-testid="nav-students"]');
      await expect(page).toHaveURL(`${BASE_URL}/students`);
      
      // 验证页面加载
      await expect(page.locator('[data-testid="students-page-title"]')).toContainText('学生管理');
      await expect(page.locator('[data-testid="students-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-student-button"]')).toBeVisible();
      
      // 验证表格列
      const headerColumns = [
        '学号', '姓名', '性别', '年龄', '所属班级', '家长姓名', '联系电话', '状态', '入学时间', '操作'
      ];
      
      for (const column of headerColumns) {
        await expect(page.locator(`[data-testid="table-header-${column}"]`)).toBeVisible();
      }
      
      // 验证至少有一些学生数据
      const studentRows = page.locator('[data-testid="student-row"]');
      await expect(studentRows).toHaveCountGreaterThan(0);
    });

    test('学生搜索功能', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 按姓名搜索
      await page.fill('[data-testid="search-input"]', '张');
      await page.click('[data-testid="search-button"]');
      
      // 验证搜索结果
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      const results = page.locator('[data-testid="student-row"]');
      await expect(results).toHaveCountGreaterThan(0);
      
      // 验证结果中都包含搜索关键词
      const firstResult = results.first();
      await expect(firstResult.locator('[data-testid="student-name"]')).toContainText('张');
      
      // 清除搜索
      await page.click('[data-testid="clear-search-button"]');
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    });

    test('学生列表筛选功能', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 按班级筛选
      await page.click('[data-testid="class-filter-dropdown"]');
      await page.click('[data-testid="class-filter-option-1"]');
      
      // 验证筛选结果
      const filteredRows = page.locator('[data-testid="student-row"]');
      await expect(filteredRows).toHaveCountGreaterThan(0);
      
      // 验证所有结果都属于选定班级
      const classNames = await filteredRows.locator('[data-testid="student-class"]').allTextContents();
      expect(classNames.every(name => name.includes('小班一'))).toBeTruthy();
      
      // 按性别筛选
      await page.click('[data-testid="gender-filter-dropdown"]');
      await page.click('[data-testid="gender-filter-male"]');
      
      // 验证性别筛选
      const genderFiltered = page.locator('[data-testid="student-row"]');
      const genders = await genderFiltered.locator('[data-testid="student-gender"]').allTextContents();
      expect(genders.every(gender => gender === '男')).toBeTruthy();
    });

    test('学生列表分页功能', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 验证分页组件存在
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      await expect(page.locator('[data-testid="page-info"]')).toBeVisible();
      
      // 测试页面大小更改
      await page.click('[data-testid="page-size-selector"]');
      await page.click('[data-testid="page-size-20"]');
      
      // 验证每页显示数量改变
      const rows = page.locator('[data-testid="student-row"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeLessThanOrEqual(20);
      
      // 测试翻页
      if (await page.locator('[data-testid="next-page-button"]').isEnabled()) {
        await page.click('[data-testid="next-page-button"]');
        await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
      }
    });
  });

  test.describe('学生信息管理', () => {
    test('添加新学生', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 点击添加学生按钮
      await page.click('[data-testid="add-student-button"]');
      await expect(page.locator('[data-testid="add-student-dialog"]')).toBeVisible();
      
      // 填写学生信息
      await fillStudentForm(page, TEST_STUDENT);
      
      // 提交表单
      await page.click('[data-testid="save-student-button"]');
      
      // 验证成功提示
      await expect(page.locator('[data-testid="success-message"]')).toContainText('学生添加成功');
      
      // 验证学生出现在列表中
      await expect(page.locator(`[data-testid="student-${TEST_STUDENT.name}"]`)).toBeVisible();
      
      // 验证学生详细信息
      const studentRow = page.locator(`[data-testid="student-${TEST_STUDENT.name}"]`);
      await expect(studentRow.locator('[data-testid="student-name"]')).toContainText(TEST_STUDENT.name);
      await expect(studentRow.locator('[data-testid="student-gender"]')).toContainText(TEST_STUDENT.gender);
      await expect(studentRow.locator('[data-testid="parent-phone"]')).toContainText(TEST_STUDENT.parentPhone);
    });

    test('编辑学生信息', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 找到第一个学生并点击编辑
      const firstStudent = page.locator('[data-testid="student-row"]').first();
      await firstStudent.locator('[data-testid="edit-student-button"]').click();
      
      await expect(page.locator('[data-testid="edit-student-dialog"]')).toBeVisible();
      
      // 修改学生信息
      const updatedData = {
        ...TEST_STUDENT,
        name: '已修改学生',
        parentPhone: '13900139000'
      };
      
      await fillStudentForm(page, updatedData, true); // true表示是编辑模式
      
      // 保存修改
      await page.click('[data-testid="save-student-button"]');
      
      // 验证修改成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('学生信息更新成功');
      
      // 验证修改后的信息
      await expect(page.locator(`[data-testid="student-${updatedData.name}"]`)).toBeVisible();
    });

    test('删除学生', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 记录删除前的学生数量
      const initialCount = await page.locator('[data-testid="student-row"]').count();
      
      // 删除第一个学生
      const firstStudent = page.locator('[data-testid="student-row"]').first();
      const studentName = await firstStudent.locator('[data-testid="student-name"]').textContent();
      
      await firstStudent.locator('[data-testid="delete-student-button"]').click();
      
      // 确认删除
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-confirmation-text"]')).toContainText(studentName || '');
      
      await page.click('[data-testid="confirm-delete-button"]');
      
      // 验证删除成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('学生删除成功');
      
      // 验证学生数量减少
      const finalCount = await page.locator('[data-testid="student-row"]').count();
      expect(finalCount).toBe(initialCount - 1);
      
      // 验证被删除的学生不再存在
      await expect(page.locator(`[data-testid="student-${studentName}"]`)).not.toBeVisible();
    });

    test('查看学生详细档案', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 点击第一个学生的详情按钮
      const firstStudent = page.locator('[data-testid="student-row"]').first();
      await firstStudent.locator('[data-testid="view-student-button"]').click();
      
      // 验证学生详情页面
      await expect(page).toHaveURL(/\/students\/\d+$/);
      await expect(page.locator('[data-testid="student-profile-page"]')).toBeVisible();
      
      // 验证基本信息卡片
      await expect(page.locator('[data-testid="basic-info-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="student-photo"]')).toBeVisible();
      await expect(page.locator('[data-testid="student-name-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="student-id-display"]')).toBeVisible();
      
      // 验证家长信息卡片
      await expect(page.locator('[data-testid="parent-info-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="parent-name-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="parent-phone-display"]')).toBeVisible();
      
      // 验证班级信息卡片
      await expect(page.locator('[data-testid="class-info-card"]')).toBeVisible();
      
      // 验证活动记录卡片
      await expect(page.locator('[data-testid="activity-records-card"]')).toBeVisible();
    });
  });

  test.describe('批量操作', () => {
    test('批量选择学生', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 测试全选功能
      await page.click('[data-testid="select-all-checkbox"]');
      
      // 验证所有学生被选中
      const checkboxes = page.locator('[data-testid="student-checkbox"]');
      const count = await checkboxes.count();
      
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
      
      // 验证批量操作按钮出现
      await expect(page.locator('[data-testid="bulk-actions-toolbar"]')).toBeVisible();
      await expect(page.locator('[data-testid="selected-count"]')).toContainText(`已选择 ${count} 个学生`);
      
      // 取消全选
      await page.click('[data-testid="select-all-checkbox"]');
      
      // 验证所有学生被取消选择
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    });

    test('批量分配班级', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 选择前3个学生
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="student-checkbox"]').nth(i).click();
      }
      
      // 点击批量分配班级
      await page.click('[data-testid="bulk-assign-class-button"]');
      
      // 验证分配班级对话框
      await expect(page.locator('[data-testid="bulk-assign-class-dialog"]')).toBeVisible();
      
      // 选择目标班级
      await page.click('[data-testid="target-class-selector"]');
      await page.click('[data-testid="class-option-2"]');
      
      // 确认分配
      await page.click('[data-testid="confirm-assign-button"]');
      
      // 验证分配成功
      await expect(page.locator('[data-testid="success-message"]')).toContainText('批量分配班级成功');
    });

    test('批量导出学生信息', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 选择一些学生
      await page.click('[data-testid="select-all-checkbox"]');
      
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      
      // 点击导出按钮
      await page.click('[data-testid="bulk-export-button"]');
      
      // 选择导出格式
      await page.click('[data-testid="export-format-excel"]');
      await page.click('[data-testid="confirm-export-button"]');
      
      // 验证下载
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/students.*\.xlsx$/);
    });
  });

  test.describe('数据导入', () => {
    test('Excel文件导入学生信息', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 点击导入按钮
      await page.click('[data-testid="import-students-button"]');
      
      // 验证导入对话框
      await expect(page.locator('[data-testid="import-students-dialog"]')).toBeVisible();
      
      // 下载模板
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-template-button"]');
      const template = await downloadPromise;
      expect(template.suggestedFilename()).toBe('student_import_template.xlsx');
      
      // 上传文件（模拟）
      await page.setInputFiles('[data-testid="file-upload"]', {
        name: 'test_students.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('mock excel data')
      });
      
      // 验证文件上传成功
      await expect(page.locator('[data-testid="uploaded-file-name"]')).toContainText('test_students.xlsx');
      
      // 开始导入
      await page.click('[data-testid="start-import-button"]');
      
      // 验证导入进度
      await expect(page.locator('[data-testid="import-progress"]')).toBeVisible();
      
      // 等待导入完成
      await expect(page.locator('[data-testid="import-success-message"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('权限验证', () => {
    test('教师只能查看所教班级的学生', async ({ page }) => {
      await loginAsTeacher(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 验证页面加载
      await expect(page.locator('[data-testid="students-table"]')).toBeVisible();
      
      // 验证只显示所教班级的学生
      const studentRows = page.locator('[data-testid="student-row"]');
      const classNames = await studentRows.locator('[data-testid="student-class"]').allTextContents();
      
      // 假设教师只教某个特定班级
      const allowedClasses = ['小班一', '小班二'];
      expect(classNames.every(name => allowedClasses.some(allowed => name.includes(allowed)))).toBeTruthy();
      
      // 验证教师无法看到添加学生按钮
      await expect(page.locator('[data-testid="add-student-button"]')).not.toBeVisible();
      
      // 验证教师无法删除学生
      await expect(page.locator('[data-testid="delete-student-button"]').first()).not.toBeVisible();
    });

    test('家长无法访问学生管理页面', async ({ page }) => {
      // 家长登录
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[data-testid="username-input"]', 'parent1');
      await page.fill('[data-testid="password-input"]', 'parent123');
      await page.click('[data-testid="login-button"]');
      
      // 尝试访问学生管理页面
      await page.goto(`${BASE_URL}/students`);
      
      // 验证被拒绝访问
      await expect(page.locator('[data-testid="403-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="403-message"]')).toContainText('权限不足');
    });
  });

  test.describe('响应式设计', () => {
    test('移动端学生管理界面', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      
      await loginAsAdmin(page);
      await page.goto(`${BASE_URL}/students`);
      
      // 验证移动端布局
      await expect(page.locator('[data-testid="mobile-student-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-student-card"]').first()).toBeVisible();
      
      // 验证搜索功能在移动端的可用性
      await page.click('[data-testid="mobile-search-button"]');
      await expect(page.locator('[data-testid="mobile-search-overlay"]')).toBeVisible();
      
      // 测试移动端添加学生
      await page.click('[data-testid="mobile-add-student-fab"]');
      await expect(page.locator('[data-testid="mobile-add-student-bottom-sheet"]')).toBeVisible();
    });
  });

  test.describe('性能测试', () => {
    test('大数据量学生列表加载性能', async ({ page }) => {
      await loginAsAdmin(page);
      
      // 测量页面加载时间
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/students`);
      await expect(page.locator('[data-testid="students-table"]')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // 验证加载时间在合理范围内（5秒以内）
      expect(loadTime).toBeLessThan(5000);
      
      // 验证虚拟滚动（如果有大量数据）
      const studentRows = page.locator('[data-testid="student-row"]');
      const visibleRows = await studentRows.count();
      
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
 * 填写学生表单辅助函数
 */
async function fillStudentForm(page: Page, student: typeof TEST_STUDENT, isEdit = false) {
  if (!isEdit) {
    await page.fill('[data-testid="student-name-input"]', student.name);
  }
  
  // 选择性别
  await page.click('[data-testid="gender-selector"]');
  await page.click(`[data-testid="gender-option-${student.gender}"]`);
  
  // 填写生日
  await page.fill('[data-testid="birthday-input"]', student.birthday);
  
  // 填写身份证号
  await page.fill('[data-testid="id-number-input"]', student.idNumber);
  
  // 填写家长信息
  await page.fill('[data-testid="parent-name-input"]', student.parentName);
  await page.fill('[data-testid="parent-phone-input"]', student.parentPhone);
  
  // 填写地址
  await page.fill('[data-testid="address-input"]', student.address);
  
  // 选择班级
  await page.click('[data-testid="class-selector"]');
  await page.click(`[data-testid="class-option-${student.classId}"]`);
  
  // 填写入学日期
  await page.fill('[data-testid="enrollment-date-input"]', student.enrollmentDate);
}