const { chromium } = require('playwright');

async function openTenantPage() {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false,  // 显示浏览器界面
    devtools: true    // 打开开发者工具
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('正在访问租户管理页面...');

    // 访问登录页面
    await page.goto('http://localhost:5173/login');

    // 等待页面加载
    await page.waitForTimeout(2000);

    console.log('已打开登录页面，请手动登录后访问租户管理页面');

    // 监听页面导航到租户相关页面
    page.on('navigation', (navigation) => {
      console.log(`导航到: ${navigation.url()}`);
    });

    // 保持浏览器打开状态
    console.log('浏览器已打开，您可以手动导航到租户页面');
    console.log('按 Ctrl+C 关闭浏览器');

    // 等待用户手动操作
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });

  } catch (error) {
    console.error('访问页面时出错:', error);
  } finally {
    await browser.close();
  }
}

openTenantPage().catch(console.error);