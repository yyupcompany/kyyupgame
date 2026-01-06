#!/usr/bin/env node

/**
 * MCP浏览器CRUD测试脚本
 * 
 * 测试客户申请审批功能的完整CRUD操作
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  static info(message) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  }

  static error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }

  static warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  static section(title) {
    console.log(`\n${colors.bright}${colors.cyan}═══ ${title} ═══${colors.reset}\n`);
  }

  static step(step, description) {
    console.log(`${colors.magenta}[步骤 ${step}]${colors.reset} ${description}`);
  }
}

class MCPBrowserCRUDTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseUrl = 'http://localhost:5173';
    this.apiUrl = 'http://localhost:3000';
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
    this.screenshots = [];
  }

  /**
   * 初始化浏览器
   */
  async initBrowser() {
    Logger.section('初始化浏览器');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 500,
        args: ['--start-maximized']
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'zh-CN'
      });

      this.page = await this.context.newPage();
      
      // 监听控制台消息
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          Logger.error(`浏览器控制台错误: ${msg.text()}`);
        }
      });

      Logger.success('浏览器初始化成功');
      return true;
    } catch (error) {
      Logger.error(`浏览器初始化失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 截图
   */
  async takeScreenshot(name) {
    try {
      const timestamp = new Date().getTime();
      const filename = `screenshot-${name}-${timestamp}.png`;
      const filepath = path.join(__dirname, 'test-screenshots', filename);
      
      // 确保目录存在
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await this.page.screenshot({ path: filepath, fullPage: true });
      this.screenshots.push(filepath);
      Logger.info(`截图已保存: ${filename}`);
    } catch (error) {
      Logger.warning(`截图失败: ${error.message}`);
    }
  }

  /**
   * 等待元素
   */
  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      Logger.error(`等待元素失败: ${selector}`);
      return false;
    }
  }

  /**
   * 登录系统 - 使用快捷登录按钮
   */
  async login(role) {
    Logger.section(`登录系统 - ${role}`);

    try {
      Logger.step(1, '访问登录页面');
      await this.page.goto(`${this.baseUrl}/login`);
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('login-page');

      Logger.step(2, '等待快捷登录按钮加载');
      await this.page.waitForSelector('.quick-buttons', { timeout: 10000 });

      Logger.step(3, `点击${role}快捷登录按钮`);
      // 根据角色选择对应的快捷登录按钮
      const buttonSelectors = {
        'admin': '.admin-btn',
        'principal': '.principal-btn',
        'teacher': '.teacher-btn',
        'parent': '.parent-btn'
      };

      const selector = buttonSelectors[role];
      if (!selector) {
        throw new Error(`未知角色: ${role}`);
      }

      await this.page.click(selector);
      await this.takeScreenshot('quick-login-clicked');

      Logger.step(4, '等待登录响应');
      await this.page.waitForTimeout(5000);

      // 检查当前URL
      const currentUrl = this.page.url();
      Logger.info(`当前URL: ${currentUrl}`);

      if (currentUrl.includes('/dashboard') || currentUrl.includes('/teacher-center') || currentUrl.includes('/centers')) {
        await this.page.waitForLoadState('networkidle');
        await this.takeScreenshot('dashboard');
        Logger.success(`登录成功: ${role}`);
        return true;
      } else if (currentUrl.includes('/403')) {
        Logger.error('登录后跳转到403页面，可能是权限问题');
        await this.takeScreenshot('403-error');
        return false;
      } else if (currentUrl.includes('/login')) {
        Logger.error('登录失败，仍在登录页面');
        await this.takeScreenshot('login-failed');
        return false;
      } else {
        Logger.warning(`登录后跳转到: ${currentUrl}`);
        await this.takeScreenshot('after-login');
        // 如果不是登录页面，认为登录成功
        return !currentUrl.includes('/login');
      }
    } catch (error) {
      Logger.error(`登录失败: ${error.message}`);
      await this.takeScreenshot('login-error');
      return false;
    }
  }

  /**
   * 测试教师端 - 查看客户池 (Read)
   */
  async testTeacherViewCustomerPool() {
    Logger.section('TC-001: 教师端 - 查看客户池');
    
    try {
      Logger.step(1, '访问客户池页面');
      await this.page.goto(`${this.baseUrl}/teacher-center/customer-pool`);
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('customer-pool');

      Logger.step(2, '验证页面标题');
      const title = await this.page.textContent('h1, .page-title, .el-page-header__title');
      if (title && title.includes('客户')) {
        Logger.success('页面标题正确');
      } else {
        Logger.warning(`页面标题: ${title}`);
      }

      Logger.step(3, '验证统计卡片');
      const statsCards = await this.page.$$('.el-card, .stat-card, [class*="statistic"]');
      Logger.info(`找到 ${statsCards.length} 个统计卡片`);

      Logger.step(4, '验证客户列表表格');
      const hasTable = await this.page.$('.el-table, table');
      if (hasTable) {
        Logger.success('客户列表表格存在');
        
        // 获取表格行数
        const rows = await this.page.$$('.el-table__row, tbody tr');
        Logger.info(`客户列表有 ${rows.length} 条记录`);
      } else {
        Logger.warning('未找到客户列表表格');
      }

      await this.takeScreenshot('customer-pool-loaded');
      
      this.recordTest('TC-001: 查看客户池', true);
      return true;
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      await this.takeScreenshot('customer-pool-error');
      this.recordTest('TC-001: 查看客户池', false, error.message);
      return false;
    }
  }

  /**
   * 测试教师端 - 申请客户 (Create)
   */
  async testTeacherApplyCustomer() {
    Logger.section('TC-004: 教师端 - 申请客户');
    
    try {
      Logger.step(1, '查找未分配的客户');
      await this.page.waitForTimeout(2000);
      
      // 尝试找到"申请跟踪"按钮
      const applyButtons = await this.page.$$('button:has-text("申请"), button:has-text("跟踪")');
      
      if (applyButtons.length === 0) {
        Logger.warning('未找到可申请的客户');
        this.recordTest('TC-004: 申请客户', false, '未找到可申请的客户');
        return false;
      }

      Logger.step(2, '点击申请按钮');
      await applyButtons[0].click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('apply-dialog');

      Logger.step(3, '填写申请理由');
      const reasonInput = await this.page.$('textarea, input[placeholder*="理由"]');
      if (reasonInput) {
        await reasonInput.fill('测试申请客户 - 自动化测试');
        Logger.success('已填写申请理由');
      }

      Logger.step(4, '提交申请');
      const submitButton = await this.page.$('button:has-text("提交"), button:has-text("确定")');
      if (submitButton) {
        await submitButton.click();
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('apply-submitted');
        Logger.success('申请已提交');
      }

      this.recordTest('TC-004: 申请客户', true);
      return true;
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      await this.takeScreenshot('apply-error');
      this.recordTest('TC-004: 申请客户', false, error.message);
      return false;
    }
  }

  /**
   * 测试园长端 - 查看通知 (Read)
   */
  async testPrincipalViewNotifications() {
    Logger.section('TC-007: 园长端 - 查看通知');
    
    try {
      Logger.step(1, '访问通知中心');
      await this.page.goto(`${this.baseUrl}/pages/Notifications`);
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('notifications');

      Logger.step(2, '验证待审批统计');
      const pendingCard = await this.page.$('[class*="pending"], [class*="待审批"]');
      if (pendingCard) {
        const pendingText = await pendingCard.textContent();
        Logger.success(`待审批统计: ${pendingText}`);
      }

      Logger.step(3, '筛选客户申请通知');
      const typeFilter = await this.page.$('select, .el-select');
      if (typeFilter) {
        await typeFilter.click();
        await this.page.waitForTimeout(500);
        
        const customerOption = await this.page.$('li:has-text("客户申请"), option:has-text("客户申请")');
        if (customerOption) {
          await customerOption.click();
          await this.page.waitForTimeout(1000);
          Logger.success('已筛选客户申请通知');
        }
      }

      await this.takeScreenshot('notifications-filtered');
      
      this.recordTest('TC-007: 查看通知', true);
      return true;
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      await this.takeScreenshot('notifications-error');
      this.recordTest('TC-007: 查看通知', false, error.message);
      return false;
    }
  }

  /**
   * 测试园长端 - 审批申请 (Update)
   */
  async testPrincipalReviewApplication() {
    Logger.section('TC-011: 园长端 - 审批申请');
    
    try {
      Logger.step(1, '查找审批按钮');
      const reviewButtons = await this.page.$$('button:has-text("审批")');
      
      if (reviewButtons.length === 0) {
        Logger.warning('未找到待审批的申请');
        this.recordTest('TC-011: 审批申请', false, '未找到待审批的申请');
        return false;
      }

      Logger.step(2, '点击审批按钮');
      await reviewButtons[0].click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('review-dialog');

      Logger.step(3, '选择同意');
      const approveRadio = await this.page.$('input[value="approve"], label:has-text("同意")');
      if (approveRadio) {
        await approveRadio.click();
        Logger.success('已选择同意');
      }

      Logger.step(4, '提交审批');
      const submitButton = await this.page.$('button:has-text("提交"), button:has-text("确定")');
      if (submitButton) {
        await submitButton.click();
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('review-submitted');
        Logger.success('审批已提交');
      }

      this.recordTest('TC-011: 审批申请', true);
      return true;
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      await this.takeScreenshot('review-error');
      this.recordTest('TC-011: 审批申请', false, error.message);
      return false;
    }
  }

  /**
   * 记录测试结果
   */
  recordTest(name, passed, error = null) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
    
    this.testResults.tests.push({
      name,
      status: passed ? 'passed' : 'failed',
      error
    });
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    Logger.section('测试报告');

    const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(2);

    console.log(`总测试数: ${this.testResults.total}`);
    console.log(`${colors.green}通过: ${this.testResults.passed}${colors.reset}`);
    console.log(`${colors.red}失败: ${this.testResults.failed}${colors.reset}`);
    console.log(`通过率: ${passRate}%`);
    console.log(`\n截图数量: ${this.screenshots.length}`);

    // 保存报告
    const report = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      screenshots: this.screenshots
    };

    const reportPath = path.join(__dirname, 'mcp-crud-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    Logger.success(`测试报告已保存: ${reportPath}`);
  }

  /**
   * 清理资源
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      Logger.info('浏览器已关闭');
    }
  }

  /**
   * 运行所有测试
   */
  async run() {
    Logger.info('🚀 开始MCP浏览器CRUD测试');
    Logger.info(`时间: ${new Date().toLocaleString()}`);

    try {
      // 初始化浏览器
      const browserReady = await this.initBrowser();
      if (!browserReady) {
        throw new Error('浏览器初始化失败');
      }

      // 教师端测试
      Logger.section('教师端测试流程');
      const teacherLoginSuccess = await this.login('teacher');
      if (teacherLoginSuccess) {
        await this.testTeacherViewCustomerPool();
        await this.testTeacherApplyCustomer();
      } else {
        Logger.error('教师登录失败，跳过教师端测试');
        this.recordTest('教师端测试', false, '登录失败');
      }

      // 园长端测试
      Logger.section('园长端测试流程');
      const principalLoginSuccess = await this.login('admin');
      if (principalLoginSuccess) {
        await this.testPrincipalViewNotifications();
        await this.testPrincipalReviewApplication();
      } else {
        Logger.error('园长登录失败，跳过园长端测试');
        this.recordTest('园长端测试', false, '登录失败');
      }

      // 生成报告
      this.generateReport();

      Logger.info('\n✨ 测试完成！');
    } catch (error) {
      Logger.error(`测试执行失败: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }
}

// 运行测试
const tester = new MCPBrowserCRUDTest();
tester.run().catch(error => {
  Logger.error(`测试失败: ${error.message}`);
  process.exit(1);
});

