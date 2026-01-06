/**
 * 检查登录页面的控制台错误
 * 使用MCP浏览器监听所有控制台消息
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function checkLoginConsoleErrors() {
  console.log('🚀 启动登录页面控制台错误检查');
  console.log(`📅 检查时间: ${new Date().toLocaleString('zh-CN')}\n`);

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  // 收集所有控制台消息
  const consoleMessages = {
    errors: [],
    warnings: [],
    logs: [],
    info: []
  };

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    const message = {
      type: type,
      text: text,
      url: location.url,
      lineNumber: location.lineNumber,
      columnNumber: location.columnNumber,
      timestamp: new Date().toLocaleTimeString()
    };

    if (type === 'error') {
      consoleMessages.errors.push(message);
      console.log(`❌ [ERROR] ${text}`);
      if (location.url) {
        console.log(`   位置: ${location.url}:${location.lineNumber}:${location.columnNumber}`);
      }
    } else if (type === 'warning') {
      consoleMessages.warnings.push(message);
      console.log(`⚠️  [WARNING] ${text}`);
    } else if (type === 'log') {
      consoleMessages.logs.push(message);
    } else if (type === 'info') {
      consoleMessages.info.push(message);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.log(`❌ [PAGE ERROR] ${error.message}`);
    consoleMessages.errors.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // 监听网络请求失败
  page.on('requestfailed', request => {
    console.log(`❌ [REQUEST FAILED] ${request.url()}`);
    console.log(`   失败原因: ${request.failure()?.errorText}`);
  });

  try {
    console.log('\n📍 步骤1: 访问登录页面...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('✅ 登录页面加载完成\n');
    
    await page.waitForTimeout(3000);

    console.log('📍 步骤2: 等待登录表单加载...');
    await page.waitForSelector('[data-testid="username-input"]', { timeout: 30000 });
    console.log('✅ 登录表单已加载\n');

    await page.waitForTimeout(2000);

    console.log('📍 步骤3: 填写登录信息...');
    await page.fill('[data-testid="username-input"]', 'principal');
    await page.waitForTimeout(500);
    await page.fill('[data-testid="password-input"]', '123456');
    await page.waitForTimeout(500);
    console.log('✅ 登录信息已填写\n');

    console.log('📍 步骤4: 点击登录按钮...');
    await page.click('button[type="submit"]', { force: true });
    console.log('✅ 已点击登录按钮\n');

    console.log('📍 步骤5: 等待登录响应...');
    try {
      await page.waitForNavigation({ timeout: 10000 });
      console.log('✅ 页面导航完成\n');
    } catch (e) {
      console.log('⚠️  导航超时，继续检查...\n');
    }

    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log(`📍 当前URL: ${currentUrl}\n`);

    // 等待一段时间收集所有错误
    console.log('📍 步骤6: 等待收集控制台消息...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error(`\n❌ 测试过程出错: ${error.message}`);
  }

  // 生成报告
  console.log('\n' + '='.repeat(80));
  console.log('📊 控制台错误检查报告');
  console.log('='.repeat(80));

  console.log(`\n【错误统计】`);
  console.log(`  ❌ 错误 (Errors):   ${consoleMessages.errors.length} 个`);
  console.log(`  ⚠️  警告 (Warnings): ${consoleMessages.warnings.length} 个`);
  console.log(`  ℹ️  日志 (Logs):     ${consoleMessages.logs.length} 个`);
  console.log(`  📝 信息 (Info):     ${consoleMessages.info.length} 个`);

  if (consoleMessages.errors.length > 0) {
    console.log(`\n【错误详情】`);
    consoleMessages.errors.forEach((err, index) => {
      console.log(`\n${index + 1}. [${err.timestamp}] ${err.type.toUpperCase()}`);
      console.log(`   消息: ${err.text}`);
      if (err.url) {
        console.log(`   位置: ${err.url}:${err.lineNumber}:${err.columnNumber}`);
      }
      if (err.stack) {
        console.log(`   堆栈: ${err.stack.split('\n').slice(0, 3).join('\n          ')}`);
      }
    });
  }

  if (consoleMessages.warnings.length > 0) {
    console.log(`\n【警告详情】`);
    consoleMessages.warnings.slice(0, 10).forEach((warn, index) => {
      console.log(`\n${index + 1}. [${warn.timestamp}] WARNING`);
      console.log(`   消息: ${warn.text}`);
    });
    if (consoleMessages.warnings.length > 10) {
      console.log(`\n   ... 还有 ${consoleMessages.warnings.length - 10} 个警告`);
    }
  }

  console.log('\n' + '='.repeat(80));
  
  if (consoleMessages.errors.length === 0) {
    console.log('✅ 没有发现控制台错误');
  } else {
    console.log(`⚠️  发现 ${consoleMessages.errors.length} 个控制台错误，需要修复`);
  }
  
  console.log('='.repeat(80));

  // 保持浏览器打开一段时间以便查看
  console.log('\n⏳ 浏览器将在10秒后关闭...');
  await page.waitForTimeout(10000);

  await browser.close();

  return consoleMessages;
}

checkLoginConsoleErrors().catch(console.error);

