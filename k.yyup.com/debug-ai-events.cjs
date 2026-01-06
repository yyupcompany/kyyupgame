#!/usr/bin/env node

/**
 * 调试AI助手事件流，查看实际接收到的事件
 */

const { chromium } = require('playwright');

async function debugAIEvents() {
  console.log('🔍 调试AI助手事件流');
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // 监听所有控制台消息
    const consoleMessages = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push({
        type: msg.type(),
        text: text,
        timestamp: new Date().toISOString()
      });

      // 只打印AI相关的事件
      if (text.includes('[API调用]') ||
          text.includes('[前端接收]') ||
          text.includes('[单次调用]') ||
          text.includes('SSE事件') ||
          text.includes('complete') ||
          text.includes('sidebar模式')) {
        console.log(`📱 [${msg.type().toUpperCase()}] ${text}`);
      }
    });

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

    // 找到输入框并发送消息
    const inputBox = await page.$('textarea');
    if (inputBox) {
      await inputBox.fill('你好，调试事件');
      await page.waitForTimeout(1000);

      // 点击发送按钮
      const sendButton = await page.$('.send-btn');
      if (sendButton) {
        await sendButton.click();
      } else {
        await inputBox.press('Enter');
      }
    }

    // 等待AI响应，收集事件
    console.log('\n⏳ 等待AI响应并收集事件...');
    await page.waitForTimeout(10000);

    // 分析收集到的事件
    console.log('\n📊 事件分析结果:');
    console.log('='.repeat(50));

    const aiEvents = consoleMessages.filter(msg =>
      msg.text.includes('sidebar模式') ||
      msg.text.includes('AI响应完成') ||
      msg.text.includes('complete') ||
      msg.text.includes('sending') ||
      msg.text.includes('SSE事件')
    );

    console.log(`\n📈 总共收集到 ${consoleMessages.length} 条控制台消息`);
    console.log(`🎯 AI相关事件 ${aiEvents.length} 条`);

    // 查找complete事件
    const completeEvents = consoleMessages.filter(msg =>
      msg.text.includes('complete') &&
      (msg.text.includes('sidebar模式') || msg.text.includes('AI响应完成'))
    );

    console.log(`\n✅ Complete事件 ${completeEvents.length} 条:`);
    completeEvents.forEach((event, index) => {
      console.log(`${index + 1}. [${event.timestamp}] ${event.text}`);
    });

    // 查找sending状态变化
    const sendingEvents = consoleMessages.filter(msg =>
      msg.text.includes('sending') && msg.text.includes('sidebar模式')
    );

    console.log(`\n🔄 Sending状态事件 ${sendingEvents.length} 条:`);
    sendingEvents.forEach((event, index) => {
      console.log(`${index + 1}. [${event.timestamp}] ${event.text}`);
    });

    // 最终状态检查
    console.log('\n🔍 最终状态检查:');
    const finalInput = await page.$('textarea');
    if (finalInput) {
      const isDisabled = await finalInput.isDisabled();
      const placeholder = await finalInput.getAttribute('placeholder');
      const value = await finalInput.inputValue();

      console.log(`  输入框禁用状态: ${isDisabled}`);
      console.log(`  占位符文本: ${placeholder}`);
      console.log(`  当前值: "${value}"`);
    }

  } catch (error) {
    console.error('❌ 调试过程出错:', error);
  } finally {
    await browser.close();
  }
}

// 运行调试
debugAIEvents().catch(console.error);