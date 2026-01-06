const { chromium } = require('playwright');

async function testFrontendFunctionality() {
  console.log('🧪 开始前端功能详细测试...');
  
  let browser;
  try {
    // 启动浏览器
    browser = await chromium.launch({
      headless: false, // 显示浏览器
      slowMo: 100 // 慢速执行，便于观察
    });
    
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('🌐 访问登录页面...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 等待页面完全加载
    await page.waitForTimeout(2000);
    
    console.log('🔍 检查登录表单元素...');
    
    // 检查用户名输入框
    const usernameInput = page.locator('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]').first();
    const hasUsername = await usernameInput.count() > 0;
    console.log(`   - 用户名输入框: ${hasUsername ? '✅' : '❌'}`);
    
    // 检查密码输入框
    const passwordInput = page.locator('input[type="password"]').first();
    const hasPassword = await passwordInput.count() > 0;
    console.log(`   - 密码输入框: ${hasPassword ? '✅' : '❌'}`);
    
    // 检查登录按钮
    const loginButton = page.locator('button[type="submit"], button:has-text("登录"), .el-button--primary').first();
    const hasLoginButton = await loginButton.count() > 0;
    console.log(`   - 登录按钮: ${hasLoginButton ? '✅' : '❌'}`);
    
    if (hasUsername && hasPassword && hasLoginButton) {
      console.log('🎯 尝试登录操作...');
      
      // 输入测试账号
      await usernameInput.fill('admin');
      await passwordInput.fill('admin123');
      
      console.log('📝 输入账号: admin / admin123');
      
      // 点击登录按钮
      await Promise.all([
        page.waitForNavigation({ timeout: 10000 }),
        loginButton.click()
      ]);
      
      console.log('🔄 等待页面跳转...');
      await page.waitForTimeout(3000);
      
      // 检查是否登录成功
      const currentUrl = page.url();
      console.log(`📍 当前页面: ${currentUrl}`);
      
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/index') || !currentUrl.includes('/login')) {
        console.log('✅ 登录成功！');
        
        // 检查登录后的页面元素
        const hasSidebar = await page.locator('.sidebar, .el-menu, [class*="sidebar"]').count() > 0;
        const hasHeader = await page.locator('.header, .navbar, [class*="header"]').count() > 0;
        const hasMainContent = await page.locator('.main, .content, [class*="main"]').count() > 0;
        
        console.log('🎉 登录后页面检查:');
        console.log(`   - 侧边栏: ${hasSidebar ? '✅' : '❌'}`);
        console.log(`   - 顶部导航: ${hasHeader ? '✅' : '❌'}`);
        console.log(`   - 主内容区: ${hasMainContent ? '✅' : '❌'}`);
        
        // 再次截图
        await page.screenshot({ 
          path: 'dashboard-screenshot.png',
          fullPage: true 
        });
        console.log('📸 已保存控制台截图: dashboard-screenshot.png');
        
      } else {
        console.log('❌ 登录失败或未跳转');
        
        // 检查是否有错误信息
        const errorMessages = await page.locator('.el-message--error, .error-message, [class*="error"]').all();
        if (errorMessages.length > 0) {
          console.log('⚠️ 发现错误信息:');
          for (let i = 0; i < Math.min(errorMessages.length, 3); i++) {
            const text = await errorMessages[i].textContent();
            console.log(`   - ${text}`);
          }
        }
      }
    } else {
      console.log('❌ 登录表单元素不完整，跳过登录测试');
    }
    
    // 性能测试
    console.log('📊 页面性能指标...');
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });
    
    console.log(`   - 页面加载时间: ${performanceMetrics.loadTime}ms`);
    console.log(`   - DOM内容加载: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   - 首次绘制: ${performanceMetrics.firstPaint}ms`);
    console.log(`   - 首次内容绘制: ${performanceMetrics.firstContentfulPaint}ms`);
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔄 浏览器已关闭');
    }
    console.log('✅ 前端功能测试完成');
  }
}

// 运行测试
testFrontendFunctionality().catch(console.error);