#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';

// 配置
const CONFIG = {
  frontendUrl: 'http://localhost:5173',
  adminUsername: 'admin',
  adminPassword: 'admin123',
  headless: true,
  timeout: 30000,
  outputPath: './comprehensive-coverage-report.json'
};

// 基于项目分析的完整页面地图
const COMPREHENSIVE_PAGES = {
  // Dashboard 相关
  dashboard: [
    '/',
    '/dashboard',
    '/dashboard/overview',
    '/dashboard/analytics',
    '/dashboard/reports'
  ],

  // 教师中心页面
  teacherCenter: [
    '/teacher-center',
    '/teacher-center/dashboard',
    '/teacher-center/creative-curriculum',
    '/teacher-center/creative-curriculum/interactive',
    '/teacher-center/creative-curriculum/interactive-curriculum',
    '/teacher-center/creative-curriculum/creative-curriculum',
    '/teacher-center/teaching-plan',
    '/teacher-center/class-management',
    '/teacher-center/student-management',
    '/teacher-center/performance',
    '/teacher-center/performance/TeacherPerformance',
    '/teacher-center/performance/ranking',
    '/teacher-center/enrollment',
    '/teacher-center/enrollment/tasks',
    '/teacher-center/customers',
    '/teacher-center/workspace',
    '/teacher-center/communication',
    '/teacher-center/resources',
    '/teacher-center/schedule'
  ],

  // 园长中心页面
  principalCenter: [
    '/principal-center',
    '/principal-center/dashboard',
    '/principal-center/students',
    '/principal-center/teachers',
    '/principal-center/classes',
    '/principal-center/activities',
    '/principal-center/enrollment',
    '/principal-center/finance',
    '/principal-center/reports'
  ],

  // 活动中心
  activityCenter: [
    '/activity-center',
    '/activity-center/list',
    '/activity-center/create',
    '/activity-center/calendar',
    '/activity-center/registration',
    '/activity-center/evaluation',
    '/activity-center/reports',
    '/activity-center/analysis'
  ],

  // 招生中心
  enrollmentCenter: [
    '/enrollment-center',
    '/enrollment-center/plans',
    '/enrollment-center/applications',
    '/enrollment-center/interviews',
    '/enrollment-center/admissions',
    '/enrollment-center/statistics',
    '/enrollment-center/reports'
  ],

  // 财务中心
  financeCenter: [
    '/finance-center',
    '/finance-center/overview',
    '/finance-center/tuition',
    '/finance-center/payments',
    '/finance-center/refunds',
    '/finance-center/scholarships',
    '/finance-center/invoicing',
    '/finance-center/reports',
    '/finance-center/analytics'
  ],

  // AI助手中心
  aiCenter: [
    '/ai-center',
    '/ai-center/chat',
    '/ai-center/knowledge',
    '/ai-center/tools',
    '/ai-center/analytics',
    '/ai-center/settings',
    '/ai-center/history'
  ],

  // 营销中心
  marketingCenter: [
    '/marketing-center',
    '/marketing-center/campaigns',
    '/marketing-center/advertisements',
    '/marketing-center/referrals',
    '/marketing-center/analytics',
    '/marketing-center/social-media',
    '/marketing-center/promotions'
  ],

  // 系统中心
  systemCenter: [
    '/system-center',
    '/system-center/settings',
    '/system-center/users',
    '/system-center/roles',
    '/system-center/permissions',
    '/system-center/logs',
    '/system-center/backup',
    '/system-center/security',
    '/system-center/maintenance'
  ],

  // 家长中心
  parentCenter: [
    '/parent-center',
    '/parent-center/dashboard',
    '/parent-center/students',
    '/parent-center/communication',
    '/parent-center/activities',
    '/parent-center/fees',
    '/parent-center/schedule',
    '/parent-center/reports'
  ],

  // 检查中心
  inspectionCenter: [
    '/inspection-center',
    '/inspection-center/document-templates',
    '/inspection-center/document-instances',
    '/inspection-center/inspection-types',
    '/inspection-center/inspection-plans',
    '/inspection-center/inspection-tasks',
    '/inspection-center/document-statistics',
    '/inspection-center/reports'
  ],

  // 客服中心
  callCenter: [
    '/call-center',
    '/call-center/tickets',
    '/call-center/communications',
    '/call-center/knowledge-base',
    '/call-center/analytics'
  ],

  // 媒体中心
  mediaCenter: [
    '/media-center',
    '/media-center/library',
    '/media-center/upload',
    '/media-center/categories',
    '/media-center/management'
  ],

  // 报告中心
  reportCenter: [
    '/report-center',
    '/report-center/dashboard',
    '/report-center/templates',
    '/report-center/generation',
    '/report-center/schedule'
  ],

  // 基础管理页面
  userManagement: [
    '/users',
    '/users/list',
    '/users/create',
    '/users/profile',
    '/users/permissions'
  ],

  roleManagement: [
    '/roles',
    '/roles/list',
    '/roles/create',
    '/roles/permissions'
  ],

  studentManagement: [
    '/students',
    '/students/list',
    '/students/create',
    '/students/profile',
    '/students/classes'
  ],

  classManagement: [
    '/classes',
    '/classes/list',
    '/classes/create',
    '/classes/schedule',
    '/classes/students'
  ],

  teacherManagement: [
    '/teachers',
    '/teachers/list',
    '/teachers/create',
    '/teachers/profile',
    '/teachers/classes'
  ],

  activityManagement: [
    '/activities',
    '/activities/list',
    '/activities/create',
    '/activities/calendar',
    '/activities/registration'
  ]
};

