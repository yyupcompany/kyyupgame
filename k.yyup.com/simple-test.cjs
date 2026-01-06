const { chromium } = require('playwright');

async function runSimpleTest() {
  console.log('🚀 开始简单测试...');

  try {
    console.log('📍 启动浏览器...');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('📍 创建页面上下文...');
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('📍 访问登录页面...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('✅ 页面加载成功');
    console.log('当前URL:', page.url());

    const title = await page.title();
    console.log('页面标题:', title);

    // 截图
    await page.screenshot({ path: 'simple-test-screenshot.png' });
    console.log('📸 截图已保存: simple-test-screenshot.png');

    await browser.close();
    console.log('🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

runSimpleTest();