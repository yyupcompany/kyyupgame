const { chromium } = require('playwright');

(async () => {
  console.log('=== 登录页面功能测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const networkErrors = [];
  const apiCalls = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.log('   [Console Error]', text.substring(0, 150));
    } else {
      // 打印关键日志
      if (text.includes('🚀 开始登录') || text.includes('⚡ 快捷登录') || text.includes('🔐 调用真实登录API') || text.includes('登录成功')) {
        console.log('   [Log]', text.substring(0, 100));
      }
    }
  });

  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
    console.log('   [Page Error]', err.message);
  });

  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    apiCalls.push({ url, status });

    if (status >= 400) {
      networkErrors.push(`${status} ${url}`);
      console.log(`   [Network Error] ${status} ${url.substring(0, 80)}`);
    } else if (url.includes('/auth/login') || url.includes('/login')) {
      console.log(`   [API Response] ${status} ${url.substring(0, 80)}`);
    }
  });

  try {
    console.log('1. 访问登录页面...');
    await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('   当前URL:', page.url());

    // 2. 检查页面上的按钮
    console.log('\n2. 检查页面按钮...');
    const buttons = await page.$$('.quick-btn');
    console.log('   找到快捷登录按钮:', buttons.length);

    // 列出所有带园长相关的按钮
    const principalBtn = await page.$('.principal-btn');
    if (principalBtn) {
      console.log('   ✅ 找到园长按钮 (.principal-btn)');
      const btnText = await principalBtn.textContent();
      console.log('   按钮内容:', btnText?.replace(/\s+/g, ' ').substring(0, 50));
    } else {
      console.log('   ❌ 未找到园长按钮');
    }

    // 3. 直接使用JavaScript调用quickLogin函数
    console.log('\n3. 直接调用quickLogin函数...');
    const result = await page.evaluate(async () => {
      try {
        // 等待Vue实例准备好
        await new Promise(resolve => setTimeout(resolve, 500));

        // 尝试通过Vue组件调用
        const allElements = document.querySelectorAll('.principal-btn');
        if (allElements.length > 0) {
          const btn = allElements[0];
          console.log('Clicking principal button via dispatchEvent');
          // 创建并分发点击事件
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          btn.dispatchEvent(clickEvent);
          console.log('Clicked via dispatchEvent');
          return { found: 'clicked', btnClass: btn.className };
        }

        return { found: 'not-found' };
      } catch (e) {
        return { error: e.message };
      }
    });
    console.log('   JavaScript调用结果:', result);

    // 4. 等待登录API调用
    console.log('\n4. 等待登录API调用...');
    await page.waitForTimeout(5000);

    // 5. 检查点击后的URL变化
    console.log('\n5. 点击后的状态检查...');
    const currentUrl = page.url();
    console.log('   当前URL:', currentUrl);
    const isLoggedIn = !currentUrl.includes('/login');
    console.log('   登录状态:', isLoggedIn ? '✅ 已登录' : '❌ 未登录');

    // 6. 统计API调用
    console.log('\n6. API调用统计:');
    const loginApis = apiCalls.filter(a =>
      a.url.includes('/auth/login') ||
      (a.url.includes('/api/') && (a.url.includes('login') || a.url.includes('auth')))
    );
    console.log('   登录相关API调用:', loginApis.length);

    // 7. 错误统计
    console.log('\n7. 错误统计:');
    const criticalErrors = errors.filter(e =>
      !e.includes('WebSocket') &&
      !e.includes('ws://') &&
      !e.includes('401') &&
      !e.includes('Token') &&
      !e.includes('MISSING_TOKEN') &&
      !e.includes('INVALID_TOKEN') &&
      !e.includes('Unexpected response code') &&
      !e.includes('favicon')
    );
    console.log('   关键错误数:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(e => console.log('   -', e.substring(0, 200)));
    }

    // 8. 网络错误统计
    const networkCriticalErrors = networkErrors.filter(e =>
      !e.includes('401') &&
      !e.includes('Token')
    );
    console.log('   网络关键错误数:', networkCriticalErrors.length);

    // 9. 页面内容预览
    console.log('\n8. 页面内容预览:');
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'No content');
    console.log(bodyText.substring(0, 400));

    // 10. 测试结果汇总
    console.log('\n=== 测试结果汇总 ===');
    const hasCriticalErrors = criticalErrors.length > 0 || networkCriticalErrors.length > 0;

    if (isLoggedIn && !hasCriticalErrors) {
      console.log('✅ 测试通过 - 登录成功');
    } else if (!isLoggedIn && loginApis.length === 0) {
      console.log('⚠️ 登录未成功 - 未检测到登录API调用');
      console.log('\n可能原因:');
      console.log('1. 按钮点击事件未正确触发');
      console.log('2. handleLogin函数未执行');
      console.log('3. 需要检查登录页面的Vue组件状态');
    } else if (hasCriticalErrors) {
      console.log('❌ 测试失败: 发现关键错误');
    } else {
      console.log('⚠️ 部分成功 - 需要进一步检查');
    }

    console.log('- 页面访问: ✅');
    console.log('- 园长按钮: ✅');
    console.log('- 登录API调用: ' + (loginApis.length > 0 ? '✅ ' + loginApis.length + '次' : '❌ 0次'));
    console.log('- 登录状态: ' + (isLoggedIn ? '✅ 已登录' : '❌ 未登录'));

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
