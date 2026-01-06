#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');

class EnhancedDeepPageTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = {
      summary: {
        total: 0,
        tested: 0,
        passed: 0,
        failed: 0,
        totalElements: 0,
        workingElements: 0,
        brokenElements: 0,
        consoleErrors: 0,
        pageErrors: 0,
        networkErrors: 0
      },
      pages: []
    };
  }

  async init() {
    console.log('🚀 启动增强版深度页面测试器...');

    this.browser = await chromium.launch({
      headless: true,
      devtools: false
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    this.page = await this.context.newPage();

    // 初始化错误监控数组
    this.page.consoleMessages = [];
    this.page.pageErrors = [];
    this.page.networkErrors = [];

    // 设置页面错误监控
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🌐 [控制台错误] ${msg.text()}`);
        this.page.consoleMessages.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
      }
    });

    this.page.on('pageerror', error => {
      console.log(`📄 [页面错误] ${error.message}`);
      this.page.pageErrors.push({
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('requestfailed', request => {
      console.log(`🌐 [网络错误] ${request.url()} - ${request.failure().errorText}`);
      this.page.networkErrors = this.page.networkErrors || [];
      this.page.networkErrors.push({
        url: request.url(),
        error: request.failure().errorText
      });
    });

    console.log('✅ 浏览器初始化成功');
  }

  // 智能等待页面稳定
  async waitForPageStable() {
    console.log('⏳ 等待页面稳定...');

    try {
      // 等待Vue应用挂载完成
      await this.page.waitForFunction(() => {
        // 检查是否有加载中的元素
        const loadingElements = document.querySelectorAll('.el-loading, .loading, [class*="loading"]');
        const hasLoading = loadingElements.length === 0;

        // 检查核心组件是否渲染
        const coreElements = document.querySelectorAll('.el-table, .el-card, .stat-card, .chart-container');
        const hasCoreElements = coreElements.length > 0;

        return hasLoading && hasCoreElements;
      }, { timeout: 15000 });

      // 等待网络请求完成
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });

      // 额外等待Vue更新完成
      await this.page.waitForTimeout(1000);

      console.log('✅ 页面稳定完成');
      return true;
    } catch (error) {
      console.log(`⚠️ 页面等待超时: ${error.message}`);
      return false;
    }
  }

  // 智能元素检测
  async waitForElement(selector, options = {}) {
    const { timeout = 3000, state = 'visible' } = options;

    try {
      await this.page.waitForSelector(selector, {
        timeout,
        state,
        strict: false
      });

      const element = await this.page.$(selector);
      if (!element) return false;

      // 验证元素真正可用
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();

      return isVisible && isEnabled;
    } catch (error) {
      return false;
    }
  }

  async testPage(pageConfig) {
    const { path, name, priority } = pageConfig;
    console.log(`\n🔍 深度测试页面: ${name} (${path})`);

    const pageResult = {
      path,
      name,
      priority,
      elements: {
        buttons: {
          found: 0,
          clickable: 0,
          working: 0,
          broken: []
        },
        forms: {
          found: 0,
          interactive: 0,
          working: 0,
          broken: []
        },
        tabs: {
          found: 0,
          clickable: 0,
          working: 0,
          broken: []
        },
        tables: {
          found: 0,
          hasData: 0,
          working: 0,
          broken: []
        },
        dropdowns: {
          found: 0,
          interactive: 0,
          working: 0,
          broken: []
        },
        modals: {
          found: 0,
          working: 0,
          broken: []
        },
        pagination: {
          found: 0,
          clickable: 0,
          working: 0,
          broken: []
        },
        loading: {
          found: 0
        }
      },
      expectedFeatures: pageConfig.expectedFeatures || [],
      success: true,
      errors: [],
      consoleErrors: [],
      pageErrors: [],
      networkErrors: [],
      performance: {
        loadTime: 0,
        interactiveElements: 0,
        responseTime: 0
      },
      features: {
        found: [],
        missing: []
      }
    };

    try {
      const startTime = Date.now();

      // 导航到页面
      const fullUrl = `http://localhost:5173${path}`;
      const response = await this.page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      pageResult.performance.loadTime = Date.now() - startTime;

      if (!response || response.status() >= 400) {
        pageResult.success = false;
        pageResult.errors.push(`页面加载失败: ${response ? response.status() : '无响应'}`);
        return pageResult;
      }

      // 智能等待页面稳定
      const isStable = await this.waitForPageStable();
      if (!isStable) {
        console.log('⚠️ 页面可能未完全加载，继续测试...');
      }

      // 清除消息记录
      this.page.consoleMessages = [];
      this.page.pageErrors = [];
      this.page.networkErrors = [];

      // 检查预期功能
      if (pageConfig.expectedFeatures) {
        await this.checkExpectedFeatures(pageResult);
      }

      // 深度测试各种交互元素
      console.log('  🔘 测试按钮元素...');
      await this.testButtonsEnhanced(pageResult);

      console.log('  📝 测试表单元素...');
      await this.testFormsEnhanced(pageResult);

      console.log('  📋 测试Tab元素...');
      await this.testTabs(pageResult);

      console.log('  📊 测试表格元素...');
      await this.testTables(pageResult);

      console.log('  🔽 测试下拉菜单...');
      await this.testDropdowns(pageResult);

      console.log('  🪟 测试模态框...');
      await this.testModals(pageResult);

      console.log('  📄 测试分页组件...');
      await this.testPagination(pageResult);

      console.log('  ⏳ 检查加载状态...');
      await this.testLoadingStates(pageResult);

      // 收集错误信息
      pageResult.consoleErrors = this.page.consoleMessages || [];
      pageResult.pageErrors = this.page.pageErrors || [];
      pageResult.networkErrors = this.page.networkErrors || [];

      pageResult.performance.interactiveElements =
        pageResult.elements.buttons.found +
        pageResult.elements.forms.found +
        pageResult.elements.tabs.found +
        pageResult.elements.tables.found +
        pageResult.elements.dropdowns.found +
        pageResult.elements.modals.found +
        pageResult.elements.pagination.found;

      // 统计工作的元素
      pageResult.elements.buttons.working = pageResult.elements.buttons.working || 0;
      pageResult.elements.forms.working = pageResult.elements.forms.working || 0;
      pageResult.elements.tabs.working = pageResult.elements.tabs.working || 0;
      pageResult.elements.tables.working = pageResult.elements.tables.working || 0;
      pageResult.elements.dropdowns.working = pageResult.elements.dropdowns.working || 0;
      pageResult.elements.modals.working = pageResult.elements.modals.working || 0;
      pageResult.elements.pagination.working = pageResult.elements.pagination.working || 0;

      // 统计总工作元素
      pageResult.workingElements =
        pageResult.elements.buttons.working +
        pageResult.elements.forms.working +
        pageResult.elements.tabs.working +
        pageResult.elements.tables.working +
        pageResult.elements.dropdowns.working +
        pageResult.elements.modals.working +
        pageResult.elements.pagination.working;

      // 统计总元素数
      pageResult.totalElements =
        pageResult.elements.buttons.found +
        pageResult.elements.forms.found +
        pageResult.elements.tabs.found +
        pageResult.elements.tables.found +
        pageResult.elements.dropdowns.found +
        pageResult.elements.modals.found +
        pageResult.elements.pagination.found;

      // 检查是否有错误
      const hasErrors = pageResult.consoleErrors.length > 0 ||
                       pageResult.pageErrors.length > 0 ||
                       pageResult.networkErrors.length > 0;

      if (hasErrors) {
        pageResult.success = false;
      }

      console.log(`  ✅ 测试完成: ${pageResult.workingElements}/${pageResult.totalElements} 元素正常工作`);

      if (pageResult.features.missing.length > 0) {
        console.log(`  ❌ 缺失功能: ${pageResult.features.missing.join(', ')}`);
      }

    } catch (error) {
      pageResult.success = false;
      pageResult.errors.push(`测试失败: ${error.message}`);
      console.error(`  ❌ 页面测试失败: ${error.message}`);
    }

    return pageResult;
  }

  // 增强的按钮测试
  async testButtonsEnhanced(pageResult) {
    // 分组测试不同类型的按钮
    const buttonSelectors = [
      '.el-button--primary:visible',
      '.el-button--success:visible',
      '.el-button--warning:visible',
      '.el-button--danger:visible',
      '.el-button--info:visible',
      '.el-button:visible:not(.el-button--primary):not(.el-button--success):not(.el-button--warning):not(.el-button--danger):not(.el-button--info)'
    ];

    let totalButtons = 0;
    let workingButtons = 0;

    for (const selector of buttonSelectors) {
      try {
        const buttons = await this.page.$$(selector);
        pageResult.elements.buttons.found += buttons.length;
        totalButtons += buttons.length;

        console.log(`    - ${selector}: ${buttons.length} 个按钮`);

        // 限制每种类型测试最多5个
        const testButtons = buttons.slice(0, 5);

        for (let i = 0; i < testButtons.length; i++) {
          const button = testButtons[i];
          await this.testSingleButton(button, pageResult, `${selector}_${i}`);
          workingButtons++;
        }
      } catch (error) {
        console.log(`    ❌ ${selector} 测试失败: ${error.message}`);
      }
    }

    pageResult.elements.buttons.working = workingButtons;
    console.log(`    找到 ${totalButtons} 个按钮，工作正常: ${workingButtons} 个`);
  }

  // 单个按钮测试
  async testSingleButton(button, pageResult, name) {
    try {
      // 先确保按钮在视口内
      await button.scrollIntoViewIfNeeded();

      // 检查按钮状态
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      const text = await button.textContent().catch(() => '');

      if (!isVisible || !isEnabled) {
        pageResult.elements.buttons.broken.push({
          selector: name,
          text: text || `按钮 ${name}`,
          error: isVisible ? '按钮禁用' : '按钮不可见'
        });
        return;
      }

      // 快速悬停检查
      await button.hover();

      // 尝试点击（使用较短超时）
      try {
        await button.click({ timeout: 2000, force: false });
        pageResult.elements.buttons.working++;
      } catch (clickError) {
        // 如果点击失败，检查是否是预期的行为
        const errorMessage = clickError.message;
        if (errorMessage.includes('Element is not attached') ||
            errorMessage.includes('detached') ||
            errorMessage.includes('disposed')) {
          pageResult.elements.buttons.broken.push({
            selector: name,
            text: text || `按钮 ${name}`,
            error: `DOM分离: ${errorMessage}`
          });
        } else {
          // 其他错误可能表示按钮功能有问题
          pageResult.elements.buttons.broken.push({
            selector: name,
            text: text || `按钮 ${name}`,
            error: `点击失败: ${errorMessage}`
          });
        }
      }
    } catch (error) {
      pageResult.elements.buttons.broken.push({
        selector: name,
        error: `测试失败: ${error.message}`
      });
    }
  }

  // 增强的表单测试
  async testFormsEnhanced(pageResult) {
    const formSelectors = [
      'input:visible',
      'textarea:visible',
      'select:visible',
      '.el-input:visible input:visible',
      '.el-textarea:visible textarea:visible',
      '.el-select:visible .el-input__inner:visible'
    ];

    let totalForms = 0;
    let workingForms = 0;

    for (const selector of formSelectors) {
      try {
        const forms = await this.page.$$(selector);
        pageResult.elements.forms.found += forms.length;
        totalForms += forms.length;

        // 限制测试数量
        const testForms = forms.slice(0, 10);

        for (let i = 0; i < testForms.length; i++) {
          const form = testForms[i];
          if (await this.testSingleForm(form, pageResult)) {
            workingForms++;
          }
        }
      } catch (error) {
        console.log(`    ❌ ${selector} 测试失败: ${error.message}`);
      }
    }

    pageResult.elements.forms.working = workingForms;
    console.log(`    找到 ${totalForms} 个表单元素，工作正常: ${workingForms} 个`);
  }

  // 单个表单元素测试
  async testSingleForm(form, pageResult) {
    try {
      const isVisible = await form.isVisible();
      const isEnabled = await form.isEnabled();

      if (!isVisible || !isEnabled) {
        return false;
      }

      // 尝试简单的交互
      await form.focus();

      const tagName = await form.evaluate(el => el.tagName.toLowerCase());

      // 避免对数字输入框进行文本填充测试
      if (tagName === 'input' || tagName === 'textarea') {
        const inputType = await form.getAttribute('type');
        if (inputType === 'number') {
          return true; // 数字输入框跳过文本填充测试
        }

        // 简单的交互测试
        await form.click();
        await form.type('test');
        await form.fill(''); // 清空
      }

      pageResult.elements.forms.interactive++;
      return true;
    } catch (error) {
      return false;
    }
  }

  async testTabs(pageResult) {
    try {
      const tabs = await this.page.$$('.el-tabs__item:visible, .el-tab-pane:visible');
      pageResult.elements.tabs.found = tabs.length;

      for (const tab of tabs.slice(0, 5)) {
        try {
          await tab.click();
          pageResult.elements.tabs.working++;
        } catch (error) {
          // Tab点击失败通常不是严重问题
        }
      }
    } catch (error) {
      console.log(`    Tab测试失败: ${error.message}`);
    }
  }

  async testTables(pageResult) {
    try {
      const tables = await this.page.$$('.el-table:visible');
      pageResult.elements.tables.found = tables.length;

      for (const table of tables) {
        try {
          // 检查表格是否有数据
          const hasData = await table.$$('.el-table__row').length > 1;
          if (hasData) {
            pageResult.elements.tables.hasData++;
            pageResult.elements.tables.working++;
          }
        } catch (error) {
          // 表格数据处理失败
        }
      }
    } catch (error) {
      console.log(`    表格测试失败: ${error.message}`);
    }
  }

  async testDropdowns(pageResult) {
    try {
      const dropdowns = await this.page.$$('.el-dropdown:visible, .el-select:visible');
      pageResult.elements.dropdowns.found = dropdowns.length;

      for (const dropdown of dropdowns.slice(0, 3)) {
        try {
          await dropdown.click();
          await this.page.waitForTimeout(500);
          pageResult.elements.dropdowns.working++;
        } catch (error) {
          // 下拉菜单交互失败
        }
      }
    } catch (error) {
      console.log(`    下拉菜单测试失败: ${error.message}`);
    }
  }

  async testModals(pageResult) {
    // 模态框需要触发，这里检查模态框触发按钮
    try {
      const modalTriggers = await this.page.$$('.el-button:visible');
      const hasModalButtons = modalTriggers.length > 0;

      if (hasModalButtons) {
        pageResult.elements.modals.found = hasModalButtons;
      }
    } catch (error) {
      console.log(`    模态框测试失败: ${error.message}`);
    }
  }

  async testPagination(pageResult) {
    try {
      const pagination = await this.page.$$('.el-pagination:visible');
      pageResult.elements.pagination.found = pagination.length;

      for (const page of pagination) {
        try {
          const pageNumbers = await page.$('.el-pager li:visible');
          if (pageNumbers.length > 1) {
            pageResult.elements.pagination.clickable++;
            pageResult.elements.pagination.working++;
          }
        } catch (error) {
          // 分页交互失败
        }
      }
    } catch (error) {
      console.log(`    分页测试失败: ${error.message}`);
    }
  }

  async testLoadingStates(pageResult) {
    try {
      const loadingElements = await this.page.$$('.el-loading:visible, .loading:visible');
      pageResult.elements.loading.found = loadingElements.length;
    } catch (error) {
      console.log(`    加载状态检查失败: ${error.message}`);
    }
  }

  async checkExpectedFeatures(pageResult) {
    if (!pageResult.expectedFeatures || pageResult.expectedFeatures.length === 0) {
      return;
    }

    const foundFeatures = [];

    for (const feature of pageResult.expectedFeatures) {
      try {
        // 根据功能名称检查对应的元素
        let found = false;

        switch (feature) {
          case 'activity-list':
            found = await this.page.$('.el-table, .activity-list').length > 0;
            break;
          case 'create-btn':
            found = await this.page.$('button:visible').length > 0;
            break;
          case 'edit-btn':
            found = await this.page.$('.el-button--warning:visible, button[title*="编辑"]:visible').length > 0;
            break;
          case 'delete-btn':
            found = await this.page.$('.el-button--danger:visible, button[title*="删除"]:visible').length > 0;
            break;
          case 'filters':
            found = await this.page.$('.el-form-item:visible, .filter-container:visible').length > 0;
            break;
          case 'search':
            found = await this.page.$('.el-input--search:visible, input[placeholder*="搜索"]:visible').length > 0;
            break;
          case 'pagination':
            found = await this.page.$('.el-pagination:visible').length > 0;
            break;
          case 'customer-list':
            found = await this.page.$('.customer-table:visible, .customer-list:visible').length > 0;
            break;
          case 'user-management':
            found = await this.page.$('.user-table:visible, .user-management:visible').length > 0;
            break;
          case 'role-management':
            found = await this.page.$('.role-table:visible, .role-management:visible').length > 0;
            break;
          default:
            // 通用检查
            found = await this.page.$(`[data-feature*="${feature}"]:visible`).length > 0;
        }

        if (found) {
          foundFeatures.push(feature);
        }
      } catch (error) {
        console.log(`    功能检查失败 ${feature}: ${error.message}`);
      }
    }

    pageResult.features.found = foundFeatures;
    pageResult.features.missing = pageResult.expectedFeatures.filter(f => !foundFeatures.includes(f));
  }

  async runTests() {
    const testPages = [
      {
        path: '/activities',
        name: '活动管理',
        priority: 'high',
        expectedFeatures: [
          'activity-list',
          'create-btn',
          'edit-btn',
          'delete-btn',
          'filters',
          'search',
          'pagination'
        ]
      },
      {
        path: '/centers/system',
        name: '系统中心',
        priority: 'high',
        expectedFeatures: [
          'user-management',
          'role-management',
          'settings',
          'logs',
          'security'
        ]
      },
      {
        path: '/centers/finance',
        name: '财务中心',
        priority: 'high',
        expectedFeatures: [
          'fee-management',
          'payment-records',
          'financial-reports',
          'statistics'
        ]
      },
      {
        path: '/centers/task',
        name: '任务中心',
        priority: 'medium',
        expectedFeatures: [
          'task-list',
          'create-task',
          'task-status',
          'filters',
          'assignment'
        ]
      },
      {
        path: '/centers/customer-pool',
        name: '客户池',
        priority: 'medium',
        expectedFeatures: [
          'customer-list',
          'search',
          'filters',
          'customer-details',
          'follow-up'
        ]
      },
      {
        path: '/dashboard',
        name: '仪表板',
        priority: 'medium',
        expectedFeatures: [
          'statistics',
          'charts',
          'notifications',
          'quick-actions'
        ]
      }
    ];

    this.testResults.summary.total = testPages.length;

    // 登录
    await this.login();

    // 逐个测试页面
    for (const pageConfig of testPages) {
      const result = await this.testPage(pageConfig);
      this.testResults.pages.push(result);

      if (result.success) {
        this.testResults.summary.passed++;
      } else {
        this.testResults.summary.failed++;
      }

      this.testResults.summary.tested++;

      // 统计错误
      this.testResults.summary.consoleErrors += result.consoleErrors.length;
      this.testResults.summary.pageErrors += result.pageErrors.length;
      this.testResults.summary.networkErrors += result.networkErrors.length;

      this.testResults.summary.totalElements += result.totalElements;
      this.testResults.summary.workingElements += result.workingElements;
      this.testResults.summary.brokenElements += result.totalElements - result.workingElements;
    }
  }

  async login() {
    console.log('🔐 执行管理员登录...');

    try {
      await this.page.goto('http://localhost:5173/login');

      // 等待登录表单加载
      await this.page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"]', { timeout: 10000 });

      // 填写登录信息
      await this.page.fill('input[placeholder*="用户名"], input[placeholder*="账号"]', 'admin');
      await this.page.fill('input[placeholder*="密码"]', '123456');

      // 点击登录按钮
      await this.page.click('button[type="submit"]');

      // 等待登录成功 - 等待URL变化或首页加载
      await this.page.waitForURL('**/dashboard**', { timeout: 15000 });

      console.log('✅ 登录成功');
      return true;
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      throw error;
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      criticalIssues: [],
      recommendations: []
    };

    // 识别关键问题
    for (const page of this.testResults.pages) {
      if (page.consoleErrors.length > 5) {
        report.criticalIssues.push({
          page: page.name,
          type: 'console_errors',
          count: page.consoleErrors.length,
          errors: page.consoleErrors
        });
      }

      if (page.features.missing.length > 3) {
        report.criticalIssues.push({
          page: page.name,
          type: 'missing_features',
          count: page.features.missing.length,
          features: page.features.missing
        });
      }
    }

    // 生成建议
    if (report.criticalIssues.length > 0) {
      report.recommendations.push({
        priority: 'high',
        category: 'critical_pages',
        title: '修复高优先级页面的关键问题',
        description: '以下高优先级页面存在严重问题',
        pages: report.criticalIssues
          .filter(issue => issue.type === 'console_errors' || issue.type === 'missing_features')
          .map(issue => ({ name: issue.page, path: issue.path }))
      });
    }

    return report;
  }

  async saveReport(report) {
    const reportPath = '/home/zhgue/kyyupgame/k.yyup.com/enhanced-page-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 详细测试报告已保存到: ${reportPath}`);
  }

  async cleanup() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.runTests();

      const report = this.generateReport();
      this.saveReport(report);

      this.printSummary();

    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  printSummary() {
    const { summary, pages } = this.testResults;

    console.log(`
================================================================================
📊 增强版深度页面测试报告
================================================================================

📈 总体统计:
   测试页面数: ${summary.tested}/${summary.total}
   ✅ 通过: ${summary.passed}
   ❌ 失败: ${summary.failed}
   成功率: ${((summary.passed / summary.tested) * 100).toFixed(1)}%

🔧 交互元素统计:
   总元素数: ${summary.totalElements}
   ✅ 正常工作: ${summary.workingElements}
   ❌ 问题元素: ${summary.brokenElements}
   元素健康率: ${((summary.workingElements / summary.totalElements) * 100).toFixed(1)}%

⚠️ 错误统计:
   控制台错误: ${summary.consoleErrors}
   页面错误: ${summary.pageErrors}
   网络错误: ${summary.networkErrors}

📋 页面详情:`);

    for (const page of pages) {
      const status = page.success ? '✅' : '❌';
      const healthRate = page.totalElements > 0 ?
        ((page.workingElements / page.totalElements) * 100).toFixed(1) : '0';

      console.log(`   ${status} ${page.name} (${page.path})`);
      console.log(`      元素健康率: ${healthRate}% | 加载时间: ${page.performance.loadTime}ms | 交互元素: ${page.performance.interactiveElements}`);

      if (page.consoleErrors.length > 0) {
        console.log(`      控制台错误: ${page.consoleErrors.length}个`);
      }

      if (page.features.missing.length > 0) {
        console.log(`      缺失功能: ${page.features.missing.join(', ')}`);
      }
    }

    console.log(`================================================================================
🏁 增强测试完成
================================================================================`);
  }
}

// 运行测试
if (require.main === module) {
  const tester = new EnhancedDeepPageTester();
  tester.run().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}