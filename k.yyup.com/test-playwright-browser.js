const { chromium } = require('playwright');

async function testBrowser() {
  console.log('🚀 启动Playwright浏览器...');
  
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口
    devtools: false
  });
  
  try {
    console.log('📄 创建新页面...');
    const page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('🌐 访问 http://localhost:5173/');
    
    // 访问前端页面
    const response = await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log(`✅ 页面加载状态: ${response.status()}`);
    console.log(`📋 页面标题: ${await page.title()}`);
    
    // 等待页面加载完成
    await page.waitForTimeout(3000);
    
    // 检查页面内容
    const hasLoginForm = await page.locator('form').count() > 0;
    const hasApp = await page.locator('#app').count() > 0;
    
    console.log(`🔍 检查页面元素:`);
    console.log(`   - 有登录表单: ${hasLoginForm}`);
    console.log(`   - 有App容器: ${hasApp}`);
    
    // 截图
    await page.screenshot({ 
      path: 'frontend-screenshot.png',
      fullPage: true 
    });
    console.log('📸 已保存截图: frontend-screenshot.png');
    
    // 获取页面内容
    const pageContent = await page.content();
    console.log(`📝 页面HTML长度: ${pageContent.length} 字符`);
    
    // 检查是否有Vue应用
    const hasVueApp = pageContent.includes('Vue') || pageContent.includes('data-v-');
    console.log(`🟢 Vue应用检测: ${hasVueApp ? '是' : '否'}`);
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    console.log('🔄 关闭浏览器...');
    await browser.close();
    console.log('✅ 测试完成');
  }
}

// 运行测试
testBrowser().catch(console.error);