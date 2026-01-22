const { chromium } = require('playwright');

(async () => {
  console.log('=== 登录调试测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allLogs = [];

  page.on('console', msg => {
    const log = { type: msg.type(), text: msg.text() };
    allLogs.push(log);
    // 打印所有日志
    console.log(`[${log.type}] ${log.text.substring(0, 150)}`);
  });

  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err.message);
  });

  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (status >= 400 || url.includes('/auth/login')) {
      console.log(`[API] ${status} ${url.substring(0, 100)}`);
    }
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

    console.log('\n3. 等待登录过程...');
    await page.waitForTimeout(10000);

    console.log('\n4. 检查登录结果...');
    const result = await page.evaluate(() => {
      return {
        url: window.location.href,
        token: !!localStorage.getItem('kindergarten_token'),
        userInfo: !!localStorage.getItem('userInfo'),
        loginForm: {
          username: document.querySelector('input[name="username"]')?.value || 'N/A',
          password: document.querySelector('input[name="password"]')?.value ? '***' : 'N/A'
        }
      };
    });
    console.log('   URL:', result.url);
    console.log('   Token:', result.token ? '✅' : '❌');
    console.log('   UserInfo:', result.userInfo ? '✅' : '❌');

    console.log('\n5. 关键日志分析:');
    const keyLogs = allLogs.filter(log =>
      log.text.includes('登录') ||
      log.text.includes('login') ||
      log.text.includes('Login') ||
      log.text.includes('token') ||
      log.text.includes('Token') ||
      log.text.includes('API') ||
      log.text.includes('api') ||
      log.text.includes('❌') ||
      log.text.includes('error') ||
      log.text.includes('Error')
    );
    keyLogs.forEach(log => {
      console.log(`   [${log.type}] ${log.text.substring(0, 100)}`);
    });

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
