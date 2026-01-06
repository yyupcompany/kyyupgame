#!/usr/bin/env node

/**
 * 测试AI助手输入框状态问题
 */

const { chromium } = require('playwright');

async function testInputState() {
  console.log('🔍 测试AI助手输入框状态问题');
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // 登录
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const adminButton = await page.$('.quick-btn.admin-btn');
    if (adminButton) {
      await adminButton.click();
      await page.waitForTimeout(5000);
    }

    // 打开AI助手
    const aiButton = await page.$('text=AI');
    if (aiButton) {
      await aiButton.click();
      await page.waitForTimeout(3000);
    }

    // 第一次测试前检查输入框状态
    console.log('\n📝 第一次测试前检查输入框状态:');
    const inputBox = await page.$('textarea');
    if (inputBox) {
      const isEnabled = await inputBox.isEnabled();
      const isVisible = await inputBox.isVisible();
      const placeholder = await inputBox.getAttribute('placeholder');
      console.log(`  可见: ${isVisible}, 可用: ${isEnabled}, placeholder: ${placeholder}`);
    }

    // 第一次测试
    console.log('\n📝 第一次测试: 输入"你好"');
    await inputBox.fill('你好');
    await page.waitForTimeout(1000);

    // 点击发送
    const sendButton = await page.$('.send-btn');
    if (sendButton) {
      await sendButton.click();
    } else {
      await inputBox.press('Enter');
    }

    // 等待AI响应
    console.log('⏳ 等待AI响应...');
    await page.waitForTimeout(8000);

    // 第二次测试前检查输入框状态
    console.log('\n📝 第二次测试前检查输入框状态:');
    const inputBox2 = await page.$('textarea');
    if (inputBox2) {
      const isEnabled2 = await inputBox2.isEnabled();
      const isVisible2 = await inputBox2.isVisible();
      const placeholder2 = await inputBox2.getAttribute('placeholder');
      const value = await inputBox2.inputValue();
      const disabled = await inputBox2.getAttribute('disabled');
      const readonly = await inputBox2.getAttribute('readonly');

      console.log(`  可见: ${isVisible2}`);
      console.log(`  可用: ${isEnabled2}`);
      console.log(`  placeholder: ${placeholder2}`);
      console.log(`  当前值: "${value}"`);
      console.log(`  disabled属性: ${disabled}`);
      console.log(`  readonly属性: ${readonly}`);
    }

    // 尝试第二次输入
    console.log('\n📝 尝试第二次测试: 输入"测试消息"');
    try {
      await inputBox2.fill('测试消息');
      console.log('✅ 第二次输入成功');
    } catch (error) {
      console.log(`❌ 第二次输入失败: ${error.message}`);
    }

    // 检查AI界面所有可能的状态指示器
    console.log('\n🔍 检查AI界面状态:');
    const aiContainer = await page.$('.ai-assistant, .ai-sidebar, [class*="ai-"]');
    if (aiContainer) {
      const containerHtml = await aiContainer.innerHTML();
      console.log('AI界面HTML片段:', containerHtml.substring(0, 500));
    }

    // 截图
    await page.screenshot({ path: 'input-state-test.png', fullPage: false });
    console.log('\n📸 截图已保存: input-state-test.png');

  } catch (error) {
    console.error('❌ 测试过程出错:', error);
  } finally {
    await browser.close();
  }
}

// 运行测试
testInputState().catch(console.error);