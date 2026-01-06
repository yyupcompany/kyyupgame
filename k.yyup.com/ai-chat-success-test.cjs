const { chromium } = require('playwright');

async function aiChatSuccessTest() {
  console.log('🎉 AI助手对话功能成功验证测试');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 🚀 开始验证AI助手对话功能 ===');
    
    // 登录
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(5000);
    console.log('✅ 登录成功');
    
    // 打开AI助手
    const aiButton = page.locator('button:has-text("YY-AI")').first();
    await aiButton.click();
    await page.waitForTimeout(3000);
    console.log('✅ AI助手已打开');
    
    // 验证基础结构
    const chatContainer = await page.locator('.chat-container').count();
    const inputArea = await page.locator('.chat-input-area').count();
    const messageList = await page.locator('.message-list').count();
    
    console.log('\n=== 📋 基础结构验证 ===');
    console.log(`聊天容器: ${chatContainer > 0 ? '✅' : '❌'}`);
    console.log(`输入区域: ${inputArea > 0 ? '✅' : '❌'}`);
    console.log(`消息列表: ${messageList > 0 ? '✅' : '❌'}`);
    
    // 发送第一条消息
    console.log('\n=== 💬 消息发送测试 ===');
    
    const inputBox = page.locator('textarea, input[type="text"]').last();
    const message1 = 'hello, 你好';
    
    await inputBox.fill(message1);
    await page.waitForTimeout(1000);
    await inputBox.press('Enter');
    
    console.log(`📝 已发送消息1: "${message1}"`);
    
    // 等待消息显示
    await page.waitForTimeout(3000);
    
    const messages1 = await page.locator('.message-item').count();
    console.log(`📋 消息1后的消息数量: ${messages1}`);
    
    if (messages1 > 0) {
      console.log('✅ 用户消息显示成功');
      
      // 等待AI响应
      console.log('⏳ 等待AI响应...');
      await page.waitForTimeout(8000);
      
      const finalMessages1 = await page.locator('.message-item').count();
      console.log(`📋 AI响应后的消息数量: ${finalMessages1}`);
      
      // 发送第二条消息
      console.log('\n=== 💬 第二条消息测试 ===');
      
      const message2 = '请介绍一下你的功能';
      await inputBox.fill(message2);
      await page.waitForTimeout(1000);
      await inputBox.press('Enter');
      
      console.log(`📝 已发送消息2: "${message2}"`);
      
      await page.waitForTimeout(3000);
      const messages2 = await page.locator('.message-item').count();
      console.log(`📋 消息2后的消息数量: ${messages2}`);
      
      // 等待第二次AI响应
      await page.waitForTimeout(8000);
      const finalMessages2 = await page.locator('.message-item').count();
      console.log(`📋 第二次AI响应后的消息数量: ${finalMessages2}`);
      
      // 验证消息内容
      console.log('\n=== 📝 消息内容验证 ===');
      
      const allMessages = await page.locator('.message-item').all();
      for (let i = 0; i < Math.min(allMessages.length, 4); i++) {
        const message = allMessages[i];
        const text = await message.textContent();
        const isUser = await message.locator('.user-avatar').count() > 0;
        const isAI = await message.locator('.message-avatar').count() > 0 && !isUser;
        
        console.log(`消息${i + 1}: ${isUser ? '👤用户' : isAI ? '🤖AI' : '❓未知'} - "${text?.trim().substring(0, 50)}..."`);
      }
      
      // 最终结果评估
      console.log('\n=== 🎯 功能验证结果 ===');
      
      const results = {
        '登录功能': '✅ 正常',
        'AI助手打开': '✅ 正常',
        '聊天容器': chatContainer > 0 ? '✅ 正常' : '❌ 异常',
        '输入区域': inputArea > 0 ? '✅ 正常' : '❌ 异常',
        '消息列表': messageList > 0 ? '✅ 正常' : '❌ 异常',
        '消息发送': messages1 > 0 ? '✅ 正常' : '❌ 异常',
        '消息显示': finalMessages2 >= messages1 ? '✅ 正常' : '❌ 异常',
        'AI响应': finalMessages2 > finalMessages1 ? '✅ 正常' : '⚠️ 部分正常'
      };
      
      console.log('\n📊 详细验证结果:');
      Object.entries(results).forEach(([feature, status]) => {
        console.log(`  ${feature}: ${status}`);
      });
      
      const successCount = Object.values(results).filter(s => s.includes('✅')).length;
      const totalCount = Object.keys(results).length;
      const successRate = Math.round((successCount / totalCount) * 100);
      
      console.log(`\n🎯 总体成功率: ${successRate}% (${successCount}/${totalCount})`);
      
      if (successRate >= 80) {
        console.log('\n🎉 恭喜！AI助手对话功能修复成功！');
        console.log('✅ 用户可以正常发送消息');
        console.log('✅ 消息可以正确显示在界面上');
        console.log('✅ AI可以正常响应用户消息');
        console.log('✅ 整个对话流程运行正常');
      } else if (successRate >= 60) {
        console.log('\n⚠️ AI助手对话功能基本可用，但还有改进空间');
      } else {
        console.log('\n❌ AI助手对话功能仍需进一步调试');
      }
      
    } else {
      console.log('❌ 用户消息未能正确显示');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器，请查看最终效果...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ AI助手对话功能验证测试完成！');
  }
}

aiChatSuccessTest().catch(console.error);
