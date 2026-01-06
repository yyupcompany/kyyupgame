const { chromium } = require('playwright');

async function debugFrontendAIPage() {
  console.log('🔍 调试前端AI助手页面问题');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    
    if (type === 'error') {
      console.log(`🔴 控制台错误: ${text}`);
    }
  });
  
  try {
    console.log('\n=== 步骤1：登录并跳转到AI页面 ===');
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    
    // 直接跳转到AI页面
    await page.goto('http://localhost:5173/ai');
    await page.waitForTimeout(5000);
    
    console.log('✅ 已跳转到AI页面');
    
    console.log('\n=== 步骤2：分析页面结构 ===');
    
    // 获取页面基本信息
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyClasses: document.body.className,
        hasVueApp: !!document.querySelector('#app').__vue__,
        elementCount: document.querySelectorAll('*').length
      };
    });
    
    console.log('页面基本信息:');
    console.log(`  标题: ${pageInfo.title}`);
    console.log(`  URL: ${pageInfo.url}`);
    console.log(`  元素数量: ${pageInfo.elementCount}`);
    console.log(`  Vue应用: ${pageInfo.hasVueApp ? '✅' : '❌'}`);
    
    console.log('\n=== 步骤3：检查AI助手组件 ===');
    
    // 查找AI助手相关组件
    const aiComponents = await page.evaluate(() => {
      const components = [];
      
      // 查找可能的AI组件容器
      const selectors = [
        '.ai-assistant',
        '.ai-chat',
        '.chat-interface',
        '.chat-container',
        '.ai-panel',
        '[class*="ai"]',
        '[class*="chat"]',
        '[class*="assistant"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            components.push({
              selector: selector,
              tagName: element.tagName,
              className: element.className,
              id: element.id,
              rect: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              visible: rect.width > 0 && rect.height > 0,
              textContent: element.textContent?.substring(0, 50)
            });
          }
        });
      });
      
      return components;
    });
    
    console.log(`发现 ${aiComponents.length} 个AI相关组件:`);
    aiComponents.slice(0, 10).forEach((comp, i) => {
      console.log(`  ${i + 1}. ${comp.tagName}.${comp.className}`);
      console.log(`     位置: ${comp.rect.x}, ${comp.rect.y}`);
      console.log(`     大小: ${comp.rect.width}x${comp.rect.height}`);
      if (comp.textContent) {
        console.log(`     内容: "${comp.textContent}..."`);
      }
    });
    
    console.log('\n=== 步骤4：详细分析输入框问题 ===');
    
    // 查找所有输入元素
    const inputAnalysis = await page.evaluate(() => {
      const inputs = [];
      
      // 查找所有可能的输入元素
      const inputSelectors = [
        'input',
        'textarea', 
        '[contenteditable="true"]',
        '[role="textbox"]'
      ];
      
      inputSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          const styles = getComputedStyle(element);
          
          inputs.push({
            selector: `${selector}[${index}]`,
            tagName: element.tagName,
            type: element.type || 'N/A',
            className: element.className,
            id: element.id,
            placeholder: element.placeholder || 'N/A',
            value: element.value || 'N/A',
            disabled: element.disabled,
            readonly: element.readOnly,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            styles: {
              display: styles.display,
              visibility: styles.visibility,
              opacity: styles.opacity,
              pointerEvents: styles.pointerEvents,
              zIndex: styles.zIndex
            },
            visible: rect.width > 0 && rect.height > 0,
            editable: !element.disabled && !element.readOnly && styles.pointerEvents !== 'none'
          });
        });
      });
      
      return inputs;
    });
    
    console.log(`发现 ${inputAnalysis.length} 个输入元素:`);
    inputAnalysis.forEach((input, i) => {
      console.log(`\n  ${i + 1}. ${input.tagName}[type="${input.type}"]`);
      console.log(`     class: "${input.className}"`);
      console.log(`     id: "${input.id}"`);
      console.log(`     placeholder: "${input.placeholder}"`);
      console.log(`     位置: ${input.rect.x}, ${input.rect.y}`);
      console.log(`     大小: ${input.rect.width}x${input.rect.height}`);
      console.log(`     可见: ${input.visible ? '✅' : '❌'}`);
      console.log(`     可编辑: ${input.editable ? '✅' : '❌'}`);
      console.log(`     禁用: ${input.disabled ? '⚠️ 是' : '✅ 否'}`);
      console.log(`     只读: ${input.readonly ? '⚠️ 是' : '✅ 否'}`);
      console.log(`     display: ${input.styles.display}`);
      console.log(`     visibility: ${input.styles.visibility}`);
      console.log(`     pointerEvents: ${input.styles.pointerEvents}`);
    });
    
    console.log('\n=== 步骤5：查找发送按钮 ===');
    
    // 查找发送按钮
    const buttonAnalysis = await page.evaluate(() => {
      const buttons = [];
      
      const buttonElements = document.querySelectorAll('button');
      buttonElements.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const text = button.textContent?.trim() || '';
        
        if (rect.width > 0 && rect.height > 0) {
          const isSendButton = text.includes('发送') || 
                              text.includes('Send') || 
                              text.includes('提交') ||
                              button.className.includes('send') ||
                              button.className.includes('submit');
          
          buttons.push({
            index: index,
            tagName: button.tagName,
            className: button.className,
            id: button.id,
            text: text,
            type: button.type || 'N/A',
            disabled: button.disabled,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            isSendButton: isSendButton,
            visible: rect.width > 0 && rect.height > 0
          });
        }
      });
      
      return buttons;
    });
    
    const sendButtons = buttonAnalysis.filter(btn => btn.isSendButton);
    const allButtons = buttonAnalysis.slice(0, 10); // 显示前10个按钮
    
    console.log(`发现 ${sendButtons.length} 个发送按钮:`);
    sendButtons.forEach((btn, i) => {
      console.log(`  ${i + 1}. "${btn.text}" (${btn.className})`);
      console.log(`     位置: ${btn.rect.x}, ${btn.rect.y}`);
      console.log(`     大小: ${btn.rect.width}x${btn.rect.height}`);
      console.log(`     禁用: ${btn.disabled ? '⚠️ 是' : '✅ 否'}`);
    });
    
    console.log(`\n所有按钮 (前10个):`);
    allButtons.forEach((btn, i) => {
      console.log(`  ${i + 1}. "${btn.text}" (${btn.className})`);
    });
    
    console.log('\n=== 步骤6：尝试修复输入框问题 ===');
    
    // 找到最可能的输入框
    const editableInputs = inputAnalysis.filter(input => 
      input.visible && input.editable && input.tagName === 'TEXTAREA'
    );
    
    if (editableInputs.length > 0) {
      const targetInput = editableInputs[0];
      console.log(`\n🎯 尝试使用输入框: ${targetInput.tagName}.${targetInput.className}`);
      
      try {
        // 尝试多种方式填充输入框
        const inputSelector = `textarea.${targetInput.className.split(' ')[0]}`;
        
        console.log(`📝 尝试填充输入框: ${inputSelector}`);
        
        // 方法1: 直接fill
        try {
          await page.locator(inputSelector).first().fill('测试消息：查询学生总数');
          console.log('✅ 方法1成功: 直接fill');
        } catch (error) {
          console.log(`❌ 方法1失败: ${error.message}`);
          
          // 方法2: 点击后输入
          try {
            await page.locator(inputSelector).first().click();
            await page.waitForTimeout(500);
            await page.locator(inputSelector).first().fill('测试消息：查询学生总数');
            console.log('✅ 方法2成功: 点击后fill');
          } catch (error2) {
            console.log(`❌ 方法2失败: ${error2.message}`);
            
            // 方法3: 使用keyboard输入
            try {
              await page.locator(inputSelector).first().click();
              await page.keyboard.type('测试消息：查询学生总数');
              console.log('✅ 方法3成功: keyboard输入');
            } catch (error3) {
              console.log(`❌ 方法3失败: ${error3.message}`);
            }
          }
        }
        
        // 检查输入是否成功
        const inputValue = await page.locator(inputSelector).first().inputValue();
        console.log(`输入框当前值: "${inputValue}"`);
        
        if (inputValue && inputValue.length > 0) {
          console.log('✅ 输入框填充成功！');
          
          // 尝试发送消息
          if (sendButtons.length > 0) {
            const sendBtn = sendButtons[0];
            console.log(`📤 尝试点击发送按钮: "${sendBtn.text}"`);
            
            try {
              await page.locator(`button:has-text("${sendBtn.text}")`).first().click();
              console.log('✅ 发送按钮点击成功');
              
              // 等待响应
              await page.waitForTimeout(8000);
              
              // 检查是否有响应
              const hasResponse = await page.evaluate(() => {
                const responseSelectors = [
                  '.ai-message',
                  '.assistant-message',
                  '.message.assistant',
                  '[class*="response"]',
                  '[class*="ai-response"]'
                ];
                
                for (const selector of responseSelectors) {
                  const elements = document.querySelectorAll(selector);
                  if (elements.length > 0) {
                    const lastElement = elements[elements.length - 1];
                    const content = lastElement.textContent?.trim();
                    if (content && content.length > 10) {
                      return { hasResponse: true, content: content.substring(0, 100) };
                    }
                  }
                }
                
                return { hasResponse: false, content: null };
              });
              
              console.log(`AI响应: ${hasResponse.hasResponse ? '✅ 有响应' : '❌ 无响应'}`);
              if (hasResponse.content) {
                console.log(`响应内容: "${hasResponse.content}..."`);
              }
              
            } catch (error) {
              console.log(`❌ 发送按钮点击失败: ${error.message}`);
            }
          }
        } else {
          console.log('❌ 输入框填充失败');
        }
        
      } catch (error) {
        console.log(`❌ 输入框操作失败: ${error.message}`);
      }
    } else {
      console.log('❌ 未找到可用的输入框');
    }
    
    console.log('\n=== 步骤7：检查Vue组件状态 ===');
    
    // 检查Vue组件状态
    const vueComponentState = await page.evaluate(() => {
      try {
        const app = document.querySelector('#app');
        if (app && app.__vue__) {
          return {
            hasVueApp: true,
            componentCount: document.querySelectorAll('[data-v-]').length,
            // 注意：实际的Vue状态访问可能需要根据具体实现调整
            vueVersion: 'Vue 3 (推测)'
          };
        }
        return { hasVueApp: false };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('Vue组件状态:');
    console.log(`  Vue应用: ${vueComponentState.hasVueApp ? '✅' : '❌'}`);
    if (vueComponentState.componentCount) {
      console.log(`  Vue组件数量: ${vueComponentState.componentCount}`);
    }
    if (vueComponentState.error) {
      console.log(`  错误: ${vueComponentState.error}`);
    }
    
    console.log('\n=== 🎯 前端问题诊断结果 ===');
    
    const diagnosis = {
      pageLoaded: pageInfo.elementCount > 100,
      hasAIComponents: aiComponents.length > 0,
      hasInputs: inputAnalysis.length > 0,
      hasEditableInputs: editableInputs?.length > 0,
      hasSendButtons: sendButtons.length > 0,
      hasVueApp: vueComponentState.hasVueApp,
      consoleErrors: consoleMessages.filter(msg => msg.type === 'error').length
    };
    
    console.log('诊断结果:');
    console.log(`  1. 页面加载: ${diagnosis.pageLoaded ? '✅' : '❌'}`);
    console.log(`  2. AI组件存在: ${diagnosis.hasAIComponents ? '✅' : '❌'}`);
    console.log(`  3. 输入框存在: ${diagnosis.hasInputs ? '✅' : '❌'}`);
    console.log(`  4. 可编辑输入框: ${diagnosis.hasEditableInputs ? '✅' : '❌'}`);
    console.log(`  5. 发送按钮存在: ${diagnosis.hasSendButtons ? '✅' : '❌'}`);
    console.log(`  6. Vue应用正常: ${diagnosis.hasVueApp ? '✅' : '❌'}`);
    console.log(`  7. 控制台错误: ${diagnosis.consoleErrors}个`);
    
    const issueCount = Object.values(diagnosis).filter(v => v === false).length;
    
    if (issueCount === 0) {
      console.log('\n🎉 前端AI助手页面状态正常！');
    } else if (issueCount <= 2) {
      console.log('\n⚠️ 前端AI助手页面有轻微问题');
    } else {
      console.log('\n❌ 前端AI助手页面有严重问题');
    }
    
    return {
      diagnosis,
      aiComponents,
      inputAnalysis,
      sendButtons,
      consoleMessages
    };
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ 前端AI助手页面调试完成！');
  }
}

debugFrontendAIPage().catch(console.error);
