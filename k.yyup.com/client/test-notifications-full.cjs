const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知统计功能完整测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const networkErrors = [];
  const apiCalls = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
  });

  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    apiCalls.push({ url, status });

    if (status >= 400 && url.includes('/statistics')) {
      networkErrors.push(`${status} ${url}`);
    }
  });

  try {
    // 1. 登录
    console.log('1. 登录园长账号...');
    await page.goto('http://localhost:5174/login', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(5000);

    await page.evaluate(() => {
      const btns = document.querySelectorAll('.principal-btn');
      if (btns.length > 0) {
        btns[0].click();
      }
    });

    // 等待登录完成
    let loginSuccess = false;
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      const url = page.url();
      if (!url.includes('/login')) {
        loginSuccess = true;
        console.log(`   ✅ 登录成功 (${i+1}秒)`);
        break;
      }
    }

    if (!loginSuccess) {
      console.log('   ❌ 登录失败');
      await browser.close();
      return;
    }

    await page.waitForTimeout(2000);

    // 2. 访问通知页面
    console.log('\n2. 访问通知页面...');
    await page.goto('http://localhost:5174/notifications', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(5000);
    console.log('   URL:', page.url());

    // 3. 点击"通知统计"标签
    console.log('\n3. 点击"通知统计"标签...');
    const clicked = await page.evaluate(() => {
      const tabs = document.querySelectorAll('.el-tabs__item');
      for (const tab of tabs) {
        if (tab.textContent && tab.textContent.trim() === '通知统计') {
          tab.click();
          return true;
        }
      }
      return false;
    });
    console.log('   点击结果:', clicked ? '✅' : '❌');

    // 4. 等待API响应
    console.log('\n4. 等待API响应...');
    await page.waitForTimeout(5000);

    // 5. 检查API调用
    console.log('\n5. API调用检查:');
    const statsApis = apiCalls.filter(a =>
      a.url.includes('/statistics') &&
      (a.url.includes('/notifications') || a.url.includes('/notification-center'))
    );
    console.log('   统计相关API:', statsApis.length);
    statsApis.forEach(api => {
      console.log(`   - ${api.status}: ${api.url.substring(0, 100)}`);
    });

    // 6. 检查页面内容
    console.log('\n6. 页面内容检查:');
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasStats: !!document.querySelector('.stats-card, [class*="stat-card"], [class*="statistics"]'),
        hasTable: !!document.querySelector('.el-table'),
        bodyText: document.body?.innerText || ''
      };
    });
    console.log('   URL:', pageInfo.url);
    console.log('   统计元素:', pageInfo.hasStats ? '✅' : '❌');
    console.log('   表格:', pageInfo.hasTable ? '✅' : '❌');
    console.log('   内容预览:', pageInfo.bodyText.replace(/\s+/g, ' ').substring(0, 100));

    // 7. 错误检查
    console.log('\n7. 错误检查:');
    const criticalErrors = errors.filter(e =>
      !e.includes('WebSocket') &&
      !e.includes('ws://') &&
      !e.includes('401') &&
      !e.includes('Token') &&
      !e.includes('favicon')
    );
    console.log('   关键错误:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(e => console.log('   -', e.substring(0, 100)));
    }

    // 8. 测试结果
    console.log('\n=== 测试结果 ===');
    const apiSuccess = statsApis.length > 0 && statsApis.every(a => a.status < 400);

    if (apiSuccess) {
      console.log('✅ 通知统计API调用成功');
      if (pageInfo.hasStats || pageInfo.hasTable) {
        console.log('✅ 页面数据显示正常');
      } else {
        console.log('⚠️ API成功但页面未渲染');
      }
    } else {
      console.log('❌ API调用失败或未调用');
      console.log('\n可能原因:');
      console.log('1. 后端路由未正确配置');
      console.log('2. 前端请求路径错误');
      console.log('3. 权限问题');
    }

    console.log('- 登录: ✅');
    console.log('- 页面访问: ✅');
    console.log('- 统计API: ' + (apiSuccess ? '✅' : '❌'));

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
