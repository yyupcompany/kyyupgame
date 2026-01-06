/**
 * 深度页面测试器
 * 基于实际可访问路径进行深度测试，专注按钮、表单、Tab等交互元素
 */

const { chromium } = require('playwright');

class DeepPageTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];

    // 基于路径发现的实际可访问页面，按功能丰富度排序
    this.testPages = [
      {
        path: '/activities',
        name: '活动管理',
        priority: 'high',
        elements: { buttons: 61, forms: 23, tabs: 0 },
        expectedFeatures: ['activity-list', 'create-btn', 'edit-btn', 'delete-btn', 'filters', 'search', 'pagination']
      },
      {
        path: '/centers/system',
        name: '系统中心',
        priority: 'high',
        elements: { buttons: 34, forms: 18, tabs: 0 },
        expectedFeatures: ['user-management', 'role-management', 'settings', 'logs', 'security']
      },
      {
        path: '/centers/finance',
        name: '财务中心',
        priority: 'high',
        elements: { buttons: 15, forms: 30, tabs: 0 },
        expectedFeatures: ['fee-management', 'payment-records', 'financial-reports', 'statistics']
      },
      {
        path: '/centers/task',
        name: '任务中心',
        priority: 'medium',
        elements: { buttons: 17, forms: 5, tabs: 0 },
        expectedFeatures: ['task-list', 'create-task', 'task-status', 'filters', 'assignment']
      },
      {
        path: '/centers/customer-pool',
        name: '客户池',
        priority: 'medium',
        elements: { buttons: 15, forms: 0, tabs: 0 },
        expectedFeatures: ['customer-list', 'search', 'filters', 'customer-details', 'follow-up']
      },
      {
        path: '/dashboard',
        name: '仪表板',
        priority: 'medium',
        elements: { buttons: 4, forms: 0, tabs: 0 },
        expectedFeatures: ['statistics', 'charts', 'notifications', 'quick-actions']
      }
    ];

    // 详细的交互元素选择器
    this.interactionSelectors = {
      buttons: [
        'button:visible',
        '.el-button:visible',
        '.btn:visible',
        '.action-btn:visible',
        '.create-btn:visible',
        '.edit-btn:visible',
        '.delete-btn:visible',
        '.save-btn:visible',
        '.cancel-btn:visible',
        '.search-btn:visible',
        '.reset-btn:visible',
        '.submit-btn:visible',
        '.export-btn:visible',
        '.import-btn:visible',
        '[role="button"]:visible',
        '.clickable:visible'
      ],
      forms: [
        'input:visible',
        'select:visible',
        'textarea:visible',
        '.el-input:visible',
        '.el-select:visible',
        '.el-textarea:visible',
        '.el-form-item:visible',
        '.form-control:visible',
        'input[type="text"]:visible',
        'input[type="number"]:visible',
        'input[type="email"]:visible',
        'input[type="password"]:visible',
        'input[type="date"]:visible'
      ],
      tabs: [
        '.el-tabs__item:visible',
        '.tab-item:visible',
        '.nav-tab:visible',
        '[role="tab"]:visible',
        '.el-menu-item:visible',
        '.step-item:visible'
      ],
      dropdowns: [
        '.el-dropdown:visible',
        '.el-select-dropdown:visible',
        '.menu:visible',
        '.options-menu:visible',
        '.context-menu:visible',
        '.action-menu:visible'
      ],
      modals: [
        '.el-dialog:visible',
        '.el-modal:visible',
        '.dialog:visible',
        '.modal:visible',
        '.popup:visible',
        '.overlay:visible',
        '.drawer:visible'
      ],
      tables: [
        '.el-table:visible',
        '.data-table:visible',
        '.table:visible',
        '.grid:visible',
        '.list-view:visible'
      ],
      pagination: [
        '.el-pagination:visible',
        '.pagination:visible',
        '.pager:visible',
        '.page-nav:visible'
      ],
      loading: [
        '.el-loading:visible',
        '.loading:visible',
        '[class*="loading"]:visible',
        '.spinner:visible',
        '.skeleton:visible'
      ]
    };
  }

  async init() {
    console.log('🔍 启动深度页面测试器...');

    try {
      this.browser = await chromium.launch({
        headless: true,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });

      this.page = await this.context.newPage();

      // 监听控制台消息
      const consoleMessages = [];
      this.page.on('console', msg => {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });

        if (msg.type() === 'error') {
          console.log(`⚠️ [${msg.type().toUpperCase()}] ${msg.text()}`);
        }
      });

      // 监听页面错误
      const pageErrors = [];
      this.page.on('pageerror', error => {
        pageErrors.push({
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ [页面错误] ${error.message}`);
      });

      // 监听网络请求
      const networkRequests = [];
      const networkErrors = [];
      this.page.on('request', request => {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      });

      this.page.on('requestfailed', request => {
        networkErrors.push({
          url: request.url(),
          failure: request.failure(),
          timestamp: new Date().toISOString()
        });
        console.log(`🌐 [网络错误] ${request.url()} - ${request.failure()?.errorText}`);
      });

      this.page.consoleMessages = consoleMessages;
      this.page.pageErrors = pageErrors;
      this.page.networkRequests = networkRequests;
      this.page.networkErrors = networkErrors;

      console.log('✅ 浏览器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 浏览器初始化失败:', error.message);
      return false;
    }
  }

  async login() {
    try {
      console.log('🔐 执行管理员登录...');

      await this.page.goto('http://localhost:5173/login', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await this.page.waitForSelector('input[placeholder*="账号"], input[placeholder*="用户名"], input[type="text"]',
        { timeout: 10000 });

      await this.page.fill('input[placeholder*="账号"], input[placeholder*="用户名"], input[type="text"]', 'admin');
      await this.page.fill('input[placeholder*="密码"], input[type="password"]', '123456');
      await this.page.click('button[type="submit"], .login-btn, .el-button--primary');

      await this.page.waitForURL(/\/(dashboard|centers)?/, { timeout: 15000 });
      await this.page.waitForTimeout(2000);

      console.log('✅ 登录成功');
      return true;
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      return false;
    }
  }

  async deepTestPage(pageConfig) {
    const pageName = pageConfig.name;
    const pagePath = pageConfig.path;

    console.log(`\n🔍 深度测试页面: ${pageName} (${pagePath})`);

    const pageResult = {
      ...pageConfig,
      success: true,
      errors: [],
      elements: {
        buttons: { found: 0, clickable: 0, working: 0, broken: [] },
        forms: { found: 0, interactive: 0, working: 0, broken: [] },
        tabs: { found: 0, clickable: 0, working: 0, broken: [] },
        tables: { found: 0, hasData: 0, working: 0, broken: [] },
        dropdowns: { found: 0, interactive: 0, working: 0, broken: [] },
        modals: { found: 0, working: 0, broken: [] },
        pagination: { found: 0, clickable: 0, working: 0, broken: [] },
        loading: { found: 0 }
      },
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
      const fullUrl = `http://localhost:5173${pagePath}`;
      const response = await this.page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: 25000
      });

      pageResult.performance.loadTime = Date.now() - startTime;

      if (!response || response.status() >= 400) {
        pageResult.success = false;
        pageResult.errors.push(`页面加载失败: ${response ? response.status() : '无响应'}`);
        return pageResult;
      }

      // 等待页面稳定
      await this.page.waitForTimeout(3000);

      // 清除之前的消息记录
      this.page.consoleMessages.length = 0;
      this.page.pageErrors.length = 0;
      this.page.networkErrors.length = 0;

      // 深度测试各种交互元素
      console.log('  🔘 测试按钮元素...');
      await this.testButtons(pageResult);

      console.log('  📝 测试表单元素...');
      await this.testForms(pageResult);

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

      console.log('  🎯 检查预期功能...');
      await this.testExpectedFeatures(pageResult);

      // 收集控制台和页面错误
      pageResult.consoleErrors = this.page.consoleMessages.filter(msg =>
        msg.type === 'error' || msg.type === 'warning'
      );
      pageResult.pageErrors = this.page.pageErrors;
      pageResult.networkErrors = this.page.networkErrors;

      // 计算交互元素总数
      pageResult.performance.interactiveElements =
        pageResult.elements.buttons.found +
        pageResult.elements.forms.found +
        pageResult.elements.tabs.found;

      // 检查是否有错误导致页面功能不完整
      const hasErrors = pageResult.consoleErrors.length > 0 ||
                       pageResult.pageErrors.length > 0 ||
                       pageResult.networkErrors.length > 0;

      if (hasErrors) {
        pageResult.success = false;
      }

      console.log(`  ✅ 测试完成: ${pageResult.elements.buttons.working + pageResult.elements.forms.working} 元素正常工作`);

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

  async testButtons(pageResult) {
    const buttons = await this.page.$$(this.interactionSelectors.buttons.join(', '));
    pageResult.elements.buttons.found = buttons.length;

    console.log(`    找到 ${buttons.length} 个按钮`);

    for (let i = 0; i < Math.min(buttons.length, 20); i++) { // 限制测试数量
      try {
        const button = buttons[i];
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        const text = await button.textContent();

        if (isVisible && isEnabled) {
          // 尝试点击测试
          try {
            await button.click({ timeout: 2000 });
            await this.page.waitForTimeout(500);
            pageResult.elements.buttons.clickable++;
            pageResult.elements.buttons.working++;
          } catch (clickError) {
            pageResult.elements.buttons.broken.push({
              selector: `按钮 ${i + 1}`,
              text: text || `按钮 ${i + 1}`,
              error: `点击失败: ${clickError.message}`
            });
          }
        } else {
          pageResult.elements.buttons.broken.push({
            selector: `按钮 ${i + 1}`,
            text: text || `按钮 ${i + 1}`,
            error: isVisible ? '按钮禁用' : '按钮不可见'
          });
        }
      } catch (error) {
        pageResult.elements.buttons.broken.push({
          selector: `按钮 ${i + 1}`,
          error: `测试失败: ${error.message}`
        });
      }
    }
  }

  async testForms(pageResult) {
    const forms = await this.page.$$(this.interactionSelectors.forms.join(', '));
    pageResult.elements.forms.found = forms.length;

    console.log(`    找到 ${forms.length} 个表单元素`);

    for (let i = 0; i < Math.min(forms.length, 15); i++) { // 限制测试数量
      try {
        const form = forms[i];
        const isVisible = await form.isVisible();
        const isEnabled = await form.isEnabled();

        if (isVisible && isEnabled) {
          // 尝试填充测试
          try {
            const tagName = await form.evaluate(el => el.tagName.toLowerCase());

            if (tagName === 'input') {
              const inputType = await form.getAttribute('type');
              if (inputType !== 'password' && inputType !== 'email') {
                await form.fill('test');
              }
            } else if (tagName === 'textarea') {
              await form.fill('test content');
            }

            pageResult.elements.forms.interactive++;
            pageResult.elements.forms.working++;
          } catch (fillError) {
            pageResult.elements.forms.broken.push({
              selector: `表单 ${i + 1}`,
              error: `交互失败: ${fillError.message}`
            });
          }
        } else {
          pageResult.elements.forms.broken.push({
            selector: `表单 ${i + 1}`,
            error: isVisible ? '表单禁用' : '表单不可见'
          });
        }
      } catch (error) {
        pageResult.elements.forms.broken.push({
          selector: `表单 ${i + 1}`,
          error: `测试失败: ${error.message}`
        });
      }
    }
  }

  async testTabs(pageResult) {
    const tabs = await this.page.$$(this.interactionSelectors.tabs.join(', '));
    pageResult.elements.tabs.found = tabs.length;

    console.log(`    找到 ${tabs.length} 个Tab元素`);

    for (let i = 0; i < Math.min(tabs.length, 10); i++) { // 限制测试数量
      try {
        const tab = tabs[i];
        const isVisible = await tab.isVisible();

        if (isVisible) {
          // 尝试点击Tab
          try {
            await tab.click({ timeout: 2000 });
            await this.page.waitForTimeout(500);
            pageResult.elements.tabs.clickable++;
            pageResult.elements.tabs.working++;
          } catch (clickError) {
            pageResult.elements.tabs.broken.push({
              selector: `Tab ${i + 1}`,
              error: `点击失败: ${clickError.message}`
            });
          }
        } else {
          pageResult.elements.tabs.broken.push({
            selector: `Tab ${i + 1}`,
            error: 'Tab不可见'
          });
        }
      } catch (error) {
        pageResult.elements.tabs.broken.push({
          selector: `Tab ${i + 1}`,
          error: `测试失败: ${error.message}`
        });
      }
    }
  }

  async testTables(pageResult) {
    const tables = await this.page.$$(this.interactionSelectors.tables.join(', '));
    pageResult.elements.tables.found = tables.length;

    console.log(`    找到 ${tables.length} 个表格元素`);

    for (let i = 0; i < Math.min(tables.length, 5); i++) { // 限制测试数量
      try {
        const table = tables[i];
        const isVisible = await table.isVisible();

        if (isVisible) {
          // 检查表格是否有数据
          try {
            const rows = await table.$$('tr, .el-table__row, .table-row, .data-row');
            const hasData = rows.length > 1; // 排除表头

            if (hasData) {
              pageResult.elements.tables.hasData++;
              pageResult.elements.tables.working++;
            } else {
              pageResult.elements.tables.broken.push({
                selector: `表格 ${i + 1}`,
                error: '表格没有数据'
              });
            }
          } catch (checkError) {
            pageResult.elements.tables.broken.push({
              selector: `表格 ${i + 1}`,
              error: `数据检查失败: ${checkError.message}`
            });
          }
        } else {
          pageResult.elements.tables.broken.push({
            selector: `表格 ${i + 1}`,
            error: '表格不可见'
          });
        }
      } catch (error) {
        pageResult.elements.tables.broken.push({
          selector: `表格 ${i + 1}`,
          error: `测试失败: ${error.message}`
        });
      }
    }
  }

  async testDropdowns(pageResult) {
    const dropdowns = await this.page.$$(this.interactionSelectors.dropdowns.join(', '));
    pageResult.elements.dropdowns.found = dropdowns.length;

    console.log(`    找到 ${dropdowns.length} 个下拉菜单`);

    for (let i = 0; i < Math.min(dropdowns.length, 8); i++) { // 限制测试数量
      try {
        const dropdown = dropdowns[i];
        const isVisible = await dropdown.isVisible();

        if (isVisible) {
          pageResult.elements.dropdowns.interactive++;
          pageResult.elements.dropdowns.working++;
        } else {
          pageResult.elements.dropdowns.broken.push({
            selector: `下拉菜单 ${i + 1}`,
            error: '下拉菜单不可见'
          });
        }
      } catch (error) {
        pageResult.elements.dropdowns.broken.push({
          selector: `下拉菜单 ${i + 1}`,
          error: `测试失败: ${error.message}`
        });
      }
    }
  }

  async testModals(pageResult) {
    const modals = await this.page.$$(this.interactionSelectors.modals.join(', '));
    pageResult.elements.modals.found = modals.length;

    console.log(`    找到 ${modals.length} 个模态框`);

    // 模态框通常默认隐藏，检查存在即可
    pageResult.elements.modals.working = modals.length;
  }

  async testPagination(pageResult) {
    const pagination = await this.page.$$(this.interactionSelectors.pagination.join(', '));
    pageResult.elements.pagination.found = pagination.length;

    console.log(`    找到 ${pagination.length} 个分页组件`);

    for (let i = 0; i < Math.min(pagination.length, 3); i++) { // 限制测试数量
      try {
        const pager = pagination[i];
        const isVisible = await pager.isVisible();

        if (isVisible) {
          // 检查是否有可点击的页码按钮
          try {
            const pageButtons = await pager.$$('button, .page-number, .el-pager li, [role="button"]');

            if (pageButtons.length > 0) {
              pageResult.elements.pagination.clickable++;
              pageResult.elements.pagination.working++;
            } else {
              pageResult.elements.pagination.broken.push({
                selector: `分页 ${i + 1}`,
                error: '分页没有可点击元素'
              });
            }
          } catch (checkError) {
            pageResult.elements.pagination.broken.push({
              selector: `分页 ${i + 1}`,
              error: `分页检查失败: ${checkError.message}`
            });
          }
        } else {
          pageResult.elements.pagination.broken.push({
            selector: `分页 ${i + 1}`,
            error: '分页不可见'
          });
        }
      } catch (error) {
        pageResult.elements.pagination.broken.push({
          selector: `分页 ${i + 1}`,
          error: `测试失败: ${error.message}`
        });
      }
    }
  }

  async testLoadingStates(pageResult) {
    const loading = await this.page.$$(this.interactionSelectors.loading.join(', '));
    pageResult.elements.loading.found = loading.length;

    console.log(`    检查到 ${loading.length} 个加载状态元素`);

    // 加载状态元素的存在通常是正常的
  }

  async testExpectedFeatures(pageResult) {
    const expectedFeatures = pageResult.expectedFeatures || [];

    for (const feature of expectedFeatures) {
      try {
        // 简单的特征检测 - 查找相关的元素或文本
        const featureSelectors = [
          `[class*="${feature}"]`,
          `[id*="${feature}"]`,
          `[data-*="${feature}"]`,
          `*:has-text("${feature}")`,
          `*:has-text("${feature.replace('-', ' ')}")`
        ];

        let found = false;
        for (const selector of featureSelectors) {
          try {
            const element = await this.page.$(selector);
            if (element && await element.isVisible()) {
              found = true;
              break;
            }
          } catch (error) {
            // 继续尝试下一个选择器
          }
        }

        if (found) {
          pageResult.features.found.push(feature);
        } else {
          pageResult.features.missing.push(feature);
        }
      } catch (error) {
        pageResult.features.missing.push(feature);
      }
    }

    console.log(`    功能检查: ${pageResult.features.found.length}/${expectedFeatures.length} 存在`);
  }

  async runDeepTests() {
    console.log('🚀 开始深度页面测试...');

    if (!await this.init()) {
      throw new Error('浏览器初始化失败');
    }

    if (!await this.login()) {
      throw new Error('登录失败');
    }

    const results = {
      summary: {
        total: this.testPages.length,
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
      pages: [],
      criticalIssues: [],
      recommendations: []
    };

    // 按优先级测试页面
    const highPriorityPages = this.testPages.filter(p => p.priority === 'high');
    const mediumPriorityPages = this.testPages.filter(p => p.priority === 'medium');

    const pagesToTest = [...highPriorityPages, ...mediumPriorityPages];

    for (const pageConfig of pagesToTest) {
      const pageResult = await this.deepTestPage(pageConfig);
      results.pages.push(pageResult);
      results.summary.tested++;

      // 统计元素
      const totalPageElements =
        pageResult.elements.buttons.found +
        pageResult.elements.forms.found +
        pageResult.elements.tabs.found +
        pageResult.elements.tables.found;
      const workingPageElements =
        pageResult.elements.buttons.working +
        pageResult.elements.forms.working +
        pageResult.elements.tabs.working +
        pageResult.elements.tables.working;

      results.summary.totalElements += totalPageElements;
      results.summary.workingElements += workingPageElements;
      results.summary.brokenElements += (totalPageElements - workingPageElements);

      // 统计错误
      results.summary.consoleErrors += pageResult.consoleErrors.length;
      results.summary.pageErrors += pageResult.pageErrors.length;
      results.summary.networkErrors += pageResult.networkErrors.length;

      if (pageResult.success) {
        results.summary.passed++;
      } else {
        results.summary.failed++;

        // 收集关键问题
        if (pageResult.consoleErrors.length > 0) {
          results.criticalIssues.push({
            page: pageResult.name,
            type: 'console_errors',
            count: pageResult.consoleErrors.length,
            errors: pageResult.consoleErrors.slice(0, 3)
          });
        }

        if (pageResult.features.missing.length > 0) {
          results.criticalIssues.push({
            page: pageResult.name,
            type: 'missing_features',
            count: pageResult.features.missing.length,
            features: pageResult.features.missing
          });
        }
      }
    }

    // 生成建议
    this.generateRecommendations(results);

    this.generateReport(results);
    this.testResults = results;
    return results;
  }

  generateRecommendations(results) {
    const recommendations = [];

    // 分析成功率低的页面
    const lowSuccessPages = results.pages.filter(p =>
      !p.success && p.priority === 'high'
    );

    if (lowSuccessPages.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'critical_pages',
        title: '修复高优先级页面的关键问题',
        description: `以下高优先级页面存在严重问题: ${lowSuccessPages.map(p => p.name).join(', ')}`,
        pages: lowSuccessPages.map(p => ({ name: p.name, path: p.path }))
      });
    }

    // 分析元素错误率
    const highErrorPages = results.pages.filter(p => {
      const total = p.elements.buttons.found + p.elements.forms.found;
      const broken = p.elements.buttons.broken.length + p.elements.forms.broken.length;
      return total > 10 && (broken / total) > 0.3; // 错误率超过30%
    });

    if (highErrorPages.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'element_errors',
        title: '优化页面交互元素的可用性',
        description: `以下页面有较高的元素错误率: ${highErrorPages.map(p => p.name).join(', ')}`,
        pages: highErrorPages.map(p => ({
          name: p.name,
          path: p.path,
          errorRate: ((p.elements.buttons.broken.length + p.elements.forms.broken.length) /
                     (p.elements.buttons.found + p.elements.forms.found) * 100).toFixed(1) + '%'
        }))
      });
    }

    // 分析缺失功能
    const pagesWithMissingFeatures = results.pages.filter(p => p.features.missing.length > 0);

    if (pagesWithMissingFeatures.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'missing_features',
        title: '完善页面功能实现',
        description: `以下页面缺少预期功能: ${pagesWithMissingFeatures.map(p => p.name).join(', ')}`,
        details: pagesWithMissingFeatures.map(p => ({
          name: p.name,
          missing: p.features.missing
        }))
      });
    }

    // 性能优化建议
    const slowPages = results.pages.filter(p => p.performance.loadTime > 5000);

    if (slowPages.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'performance',
        title: '优化页面加载性能',
        description: `以下页面加载时间较长: ${slowPages.map(p => `${p.name} (${p.performance.loadTime}ms)`).join(', ')}`,
        pages: slowPages.map(p => ({ name: p.name, loadTime: p.performance.loadTime }))
      });
    }

    results.recommendations = recommendations;
  }

  generateReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 深度页面测试报告');
    console.log('='.repeat(80));

    const summary = results.summary;

    console.log(`\n📈 总体统计:`);
    console.log(`   测试页面数: ${summary.total}`);
    console.log(`   ✅ 通过: ${summary.passed}`);
    console.log(`   ❌ 失败: ${summary.failed}`);
    console.log(`   成功率: ${((summary.passed / summary.tested) * 100).toFixed(1)}%`);

    console.log(`\n🔧 交互元素统计:`);
    console.log(`   总元素数: ${summary.totalElements}`);
    console.log(`   ✅ 正常工作: ${summary.workingElements}`);
    console.log(`   ❌ 问题元素: ${summary.brokenElements}`);
    console.log(`   元素健康率: ${((summary.workingElements / summary.totalElements) * 100).toFixed(1)}%`);

    console.log(`\n⚠️ 错误统计:`);
    console.log(`   控制台错误: ${summary.consoleErrors}`);
    console.log(`   页面错误: ${summary.pageErrors}`);
    console.log(`   网络错误: ${summary.networkErrors}`);

    console.log(`\n📋 页面详情:`);
    results.pages.forEach(page => {
      const status = page.success ? '✅' : '❌';
      const elementHealth = page.elements.buttons.found + page.elements.forms.found > 0 ?
        ((page.elements.buttons.working + page.elements.forms.working) /
         (page.elements.buttons.found + page.elements.forms.found) * 100).toFixed(1) : 'N/A';

      console.log(`   ${status} ${page.name} (${page.path})`);
      console.log(`      元素健康率: ${elementHealth}% | 加载时间: ${page.performance.loadTime}ms | 交互元素: ${page.performance.interactiveElements}`);

      if (!page.success) {
        if (page.consoleErrors.length > 0) {
          console.log(`      控制台错误: ${page.consoleErrors.length}个`);
        }
        if (page.features.missing.length > 0) {
          console.log(`      缺失功能: ${page.features.missing.join(', ')}`);
        }
        if (page.elements.buttons.broken.length > 0 || page.elements.forms.broken.length > 0) {
          const totalBroken = page.elements.buttons.broken.length + page.elements.forms.broken.length;
          console.log(`      问题元素: ${totalBroken}个`);
        }
      }
    });

    if (results.criticalIssues.length > 0) {
      console.log(`\n🚨 关键问题:`);
      results.criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.page} - ${issue.type}: ${issue.count}个问题`);
        if (issue.errors) {
          issue.errors.forEach(error => {
            console.log(`      - ${error.text || error.message || error}`);
          });
        }
        if (issue.features) {
          console.log(`      - 缺失功能: ${issue.features.join(', ')}`);
        }
      });
    }

    if (results.recommendations.length > 0) {
      console.log(`\n💡 修复建议:`);
      results.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${priority} ${index + 1}. ${rec.title}`);
        console.log(`      ${rec.description}`);
        if (rec.pages) {
          rec.pages.forEach(page => {
            console.log(`        - ${page.name}${page.errorRate ? ` (${page.errorRate})` : ''}${page.loadTime ? ` (${page.loadTime}ms)` : ''}`);
          });
        }
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('🏁 深度测试完成');
    console.log('='.repeat(80));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 浏览器已关闭');
    }
  }
}

// 主执行函数
async function main() {
  const tester = new DeepPageTester();

  try {
    const results = await tester.runDeepTests();

    // 保存结果到文件
    const fs = require('fs');
    const reportData = {
      timestamp: new Date().toISOString(),
      results: results
    };

    fs.writeFileSync(
      '/home/zhgue/kyyupgame/k.yyup.com/deep-page-test-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 详细测试报告已保存到: deep-page-test-report.json');

    // 如果有关键问题，返回非零退出码
    if (results.summary.failed > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ 深度测试失败:', error.message);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeepPageTester;