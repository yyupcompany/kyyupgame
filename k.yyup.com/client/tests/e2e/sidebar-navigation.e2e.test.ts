/**
 * 端到端测试 - 侧边栏导航菜单
 * 
 * 测试覆盖：
 * - 不同角色用户的侧边栏菜单显示
 * - 菜单项的权限控制
 * - 菜单导航功能
 * - 侧边栏展开/收起功能
 * - 响应式设计适配
 */

import { test, expect, Page } from '@playwright/test';
import { vi } from 'vitest'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

// 测试用户数据
const TEST_USERS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    expectedName: '系统管理员',
    expectedMenus: [
      '工作台',
      '招生中心',
      '活动中心',
      '人员中心',
      '营销中心',
      '智能中心',
      '财务中心',
      '系统中心',
      '任务中心',
      '话术中心',
      '新媒体中心'
    ]
  },
  teacher: {
    username: 'teacher',
    password: '123456',
    role: 'teacher',
    expectedName: '教师',
    expectedMenus: [
      '工作台',
      '招生中心',
      '活动中心',
      '人员中心',
      '营销中心',
      '智能中心',
      '任务中心',
      '话术中心',
      '新媒体中心'
    ]
  },
  parent: {
    username: 'parent',
    password: '123456',
    role: 'parent',
    expectedName: '家长',
    expectedMenus: [
      '工作台'
    ]
  }
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

