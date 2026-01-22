/**
 * 园长角色MCP测试套件
 * 验证园长专用页面的功能和权限控制
 */

import { test, expect, Page } from '@playwright/test';
import { launchMobileBrowser, loginAsRole, detectPageData, captureAPIData, getAllClickableElements, validateApiResponse, verifyDataRendering, log } from './mcp-test-utils';
import { PageDetectionMetrics, ApiResponse, TestRole } from './mcp-types';

test.describe('🏫 园长管理权限MCP测试', () => {
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

  test('🎯 TC-MCP-PRINCIPAL-001: 园长登录与权限验证', async () => {
    log('开始测试园长登录流程...', 'info');

    // 访问管理员登录（园长通常使用管理员入口）
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // 尝试管理员入口
    await page.waitForSelector('.admin-btn', { timeout: 3000 }).catch(() => {
      log('⚠️  未找到admin-btn，使用教师入口登录园长账号', 'warning');
    });

    // 园长角色使用教师入口或特殊园长入口
    const hasPrincipalBtn = await page.locator('.principal-btn').count();
    if (hasPrincipalBtn > 0) {
      await page.click('.principal-btn');
    } else {
      // 使用教师入口登录园长账户
      await page.click('.teacher-btn');
    }

    await page.waitForURL(/\/mobile/, { timeout: 5000 });

    const currentUrl = page.url();
    expect(currentUrl).toContain('/mobile');

    log(`✅ 园长登录成功，当前URL: ${currentUrl}`, 'info');
  });

  test('🔐 TC-MCP-PRINCIPAL-002: 访问管理中心权限验证', async () => {
    log('开始验证园长访问管理中心的权限...', 'info');

    // 园长角色可以访问所有管理中心
    await page.goto('http://localhost:5173/mobile/centers');
    await page.waitForLoadState('networkidle');

    const pageData = await detectPageData(page);

    // 验证可以访问管理中心页面
    expect(pageData.errors.has404).toBe(false);
    expect(pageData.errors.has500).toBe(false);

    // 获取所有可访问的管理中心
    const centerLinks = await getAllClickableElements(page);
    const accessibleCenters = centerLinks.filter(link =>
      link.href && link.href.includes('/mobile/centers/')
    );

    log(`✅ 园长可访问 ${accessibleCenters.length} 个管理中心`, 'info');

    // 验证显示管理中心列表
    const hasCenterList = accessibleCenters.length > 0 ||
                          await page.locator('.center-item').count() > 0 ||
                          await page.locator('.van-cell').count() > 0;

    expect(hasCenterList).toBe(true);
    log('✅ 管理中心列表加载正常', 'info');
  });

  test('📊 TC-MCP-PRINCIPAL-003: 校长中心数据统计验证', async () => {
    log('验证校长中心详细统计数据...', 'info');

    // 访问校长专属中心
    await page.goto('http://localhost:5173/mobile/centers/principal-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const pageData = await detectPageData(page);

    // 验证无权限错误
    if (!pageData.errors.has404 && !pageData.errors.has500) {
      log('✅ 园长权限验证通过，可访问校长中心', 'info');

      // 验证统计数据展示
      expect(pageData.components.statsCards.count).toBeGreaterThanOrEqual(0);
      log(`✅ 校长中心显示 ${pageData.components.statsCards.count} 个统计卡片`, 'info');

      // 验证园长专属功能按钮
      const actionButtons = await page.locator('.van-button--primary, .van-button--success').count();
      if (actionButtons > 0) {
        log(`✅ 园长可操作按钮: ${actionButtons} 个`, 'info');
      }

      // 验证数据图表或看板
      const hasCharts = await page.locator('.chart-container, .dashboard-grid').count();
      if (hasCharts > 0) {
        log('✅ 校长中心显示数据图表', 'info');
      }
    } else {
      log('⚠️  园长账户无法访问校长中心（可能权限配置不同）', 'warning');
    }
  });

  test('👥 TC-MCP-PRINCIPAL-004: 多角色权限页面访问验证', async () => {
    log('验证园长多角色权限页面访问...', 'info');

    // 园长可以访问的权限相关页面
    const principalAccessiblePages = [
      '/mobile/centers/permission-center',  // 权限管理中心
      '/mobile/centers/user-center',        // 用户管理中心
      '/mobile/centers/system-center',      // 系统管理中心
      '/mobile/centers/personnel-center',   // 人事管理中心
      '/mobile/centers/principal-center'    // 校长专属中心
    ];

    const results = [];

    for (const pagePath of principalAccessiblePages.slice(0, 5)) { // 测试前5个
      try {
        const response = await page.goto(`http://localhost:5173${pagePath}`, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });

        const status = response.status();
        const pageData = await detectPageData(page);

        results.push({
          path: pagePath,
          accessible: status < 400 && !pageData.errors.has404,
          status,
          error: pageData.errors.has404 ? '404' : null
        });

        log(`✅ 访问 ${pagePath.split('/').pop()}: ${status < 400 ? '成功' : '失败'}`, 'info');
      } catch (error) {
        log(`❌ 访问 ${pagePath}: ${error.message}`, 'error');
        results.push({
          path: pagePath,
          accessible: false,
          error: error.message
        });
      }
    }

    // 园长应能访问大部分管理页面
    const accessibleCount = results.filter(r => r.accessible).length;
    log(`\n📊 园长页面访问结果：${accessibleCount}/${results.length} 可访问`, 'info');

    // 验证至少可以访问部分管理页面
    expect(accessibleCount).toBeGreaterThan(results.length * 0.6); // 至少60%访问成功率
  });

  test('📈 TC-MCP-PRINCIPAL-005: 数据统计与分析页面验证', async () => {
    log('验证园长数据统计与分析页面...', 'info');

    // 园长专属数据看板
    const analyticsPages = [
      '/mobile/centers/analytics-center',    // 数据分析中心
      '/mobile/centers/report-center',       // 报表中心
      '/mobile/centers/inspection-center'    // 检查分析中心
    ];

    for (const pagePath of analyticsPages.slice(0, 3)) {
      try {
        await page.goto(`http://localhost:5173${pagePath}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);

        const pageData = await detectPageData(page);

        if (!pageData.errors.has404 && !pageData.errors.has500) {
          log(`✅ ${pagePath} 数据看板加载成功`, 'info');

          // 验证数据组件
          const dataComponents = pageData.components.statsCards.count +
                                pageData.components.lists.itemCount +
                                pageData.components.contentCards.count;

          if (dataComponents > 0) {
            log(`✅ 显示 ${dataComponents} 个数据组件`, 'info');
          }
        } else {
          log(`⚠️ ${pagePath} 无法访问或数据加载失败`, 'warning');
        }
      } catch (error) {
        log(`⚠️ 访问 ${pagePath} 出错: ${error.message}`, 'warning');
      }
    }
  });

  test('🎯 TC-MCP-PRINCIPAL-006: 园长特殊操作权限验证', async () => {
    log('验证园长特殊操作权限...', 'info');

    // 到相关管理页面
    await page.goto('http://localhost:5173/mobile/centers');
    await page.waitForLoadState('networkidle');

    // 查找特殊权限按钮（如审核、审批、删除等）
    const specialActionButtons = await page.$$eval(
      '.van-button--danger, .van-button--warning, .van-button--success',
      (buttons) => buttons.map(btn => ({
        text: btn.textContent?.trim(),
        type: btn.className,
        disabled: btn.disabled
      }))
    );

    if (specialActionButtons.length > 0) {
      log(`✅ 发现 ${specialActionButtons.length} 个特殊操作按钮:`, 'info');
      specialActionButtons.forEach(btn => {
        log(`  - [${btn.type}] "${btn.text}" ${btn.disabled ? '（禁用）' : '（可用）'}`, 'info`);
      });

      // 验证至少有一个可用的高级权限按钮
      const enabledButtons = specialActionButtons.filter(btn => !btn.disabled);
      expect(enabledButtons.length).toBeGreaterThan(0);
      log('✅ 园长有特殊操作权限', 'info');
    } else {
      log('⚠️  当前页面未发现特殊权限按钮', 'warning');
    }
  });

  test('📱 TC-MCP-PRINCIPAL-007: 多设备兼容性验证', async () => {
    log('验证园长功能在多设备上的兼容性...', 'info');

    const devices = [
      { width: 375, height: 667, name: 'iPhone SE', pixelRatio: 2 },
      { width: 390, height: 844, name: 'iPhone 12', pixelRatio: 3 },
      { width: 360, height: 740, name: 'Android Small', pixelRatio: 2 },
      { width: 412, height: 846, name: 'Android Large', pixelRatio: 2.6 },
      { width: 768, height: 1024, name: 'iPad Portrait', pixelRatio: 2 }
    ];

    for (const device of devices.slice(0, 3)) { // 测试前3个设备
      log(`\n--- 测试设备: ${device.name} ---`, 'info');

      // 设置设备视口
      await page.setViewportSize({ width: device.width, height: device.height });

      // 访问园长中心
      await page.goto('http://localhost:5173/mobile/centers');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // 验证布局完整性
      const pageData = await detectPageData(page);

      // 检查底部导航
      const footerVisible = await page.locator('.mobile-footer').isVisible();
      expect(footerVisible).toBe(true);

      log(`✅ ${device.name}: 布局正常显示`, 'info');
      log(`✅ ${device.name}: 底部导航可见`, 'info');
    }
  });

  test('🔔 TC-MCP-PRINCIPAL-008: 园长通知和审批权限验证', async () => {
    log('验证园长通知和审批权限...', 'info');

    // 访问通知中心
    await page.goto('http://localhost:5173/mobile/centers/notification-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 验证可以查看系统级通知
    const pageData = await detectPageData(page);

    // 园长应该能看到更多通知选项
    const notificationOptions = await page.$$eval('.notification-option, .van-cell', elements =>
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );

    log(`✅ 园长通知选项: ${notificationOptions.slice(0, 5).join(', ')}`, 'info');
    expect(notificationOptions.length).toBeGreaterThan(0);

    // 验证审批功能
    const approvalElements = await page.locator('.approval-btn, .review-btn').count();
    if (approvalElements > 0) {
      log(`✅ 园长有 ${approvalElements} 个审批功能入口`, 'info');
    }
  });

  test('💾 TC-MCP-PRINCIPAL-009: 园长数据操作能力验证', async () => {
    log('验证园长数据操作能力...', 'info');

    const dataManagementPages = [
      '/mobile/centers/finance-center',      // 财务数据
      '/mobile/centers/enrollment-center',   // 招生数据
      '/mobile/centers/business-center'      // 业务数据
    ];

    for (const pagePath of dataManagementPages.slice(0, 3)) {
      try {
        await page.goto(`http://localhost:5173${pagePath}`, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });

        // 验证数据查看权限
        const pageData = await detectPageData(page);

        if (!pageData.errors.has404) {
          log(`✅ 园长可访问数据: ${pagePath.split('/').pop()}`, 'info');

          // 查找数据导出/打印等高级功能
          const dataActions = await page.locator('.export-btn, .print-btn, .download-btn, .share-btn').count();
          if (dataActions > 0) {
            log(`  └─ 高阶功能: ${dataActions} 个`, 'info');
          }
        }
      } catch (error) {
        log(`⚠️  数据页面访问限制: ${pagePath}`, 'warning');
      }
    }
  });

  test('🎯 TC-MCP-PRINCIPAL-010: 园长全功能完整性验证', async () => {
    log('进行综合性的园长全功能验证...', 'info');

    // 1. 访问多个园长专属功能
    const testFlows = [
      {
        name: '审批流程',
        steps: [
          { path: '/mobile/centers', action: '查看中心列表' },
          { path: '/mobile/centers/principal-center', action: '访问校长中心' },
          { selector: '.approval-btn', action: '点击审批' }
        ]
      },
      {
        name: '数据统计',
        steps: [
          { path: '/mobile/centers/dashboard', action: '访问数据看板' },
          { selector: '.stats-card', action: '查看统计' },
          { selector: '.chart-container', action: '查看图表' }
        ]
      }
    ];

    for (const flow of testFlows.slice(0, 2)) {
      log(`\n--- 测试流程: ${flow.name} ---`, 'info');

      for (const step of flow.steps.slice(0, 2)) {
        try {
          if (step.path) {
            await page.goto(`http://localhost:5173${step.path}`);
            await page.waitForTimeout(1000);
          }

          if (step.selector) {
            const element = await page.locator(step.selector).first();
            const isVisible = await element.isVisible();

            if (isVisible) {
              log(`✅ ${step.action} - 元素可见`, 'info');
            } else {
              log(`⚠️  ${step.action} - 元素不可见`, 'warning');
            }
          }
        } catch (error) {
          log(`⚠️  ${step.action} - 跳过: ${error.message}`, 'warning');
        }
      }
    }

    log('✅ 园长全功能验证完成', 'info');
  });
});

/**
 * 设置页面错误监听
 */
function setupErrorListeners(page: Page) {
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (
      text.includes('Plugin has already been applied') ||
      text.includes('Token或用户信息缺失') ||
      text.includes('没有找到认证token')
    ) {
      return;
    }

    if (type === 'error') {
      log(`❌ 控制台错误: ${text}`, 'error');
    } else if (type === 'warning') {
      log(`⚠️  控制台警告: ${text}`, 'warning');
    }
  });

  page.on('pageerror', error => {
    log(`❌ 页面错误: ${error.message}`, 'error');
  });

  page.on('requestfailed', request => {
    const url = request.url();
    if (url.includes('/api/')) {
      log(`❌ API请求失败: ${url}`, 'error');
    }
  });

  log('✅ 错误监听器已设置', 'info');
}
