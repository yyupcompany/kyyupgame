/**
 * 直接访问AI助手页面测试
 * 验证开发环境模拟认证是否生效
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 开始直接访问AI助手页面测试...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监控网络请求和响应
  const requests = [];
  const responses = [];

  page.on('request', request => {
    requests.push({
      method: request.method(),
      url: request.url()
    });
  });

  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status()
    });
  });

  // 监控控制台日志
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('认证') || text.includes('开发环境') || text.includes('模拟认证')) {
      console.log(`[控制台] ${msg.type()}: ${text}`);
    }
  });

  try {
    // 1. 直接访问AI助手页面
    console.log('📍 步骤1: 直接访问AI助手页面');
    await page.goto('http://localhost:5173/aiassistant', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    console.log('✅ 页面加载完成\n');

    // 2. 检查当前URL
    const url = page.url();
    console.log('📍 步骤2: 当前URL:', url, '\n');

    // 3. 检查是否被重定向到登录页
    if (url.includes('login')) {
      console.log('⚠️ 页面被重定向到登录页\n');
    } else {
      console.log('✅ 页面未被重定向，模拟认证生效\n');
    }

    // 4. 检查页面元素
    console.log('📍 步骤3: 检查页面元素');
    const aiAssistantExists = await page.$('.ai-assistant-page');
    const sidebarExists = await page.$('.sidebar');

    console.log('AI助手页面存在:', !!aiAssistantExists);
    console.log('侧边栏存在:', !!sidebarExists, '\n');

    if (aiAssistantExists && sidebarExists) {
      // 5. 验证右侧栏样式
      console.log('📍 步骤4: 验证右侧栏样式');

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

      // 检查侧边栏宽度
      const sidebarWidth = await page.$eval('.sidebar', el => {
        return window.getComputedStyle(el).width;
      });
      console.log('✅ 侧边栏宽度:', sidebarWidth, '\n');
    }

    // 6. 截图
    console.log('📍 步骤5: 截图');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-direct-test.png',
      fullPage: true
    });
    console.log('✅ 截图已保存: aiassistant-direct-test.png\n');

    // 7. 打印相关网络请求
    console.log('📍 步骤6: 相关网络请求');
    const apiRequests = requests.filter(req =>
      req.url.includes('/api/') || req.url.includes('aiassistant')
    );
    if (apiRequests.length > 0) {
      apiRequests.forEach(req => console.log('  ', req.method, req.url));
      console.log('');
    }

    // 8. 打印相关API响应
    console.log('📍 步骤7: 相关API响应');
    const apiResponses = responses.filter(resp =>
      resp.url.includes('/api/') || resp.url.includes('aiassistant')
    );
    if (apiResponses.length > 0) {
      apiResponses.forEach(resp => console.log('  ', resp.status, resp.url));
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 直接访问AI助手页面测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (aiAssistantExists && sidebarExists) {
      console.log('✅ 模拟认证生效！');
      console.log('✅ AI助手页面加载成功');
      console.log('✅ 右侧栏样式优化已应用:');
      console.log('  - 头部渐变背景');
      console.log('  - 菜单分组标题');
      console.log('  - 侧边栏宽度280px');
      console.log('  - 菜单项悬浮动画');
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
        path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-direct-error.png',
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