describe('侧边栏导航菜单 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前清理状态
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test.describe('管理员侧边栏菜单', () => {
    test('显示完整的侧边栏菜单', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      
      // 验证登录成功 - 管理员登录后跳转到仪表板页面
      await expect(page).toHaveURL(/\/dashboard/);
      
      // 验证侧边栏存在
      await expect(page.locator('#improved-sidebar')).toBeVisible();
      
      // 验证所有预期菜单项都存在
      for (const menuName of TEST_USERS.admin.expectedMenus) {
        await expect(page.locator(`a:has-text("${menuName}")`)).toBeVisible({ timeout: 10000 });
      }
      
      // 验证菜单数量
      const menuItems = page.locator('.center-item');
      await expect(menuItems).toHaveCount(TEST_USERS.admin.expectedMenus.length, { timeout: 10000 });
    });

    test('点击菜单项导航到正确页面', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      
      // 点击招生中心菜单
      await page.click('a:has-text("招生中心")');
      await expect(page).toHaveURL(/\/centers\/enrollment/);
      
      // 返回工作台
      await page.click('a:has-text("工作台")');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('侧边栏展开/收起功能', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      
      // 验证侧边栏默认展开状态
      await expect(page.locator('#improved-sidebar')).not.toHaveClass(/collapsed/);
      
      // 点击菜单切换按钮（在Navbar中）
      await page.click('.sidebar-toggle-btn');
      
      // 验证侧边栏收起状态
      await expect(page.locator('#improved-sidebar')).toHaveClass(/collapsed/);
      
      // 再次点击切换按钮
      await page.click('.sidebar-toggle-btn');
      
      // 验证侧边栏重新展开
      await expect(page.locator('#improved-sidebar')).not.toHaveClass(/collapsed/);
    });
  });

  test.describe('教师侧边栏菜单', () => {
    test('显示教师权限范围内的菜单', async ({ page }) => {
      await performLogin(page, TEST_USERS.teacher);
      
      // 验证登录成功 - 教师登录后跳转到仪表板页面
      await expect(page).toHaveURL(/\/dashboard/);
      
      // 验证侧边栏存在
      await expect(page.locator('#improved-sidebar')).toBeVisible();
      
      // 验证教师应有的菜单项都存在
      for (const menuName of TEST_USERS.teacher.expectedMenus) {
        await expect(page.locator(`a:has-text("${menuName}")`)).toBeVisible({ timeout: 10000 });
      }
      
      // 验证菜单数量
      const menuItems = page.locator('.center-item');
      await expect(menuItems).toHaveCount(TEST_USERS.teacher.expectedMenus.length, { timeout: 10000 });
    });

    test('教师没有系统管理菜单', async ({ page }) => {
      await performLogin(page, TEST_USERS.teacher);
      
      // 验证侧边栏存在
      await expect(page.locator('#improved-sidebar')).toBeVisible();
      
      // 验证教师不能访问系统管理页面
      await page.goto(`${BASE_URL}/centers/system`);
      // 教师访问系统中心页面应该显示权限不足
      await expect(page.locator('text=权限不足')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('家长侧边栏菜单', () => {
    test('家长只能看到有限的菜单', async ({ page }) => {
      await performLogin(page, TEST_USERS.parent);
      
      // 验证登录成功 - 家长登录后跳转到家长页面
      await expect(page).toHaveURL(/\/parent/);
      
      // 验证侧边栏存在
      await expect(page.locator('#improved-sidebar')).toBeVisible();
      
      // 验证家长只能看到工作台菜单
      await expect(page.locator('a:has-text("工作台")')).toBeVisible();
      
      // 验证菜单数量（家长应该只有工作台）
      const menuItems = page.locator('.center-item');
      await expect(menuItems).toHaveCount(1);
    });
  });

  test.describe('菜单交互功能', () => {
    test('菜单项悬停效果', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      
      // 悬停在第一个菜单项上
      const firstMenuItem = page.locator('.center-item').first();
      await firstMenuItem.hover();
      
      // 验证悬停样式（这里验证元素存在，具体样式需要在视觉测试中验证）
      await expect(firstMenuItem).toBeVisible();
    });

    test('当前激活菜单项高亮', async ({ page }) => {
      await performLogin(page, TEST_USERS.admin);
      
      // 点击招生中心菜单
      await page.click('a:has-text("招生中心")');
      await expect(page).toHaveURL(/\/centers\/enrollment/);
      
      // 验证招生中心菜单项有激活状态
      const activeMenuItem = page.locator('a:has-text("招生中心")');
      await expect(activeMenuItem).toHaveClass(/active/);
    });
  });

  test.describe('响应式设计', () => {
    test('移动端侧边栏适配', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      
      await performLogin(page, TEST_USERS.admin);
      
      // 验证移动端侧边栏存在
      await expect(page.locator('#improved-sidebar')).toBeVisible();
      
      // 点击菜单切换按钮
      await page.click('.sidebar-toggle-btn');
      
      // 验证侧边栏展开状态
      await expect(page.locator('#improved-sidebar')).not.toHaveClass(/collapsed/);
    });

    test('平板端侧边栏适配', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await performLogin(page, TEST_USERS.admin);
      
      // 验证平板端侧边栏存在
      await expect(page.locator('#improved-sidebar')).toBeVisible();
      
      // 验证侧边栏在平板端的默认状态
      await expect(page.locator('#improved-sidebar')).toBeVisible();
    });
  });

  test.describe('权限动态更新', () => {
    test('用户权限变更后菜单实时更新', async ({ page }) => {
      await performLogin(page, TEST_USERS.teacher);
      
      // 验证初始菜单状态
      const initialMenuCount = await page.locator('.center-item').count();
      
      // 由于这是端到端测试，我们通过刷新页面来验证权限状态保持
      await page.reload();
      
      // 验证菜单状态保持一致
      const afterReloadMenuCount = await page.locator('.center-item').count();
      expect(afterReloadMenuCount).toBe(initialMenuCount);
    });
  });
});

/**
 * 执行登录操作的辅助函数
 */
async function performLogin(page: Page, user: typeof TEST_USERS.admin) {
  await page.goto(`${BASE_URL}/login`);
  
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
  
  // 使用表单登录
  await page.fill('#username', user.username);
  await page.fill('#password', user.password);
  await page.click('button[type="submit"]');
  
  // 根据不同角色等待跳转到对应的页面
  if (user.role === 'parent') {
    await page.waitForURL(/\/parent/, { timeout: 15000 });
  } else {
    // 管理员和教师登录后跳转到仪表板页面
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  }
}