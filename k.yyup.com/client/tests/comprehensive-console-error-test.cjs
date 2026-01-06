/**
 * 🎯 幼儿园管理系统 - 全角色全页面控制台错误检测测试
 *
 * 覆盖所有4个角色（admin、principal、teacher、parent）的所有侧边栏页面
 * 确保系统没有任何控制台错误、Vue编译错误或JavaScript运行时错误
 *
 * 测试覆盖：
 * - Admin: 47个页面
 * - Principal: 38个页面
 * - Teacher: 28个页面
 * - Parent: 18个页面
 * - 总计: 131个页面测试
 */

const { chromium } = require('playwright');

// 角色配置
const ROLE_CONFIG = {
  admin: {
    name: '管理员',
    credentials: { username: 'admin', password: 'admin123' },
    pages: [
      // 工作台模块 (6个页面)
      '/dashboard',
      '/dashboard/campus-overview',
      '/dashboard/data-statistics',
      '/dashboard/important-notices',
      '/dashboard/schedule',
      '/dashboard/custom-layout',

      // 系统管理模块 (9个页面)
      '/system/users',
      '/system/roles',
      '/system/permissions',
      '/system/settings',
      '/system/log',
      '/system/backup',
      '/system/security',
      '/system/message-template',
      '/system/ai-model-config',

      // 园长管理模块 (10个页面)
      '/principal/dashboard',
      '/principal/performance',
      '/principal/performance-rules',
      '/principal/marketing-analysis',
      '/principal/customer-pool',
      '/principal/activities',
      '/principal/poster-editor',
      '/principal/poster-generator',
      '/principal/poster-templates',
      '/principal/decision-support/intelligent-dashboard',

      // 教师管理模块 (8个页面)
      '/teacher',
      '/teacher/list',
      '/teacher/performance',
      '/class',
      '/class/analytics',
      '/class/optimization',
      '/class/smart-management',
      '/student',

      // 家长管理模块 (7个页面)
      '/parent',
      '/parent/list',
      '/parent/children',
      '/parent/child-growth',
      '/parent/assign-activity',
      '/parent/follow-up',
      '/parent/communication/smart-hub',

      // 业务管理模块 (9个页面)
      '/enrollment',
      '/enrollment-plan',
      '/activity',
      '/application',
      '/customer',
      '/marketing',
      '/statistics',
      '/analytics/report-builder',
      '/advertisement',

      // AI功能模块 (8个页面)
      '/ai',
      '/ai/assistant',
      '/ai/query',
      '/ai/chat',
      '/ai/expert-consultation',
      '/ai/memory-management',
      '/ai/model-management',
      '/chat',

      // 中心页面 (21个页面)
      '/centers/business',
      '/centers/activity',
      '/centers/enrollment',
      '/centers/customer-pool',
      '/centers/task',
      '/centers/script',
      '/centers/document-collaboration',
      '/centers/finance',
      '/centers/marketing',
      '/centers/call-center',
      '/centers/media',
      '/centers/personnel',
      '/centers/teaching',
      '/centers/assessment',
      '/centers/attendance',
      '/centers/analytics',
      '/centers/usage',
      '/centers/group',
      '/centers/inspection',
      '/centers/system',
      '/centers/ai-center'
    ]
  },

  principal: {
    name: '园长',
    credentials: { username: 'principal', password: 'principal123' },
    pages: [
      // 工作台模块 (5个页面)
      '/dashboard',
      '/dashboard/campus-overview',
      '/dashboard/data-statistics',
      '/dashboard/important-notices',
      '/dashboard/schedule',

      // 园长工作台模块 (10个页面)
      '/principal/dashboard',
      '/principal/performance',
      '/principal/performance-rules',
      '/principal/marketing-analysis',
      '/principal/customer-pool',
      '/principal/activities',
      '/principal/poster-editor',
      '/principal/poster-generator',
      '/principal/poster-templates',
      '/principal/decision-support/intelligent-dashboard',

      // 教师管理模块 (8个页面)
      '/teacher',
      '/teacher/list',
      '/teacher/performance',
      '/class',
      '/class/analytics',
      '/class/optimization',
      '/class/smart-management',
      '/student',

      // 家长管理模块 (3个页面)
      '/parent',
      '/parent/list',
      '/parent/communication/smart-hub',

      // 业务管理模块 (7个页面)
      '/enrollment',
      '/enrollment-plan',
      '/activity',
      '/customer',
      '/marketing',
      '/statistics',
      '/analytics/report-builder',

      // AI功能模块 (8个页面)
      '/ai',
      '/ai/assistant',
      '/ai/query',
      '/ai/chat',
      '/ai/expert-consultation',
      '/ai/memory-management',
      '/ai/model-management',
      '/chat'
    ]
  },

  teacher: {
    name: '教师',
    credentials: { username: 'teacher', password: 'teacher123' },
    pages: [
      // 工作台模块 (3个页面)
      '/dashboard',
      '/dashboard/schedule',
      '/dashboard/important-notices',

      // 教师工作模块 (4个页面)
      '/teacher',
      '/teacher/profile',
      '/teacher/performance',

      // 班级管理模块 (7个页面)
      '/class',
      '/class/detail',
      '/class/analytics',
      '/class/optimization',
      '/class/smart-management',

      // 学生管理模块 (3个页面)
      '/student',
      '/student/detail',
      '/student/analytics',

      // 家长服务模块 (5个页面)
      '/parent',
      '/parent/detail',
      '/parent/child-growth',
      '/parent/communication/smart-hub',
      '/parent/follow-up',

      // 活动管理模块 (5个页面)
      '/activity',
      '/activity/list',
      '/activity/detail',

      // 教师中心页面 (8个页面)
      '/teacher-center/dashboard',
      '/teacher-center/notifications',
      '/teacher-center/tasks',
      '/teacher-center/activities',
      '/teacher-center/enrollment',
      '/teacher-center/teaching',
      '/teacher-center/customer-tracking',
      '/teacher-center/creative-curriculum',

      // AI功能模块 (3个页面)
      '/ai',
      '/ai/chat',
      '/chat'
    ]
  },

  parent: {
    name: '家长',
    credentials: { username: 'parent', password: 'parent123' },
    pages: [
      // 工作台模块 (3个页面)
      '/dashboard',
      '/dashboard/important-notices',
      '/dashboard/schedule',

      // 家长服务模块 (7个页面)
      '/parent',
      '/parent/profile',
      '/parent/children',
      '/parent/child-growth',
      '/parent/communication/smart-hub',
      '/parent/follow-up',

      // 活动参与模块 (4个页面)
      '/activity',
      '/activity/list',
      '/activity/detail',

      // 家长中心页面 (8个页面)
      '/parent-center/dashboard',
      '/parent-center/children',
      '/parent-center/child-growth',
      '/parent-center/assessment',
      '/parent-center/games',
      '/parent-center/ai-assistant',
      '/parent-center/activities',
      '/parent-center/communication',

      // AI功能模块 (3个页面)
      '/ai',
      '/ai/chat',
      '/chat'
    ]
  }
};

