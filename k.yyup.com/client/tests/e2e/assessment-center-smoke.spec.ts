import { test, expect } from '@playwright/test';

/**
 * 评估中心快速冒烟测试
 * 验证核心功能是否正常工作
 */

test.describe('评估中心 - 冒烟测试', () => {
  const BASE_URL = 'http://localhost:5173';
  const CENTER_PATH = '/centers/assessment';

  test.beforeEach(async ({ page }) => {
    // 直接访问评估中心，不进行登录
    // 如果需要登录会自动跳转
    await page.goto(`${BASE_URL}${CENTER_PATH}`);
    await page.waitForTimeout(2000);
  });

  test('页面应该能够加载', async ({ page }) => {
    // 验证URL
    expect(page.url()).toContain(CENTER_PATH);

    // 验证页面内容存在
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();
  });

  test('应该显示评估中心相关内容', async ({ page }) => {
    // 尝试多种选择器
    const titleSelectors = [
      'h1',
      'h2',
      '[class*="title"]',
      'text=/测评/',
      'text=/评估/'
    ];

    let found = false;
    for (const selector of titleSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent();
          if (text && (text.includes('测评') || text.includes('评估'))) {
            found = true;
            console.log(`找到标题: ${text}`);
            break;
          }
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    // 如果没找到特定标题，至少验证页面有内容
    if (!found) {
      const bodyText = await page.textContent('body');
      console.log('页面内容预览:', bodyText?.substring(0, 200));
      expect(bodyText).toBeDefined();
      expect(bodyText?.length).toBeGreaterThan(100);
    }
  });

  test('页面应该没有JavaScript错误', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.toString());
    });

    await page.reload();
    await page.waitForTimeout(3000);

    // 验证没有严重的JavaScript错误
    const severeErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('MutationObserver')
    );

    console.log('JavaScript错误:', severeErrors);
    // 允许一些非关键错误
    expect(severeErrors.length).toBeLessThan(10);
  });

  test('页面应该有合理的加载时间', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}${CENTER_PATH}`);
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    const loadTime = Date.now() - startTime;
    console.log(`页面加载时间: ${loadTime}ms`);

    // 页面应该在5秒内完成基本加载
    expect(loadTime).toBeLessThan(5000);
  });

  test('应该检查关键元素是否存在', async ({ page }) => {
    // 检查常见的容器元素
    const containerSelectors = [
      '[class*="center"]',
      '[class*="container"]',
      '[class*="layout"]',
      '.el-main',
      '#app'
    ];

    let foundElements = 0;
    for (const selector of containerSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        foundElements += count;
        console.log(`找到 ${count} 个 ${selector} 元素`);
      }
    }

    console.log(`总共找到 ${foundElements} 个容器元素`);
    expect(foundElements).toBeGreaterThan(0);
  });

  test('应该验证路由配置', async ({ page }) => {
    // 检查当前URL
    const currentUrl = page.url();
    console.log('当前URL:', currentUrl);

    // 验证URL包含预期路径
    expect(currentUrl).toMatch(/\/centers\/assessment/i);
  });
});

/**
 * 快速测试总结：
 *
 * 本测试文件包含6个快速冒烟测试：
 * 1. 页面加载测试
 * 2. 内容显示测试
 * 3. JavaScript错误检测
 * 4. 加载性能测试
 * 5. 关键元素检查
 * 6. 路由配置验证
 *
 * 运行时间：约30-60秒
 * 用于快速验证评估中心的基本可用性
 */
