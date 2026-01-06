/**
 * 简单页面访问测试
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 开始简单页面访问测试...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 1. 访问根路径
    console.log('📍 步骤1: 访问根路径');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('✅ 根路径访问成功\n');

    // 2. 检查当前URL
    const currentUrl = page.url();
    console.log('📍 步骤2: 当前URL:', currentUrl, '\n');

    // 3. 检查页面标题
    const title = await page.title();
    console.log('📍 步骤3: 页面标题:', title, '\n');

    // 4. 截图根路径
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/homepage-test.png',
      fullPage: true
    });
    console.log('✅ 根路径截图已保存: homepage-test.png\n');

    // 5. 直接访问aiassistant页面
    console.log('📍 步骤5: 直接访问aiassistant页面');
    await page.goto('http://localhost:5173/aiassistant');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const aiUrl = page.url();
    console.log('📍 AI助手页面URL:', aiUrl, '\n');

    // 6. 检查页面内容
    const bodyText = await page.textContent('body');
    console.log('📍 步骤6: 页面内容长度:', bodyText.length, '\n');

    // 7. 检查是否有错误
    const hasError = await page.evaluate(() => {
      return document.querySelector('.error') || document.querySelector('.el-message--error');
    });
    if (hasError) {
      console.log('⚠️ 页面存在错误信息\n');
    } else {
      console.log('✅ 页面没有明显错误\n');
    }

    // 8. 检查是否存在关键元素
    const elements = await page.evaluate(() => {
      return {
        aiAssistantPage: !!document.querySelector('.ai-assistant-page'),
        sidebar: !!document.querySelector('.sidebar'),
        pageContainer: !!document.querySelector('.page-container'),
        header: !!document.querySelector('.page-header'),
        mainContent: !!document.querySelector('.main-content')
      };
    });
    console.log('📍 步骤8: 关键元素检查:', elements, '\n');

    // 9. 截图AI助手页面
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-page-test.png',
      fullPage: true
    });
    console.log('✅ AI助手页面截图已保存: aiassistant-page-test.png\n');

    // 10. 检查控制台错误
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    await page.waitForTimeout(2000);

    if (logs.length > 0) {
      console.log('📍 步骤10: 控制台日志:');
      logs.forEach(log => console.log('  ', log));
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 简单页面访问测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);

    // 截图错误页面
    try {
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/error-page.png',
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
