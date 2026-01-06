const { chromium } = require('playwright');

async function detectSidebarAIPanel() {
  console.log('🔍 MCP动态检测：登录后侧边栏AI助手面板问题');
  
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
    
    // 登录前检查侧边栏状态
    console.log('🔍 登录前侧边栏状态检查...');
    
    const preLoginSidebars = await page.locator('[class*="sidebar"], [class*="侧边栏"], [class*="ai"]').all();
    console.log(`📋 登录前侧边栏相关元素: ${preLoginSidebars.length}个`);
    
    for (let i = 0; i < Math.min(preLoginSidebars.length, 5); i++) {
      const element = preLoginSidebars[i];
      const className = await element.getAttribute('class');
      const isVisible = await element.isVisible();
      console.log(`  元素${i + 1}: class="${className}", 可见=${isVisible}`);
    }
    
    console.log('\n=== 步骤2：执行登录 ===');
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    
    await page.waitForTimeout(5000);
    console.log('✅ 登录完成');
    
    console.log('\n=== 步骤3：登录后立即检查侧边栏 ===');
    
    // 检查所有可能的侧边栏元素
    const sidebarSelectors = [
      '.sidebar',
      '.side-bar', 
      '.left-sidebar',
      '.right-sidebar',
      '[class*="sidebar"]',
      '[class*="side-bar"]',
      '[class*="侧边栏"]',
      '.ai-assistant',
      '.ai-panel',
      '[class*="ai-assistant"]',
      '[class*="ai-panel"]',
      '.el-drawer',
      '.el-aside'
    ];
    
    console.log('🔍 检查各种侧边栏选择器...');
    
    for (const selector of sidebarSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`\n📋 发现 ${selector}: ${elements.length}个`);
        
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const className = await element.getAttribute('class') || '';
          const id = await element.getAttribute('id') || '';
          const text = await element.textContent();
          const boundingBox = await element.boundingBox();
          
          console.log(`  ${selector}[${i}]:`);
          console.log(`    - 可见: ${isVisible}`);
          console.log(`    - class: "${className}"`);
          console.log(`    - id: "${id}"`);
          console.log(`    - 位置: ${boundingBox ? `x:${boundingBox.x}, y:${boundingBox.y}, w:${boundingBox.width}, h:${boundingBox.height}` : '无'}`);
          console.log(`    - 内容: "${text?.substring(0, 100)}..."`);
          
          // 检查是否包含AI助手相关内容
          if (text && (text.includes('AI') || text.includes('助手') || text.includes('YY-AI'))) {
            console.log(`    ⚠️ 包含AI助手相关内容！`);
          }
        }
      }
    }
    
    console.log('\n=== 步骤4：检查AI助手相关元素 ===');
    
    // 专门检查AI助手相关元素
    const aiSelectors = [
      'button:has-text("YY-AI")',
      'button:has-text("AI助手")',
      'button:has-text("AI")',
      '[class*="ai-assistant"]',
      '[class*="ai-toggle"]',
      '[class*="ai-button"]'
    ];
    
    for (const selector of aiSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`\n🤖 发现AI元素 ${selector}: ${elements.length}个`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const text = await element.textContent();
          const className = await element.getAttribute('class') || '';
          
          console.log(`  AI元素[${i}]: 可见=${isVisible}, class="${className}", 文本="${text}"`);
        }
      }
    }
    
    console.log('\n=== 步骤5：检查布局结构 ===');
    
    // 检查主要布局结构
    const layoutElements = await page.evaluate(() => {
      const elements = [];
      
      // 查找所有可能的布局容器
      const selectors = [
        '.main-layout',
        '.layout',
        '.container',
        '.wrapper',
        '.app',
        '#app'
      ];
      
      selectors.forEach(selector => {
        const els = document.querySelectorAll(selector);
        els.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          elements.push({
            selector: `${selector}[${index}]`,
            className: el.className,
            id: el.id,
            visible: rect.width > 0 && rect.height > 0,
            position: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            children: el.children.length,
            hasAIContent: el.textContent.includes('AI') || el.textContent.includes('助手')
          });
        });
      });
      
      return elements;
    });
    
    console.log('🏗️ 布局结构分析:');
    layoutElements.forEach(el => {
      console.log(`  ${el.selector}:`);
      console.log(`    - 可见: ${el.visible}`);
      console.log(`    - 位置: x:${el.position.x}, y:${el.position.y}, w:${el.position.width}, h:${el.position.height}`);
      console.log(`    - 子元素: ${el.children}个`);
      console.log(`    - 包含AI内容: ${el.hasAIContent ? '✅' : '❌'}`);
    });
    
    console.log('\n=== 步骤6：检查Vue组件状态 ===');
    
    // 检查Vue组件的状态
    const vueComponentInfo = await page.evaluate(() => {
      const app = document.querySelector('#app');
      if (!app) return { hasVue: false };
      
      // 查找所有Vue组件
      const vueComponents = document.querySelectorAll('[data-v-]');
      const aiComponents = [];
      
      vueComponents.forEach((comp, index) => {
        const className = comp.className;
        const text = comp.textContent;
        
        if (className.includes('ai') || className.includes('assistant') || 
            text.includes('AI') || text.includes('助手')) {
          const rect = comp.getBoundingClientRect();
          aiComponents.push({
            index,
            className,
            visible: rect.width > 0 && rect.height > 0,
            position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            textContent: text.substring(0, 100)
          });
        }
      });
      
      return {
        hasVue: true,
        totalComponents: vueComponents.length,
        aiComponents
      };
    });
    
    console.log('🔧 Vue组件分析:');
    console.log(`  - Vue应用: ${vueComponentInfo.hasVue ? '✅' : '❌'}`);
    console.log(`  - 总组件数: ${vueComponentInfo.totalComponents || 0}`);
    console.log(`  - AI相关组件: ${vueComponentInfo.aiComponents?.length || 0}个`);
    
    if (vueComponentInfo.aiComponents && vueComponentInfo.aiComponents.length > 0) {
      vueComponentInfo.aiComponents.forEach((comp, i) => {
        console.log(`    AI组件${i + 1}:`);
        console.log(`      - 可见: ${comp.visible}`);
        console.log(`      - 位置: x:${comp.position.x}, y:${comp.position.y}`);
        console.log(`      - 内容: "${comp.textContent}..."`);
      });
    }
    
    console.log('\n=== 步骤7：检查路由状态 ===');
    
    // 检查当前路由
    const routeInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        pathname: window.location.pathname,
        hash: window.location.hash,
        search: window.location.search
      };
    });
    
    console.log('🛣️ 路由信息:');
    console.log(`  - URL: ${routeInfo.url}`);
    console.log(`  - 路径: ${routeInfo.pathname}`);
    console.log(`  - Hash: ${routeInfo.hash}`);
    console.log(`  - 查询: ${routeInfo.search}`);
    
    console.log('\n=== 🎯 问题分析总结 ===');
    
    // 分析可能的问题原因
    const issues = [];
    
    if (vueComponentInfo.aiComponents && vueComponentInfo.aiComponents.length > 0) {
      const visibleAIComponents = vueComponentInfo.aiComponents.filter(c => c.visible);
      if (visibleAIComponents.length > 0) {
        issues.push(`发现${visibleAIComponents.length}个可见的AI组件自动显示`);
      }
    }
    
    // 检查是否有自动打开的面板
    const autoOpenPanels = await page.locator('.el-drawer[style*="display: block"], .el-dialog[style*="display: block"], [class*="visible"], [class*="open"]').all();
    if (autoOpenPanels.length > 0) {
      issues.push(`发现${autoOpenPanels.length}个自动打开的面板`);
    }
    
    console.log('⚠️ 发现的问题:');
    if (issues.length > 0) {
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    } else {
      console.log('  未发现明显问题');
    }
    
    console.log('\n💡 建议解决方案:');
    console.log('  1. 检查Vue组件的默认状态设置');
    console.log('  2. 检查路由守卫是否自动打开AI助手');
    console.log('  3. 检查localStorage中是否保存了AI助手状态');
    console.log('  4. 检查组件的mounted生命周期是否自动显示');
    
  } catch (error) {
    console.error('❌ 检测过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ MCP侧边栏AI助手检测完成！');
  }
}

detectSidebarAIPanel().catch(console.error);
