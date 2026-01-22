const { chromium } = require('playwright');

(async () => {
  console.log('=== 登录后重定向详细测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
  });

  try {
    console.log('1. 访问登录页面...');
    await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('   初始URL:', page.url());

    // 2. 点击园长登录按钮
    console.log('\n2. 点击园长登录按钮...');
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.principal-btn');
      if (btns.length > 0) {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        btns[0].dispatchEvent(clickEvent);
      }
    });

    // 3. 等待并检查登录过程
    console.log('\n3. 等待登录过程...');
    await page.waitForTimeout(8000);

    // 4. 检查当前状态
    console.log('\n4. 当前状态检查:');
    const currentUrl = page.url();
    console.log('   当前URL:', currentUrl);

    // 5. 检查页面内容
    console.log('\n5. 页面内容检查:');
    const bodyContent = await page.evaluate(() => {
      const body = document.body;
      if (!body) return 'No body';
      return {
        innerHTML: body.innerHTML.length,
        textContent: body.textContent?.substring(0, 200) || 'No text',
        children: body.children.length
      };
    });
    console.log('   Body HTML长度:', bodyContent.innerHTML);
    console.log('   Body文本:', bodyContent.textContent);
    console.log('   子元素数量:', bodyContent.children);

    // 6. 检查是否有登录表单
    const loginFormExists = await page.evaluate(() => {
      const form = document.querySelector('form');
      const loginBtn = document.querySelector('.login-btn');
      const quickBtns = document.querySelectorAll('.quick-btn');
      return {
        formExists: !!form,
        loginBtnExists: !!loginBtn,
        quickBtnCount: quickBtns.length
      };
    });
    console.log('   登录表单存在:', loginFormExists.formExists);
    console.log('   登录按钮存在:', loginFormExists.loginBtnExists);
    console.log('   快捷按钮数量:', loginFormExists.quickBtnCount);

    // 7. 检查localStorage中的token
    const tokenInfo = await page.evaluate(() => {
      return {
        kindergarten_token: !!localStorage.getItem('kindergarten_token'),
        token: !!localStorage.getItem('token'),
        auth_token: !!localStorage.getItem('auth_token'),
        userInfo: !!localStorage.getItem('userInfo')
      };
    });
    console.log('\n6. Token存储状态:');
    console.log('   kindergarten_token:', tokenInfo.kindergarten_token ? '✅' : '❌');
    console.log('   token:', tokenInfo.token ? '✅' : '❌');
    console.log('   auth_token:', tokenInfo.auth_token ? '✅' : '❌');
    console.log('   userInfo:', tokenInfo.userInfo ? '✅' : '❌');

    // 8. 检查控制台日志中的关键事件
    console.log('\n7. 关键事件日志:');
    const keyEvents = consoleLogs.filter(log =>
      log.text.includes('🎉 登录成功') ||
      log.text.includes('🔀 准备跳转') ||
      log.text.includes('✅ 页面跳转完成') ||
      log.text.includes('router') ||
      log.text.includes('redirect') ||
      log.text.includes('❌')
    );
    keyEvents.forEach(log => {
      console.log(`   [${log.type}] ${log.text.substring(0, 100)}`);
    });

    // 9. 测试结果
    console.log('\n=== 测试结果 ===');
    const isLoggedIn = !currentUrl.includes('/login') && tokenInfo.kindergarten_token;
    console.log('URL变化:', currentUrl.includes('/login') ? '❌ 仍在登录页' : '✅ 已跳转');
    console.log('Token保存:', tokenInfo.kindergarten_token ? '✅' : '❌');
    console.log('登录状态:', isLoggedIn ? '✅ 成功' : '❌ 失败');

    if (!isLoggedIn && tokenInfo.kindergarten_token) {
      console.log('\n⚠️ 登录成功但未重定向');
      console.log('可能原因: router.replace() 调用失败');
    }

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
