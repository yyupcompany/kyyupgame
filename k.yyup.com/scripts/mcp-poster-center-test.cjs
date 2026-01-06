#!/usr/bin/env node

/**
 * MCP 海报中心全面测试脚本
 * 
 * 使用MCP Playwright进行海报中心的全面自动化测试
 * 
 * 测试范围：
 * 1. 活动中心访问
 * 2. 海报模式选择页面
 * 3. 海报编辑器
 * 4. 海报生成器
 * 5. 海报模板
 * 6. 权限验证
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
    dir: './test-screenshots/poster-center',
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
      headless: false,
      args: ['--start-maximized']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: './test-videos/poster-center',
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
    
    // 等待登录成功
    await this.page.waitForURL('**/dashboard', {
      timeout: CONFIG.timeout.navigation
    });
    
    await this.page.waitForTimeout(2000);
    
    await this.screenshot('03-login-success');
    
    // 获取token
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
   * 导航到活动中心
   */
  async navigateToActivityCenter() {
    Logger.info('导航到活动中心...');
    
    await this.page.waitForTimeout(3000);
    
    await this.page.goto(`${CONFIG.frontend.url}/centers/activity`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout.navigation
    });
    
    await this.page.waitForTimeout(3000);
    
    const pageTitle = await this.page.title();
    Logger.info(`页面标题: ${pageTitle}`);
    
    await this.screenshot('04-activity-center');
    
    Logger.success('活动中心页面加载成功');
  }

  /**
   * 测试活动中心Timeline
   */
  async testActivityTimeline() {
    Logger.info('测试活动中心Timeline...');

    const testName = '活动中心Timeline';
    testResults.summary.total++;

    try {
      // 等待页面加载
      await this.page.waitForTimeout(2000);

      // 检查Timeline元素
      const timelineItems = await this.page.locator('.timeline-item, [class*="timeline"]').count();
      Logger.info(`Timeline项目数量: ${timelineItems}`);

      // 检查详情面板
      const detailPanel = await this.page.locator('.detail-section, .detail-panel').count();
      Logger.info(`详情面板数量: ${detailPanel}`);

      await this.screenshot('05-activity-timeline');

      if (timelineItems > 0 || detailPanel > 0) {
        testResults.summary.passed++;
        testResults.tests.push({
          name: testName,
          status: 'passed',
          details: `Timeline项目: ${timelineItems}, 详情面板: ${detailPanel}`,
          timestamp: new Date().toISOString()
        });
        Logger.success(`${testName} - 通过`);
      } else {
        testResults.summary.warnings++;
        testResults.tests.push({
          name: testName,
          status: 'warning',
          details: '未找到Timeline元素',
          timestamp: new Date().toISOString()
        });
        Logger.warning(`${testName} - 警告：未找到Timeline元素`);
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
      await this.screenshot('error-activity-timeline');
    }
  }

  /**
   * 测试海报页面
   */
  async testPosterPage(pageName, path, screenshotName) {
    Logger.info(`测试${pageName}...`);

    const testName = pageName;
    testResults.summary.total++;

    try {
      // 直接访问页面 - 使用domcontentloaded而不是networkidle
      await this.page.goto(`${CONFIG.frontend.url}${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.timeout.navigation
      });

      // 等待页面渲染
      await this.page.waitForTimeout(3000);

      const currentUrl = this.page.url();
      Logger.info(`当前URL: ${currentUrl}`);

      const pageTitle = await this.page.title();
      Logger.info(`页面标题: ${pageTitle}`);

      await this.screenshot(screenshotName);

      // 检查页面元素
      const pageContent = await this.page.content();
      const hasContent = pageContent.length > 1000;
      Logger.info(`页面内容长度: ${pageContent.length} 字符`);

      // 检查是否有404错误
      const has404 = await this.page.locator('text=404, text=Not Found, text=页面不存在').count();

      // 检查是否有主要内容元素
      const hasPageContainer = await this.page.locator('.page-container, .page-header, .step-card').count();
      Logger.info(`页面容器元素数量: ${hasPageContainer}`);

      if (hasContent && has404 === 0 && hasPageContainer > 0) {
        testResults.summary.passed++;
        testResults.tests.push({
          name: testName,
          status: 'passed',
          details: `页面标题: ${pageTitle}, 容器元素: ${hasPageContainer}`,
          timestamp: new Date().toISOString()
        });
        Logger.success(`${testName} - 通过`);
      } else if (has404 > 0) {
        throw new Error('页面返回404');
      } else if (hasPageContainer === 0) {
        testResults.summary.warnings++;
        testResults.tests.push({
          name: testName,
          status: 'warning',
          details: '页面加载但未找到主要内容元素',
          timestamp: new Date().toISOString()
        });
        Logger.warning(`${testName} - 警告：未找到主要内容元素`);
      } else {
        throw new Error('页面内容为空');
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
      await this.screenshot(`error-${screenshotName}`);
    }
  }

  /**
   * 测试所有海报页面
   */
  async testAllPosterPages() {
    await this.testPosterPage('海报模式选择', '/principal/poster-mode-selection', '06-poster-mode-selection');
    await this.testPosterPage('海报编辑器', '/principal/poster-editor', '07-poster-editor');
    await this.testPosterPage('海报生成器', '/principal/poster-generator', '08-poster-generator');
    await this.testPosterPage('海报模板', '/principal/poster-templates', '09-poster-templates');
    await this.testPosterPage('简易海报编辑器', '/principal/poster-editor-simple', '10-poster-editor-simple');
    await this.testPosterPage('海报上传', '/principal/poster-upload', '11-poster-upload');
  }

  /**
   * 测试海报生成器功能
   */
  async testPosterGeneratorFeatures() {
    Logger.info('测试海报生成器功能...');

    const testName = '海报生成器功能';
    testResults.summary.total++;

    try {
      // 访问海报生成器
      await this.page.goto(`${CONFIG.frontend.url}/principal/poster-generator`, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.timeout.navigation
      });

      await this.page.waitForTimeout(3000);

      // 检查步骤卡片
      const stepCards = await this.page.locator('.step-card').count();
      Logger.info(`步骤卡片数量: ${stepCards}`);

      // 检查模板网格
      const templateGrid = await this.page.locator('.template-grid, .template-list').count();
      Logger.info(`模板网格数量: ${templateGrid}`);

      // 检查模板项
      const templateItems = await this.page.locator('.template-item, .template-card').count();
      Logger.info(`模板项数量: ${templateItems}`);

      await this.screenshot('12-poster-generator-features');

      if (stepCards >= 3 || templateItems > 0) {
        testResults.summary.passed++;
        testResults.tests.push({
          name: testName,
          status: 'passed',
          details: `步骤卡片: ${stepCards}, 模板项: ${templateItems}`,
          timestamp: new Date().toISOString()
        });
        Logger.success(`${testName} - 通过`);
      } else {
        testResults.summary.warnings++;
        testResults.tests.push({
          name: testName,
          status: 'warning',
          details: '未找到足够的功能元素',
          timestamp: new Date().toISOString()
        });
        Logger.warning(`${testName} - 警告：功能元素不足`);
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
      await this.screenshot('error-poster-generator-features');
    }
  }

  /**
   * 测试海报模板功能
   */
  async testPosterTemplatesFeatures() {
    Logger.info('测试海报模板功能...');

    const testName = '海报模板功能';
    testResults.summary.total++;

    try {
      // 访问海报模板
      await this.page.goto(`${CONFIG.frontend.url}/principal/poster-templates`, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.timeout.navigation
      });

      await this.page.waitForTimeout(3000);

      // 检查分类标签
      const categoryTabs = await this.page.locator('.el-tabs__item, .category-tab').count();
      Logger.info(`分类标签数量: ${categoryTabs}`);

      // 检查模板卡片
      const templateCards = await this.page.locator('.template-card, .poster-card').count();
      Logger.info(`模板卡片数量: ${templateCards}`);

      // 检查搜索框
      const searchBox = await this.page.locator('input[placeholder*="搜索"], .search-input').count();
      Logger.info(`搜索框数量: ${searchBox}`);

      await this.screenshot('13-poster-templates-features');

      if (categoryTabs > 0 || templateCards > 0) {
        testResults.summary.passed++;
        testResults.tests.push({
          name: testName,
          status: 'passed',
          details: `分类标签: ${categoryTabs}, 模板卡片: ${templateCards}`,
          timestamp: new Date().toISOString()
        });
        Logger.success(`${testName} - 通过`);
      } else {
        testResults.summary.warnings++;
        testResults.tests.push({
          name: testName,
          status: 'warning',
          details: '未找到足够的功能元素',
          timestamp: new Date().toISOString()
        });
        Logger.warning(`${testName} - 警告：功能元素不足`);
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
      await this.screenshot('error-poster-templates-features');
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    try {
      Logger.section('MCP 海报中心全面测试');
      
      await this.initialize();
      await this.login();
      await this.navigateToActivityCenter();
      
      Logger.section('活动中心测试');
      await this.testActivityTimeline();

      Logger.section('海报页面测试');
      await this.testAllPosterPages();

      Logger.section('海报功能测试');
      await this.testPosterGeneratorFeatures();
      await this.testPosterTemplatesFeatures();
      
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
    const reportPath = './test-reports/poster-center-mcp-test.json';
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

