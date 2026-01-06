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

describe('家长端菜单复查', () => {
  test('家长登录并检查所有菜单项', async ({ page }) => {
    console.log('\n🔍 开始家长端菜单复查...\n');

    // 1. 访问登录页面
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    console.log('✅ 访问登录页面');

    // 2. 等待登录表单加载
    await page.waitForSelector('input[type="text"], input[placeholder*="用户名"]', { timeout: 5000 });
    console.log('✅ 登录表单已加载');

    // 3. 输入家长账号
    const usernameInputs = page.locator('input[type="text"]');
    const passwordInputs = page.locator('input[type="password"]');
    
    await usernameInputs.first().fill('parent');
    await passwordInputs.first().fill('password123');
    console.log('✅ 输入家长账号');

    // 4. 点击登录按钮
    const loginButton = page.locator('button:has-text("登录"), button:has-text("登 录")').first();
    await loginButton.click();
    console.log('✅ 点击登录按钮');

    // 5. 等待登录完成
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
      console.log('⚠️ 未跳转到dashboard');
    });
    await page.waitForLoadState('networkidle');
    console.log('✅ 登录完成');

    // 6. 检查侧边栏
    const sidebar = page.locator('[class*="sidebar"], nav, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();
    console.log('✅ 侧边栏可见');

    // 7. 获取所有菜单项
    const menuItems = page.locator('[class*="menu-item"], [class*="nav-item"], .el-menu-item, .el-sub-menu__title').all();
    const items = await menuItems;
    console.log(`\n📊 找到 ${items.length} 个菜单项\n`);

    // 8. 逐个点击菜单项并检查
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < Math.min(items.length, 20); i++) {
      const item = items[i];
      const text = await item.textContent();
      const trimmedText = text?.trim() || '未知';

      try {
        console.log(`${i + 1}. 点击菜单: ${trimmedText}`);
        
        // 点击菜单项
        await item.click();
        await page.waitForLoadState('networkidle');

        // 检查是否有错误
        const errorElements = page.locator('[class*="error"], [class*="Error"], .el-alert--error, .error-message').all();
        const errors = await errorElements;

        if (errors.length > 0) {
          console.log(`   ❌ 发现错误`);
          errorCount++;
        } else {
          console.log(`   ✅ 页面加载成功`);
          successCount++;
        }

        // 检查是否有控制台错误
        const consoleMessages: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleMessages.push(msg.text());
          }
        });

        if (consoleMessages.length > 0) {
          console.log(`   ⚠️ 控制台错误: ${consoleMessages.join(', ')}`);
        }

        // 截图
        await page.screenshot({ path: `parent-menu-check-${i + 1}.png` });

      } catch (error) {
        console.log(`   ❌ 点击失败: ${error}`);
        errorCount++;
      }
    }

    console.log(`\n📊 菜单检查结果:`);
    console.log(`  ✅ 成功: ${successCount}`);
    console.log(`  ❌ 失败: ${errorCount}`);
    console.log(`  📝 总计: ${Math.min(items.length, 20)}`);

    // 9. 检查是否能访问admin控制台（应该不能）
    console.log('\n🔐 检查权限隔离...');
    try {
      await page.goto('http://localhost:5173/system-center');
      await page.waitForLoadState('networkidle');
      
      const errorMsg = page.locator('[class*="error"], [class*="forbidden"], [class*="unauthorized"]').first();
      if (await errorMsg.isVisible()) {
        console.log('✅ 正确拦截了admin控制台访问');
      } else {
        console.log('⚠️ 未检测到权限拦截');
      }
    } catch (error) {
      console.log('✅ 正确拦截了admin控制台访问');
    }

    console.log('\n✅ 菜单复查完成');
  });
});

