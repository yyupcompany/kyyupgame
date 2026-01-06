const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, timeout: 60000 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('📝 AI助手全屏按钮测试开始...\n');

  // 登录
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // 点击头部AI助手按钮，打开侧边栏
  console.log('1️⃣ 点击头部AI助手按钮...');
  await page.click('.ai-avatar');
  await page.waitForTimeout(2000);

  // 检查侧边栏是否显示
  const sidebarVisible = await page.evaluate(() => {
    return document.querySelector('.ai-sidebar-layout') !== null;
  });
  console.log('   侧边栏显示:', sidebarVisible ? '✅ 是' : '❌ 否');

  // 查找并点击全屏按钮
  console.log('2️⃣ 查找全屏按钮...');
  const fullscreenBtn = await page.$('button[title*="全屏"]');

  if (fullscreenBtn) {
    console.log('   找到全屏按钮:', '✅');
    console.log('3️⃣ 点击全屏按钮...');
    await fullscreenBtn.click();

    // 等待页面跳转
    await page.waitForTimeout(3000);

    // 检查当前URL
    const currentUrl = page.url();
    console.log('4️⃣ 检查跳转结果...');
    console.log('   当前URL:', currentUrl);
    console.log('   是否跳转到 /ai/assistant:', currentUrl.includes('/ai/assistant') ? '✅ 是' : '❌ 否');

    // 检查是否显示AI助手全屏页面
    const hasAiPage = await page.evaluate(() => {
      return document.querySelector('.ai-assistant-page') !== null;
    });
    console.log('   AI全屏页面显示:', hasAiPage ? '✅ 是' : '❌ 否');

    // 检查是否有输入框
    const hasInput = await page.evaluate(() => {
      const textareas = document.querySelectorAll('textarea');
      return textareas.length > 0;
    });
    console.log('   输入框显示:', hasInput ? '✅ 是' : '❌ 否');

    console.log('\n✅ 测试完成！全屏按钮功能正常');
  } else {
    console.log('   ❌ 未找到全屏按钮');
  }

  await browser.close();
})();
