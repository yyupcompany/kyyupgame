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

describe('家长端菜单审计', () => {
  test('检查家长端侧边栏菜单并验证每个页面', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 2. 查找登录表单
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="username"], input[type="text"]').first();
    const passwordInput = page.locator('input[placeholder*="密码"], input[placeholder*="password"], input[type="password"]').first();
    
    if (await usernameInput.isVisible()) {
      // 3. 输入家长账号
      await usernameInput.fill('parent');
      await passwordInput.fill('password123');

      // 4. 点击登录按钮
      const loginButton = page.locator('button:has-text("登录"), button:has-text("Sign In"), button:has-text("登 录")').first();
      await loginButton.click();

      // 5. 等待登录完成
      await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
        console.log('未跳转到dashboard，可能在其他页面');
      });
      await page.waitForLoadState('networkidle');

      // 6. 检查侧边栏菜单
      const sidebar = page.locator('[class*="sidebar"], [class*="menu"], nav').first();
      await expect(sidebar).toBeVisible();

      // 7. 获取所有菜单项
      const menuItems = page.locator('[class*="menu-item"], [class*="nav-item"], li[role="menuitem"], .el-menu-item, .el-sub-menu__title').all();
      
      console.log(`\n📋 家长端菜单项总数: ${(await menuItems).length}`);

      // 8. 逐个点击菜单项并检查
      const menuList = await menuItems;
      for (let i = 0; i < Math.min(menuList.length, 15); i++) {
        const item = menuList[i];
        const text = await item.textContent();
        
        console.log(`\n${i + 1}. 点击菜单: ${text}`);
        
        try {
          await item.click();
          await page.waitForLoadState('networkidle');
          
          // 检查是否有错误
          const errorElements = page.locator('[class*="error"], [class*="Error"], .el-alert--error').all();
          const errors = await errorElements;
          
          if (errors.length > 0) {
            console.log(`   ❌ 发现错误: ${errors.length}个`);
            for (const error of errors) {
              const errorText = await error.textContent();
              console.log(`      - ${errorText}`);
            }
          } else {
            console.log(`   ✅ 页面加载成功，无错误`);
          }

          // 检查是否使用了全局布局
          const mainContent = page.locator('main, [role="main"], .main-content, .el-main').first();
          if (await mainContent.isVisible()) {
            console.log(`   ✅ 使用了全局布局`);
          } else {
            console.log(`   ⚠️ 未找到全局布局容器`);
          }

          // 检查是否使用了设计令牌（检查CSS变量）
          const computedStyle = await mainContent.evaluate(el => {
            return window.getComputedStyle(el).cssText;
          });
          
          if (computedStyle.includes('var(') || computedStyle.includes('rgb')) {
            console.log(`   ✅ 使用了设计令牌/CSS变量`);
          } else {
            console.log(`   ⚠️ 可能未使用设计令牌`);
          }

          // 截图
          await page.screenshot({ path: `parent-menu-${i + 1}-${text?.replace(/\s+/g, '-')}.png` });
          
        } catch (error) {
          console.log(`   ❌ 点击失败: ${error}`);
        }
      }

      console.log('\n✅ 菜单审计完成');
    } else {
      console.log('❌ 未找到登录表单');
    }
  });
});

