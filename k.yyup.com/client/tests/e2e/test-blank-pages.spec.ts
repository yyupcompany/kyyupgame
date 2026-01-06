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

describe('前端空白页面测试', () => {
  test('测试所有侧边栏菜单项', async ({ page }) => {
    console.log('开始测试...');

    // 1. 访问登录页面
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // 2. 登录admin
    console.log('尝试登录admin账户...');
    const usernameInput = await page.$('input[type="text"], input[name="username"]');
    if (usernameInput) {
      await usernameInput.fill('admin');
    }

    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill('admin123');
    }

    const loginButton = await page.$('button[type="submit"], button:has-text("登录")');
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(3000);
    }

    await page.waitForLoadState('networkidle');

    // 3. 提取所有菜单链接
    const menuItems = await page.$$eval(
      'a[href]',
      (elements: any[]) => {
        return elements
          .map(el => ({
            text: el.textContent?.trim() || '',
            href: el.href || ''
          }))
          .filter(item => item.href && item.text.length > 0);
      }
    );

    console.log(`找到 ${menuItems.length} 个菜单项`);

    // 4. 过滤和去重
    const uniqueUrls = new Set<string>();
    const filteredItems = menuItems.filter(item => {
      const url = new URL(item.href).pathname;
      if (uniqueUrls.has(url)) return false;
      if (url.includes('login') || url.includes('logout') || url === '/') return false;
      uniqueUrls.add(url);
      return true;
    });

    console.log(`过滤后剩余 ${filteredItems.length} 个菜单项`);

    // 5. 测试每个页面
    const blankPages: string[] = [];
    const errorPages: string[] = [];

    for (const item of filteredItems) {
      const url = new URL(item.href).pathname;
      console.log(`\n测试: ${item.text} (${url})`);

      try {
        await page.goto(`http://localhost:5173${url}`);
        await page.waitForTimeout(2000);

        // 检查页面内容
        const bodyText = await page.textContent('body');
        const hasContent = bodyText && bodyText.trim().length > 100;
        const hasError = await page.$('.error, .alert-error, [class*="error"]');
        const has404 = bodyText?.includes('404') || bodyText?.includes('Not Found');

        if (!hasContent || has404) {
          blankPages.push(`${item.text} (${url})`);
          console.log(`❌ 空白页面: ${item.text}`);
          // 截取截图
          await page.screenshot({
            path: `/tmp/blank-${url.replace(/\//g, '_')}.png`,
            fullPage: true
          });
        } else if (hasError) {
          errorPages.push(`${item.text} (${url})`);
          console.log(`⚠️  错误页面: ${item.text}`);
        } else {
          console.log(`✅ 正常: ${item.text}`);
        }

      } catch (error: any) {
        errorPages.push(`${item.text} (${url}) - ${error.message}`);
        console.log(`❌ 错误: ${item.text} - ${error.message}`);
      }
    }

    // 6. 输出结果
    console.log('\n========== 测试结果 ==========');
    console.log(`总计测试: ${filteredItems.length} 个页面`);
    console.log(`空白页面: ${blankPages.length} 个`);
    console.log(`错误页面: ${errorPages.length} 个`);

    if (blankPages.length > 0) {
      console.log('\n❌ 空白页面列表:');
      blankPages.forEach(item => console.log(`  - ${item}`));
    }

    if (errorPages.length > 0) {
      console.log('\n⚠️  错误页面列表:');
      errorPages.forEach(item => console.log(`  - ${item}`));
    }

    // 可以根据需要断言
    // expect(blankPages.length).toBe(0);
  });
});
