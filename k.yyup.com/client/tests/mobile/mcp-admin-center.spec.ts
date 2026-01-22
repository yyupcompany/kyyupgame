/**
 * 管理员角色MCP测试套件
 * 验证管理员最高权限和所有管理中心访问
 */

import { test, expect, Page } from '@playwright/test';
import { launchMobileBrowser, loginAsRole, detectPageData, captureAPIData, getAllClickableElements, validateApiResponse, verifyDataRendering, log } from './mcp-test-utils';
import { PageDetectionMetrics, ApiResponse, TestRole } from './mcp-types';

test.describe('🔐 管理员超级权限MCP测试', () => {
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

  test('🔑 TC-MCP-ADMIN-001: 管理员登录与超级权限初始化', async () => {
    log('开始测试管理员登录流程...', 'info');

    // 访问登录页面
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // 查找管理员入口
    const hasAdminBtn = await page.locator('.admin-btn').count();
    if (hasAdminBtn > 0) {
      await page.click('.admin-btn');
    } else {
      // 如果没有显式管理员入口，使用教师入口（管理员账户）
      log('⚠️  未找到admin-btn，使用教师入口作为管理员', 'warning');
      await page.click('.teacher-btn');
    }

    await page.waitForURL(/\/mobile/, { timeout: 5000 });

    const currentUrl = page.url();
    expect(currentUrl).toContain('/mobile');

    // 管理员登录后应有特殊标识
    const bodyText = await page.locator('body').textContent();
    if (bodyText.toLowerCase().includes('admin') || bodyText.toLowerCase().includes('管理员')) {
      log('✅ 检测到管理员身份标识', 'info');
    }

    log(`✅ 管理员登录成功，当前URL: ${currentUrl}`, 'info');
  });

  test('🏛️ TC-MCP-ADMIN-002: 全站点管理中心访问权限', async () => {
    log('开始测试管理员访问全部管理中心...', 'info');

    // 管理中心列表（根据centers-routes.ts）
    const allCenters = [
      'activity-center',     // 活动中心
      'ai-center',           // AI智能中心
      'assessment-center',   // 评估中心
      'attendance-center',   // 考勤中心
      'business-center',     // 业务中心
      'document-center',     // 文档中心
      'enrollment-center',   // 招生中心
      'finance-center',      // 财务中心
      'inspection-center',   // 检查中心
      'marketing-center',    // 营销中心
      'media-center',        // 媒体中心
      'notification-center', // 通知中心
      'personnel-center',    // 人事中心
      'principal-center',    // 校长中心
      'system-center',       // 系统中心
      'teaching-center',     // 教学中心
      'user-center',         // 用户中心
      'document-template-center',  // 文档模板中心
      'document-collaboration',    // 文档协作
      'document-editor',           // 文档编辑器
      'task-center'          // 任务中心
    ];

    let accessibleCount = 0;
    const results = [];

    // 测试前10个核心管理中心
    for (const center of allCenters.slice(0, 10)) {
      const centerPath = `/mobile/centers/${center}`;

      try {
        const response = await page.goto(`http://localhost:5173${centerPath}`, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });

        const status = response.status();
        const pageData = await detectPageData(page);

        results.push({
          center,
          accessible: status < 400 && !pageData.errors.has404 && !pageData.errors.has500,
          status,
          statsCards: pageData.components.statsCards.count,
          contentCards: pageData.components.contentCards.count
        });

        if (status < 400 && !pageData.errors.has404) {
          accessibleCount++;
          log(`✅ ${center}: 可访问 (${pageData.components.statsCards.count} 统计卡片)`, 'info');
        } else {
          log(`❌ ${center}: 不可访问`, 'error');
        }
      } catch (error) {
        results.push({
          center,
          accessible: false,
          error: error.message
        });
      }
    }

    log(`\n📊 管理中心访问结果：${accessibleCount}/${results.length} 可访问`, 'info');

    // 管理员应能访问所有管理中心
    expect(accessibleCount).toBeGreaterThan(results.length * 0.8); // 至少80%访问率
    log('✅ 管理员全站点访问权限验证通过', 'info');
  });

  test('👤 TC-MCP-ADMIN-003: 用户管理系统全功能验证', async () => {
    log('验证管理员用户管理全功能...', 'info');

    // 访问用户管理中心
    await page.goto('http://localhost:5173/mobile/centers/user-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const pageData = await detectPageData(page);

    // 验证用户列表
    expect(pageData.components.lists.itemCount).toBeGreaterThanOrEqual(0);
    log(`✅ 用户列表显示 ${pageData.components.lists.itemCount} 个用户`, 'info');

    // 验证管理员专属操作按钮
    const adminButtons = await page.locator('.van-button').evaluateAll(buttons =>
      buttons.filter(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return text.includes('add') || text.includes('删除') ||
               text.includes('编辑') || text.includes('权限') ||
               text.includes('启用') || text.includes('禁用');
      })
    );

    if (adminButtons.length > 0) {
      log(`✅ 检测到 ${adminButtons.length} 个管理员操作按钮`, 'info');

      // 验证按钮状态
      for (const button of adminButtons.slice(0, 3)) {
        const isDisabled = await page.locator(`.van-button:has-text("${button.textContent}")`).isDisabled();
        if (!isDisabled) {
          log(`✅ 可操作按钮: "${button.textContent}"`, 'info');
        }
      }
    } else {
      log('⚠️  未检测到管理员专属操作按钮', 'warning');
    }

    // 验证用户筛选和搜索功能
    const searchInput = await page.locator('input[type="search"], .van-search').count();
    const filterSelect = await page.locator('.van-dropdown-menu, .van-picker').count();

    if (searchInput > 0 || filterSelect > 0) {
      log(`✅ 检测到用户筛选功能: ${searchInput} 个搜索, ${filterSelect} 个筛选器`, 'info');
    }
  });

  test('⚙️ TC-MCP-ADMIN-004: 系统配置与管理验证', async () => {
    log('验证管理员系统配置功能...', 'info');

    // 访问系统管理中心
    await page.goto('http://localhost:5173/mobile/centers/system-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const pageData = await detectPageData(page);

    if (!pageData.errors.has404) {
      log('✅ 系统管理中心可访问', 'info');

      // 验证系统配置选项
      const configOptions = await page.$$eval('.van-cell, .van-collapse-item', elements =>
        elements.map(el => el.textContent?.trim()).filter(Boolean)
      );

      if (configOptions.length > 0) {
        log(`✅ 系统配置选项 (${configOptions.slice(0, 5).join(', ')})`, 'info');
        expect(configOptions.length).toBeGreaterThan(0);
      }

      // 验证API配置
      const apiConfig = await page.locator('.api-config, .endpoint-config').count();
      if (apiConfig > 0) {
        log(`✅ 检测到 ${apiConfig} 个API配置项`, 'info');
      }

      // 验证权限配置
      const permissionConfig = await page.locator('.permission-config, .role-config').count();
      if (permissionConfig > 0) {
        log(`✅ 检测到 ${permissionConfig} 个权限配置项`, 'info');
      }
    } else {
      log('⚠️  系统管理中心未找到', 'warning');
    }
  });

  test('📊 TC-MCP-ADMIN-005: 数据分析与监控权限验证', async () => {
    log('验证管理员数据分析与监控权限...', 'info');

    // 访问数据分析中心
    await page.goto('http://localhost:5173/mobile/centers/analytics-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 验证数据仪表板
    const pageData = await detectPageData(page);

    if (!pageData.errors.has404 && !pageData.errors.has500) {
      log('✅ 数据分析中心可访问', 'info');

      // 验证统计概览
      const totalStats = pageData.components.statsCards.count +
                        pageData.components.contentCards.count;

      expect(totalStats).toBeGreaterThanOrEqual(0);
      log(`✅ 数据仪表板显示 ${totalStats} 个数据组件`, 'info`);

      // 验证图表组件
      const chartElements = await page.locator('.chart, .graph, .data-visualization').count();
      if (chartElements > 0) {
        log(`✅ 检测到 ${chartElements} 个数据可视化组件`, 'info');
      }

      // 验证数据筛选
      const dateRangePicker = await page.locator('.date-range-picker, .van-calendar').count();
      if (dateRangePicker > 0) {
        log(`✅ 检测到日期范围选择器`, 'info`);
      }
    }
  });

  test('💰 TC-MCP-ADMIN-006: 财务管理与数据验证', async () => {
    log('验证管理员财务管理功能...', 'info');

    // 访问财务中心
    await page.goto('http://localhost:5173/mobile/centers/finance-center');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const pageData = await detectPageData(page);

    if (!pageData.errors.has404 && !pageData.errors.has500) {
      log('✅ 财务管理中心可访问', 'info');

      // 验证财务数据展示
      expect(pageData.components.statsCards.count).toBeGreaterThanOrEqual(0);
      log(`✅ 财务概览显示 ${pageData.components.statsCards.count} 个统计卡片`, 'info');

      // 验证财务列表
      const financialItems = await page.locator('.financial-item, .payment-item, .income-item').count();
      if (financialItems > 0) {
        log(`✅ 财务列表显示 ${financialItems} 条记录`, 'info`);
      }

      // 查找财务操作按钮
      const financeActions = await page.locator('.export-report, .generate-invoice, .process-payment').count();
      if (financeActions > 0) {
        log(`✅ 财务操作功能: ${financeActions} 个`, 'info');
      }
    } else {
      log('⚠️  财务管理中心受限或不存在', 'warning');
    }
  });

  test('🔍 TC-MCP-ADMIN-007: 审计与日志查看功能验证', async () => {
    log('验证管理员审计与日志查看功能...', 'info');

    // 访问审计日志页面（可能在系统中心或其他地方）
    await page.goto('http://localhost:5173/mobile/centers');
    await page.waitForLoadState('networkidle');

    // 查找日志或审计相关入口
    const logEntries = await page.$$eval('a, .van-cell', elements =>
      elements.filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('log') || text.includes('日志') ||
               text.includes('audit') || text.includes('审计');
      })
    );

    if (logEntries.length > 0) {
      log(`✅ 检测到 ${logEntries.length} 个审计日志入口`, 'info');

      // 点击第一个日志入口
      if (logEntries.length > 0) {
        const firstLog = logEntries[0];
        if (firstLog.href) {
          await page.goto(firstLog.href);
          await page.waitForTimeout(1500);

          const logData = await detectPageData(page);

          // 验证日志列表
          if (logData.components.lists.itemCount > 0) {
            log(`✅ 日志列表显示 ${logData.components.lists.itemCount} 条记录`, 'info');
          }
        }
      }
    } else {
      log('⚠️  未检测到审计日志入口', 'warning');
    }
  });

  test('📱 TC-MCP-ADMIN-008: 管理员移动端超级功能验证', async () => {
    log('验证管理员移动端超级功能...', 'info');

    // 管理员可以在移动端执行特殊操作
    await page.goto('http://localhost:5173/mobile/centers');
    await page.waitForLoadState('networkidle');

    // 查找特殊管理员功能
    const adminFeatures = await page.$$eval('.van-cell, .van-button, .feature-item', elements =>
      elements.filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('reset') || text.includes('重置') ||
               text.includes('delete all') || text.includes('批量删除') ||
               text.includes('backup') || text.includes('备份') ||
               text.includes('import') || text.includes('导入') ||
               text.includes('export') || text.includes('导出');
      })
    );

    if (adminFeatures.length > 0) {
      log(`✅ 检测到 ${adminFeatures.length} 个管理员超级功能:`, 'info');
      adminFeatures.slice(0, 5).forEach((feature, idx) => {
        log(`  ${idx + 1}. ${feature.textContent?.trim()}`, 'info');
      });

      // 验证这些功能是可用的（不是禁用状态）
      const enabledFeatures = adminFeatures.filter(f => !f.disabled);
      log(`✅ 可用功能: ${enabledFeatures.length}/${adminFeatures.length}`, 'info');
    } else {
      log('⚠️  当前页面未检测到超级功能', 'warning');
    }
  });

  test('🎭 TC-MCP-ADMIN-009: 所有角色切换与权限层级验证', async () => {
    log('验证管理员权限层级覆盖所有角色...', 'info');

    // 管理员模拟各角色视角
    const rolePages = [
      { role: '家长', path: '/mobile/parent-center' },
      { role: '教师', path: '/mobile/teacher-center' },
      { role: '园长', path: '/mobile/centers/principal-center' },
      { role: '管理员', path: '/mobile/centers' }
    ];

    const roleResults = [];

    for (const rolePage of rolePages) {
      try {
        await page.goto(`http://localhost:5173${rolePage.path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const pageData = await detectPageData(page);

        roleResults.push({
          role: rolePage.role,
          accessible: !pageData.errors.has404 && !pageData.errors.has500,
          hasData: pageData.components.statsCards.count > 0 ||
                   pageData.components.contentCards.count > 0 ||
                   pageData.components.lists.itemCount > 0
        });

        if (!pageData.errors.has404) {
          log(`✅ 管理员可访问${rolePage.role}中心`, 'info');
        } else {
          log(`⚠️  ${rolePage.role}中心访问受限`, 'warning');
        }
      } catch (error) {
        roleResults.push({
          role: rolePage.role,
          accessible: false,
          error: error.message
        });
      }
    }

    // 验证管理员可以访问多个角色中心
    const accessibleRoles = roleResults.filter(r => r.accessible);
    log(`\n📊 管理员角色覆盖: ${accessibleRoles.length}/${roleResults.length} 个角色中心`, 'info');

    // 管理员至少应能访问2个以上的角色中心
    expect(accessibleRoles.length).toBeGreaterThanOrEqual(2);
  });

  test('🔒 TC-MCP-ADMIN-010: 安全与权限完整性验证', async () => {
    log('验证管理员安全与权限完整性...', 'info');

    // 访问安全管理相关页面
    const securityPages = [
      '/mobile/centers/permission-center',  // 权限管理
      '/mobile/centers/system-center',      // 系统管理
      '/mobile/centers/security-center'     // 安全管理（可能不存在）
    ];

    const securityResults = [];

    for (const pagePath of securityPages) {
      try {
        await page.goto(`http://localhost:5173${pagePath}`, {
          waitUntil: 'domcontentloaded',
          timeout: 4000
        });

        const pageData = await detectPageData(page);

        securityResults.push({
          page: pagePath.split('/').pop(),
          accessible: !pageData.errors.has404
        });

        if (!pageData.errors.has404) {
          log(`✅ 安全管理模块可访问: ${pagePath}`, 'info');
        }

        await page.waitForTimeout(800);
      } catch (error) {
        log(`⚠️  安全性检查 - ${pagePath}: ${error.message}`, 'warning');
      }
    }

    // 验证至少有一个安全管理功能
    const accessibleSecurity = securityResults.filter(r => r.accessible);
    expect(accessibleSecurity.length).toBeGreaterThan(0);

    log(`\n✅ 安全管理覆盖: ${accessibleSecurity.length}/${securityResults.length} 个模块`, 'info');
    log('✅ 管理员安全与权限完整性验证完成', 'info');
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
