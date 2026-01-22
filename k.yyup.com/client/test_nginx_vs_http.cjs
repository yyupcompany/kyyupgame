const { chromium } = require('playwright');

async function testPage(url, name) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('[' + name + '] Console Error: ' + msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push('[' + name + '] Page Error: ' + err.message);
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const title = await page.title();
    console.log('\n=== ' + name + ' ===');
    console.log('URL: ' + url);
    console.log('Title: ' + title);
    console.log('Errors found: ' + errors.length);

    if (errors.length > 0) {
      errors.forEach(e => console.log(e));
    }
  } catch (e) {
    console.log('[' + name + '] Navigation error: ' + e.message);
  }

  await browser.close();
  return errors;
}

(async () => {
  // Test HTTPS (via Nginx)
  await testPage('https://k.yyup.cc', 'Nginx HTTPS');

  // Test HTTP direct (Python server)
  await testPage('http://47.94.82.59:8080', 'Python HTTP');
})();
