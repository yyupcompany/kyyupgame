/**
 * 用量中心性能测试
 */

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

describe('用量中心性能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(2000);
  });

  test.describe('页面加载性能', () => {
    test('首次加载性能测试', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('http://localhost:5173/usage-center');
      
      // 等待关键元素加载
      await page.waitForSelector('h1:has-text("用量中心")');
      await page.waitForSelector('.stat-card');
      
      const loadTime = Date.now() - startTime;

      console.log(`页面加载时间: ${loadTime}ms`);
      
      // 首次加载应该在3秒内完成
      expect(loadTime).toBeLessThan(3000);
    });

    test('图表渲染性能测试', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(1000);

      const startTime = Date.now();

      // 等待图表渲染
      await page.waitForSelector('.usage-type-pie-chart', { timeout: 5000 });
      
      const renderTime = Date.now() - startTime;

      console.log(`图表渲染时间: ${renderTime}ms`);
      
      // 图表渲染应该在2秒内完成
      expect(renderTime).toBeLessThan(2000);
    });

    test('数据表格渲染性能测试', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(1000);

      const startTime = Date.now();

      // 等待表格渲染
      await page.waitForSelector('.el-table', { timeout: 5000 });
      
      const renderTime = Date.now() - startTime;

      console.log(`表格渲染时间: ${renderTime}ms`);
      
      // 表格渲染应该在2秒内完成
      expect(renderTime).toBeLessThan(2000);
    });
  });

  test.describe('API响应性能', () => {
    test('概览数据加载性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');

      // 监听API请求
      const apiPromise = page.waitForResponse(
        response => response.url().includes('/api/usage-center/overview'),
        { timeout: 5000 }
      );

      const startTime = Date.now();
      const response = await apiPromise;
      const responseTime = Date.now() - startTime;

      console.log(`概览API响应时间: ${responseTime}ms`);
      
      // API响应应该在1秒内
      expect(responseTime).toBeLessThan(1000);
      expect(response.status()).toBe(200);
    });

    test('用户列表加载性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');

      // 监听API请求
      const apiPromise = page.waitForResponse(
        response => response.url().includes('/api/usage-center/users'),
        { timeout: 5000 }
      );

      const startTime = Date.now();
      const response = await apiPromise;
      const responseTime = Date.now() - startTime;

      console.log(`用户列表API响应时间: ${responseTime}ms`);
      
      // API响应应该在1.5秒内
      expect(responseTime).toBeLessThan(1500);
      expect(response.status()).toBe(200);
    });

    test('预警数据加载性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');

      // 监听API请求
      const apiPromise = page.waitForResponse(
        response => response.url().includes('/api/usage-quota/warnings'),
        { timeout: 5000 }
      );

      const startTime = Date.now();
      const response = await apiPromise;
      const responseTime = Date.now() - startTime;

      console.log(`预警API响应时间: ${responseTime}ms`);
      
      // API响应应该在800ms内
      expect(responseTime).toBeLessThan(800);
      expect(response.status()).toBe(200);
    });
  });

  test.describe('交互性能', () => {
    test('搜索响应性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(2000);

      const searchInput = page.locator('input[placeholder="搜索用户名或邮箱"]');

      const startTime = Date.now();
      
      await searchInput.fill('admin');
      await page.waitForTimeout(500);
      
      const searchTime = Date.now() - startTime;

      console.log(`搜索响应时间: ${searchTime}ms`);
      
      // 搜索应该在1秒内响应
      expect(searchTime).toBeLessThan(1000);
    });

    test('分页切换性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(2000);

      const paginationExists = await page.locator('.el-pagination').isVisible();

      if (paginationExists) {
        const nextButton = page.locator('.el-pagination .btn-next');
        
        if (await nextButton.isEnabled()) {
          const startTime = Date.now();
          
          await nextButton.click();
          await page.waitForTimeout(500);
          
          const pageChangeTime = Date.now() - startTime;

          console.log(`分页切换时间: ${pageChangeTime}ms`);
          
          // 分页切换应该在1秒内完成
          expect(pageChangeTime).toBeLessThan(1000);
        }
      }
    });

    test('对话框打开性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(2000);

      const detailButton = page.locator('button:has-text("查看详情")').first();

      if (await detailButton.isVisible()) {
        const startTime = Date.now();
        
        await detailButton.click();
        await page.waitForSelector('.el-dialog:has-text("用户用量详情")');
        
        const dialogOpenTime = Date.now() - startTime;

        console.log(`对话框打开时间: ${dialogOpenTime}ms`);
        
        // 对话框应该在1秒内打开
        expect(dialogOpenTime).toBeLessThan(1000);
      }
    });

    test('数据刷新性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(2000);

      const startTime = Date.now();
      
      await page.click('button:has-text("刷新")');
      await page.waitForTimeout(1000);
      
      const refreshTime = Date.now() - startTime;

      console.log(`数据刷新时间: ${refreshTime}ms`);
      
      // 刷新应该在2秒内完成
      expect(refreshTime).toBeLessThan(2000);
    });
  });

  test.describe('导出性能', () => {
    test('CSV导出性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(2000);

      await page.click('button:has-text("导出数据")');
      await page.waitForTimeout(500);

      const startTime = Date.now();
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=导出CSV');
      await downloadPromise;
      
      const exportTime = Date.now() - startTime;

      console.log(`CSV导出时间: ${exportTime}ms`);
      
      // CSV导出应该在2秒内完成
      expect(exportTime).toBeLessThan(2000);
    });

    test('Excel导出性能', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(2000);

      await page.click('button:has-text("导出数据")');
      await page.waitForTimeout(500);

      const startTime = Date.now();
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=导出Excel');
      await downloadPromise;
      
      const exportTime = Date.now() - startTime;

      console.log(`Excel导出时间: ${exportTime}ms`);
      
      // Excel导出应该在2秒内完成
      expect(exportTime).toBeLessThan(2000);
    });
  });

  test.describe('内存性能', () => {
    test('长时间使用内存稳定性', async ({ page }) => {
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForTimeout(2000);

      // 执行多次操作
      for (let i = 0; i < 5; i++) {
        // 刷新数据
        await page.click('button:has-text("刷新")');
        await page.waitForTimeout(1000);

        // 打开关闭对话框
        const detailButton = page.locator('button:has-text("查看详情")').first();
        if (await detailButton.isVisible()) {
          await detailButton.click();
          await page.waitForTimeout(500);
          await page.click('.el-dialog__headerbtn');
          await page.waitForTimeout(500);
        }
      }

      // 页面应该仍然正常工作
      await expect(page.locator('h1:has-text("用量中心")')).toBeVisible();
    });
  });

  test.describe('并发性能', () => {
    test('多个API并发请求', async ({ page }) => {
      const startTime = Date.now();

      // 同时发起多个请求
      await Promise.all([
        page.goto('http://localhost:5173/usage-center'),
        page.waitForResponse(response => response.url().includes('/api/usage-center/overview')),
        page.waitForResponse(response => response.url().includes('/api/usage-center/users')),
        page.waitForResponse(response => response.url().includes('/api/usage-quota/warnings'))
      ]);

      const totalTime = Date.now() - startTime;

      console.log(`并发请求总时间: ${totalTime}ms`);
      
      // 并发请求应该在3秒内完成
      expect(totalTime).toBeLessThan(3000);
    });
  });

  test.describe('网络性能', () => {
    test('慢速网络下的性能', async ({ page, context }) => {
      // 模拟慢速3G网络
      await context.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });

      const startTime = Date.now();

      await page.goto('http://localhost:5173/usage-center');
      await page.waitForSelector('h1:has-text("用量中心")');

      const loadTime = Date.now() - startTime;

      console.log(`慢速网络加载时间: ${loadTime}ms`);
      
      // 慢速网络下应该在10秒内加载
      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe('性能指标汇总', () => {
    test('综合性能测试', async ({ page }) => {
      const metrics: any = {};

      // 页面加载
      let startTime = Date.now();
      await page.goto('http://localhost:5173/usage-center');
      await page.waitForSelector('h1:has-text("用量中心")');
      metrics.pageLoad = Date.now() - startTime;

      // 图表渲染
      startTime = Date.now();
      await page.waitForSelector('.usage-type-pie-chart');
      metrics.chartRender = Date.now() - startTime;

      // 数据刷新
      startTime = Date.now();
      await page.click('button:has-text("刷新")');
      await page.waitForTimeout(1000);
      metrics.dataRefresh = Date.now() - startTime;

      // 导出数据
      await page.click('button:has-text("导出数据")');
      await page.waitForTimeout(500);
      startTime = Date.now();
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=导出CSV');
      await downloadPromise;
      metrics.export = Date.now() - startTime;

      console.log('性能指标汇总:');
      console.log(`- 页面加载: ${metrics.pageLoad}ms`);
      console.log(`- 图表渲染: ${metrics.chartRender}ms`);
      console.log(`- 数据刷新: ${metrics.dataRefresh}ms`);
      console.log(`- 数据导出: ${metrics.export}ms`);

      // 验证所有指标都在合理范围内
      expect(metrics.pageLoad).toBeLessThan(3000);
      expect(metrics.chartRender).toBeLessThan(2000);
      expect(metrics.dataRefresh).toBeLessThan(2000);
      expect(metrics.export).toBeLessThan(2000);
    });
  });
});

