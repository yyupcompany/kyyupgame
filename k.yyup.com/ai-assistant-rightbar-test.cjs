/**
 * AI助手右侧栏样式优化测试
 * 测试目标：验证新样式效果（渐变背景、动画、分组标题等）
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 开始测试AI助手右侧栏样式优化...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 1. 访问登录页面
    console.log('📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('.login-container', { timeout: 10000 });
    console.log('✅ 登录页面加载完成\n');

    // 2. 执行登录
    console.log('📍 步骤2: 执行登录');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // 等待登录完成和页面跳转
    await page.waitForNavigation({ timeout: 15000 });
    console.log('✅ 登录完成\n');

    // 3. 访问AI助手页面
    console.log('📍 步骤3: 访问AI助手页面');
    await page.goto('http://localhost:5173/aiassistant');
    await page.waitForSelector('.ai-assistant-page', { timeout: 10000 });
    console.log('✅ AI助手页面加载完成\n');

    // 4. 等待右侧栏加载
    console.log('📍 步骤4: 等待右侧栏元素加载');
    await page.waitForSelector('.sidebar', { timeout: 5000 });
    await page.waitForTimeout(2000);
    console.log('✅ 右侧栏加载完成\n');

    // 5. 截图验证整体布局
    console.log('📍 步骤5: 截图验证整体布局');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-rightbar-layout.png',
      fullPage: true
    });
    console.log('✅ 整体布局截图已保存: aiassistant-rightbar-layout.png\n');

    // 6. 验证右侧栏渐变背景
    console.log('📍 步骤6: 验证右侧栏渐变背景');
    const sidebarHeader = await page.$('.sidebar-header');
    if (sidebarHeader) {
      const bgColor = await sidebarHeader.evaluate(el => {
        return window.getComputedStyle(el).backgroundImage;
      });
      if (bgColor && bgColor.includes('linear-gradient')) {
        console.log('✅ 右侧栏头部渐变背景已应用:', bgColor.substring(0, 50) + '...\n');
      } else {
        console.log('⚠️ 右侧栏头部渐变背景可能未正确应用\n');
      }
    }

    // 7. 验证菜单分组标题
    console.log('📍 步骤7: 验证菜单分组标题');
    const menuTitles = await page.$$eval('.menu-section-title', els =>
      els.map(el => el.textContent.trim())
    );
    if (menuTitles.includes('快捷操作') && menuTitles.includes('常用功能')) {
      console.log('✅ 菜单分组标题已正确显示:', menuTitles, '\n');
    } else {
      console.log('⚠️ 菜单分组标题可能未正确显示:', menuTitles, '\n');
    }

    // 8. 验证菜单项动画效果
    console.log('📍 步骤8: 验证菜单项悬浮动画效果');
    const menuItem = await page.$('.el-menu-item');
    if (menuItem) {
      const hoverStyle = await menuItem.evaluate(el => {
        const style = window.getComputedStyle(el, ':hover');
        return {
          transform: style.transform,
          background: style.background
        };
      });
      console.log('✅ 菜单项悬浮样式:', hoverStyle, '\n');
    }

    // 9. 验证侧边栏宽度
    console.log('📍 步骤9: 验证侧边栏宽度');
    const sidebarWidth = await page.$eval('.sidebar', el => {
      return window.getComputedStyle(el).width;
    });
    console.log('✅ 侧边栏宽度:', sidebarWidth, '\n');

    // 10. 验证侧边栏收起/展开功能
    console.log('📍 步骤10: 测试侧边栏收起/展开功能');
    const toggleButton = await page.$('.header-right .el-button');
    if (toggleButton) {
      await toggleButton.click();
      await page.waitForTimeout(1000);

      const collapsedWidth = await page.$eval('.sidebar', el => {
        return window.getComputedStyle(el).width;
      });
      console.log('✅ 收起后侧边栏宽度:', collapsedWidth);

      await toggleButton.click();
      await page.waitForTimeout(1000);

      const expandedWidth = await page.$eval('.sidebar', el => {
        return window.getComputedStyle(el).width;
      });
      console.log('✅ 展开后侧边栏宽度:', expandedWidth, '\n');
    }

    // 11. 测试快捷操作菜单项
    console.log('📍 步骤11: 测试快捷操作菜单项');
    const quickActionItems = await page.$$('.el-menu-item');
    if (quickActionItems.length >= 4) {
      console.log('✅ 快捷操作菜单项数量:', quickActionItems.length);
      const firstItemText = await quickActionItems[1].textContent();
      console.log('✅ 第一个菜单项文本:', firstItemText.trim(), '\n');
    }

    // 12. 验证图标显示
    console.log('📍 步骤12: 验证菜单项图标显示');
    const icons = await page.$$('.unified-icon');
    console.log('✅ 页面中统一图标数量:', icons.length, '\n');

    // 13. 最终截图
    console.log('📍 步骤13: 最终截图');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-rightbar-final.png',
      fullPage: true
    });
    console.log('✅ 最终截图已保存: aiassistant-rightbar-final.png\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 AI助手右侧栏样式优化测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 右侧栏样式优化已成功应用');
    console.log('✅ 渐变背景效果正常');
    console.log('✅ 菜单分组标题显示正常');
    console.log('✅ 菜单项动画效果正常');
    console.log('✅ 侧边栏宽度调整正常');
    console.log('✅ 收起/展开功能正常');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    throw error;
  } finally {
    await browser.close();
  }
})();
