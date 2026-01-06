#!/usr/bin/env node

/**
 * AI助手修复验证测试
 * 验证后端服务启动后AI助手是否正常工作
 */

const { chromium } = require('playwright');

async function testAIFix() {
  console.log('🧪 开始AI助手修复验证测试');
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // 1. 访问登录页面
    console.log('🔗 访问登录页面...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 2. 快捷登录
    console.log('🔑 执行Admin快捷登录...');
    const adminButton = await page.$('.quick-btn.admin-btn');
    if (adminButton) {
      await adminButton.click();
      await page.waitForTimeout(5000);
    }

    // 3. 打开AI助手
    console.log('🤖 打开AI助手...');
    const aiButton = await page.$('text=AI');
    if (aiButton) {
      await aiButton.click();
      await page.waitForTimeout(3000);
    }

    // 4. 测试AI响应
    console.log('💬 测试AI助手响应...');
    const testPrompts = [
      '你好',
      '帮我查询最近的活动',
      '1+1等于几？'
    ];

    for (let i = 0; i < testPrompts.length; i++) {
      const prompt = testPrompts[i];
      console.log(`\n📝 测试提示词 ${i + 1}: "${prompt}"`);

      const inputBox = await page.$('textarea');
      if (inputBox) {
        // 清空并输入新提示词
        await inputBox.fill('');
        await page.waitForTimeout(500);
        await inputBox.fill(prompt);
        await page.waitForTimeout(1000);

        // 发送消息
        const sendButton = await page.$('.send-btn');
        if (sendButton) {
          await sendButton.click();
        } else {
          await inputBox.press('Enter');
        }

        // 等待响应
        await page.waitForTimeout(10000);

        // 检查AI回复
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
          console.log(`📄 AI回复 (前200字符): ${aiResponse.substring(0, 200)}...`);
          console.log(`📏 回复长度: ${aiResponse.length} 字符`);

          // 检查是否还是固定回复
          const isGenericResponse = aiResponse.includes('嗨，亲爱的园长/老师') &&
                                  aiResponse.includes('我是你的AI小助手');

          if (isGenericResponse) {
            console.log('⚠️  仍然是固定回复 - AI服务可能仍有问题');
          } else {
            console.log('✅ 获得了智能回复 - AI服务工作正常！');

            // 如果获得智能回复，提前结束测试
            console.log('\n🎉 修复验证成功！AI助手已恢复正常工作');
            return true;
          }
        } else {
          console.log('❌ 未找到AI回复内容');
        }

        await page.waitForTimeout(2000); // 间隔时间
      } else {
        console.log('❌ 未找到输入框');
      }
    }

    console.log('\n⚠️  测试完成，但AI助手仍返回固定回复');
    console.log('📋 可能的原因:');
    console.log('  1. AI模型服务配置问题');
    console.log('  2. API密钥未配置');
    console.log('  3. AI服务端点不可用');

    return false;

  } catch (error) {
    console.error('❌ 测试过程出错:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// 运行测试
testAIFix().then(success => {
  if (success) {
    console.log('\n✅ AI助手修复验证: 成功');
    process.exit(0);
  } else {
    console.log('\n❌ AI助手修复验证: 失败');
    process.exit(1);
  }
}).catch(console.error);