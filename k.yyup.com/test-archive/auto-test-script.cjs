const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 访问登录页面
    await page.goto('http://localhost:5173/');
    await page.screenshot({ path: 'login-page.png' });
    console.log('已访问登录页面并截图');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 获取所有导航链接
    const links = await page.$$('a[href]');
    const urls = [];

    for (const link of links) {
      const url = await link.getAttribute('href');
      if (url && url.startsWith('/')) {
        urls.push(`http://localhost:5173${url}`);
      }
    }

    // 去重
    const uniqueUrls = [...new Set(urls)];

    // 遍历所有页面并截图
    for (let i = 0; i < uniqueUrls.length; i++) {
      try {
        await page.goto(uniqueUrls[i]);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `page-${i + 1}.png` });
        console.log(`已访问页面: ${uniqueUrls[i]} 并截图`);
      } catch (error) {
        console.log(`访问页面失败: ${uniqueUrls[i]}`);
      }
    }

    console.log('所有页面访问完成');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    await browser.close();
  }
})();