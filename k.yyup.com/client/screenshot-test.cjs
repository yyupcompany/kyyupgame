const { chromium } = require('playwright');

async function screenshotTest() {
  console.log('📸 截图测试...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 访问首页
    console.log('📱 访问应用首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 截图
    await page.screenshot({ path: 'homepage.png', fullPage: true });
    console.log('📸 已保存首页截图: homepage.png');

    // 等待30秒让用户手动登录
    console.log('⏳ 等待30秒，请手动登录...');
    await page.waitForTimeout(30000);

    // 再次截图
    await page.screenshot({ path: 'after-login.png', fullPage: true });
    console.log('📸 已保存登录后截图: after-login.png');

    // 查找侧边栏并截图
    const sidebar = await page.$('.sidebar, aside, [class*="sidebar"]');
    if (sidebar) {
      await sidebar.screenshot({ path: 'sidebar.png' });
      console.log('📸 已保存侧边栏截图: sidebar.png');
    }

  } catch (error) {
    console.error('💥 截图测试出错:', error.message);
  } finally {
    await browser.close();
  }
}

screenshotTest().catch(console.error);