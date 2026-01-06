const { chromium } = require('playwright');

async function debugAIChat() {
  console.log('🔍 开始AI助手对话框调试...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('🔴 控制台错误:', text);
    } else if (type === 'warn') {
      console.log('🟡 控制台警告:', text);
    } else if (text.includes('发送消息') || text.includes('工具调用') || text.includes('AI')) {
      console.log('📝 AI相关日志:', text);
    }
  });
  
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
    
    console.log('\n=== 步骤3：检查对话框结构 ===');
    
    // 检查消息列表容器
    const messageListExists = await page.locator('.message-list').count() > 0;
    console.log('📋 消息列表容器:', messageListExists ? '✅ 存在' : '❌ 不存在');
    
    // 检查聊天容器
    const chatContainerExists = await page.locator('.chat-container').count() > 0;
    console.log('💬 聊天容器:', chatContainerExists ? '✅ 存在' : '❌ 不存在');
    
    // 检查输入区域
    const inputAreaExists = await page.locator('.chat-input-area').count() > 0;
    console.log('📝 输入区域:', inputAreaExists ? '✅ 存在' : '❌ 不存在');
    
    // 检查输入框
    const inputBoxes = await page.locator('textarea, input[type="text"]').count();
    console.log(`📝 输入框数量: ${inputBoxes}`);
    
    if (inputBoxes > 0) {
      // 获取最后一个输入框（通常是AI助手的输入框）
      const messageInput = page.locator('textarea, input[type="text"]').last();
      const isVisible = await messageInput.isVisible();
      const placeholder = await messageInput.getAttribute('placeholder') || '';
      
      console.log('📝 消息输入框:');
      console.log(`  - 可见: ${isVisible ? '✅ 是' : '❌ 否'}`);
      console.log(`  - 占位符: "${placeholder}"`);
      
      if (isVisible) {
        console.log('\n=== 步骤4：发送测试消息 ===');
        
        const testMessage = 'hi';
        console.log(`📝 输入消息: "${testMessage}"`);
        
        await messageInput.fill(testMessage);
        await page.waitForTimeout(1000);
        
        // 检查输入框内容
        const inputValue = await messageInput.inputValue();
        console.log(`📝 输入框内容: "${inputValue}"`);
        
        // 查找发送按钮
        const sendSelectors = [
          'button:has-text("发送")',
          'button[type="submit"]',
          'button:has-text("Send")',
          '.send-button',
          '.submit-btn'
        ];
        
        let sendButton = null;
        for (const selector of sendSelectors) {
          const elements = await page.locator(selector).all();
          for (const element of elements) {
            if (await element.isVisible()) {
              sendButton = element;
              console.log(`✅ 找到发送按钮: ${selector}`);
              break;
            }
          }
          if (sendButton) break;
        }
        
        if (sendButton) {
          console.log('🔘 点击发送按钮...');
          await sendButton.click();
        } else {
          console.log('⚠️ 未找到发送按钮，尝试按Enter键...');
          await messageInput.press('Enter');
        }
        
        await page.waitForTimeout(3000);
        
        console.log('\n=== 步骤5：检查消息显示 ===');
        
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
          
          // 获取最新消息内容
          if (messageItems > 0) {
            const lastMessage = page.locator('.message-item').last();
            const messageText = await lastMessage.textContent();
            console.log(`📝 最新消息内容: "${messageText?.trim()}"`);
          }
        } else {
          console.log('❌ 未发现任何消息项');
          
          // 检查是否有错误信息
          const errorElements = await page.locator('.error, .alert-danger, .el-message--error').count();
          if (errorElements > 0) {
            const errorText = await page.locator('.error, .alert-danger, .el-message--error').first().textContent();
            console.log(`❌ 发现错误信息: "${errorText}"`);
          }
        }
        
        // 检查AI响应状态
        const aiResponseVisible = await page.locator('.current-response').count() > 0;
        console.log('🤖 AI响应状态:', aiResponseVisible ? '✅ 显示中' : '❌ 未显示');
        
        if (aiResponseVisible) {
          const thinkingVisible = await page.locator('.thinking-process').count() > 0;
          const functionCallsVisible = await page.locator('.function-call-list').count() > 0;
          const answerVisible = await page.locator('.answer-display').count() > 0;
          
          console.log('🤖 AI响应组件:');
          console.log(`  - 思考过程: ${thinkingVisible ? '✅ 显示' : '❌ 未显示'}`);
          console.log(`  - 工具调用: ${functionCallsVisible ? '✅ 显示' : '❌ 未显示'}`);
          console.log(`  - 答案显示: ${answerVisible ? '✅ 显示' : '❌ 未显示'}`);
        }
        
        console.log('\n=== 步骤6：检查Vue组件状态 ===');
        
        // 检查Vue组件是否正确挂载
        const vueAppExists = await page.evaluate(() => {
          return window.Vue || window.__VUE__ || document.querySelector('#app')?.__vue__;
        });
        console.log('🔧 Vue应用状态:', vueAppExists ? '✅ 正常' : '❌ 异常');
        
        // 检查Element Plus组件
        const elComponentsCount = await page.locator('[class*="el-"]').count();
        console.log(`🎨 Element Plus组件数量: ${elComponentsCount}`);
        
      } else {
        console.log('❌ 消息输入框不可见');
      }
    } else {
      console.log('❌ 未找到任何输入框');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ AI助手对话框调试完成！');
  }
}

debugAIChat().catch(console.error);
