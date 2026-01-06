#!/usr/bin/env node

/**
 * Admin角色真实交互元素深度功能测试脚本
 *
 * 功能：
 * 1. 自动发现页面上的实际交互元素
 * 2. 测试真实存在的按钮、链接、表单等
 * 3. 验证交互功能完整性
 * 4. 检测实际的API调用和数据响应
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Admin角色核心页面配置
const REAL_ELEMENTS_TEST_PAGES = [
  { id: 'dashboard', title: '数据概览', route: '/dashboard', category: '管理控制台' },
  { id: 'todo', title: '待办事项', route: '/todo', category: '管理控制台' },
  { id: 'personnel', title: '人员中心', route: '/centers/PersonnelCenter', category: '园所管理' },
  { id: 'enrollment', title: '招生中心', route: '/centers/EnrollmentCenter', category: '业务管理' },
  { id: 'customer-pool', title: '客户池中心', route: '/centers/CustomerPoolCenter', category: '业务管理' },
  { id: 'marketing', title: '营销中心', route: '/centers/MarketingCenter', category: '业务管理' },
  { id: 'performance', title: '绩效中心', route: '/centers/PerformanceRewards', category: '营销管理' },
  { id: 'system', title: '系统中心', route: '/centers/SystemCenter', category: '系统管理' },
  { id: 'ai', title: '智能中心', route: '/centers/AICenter', category: 'AI智能' }
];

class RealElementsTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.startTime = Date.now();
    this.setupOutputDirectory();
  }

  setupOutputDirectory() {
    const outputDir = path.join(__dirname, 'admin-real-elements-test-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const subdirs = ['screenshots', 'reports'];
    subdirs.forEach(dir => {
      const fullPath = path.join(outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async init() {
    console.log('🚀 初始化Admin角色真实交互元素深度测试...');

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

    // 监听网络请求
    this.page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`📡 API请求: ${request.method()} ${request.url()}`);
      }
    });

    this.page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`📡 API响应: ${response.status()} ${response.url()}`);
      }
    });

    // 监听控制台输出
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('❌ 浏览器控制台错误:', msg.text());
      }
    });

    // 监听页面错误
    this.page.on('pageerror', (error) => {
      console.error('💥 页面错误:', error.message);
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

      console.log('✅ Admin登录成功');
      return true;
    } catch (error) {
      console.error('❌ Admin登录失败:', error.message);
      return false;
    }
  }

  async discoverElements(pageConfig) {
    console.log(`🔍 发现页面交互元素: ${pageConfig.title}`);

    const discoveredElements = {
      buttons: [],
      links: [],
      inputs: [],
      selects: [],
      tables: [],
      cards: [],
      clickableElements: [],
      forms: []
    };

    try {
      // 等待页面加载完成
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(2000);

      // 发现按钮
      const buttons = await this.page.$$eval('button, [role="button"], .btn, .button, input[type="button"]',
        elements => elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.trim(),
          id: el.id,
          disabled: el.disabled,
          visible: el.offsetParent !== null
        }))
      );

      // 发现链接
      const links = await this.page.$$eval('a[href]',
        elements => elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.trim(),
          href: el.href,
          id: el.id,
          visible: el.offsetParent !== null
        }))
      );

      // 发现输入字段
      const inputs = await this.page.$$eval('input, textarea',
        elements => elements.map(el => ({
          tagName: el.tagName,
          type: el.type,
          className: el.className,
          name: el.name,
          placeholder: el.placeholder,
          id: el.id,
          visible: el.offsetParent !== null
        }))
      );

      // 发现选择框
      const selects = await this.page.$$eval('select',
        elements => elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          name: el.name,
          id: el.id,
          visible: el.offsetParent !== null
        }))
      );

      // 发现表格
      const tables = await this.page.$$eval('table',
        elements => elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          rowCount: el.rows?.length || 0,
          id: el.id,
          visible: el.offsetParent !== null
        }))
      );

      // 发现卡片元素
      const cards = await this.page.$$eval('.card, .el-card, .panel, .box',
        elements => elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.substring(0, 100) + '...',
          id: el.id,
          visible: el.offsetParent !== null
        }))
      );

      // 发现可点击元素（通用）
      const clickableElements = await this.page.$$eval('[onclick], [data-click], .clickable, .pointer',
        elements => elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.trim(),
          id: el.id,
          visible: el.offsetParent !== null
        }))
      );

      // 发现表单
      const forms = await this.page.$$eval('form',
        elements => elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          action: el.action,
          method: el.method,
          id: el.id,
          visible: el.offsetParent !== null
        }))
      );

      // 过滤可见元素
      discoveredElements.buttons = buttons.filter(btn => btn.visible);
      discoveredElements.links = links.filter(link => link.visible);
      discoveredElements.inputs = inputs.filter(input => input.visible);
      discoveredElements.selects = selects.filter(select => select.visible);
      discoveredElements.tables = tables.filter(table => table.visible);
      discoveredElements.cards = cards.filter(card => card.visible);
      discoveredElements.clickableElements = clickableElements.filter(el => el.visible);
      discoveredElements.forms = forms.filter(form => form.visible);

      console.log(`   - 按钮: ${discoveredElements.buttons.length}`);
      console.log(`   - 链接: ${discoveredElements.links.length}`);
      console.log(`   - 输入: ${discoveredElements.inputs.length}`);
      console.log(`   - 选择框: ${discoveredElements.selects.length}`);
      console.log(`   - 表格: ${discoveredElements.tables.length}`);
      console.log(`   - 卡片: ${discoveredElements.cards.length}`);
      console.log(`   - 可点击元素: ${discoveredElements.clickableElements.length}`);
      console.log(`   - 表单: ${discoveredElements.forms.length}`);

    } catch (error) {
      console.error(`❌ 发现元素失败: ${error.message}`);
    }

    return discoveredElements;
  }

  async testButtons(buttons, pageContext) {
    const results = [];

    for (let i = 0; i < Math.min(buttons.length, 5); i++) { // 最多测试5个按钮
      const button = buttons[i];
      const result = {
        type: 'button',
        element: button,
        status: 'passed',
        errors: [],
        warnings: []
      };

      try {
        // 查找按钮元素
        const selector = this.generateSelector(button);
        const element = await this.page.$(selector);

        if (!element) {
          result.status = 'warning';
          result.warnings.push('按钮元素未找到');
          results.push(result);
          continue;
        }

        // 检查按钮状态
        const isVisible = await element.isVisible();
        const isEnabled = await element.isEnabled();

        if (!isVisible) {
          result.warnings.push('按钮不可见');
        }

        if (!isEnabled) {
          result.warnings.push('按钮不可点击');
          results.push(result);
          continue;
        }

        // 记录点击前的状态
        const currentUrl = this.page.url();

        // 点击按钮
        await element.click();
        await this.page.waitForTimeout(2000);

        // 检查是否有错误弹窗
        const errorElements = await this.page.$$('.error-message, .error-toast, .el-message--error');
        if (errorElements.length > 0) {
          for (const errorEl of errorElements) {
            const errorText = await errorEl.textContent();
            if (errorText && errorText.trim()) {
              result.errors.push(`点击后出现错误: ${errorText.trim()}`);
            }
          }
        }

        // 检查页面是否发生变化
        const newUrl = this.page.url();
        if (newUrl !== currentUrl) {
          result.navigation = {
            from: currentUrl,
            to: newUrl
          };
        }

        if (result.errors.length > 0) {
          result.status = 'failed';
        }

        // 尝试返回原页面（如果有导航）
        if (newUrl !== currentUrl) {
          await this.page.goto(currentUrl);
          await this.page.waitForTimeout(1000);
        }

      } catch (error) {
        result.status = 'failed';
        result.errors.push(`按钮测试异常: ${error.message}`);
      }

      results.push(result);
    }

    return results;
  }

  async testLinks(links, pageContext) {
    const results = [];

    for (let i = 0; i < Math.min(links.length, 3); i++) { // 最多测试3个链接
      const link = links[i];
      const result = {
        type: 'link',
        element: link,
        status: 'passed',
        errors: [],
        warnings: []
      };

      try {
        // 查找链接元素
        const selector = this.generateSelector(link);
        const element = await this.page.$(selector);

        if (!element) {
          result.status = 'warning';
          result.warnings.push('链接元素未找到');
          results.push(result);
          continue;
        }

        // 检查链接状态
        const isVisible = await element.isVisible();
        const href = await element.getAttribute('href');

        if (!isVisible) {
          result.warnings.push('链接不可见');
        }

        if (!href) {
          result.warnings.push('链接没有href属性');
          results.push(result);
          continue;
        }

        // 记录点击前的状态
        const currentUrl = this.page.url();

        // 点击链接
        await element.click();
        await this.page.waitForTimeout(2000);

        // 检查页面是否正常加载
        const newUrl = this.page.url();
        const pageTitle = await this.page.title();

        result.navigation = {
          from: currentUrl,
          to: newUrl,
          title: pageTitle
        };

        // 检查是否是404页面
        if (pageTitle.includes('404') || newUrl.includes('404')) {
          result.status = 'failed';
          result.errors.push('链接跳转到404页面');
        }

        // 返回原页面
        await this.page.goto(currentUrl);
        await this.page.waitForTimeout(1000);

      } catch (error) {
        result.status = 'failed';
        result.errors.push(`链接测试异常: ${error.message}`);
      }

      results.push(result);
    }

    return results;
  }

  async testInputs(inputs, pageContext) {
    const results = [];

    for (let i = 0; i < Math.min(inputs.length, 3); i++) { // 最多测试3个输入框
      const input = inputs[i];
      const result = {
        type: 'input',
        element: input,
        status: 'passed',
        errors: [],
        warnings: []
      };

      try {
        // 查找输入框元素
        const selector = this.generateSelector(input);
        const element = await this.page.$(selector);

        if (!element) {
          result.status = 'warning';
          result.warnings.push('输入框元素未找到');
          results.push(result);
          continue;
        }

        // 检查输入框状态
        const isVisible = await element.isVisible();
        const isEnabled = await element.isEnabled();
        const inputType = await element.getAttribute('type');

        if (!isVisible) {
          result.warnings.push('输入框不可见');
          results.push(result);
          continue;
        }

        if (!isEnabled) {
          result.warnings.push('输入框不可用');
          results.push(result);
          continue;
        }

        // 测试输入功能
        if (inputType !== 'file' && inputType !== 'password') {
          const testValue = '测试数据' + Date.now();
          await element.fill(testValue);
          await this.page.waitForTimeout(500);

          // 验证输入值
          const actualValue = await element.inputValue();
          if (actualValue !== testValue) {
            result.warnings.push(`输入值不匹配: 期望"${testValue}", 实际"${actualValue}"`);
          }

          // 清空输入
          await element.fill('');
        }

        result.data = {
          type: inputType,
          testInput: true
        };

      } catch (error) {
        result.status = 'failed';
        result.errors.push(`输入框测试异常: ${error.message}`);
      }

      results.push(result);
    }

    return results;
  }

  async testTables(tables, pageContext) {
    const results = [];

    for (const table of tables.slice(0, 2)) { // 最多测试2个表格
      const result = {
        type: 'table',
        element: table,
        status: 'passed',
        errors: [],
        warnings: []
      };

      try {
        // 查找表格元素
        const selector = this.generateSelector(table);
        const element = await this.page.$(selector);

        if (!element) {
          result.status = 'warning';
          result.warnings.push('表格元素未找到');
          results.push(result);
          continue;
        }

        // 检查表格内容
        const isVisible = await element.isVisible();
        if (!isVisible) {
          result.warnings.push('表格不可见');
          results.push(result);
          continue;
        }

        // 获取表格行数
        const rows = await element.$$('tr');
        const rowCount = rows.length;

        if (rowCount <= 1) { // 只有表头或空表格
          result.warnings.push('表格数据为空或只有表头');
        }

        result.data = {
          rowCount: rowCount,
          hasData: rowCount > 1
        };

      } catch (error) {
        result.status = 'failed';
        result.errors.push(`表格测试异常: ${error.message}`);
      }

      results.push(result);
    }

    return results;
  }

  generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }

    if (element.tagName) {
      return element.tagName.toLowerCase();
    }

    return '*';
  }

  async testPageRealElements(pageConfig) {
    const startTime = Date.now();
    const result = {
      pageId: pageConfig.id,
      pageTitle: pageConfig.title,
      route: pageConfig.route,
      category: pageConfig.category,
      status: 'passed',
      errors: [],
      warnings: [],
      httpStatus: 200,
      discoveredElements: {},
      testResults: [],
      loadTime: 0
    };

    try {
      console.log(`🔍 深度测试页面: ${pageConfig.title} (${pageConfig.route})`);

      // 导航到目标页面
      const response = await this.page.goto(`http://localhost:5173${pageConfig.route}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response) {
        throw new Error('页面响应为空');
      }

      result.httpStatus = response.status();

      // 等待页面加载完成
      await this.page.waitForLoadState('domcontentloaded');

      // 发现页面元素
      const discoveredElements = await this.discoverElements(pageConfig);
      result.discoveredElements = discoveredElements;

      // 测试按钮
      if (discoveredElements.buttons.length > 0) {
        const buttonResults = await this.testButtons(discoveredElements.buttons, pageConfig);
        result.testResults.push(...buttonResults);
      }

      // 测试链接
      if (discoveredElements.links.length > 0) {
        const linkResults = await this.testLinks(discoveredElements.links, pageConfig);
        result.testResults.push(...linkResults);
      }

      // 测试输入框
      if (discoveredElements.inputs.length > 0) {
        const inputResults = await this.testInputs(discoveredElements.inputs, pageConfig);
        result.testResults.push(...inputResults);
      }

      // 测试表格
      if (discoveredElements.tables.length > 0) {
        const tableResults = await this.testTables(discoveredElements.tables, pageConfig);
        result.testResults.push(...tableResults);
      }

      // 统计测试结果
      const failedTests = result.testResults.filter(r => r.status === 'failed');
      const warningTests = result.testResults.filter(r => r.status === 'warning');

      if (failedTests.length > 0) {
        result.status = 'failed';
        result.errors.push(...failedTests.flatMap(f => f.errors));
      }

      if (warningTests.length > 0) {
        result.warnings.push(...warningTests.flatMap(w => w.warnings));
      }

      result.loadTime = Date.now() - startTime;

      // 输出页面测试摘要
      const totalElements = Object.values(discoveredElements).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      console.log(`   - 发现元素: ${totalElements} 个`);
      console.log(`   - 测试交互: ${result.testResults.length} 个`);
      console.log(`   - 状态: ${result.status} (${failedTests.length} 失败, ${warningTests.length} 警告)`);

    } catch (error) {
      result.status = 'error';
      result.errors.push(`页面深度测试异常: ${error.message}`);
      console.error(`❌ 页面 ${pageConfig.title} 深度测试失败:`, error);
    }

    return result;
  }

  async runAllRealElementsTests() {
    console.log(`📋 开始真实交互元素深度测试 ${REAL_ELEMENTS_TEST_PAGES.length} 个页面...`);

    const loginSuccess = await this.loginAsAdmin();
    if (!loginSuccess) {
      throw new Error('Admin登录失败，无法继续测试');
    }

    // 测试所有页面
    for (const pageConfig of REAL_ELEMENTS_TEST_PAGES) {
      const result = await this.testPageRealElements(pageConfig);
      this.results.push(result);

      // 添加延迟避免过快请求
      await this.page.waitForTimeout(3000);
    }

    console.log('✅ 所有页面真实元素深度测试完成');
  }

  generateReport() {
    const summary = {
      totalPages: this.results.length,
      passedPages: this.results.filter(r => r.status === 'passed').length,
      failedPages: this.results.filter(r => r.status === 'failed').length,
      errorPages: this.results.filter(r => r.status === 'error').length,
      totalDiscoveredElements: 0,
      totalTestedElements: 0,
      passedTests: 0,
      failedTests: 0,
      warningTests: 0,
      totalErrors: this.results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: this.results.reduce((sum, r) => sum + r.warnings.length, 0),
      executionTime: Date.now() - this.startTime
    };

    // 统计发现的元素和测试结果
    this.results.forEach(result => {
      summary.totalDiscoveredElements += Object.values(result.discoveredElements)
        .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      summary.totalTestedElements += result.testResults.length;

      result.testResults.forEach(test => {
        if (test.status === 'passed') summary.passedTests++;
        else if (test.status === 'failed') summary.failedTests++;
        else if (test.status === 'warning') summary.warningTests++;
      });
    });

    const recommendations = [];

    // 生成建议
    if (summary.failedPages > 0) {
      recommendations.push(`${summary.failedPages} 个页面存在功能错误，需要检查交互逻辑`);
    }

    if (summary.totalErrors > 0) {
      recommendations.push(`发现 ${summary.totalErrors} 个功能错误，需要优先修复`);
    }

    if (summary.totalWarnings > 0) {
      recommendations.push(`发现 ${summary.totalWarnings} 个警告，建议优化用户体验`);
    }

    if (summary.failedTests > 0) {
      recommendations.push(`${summary.failedTests} 个交互元素测试失败，需要检查组件实现`);
    }

    if (summary.totalTestedElements === 0) {
      recommendations.push('没有发现可测试的交互元素，可能需要检查页面实现');
    }

    return {
      summary,
      results: this.results,
      recommendations
    };
  }

  async saveReport(report) {
    const outputDir = path.join(__dirname, 'admin-real-elements-test-results', 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // 保存详细报告JSON
    const jsonReportPath = path.join(outputDir, `admin-real-elements-test-report-${timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // 保存简化报告MD
    const mdReportPath = path.join(outputDir, `admin-real-elements-test-report-${timestamp}.md`);
    const mdContent = this.generateMarkdownReport(report);
    fs.writeFileSync(mdReportPath, mdContent);

    console.log(`📊 真实元素测试报告已保存:`);
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   MD: ${mdReportPath}`);

    // 输出简要结果
    console.log('\n' + '='.repeat(70));
    console.log('🎯 Admin角色真实交互元素深度测试完成');
    console.log('='.repeat(70));
    console.log(`📊 总页面: ${report.summary.totalPages}`);
    console.log(`✅ 通过: ${report.summary.passedPages}`);
    console.log(`❌ 失败: ${report.summary.failedPages}`);
    console.log(`💥 错误: ${report.summary.errorPages}`);
    console.log(`🔍 发现元素: ${report.summary.totalDiscoveredElements}`);
    console.log(`🧪 测试元素: ${report.summary.totalTestedElements}`);
    console.log(`✅ 通过测试: ${report.summary.passedTests}`);
    console.log(`❌ 失败测试: ${report.summary.failedTests}`);
    console.log(`⚠️  警告测试: ${report.summary.warningTests}`);
    console.log(`⚠️  总警告: ${report.summary.totalWarnings}`);
    console.log(`⏱️  耗时: ${(report.summary.executionTime / 1000).toFixed(2)}秒`);

    if (report.summary.failedPages > 0 || report.summary.totalErrors > 0 || report.summary.failedTests > 0) {
      console.log('\n❌ 发现功能问题，请查看详细报告');

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
      console.log('\n✅ 所有真实元素功能测试通过！第三组覆盖测试完成！');
      process.exit(0);
    }
  }

  generateMarkdownReport(report) {
    const { summary, results, recommendations } = report;

    let content = `# Admin角色真实交互元素深度测试报告\n\n`;
    content += `生成时间: ${new Date().toLocaleString()}\n`;

    // 测试概要
    content += `\n## 📊 测试概要\n\n`;
    content += `- **总页面数**: ${summary.totalPages}\n`;
    content += `- **通过页面**: ${summary.passedPages}\n`;
    content += `- **失败页面**: ${summary.failedPages}\n`;
    content += `- **错误页面**: ${summary.errorPages}\n`;
    content += `- **发现元素总数**: ${summary.totalDiscoveredElements}\n`;
    content += `- **测试元素总数**: ${summary.totalTestedElements}\n`;
    content += `- **通过测试**: ${summary.passedTests}\n`;
    content += `- **失败测试**: ${summary.failedTests}\n`;
    content += `- **警告测试**: ${summary.warningTests}\n`;
    content += `- **总错误数**: ${summary.totalErrors}\n`;
    content += `- **总警告数**: ${summary.totalWarnings}\n`;
    content += `- **执行时间**: ${(summary.executionTime / 1000).toFixed(2)}秒\n\n`;

    // 元素发现统计
    content += `## 🔍 发现的元素统计\n\n`;
    results.forEach(result => {
      content += `### ${result.pageTitle}\n`;
      const elements = result.discoveredElements;
      Object.entries(elements).forEach(([type, arr]) => {
        if (Array.isArray(arr) && arr.length > 0) {
          content += `- ${type}: ${arr.length} 个\n`;
        }
      });
      content += `\n`;
    });

    // 详细结果
    content += `## 📋 详细测试结果\n\n`;

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
        content += `- **发现元素**: ${summary.totalDiscoveredElements} 个\n`;
        content += `- **测试元素**: ${result.testResults.length} 个\n`;

        if (result.errors.length > 0) {
          content += `- **页面错误**:\n`;
          result.errors.forEach(error => {
            content += `  - ${error}\n`;
          });
        }

        const failedTests = result.testResults.filter(t => t.status === 'failed');
        if (failedTests.length > 0) {
          content += `- **失败的测试**:\n`;
          failedTests.forEach(test => {
            content += `  - ${test.type}: ${test.element.textContent || test.element.id || test.element.className}\n`;
            test.errors.forEach(error => {
              content += `    * ${error}\n`;
            });
          });
        }

        content += `\n`;
      });
    }

    if (passedPages.length > 0) {
      content += `### ✅ 通过的页面 (${passedPages.length})\n\n`;
      passedPages.forEach(result => {
        const totalElements = Object.values(result.discoveredElements)
          .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
        content += `- **${result.pageTitle}** (${result.route}) - ${totalElements} 个元素, ${result.testResults.length} 个测试\n`;
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
  const tester = new RealElementsTester();

  try {
    await tester.init();
    await tester.runAllRealElementsTests();
    const report = tester.generateReport();
    await tester.saveReport(report);
  } catch (error) {
    console.error('💥 真实元素测试执行失败:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RealElementsTester, REAL_ELEMENTS_TEST_PAGES };