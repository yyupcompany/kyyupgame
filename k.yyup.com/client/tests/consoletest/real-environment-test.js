#!/usr/bin/env node

/**
 * 真实环境控制台错误检测测试
 * 
 * 与Mock测试不同，此测试：
 * 1. 启动真实的前后端服务
 * 2. 使用真实的API数据
 * 3. 在真实浏览器环境中检测控制台错误
 * 4. 提供更准确的生产环境错误检测
 */

const { chromium } = require('playwright');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  // 服务配置
  FRONTEND_URL: 'http://localhost:5173',
  BACKEND_URL: 'http://localhost:3000',
  
  // 测试页面配置（从console-test-config.ts导入）
  TEST_PAGES: [
    // 用户认证模块
    { name: 'Login', path: '/login', module: '用户认证模块' },
    { name: 'Dashboard', path: '/dashboard', module: '仪表板模块' },
    { name: 'DataStatistics', path: '/dashboard/data-statistics', module: '仪表板模块' },
    // 可以添加更多页面...
  ],
  
  // 测试选项
  HEADLESS: true,
  TIMEOUT: 30000,
  WAIT_FOR_LOAD: 3000,
  MAX_CONCURRENT: 3
};

class RealEnvironmentTester {
  constructor() {
    this.browser = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      startTime: Date.now()
    };
    this.services = {
      frontend: null,
      backend: null
    };
  }

  /**
   * 启动前后端服务
   */
  async startServices() {
    console.log('🚀 启动前后端服务...');
    
    return new Promise((resolve, reject) => {
      // 使用项目的start:all命令启动服务
      const startProcess = spawn('npm', ['run', 'start:all'], {
        cwd: path.resolve(__dirname, '../../../'),
        stdio: 'pipe'
      });

      let frontendReady = false;
      let backendReady = false;

      startProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        
        // 检测前端服务启动
        if (output.includes('Local:') && output.includes('5173')) {
          frontendReady = true;
        }
        
        // 检测后端服务启动
        if (output.includes('Server running on port 3000')) {
          backendReady = true;
        }
        
        // 两个服务都启动后解析
        if (frontendReady && backendReady) {
          console.log('✅ 前后端服务启动完成');
          this.services.process = startProcess;
          resolve();
        }
      });

      startProcess.stderr.on('data', (data) => {
        console.error('服务启动错误:', data.toString());
      });

      // 30秒超时
      setTimeout(() => {
        if (!frontendReady || !backendReady) {
          reject(new Error('服务启动超时'));
        }
      }, 30000);
    });
  }

  /**
   * 停止服务
   */
  async stopServices() {
    console.log('🛑 停止服务...');
    
    if (this.services.process) {
      this.services.process.kill('SIGTERM');
    }
    
    // 使用项目的stop命令确保完全停止
    return new Promise((resolve) => {
      exec('npm run stop', { cwd: path.resolve(__dirname, '../../../') }, () => {
        console.log('✅ 服务已停止');
        resolve();
      });
    });
  }

  /**
   * 初始化浏览器
   */
  async initBrowser() {
    console.log('🌐 启动浏览器...');
    this.browser = await chromium.launch({ 
      headless: CONFIG.HEADLESS,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  /**
   * 测试单个页面
   */
  async testPage(pageConfig) {
    const context = await this.browser.newContext();
    const page = await context.newPage();
    
    const consoleErrors = [];
    const consoleWarnings = [];
    
    // 监听控制台消息
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: 'error',
          text: msg.text(),
          location: msg.location()
        });
      } else if (msg.type() === 'warning') {
        consoleWarnings.push({
          type: 'warning', 
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    // 监听页面错误
    page.on('pageerror', (error) => {
      consoleErrors.push({
        type: 'pageerror',
        text: error.message,
        stack: error.stack
      });
    });

    try {
      console.log(`🔍 测试页面: ${pageConfig.name} (${pageConfig.path})`);
      
      // 导航到页面
      await page.goto(`${CONFIG.FRONTEND_URL}${pageConfig.path}`, {
        waitUntil: 'networkidle',
        timeout: CONFIG.TIMEOUT
      });
      
      // 等待页面加载完成
      await page.waitForTimeout(CONFIG.WAIT_FOR_LOAD);
      
      // 检查页面是否正常渲染
      const title = await page.title();
      const hasContent = await page.locator('body').count() > 0;
      
      this.results.total++;
      
      if (consoleErrors.length === 0 && hasContent) {
        console.log(`  ✅ ${pageConfig.name} - 无控制台错误`);
        this.results.passed++;
      } else {
        console.log(`  ❌ ${pageConfig.name} - ${consoleErrors.length}个错误`);
        this.results.failed++;
        
        this.results.errors.push({
          page: pageConfig.name,
          path: pageConfig.path,
          module: pageConfig.module,
          errors: consoleErrors,
          warnings: consoleWarnings
        });
      }
      
    } catch (error) {
      console.log(`  ❌ ${pageConfig.name} - 页面加载失败: ${error.message}`);
      this.results.failed++;
      this.results.errors.push({
        page: pageConfig.name,
        path: pageConfig.path,
        module: pageConfig.module,
        errors: [{ type: 'load_error', text: error.message }],
        warnings: []
      });
    } finally {
      await context.close();
    }
  }

  /**
   * 运行所有测试
   */
  async runTests() {
    console.log('🎯 开始真实环境控制台错误检测...\n');
    
    try {
      // 1. 启动服务
      await this.startServices();
      
      // 2. 初始化浏览器
      await this.initBrowser();
      
      // 3. 运行测试
      for (const pageConfig of CONFIG.TEST_PAGES) {
        await this.testPage(pageConfig);
      }
      
      // 4. 生成报告
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 测试运行失败:', error);
    } finally {
      // 5. 清理资源
      if (this.browser) {
        await this.browser.close();
      }
      await this.stopServices();
    }
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const duration = Date.now() - this.results.startTime;
    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    console.log('\n📊 真实环境控制台错误检测报告');
    console.log('='.repeat(50));
    console.log(`📈 总体统计:`);
    console.log(`   总页面数: ${this.results.total}`);
    console.log(`   成功页面数: ${this.results.passed}`);
    console.log(`   失败页面数: ${this.results.failed}`);
    console.log(`   通过率: ${passRate}%`);
    console.log(`   测试耗时: ${duration}ms`);
    
    if (this.results.errors.length > 0) {
      console.log(`\n❌ 失败页面详情:`);
      this.results.errors.forEach(error => {
        console.log(`   ${error.module}/${error.page}: ${error.errors.length}个错误`);
        error.errors.forEach(err => {
          console.log(`     - ${err.type}: ${err.text}`);
        });
      });
    }
    
    // 保存详细报告到文件
    const reportPath = path.join(__dirname, 'real-environment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  }
}

// 主函数
async function main() {
  const tester = new RealEnvironmentTester();
  await tester.runTests();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = RealEnvironmentTester;
