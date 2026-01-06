const { chromium } = require('playwright');

async function testSimpleLogin() {
  console.log('🔥 简化登录测试开始...');
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      slowMo: 100
    });
    
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('🌐 访问登录页面...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(3000);
    
    console.log('📸 拍摄初始页面截图...');
    await page.screenshot({ path: 'login-initial.png', fullPage: true });
    
    console.log('🔍 直接使用选择器进行登录...');
    
    // 使用CSS选择器直接操作
    try {
      // 填写用户名
      await page.fill('input[type="text"]', 'admin', { timeout: 5000 });
      console.log('✅ 已填写用户名: admin');
      
      await page.waitForTimeout(500);
      
      // 填写密码
      await page.fill('input[type="password"]', 'admin123', { timeout: 5000 });
      console.log('✅ 已填写密码: admin123');
      
      await page.waitForTimeout(500);
      
      // 点击登录按钮
      await page.click('button[type="submit"]', { timeout: 5000 });
      console.log('✅ 已点击登录按钮');
      
      // 等待响应
      await page.waitForTimeout(5000);
      
      // 检查页面状态
      const currentUrl = page.url();
      console.log(`📍 当前URL: ${currentUrl}`);
      
      // 拍摄结果截图
      await page.screenshot({ path: 'login-result.png', fullPage: true });
      
      // 检查是否有登录成功的迹象
      const pageContent = await page.content();
      const hasDashboard = pageContent.includes('dashboard') || 
                          pageContent.includes('控制台') || 
                          pageContent.includes('首页') ||
                          !currentUrl.includes('/login');
      
      if (hasDashboard) {
        console.log('🎉 登录成功！');
        console.log('📸 已保存登录成功截图: login-result.png');
      } else {
        console.log('⚠️ 可能登录失败，检查页面是否有错误信息...');
        
        // 查找可能的错误信息
        const possibleErrors = await page.evaluate(() => {
          const errorElements = document.querySelectorAll(
            '.el-message--error, .error-message, .alert-danger, [class*="error"], .message--error'
          );
          
          return Array.from(errorElements)
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 0);
        });
        
        if (possibleErrors.length > 0) {
          console.log('❌ 发现错误信息:');
          possibleErrors.forEach(error => console.log(`   - ${error}`));
        } else {
          console.log('ℹ️ 未发现明显错误信息，可能是单页应用的路由变化');
        }
      }
      
      // 检查页面标题变化
      const title = await page.title();
      console.log(`📄 页面标题: ${title}`);
      
    } catch (fillError) {
      console.log('❌ 表单填写失败:', fillError.message);
      
      // 尝试检查页面状态
      const hasLoginForm = await page.locator('form').count() > 0;
      const hasInputs = await page.locator('input').count() > 0;
      const hasButtons = await page.locator('button').count() > 0;
      
      console.log('📊 页面元素统计:');
      console.log(`   - 表单数量: ${hasLoginForm}`);
      console.log(`   - 输入框数量: ${hasInputs}`);
      console.log(`   - 按钮数量: ${hasButtons}`);
      
      // 输出页面的主要内容结构
      const bodyText = await page.evaluate(() => {
        return document.body.innerText.slice(0, 200);
      });
      console.log(`📝 页面主要内容: ${bodyText}...`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔄 浏览器已关闭');
    }
    console.log('✅ 简化登录测试完成');
  }
}

// 运行测试
testSimpleLogin().catch(console.error);