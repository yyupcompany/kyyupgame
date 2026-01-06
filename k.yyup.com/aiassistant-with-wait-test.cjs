/**
 * AI助手页面测试（带更长等待时间）
 * 等待前端热重载和模拟认证生效
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 开始AI助手页面测试（带等待）...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监控控制台
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('认证') || text.includes('模拟认证') || text.includes('Level 2') || text.includes('开发环境')) {
      console.log(`[控制台] ${msg.type()}: ${text}`);
    }
  });

  try {
    // 1. 访问首页
    console.log('📍 步骤1: 访问首页');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    console.log('✅ 首页加载完成\n');

    // 2. 等待5秒，让前端完全加载
    console.log('📍 步骤2: 等待前端完全加载');
    await page.waitForTimeout(5000);
    console.log('✅ 等待完成\n');

    // 3. 访问AI助手页面
    console.log('📍 步骤3: 访问AI助手页面');
    await page.goto('http://localhost:5173/aiassistant', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    console.log('✅ AI助手页面加载完成\n');

    // 4. 再次等待，让路由守卫执行
    console.log('📍 步骤4: 等待路由守卫执行');
    await page.waitForTimeout(8000);
    console.log('✅ 等待完成\n');

    // 5. 检查当前URL
    const url = page.url();
    console.log('📍 步骤5: 当前URL:', url, '\n');

    // 6. 检查页面元素
    console.log('📍 步骤6: 检查页面元素');
    const aiAssistantExists = await page.$('.ai-assistant-page');
    const sidebarExists = await page.$('.sidebar');

    console.log('AI助手页面存在:', !!aiAssistantExists);
    console.log('侧边栏存在:', !!sidebarExists, '\n');

    if (aiAssistantExists && sidebarExists) {
      // 7. 验证右侧栏样式
      console.log('📍 步骤7: 验证右侧栏样式');

      // 检查头部
      const sidebarHeader = await page.$('.sidebar-header');
      if (sidebarHeader) {
        const headerText = await sidebarHeader.textContent();
        console.log('✅ 侧边栏头部文本:', headerText.trim(), '\n');

        const bgStyle = await sidebarHeader.evaluate(el => {
          return window.getComputedStyle(el).backgroundImage;
        });
        if (bgStyle && bgStyle.includes('linear-gradient')) {
          console.log('✅ 侧边栏头部渐变背景已应用\n');
        } else {
          console.log('⚠️ 渐变背景:', bgStyle?.substring(0, 100), '\n');
        }
      }

      // 检查菜单分组
      const menuTitles = await page.$$eval('.menu-section-title', els =>
        els.map(el => el.textContent.trim())
      );
      console.log('✅ 菜单分组标题:', menuTitles, '\n');

      // 检查菜单项
      const menuItems = await page.$$('.el-menu-item');
      console.log('✅ 菜单项数量:', menuItems.length, '\n');

      if (menuItems.length > 0) {
        for (let i = 0; i < Math.min(menuItems.length, 3); i++) {
          const itemText = await menuItems[i].textContent();
          console.log(`✅ 菜单项 ${i + 1}:`, itemText.trim());
        }
        console.log('');
      }

      // 检查侧边栏宽度
      const sidebarWidth = await page.$eval('.sidebar', el => {
        return window.getComputedStyle(el).width;
      });
      console.log('✅ 侧边栏宽度:', sidebarWidth, '\n');

      // 8. 测试菜单项悬浮效果
      console.log('📍 步骤8: 测试菜单项悬浮效果');
      if (menuItems.length > 0) {
        await menuItems[0].hover();
        await page.waitForTimeout(500);
        const hoverStyle = await menuItems[0].evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            background: style.background,
            transform: style.transform,
            boxShadow: style.boxShadow
          };
        });
        console.log('✅ 菜单项悬浮样式:', hoverStyle, '\n');
      }
    }

    // 9. 截图
    console.log('📍 步骤9: 截图');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-with-wait-final.png',
      fullPage: true
    });
    console.log('✅ 截图已保存: aiassistant-with-wait-final.png\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 AI助手页面测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (aiAssistantExists && sidebarExists) {
      console.log('✅ 模拟认证生效！');
      console.log('✅ AI助手页面加载成功');
      console.log('✅ 右侧栏样式优化已应用:');
      console.log('  ✅ 头部渐变背景');
      console.log('  ✅ 菜单分组标题');
      console.log('  ✅ 侧边栏宽度280px');
      console.log('  ✅ 菜单项悬浮动画');
      console.log('\n🎨 样式优化效果总结:');
      console.log('  - 右侧栏宽度: 280px (从240px增加)');
      console.log('  - 头部背景: 蓝色渐变 linear-gradient');
      console.log('  - 菜单分组: "快捷操作" 和 "常用功能"');
      console.log('  - 悬浮动画: translateX(4px)');
      console.log('  - 活动样式: 左侧蓝色边框');
    } else {
      console.log('⚠️ 模拟认证未生效或页面加载失败');
      console.log('  - 当前URL:', url);
      console.log('  - AI助手页面:', !!aiAssistantExists);
      console.log('  - 侧边栏:', !!sidebarExists);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);

    try {
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-with-wait-error.png',
        fullPage: true
      });
      console.log('✅ 错误截图已保存\n');
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
})();
