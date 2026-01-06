#!/usr/bin/env node

/**
 * 测试401错误处理
 * 验证：
 * 1. 只显示一次提示消息
 * 2. 自动跳转到登录页
 */

const { chromium } = require('playwright');

async function test401Handling() {
  console.log('🔍 开始测试401错误处理...\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  let messageCount = 0;
  
  // 监听所有消息提示
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('登录') || text.includes('过期') || text.includes('401')) {
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
    
    await page.waitForTimeout(2000);
    
    // 2. 模拟token过期 - 清除token
    console.log('2️⃣ 模拟token过期（清除token）...');
    await page.evaluate(() => {
      localStorage.removeItem('kindergarten_token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('kindergarten_refresh_token');
    });
    console.log('✅ Token已清除\n');
    
    // 3. 尝试访问需要认证的页面
    console.log('3️⃣ 访问需要认证的页面...');
    
    // 监听消息提示
    page.on('dialog', async dialog => {
      messageCount++;
      console.log(`[提示 ${messageCount}] ${dialog.message()}`);
      await dialog.accept();
    });
    
    // 访问活动中心
    await page.goto('http://localhost:5173/centers/activity', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    }).catch(() => {
      console.log('页面导航被中断（预期行为）');
    });
    
    await page.waitForTimeout(3000);
    
    // 4. 检查是否跳转到登录页
    console.log('\n4️⃣ 检查页面跳转...');
    const currentUrl = page.url();
    console.log(`当前URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ 成功跳转到登录页');
    } else {
      console.log('❌ 未跳转到登录页');
    }
    
    // 5. 检查提示消息数量
    console.log('\n5️⃣ 检查提示消息数量...');
    
    // 检查页面上的消息提示元素
    const messageElements = await page.locator('.el-message').count();
    console.log(`页面消息提示数量: ${messageElements}`);
    
    if (messageElements <= 1) {
      console.log('✅ 提示消息数量正常（≤1）');
    } else {
      console.log(`⚠️  提示消息过多（${messageElements}个）`);
    }
    
    // 6. 截图
    await page.screenshot({ 
      path: './test-screenshots/401-handling-test.png',
      fullPage: true 
    });
    console.log('\n✅ 截图已保存: 401-handling-test.png');
    
    // 总结
    console.log('\n' + '='.repeat(60));
    console.log('测试总结');
    console.log('='.repeat(60));
    console.log(`提示消息数量: ${messageElements}`);
    console.log(`是否跳转到登录页: ${currentUrl.includes('/login') ? '是' : '否'}`);
    console.log('='.repeat(60));
    
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

test401Handling().catch(console.error);

