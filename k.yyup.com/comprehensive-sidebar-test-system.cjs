/**
 * 全面的侧边栏页面按钮和Tab功能测试系统
 * 专门检测所有页面的按钮、Tab、控制台错误和功能不完善问题
 */

const { chromium } = require('playwright');

class ComprehensiveSidebarTestSystem {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      details: {}
    };

    // 基于CentersSidebar.vue的完整页面结构
    this.sidebarStructure = {
      '业务管理': {
        pages: [
          { path: '/centers/customer-pool', name: '客户池', expectedElements: ['search', 'table', 'pagination', 'filters', 'action-buttons'] },
          { path: '/centers/enrollment', name: '招生中心', expectedElements: ['stats-cards', 'chart', 'table', 'filters', 'actions'] },
          { path: '/centers/activities', name: '活动管理', expectedElements: ['activity-list', 'create-btn', 'filters', 'status-tabs', 'actions'] },
          { path: '/centers/consultations', name: '咨询记录', expectedElements: ['consultation-list', 'timeline', 'filter-form', 'action-buttons'] }
        ]
      },
      '营销管理': {
        pages: [
          { path: '/centers/marketing', name: '营销活动', expectedElements: ['campaign-list', 'create-btn', 'stats', 'filters'] },
          { path: '/centers/performance-rewards', name: '绩效中心', expectedElements: ['performance-stats', 'reward-list', 'teacher-rankings', 'filters'] },
          { path: '/centers/advertisements', name: '广告管理', expectedElements: ['ad-list', 'create-btn', 'placement-selector', 'schedule-controls'] }
        ]
      },
      '人事与教学管理': {
        pages: [
          { path: '/teacher-management', name: '教师管理', expectedElements: ['teacher-table', 'add-btn', 'department-filters', 'status-controls'] },
          { path: '/student-management', name: '学生管理', expectedElements: ['student-table', 'class-filters', 'enrollment-status', 'parent-info'] },
          { path: '/class-management', name: '班级管理', expectedElements: ['class-table', 'teacher-assignment', 'student-count', 'schedule'] },
          { path: '/course-management', name: '课程管理', expectedElements: ['course-list', 'category-filters', 'difficulty-levels', 'materials'] },
          { path: '/teaching-research', name: '教学研究', expectedElements: ['research-topics', 'materials', 'discussion-forum', 'sharing'] },
          { path: '/teaching-observation', name: '教学观摩', expectedElements: ['observation-schedule', 'evaluation-forms', 'feedback-system'] }
        ]
      },
      '财务管理': {
        pages: [
          { path: '/financial-overview', name: '财务概览', expectedElements: ['revenue-chart', 'expense-breakdown', 'profit-analysis', 'date-filters'] },
          { path: '/fee-management', name: '收费管理', expectedElements: ['fee-items', 'payment-records', 'invoice-generator', 'reminders'] },
          { path: 'financial-reporting', name: '财务报表', expectedElements: ['report-types', 'date-range-selector', 'export-options', 'charts'] }
        ]
      },
      '家校服务': {
        pages: [
          { path: '/parent-center', name: '家长中心', expectedElements: ['parent-list', 'communication-tools', 'announcement-board', 'feedback'] },
          { path: '/growth-archives', name: '成长档案', expectedElements: ['student-records', 'growth-charts', 'achievement-badges', 'media-gallery'] },
          { path: '/parent-school-communication', name: '家校沟通', expectedElements: ['message-center', 'meeting-scheduler', 'notification-system', 'surveys'] },
          { path: '/school-activities', name: '校园活动', expectedElements: ['activity-calendar', 'photo-galleries', 'event-registration', 'highlights'] }
        ]
      },
      '系统管理': {
        pages: [
          { path: '/system-settings', name: '系统设置', expectedElements: ['setting-tabs', 'config-forms', 'save-buttons', 'reset-options'] },
          { path: '/user-management', name: '用户管理', expectedElements: ['user-table', 'role-assignment', 'permission-controls', 'bulk-actions'] },
          { path: 'role-permission-management', name: '角色权限', expectedElements: ['role-list', 'permission-matrix', 'assignment-tools', 'templates'] },
          { path: 'system-operation-monitoring', name: '系统运维监控', expectedElements: ['system-metrics', 'performance-charts', 'alert-logs', 'maintenance-tools'] },
          { path: 'system-security', name: '系统安全管理', expectedElements: ['security-dashboard', 'threat-monitoring', 'access-logs', 'security-policies'] },
          { path: 'data-analysis', name: '数据分析', expectedElements: ['analytics-dashboard', 'custom-reports', 'data-export', 'trend-analysis'] }
        ]
      }
    };

    // 页面中常见的交互元素选择器
    this.commonSelectors = {
      buttons: [
        'button', '.btn', '.el-button', '.action-btn', '.create-btn', '.edit-btn',
        '.delete-btn', '.save-btn', '.cancel-btn', '.search-btn', '.reset-btn',
        '.submit-btn', '.upload-btn', '.download-btn', '.export-btn', '.import-btn'
      ],
      tabs: [
        '.el-tabs__item', '.tab-item', '.nav-tab', '.tab-button', '[role="tab"]',
        '.el-menu-item', '.step-item', '.filter-tab'
      ],
      forms: [
        '.el-input', '.el-select', '.el-date-picker', '.el-radio-group',
        '.el-checkbox-group', '.el-textarea', '.el-form-item', 'input', 'select',
        'textarea', '.form-control'
      ],
      tables: [
        '.el-table', '.data-table', '.table', '.grid', '.list-view',
        '.el-table__body', '.table-body'
      ],
      modals: [
        '.el-dialog', '.el-modal', '.dialog', '.modal', '.popup',
        '.overlay', '.drawer'
      ],
      dropdowns: [
        '.el-dropdown', '.el-select-dropdown', '.menu', '.context-menu',
        '.options-menu', '.action-menu'
      ],
      pagination: [
        '.el-pagination', '.pagination', '.pager', '.page-nav'
      ]
    };
  }

  /**
   * 初始化浏览器
   */
  async init() {
    console.log('🚀 启动全面侧边栏测试系统...');

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
          location: msg.location()
        });
      });

      // 监听页面错误
      const pageErrors = [];
      this.page.on('pageerror', error => {
        pageErrors.push({
          message: error.message,
          stack: error.stack
        });
      });

      // 监听网络请求
      const networkErrors = [];
      this.page.on('requestfailed', request => {
        networkErrors.push({
          url: request.url(),
          failure: request.failure()
        });
      });

      this.page.consoleMessages = consoleMessages;
      this.page.pageErrors = pageErrors;
      this.page.networkErrors = networkErrors;

      console.log('✅ 浏览器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 浏览器初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 执行登录
   */
  async login() {
    try {
      console.log('🔐 执行管理员登录...');

      await this.page.goto('http://localhost:5173/login', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 等待登录表单加载
      await this.page.waitForSelector('input[placeholder*="账号"], input[placeholder*="用户名"], input[type="text"]',
        { timeout: 10000 });

      // 输入管理员账号
      await this.page.fill('input[placeholder*="账号"], input[placeholder*="用户名"], input[type="text"]', 'admin');

      // 输入密码
      await this.page.fill('input[placeholder*="密码"], input[type="password"]', '123456');

      // 点击登录按钮
      await this.page.click('button[type="submit"], .login-btn, .el-button--primary');

      // 等待登录完成 - 等待页面跳转或侧边栏加载
      await this.page.waitForURL(/\/(dashboard|centers)?/, { timeout: 15000 });

      // 等待一下确保页面完全加载
      await this.page.waitForTimeout(2000);

      console.log('✅ 登录成功');
      return true;
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      return false;
    }
  }

  /**
   * 深度检测单个页面的所有交互元素
   */
  async deepTestPage(pageInfo) {
    const pageName = pageInfo.name;
    const pagePath = pageInfo.path;
    const expectedElements = pageInfo.expectedElements || [];

    console.log(`\n🔍 深度检测页面: ${pageName} (${pagePath})`);

    const pageResult = {
      name: pageName,
      path: pagePath,
      success: true,
      errors: [],
      elementsFound: {},
      elementsWorking: {},
      elementsBroken: [],
      consoleMessages: [],
      pageErrors: [],
      networkErrors: [],
      missingElements: []
    };

    try {
      // 导航到页面
      const fullUrl = `http://localhost:5173${pagePath}`;
      await this.page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: 25000
      });

      // 等待页面加载
      await this.page.waitForTimeout(3000);

      // 清除之前的消息记录
      this.page.consoleMessages.length = 0;
      this.page.pageErrors.length = 0;
      this.page.networkErrors.length = 0;

      // 检测页面是否正确加载
      const pageTitle = await this.page.title();
      const pageContent = await this.page.textContent('body');

      if (pageContent.includes('404') || pageContent.includes('页面不存在') || pageContent.includes('Page not found')) {
        pageResult.success = false;
        pageResult.errors.push('页面返回404错误');
        return pageResult;
      }

      // 深度检测各种交互元素
      const elementTests = [];

      // 1. 按钮检测
      console.log('  🔘 检测按钮元素...');
      const buttonResults = await this.testButtons();
      elementTests.push(...buttonResults);

      // 2. Tab页检测
      console.log('  📋 检测Tab页面...');
      const tabResults = await this.testTabs();
      elementTests.push(...tabResults);

      // 3. 表单元素检测
      console.log('  📝 检测表单元素...');
      const formResults = await this.testForms();
      elementTests.push(...formResults);

      // 4. 表格元素检测
      console.log('  📊 检测表格元素...');
      const tableResults = await this.testTables();
      elementTests.push(...tableResults);

      // 5. 模态框和弹窗检测
      console.log('  🪟 检测模态框元素...');
      const modalResults = await this.testModals();
      elementTests.push(...modalResults);

      // 6. 下拉菜单检测
      console.log('  📋 检测下拉菜单...');
      const dropdownResults = await this.testDropdowns();
      elementTests.push(...dropdownResults);

      // 7. 分页组件检测
      console.log('  📄 检测分页组件...');
      const paginationResults = await this.testPagination();
      elementTests.push(...paginationResults);

      // 8. 特定功能元素检测
      console.log('  🎯 检测预期功能元素...');
      const specificResults = await this.testExpectedElements(expectedElements);
      elementTests.push(...specificResults);

      // 统计结果
      let workingElements = 0;
      let brokenElements = 0;

      elementTests.forEach(test => {
        if (test.working) {
          workingElements++;
        } else {
          brokenElements++;
          pageResult.elementsBroken.push({
            selector: test.selector,
            description: test.description,
            error: test.error
          });
        }
      });

      // 检查控制台错误
      if (this.page.consoleMessages.length > 0) {
        const errorMessages = this.page.consoleMessages.filter(msg =>
          msg.type === 'error' || msg.type === 'warning'
        );
        if (errorMessages.length > 0) {
          pageResult.consoleMessages = errorMessages;
          pageResult.success = false;
        }
      }

      // 检查页面错误
      if (this.page.pageErrors.length > 0) {
        pageResult.pageErrors = this.page.pageErrors;
        pageResult.success = false;
      }

      // 检查网络错误
      if (this.page.networkErrors.length > 0) {
        pageResult.networkErrors = this.page.networkErrors;
        pageResult.success = false;
      }

      // 设置统计数据
      pageResult.elementsFound = {
        total: elementTests.length,
        buttons: buttonResults.length,
        tabs: tabResults.length,
        forms: formResults.length,
        tables: tableResults.length,
        modals: modalResults.length,
        dropdowns: dropdownResults.length,
        pagination: paginationResults.length,
        specific: specificResults.length
      };

      pageResult.elementsWorking = {
        total: workingElements,
        buttons: buttonResults.filter(t => t.working).length,
        tabs: tabResults.filter(t => t.working).length,
        forms: formResults.filter(t => t.working).length,
        tables: tableResults.filter(t => t.working).length,
        modals: modalResults.filter(t => t.working).length,
        dropdowns: dropdownResults.filter(t => t.working).length,
        pagination: paginationResults.filter(t => t.working).length,
        specific: specificResults.filter(t => t.working).length
      };

      console.log(`  ✅ 检测完成: ${workingElements}/${elementTests.length} 元素正常工作`);

      if (pageResult.elementsBroken.length > 0) {
        console.log(`  ❌ 发现 ${pageResult.elementsBroken.length} 个问题元素`);
        pageResult.elementsBroken.forEach(issue => {
          console.log(`    - ${issue.description}: ${issue.error}`);
        });
      }

    } catch (error) {
      pageResult.success = false;
      pageResult.errors.push(`页面检测失败: ${error.message}`);
      console.error(`  ❌ 页面检测失败: ${error.message}`);
    }

    return pageResult;
  }

  /**
   * 测试按钮元素
   */
  async testButtons() {
    const results = [];

    for (const selector of this.commonSelectors.buttons) {
      try {
        const elements = await this.page.$$(selector);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();
          const text = await element.textContent();

          results.push({
            type: 'button',
            selector: `${selector}:nth-child(${i + 1})`,
            description: text ? `按钮: ${text.trim()}` : `${selector} 按钮 ${i + 1}`,
            working: isVisible && isEnabled,
            visible: isVisible,
            enabled: isEnabled,
            error: !isVisible || !isEnabled ? (isVisible ? '按钮禁用' : '按钮不可见') : null
          });
        }
      } catch (error) {
        // 忽略选择器错误
      }
    }

    return results;
  }

  /**
   * 测试Tab页面
   */
  async testTabs() {
    const results = [];

    for (const selector of this.commonSelectors.tabs) {
      try {
        const elements = await this.page.$$(selector);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const text = await element.textContent();

          // 尝试点击Tab测试切换功能
          let tabWorking = isVisible;
          let tabError = null;

          if (isVisible) {
            try {
              await element.click();
              await this.page.waitForTimeout(500);
              tabWorking = true;
            } catch (error) {
              tabWorking = false;
              tabError = `Tab点击失败: ${error.message}`;
            }
          }

          results.push({
            type: 'tab',
            selector: `${selector}:nth-child(${i + 1})`,
            description: text ? `Tab: ${text.trim()}` : `${selector} Tab ${i + 1}`,
            working: tabWorking,
            visible: isVisible,
            clickable: tabWorking,
            error: tabError
          });
        }
      } catch (error) {
        // 忽略选择器错误
      }
    }

    return results;
  }

  /**
   * 测试表单元素
   */
  async testForms() {
    const results = [];

    for (const selector of this.commonSelectors.forms) {
      try {
        const elements = await this.page.$$(selector);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();

          // 尝试与表单元素交互
          let formWorking = isVisible && isEnabled;
          let formError = null;

          if (isVisible && isEnabled) {
            try {
              const tagName = await element.evaluate(el => el.tagName.toLowerCase());

              if (tagName === 'input') {
                await element.fill('test');
                await this.page.waitForTimeout(200);
              } else if (tagName === 'select') {
                // 尝试选择第一个选项
                const options = await element.$$('option');
                if (options.length > 1) {
                  await element.selectOption({ index: 1 });
                }
              } else if (tagName === 'textarea') {
                await element.fill('test content');
              }

              formWorking = true;
            } catch (error) {
              formWorking = false;
              formError = `表单元素交互失败: ${error.message}`;
            }
          }

          results.push({
            type: 'form',
            selector: `${selector}:nth-child(${i + 1})`,
            description: `${selector} 表单元素 ${i + 1}`,
            working: formWorking,
            visible: isVisible,
            enabled: isEnabled,
            error: formError
          });
        }
      } catch (error) {
        // 忽略选择器错误
      }
    }

    return results;
  }

  /**
   * 测试表格元素
   */
  async testTables() {
    const results = [];

    for (const selector of this.commonSelectors.tables) {
      try {
        const elements = await this.page.$$(selector);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();

          // 检查表格是否有数据
          let hasData = false;
          let tableError = null;

          if (isVisible) {
            try {
              const rows = await element.$$('tr, .el-table__row, .table-row');
              hasData = rows.length > 1; // 排除表头

              if (!hasData) {
                tableError = '表格没有数据行';
              }
            } catch (error) {
              tableError = `表格检测失败: ${error.message}`;
            }
          }

          results.push({
            type: 'table',
            selector: `${selector}:nth-child(${i + 1})`,
            description: `${selector} 表格 ${i + 1}`,
            working: isVisible && hasData,
            visible: isVisible,
            hasData: hasData,
            error: tableError
          });
        }
      } catch (error) {
        // 忽略选择器错误
      }
    }

    return results;
  }

  /**
   * 测试模态框和弹窗
   */
  async testModals() {
    const results = [];

    for (const selector of this.commonSelectors.modals) {
      try {
        const elements = await this.page.$$(selector);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          // 模态框通常默认隐藏，检查是否存在即可
          const exists = await element.count() > 0;

          results.push({
            type: 'modal',
            selector: `${selector}:nth-child(${i + 1})`,
            description: `${selector} 模态框 ${i + 1}`,
            working: exists,
            exists: exists,
            error: exists ? null : '模态框元素不存在'
          });
        }
      } catch (error) {
        // 忽略选择器错误
      }
    }

    return results;
  }

  /**
   * 测试下拉菜单
   */
  async testDropdowns() {
    const results = [];

    for (const selector of this.commonSelectors.dropdowns) {
      try {
        const elements = await this.page.$$(selector);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();

          results.push({
            type: 'dropdown',
            selector: `${selector}:nth-child(${i + 1})`,
            description: `${selector} 下拉菜单 ${i + 1}`,
            working: isVisible,
            visible: isVisible,
            error: isVisible ? null : '下拉菜单不可见'
          });
        }
      } catch (error) {
        // 忽略选择器错误
      }
    }

    return results;
  }

  /**
   * 测试分页组件
   */
  async testPagination() {
    const results = [];

    for (const selector of this.commonSelectors.pagination) {
      try {
        const elements = await this.page.$$(selector);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();

          // 检查分页按钮是否可点击
          let hasClickableElements = false;
          let paginationError = null;

          if (isVisible) {
            try {
              const pageButtons = await element.$$('button, .page-number, .el-pager li');
              hasClickableElements = pageButtons.length > 0;

              if (!hasClickableElements) {
                paginationError = '分页组件没有可点击元素';
              }
            } catch (error) {
              paginationError = `分页检测失败: ${error.message}`;
            }
          }

          results.push({
            type: 'pagination',
            selector: `${selector}:nth-child(${i + 1})`,
            description: `${selector} 分页组件 ${i + 1}`,
            working: isVisible && hasClickableElements,
            visible: isVisible,
            hasButtons: hasClickableElements,
            error: paginationError
          });
        }
      } catch (error) {
        // 忽略选择器错误
      }
    }

    return results;
  }

  /**
   * 测试预期功能元素
   */
  async testExpectedElements(expectedElements) {
    const results = [];

    for (const element of expectedElements) {
      try {
        // 根据预期元素类型构建选择器
        let selectors = [];

        switch (element) {
          case 'search':
            selectors = ['.search-input', '.el-input--search', 'input[placeholder*="搜索"]', '.search-box'];
            break;
          case 'table':
            selectors = ['.el-table', '.data-table', '.table', '.grid'];
            break;
          case 'pagination':
            selectors = ['.el-pagination', '.pagination'];
            break;
          case 'filters':
            selectors = ['.filter-container', '.filters', '.el-form--inline'];
            break;
          case 'action-buttons':
            selectors = ['.action-buttons', '.table-actions', '.btn-group'];
            break;
          case 'stats-cards':
            selectors = ['.stats-card', '.stat-card', '.el-card', '.metric-card'];
            break;
          case 'chart':
            selectors = ['.chart', '.el-chart', 'canvas', '[class*="chart"]'];
            break;
          case 'create-btn':
            selectors = ['.create-btn', '.add-btn', '.el-button--primary', 'button:has-text("创建")'];
            break;
          case 'activity-list':
            selectors = ['.activity-list', '.el-table__body', '.list-container'];
            break;
          case 'status-tabs':
            selectors = ['.status-tabs', '.el-tabs', '.tab-container'];
            break;
          case 'teacher-table':
            selectors = ['.teacher-table', '.el-table', '.staff-table'];
            break;
          case 'add-btn':
            selectors = ['.add-btn', '.create-btn', '.el-button--primary'];
            break;
          case 'department-filters':
            selectors = ['.department-filter', '.el-select', '.filter-department'];
            break;
          default:
            selectors = [`.${element}`, `[class*="${element}"]`, `[data-type="${element}"]`];
        }

        let found = false;
        let working = false;
        let foundSelector = null;

        for (const selector of selectors) {
          try {
            const elementFound = await this.page.$(selector);
            if (elementFound) {
              found = true;
              working = await elementFound.isVisible();
              foundSelector = selector;
              break;
            }
          } catch (error) {
            // 继续尝试下一个选择器
          }
        }

        results.push({
          type: 'specific',
          selector: foundSelector || element,
          description: `预期功能: ${element}`,
          working: found && working,
          found: found,
          visible: working,
          error: found ? (working ? null : '元素不可见') : '元素不存在'
        });

      } catch (error) {
        results.push({
          type: 'specific',
          selector: element,
          description: `预期功能: ${element}`,
          working: false,
          found: false,
          visible: false,
          error: `检测失败: ${error.message}`
        });
      }
    }

    return results;
  }

  /**
   * 运行全面测试
   */
  async runComprehensiveTest() {
    console.log('🚀 开始全面侧边栏页面测试...');

    try {
      // 初始化
      if (!await this.init()) {
        throw new Error('浏览器初始化失败');
      }

      // 登录
      if (!await this.login()) {
        throw new Error('登录失败');
      }

      const allResults = {
        summary: {
          totalCategories: Object.keys(this.sidebarStructure).length,
          totalPages: 0,
          pagesTested: 0,
          pagesPassed: 0,
          pagesFailed: 0,
          totalElements: 0,
          workingElements: 0,
          brokenElements: 0,
          consoleErrors: 0,
          pageErrors: 0,
          networkErrors: 0
        },
        categories: {},
        issues: []
      };

      // 遍历所有侧边栏分类和页面
      for (const [categoryName, categoryData] of Object.entries(this.sidebarStructure)) {
        console.log(`\n📂 测试分类: ${categoryName}`);

        const categoryResults = {
          name: categoryName,
          pages: [],
          summary: {
            total: categoryData.pages.length,
            tested: 0,
            passed: 0,
            failed: 0
          }
        };

        allResults.summary.totalPages += categoryData.pages.length;

        for (const pageInfo of categoryData.pages) {
          const pageResult = await this.deepTestPage(pageInfo);
          categoryResults.pages.push(pageResult);
          categoryResults.summary.tested++;

          allResults.summary.pagesTested++;
          allResults.summary.totalElements += pageResult.elementsFound.total || 0;
          allResults.summary.workingElements += pageResult.elementsWorking.total || 0;
          allResults.summary.brokenElements += (pageResult.elementsFound.total || 0) - (pageResult.elementsWorking.total || 0);
          allResults.summary.consoleErrors += pageResult.consoleMessages.length;
          allResults.summary.pageErrors += pageResult.pageErrors.length;
          allResults.summary.networkErrors += pageResult.networkErrors.length;

          if (pageResult.success) {
            categoryResults.summary.passed++;
            allResults.summary.pagesPassed++;
          } else {
            categoryResults.summary.failed++;
            allResults.summary.pagesFailed++;

            // 收集问题
            if (pageResult.elementsBroken.length > 0) {
              allResults.issues.push(...pageResult.elementsBroken);
            }
            if (pageResult.consoleMessages.length > 0) {
              allResults.issues.push(...pageResult.consoleMessages);
            }
            if (pageResult.pageErrors.length > 0) {
              allResults.issues.push(...pageResult.pageErrors);
            }
          }
        }

        allResults.categories[categoryName] = categoryResults;
      }

      // 生成详细报告
      this.generateComprehensiveReport(allResults);

      this.testResults = allResults;
      return allResults;

    } catch (error) {
      console.error('❌ 全面测试失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成详细报告
   */
  generateComprehensiveReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 全面侧边栏页面测试报告');
    console.log('='.repeat(80));

    const summary = results.summary;

    console.log(`\n📈 总体统计:`);
    console.log(`   分类数量: ${summary.totalCategories}`);
    console.log(`   页面总数: ${summary.totalPages}`);
    console.log(`   已测试: ${summary.pagesTested}`);
    console.log(`   ✅ 通过: ${summary.pagesPassed}`);
    console.log(`   ❌ 失败: ${summary.pagesFailed}`);
    console.log(`   成功率: ${((summary.pagesPassed / summary.pagesTested) * 100).toFixed(1)}%`);

    console.log(`\n🔧 元素统计:`);
    console.log(`   总元素数: ${summary.totalElements}`);
    console.log(`   ✅ 正常工作: ${summary.workingElements}`);
    console.log(`   ❌ 问题元素: ${summary.brokenElements}`);
    console.log(`   元素健康率: ${((summary.workingElements / summary.totalElements) * 100).toFixed(1)}%`);

    console.log(`\n⚠️ 错误统计:`);
    console.log(`   控制台错误: ${summary.consoleErrors}`);
    console.log(`   页面错误: ${summary.pageErrors}`);
    console.log(`   网络错误: ${summary.networkErrors}`);
    console.log(`   总问题数: ${results.issues.length}`);

    // 按分类显示详情
    console.log(`\n📋 分类详情:`);
    for (const [categoryName, categoryData] of Object.entries(results.categories)) {
      console.log(`\n   📁 ${categoryName} (${categoryData.summary.passed}/${categoryData.summary.total} 通过):`);

      for (const pageData of categoryData.pages) {
        const status = pageData.success ? '✅' : '❌';
        const elementRate = pageData.elementsFound.total > 0 ?
          ((pageData.elementsWorking.total / pageData.elementsFound.total) * 100).toFixed(1) : '0.0';

        console.log(`      ${status} ${pageData.name} (${elementRate}% 元素正常)`);

        if (!pageData.success && pageData.elementsBroken.length > 0) {
          console.log(`         问题: ${pageData.elementsBroken.slice(0, 3).map(e => e.description).join(', ')}`);
        }
      }
    }

    // 显示主要问题
    if (results.issues.length > 0) {
      console.log(`\n🚨 主要问题 (前10个):`);
      results.issues.slice(0, 10).forEach((issue, index) => {
        const description = issue.description || issue.message || issue.text || '未知问题';
        console.log(`   ${index + 1}. ${description}`);
      });

      if (results.issues.length > 10) {
        console.log(`   ... 还有 ${results.issues.length - 10} 个问题`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🏁 测试完成');
    console.log('='.repeat(80));
  }

  /**
   * 清理资源
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 浏览器已关闭');
    }
  }
}

// 主执行函数
async function main() {
  const tester = new ComprehensiveSidebarTestSystem();

  try {
    const results = await tester.runComprehensiveTest();

    // 保存结果到文件
    const fs = require('fs');
    const reportData = {
      timestamp: new Date().toISOString(),
      results: results
    };

    fs.writeFileSync(
      '/home/zhgue/kyyupgame/k.yyup.com/comprehensive-sidebar-test-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 详细报告已保存到: comprehensive-sidebar-test-report.json');

  } catch (error) {
    console.error('❌ 测试执行失败:', error.message);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveSidebarTestSystem;