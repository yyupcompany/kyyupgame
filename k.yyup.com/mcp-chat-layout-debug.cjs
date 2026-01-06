const { chromium } = require('playwright');

async function mcpChatLayoutDebug() {
  console.log('🔍 MCP调试：AI助手对话框布局问题');
  
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
    if (text.includes('chat') || text.includes('layout') || text.includes('container')) {
      console.log(`📝 布局日志[${type}]: ${text}`);
    }
  });
  
  try {
    console.log('\n=== 步骤1：登录并打开AI助手 ===');
    
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
    
    // 打开AI助手
    await page.locator('button:has-text("YY-AI")').first().click();
    await page.waitForTimeout(3000);
    console.log('✅ AI助手已打开');
    
    console.log('\n=== 步骤2：检查AI助手整体布局 ===');
    
    // 检查AI助手的主要容器
    const aiContainers = [
      '.ai-assistant-wrapper',
      '.ai-sidebar-container',
      '.fullscreen-layout',
      '.chat-container',
      '.message-list',
      '.chat-input-area'
    ];
    
    for (const selector of aiContainers) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        const element = elements[0];
        const isVisible = await element.isVisible();
        const boundingBox = await element.boundingBox();
        const className = await element.getAttribute('class') || '';
        
        console.log(`\n📦 ${selector}:`);
        console.log(`  - 可见: ${isVisible}`);
        console.log(`  - class: "${className}"`);
        
        if (boundingBox) {
          console.log(`  - 位置: x:${Math.round(boundingBox.x)}, y:${Math.round(boundingBox.y)}`);
          console.log(`  - 大小: ${Math.round(boundingBox.width)}x${Math.round(boundingBox.height)}`);
          
          // 检查是否铺满屏幕
          const isFullWidth = boundingBox.width >= 1200; // 接近全屏宽度
          const isFullHeight = boundingBox.height >= 650; // 接近全屏高度
          
          if (isFullWidth) {
            console.log(`  - ⚠️ 宽度铺满: ${Math.round(boundingBox.width)}px (接近全屏)`);
          }
          if (isFullHeight) {
            console.log(`  - ⚠️ 高度铺满: ${Math.round(boundingBox.height)}px (接近全屏)`);
          }
          
          // 检查是否居中
          const centerX = boundingBox.x + boundingBox.width / 2;
          const screenCenterX = 1280 / 2;
          const isCentered = Math.abs(centerX - screenCenterX) < 50;
          
          console.log(`  - 水平居中: ${isCentered ? '✅ 是' : '❌ 否'} (中心点: ${Math.round(centerX)}px, 屏幕中心: ${screenCenterX}px)`);
        } else {
          console.log(`  - 位置: 无边界框`);
        }
      }
    }
    
    console.log('\n=== 步骤3：详细检查聊天容器布局 ===');
    
    // 检查聊天相关的具体布局
    const chatLayoutInfo = await page.evaluate(() => {
      const containers = {};
      
      // 检查各个聊天相关容器
      const selectors = [
        '.ai-assistant-wrapper',
        '.fullscreen-layout', 
        '.chat-container',
        '.message-list',
        '.chat-input-area',
        '.main-chat-area',
        '.chat-content'
      ];
      
      selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          
          containers[selector] = {
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            styles: {
              position: styles.position,
              display: styles.display,
              width: styles.width,
              height: styles.height,
              maxWidth: styles.maxWidth,
              margin: styles.margin,
              padding: styles.padding,
              left: styles.left,
              right: styles.right,
              top: styles.top,
              bottom: styles.bottom,
              transform: styles.transform,
              justifyContent: styles.justifyContent,
              alignItems: styles.alignItems,
              flexDirection: styles.flexDirection
            },
            className: element.className,
            id: element.id
          };
        }
      });
      
      return containers;
    });
    
    console.log('🎨 聊天容器样式分析:');
    
    Object.entries(chatLayoutInfo).forEach(([selector, info]) => {
      console.log(`\n📋 ${selector}:`);
      console.log(`  - 位置: ${info.rect.x}, ${info.rect.y}`);
      console.log(`  - 大小: ${info.rect.width}x${info.rect.height}`);
      console.log(`  - position: ${info.styles.position}`);
      console.log(`  - display: ${info.styles.display}`);
      console.log(`  - width: ${info.styles.width}`);
      console.log(`  - height: ${info.styles.height}`);
      
      if (info.styles.maxWidth && info.styles.maxWidth !== 'none') {
        console.log(`  - maxWidth: ${info.styles.maxWidth}`);
      }
      
      if (info.styles.margin && info.styles.margin !== '0px') {
        console.log(`  - margin: ${info.styles.margin}`);
      }
      
      if (info.styles.justifyContent && info.styles.justifyContent !== 'normal') {
        console.log(`  - justifyContent: ${info.styles.justifyContent}`);
      }
      
      if (info.styles.alignItems && info.styles.alignItems !== 'normal') {
        console.log(`  - alignItems: ${info.styles.alignItems}`);
      }
      
      // 检查是否有居中相关的样式
      const hasCenterStyles = info.styles.margin?.includes('auto') || 
                             info.styles.justifyContent?.includes('center') ||
                             info.styles.alignItems?.includes('center');
      
      if (hasCenterStyles) {
        console.log(`  - ✅ 有居中样式`);
      } else {
        console.log(`  - ⚠️ 缺少居中样式`);
      }
      
      // 检查是否铺满
      const isFullWidth = info.rect.width >= 1200;
      const isFullHeight = info.rect.height >= 600;
      
      if (isFullWidth || isFullHeight) {
        console.log(`  - ⚠️ 可能铺满屏幕 (${isFullWidth ? '宽度' : ''}${isFullWidth && isFullHeight ? '+' : ''}${isFullHeight ? '高度' : ''})`);
      }
    });
    
    console.log('\n=== 步骤4：检查CSS样式问题 ===');
    
    // 检查可能导致铺满的CSS问题
    const cssIssues = await page.evaluate(() => {
      const issues = [];
      
      // 检查聊天容器的CSS
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        const styles = window.getComputedStyle(chatContainer);
        
        // 检查可能导致铺满的样式
        if (styles.width === '100%' || styles.width === '100vw') {
          issues.push('chat-container width设置为100%或100vw');
        }
        
        if (styles.height === '100%' || styles.height === '100vh') {
          issues.push('chat-container height设置为100%或100vh');
        }
        
        if (styles.position === 'fixed' && styles.left === '0px' && styles.right === '0px') {
          issues.push('chat-container使用fixed定位且left:0 right:0');
        }
        
        if (styles.maxWidth === 'none' || styles.maxWidth === '100%') {
          issues.push('chat-container没有设置合适的maxWidth');
        }
      }
      
      // 检查全屏布局
      const fullscreenLayout = document.querySelector('.fullscreen-layout');
      if (fullscreenLayout) {
        const styles = window.getComputedStyle(fullscreenLayout);
        
        if (styles.width === '100vw' || styles.width === '100%') {
          issues.push('fullscreen-layout宽度设置为100vw或100%');
        }
      }
      
      return issues;
    });
    
    console.log('🔍 CSS问题检查:');
    if (cssIssues.length > 0) {
      cssIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ⚠️ ${issue}`);
      });
    } else {
      console.log('  ✅ 没有发现明显的CSS问题');
    }
    
    console.log('\n=== 步骤5：发送测试消息检查对话框 ===');
    
    // 发送一条消息来检查对话框的实际表现
    const inputBox = page.locator('textarea, input[type="text"]').last();
    const inputVisible = await inputBox.isVisible();
    
    console.log(`输入框可见: ${inputVisible}`);
    
    if (inputVisible) {
      await inputBox.fill('测试对话框布局');
      await page.waitForTimeout(1000);
      await inputBox.press('Enter');
      
      console.log('✅ 已发送测试消息');
      await page.waitForTimeout(3000);
      
      // 检查消息显示后的布局
      const messageItems = await page.locator('.message-item').count();
      console.log(`消息数量: ${messageItems}`);
      
      if (messageItems > 0) {
        // 检查消息列表的布局
        const messageListBox = await page.locator('.message-list').boundingBox();
        if (messageListBox) {
          console.log(`消息列表布局:`);
          console.log(`  - 位置: ${Math.round(messageListBox.x)}, ${Math.round(messageListBox.y)}`);
          console.log(`  - 大小: ${Math.round(messageListBox.width)}x${Math.round(messageListBox.height)}`);
          
          // 检查消息列表是否居中
          const centerX = messageListBox.x + messageListBox.width / 2;
          const screenCenterX = 1280 / 2;
          const isCentered = Math.abs(centerX - screenCenterX) < 100;
          
          console.log(`  - 水平居中: ${isCentered ? '✅ 是' : '❌ 否'}`);
          
          if (!isCentered) {
            console.log(`  - ⚠️ 消息列表未居中，中心点: ${Math.round(centerX)}px, 应该在: ${screenCenterX}px附近`);
          }
        }
      }
    }
    
    console.log('\n=== 🎯 布局问题诊断结果 ===');
    
    // 总结发现的问题
    const layoutIssues = [];
    
    // 检查主要容器是否铺满
    const mainContainerInfo = chatLayoutInfo['.chat-container'] || chatLayoutInfo['.fullscreen-layout'];
    if (mainContainerInfo) {
      if (mainContainerInfo.rect.width >= 1200) {
        layoutIssues.push('对话框宽度铺满屏幕');
      }
      if (mainContainerInfo.rect.x < 50) {
        layoutIssues.push('对话框没有左边距');
      }
      if (mainContainerInfo.rect.x + mainContainerInfo.rect.width > 1230) {
        layoutIssues.push('对话框没有右边距');
      }
    }
    
    console.log('📊 布局诊断总结:');
    if (layoutIssues.length > 0) {
      console.log('⚠️ 发现以下布局问题:');
      layoutIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
      
      console.log('\n💡 建议修复方案:');
      console.log('  1. 为聊天容器设置合适的maxWidth (如800px-1000px)');
      console.log('  2. 使用margin: 0 auto实现水平居中');
      console.log('  3. 添加左右padding确保有边距');
      console.log('  4. 检查fullscreen-layout的CSS设置');
      
    } else {
      console.log('✅ 对话框布局正常，已正确居中');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器，请查看当前布局状态...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ AI助手对话框布局调试完成！');
  }
}

mcpChatLayoutDebug().catch(console.error);
