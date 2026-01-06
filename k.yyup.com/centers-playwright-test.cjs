const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Centers页面Playwright自动化测试
class CentersPageTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseUrl = 'http://localhost:5173';
    this.testResults = {
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        errors: 0
      },
      pages: [],
      consoleErrors: [],
      networkErrors: [],
      buttonTests: []
    };
    this.centersPages = [
      '/centers/AICenter',
      '/centers/ActivityCenter',
      '/centers/AnalyticsCenter',
      '/centers/AnalyticsCenter-Enhanced',
      '/centers/AssessmentCenter',
      '/centers/AttendanceCenter',
      '/centers/BusinessCenter',
      '/centers/CallCenter',
      '/centers/CustomerPoolCenter',
      '/centers/DocumentCollaboration',
      '/centers/DocumentEditor',
      '/centers/DocumentInstanceList',
      '/centers/DocumentStatistics',
      '/centers/DocumentTemplateCenter',
      '/centers/EnrollmentCenter',
      '/centers/FinanceCenter',
      '/centers/InspectionCenter',
      '/centers/MarketingCenter',
      '/centers/MarketingCenter-Enhanced',
      '/centers/PersonnelCenter',
      '/centers/ScriptCenter',
      '/centers/SystemCenter',
      '/centers/SystemCenter-Enhanced',
      '/centers/TaskCenter',
      '/centers/TeachingCenter'
    ];
  }

  // 启动浏览器
  async launchBrowser() {
    console.log('🚀 启动浏览器...');

    this.browser = await chromium.launch({
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true
    });

    this.page = await this.context.newPage();

    // 监听控制台消息
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.testResults.consoleErrors.push({
          url: this.page.url(),
          message: msg.text(),
          location: msg.location()
        });
        console.log(`❌ 控制台错误: ${msg.text()}`);
      }
    });

    // 监听页面错误
    this.page.on('pageerror', (error) => {
      this.testResults.consoleErrors.push({
        url: this.page.url(),
        message: error.message,
        stack: error.stack
      });
      console.log(`❌ 页面错误: ${error.message}`);
    });

    // 监听网络请求错误
    this.page.on('requestfailed', (request) => {
      this.testResults.networkErrors.push({
        url: request.url(),
        failure: request.failure()
      });
      console.log(`❌ 网络请求失败: ${request.url()} - ${request.failure().errorText}`);
    });

    console.log('✅ 浏览器启动成功');
  }

  // 登录系统
  async login() {
    console.log('🔐 尝试登录系统...');

    try {
      await this.page.goto(this.baseUrl + '/Login', { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      // 检查是否已经在登录页
      const loginUrl = this.page.url();
      if (loginUrl.includes('/Login')) {
        console.log('📝 检测到登录页面，尝试使用admin角色登录...');

        // 尝试多种登录方式
        const loginSelectors = [
          'input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]',
          'input[placeholder*="密码"], input[type="password"]',
          'button:has-text("登录"), .el-button--primary'
        ];

        // 填写用户名
        const usernameInput = await this.page.$(loginSelectors[0]);
        if (usernameInput) {
          await usernameInput.fill('admin');
          console.log('✅ 用户名输入成功');
        }

        // 填写密码
        const passwordInput = await this.page.$(loginSelectors[1]);
        if (passwordInput) {
          await passwordInput.fill('123456');
          console.log('✅ 密码输入成功');
        }

        // 点击登录按钮
        const loginButton = await this.page.$(loginSelectors[2]);
        if (loginButton) {
          await loginButton.click();
          console.log('✅ 点击登录按钮');
          await this.page.waitForTimeout(3000);
        }
      } else {
        console.log('✅ 已经登录或无需登录');
      }

      // 检查登录状态
      const currentUrl = this.page.url();
      if (currentUrl.includes('/Login')) {
        console.log('⚠️  仍在登录页面，可能需要手动登录');
      } else {
        console.log('✅ 登录成功或已登录');
      }

    } catch (error) {
      console.log('❌ 登录过程中出错:', error.message);
    }
  }

  // 测试单个页面
  async testPage(pagePath) {
    const testResult = {
      path: pagePath,
      url: this.baseUrl + pagePath,
      success: false,
      loadTime: 0,
      buttonCount: 0,
      buttonTests: [],
      formCount: 0,
      tableCount: 0,
      errors: [],
      screenshots: []
    };

    console.log(`\n🔍 测试页面: ${pagePath}`);

    try {
      const startTime = Date.now();

      // 访问页面
      await this.page.goto(testResult.url, { waitUntil: 'networkidle', timeout: 30000 });

      testResult.loadTime = Date.now() - startTime;
      console.log(`⏱️  页面加载时间: ${testResult.loadTime}ms`);

      // 等待页面稳定
      await this.page.waitForTimeout(2000);

      // 截图
      const screenshotPath = `/tmp/centers-test-${pagePath.replace(/\//g, '-')}.png`;
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      testResult.screenshots.push(screenshotPath);
      console.log(`📸 截图已保存: ${screenshotPath}`);

      // 检查页面是否正常加载
      const pageTitle = await this.page.title();
      console.log(`📄 页面标题: ${pageTitle}`);

      // 检测错误页面
      const pageContent = await this.page.content();
      if (pageContent.includes('404') || pageContent.includes('页面不存在') ||
          pageContent.includes('Page Not Found')) {
        testResult.errors.push('页面返回404错误');
        console.log('❌ 页面返回404错误');
      }

      // 统计和测试按钮
      await this.testButtons(testResult);

      // 统计表单
      await this.countForms(testResult);

      // 统计表格
      await this.countTables(testResult);

      // 检查是否有JavaScript错误
      const jsErrors = this.testResults.consoleErrors.filter(
        error => error.url === testResult.url
      );
      testResult.errors.push(...jsErrors.map(err => err.message));

      testResult.success = testResult.errors.length === 0;

      if (testResult.success) {
        console.log(`✅ 页面测试通过: ${testResult.buttonCount} 个按钮, ${testResult.formCount} 个表单, ${testResult.tableCount} 个表格`);
      } else {
        console.log(`❌ 页面测试失败: ${testResult.errors.length} 个错误`);
      }

    } catch (error) {
      testResult.errors.push(`访问页面失败: ${error.message}`);
      console.log(`❌ 访问页面失败: ${error.message}`);
    }

    return testResult;
  }

  // 测试按钮功能
  async testButtons(testResult) {
    try {
      // 查找所有按钮
      const buttons = await this.page.$$('[role="button"], .el-button, button');
      testResult.buttonCount = buttons.length;

      console.log(`🔘 发现 ${testResult.buttonCount} 个按钮`);

      // 测试前几个按钮的点击功能
      const buttonsToTest = Math.min(5, buttons.length);

      for (let i = 0; i < buttonsToTest; i++) {
        try {
          const button = buttons[i];

          // 检查按钮是否可见和可点击
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();

          if (isVisible && isEnabled) {
            // 获取按钮文本
            const buttonText = await button.textContent();

            // 记录按钮信息
            const buttonTest = {
              index: i,
              text: buttonText?.trim() || `按钮${i + 1}`,
              visible: isVisible,
              enabled: isEnabled,
              clicked: false,
              result: ''
            };

            // 尝试点击按钮（排除危险按钮）
            if (!buttonText || !buttonText.includes('删除') && !buttonText.includes('danger')) {
              try {
                await button.click();
                buttonTest.clicked = true;
                buttonTest.result = '点击成功';

                // 等待可能的响应
                await this.page.waitForTimeout(1000);

                // 如果有弹窗，关闭它
                const dialogVisible = await this.page.isVisible('.el-dialog, .el-message-box');
                if (dialogVisible) {
                  const closeButton = await this.page.$('.el-dialog__close, .el-message-box__close');
                  if (closeButton) {
                    await closeButton.click();
                    await this.page.waitForTimeout(500);
                  }
                }

              } catch (clickError) {
                buttonTest.result = `点击失败: ${clickError.message}`;
              }
            } else {
              buttonTest.result = '跳过危险按钮';
            }

            testResult.buttonTests.push(buttonTest);
            this.testResults.buttonTests.push(buttonTest);

            console.log(`   🔘 ${buttonTest.text}: ${buttonTest.result}`);
          }
        } catch (buttonError) {
          console.log(`   ❌ 测试按钮 ${i + 1} 失败: ${buttonError.message}`);
        }
      }

    } catch (error) {
      console.log(`❌ 测试按钮功能失败: ${error.message}`);
      testResult.errors.push(`按钮测试失败: ${error.message}`);
    }
  }

  // 统计表单
  async countForms(testResult) {
    try {
      const forms = await this.page.$$('form, .el-form');
      testResult.formCount = forms.length;
      console.log(`📝 发现 ${testResult.formCount} 个表单`);
    } catch (error) {
      console.log(`❌ 统计表单失败: ${error.message}`);
    }
  }

  // 统计表格
  async countTables(testResult) {
    try {
      const tables = await this.page.$$('table, .el-table');
      testResult.tableCount = tables.length;
      console.log(`📊 发现 ${testResult.tableCount} 个表格`);
    } catch (error) {
      console.log(`❌ 统计表格失败: ${error.message}`);
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🎯 开始Centers页面自动化测试...\n');

    try {
      // 启动浏览器
      await this.launchBrowser();

      // 尝试登录
      await this.login();

      // 测试每个页面
      for (const pagePath of this.centersPages) {
        const result = await this.testPage(pagePath);
        this.testResults.pages.push(result);

        // 更新统计
        this.testResults.summary.totalTests++;
        if (result.success) {
          this.testResults.summary.passed++;
        } else {
          this.testResults.summary.failed++;
        }
      }

      // 生成测试报告
      await this.generateReport();

      console.log('\n🎉 所有测试完成！');

    } catch (error) {
      console.log('❌ 测试运行失败:', error.message);
    } finally {
      // 关闭浏览器
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 浏览器已关闭');
      }
    }

    return this.testResults;
  }

  // 生成测试报告
  async generateReport() {
    const report = {
      testTime: new Date().toISOString(),
      summary: this.testResults.summary,
      consoleErrors: this.testResults.consoleErrors,
      networkErrors: this.testResults.networkErrors,
      buttonTests: this.testResults.buttonTests,
      pages: this.testResults.pages.map(page => ({
        path: page.path,
        url: page.url,
        success: page.success,
        loadTime: page.loadTime,
        buttonCount: page.buttonCount,
        formCount: page.formCount,
        tableCount: page.tableCount,
        errors: page.errors,
        buttonTests: page.buttonTests
      }))
    };

    // 保存JSON报告
    const jsonReportPath = '/home/zhgue/kyyupgame/k.yyup.com/centers-playwright-test-report.json';
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // 生成Markdown报告
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = '/home/zhgue/kyyupgame/k.yyup.com/centers-playwright-test-report.md';
    fs.writeFileSync(markdownPath, markdownReport);

    console.log('\n📊 测试报告已生成:');
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   Markdown: ${markdownPath}`);

    this.printSummary(report);
  }

  // 生成Markdown报告
  generateMarkdownReport(report) {
    const { summary, pages } = report;

    let markdown = `# Centers页面自动化测试报告\n\n`;
    markdown += `**测试时间**: ${report.testTime}\n\n`;

    markdown += `## 📊 测试概览\n\n`;
    markdown += `- **总测试数**: ${summary.totalTests}\n`;
    markdown += `- **通过**: ${summary.passed}\n`;
    markdown += `- **失败**: ${summary.failed}\n`;
    markdown += `- **成功率**: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%\n\n`;

    markdown += `## 📋 页面测试结果\n\n`;
    markdown += `| 页面路径 | 状态 | 加载时间(ms) | 按钮数 | 表单数 | 表格数 | 错误数 |\n`;
    markdown += `|---------|------|-------------|--------|--------|--------|--------|\n`;

    pages.forEach(page => {
      const status = page.success ? '✅ 通过' : '❌ 失败';
      markdown += `| ${page.path} | ${status} | ${page.loadTime} | ${page.buttonCount} | ${page.formCount} | ${page.tableCount} | ${page.errors.length} |\n`;
    });

    markdown += `\n## 🚨 错误详情\n\n`;

    if (report.consoleErrors.length > 0) {
      markdown += `### 控制台错误\n\n`;
      report.consoleErrors.forEach((error, index) => {
        markdown += `${index + 1}. **URL**: ${error.url}\n`;
        markdown += `   **错误**: ${error.message}\n\n`;
      });
    }

    if (report.networkErrors.length > 0) {
      markdown += `### 网络请求错误\n\n`;
      report.networkErrors.forEach((error, index) => {
        markdown += `${index + 1}. **URL**: ${error.url}\n`;
        markdown += `   **失败原因**: ${error.failure.errorText}\n\n`;
      });
    }

    markdown += `\n## 🔘 按钮测试结果\n\n`;
    markdown += `| 页面 | 按钮文本 | 测试结果 |\n`;
    markdown += `|------|----------|----------|\n`;

    report.buttonTests.forEach(buttonTest => {
      const pageName = pages.find(p => p.buttonTests.includes(buttonTest))?.path || 'Unknown';
      markdown += `| ${pageName} | ${buttonTest.text} | ${buttonTest.result} |\n`;
    });

    return markdown;
  }

  // 打印测试摘要
  printSummary(report) {
    console.log('\n📈 测试结果摘要:');
    console.log('================================');
    console.log(`总测试数: ${report.summary.totalTests}`);
    console.log(`通过: ${report.summary.passed}`);
    console.log(`失败: ${report.summary.failed}`);
    console.log(`成功率: ${((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)}%`);

    const failedPages = report.pages.filter(p => !p.success);
    if (failedPages.length > 0) {
      console.log('\n❌ 失败的页面:');
      failedPages.forEach(page => {
        console.log(`   - ${page.path}: ${page.errors.join(', ')}`);
      });
    }

    const slowPages = report.pages.filter(p => p.loadTime > 5000);
    if (slowPages.length > 0) {
      console.log('\n⚠️  加载缓慢的页面 (>5s):');
      slowPages.forEach(page => {
        console.log(`   - ${page.path}: ${page.loadTime}ms`);
      });
    }

    if (report.consoleErrors.length > 0) {
      console.log(`\n❌ 控制台错误: ${report.consoleErrors.length} 个`);
    }

    if (report.networkErrors.length > 0) {
      console.log(`\n❌ 网络请求错误: ${report.networkErrors.length} 个`);
    }
  }
}

// 运行测试
async function main() {
  const tester = new CentersPageTester();
  const results = await tester.runAllTests();
  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CentersPageTester };