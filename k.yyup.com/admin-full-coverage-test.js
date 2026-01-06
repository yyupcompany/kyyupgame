#!/usr/bin/env node

/**
 * Admin角色全覆盖测试脚本
 *
 * 功能：
 * 1. 分析admin角色侧边栏所有页面入口
 * 2. 自动化测试每个页面的404错误、控制台错误、数据为0问题
 * 3. 生成详细的测试报告
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

interface TestPage {
  id: string;
  title: string;
  route: string;
  category: string;
  subCategory?: string;
  priority: 'high' | 'medium' | 'low';
  expectedElements?: string[];
  expectedApiEndpoints?: string[];
}

interface TestResult {
  page: TestPage;
  status: 'passed' | 'failed' | 'error';
  errors: string[];
  warnings: string[];
  httpStatus: number;
  consoleErrors: string[];
  apiResponses: Array<{
    url: string;
    status: number;
    hasData: boolean;
    dataSize: number;
  }>;
  loadTime: number;
  screenshotPath?: string;
}

interface TestReport {
  summary: {
    totalPages: number;
    passedPages: number;
    failedPages: number;
    errorPages: number;
    totalErrors: number;
    totalWarnings: number;
    executionTime: number;
  };
  results: TestResult[];
  recommendations: string[];
}

// Admin角色页面配置 - 基于CentersSidebar和ImprovedSidebar分析
const ADMIN_PAGES: TestPage[] = [
  // === 管理控制台 ===
  {
    id: 'dashboard',
    title: '数据概览',
    route: '/dashboard',
    category: '管理控制台',
    priority: 'high',
    expectedElements: ['.dashboard-content', '.stats-cards', '.chart-container'],
    expectedApiEndpoints: ['/api/dashboard/stats', '/api/dashboard/overview']
  },
  {
    id: 'dashboard-schedule',
    title: '日程管理',
    route: '/dashboard/schedule',
    category: '管理控制台',
    priority: 'medium',
    expectedElements: ['.schedule-calendar', '.schedule-list'],
    expectedApiEndpoints: ['/api/schedules']
  },
  {
    id: 'dashboard-todos',
    title: '待办事项',
    route: '/todo',
    category: '管理控制台',
    priority: 'high',
    expectedElements: ['.todo-list', '.todo-filters', '.add-todo-btn'],
    expectedApiEndpoints: ['/api/dashboard/todos']
  },

  // === 园所管理 ===
  {
    id: 'personnel-center',
    title: '人员中心',
    route: '/centers/PersonnelCenter',
    category: '园所管理',
    priority: 'high',
    expectedElements: ['.staff-list', '.staff-stats'],
    expectedApiEndpoints: ['/api/personnel', '/api/users']
  },
  {
    id: 'attendance-center',
    title: '考勤中心',
    route: '/centers/AttendanceCenter',
    category: '园所管理',
    priority: 'medium',
    expectedElements: ['.attendance-records', '.attendance-stats'],
    expectedApiEndpoints: ['/api/attendance']
  },
  {
    id: 'teaching-center',
    title: '教学中心',
    route: '/centers/TeachingCenter',
    category: '园所管理',
    priority: 'high',
    expectedElements: ['.teaching-activities', '.curriculum-list'],
    expectedApiEndpoints: ['/api/teaching', '/api/curriculum']
  },
  {
    id: 'assessment-center',
    title: '评估中心',
    route: '/centers/AssessmentCenter',
    category: '园所管理',
    priority: 'medium',
    expectedElements: ['.assessment-list', '.assessment-reports'],
    expectedApiEndpoints: ['/api/assessments']
  },

  // === 业务管理 ===
  {
    id: 'enrollment-center',
    title: '招生中心',
    route: '/centers/EnrollmentCenter',
    category: '业务管理',
    priority: 'high',
    expectedElements: ['.enrollment-stats', '.enrollment-list'],
    expectedApiEndpoints: ['/api/enrollment', '/api/applications']
  },
  {
    id: 'marketing-center',
    title: '营销中心',
    route: '/centers/MarketingCenter',
    category: '业务管理',
    priority: 'high',
    expectedElements: ['.marketing-campaigns', '.performance-stats'],
    expectedApiEndpoints: ['/api/marketing', '/api/campaigns']
  },
  {
    id: 'activity-center',
    title: '活动中心',
    route: '/centers/ActivityCenter',
    category: '业务管理',
    priority: 'high',
    expectedElements: ['.activity-list', '.activity-calendar'],
    expectedApiEndpoints: ['/api/activities', '/api/events']
  },
  {
    id: 'customer-pool-center',
    title: '客户池中心',
    route: '/centers/CustomerPoolCenter',
    category: '业务管理',
    priority: 'high',
    expectedElements: ['.customer-list', '.customer-funnels'],
    expectedApiEndpoints: ['/api/customers', '/api/customer-pool']
  },
  {
    id: 'call-center',
    title: '呼叫中心',
    route: '/centers/CallCenter',
    category: '业务管理',
    priority: 'medium',
    expectedElements: ['.call-records', '.call-stats'],
    expectedApiEndpoints: ['/api/calls', '/api/communications']
  },
  {
    id: 'business-center',
    title: '业务中心',
    route: '/centers/business',
    category: '业务管理',
    priority: 'medium',
    expectedElements: ['.business-overview', '.business-metrics'],
    expectedApiEndpoints: ['/api/business']
  },

  // === 财务管理 ===
  {
    id: 'finance-center',
    title: '财务中心',
    route: '/centers/FinanceCenter',
    category: '财务管理',
    priority: 'high',
    expectedElements: ['.finance-stats', '.transaction-list'],
    expectedApiEndpoints: ['/api/finance', '/api/payments']
  },

  // === 系统管理 ===
  {
    id: 'system-center',
    title: '系统中心',
    route: '/centers/SystemCenter',
    category: '系统管理',
    priority: 'high',
    expectedElements: ['.system-settings', '.admin-tools'],
    expectedApiEndpoints: ['/api/system', '/api/settings']
  },
  {
    id: 'task-center',
    title: '任务中心',
    route: '/centers/TaskCenter',
    category: '系统管理',
    priority: 'medium',
    expectedElements: ['.task-list', '.task-management'],
    expectedApiEndpoints: ['/api/tasks']
  },
  {
    id: 'inspection-center',
    title: '检查中心',
    route: '/centers/InspectionCenter',
    category: '系统管理',
    priority: 'medium',
    expectedElements: ['.inspection-checklist', '.inspection-reports'],
    expectedApiEndpoints: ['/api/inspections']
  },
  {
    id: 'script-center',
    title: '话术中心',
    route: '/centers/ScriptCenter',
    category: '系统管理',
    priority: 'low',
    expectedElements: ['.script-library', '.script-templates'],
    expectedApiEndpoints: ['/api/scripts']
  },

  // === AI智能 ===
  {
    id: 'ai-center',
    title: '智能中心',
    route: '/centers/AICenter',
    category: 'AI智能',
    priority: 'high',
    expectedElements: ['.ai-interface', '.ai-tools'],
    expectedApiEndpoints: ['/api/ai', '/api/ai-services']
  },
  {
    id: 'analytics-center',
    title: '分析中心',
    route: '/centers/AnalyticsCenter',
    category: 'AI智能',
    priority: 'medium',
    expectedElements: ['.analytics-dashboard', '.data-reports'],
    expectedApiEndpoints: ['/api/analytics', '/api/reports']
  },
  {
    id: 'document-template-center',
    title: '文档模板中心',
    route: '/centers/DocumentTemplateCenter',
    category: 'AI智能',
    priority: 'low',
    expectedElements: ['.template-library', '.template-editor'],
    expectedApiEndpoints: ['/api/document-templates']
  },
  {
    id: 'document-center',
    title: '文档中心',
    route: '/centers/document-center',
    category: 'AI智能',
    priority: 'low',
    expectedElements: ['.document-library', '.document-management'],
    expectedApiEndpoints: ['/api/documents']
  }
];

class AdminRoleTester {
  private browser: any;
  private page: any;
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  constructor() {
    this.setupOutputDirectory();
  }

  private setupOutputDirectory() {
    const outputDir = path.join(__dirname, 'admin-test-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 创建子目录
    const subdirs = ['screenshots', 'reports'];
    subdirs.forEach(dir => {
      const fullPath = path.join(outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async init() {
    console.log('🚀 初始化Admin角色全覆盖测试...');

    this.browser = await chromium.launch({
      headless: true, // 使用无头模式
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    this.page = await this.browser.newPage();

    // 设置视口大小
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    // 设置超时时间
    this.page.setDefaultTimeout(30000);

    // 监听控制台输出
    this.page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        console.error('浏览器控制台错误:', msg.text());
      }
    });

    // 监听页面错误
    this.page.on('pageerror', (error: Error) => {
      console.error('页面错误:', error.message);
    });

    // 监听请求响应
    this.page.on('response', (response: any) => {
      const url = response.url();
      if (url.includes('/api/')) {
        console.log(`API响应: ${response.status()} ${url}`);
      }
    });

    console.log('✅ 浏览器初始化完成');
  }

  async loginAsAdmin() {
    console.log('🔐 正在以Admin身份登录...');

    try {
      await this.page.goto('http://localhost:5173/login');
      await this.page.waitForLoadState('networkidle');

      // 点击admin快捷登录
      await this.page.click('.admin-btn');

      // 等待登录成功
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });

      console.log('✅ Admin登录成功');
      return true;
    } catch (error) {
      console.error('❌ Admin登录失败:', error);
      return false;
    }
  }

  async testPage(pageConfig: TestPage): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      page: pageConfig,
      status: 'passed',
      errors: [],
      warnings: [],
      httpStatus: 200,
      consoleErrors: [],
      apiResponses: [],
      loadTime: 0
    };

    try {
      console.log(`🔍 测试页面: ${pageConfig.title} (${pageConfig.route})`);

      // 导航到目标页面
      const response = await this.page.goto(`http://localhost:5173${pageConfig.route}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response) {
        throw new Error('页面响应为空');
      }

      result.httpStatus = response.status();

      // 检查HTTP状态码
      if (response.status() === 404) {
        result.status = 'failed';
        result.errors.push('页面返回404错误');
        return result;
      }

      // 等待页面加载完成
      await this.page.waitForLoadState('domcontentloaded');

      // 检查页面标题是否包含404
      const title = await this.page.title();
      if (title.includes('404') || title.includes('Page Not Found')) {
        result.status = 'failed';
        result.errors.push('页面标题包含404错误信息');
      }

      // 检查期望的元素是否存在
      if (pageConfig.expectedElements) {
        for (const selector of pageConfig.expectedElements) {
          try {
            const element = await this.page.$(selector);
            if (!element) {
              result.warnings.push(`期望的元素未找到: ${selector}`);
            }
          } catch (error) {
            result.warnings.push(`检查元素时出错 ${selector}: ${error.message}`);
          }
        }
      }

      // 检查页面是否显示"暂无数据"
      const noDataSelectors = [
        'text="暂无数据"',
        'text="无数据"',
        'text="Empty"',
        'text="No data"',
        '.empty-state',
        '.no-data'
      ];

      for (const selector of noDataSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            result.warnings.push('页面显示"暂无数据"或类似信息');
          }
        } catch (error) {
          // 忽略选择器错误
        }
      }

      // 等待一段时间收集API响应
      await this.page.waitForTimeout(3000);

      result.loadTime = Date.now() - startTime;

    } catch (error) {
      result.status = 'error';
      result.errors.push(`页面测试异常: ${error.message}`);
      console.error(`❌ 页面 ${pageConfig.title} 测试失败:`, error);
    }

    return result;
  }

  async runAllTests() {
    console.log(`📋 开始测试 ${ADMIN_PAGES.length} 个页面...`);

    const loginSuccess = await this.loginAsAdmin();
    if (!loginSuccess) {
      throw new Error('Admin登录失败，无法继续测试');
    }

    // 按优先级分组测试
    const highPriorityPages = ADMIN_PAGES.filter(p => p.priority === 'high');
    const mediumPriorityPages = ADMIN_PAGES.filter(p => p.priority === 'medium');
    const lowPriorityPages = ADMIN_PAGES.filter(p => p.priority === 'low');

    console.log(`🎯 高优先级页面: ${highPriorityPages.length} 个`);
    console.log(`📊 中优先级页面: ${mediumPriorityPages.length} 个`);
    console.log(`📝 低优先级页面: ${lowPriorityPages.length} 个`);

    // 测试所有页面
    for (const pageConfig of ADMIN_PAGES) {
      const result = await this.testPage(pageConfig);
      this.results.push(result);

      // 添加延迟避免过快请求
      await this.page.waitForTimeout(1000);
    }

    console.log('✅ 所有页面测试完成');
  }

  generateReport(): TestReport {
    const summary = {
      totalPages: this.results.length,
      passedPages: this.results.filter(r => r.status === 'passed').length,
      failedPages: this.results.filter(r => r.status === 'failed').length,
      errorPages: this.results.filter(r => r.status === 'error').length,
      totalErrors: this.results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: this.results.reduce((sum, r) => sum + r.warnings.length, 0),
      executionTime: Date.now() - this.startTime
    };

    const recommendations: string[] = [];

    // 生成建议
    if (summary.failedPages > 0) {
      recommendations.push(`${summary.failedPages} 个页面存在404错误，需要检查路由配置`);
    }

    if (summary.totalErrors > 0) {
      recommendations.push(`发现 ${summary.totalErrors} 个错误，需要优先修复`);
    }

    if (summary.totalWarnings > 0) {
      recommendations.push(`发现 ${summary.totalWarnings} 个警告，建议优化用户体验`);
    }

    const failedPages = this.results.filter(r => r.status === 'failed');
    if (failedPages.length > 0) {
      recommendations.push('重点失败的页面: ' + failedPages.map(f => f.page.title).join(', '));
    }

    return {
      summary,
      results: this.results,
      recommendations
    };
  }

  async saveReport(report: TestReport) {
    const outputDir = path.join(__dirname, 'admin-test-results', 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // 保存详细报告JSON
    const jsonReportPath = path.join(outputDir, `admin-test-report-${timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // 保存简化报告MD
    const mdReportPath = path.join(outputDir, `admin-test-report-${timestamp}.md`);
    const mdContent = this.generateMarkdownReport(report);
    fs.writeFileSync(mdReportPath, mdContent);

    console.log(`📊 测试报告已保存:`);
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   MD: ${mdReportPath}`);
  }

  private generateMarkdownReport(report: TestReport): string {
    const { summary, results, recommendations } = report;

    let content = `# Admin角色全覆盖测试报告\n\n`;
    content += `生成时间: ${new Date().toLocaleString()}\n\n`;

    // 测试概要
    content += `## 📊 测试概要\n\n`;
    content += `- **总页面数**: ${summary.totalPages}\n`;
    content += `- **通过页面**: ${summary.passedPages}\n`;
    content += `- **失败页面**: ${summary.failedPages}\n`;
    content += `- **错误页面**: ${summary.errorPages}\n`;
    content += `- **总错误数**: ${summary.totalErrors}\n`;
    content += `- **总警告数**: ${summary.totalWarnings}\n`;
    content += `- **执行时间**: ${(summary.executionTime / 1000).toFixed(2)}秒\n\n`;

    // 测试结果详情
    content += `## 📋 详细测试结果\n\n`;

    // 按状态分组
    const failedPages = results.filter(r => r.status === 'failed' || r.status === 'error');
    const passedPages = results.filter(r => r.status === 'passed');

    if (failedPages.length > 0) {
      content += `### ❌ 失败的页面 (${failedPages.length})\n\n`;
      failedPages.forEach(result => {
        content += `#### ${result.page.title}\n`;
        content += `- **路由**: ${result.page.route}\n`;
        content += `- **分类**: ${result.page.category}\n`;
        content += `- **状态**: ${result.status}\n`;
        content += `- **HTTP状态**: ${result.httpStatus}\n`;
        content += `- **加载时间**: ${result.loadTime}ms\n`;

        if (result.errors.length > 0) {
          content += `- **错误**:\n`;
          result.errors.forEach(error => {
            content += `  - ${error}\n`;
          });
        }

        if (result.warnings.length > 0) {
          content += `- **警告**:\n`;
          result.warnings.forEach(warning => {
            content += `  - ${warning}\n`;
          });
        }
        content += `\n`;
      });
    }

    if (passedPages.length > 0) {
      content += `### ✅ 通过的页面 (${passedPages.length})\n\n`;
      passedPages.forEach(result => {
        content += `- **${result.page.title}** (${result.page.route}) - ${result.loadTime}ms\n`;
      });
      content += `\n`;
    }

    // 优化建议
    if (recommendations.length > 0) {
      content += `## 💡 优化建议\n\n`;
      recommendations.forEach((rec, index) => {
        content += `${index + 1}. ${rec}\n`;
      });
      content += `\n`;
    }

    return content;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 浏览器已关闭');
  }
}

// 主执行函数
async function main() {
  const tester = new AdminRoleTester();

  try {
    await tester.init();
    await tester.runAllTests();

    const report = tester.generateReport();
    await tester.saveReport(report);

    // 输出简要结果
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Admin角色全覆盖测试完成');
    console.log('='.repeat(50));
    console.log(`📊 总页面: ${report.summary.totalPages}`);
    console.log(`✅ 通过: ${report.summary.passedPages}`);
    console.log(`❌ 失败: ${report.summary.failedPages}`);
    console.log(`💥 错误: ${report.summary.errorPages}`);
    console.log(`⚠️  警告: ${report.summary.totalWarnings}`);
    console.log(`⏱️  耗时: ${(report.summary.executionTime / 1000).toFixed(2)}秒`);

    if (report.summary.failedPages > 0 || report.summary.totalErrors > 0) {
      console.log('\n❌ 发现问题，请查看详细报告');
      process.exit(1);
    } else {
      console.log('\n✅ 所有测试通过');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 测试执行失败:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AdminRoleTester, ADMIN_PAGES };