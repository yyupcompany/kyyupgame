const { chromium } = require('playwright');

async function debugLayoutSpacing() {
  console.log('🔍 调试AI助手布局间距问题');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 步骤1：登录并进入AI助手页面 ===');
    
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
    
    console.log('✅ 已进入AI助手页面');
    
    console.log('\n=== 步骤2：详细分析布局间距 ===');
    
    const spacingAnalysis = await page.evaluate(() => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
        scrollbarHeight: window.innerHeight - document.documentElement.clientHeight
      };
      
      // 分析每个层级的元素
      const elements = {
        body: document.body,
        html: document.documentElement,
        wrapper: document.querySelector('.ai-chat-interface-page'),
        aiAssistant: document.querySelector('.ai-assistant-wrapper'),
        fullscreen: document.querySelector('.ai-assistant-fullscreen'),
        leftSidebar: document.querySelector('.conversations-sidebar'),
        centerMain: document.querySelector('.center-main'),
        chatContainer: document.querySelector('.chat-container'),
        rightSidebar: document.querySelector('.right-sidebar')
      };
      
      const analysis = {};
      
      Object.entries(elements).forEach(([key, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          
          analysis[key] = {
            // 尺寸
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y,
            
            // 样式
            position: style.position,
            display: style.display,
            boxSizing: style.boxSizing,
            
            // 边距和内边距
            margin: {
              top: parseFloat(style.marginTop) || 0,
              right: parseFloat(style.marginRight) || 0,
              bottom: parseFloat(style.marginBottom) || 0,
              left: parseFloat(style.marginLeft) || 0
            },
            padding: {
              top: parseFloat(style.paddingTop) || 0,
              right: parseFloat(style.paddingRight) || 0,
              bottom: parseFloat(style.paddingBottom) || 0,
              left: parseFloat(style.paddingLeft) || 0
            },
            
            // 边框
            border: {
              top: parseFloat(style.borderTopWidth) || 0,
              right: parseFloat(style.borderRightWidth) || 0,
              bottom: parseFloat(style.borderBottomWidth) || 0,
              left: parseFloat(style.borderLeftWidth) || 0
            },
            
            // flex属性
            flex: style.flex,
            flexShrink: style.flexShrink,
            flexGrow: style.flexGrow,
            flexBasis: style.flexBasis,
            
            // 溢出
            overflow: style.overflow,
            overflowX: style.overflowX,
            overflowY: style.overflowY
          };
        }
      });
      
      return {
        viewport,
        elements: analysis
      };
    });
    
    console.log('视口信息:');
    console.log(`  内部尺寸: ${spacingAnalysis.viewport.width}x${spacingAnalysis.viewport.height}`);
    console.log(`  滚动条宽度: ${spacingAnalysis.viewport.scrollbarWidth}px`);
    console.log(`  滚动条高度: ${spacingAnalysis.viewport.scrollbarHeight}px`);
    
    console.log('\n元素尺寸分析:');
    Object.entries(spacingAnalysis.elements).forEach(([key, data]) => {
      if (data) {
        console.log(`  ${key}:`);
        console.log(`    尺寸: ${data.width}x${data.height} (位置: ${data.x}, ${data.y})`);
        console.log(`    位置: ${data.position}, 显示: ${data.display}`);
        console.log(`    边距: T${data.margin.top} R${data.margin.right} B${data.margin.bottom} L${data.margin.left}`);
        console.log(`    内边距: T${data.padding.top} R${data.padding.right} B${data.padding.bottom} L${data.padding.left}`);
        console.log(`    边框: T${data.border.top} R${data.border.right} B${data.border.bottom} L${data.border.left}`);
        if (data.flex && data.flex !== 'none') {
          console.log(`    flex: ${data.flex}`);
        }
        console.log('');
      }
    });
    
    console.log('\n=== 步骤3：计算空间占用 ===');
    
    const spaceCalculation = await page.evaluate(() => {
      const viewport = window.innerWidth;
      const leftSidebar = document.querySelector('.conversations-sidebar');
      const centerMain = document.querySelector('.center-main');
      const rightSidebar = document.querySelector('.right-sidebar');
      const fullscreen = document.querySelector('.ai-assistant-fullscreen');
      
      const leftWidth = leftSidebar ? leftSidebar.getBoundingClientRect().width : 0;
      const centerWidth = centerMain ? centerMain.getBoundingClientRect().width : 0;
      const rightWidth = rightSidebar ? rightSidebar.getBoundingClientRect().width : 0;
      const fullscreenWidth = fullscreen ? fullscreen.getBoundingClientRect().width : 0;
      
      const totalUsed = leftWidth + centerWidth + rightWidth;
      const missing = viewport - fullscreenWidth;
      const centerMissing = viewport - leftWidth - rightWidth - centerWidth;
      
      // 检查是否有其他元素占用空间
      const allElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && 
               style.position === 'fixed' && 
               rect.x >= 0 && rect.y >= 0 &&
               !el.closest('.ai-chat-interface-page');
      });
      
      return {
        viewport,
        leftWidth,
        centerWidth,
        rightWidth,
        fullscreenWidth,
        totalUsed,
        missing,
        centerMissing,
        otherFixedElements: allElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height,
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y
        }))
      };
    });
    
    console.log('空间占用计算:');
    console.log(`  视口宽度: ${spaceCalculation.viewport}px`);
    console.log(`  左侧栏宽度: ${spaceCalculation.leftWidth}px`);
    console.log(`  中心区域宽度: ${spaceCalculation.centerWidth}px`);
    console.log(`  右侧栏宽度: ${spaceCalculation.rightWidth}px`);
    console.log(`  全屏布局宽度: ${spaceCalculation.fullscreenWidth}px`);
    console.log(`  总计使用: ${spaceCalculation.totalUsed}px`);
    console.log(`  全屏缺失: ${spaceCalculation.missing}px`);
    console.log(`  中心缺失: ${spaceCalculation.centerMissing}px`);
    
    if (spaceCalculation.otherFixedElements.length > 0) {
      console.log('\n其他固定定位元素:');
      spaceCalculation.otherFixedElements.forEach((el, i) => {
        console.log(`  ${i + 1}. ${el.tagName}.${el.className}: ${el.width}x${el.height} (${el.x}, ${el.y})`);
      });
    }
    
    console.log('\n=== 步骤4：检查CSS变量和全局样式 ===');
    
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement;
      const style = window.getComputedStyle(root);
      
      return {
        sidebarWidth: style.getPropertyValue('--sidebar-width'),
        sidebarCollapsedWidth: style.getPropertyValue('--sidebar-width-collapsed'),
        elBgColor: style.getPropertyValue('--el-bg-color'),
        elBgColorPage: style.getPropertyValue('--el-bg-color-page'),
        
        // 检查body和html的样式
        bodyStyle: {
          margin: window.getComputedStyle(document.body).margin,
          padding: window.getComputedStyle(document.body).padding,
          overflow: window.getComputedStyle(document.body).overflow,
          width: window.getComputedStyle(document.body).width,
          height: window.getComputedStyle(document.body).height
        },
        
        htmlStyle: {
          margin: window.getComputedStyle(document.documentElement).margin,
          padding: window.getComputedStyle(document.documentElement).padding,
          overflow: window.getComputedStyle(document.documentElement).overflow,
          width: window.getComputedStyle(document.documentElement).width,
          height: window.getComputedStyle(document.documentElement).height
        }
      };
    });
    
    console.log('CSS变量和全局样式:');
    console.log(`  --sidebar-width: ${cssVariables.sidebarWidth}`);
    console.log(`  --sidebar-width-collapsed: ${cssVariables.sidebarCollapsedWidth}`);
    console.log(`  --el-bg-color: ${cssVariables.elBgColor}`);
    console.log(`  --el-bg-color-page: ${cssVariables.elBgColorPage}`);
    
    console.log('\n  Body样式:');
    console.log(`    margin: ${cssVariables.bodyStyle.margin}`);
    console.log(`    padding: ${cssVariables.bodyStyle.padding}`);
    console.log(`    overflow: ${cssVariables.bodyStyle.overflow}`);
    console.log(`    width: ${cssVariables.bodyStyle.width}`);
    console.log(`    height: ${cssVariables.bodyStyle.height}`);
    
    console.log('\n  HTML样式:');
    console.log(`    margin: ${cssVariables.htmlStyle.margin}`);
    console.log(`    padding: ${cssVariables.htmlStyle.padding}`);
    console.log(`    overflow: ${cssVariables.htmlStyle.overflow}`);
    console.log(`    width: ${cssVariables.htmlStyle.width}`);
    console.log(`    height: ${cssVariables.htmlStyle.height}`);
    
    console.log('\n=== 🎯 问题诊断 ===');
    
    const issues = [];
    
    if (spaceCalculation.missing > 0) {
      issues.push(`全屏布局缺失 ${spaceCalculation.missing}px 宽度`);
    }
    
    if (spaceCalculation.centerMissing > 0) {
      issues.push(`中心区域缺失 ${spaceCalculation.centerMissing}px 宽度`);
    }
    
    if (spacingAnalysis.viewport.scrollbarWidth > 0) {
      issues.push(`垂直滚动条占用 ${spacingAnalysis.viewport.scrollbarWidth}px 宽度`);
    }
    
    if (spaceCalculation.otherFixedElements.length > 0) {
      issues.push(`发现 ${spaceCalculation.otherFixedElements.length} 个其他固定定位元素`);
    }
    
    console.log('发现的问题:');
    if (issues.length === 0) {
      console.log('  ✅ 未发现明显问题');
    } else {
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
    
    console.log('\n修复建议:');
    if (spacingAnalysis.viewport.scrollbarWidth > 0) {
      console.log('  1. 添加 overflow: hidden 到页面包装器');
    }
    if (spaceCalculation.missing > 0) {
      console.log('  2. 检查全屏布局的父容器样式');
    }
    if (spaceCalculation.centerMissing > 0) {
      console.log('  3. 确保中心区域正确使用 flex: 1');
    }
    
    return {
      success: issues.length === 0,
      issues,
      spacingAnalysis,
      spaceCalculation
    };
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
    return { success: false, error: error.message };
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ 布局间距调试完成！');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  debugLayoutSpacing().then(result => {
    console.log('\n🎯 调试结果:', result.success ? '未发现问题' : '发现问题需要修复');
  }).catch(console.error);
}

module.exports = { debugLayoutSpacing };
