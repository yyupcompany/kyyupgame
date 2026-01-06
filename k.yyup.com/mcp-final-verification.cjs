const { chromium } = require('playwright');

async function mcpFinalVerification() {
  console.log('🔍 MCP最终复查：AI助手侧边栏状态');
  
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
    if (text.includes('AI') || text.includes('助手') || text.includes('sidebar') || text.includes('侧边栏')) {
      console.log(`📝 相关日志[${type}]: ${text}`);
    }
  });
  
  try {
    console.log('\n=== 🔍 步骤1：登录前状态检查 ===');
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 登录前检查
    const preLoginAI = await page.locator('[class*="ai"], [class*="AI"], [class*="assistant"]').all();
    console.log(`登录前AI相关元素: ${preLoginAI.length}个`);
    
    console.log('\n=== 🔍 步骤2：执行登录 ===');
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(5000);
    console.log('✅ 登录完成');
    
    console.log('\n=== 🔍 步骤3：详细检查所有AI相关元素 ===');
    
    // 检查所有可能的AI助手相关元素
    const aiSelectors = [
      '.ai-assistant-wrapper',
      '.ai-assistant',
      '.ai-sidebar-container', 
      '.ai-panel',
      '[class*="ai-assistant"]',
      '[class*="ai-sidebar"]',
      '[class*="ai-panel"]',
      'button:has-text("YY-AI")',
      'button:has-text("AI助手")',
      'button:has-text("AI")',
      '.el-drawer',
      '[class*="drawer"]'
    ];
    
    console.log('🔍 逐一检查AI相关选择器:');
    
    for (const selector of aiSelectors) {
      try {
        const elements = await page.locator(selector).all();
        
        if (elements.length > 0) {
          console.log(`\n📋 发现 ${selector}: ${elements.length}个`);
          
          for (let i = 0; i < Math.min(elements.length, 2); i++) {
            const element = elements[i];
            const isVisible = await element.isVisible();
            const className = await element.getAttribute('class') || '';
            const id = await element.getAttribute('id') || '';
            const boundingBox = await element.boundingBox();
            const text = await element.textContent();
            
            console.log(`  ${selector}[${i}]:`);
            console.log(`    - 可见: ${isVisible ? '⚠️ 是' : '✅ 否'}`);
            console.log(`    - class: "${className}"`);
            console.log(`    - id: "${id}"`);
            
            if (boundingBox) {
              console.log(`    - 位置: x:${Math.round(boundingBox.x)}, y:${Math.round(boundingBox.y)}, w:${Math.round(boundingBox.width)}, h:${Math.round(boundingBox.height)}`);
              
              // 检查是否在可视区域内
              const inViewport = boundingBox.x >= 0 && boundingBox.y >= 0 && 
                               boundingBox.x < 1280 && boundingBox.y < 720;
              console.log(`    - 在视口内: ${inViewport ? '⚠️ 是' : '✅ 否'}`);
            } else {
              console.log(`    - 位置: 无边界框`);
            }
            
            if (text && text.trim()) {
              console.log(`    - 内容: "${text.trim().substring(0, 50)}..."`);
              
              // 检查是否包含AI助手相关内容
              if (text.includes('AI') || text.includes('助手') || text.includes('YY-AI')) {
                console.log(`    - ⚠️ 包含AI助手相关内容！`);
              }
            }
            
            // 特别检查是否有自动显示的问题
            if (isVisible && (className.includes('ai-assistant') || className.includes('ai-panel'))) {
              console.log(`    - 🚨 警告：AI助手相关元素自动可见！`);
            }
          }
        }
      } catch (error) {
        console.log(`❌ 检查 ${selector} 时出错: ${error.message}`);
      }
    }
    
    console.log('\n=== 🔍 步骤4：检查页面布局结构 ===');
    
    // 检查整体布局
    const layoutInfo = await page.evaluate(() => {
      const body = document.body;
      const app = document.querySelector('#app');
      
      // 查找所有可能占用空间的AI元素
      const aiElements = [];
      const selectors = [
        '[class*="ai"]',
        '[class*="AI"]', 
        '[class*="assistant"]',
        '[class*="sidebar"]'
      ];
      
      selectors.forEach(sel => {
        const elements = document.querySelectorAll(sel);
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            aiElements.push({
              selector: sel,
              className: el.className,
              id: el.id,
              rect: {
                x: Math.round(rect.x),
                y: Math.round(rect.y), 
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              visible: rect.width > 0 && rect.height > 0,
              inViewport: rect.x >= 0 && rect.y >= 0 && rect.x < window.innerWidth && rect.y < window.innerHeight
            });
          }
        });
      });
      
      return {
        bodySize: {
          width: body.offsetWidth,
          height: body.offsetHeight
        },
        appSize: app ? {
          width: app.offsetWidth,
          height: app.offsetHeight
        } : null,
        aiElements,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });
    
    console.log('🏗️ 页面布局分析:');
    console.log(`  - 视口大小: ${layoutInfo.viewport.width}x${layoutInfo.viewport.height}`);
    console.log(`  - Body大小: ${layoutInfo.bodySize.width}x${layoutInfo.bodySize.height}`);
    if (layoutInfo.appSize) {
      console.log(`  - App大小: ${layoutInfo.appSize.width}x${layoutInfo.appSize.height}`);
    }
    
    console.log(`\n📋 占用空间的AI相关元素: ${layoutInfo.aiElements.length}个`);
    
    let hasVisibleAIElements = false;
    layoutInfo.aiElements.forEach((el, i) => {
      if (el.visible && el.inViewport) {
        hasVisibleAIElements = true;
        console.log(`  ⚠️ 元素${i + 1}: ${el.className}`);
        console.log(`    - 位置: ${el.rect.x}, ${el.rect.y}`);
        console.log(`    - 大小: ${el.rect.width}x${el.rect.height}`);
      }
    });
    
    if (!hasVisibleAIElements) {
      console.log('  ✅ 没有发现可见的AI相关元素占用空间');
    }
    
    console.log('\n=== 🔍 步骤5：检查用户实际看到的内容 ===');
    
    // 截图分析（检查右侧是否有内容）
    const screenshot = await page.screenshot({ fullPage: false });
    
    // 检查右侧区域是否有内容
    const rightSideContent = await page.evaluate(() => {
      const rightSide = document.elementFromPoint(1200, 360); // 右侧中间位置
      if (rightSide) {
        return {
          tagName: rightSide.tagName,
          className: rightSide.className,
          id: rightSide.id,
          text: rightSide.textContent?.substring(0, 100)
        };
      }
      return null;
    });
    
    console.log('👁️ 用户视角检查:');
    if (rightSideContent) {
      console.log(`  - 右侧内容: ${rightSideContent.tagName}.${rightSideContent.className}`);
      if (rightSideContent.text && rightSideContent.text.trim()) {
        console.log(`  - 右侧文本: "${rightSideContent.text.trim()}"`);
      }
      
      if (rightSideContent.className.includes('ai') || rightSideContent.text?.includes('AI')) {
        console.log(`  - 🚨 右侧发现AI相关内容！`);
      } else {
        console.log(`  - ✅ 右侧没有AI相关内容`);
      }
    } else {
      console.log(`  - ✅ 右侧区域为空`);
    }
    
    console.log('\n=== 🎯 最终复查结果 ===');
    
    // 总结检查结果
    const issues = [];
    
    if (hasVisibleAIElements) {
      issues.push('发现可见的AI相关元素占用空间');
    }
    
    if (rightSideContent && (rightSideContent.className.includes('ai') || rightSideContent.text?.includes('AI'))) {
      issues.push('右侧区域发现AI相关内容');
    }
    
    console.log('📊 复查总结:');
    if (issues.length === 0) {
      console.log('🎉 恭喜！没有发现任何AI助手自动显示的问题');
      console.log('✅ 登录后AI助手完全隐藏');
      console.log('✅ 没有占用额外空间');
      console.log('✅ 用户界面干净整洁');
    } else {
      console.log('⚠️ 发现以下问题:');
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
    
    // 测试AI助手开关功能
    console.log('\n=== 🔍 步骤6：验证AI助手开关功能 ===');
    
    const aiToggleButton = page.locator('button:has-text("YY-AI")').first();
    const toggleVisible = await aiToggleButton.isVisible();
    
    console.log(`AI切换按钮可见: ${toggleVisible ? '✅ 是' : '❌ 否'}`);
    
    if (toggleVisible) {
      console.log('📝 测试打开AI助手...');
      await aiToggleButton.click();
      await page.waitForTimeout(3000);
      
      const afterOpenVisible = await page.locator('.ai-assistant-wrapper').isVisible();
      console.log(`打开后AI助手可见: ${afterOpenVisible ? '✅ 是' : '❌ 否'}`);
      
      if (afterOpenVisible) {
        console.log('📝 测试关闭AI助手...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(2000);
        
        const afterCloseVisible = await page.locator('.ai-assistant-wrapper').isVisible();
        console.log(`关闭后AI助手可见: ${afterCloseVisible ? '❌ 是' : '✅ 否'}`);
        
        if (!afterCloseVisible) {
          console.log('✅ AI助手开关功能正常');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 复查过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器，请仔细查看当前状态...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ MCP最终复查完成！');
  }
}

mcpFinalVerification().catch(console.error);
