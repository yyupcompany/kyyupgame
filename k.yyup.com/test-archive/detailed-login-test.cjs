const { chromium } = require('playwright');

async function detailedLoginTest() {
  console.log('🚀 开始详细登录验证测试...');
  
  const browser = await chromium.launch({ 
    headless: false,  // 显示浏览器，便于观察
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台消息
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 控制台错误:', msg.text());
    }
  });
  
  try {
    console.log('🌐 访问系统首页: http://localhost:5173');
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ 等待Vue应用加载...');
    // 等待Vue应用完全加载
    await page.waitForTimeout(5000);
    
    // 检查页面基本信息
    const title = await page.title();
    console.log('📄 页面标题:', title);
    
    const url = page.url();
    console.log('🌐 当前URL:', url);
    
    // 等待主要内容加载
    try {
      await page.waitForSelector('body', { timeout: 10000 });
      console.log('✅ 页面body已加载');
    } catch (e) {
      console.log('⚠️ 等待body超时');
    }
    
    // 检查是否有Vue应用根元素
    const hasVueApp = await page.locator('#app').count() > 0;
    console.log('🔍 是否有Vue应用根元素:', hasVueApp);
    
    // 检查页面内容
    const bodyText = await page.textContent('body').catch(() => '');
    console.log('📝 页面内容长度:', bodyText.length);
    console.log('📝 页面内容预览:', bodyText.substring(0, 200) + '...');
    
    // 等待可能的路由加载
    await page.waitForTimeout(3000);
    
    // 检查是否有登录相关元素
    const loginSelectors = [
      'form',
      '.login-form',
      '.login-container',
      'input[type="password"]',
      'button:has-text("登录")',
      '.el-form'
    ];
    
    console.log('🔍 检查登录相关元素:');
    for (const selector of loginSelectors) {
      const count = await page.locator(selector).count();
      console.log(`  - ${selector}: ${count}个`);
    }
    
    // 检查所有输入框
    const allInputs = await page.locator('input').count();
    console.log('📝 总输入框数量:', allInputs);
    
    if (allInputs > 0) {
      console.log('📝 输入框详情:');
      const inputs = await page.locator('input').all();
      for (let i = 0; i < Math.min(inputs.length, 5); i++) {
        const input = inputs[i];
        const type = await input.getAttribute('type') || 'text';
        const placeholder = await input.getAttribute('placeholder') || '';
        const name = await input.getAttribute('name') || '';
        console.log(`  - 输入框${i+1}: type=${type}, placeholder="${placeholder}", name="${name}"`);
      }
    }
    
    // 检查所有按钮
    const allButtons = await page.locator('button').count();
    console.log('🔘 总按钮数量:', allButtons);
    
    if (allButtons > 0) {
      console.log('🔘 按钮详情:');
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const button = buttons[i];
        const text = await button.textContent() || '';
        const type = await button.getAttribute('type') || '';
        console.log(`  - 按钮${i+1}: text="${text.trim()}", type="${type}"`);
      }
    }
    
    // 尝试查找登录表单
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    const hasSubmitButton = await page.locator('button[type="submit"], button:has-text("登录")').count() > 0;
    
    if (hasPasswordInput && hasSubmitButton) {
      console.log('✅ 发现登录表单，尝试登录...');
      
      // 查找用户名输入框
      const usernameSelectors = [
        'input[type="text"]:first-of-type',
        'input[name="username"]',
        'input[placeholder*="用户名"]',
        'input[placeholder*="账号"]',
        'input:not([type="password"]):not([type="hidden"]):not([type="submit"])'
      ];
      
      let usernameInput = null;
      for (const selector of usernameSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          usernameInput = element;
          console.log('📝 找到用户名输入框:', selector);
          break;
        }
      }
      
      if (usernameInput) {
        await usernameInput.fill('admin');
        console.log('📝 已填写用户名: admin');
        await page.waitForTimeout(1000);
      }
      
      // 填写密码
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('123456');
        console.log('🔐 已填写密码: 123456');
        await page.waitForTimeout(1000);
      }
      
      // 点击登录按钮
      const loginButton = page.locator('button[type="submit"], button:has-text("登录")').first();
      if (await loginButton.isVisible()) {
        console.log('🔘 点击登录按钮...');
        
        // 监听网络请求
        page.on('response', response => {
          if (response.url().includes('/api/auth/login')) {
            console.log('🌐 登录API响应:', response.status());
          }
        });
        
        await loginButton.click();
        
        // 等待登录响应
        console.log('⏳ 等待登录响应...');
        await page.waitForTimeout(5000);
        
        const newUrl = page.url();
        console.log('🌐 登录后URL:', newUrl);
        
        // 检查URL变化
        if (newUrl !== url) {
          console.log('✅ URL已改变，登录可能成功');
        }
        
        // 检查页面内容变化
        const newBodyText = await page.textContent('body').catch(() => '');
        console.log('📝 登录后页面内容长度:', newBodyText.length);
        
        const hasWelcomeContent = newBodyText.includes('欢迎') || 
                                 newBodyText.includes('dashboard') || 
                                 newBodyText.includes('主页') ||
                                 newBodyText.includes('控制台');
        console.log('✅ 包含欢迎内容:', hasWelcomeContent);
        
        // 检查是否有错误信息
        const hasErrorContent = newBodyText.includes('错误') || 
                               newBodyText.includes('失败') || 
                               newBodyText.includes('Error');
        console.log('❌ 包含错误内容:', hasErrorContent);
        
        // 检查AI助手相关元素
        const aiSelectors = [
          'button:has-text("AI")',
          'button:has-text("YY-AI")',
          '[title*="AI"]',
          '.ai-assistant',
          '.ai-button'
        ];
        
        console.log('🤖 检查AI助手相关元素:');
        for (const selector of aiSelectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`  ✅ 找到AI元素: ${selector} (${count}个)`);
          }
        }
        
        // 最终判断
        if (hasWelcomeContent && !hasErrorContent) {
          console.log('\n🎉 登录验证成功！系统正常运行');
        } else if (hasErrorContent) {
          console.log('\n❌ 登录验证失败，发现错误信息');
        } else {
          console.log('\n⚠️ 登录状态不明确，需要进一步检查');
        }
        
      } else {
        console.log('❌ 未找到登录按钮');
      }
      
    } else {
      console.log('⚠️ 未发现完整的登录表单');
      console.log('  - 密码输入框:', hasPasswordInput);
      console.log('  - 提交按钮:', hasSubmitButton);
      
      // 检查是否已经在主页面
      if (bodyText.includes('dashboard') || bodyText.includes('主页') || bodyText.includes('欢迎')) {
        console.log('✅ 似乎已经在主页面，无需登录');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 5秒后关闭浏览器...');
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('✅ 测试完成！');
  }
}

detailedLoginTest().catch(console.error);
