const { chromium } = require('playwright');

async function mcpRightSidebarDebug() {
  console.log('🔍 MCP调试：登录后右侧侧边栏显示问题');
  
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
    console.log('\n=== 步骤1：登录前检查 ===');
    
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 登录前检查右侧是否有内容
    const preLoginRightSide = await page.evaluate(() => {
      const rightElements = [];
      
      // 检查右侧区域（假设屏幕宽度1280，右侧从1000px开始）
      for (let x = 1000; x < 1280; x += 50) {
        for (let y = 100; y < 600; y += 100) {
          const element = document.elementFromPoint(x, y);
          if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
            const rect = element.getBoundingClientRect();
            if (rect.right > 1000) { // 确实在右侧
              rightElements.push({
                tagName: element.tagName,
                className: element.className,
                id: element.id,
                position: { x: Math.round(rect.x), y: Math.round(rect.y) },
                size: { width: Math.round(rect.width), height: Math.round(rect.height) },
                text: element.textContent?.substring(0, 50)
              });
            }
          }
        }
      }
      
      return rightElements;
    });
    
    console.log(`登录前右侧元素: ${preLoginRightSide.length}个`);
    preLoginRightSide.slice(0, 3).forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName}.${el.className} - ${el.size.width}x${el.size.height}`);
    });
    
    console.log('\n=== 步骤2：执行登录 ===');
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(5000);
    console.log('✅ 登录完成');
    
    console.log('\n=== 步骤3：登录后详细检查右侧区域 ===');
    
    // 检查所有可能的右侧侧边栏元素
    const rightSidebarSelectors = [
      '.ai-assistant-wrapper',
      '.ai-sidebar-container',
      '.ai-panel',
      '.right-sidebar',
      '.sidebar-right',
      '[class*="ai-assistant"]',
      '[class*="ai-sidebar"]',
      '[class*="right-sidebar"]',
      '.el-drawer',
      '[class*="drawer"]'
    ];
    
    console.log('🔍 检查右侧侧边栏选择器:');
    
    for (const selector of rightSidebarSelectors) {
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
            
            console.log(`  ${selector}[${i}]:`);
            console.log(`    - 可见: ${isVisible ? '⚠️ 是' : '✅ 否'}`);
            console.log(`    - class: "${className}"`);
            console.log(`    - id: "${id}"`);
            
            if (boundingBox) {
              const isOnRightSide = boundingBox.x > 800; // 右侧区域
              console.log(`    - 位置: x:${Math.round(boundingBox.x)}, y:${Math.round(boundingBox.y)}`);
              console.log(`    - 大小: ${Math.round(boundingBox.width)}x${Math.round(boundingBox.height)}`);
              console.log(`    - 在右侧: ${isOnRightSide ? '⚠️ 是' : '✅ 否'}`);
              
              if (isVisible && isOnRightSide) {
                console.log(`    - 🚨 警告：右侧发现可见的AI相关元素！`);
              }
            }
          }
        }
      } catch (error) {
        console.log(`❌ 检查 ${selector} 时出错: ${error.message}`);
      }
    }
    
    console.log('\n=== 步骤4：检查右侧区域内容 ===');
    
    // 详细检查右侧区域的所有内容
    const rightSideContent = await page.evaluate(() => {
      const rightElements = [];
      const screenWidth = window.innerWidth;
      const rightBoundary = screenWidth * 0.7; // 右侧30%区域
      
      // 查找所有在右侧的元素
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        
        // 检查是否在右侧区域且可见
        if (rect.left > rightBoundary && rect.width > 10 && rect.height > 10) {
          const styles = getComputedStyle(element);
          
          rightElements.push({
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            position: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            styles: {
              position: styles.position,
              display: styles.display,
              visibility: styles.visibility,
              opacity: styles.opacity,
              zIndex: styles.zIndex
            },
            text: element.textContent?.trim().substring(0, 30),
            isAIRelated: element.className.includes('ai') || 
                        element.className.includes('AI') || 
                        element.className.includes('assistant') ||
                        element.textContent?.includes('AI') ||
                        element.textContent?.includes('助手')
          });
        }
      });
      
      return {
        screenWidth,
        rightBoundary,
        rightElements: rightElements.slice(0, 10) // 限制数量
      };
    });
    
    console.log(`🖥️ 屏幕宽度: ${rightSideContent.screenWidth}px`);
    console.log(`📏 右侧边界: ${rightSideContent.rightBoundary}px`);
    console.log(`📋 右侧元素: ${rightSideContent.rightElements.length}个`);
    
    let aiRelatedCount = 0;
    rightSideContent.rightElements.forEach((el, i) => {
      console.log(`\n  元素${i + 1}: ${el.tagName}.${el.className}`);
      console.log(`    - 位置: ${el.position.x}, ${el.position.y}`);
      console.log(`    - 大小: ${el.position.width}x${el.position.height}`);
      console.log(`    - display: ${el.styles.display}`);
      console.log(`    - visibility: ${el.styles.visibility}`);
      
      if (el.text) {
        console.log(`    - 内容: "${el.text}..."`);
      }
      
      if (el.isAIRelated) {
        aiRelatedCount++;
        console.log(`    - 🚨 AI相关元素！`);
      }
    });
    
    console.log(`\n⚠️ 右侧AI相关元素: ${aiRelatedCount}个`);
    
    console.log('\n=== 步骤5：检查AI助手状态管理 ===');
    
    // 检查AI助手的状态
    const aiStoreState = await page.evaluate(() => {
      // 尝试访问Vue的store状态
      const app = document.querySelector('#app');
      if (app && app.__vue__) {
        try {
          // 这里可能需要根据实际的store结构调整
          return {
            hasVueApp: true,
            // 注意：实际的store访问方式可能不同
            storeAvailable: false
          };
        } catch (e) {
          return { hasVueApp: true, error: e.message };
        }
      }
      return { hasVueApp: false };
    });
    
    console.log('🔧 Vue应用状态:', aiStoreState);
    
    console.log('\n=== 步骤6：检查localStorage中的AI状态 ===');
    
    const aiLocalStorage = await page.evaluate(() => {
      const aiKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('ai') || key.includes('AI') || key.includes('assistant'))) {
          aiKeys.push({
            key,
            value: localStorage.getItem(key)
          });
        }
      }
      return aiKeys;
    });
    
    console.log('💾 AI相关localStorage:');
    aiLocalStorage.forEach(item => {
      console.log(`  - ${item.key}: ${item.value}`);
    });
    
    console.log('\n=== 步骤7：测试AI助手开关 ===');
    
    // 查找AI助手切换按钮
    const aiToggleButton = page.locator('button:has-text("YY-AI")').first();
    const toggleVisible = await aiToggleButton.isVisible();
    
    console.log(`AI切换按钮可见: ${toggleVisible ? '✅ 是' : '❌ 否'}`);
    
    if (toggleVisible) {
      console.log('📝 点击AI助手按钮...');
      await aiToggleButton.click();
      await page.waitForTimeout(3000);
      
      // 检查点击后右侧的变化
      const afterClickRightSide = await page.evaluate(() => {
        const rightElements = [];
        const screenWidth = window.innerWidth;
        const rightBoundary = screenWidth * 0.7;
        
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          
          if (rect.left > rightBoundary && rect.width > 50 && rect.height > 50) {
            rightElements.push({
              className: element.className,
              position: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              isAIRelated: element.className.includes('ai') || 
                          element.className.includes('assistant')
            });
          }
        });
        
        return rightElements.slice(0, 5);
      });
      
      console.log(`点击后右侧元素: ${afterClickRightSide.length}个`);
      afterClickRightSide.forEach((el, i) => {
        console.log(`  ${i + 1}. ${el.className} - ${el.position.width}x${el.position.height} ${el.isAIRelated ? '(AI相关)' : ''}`);
      });
      
      // 尝试关闭AI助手
      console.log('📝 尝试关闭AI助手...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);
      
      const afterCloseRightSide = await page.evaluate(() => {
        const rightElements = [];
        const screenWidth = window.innerWidth;
        const rightBoundary = screenWidth * 0.7;
        
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          
          if (rect.left > rightBoundary && rect.width > 50 && rect.height > 50) {
            const isAIRelated = element.className.includes('ai') || 
                               element.className.includes('assistant');
            if (isAIRelated) {
              rightElements.push({
                className: element.className,
                position: {
                  x: Math.round(rect.x),
                  y: Math.round(rect.y),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height)
                }
              });
            }
          }
        });
        
        return rightElements;
      });
      
      console.log(`关闭后右侧AI元素: ${afterCloseRightSide.length}个`);
      if (afterCloseRightSide.length > 0) {
        console.log('⚠️ 关闭后仍有AI元素在右侧！');
        afterCloseRightSide.forEach((el, i) => {
          console.log(`  ${i + 1}. ${el.className} - ${el.position.width}x${el.position.height}`);
        });
      } else {
        console.log('✅ 关闭后右侧AI元素已清除');
      }
    }
    
    console.log('\n=== 🎯 问题诊断结果 ===');
    
    const hasRightSidebarIssue = aiRelatedCount > 0 || rightSideContent.rightElements.length > 5;
    
    if (hasRightSidebarIssue) {
      console.log('⚠️ 发现右侧侧边栏问题:');
      console.log(`  1. 右侧发现 ${aiRelatedCount} 个AI相关元素`);
      console.log(`  2. 右侧总共有 ${rightSideContent.rightElements.length} 个元素`);
      console.log('\n💡 建议检查:');
      console.log('  1. AI助手组件的默认可见性设置');
      console.log('  2. MainLayout中AI助手的初始化逻辑');
      console.log('  3. AI助手store的默认状态');
      console.log('  4. CSS中可能的自动显示样式');
    } else {
      console.log('✅ 右侧侧边栏状态正常');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器，请仔细观察右侧区域...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ 右侧侧边栏调试完成！');
  }
}

mcpRightSidebarDebug().catch(console.error);
