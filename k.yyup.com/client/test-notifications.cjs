const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
  });

  try {
    console.log('Navigating to notifications page...');
    await page.goto('http://localhost:5176/notifications', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 200) || 'No body');
    console.log('Page content preview:', bodyText.substring(0, 150));

    if (errors.length > 0) {
      console.log('\nConsole/Page errors found:');
      errors.forEach(e => console.log('  -', e.substring(0, 400)));
    } else {
      console.log('\n✓ No console errors!');
    }
  } catch (e) {
    console.log('Navigation Error:', e.message);
  }

  await browser.close();
})();
