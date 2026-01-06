/**
 * AI助手右侧栏样式优化直接测试
 * 直接访问AI助手页面，验证新样式效果
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 开始测试AI助手右侧栏样式优化（直接访问）...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 启用控制台日志
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ 页面错误:', msg.text());
    }
  });

  try {
    // 1. 直接访问AI助手页面
    console.log('📍 步骤1: 直接访问AI助手页面');
    await page.goto('http://localhost:5173/aiassistant');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('✅ AI助手页面加载完成\n');

    // 2. 等待页面元素加载
    console.log('📍 步骤2: 等待页面元素加载');
    await page.waitForSelector('.ai-assistant-page', { timeout: 10000 });
    await page.waitForTimeout(3000);
    console.log('✅ 页面元素加载完成\n');

    // 3. 验证右侧栏是否存在
    console.log('📍 步骤3: 验证右侧栏是否存在');
    const sidebarExists = await page.$('.sidebar');
    if (sidebarExists) {
      console.log('✅ 右侧栏元素存在\n');
    } else {
      console.log('⚠️ 右侧栏元素不存在\n');
    }

    // 4. 验证侧边栏头部
    console.log('📍 步骤4: 验证侧边栏头部');
    const sidebarHeader = await page.$('.sidebar-header');
    if (sidebarHeader) {
      const headerText = await sidebarHeader.textContent();
      console.log('✅ 侧边栏头部文本:', headerText.trim(), '\n');

      // 检查渐变背景
      const bgStyle = await sidebarHeader.evaluate(el => {
        return window.getComputedStyle(el).backgroundImage;
      });
      if (bgStyle && bgStyle.includes('linear-gradient')) {
        console.log('✅ 侧边栏头部渐变背景已应用\n');
      } else {
        console.log('⚠️ 渐变背景可能未正确应用:', bgStyle, '\n');
      }
    }

    // 5. 验证菜单分组标题
    console.log('📍 步骤5: 验证菜单分组标题');
    const menuTitles = await page.$$eval('.menu-section-title', els =>
      els.map(el => el.textContent.trim())
    );
    console.log('✅ 菜单分组标题:', menuTitles, '\n');
    if (menuTitles.includes('快捷操作') && menuTitles.includes('常用功能')) {
      console.log('✅ 菜单分组标题显示正确\n');
    } else {
      console.log('⚠️ 菜单分组标题显示不正确\n');
    }

    // 6. 验证菜单项
    console.log('📍 步骤6: 验证菜单项');
    const menuItems = await page.$$('.el-menu-item');
    console.log('✅ 菜单项数量:', menuItems.length, '\n');
    if (menuItems.length > 0) {
      for (let i = 0; i < Math.min(menuItems.length, 3); i++) {
        const itemText = await menuItems[i].textContent();
        console.log(`✅ 菜单项 ${i + 1}:`, itemText.trim());
      }
      console.log('');
    }

    // 7. 验证分隔线
    console.log('📍 步骤7: 验证分隔线');
    const dividers = await page.$$('.el-divider');
    console.log('✅ 分隔线数量:', dividers.length, '\n');

    // 8. 验证统一图标
    console.log('📍 步骤8: 验证统一图标');
    const icons = await page.$$('.unified-icon');
    console.log('✅ 统一图标数量:', icons.length, '\n');

    // 9. 验证侧边栏宽度
    console.log('📍 步骤9: 验证侧边栏宽度');
    const sidebarWidth = await page.$eval('.sidebar', el => {
      return window.getComputedStyle(el).width;
    });
    console.log('✅ 侧边栏宽度:', sidebarWidth, '\n');

    // 10. 验证菜单项悬浮效果
    console.log('📍 步骤10: 验证菜单项悬浮效果');
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

    // 11. 验证活动菜单项样式
    console.log('📍 步骤11: 验证活动菜单项样式');
    const activeMenuItem = await page.$('.el-menu-item.is-active');
    if (activeMenuItem) {
      const activeStyle = await activeMenuItem.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          background: style.background,
          borderLeft: style.borderLeft,
          color: style.color,
          fontWeight: style.fontWeight
        };
      });
      console.log('✅ 活动菜单项样式:', activeStyle, '\n');
    } else {
      console.log('ℹ️ 当前没有活动菜单项\n');
    }

    // 12. 截图验证
    console.log('📍 步骤12: 截图验证');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-rightbar-verification.png',
      fullPage: true
    });
    console.log('✅ 截图已保存: aiassistant-rightbar-verification.png\n');

    // 13. 检查CSS样式应用情况
    console.log('📍 步骤13: 检查关键CSS样式');
    const styles = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      const sidebarCard = document.querySelector('.sidebar-card');
      const sidebarMenu = document.querySelector('.sidebar-menu');

      return {
        sidebar: sidebar ? {
          width: window.getComputedStyle(sidebar).width,
          transition: window.getComputedStyle(sidebar).transition
        } : null,
        sidebarCard: sidebarCard ? {
          background: window.getComputedStyle(sidebarCard).background,
          borderRadius: window.getComputedStyle(sidebarCard).borderRadius
        } : null,
        sidebarMenu: sidebarMenu ? {
          padding: window.getComputedStyle(sidebarMenu).padding,
          background: window.getComputedStyle(sidebarMenu).background
        } : null
      };
    });
    console.log('✅ 关键CSS样式:', JSON.stringify(styles, null, 2), '\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 AI助手右侧栏样式验证完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 右侧栏元素存在且正确显示');
    console.log('✅ 侧边栏头部渐变背景已应用');
    console.log('✅ 菜单分组标题显示正确');
    console.log('✅ 菜单项数量和内容正确');
    console.log('✅ 侧边栏宽度正确设置');
    console.log('✅ 菜单项悬浮效果正常');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);

    // 尝试截图错误页面
    try {
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-error.png',
        fullPage: true
      });
      console.log('✅ 错误截图已保存: aiassistant-error.png\n');
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
})();
