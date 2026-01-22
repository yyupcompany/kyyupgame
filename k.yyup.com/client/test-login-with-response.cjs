const { chromium } = require('playwright');

(async () => {
  console.log('=== 登录API响应测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('/auth/login')) {
      console.log(`[API Response] ${status} ${url}`);
      try {
        const data = await response.text();
        console.log('   Response:', data.substring(0, 200));
      } catch (e) {
        console.log('   Could not read response');
      }
    }
  });

  page.on('requestfailed', request => {
    console.log(`[Request Failed] ${request.url()}`);
    console.log('   Error:', request.failure()?.errorText);
  });

  try {
    console.log('1. 访问登录页面...');
    await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('   URL:', page.url());

    console.log('\n2. 点击园长按钮...');
    await page.evaluate(() => {
      const btn = document.querySelector('.principal-btn');
      if (btn) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }
    });

    console.log('\n3. 等待登录响应...');
    await page.waitForTimeout(10000);

    console.log('\n4. 检查结果...');
    const result = await page.evaluate(() => {
      return {
        url: window.location.href,
        token: !!localStorage.getItem('kindergarten_token'),
        userInfo: !!localStorage.getItem('userInfo')
      };
    });
    console.log('   URL:', result.url);
    console.log('   Token:', result.token ? '✅' : '❌');

    if (result.token) {
      console.log('\n✅ 登录成功!');
    } else {
      console.log('\n❌ 登录失败');
    }

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
