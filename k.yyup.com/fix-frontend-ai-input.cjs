const { chromium } = require('playwright');

async function fixFrontendAIInput() {
  console.log('🔧 修复前端AI助手输入框问题');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
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
    
    await page.goto('http://localhost:5173/ai');
    await page.waitForTimeout(5000);
    
    console.log('✅ 已跳转到AI页面');
    
    console.log('\n=== 步骤2：正确的Vue组件交互方式 ===');
    
    // 方法1: 使用Playwright的fill方法（会触发Vue事件）
    console.log('🧪 方法1: 使用Playwright的fill方法');
    
    try {
      const textarea = page.locator('textarea.el-textarea__inner');
      
      // 清空输入框
      await textarea.clear();
      await page.waitForTimeout(500);
      
      // 填充内容
      await textarea.fill('测试消息：查询学生总数');
      await page.waitForTimeout(1000);
      
      // 检查发送按钮状态
      const sendButton = page.locator('button.send-button');
      const isDisabled = await sendButton.getAttribute('disabled');
      const hasDisabledClass = await sendButton.evaluate(el => el.classList.contains('is-disabled'));
      
      console.log(`发送按钮disabled属性: ${isDisabled}`);
      console.log(`发送按钮is-disabled类: ${hasDisabledClass}`);
      
      if (!isDisabled && !hasDisabledClass) {
        console.log('✅ 方法1成功: 发送按钮已启用');
        
        // 尝试发送消息
        await sendButton.click();
        console.log('✅ 消息已发送');
        
        // 等待响应
        await page.waitForTimeout(10000);
        
        // 检查响应
        const response = await checkAIResponse(page);
        if (response.hasResponse) {
          console.log(`✅ 收到AI响应: "${response.content}"`);
          return { success: true, method: '方法1: Playwright fill' };
        } else {
          console.log('⚠️ 消息发送成功但未收到AI响应');
        }
      } else {
        console.log('❌ 方法1失败: 发送按钮仍然禁用');
      }
      
    } catch (error) {
      console.log(`❌ 方法1异常: ${error.message}`);
    }
    
    console.log('\n🧪 方法2: 直接操作Vue组件数据');
    
    try {
      // 通过JavaScript直接操作Vue组件
      const result = await page.evaluate(() => {
        // 查找Vue组件实例
        const app = document.querySelector('#app');
        if (!app || !app.__vue__) {
          return { success: false, error: 'Vue应用未找到' };
        }
        
        // 尝试通过DOM查找textarea元素
        const textarea = document.querySelector('textarea.el-textarea__inner');
        if (!textarea) {
          return { success: false, error: '输入框未找到' };
        }
        
        // 设置值并触发事件
        textarea.value = '测试消息2：统计班级学生数量';
        
        // 触发Vue的input事件
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
        
        // 触发change事件
        const changeEvent = new Event('change', { bubbles: true });
        textarea.dispatchEvent(changeEvent);
        
        // 检查发送按钮状态
        const sendButton = document.querySelector('button.send-button');
        const isDisabled = sendButton?.disabled || sendButton?.classList.contains('is-disabled');
        
        return { 
          success: true, 
          textareaValue: textarea.value,
          sendButtonDisabled: isDisabled
        };
      });
      
      console.log(`Vue操作结果: ${JSON.stringify(result)}`);
      
      if (result.success && !result.sendButtonDisabled) {
        console.log('✅ 方法2成功: Vue组件数据已更新');
        
        // 点击发送按钮
        await page.locator('button.send-button').click();
        console.log('✅ 消息已发送');
        
        // 等待响应
        await page.waitForTimeout(10000);
        
        const response = await checkAIResponse(page);
        if (response.hasResponse) {
          console.log(`✅ 收到AI响应: "${response.content}"`);
          return { success: true, method: '方法2: Vue组件操作' };
        }
      } else {
        console.log('❌ 方法2失败: Vue组件操作无效');
      }
      
    } catch (error) {
      console.log(`❌ 方法2异常: ${error.message}`);
    }
    
    console.log('\n🧪 方法3: 模拟用户键盘输入');
    
    try {
      // 清空输入框
      await page.locator('textarea.el-textarea__inner').clear();
      await page.waitForTimeout(500);
      
      // 点击输入框获得焦点
      await page.locator('textarea.el-textarea__inner').click();
      await page.waitForTimeout(500);
      
      // 使用键盘输入
      await page.keyboard.type('测试消息3：查询活动数据', { delay: 100 });
      await page.waitForTimeout(1000);
      
      // 检查发送按钮状态
      const sendButton = page.locator('button.send-button');
      const isDisabled = await sendButton.getAttribute('disabled');
      const hasDisabledClass = await sendButton.evaluate(el => el.classList.contains('is-disabled'));
      
      if (!isDisabled && !hasDisabledClass) {
        console.log('✅ 方法3成功: 键盘输入有效');
        
        // 发送消息
        await sendButton.click();
        console.log('✅ 消息已发送');
        
        // 等待响应
        await page.waitForTimeout(10000);
        
        const response = await checkAIResponse(page);
        if (response.hasResponse) {
          console.log(`✅ 收到AI响应: "${response.content}"`);
          return { success: true, method: '方法3: 键盘输入' };
        }
      } else {
        console.log('❌ 方法3失败: 键盘输入无效');
      }
      
    } catch (error) {
      console.log(`❌ 方法3异常: ${error.message}`);
    }
    
    console.log('\n🧪 方法4: 使用快速问题按钮');
    
    try {
      // 查找快速问题按钮
      const quickButtons = await page.locator('.quick-questions .el-button').all();
      
      if (quickButtons.length > 0) {
        console.log(`发现 ${quickButtons.length} 个快速问题按钮`);
        
        // 点击第一个快速问题
        const firstButton = quickButtons[0];
        const buttonText = await firstButton.textContent();
        
        console.log(`点击快速问题: "${buttonText}"`);
        await firstButton.click();
        
        // 等待响应
        await page.waitForTimeout(10000);
        
        const response = await checkAIResponse(page);
        if (response.hasResponse) {
          console.log(`✅ 收到AI响应: "${response.content}"`);
          return { success: true, method: '方法4: 快速问题按钮' };
        } else {
          console.log('⚠️ 快速问题发送成功但未收到响应');
        }
      } else {
        console.log('❌ 未找到快速问题按钮');
      }
      
    } catch (error) {
      console.log(`❌ 方法4异常: ${error.message}`);
    }
    
    console.log('\n=== 步骤3：诊断根本问题 ===');
    
    // 检查网络请求
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/ai')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 检查控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 再次尝试发送消息并监控
    console.log('🔍 监控网络请求和错误...');
    
    await page.locator('textarea.el-textarea__inner').clear();
    await page.locator('textarea.el-textarea__inner').fill('诊断测试消息');
    await page.waitForTimeout(1000);
    
    const sendButton = page.locator('button.send-button');
    const canClick = await sendButton.isEnabled();
    
    if (canClick) {
      await sendButton.click();
      console.log('✅ 发送按钮可点击，消息已发送');
      
      // 等待网络请求
      await page.waitForTimeout(5000);
      
      console.log(`网络请求数量: ${networkRequests.length}`);
      networkRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url}`);
      });
      
      console.log(`控制台错误数量: ${consoleErrors.length}`);
      consoleErrors.slice(0, 3).forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
      
    } else {
      console.log('❌ 发送按钮仍然无法点击');
    }
    
    return { success: false, method: '所有方法均失败' };
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    return { success: false, error: error.message };
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ 前端AI助手输入框修复测试完成！');
  }
}

// 检查AI响应的辅助函数
async function checkAIResponse(page) {
  try {
    const response = await page.evaluate(() => {
      const responseSelectors = [
        '.ai-message .message-content',
        '.assistant-message .message-content',
        '.message.assistant .message-content',
        '.message-item.ai-message .message-content'
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
    
    return response;
  } catch (error) {
    return { hasResponse: false, content: null, error: error.message };
  }
}

// 如果直接运行此文件
if (require.main === module) {
  fixFrontendAIInput().then(result => {
    console.log('\n🎯 修复结果:', result);
  }).catch(console.error);
}

module.exports = { fixFrontendAIInput };
