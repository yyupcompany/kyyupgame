const { chromium } = require('playwright');

async function quickLoginTest() {
  console.log('🚀 开始快速登录验证测试...');
  
  const browser = await chromium.launch({ 
    headless: true  // 使用无头模式，更快
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
    await page.waitForTimeout(2000);
    
    // 检查页面基本信息
    const title = await page.title();
    console.log('📄 页面标题:', title);
    
    const url = page.url();
    console.log('🌐 当前URL:', url);
    
    // 检查页面内容
    const bodyText = await page.textContent('body').catch(() => '');
    console.log('📝 页面包含内容长度:', bodyText.length);
    
    // 检查是否有登录表单
    const hasLoginForm = await page.locator('form').count() > 0;
    console.log('🔍 是否有登录表单:', hasLoginForm);
    
    // 检查是否有输入框
    const inputCount = await page.locator('input').count();
    console.log('📝 输入框数量:', inputCount);
    
    // 检查是否有按钮
    const buttonCount = await page.locator('button').count();
    console.log('🔘 按钮数量:', buttonCount);
    
    if (hasLoginForm && inputCount >= 2) {
      console.log('✅ 发现登录表单，尝试登录...');
      
      // 填写用户名
      const usernameInput = page.locator('input[type="text"], input:not([type="password"])').first();
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
        await page.waitForTimeout(3000);
        
        const newUrl = page.url();
        console.log('🌐 登录后URL:', newUrl);
        
        if (newUrl !== url) {
          console.log('✅ URL已改变，登录可能成功');
        }
        
        // 检查页面内容变化
        const newBodyText = await page.textContent('body').catch(() => '');
        if (newBodyText.includes('欢迎') || newBodyText.includes('dashboard') || newBodyText.includes('主页')) {
          console.log('✅ 页面内容显示登录成功');
        }
        
        // 检查是否有AI助手相关元素
        const aiElements = await page.locator('button:has-text("AI"), [title*="AI"], .ai').count();
        console.log('🤖 AI相关元素数量:', aiElements);
        
        if (aiElements > 0) {
          console.log('✅ 发现AI助手相关元素');
        }
        
      } else {
        console.log('❌ 未找到登录按钮');
      }
      
    } else {
      console.log('⚠️ 未发现标准登录表单');
      
      // 检查是否已经在主页面
      if (bodyText.includes('dashboard') || bodyText.includes('主页') || bodyText.includes('欢迎')) {
        console.log('✅ 似乎已经在主页面，无需登录');
      }
    }
    
    // 最终状态检查
    console.log('\n📊 最终状态检查:');
    console.log('- 当前URL:', page.url());
    console.log('- 页面标题:', await page.title());
    
    const finalBodyText = await page.textContent('body').catch(() => '');
    const hasWelcomeContent = finalBodyText.includes('欢迎') || finalBodyText.includes('Welcome') || finalBodyText.includes('dashboard');
    console.log('- 包含欢迎内容:', hasWelcomeContent);
    
    const hasErrorContent = finalBodyText.includes('错误') || finalBodyText.includes('Error') || finalBodyText.includes('失败');
    console.log('- 包含错误内容:', hasErrorContent);
    
    if (hasWelcomeContent && !hasErrorContent) {
      console.log('\n🎉 登录验证成功！系统正常运行');
    } else if (hasErrorContent) {
      console.log('\n❌ 登录验证失败，发现错误信息');
    } else {
      console.log('\n⚠️ 登录状态不明确，需要进一步检查');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ 测试完成！');
  }
}

quickLoginTest().catch(console.error);
