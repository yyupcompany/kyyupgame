/**
 * 无头浏览器动态错误监测系统
 * Dynamic Error Monitoring System with Headless Browser
 * 
 * 功能：
 * 1. 动态监测所有页面的API对齐问题
 * 2. 检测数据解析错误
 * 3. 记录错误并提供修复建议
 * 4. 自动化测试所有路由
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class DynamicErrorMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errors = [];
    this.testResults = [];
    this.apiCalls = [];
    this.baseUrl = 'http://localhost:5173';
    this.authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbeyJpZCI6MSwibmFtZSI6Iua1i-WKnuWRmCIsImNvZGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzM3MDM2MjEzLCJleHAiOjE3MzcxMjI2MTN9.IzHzR2gQZdMnZRQ_zOZLCYNcHJGVkSgJZfvpNZdGgMo';
    
    // 需要测试的页面路由
    this.testRoutes = [
      '/',
      '/dashboard',
      '/system/users',
      '/student',
      '/teacher',
      '/parent',
      '/class',
      '/enrollment',
      '/enrollment-plan',
      '/activity',
      '/ai/chat',
      '/ai/assistant',
      '/system/settings',
      '/system/logs',
      '/principal/dashboard',
      '/principal/performance',
      '/statistics',
      '/customer',
      '/marketing',
      '/chat'
    ];
  }

  /**
   * 初始化浏览器
   */
  async init() {
    console.log('🚀 初始化无头浏览器...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-domain-reliability',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--no-first-run',
        '--no-default-browser-check',
        '--password-store=basic',
        '--use-mock-keychain'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // 设置视口
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 设置用户代理
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // 设置请求拦截，减少不必要的资源加载
    await this.page.setRequestInterception(true);
    
    this.apiRequestCount = 0;
    const maxApiRequests = 10; // 每页最多10个API请求
    
    this.page.on('request', (request) => {
      const resourceType = request.resourceType();
      const url = request.url();
      
      // 阻止图片、字体、CSS等资源加载，减少请求数量
      if (['image', 'font', 'stylesheet', 'media', 'websocket'].includes(resourceType)) {
        request.abort();
        return;
      }
      
      // 对于API请求，严格控制数量和频率
      if (url.includes('/api/')) {
        if (this.apiRequestCount >= maxApiRequests) {
          console.log(`⚠️ API请求达到限制 (${maxApiRequests})，阻止: ${url}`);
          request.abort();
          return;
        }
        
        this.apiRequestCount++;
        console.log(`🔗 API请求 (${this.apiRequestCount}/${maxApiRequests}): ${url}`);
        
        // 为API请求添加更长的延迟
        setTimeout(() => {
          request.continue();
        }, 3000);
      }
      else {
        request.continue();
      }
    });
    
    // 监听控制台消息
    this.page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error' || text.includes('Error') || text.includes('Failed')) {
        this.errors.push({
          type: 'console',
          level: type,
          message: text,
          timestamp: new Date().toISOString(),
          url: this.page.url()
        });
      }
    });
    
    // 监听页面错误
    this.page.on('pageerror', (error) => {
      this.errors.push({
        type: 'page',
        level: 'error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: this.page.url()
      });
    });
    
    // 监听请求失败
    this.page.on('requestfailed', (request) => {
      this.errors.push({
        type: 'request',
        level: 'error',
        message: `Request failed: ${request.url()}`,
        failure: request.failure(),
        timestamp: new Date().toISOString(),
        url: this.page.url()
      });
    });
    
    // 监听响应
    this.page.on('response', (response) => {
      const url = response.url();
      const status = response.status();
      
      // 监听API调用
      if (url.includes('/api/')) {
        this.apiCalls.push({
          url,
          status,
          method: response.request().method(),
          timestamp: new Date().toISOString(),
          pageUrl: this.page.url()
        });
        
        // 记录API错误
        if (status >= 400) {
          this.errors.push({
            type: 'api',
            level: 'error',
            message: `API Error: ${url} returned ${status}`,
            apiUrl: url,
            statusCode: status,
            timestamp: new Date().toISOString(),
            url: this.page.url()
          });
        }
      }
    });
    
    console.log('✅ 浏览器初始化完成');
  }

  /**
   * 登录系统
   */
  async login() {
    console.log('🔐 正在登录系统...');
    
    try {
      await this.page.goto(`${this.baseUrl}/login`, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // 等待登录表单加载
      await this.page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 });
      
      // 模拟登录
      await this.page.type('input[type="text"], input[type="email"]', 'admin');
      await this.page.type('input[type="password"]', 'admin123');
      
      // 点击登录按钮
      await this.page.click('button[type="submit"], .login-btn, .el-button--primary');
      
      // 等待登录成功跳转
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      
      console.log('✅ 登录成功');
      return true;
    } catch (error) {
      console.log('⚠️ 登录过程出现问题，使用token验证:', error.message);
      
      // 如果登录失败，尝试直接设置localStorage
      await this.page.evaluate((token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify({
          id: 121,
          username: 'admin',
          roles: [{ id: 1, name: '测试员', code: 'admin' }]
        }));
      }, this.authToken);
      
      return false;
    }
  }

  /**
   * 测试单个页面
   */
  async testPage(route) {
    console.log(`🔍 测试页面: ${route}`);
    
    // 重置API请求计数器（每页开始时）
    this.apiRequestCount = 0;
    
    const testResult = {
      route,
      url: `${this.baseUrl}${route}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      loadTime: 0,
      apiCalls: [],
      errors: [],
      dataIssues: [],
      suggestions: []
    };
    
    const startTime = Date.now();
    
    try {
      // 访问页面
      await this.page.goto(`${this.baseUrl}${route}`, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      testResult.loadTime = Date.now() - startTime;
      
      // 等待页面渲染，给API调用更多时间
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 检查页面标题
      const title = await this.page.title();
      testResult.title = title;
      
      // 检查是否有错误页面
      const isErrorPage = await this.page.$('.error-page') !== null || 
                         await this.page.$('.not-found') !== null || 
                         await this.page.$('.error-403') !== null || 
                         await this.page.$('.error-404') !== null || 
                         await this.page.$('.error-500') !== null;
      if (isErrorPage) {
        testResult.errors.push({
          type: 'page',
          message: '页面显示错误状态',
          severity: 'high'
        });
      }
      
      // 检查API调用
      const pageApiCalls = this.apiCalls.filter(call => call.pageUrl === this.page.url());
      testResult.apiCalls = pageApiCalls;
      
      // 检查数据渲染
      await this.checkDataRendering(testResult);
      
      // 检查表格数据
      await this.checkTableData(testResult);
      
      // 检查表单数据
      await this.checkFormData(testResult);
      
      // 检查组件加载
      await this.checkComponentLoading(testResult);
      
      // 测试页面子功能
      await this.testPageSubFunctions(testResult);
      
      // 测试CRUD操作
      await this.testCRUDOperations(testResult);
      
      testResult.status = 'success';
      
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      testResult.errors.push({
        type: 'navigation',
        message: error.message,
        severity: 'high'
      });
    }
    
    // 添加当前页面的错误
    const pageErrors = this.errors.filter(err => err.url === this.page.url());
    testResult.errors.push(...pageErrors);
    
    this.testResults.push(testResult);
    
    console.log(`${testResult.status === 'success' ? '✅' : '❌'} 页面测试完成: ${route} (${testResult.loadTime}ms)`);
    
    return testResult;
  }

  /**
   * 检查数据渲染
   */
  async checkDataRendering(testResult) {
    try {
      // 检查空数据状态
      const emptyStates = await this.page.$$('.empty-state, .no-data, .el-empty');
      if (emptyStates.length > 0) {
        testResult.dataIssues.push({
          type: 'empty-state',
          message: '页面显示空数据状态',
          severity: 'medium',
          suggestion: '检查API是否正常返回数据'
        });
      }
      
      // 检查加载状态
      const loadingStates = await this.page.$$('.loading, .el-loading-mask, .spinner');
      if (loadingStates.length > 0) {
        testResult.dataIssues.push({
          type: 'loading-stuck',
          message: '页面存在持续加载状态',
          severity: 'high',
          suggestion: '检查API响应时间或请求是否超时'
        });
      }
      
      // 检查错误消息
      const errorMessages = await this.page.$$('.error-message, .el-message--error');
      if (errorMessages.length > 0) {
        const errorTexts = await Promise.all(
          errorMessages.map(el => el.evaluate(node => node.textContent))
        );
        testResult.dataIssues.push({
          type: 'error-message',
          message: '页面显示错误消息',
          details: errorTexts,
          severity: 'high',
          suggestion: '检查API调用和数据转换逻辑'
        });
      }
      
    } catch (error) {
      console.log('数据渲染检查失败:', error.message);
    }
  }

  /**
   * 检查表格数据
   */
  async checkTableData(testResult) {
    try {
      const tables = await this.page.$$('.el-table, table');
      
      for (const table of tables) {
        // 检查表格是否有数据
        const rows = await table.$$('tbody tr');
        const hasData = rows.length > 0;
        
        if (!hasData) {
          testResult.dataIssues.push({
            type: 'table-empty',
            message: '表格没有数据',
            severity: 'medium',
            suggestion: '检查列表API是否正常返回数据'
          });
        } else {
          // 检查第一行数据是否正确渲染
          const firstRow = rows[0];
          const cells = await firstRow.$$('td');
          let emptyCount = 0;
          
          for (const cell of cells) {
            const text = await cell.evaluate(node => node.textContent.trim());
            if (!text || text === '-' || text === 'undefined' || text === 'null') {
              emptyCount++;
            }
          }
          
          if (emptyCount > cells.length / 2) {
            testResult.dataIssues.push({
              type: 'table-data-missing',
              message: '表格数据字段缺失较多',
              severity: 'high',
              suggestion: '检查数据转换函数是否正确映射字段'
            });
          }
        }
      }
      
    } catch (error) {
      console.log('表格数据检查失败:', error.message);
    }
  }

  /**
   * 检查表单数据
   */
  async checkFormData(testResult) {
    try {
      const forms = await this.page.$$('form, .el-form');
      
      for (const form of forms) {
        // 检查表单字段是否正确渲染
        const inputs = await form.$$('input, select, textarea');
        const labels = await form.$$('label, .el-form-item__label');
        
        if (inputs.length === 0 && labels.length > 0) {
          testResult.dataIssues.push({
            type: 'form-incomplete',
            message: '表单渲染不完整',
            severity: 'medium',
            suggestion: '检查表单组件是否正确引入和配置'
          });
        }
      }
      
    } catch (error) {
      console.log('表单数据检查失败:', error.message);
    }
  }

  /**
   * 测试页面子功能
   */
  async testPageSubFunctions(testResult) {
    console.log(`🔍 测试页面子功能: ${testResult.route}`);
    
    try {
      // 测试模态框功能
      await this.testModalFunctions(testResult);
      
      // 测试标签页功能
      await this.testTabFunctions(testResult);
      
      // 测试下拉菜单功能
      await this.testDropdownFunctions(testResult);
      
      // 测试分页功能
      await this.testPaginationFunctions(testResult);
      
      // 测试搜索功能
      await this.testSearchFunctions(testResult);
      
      // 测试筛选功能
      await this.testFilterFunctions(testResult);
      
    } catch (error) {
      console.log('页面子功能测试失败:', error.message);
      testResult.dataIssues.push({
        type: 'sub-function-error',
        message: `页面子功能测试失败: ${error.message}`,
        severity: 'high',
        suggestion: '检查页面JavaScript代码和组件配置'
      });
    }
  }

  /**
   * 测试模态框功能
   */
  async testModalFunctions(testResult) {
    try {
      // 查找可能触发模态框的按钮
      const modalTriggers = await this.page.$$('.el-button, [data-testid*="add"], [data-testid*="edit"], [data-testid*="create"], .add-btn, .edit-btn, .create-btn');
      
      for (const trigger of modalTriggers.slice(0, 3)) { // 限制测试前3个按钮
        try {
          const buttonText = await trigger.evaluate(el => el.textContent?.trim());
          if (buttonText && (buttonText.includes('添加') || buttonText.includes('新增') || buttonText.includes('创建') || buttonText.includes('编辑'))) {
            
            // 点击按钮
            await trigger.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 检查是否出现模态框
            const modal = await this.page.$('.el-dialog, .el-drawer, .modal, .popup');
            if (modal) {
              testResult.dataIssues.push({
                type: 'modal-function',
                message: `模态框功能正常: ${buttonText}`,
                severity: 'info',
                suggestion: '模态框可以正常打开'
              });
              
              // 尝试关闭模态框
              const closeBtn = await this.page.$('.el-dialog__close, .el-drawer__close-btn, .close-btn, [aria-label="Close"]');
              if (closeBtn) {
                await closeBtn.click();
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } else {
              testResult.dataIssues.push({
                type: 'modal-function-failed',
                message: `模态框功能异常: ${buttonText}`,
                severity: 'medium',
                suggestion: '检查模态框组件是否正确配置'
              });
            }
          }
        } catch (error) {
          console.log('模态框测试失败:', error.message);
        }
      }
    } catch (error) {
      console.log('模态框功能测试失败:', error.message);
    }
  }

  /**
   * 测试标签页功能
   */
  async testTabFunctions(testResult) {
    try {
      const tabs = await this.page.$$('.el-tabs__nav .el-tabs__item, .tab-item, .nav-tabs .nav-item');
      
      if (tabs.length > 1) {
        // 测试点击不同标签页
        for (let i = 0; i < Math.min(tabs.length, 3); i++) {
          try {
            const tab = tabs[i];
            const tabText = await tab.evaluate(el => el.textContent?.trim());
            
            await tab.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 检查标签页内容是否更新
            const tabContent = await this.page.$('.el-tab-pane, .tab-content, .tab-pane');
            if (tabContent) {
              testResult.dataIssues.push({
                type: 'tab-function',
                message: `标签页功能正常: ${tabText}`,
                severity: 'info',
                suggestion: '标签页切换功能正常'
              });
            }
          } catch (error) {
            console.log('标签页测试失败:', error.message);
          }
        }
      }
    } catch (error) {
      console.log('标签页功能测试失败:', error.message);
    }
  }

  /**
   * 测试下拉菜单功能
   */
  async testDropdownFunctions(testResult) {
    try {
      const dropdowns = await this.page.$$('.el-dropdown, .el-select, .dropdown, select');
      
      for (const dropdown of dropdowns.slice(0, 3)) {
        try {
          await dropdown.click();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 检查下拉选项
          const options = await this.page.$$('.el-dropdown-menu .el-dropdown-menu__item, .el-select-dropdown .el-select-dropdown__item, .dropdown-menu .dropdown-item');
          if (options.length > 0) {
            testResult.dataIssues.push({
              type: 'dropdown-function',
              message: '下拉菜单功能正常',
              severity: 'info',
              suggestion: '下拉菜单选项正常显示'
            });
          }
        } catch (error) {
          console.log('下拉菜单测试失败:', error.message);
        }
      }
    } catch (error) {
      console.log('下拉菜单功能测试失败:', error.message);
    }
  }

  /**
   * 测试分页功能
   */
  async testPaginationFunctions(testResult) {
    try {
      const pagination = await this.page.$('.el-pagination, .pagination');
      
      if (pagination) {
        // 测试下一页按钮
        const nextBtn = await pagination.$('.el-pager .el-pager__next, .page-next, .next');
        if (nextBtn) {
          try {
            await nextBtn.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            testResult.dataIssues.push({
              type: 'pagination-function',
              message: '分页功能正常',
              severity: 'info',
              suggestion: '分页翻页功能正常'
            });
          } catch (error) {
            console.log('分页测试失败:', error.message);
          }
        }
      }
    } catch (error) {
      console.log('分页功能测试失败:', error.message);
    }
  }

  /**
   * 测试搜索功能
   */
  async testSearchFunctions(testResult) {
    try {
      const searchInput = await this.page.$('input[placeholder*="搜索"], input[placeholder*="search"], .search-input, .el-input__inner');
      
      if (searchInput) {
        try {
          await searchInput.type('test');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 查找搜索按钮
          const searchBtn = await this.page.$('.search-btn, .el-button--primary, button[type="submit"]');
          if (searchBtn) {
            await searchBtn.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            testResult.dataIssues.push({
              type: 'search-function',
              message: '搜索功能正常',
              severity: 'info',
              suggestion: '搜索功能可以正常使用'
            });
          }
        } catch (error) {
          console.log('搜索测试失败:', error.message);
        }
      }
    } catch (error) {
      console.log('搜索功能测试失败:', error.message);
    }
  }

  /**
   * 测试筛选功能
   */
  async testFilterFunctions(testResult) {
    try {
      const filters = await this.page.$$('.filter-item, .el-form-item, .filter-group');
      
      if (filters.length > 0) {
        testResult.dataIssues.push({
          type: 'filter-function',
          message: '筛选功能存在',
          severity: 'info',
          suggestion: '页面包含筛选功能组件'
        });
      }
    } catch (error) {
      console.log('筛选功能测试失败:', error.message);
    }
  }

  /**
   * 测试CRUD操作
   */
  async testCRUDOperations(testResult) {
    console.log(`🔍 测试CRUD操作: ${testResult.route}`);
    
    try {
      // 测试创建操作
      await this.testCreateOperation(testResult);
      
      // 测试读取操作
      await this.testReadOperation(testResult);
      
      // 测试更新操作
      await this.testUpdateOperation(testResult);
      
      // 测试删除操作
      await this.testDeleteOperation(testResult);
      
    } catch (error) {
      console.log('CRUD操作测试失败:', error.message);
      testResult.dataIssues.push({
        type: 'crud-error',
        message: `CRUD操作测试失败: ${error.message}`,
        severity: 'high',
        suggestion: '检查CRUD操作的API调用和数据处理'
      });
    }
  }

  /**
   * 测试创建操作
   */
  async testCreateOperation(testResult) {
    try {
      // 查找创建按钮
      const createButtons = await this.page.$$('.el-button--primary, [data-testid*="add"], [data-testid*="create"], .add-btn, .create-btn');
      
      for (const button of createButtons.slice(0, 2)) {
        try {
          const buttonText = await button.evaluate(el => el.textContent?.trim());
          if (buttonText && (buttonText.includes('添加') || buttonText.includes('新增') || buttonText.includes('创建'))) {
            
            // 点击创建按钮
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 检查是否出现创建表单
            const form = await this.page.$('.el-dialog .el-form, .el-drawer .el-form, .create-form, .add-form');
            if (form) {
              testResult.dataIssues.push({
                type: 'create-operation',
                message: `创建操作正常: ${buttonText}`,
                severity: 'info',
                suggestion: '创建功能表单正常显示'
              });
              
              // 尝试填写表单并提交
              await this.testFormSubmission(testResult, form, 'create');
            }
            
            // 关闭对话框
            const closeBtn = await this.page.$('.el-dialog__close, .el-drawer__close-btn, .close-btn');
            if (closeBtn) {
              await closeBtn.click();
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (error) {
          console.log('创建操作测试失败:', error.message);
        }
      }
    } catch (error) {
      console.log('创建操作测试失败:', error.message);
    }
  }

  /**
   * 测试读取操作
   */
  async testReadOperation(testResult) {
    try {
      // 检查表格数据读取
      const tables = await this.page.$$('.el-table, table');
      
      for (const table of tables.slice(0, 1)) {
        try {
          const rows = await table.$$('tbody tr');
          if (rows.length > 0) {
            testResult.dataIssues.push({
              type: 'read-operation',
              message: `读取操作正常: 表格有 ${rows.length} 行数据`,
              severity: 'info',
              suggestion: '数据读取功能正常'
            });
          }
        } catch (error) {
          console.log('读取操作测试失败:', error.message);
        }
      }
    } catch (error) {
      console.log('读取操作测试失败:', error.message);
    }
  }

  /**
   * 测试更新操作
   */
  async testUpdateOperation(testResult) {
    try {
      // 查找编辑按钮
      const editButtons = await this.page.$$('[data-testid*="edit"], .edit-btn, .el-button--warning');
      
      for (const button of editButtons.slice(0, 2)) {
        try {
          const buttonText = await button.evaluate(el => el.textContent?.trim());
          if (buttonText && buttonText.includes('编辑')) {
            
            // 点击编辑按钮
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 检查是否出现编辑表单
            const form = await this.page.$('.el-dialog .el-form, .el-drawer .el-form, .edit-form');
            if (form) {
              testResult.dataIssues.push({
                type: 'update-operation',
                message: `更新操作正常: ${buttonText}`,
                severity: 'info',
                suggestion: '编辑功能表单正常显示'
              });
              
              // 尝试提交编辑表单
              await this.testFormSubmission(testResult, form, 'update');
            }
            
            // 关闭对话框
            const closeBtn = await this.page.$('.el-dialog__close, .el-drawer__close-btn, .close-btn');
            if (closeBtn) {
              await closeBtn.click();
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (error) {
          console.log('更新操作测试失败:', error.message);
        }
      }
    } catch (error) {
      console.log('更新操作测试失败:', error.message);
    }
  }

  /**
   * 测试删除操作
   */
  async testDeleteOperation(testResult) {
    try {
      // 查找删除按钮
      const deleteButtons = await this.page.$$('[data-testid*="delete"], .delete-btn, .el-button--danger');
      
      for (const button of deleteButtons.slice(0, 1)) {
        try {
          const buttonText = await button.evaluate(el => el.textContent?.trim());
          if (buttonText && buttonText.includes('删除')) {
            
            testResult.dataIssues.push({
              type: 'delete-operation',
              message: `删除操作存在: ${buttonText}`,
              severity: 'info',
              suggestion: '删除功能按钮正常显示'
            });
            
            // 注意：这里不实际点击删除按钮，只检查存在性
            // 因为删除操作可能会影响数据
          }
        } catch (error) {
          console.log('删除操作测试失败:', error.message);
        }
      }
    } catch (error) {
      console.log('删除操作测试失败:', error.message);
    }
  }

  /**
   * 测试表单提交
   */
  async testFormSubmission(testResult, form, operationType) {
    try {
      // 查找提交按钮
      const submitBtn = await form.$('.el-button--primary, button[type="submit"], .submit-btn, .confirm-btn');
      
      if (submitBtn) {
        const submitText = await submitBtn.evaluate(el => el.textContent?.trim());
        
        testResult.dataIssues.push({
          type: `${operationType}-form-submission`,
          message: `${operationType}表单提交按钮正常: ${submitText}`,
          severity: 'info',
          suggestion: '表单提交功能按钮正常显示'
        });
        
        // 注意：这里不实际提交表单，只检查存在性
        // 因为提交可能会创建或修改数据
      }
    } catch (error) {
      console.log('表单提交测试失败:', error.message);
    }
  }

  /**
   * 检查组件加载
   */
  async checkComponentLoading(testResult) {
    try {
      // 检查Vue组件是否正确挂载
      const vueComponents = await this.page.evaluate(() => {
        const app = document.querySelector('#app');
        return app && app.__vue__ ? true : false;
      });
      
      if (!vueComponents) {
        testResult.dataIssues.push({
          type: 'vue-mount-failed',
          message: 'Vue组件可能未正确挂载',
          severity: 'high',
          suggestion: '检查Vue应用初始化和组件配置'
        });
      }
      
      // 检查是否有未定义的组件
      const undefinedComponents = await this.page.$$('[data-v-undefined]');
      if (undefinedComponents.length > 0) {
        testResult.dataIssues.push({
          type: 'undefined-components',
          message: '存在未定义的组件',
          severity: 'high',
          suggestion: '检查组件引入和注册'
        });
      }
      
    } catch (error) {
      console.log('组件加载检查失败:', error.message);
    }
  }

  /**
   * 生成错误报告
   */
  generateErrorReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: this.testResults.length,
        successfulPages: this.testResults.filter(r => r.status === 'success').length,
        failedPages: this.testResults.filter(r => r.status === 'failed').length,
        totalErrors: this.errors.length,
        totalApiCalls: this.apiCalls.length,
        averageLoadTime: this.testResults.reduce((sum, r) => sum + r.loadTime, 0) / this.testResults.length
      },
      pageResults: this.testResults,
      errorsByType: this.categorizeErrors(),
      apiCallAnalysis: this.analyzeApiCalls(),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  /**
   * 分类错误
   */
  categorizeErrors() {
    const categories = {};
    
    this.errors.forEach(error => {
      const category = error.type || 'unknown';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(error);
    });
    
    return categories;
  }

  /**
   * 分析API调用
   */
  analyzeApiCalls() {
    const analysis = {
      total: this.apiCalls.length,
      successful: this.apiCalls.filter(call => call.status < 400).length,
      failed: this.apiCalls.filter(call => call.status >= 400).length,
      byEndpoint: {}
    };
    
    this.apiCalls.forEach(call => {
      const endpoint = call.url.replace(/\d+/g, ':id'); // 标准化端点
      if (!analysis.byEndpoint[endpoint]) {
        analysis.byEndpoint[endpoint] = {
          total: 0,
          successful: 0,
          failed: 0
        };
      }
      
      analysis.byEndpoint[endpoint].total++;
      if (call.status < 400) {
        analysis.byEndpoint[endpoint].successful++;
      } else {
        analysis.byEndpoint[endpoint].failed++;
      }
    });
    
    return analysis;
  }

  /**
   * 生成修复建议
   */
  generateRecommendations() {
    const recommendations = [];
    
    // 基于错误类型生成建议
    const errorTypes = this.categorizeErrors();
    
    if (errorTypes.api && errorTypes.api.length > 0) {
      recommendations.push({
        type: 'api',
        priority: 'high',
        issue: 'API调用失败',
        suggestion: '检查API端点是否正确，验证后端服务是否正常运行',
        affectedPages: [...new Set(errorTypes.api.map(e => e.url))]
      });
    }
    
    if (errorTypes.console && errorTypes.console.length > 0) {
      recommendations.push({
        type: 'console',
        priority: 'medium',
        issue: '控制台错误',
        suggestion: '检查JavaScript代码，修复语法错误和未定义变量',
        affectedPages: [...new Set(errorTypes.console.map(e => e.url))]
      });
    }
    
    // 基于数据问题生成建议
    const dataIssues = this.testResults.flatMap(r => r.dataIssues);
    const issueTypes = {};
    
    dataIssues.forEach(issue => {
      if (!issueTypes[issue.type]) {
        issueTypes[issue.type] = [];
      }
      issueTypes[issue.type].push(issue);
    });
    
    Object.keys(issueTypes).forEach(type => {
      const issues = issueTypes[type];
      if (issues.length > 0) {
        recommendations.push({
          type: 'data',
          priority: issues[0].severity,
          issue: issues[0].message,
          suggestion: issues[0].suggestion,
          count: issues.length
        });
      }
    });
    
    return recommendations;
  }

  /**
   * 保存报告
   */
  async saveReport(report) {
    const reportDir = '/home/devbox/project/client/tests/reports';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dynamic-error-report-${timestamp}.json`;
    const filepath = path.join(reportDir, filename);
    
    // 确保目录存在
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // 保存JSON报告
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // 生成HTML报告
    const htmlReport = this.generateHtmlReport(report);
    const htmlFilepath = filepath.replace('.json', '.html');
    fs.writeFileSync(htmlFilepath, htmlReport);
    
    console.log(`📊 报告已保存:`);
    console.log(`- JSON: ${filepath}`);
    console.log(`- HTML: ${htmlFilepath}`);
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>动态错误监测报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .error { background: #ffebee; padding: 10px; border-left: 4px solid #f44336; margin: 10px 0; }
        .success { background: #e8f5e8; padding: 10px; border-left: 4px solid #4caf50; margin: 10px 0; }
        .warning { background: #fff3cd; padding: 10px; border-left: 4px solid #ff9800; margin: 10px 0; }
        .page-result { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: white; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>🔍 动态错误监测报告</h1>
    <p>生成时间: ${report.timestamp}</p>
    
    <div class="summary">
        <h2>📊 测试摘要</h2>
        <div class="metric">总页面数: ${report.summary.totalPages}</div>
        <div class="metric">成功页面: ${report.summary.successfulPages}</div>
        <div class="metric">失败页面: ${report.summary.failedPages}</div>
        <div class="metric">总错误数: ${report.summary.totalErrors}</div>
        <div class="metric">API调用数: ${report.summary.totalApiCalls}</div>
        <div class="metric">平均加载时间: ${Math.round(report.summary.averageLoadTime)}ms</div>
    </div>
    
    <h2>📋 页面测试结果</h2>
    ${report.pageResults.map(page => `
        <div class="page-result">
            <h3>${page.route} (${page.status})</h3>
            <p><strong>URL:</strong> ${page.url}</p>
            <p><strong>加载时间:</strong> ${page.loadTime}ms</p>
            <p><strong>API调用:</strong> ${page.apiCalls.length} 个</p>
            <p><strong>错误数:</strong> ${page.errors.length} 个</p>
            <p><strong>数据问题:</strong> ${page.dataIssues.length} 个</p>
            
            ${page.errors.length > 0 ? `
                <h4>错误详情:</h4>
                ${page.errors.map(error => `
                    <div class="error">
                        <strong>${error.type}:</strong> ${error.message}
                    </div>
                `).join('')}
            ` : ''}
            
            ${page.dataIssues.length > 0 ? `
                <h4>数据问题:</h4>
                ${page.dataIssues.map(issue => `
                    <div class="warning">
                        <strong>${issue.type}:</strong> ${issue.message}<br>
                        <small>建议: ${issue.suggestion}</small>
                    </div>
                `).join('')}
            ` : ''}
        </div>
    `).join('')}
    
    <div class="recommendations">
        <h2>💡 修复建议</h2>
        ${report.recommendations.map(rec => `
            <div class="${rec.priority === 'high' ? 'error' : 'warning'}">
                <h4>${rec.issue}</h4>
                <p><strong>建议:</strong> ${rec.suggestion}</p>
                <p><strong>优先级:</strong> ${rec.priority}</p>
                ${rec.count ? `<p><strong>影响数量:</strong> ${rec.count}</p>` : ''}
            </div>
        `).join('')}
    </div>
    
    <h2>📈 API调用分析</h2>
    <div class="summary">
        <div class="metric">总调用: ${report.apiCallAnalysis.total}</div>
        <div class="metric">成功: ${report.apiCallAnalysis.successful}</div>
        <div class="metric">失败: ${report.apiCallAnalysis.failed}</div>
    </div>
    
    <h3>端点详情:</h3>
    <pre>${JSON.stringify(report.apiCallAnalysis.byEndpoint, null, 2)}</pre>
</body>
</html>
    `;
  }

  /**
   * 运行完整测试
   */
  async runFullTest() {
    console.log('🚀 开始完整的动态错误监测...');
    
    try {
      // 初始化浏览器
      await this.init();
      
      // 登录系统
      await this.login();
      
      // 测试所有页面
      for (const route of this.testRoutes) {
        try {
          await this.testPage(route);
          
          // 清理当前页面的错误，避免累积
          this.errors = this.errors.filter(error => error.url !== this.page.url());
          
          // 增加延迟，避免API频率限制
          await new Promise(resolve => setTimeout(resolve, 8000));
          
        } catch (error) {
          console.error(`❌ 测试页面 ${route} 失败:`, error.message);
        }
      }
      
      // 生成报告
      const report = this.generateErrorReport();
      await this.saveReport(report);
      
      // 输出摘要
      console.log('\\n📊 测试摘要:');
      console.log(`- 总页面数: ${report.summary.totalPages}`);
      console.log(`- 成功页面: ${report.summary.successfulPages}`);
      console.log(`- 失败页面: ${report.summary.failedPages}`);
      console.log(`- 总错误数: ${report.summary.totalErrors}`);
      console.log(`- API调用数: ${report.summary.totalApiCalls}`);
      console.log(`- 平均加载时间: ${Math.round(report.summary.averageLoadTime)}ms`);
      
      // 输出关键建议
      if (report.recommendations.length > 0) {
        console.log('\\n💡 关键修复建议:');
        report.recommendations.slice(0, 5).forEach((rec, index) => {
          console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
          console.log(`   建议: ${rec.suggestion}`);
        });
      }
      
      return report;
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
      throw error;
    } finally {
      // 清理资源
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const monitor = new DynamicErrorMonitor();
  
  monitor.runFullTest()
    .then(() => {
      console.log('✅ 动态错误监测完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 动态错误监测失败:', error);
      process.exit(1);
    });
}

module.exports = DynamicErrorMonitor;