// 所有页面的扁平化列表
const ALL_PAGES = Object.values(COMPREHENSIVE_PAGES).flat();

console.log('🎯 综合控制台覆盖检测');
console.log(`📍 前端地址: ${CONFIG.frontendUrl}`);
console.log(`📋 总页面数: ${ALL_PAGES.length}`);

async function runComprehensiveCoverageTest() {
  let browser;
  let results = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    pages: [],
    summary: {
      totalPages: 0,
      successPages: 0,
      failedPages: 0,
      totalErrors: 0,
      totalWarnings: 0,
      categoryCoverage: {}
    }
  };

  try {
    // 启动浏览器
    console.log('🌐 启动浏览器...');
    browser = await chromium.launch({
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 监听控制台输出
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push({
          type,
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // 监听网络错误
    const networkErrors = [];
    page.on('response', response => {
      const status = response.status();
      if (status >= 400) {
        networkErrors.push({
          url: response.url(),
          status,
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 访问首页并登录
    console.log('🏠 访问首页...');
    await page.goto(CONFIG.frontendUrl, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
    await page.waitForTimeout(2000);

    // 检查是否需要登录
    const loginSelectors = [
      'input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]',
      'input[placeholder*="密码"], input[name="password"]'
    ];

    let needsLogin = false;
    for (const selector of loginSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        needsLogin = true;
        break;
      }
    }

    // 执行登录
    if (needsLogin) {
      console.log('🔐 检测到登录页面，执行登录...');
      await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"], input[type="text"]', CONFIG.adminUsername);
      await page.fill('input[placeholder*="密码"], input[name="password"], input[type="password"]', CONFIG.adminPassword);
      await page.click('button[type="submit"], .el-button--primary, button:has-text("登录")');
      await page.waitForTimeout(5000);
      console.log('✅ 登录完成');
    } else {
      console.log('ℹ️ 已登录或无需登录');
    }

    console.log(`\n📋 开始全面检测 ${ALL_PAGES.length} 个页面...`);

    // 初始化类别覆盖率
    Object.keys(COMPREHENSIVE_PAGES).forEach(category => {
      results.summary.categoryCoverage[category] = {
        totalPages: COMPREHENSIVE_PAGES[category].length,
        successPages: 0,
        failedPages: 0,
        errors: 0,
        warnings: 0
      };
    });

    // 测试每个页面
    for (let i = 0; i < ALL_PAGES.length; i++) {
      const pageUrl = ALL_PAGES[i];
      console.log(`🔍 [${i + 1}/${ALL_PAGES.length}] 测试: ${pageUrl}`);

      const pageResult = {
        url: pageUrl,
        success: false,
        loadTime: 0,
        consoleErrors: [],
        pageErrors: [],
        networkErrors: [],
        timestamp: new Date().toISOString()
      };

      try {
        // 清空之前的错误记录
        consoleMessages.length = 0;
        pageErrors.length = 0;
        networkErrors.length = 0;

        // 访问页面
        const startTime = Date.now();
        await page.goto(`${CONFIG.frontendUrl}${pageUrl}`, {
          waitUntil: 'networkidle',
          timeout: CONFIG.timeout
        });
        const loadTime = Date.now() - startTime;

        // 等待页面稳定
        await page.waitForTimeout(2000);

        // 记录结果
        pageResult.success = true;
        pageResult.loadTime = loadTime;
        pageResult.consoleErrors = [...consoleMessages];
        pageResult.pageErrors = [...pageErrors];
        pageResult.networkErrors = [...networkErrors];

        // 更新类别统计
        const category = Object.keys(COMPREHENSIVE_PAGES).find(cat =>
          COMPREHENSIVE_PAGES[cat].includes(pageUrl)
        );
        if (category) {
          results.summary.categoryCoverage[category].successPages++;
          results.summary.categoryCoverage[category].errors += consoleMessages.length + pageErrors.length;
          results.summary.categoryCoverage[category].warnings += consoleMessages.filter(m => m.type === 'warning').length;
        }

        console.log(`  ✅ ${pageUrl} - ${loadTime}ms - ${consoleMessages.length + pageErrors.length + networkErrors.length} 个错误`);

      } catch (error) {
        pageResult.success = false;
        pageResult.error = {
          message: error.message,
          stack: error.stack
        };

        // 更新类别统计
        const category = Object.keys(COMPREHENSIVE_PAGES).find(cat =>
          COMPREHENSIVE_PAGES[cat].includes(pageUrl)
        );
        if (category) {
          results.summary.categoryCoverage[category].failedPages++;
        }

        console.log(`  ❌ ${pageUrl} - 加载失败: ${error.message}`);
      }

      results.pages.push(pageResult);

      // 更新总体统计
      results.summary.totalPages++;
      if (pageResult.success) {
        results.summary.successPages++;
      } else {
        results.summary.failedPages++;
      }
      results.summary.totalErrors += pageResult.consoleErrors.length + pageResult.pageErrors.length + pageResult.networkErrors.length;
      results.summary.totalWarnings += pageResult.consoleErrors.filter(e => e.type === 'warning').length;

      // 每测试10个页面输出一次进度
      if ((i + 1) % 10 === 0 || i === ALL_PAGES.length - 1) {
        const progress = ((i + 1) / ALL_PAGES.length * 100).toFixed(1);
        console.log(`📊 进度: ${progress}% (${i + 1}/${ALL_PAGES.length})`);
      }
    }

    // 生成报告
    console.log('\n📊 生成综合覆盖报告...');

    // 保存详细报告
    const reportPath = CONFIG.outputPath;
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // 打印摘要
    const successRate = results.summary.totalPages > 0
      ? ((results.summary.successPages / results.summary.totalPages) * 100).toFixed(2)
      : 0;

    console.log('\n' + '='.repeat(80));
    console.log('🎉 前端控制台覆盖检测完成！');
    console.log('='.repeat(80));
    console.log(`⏱️  测试时间: ${Date.now() - new Date(results.timestamp).getTime()}ms`);
    console.log(`📊 页面统计: ${results.summary.totalPages} 总页面 | ${results.summary.successPages} 成功 | ${results.summary.failedPages} 失败`);
    console.log(`✅ 成功率: ${successRate}%`);
    console.log(`🚨 错误统计: 总错误: ${results.summary.totalErrors} | 总警告: ${results.summary.totalWarnings}`);

    // 显示各类别覆盖情况
    console.log('\n📋 各类别覆盖情况:');
    Object.entries(results.summary.categoryCoverage).forEach(([category, stats]) => {
      const categorySuccessRate = stats.totalPages > 0
        ? ((stats.successPages / stats.totalPages) * 100).toFixed(1)
        : 0;
      console.log(`  ${category}: ${stats.successPages}/${stats.totalPages} (${categorySuccessRate}%) - ${stats.errors} 错误, ${stats.warnings} 警告`);
    });

    // 显示有严重错误的页面
    const pagesWithSeriousErrors = results.pages.filter(p =>
      p.pageErrors.length > 0 || p.networkErrors.length > 0 || p.consoleErrors.some(e => e.type === 'error')
    );

    if (pagesWithSeriousErrors.length > 0) {
      console.log('\n🚨 发现严重错误的页面:');
      pagesWithSeriousErrors.forEach(page => {
        const seriousErrors = page.pageErrors.length + page.networkErrors.length + page.consoleErrors.filter(e => e.type === 'error').length;
        console.log(`  ❌ ${page.url} - ${seriousErrors} 个严重错误`);

        page.pageErrors.forEach(err => {
          console.log(`    💥 页面错误: ${err.message}`);
        });

        page.networkErrors.forEach(err => {
          console.log(`    🌐 网络错误: ${err.status} ${err.url}`);
        });

        page.consoleErrors.filter(e => e.type === 'error').forEach(err => {
          console.log(`    📌 控制台错误: ${err.text}`);
        });
      });
    }

    // 显示有警告的页面
    const pagesWithWarnings = results.pages.filter(p =>
      p.consoleErrors.some(e => e.type === 'warning')
    );

    if (pagesWithWarnings.length > 0) {
      console.log('\n⚠️ 发现警告的页面:');
      pagesWithWarnings.slice(0, 5).forEach(page => { // 只显示前5个警告页面
        const warningCount = page.consoleErrors.filter(e => e.type === 'warning').length;
        console.log(`  ⚠️  ${page.url} - ${warningCount} 个警告`);

        page.consoleErrors.filter(e => e.type === 'warning').slice(0, 3).forEach(err => { // 每页只显示前3个警告
          console.log(`    📌 警告: ${err.text.substring(0, 100)}${err.text.length > 100 ? '...' : ''}`);
        });
      });

      if (pagesWithWarnings.length > 5) {
        console.log(`    ... 还有 ${pagesWithWarnings.length - 5} 个页面有警告`);
      }
    }

    console.log(`\n📄 详细报告已保存至: ${reportPath}`);

    return results;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    throw error;

  } finally {
    if (browser) {
      await browser.close();
      console.log('🔚 浏览器已关闭');
    }
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveCoverageTest()
    .then(() => {
      console.log('✅ 所有检测完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 检测失败:', error);
      process.exit(1);
    });
}

export default runComprehensiveCoverageTest;