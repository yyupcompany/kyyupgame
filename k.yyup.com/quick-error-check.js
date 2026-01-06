#!/usr/bin/env node

/**
 * 快速前端错误检查脚本
 * 轻量级版本，用于快速检测关键错误
 */

const { chromium } = require('playwright');
const fs = require('fs');

// 简化配置
const config = {
  url: process.env.FRONTEND_URL || 'http://localhost:5173',
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  headless: process.env.HEADLESS !== 'false',
  timeout: 15000
};

// 关键页面列表 - 只测试最重要的页面
const criticalPages = [
  '/',
  '/dashboard',
  '/system/users',
  '/students',
  '/teachers',
  '/activities',
  '/finance',
  '/ai-center',
  '/login'
];

class QuickErrorChecker {
  constructor() {
    this.errors = [];
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 启动快速错误检查...');

    this.browser = await chromium.launch({ headless: config.headless });
    this.page = await this.browser.newPage();

    // 监听错误
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console',
          page: this.page.url(),
          message: msg.text(),
          location: msg.location()
        });
      }
    });

    this.page.on('pageerror', error => {
      this.errors.push({
        type: 'javascript',
        page: this.page.url(),
        message: error.message,
        stack: error.stack
      });
    });

    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.errors.push({
          type: 'network',
          page: this.page.url(),
          url: response.url(),
          status: response.status()
        });
      }
    });
  }

  async login() {
    try {
      console.log('🔐 尝试登录...');
      await this.page.goto(`${config.url}/login`, { waitUntil: 'networkidle' });

      await this.page.waitForSelector('input[name="username"], input[placeholder*="用户名"]', { timeout: 5000 });

      await this.page.fill('input[name="username"], input[placeholder*="用户名"]', config.username);
      await this.page.fill('input[name="password"], input[placeholder*="密码"]', config.password);
      await this.page.click('button[type="submit"], button:has-text("登录")');

      await this.page.waitForTimeout(3000);

      // 检查是否登录成功
      const currentUrl = this.page.url();
      if (currentUrl.includes('login')) {
        console.log('⚠️ 登录可能未成功，但继续测试...');
      } else {
        console.log('✅ 登录成功');
      }
    } catch (error) {
      console.log('⚠️ 登录失败，继续测试公共页面...');
    }
  }

  async checkPage(pagePath) {
    const fullUrl = `${config.url}${pagePath}`;
    console.log(`🔍 检查页面: ${pagePath}`);

    try {
      await this.page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: config.timeout
      });

      await this.page.waitForTimeout(2000);

      // 检查是否是错误页面
      const content = await this.page.content();
      const isErrorPage = content.includes('404') ||
                          content.includes('500') ||
                          content.includes('页面不存在') ||
                          content.includes('服务器错误');

      if (isErrorPage && !pagePath.includes('404')) {
        this.errors.push({
          type: 'page_error',
          page: pagePath,
          message: '页面显示错误内容'
        });
      }

      console.log(`  ✅ ${pagePath} - 正常`);
    } catch (error) {
      this.errors.push({
        type: 'load_error',
        page: pagePath,
        message: error.message
      });
      console.log(`  ❌ ${pagePath} - 错误: ${error.message}`);
    }
  }

  async run() {
    try {
      await this.init();
      await this.login();

      console.log('\n📋 开始检查关键页面...\n');

      for (const pagePath of criticalPages) {
        await this.checkPage(pagePath);
      }

      // 生成摘要报告
      this.generateSummary();

    } catch (error) {
      console.error('💥 检查失败:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  generateSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 快速错误检查摘要');
    console.log('='.repeat(50));

    const summary = {
      totalChecked: criticalPages.length,
      totalErrors: this.errors.length,
      errorsByType: {},
      errorsByPage: {}
    };

    this.errors.forEach(error => {
      summary.errorsByType[error.type] = (summary.errorsByType[error.type] || 0) + 1;

      if (!summary.errorsByPage[error.page]) {
        summary.errorsByPage[error.page] = [];
      }
      summary.errorsByPage[error.page].push(error);
    });

    console.log(`✅ 检查页面数: ${summary.totalChecked}`);
    console.log(`❌ 错误总数: ${summary.totalErrors}`);

    if (summary.totalErrors > 0) {
      console.log('\n🚨 错误类型分布:');
      Object.entries(summary.errorsByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} 个`);
      });

      console.log('\n📍 错误页面列表:');
      Object.entries(summary.errorsByPage).forEach(([page, errors]) => {
        console.log(`   ${page}: ${errors.length} 个错误`);
      });

      console.log('\n🔥 详细错误信息:');
      this.errors.slice(0, 10).forEach((error, index) => {
        console.log(`\n${index + 1}. [${error.type.toUpperCase()}] ${error.page}`);
        console.log(`   消息: ${error.message}`);
        if (error.status) console.log(`   状态: ${error.status}`);
        if (error.location) console.log(`   位置: ${error.location}`);
      });

      if (this.errors.length > 10) {
        console.log(`\n... 还有 ${this.errors.length - 10} 个错误未显示`);
      }
    } else {
      console.log('\n🎉 太棒了！未发现任何错误！');
    }

    // 保存详细报告
    const reportPath = `./quick-error-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      config: config,
      summary: summary,
      errors: this.errors
    }, null, 2));

    console.log(`\n📄 详细报告已保存: ${reportPath}`);
    console.log('='.repeat(50));

    // 设置退出码
    process.exit(summary.totalErrors > 0 ? 1 : 0);
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

// 运行检查
if (require.main === module) {
  const checker = new QuickErrorChecker();
  checker.run().catch(error => {
    console.error('💥 未处理的错误:', error);
    process.exit(1);
  });
}

module.exports = QuickErrorChecker;