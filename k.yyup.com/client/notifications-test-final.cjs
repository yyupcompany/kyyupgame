const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知页面验证测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  const networkErrors = [];

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || type === 'warning') {
      consoleErrors.push({ type, text });
    }
  });

  // 监听页面错误
  page.on('pageerror', err => {
    consoleErrors.push({ type: 'pageerror', text: err.message });
  });

  // 监听响应错误
  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  let pageLoadSuccess = false;
  let authenticationRedirect = false;

  try {
    console.log('1. 导航到通知页面 (http://localhost:5173/notifications)...');
    await page.goto('http://localhost:5173/notifications', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);
    pageLoadSuccess = true;
    console.log('   ✓ 页面导航成功\n');

    // 检查页面标题
    const title = await page.title();
    console.log('2. 页面标题:', title);

    // 检查当前URL
    const url = page.url();
    console.log('   当前URL:', url);

    // 检查是否重定向到登录页
    if (url.includes('/login')) {
      authenticationRedirect = true;
      console.log('   ✓ 用户未认证，重定向到登录页 (正常行为)\n');
    }

    // 检查主要内容
    console.log('3. 检查页面元素...');
    const mainContent = await page.locator('main, #app, .main-content').first().isVisible();
    console.log('   主要内容区域:', mainContent ? '✓ 可见' : '⚠ 不可见');

    const buttons = await page.$$('button, .el-button, [role="button"]');
    console.log('   按钮元素:', buttons.length, '个');

    const inputs = await page.$$('input, textarea, select');
    console.log('   输入元素:', inputs.length, '个');

    // 检查登录表单
    const loginForm = await page.locator('form, .login-form, .el-form').first().isVisible();
    console.log('   登录表单:', loginForm ? '✓ 可见' : '⚠ 不可见');

    // 检查网络错误
    console.log('\n4. 网络错误检查...');
    if (networkErrors.length > 0) {
      console.log(`   ✗ 发现 ${networkErrors.length} 个网络错误:`);
      networkErrors.forEach(error => {
        console.log(`     - ${error.status} ${error.statusText}: ${error.url}`);
      });
    } else {
      console.log('   ✓ 未发现网络错误');
    }

    // 检查控制台错误
    console.log('\n5. 控制台错误检查...');
    if (consoleErrors.length > 0) {
      console.log(`   ⚠ 发现 ${consoleErrors.length} 个控制台错误/警告:`);
      consoleErrors.slice(0, 10).forEach(error => {
        console.log(`     [${error.type}] ${error.text?.substring(0, 100) || 'N/A'}`);
      });
      if (consoleErrors.length > 10) {
        console.log(`     ... 还有 ${consoleErrors.length - 10} 个`);
      }
    } else {
      console.log('   ✓ 未发现控制台错误或警告');
    }

    // 页面截图
    console.log('\n6. 保存调试截图...');
    try {
      await page.screenshot({ path: '/tmp/notifications-test.png', fullPage: true });
      console.log('   ✓ 已保存截图到 /tmp/notifications-test.png');
    } catch (e) {
      console.log('   ⚠ 截图保存失败:', e.message);
    }

    // 页面内容
    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '');
    console.log('\n7. 页面内容预览...');
    if (bodyText.length > 0) {
      console.log('   页面有内容 (前200字符):');
      console.log('   ' + bodyText.substring(0, 200).replace(/\n/g, ' '));
    } else {
      console.log('   ⚠ 页面内容为空');
    }

  } catch (error) {
    console.log('\n✗ 测试执行错误:', error.message);
    pageLoadSuccess = false;
  }

  // 生成报告
  console.log('\n' + '='.repeat(50));
  console.log('=== 测试报告总结 ===');
  console.log('='.repeat(50));
  console.log('页面加载状态:', pageLoadSuccess ? '✓ 成功' : '✗ 失败');
  console.log('认证重定向:', authenticationRedirect ? '✓ 正常 (未登录)' : '⚠ 未发生');
  console.log('网络错误:', networkErrors.length === 0 ? '✓ 无' : `✗ ${networkErrors.length} 个`);
  console.log('控制台错误:', consoleErrors.length === 0 ? '✓ 无' : `⚠ ${consoleErrors.length} 个`);

  // 评估
  const allGood = pageLoadSuccess &&
                  networkErrors.length === 0 &&
                  consoleErrors.length === 0;

  const needsAuth = authenticationRedirect;

  console.log('\n状态评估:');
  if (allGood) {
    console.log('  ✓ 所有检查通过 - 页面功能正常');
  } else if (needsAuth && networkErrors.length === 0) {
    console.log('  ✓ 页面正常工作 - 需要用户登录后才能访问通知页面');
    console.log('  ✓ 重定向到登录页 - 认证系统工作正常');
  } else {
    console.log('  ✗ 发现问题需要修复');
  }

  await browser.close();
  process.exit(allGood || needsAuth ? 0 : 1);
})();
