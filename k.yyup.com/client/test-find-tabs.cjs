const { chromium } = require('playwright');

(async () => {
  console.log('=== 查找通知页面标签 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:5174/notifications', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 登录
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.principal-btn');
    if (btns.length > 0) {
      btns[0].click();
    }
  });

  // 等待登录
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1000);
    const url = page.url();
    if (!url.includes('/login')) {
      console.log(`   登录成功 (${i+1}秒)`);
      break;
    }
  }

  await page.waitForTimeout(2000);

  // 访问通知页面
  await page.goto('http://localhost:5174/notifications', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 查找所有tabs
  console.log('\n查找所有标签...');
  const tabs = await page.evaluate(() => {
    const allTabs = document.querySelectorAll('.el-tabs__item, [class*="tab"]');
    return Array.from(allTabs).map(tab => ({
      text: tab.textContent?.trim(),
      class: tab.className,
      id: tab.id
    }));
  });

  console.log('找到的标签:');
  tabs.forEach((tab, i) => {
    console.log(`${i + 1}. "${tab.text}" (class: ${tab.class})`);
  });

  await browser.close();
})();
