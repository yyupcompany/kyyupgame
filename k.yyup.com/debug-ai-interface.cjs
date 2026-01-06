const { chromium } = require('playwright');

async function debugAIInterface() {
  console.log('🔍 调试AI助手界面结构');
  
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
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    
    console.log('✅ 登录成功');
    
    console.log('\n=== 步骤2：打开AI助手 ===');
    
    const aiButton = page.locator('button:has-text("YY-AI")').first();
    await aiButton.click();
    await page.waitForTimeout(5000);
    
    console.log('✅ AI助手已打开');
    
    console.log('\n=== 步骤3：分析AI助手界面结构 ===');
    
    // 检查AI助手容器
    const aiContainers = await page.evaluate(() => {
      const containers = [];
      
      // 查找所有可能的AI容器
      const selectors = [
        '.ai-assistant-wrapper',
        '.ai-assistant',
        '.fullscreen-layout',
        '.chat-container',
        '.ai-panel',
        '[class*="ai"]',
        '[class*="assistant"]',
        '[class*="chat"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.offsetWidth > 0 && element.offsetHeight > 0) {
            containers.push({
              selector: selector,
              className: element.className,
              id: element.id,
              tagName: element.tagName,
              rect: {
                x: Math.round(element.getBoundingClientRect().x),
                y: Math.round(element.getBoundingClientRect().y),
                width: Math.round(element.getBoundingClientRect().width),
                height: Math.round(element.getBoundingClientRect().height)
              }
            });
          }
        });
      });
      
      return containers;
    });
    
    console.log(`发现 ${aiContainers.length} 个AI相关容器:`);
    aiContainers.forEach((container, i) => {
      console.log(`  ${i + 1}. ${container.tagName}.${container.className}`);
      console.log(`     位置: ${container.rect.x}, ${container.rect.y}`);
      console.log(`     大小: ${container.rect.width}x${container.rect.height}`);
    });
    
    console.log('\n=== 步骤4：查找输入框 ===');
    
    // 检查所有可能的输入框
    const inputElements = await page.evaluate(() => {
      const inputs = [];
      
      // 查找所有输入元素
      const inputSelectors = [
        'input',
        'textarea',
        '[contenteditable="true"]',
        '[role="textbox"]'
      ];
      
      inputSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            inputs.push({
              tagName: element.tagName,
              type: element.type || 'N/A',
              className: element.className,
              id: element.id,
              placeholder: element.placeholder || 'N/A',
              visible: rect.width > 0 && rect.height > 0,
              rect: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              }
            });
          }
        });
      });
      
      return inputs;
    });
    
    console.log(`发现 ${inputElements.length} 个输入元素:`);
    inputElements.forEach((input, i) => {
      console.log(`  ${i + 1}. ${input.tagName}[type="${input.type}"]`);
      console.log(`     class: "${input.className}"`);
      console.log(`     placeholder: "${input.placeholder}"`);
      console.log(`     位置: ${input.rect.x}, ${input.rect.y}`);
      console.log(`     大小: ${input.rect.width}x${input.rect.height}`);
      console.log(`     可见: ${input.visible ? '✅' : '❌'}`);
    });
    
    console.log('\n=== 步骤5：查找发送按钮 ===');
    
    // 检查所有可能的按钮
    const buttonElements = await page.evaluate(() => {
      const buttons = [];
      
      const buttonElements = document.querySelectorAll('button');
      buttonElements.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          buttons.push({
            tagName: button.tagName,
            className: button.className,
            id: button.id,
            text: button.textContent?.trim() || 'N/A',
            type: button.type || 'N/A',
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            }
          });
        }
      });
      
      return buttons;
    });
    
    console.log(`发现 ${buttonElements.length} 个按钮:`);
    buttonElements.forEach((button, i) => {
      const isSendButton = button.text.includes('发送') || 
                          button.text.includes('Send') || 
                          button.className.includes('send') ||
                          button.className.includes('submit');
      
      if (isSendButton || i < 10) { // 显示前10个或发送相关按钮
        console.log(`  ${i + 1}. ${button.tagName}[type="${button.type}"]`);
        console.log(`     class: "${button.className}"`);
        console.log(`     text: "${button.text}"`);
        console.log(`     位置: ${button.rect.x}, ${button.rect.y}`);
        console.log(`     大小: ${button.rect.width}x${button.rect.height}`);
        
        if (isSendButton) {
          console.log(`     🎯 可能是发送按钮！`);
        }
      }
    });
    
    console.log('\n=== 步骤6：检查AI助手状态 ===');
    
    // 检查AI助手是否处于全屏模式
    const aiStatus = await page.evaluate(() => {
      const fullscreenLayout = document.querySelector('.fullscreen-layout');
      const aiWrapper = document.querySelector('.ai-assistant-wrapper');
      const chatContainer = document.querySelector('.chat-container');
      
      return {
        hasFullscreenLayout: !!fullscreenLayout,
        hasAIWrapper: !!aiWrapper,
        hasChatContainer: !!chatContainer,
        fullscreenVisible: fullscreenLayout ? fullscreenLayout.offsetWidth > 0 : false,
        wrapperVisible: aiWrapper ? aiWrapper.offsetWidth > 0 : false,
        chatVisible: chatContainer ? chatContainer.offsetWidth > 0 : false
      };
    });
    
    console.log('AI助手状态:');
    console.log(`  全屏布局: ${aiStatus.hasFullscreenLayout ? '✅ 存在' : '❌ 不存在'} (可见: ${aiStatus.fullscreenVisible ? '✅' : '❌'})`);
    console.log(`  AI包装器: ${aiStatus.hasAIWrapper ? '✅ 存在' : '❌ 不存在'} (可见: ${aiStatus.wrapperVisible ? '✅' : '❌'})`);
    console.log(`  聊天容器: ${aiStatus.hasChatContainer ? '✅ 存在' : '❌ 不存在'} (可见: ${aiStatus.chatVisible ? '✅' : '❌'})`);
    
    console.log('\n=== 步骤7：尝试定位正确的输入框 ===');
    
    // 尝试不同的输入框选择策略
    const inputStrategies = [
      { name: '全屏布局内的输入框', selector: '.fullscreen-layout input, .fullscreen-layout textarea' },
      { name: '聊天容器内的输入框', selector: '.chat-container input, .chat-container textarea' },
      { name: 'AI包装器内的输入框', selector: '.ai-assistant-wrapper input, .ai-assistant-wrapper textarea' },
      { name: '包含"输入"的placeholder', selector: 'input[placeholder*="输入"], textarea[placeholder*="输入"]' },
      { name: '包含"message"的class', selector: '[class*="message"] input, [class*="message"] textarea' },
      { name: '包含"chat"的class', selector: '[class*="chat"] input, [class*="chat"] textarea' },
      { name: '可编辑元素', selector: '[contenteditable="true"]' }
    ];
    
    for (const strategy of inputStrategies) {
      try {
        const elements = await page.locator(strategy.selector).all();
        console.log(`${strategy.name}: 找到 ${elements.length} 个元素`);
        
        if (elements.length > 0) {
          for (let i = 0; i < Math.min(elements.length, 3); i++) {
            const element = elements[i];
            const isVisible = await element.isVisible();
            const boundingBox = await element.boundingBox();
            
            console.log(`  元素${i + 1}: 可见=${isVisible ? '✅' : '❌'}`);
            if (boundingBox) {
              console.log(`    位置: ${Math.round(boundingBox.x)}, ${Math.round(boundingBox.y)}`);
              console.log(`    大小: ${Math.round(boundingBox.width)}x${Math.round(boundingBox.height)}`);
            }
          }
        }
      } catch (error) {
        console.log(`${strategy.name}: 查找失败 - ${error.message}`);
      }
    }
    
    console.log('\n=== 🎯 调试结论 ===');
    
    if (aiStatus.hasFullscreenLayout && aiStatus.fullscreenVisible) {
      console.log('✅ AI助手处于全屏模式');
      console.log('💡 建议使用全屏布局内的选择器');
    } else if (aiStatus.hasAIWrapper && aiStatus.wrapperVisible) {
      console.log('✅ AI助手处于包装器模式');
      console.log('💡 建议使用AI包装器内的选择器');
    } else {
      console.log('⚠️ AI助手状态不明确');
      console.log('💡 建议检查AI助手是否正确打开');
    }
    
    const hasVisibleInputs = inputElements.some(input => input.visible);
    if (hasVisibleInputs) {
      console.log('✅ 发现可见的输入框');
      console.log('💡 建议更新测试脚本的选择器');
    } else {
      console.log('❌ 未发现可见的输入框');
      console.log('💡 可能需要等待AI助手完全加载');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器，请仔细观察界面...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ AI助手界面调试完成！');
  }
}

debugAIInterface().catch(console.error);
