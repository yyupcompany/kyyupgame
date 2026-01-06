const { chromium } = require('playwright');

async function enhancedMCPTest() {
  console.log('🚀 开始增强版MCP浏览器系统验证...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 测试结果收集
  const testResults = {
    frontend: false,
    login: false,
    navigation: false,
    ai: false,
    api: false
  };
  
  const apiRequests = [];
  const apiResponses = [];
  
  // 监听API请求
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiRequests.push({
        url: request.url(),
        method: request.method()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      apiResponses.push({
        url: response.url(),
        status: response.status()
      });
    }
  });
  
  try {
    console.log('\n=== 阶段1：前端服务验证 ===');
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    const url = page.url();
    
    console.log('📄 页面标题:', title);
    console.log('🌐 当前URL:', url);
    
    if (title && url) {
      testResults.frontend = true;
      console.log('✅ 前端服务验证通过');
    }
    
    console.log('\n=== 阶段2：登录功能验证 ===');
    
    const hasLoginForm = await page.locator('form').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    
    if (hasLoginForm && hasPasswordInput) {
      console.log('🔍 发现登录表单，开始测试...');
      
      // 测试账号列表
      const accounts = [
        { username: 'admin', password: 'admin123' },
        { username: 'admin', password: '123456' },
        { username: 'test', password: 'test123' }
      ];
      
      for (const account of accounts) {
        console.log(`🔐 测试账号: ${account.username} / ${account.password}`);
        
        // 清空并填写表单
        const usernameInput = page.locator('input[type="text"], input:not([type="password"])').first();
        const passwordInput = page.locator('input[type="password"]').first();
        
        await usernameInput.fill('');
        await passwordInput.fill('');
        await usernameInput.fill(account.username);
        await passwordInput.fill(account.password);
        
        await page.waitForTimeout(1000);
        
        // 提交登录
        const loginButton = page.locator('button[type="submit"], button:has-text("登录")').first();
        await loginButton.click();
        
        await page.waitForTimeout(5000);
        
        const newUrl = page.url();
        const bodyText = await page.textContent('body').catch(() => '');
        
        // 检查登录结果
        const urlChanged = newUrl !== url && !newUrl.includes('/login');
        const hasWelcome = bodyText.includes('欢迎') || bodyText.includes('dashboard') || bodyText.includes('主页');
        
        if (urlChanged || hasWelcome) {
          console.log('✅ 登录成功！');
          testResults.login = true;
          break;
        } else {
          console.log('❌ 登录失败，尝试下一个账号');
        }
      }
    }
    
    if (testResults.login) {
      console.log('\n=== 阶段3：导航系统验证 ===');
      
      await page.waitForTimeout(3000);
      
      // 检查导航元素
      const navSelectors = [
        'nav a',
        '.menu-item',
        '.nav-item', 
        '.sidebar a',
        'a[href]'
      ];
      
      let totalNavLinks = 0;
      for (const selector of navSelectors) {
        const count = await page.locator(selector).count();
        totalNavLinks += count;
      }
      
      console.log(`🔍 找到${totalNavLinks}个导航元素`);
      
      if (totalNavLinks > 0) {
        testResults.navigation = true;
        console.log('✅ 导航系统验证通过');
        
        // 测试几个导航链接
        const links = await page.locator('a[href]:visible').all();
        const testLinks = links.slice(0, 3);
        
        for (const link of testLinks) {
          try {
            const text = await link.textContent();
            const href = await link.getAttribute('href');
            
            if (text && text.trim() && href && !href.includes('javascript:')) {
              console.log(`🔗 测试导航: ${text.trim()}`);
              await link.click();
              await page.waitForTimeout(2000);
              console.log(`  ➜ 当前页面: ${page.url()}`);
            }
          } catch (e) {
            // 忽略导航错误，继续测试
          }
        }
      }
      
      console.log('\n=== 阶段4：AI助手功能验证 ===');
      
      // 查找AI助手相关元素
      const aiSelectors = [
        'button:has-text("AI")',
        'button:has-text("YY-AI")', 
        'button:has-text("智能助手")',
        '[title*="AI"]',
        '.ai-assistant',
        '.ai-button',
        '.assistant-toggle'
      ];
      
      let aiFound = false;
      for (const selector of aiSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`🤖 找到AI助手元素: ${selector} (${count}个)`);
          aiFound = true;
          
          // 尝试点击AI助手
          try {
            const aiButton = page.locator(selector).first();
            if (await aiButton.isVisible()) {
              console.log('🔘 点击AI助手按钮...');
              await aiButton.click();
              await page.waitForTimeout(3000);
              
              // 检查AI界面是否打开
              const aiInterface = await page.locator('.ai-assistant, .ai-chat, .assistant-panel, .ai-container').count();
              if (aiInterface > 0) {
                console.log('✅ AI助手界面已打开');
                testResults.ai = true;
              }
            }
          } catch (e) {
            console.log('⚠️ AI助手点击失败:', e.message);
          }
          break;
        }
      }
      
      if (!aiFound) {
        console.log('⚠️ 未找到AI助手相关元素');
      }
    }
    
    console.log('\n=== 阶段5：API通信验证 ===');
    
    console.log(`📊 API请求数量: ${apiRequests.length}`);
    console.log(`📊 API响应数量: ${apiResponses.length}`);
    
    if (apiResponses.length > 0) {
      const successResponses = apiResponses.filter(r => r.status >= 200 && r.status < 400);
      const errorResponses = apiResponses.filter(r => r.status >= 400);
      
      console.log(`✅ 成功响应: ${successResponses.length}`);
      console.log(`❌ 错误响应: ${errorResponses.length}`);
      
      if (successResponses.length > 0) {
        testResults.api = true;
        console.log('✅ API通信验证通过');
      }
      
      // 显示前几个API请求
      if (apiRequests.length > 0) {
        console.log('\n🌐 主要API请求:');
        apiRequests.slice(0, 5).forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.method} ${req.url.split('/').pop()}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
  
  // 生成测试报告
  console.log('\n=== 测试结果报告 ===');
  
  const results = [
    { name: '前端服务', status: testResults.frontend, icon: testResults.frontend ? '✅' : '❌' },
    { name: '登录功能', status: testResults.login, icon: testResults.login ? '✅' : '❌' },
    { name: '导航系统', status: testResults.navigation, icon: testResults.navigation ? '✅' : '❌' },
    { name: 'AI助手', status: testResults.ai, icon: testResults.ai ? '✅' : '⚠️' },
    { name: 'API通信', status: testResults.api, icon: testResults.api ? '✅' : '❌' }
  ];
  
  console.log('📋 功能验证结果:');
  results.forEach(result => {
    console.log(`  ${result.icon} ${result.name}: ${result.status ? '正常' : '需要检查'}`);
  });
  
  const passedTests = results.filter(r => r.status).length;
  const totalTests = results.length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\n🎯 测试通过率: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (successRate >= 80) {
    console.log('🎉 系统状态优秀！MCP浏览器验证成功');
  } else if (successRate >= 60) {
    console.log('👍 系统基本正常，部分功能需要完善');
  } else {
    console.log('⚠️ 系统需要进一步调试');
  }
  
  // 关闭浏览器
  console.log('\n⏳ 5秒后关闭浏览器...');
  await page.waitForTimeout(5000);
  await browser.close();
  
  console.log('✅ 增强版MCP浏览器验证完成！');
  
  return {
    success: successRate >= 60,
    results: testResults,
    successRate
  };
}

enhancedMCPTest().then(result => {
  console.log('\n📊 最终结果:', result.success ? '验证成功' : '需要改进');
}).catch(console.error);
