// @ts-nocheck
/**
 * 自动化页面扫描与修复脚本
 * 功能：自动扫描admin角色登录后的所有侧边栏页面，检测控制台错误和网络错误，并尝试自动修复
 */

const { chromium } = require('playwright');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ============================================
// 枚举常量
// ============================================

const ErrorType = {
  CONSOLE: 'CONSOLE',
  NETWORK_404: 'NETWORK_404',
  NETWORK_400: 'NETWORK_400',
  NETWORK_500: 'NETWORK_500',
  PAGE_CRASH: 'PAGE_CRASH'
};

const Severity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

const FixType = {
  ROUTE_FIX: 'ROUTE_FIX',
  API_FIX: 'API_FIX',
  DATA_FIX: 'DATA_FIX',
  COMPONENT_FIX: 'COMPONENT_FIX'
};

// ============================================
// 配置
// ============================================

const config = {
  baseUrl: 'http://localhost:5173',
  apiBaseUrl: 'http://localhost:3000',
  dbConfig: {
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  },
  outputDir: path.join(process.cwd(), 'test-reports', 'auto-fix', new Date().toISOString().replace(/[:.]/g, '-')),
  screenshotDir: '',
  logDir: '',
  reportDir: '',
  protectedDirs: [
    '/server/src/middlewares/',
    '/server/src/utils/',
    '/client/src/utils/',
    '/server/src/migrations/'
  ],
  maxFileReferences: 5
};

// 初始化目录路径
config.screenshotDir = path.join(config.outputDir, 'screenshots');
config.logDir = path.join(config.outputDir, 'logs');
config.reportDir = path.join(config.outputDir, 'reports');

// ============================================
// 日志工具
// ============================================

class Logger {
  logFile;
  errorFile;

  constructor() {
    this.logFile = path.join(config.logDir, 'execution.log');
    this.errorFile = path.join(config.logDir, 'errors.log');
  }

