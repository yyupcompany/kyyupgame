/**
 * 全站链接遍历测试套件
 * 自动发现所有移动端页面链接并验证可访问性
 */

import { test, expect, Page } from '@playwright/test';
import { launchMobileBrowser, detectPageData, log } from './mcp-test-utils';
import { LinkCrawlResult, PageDetectionMetrics } from './mcp-types';

test.describe('🌐 移动端全站链接遍历测试', () => {
  let browser: any;
  let context: any;
  let page: Page;
  let crawlResult: LinkCrawlResult;

  test.beforeAll(async () => {
    // 启动移动端浏览器
    const launched = await launchMobileBrowser();
    browser = launched.browser;
    context = launched.context;
    page = launched.page;

    // 初始化爬取结果
    crawlResult = {
      totalLinks: 0,
      success: 0,
      failed: 0,
      notFound: 0,
      visited: new Set<string>(),
      errors: []
    };
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('🕷️ TC-MCP-LINK-001: 全站链接自动发现与遍历', async () => {
    log('开始全站链接自动遍历...', 'info');

    // 从登录页面开始
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // 使用BFS算法遍历所有页面
    const queue = ['http://localhost:5173/login'];
    const visited = new Set<string>();
    const maxPages = 50; // 限制最大遍历页面数，避免时间过长

    while (queue.length > 0 && visited.size < maxPages) {
      const url = queue.shift()!;

      if (visited.has(url)) {
        continue;
      }

      visited.add(url);
      crawlResult.visited.add(url);

      log(`\n--- 访问页面: ${url} ---`, 'info');

      try {
        // 访问页面
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        // 等待页面加载
        await page.waitForTimeout(1000);

        // 获取页面数据
        const pageData = await detectPageData(page);

        // 验证页面状态
        if (pageData.errors.has404) {
          crawlResult.notFound++;
          crawlResult.errors.push({
            url,
            error: '404 Page Not Found'
          });
          log(`❌ 404错误: ${url}`, 'error');
        } else {
          crawlResult.success++;
          log(`✅ 页面访问成功: ${url}`, 'info');
        }

        // 获取页面内所有链接
        const pageLinks = await getPageLinks(page);
        log(`发现 ${pageLinks.length} 个链接`, 'info');

        // 添加新链接到队列
        for (const link of pageLinks) {
          if (!visited.has(link) && !queue.includes(link) && isValidMobileLink(link)) {
            if (queue.length < maxPages * 2) { // 限制队列大小
              queue.push(link);
            }
          }
        }

        crawlResult.totalLinks += pageLinks.length;

      } catch (error) {
        crawlResult.failed++;
        crawlResult.errors.push({
          url,
          error: error.message
        });
        log(`❌ 页面访问失败: ${url} - ${error.message}`, 'error');
      }
    }

    log(`\n🎉 链接遍历完成！`, 'info');
    log(`📊 访问页面数: ${visited.size}`, 'info');
    log(`✅ 成功: ${crawlResult.success}`, 'info');
    log(`❌ 失败: ${crawlResult.failed}`, 'info');
    log(`🔍 404: ${crawlResult.notFound}`, 'info');
    log(`🔗 发现链接: ${crawlResult.totalLinks}`, 'info');

    // 验证成功率
    const successRate = crawlResult.success / visited.size;
    expect(successRate).toBeGreaterThan(0.9); // 90%成功率
  });

  test('🎯 TC-MCP-LINK-002: 移动端专属链接过滤验证', async () => {
    log('验证移动端链接过滤...', 'info');

    // 登录后以教师身份测试
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('.teacher-btn');
    await page.click('.teacher-btn');
    await page.waitForURL(/\/mobile/);

    // 获取当前页面所有链接
    const allLinks = await getPageLinks(page);
    const mobileLinks = allLinks.filter(link => isValidMobileLink(link));

    log(`📊 总链接数: ${allLinks.length}`, 'info');
    log(`📱 移动端链接: ${mobileLinks.length}`, 'info');
    log(`🔗 非移动端链接: ${allLinks.length - mobileLinks.length}`, 'info');

    // 验证移动端链接格式
    for (const link of mobileLinks.slice(0, 20)) { // 测试前20个
      expect(link).toMatch(/^http:\/\/localhost:5173\/mobile/);
    }

    // 验证不合法的链接被过滤
    const invalidLinks = [
      'mailto:admin@example.com',
      'tel:123456789',
      'http://example.com/external',
      'javascript:void(0)',
      '#'
    ];

    for (const invalidLink of invalidLinks) {
      expect(isValidMobileLink(invalidLink)).toBe(false);
    }

    log(`✅ 移动端链接过滤验证通过`, 'info');
  });

  test('📦 TC-MCP-LINK-003: 链接去重验证', async () => {
    log('验证链接去重功能...', 'info');

    await page.goto('http://localhost:5173/mobile/parent-center');
    await page.waitForLoadState('networkidle');

    // 多次获取链接验证去重
    const links1 = await getPageLinks(page);
    const links2 = await getPageLinks(page);

    expect(links1.length).toBe(links2.length);

    // 验证链接无重复
    const uniqueLinks = new Set(links1);
    expect(uniqueLinks.size).toBe(links1.length);

    log(`✅ 链接去重验证通过，共 ${links1.length} 个唯一链接`, 'info');
  });

  test('📊 TC-MCP-LINK-004: 链接状态码验证', async () => {
    log('验证链接HTTP状态码...', 'info');

    const statusCodeResults = [];

    // 获取一批链接进行状态码验证
    await page.goto('http://localhost:5173/mobile');
    await page.waitForLoadState('networkidle');

    const pageLinks = await getPageLinks(page);
    const testLinks = pageLinks.slice(0, 10); // 测试前10个链接

    for (const link of testLinks) {
      try {
        const response = await page.goto(link, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });

        const status = response.status();
        statusCodeResults.push({
          url: link,
          status,
          success: status < 400
        });

        log(`🔗 ${link} - 状态码: ${status}`, 'info');
      } catch (error) {
        statusCodeResults.push({
          url: link,
          status: 0,
          success: false,
          error: error.message
        });
        log(`❌ ${link} - 访问失败: ${error.message}`, 'error');
      }
    }

    // 统计结果
    const successful = statusCodeResults.filter(r => r.success);
    const failed = statusCodeResults.filter(r => !r.success);

    log(`\n📊 状态码验证结果:`, 'info');
    log(`✅ 成功: ${successful.length}/${statusCodeResults.length}`, 'info');
    log(`❌ 失败: ${failed.length}/${statusCodeResults.length}`, 'info');

    // 验证成功率
    expect(successful.length / statusCodeResults.length).toBeGreaterThan(0.8);
  });

  test('⏱️ TC-MCP-LINK-005: 链接加载性能验证', async () => {
    log('验证链接加载性能...', 'info');

    const performanceResults = [];

    // 测试一批链接的加载时间
    await page.goto('http://localhost:5173/mobile/teacher-center');
    await page.waitForLoadState('networkidle');

    const pageLinks = await getPageLinks(page);
    const testLinks = pageLinks.slice(0, 5); // 测试前5个链接

    for (const link of testLinks) {
      const startTime = Date.now();

      try {
        await page.goto(link, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        const endTime = Date.now();
        const loadTime = endTime - startTime;

        performanceResults.push({
          url: link,
          loadTime,
          success: true
        });

        log(`🔗 ${link} - 加载时间: ${loadTime}ms`, 'info');
      } catch (error) {
        const endTime = Date.now();
        const loadTime = endTime - startTime;

        performanceResults.push({
          url: link,
          loadTime,
          success: false,
          error: error.message
        });

        log(`❌ ${link} - 加载失败: ${error.message}`, 'error');
      }
    }

    // 计算平均加载时间
    const successfulLoads = performanceResults.filter(r => r.success);
    if (successfulLoads.length > 0) {
      const avgLoadTime = successfulLoads.reduce((sum, r) => sum + r.loadTime, 0) / successfulLoads.length;

      log(`\n📊 性能测试结果:`, 'info');
      log(`✅ 成功加载: ${successfulLoads.length}/${performanceResults.length}`, 'info');
      log(`⏱️  平均加载时间: ${avgLoadTime.toFixed(2)}ms`, 'info');

      // 验证平均加载时间（本地环境应<3秒）
      expect(avgLoadTime).toBeLessThan(3000);

      // 找出最慢的页面
      const slowest = successfulLoads.reduce((slowest, current) =>
        current.loadTime > slowest.loadTime ? current : slowest
      );
      log(`⚠️  最慢页面: ${slowest.url} (${slowest.loadTime}ms)`, 'warning');
    }
  });

  test('📱 TC-MCP-LINK-006: 移动端底部导航链接验证', async () => {
    log('验证移动端底部导航链接...', 'info');

    // 以家长身份登录
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('.parent-btn');
    await page.click('.parent-btn');
    await page.waitForURL(/\/mobile/);

    // 获取底部导航链接
    await page.waitForSelector('.mobile-footer .van-tabbar-item');
    const navLinks = await page.$$eval('.mobile-footer .van-tabbar-item', (elements) =>
      elements.map(el => ({
        text: el.textContent?.trim(),
        href: el.getAttribute('to') || el.getAttribute('href')
      }))
    );

    log(`📊 发现 ${navLinks.length} 个底部导航项`, 'info');

    // 验证每个导航链接
    for (const navLink of navLinks) {
      expect(navLink.text).toBeDefined();
      expect(navLink.text?.length).toBeGreaterThan(0);

      // 验证链接可点击
      const navItem = page.locator(`.mobile-footer .van-tabbar-item:has-text("${navLink.text}")`);
      const isVisible = await navItem.isVisible();
      const isDisabled = await navItem.isDisabled();

      expect(isVisible).toBe(true);
      expect(isDisabled).toBe(false);

      log(`✅ 导航项 "${navLink.text}" 可用`, 'info');
    }

    // 测试导航切换
    for (const navLink of navLinks) {
      const navItem = page.locator(`.mobile-footer .van-tabbar-item:has-text("${navLink.text}")`);

      await navItem.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 验证页面加载成功
      const pageData = await detectPageData(page);
      expect(pageData.errors.has404).toBe(false);

      log(`✅ 导航到 "${navLink.text}" 成功`, 'info');
    }
  });

  test('🚨 TC-MCP-LINK-007: 错误链接和边界情况验证', async () => {
    log('验证错误链接和边界情况...', 'info');

    // 测试不存在的页面（404）
    try {
      await page.goto('http://localhost:5173/mobile/non-existent-page', {
        waitUntil: 'domcontentloaded',
        timeout: 5000
      });

      // 如果页面成功加载（可能有默认路由），检查是否有404标识
      const pageData = await detectPageData(page);

      if (!pageData.errors.has404) {
        log(`⚠️ 不存在的页面被重定向或处理了`, 'warning');
      } else {
        log(`✅ 404页面正确识别`, 'info');
      }
    } catch (error) {
      log(`✅ 不存在的页面访问失败（预期行为）`, 'info`);
    }

    // 测试特殊字符链接
    const specialUrls = [
      'http://localhost:5173/mobile/<>',
      'http://localhost:5173/mobile/""',
      'http://localhost:5173/mobile/%20',
      'http://localhost:5173/mobile/?param=value'
    ];

    for (const url of specialUrls) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 3000
        });
        log(`⚠️ 特殊URL访问成功: ${url}`, 'warning`);
      } catch (error) {
        log(`✅ 特殊URL正确处理: ${url}`, 'info');
      }
    }
  });
});

