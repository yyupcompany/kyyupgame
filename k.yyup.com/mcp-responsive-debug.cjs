const { chromium } = require('playwright');

async function mcpResponsiveDebug() {
  console.log('🔍 MCP调试：AI助手全屏模式响应式问题');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
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
    
    console.log('\n=== 步骤2：检查初始布局 ===');
    
    // 检查AI助手容器的初始状态
    const initialLayout = await page.evaluate(() => {
      const aiWrapper = document.querySelector('.ai-assistant-wrapper');
      const aiSidebar = document.querySelector('.ai-sidebar-container');
      const fullscreenLayout = document.querySelector('.fullscreen-layout');
      const chatContainer = document.querySelector('.chat-container');
      
      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        aiWrapper: aiWrapper ? {
          width: aiWrapper.offsetWidth,
          height: aiWrapper.offsetHeight,
          styles: {
            position: getComputedStyle(aiWrapper).position,
            width: getComputedStyle(aiWrapper).width,
            height: getComputedStyle(aiWrapper).height,
            left: getComputedStyle(aiWrapper).left,
            right: getComputedStyle(aiWrapper).right,
            top: getComputedStyle(aiWrapper).top,
            bottom: getComputedStyle(aiWrapper).bottom
          }
        } : null,
        aiSidebar: aiSidebar ? {
          width: aiSidebar.offsetWidth,
          height: aiSidebar.offsetHeight,
          styles: {
            position: getComputedStyle(aiSidebar).position,
            width: getComputedStyle(aiSidebar).width,
            height: getComputedStyle(aiSidebar).height
          }
        } : null,
        fullscreenLayout: fullscreenLayout ? {
          width: fullscreenLayout.offsetWidth,
          height: fullscreenLayout.offsetHeight,
          styles: {
            position: getComputedStyle(fullscreenLayout).position,
            width: getComputedStyle(fullscreenLayout).width,
            height: getComputedStyle(fullscreenLayout).height
          }
        } : null,
        chatContainer: chatContainer ? {
          width: chatContainer.offsetWidth,
          height: chatContainer.offsetHeight
        } : null
      };
    });
    
    console.log('📊 初始布局状态 (1280x720):');
    console.log(`  - 视口: ${initialLayout.viewport.width}x${initialLayout.viewport.height}`);
    
    if (initialLayout.aiWrapper) {
      console.log(`  - AI包装器: ${initialLayout.aiWrapper.width}x${initialLayout.aiWrapper.height}`);
      console.log(`    - position: ${initialLayout.aiWrapper.styles.position}`);
      console.log(`    - width: ${initialLayout.aiWrapper.styles.width}`);
      console.log(`    - height: ${initialLayout.aiWrapper.styles.height}`);
    }
    
    if (initialLayout.aiSidebar) {
      console.log(`  - AI侧边栏: ${initialLayout.aiSidebar.width}x${initialLayout.aiSidebar.height}`);
      console.log(`    - position: ${initialLayout.aiSidebar.styles.position}`);
      console.log(`    - width: ${initialLayout.aiSidebar.styles.width}`);
    }
    
    if (initialLayout.chatContainer) {
      console.log(`  - 聊天容器: ${initialLayout.chatContainer.width}x${initialLayout.chatContainer.height}`);
    }
    
    console.log('\n=== 步骤3：测试浏览器窗口大小变化 ===');
    
    // 测试不同的窗口大小
    const testSizes = [
      { width: 1920, height: 1080, name: '大屏幕' },
      { width: 1440, height: 900, name: '中等屏幕' },
      { width: 1024, height: 768, name: '小屏幕' },
      { width: 800, height: 600, name: '很小屏幕' }
    ];
    
    for (const size of testSizes) {
      console.log(`\n📐 测试 ${size.name} (${size.width}x${size.height}):`);
      
      // 改变视口大小
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.waitForTimeout(2000); // 等待布局调整
      
      // 检查布局是否响应
      const resizedLayout = await page.evaluate(() => {
        const aiWrapper = document.querySelector('.ai-assistant-wrapper');
        const aiSidebar = document.querySelector('.ai-sidebar-container');
        const chatContainer = document.querySelector('.chat-container');
        
        return {
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          aiWrapper: aiWrapper ? {
            width: aiWrapper.offsetWidth,
            height: aiWrapper.offsetHeight,
            rect: aiWrapper.getBoundingClientRect()
          } : null,
          aiSidebar: aiSidebar ? {
            width: aiSidebar.offsetWidth,
            height: aiSidebar.offsetHeight,
            rect: aiSidebar.getBoundingClientRect()
          } : null,
          chatContainer: chatContainer ? {
            width: chatContainer.offsetWidth,
            height: chatContainer.offsetHeight,
            rect: chatContainer.getBoundingClientRect()
          } : null
        };
      });
      
      console.log(`  - 视口: ${resizedLayout.viewport.width}x${resizedLayout.viewport.height}`);
      
      if (resizedLayout.aiWrapper) {
        const widthMatches = resizedLayout.aiWrapper.width === size.width;
        const heightMatches = resizedLayout.aiWrapper.height === size.height;
        console.log(`  - AI包装器: ${resizedLayout.aiWrapper.width}x${resizedLayout.aiWrapper.height}`);
        console.log(`    - 宽度响应: ${widthMatches ? '✅' : '❌'} (${widthMatches ? '正确' : '不匹配视口'})`);
        console.log(`    - 高度响应: ${heightMatches ? '✅' : '❌'} (${heightMatches ? '正确' : '不匹配视口'})`);
        
        // 检查是否超出视口
        const overflowX = resizedLayout.aiWrapper.rect.right > size.width;
        const overflowY = resizedLayout.aiWrapper.rect.bottom > size.height;
        
        if (overflowX || overflowY) {
          console.log(`    - ⚠️ 溢出检测: ${overflowX ? 'X轴溢出' : ''}${overflowX && overflowY ? '+' : ''}${overflowY ? 'Y轴溢出' : ''}`);
        }
      }
      
      if (resizedLayout.aiSidebar) {
        const widthMatches = resizedLayout.aiSidebar.width === size.width;
        const heightMatches = resizedLayout.aiSidebar.height === size.height;
        console.log(`  - AI侧边栏: ${resizedLayout.aiSidebar.width}x${resizedLayout.aiSidebar.height}`);
        console.log(`    - 宽度响应: ${widthMatches ? '✅' : '❌'}`);
        console.log(`    - 高度响应: ${heightMatches ? '✅' : '❌'}`);
      }
      
      if (resizedLayout.chatContainer) {
        console.log(`  - 聊天容器: ${resizedLayout.chatContainer.width}x${resizedLayout.chatContainer.height}`);
        
        // 检查聊天容器是否合理调整
        const reasonableWidth = resizedLayout.chatContainer.width <= size.width - 100; // 至少留100px边距
        console.log(`    - 宽度合理: ${reasonableWidth ? '✅' : '❌'} (${reasonableWidth ? '有边距' : '太宽'})`);
      }
    }
    
    console.log('\n=== 步骤4：检查CSS响应式规则 ===');
    
    // 检查CSS媒体查询是否生效
    const mediaQueryTest = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        width: 100px;
        height: 100px;
        background: red;
        position: absolute;
        top: -1000px;
        left: -1000px;
      `;
      document.body.appendChild(testElement);
      
      // 测试不同媒体查询
      const mediaQueries = [
        '(max-width: 768px)',
        '(max-width: 1024px)',
        '(max-width: 1280px)',
        '(min-width: 1440px)'
      ];
      
      const results = {};
      mediaQueries.forEach(query => {
        results[query] = window.matchMedia(query).matches;
      });
      
      document.body.removeChild(testElement);
      return results;
    });
    
    console.log('📱 媒体查询状态:');
    Object.entries(mediaQueryTest).forEach(([query, matches]) => {
      console.log(`  - ${query}: ${matches ? '✅ 匹配' : '❌ 不匹配'}`);
    });
    
    console.log('\n=== 步骤5：检查固定定位问题 ===');
    
    // 检查是否有固定定位导致的问题
    const positioningIssues = await page.evaluate(() => {
      const issues = [];
      
      // 检查AI助手相关元素的定位
      const aiElements = [
        '.ai-assistant-wrapper',
        '.ai-sidebar-container', 
        '.fullscreen-layout',
        '.chat-container'
      ];
      
      aiElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          const styles = getComputedStyle(element);
          const info = {
            selector,
            position: styles.position,
            width: styles.width,
            height: styles.height,
            left: styles.left,
            right: styles.right,
            top: styles.top,
            bottom: styles.bottom,
            zIndex: styles.zIndex
          };
          
          // 检查可能的问题
          if (styles.position === 'fixed') {
            if (styles.width === '100vw' || styles.height === '100vh') {
              issues.push(`${selector}: 使用固定定位 + 视口单位，可能不响应窗口变化`);
            }
          }
          
          if (styles.width.includes('px') && parseInt(styles.width) > 1920) {
            issues.push(`${selector}: 固定像素宽度过大 (${styles.width})`);
          }
          
          if (styles.height.includes('px') && parseInt(styles.height) > 1080) {
            issues.push(`${selector}: 固定像素高度过大 (${styles.height})`);
          }
        }
      });
      
      return issues;
    });
    
    console.log('🔍 定位问题检查:');
    if (positioningIssues.length > 0) {
      positioningIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ⚠️ ${issue}`);
      });
    } else {
      console.log('  ✅ 没有发现明显的定位问题');
    }
    
    console.log('\n=== 🎯 响应式问题诊断结果 ===');
    
    // 回到原始大小进行最终测试
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(2000);
    
    const finalLayout = await page.evaluate(() => {
      const aiWrapper = document.querySelector('.ai-assistant-wrapper');
      const aiSidebar = document.querySelector('.ai-sidebar-container');
      
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        aiWrapper: aiWrapper ? {
          width: aiWrapper.offsetWidth,
          height: aiWrapper.offsetHeight,
          matchesViewport: aiWrapper.offsetWidth === window.innerWidth && aiWrapper.offsetHeight === window.innerHeight
        } : null,
        aiSidebar: aiSidebar ? {
          width: aiSidebar.offsetWidth,
          height: aiSidebar.offsetHeight,
          matchesViewport: aiSidebar.offsetWidth === window.innerWidth && aiSidebar.offsetHeight === window.innerHeight
        } : null
      };
    });
    
    console.log('📊 最终诊断:');
    console.log(`  - 视口: ${finalLayout.viewport.width}x${finalLayout.viewport.height}`);
    
    if (finalLayout.aiWrapper) {
      console.log(`  - AI包装器响应: ${finalLayout.aiWrapper.matchesViewport ? '✅ 正常' : '❌ 异常'}`);
    }
    
    if (finalLayout.aiSidebar) {
      console.log(`  - AI侧边栏响应: ${finalLayout.aiSidebar.matchesViewport ? '✅ 正常' : '❌ 异常'}`);
    }
    
    const hasResponsiveIssues = positioningIssues.length > 0 || 
                               (finalLayout.aiWrapper && !finalLayout.aiWrapper.matchesViewport) ||
                               (finalLayout.aiSidebar && !finalLayout.aiSidebar.matchesViewport);
    
    if (hasResponsiveIssues) {
      console.log('\n⚠️ 发现响应式问题，建议修复:');
      console.log('  1. 检查固定定位元素的尺寸设置');
      console.log('  2. 使用视口单位 (vw, vh) 替代固定像素');
      console.log('  3. 添加窗口resize事件监听');
      console.log('  4. 检查CSS媒体查询规则');
    } else {
      console.log('\n✅ 响应式布局正常工作');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 15秒后关闭浏览器，请观察窗口大小变化效果...');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ AI助手响应式调试完成！');
  }
}

mcpResponsiveDebug().catch(console.error);