  formatMessage(level, message, context) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `\n  Context: ${JSON.stringify(context, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}\n`;
  }

  writeToFile(file, content) {
    try {
      fs.appendFileSync(file, content);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  info(message, context) {
    const formatted = this.formatMessage('INFO', message, context);
    console.log(formatted);
    this.writeToFile(this.logFile, formatted);
  }

  warn(message, context) {
    const formatted = this.formatMessage('WARN', message, context);
    console.warn(formatted);
    this.writeToFile(this.logFile, formatted);
  }

  error(message, context) {
    const formatted = this.formatMessage('ERROR', message, context);
    console.error(formatted);
    this.writeToFile(this.logFile, formatted);
    this.writeToFile(this.errorFile, formatted);
  }

  debug(message, context) {
    const formatted = this.formatMessage('DEBUG', message, context);
    console.log(formatted);
    this.writeToFile(this.logFile, formatted);
  }
}

const logger = new Logger();

// ============================================
// 主类：自动化扫描器
// ============================================

class AutoFixScanner {
  browser= null;
  page= null;
  dbConnection= null;
  scanResults  = [];
  allErrors  = [];
  // repairPlans  = [];
  gitCommitHash = '';

  async initialize() {
    logger.info('=== 初始化环境 ===');
    
    // 创建必要的目录
    [config.outputDir, config.screenshotDir, config.logDir, config.reportDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`创建目录: ${dir}`);
      }
    });

    // 连接数据库
    await this.connectDatabase();

    // 启动浏览器
    await this.launchBrowser();

    logger.info('环境初始化完成');
  }

  async connectDatabase() {
    logger.info('连接远程MySQL数据库');
    try {
      this.dbConnection = await mysql.createConnection(config.dbConfig);
      await this.dbConnection.ping();
      logger.info('数据库连接成功');
    } catch (error) {
      logger.error('数据库连接失败', error);
      throw error;
    }
  }

  async launchBrowser() {
    logger.info('启动Playwright浏览器（无头模式）');
    this.browser = await chromium.launch({
      headless: true,
      devtools: false
    });
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    this.page = await context.newPage();
    
    // 注册全局错误监听器
    this.registerErrorListeners();
    
    logger.info('浏览器启动成功');
  }

  registerErrorListeners() {
    if (!this.page) return;

    // 控制台错误监听
    this.page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error') {
        logger.debug('控制台错误', { text: msg.text() });
      }
    });

    // 页面崩溃监听
    this.page.on('pageerror', (error) => {
      logger.error('页面崩溃', { message: error.message, stack: error.stack });
    });

    // 请求失败监听
    this.page.on('requestfailed', (request) => {
      logger.warn('请求失败', { url: request.url(), failure: request.failure() });
    });
  }

  async performLogin() {
    logger.info('=== 执行admin快捷登录 ===');
    
    if (!this.page) throw new Error('浏览器页面未初始化');

    // 访问登录页
    await this.page.goto(`${config.baseUrl}/login`, { waitUntil: 'networkidle' });
    logger.info('已访问登录页面');

    // 等待并点击admin快捷登录按钮
    const adminBtnSelectors = [
      '.admin-btn',
      'button:has-text("系统管理员")',
      'button:has-text("admin")'
    ];

    let loginSuccess = false;
    for (const selector of adminBtnSelectors) {
      try {
        const button = await this.page.$(selector);
        if (button) {
          await button.click();
          logger.info(`点击快捷登录按钮: ${selector}`);
          loginSuccess = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!loginSuccess) {
      throw new Error('未找到admin快捷登录按钮');
    }

    // 等待登录完成
    await this.page.waitForTimeout(3000);

    // 验证登录成功
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('kindergarten_token');
    });

    if (!token) {
      throw new Error('登录失败：未找到token');
    }

    logger.info('登录成功', { tokenLength: token.length });
  }

  async getSidebarMenu() {
    logger.info('=== 动态获取侧边栏菜单 ===');
    
    if (!this.page) throw new Error('浏览器页面未初始化');

    // 等待侧边栏渲染
    await this.page.waitForTimeout(2000);

    // 提取侧边栏菜单
    const menuItems = await this.page.evaluate(() => {
      const items = [];
      
      // 查找所有菜单项 - 使用实际的侧边栏结构
      const menuLinks = document.querySelectorAll('.sidebar .nav-item, aside .nav-item, .el-menu-item');
      
      menuLinks.forEach((el) => {
        const href = el.getAttribute('href');
        const text = el.textContent?.trim();
        
        if (href && text && href.startsWith('/') && !href.includes('login') && !href.includes('logout')) {
          // 过滤重复的URL
          if (!items.find(item => item.path === href)) {
            items.push({
              text: text,
              path: href
            });
          }
        }
      });

      return items;
    });

    logger.info(`找到 ${menuItems.length} 个菜单项`);
    
    // 如果没有找到菜单，使用硬编码的常用页面列表
    if (menuItems.length === 0) {
      logger.warn('未找到侧边栏菜单，使用预定义页面列表');
      return [
        { text: '人员中心', path: '/centers/PersonnelCenter' },
        { text: '考勤中心', path: '/centers/AttendanceCenter' },
        { text: '教学中心', path: '/centers/TeachingCenter' },
        { text: '招生中心', path: '/centers/EnrollmentCenter' },
        { text: '营销中心', path: '/centers/MarketingCenter' },
        { text: '活动中心', path: '/centers/ActivityCenter' },
        { text: '客户池中心', path: '/centers/CustomerPoolCenter' },
        { text: '呼叫中心', path: '/centers/CallCenter' },
        { text: '财务中心', path: '/centers/FinanceCenter' },
        { text: '文档中心', path: '/centers/DocumentCenter' },
        { text: '系统中心', path: '/centers/SystemCenter' },
        { text: '任务中心', path: '/centers/TaskCenter' },
        { text: 'AI智能中心', path: '/centers/AICenter' }
      ];
    }
    
    return menuItems;
  }

  async scanPage(pagePath, pageTitle) {
    logger.info(`扫描页面: ${pagePath}`);
    
    if (!this.page) throw new Error('浏览器页面未初始化');

    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pageUrl = `${config.baseUrl}${pagePath}`;
    const startTime = Date.now();
    const errors  = [];

    // 监听本页面的错误
    const consoleErrors = [];
    const networkErrors = [];

    const consoleHandler = (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    };

    const responseHandler = (response) => {
      const status = response.status();
      if (status === 404 || status === 400 || (status >= 500 && status < 600)) {
        networkErrors.push({
          url: response.url(),
          method: response.request().method(),
          status: status
        });
      }
    };

    this.page.on('console', consoleHandler);
    this.page.on('response', responseHandler);

    try {
      // 访问页面
      await this.page.goto(pageUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // 等待页面稳定
      await this.page.waitForTimeout(3000);

      // 截图
      const screenshotPath = path.join(config.screenshotDir, `${pagePath.replace(/\//g, '_')}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });

      // 处理控制台错误
      consoleErrors.forEach((errorMsg, index) => {
        errors.push({
          errorId: `err_${scanId}_console_${index}`,
          errorType: ErrorType.CONSOLE,
          pagePath,
          pageTitle,
          timestamp: new Date(),
          errorMessage: errorMsg,
          severity: Severity.MEDIUM,
          isFixed: false
        });
      });

      // 处理网络错误
      networkErrors.forEach((netErr, index) => {
        let errorType = ErrorType.NETWORK_404;
        let severity = Severity.HIGH;

        if (netErr.status === 404) {
          errorType = ErrorType.NETWORK_404;
        } else if (netErr.status === 400) {
          errorType = ErrorType.NETWORK_400;
          severity = Severity.MEDIUM;
        } else if (netErr.status >= 500) {
          errorType = ErrorType.NETWORK_500;
          severity = Severity.HIGH;
        }

        errors.push({
          errorId: `err_${scanId}_network_${index}`,
          errorType,
          pagePath,
          pageTitle,
          timestamp: new Date(),
          errorMessage: `${netErr.method} ${netErr.url} returned ${netErr.status}`,
          requestUrl: netErr.url,
          requestMethod: netErr.method,
          responseStatus: netErr.status,
          severity,
          isFixed: false
        });
      });

    } catch (error) {
      logger.error(`页面扫描失败: ${pagePath}`, error);
      errors.push({
        errorId: `err_${scanId}_crash`,
        errorType: ErrorType.PAGE_CRASH,
        pagePath,
        pageTitle,
        timestamp: new Date(),
        errorMessage: error.message,
        stackTrace: error.stack,
        severity: Severity.CRITICAL,
        isFixed: false
      });
    } finally {
      this.page.off('console', consoleHandler);
      this.page.off('response', responseHandler);
    }

    const loadDuration = Date.now() - startTime;

    const result = {
      scanId,
      pageUrl,
      pagePath,
      pageTitle,
      menuCategory: '', // TODO: 提取菜单分类
      accessTime: new Date(),
      loadDuration,
      hasConsoleErrors: consoleErrors.length > 0,
      consoleErrorCount: consoleErrors.length,
      hasNetworkErrors: networkErrors.length > 0,
      networkErrorCount: networkErrors.length,
      screenshotPath: '',
      errors
    };

    this.allErrors.push(...errors);
    logger.info(`页面扫描完成: ${pagePath}, 发现 ${errors.length} 个错误`);

    return result;
  }

  async scanAllPages() {
    logger.info('=== 开始扫描所有页面 ===');
    
    const menuItems = await this.getSidebarMenu();
    
    for (const item of menuItems) {
      try {
        const result = await this.scanPage(item.path, item.text);
        this.scanResults.push(result);
      } catch (error) {
        logger.error(`扫描页面失败: ${item.path}`, error);
      }
    }

    logger.info(`扫描完成，共扫描 ${this.scanResults.length} 个页面，发现 ${this.allErrors.length} 个错误`);
  }

  async generateReport() {
    logger.info('=== 生成扫描报告 ===');

    const reportData = {
      scanTime: new Date().toISOString(),
      gitCommitHash: this.gitCommitHash,
      totalPages: this.scanResults.length,
      totalErrors: this.allErrors.length,
      errorsByType: {
        console: this.allErrors.filter(e => e.errorType === ErrorType.CONSOLE).length,
        network404: this.allErrors.filter(e => e.errorType === ErrorType.NETWORK_404).length,
        network400: this.allErrors.filter(e => e.errorType === ErrorType.NETWORK_400).length,
        network500: this.allErrors.filter(e => e.errorType === ErrorType.NETWORK_500).length,
        crash: this.allErrors.filter(e => e.errorType === ErrorType.PAGE_CRASH).length
      },
      scanResults: this.scanResults,
      errors: this.allErrors
    };

    // 保存JSON报告
    const jsonReportPath = path.join(config.reportDir, 'scan-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));
    logger.info(`JSON报告已保存: ${jsonReportPath}`);

    // 生成Markdown报告
    const mdReportPath = path.join(config.reportDir, 'scan-report.md');
    const mdContent = this.generateMarkdownReport(reportData);
    fs.writeFileSync(mdReportPath, mdContent);
    logger.info(`Markdown报告已保存: ${mdReportPath}`);
  }

  generateMarkdownReport(data) {
    let md = '# 自动化页面扫描报告\n\n';
    md += `## 执行摘要\n\n`;
    md += `- **扫描时间**: ${data.scanTime}\n`;
    md += `- **Git提交**: ${data.gitCommitHash}\n`;
    md += `- **扫描页面数**: ${data.totalPages}\n`;
    md += `- **发现错误数**: ${data.totalErrors}\n\n`;
    
    md += `### 错误分类统计\n\n`;
    md += `| 错误类型 | 数量 |\n`;
    md += `|---------|-----|\n`;
    md += `| 控制台错误 | ${data.errorsByType.console} |\n`;
    md += `| 404错误 | ${data.errorsByType.network404} |\n`;
    md += `| 400错误 | ${data.errorsByType.network400} |\n`;
    md += `| 500错误 | ${data.errorsByType.network500} |\n`;
    md += `| 页面崩溃 | ${data.errorsByType.crash} |\n\n`;

    md += `## 错误详情\n\n`;
    
    data.errors.forEach((err, index) => {
      md += `### ${index + 1}. ${err.errorType} - ${err.pagePath}\n\n`;
      md += `- **页面标题**: ${err.pageTitle}\n`;
      md += `- **错误消息**: ${err.errorMessage}\n`;
      md += `- **严重程度**: ${err.severity}\n`;
      md += `- **时间**: ${err.timestamp}\n`;
      if (err.requestUrl) {
        md += `- **请求URL**: ${err.requestUrl}\n`;
        md += `- **请求方法**: ${err.requestMethod}\n`;
        md += `- **响应状态**: ${err.responseStatus}\n`;
      }
      md += `\n`;
    });

    return md;
  }

  async cleanup() {
    logger.info('=== 清理资源 ===');
    
    if (this.browser) {
      await this.browser.close();
      logger.info('浏览器已关闭');
    }

    if (this.dbConnection) {
      await this.dbConnection.end();
      logger.info('数据库连接已关闭');
    }
  }

  async run() {
    try {
      // 获取Git commit哈希
      const { stdout } = await execAsync('git rev-parse HEAD');
      this.gitCommitHash = stdout.trim();
      logger.info(`当前Git commit: ${this.gitCommitHash}`);

      await this.initialize();
      await this.performLogin();
      await this.scanAllPages();
      await this.generateReport();
      
      logger.info('=== 扫描完成 ===');
      logger.info(`报告目录: ${config.outputDir}`);
      
    } catch (error) {
      logger.error('执行失败', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// ============================================
// 主程序入口
// ============================================

async function main() {
  const scanner = new AutoFixScanner();
  await scanner.run();
}

// 执行主程序
main().catch(error => {
  console.error('程序执行失败:', error);
  process.exit(1);
});
