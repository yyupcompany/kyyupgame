const { chromium } = require('playwright');

async function performLoginAndScreenshots() {
  const browser = await chromium.launch({
    headless: true,   // 无头模式运行
    slowMo: 500       // 适当减慢操作速度
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('🚀 开始访问登录页面...');

    // 1. 访问登录页面
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 截图登录页面
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/login-page.png',
      fullPage: true
    });
    console.log('✅ 登录页面截图完成');

    // 定义角色配置
    const roles = [
      { name: 'Admin', selector: 'button:has-text("Admin")' },
      { name: '园长', selector: 'button:has-text("园长")' },
      { name: '老师', selector: 'button:has-text("老师")' },
      { name: '家长', selector: 'button:has-text("家长")' }
    ];

    // 依次测试每个角色
    for (const role of roles) {
      console.log(`🔄 开始测试 ${role.name} 角色登录...`);

      try {
        // 点击登录按钮
        await page.click(role.selector);
        console.log(`点击了 ${role.name} 登录按钮`);

        // 等待页面加载
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle');

        // 截图角色主页面
        const filename = `/home/zhgue/kyyupgame/k.yyup.com/${role.name.toLowerCase()}-dashboard.png`;
        await page.screenshot({
          path: filename,
          fullPage: true
        });
        console.log(`✅ ${role.name} 主页面截图完成: ${filename}`);

        // 如果不是最后一个角色，返回登录页面测试下一个
        if (role.name !== '家长') {
          console.log('🔄 返回登录页面...');
          await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);
        }

      } catch (error) {
        console.error(`❌ ${role.name} 角色测试失败:`, error.message);

        // 尝试截图当前状态以便调试
        await page.screenshot({
          path: `/home/zhgue/kyyupgame/k.yyup.com/${role.name.toLowerCase()}-error.png`,
          fullPage: true
        });
      }
    }

    console.log('🎉 所有截图任务完成！');

  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

// 执行任务
performLoginAndScreenshots().catch(console.error);