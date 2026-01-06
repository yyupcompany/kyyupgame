const { chromium } = require('playwright');
const fs = require('fs');

/**
 * 简单测试：只检查登录和访问AI助手页面
 * 如果登录失败就停止测试
 */

async function testSimpleLoginAndAIPage() {
  console.log('🔐 简单登录和AI助手页面测试');
  console.log('==========================\n');

  let browser;

  try {
    // === 启动浏览器测试 ===
    console.log('📍 步骤1: 启动浏览器');

    browser = await chromium.launch({
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1400, height: 800 }
    });

    const page = await context.newPage();

    try {
      // === 登录系统 ===
      console.log('\n📍 步骤2: 登录系统 (admin/123456)');
      await page.goto('http://localhost:5173/login-only.html', { waitUntil: 'networkidle' });

      const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"]');
      const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
      const loginButton = await page.$('.login-btn, button[type="submit"], .el-button--primary');

      if (!usernameInput || !passwordInput || !loginButton) {
        console.log('❌ 未找到登录表单元素，停止测试');
        return;
      }

      await usernameInput.fill('admin');
      await passwordInput.fill('123456');
      await loginButton.click();
      await page.waitForTimeout(3000);

      // 检查是否登录成功 - 检查URL变化或页面内容
      const currentUrl = page.url();
      if (currentUrl.includes('login-only.html')) {
        console.log('❌ 登录失败，仍在登录页面，停止测试');
        return;
      }

      console.log('✅ 登录成功');

      // === 访问AI助手页面 ===
      console.log('\n📍 步骤3: 访问AI助手页面');
      await page.goto('http://localhost:5173/ai/assistant', { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);

      // 检查页面是否正确加载
      const pageContent = await page.content();
      const hasAIAssistant = pageContent.includes('AIAssistant') || pageContent.includes('ai-assistant');
      console.log('页面是否包含AI助手组件:', hasAIAssistant ? '✅ 是' : '❌ 否');

      // === 查找输入框 ===
      console.log('\n📍 步骤4: 查找AI助手输入框');

      const inputSelectors = [
        'textarea',
        '.el-textarea__inner',
        'textarea[placeholder*="输入"]',
        'textarea[placeholder*="问题"]',
        '.claude-input-container textarea'
      ];

      let foundInput = false;
      for (const selector of inputSelectors) {
        const input = await page.$(selector);
        if (input) {
          console.log(`✅ 找到输入框: ${selector}`);
          foundInput = true;
          break;
        }
      }

      if (!foundInput) {
        console.log('❌ 未找到任何输入框');
      }

      // === 查找图片上传按钮 ===
      console.log('\n📍 步骤5: 查找图片上传按钮');

      const imageButtonSelectors = [
        'button[title*="图片"]',
        'button[title*="图像"]',
        '.icon-picture',
        'button:has-text("图片")',
        '.claude-input-container button'
      ];

      let foundImageButton = false;
      for (const selector of imageButtonSelectors) {
        const btn = await page.$(selector);
        if (btn) {
          console.log(`✅ 找到按钮: ${selector}`);
          foundImageButton = true;
          break;
        }
      }

      if (!foundImageButton) {
        console.log('❌ 未找到图片上传按钮');
      }

      // === 截图 ===
      console.log('\n📍 步骤6: 截图保存');
      await page.screenshot({
        path: 'docs/浏览器检查/simple-ai-assistant-test.png',
        fullPage: true
      });
      console.log('✅ 测试截图已保存');

      // === 测试结论 ===
      console.log('\n📍 步骤7: 测试结论');
      console.log('==================');

      if (foundInput) {
        console.log('✅ AI助手输入界面可用');
      } else {
        console.log('❌ AI助手输入界面不可用');
      }

      if (foundImageButton) {
        console.log('✅ 图片上传功能可用');
      } else {
        console.log('❌ 图片上传功能不可用');
      }

      console.log('✅ 登录功能正常');
      console.log(hasAIAssistant ? '✅ AI助手页面加载成功' : '❌ AI助手页面加载失败');

    } catch (error) {
      console.log('❌ 页面操作失败:', error.message);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🏁 浏览器已关闭');
    }
  }
}

// 运行测试
testSimpleLoginAndAIPage().catch(console.error);