#!/usr/bin/env node

/**
 * 调试AI响应内容，检查是否有实际的AI回复内容
 */

const { chromium } = require('playwright');

async function debugAIResponse() {
  console.log('🔍 调试AI响应内容格式');
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // 监听所有控制台消息，特别关注answer相关事件
    const allMessages = [];
    page.on('console', (msg) => {
      const text = msg.text();
      allMessages.push({
        type: msg.type(),
        text: text,
        timestamp: new Date().toISOString()
      });

      // 重点监控AI响应相关事件
      if (text.includes('answer') ||
          text.includes('final') ||
          text.includes('complete') ||
          text.includes('content') ||
          text.includes('[前端接收]')) {
        console.log(`🎯 [${msg.type().toUpperCase()}] ${text}`);
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

    // 测试不同类型的提示词
    const testPrompts = [
      '你好',
      '帮我查询最近的活动',
      '1+1等于几？'
    ];

    for (let i = 0; i < testPrompts.length; i++) {
      console.log(`\n📝 测试提示词 ${i + 1}: ${testPrompts[i]}`);
      console.log('-'.repeat(30));

      const inputBox = await page.$('textarea');
      if (inputBox) {
        // 清空输入框
        await inputBox.fill('');
        await page.waitForTimeout(500);

        // 输入新提示词
        await inputBox.fill(testPrompts[i]);
        await page.waitForTimeout(1000);

        // 点击发送
        const sendButton = await page.$('.send-btn');
        if (sendButton) {
          await sendButton.click();
        } else {
          await inputBox.press('Enter');
        }

        // 等待响应
        await page.waitForTimeout(8000);

        // 查找AI回复内容
        const responseSelectors = [
          '[class*="ai-response"]',
          '[class*="message"]:not(:has-textarea))',
          '.ai-message',
          '[class*="chat-message"]',
          '.message-content'
        ];

        let aiResponse = null;
        for (const selector of responseSelectors) {
          try {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
              // 获取最后一条消息
              const lastElement = elements[elements.length - 1];
              const text = await lastElement.innerText();
              if (text && text.trim().length > 0) {
                aiResponse = text;
                break;
              }
            }
          } catch (e) {
            // 继续尝试下一个选择器
          }
        }

        if (aiResponse) {
          console.log(`📄 AI回复内容 (前200字符): ${aiResponse.substring(0, 200)}...`);
          console.log(`📏 回复长度: ${aiResponse.length} 字符`);

          // 检查是否是通用回复
          const isGenericResponse = aiResponse.includes('嗨，亲爱的园长/老师') &&
                                  aiResponse.includes('我是你的AI小助手');
          console.log(`🔍 是否为通用回复: ${isGenericResponse ? '是' : '否'}`);
        } else {
          console.log('❌ 未找到AI回复内容');
        }

        // 分析answer相关事件
        const answerEvents = allMessages.filter(msg =>
          msg.text.includes('answer') ||
          msg.text.includes('final') ||
          msg.text.includes('content')
        );

        console.log(`📊 Answer相关事件数量: ${answerEvents.length}`);
        if (answerEvents.length > 0) {
          console.log('📋 Answer事件列表:');
          answerEvents.forEach((event, index) => {
            console.log(`${index + 1}. ${event.text.substring(0, 100)}...`);
          });
        }

        await page.waitForTimeout(2000); // 间隔时间
      }
    }

  } catch (error) {
    console.error('❌ 调试过程出错:', error);
  } finally {
    await browser.close();
  }
}

// 运行调试
debugAIResponse().catch(console.error);
