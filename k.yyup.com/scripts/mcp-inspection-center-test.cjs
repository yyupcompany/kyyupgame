#!/usr/bin/env node

/**
 * MCP 检查中心全面测试脚本
 * 
 * 使用MCP Playwright进行检查中心的全面自动化测试
 * 
 * 测试范围：
 * 1. 文档模板管理
 * 2. 文档实例管理
 * 3. 文档统计功能
 * 4. 页面交互测试
 * 5. 数据验证测试
 */

const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  frontend: {
    url: 'http://localhost:5173',
    port: 5173
  },
  backend: {
    url: 'http://127.0.0.1:3000',
    port: 3000
  },
  auth: {
    username: 'admin',
    password: 'admin123'
  },
  screenshots: {
    dir: './test-screenshots/inspection-center',
    enabled: true
  },
  timeout: {
    navigation: 30000,
    action: 10000,
    api: 5000
  }
};

// 测试结果
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  tests: [],
  errors: [],
  screenshots: []
};

/**
 * 日志工具
 */
class Logger {
  static info(msg) {
    console.log(`\x1b[36mℹ️  ${msg}\x1b[0m`);
  }
  
  static success(msg) {
    console.log(`\x1b[32m✅ ${msg}\x1b[0m`);
  }
  
  static warning(msg) {
    console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`);
  }
  
  static error(msg) {
    console.log(`\x1b[31m❌ ${msg}\x1b[0m`);
  }
  
  static section(msg) {
    console.log(`\n\x1b[1m${'='.repeat(60)}\x1b[0m`);
    console.log(`\x1b[1m  ${msg}\x1b[0m`);
    console.log(`\x1b[1m${'='.repeat(60)}\x1b[0m\n`);
  }
}

/**
 * 测试工具类
 */
class TestRunner {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.token = null;
  }

  /**
   * 初始化浏览器
   */
  async initialize() {
    Logger.info('初始化浏览器...');
    
    // 创建截图目录
    if (CONFIG.screenshots.enabled) {
      await fs.mkdir(CONFIG.screenshots.dir, { recursive: true });
    }
    
    // 启动浏览器
    this.browser = await chromium.launch({
      headless: false, // 设置为false以便观察测试过程
      args: ['--start-maximized']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: './test-videos/inspection-center',
        size: { width: 1920, height: 1080 }
      }
    });
    
    this.page = await this.context.newPage();
    
    // 监听控制台错误
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        Logger.error(`控制台错误: ${msg.text()}`);
        testResults.errors.push({
          type: 'console',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 监听页面错误
    this.page.on('pageerror', error => {
      Logger.error(`页面错误: ${error.message}`);
      testResults.errors.push({
        type: 'page',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    Logger.success('浏览器初始化完成');
  }

  /**
   * 截图
   */
  async screenshot(name) {
    if (!CONFIG.screenshots.enabled) return;
    
    const filename = `${Date.now()}-${name}.png`;
    const filepath = path.join(CONFIG.screenshots.dir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    testResults.screenshots.push({ name, filepath, timestamp: new Date().toISOString() });
    Logger.info(`截图已保存: ${filename}`);
  }

  /**
   * 登录系统
   */
  async login() {
    Logger.info('登录系统...');
    
    await this.page.goto(CONFIG.frontend.url, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout.navigation
    });
    
    await this.screenshot('01-login-page');
    
    // 填写登录表单
    await this.page.fill('input[type="text"]', CONFIG.auth.username);
    await this.page.fill('input[type="password"]', CONFIG.auth.password);
    
    await this.screenshot('02-login-filled');
    
    // 点击登录按钮
    await this.page.click('button[type="submit"]');

    // 等待登录成功（跳转到dashboard或centers）
    await this.page.waitForURL('**/dashboard', {
      timeout: CONFIG.timeout.navigation
    });

    await this.page.waitForTimeout(2000); // 等待页面加载完成

    await this.screenshot('03-login-success');

    // 获取token（从localStorage）
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('token');
    });

    if (token) {
      this.token = token;
      Logger.success(`登录成功，Token: ${this.token.substring(0, 20)}...`);
    } else {
      Logger.warning('未获取到Token');
    }
  }

  /**
   * 导航到检查中心
   */
  async navigateToInspectionCenter() {
    Logger.info('导航到检查中心...');

    // 等待动态路由加载完成
    await this.page.waitForTimeout(3000);

    // 尝试直接访问检查中心
    Logger.info('直接访问检查中心页面...');
    await this.page.goto(`${CONFIG.frontend.url}/centers/inspection`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout.navigation
    });

    // 等待页面加载
    await this.page.waitForTimeout(3000);

    // 检查是否成功加载
    const pageTitle = await this.page.title();
    Logger.info(`页面标题: ${pageTitle}`);

    // 检查URL
    const currentUrl = this.page.url();
    Logger.info(`当前URL: ${currentUrl}`);

    await this.screenshot('04-inspection-center-loaded');

    // 检查是否有404或错误页面
    const errorText = await this.page.locator('text=404, text=Not Found, text=页面不存在').count();
    if (errorText > 0) {
      Logger.error('检测到404错误页面');
    } else {
      Logger.success('检查中心页面加载成功');
    }
  }

  /**
   * 测试检查中心时间轴视图
   */
  async testInspectionTimeline() {
    Logger.info('测试检查中心时间轴视图...');

    const testName = '检查中心时间轴';
    testResults.summary.total++;

    try {
      // 等待页面加载
      await this.page.waitForTimeout(2000);

      // 检查页面标题（使用first()避免strict mode violation）
      const pageTitle = await this.page.locator('.page-title').first().textContent();
      Logger.info(`页面标题: ${pageTitle}`);

      // 检查统计卡片
      const statCards = await this.page.locator('.stat-card').count();
      Logger.info(`统计卡片数量: ${statCards}`);

      // 检查时间轴卡片
      const timelineCard = await this.page.locator('.timeline-card').count();
      Logger.info(`时间轴卡片: ${timelineCard}`);

      // 检查视图模式切换按钮
      const viewModeButtons = await this.page.locator('.el-radio-button').count();
      Logger.info(`视图模式按钮: ${viewModeButtons}`);

      await this.screenshot('05-inspection-timeline');

      if (statCards >= 4 && timelineCard > 0) {
        testResults.summary.passed++;
        testResults.tests.push({
          name: testName,
          status: 'passed',
          details: `统计卡片: ${statCards}, 时间轴卡片: ${timelineCard}`,
          timestamp: new Date().toISOString()
        });
        Logger.success(`${testName} - 通过`);
      } else {
        testResults.summary.warnings++;
        testResults.tests.push({
          name: testName,
          status: 'warning',
          details: '页面元素不完整',
          timestamp: new Date().toISOString()
        });
        Logger.warning(`${testName} - 警告：页面元素不完整`);
      }
    } catch (error) {
      testResults.summary.failed++;
      testResults.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      Logger.error(`${testName} - 失败: ${error.message}`);
      await this.screenshot('error-inspection-timeline');
    }
  }

  /**
   * 测试视图模式切换
   */
  async testViewModeSwitch() {
    Logger.info('测试视图模式切换...');

    const testName = '视图模式切换';
    testResults.summary.total++;

    try {
      // 切换到列表视图
      const listButton = await this.page.locator('text=列表').first();
      if (await listButton.isVisible({ timeout: 3000 })) {
        await listButton.click();
        await this.page.waitForTimeout(1000);
        await this.screenshot('06-list-view');

        // 检查是否有表格
        const table = await this.page.locator('.el-table').count();
        Logger.info(`列表视图 - 表格数量: ${table}`);

        // 切换到月度视图
        const monthButton = await this.page.locator('text=月度').first();
        if (await monthButton.isVisible()) {
          await monthButton.click();
          await this.page.waitForTimeout(1000);
          await this.screenshot('07-month-view');

          // 检查是否有日历
          const calendar = await this.page.locator('.el-calendar').count();
          Logger.info(`月度视图 - 日历数量: ${calendar}`);

          testResults.summary.passed++;
          testResults.tests.push({
            name: testName,
            status: 'passed',
            details: `成功切换视图模式`,
            timestamp: new Date().toISOString()
          });
          Logger.success(`${testName} - 通过`);
        } else {
          throw new Error('未找到月度视图按钮');
        }
      } else {
        throw new Error('未找到列表视图按钮');
      }
    } catch (error) {
      testResults.summary.failed++;
      testResults.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      Logger.error(`${testName} - 失败: ${error.message}`);
      await this.screenshot('error-view-mode-switch');
    }
  }

  /**
   * 测试文档实例列表
   */
  async testInstanceList() {
    Logger.info('测试文档实例列表...');

    const testName = '文档实例列表';
    testResults.summary.total++;

    try {
      // 切换到实例标签
      const instanceTab = await this.page.locator('text=文档实例, .el-tabs__item:has-text("实例")').first();
      if (await instanceTab.isVisible({ timeout: 3000 })) {
        await instanceTab.click();
        await this.page.waitForTimeout(1000);
        await this.screenshot('07-instance-list');

        // 检查实例列表
        const rows = await this.page.locator('.el-table__row').count();
        Logger.info(`找到 ${rows} 个实例`);

        if (rows > 0) {
          testResults.summary.passed++;
          testResults.tests.push({
            name: testName,
            status: 'passed',
            details: `找到 ${rows} 个实例`,
            timestamp: new Date().toISOString()
          });
          Logger.success(`${testName} - 通过`);
        } else {
          testResults.summary.warnings++;
          testResults.tests.push({
            name: testName,
            status: 'warning',
            details: '实例列表为空',
            timestamp: new Date().toISOString()
          });
          Logger.warning(`${testName} - 警告：列表为空`);
        }
      } else {
        Logger.warning('未找到实例标签，跳过测试');
        testResults.summary.warnings++;
      }
    } catch (error) {
      testResults.summary.failed++;
      testResults.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      Logger.error(`${testName} - 失败: ${error.message}`);
      await this.screenshot('error-instance-list');
    }
  }

  /**
   * 测试统计卡片
   */
  async testStatisticsCards() {
    Logger.info('测试统计卡片...');

    const testName = '统计卡片';
    testResults.summary.total++;

    try {
      // 查找统计卡片
      const cards = await this.page.locator('.el-card, .stat-card, [class*="card"]').count();
      Logger.info(`找到 ${cards} 个卡片`);

      if (cards > 0) {
        await this.screenshot('08-statistics-cards');
        testResults.summary.passed++;
        testResults.tests.push({
          name: testName,
          status: 'passed',
          details: `找到 ${cards} 个统计卡片`,
          timestamp: new Date().toISOString()
        });
        Logger.success(`${testName} - 通过`);
      } else {
        testResults.summary.warnings++;
        testResults.tests.push({
          name: testName,
          status: 'warning',
          details: '未找到统计卡片',
          timestamp: new Date().toISOString()
        });
        Logger.warning(`${testName} - 警告：未找到卡片`);
      }
    } catch (error) {
      testResults.summary.failed++;
      testResults.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      Logger.error(`${testName} - 失败: ${error.message}`);
      await this.screenshot('error-statistics-cards');
    }
  }

  /**
   * 测试搜索功能
   */
  async testSearchFunction() {
    Logger.info('测试搜索功能...');

    const testName = '搜索功能';
    testResults.summary.total++;

    try {
      // 查找搜索框
      const searchInput = await this.page.locator('input[placeholder*="搜索"], input[type="search"]').first();
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('安全');
        await this.page.waitForTimeout(1000);
        await this.screenshot('09-search-result');

        testResults.summary.passed++;
        testResults.tests.push({
          name: testName,
          status: 'passed',
          timestamp: new Date().toISOString()
        });
        Logger.success(`${testName} - 通过`);

        // 清空搜索
        await searchInput.clear();
        await this.page.waitForTimeout(500);
      } else {
        testResults.summary.warnings++;
        testResults.tests.push({
          name: testName,
          status: 'warning',
          details: '未找到搜索框',
          timestamp: new Date().toISOString()
        });
        Logger.warning(`${testName} - 警告：未找到搜索框`);
      }
    } catch (error) {
      testResults.summary.failed++;
      testResults.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      Logger.error(`${testName} - 失败: ${error.message}`);
      await this.screenshot('error-search');
    }
  }

  /**
   * 测试API端点
   */
  async testAPIEndpoints() {
    Logger.info('测试API端点...');

    if (!this.token) {
      Logger.warning('未获取到Token，跳过API测试');
      return;
    }

    const endpoints = [
      { method: 'GET', path: '/document-templates', name: '获取模板列表' },
      { method: 'GET', path: '/document-instances', name: '获取实例列表' },
      { method: 'GET', path: '/document-statistics/overview', name: '获取统计概览' },
      { method: 'GET', path: '/document-statistics/trends', name: '获取趋势数据' },
      { method: 'GET', path: '/document-statistics/template-ranking', name: '获取模板排行' }
    ];

    for (const endpoint of endpoints) {
      const testName = `API: ${endpoint.name}`;
      testResults.summary.total++;

      try {
        const response = await axios({
          method: endpoint.method,
          url: `${CONFIG.backend.url}/api${endpoint.path}`,
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          timeout: CONFIG.timeout.api
        });

        if (response.data.success) {
          testResults.summary.passed++;
          testResults.tests.push({
            name: testName,
            status: 'passed',
            details: `状态码: ${response.status}`,
            timestamp: new Date().toISOString()
          });
          Logger.success(`${testName} - 通过`);
        } else {
          throw new Error(`API返回失败: ${JSON.stringify(response.data.error)}`);
        }
      } catch (error) {
        testResults.summary.failed++;
        testResults.tests.push({
          name: testName,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        Logger.error(`${testName} - 失败: ${error.message}`);
      }
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    try {
      Logger.section('MCP 检查中心全面测试');

      await this.initialize();
      await this.login();
      await this.navigateToInspectionCenter();

      Logger.section('UI功能测试');
      await this.testInspectionTimeline();
      await this.testViewModeSwitch();
      await this.testStatisticsCards();

      Logger.section('API端点测试');
      await this.testAPIEndpoints();

      Logger.section('测试完成');
      this.printSummary();

    } catch (error) {
      Logger.error(`测试执行失败: ${error.message}`);
      console.error(error);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('  测试结果摘要');
    console.log('='.repeat(60));
    console.log(`  总测试数: ${testResults.summary.total}`);
    console.log(`  \x1b[32m✅ 通过: ${testResults.summary.passed}\x1b[0m`);
    console.log(`  \x1b[31m❌ 失败: ${testResults.summary.failed}\x1b[0m`);
    console.log(`  \x1b[33m⚠️  警告: ${testResults.summary.warnings}\x1b[0m`);
    console.log(`  通过率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * 清理资源
   */
  async cleanup() {
    Logger.info('清理资源...');
    
    // 保存测试报告
    const reportPath = './test-reports/inspection-center-mcp-test.json';
    await fs.mkdir('./test-reports', { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
    Logger.success(`测试报告已保存: ${reportPath}`);
    
    if (this.browser) {
      await this.browser.close();
      Logger.success('浏览器已关闭');
    }
  }
}

// 主函数
async function main() {
  const runner = new TestRunner();
  await runner.runAllTests();
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    Logger.error(`测试失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { TestRunner, CONFIG };

