/**
 * 交互式测试 - 使用Playwright Inspector
 */

import { chromium } from 'playwright';

async function interactiveTest() {
  console.log('🎭 启动交互式测试...\n');
  console.log('💡 提示: 浏览器将保持打开状态，你可以手动操作\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 监听所有事件
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`❌ [控制台错误] ${text}`);
    } else if (type === 'warning' && !text.includes('304')) {
      console.log(`⚠️  [控制台警告] ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`❌ [页面错误] ${error.message}`);
  });
  
  page.on('response', response => {
    if (!response.ok() && response.status() !== 304) {
      console.log(`❌ [请求失败] ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // 访问首页
    console.log('📍 访问首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    console.log('✅ 首页加载完成\n');
    
    console.log('💡 现在你可以：');
    console.log('   1. 在浏览器中手动操作');
    console.log('   2. 点击教师快捷登录');
    console.log('   3. 访问客户跟踪页面');
    console.log('   4. 测试SOP详情页');
    console.log('   5. 查看控制台输出的错误信息');
    console.log('\n按 Ctrl+C 关闭浏览器\n');
    
    // 保持浏览器打开
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

// 运行
interactiveTest().catch(console.error);

