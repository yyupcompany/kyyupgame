const { chromium } = require('playwright');

async function checkLocalStorageAI() {
  console.log('🔍 检查localStorage中的AI助手状态');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 步骤1：登录前检查localStorage ===');
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 检查登录前的localStorage
    const preLoginStorage = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('ai')) {
          storage[key] = localStorage.getItem(key);
        }
      }
      return storage;
    });
    
    console.log('📋 登录前AI相关localStorage:');
    Object.entries(preLoginStorage).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    console.log('\n=== 步骤2：执行登录 ===');
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(5000);
    console.log('✅ 登录完成');
    
    console.log('\n=== 步骤3：登录后检查localStorage ===');
    
    // 检查登录后的localStorage
    const postLoginStorage = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('ai') || key.includes('AI'))) {
          storage[key] = localStorage.getItem(key);
        }
      }
      return storage;
    });
    
    console.log('📋 登录后AI相关localStorage:');
    Object.entries(postLoginStorage).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // 检查关键的AI状态
    const aiPanelVisible = await page.evaluate(() => localStorage.getItem('ai-panel-visible'));
    const aiFullscreen = await page.evaluate(() => localStorage.getItem('ai-fullscreen'));
    const aiPanelWidth = await page.evaluate(() => localStorage.getItem('ai-panel-width'));
    
    console.log('\n=== 🎯 关键AI状态分析 ===');
    console.log(`AI面板可见: ${aiPanelVisible}`);
    console.log(`AI全屏模式: ${aiFullscreen}`);
    console.log(`AI面板宽度: ${aiPanelWidth}`);
    
    // 检查AI助手是否自动显示
    const aiAssistantVisible = await page.locator('.ai-assistant-wrapper').isVisible();
    const aiToggleButton = await page.locator('button:has-text("YY-AI")').isVisible();
    
    console.log('\n=== 🤖 AI助手显示状态 ===');
    console.log(`AI助手包装器可见: ${aiAssistantVisible}`);
    console.log(`AI切换按钮可见: ${aiToggleButton}`);
    
    if (aiPanelVisible === 'true') {
      console.log('\n⚠️ 发现问题：localStorage中ai-panel-visible为true');
      console.log('这导致登录后AI助手自动显示');
      
      console.log('\n=== 步骤4：清除AI状态并测试 ===');
      
      // 清除AI相关的localStorage
      await page.evaluate(() => {
        localStorage.removeItem('ai-panel-visible');
        localStorage.removeItem('ai-fullscreen');
        localStorage.removeItem('ai-panel-width');
        console.log('已清除AI相关localStorage');
      });
      
      // 刷新页面测试
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // 重新登录
      await page.locator('input[type="text"]').first().fill('admin');
      await page.locator('input[type="password"]').first().fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      
      await page.waitForTimeout(5000);
      
      // 检查清除后的状态
      const afterClearVisible = await page.locator('.ai-assistant-wrapper').isVisible();
      console.log(`清除localStorage后AI助手可见: ${afterClearVisible}`);
      
      if (!afterClearVisible) {
        console.log('✅ 确认：清除localStorage后AI助手不再自动显示');
      } else {
        console.log('⚠️ 警告：清除localStorage后AI助手仍然自动显示，可能有其他原因');
      }
    } else {
      console.log('✅ localStorage中ai-panel-visible不为true，不是localStorage导致的问题');
    }
    
    console.log('\n=== 📋 解决方案建议 ===');
    
    if (aiPanelVisible === 'true') {
      console.log('🔧 解决方案1：修改初始化逻辑，默认不显示AI助手');
      console.log('🔧 解决方案2：添加用户偏好设置，让用户选择是否自动显示');
      console.log('🔧 解决方案3：只在用户主动点击时才显示AI助手');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ localStorage AI状态检查完成！');
  }
}

checkLocalStorageAI().catch(console.error);
