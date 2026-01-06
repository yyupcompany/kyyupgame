const { chromium } = require('playwright');

async function testLoginSmart() {
  console.log('🧠 智能登录测试开始...');
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      slowMo: 50
    });
    
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('🌐 访问登录页面...');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(2000);
    
    // 等待Vue应用挂载
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    console.log('🔍 查找登录表单...');
    
    // 尝试多种选择器策略
    const usernameSelectors = [
      'input[name="username"]',
      'input[type="text"]',
      'input[placeholder*="用户"]',
      'input[placeholder*="账号"]',
      'input[placeholder*="用户名"]',
      '.username-input',
      '#username',
      '.el-input__inner[type="text"]'
    ];
    
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="密码"]',
      '.password-input',
      '#password',
      '.el-input__inner[type="password"]'
    ];
    
    const buttonSelectors = [
      'button[type="submit"]',
      'button:has-text("登录")',
      '.login-button',
      '.el-button--primary',
      '#login-button',
      'button:has-text("立即登录")'
    ];
    
    let usernameInput = null;
    let passwordInput = null;
    let loginButton = null;
    
    // 查找用户名输入框
    for (const selector of usernameSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element && await element.isVisible()) {
          usernameInput = element;
          console.log(`✅ 找到用户名输入框: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }
    
    // 查找密码输入框
    for (const selector of passwordSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element && await element.isVisible()) {
          passwordInput = element;
          console.log(`✅ 找到密码输入框: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }
    
    // 查找登录按钮
    for (const selector of buttonSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element && await element.isVisible()) {
          loginButton = element;
          console.log(`✅ 找到登录按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }
    
    if (!usernameInput || !passwordInput || !loginButton) {
      console.log('❌ 未找到完整的登录表单元素');
      console.log(`   用户名输入框: ${usernameInput ? '✅' : '❌'}`);
      console.log(`   密码输入框: ${passwordInput ? '✅' : '❌'}`);
      console.log(`   登录按钮: ${loginButton ? '✅' : '❌'}`);
      
      // 截图用于调试
      await page.screenshot({ path: 'login-form-debug.png' });
      console.log('📸 已保存调试截图: login-form-debug.png');
      
      // 输出页面结构
      const pageContent = await page.content();
      console.log(`📄 页面标题: ${await page.title()}`);
      console.log(`📝 页面HTML长度: ${pageContent.length}`);
      
      return;
    }
    
    console.log('🎯 开始填写登录信息...');
    
    // 确保元素可交互
    await usernameInput.waitForElementState('visible');
    await usernameInput.waitForElementState('enabled');
    
    // 填写用户名
    await usernameInput.clear();
    await usernameInput.fill('admin');
    console.log('📝 已填写用户名: admin');
    
    // 等待一下让表单响应
    await page.waitForTimeout(500);
    
    // 填写密码
    await passwordInput.waitForElementState('visible');
    await passwordInput.waitForElementState('enabled');
    await passwordInput.clear();
    await passwordInput.fill('admin123');
    console.log('📝 已填写密码: admin123');
    
    await page.waitForTimeout(500);
    
    // 点击登录按钮
    await loginButton.waitForElementState('visible');
    await loginButton.waitForElementState('enabled');
    
    console.log('🚀 点击登录按钮...');
    
    try {
      await Promise.all([
        page.waitForNavigation({ timeout: 15000 }),
        loginButton.click()
      ]);
      
      console.log('✅ 页面已跳转');
      
      const currentUrl = page.url();
      console.log(`📍 当前URL: ${currentUrl}`);
      
      if (currentUrl !== 'http://localhost:5173/') {
        console.log('🎉 登录成功，页面已跳转！');
        
        // 等待新页面加载
        await page.waitForTimeout(3000);
        
        // 检查登录成功的标志
        const dashboardSelectors = [
          '.dashboard',
          '.main-content',
          '.el-main',
          'nav',
          '.sidebar'
        ];
        
        let hasDashboard = false;
        for (const selector of dashboardSelectors) {
          if (await page.locator(selector).count() > 0) {
            hasDashboard = true;
            break;
          }
        }
        
        if (hasDashboard) {
          console.log('🏠 已进入主控制台');
          
          // 截图保存
          await page.screenshot({ 
            path: 'dashboard-success.png',
            fullPage: true 
          });
          console.log('📸 已保存控制台截图: dashboard-success.png');
        }
        
      } else {
        console.log('⚠️ 页面未跳转，可能登录失败');
        
        // 查找错误信息
        const errorSelectors = [
          '.el-message--error',
          '.error-message',
          '.alert-error',
          '[class*="error"]'
        ];
        
        for (const selector of errorSelectors) {
          const errors = await page.locator(selector).all();
          if (errors.length > 0) {
            console.log('❌ 发现错误信息:');
            for (let i = 0; i < Math.min(errors.length, 3); i++) {
              const text = await errors[i].textContent();
              if (text && text.trim()) {
                console.log(`   - ${text.trim()}`);
              }
            }
            break;
          }
        }
      }
      
    } catch (navError) {
      console.log('⚠️ 页面跳转超时或失败，可能是单页应用的路由变化');
      
      // 即使没有传统的导航，也可能登录成功
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      console.log(`📍 当前URL: ${currentUrl}`);
      
      // 检查是否有登录成功的迹象
      const successIndicators = [
        'page.locator(".dashboard")',
        'page.locator(".el-menu")',
        'page.locator(".sidebar")'
      ];
      
      for (const indicator of successIndicators) {
        try {
          if (await eval(indicator).count() > 0) {
            console.log('✅ 检测到登录成功迹象');
            await page.screenshot({ path: 'login-success-spa.png' });
            break;
          }
        } catch (e) {
          // 继续检查
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('   错误堆栈:', error.stack);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔄 浏览器已关闭');
    }
    console.log('✅ 智能登录测试完成');
  }
}

// 运行测试
testLoginSmart().catch(console.error);