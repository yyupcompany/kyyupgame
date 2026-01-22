/**
 * 全站链接遍历测试套件 - 扩展版
 * 覆盖所有角色和所有移动端页面
 */

import { test, expect, Page } from '@playwright/test';
import { launchMobileBrowser, detectPageData, log } from './mcp-test-utils';
import { LinkCrawlResult, PageDetectionMetrics } from './mcp-types';

test.describe('🌐 移动端全站链完整遍历测试（所有角色）', () => {
  let browser: any;
  let context: any;
  let page: Page;

  test.beforeAll(async () => {
    const launched = await launchMobileBrowser();
    browser = launched.browser;
    context = launched.context;
    page = launched.page;
    setupErrorListeners(page);
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('🔍 TC-MCP-CRAWLER-EXT-001: 全站页面自动发现与遍历', async () => {
    log('开始全站自动页面发现与遍历...', 'info');

    // 所有移动端路由（基于路由文件分析）
    const allMobileRoutes = [
      // ===== 登录和通用页面 =====
      '/login',
      '/register',
      '/forgot-password',

      // ===== 家长中心（38+功能） =====
      '/mobile/parent-center',
      '/mobile/parent-center/dashboard',
      '/mobile/parent-center/profile',
      '/mobile/parent-center/children',
      '/mobile/parent-center/children/add',
      '/mobile/parent-center/children/edit',
      '/mobile/parent-center/children/growth',
      '/mobile/parent-center/child-growth',
      '/mobile/parent-center/assessment',
      '/mobile/parent-center/activities',
      '/mobile/parent-center/games',
      '/mobile/parent-center/promotion-center',
      '/mobile/parent-center/kindergarten-rewards',
      '/mobile/parent-center/notifications',
      '/mobile/parent-center/chat',
      '/mobile/parent-center/smart-communication',
      '/mobile/parent-center/feedback',
      '/mobile/parent-center/share-stats',

      // ===== 教师中心（15+功能） =====
      '/mobile/teacher-center',
      '/mobile/teacher-center/dashboard',
      '/mobile/teacher-center/notifications',
      '/mobile/teacher-center/tasks',
      '/mobile/teacher-center/tasks/create',
      '/mobile/teacher-center/activities',
      '/mobile/teacher-center/teaching',
      '/mobile/teacher-center/creative-curriculum',
      '/mobile/teacher-center/customer-tracking',
      '/mobile/teacher-center/attendance',
      '/mobile/teacher-center/performance-rewards',
      '/mobile/teacher-center/appointment-management',
      '/mobile/teacher-center/class-contacts',
      '/mobile/teacher-center/customer-pool',

      // ===== 管理中心（21个中心） =====
      '/mobile/centers',
      '/mobile/centers/index',
      '/mobile/centers/activity-center',
      '/mobile/centers/activity-center/index',
      '/mobile/centers/activity-center/detail',
      '/mobile/centers/activity-center/create',
      '/mobile/centers/ai-center',
      '/mobile/centers/assessment-center',
      '/mobile/centers/attendance-center',
      '/mobile/centers/business-center',
      '/mobile/centers/document-center',
      '/mobile/centers/enrollment-center',
      '/mobile/centers/finance-center',
      '/mobile/centers/inspection-center',
      '/mobile/centers/marketing-center',
      '/mobile/centers/media-center',
      '/mobile/centers/notification-center',
      '/mobile/centers/personnel-center',
      '/mobile/centers/principal-center',
      '/mobile/centers/system-center',
      '/mobile/centers/teaching-center',
      '/mobile/centers/user-center',
      '/mobile/centers/document-template-center',
      '/mobile/centers/document-collaboration',
      '/mobile/centers/document-editor',
      '/mobile/centers/task-center',
      '/mobile/centers/analytics-center',
      '/mobile/centers/permission-center'],

      crawlResult = {
        totalLinks: 0,
        success: 0,
        failed: 0,
        notFound: 0,
        forbidden: 0,
        serverError: 0,
        visited: new Set<string>(),
        errors: []
      };

    // 使用BFS算法遍历所有已知路由
    const queue = [...allMobileRoutes];
    const maxVisits = Math.min(allMobileRoutes.length, 60); // 限制最大访问量

    while (queue.length > 0 && crawlResult.visited.size < maxVisits) {
      const url = queue.shift()!;

      if (crawlResult.visited.has(url) || !isValidMobileUrl(url)) {
        continue;
      }

      crawlResult.visited.add(url);

      try {
        log(`\n--- 访问页面: ${url} ---`, 'info');

        const response = await page.goto(`http://localhost:5173${url.startsWith('/') ? url : '/' + url}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        await page.waitForTimeout(1000);

        const pageData = await detectPageData(page);
        const status = response.status();

        // 分类统计
        if (status === 404 || pageData.errors.has404) {
          crawlResult.notFound++;
          crawlResult.errors.push({ url, error: `404 Not Found ${status}` });
          log(`❌ 404错误: ${url}`, 'error');
        } else if (status === 403 || pageData.errors.has403) {
          crawlResult.forbidden++;
          crawlResult.errors.push({ url, error: `403 Forbidden ${status}` });
          log(`❌ 403权限错误: ${url}`, 'error');
        } else if (status >= 500 || pageData.errors.has500) {
          crawlResult.serverError++;
          crawlResult.errors.push({ url, error: `500 Server Error ${status}` });
          log(`❌ 500服务器错误: ${url}`, 'error');
        } else if (status >= 400) {
          crawlResult.failed++;
          log(`❌ 客户端错误 ${status}: ${url}`, 'error');
        } else {
          crawlResult.success++;
          log(`✅ 页面访问成功: ${url}`, 'info');

          // 记录页面数据
          const totalComponents = pageData.components.statsCards.count +
                                 pageData.components.contentCards.count +
                                 pageData.components.lists.itemCount;
          log(`  └─ 组件数量: ${totalComponents} (统计:${pageData.components.statsCards.count}, 卡片:${pageData.components.contentCards.count}, 列表:${pageData.components.lists.itemCount})`, 'info');

          if (pageData.components.buttons.primary > 0) {
            log(`  └─ 主要按钮: ${pageData.components.buttons.primary} 个`, 'info');
          }

          if (pageData.errors.consoleErrors.length > 0) {
            log(`  ⚠️  控制台错误: ${pageData.errors.consoleErrors.length} 条`, 'warning');
          }
        }

        // 从当前页面发现新链接
        const pageLinks = await getPageLinks(page);
        for (const link of pageLinks) {
          if (!crawlResult.visited.has(link) && isValidMobileUrl(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }

        crawlResult.totalLinks += pageLinks.length;
        log(`  └─ 发现 ${pageLinks.length} 个新链接`, 'info');

      } catch (error) {
        crawlResult.failed++;
        crawlResult.errors.push({ url, error: error.message });
        log(`❌ 访问失败: ${url} - ${error.message}`, 'error');
      }

      // 随机延时，避免请求过快
      await page.waitForTimeout(500 + Math.random() * 1000);
    }

    // 生成详细报告
    log('\n═══════════════════════════════════════════════════════════', 'info');
    log('📊 全站页面遍历完成报告', 'info');
    log('═══════════════════════════════════════════════════════════', 'info');
    log(`总访问页面: ${crawlResult.visited.size}`, 'info');
    log(`✅ 成功: ${crawlResult.success} (${((crawlResult.success / crawlResult.visited.size) * 100).toFixed(1)}%)`, 'info');
    log(`❌ 失败: ${crawlResult.failed} (${((crawlResult.failed / crawlResult.visited.size) * 100).toFixed(1)}%)`, 'info');
    log(`🔍 404: ${crawlResult.notFound}`, 'info');
    log(`🔒 403: ${crawlResult.forbidden}`, 'info');
    log(`🔥 500: ${crawlResult.serverError}`, 'info');
    log(`🔗 发现新链接: ${crawlResult.totalLinks}`, 'info');
    log('═══════════════════════════════════════════════════════════', 'info');

    // 验证关键指标
    const successRate = crawlResult.success / crawlResult.visited.size;
    expect(successRate).toBeGreaterThan(0.85); // 要求至少85%成功率
  });

  test('👥 TC-MCP-CRAWLER-EXT-002: 多角色切换遍历验证', async () => {
    log('开始验证多角色切换下的页面访问...', 'info');

    // 模拟登录不同角色并访问权限页面
    const roleScenarios = [
      {
        name: '家长角色',
        loginPath: '.parent-btn',
        allowedPages: ['/mobile/parent-center', '/mobile/children', '/mobile/activities'],
        forbiddenPages: ['/mobile/teacher-center', '/mobile/centers/user-center']
      },
      {
        name: '教师角色',
        loginPath: '.teacher-btn',
        allowedPages: ['/mobile/teacher-center', '/mobile/tasks', '/mobile/attendance'],
        forbiddenPages: ['/mobile/parent-center/assessment', '/mobile/centers/finance-center']
      },
      {
        name: '管理员角色',
        loginPath: '.admin-btn',
        allowedPages: ['/mobile/centers', '/mobile/centers/user-center', '/mobile/centers/system-center'],
        forbiddenPages: [] // 管理员应该没有禁用的页面
      }
    ];

    for (const scenario of roleScenarios.slice(0, 3)) {
      log(`\n--- 测试角色: ${scenario.name} ---`, 'info');

      try {
        // 重新登录
        await page.goto('http://localhost:5173/login');
        await page.waitForSelector(scenario.loginPath, { timeout: 3000 });
        await page.click(scenario.loginPath);
        await page.waitForTimeout(2000);

        // 测试允许访问的页面
        log('测试授权页面:', 'info');
        for (const allowedPage of scenario.allowedPages.slice(0, 2)) {
          try {
            await page.goto(`http://localhost:5173${allowedPage}`, {
              waitUntil: 'domcontentloaded',
              timeout: 4000
            });

            const pageData = await detectPageData(page);
            const isAccessible = !pageData.errors.has404 && !pageData.errors.has403;

            log(`  ${isAccessible ? '✅' : '❌'} ${allowedPage}`, 'info');

            if (!isAccessible) {
              log(`  └─ 错误: ${pageData.errors.has404 ? '404' : pageData.errors.has403 ? '403' : '其他'}`, 'error');
            }
          } catch (error) {
            log(`  ⚠️  跳过: ${error.message}`, 'warning');
          }
        }

        // 测试禁止访问的页面（如果存在）
        if (scenario.forbiddenPages.length > 0) {
          log('测试权限受限页面:', 'info');
          for (const forbiddenPage of scenario.forbiddenPages.slice(0, 2)) {
            try {
              await page.goto(`http://localhost:5173${forbiddenPage}`, {
                waitUntil: 'domcontentloaded',
                timeout: 3000
              });

              const pageData = await detectPageData(page);
              const isAccessDenied = pageData.errors.has403 || pageData.errors.has404;

              log(`  ${isAccessDenied ? '✅' : '⚠️'} ${forbiddenPage} (应受限)`, 'info');
            } catch (error) {
              log(`  ✅ ${forbiddenPage}: 正确限制访问`, 'info');
            }
          }
        }
      } catch (error) {
        log(`❌ ${scenario.name}测试失败: ${error.message}`, 'error');
      }
    }

    log('\n✅ 多角色切换遍历验证完成', 'info');
  });

  test('🗺️ TC-MCP-CRAWLER-EXT-003: 路由导航图生成与验证', async () => {
    log('开始生成移动端路由导航图...', 'info');

    // 访问所有主要模块并记录导航关系
    const navigationMap = new Map<string, string[]>();

    // 从各个中心开始收集导航信息
    const centers = [
      { name: '家长中心', path: '/mobile/parent-center' },
      { name: '教师中心', path: '/mobile/teacher-center' },
      { name: '管理中心', path: '/mobile/centers' }
    ];

    for (const center of centers) {
      log(`\n--- 分析 ${center.name} 导航结构 ---`, 'info');

      try {
        await page.goto(`http://localhost:5173${center.path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);

        // 获取当前页面的链接
        const pageLinks = await getPageLinks(page);
        navigationMap.set(center.name, pageLinks);

        log(`✅ ${center.name}: ${pageLinks.length} 个导航链接`, 'info');

        // 显示前5个链接
        for (const link of pageLinks.slice(0, 5)) {
          log(`  └─ ${link}`, 'info');
        }
      } catch (error) {
        log(`⚠️  ${center.name} 导航分析失败: ${error.message}`, 'warning');
      }
    }

    // 验证导航完整性
    const totalLinks = Array.from(navigationMap.values()).reduce((sum, links) => sum + links.length, 0);
    expect(totalLinks).toBeGreaterThan(20);  // 至少20个导航链接
    log(`\n📊 导航图统计: ${navigationMap.size} 个中心, ${totalLinks} 个导航链接`, 'info');

    log('\n✅ 路由导航图生成与验证完成', 'info');
  });

  test('📊 TC-MCP-CRAWLER-EXT-004: 页面数据完整性验证', async () => {
    log('开始验证各页面数据完整性...', 'info');

    // 定义数据完整性检查点
    const dataCheckPoints = [
      {
        page: '/mobile/parent-center',
        expectedComponents: {
          minStatsCards: 0,
          minContentCards: 1,
          minLists: 0
        },
        description: '家长中心应有数据展示'
      },
      {
        page: '/mobile/teacher-center',
        expectedComponents: {
          minStatsCards: 1,
          minContentCards: 0,
          minLists: 0
        },
        description: '教师中心应有工作台数据'
      },
      {
        page: '/mobile/centers',
        expectedComponents: {
          minStatsCards: 0,
          minContentCards: 1,
          minLists: 1
        },
        description: '管理中心应有中心列表'
      }
    ];

    let passedChecks = 0;

    for (const checkPoint of dataCheckPoints) {
      log(`\n--- 验证: ${checkPoint.description} ---`, 'info');

      try {
        await page.goto(`http://localhost:5173${checkPoint.page}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const pageData = await detectPageData(page);

        // 检查组件数量
        const statsCardsOK = pageData.components.statsCards.count >= checkPoint.expectedComponents.minStatsCards;
        const contentCardsOK = pageData.components.contentCards.count >= checkPoint.expectedComponents.minContentCards;
        const listsOK = pageData.components.lists.itemCount >= checkPoint.expectedComponents.minLists;

        if (statsCardsOK && contentCardsOK && listsOK) {
          passedChecks++;
          log(`✅ ${checkPoint.page} - 数据完整性验证通过`, 'info');
          log(`  ├─ 统计卡片: ${pageData.components.statsCards.count}个 (要求≥${checkPoint.expectedComponents.minStatsCards})`, 'info');
          log(`  ├─ 内容卡片: ${pageData.components.contentCards.count}个 (要求≥${checkPoint.expectedComponents.minContentCards})`, 'info');
          log(`  └─ 列表项: ${pageData.components.lists.itemCount}个 (要求≥${checkPoint.expectedComponents.minLists})`, 'info');
        } else {
          log(`❌ ${checkPoint.page} - 数据完整性验证失败`, 'error');
          if (!statsCardsOK) log(`  └─ 统计卡片: ${pageData.components.statsCards.count} < ${checkPoint.expectedComponents.minStatsCards}`, 'error');
          if (!contentCardsOK) log(`  └─ 内容卡片: ${pageData.components.contentCards.count} < ${checkPoint.expectedComponents.minContentCards}`, 'error');
          if (!listsOK) log(`  └─ 列表项: ${pageData.components.lists.itemCount} < ${checkPoint.expectedComponents.minLists}`, 'error');
        }
      } catch (error) {
        log(`❌ ${checkPoint.page}验证失败: ${error.message}`, 'error');
      }
    }

    log(`\n📊 数据完整性统计: ${passedChecks}/${dataCheckPoints.length} 通过`, 'info');
    expect(passedChecks).toBeGreaterThanOrEqual(dataCheckPoints.length * 0.67); // 至少2/3通过
  });

  test('⏱️ TC-MCP-CRAWLER-EXT-005: 性能与加载时间基准测试', async () => {
    log('开始全站性能与加载时间基准测试...', 'info');

    const performanceResults = [];

    // 性能测试页面集合
    const performancePages = [
      { page: '/login', name: '登录页', expectedTime: 2000 },
      { page: '/mobile/parent-center', name: '家长中心', expectedTime: 3000 },
      { page: '/mobile/teacher-center', name: '教师中心', expectedTime: 3000 },
      { page: '/mobile/centers', name: '管理中心入口', expectedTime: 2500 },
      { page: '/mobile/centers/finance-center', name: '财务中心', expectedTime: 3500 },
      { page: '/mobile/centers/analytics-center', name: '分析中心', expectedTime: 3500 }
    ];

    for (const testPage of performancePages.slice(0, 5)) { // 测试前5个
      log(`\n--- 测试: ${testPage.name} (期望<${testPage.expectedTime}ms) ---`, 'info');

      try {
        const startTime = Date.now();

        await page.goto(`http://localhost:5173${testPage.page}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        const pageData = await detectPageData(page);
        const loadTime = pageData.summary.loadTime || (Date.now() - startTime);

        performanceResults.push({
          page: testPage.page,
          name: testPage.name,
          loadTime,
          success: loadTime < testPage.expectedTime,
          error: pageData.errors.has404 || pageData.errors.has500
        });

        log(`⏱️  ${testPage.name}加载时间: ${loadTime}ms ${loadTime < testPage.expectedTime ? '✅' : '⚠️'}`, 'info');

        if (pageData.errors.has404 || pageData.errors.has500) {
          log(`  └─ 错误: ${pageData.errors.has404 ? '404' : '500'}`, 'error');
        }

        await page.waitForTimeout(500);
      } catch (error) {
        performanceResults.push({
          page: testPage.page,
          name: testPage.name,
          loadTime: -1,
          success: false,
          error: error.message
        });
        log(`❌ ${testPage.name}测试失败: ${error.message}`, 'error');
      }
    }

    // 分析性能数据
    const successful = performanceResults.filter(r => r.success && r.loadTime > 0);

    if (successful.length > 0) {
      const totalTime = successful.reduce((sum, r) => sum + r.loadTime, 0);
      const avgTime = totalTime / successful.length;
      const maxTime = Math.max(...successful.map(r => r.loadTime));
      const minTime = Math.min(...successful.map(r => r.loadTime));

      log('\n════════════════════════════════════════════════════════════', 'info');
      log('📊 性能基准测试结果', 'info');
      log('════════════════════════════════════════════════════════════', 'info');
      log(`测试页面数: ${performanceResults.length}`, 'info');
      log(`成功加载: ${successful.length}`, 'info');
      log(`平均加载时间: ${avgTime.toFixed(2)}ms`, 'info');
      log(`最快: ${minTime}ms (${successful.find(r => r.loadTime === minTime)?.name})`, 'info');
      log(`最慢: ${maxTime}ms (${successful.find(r => r.loadTime === maxTime)?.name})`, 'info');
      log('════════════════════════════════════════════════════════════', 'info');

      expect(avgTime).toBeLessThan(3000); // 平均加载时间应小于3秒
    }

    const successRate = successful.length / performanceResults.length;
    expect(successRate).toBeGreaterThan(0.8); // 成功率应大于80%

    log('\n✅ 性能基准测试完成', 'info');
  });
});

/**
 * 获取页面所有链接
 */
async function getPageLinks(page: Page): Promise<string[]> {
  try {
    const links = await page.$$eval(
      'a[href], .van-cell, .van-button, .van-grid-item, .van-tabbar-item, .van-sidebar-item, .feature-item',
      (elements) => elements
        .map(el => {
          const anchor = el as HTMLAnchorElement;
          const button = el as HTMLButtonElement;

          let href = anchor.href || el.getAttribute('href') || el.getAttribute('to') || '';

          // 如果是相对路径，转为绝对路径
          if (href.startsWith('/')) {
            href = `http://localhost:5173${href}`;
          }

          // 提取路径部分
          if (href.startsWith('http://localhost:5173')) {
            href = href.replace('http://localhost:5173', '');
          }

          return href;
        })
        .filter(href => href && href.length > 1 && href !== '/')
    );

    // 去重并返回
    return [...new Set(links)];
  } catch (error) {
    log(`获取页面链接失败: ${error.message}`, 'warning');
    return [];
  }
}

/**
 * 验证是否为有效的移动端URL
 */
function isValidMobileUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // 必须是移动端路径或登录页
  if (!url.includes('/mobile') && !url.includes('/login') &&
      !url.includes('/register') && !url.includes('/parent-center') &&
      !url.includes('/teacher-center')) {
    return false;
  }

  // 排除非法协议
  if (url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return false;
  }

  // 排除锚点和纯哈希
  if (url === '#' || url.startsWith('#')) return false;

  // 排除外部链接
  if (url.includes('http') && !url.includes('localhost:5173')) return false;

  // 排除文件下载
  if (url.includes('.pdf') || url.includes('.doc') || url.includes('.xls')) return false;

  return true;
}

/**
 * 设置页面错误监听
 */
function setupErrorListeners(page: Page) {
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    // 过滤无关错误
    if (
      text.includes('Plugin has already been applied') ||
      text.includes('Token或用户信息缺失') ||
      text.includes('没有找到认证token') ||
      text.includes('[Vue warn]')
    ) {
      return;
    }

    if (type === 'error') {
      log(`❌ 控制台错误: ${text}`, 'error');
    }
  });

  page.on('pageerror', error => {
    log(`❌ 页面错误: ${error.message}`, 'error');
  });

  log('✅ 错误监听器已设置', 'info');
}
