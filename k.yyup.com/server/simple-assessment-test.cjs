const { chromium } = require('playwright');

async function testParentLogin() {
  console.log('🚀 开始家长登录测试');
  
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    console.log('📍 访问登录页面...');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    
    console.log('📸 截图: login-page.png');
    await page.screenshot({ path: 'login-page.png' });
    
    console.log('📍 填写登录信息...');
    await page.waitForTimeout(2000);
    
    // 尝试填写用户名
    try {
      await page.fill('input[type="text"]', 'testparent');
      await page.fill('input[type="password"]', '123456');
      console.log('✅ 登录信息填写成功');
      
      // 尝试点击登录按钮
      await page.click('button');
      await page.waitForTimeout(5000);
      
      console.log('📸 截图: after-login.png');
      await page.screenshot({ path: 'after-login.png' });
      
      const currentUrl = page.url();
      console.log('当前URL:', currentUrl);
      
    } catch (error) {
      console.log('❌ 登录过程出错:', error.message);
    }
    
    await browser.close();
    console.log('🎉 测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testParentLogin();
