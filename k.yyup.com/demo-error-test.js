#!/usr/bin/env node

/**
 * 演示脚本 - 前端错误检测工具使用示例
 */

const { chromium } = require('playwright');

async function demo() {
  console.log('🎬 前端错误检测工具演示');
  console.log('='.repeat(40));

  console.log('\n📋 本演示将展示:');
  console.log('1. 如何启动浏览器');
  console.log('2. 如何登录系统');
  console.log('3. 如何访问页面');
  console.log('4. 如何捕获错误');
  console.log('5. 如何生成报告');

  console.log('\n🚀 开始演示...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 设置错误监听
  let errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', message: msg.text() });
    }
  });

  page.on('pageerror', error => {
    errors.push({ type: 'javascript', message: error.message });
  });

  try {
    // 1. 访问登录页面
    console.log('📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 尝试登录
    console.log('🔐 步骤2: 尝试登录');
    try {
      await page.waitForSelector('input[name="username"]', { timeout: 5000 });
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('⚠️ 登录元素未找到，可能是开发环境');
    }

    // 3. 访问几个关键页面
    const demoPages = ['/dashboard', '/system/users', '/ai-center'];

    for (const pagePath of demoPages) {
      console.log(`🔍 访问页面: ${pagePath}`);
      try {
        await page.goto(`http://localhost:5173${pagePath}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });
        await page.waitForTimeout(2000);
        console.log(`✅ ${pagePath} - 加载成功`);
      } catch (error) {
        console.log(`❌ ${pagePath} - 加载失败: ${error.message}`);
      }
    }

    // 4. 报告结果
    console.log('\n📊 演示结果:');
    console.log(`   访问页面数: ${demoPages.length + 1}`); // +1 for login page
    console.log(`   捕获错误数: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n🚨 发现的错误:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.type}] ${error.message}`);
      });
    } else {
      console.log('\n🎉 太棒了！演示过程中未发现错误！');
    }

    console.log('\n💡 演示完成！');
    console.log('\n📖 要运行完整的错误检测，请使用:');
    console.log('   npm run test:frontend:errors');
    console.log('   npm run test:frontend:errors:quick');
    console.log('   npm run test:frontend:errors:full');

  } catch (error) {
    console.error('💥 演示失败:', error.message);
  } finally {
    await browser.close();
  }
}

// 运行演示
if (require.main === module) {
  demo().catch(console.error);
}

module.exports = demo;