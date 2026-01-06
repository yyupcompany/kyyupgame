const { chromium } = require('playwright');

async function debugMessageDisplay() {
  console.log('🔍 开始调试消息显示问题...');
  
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
    } else if (text.includes('消息') || text.includes('message') || text.includes('chat')) {
      console.log('📝 相关日志:', text);
    }
  });
  
  try {
    console.log('\n=== 步骤1：登录并打开AI助手 ===');
    
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
    
    // 打开AI助手
    const aiButton = page.locator('button:has-text("YY-AI")').first();
    await aiButton.click();
    await page.waitForTimeout(3000);
    
    console.log('\n=== 步骤2：检查AI助手结构 ===');
    
    // 检查主要容器
    const containers = [
      '.ai-assistant',
      '.chat-container', 
      '.message-list',
      '.chat-input-area'
    ];
    
    for (const selector of containers) {
      const count = await page.locator(selector).count();
      const visible = count > 0 ? await page.locator(selector).first().isVisible() : false;
      console.log(`📦 ${selector}: ${count}个, 可见: ${visible ? '✅' : '❌'}`);
    }
    
    console.log('\n=== 步骤3：发送消息前检查 ===');
    
    // 检查消息列表初始状态
    const initialMessages = await page.locator('.message-item').count();
    console.log(`📋 初始消息数量: ${initialMessages}`);
    
    // 检查输入框
    const inputBox = page.locator('textarea, input[type="text"]').last();
    const inputVisible = await inputBox.isVisible();
    console.log(`📝 输入框可见: ${inputVisible ? '✅' : '❌'}`);
    
    if (inputVisible) {
      console.log('\n=== 步骤4：发送测试消息 ===');
      
      const testMessage = 'test message';
      console.log(`📝 发送消息: "${testMessage}"`);
      
      await inputBox.fill(testMessage);
      await page.waitForTimeout(1000);
      
      // 检查输入框内容
      const inputValue = await inputBox.inputValue();
      console.log(`📝 输入框内容: "${inputValue}"`);
      
      // 发送消息
      await inputBox.press('Enter');
      console.log('✅ 消息已发送');
      
      // 立即检查消息数量变化
      await page.waitForTimeout(1000);
      const afterSendMessages = await page.locator('.message-item').count();
      console.log(`📋 发送后消息数量: ${afterSendMessages}`);
      
      // 等待AI响应
      console.log('⏳ 等待AI响应...');
      await page.waitForTimeout(8000);
      
      const finalMessages = await page.locator('.message-item').count();
      console.log(`📋 最终消息数量: ${finalMessages}`);
      
      console.log('\n=== 步骤5：详细检查DOM结构 ===');
      
      // 检查消息列表容器
      const messageListHTML = await page.locator('.message-list').innerHTML().catch(() => '未找到');
      console.log(`📋 消息列表HTML长度: ${messageListHTML.length}`);
      
      // 检查是否有隐藏的消息
      const allMessageItems = await page.locator('.message-item').all();
      console.log(`📋 所有消息项: ${allMessageItems.length}个`);
      
      for (let i = 0; i < allMessageItems.length; i++) {
        const item = allMessageItems[i];
        const isVisible = await item.isVisible();
        const text = await item.textContent();
        console.log(`  消息${i + 1}: 可见=${isVisible}, 内容="${text?.substring(0, 50)}..."`);
      }
      
      // 检查当前AI响应
      const currentResponse = await page.locator('.current-response').count();
      console.log(`🤖 当前AI响应: ${currentResponse}个`);
      
      if (currentResponse > 0) {
        const responseVisible = await page.locator('.current-response').first().isVisible();
        const responseText = await page.locator('.current-response').first().textContent();
        console.log(`🤖 AI响应可见: ${responseVisible}`);
        console.log(`🤖 AI响应内容: "${responseText?.substring(0, 100)}..."`);
      }
      
      // 检查Vue组件状态
      console.log('\n=== 步骤6：检查Vue组件状态 ===');
      
      const vueData = await page.evaluate(() => {
        const app = document.querySelector('#app');
        if (app && app.__vue__) {
          return {
            hasVue: true,
            componentCount: document.querySelectorAll('[data-v-]').length
          };
        }
        return { hasVue: false, componentCount: 0 };
      });
      
      console.log(`🔧 Vue状态:`, vueData);
      
      // 检查Element Plus组件
      const elComponents = await page.locator('[class*="el-"]').count();
      console.log(`🎨 Element Plus组件: ${elComponents}个`);
      
    } else {
      console.log('❌ 输入框不可见，无法发送消息');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ 消息显示调试完成！');
  }
}

debugMessageDisplay().catch(console.error);
