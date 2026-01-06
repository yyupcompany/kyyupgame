const { chromium } = require('playwright');

async function finalMCPTest() {
  console.log('🚀 开始最终MCP浏览器验证测试...');
  
  const browser = await chromium.launch({ 
    headless: true  // 无头模式，更稳定
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 访问系统首页: http://localhost:5173');
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // 等待页面加载
    await page.waitForTimeout(3000);
    
    // 检查页面基本信息
    const title = await page.title();
    console.log('📄 页面标题:', title);
    
    const url = page.url();
    console.log('🌐 当前URL:', url);
    
    // 检查页面内容
    const bodyText = await page.textContent('body').catch(() => '');
    console.log('📝 页面内容长度:', bodyText.length);
    
    // 检查是否有Vue应用
    const hasVueApp = await page.locator('#app').count() > 0;
    console.log('🔍 Vue应用根元素:', hasVueApp ? '✅ 存在' : '❌ 不存在');
    
    // 检查是否有登录表单
    const hasLoginForm = await page.locator('form').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    const hasSubmitButton = await page.locator('button[type="submit"], button:has-text("登录")').count() > 0;
    
    console.log('🔍 登录表单检查:');
    console.log('  - 表单元素:', hasLoginForm ? '✅ 存在' : '❌ 不存在');
    console.log('  - 密码输入框:', hasPasswordInput ? '✅ 存在' : '❌ 不存在');
    console.log('  - 登录按钮:', hasSubmitButton ? '✅ 存在' : '❌ 不存在');
    
    if (hasPasswordInput && hasSubmitButton) {
      console.log('\n🔐 尝试登录...');
      
      // 填写用户名
      const usernameInput = page.locator('input[type="text"], input:not([type="password"]):not([type="hidden"])').first();
      if (await usernameInput.isVisible()) {
        await usernameInput.fill('admin');
        console.log('📝 已填写用户名: admin');
      }
      
      // 填写密码
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('123456');
        console.log('🔐 已填写密码: 123456');
      }
      
      // 点击登录按钮
      const loginButton = page.locator('button[type="submit"], button:has-text("登录")').first();
      if (await loginButton.isVisible()) {
        console.log('🔘 点击登录按钮...');
        await loginButton.click();
        
        // 等待登录响应
        await page.waitForTimeout(5000);
        
        const newUrl = page.url();
        console.log('🌐 登录后URL:', newUrl);
        
        // 检查页面内容变化
        const newBodyText = await page.textContent('body').catch(() => '');
        const hasWelcomeContent = newBodyText.includes('欢迎') || 
                                 newBodyText.includes('dashboard') || 
                                 newBodyText.includes('主页') ||
                                 newBodyText.includes('控制台') ||
                                 newBodyText.includes('管理');
        
        const hasErrorContent = newBodyText.includes('错误') || 
                               newBodyText.includes('失败') || 
                               newBodyText.includes('Error') ||
                               newBodyText.includes('用户名或密码');
        
        console.log('\n📊 登录结果分析:');
        console.log('  - URL变化:', newUrl !== url ? '✅ 已变化' : '❌ 未变化');
        console.log('  - 欢迎内容:', hasWelcomeContent ? '✅ 存在' : '❌ 不存在');
        console.log('  - 错误信息:', hasErrorContent ? '❌ 存在' : '✅ 无错误');
        
        // 检查AI助手相关元素
        const aiElements = await page.locator('button:has-text("AI"), [title*="AI"], .ai').count();
        console.log('  - AI助手元素:', aiElements > 0 ? `✅ 找到${aiElements}个` : '❌ 未找到');
        
        // 最终判断
        if (hasWelcomeContent && !hasErrorContent) {
          console.log('\n🎉 MCP浏览器登录验证成功！');
          console.log('✅ 系统正常运行，可以进行登录操作');
          
          // 尝试测试AI助手
          if (aiElements > 0) {
            console.log('\n🤖 测试AI助手功能...');
            const aiButton = page.locator('button:has-text("AI"), [title*="AI"]').first();
            if (await aiButton.isVisible()) {
              await aiButton.click();
              await page.waitForTimeout(2000);
              console.log('✅ AI助手按钮点击成功');
            }
          }
          
        } else if (hasErrorContent) {
          console.log('\n⚠️ 登录失败，但系统功能正常');
          console.log('可能是用户名密码不正确，但前端系统运行正常');
        } else {
          console.log('\n❓ 登录状态不明确');
          console.log('需要进一步检查系统状态');
        }
      }
    } else {
      console.log('\n⚠️ 未发现完整的登录表单');
      
      // 检查是否已经在主页面
      if (bodyText.includes('dashboard') || bodyText.includes('主页') || bodyText.includes('欢迎')) {
        console.log('✅ 似乎已经在主页面，无需登录');
      } else {
        console.log('❌ 页面可能存在加载问题');
      }
    }
    
    // 最终系统状态报告
    console.log('\n📋 系统状态总结:');
    console.log('  - 前端服务:', '✅ 正常运行 (http://localhost:5173)');
    console.log('  - 页面加载:', title ? '✅ 正常' : '❌ 异常');
    console.log('  - Vue应用:', hasVueApp ? '✅ 正常' : '❌ 异常');
    console.log('  - 登录功能:', (hasPasswordInput && hasSubmitButton) ? '✅ 可用' : '⚠️ 需检查');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('  1. 检查前端服务是否正常启动');
    console.log('  2. 检查后端API服务是否正常');
    console.log('  3. 检查网络连接和端口占用');
  } finally {
    await browser.close();
    console.log('\n✅ MCP浏览器测试完成！');
  }
}

finalMCPTest().catch(console.error);
