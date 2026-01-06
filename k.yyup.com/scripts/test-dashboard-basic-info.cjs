#!/usr/bin/env node

/**
 * 测试Dashboard基础资料功能
 */

const { chromium } = require('playwright');

async function testDashboardBasicInfo() {
  console.log('🔍 开始测试Dashboard基础资料功能...\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  let errorCount = 0;
  const errors = [];
  
  // 监听控制台错误
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errorCount++;
      errors.push(text);
      console.log(`[控制台错误] ${text}`);
    } else if (text.includes('基础资料') || text.includes('基本资料')) {
      console.log(`[控制台] ${text}`);
    }
  });
  
  try {
    // 1. 登录
    console.log('1️⃣ 登录系统...');
    await page.goto('http://localhost:5173');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    console.log('✅ 登录成功\n');
    
    await page.waitForTimeout(3000);
    
    // 2. 检查页面是否有错误提示
    console.log('2️⃣ 检查页面错误提示...');
    
    const errorMessages = await page.locator('.el-message--error').count();
    const warningMessages = await page.locator('.el-message--warning').count();
    
    console.log(`错误提示数量: ${errorMessages}`);
    console.log(`警告提示数量: ${warningMessages}`);
    
    if (errorMessages > 0) {
      console.log('❌ 页面显示错误提示');
      const errorTexts = await page.locator('.el-message--error').allTextContents();
      errorTexts.forEach(text => console.log(`  - ${text}`));
    } else {
      console.log('✅ 页面没有错误提示');
    }
    
    // 3. 检查基础资料是否加载
    console.log('\n3️⃣ 检查基础资料加载...');
    
    // 等待页面加载完成
    await page.waitForTimeout(2000);
    
    // 检查是否有"访问基础资料失败"的文本
    const failureText = await page.locator('text=访问基础资料失败').count();
    const basicInfoFailure = await page.locator('text=基础资料失败').count();
    const basicInfoError = await page.locator('text=基本资料失败').count();
    
    if (failureText > 0 || basicInfoFailure > 0 || basicInfoError > 0) {
      console.log('❌ 页面显示"访问基础资料失败"');
    } else {
      console.log('✅ 页面没有显示"访问基础资料失败"');
    }
    
    // 4. 截图
    await page.screenshot({ 
      path: './test-screenshots/dashboard-basic-info-test.png',
      fullPage: true 
    });
    console.log('\n✅ 截图已保存: dashboard-basic-info-test.png');
    
    // 5. 总结
    console.log('\n' + '='.repeat(60));
    console.log('测试总结');
    console.log('='.repeat(60));
    console.log(`控制台错误数量: ${errorCount}`);
    console.log(`页面错误提示: ${errorMessages}`);
    console.log(`页面警告提示: ${warningMessages}`);
    console.log(`"访问基础资料失败"出现次数: ${failureText + basicInfoFailure + basicInfoError}`);
    console.log('='.repeat(60));
    
    if (errorCount === 0 && errorMessages === 0 && failureText === 0 && basicInfoFailure === 0 && basicInfoError === 0) {
      console.log('\n✅ Dashboard基础资料功能测试通过！');
    } else {
      console.log('\n⚠️  Dashboard基础资料功能存在问题');
      if (errors.length > 0) {
        console.log('\n错误列表:');
        errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      }
    }
    
    // 等待用户查看
    console.log('\n⏸️  浏览器将保持打开10秒，请查看页面...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ 测试完成');
  }
}

testDashboardBasicInfo().catch(console.error);

