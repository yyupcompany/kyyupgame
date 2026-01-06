#!/usr/bin/env node

/**
 * 真实环境控制台错误检测测试系统
 * 
 * 功能：
 * 1. 自动启动前端和后端服务
 * 2. 使用Playwright在真实浏览器中测试所有165个页面
 * 3. 捕获真实的控制台错误和警告
 * 4. 生成详细的HTML和JSON测试报告
 * 5. 支持断点续传和错误重试
 */

const { chromium } = require('playwright');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

class RealConsoleTest {
  constructor() {
    this.frontendProcess = null;
    this.backendProcess = null;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.startTime = Date.now();
    this.isLoggedIn = false;

    // 测试账号配置
    this.testCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      principal: { username: 'principal', password: '123456' },
      teacher: { username: 'teacher', password: 'teacher123' },
      parent: { username: 'parent', password: '123456' }
    };

    // 配置
    this.config = {
      frontendUrl: 'http://localhost:5173',
      backendUrl: 'http://localhost:3000',
      frontendPort: 5173,
      backendPort: 3000,
      timeout: 30000,
      pageLoadTimeout: 15000,
      maxRetries: 3,
      waitForServices: 120000,
      headless: false, // 设为false可以看到浏览器运行
      slowMo: 100 // 减慢操作速度，便于观察
    };

