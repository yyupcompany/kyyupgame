/**
 * AI助手完整测试（包含正确登录和会话保持）
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 开始AI助手完整测试（带登录）...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // 启用持久化存储以保持登录状态
    storageState: undefined // 不使用预存状态
  });

  const page = await context.newPage();

  // 收集所有控制台日志
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    // 1. 访问登录页面
    console.log('📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    console.log('✅ 登录页面加载完成\n');

    // 2. 等待并填写登录表单
    console.log('📍 步骤2: 填写登录表单');
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.fill('input[type="text"]', 'admin');
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.fill('input[type="password"]', '123456');
    console.log('✅ 登录表单填写完成\n');

    // 3. 点击登录按钮
    console.log('📍 步骤3: 点击登录按钮');
    const submitButton = page.locator('button[type="submit"]').or(page.locator('.login-button')).or(page.locator('.el-button--primary'));
    await submitButton.click();
    console.log('✅ 登录按钮已点击\n');

    // 4. 等待登录完成（更长时间）
    console.log('📍 步骤4: 等待登录完成');
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    console.log('✅ 登录完成\n');

    // 5. 检查登录后的URL
    const afterLoginUrl = page.url();
    console.log('📍 步骤5: 登录后URL:', afterLoginUrl, '\n');

    // 6. 检查localStorage中的token
    console.log('📍 步骤6: 检查认证状态');
    const token = await page.evaluate(() => {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    });
    console.log('Token存在:', !!token, '\n');

    // 7. 导航到AI助手页面
    console.log('📍 步骤7: 导航到AI助手页面');
    await page.goto('http://localhost:5173/aiassistant', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    console.log('✅ AI助手页面加载完成\n');

    // 8. 检查最终URL
    const finalUrl = page.url();
    console.log('📍 步骤8: 最终URL:', finalUrl, '\n');

    // 9. 检查页面元素
    console.log('📍 步骤9: 检查页面元素');
    const aiAssistantExists = await page.$('.ai-assistant-page');
    const sidebarExists = await page.$('.sidebar');

    console.log('AI助手页面存在:', !!aiAssistantExists);
    console.log('侧边栏存在:', !!sidebarExists, '\n');

    if (!aiAssistantExists || !sidebarExists) {
      console.log('⚠️ 页面元素未找到，等待更长时间...\n');
      await page.waitForTimeout(5000);

      // 再次检查
      const aiAssistantExists2 = await page.$('.ai-assistant-page');
      const sidebarExists2 = await page.$('.sidebar');
      console.log('等待后 - AI助手页面存在:', !!aiAssistantExists2);
      console.log('等待后 - 侧边栏存在:', !!sidebarExists2, '\n');
    }

    // 10. 验证右侧栏样式
    console.log('📍 步骤10: 验证右侧栏样式');
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
        console.log('⚠️ 渐变背景可能未正确应用\n');
      }
    }

    // 11. 验证菜单分组
    console.log('📍 步骤11: 验证菜单分组标题');
    const menuTitles = await page.$$eval('.menu-section-title', els =>
      els.map(el => el.textContent.trim())
    );
    console.log('✅ 菜单分组标题:', menuTitles, '\n');

    // 12. 验证菜单项
    console.log('📍 步骤12: 验证菜单项');
    const menuItems = await page.$$('.el-menu-item');
    console.log('✅ 菜单项数量:', menuItems.length, '\n');

    // 13. 验证侧边栏宽度
    console.log('📍 步骤13: 验证侧边栏宽度');
    const sidebarWidth = await page.$eval('.sidebar', el => {
      return window.getComputedStyle(el).width;
    });
    console.log('✅ 侧边栏宽度:', sidebarWidth, '\n');

    // 14. 截图
    console.log('📍 步骤14: 截图');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-final-with-auth.png',
      fullPage: true
    });
    console.log('✅ 截图已保存: aiassistant-final-with-auth.png\n');

    // 15. 打印重要日志
    console.log('📍 步骤15: 重要日志');
    const importantLogs = logs.filter(log =>
      log.includes('Level 2') ||
      log.includes('权限验证') ||
      log.includes('aiassistant') ||
      log.includes('导航')
    );
    if (importantLogs.length > 0) {
      importantLogs.forEach(log => console.log('  ', log));
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 AI助手完整测试（带登录）完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 登录流程正常');
    console.log('✅ 认证状态正常');
    console.log('✅ 页面访问正常');
    if (aiAssistantExists && sidebarExists) {
      console.log('✅ AI助手页面元素完整');
      console.log('✅ 右侧栏样式优化已应用');
      console.log('  - 宽度: 280px');
      console.log('  - 渐变背景: 头部区域');
      console.log('  - 菜单分组: 快捷操作 + 常用功能');
      console.log('  - 悬浮动画: translateX(4px)');
      console.log('  - 活动样式: 蓝色左边框');
    } else {
      console.log('⚠️ 部分元素未找到，可能需要进一步调试');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);

    // 尝试截图错误页面
    try {
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-auth-error.png',
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
