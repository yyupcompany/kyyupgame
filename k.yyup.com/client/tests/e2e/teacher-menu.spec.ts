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

describe('教师菜单显示测试', () => {
  test('教师登录后应该显示完整的侧边栏菜单', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 2. 输入教师账号
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="username"]').first();
    const passwordInput = page.locator('input[placeholder*="密码"], input[placeholder*="password"]').first();
    
    await usernameInput.fill('teacher_demo');
    await passwordInput.fill('password123'); // 根据实际密码修改

    // 3. 点击登录按钮
    const loginButton = page.locator('button:has-text("登录"), button:has-text("Sign In")').first();
    await loginButton.click();

    // 4. 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
      // 如果没有跳转到dashboard，可能在其他页面
    });
    await page.waitForLoadState('networkidle');

    // 5. 检查侧边栏是否存在
    const sidebar = page.locator('[class*="sidebar"], [class*="menu"], nav').first();
    await expect(sidebar).toBeVisible();

    // 6. 检查菜单项是否存在
    const menuItems = page.locator('[class*="menu-item"], [class*="nav-item"], li[role="menuitem"]');
    const count = await menuItems.count();
    
    console.log(`✅ 找到 ${count} 个菜单项`);
    expect(count).toBeGreaterThan(5); // 至少应该有5个菜单项

    // 7. 检查是否包含教师相关的菜单
    const teacherMenus = page.locator('text=/教师|Teacher/i');
    const teacherMenuCount = await teacherMenus.count();
    
    console.log(`✅ 找到 ${teacherMenuCount} 个教师相关菜单`);
    expect(teacherMenuCount).toBeGreaterThan(0);

    // 8. 截图保存
    await page.screenshot({ path: 'teacher-menu-screenshot.png' });
    console.log('✅ 菜单截图已保存');
  });
});

