/**
 * AI助手功能测试脚本 - 使用快速体验
 * 测试上传文档和图片分析功能
 */

const { chromium } = require('playwright');

async function testAIAssistant() {
  console.log('🚀 启动浏览器测试...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 收集控制台消息
  const consoleMessages = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });

  try {
    // 1. 访问首页
    console.log('📱 访问首页...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 2. 点击"快速体验"按钮
    console.log('👆 点击"快速体验"按钮...');
    const quickExperienceBtn = await page.$('button:has-text("快速体验")');
    if (quickExperienceBtn) {
      await quickExperienceBtn.click();
      await page.waitForTimeout(2000);
    }

    // 3. 选择"园长"角色（园长应该能看到AI助手）
    console.log('👆 选择"园长"角色...');
    const principalBtn = await page.$('button:has-text("园长")');
    if (principalBtn) {
      await principalBtn.click();
      await page.waitForTimeout(5000);
    }

    console.log(`📍 当前URL: ${page.url()}`);

    // 4. 检查是否登录成功
    const isLoggedIn = !(page.url().includes('/login'));
    console.log(`✅ 登录状态: ${isLoggedIn ? '已登录' : '未登录'}`);

    if (isLoggedIn) {
      // 5. 访问AI助手页面
      console.log('\n📱 访问AI助手页面 /ai ...');
      await page.goto('http://localhost:5173/ai', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      console.log(`📍 当前URL: ${page.url()}`);

      // 检查页面主要元素
      console.log('\n🔍 检查AI助手页面元素...');

      // 查找聊天输入框
      const chatInput = await page.$('textarea, [class*="chat"], [class*="Chat"], [class*="input"], [class*="Input"]');
      if (chatInput) {
        console.log('✅ 找到聊天相关元素');
      }

      // 查找上传按钮
      const uploadBtn = await page.$('input[type="file"], [class*="upload"], [class*="Upload"], [class*="attach"], [class*="file"]');
      if (uploadBtn) {
        console.log('✅ 找到上传按钮');
      }

      // 查找所有按钮
      const buttons = await page.$$('button');
      console.log(`📋 页面按钮数量: ${buttons.length}`);
      for (let i = 0; i < Math.min(buttons.length, 25); i++) {
        const btnText = await buttons[i].textContent();
        console.log(`   按钮${i + 1}: ${btnText?.substring(0, 60) || '[无文本]'}`);
      }

      // 查找输入框
      const inputs = await page.$$('input, textarea');
      console.log(`   输入框数量: ${inputs.length}`);

      // 检查页面内容
      console.log('\n📄 页面内容预览:');
      const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 1200) || '无内容');
      console.log(bodyText);
    } else {
      console.log('\n⚠️ 快速体验登录失败，尝试其他方式...');
    }

    // 6. 检查是否有错误
    console.log('\n❌ 检查控制台错误...');
    if (consoleErrors.length > 0) {
      console.log(`发现 ${consoleErrors.length} 个错误:`);
      consoleErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.substring(0, 200)}`);
      });
    } else {
      console.log('✅ 无控制台错误');
    }

    // 7. 打印关键控制台消息
    const aiConsoleMsgs = consoleMessages.filter(m =>
      m.text.includes('ai') ||
      m.text.includes('AI') ||
      m.text.includes('upload') ||
      m.text.includes('image') ||
      m.text.includes('chat') ||
      m.text.includes('document')
    );
    if (aiConsoleMsgs.length > 0) {
      console.log('\n💬 AI相关控制台消息:');
      aiConsoleMsgs.forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.type}] ${msg.text.substring(0, 150)}`);
      });
    }

    // 8. 测试截图
    console.log('\n📸 截图保存...');
    await page.screenshot({ path: '/tmp/ai-assistant-test.png', fullPage: true });
    console.log('截图已保存到 /tmp/ai-assistant-test.png');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
    console.log('\n👋 浏览器已关闭');
  }
}

testAIAssistant().catch(console.error);
