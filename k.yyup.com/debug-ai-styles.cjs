const { chromium } = require('playwright');

async function debugAIStyles() {
  console.log('🎨 调试AI助手样式显示问题');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 800 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text, timestamp: new Date().toISOString() });
    
    // 特别关注组件挂载和props相关的日志
    if (text.includes('重构后的AI助手') || text.includes('Props:') || text.includes('isFullscreen') || text.includes('全屏模式')) {
      console.log(`📝 ${text}`);
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
    
    // 点击AI助手按钮
    const aiButton = page.locator('button').filter({ hasText: 'YY-AI' }).first();
    await aiButton.click();
    await page.waitForTimeout(5000);
    
    console.log('\n=== 步骤2：检查页面结构和样式 ===');
    
    const pageStructure = await page.evaluate(() => {
      const structure = {
        // 页面包装器
        wrapper: {
          exists: !!document.querySelector('.ai-chat-interface-page'),
          styles: null
        },
        
        // AI助手组件
        aiAssistant: {
          exists: !!document.querySelector('.ai-assistant-wrapper'),
          styles: null
        },
        
        // 全屏布局
        fullscreenLayout: {
          exists: !!document.querySelector('.ai-assistant-fullscreen'),
          styles: null
        },
        
        // 主要区域
        centerMain: {
          exists: !!document.querySelector('.center-main'),
          styles: null
        },
        
        // 侧边栏
        leftSidebar: {
          exists: !!document.querySelector('.conversations-sidebar'),
          styles: null
        },
        
        rightSidebar: {
          exists: !!document.querySelector('.right-sidebar, .tool-sidebar'),
          styles: null
        }
      };
      
      // 获取每个元素的样式信息
      Object.keys(structure).forEach(key => {
        const element = document.querySelector(structure[key].selector || `.${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
        if (element) {
          const computedStyle = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          
          structure[key].styles = {
            display: computedStyle.display,
            position: computedStyle.position,
            width: computedStyle.width,
            height: computedStyle.height,
            zIndex: computedStyle.zIndex,
            background: computedStyle.background,
            backdropFilter: computedStyle.backdropFilter,
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            }
          };
        }
      });
      
      return structure;
    });
    
    console.log('页面结构检查:');
    Object.entries(pageStructure).forEach(([key, info]) => {
      console.log(`  ${key}: ${info.exists ? '✅' : '❌'} 存在`);
      if (info.exists && info.styles) {
        console.log(`    位置: ${info.styles.position}, 显示: ${info.styles.display}`);
        console.log(`    尺寸: ${info.styles.rect.width}x${info.styles.rect.height}`);
        console.log(`    z-index: ${info.styles.zIndex}, 透明度: ${info.styles.opacity}`);
        if (info.styles.backdropFilter && info.styles.backdropFilter !== 'none') {
          console.log(`    毛玻璃效果: ${info.styles.backdropFilter}`);
        }
      }
    });
    
    console.log('\n=== 步骤3：检查CSS类和样式加载 ===');
    
    const cssInfo = await page.evaluate(() => {
      const info = {
        loadedStylesheets: [],
        appliedClasses: [],
        missingClasses: [],
        cssRules: []
      };
      
      // 检查加载的样式表
      Array.from(document.styleSheets).forEach((sheet, index) => {
        try {
          info.loadedStylesheets.push({
            index,
            href: sheet.href || 'inline',
            rulesCount: sheet.cssRules ? sheet.cssRules.length : 0
          });
        } catch (e) {
          info.loadedStylesheets.push({
            index,
            href: sheet.href || 'inline',
            error: 'Access denied'
          });
        }
      });
      
      // 检查关键CSS类是否存在
      const keyClasses = [
        'ai-chat-interface-page',
        'ai-assistant-wrapper', 
        'ai-assistant-fullscreen',
        'center-main',
        'conversations-sidebar'
      ];
      
      keyClasses.forEach(className => {
        const elements = document.querySelectorAll(`.${className}`);
        if (elements.length > 0) {
          info.appliedClasses.push({
            className,
            count: elements.length,
            hasStyles: window.getComputedStyle(elements[0]).display !== 'block' // 检查是否有自定义样式
          });
        } else {
          info.missingClasses.push(className);
        }
      });
      
      return info;
    });
    
    console.log('CSS加载状态:');
    console.log(`  样式表数量: ${cssInfo.loadedStylesheets.length}`);
    cssInfo.loadedStylesheets.slice(0, 5).forEach((sheet, i) => {
      console.log(`    ${i + 1}. ${sheet.href} (${sheet.rulesCount || 'N/A'} 规则)`);
    });
    
    console.log(`  应用的关键类: ${cssInfo.appliedClasses.length}`);
    cssInfo.appliedClasses.forEach(cls => {
      console.log(`    ✅ .${cls.className} (${cls.count} 个元素)`);
    });
    
    if (cssInfo.missingClasses.length > 0) {
      console.log(`  缺失的关键类: ${cssInfo.missingClasses.length}`);
      cssInfo.missingClasses.forEach(cls => {
        console.log(`    ❌ .${cls}`);
      });
    }
    
    console.log('\n=== 步骤4：检查毛玻璃效果 ===');
    
    const glassEffects = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const glassElements = [];
      
      Array.from(elements).forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.backdropFilter && style.backdropFilter !== 'none') {
          const rect = el.getBoundingClientRect();
          glassElements.push({
            tagName: el.tagName,
            className: el.className,
            backdropFilter: style.backdropFilter,
            background: style.background,
            opacity: style.opacity,
            visible: rect.width > 0 && rect.height > 0
          });
        }
      });
      
      return glassElements;
    });
    
    console.log(`发现 ${glassEffects.length} 个毛玻璃效果元素:`);
    glassEffects.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName}.${el.className}`);
      console.log(`     backdrop-filter: ${el.backdropFilter}`);
      console.log(`     可见: ${el.visible ? '✅' : '❌'}`);
    });
    
    console.log('\n=== 步骤5：分析控制台日志 ===');
    
    const relevantMessages = consoleMessages.filter(msg => 
      msg.text.includes('重构后的AI助手') || 
      msg.text.includes('Props:') || 
      msg.text.includes('isFullscreen') ||
      msg.text.includes('全屏模式') ||
      msg.text.includes('error') ||
      msg.text.includes('warning')
    );
    
    console.log(`发现 ${relevantMessages.length} 条相关日志:`);
    relevantMessages.forEach((msg, i) => {
      console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
    });
    
    console.log('\n=== 🎯 样式问题诊断 ===');
    
    const diagnostics = {
      wrapperExists: pageStructure.wrapper.exists,
      aiAssistantExists: pageStructure.aiAssistant.exists,
      fullscreenLayoutExists: pageStructure.fullscreenLayout.exists,
      centerMainExists: pageStructure.centerMain.exists,
      hasGlassEffects: glassEffects.length > 0,
      hasPropsLogs: relevantMessages.some(msg => msg.text.includes('Props:')),
      hasStylesheets: cssInfo.loadedStylesheets.length > 0,
      missingClasses: cssInfo.missingClasses.length
    };
    
    const issueCount = Object.values(diagnostics).filter(result => result === false).length + diagnostics.missingClasses;
    const successRate = Math.round(((Object.keys(diagnostics).length - issueCount) / Object.keys(diagnostics).length) * 100);
    
    console.log('样式诊断结果:');
    console.log(`  1. 页面包装器: ${diagnostics.wrapperExists ? '✅' : '❌'}`);
    console.log(`  2. AI助手组件: ${diagnostics.aiAssistantExists ? '✅' : '❌'}`);
    console.log(`  3. 全屏布局: ${diagnostics.fullscreenLayoutExists ? '✅' : '❌'}`);
    console.log(`  4. 中心区域: ${diagnostics.centerMainExists ? '✅' : '❌'}`);
    console.log(`  5. 毛玻璃效果: ${diagnostics.hasGlassEffects ? '✅' : '❌'}`);
    console.log(`  6. Props日志: ${diagnostics.hasPropsLogs ? '✅' : '❌'}`);
    console.log(`  7. 样式表加载: ${diagnostics.hasStylesheets ? '✅' : '❌'}`);
    console.log(`  8. 缺失类数量: ${diagnostics.missingClasses}`);
    
    console.log(`\n样式健康度: ${successRate}%`);
    
    if (successRate >= 80) {
      console.log('🎉 样式显示基本正常！');
    } else if (successRate >= 60) {
      console.log('⚠️ 样式显示有部分问题');
    } else {
      console.log('❌ 样式显示有严重问题');
    }
    
    return {
      success: successRate >= 80,
      successRate,
      diagnostics,
      pageStructure,
      cssInfo,
      glassEffects: glassEffects.length
    };
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
    return { success: false, error: error.message };
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ AI助手样式调试完成！');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  debugAIStyles().then(result => {
    console.log('\n🎯 调试结果:', result.success ? '样式正常' : '需要修复');
  }).catch(console.error);
}

module.exports = { debugAIStyles };
