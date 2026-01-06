const { chromium } = require('playwright');

async function mcpBrowserAICheck() {
  console.log('🌐 使用MCP浏览器检查AI助手页面主题切换');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    devtools: true // 打开开发者工具便于观察
  });
  
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 步骤1：登录系统 ===');
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
    
    // 登录
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    
    console.log('✅ 登录成功');
    
    console.log('\n=== 步骤2：进入AI助手页面 ===');
    
    // 点击AI助手按钮
    const aiButton = page.locator('button').filter({ hasText: 'YY-AI' }).first();
    await aiButton.click();
    await page.waitForTimeout(5000);
    
    console.log('✅ 已进入AI助手页面');
    
    console.log('\n=== 步骤3：检查明亮主题状态 ===');
    
    // 检查当前主题状态
    const lightThemeState = await page.evaluate(() => {
      return {
        // 页面包装器样式
        wrapperStyles: (() => {
          const wrapper = document.querySelector('.ai-chat-interface-page');
          if (!wrapper) return null;
          const style = window.getComputedStyle(wrapper);
          return {
            background: style.background,
            backgroundColor: style.backgroundColor,
            position: style.position,
            zIndex: style.zIndex,
            width: style.width,
            height: style.height
          };
        })(),
        
        // AI助手组件样式
        aiAssistantStyles: (() => {
          const aiAssistant = document.querySelector('.ai-assistant-wrapper');
          if (!aiAssistant) return null;
          const style = window.getComputedStyle(aiAssistant);
          return {
            background: style.background,
            backgroundColor: style.backgroundColor,
            position: style.position,
            width: style.width,
            height: style.height
          };
        })(),
        
        // 全屏布局样式
        fullscreenStyles: (() => {
          const fullscreen = document.querySelector('.ai-assistant-fullscreen');
          if (!fullscreen) return null;
          const style = window.getComputedStyle(fullscreen);
          return {
            background: style.background,
            backgroundColor: style.backgroundColor,
            position: style.position,
            zIndex: style.zIndex,
            display: style.display
          };
        })(),
        
        // 中心区域样式
        centerStyles: (() => {
          const center = document.querySelector('.center-main');
          if (!center) return null;
          const style = window.getComputedStyle(center);
          return {
            background: style.background,
            backgroundColor: style.backgroundColor,
            display: style.display,
            flex: style.flex
          };
        })(),
        
        // 左侧栏样式
        leftSidebarStyles: (() => {
          const sidebar = document.querySelector('.conversations-sidebar');
          if (!sidebar) return null;
          const style = window.getComputedStyle(sidebar);
          return {
            background: style.background,
            backgroundColor: style.backgroundColor,
            backdropFilter: style.backdropFilter,
            width: style.width
          };
        })(),
        
        // 右侧栏样式
        rightSidebarStyles: (() => {
          const sidebar = document.querySelector('.right-sidebar, .tool-sidebar');
          if (!sidebar) return null;
          const style = window.getComputedStyle(sidebar);
          return {
            background: style.background,
            backgroundColor: style.backgroundColor,
            backdropFilter: style.backdropFilter,
            width: style.width,
            display: style.display
          };
        })(),
        
        // 检查主题相关的CSS变量
        cssVariables: (() => {
          const root = document.documentElement;
          const style = window.getComputedStyle(root);
          return {
            '--el-bg-color': style.getPropertyValue('--el-bg-color'),
            '--el-bg-color-page': style.getPropertyValue('--el-bg-color-page'),
            '--el-text-color-primary': style.getPropertyValue('--el-text-color-primary'),
            '--el-border-color': style.getPropertyValue('--el-border-color'),
            '--el-color-primary': style.getPropertyValue('--el-color-primary')
          };
        })(),
        
        // 检查body类名
        bodyClasses: document.body.className,
        
        // 检查是否有主题切换按钮
        themeToggleExists: !!document.querySelector('.theme-toggle, [class*="theme"]')
      };
    });
    
    console.log('明亮主题状态检查:');
    console.log('  页面包装器背景:', lightThemeState.wrapperStyles?.background || '未找到');
    console.log('  全屏布局背景:', lightThemeState.fullscreenStyles?.background || '未找到');
    console.log('  中心区域背景:', lightThemeState.centerStyles?.background || '未找到');
    console.log('  CSS变量 --el-bg-color:', lightThemeState.cssVariables['--el-bg-color']);
    console.log('  Body类名:', lightThemeState.bodyClasses);
    console.log('  主题切换按钮:', lightThemeState.themeToggleExists ? '✅ 存在' : '❌ 不存在');
    
    console.log('\n=== 步骤4：切换到暗黑主题 ===');
    
    // 查找主题切换按钮
    const themeToggle = page.locator('.theme-toggle, button').filter({ hasText: /主题|theme|dark|light/i }).first();
    const themeToggleExists = await themeToggle.count() > 0;
    
    if (themeToggleExists) {
      await themeToggle.click();
      await page.waitForTimeout(2000);
      console.log('✅ 已点击主题切换按钮');
    } else {
      console.log('⚠️ 未找到主题切换按钮，尝试其他方式');
      
      // 尝试通过键盘快捷键切换主题
      await page.keyboard.press('Control+Shift+T');
      await page.waitForTimeout(2000);
    }
    
    console.log('\n=== 步骤5：检查暗黑主题状态 ===');
    
    const darkThemeState = await page.evaluate(() => {
      return {
        // 页面包装器样式
        wrapperStyles: (() => {
          const wrapper = document.querySelector('.ai-chat-interface-page');
          if (!wrapper) return null;
          const style = window.getComputedStyle(wrapper);
          return {
            background: style.background,
            backgroundColor: style.backgroundColor
          };
        })(),
        
        // 全屏布局样式
        fullscreenStyles: (() => {
          const fullscreen = document.querySelector('.ai-assistant-fullscreen');
          if (!fullscreen) return null;
          const style = window.getComputedStyle(fullscreen);
          return {
            background: style.background,
            backgroundColor: style.backgroundColor
          };
        })(),
        
        // CSS变量
        cssVariables: (() => {
          const root = document.documentElement;
          const style = window.getComputedStyle(root);
          return {
            '--el-bg-color': style.getPropertyValue('--el-bg-color'),
            '--el-bg-color-page': style.getPropertyValue('--el-bg-color-page'),
            '--el-text-color-primary': style.getPropertyValue('--el-text-color-primary')
          };
        })(),
        
        // Body类名
        bodyClasses: document.body.className,
        
        // 检查是否有暗黑主题相关的类
        hasDarkClass: document.body.classList.contains('dark') || 
                     document.documentElement.classList.contains('dark') ||
                     document.querySelector('.dark') !== null
      };
    });
    
    console.log('暗黑主题状态检查:');
    console.log('  页面包装器背景:', darkThemeState.wrapperStyles?.background || '未找到');
    console.log('  全屏布局背景:', darkThemeState.fullscreenStyles?.background || '未找到');
    console.log('  CSS变量 --el-bg-color:', darkThemeState.cssVariables['--el-bg-color']);
    console.log('  Body类名:', darkThemeState.bodyClasses);
    console.log('  暗黑主题类:', darkThemeState.hasDarkClass ? '✅ 存在' : '❌ 不存在');
    
    console.log('\n=== 步骤6：对比分析 ===');
    
    // 对比明亮和暗黑主题的差异
    const comparison = {
      wrapperBackgroundChanged: lightThemeState.wrapperStyles?.background !== darkThemeState.wrapperStyles?.background,
      fullscreenBackgroundChanged: lightThemeState.fullscreenStyles?.background !== darkThemeState.fullscreenStyles?.background,
      cssVariablesChanged: lightThemeState.cssVariables['--el-bg-color'] !== darkThemeState.cssVariables['--el-bg-color'],
      bodyClassesChanged: lightThemeState.bodyClasses !== darkThemeState.bodyClasses
    };
    
    console.log('主题切换对比:');
    console.log(`  页面包装器背景变化: ${comparison.wrapperBackgroundChanged ? '✅' : '❌'}`);
    console.log(`  全屏布局背景变化: ${comparison.fullscreenBackgroundChanged ? '✅' : '❌'}`);
    console.log(`  CSS变量变化: ${comparison.cssVariablesChanged ? '✅' : '❌'}`);
    console.log(`  Body类名变化: ${comparison.bodyClassesChanged ? '✅' : '❌'}`);
    
    console.log('\n=== 步骤7：检查样式不一致问题 ===');
    
    const inconsistencies = await page.evaluate(() => {
      const issues = [];
      
      // 检查页面包装器和AI助手组件的样式一致性
      const wrapper = document.querySelector('.ai-chat-interface-page');
      const aiAssistant = document.querySelector('.ai-assistant-wrapper');
      const fullscreen = document.querySelector('.ai-assistant-fullscreen');
      
      if (wrapper && aiAssistant) {
        const wrapperStyle = window.getComputedStyle(wrapper);
        const aiAssistantStyle = window.getComputedStyle(aiAssistant);
        
        // 检查背景色一致性
        if (wrapperStyle.backgroundColor !== aiAssistantStyle.backgroundColor) {
          issues.push({
            type: 'background-mismatch',
            description: '页面包装器和AI助手组件背景色不一致',
            wrapper: wrapperStyle.backgroundColor,
            aiAssistant: aiAssistantStyle.backgroundColor
          });
        }
        
        // 检查位置样式一致性
        if (wrapperStyle.position !== 'fixed' && aiAssistantStyle.position !== 'relative') {
          issues.push({
            type: 'position-mismatch',
            description: '页面包装器和AI助手组件位置样式不匹配',
            wrapper: wrapperStyle.position,
            aiAssistant: aiAssistantStyle.position
          });
        }
      }
      
      if (wrapper && fullscreen) {
        const wrapperStyle = window.getComputedStyle(wrapper);
        const fullscreenStyle = window.getComputedStyle(fullscreen);
        
        // 检查z-index层级
        const wrapperZIndex = parseInt(wrapperStyle.zIndex) || 0;
        const fullscreenZIndex = parseInt(fullscreenStyle.zIndex) || 0;
        
        if (wrapperZIndex >= fullscreenZIndex) {
          issues.push({
            type: 'zindex-conflict',
            description: '页面包装器z-index可能覆盖全屏布局',
            wrapper: wrapperZIndex,
            fullscreen: fullscreenZIndex
          });
        }
      }
      
      // 检查是否有重复的全屏样式
      const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' && 
               (style.top === '0px' || style.top === '0') &&
               (style.left === '0px' || style.left === '0') &&
               (style.width === '100vw' || style.width === '100%') &&
               (style.height === '100vh' || style.height === '100%');
      });
      
      if (fixedElements.length > 1) {
        issues.push({
          type: 'duplicate-fullscreen',
          description: '发现多个全屏固定定位元素',
          count: fixedElements.length,
          elements: fixedElements.map(el => el.className)
        });
      }
      
      return issues;
    });
    
    console.log('样式不一致问题检查:');
    if (inconsistencies.length === 0) {
      console.log('  ✅ 未发现明显的样式不一致问题');
    } else {
      inconsistencies.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.type}: ${issue.description}`);
        if (issue.wrapper && issue.aiAssistant) {
          console.log(`     包装器: ${issue.wrapper}, AI助手: ${issue.aiAssistant}`);
        }
        if (issue.count) {
          console.log(`     数量: ${issue.count}, 元素: ${issue.elements.join(', ')}`);
        }
      });
    }
    
    console.log('\n=== 🎯 总结和建议 ===');
    
    const recommendations = [];
    
    if (!comparison.wrapperBackgroundChanged && !comparison.fullscreenBackgroundChanged) {
      recommendations.push('主题切换可能没有正确应用到AI助手页面');
    }
    
    if (inconsistencies.some(issue => issue.type === 'background-mismatch')) {
      recommendations.push('需要统一页面包装器和AI助手组件的背景样式');
    }
    
    if (inconsistencies.some(issue => issue.type === 'duplicate-fullscreen')) {
      recommendations.push('需要移除重复的全屏样式，避免样式冲突');
    }
    
    if (!lightThemeState.themeToggleExists) {
      recommendations.push('需要确保主题切换按钮在AI助手页面中可用');
    }
    
    console.log('修复建议:');
    if (recommendations.length === 0) {
      console.log('  ✅ AI助手页面主题切换工作正常');
    } else {
      recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    
    return {
      lightTheme: lightThemeState,
      darkTheme: darkThemeState,
      comparison,
      inconsistencies,
      recommendations
    };
    
  } catch (error) {
    console.error('❌ MCP浏览器检查过程中出现错误:', error);
    return { success: false, error: error.message };
  } finally {
    console.log('\n⏳ 保持浏览器打开30秒供手动检查...');
    await page.waitForTimeout(30000);
    await browser.close();
    console.log('✅ MCP浏览器AI助手检查完成！');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  mcpBrowserAICheck().then(result => {
    console.log('\n🎯 MCP浏览器检查完成');
  }).catch(console.error);
}

module.exports = { mcpBrowserAICheck };
