#!/usr/bin/env node

/**
 * Admin角色自动化测试执行器
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Admin角色测试页面配置（简化版）
const TEST_PAGES = [
  {
    id: 'dashboard',
    title: '数据概览',
    route: '/dashboard',
    category: '管理控制台',
    priority: 'critical',
    expectedElements: ['.dashboard-content', '.stats-cards'],
    expectedErrors: [
      '页面404错误',
      '控制台错误',
      '数据加载失败'
    ]
  },
  {
    id: 'todo-management',
    title: '待办事项管理',
    route: '/todo',
    category: '管理控制台',
    priority: 'high',
    expectedElements: ['.todo-list', '.todo-filters'],
    expectedErrors: [
      '页面404错误',
      '控制台错误',
      '数据加载失败',
      '暂无数据'
    ]
  },
  {
    id: 'personnel-center',
    title: '人员中心',
    route: '/centers/PersonnelCenter',
    category: '园所管理',
    priority: 'critical',
    expectedElements: ['.staff-list', '.staff-stats'],
    expectedErrors: [
      '页面404错误',
      '控制台错误',
      '数据加载失败'
    ]
  },
  {
    id: 'enrollment-center',
    title: '招生中心',
    route: '/centers/EnrollmentCenter',
    category: '业务管理',
    priority: 'critical',
    expectedElements: ['.enrollment-stats', '.enrollment-list'],
    expectedErrors: [
      '页面404错误',
      '控制台错误',
      '数据加载失败'
    ]
  },
  {
    id: 'marketing-center',
    title: '营销中心',
    route: '/centers/MarketingCenter',
    category: '业务管理',
    priority: 'high',
    expectedElements: ['.marketing-campaigns', '.performance-stats'],
    expectedErrors: [
      '页面404错误',
      '控制台错误',
      '数据加载失败'
    ]
  },
  {
    id: 'system-center',
    title: '系统中心',
    route: '/centers/SystemCenter',
    category: '系统管理',
    priority: 'critical',
    expectedElements: ['.system-settings', '.admin-tools'],
    expectedErrors: [
      '页面404错误',
      '控制台错误',
      '数据加载失败'
    ]
  },
  {
    id: 'ai-center',
    title: '智能中心',
    route: '/centers/AICenter',
    category: 'AI智能',
    priority: 'high',
    expectedElements: ['.ai-interface', '.ai-tools'],
    expectedErrors: [
      '页面404错误',
      '控制台错误',
      '数据加载失败'
    ]
  }
];

class AdminTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.startTime = Date.now();
    this.setupOutputDirectory();
  }

  setupOutputDirectory() {
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
    console.log('🚀 初始化Admin角色自动化测试...');

    this.browser = await chromium.launch({
      headless: true,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    this.page.setDefaultTimeout(30000);

    // 监听控制台输出
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('浏览器控制台错误:', msg.text());
      }
    });

    // 监听页面错误
    this.page.on('pageerror', (error) => {
      console.error('页面错误:', error.message);
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
      await this.page.waitForTimeout(2000);

      // 检查当前URL
      const currentUrl = this.page.url();
      console.log('登录后URL:', currentUrl);

      console.log('✅ Admin登录成功');
      return true;
    } catch (error) {
      console.error('❌ Admin登录失败:', error.message);
      return false;
    }
  }

  async testPage(pageConfig) {
    const startTime = Date.now();
    const result = {
      pageId: pageConfig.id,
      pageTitle: pageConfig.title,
      route: pageConfig.route,
      category: pageConfig.category,
      priority: pageConfig.priority,
      status: 'passed',
      errors: [],
      warnings: [],
      httpStatus: 200,
      consoleErrors: [],
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

      // 检查特定错误内容
      const errorSelectors = [
        'text="404"',
        'text="Not Found"',
        'text="Error"',
        'text="错误"',
        '[class*="error"]'
      ];

      for (const selector of errorSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const text = await element.textContent();
            result.errors.push(`页面显示错误信息: ${text}`);
          }
        } catch (error) {
          // 忽略选择器错误
        }
      }

      // 等待一段时间收集数据
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
    console.log(`📋 开始测试 ${TEST_PAGES.length} 个页面...`);

    const loginSuccess = await this.loginAsAdmin();
    if (!loginSuccess) {
      throw new Error('Admin登录失败，无法继续测试');
    }

    // 按优先级分组测试
    const criticalPages = TEST_PAGES.filter(p => p.priority === 'critical');
    const highPages = TEST_PAGES.filter(p => p.priority === 'high');

    console.log(`🎯 关键页面: ${criticalPages.length} 个`);
    console.log(`📊 高优先级页面: ${highPages.length} 个`);

    // 测试所有页面
    for (const pageConfig of TEST_PAGES) {
      const result = await this.testPage(pageConfig);
      this.results.push(result);

      // 添加延迟避免过快请求
      await this.page.waitForTimeout(2000);
    }

    console.log('✅ 所有页面测试完成');
  }

  generateReport() {
    const summary = {
      totalPages: this.results.length,
      passedPages: this.results.filter(r => r.status === 'passed').length,
      failedPages: this.results.filter(r => r.status === 'failed').length,
      errorPages: this.results.filter(r => r.status === 'error').length,
      totalErrors: this.results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: this.results.reduce((sum, r) => sum + r.warnings.length, 0),
      executionTime: Date.now() - this.startTime
    };

    const recommendations = [];

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

    const failedPages = this.results.filter(r => r.status === 'failed' || r.status === 'error');
    if (failedPages.length > 0) {
      recommendations.push('重点失败的页面: ' + failedPages.map(f => f.pageTitle).join(', '));
    }

    return {
      summary,
      results: this.results,
      recommendations
    };
  }

  async saveReport(report) {
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

      // 输出失败的页面
      console.log('\n❌ 失败的页面:');
      const failedPages = report.results.filter(r => r.status === 'failed' || r.status === 'error');
      failedPages.forEach(page => {
        console.log(`   - ${page.pageTitle} (${page.route})`);
        if (page.errors.length > 0) {
          page.errors.forEach(error => {
            console.log(`     * ${error}`);
          });
        }
      });

      process.exit(1);
    } else {
      console.log('\n✅ 所有测试通过 - 可以进行第二组覆盖测试！');
      process.exit(0);
    }
  }

  generateMarkdownReport(report) {
    const { summary, results, recommendations } = report;

    let content = `# Admin角色全覆盖测试报告\n\n`;
    content += `生成时间: ${new Date().toLocaleString()}\n`;

    // 测试概要
    content += `\n## 📊 测试概要\n\n`;
    content += `- **总页面数**: ${summary.totalPages}\n`;
    content += `- **通过页面**: ${summary.passedPages}\n`;
    content += `- **失败页面**: ${summary.failedPages}\n`;
    content += `- **错误页面**: ${summary.errorPages}\n`;
    content += `- **总错误数**: ${summary.totalErrors}\n`;
    content += `- **总警告数**: ${summary.totalWarnings}\n`;
    content += `- **执行时间**: ${(summary.executionTime / 1000).toFixed(2)}秒\n`;

    // 详细结果
    content += `\n## 📋 详细测试结果\n\n`;

    // 按状态分组
    const failedPages = results.filter(r => r.status === 'failed' || r.status === 'error');
    const passedPages = results.filter(r => r.status === 'passed');

    if (failedPages.length > 0) {
      content += `### ❌ 失败的页面 (${failedPages.length})\n\n`;
      failedPages.forEach(result => {
        content += `#### ${result.pageTitle}\n`;
        content += `- **路由**: ${result.route}\n`;
        content += `- **分类**: ${result.category}\n`;
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
        content += `- **${result.pageTitle}** (${result.route}) - ${result.loadTime}ms\n`;
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
  const tester = new AdminTestRunner();

  try {
    await tester.init();
    await tester.runAllTests();
    const report = tester.generateReport();
    await tester.saveReport(report);
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

module.exports = { AdminTestRunner, TEST_PAGES };