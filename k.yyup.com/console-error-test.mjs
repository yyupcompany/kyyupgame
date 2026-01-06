#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// 配置
const CONFIG = {
  frontendUrl: 'http://localhost:5173',
  adminUsername: 'admin',
  adminPassword: 'admin123',
  headless: true,
  timeout: 30000,
  takeScreenshots: false,
  outputPath: './console-error-report.json'
};

console.log('🚀 开始前端控制台错误检测...');
console.log(`📍 前端地址: ${CONFIG.frontendUrl}`);
console.log(`👤 管理员账号: ${CONFIG.adminUsername}/${CONFIG.adminPassword}`);

async function runConsoleErrorTest() {
  let browser;
  let results = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    pages: [],
    summary: {
      totalPages: 0,
      successPages: 0,
      failedPages: 0,
      totalErrors: 0,
      errors: []
    }
  };

  try {
    // 启动浏览器
    console.log('🌐 启动浏览器...');
    browser = await chromium.launch({
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 监听控制台输出
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push({
          type,
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // 监听网络错误
    const networkErrors = [];
    page.on('response', response => {
      const status = response.status();
      if (status >= 400) {
        networkErrors.push({
          url: response.url(),
          status,
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 访问首页并登录
    console.log('🏠 访问首页...');
    await page.goto(CONFIG.frontendUrl, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
    await page.waitForTimeout(2000);

    // 检查是否需要登录
    const loginSelectors = [
      'input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]',
      'input[placeholder*="密码"], input[name="password"]'
    ];

    let needsLogin = false;
    for (const selector of loginSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        needsLogin = true;
        break;
      }
    }

    // 执行登录
    if (needsLogin) {
      console.log('🔐 检测到登录页面，执行登录...');

      // 输入用户名
      await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"], input[type="text"]', CONFIG.adminUsername);

      // 输入密码
      await page.fill('input[placeholder*="密码"], input[name="password"], input[type="password"]', CONFIG.adminPassword);

      // 点击登录按钮
      await page.click('button[type="submit"], .el-button--primary, button:has-text("登录")');

      // 等待登录完成
      await page.waitForTimeout(5000);
      console.log('✅ 登录完成');
    } else {
      console.log('ℹ️  已登录或无需登录');
    }

    // 要测试的页面列表（基于应用架构）
    const pagesToTest = [
      // Dashboard
      '/',
      '/dashboard',
      '/dashboard/overview',

      // User Management
      '/users',
      '/users/list',
      '/roles',
      '/permissions',

      // Student Management
      '/students',
      '/students/list',
      '/classes',
      '/classes/list',

      // Teacher Management
      '/teachers',
      '/teachers/list',

      // Activity Management
      '/activities',
      '/activities/list',

      // Enrollment
      '/enrollment',
      '/enrollment/plans',

      // Finance
      '/finance',
      '/finance/fees',

      // AI Assistant
      '/ai-assistant',
      '/ai-chat',

      // System Settings
      '/system',
      '/system/settings'
    ];

    console.log(`📋 开始测试 ${pagesToTest.length} 个页面...`);

    // 测试每个页面
    for (const pageUrl of pagesToTest) {
      console.log(`🔍 测试页面: ${pageUrl}`);

      const pageResult = {
        url: pageUrl,
        success: false,
        loadTime: 0,
        consoleErrors: [],
        pageErrors: [],
        networkErrors: [],
        timestamp: new Date().toISOString()
      };

      try {
        // 清空之前的错误记录
        consoleMessages.length = 0;
        pageErrors.length = 0;
        networkErrors.length = 0;

        // 访问页面
        const startTime = Date.now();
        await page.goto(`${CONFIG.frontendUrl}${pageUrl}`, {
          waitUntil: 'networkidle',
          timeout: CONFIG.timeout
        });
        const loadTime = Date.now() - startTime;

        // 等待页面稳定
        await page.waitForTimeout(3000);

        // 记录结果
        pageResult.success = true;
        pageResult.loadTime = loadTime;
        pageResult.consoleErrors = [...consoleMessages];
        pageResult.pageErrors = [...pageErrors];
        pageResult.networkErrors = [...networkErrors];

        console.log(`✅ ${pageUrl} - ${loadTime}ms - ${consoleMessages.length + pageErrors.length + networkErrors.length} 个错误`);

      } catch (error) {
        pageResult.success = false;
        pageResult.error = {
          message: error.message,
          stack: error.stack
        };
        console.log(`❌ ${pageUrl} - 加载失败: ${error.message}`);
      }

      results.pages.push(pageResult);

      // 更新统计
      results.summary.totalPages++;
      if (pageResult.success) {
        results.summary.successPages++;
      } else {
        results.summary.failedPages++;
      }
      results.summary.totalErrors += pageResult.consoleErrors.length + pageResult.pageErrors.length + pageResult.networkErrors.length;
    }

    // 生成报告
    console.log('\n📊 生成测试报告...');

    // 保存详细报告
    const reportPath = CONFIG.outputPath;
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // 打印摘要
    const successRate = results.summary.totalPages > 0
      ? ((results.summary.successPages / results.summary.totalPages) * 100).toFixed(2)
      : 0;

    console.log('\n' + '='.repeat(60));
    console.log('🎉 前端控制台错误检测完成！');
    console.log('='.repeat(60));
    console.log(`⏱️  测试时间: ${Date.now() - new Date(results.timestamp).getTime()}ms`);
    console.log(`📊 页面统计: ${results.summary.totalPages} 总页面 | ${results.summary.successPages} 成功 | ${results.summary.failedPages} 失败`);
    console.log(`✅ 成功率: ${successRate}%`);
    console.log(`🚨 错误统计: 总错误数: ${results.summary.totalErrors}`);

    // 显示有错误的页面
    const pagesWithErrors = results.pages.filter(p =>
      p.consoleErrors.length > 0 || p.pageErrors.length > 0 || p.networkErrors.length > 0
    );

    if (pagesWithErrors.length > 0) {
      console.log('\n🔍 发现问题的页面:');
      pagesWithErrors.forEach(page => {
        const totalErrors = page.consoleErrors.length + page.pageErrors.length + page.networkErrors.length;
        console.log(`  ❌ ${page.url} - ${totalErrors} 个错误`);

        // 显示控制台错误
        page.consoleErrors.forEach(err => {
          console.log(`    📌 控制台${err.type}: ${err.text}`);
        });

        // 显示页面错误
        page.pageErrors.forEach(err => {
          console.log(`    💥 页面错误: ${err.message}`);
        });

        // 显示网络错误
        page.networkErrors.forEach(err => {
          console.log(`    🌐 网络错误: ${err.status} ${err.url}`);
        });
      });
    }

    console.log(`\n📄 详细报告已保存至: ${reportPath}`);

    return results;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    throw error;

  } finally {
    if (browser) {
      await browser.close();
      console.log('🔚 浏览器已关闭');
    }
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runConsoleErrorTest()
    .then(() => {
      console.log('✅ 所有测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 测试失败:', error);
      process.exit(1);
    });
}

export default runConsoleErrorTest;