const { chromium } = require('playwright');

async function aiAssistantSpecificTest() {
  console.log('🤖 开始AI助手专项功能测试...');
  
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
    
    console.log('\n=== 步骤2：查找AI助手入口 ===');
    
    // 详细查找AI助手按钮
    const aiSelectors = [
      'button:has-text("AI")',
      'button:has-text("YY-AI")',
      'button:has-text("智能助手")',
      'button:has-text("AI助手")',
      '[title*="AI"]',
      '[aria-label*="AI"]',
      '.ai-assistant-toggle',
      '.ai-button',
      '.assistant-btn'
    ];
    
    let aiButton = null;
    let foundSelector = '';
    
    for (const selector of aiSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        for (const element of elements) {
          if (await element.isVisible()) {
            aiButton = element;
            foundSelector = selector;
            break;
          }
        }
        if (aiButton) break;
      }
    }
    
    if (aiButton) {
      console.log(`✅ 找到AI助手按钮: ${foundSelector}`);
      
      const buttonText = await aiButton.textContent();
      console.log(`📝 按钮文本: "${buttonText}"`);
      
      console.log('\n=== 步骤3：打开AI助手 ===');
      
      await aiButton.click();
      await page.waitForTimeout(3000);
      
      // 检查AI助手界面
      const aiInterfaceSelectors = [
        '.ai-assistant',
        '.ai-chat',
        '.assistant-panel',
        '.ai-container',
        '.chat-container',
        '.ai-dialog',
        '.assistant-dialog'
      ];
      
      let aiInterface = null;
      let interfaceSelector = '';
      
      for (const selector of aiInterfaceSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          aiInterface = page.locator(selector).first();
          interfaceSelector = selector;
          console.log(`✅ 找到AI助手界面: ${selector}`);
          break;
        }
      }
      
      if (aiInterface) {
        console.log('\n=== 步骤4：测试AI助手交互 ===');
        
        // 查找输入框
        const inputSelectors = [
          'textarea',
          'input[type="text"]',
          'input[placeholder*="消息"]',
          'input[placeholder*="问题"]',
          'input[placeholder*="输入"]',
          '.message-input',
          '.chat-input'
        ];
        
        let messageInput = null;
        
        for (const selector of inputSelectors) {
          const element = page.locator(selector).last(); // 使用最后一个，通常是AI助手的输入框
          if (await element.isVisible()) {
            messageInput = element;
            console.log(`✅ 找到消息输入框: ${selector}`);
            break;
          }
        }
        
        if (messageInput) {
          // 测试消息列表
          const testMessages = [
            '你好',
            '请介绍一下这个系统的主要功能',
            '如何添加新学生？'
          ];
          
          for (const message of testMessages) {
            console.log(`📝 发送消息: "${message}"`);
            
            await messageInput.fill(message);
            await page.waitForTimeout(1000);
            
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
              const element = page.locator(selector).last();
              if (await element.isVisible()) {
                sendButton = element;
                break;
              }
            }
            
            if (sendButton) {
              await sendButton.click();
              console.log('✅ 消息已发送');
              
              // 等待AI响应
              await page.waitForTimeout(8000);
              
              // 检查是否有新的消息出现
              const messageElements = await page.locator('.message, .chat-message, .ai-message').count();
              console.log(`📊 当前消息数量: ${messageElements}`);
              
            } else {
              console.log('⚠️ 未找到发送按钮，尝试按Enter键');
              await messageInput.press('Enter');
              await page.waitForTimeout(5000);
            }
            
            // 检查AI响应
            const responseElements = await page.locator('.ai-response, .assistant-response, .bot-message').count();
            if (responseElements > 0) {
              console.log('✅ 检测到AI响应');
            }
            
            await page.waitForTimeout(2000);
          }
          
          console.log('\n=== 步骤5：检查AI助手功能 ===');
          
          // 检查各种AI功能
          const features = [
            { name: '消息历史', selectors: ['.message-history', '.chat-history'] },
            { name: '清空对话', selectors: ['button:has-text("清空")', 'button:has-text("清除")'] },
            { name: '设置选项', selectors: ['.settings', '.config', 'button:has-text("设置")'] },
            { name: '快捷查询', selectors: ['.quick-query', '.preset-questions'] },
            { name: '工具调用', selectors: ['.tool-calling', '.function-call'] }
          ];
          
          console.log('🔍 检查AI助手功能:');
          features.forEach(feature => {
            let found = false;
            feature.selectors.forEach(selector => {
              const count = page.locator(selector).count();
              if (count > 0) {
                console.log(`  ✅ ${feature.name}: 找到`);
                found = true;
              }
            });
            if (!found) {
              console.log(`  ❌ ${feature.name}: 未找到`);
            }
          });
          
        } else {
          console.log('❌ 未找到消息输入框');
        }
        
      } else {
        console.log('❌ AI助手界面未正确打开');
        
        // 尝试查看页面内容
        const bodyText = await page.textContent('body');
        if (bodyText.includes('AI') || bodyText.includes('助手')) {
          console.log('⚠️ 页面包含AI相关内容，但界面可能未完全加载');
        }
      }
      
    } else {
      console.log('❌ 未找到AI助手按钮');
      
      // 检查页面是否包含AI相关元素
      const bodyText = await page.textContent('body');
      console.log('🔍 页面内容分析:');
      console.log(`  - 包含"AI"文本: ${bodyText.includes('AI') ? '是' : '否'}`);
      console.log(`  - 包含"助手"文本: ${bodyText.includes('助手') ? '是' : '否'}`);
      console.log(`  - 包含"智能"文本: ${bodyText.includes('智能') ? '是' : '否'}`);
      
      // 列出所有按钮
      const allButtons = await page.locator('button').all();
      console.log(`\n📋 页面所有按钮 (共${allButtons.length}个):`);
      
      for (let i = 0; i < Math.min(10, allButtons.length); i++) {
        const button = allButtons[i];
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        if (text && text.trim()) {
          console.log(`  ${i + 1}. "${text.trim()}" ${isVisible ? '(可见)' : '(隐藏)'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ AI助手测试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ AI助手专项测试完成！');
  }
}

aiAssistantSpecificTest().catch(console.error);