/**
 * 测试单个角色的所有页面
 */
async function testRolePages(role, config) {
  console.log(`\n🚀 开始测试 ${config.name} (${role}) 角色页面...`);
  console.log(`📊 总页面数: ${config.pages.length}`);

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 控制台错误和警告收集器
  const errors = [];
  const warnings = [];
  const vueErrors = [];
  const failedPages = [];
  const successPages = [];
  const pageLoadTimes = []; // 🔧 新增：页面加载时间统计

  // 监听控制台消息
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    if (type === 'error') {
      const errorInfo = {
        text: text,
        url: location?.url,
        line: location?.lineNumber,
        column: location?.columnNumber,
        timestamp: new Date().toISOString()
      };

      errors.push(errorInfo);

      // 检查是否为Vue错误
      if (text.includes('[Vue warning]') ||
          text.includes('[plugin:vite:vue]') ||
          text.includes('Failed to resolve component') ||
          text.includes('Property') ||
          text.includes('Duplicate attribute')) {
        vueErrors.push(errorInfo);
      }
    }

    if (type === 'warning') {
      warnings.push({
        text: text,
        url: location?.url,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 监听页面错误
  page.on('pageerror', (error) => {
    errors.push({
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  try {
    // 1. 登录
    console.log(`📝 登录 ${config.name} 角色...`);
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('[placeholder="用户名"], [data-test="username-input"]', { timeout: 10000 });

    // 尝试多种可能的选择器
    const usernameSelectors = [
      '[placeholder="用户名"]',
      '[data-test="username-input"]',
      'input[type="text"]',
      '#username',
      '.username-input'
    ];

    const passwordSelectors = [
      '[placeholder="密码"]',
      '[data-test="password-input"]',
      'input[type="password"]',
      '#password',
      '.password-input'
    ];

    let usernameFilled = false;
    let passwordFilled = false;

    // 尝试填写用户名
    for (const selector of usernameSelectors) {
      try {
        await page.fill(selector, config.credentials.username);
        usernameFilled = true;
        break;
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    // 尝试填写密码
    for (const selector of passwordSelectors) {
      try {
        await page.fill(selector, config.credentials.password);
        passwordFilled = true;
        break;
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (usernameFilled && passwordFilled) {
      // 尝试点击登录按钮
      const loginSelectors = [
        'button[type="submit"]',
        '.login-btn',
        '[data-test="login-button"]',
        'button:has-text("登录")',
        '.el-button--primary'
      ];

      for (const selector of loginSelectors) {
        try {
          await page.click(selector);
          await page.waitForTimeout(2000);
          break;
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }
    }

    console.log(`✅ ${config.name} 角色登录完成`);

    // 2. 测试所有页面
    console.log(`📋 开始测试 ${config.pages.length} 个页面...`);

    for (let i = 0; i < config.pages.length; i++) {
      const pageUrl = config.pages[i];
      const fullUrl = `http://localhost:5173${pageUrl}`;

      console.log(`\n🔍 测试页面 ${i + 1}/${config.pages.length}: ${pageUrl}`);

      let performanceStart, navigationStart, navigationTime, loadStart, loadTime; // 🔧 修复变量作用域

try {
        // 🔧 新增：详细性能时间统计
        performanceStart = Date.now();

        // 导航到页面（开始计时）
        navigationStart = Date.now();
        await page.goto(fullUrl, {
          waitUntil: 'networkidle',
          timeout: 15000
        });
        navigationTime = Date.now() - navigationStart;

        // 等待页面完全加载
        loadStart = Date.now();
        await page.waitForTimeout(2000);
        loadTime = Date() - loadStart;

        // 🔧 新增：获取页面性能指标
        const performanceMetrics = await page.evaluate(() => {
          const perfData = window.performance.getEntriesByType('navigation')[0];
          if (perfData) {
            return {
              dnsLookup: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
              tcpConnect: Math.round(perfData.connectEnd - perfData.connectStart),
              serverResponse: Math.round(perfData.responseEnd - perfData.responseStart),
              domLoad: Math.round(perfData.domContentLoadedEventEnd - perfData.loadEventStart),
              windowLoad: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
              totalLoadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
              resourceCount: window.performance.getEntriesByType('resource').length
            };
          }
          return null;
        });

        // 获取页面基本信息
        const pageTitle = await page.title();
        const pageContent = await page.content();
        const totalTime = Date.now() - performanceStart;

        if (pageTitle.includes('404') ||
            pageContent.includes('404 Not Found') ||
            pageContent.includes('Page not found')) {
          console.log(`❌ 404页面: ${pageUrl}`);
          failedPages.push({
            url: pageUrl,
            error: '404 Not Found',
            totalTime: totalTime
          });
          continue;
        }

        // 检查页面是否加载成功
        const hasContent = await page.evaluate(() => {
          return document.body && document.body.children.length > 0;
        });

        if (hasContent) {
          // 🔧 新增：记录成功页面的详细时间信息
          const pageTimeData = {
            url: pageUrl,
            totalTime: totalTime,
            navigationTime: navigationTime,
            loadTime: loadTime,
            performanceMetrics: performanceMetrics
          };

          pageLoadTimes.push(pageTimeData);
          successPages.push(pageUrl);

          // 🔧 新增：详细时间输出
          console.log(`✅ 页面加载成功: ${pageUrl}`);
          console.log(`   ⏱️ 总耗时: ${totalTime}ms | 导航: ${navigationTime}ms | 加载: ${loadTime}ms`);

          if (performanceMetrics) {
            console.log(`   🔍 DNS查询: ${performanceMetrics.dnsLookup}ms | TCP连接: ${performanceMetrics.tcpConnect}ms`);
            console.log(`   📡 服务器响应: ${performanceMetrics.serverResponse}ms | 资源数量: ${performanceMetrics.resourceCount}`);
          }
        } else {
          console.log(`❌ 页面无内容: ${pageUrl}`);
          failedPages.push({
            url: pageUrl,
            error: 'Page has no content',
            totalTime: totalTime
          });
        }

      } catch (error) {
        const totalTime = Date.now() - (performanceStart || Date.now());
        console.log(`❌ 页面访问失败: ${pageUrl} - ${error.message}`);
        failedPages.push({
          url: pageUrl,
          error: error.message,
          totalTime: totalTime
        });
      }
    }

  } catch (error) {
    console.log(`❌ ${config.name} 角色测试失败: ${error.message}`);
    failedPages.push({ url: 'LOGIN', error: error.message });
  }

  await browser.close();

  // 3. 返回测试结果
  return {
    role: role,
    roleName: config.name,
    totalPages: config.pages.length,
    successPages: successPages.length,
    failedPages: failedPages.length,
    successPageList: successPages,
    failedPageList: failedPages,
    totalErrors: errors.length,
    totalWarnings: warnings.length,
    vueErrors: vueErrors.length,
    errorDetails: errors,
    warningDetails: warnings,
    vueErrorDetails: vueErrors,
    // 🔧 新增：页面性能时间统计
    pageLoadTimes: pageLoadTimes,
    performanceStats: calculatePerformanceStats(pageLoadTimes)
  };
}

/**
 * 🔧 新增：计算页面性能统计数据
 */
function calculatePerformanceStats(pageLoadTimes) {
  if (!pageLoadTimes || pageLoadTimes.length === 0) {
    return {
      avgTotalTime: 0,
      avgNavigationTime: 0,
      avgLoadTime: 0,
      fastestPage: null,
      slowestPage: null,
      totalTimeSum: 0,
      navigationTimeSum: 0,
      loadTimeSum: 0
    };
  }

  const totalTimeSum = pageLoadTimes.reduce((sum, page) => sum + page.totalTime, 0);
  const navigationTimeSum = pageLoadTimes.reduce((sum, page) => sum + page.navigationTime, 0);
  const loadTimeSum = pageLoadTimes.reduce((sum, page) => sum + page.loadTime, 0);

  const avgTotalTime = Math.round(totalTimeSum / pageLoadTimes.length);
  const avgNavigationTime = Math.round(navigationTimeSum / pageLoadTimes.length);
  const avgLoadTime = Math.round(loadTimeSum / pageLoadTimes.length);

  const fastestPage = pageLoadTimes.reduce((fastest, current) =>
    current.totalTime < fastest.totalTime ? current : fastest
  );

  const slowestPage = pageLoadTimes.reduce((slowest, current) =>
    current.totalTime > slowest.totalTime ? current : slowest
  );

  return {
    avgTotalTime,
    avgNavigationTime,
    avgLoadTime,
    fastestPage,
    slowestPage,
    totalTimeSum,
    navigationTimeSum,
    loadTimeSum
  };
}

/**
 * 🔧 新增：生成性能分析报告
 */
function generatePerformanceReport(results) {
  console.log('\n📊 === 页面性能分析报告 ===');

  let allPageLoadTimes = [];
  let performanceSummary = {
    totalTestedPages: 0,
    avgTotalTime: 0,
    avgNavigationTime: 0,
    avgLoadTime: 0,
    fastestPages: [],
    slowestPages: []
  };

  // 收集所有页面的加载时间数据
  results.forEach(result => {
    if (result.pageLoadTimes && result.pageLoadTimes.length > 0) {
      allPageLoadTimes = allPageLoadTimes.concat(result.pageLoadTimes);
      performanceSummary.totalTestedPages += result.pageLoadTimes.length;
    }
  });

  if (allPageLoadTimes.length === 0) {
    console.log('❌ 没有成功加载的页面，无法生成性能报告');
    return performanceSummary;
  }

  // 计算总体统计
  const totalTimeSum = allPageLoadTimes.reduce((sum, page) => sum + page.totalTime, 0);
  performanceSummary.avgTotalTime = Math.round(totalTimeSum / allPageLoadTimes.length);
  performanceSummary.avgNavigationTime = Math.round(
    allPageLoadTimes.reduce((sum, page) => sum + page.navigationTime, 0) / allPageLoadTimes.length
  );
  performanceSummary.avgLoadTime = Math.round(
    allPageLoadTimes.reduce((sum, page) => sum + page.loadTime, 0) / allPageLoadTimes.length
  );

  // 找出最快和最慢的页面
  const sortedByTime = allPageLoadTimes.sort((a, b) => a.totalTime - b.totalTime);
  performanceSummary.fastestPages = sortedByTime.slice(0, 5);
  performanceSummary.slowestPages = sortedByTime.slice(-5).reverse();

  // 输出性能统计
  console.log(`\n📈 总体性能统计:`);
  console.log(`  🎯 测试页面总数: ${performanceSummary.totalTestedPages}`);
  console.log(`  ⏱️ 平均总耗时: ${performanceSummary.avgTotalTime}ms`);
  console.log(`  🚀 平均导航时间: ${performanceSummary.avgNavigationTime}ms`);
  console.log(`  📦 平均加载时间: ${performanceSummary.avgLoadTime}ms`);

  // 输出性能评级
  console.log(`\n🏆 性能评级:`);
  if (performanceSummary.avgTotalTime < 1000) {
    console.log(`  ⭐⭐⭐⭐⭐ 优秀 (平均 < 1秒)`);
  } else if (performanceSummary.avgTotalTime < 2000) {
    console.log(`  ⭐⭐⭐⭐ 良好 (平均 < 2秒)`);
  } else if (performanceSummary.avgTotalTime < 3000) {
    console.log(`  ⭐⭐⭐ 一般 (平均 < 3秒)`);
  } else {
    console.log(`  ⭐⭐ 需要优化 (平均 > 3秒)`);
  }

  // 输出最快的页面
  console.log(`\n🚀 加载最快的5个页面:`);
  performanceSummary.fastestPages.forEach((page, index) => {
    console.log(`  ${index + 1}. ${page.url} - ${page.totalTime}ms`);
  });

  // 输出最慢的页面
  console.log(`\n🐌 加载最慢的5个页面 (需要优化):`);
  performanceSummary.slowestPages.forEach((page, index) => {
    console.log(`  ${index + 1}. ${page.url} - ${page.totalTime}ms`);

    // 如果有详细性能指标，输出更多信息
    if (page.performanceMetrics) {
      const metrics = page.performanceMetrics;
      console.log(`     💡 建议: 资源数量(${metrics.resourceCount}) | 服务器响应(${metrics.serverResponse}ms)`);
    }
  });

  return performanceSummary;
}

/**
 * 生成详细的测试报告
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('🏆 全角色全页面控制台错误检测 - 最终报告');
  console.log('='.repeat(80));

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalVueErrors = 0;
  let totalPages = 0;
  let totalSuccessPages = 0;
  let totalFailedPages = 0;

  const roleStats = [];

  // 统计每个角色的结果
  for (const result of results) {
    totalErrors += result.totalErrors;
    totalWarnings += result.totalWarnings;
    totalVueErrors += result.vueErrors;
    totalPages += result.totalPages;
    totalSuccessPages += result.successPages;
    totalFailedPages += result.failedPages;

    roleStats.push({
      role: result.roleName,
      errors: result.totalErrors,
      warnings: result.totalWarnings,
      vueErrors: result.vueErrors,
      pages: result.totalPages,
      success: result.successPages,
      failed: result.failedPages,
      successRate: ((result.successPages / result.totalPages) * 100).toFixed(1)
    });
  }

  // 📊 总体统计
  console.log('\n📊 总体统计:');
  console.log(`  🎯 测试页面总数: ${totalPages}`);
  console.log(`  ✅ 成功访问页面: ${totalSuccessPages}`);
  console.log(`  ❌ 失败访问页面: ${totalFailedPages}`);
  console.log(`  📈 页面访问成功率: ${((totalSuccessPages / totalPages) * 100).toFixed(1)}%`);
  console.log(`  🔥 控制台错误总数: ${totalErrors}`);
  console.log(`  ⚠️ 控制台警告总数: ${totalWarnings}`);
  console.log(`  🩸 Vue编译错误总数: ${totalVueErrors}`);

  // 🏅 角色错误排名 (从多到少)
  console.log('\n🏅 角色错误排名 (从多到少):');
  const sortedRoles = roleStats.sort((a, b) => b.errors - a.errors);
  sortedRoles.forEach((role, index) => {
    const status = role.errors > 0 ? '❌' : '✅';
    console.log(`  ${index + 1}. ${role.role}: ${role.errors} 错误 ${status} (${role.pages} 页面, ${role.successRate}% 成功率)`);
  });

  // 🔧 需要修复的问题
  if (totalErrors > 0 || totalFailedPages > 0) {
    console.log('\n🔧 需要修复的问题:');

    // 显示Vue错误
    if (totalVueErrors > 0) {
      console.log('\n🩸 Vue编译错误 (需要优先修复):');
      for (const result of results) {
        if (result.vueErrors > 0) {
          console.log(`\n  📋 ${result.roleName} 角色的Vue错误:`);
          result.vueErrorDetails.forEach((error, index) => {
            console.log(`    ${index + 1}. ${error.text}`);
            if (error.url) {
              console.log(`       位置: ${error.url}:${error.line}:${error.column}`);
            }
          });
        }
      }
    }

    // 显示页面访问失败
    if (totalFailedPages > 0) {
      console.log('\n🚫 页面访问失败:');
      for (const result of results) {
        if (result.failedPages > 0) {
          console.log(`\n  📋 ${result.roleName} 角色的失败页面:`);
          result.failedPageList.forEach((page, index) => {
            console.log(`    ${index + 1}. ${page.url} - ${page.error}`);
          });
        }
      }
    }

    // 显示其他错误
    const nonVueErrors = totalErrors - totalVueErrors;
    if (nonVueErrors > 0) {
      console.log('\n💥 JavaScript运行时错误:');
      for (const result of results) {
        const nonVueErrorsList = result.errorDetails.filter(e =>
          !result.vueErrorDetails.includes(e)
        );
        if (nonVueErrorsList.length > 0) {
          console.log(`\n  📋 ${result.roleName} 角色的JavaScript错误:`);
          nonVueErrorsList.forEach((error, index) => {
            console.log(`    ${index + 1}. ${error.text}`);
            if (error.url) {
              console.log(`       位置: ${error.url}`);
            }
          });
        }
      }
    }
  } else {
    console.log('\n🎉 恭喜！所有页面测试通过，没有发现控制台错误！');
  }

  // 📈 详细角色统计
  console.log('\n📈 详细角色统计:');
  console.log('┌─────────────┬──────┬──────┬─────┬───────┬────────┬────────┬─────────────┐');
  console.log('│ 角色        │ 页面 │ 成功 │ 失败│ 错误  │ 警告   │ Vue错误 │ 成功率      │');
  console.log('├─────────────┼──────┼──────┼─────┼───────┼────────┼────────┼─────────────┤');

  for (const role of roleStats) {
    const roleFormatted = role.role.padEnd(11);
    const pages = role.pages.toString().padEnd(6);
    const success = role.success.toString().padEnd(6);
    const failed = role.failed.toString().padEnd(5);
    const errors = role.errors.toString().padEnd(7);
    const warnings = role.warnings.toString().padEnd(8);
    const vueErrors = role.vueErrors.toString().padEnd(8);
    const rate = role.successRate + '%'.padEnd(12);

    const status = role.errors > 0 ? '❌' : '✅';
    console.log(`│${status} ${roleFormatted}│ ${pages}│ ${success}│ ${failed}│ ${errors}│ ${warnings}│ ${vueErrors}│ ${rate} │`);
  }

  console.log('└─────────────┴──────┴──────┴─────┴───────┴────────┴────────┴─────────────┘');

  // ⏱️ 测试完成时间
  const testEndTime = new Date();
  console.log(`\n⏰ 测试完成时间: ${testEndTime.toLocaleString()}`);

  return {
    summary: {
      totalErrors,
      totalWarnings,
      totalVueErrors,
      totalPages,
      totalSuccessPages,
      totalFailedPages,
      successRate: ((totalSuccessPages / totalPages) * 100).toFixed(1)
    },
    roleStats,
    timestamp: testEndTime.toISOString()
  };
}

/**
 * 主测试函数
 */
async function runComprehensiveTest() {
  console.log('🎯 开始全角色全页面控制台错误检测测试...');
  console.log('='.repeat(80));

  const startTime = Date.now();
  const results = [];

  // 测试所有角色
  for (const [role, config] of Object.entries(ROLE_CONFIG)) {
    const result = await testRolePages(role, config);
    results.push(result);

    // 打印角色测试结果
    console.log(`\n📊 ${config.name} 角色测试完成:`);
    console.log(`  - 总页面: ${result.totalPages}`);
    console.log(`  - 成功访问: ${result.successPages}`);
    console.log(`  - 访问失败: ${result.failedPages}`);
    console.log(`  - 总错误: ${result.totalErrors}`);
    console.log(`  - 总警告: ${result.totalWarnings}`);
    console.log(`  - Vue错误: ${result.vueErrors}`);
  }

  // 生成最终报告
  const report = generateReport(results);

  // 🔧 新增：生成性能分析报告
  const performanceReport = generatePerformanceReport(results);

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);

  console.log(`\n⏱️ 总测试耗时: ${duration} 秒`);
  console.log('🎯 全角色全页面控制台错误检测测试完成！');

  return {
    ...report,
    performanceReport // 🔧 新增：包含性能报告
  };
}

// 运行测试
if (require.main === module) {
  runComprehensiveTest()
    .then((report) => {
      process.exit(report.summary.totalErrors > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ 测试运行失败:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensiveTest, ROLE_CONFIG };