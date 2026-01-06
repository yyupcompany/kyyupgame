const { chromium } = require('playwright');

async function debugGlobalLayout() {
  console.log('🌐 调试全局布局影响');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 步骤1：登录前检查全局布局 ===');
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    const beforeLogin = await page.evaluate(() => {
      return {
        allFixedElements: Array.from(document.querySelectorAll('*')).filter(el => {
          const style = window.getComputedStyle(el);
          return style.position === 'fixed';
        }).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          rect: el.getBoundingClientRect(),
          zIndex: window.getComputedStyle(el).zIndex
        })),
        
        bodyChildren: Array.from(document.body.children).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          rect: el.getBoundingClientRect(),
          position: window.getComputedStyle(el).position
        }))
      };
    });
    
    console.log('登录前的固定定位元素:');
    beforeLogin.allFixedElements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName}.${el.className}#${el.id}: ${el.rect.width}x${el.rect.height} (${el.rect.x}, ${el.rect.y}) z:${el.zIndex}`);
    });
    
    console.log('\n=== 步骤2：登录并检查主应用布局 ===');
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    
    const afterLogin = await page.evaluate(() => {
      return {
        // 主应用容器
        appContainer: (() => {
          const app = document.querySelector('#app');
          if (!app) return null;
          const rect = app.getBoundingClientRect();
          const style = window.getComputedStyle(app);
          return {
            rect,
            position: style.position,
            display: style.display,
            overflow: style.overflow,
            margin: style.margin,
            padding: style.padding
          };
        })(),
        
        // 主布局容器
        mainLayout: (() => {
          const layout = document.querySelector('.layout-container, .main-layout, .app-layout');
          if (!layout) return null;
          const rect = layout.getBoundingClientRect();
          const style = window.getComputedStyle(layout);
          return {
            rect,
            position: style.position,
            display: style.display,
            className: layout.className
          };
        })(),
        
        // 侧边栏
        sidebar: (() => {
          const sidebar = document.querySelector('.sidebar, .nav-sidebar, .main-sidebar, .layout-sidebar');
          if (!sidebar) return null;
          const rect = sidebar.getBoundingClientRect();
          const style = window.getComputedStyle(sidebar);
          return {
            rect,
            position: style.position,
            display: style.display,
            className: sidebar.className,
            zIndex: style.zIndex
          };
        })(),
        
        // 所有可能影响布局的元素
        layoutElements: Array.from(document.querySelectorAll('*')).filter(el => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return (style.position === 'fixed' || style.position === 'absolute') &&
                 rect.width > 200 && rect.height > 200 &&
                 rect.x <= 300 && rect.y <= 100;
        }).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          rect: el.getBoundingClientRect(),
          position: window.getComputedStyle(el).position,
          zIndex: window.getComputedStyle(el).zIndex
        }))
      };
    });
    
    console.log('登录后的主应用布局:');
    if (afterLogin.appContainer) {
      console.log(`  #app容器: ${afterLogin.appContainer.rect.width}x${afterLogin.appContainer.rect.height} (${afterLogin.appContainer.rect.x}, ${afterLogin.appContainer.rect.y})`);
      console.log(`    位置: ${afterLogin.appContainer.position}, 显示: ${afterLogin.appContainer.display}`);
    }
    
    if (afterLogin.mainLayout) {
      console.log(`  主布局: ${afterLogin.mainLayout.rect.width}x${afterLogin.mainLayout.rect.height} (${afterLogin.mainLayout.rect.x}, ${afterLogin.mainLayout.rect.y})`);
      console.log(`    类名: ${afterLogin.mainLayout.className}`);
    }
    
    if (afterLogin.sidebar) {
      console.log(`  侧边栏: ${afterLogin.sidebar.rect.width}x${afterLogin.sidebar.rect.height} (${afterLogin.sidebar.rect.x}, ${afterLogin.sidebar.rect.y})`);
      console.log(`    类名: ${afterLogin.sidebar.className}, z-index: ${afterLogin.sidebar.zIndex}`);
    }
    
    console.log('\n可能影响布局的元素:');
    afterLogin.layoutElements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName}.${el.className}#${el.id}: ${el.rect.width}x${el.rect.height} (${el.rect.x}, ${el.rect.y}) ${el.position} z:${el.zIndex}`);
    });
    
    console.log('\n=== 步骤3：进入AI助手页面前后对比 ===');
    
    // 点击AI助手按钮
    const aiButton = page.locator('button').filter({ hasText: 'YY-AI' }).first();
    await aiButton.click();
    await page.waitForTimeout(5000);
    
    const afterAI = await page.evaluate(() => {
      return {
        // AI页面包装器
        aiWrapper: (() => {
          const wrapper = document.querySelector('.ai-chat-interface-page');
          if (!wrapper) return null;
          const rect = wrapper.getBoundingClientRect();
          const style = window.getComputedStyle(wrapper);
          return {
            rect,
            position: style.position,
            top: style.top,
            left: style.left,
            right: style.right,
            bottom: style.bottom,
            zIndex: style.zIndex,
            transform: style.transform
          };
        })(),
        
        // 检查是否有其他元素在同一层级
        sameLevel: Array.from(document.querySelectorAll('*')).filter(el => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.position === 'fixed' && 
                 parseInt(style.zIndex) >= 1000 &&
                 rect.width > 100 && rect.height > 100 &&
                 !el.closest('.ai-chat-interface-page');
        }).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          rect: el.getBoundingClientRect(),
          zIndex: window.getComputedStyle(el).zIndex
        })),
        
        // 检查body的子元素
        bodyDirectChildren: Array.from(document.body.children).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          rect: el.getBoundingClientRect(),
          position: window.getComputedStyle(el).position,
          zIndex: window.getComputedStyle(el).zIndex,
          display: window.getComputedStyle(el).display
        }))
      };
    });
    
    console.log('AI助手页面布局:');
    if (afterAI.aiWrapper) {
      console.log(`  AI页面包装器: ${afterAI.aiWrapper.rect.width}x${afterAI.aiWrapper.rect.height} (${afterAI.aiWrapper.rect.x}, ${afterAI.aiWrapper.rect.y})`);
      console.log(`    CSS位置: top:${afterAI.aiWrapper.top}, left:${afterAI.aiWrapper.left}, right:${afterAI.aiWrapper.right}, bottom:${afterAI.aiWrapper.bottom}`);
      console.log(`    z-index: ${afterAI.aiWrapper.zIndex}, transform: ${afterAI.aiWrapper.transform}`);
    }
    
    console.log('\n同层级的其他固定元素:');
    afterAI.sameLevel.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName}.${el.className}#${el.id}: ${el.rect.width}x${el.rect.height} (${el.rect.x}, ${el.rect.y}) z:${el.zIndex}`);
    });
    
    console.log('\nBody的直接子元素:');
    afterAI.bodyDirectChildren.forEach((el, i) => {
      if (el.rect.width > 0 && el.rect.height > 0) {
        console.log(`  ${i + 1}. ${el.tagName}.${el.className}#${el.id}: ${el.rect.width}x${el.rect.height} (${el.rect.x}, ${el.rect.y}) ${el.position} z:${el.zIndex} ${el.display}`);
      }
    });
    
    console.log('\n=== 🎯 问题分析 ===');
    
    const issues = [];
    
    if (afterAI.aiWrapper && afterAI.aiWrapper.rect.x !== 0) {
      issues.push(`AI页面包装器X位置不为0: ${afterAI.aiWrapper.rect.x}`);
    }
    
    if (afterAI.aiWrapper && afterAI.aiWrapper.rect.width !== 1600) {
      issues.push(`AI页面包装器宽度不是1600: ${afterAI.aiWrapper.rect.width}`);
    }
    
    if (afterAI.sameLevel.length > 0) {
      issues.push(`发现${afterAI.sameLevel.length}个同层级固定元素可能影响布局`);
    }
    
    // 检查是否有左侧固定元素
    const leftElements = afterAI.bodyDirectChildren.filter(el => 
      el.rect.x === 0 && el.rect.width > 200 && el.position === 'fixed'
    );
    
    if (leftElements.length > 0) {
      issues.push(`发现${leftElements.length}个左侧固定元素可能推挤AI页面`);
    }
    
    console.log('发现的问题:');
    if (issues.length === 0) {
      console.log('  ✅ 未发现明显问题');
    } else {
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
    
    return {
      success: issues.length === 0,
      issues,
      afterAI
    };
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
    return { success: false, error: error.message };
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ 全局布局调试完成！');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  debugGlobalLayout().then(result => {
    console.log('\n🎯 调试结果:', result.success ? '未发现问题' : '发现布局冲突');
  }).catch(console.error);
}

module.exports = { debugGlobalLayout };
