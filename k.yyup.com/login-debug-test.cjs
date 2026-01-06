/**
 * 登录流程调试测试
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 开始登录流程调试...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监控网络请求
  const requests = [];
  const responses = [];

  page.on('request', request => {
    if (request.url().includes('/api/auth') || request.url().includes('login')) {
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers()
      });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/auth') || response.url().includes('login')) {
      try {
        const text = await response.text();
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          body: text.substring(0, 500)
        });
      } catch (e) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          body: '[无法读取响应体]'
        });
      }
    }
  });

  // 监控控制台
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('登录') || text.includes('auth') || text.includes('token')) {
      console.log(`[控制台] ${msg.type()}: ${text}`);
    }
  });

  try {
    // 1. 访问登录页面
    console.log('📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    console.log('✅ 登录页面加载完成\n');

    // 2. 检查登录表单元素
    console.log('📍 步骤2: 检查登录表单');
    const usernameInput = await page.$('input[type="text"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');

    console.log('用户名输入框存在:', !!usernameInput);
    console.log('密码输入框存在:', !!passwordInput);
    console.log('提交按钮存在:', !!submitButton, '\n');

    // 3. 填写登录信息
    console.log('📍 步骤3: 填写登录信息');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    console.log('✅ 登录信息填写完成\n');

    // 4. 在点击前检查表单状态
    console.log('📍 步骤4: 点击前检查表单状态');
    const formData = await page.evaluate(() => {
      const username = document.querySelector('input[type="text"]')?.value;
      const password = document.querySelector('input[type="password"]')?.value;
      return { username, password };
    });
    console.log('表单数据:', formData, '\n');

    // 5. 点击登录按钮
    console.log('📍 步骤5: 点击登录按钮');
    await submitButton.click();
    console.log('✅ 登录按钮已点击\n');

    // 6. 等待并检查API调用
    console.log('📍 步骤6: 等待API响应');
    await page.waitForTimeout(5000);

    console.log('捕获的API请求:');
    requests.forEach(req => {
      console.log('  ', JSON.stringify(req, null, 2));
    });
    console.log('');

    console.log('捕获的API响应:');
    responses.forEach(resp => {
      console.log('  ', JSON.stringify(resp, null, 2));
    });
    console.log('');

    // 7. 检查localStorage和sessionStorage
    console.log('📍 步骤7: 检查存储');
    const storageData = await page.evaluate(() => {
      const localStorage = {};
      const sessionStorage = {};
      const cookies = document.cookie;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        localStorage[key] = localStorage.getItem(key);
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        sessionStorage[key] = sessionStorage.getItem(key);
      }

      return { localStorage, sessionStorage, cookies };
    });
    console.log('存储数据:', JSON.stringify(storageData, null, 2), '\n');

    // 8. 检查当前URL和页面状态
    console.log('📍 步骤8: 检查当前状态');
    const currentUrl = page.url();
    const currentPath = currentUrl.split('#')[0];
    const pageTitle = await page.title();
    console.log('当前URL:', currentUrl);
    console.log('当前路径:', currentPath);
    console.log('页面标题:', pageTitle, '\n');

    // 9. 检查页面是否显示错误信息
    console.log('📍 步骤9: 检查错误信息');
    const errorElements = await page.$$('.el-message--error, .error-message, .login-error');
    console.log('错误元素数量:', errorElements.length, '\n');

    // 10. 截图
    console.log('📍 步骤10: 截图');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/login-debug-result.png',
      fullPage: true
    });
    console.log('✅ 截图已保存: login-debug-result.png\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 登录流程调试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 调试结果:');
    console.log('  - API请求数量:', requests.length);
    console.log('  - API响应数量:', responses.length);
    console.log('  - 当前页面:', currentUrl);
    console.log('  - 错误元素:', errorElements.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 调试过程发生错误:', error.message);

    try {
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/login-debug-error.png',
        fullPage: true
      });
      console.log('✅ 错误截图已保存\n');
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
})();
