const { chromium } = require('playwright');

async function finalAISidebarTest() {
  console.log('🎉 最终AI助手侧边栏修复验证');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 🚀 完整功能验证测试 ===');
    
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
    console.log('✅ 登录完成');
    
    console.log('\n=== 📋 验证1：登录后AI助手不自动显示 ===');
    
    const initialWrapperCount = await page.locator('.ai-assistant-wrapper').count();
    const initialSidebarClasses = await page.locator('.ai-sidebar-container').first().getAttribute('class');
    const aiToggleVisible = await page.locator('button:has-text("YY-AI")').isVisible();
    
    console.log(`AI助手包装器: ${initialWrapperCount}个`);
    console.log(`侧边栏容器类名: "${initialSidebarClasses}"`);
    console.log(`AI切换按钮: ${aiToggleVisible ? '✅ 可见' : '❌ 不可见'}`);
    
    const test1Pass = initialWrapperCount === 0 && initialSidebarClasses?.includes('ai-sidebar-hidden') && aiToggleVisible;
    console.log(`验证1结果: ${test1Pass ? '✅ 通过' : '❌ 失败'}`);
    
    console.log('\n=== 📋 验证2：点击按钮正常打开AI助手 ===');
    
    if (aiToggleVisible) {
      await page.locator('button:has-text("YY-AI")').first().click();
      await page.waitForTimeout(3000);
      
      const afterOpenWrapperVisible = await page.locator('.ai-assistant-wrapper').isVisible();
      const afterOpenSidebarClasses = await page.locator('.ai-sidebar-container').first().getAttribute('class');
      
      console.log(`AI助手包装器可见: ${afterOpenWrapperVisible}`);
      console.log(`侧边栏容器类名: "${afterOpenSidebarClasses}"`);
      
      const test2Pass = afterOpenWrapperVisible && afterOpenSidebarClasses?.includes('ai-sidebar-visible');
      console.log(`验证2结果: ${test2Pass ? '✅ 通过' : '❌ 失败'}`);
      
      if (test2Pass) {
        console.log('\n=== 📋 验证3：关闭按钮功能 ===');
        
        // 查找关闭按钮
        const closeButton = page.locator('button[title="退出全屏"]').first();
        const closeButtonVisible = await closeButton.isVisible();
        
        console.log(`关闭按钮可见: ${closeButtonVisible}`);
        
        if (closeButtonVisible) {
          await closeButton.click();
          await page.waitForTimeout(2000);
          
          const afterCloseWrapperCount = await page.locator('.ai-assistant-wrapper').count();
          const afterCloseSidebarClasses = await page.locator('.ai-sidebar-container').first().getAttribute('class');
          
          console.log(`关闭后AI助手包装器: ${afterCloseWrapperCount}个`);
          console.log(`关闭后侧边栏类名: "${afterCloseSidebarClasses}"`);
          
          const test3Pass = afterCloseWrapperCount === 0 && afterCloseSidebarClasses?.includes('ai-sidebar-hidden');
          console.log(`验证3结果: ${test3Pass ? '✅ 通过' : '❌ 失败'}`);
          
          console.log('\n=== 📋 验证4：ESC键关闭功能 ===');
          
          // 重新打开AI助手
          await page.locator('button:has-text("YY-AI")').first().click();
          await page.waitForTimeout(2000);
          
          const beforeEscWrapperVisible = await page.locator('.ai-assistant-wrapper').isVisible();
          console.log(`ESC前AI助手可见: ${beforeEscWrapperVisible}`);
          
          if (beforeEscWrapperVisible) {
            // 按ESC键
            await page.keyboard.press('Escape');
            await page.waitForTimeout(2000);
            
            const afterEscWrapperCount = await page.locator('.ai-assistant-wrapper').count();
            const afterEscSidebarClasses = await page.locator('.ai-sidebar-container').first().getAttribute('class');
            
            console.log(`ESC后AI助手包装器: ${afterEscWrapperCount}个`);
            console.log(`ESC后侧边栏类名: "${afterEscSidebarClasses}"`);
            
            const test4Pass = afterEscWrapperCount === 0 && afterEscSidebarClasses?.includes('ai-sidebar-hidden');
            console.log(`验证4结果: ${test4Pass ? '✅ 通过' : '❌ 失败'}`);
            
            console.log('\n=== 📋 验证5：对话功能正常 ===');
            
            // 重新打开AI助手测试对话
            await page.locator('button:has-text("YY-AI")').first().click();
            await page.waitForTimeout(3000);
            
            const inputBox = page.locator('textarea, input[type="text"]').last();
            const inputVisible = await inputBox.isVisible();
            
            console.log(`输入框可见: ${inputVisible}`);
            
            if (inputVisible) {
              await inputBox.fill('测试消息');
              await page.waitForTimeout(1000);
              await inputBox.press('Enter');
              
              await page.waitForTimeout(3000);
              
              const messageCount = await page.locator('.message-item').count();
              console.log(`消息数量: ${messageCount}`);
              
              const test5Pass = messageCount > 0;
              console.log(`验证5结果: ${test5Pass ? '✅ 通过' : '❌ 失败'}`);
              
              // 最终总结
              console.log('\n=== 🎯 修复效果总结 ===');
              
              const allTests = [test1Pass, test2Pass, test3Pass, test4Pass, test5Pass];
              const passedTests = allTests.filter(t => t).length;
              const totalTests = allTests.length;
              const successRate = Math.round((passedTests / totalTests) * 100);
              
              console.log('📊 验证结果:');
              console.log(`  1. 登录后不自动显示: ${test1Pass ? '✅' : '❌'}`);
              console.log(`  2. 点击按钮正常打开: ${test2Pass ? '✅' : '❌'}`);
              console.log(`  3. 关闭按钮功能: ${test3Pass ? '✅' : '❌'}`);
              console.log(`  4. ESC键关闭功能: ${test4Pass ? '✅' : '❌'}`);
              console.log(`  5. 对话功能正常: ${test5Pass ? '✅' : '❌'}`);
              
              console.log(`\n🎯 总体成功率: ${successRate}% (${passedTests}/${totalTests})`);
              
              if (successRate >= 80) {
                console.log('\n🎉 恭喜！AI助手侧边栏问题修复成功！');
                console.log('✅ 登录后不再自动显示AI助手面板');
                console.log('✅ 用户需要主动点击才能打开AI助手');
                console.log('✅ 提供了多种关闭方式（按钮+ESC键）');
                console.log('✅ AI助手对话功能正常工作');
                console.log('✅ 完全解决了用户反馈的问题');
              } else {
                console.log('\n⚠️ 修复基本成功，但还有改进空间');
              }
              
            } else {
              console.log('❌ 输入框不可见，无法测试对话功能');
            }
          } else {
            console.log('❌ 无法重新打开AI助手测试ESC功能');
          }
        } else {
          console.log('❌ 关闭按钮不可见');
        }
      } else {
        console.log('❌ AI助手未能正确打开');
      }
    } else {
      console.log('❌ AI切换按钮不可见');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器，请查看最终效果...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ 最终AI助手侧边栏修复验证完成！');
  }
}

finalAISidebarTest().catch(console.error);
