const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function loginTest() {
  console.log('🚀 开始MCP浏览器登录验证测试...');
  
  // 创建截图目录
  if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots');
  }
  
  console.log('📱 启动浏览器...');
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 访问系统首页...');
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('📸 截图：首页加载');
    await page.screenshot({ 
      path: 'test-screenshots/01-homepage.png',
      fullPage: true 
    });
    
    // 等待页面加载完成
    await page.waitForTimeout(3000);
    
    // 检查页面标题
    const title = await page.title();
    console.log('📄 页面标题:', title);
    
    // 检查是否有登录表单
    const loginFormExists = await page.locator('form').count() > 0;
    console.log('🔍 是否有登录表单:', loginFormExists);
    
    if (loginFormExists) {
      console.log('✅ 发现登录表单');
      
      // 查找用户名输入框
      const usernameSelectors = [
        'input[type="text"]',
        'input[placeholder*="用户名"]',
        'input[placeholder*="账号"]',
        'input[name="username"]',
        'input[name="account"]'
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
        console.log('📝 填写用户名: admin');
        await usernameInput.fill('admin');
        await page.waitForTimeout(500);
      }
      
      // 查找密码输入框
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        console.log('🔐 填写密码: 123456');
        await passwordInput.fill('123456');
        await page.waitForTimeout(500);
      }
      
      console.log('📸 截图：登录信息已填写');
      await page.screenshot({ 
        path: 'test-screenshots/02-login-filled.png',
        fullPage: true 
      });
      
      // 查找登录按钮
      const loginButtonSelectors = [
        'button[type="submit"]',
        'button:has-text("登录")',
        'button:has-text("登入")',
        'button:has-text("Login")',
        '.login-btn',
        '.submit-btn'
      ];
      
      let loginButton = null;
      for (const selector of loginButtonSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          loginButton = element;
          console.log('🔘 找到登录按钮:', selector);
          break;
        }
      }
      
      if (loginButton) {
        console.log('🔘 点击登录按钮...');
        await loginButton.click();
        
        // 等待登录响应
        await page.waitForTimeout(5000);
        
        console.log('📸 截图：登录后页面');
        await page.screenshot({ 
          path: 'test-screenshots/03-after-login.png',
          fullPage: true 
        });
        
        // 检查是否登录成功
        const currentUrl = page.url();
        console.log('🌐 当前URL:', currentUrl);
        
        // 检查页面内容变化
        const pageContent = await page.textContent('body');
        const hasWelcome = pageContent.includes('欢迎') || pageContent.includes('Welcome') || pageContent.includes('dashboard');
        
        if (currentUrl.includes('/dashboard') || currentUrl.includes('/main') || hasWelcome) {
          console.log('✅ 登录成功！已跳转到主页面');
          
          // 测试AI助手功能
          console.log('🤖 测试AI助手功能...');
          const aiSelectors = [
            'button:has-text("AI")',
            '[title*="AI"]',
            '.ai-assistant-toggle',
            '.ai-button',
            'button:has-text("YY-AI")'
          ];
          
          let aiButton = null;
          for (const selector of aiSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
              aiButton = element;
              console.log('🤖 找到AI助手按钮:', selector);
              break;
            }
          }
          
          if (aiButton) {
            console.log('🔘 点击AI助手按钮...');
            await aiButton.click();
            await page.waitForTimeout(3000);
            
            console.log('📸 截图：AI助手界面');
            await page.screenshot({ 
              path: 'test-screenshots/04-ai-assistant.png',
              fullPage: true 
            });
            
            // 检查AI助手是否打开
            const aiAssistantVisible = await page.locator('.ai-assistant, .ai-chat, .assistant-panel').isVisible();
            console.log('🤖 AI助手是否可见:', aiAssistantVisible);
            
          } else {
            console.log('⚠️ 未找到AI助手按钮');
          }
          
        } else {
          console.log('❌ 登录可能失败，未跳转到预期页面');
          
          // 检查是否有错误信息
          const errorMessage = await page.locator('.error, .alert-danger, .el-message--error').textContent().catch(() => '');
          if (errorMessage) {
            console.log('❌ 错误信息:', errorMessage);
          }
        }
      } else {
        console.log('❌ 未找到登录按钮');
      }
    } else {
      console.log('❌ 未找到登录表单，可能已经登录或页面结构不同');
      
      // 检查是否已经在主页面
      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/main')) {
        console.log('✅ 似乎已经在主页面，无需登录');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    await page.screenshot({ 
      path: 'test-screenshots/error-screenshot.png',
      fullPage: true 
    });
  } finally {
    console.log('🔚 关闭浏览器...');
    await browser.close();
    console.log('✅ 测试完成！');
  }
}

loginTest().catch(console.error);
