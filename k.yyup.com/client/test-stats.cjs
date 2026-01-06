const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      const url = response.url();
      if (url.includes('/notifications') || url.includes('/statistics')) {
        networkErrors.push(response.status() + ' ' + url);
      }
    }
  });

  try {
    console.log('Navigating to notifications page...');
    await page.goto('http://localhost:5176/notifications', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Click on statistics tab using JavaScript evaluation
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.el-tabs__item');
      tabs.forEach(tab => {
        if (tab.textContent.includes('通知统计')) {
          tab.click();
        }
      });
    });

    console.log('Waiting for statistics data...');
    await page.waitForTimeout(4000);

    if (errors.length > 0) {
      console.log('\nConsole errors:');
      errors.forEach(e => console.log('  -', e.substring(0, 300)));
    }

    if (networkErrors.length > 0) {
      console.log('\nNetwork errors:');
      networkErrors.forEach(e => console.log('  -', e));
    }

    if (errors.length === 0 && networkErrors.length === 0) {
      console.log('\n✓ No errors found!');
    }

    // Check page content
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'No content');
    console.log('\nPage content preview:');
    console.log(bodyText.substring(0, 400));

  } catch (e) {
    console.log('Navigation Error:', e.message);
  }

  await browser.close();
})();
