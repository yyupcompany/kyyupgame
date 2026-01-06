#!/usr/bin/env node

/**
 * 快速真实环境控制台错误检测
 * 
 * 功能：
 * 1. 快速启动前后端服务
 * 2. 测试关键页面的控制台错误
 * 3. 生成简要报告
 * 4. 适合快速验证和CI/CD
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class QuickRealTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.isLoggedIn = false;

    // 测试账号配置
    this.testCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      principal: { username: 'principal', password: '123456' },
      teacher: { username: 'teacher', password: 'teacher123' },
      parent: { username: 'parent', password: '123456' }
    };

    // 关键页面配置（用于快速测试）
    this.keyPages = [
      { name: 'Login', path: '/login', module: '用户认证', requireAuth: false },
      { name: 'Dashboard', path: '/dashboard', module: '仪表板', requireAuth: true },
      { name: 'DataStatistics', path: '/dashboard/data-statistics', module: '统计', requireAuth: true },
      { name: 'ActivityList', path: '/activity/list', module: '活动管理', requireAuth: true },
      { name: 'AIAssistant', path: '/ai/assistant', module: 'AI智能', requireAuth: true },
      { name: 'MarketingCenter', path: '/centers/marketing', module: '营销中心', requireAuth: true },
      { name: 'AnalyticsCenter', path: '/centers/analytics', module: '分析中心', requireAuth: true }
    ];
  }

  async checkServices() {
    console.log('🔍 检查服务状态...');
    
    try {
      // 检查前端服务 (使用 localhost:5173)
      let frontendOk = false;
      try {
        const frontendResponse = await fetch('http://localhost:5173', {
          timeout: 5000,
          headers: { 'Accept': 'text/html' }
        });
        frontendOk = frontendResponse.status === 200;
      } catch (error) {
        frontendOk = false;
      }

      // 检查后端服务
      let backendOk = false;
      try {
        const backendResponse = await fetch('http://localhost:3000/api/health', { timeout: 5000 });
        backendOk = backendResponse.ok;
      } catch (error) {
        backendOk = false;
      }

      console.log(`前端服务: ${frontendOk ? '✅ 运行中' : '❌ 未启动'}`);
      console.log(`后端服务: ${backendOk ? '✅ 运行中' : '❌ 未启动'}`);

      if (!frontendOk) {
        console.log('💡 请先启动前端服务: npm run dev');
      }

      if (!backendOk) {
        console.log('💡 请先启动后端服务: cd ../server && npm run dev');
      }

      return frontendOk && backendOk;
    } catch (error) {
      console.error('❌ 服务检查失败:', error.message);
      return false;
    }
  }

  async startBrowser() {
    console.log('🌐 启动浏览器...');

    this.browser = await chromium.launch({
      headless: true, // 快速测试使用无头模式
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await context.newPage();
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
      await this.page.goto('http://localhost:5173/login', {
        waitUntil: 'networkidle',
        timeout: 15000
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
    
    // 监听控制台错误
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.currentPageErrors.push({
          type: 'error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    this.page.on('pageerror', (error) => {
      this.currentPageErrors.push({
        type: 'pageerror',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  async testPage(pageConfig) {
    this.currentPageErrors = [];
    
    try {
      console.log(`🔍 测试: ${pageConfig.name}`);
      
      const url = `http://localhost:5173${pageConfig.path}`;
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 15000
      });
      
      // 等待页面渲染
      await this.page.waitForTimeout(2000);
      
      const result = {
        name: pageConfig.name,
        path: pageConfig.path,
        module: pageConfig.module,
        success: this.currentPageErrors.length === 0,
        errors: [...this.currentPageErrors],
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      
      if (result.success) {
        console.log(`   ✅ 无控制台错误`);
      } else {
        console.log(`   ❌ ${result.errors.length}个错误`);
        result.errors.forEach(error => {
          console.log(`      - ${error.message}`);
        });
      }
      
      return result;
      
    } catch (error) {
      console.log(`   💥 测试失败: ${error.message}`);
      
      const result = {
        name: pageConfig.name,
        path: pageConfig.path,
        module: pageConfig.module,
        success: false,
        errors: [{ type: 'test-error', message: error.message }],
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      return result;
    }
  }

  async runTests() {
    console.log(`🎯 开始快速测试 ${this.keyPages.length} 个关键页面...\n`);

    for (const pageConfig of this.keyPages) {
      await this.testPage(pageConfig);
      await this.page.waitForTimeout(500); // 短暂延迟
    }
  }

  generateReport() {
    const successCount = this.results.filter(r => r.success).length;
    const failureCount = this.results.filter(r => !r.success).length;
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0);
    
    const report = {
      summary: {
        testType: 'Quick Real Environment Test',
        timestamp: new Date().toISOString(),
        totalPages: this.results.length,
        successPages: successCount,
        failurePages: failureCount,
        successRate: ((successCount / this.results.length) * 100).toFixed(1),
        totalErrors: totalErrors
      },
      results: this.results
    };
    
    // 保存报告
    const reportPath = path.join(__dirname, 'quick-real-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 控制台输出
    console.log('\n📊 快速测试结果:');
    console.log(`   ✅ 成功: ${successCount} 个页面`);
    console.log(`   ❌ 失败: ${failureCount} 个页面`);
    console.log(`   📈 成功率: ${report.summary.successRate}%`);
    console.log(`   🐛 总错误: ${totalErrors} 个`);
    console.log(`   📄 报告: ${reportPath}`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      // 1. 检查服务
      const servicesReady = await this.checkServices();
      if (!servicesReady) {
        console.log('\n❌ 服务未就绪，请先启动前后端服务');
        console.log('前端: npm run dev');
        console.log('后端: cd ../server && npm run dev');

        // 返回一个基本的报告结构
        return {
          summary: {
            testType: 'Quick Real Environment Test',
            timestamp: new Date().toISOString(),
            totalPages: 0,
            successPages: 0,
            failurePages: 0,
            successRate: '0.0',
            totalErrors: 0,
            status: 'SERVICES_NOT_READY'
          },
          results: []
        };
      }
      
      // 2. 启动浏览器
      await this.startBrowser();

      // 3. 执行登录（动态权限系统需要先登录）
      console.log('🔐 执行登录以获取动态权限...');
      const loginSuccess = await this.performQuickLogin('admin');
      if (!loginSuccess) {
        console.warn('⚠️ 登录失败，测试可能会有更多错误');
      }

      // 4. 运行测试
      await this.runTests();
      
      // 4. 生成报告
      const report = this.generateReport();
      
      console.log('\n🎉 快速测试完成！');
      return report;
      
    } catch (error) {
      console.error('💥 测试失败:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 主函数
async function main() {
  const test = new QuickRealTest();
  
  try {
    await test.run();
    process.exit(0);
  } catch (error) {
    console.error('❌ 快速测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = QuickRealTest;
