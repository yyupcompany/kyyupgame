#!/usr/bin/env node

/**
 * 调试简易海报编辑器页面
 */

const { chromium } = require('playwright');

async function debugPosterSimpleEditor() {
  console.log('🔍 开始调试简易海报编辑器...\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台
  page.on('console', msg => {
    console.log(`[控制台 ${msg.type()}] ${msg.text()}`);
  });
  
  // 监听错误
  page.on('pageerror', error => {
    console.error(`[页面错误] ${error.message}`);
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
    
    // 2. 访问简易海报编辑器
    console.log('2️⃣ 访问简易海报编辑器...');
    await page.goto('http://localhost:5173/principal/poster-editor-simple', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // 3. 检查页面信息
    console.log('3️⃣ 检查页面信息...');
    const url = page.url();
    const title = await page.title();
    console.log(`   URL: ${url}`);
    console.log(`   标题: ${title}`);
    
    // 4. 检查页面元素
    console.log('\n4️⃣ 检查页面元素...');
    
    const selectors = [
      '.ai-poster-editor',
      '.editor-toolbar',
      '.editor-content',
      '.chat-panel',
      '.canvas-panel',
      '.page-container',
      '.page-header',
      '.step-card',
      'h1',
      'h2',
      '.el-button'
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`   ✅ ${selector}: ${count} 个`);
      } else {
        console.log(`   ❌ ${selector}: 未找到`);
      }
    }
    
    // 5. 获取页面HTML结构
    console.log('\n5️⃣ 页面HTML结构（前500字符）...');
    const html = await page.content();
    console.log(html.substring(0, 500));
    
    // 6. 检查是否有404
    console.log('\n6️⃣ 检查404...');
    const has404 = await page.locator('text=404, text=Not Found, text=页面不存在').count();
    if (has404 > 0) {
      console.log('   ❌ 检测到404页面');
    } else {
      console.log('   ✅ 没有404错误');
    }
    
    // 7. 截图
    console.log('\n7️⃣ 保存截图...');
    await page.screenshot({ 
      path: './test-screenshots/poster-center/debug-simple-editor.png',
      fullPage: true 
    });
    console.log('   ✅ 截图已保存: debug-simple-editor.png');
    
    // 等待用户查看
    console.log('\n⏸️  浏览器将保持打开30秒，请查看页面...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ 调试完成');
  }
}

debugPosterSimpleEditor().catch(console.error);

