#!/usr/bin/env node

/**
 * 幼儿园管理系统 - 前端全面错误检测自动化测试脚本
 *
 * 功能:
 * 1. 自动登录系统
 * 2. 系统性访问所有可用页面
 * 3. 捕获控制台错误、JavaScript异常、网络错误
 * 4. 生成详细的错误报告
 *
 * 使用: node comprehensive-frontend-error-test.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置参数
const CONFIG = {
  // 应用URL配置
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  ALT_FRONTEND_URL: process.env.ALT_FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',

  // 登录凭证
  ADMIN_CREDENTIALS: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },

  // 测试配置
  TIMEOUT: {
    PAGE_LOAD: 30000,
    ELEMENT_WAIT: 10000,
    NETWORK_IDLE: 5000,
    OVERALL: 300000 // 5分钟总超时
  },

  // 报告配置
  REPORT_DIR: './test-reports',
  SCREENSHOT_DIR: './test-screenshots',

  // 测试选项
  HEADLESS: process.env.HEADLESS !== 'false',
  TAKE_SCREENSHOTS: process.env.TAKE_SCREENSHOTS !== 'false',
  CAPTURE_NETWORK: true,
  CAPTURE_CONSOLE: true
};

// 页面路由映射 - 基于项目分析的完整页面列表
const PAGE_ROUTES = {
  // 核心页面
  dashboard: [
    '/',
    '/dashboard',
    '/dashboard/overview',
    '/dashboard/analytics',
    '/dashboard/reports'
  ],

  // 用户管理
  userManagement: [
    '/system/users',
    '/system/users/create',
    '/system/users/edit/1',
    '/system/roles',
    '/system/permissions'
  ],

  // 学生管理
  studentManagement: [
    '/students',
    '/students/list',
    '/students/create',
    '/students/edit/1',
    '/students/detail/1'
  ],

  // 教师管理
  teacherManagement: [
    '/teachers',
    '/teachers/list',
    '/teachers/create',
    '/teachers/edit/1',
    '/teachers/detail/1'
  ],

  // 活动管理
  activityManagement: [
    '/activities',
    '/activities/list',
    '/activities/create',
    '/activities/edit/1',
    '/activities/detail/1',
    '/activities/registrations',
    '/activity-center',
    '/activity-center/overview',
    '/activity-center/management',
    '/activity-center/records',
    '/activity-center/evaluation'
  ],

  // 招生系统
  enrollmentSystem: [
    '/enrollment',
    '/enrollment/plans',
    '/enrollment/applications',
    '/enrollment/interviews',
    '/enrollment/admissions',
    '/enrollment/create',
    '/enrollment-plan',
    '/enrollment-plan/create',
    '/enrollment-plan/list'
  ],

  // 财务管理
  financeManagement: [
    '/finance',
    '/finance/overview',
    '/finance/fees',
    '/finance/payments',
    '/finance/refunds',
    '/finance/reports',
    '/finance/billing',
    '/finance/invoices'
  ],

  // AI助手相关
  aiAssistant: [
    '/ai',
    '/ai/chat',
    '/ai/query',
    '/ai-center',
    '/ai-center/function-tools',
    '/ai-center/expert-consultation',
    '/ai/monitoring',
    '/ai/predictions',
    '/ai/AIQueryInterface'
  ],

  // 营销管理
  marketingManagement: [
    '/marketing',
    '/marketing/campaigns',
    '/marketing/advertisements',
    '/marketing/referrals',
    '/marketing/coupons',
    '/marketing-center',
    '/marketing/analysis',
    '/marketing/channels',
    '/marketing/conversions',
    '/marketing/funnel',
    '/customer-pool',
    '/customer-pool/list'
  ],

  // 系统设置
  systemSettings: [
    '/system',
    '/system/settings',
    '/system/security',
    '/system/logs',
    '/system/backup',
    '/system/maintenance',
    '/system/config'
  ],

  // 中心页面（重构后的新路由）
  centers: [
    '/centers',
    '/centers/personnel',
    '/centers/enrollment',
    '/centers/activity',
    '/centers/teaching',
    '/centers/finance',
    '/centers/marketing',
    '/centers/ai',
    '/centers/system',
    '/centers/usage'
  ],

  // 教师中心（教师角色专用）
  teacherCenter: [
    '/teacher-center',
    '/teacher-center/dashboard',
    '/teacher-center/activities',
    '/teacher-center/teaching',
    '/teacher-center/tasks',
    '/teacher-center/customer-tracking',
    '/teacher-center/enrollment',
    '/teacher-center/creative-curriculum',
    '/teacher-center/creative-curriculum/interactive'
  ],

  // 园长功能
  principalPages: [
    '/principal',
    '/principal/dashboard',
    '/principal/basic-info',
    '/principal/performance',
    '/principal/marketing-analysis',
    '/principal/customer-pool',
    '/principal/decision-support'
  ],

  // 集团管理
  groupManagement: [
    '/groups',
    '/group-list',
    '/group-detail',
    '/group-form',
    '/group-upgrade'
  ],

  // 个人资料
  profile: [
    '/profile',
    '/profile/edit',
    '/user-profile-center'
  ],

  // 通知和消息
  notifications: [
    '/notifications',
    '/notifications/list',
    '/messages',
    '/message-center'
  ],

  // 日程和任务
  schedules: [
    '/schedules',
    '/schedules/calendar',
    '/todos',
    '/task-center'
  ],

  // 媒体管理
  media: [
    '/media',
    '/media/upload',
    '/media/gallery',
    '/poster-editor',
    '/media-center'
  ],

  // 报表和分析
  reports: [
    '/reports',
    '/reports/attendance',
    '/reports/performance',
    '/reports/finance',
    '/reports/enrollment',
    '/analytics-center'
  ],

  // 错误页面
  errorPages: [
    '/403',
    '/404',
    '/500',
    '/error'
  ]
};

// 错误收集器类
class ErrorCollector {
  constructor() {
    this.errors = [];
    this.networkErrors = [];
    this.consoleMessages = [];
    this.pageLoadErrors = [];
  }

  addConsoleError(page, error) {
    const errorInfo = {
      type: 'console',
      page: page,
      timestamp: new Date().toISOString(),
      level: error.type(),
      text: error.text(),
      location: error.location(),
      args: error.args()
    };
    this.errors.push(errorInfo);
    this.consoleMessages.push(errorInfo);
  }

  addNetworkError(page, error) {
    const errorInfo = {
      type: 'network',
      page: page,
      timestamp: new Date().toISOString(),
      url: error.url(),
      status: error.status(),
      method: error.method(),
      failure: error.failure(),
      requestHeaders: error.requestHeaders(),
      responseHeaders: error.responseHeaders()
    };
    this.errors.push(errorInfo);
    this.networkErrors.push(errorInfo);
  }

  addPageLoadError(page, error, url) {
    const errorInfo = {
      type: 'page_load',
      page: page,
      timestamp: new Date().toISOString(),
      url: url,
      error: error.message,
      stack: error.stack
    };
    this.errors.push(errorInfo);
    this.pageLoadErrors.push(errorInfo);
  }

  getSummary() {
    return {
      totalErrors: this.errors.length,
      consoleErrors: this.consoleMessages.filter(e => ['error'].includes(e.level)).length,
      consoleWarnings: this.consoleMessages.filter(e => ['warning'].includes(e.level)).length,
      networkErrors: this.networkErrors.length,
      pageLoadErrors: this.pageLoadErrors.length,
      errorsByPage: this.groupErrorsByPage()
    };
  }

  groupErrorsByPage() {
    const grouped = {};
    this.errors.forEach(error => {
      const page = error.page;
      if (!grouped[page]) {
        grouped[page] = [];
      }
      grouped[page].push(error);
    });
    return grouped;
  }
}

// 主测试类
class FrontendErrorTester {
  constructor(config = CONFIG) {
    this.config = config;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.errorCollector = new ErrorCollector();
    this.testResults = {
      startTime: new Date().toISOString(),
      endTime: null,
      totalPages: 0,
      successfulPages: 0,
      failedPages: 0,
      errors: []
    };
  }

  async initialize() {
    console.log('🚀 初始化浏览器测试环境...');

    try {
      // 创建浏览器实例
      this.browser = await chromium.launch({
        headless: this.config.HEADLESS,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      // 创建浏览器上下文
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });

      // 创建页面
      this.page = await this.context.newPage();

      // 设置错误监听器
      this.setupErrorListeners();

      console.log('✅ 浏览器环境初始化成功');
    } catch (error) {
      console.error('❌ 浏览器初始化失败:', error);
      throw error;
    }
  }

  setupErrorListeners() {
    // 监听控制台消息
    if (this.config.CAPTURE_CONSOLE) {
      this.page.on('console', (msg) => {
        if (['error', 'warning'].includes(msg.type())) {
          this.errorCollector.addConsoleError(this.page.url(), msg);
        }
      });
    }

    // 监听页面错误
    this.page.on('pageerror', (error) => {
      this.errorCollector.addPageLoadError(this.page.url(), error, this.page.url());
    });

    // 监听网络错误
    if (this.config.CAPTURE_NETWORK) {
      this.page.on('requestfailed', (request) => {
        this.errorCollector.addNetworkError(this.page.url(), request);
      });
    }

    // 监听响应错误
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        this.errorCollector.addNetworkError(this.page.url(), {
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          failure: null
        });
      }
    });
  }

  async login() {
    console.log('🔐 开始登录流程...');

    try {
      // 尝试访问登录页面
      await this.page.goto(`${this.config.FRONTEND_URL}/login`, {
        waitUntil: 'networkidle',
        timeout: this.config.TIMEOUT.PAGE_LOAD
      });

      // 等待登录表单加载
      await this.page.waitForSelector('input[name="username"], input[placeholder*="用户名"], input[placeholder*="账号"]', {
        timeout: this.config.TIMEOUT.ELEMENT_WAIT
      });

      // 填写登录信息
      await this.page.fill('input[name="username"], input[placeholder*="用户名"], input[placeholder*="账号"]', this.config.ADMIN_CREDENTIALS.username);
      await this.page.fill('input[name="password"], input[placeholder*="密码"], input[type="password"]', this.config.ADMIN_CREDENTIALS.password);

      // 截图保存登录前状态
      if (this.config.TAKE_SCREENSHOTS) {
        await this.takeScreenshot('login-before-submit');
      }

      // 点击登录按钮
      await Promise.any([
        this.page.click('button[type="submit"]'),
        this.page.click('button:has-text("登录")'),
        this.page.click('.login-btn'),
        this.page.click('[class*="login"] button')
      ]);

      // 等待登录成功 - 跳转到dashboard或等待元素消失
      await Promise.any([
        this.page.waitForURL(/dashboard/, { timeout: 10000 }),
        this.page.waitForSelector('[class*="dashboard"], .main-content', { timeout: 10000 }),
        this.page.waitForFunction(() => !document.querySelector('input[name="username"]'), { timeout: 10000 })
      ]);

      console.log('✅ 登录成功');

      // 截图保存登录后状态
      if (this.config.TAKE_SCREENSHOTS) {
        await this.takeScreenshot('login-success');
      }

      return true;
    } catch (error) {
      console.error('❌ 登录失败:', error.message);

      // 尝试备选URL
      try {
        console.log('🔄 尝试备选URL登录...');
        await this.page.goto(`${this.config.ALT_FRONTEND_URL}/login`, {
          waitUntil: 'networkidle',
          timeout: this.config.TIMEOUT.PAGE_LOAD
        });

        await this.page.waitForSelector('input[name="username"], input[placeholder*="用户名"]', {
          timeout: this.config.TIMEOUT.ELEMENT_WAIT
        });

        await this.page.fill('input[name="username"], input[placeholder*="用户名"]', this.config.ADMIN_CREDENTIALS.username);
        await this.page.fill('input[name="password"], input[placeholder*="密码"]', this.config.ADMIN_CREDENTIALS.password);
        await this.page.click('button[type="submit"], button:has-text("登录")');

        await this.page.waitForURL(/dashboard/, { timeout: 10000 });
        console.log('✅ 备选URL登录成功');
        return true;
      } catch (altError) {
        console.error('❌ 备选URL登录也失败:', altError.message);

        // 如果是开发环境，尝试设置模拟token
        if (this.config.FRONTEND_URL.includes('localhost') || this.config.ALT_FRONTEND_URL.includes('localhost')) {
          console.log('🔧 尝试开发环境模拟登录...');
          try {
            await this.page.evaluate(() => {
              localStorage.setItem('kindergarten_token', 'mock_token_' + Date.now());
              localStorage.setItem('kindergarten_user_info', JSON.stringify({
                id: 1,
                username: 'admin',
                role: 'admin',
                name: '管理员'
              }));
            });
            await this.page.goto(`${this.config.FRONTEND_URL}/`, {
              waitUntil: 'networkidle',
              timeout: this.config.TIMEOUT.PAGE_LOAD
            });
            console.log('✅ 开发环境模拟登录成功');
            return true;
          } catch (devError) {
            console.error('❌ 开发环境模拟登录失败:', devError.message);
          }
        }

        return false;
      }
    }
  }

  async testPages() {
    console.log('🔍 开始系统性页面测试...');

    const allRoutes = Object.values(PAGE_ROUTES).flat();
    this.testResults.totalPages = allRoutes.length;

    // 按类别测试页面
    for (const [category, routes] of Object.entries(PAGE_ROUTES)) {
      console.log(`\n📂 测试类别: ${category} (${routes.length} 页面)`);

      for (const route of routes) {
        await this.testSinglePage(route, category);
      }
    }
  }

  async testSinglePage(route, category) {
    const fullUrl = `${this.config.FRONTEND_URL}${route}`;
    const startTime = Date.now();

    console.log(`  📍 测试页面: ${route}`);

    try {
      // 访问页面
      await this.page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.TIMEOUT.PAGE_LOAD
      });

      // 等待页面加载
      await this.page.waitForTimeout(this.config.TIMEOUT.NETWORK_IDLE);

      // 检查是否是错误页面
      const pageContent = await this.page.content();
      const hasErrorContent = pageContent.includes('404') ||
                             pageContent.includes('500') ||
                             pageContent.includes('页面不存在') ||
                             pageContent.includes('服务器错误') ||
                             pageContent.includes('Forbidden');

      if (hasErrorContent && !route.includes('404') && !route.includes('500')) {
        this.errorCollector.addPageLoadError(route, new Error('页面显示错误内容'), route);
      }

      // 截图
      if (this.config.TAKE_SCREENSHOTS) {
        await this.takeScreenshot(`${category.replace(/\//g, '-')}-${route.replace(/\//g, '-')}`);
      }

      const loadTime = Date.now() - startTime;
      this.testResults.successfulPages++;

      console.log(`    ✅ 成功 (${loadTime}ms)`);

    } catch (error) {
      const loadTime = Date.now() - startTime;
      this.testResults.failedPages++;

      console.log(`    ❌ 失败 (${loadTime}ms): ${error.message}`);

      this.errorCollector.addPageLoadError(route, error, fullUrl);

      // 截图失败页面
      if (this.config.TAKE_SCREENSHOTS) {
        await this.takeScreenshot(`error-${category.replace(/\//g, '-')}-${route.replace(/\//g, '-')}`);
      }
    }
  }

  async takeScreenshot(filename) {
    try {
      const screenshotPath = path.join(this.config.SCREENSHOT_DIR, `${filename}-${Date.now()}.png`);
      await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      return screenshotPath;
    } catch (error) {
      console.warn(`⚠️ 截图失败 ${filename}:`, error.message);
      return null;
    }
  }

  async generateReport() {
    console.log('📊 生成测试报告...');

    this.testResults.endTime = new Date().toISOString();
    const errorSummary = this.errorCollector.getSummary();

    const report = {
      testInfo: {
        startTime: this.testResults.startTime,
        endTime: this.testResults.endTime,
        duration: new Date(this.testResults.endTime) - new Date(this.testResults.startTime),
        config: {
          frontendUrl: this.config.FRONTEND_URL,
          backendUrl: this.config.BACKEND_URL,
          headless: this.config.HEADLESS
        }
      },
      summary: {
        ...this.testResults,
        ...errorSummary,
        successRate: ((this.testResults.successfulPages / this.testResults.totalPages) * 100).toFixed(2) + '%'
      },
      errors: {
        all: this.errorCollector.errors,
        byPage: this.errorCollector.groupErrorsByPage(),
        byType: {
          console: this.errorCollector.consoleMessages,
          network: this.errorCollector.networkErrors,
          pageLoad: this.errorCollector.pageLoadErrors
        }
      },
      pages: {
        successful: this.testResults.successfulPages,
        failed: this.testResults.failedPages,
        details: Object.entries(PAGE_ROUTES).map(([category, routes]) => ({
          category,
          routes: routes.map(route => ({
            url: `${this.config.FRONTEND_URL}${route}`,
            status: this.getPageStatus(route),
            errors: this.getPageErrors(route)
          }))
        }))
      }
    };

    // 保存报告文件
    await this.saveReport(report);

    // 生成控制台摘要
    this.printReportSummary(report);

    return report;
  }

  getPageStatus(route) {
    const errors = this.getPageErrors(route);
    return errors.length === 0 ? 'success' : 'failed';
  }

  getPageErrors(route) {
    return this.errorCollector.errors.filter(error =>
      error.page === route || error.url?.includes(route)
    );
  }

  async saveReport(report) {
    try {
      await fs.promises.mkdir(this.config.REPORT_DIR, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(this.config.REPORT_DIR, `frontend-error-report-${timestamp}.json`);

      await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));

      console.log(`📄 详细报告已保存: ${reportPath}`);

      return reportPath;
    } catch (error) {
      console.error('❌ 报告保存失败:', error);
      return null;
    }
  }

  printReportSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 前端错误检测测试报告摘要');
    console.log('='.repeat(60));

    console.log(`\n⏱️  测试时间: ${report.testInfo.duration}ms`);
    console.log(`📊 页面统计: ${report.summary.totalPages} 总页面 | ${report.summary.successfulPages} 成功 | ${report.summary.failedPages} 失败`);
    console.log(`✅ 成功率: ${report.summary.successRate}`);

    if (report.summary.totalErrors > 0) {
      console.log(`\n🚨 错误统计:`);
      console.log(`   总错误数: ${report.summary.totalErrors}`);
      console.log(`   控制台错误: ${report.summary.consoleErrors}`);
      console.log(`   控制台警告: ${report.summary.consoleWarnings}`);
      console.log(`   网络错误: ${report.summary.networkErrors}`);
      console.log(`   页面加载错误: ${report.summary.pageLoadErrors}`);

      console.log(`\n❌ 错误最多的页面:`);
      Object.entries(report.errors.byPage)
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 10)
        .forEach(([page, errors]) => {
          console.log(`   ${page}: ${errors.length} 个错误`);
        });

      if (report.summary.consoleErrors > 0) {
        console.log(`\n🔥 控制台错误详情:`);
        report.errors.byType.console
          .filter(e => e.level === 'error')
          .slice(0, 5)
          .forEach(error => {
            console.log(`   ${error.page}: ${error.text}`);
          });
      }

      if (report.summary.networkErrors > 0) {
        console.log(`\n🌐 网络错误详情:`);
        report.errors.byType.network
          .slice(0, 5)
          .forEach(error => {
            console.log(`   ${error.url}: ${error.status} ${error.failure || ''}`);
          });
      }
    } else {
      console.log(`\n🎉 恭喜！未发现任何错误！`);
    }

    console.log('\n' + '='.repeat(60));
  }

  async cleanup() {
    console.log('🧹 清理测试环境...');

    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();

      console.log('✅ 测试环境清理完成');
    } catch (error) {
      console.error('❌ 清理失败:', error);
    }
  }

  async run() {
    const startTime = Date.now();

    try {
      // 初始化
      await this.initialize();

      // 登录
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        throw new Error('登录失败，无法继续测试');
      }

      // 测试页面
      await this.testPages();

      // 生成报告
      const report = await this.generateReport();

      const totalTime = Date.now() - startTime;
      console.log(`\n🏁 测试完成! 总用时: ${totalTime}ms`);

      return report;

    } catch (error) {
      console.error('❌ 测试执行失败:', error);

      const errorReport = {
        testInfo: {
          startTime: this.testResults.startTime,
          endTime: new Date().toISOString(),
          error: error.message
        },
        summary: {
          status: 'failed',
          error: error.message,
          stack: error.stack
        }
      };

      await this.saveReport(errorReport);
      throw error;

    } finally {
      await this.cleanup();
    }
  }
}

// 命令行执行
async function main() {
  console.log('🚀 启动幼儿园管理系统前端错误检测测试...');

  const tester = new FrontendErrorTester();

  try {
    await tester.run();

    // 设置退出码
    const errorCount = tester.errorCollector.errors.length;
    if (errorCount > 0) {
      console.log(`\n⚠️ 发现 ${errorCount} 个错误，测试未完全通过`);
      process.exit(1);
    } else {
      console.log('\n✅ 测试完全通过，未发现任何错误！');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n💥 测试失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('💥 未处理的错误:', error);
    process.exit(1);
  });
}

module.exports = {
  FrontendErrorTester,
  CONFIG,
  PAGE_ROUTES
};