/**
 * 获取页面所有链接
 */
async function getPageLinks(page: Page): Promise<string[]> {
  const links = await page.$$eval(
    'a[href], .van-cell, .van-button, .van-tabbar-item',
    (elements) => elements
      .map(el => {
        const anchor = el as HTMLAnchorElement;
        const button = el as HTMLButtonElement;

        // 获取链接
        let href = anchor.href || el.getAttribute('href') || el.getAttribute('to') || '';

        // 如果是相对路径，转为绝对路径
        if (href.startsWith('/')) {
          href = `http://localhost:5173${href}`;
        }

        return href;
      })
      .filter(href => href && href.startsWith('http://localhost:5173'))
  );

  // 去重
  return [...new Set(links)];
}

/**
 * 验证是否为有效的移动端链接
 */
function isValidMobileLink(url: string): boolean {
  // 必须是本地链接
  if (!url || !url.startsWith('http://localhost:5173')) {
    return false;
  }

  // 必须是移动端路径
  if (!url.includes('/mobile') && !url.includes('/parent-center') && !url.includes('/teacher-center')) {
    return false;
  }

  // 排除非法协议
  if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) {
    return false;
  }

  // 排除锚点
  if (url.includes('#') && !url.includes('/#')) {
    return false;
  }

  // 排除参数链接
  if (url.includes('?') && url.includes('param=')) {
    return false;
  }

  return true;
}
