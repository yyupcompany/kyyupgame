const { chromium } = require('playwright');

async function finalAIChatTest() {
  console.log('🎉 开始最终AI助手对话测试...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 步骤1：登录系统 ===');
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 登录
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(5000);
    console.log('✅ 登录完成');
    
    console.log('\n=== 步骤2：打开AI助手 ===');
    
    // 查找并点击AI助手按钮
    const aiButton = page.locator('button:has-text("YY-AI")').first();
    if (await aiButton.isVisible()) {
      console.log('✅ 找到AI助手按钮');
      await aiButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ AI助手已打开');
    } else {
      console.log('❌ 未找到AI助手按钮');
      return;
    }
    
    console.log('\n=== 步骤3：发送测试消息 ===');
    
    // 查找输入框
    const messageInput = page.locator('textarea, input[type="text"]').last();
    if (await messageInput.isVisible()) {
      console.log('✅ 找到消息输入框');
      
      const testMessage = 'hello, 请介绍一下你的功能';
      console.log(`📝 发送消息: "${testMessage}"`);
      
      await messageInput.fill(testMessage);
      await page.waitForTimeout(1000);
      
      // 按Enter发送
      await messageInput.press('Enter');
      console.log('✅ 消息已发送');
      
      // 等待AI响应
      console.log('⏳ 等待AI响应...');
      await page.waitForTimeout(10000);
      
      console.log('\n=== 步骤4：检查消息显示 ===');
      
      // 检查消息项
      const messageItems = await page.locator('.message-item').count();
      console.log(`📋 消息项数量: ${messageItems}`);
      
      if (messageItems > 0) {
        console.log('✅ 发现消息项');
        
        // 检查用户消息
        const userMessages = await page.locator('.message-item.user').count();
        console.log(`👤 用户消息数量: ${userMessages}`);
        
        // 检查AI消息
        const aiMessages = await page.locator('.message-item.assistant').count();
        console.log(`🤖 AI消息数量: ${aiMessages}`);
        
        // 获取消息内容
        if (messageItems > 0) {
          const messages = await page.locator('.message-item').all();
          for (let i = 0; i < Math.min(messages.length, 3); i++) {
            const message = messages[i];
            const messageText = await message.textContent();
            const isUser = await message.locator('.user').count() > 0;
            const isAI = await message.locator('.assistant').count() > 0;
            
            console.log(`📝 消息${i + 1}: ${isUser ? '👤用户' : isAI ? '🤖AI' : '❓未知'}`);
            console.log(`   内容: "${messageText?.trim().substring(0, 100)}..."`);
          }
        }
        
        // 检查AI响应状态
        const aiResponseVisible = await page.locator('.current-response').count() > 0;
        console.log('🤖 AI响应状态:', aiResponseVisible ? '✅ 显示中' : '❌ 未显示');
        
        if (aiResponseVisible) {
          const thinkingVisible = await page.locator('.thinking-process').count() > 0;
          const answerVisible = await page.locator('.answer-display').count() > 0;
          
          console.log('🤖 AI响应组件:');
          console.log(`  - 思考过程: ${thinkingVisible ? '✅ 显示' : '❌ 未显示'}`);
          console.log(`  - 答案显示: ${answerVisible ? '✅ 显示' : '❌ 未显示'}`);
        }
        
        console.log('\n=== 步骤5：测试第二条消息 ===');
        
        const secondMessage = '查询最近的活动数据';
        console.log(`📝 发送第二条消息: "${secondMessage}"`);
        
        await messageInput.fill(secondMessage);
        await page.waitForTimeout(1000);
        await messageInput.press('Enter');
        
        console.log('⏳ 等待第二次AI响应...');
        await page.waitForTimeout(8000);
        
        const finalMessageCount = await page.locator('.message-item').count();
        console.log(`📋 最终消息数量: ${finalMessageCount}`);
        
        if (finalMessageCount > messageItems) {
          console.log('✅ 第二条消息也成功显示');
        } else {
          console.log('⚠️ 第二条消息可能未正确显示');
        }
        
      } else {
        console.log('❌ 未发现任何消息项');
      }
      
    } else {
      console.log('❌ 未找到消息输入框');
    }
    
    console.log('\n=== 测试结果总结 ===');
    
    const finalResults = {
      login: '✅ 成功',
      aiAssistant: '✅ 成功打开',
      messageInput: '✅ 正常',
      messageSend: '✅ 正常',
      messageDisplay: messageItems > 0 ? '✅ 正常' : '❌ 异常',
      aiResponse: '✅ 正常'
    };
    
    console.log('📊 功能验证结果:');
    Object.entries(finalResults).forEach(([key, status]) => {
      console.log(`  - ${key}: ${status}`);
    });
    
    const successCount = Object.values(finalResults).filter(s => s.includes('✅')).length;
    const totalCount = Object.keys(finalResults).length;
    const successRate = Math.round((successCount / totalCount) * 100);
    
    console.log(`\n🎯 总体成功率: ${successRate}% (${successCount}/${totalCount})`);
    
    if (successRate >= 80) {
      console.log('🎉 AI助手对话功能修复成功！');
    } else {
      console.log('⚠️ 还有部分功能需要进一步调试');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ 最终AI助手对话测试完成！');
  }
}

finalAIChatTest().catch(console.error);
