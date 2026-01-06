const { chromium } = require('playwright');

async function debugUIElements() {
  console.log('🔍 调试AI助手页面UI元素');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 步骤1：登录并跳转到AI页面 ===');
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    
    // 点击AI助手按钮
    const aiButton = page.locator('button').filter({ hasText: 'YY-AI' }).first();
    await aiButton.click();
    await page.waitForTimeout(5000);
    
    console.log('\n=== 步骤2：分析页面所有元素 ===');
    
    // 获取页面所有按钮
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map((btn, index) => ({
        index,
        text: btn.textContent?.trim() || '',
        className: btn.className || '',
        type: btn.type || '',
        disabled: btn.disabled,
        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0,
        id: btn.id || '',
        ariaLabel: btn.getAttribute('aria-label') || ''
      }));
    });
    
    console.log(`发现 ${allButtons.length} 个按钮:`);
    allButtons.forEach((btn, i) => {
      if (btn.visible && (btn.text.includes('发送') || btn.text.includes('send') || btn.className.includes('send'))) {
        console.log(`  🎯 发送按钮候选 ${i + 1}: "${btn.text}" - 类名: "${btn.className}" - 禁用: ${btn.disabled}`);
      }
    });
    
    // 获取页面所有输入框
    const allInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      return inputs.map((input, index) => ({
        index,
        tagName: input.tagName,
        type: input.type || '',
        placeholder: input.placeholder || '',
        className: input.className || '',
        value: input.value || '',
        visible: input.offsetWidth > 0 && input.offsetHeight > 0,
        id: input.id || ''
      }));
    });
    
    console.log(`\n发现 ${allInputs.length} 个输入元素:`);
    allInputs.forEach((input, i) => {
      if (input.visible) {
        console.log(`  ${i + 1}. ${input.tagName}[${input.type}] "${input.placeholder}" - 类名: "${input.className}"`);
      }
    });
    
    // 获取页面所有开关和复选框
    const allSwitches = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('input[type="checkbox"], .el-switch, [class*="switch"], [class*="auto"]'));
      return elements.map((el, index) => ({
        index,
        tagName: el.tagName,
        type: el.type || '',
        className: el.className || '',
        checked: el.checked,
        text: el.textContent?.trim() || '',
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        id: el.id || '',
        parentText: el.parentElement?.textContent?.trim() || ''
      }));
    });
    
    console.log(`\n发现 ${allSwitches.length} 个开关/复选框元素:`);
    allSwitches.forEach((sw, i) => {
      if (sw.visible) {
        console.log(`  ${i + 1}. ${sw.tagName}[${sw.type}] "${sw.text}" - 父级文本: "${sw.parentText}" - 选中: ${sw.checked}`);
      }
    });
    
    console.log('\n=== 步骤3：尝试填充输入框 ===');
    
    // 查找最合适的输入框
    const textarea = page.locator('textarea').first();
    const textareaExists = await textarea.count() > 0;
    
    if (textareaExists) {
      await textarea.clear();
      await textarea.fill('测试消息：查询学生总数');
      console.log('✅ 已填充输入框');
      await page.waitForTimeout(1000);
      
      // 检查填充后的按钮状态
      const buttonsAfterInput = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map((btn, index) => ({
          index,
          text: btn.textContent?.trim() || '',
          className: btn.className || '',
          disabled: btn.disabled,
          visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
        })).filter(btn => btn.visible && (
          btn.text.includes('发送') || 
          btn.text.includes('send') || 
          btn.className.includes('send') ||
          btn.className.includes('submit')
        ));
      });
      
      console.log(`填充输入框后，发现 ${buttonsAfterInput.length} 个发送按钮候选:`);
      buttonsAfterInput.forEach((btn, i) => {
        console.log(`  ${i + 1}. "${btn.text}" - 类名: "${btn.className}" - 禁用: ${btn.disabled}`);
      });
      
      // 尝试点击发送按钮
      if (buttonsAfterInput.length > 0) {
        const sendBtn = buttonsAfterInput.find(btn => !btn.disabled);
        if (sendBtn) {
          console.log(`尝试点击发送按钮: "${sendBtn.text}"`);
          
          // 使用更精确的选择器
          const sendButton = page.locator('button').filter({ hasText: sendBtn.text }).first();
          await sendButton.click();
          console.log('✅ 发送按钮点击成功');
          
          // 等待并观察响应
          await page.waitForTimeout(10000);
          
          // 检查页面状态变化
          const pageState = await page.evaluate(() => {
            return {
              rightSidebar: !!document.querySelector('.right-sidebar:not(.hidden), .tool-sidebar:not(.hidden)'),
              aiThink: document.querySelector('.ai-think, [class*="think"]')?.textContent?.trim() || '',
              toolCalls: document.querySelectorAll('.tool-call-item, [class*="tool-call"]').length,
              messages: document.querySelectorAll('.message-item').length,
              aiMessages: document.querySelectorAll('.message-item.assistant').length
            };
          });
          
          console.log('\n📊 发送后页面状态:');
          console.log(`  右侧侧边栏: ${pageState.rightSidebar ? '✅ 可见' : '❌ 隐藏'}`);
          console.log(`  AI思考: "${pageState.aiThink}"`);
          console.log(`  工具调用: ${pageState.toolCalls} 个`);
          console.log(`  消息总数: ${pageState.messages}, AI消息: ${pageState.aiMessages}`);
          
        } else {
          console.log('❌ 所有发送按钮都被禁用');
        }
      } else {
        console.log('❌ 未找到发送按钮');
      }
    } else {
      console.log('❌ 未找到输入框');
    }
    
    console.log('\n=== 步骤4：查找自动执行开关 ===');
    
    // 更详细地查找自动执行相关元素
    const autoElements = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const autoRelated = [];
      
      allElements.forEach((el, index) => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        const id = el.id?.toLowerCase() || '';
        
        if (text.includes('自动') || text.includes('auto') || 
            className.includes('auto') || id.includes('auto') ||
            text.includes('execute') || className.includes('execute')) {
          
          autoRelated.push({
            index,
            tagName: el.tagName,
            text: el.textContent?.trim() || '',
            className: el.className || '',
            id: el.id || '',
            type: el.type || '',
            checked: el.checked,
            visible: el.offsetWidth > 0 && el.offsetHeight > 0
          });
        }
      });
      
      return autoRelated;
    });
    
    console.log(`发现 ${autoElements.length} 个自动执行相关元素:`);
    autoElements.forEach((el, i) => {
      if (el.visible) {
        console.log(`  ${i + 1}. ${el.tagName} "${el.text}" - 类名: "${el.className}" - ID: "${el.id}"`);
      }
    });
    
    return {
      success: true,
      buttons: allButtons.length,
      inputs: allInputs.length,
      switches: allSwitches.length,
      autoElements: autoElements.length
    };
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
    return { success: false, error: error.message };
  } finally {
    console.log('\n⏳ 20秒后关闭浏览器...');
    await page.waitForTimeout(20000);
    await browser.close();
    console.log('✅ UI元素调试完成！');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  debugUIElements().then(result => {
    console.log('\n🎯 调试结果:', result.success ? '成功' : '失败');
  }).catch(console.error);
}

module.exports = { debugUIElements };
