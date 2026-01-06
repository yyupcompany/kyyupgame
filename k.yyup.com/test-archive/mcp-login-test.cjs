const { spawn } = require('child_process');
const path = require('path');

// MCP浏览器登录验证测试
async function runMCPLoginTest() {
  console.log('🚀 开始MCP浏览器登录验证测试...');
  
  const testScript = `
const { chromium } = require('playwright');

async function loginTest() {
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
    await page.waitForTimeout(2000);
    
    // 检查是否有登录表单
    const loginForm = await page.locator('form').first();
    if (await loginForm.isVisible()) {
      console.log('✅ 发现登录表单');
      
      // 查找用户名输入框
      const usernameInput = await page.locator('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]').first();
      if (await usernameInput.isVisible()) {
        console.log('📝 填写用户名...');
        await usernameInput.fill('admin');
        await page.waitForTimeout(500);
      }
      
      // 查找密码输入框
      const passwordInput = await page.locator('input[type="password"], input[placeholder*="密码"]').first();
      if (await passwordInput.isVisible()) {
        console.log('🔐 填写密码...');
        await passwordInput.fill('123456');
        await page.waitForTimeout(500);
      }
      
      console.log('📸 截图：登录信息已填写');
      await page.screenshot({ 
        path: 'test-screenshots/02-login-filled.png',
        fullPage: true 
      });
      
      // 查找登录按钮
      const loginButton = await page.locator('button[type="submit"], button:has-text("登录"), button:has-text("登入")').first();
      if (await loginButton.isVisible()) {
        console.log('🔘 点击登录按钮...');
        await loginButton.click();
        
        // 等待登录响应
        await page.waitForTimeout(3000);
        
        console.log('📸 截图：登录后页面');
        await page.screenshot({ 
          path: 'test-screenshots/03-after-login.png',
          fullPage: true 
        });
        
        // 检查是否登录成功
        const currentUrl = page.url();
        console.log('🌐 当前URL:', currentUrl);
        
        if (currentUrl.includes('/dashboard') || currentUrl.includes('/main')) {
          console.log('✅ 登录成功！已跳转到主页面');
          
          // 测试AI助手功能
          console.log('🤖 测试AI助手功能...');
          const aiButton = await page.locator('button:has-text("AI"), [title*="AI"], .ai-assistant-toggle').first();
          if (await aiButton.isVisible()) {
            console.log('🔘 点击AI助手按钮...');
            await aiButton.click();
            await page.waitForTimeout(2000);
            
            console.log('📸 截图：AI助手界面');
            await page.screenshot({ 
              path: 'test-screenshots/04-ai-assistant.png',
              fullPage: true 
            });
          }
          
        } else {
          console.log('❌ 登录可能失败，未跳转到预期页面');
        }
      }
    } else {
      console.log('❌ 未找到登录表单');
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
  }
}

loginTest().catch(console.error);
  `;
  
  // 创建测试截图目录
  const fs = require('fs');
  if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots');
  }
  
  // 写入测试脚本
  fs.writeFileSync('temp-login-test.js', testScript);
  
  // 执行测试
  const testProcess = spawn('node', ['temp-login-test.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  testProcess.on('close', (code) => {
    console.log(`\n🏁 测试完成，退出码: ${code}`);
    
    // 清理临时文件
    try {
      fs.unlinkSync('temp-login-test.js');
    } catch (e) {
      // 忽略清理错误
    }
  });
}

runMCPLoginTest().catch(console.error);