    // 加载页面配置
    this.pageConfigs = this.loadPageConfigs();
  }

  /**
   * 加载页面配置
   */
  loadPageConfigs() {
    try {
      // 使用提取脚本从console-test-config.ts读取完整的165个页面配置
      const { extractPagesConfig } = require('./extract-pages-config.cjs');
      const pages = extractPagesConfig();

      console.log(`✅ 成功加载 ${pages.length} 个页面配置`);

      return pages;
    } catch (error) {
      console.warn('⚠️ 无法加载页面配置，使用默认配置');
      return [
        { name: 'Login', path: '/login', module: '用户认证模块' },
        { name: 'Dashboard', path: '/dashboard', module: '仪表板模块' },
        { name: 'DataStatistics', path: '/dashboard/data-statistics', module: '仪表板模块' }
      ];
    }
  }

  /**
   * 检查端口是否被占用
   */
  async checkPort(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(false));
        server.close();
      });
      server.on('error', () => resolve(true));
    });
  }

  /**
   * 等待服务启动
   */
  async waitForService(url, timeout = 60000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok || response.status < 500) {
          return true;
        }
      } catch (error) {
        // 服务还未启动，继续等待
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return false;
  }

  /**
   * 启动后端服务
   */
  async startBackend() {
    console.log('🚀 启动后端服务...');
    
    const backendPortInUse = await this.checkPort(this.config.backendPort);
    if (backendPortInUse) {
      console.log('✅ 后端服务已在运行');
      return true;
    }

    return new Promise((resolve, reject) => {
      const backendPath = path.resolve(__dirname, '../../../server');
      
      this.backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true
      });

      this.backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[后端] ${output.trim()}`);
        if (output.includes('Server running on') || output.includes('listening on')) {
          resolve(true);
        }
      });

      this.backendProcess.stderr.on('data', (data) => {
        console.error(`[后端错误] ${data.toString().trim()}`);
      });

      this.backendProcess.on('error', (error) => {
        console.error('❌ 后端服务启动失败:', error);
        reject(error);
      });

      // 超时处理
      setTimeout(() => {
        console.log('⏰ 后端服务启动超时，尝试继续...');
        resolve(false);
      }, 30000);
    });
  }

  /**
   * 启动前端服务
   */
  async startFrontend() {
    console.log('🚀 启动前端服务...');
    
    const frontendPortInUse = await this.checkPort(this.config.frontendPort);
    if (frontendPortInUse) {
      console.log('✅ 前端服务已在运行');
      return true;
    }

    return new Promise((resolve, reject) => {
      const frontendPath = path.resolve(__dirname, '../../');
      
      this.frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: frontendPath,
        stdio: 'pipe',
        shell: true
      });

      this.frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[前端] ${output.trim()}`);
        if (output.includes('Local:') || output.includes('ready in')) {
          resolve(true);
        }
      });

      this.frontendProcess.stderr.on('data', (data) => {
        console.error(`[前端错误] ${data.toString().trim()}`);
      });

      this.frontendProcess.on('error', (error) => {
        console.error('❌ 前端服务启动失败:', error);
        reject(error);
      });

      // 超时处理
      setTimeout(() => {
        console.log('⏰ 前端服务启动超时，尝试继续...');
        resolve(false);
      }, 30000);
    });
  }

  /**
   * 启动浏览器
   */
  async startBrowser() {
    console.log('🌐 启动浏览器...');
    
    this.browser = await chromium.launch({
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    this.page = await this.context.newPage();
    
    // 设置控制台监听
    this.setupConsoleListeners();
    
    console.log('✅ 浏览器启动成功');
  }

  /**
   * 执行快捷登录
   */
  async performQuickLogin(role = 'admin') {
    if (this.isLoggedIn) {
      return true;
    }

    try {
      console.log(`🔐 执行快捷登录 (${role})...`);

      // 导航到登录页面
      await this.page.goto(`${this.config.frontendUrl}/login`, {
        waitUntil: 'networkidle',
        timeout: this.config.pageLoadTimeout
      });

      // 等待页面加载
      await this.page.waitForTimeout(2000);

      // 查找并点击对应角色的快捷登录按钮
      const roleButtonMap = {
        admin: '.admin-btn',
        principal: '.principal-btn',
        teacher: '.teacher-btn',
        parent: '.parent-btn'
      };

      const buttonSelector = roleButtonMap[role];
      if (buttonSelector) {
        // 尝试点击快捷登录按钮
        const quickButton = await this.page.$(buttonSelector);
        if (quickButton) {
          await quickButton.click();
          console.log(`✅ 点击了${role}快捷登录按钮`);
        } else {
          // 如果快捷按钮不存在，使用手动输入
          await this.manualLogin(role);
        }
      } else {
        await this.manualLogin(role);
      }

      // 等待登录完成并跳转（增加等待时间）
      await this.page.waitForTimeout(5000);

      // 检查是否成功登录（URL不再是登录页面）
      let currentUrl = this.page.url();
      let retries = 0;
      const maxRetries = 3;

      while (currentUrl.includes('/login') && retries < maxRetries) {
        console.log(`⏳ 等待登录跳转... (${retries + 1}/${maxRetries})`);
        await this.page.waitForTimeout(2000);
        currentUrl = this.page.url();
        retries++;
      }

      if (!currentUrl.includes('/login')) {
        this.isLoggedIn = true;
        console.log(`✅ 登录成功，当前页面: ${currentUrl}`);
        return true;
      } else {
        console.log('❌ 登录失败，仍在登录页面');
        return false;
      }

    } catch (error) {
      console.error('❌ 登录过程出错:', error.message);
      return false;
    }
  }

  /**
   * 手动输入登录信息
   */
  async manualLogin(role) {
    const credentials = this.testCredentials[role];
    if (!credentials) {
      throw new Error(`未找到角色 ${role} 的登录凭据`);
    }

    console.log(`📝 手动输入登录信息 (${role})`);

    // 输入用户名
    const usernameInput = await this.page.$('input[data-testid="username-input"]') ||
                         await this.page.$('input[type="text"]');
    if (usernameInput) {
      await usernameInput.fill(credentials.username);
    }

    // 输入密码
    const passwordInput = await this.page.$('input[data-testid="password-input"]') ||
                         await this.page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill(credentials.password);
    }

    // 点击登录按钮
    const loginButton = await this.page.$('button[data-testid="login-button"]') ||
                       await this.page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
    }
  }

  /**
   * 设置控制台监听器
   */
  setupConsoleListeners() {
    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();

      if (type === 'error') {
        this.consoleErrors.push({
          type: 'error',
          message: text,
          location: location,
          timestamp: new Date().toISOString()
        });
      } else if (type === 'warning') {
        this.consoleWarnings.push({
          type: 'warning',
          message: text,
          location: location,
          timestamp: new Date().toISOString()
        });
      }
    });

    this.page.on('pageerror', (error) => {
      this.consoleErrors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * 测试单个页面
   */
  async testPage(pageConfig) {
    const startTime = Date.now();
    const pageErrors = [];
    const pageWarnings = [];

    try {
      console.log(`🔍 测试页面: ${pageConfig.name} (${pageConfig.path})`);

      // 清空之前的错误
      this.consoleErrors = [];
      this.consoleWarnings = [];

      // 导航到页面
      const url = `${this.config.frontendUrl}${pageConfig.path}`;
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.pageLoadTimeout
      });

      // 等待页面加载完成
      await this.page.waitForTimeout(2000);

      // 尝试等待一些常见元素
      try {
        await this.page.waitForSelector('body', { timeout: 5000 });
      } catch (e) {
        // 忽略选择器超时
      }

      // 收集这个页面的错误
      pageErrors.push(...this.consoleErrors);
      pageWarnings.push(...this.consoleWarnings);

      const result = {
        name: pageConfig.name,
        path: pageConfig.path,
        module: pageConfig.module,
        url: url,
        success: pageErrors.length === 0,
        errors: pageErrors,
        warnings: pageWarnings,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.testResults.push(result);

      if (result.success) {
        console.log(`✅ ${pageConfig.name} - 无控制台错误`);
      } else {
        console.log(`❌ ${pageConfig.name} - ${pageErrors.length}个错误, ${pageWarnings.length}个警告`);
        pageErrors.forEach(error => {
          console.log(`   - ${error.message}`);
        });
      }

      return result;

    } catch (error) {
      console.error(`💥 页面测试失败: ${pageConfig.name} - ${error.message}`);

      const result = {
        name: pageConfig.name,
        path: pageConfig.path,
        module: pageConfig.module,
        url: `${this.config.frontendUrl}${pageConfig.path}`,
        success: false,
        errors: [{
          type: 'test-error',
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }],
        warnings: [],
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.testResults.push(result);
      return result;
    }
  }

  /**
   * 运行所有页面测试
   */
  async runAllTests() {
    console.log(`🎯 开始测试 ${this.pageConfigs.length} 个页面...`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < this.pageConfigs.length; i++) {
      const pageConfig = this.pageConfigs[i];
      const progress = `[${i + 1}/${this.pageConfigs.length}]`;

      console.log(`${progress} 测试进度: ${((i / this.pageConfigs.length) * 100).toFixed(1)}%`);

      const result = await this.testPage(pageConfig);

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }

      // 短暂延迟，避免过快请求
      await this.page.waitForTimeout(500);
    }

    console.log(`\n📊 测试完成:`);
    console.log(`   ✅ 成功: ${successCount} 个页面`);
    console.log(`   ❌ 失败: ${failureCount} 个页面`);
    console.log(`   📈 成功率: ${((successCount / this.pageConfigs.length) * 100).toFixed(1)}%`);
  }

  /**
   * 生成测试报告
   */
  async generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    // 统计数据
    const totalPages = this.testResults.length;
    const successPages = this.testResults.filter(r => r.success).length;
    const failurePages = this.testResults.filter(r => !r.success).length;
    const totalErrors = this.testResults.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = this.testResults.reduce((sum, r) => sum + r.warnings.length, 0);

    // 按模块分组统计
    const moduleStats = {};
    this.testResults.forEach(result => {
      if (!moduleStats[result.module]) {
        moduleStats[result.module] = {
          total: 0,
          success: 0,
          failure: 0,
          errors: 0,
          warnings: 0
        };
      }

      const stats = moduleStats[result.module];
      stats.total++;
      if (result.success) {
        stats.success++;
      } else {
        stats.failure++;
      }
      stats.errors += result.errors.length;
      stats.warnings += result.warnings.length;
    });

    const report = {
      summary: {
        testType: 'Real Environment Console Test',
        timestamp: new Date().toISOString(),
        duration: duration,
        totalPages: totalPages,
        successPages: successPages,
        failurePages: failurePages,
        successRate: ((successPages / totalPages) * 100).toFixed(1),
        totalErrors: totalErrors,
        totalWarnings: totalWarnings
      },
      moduleStats: moduleStats,
      results: this.testResults,
      config: this.config
    };

    // 保存JSON报告
    const jsonReportPath = path.join(__dirname, 'real-console-test-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    await this.generateHtmlReport(report);

    console.log(`\n📋 报告已生成:`);
    console.log(`   📄 JSON: ${jsonReportPath}`);
    console.log(`   🌐 HTML: ${path.join(__dirname, 'real-console-test-report.html')}`);

    return report;
  }

  /**
   * 生成HTML报告
   */
  async generateHtmlReport(report) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>真实环境控制台错误检测报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 14px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .modules { padding: 0 30px; }
        .module { margin-bottom: 20px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .module-header { background: #f8f9fa; padding: 15px; font-weight: bold; cursor: pointer; }
        .module-content { padding: 15px; display: none; }
        .module-content.active { display: block; }
        .page-result { margin-bottom: 10px; padding: 10px; border-radius: 4px; }
        .page-success { background: #d4edda; border-left: 4px solid #28a745; }
        .page-error { background: #f8d7da; border-left: 4px solid #dc3545; }
        .error-detail { margin-top: 5px; font-size: 12px; color: #666; font-family: monospace; }
        .progress-bar { background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 真实环境控制台错误检测报告</h1>
            <p>测试时间: ${report.summary.timestamp} | 耗时: ${(report.summary.duration / 1000).toFixed(1)}秒</p>
        </div>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${report.summary.totalPages}</div>
                <div class="stat-label">总页面数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success">${report.summary.successPages}</div>
                <div class="stat-label">成功页面</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${report.summary.failurePages}</div>
                <div class="stat-label">失败页面</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${report.summary.successRate}%</div>
                <div class="stat-label">成功率</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${report.summary.totalErrors}</div>
                <div class="stat-label">总错误数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning">${report.summary.totalWarnings}</div>
                <div class="stat-label">总警告数</div>
            </div>
        </div>

        <div class="modules">
            <h2>📁 模块详细结果</h2>
            ${Object.entries(report.moduleStats).map(([moduleName, stats]) => `
                <div class="module">
                    <div class="module-header" onclick="toggleModule('${moduleName}')">
                        ${moduleName} - ${stats.success}/${stats.total} (${((stats.success / stats.total) * 100).toFixed(1)}%)
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(stats.success / stats.total) * 100}%"></div>
                        </div>
                    </div>
                    <div class="module-content" id="${moduleName}">
                        ${report.results.filter(r => r.module === moduleName).map(result => `
                            <div class="page-result ${result.success ? 'page-success' : 'page-error'}">
                                <strong>${result.name}</strong> - ${result.path}
                                ${result.success ? '✅ 无控制台错误' : `❌ ${result.errors.length}个错误`}
                                ${result.errors.length > 0 ? `
                                    <div class="error-detail">
                                        ${result.errors.map(error => `• ${error.message}`).join('<br>')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        function toggleModule(moduleName) {
            const content = document.getElementById(moduleName);
            content.classList.toggle('active');
        }

        // 默认展开失败的模块
        ${Object.entries(report.moduleStats).map(([moduleName, stats]) =>
          stats.failure > 0 ? `document.getElementById('${moduleName}').classList.add('active');` : ''
        ).join('')}
    </script>
</body>
</html>`;

    const htmlReportPath = path.join(__dirname, 'real-console-test-report.html');
    fs.writeFileSync(htmlReportPath, htmlContent);
  }

  /**
   * 清理资源
   */
  async cleanup() {
    console.log('🧹 清理资源...');

    if (this.page) {
      await this.page.close();
    }

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    if (this.frontendProcess) {
      this.frontendProcess.kill('SIGTERM');
    }

    if (this.backendProcess) {
      this.backendProcess.kill('SIGTERM');
    }

    console.log('✅ 资源清理完成');
  }

  /**
   * 主测试流程
   */
  async run() {
    try {
      console.log('🚀 开始真实环境控制台错误检测测试...\n');

      // 1. 启动服务
      await this.startBackend();
      await this.startFrontend();

      // 2. 等待服务就绪
      console.log('⏳ 等待服务启动...');
      const backendReady = await this.waitForService(this.config.backendUrl);
      const frontendReady = await this.waitForService(this.config.frontendUrl);

      if (!backendReady) {
        console.warn('⚠️ 后端服务可能未完全启动，继续测试...');
      }

      if (!frontendReady) {
        console.warn('⚠️ 前端服务可能未完全启动，继续测试...');
      }

      // 3. 启动浏览器
      await this.startBrowser();

      // 4. 执行登录（动态权限系统需要先登录）
      console.log('🔐 执行登录以获取动态权限...');
      const loginSuccess = await this.performQuickLogin('admin');
      if (!loginSuccess) {
        console.warn('⚠️ 登录失败，测试可能会有更多错误');
      }

      // 5. 运行测试
      await this.runAllTests();

      // 5. 生成报告
      const report = await this.generateReport();

      console.log('\n🎉 测试完成！');
      return report;

    } catch (error) {
      console.error('💥 测试过程中发生错误:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 主函数
async function main() {
  const test = new RealConsoleTest();

  try {
    await test.run();
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = RealConsoleTest;
