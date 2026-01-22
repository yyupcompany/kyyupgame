const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知统计页面测试（登录后）===\n');

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

    if (status >= 400 && (url.includes('/notifications') || url.includes('/statistics'))) {
      networkErrors.push(`${status} ${url}`);
      console.log(`   [Network Error] ${status} ${url.substring(0, 100)}`);
    }
  });

  try {
    // 1. 先登录
    console.log('1. 登录园长账号...');
    await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 点击园长登录按钮
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.principal-btn');
      if (btns.length > 0) {
        btns[0].click();
      }
    });

    // 等待登录完成和重定向
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('   ✅ 登录成功，已跳转到:', page.url());
    await page.waitForTimeout(2000);

    // 2. 直接访问通知页面
    console.log('\n2. 访问通知页面...');
    await page.goto('http://localhost:5174/notifications', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('   当前URL:', page.url());

    // 3. 点击"通知统计"标签
    console.log('\n3. 点击"通知统计"标签...');
    const clicked = await page.evaluate(() => {
      const tabs = document.querySelectorAll('.el-tabs__item, [class*="tab"]');
      for (const tab of tabs) {
        if (tab.textContent && tab.textContent.includes('通知统计')) {
          tab.click();
          return true;
        }
      }
      return false;
    });
    console.log('   点击结果:', clicked ? '✅' : '❌ 未找到标签');

    await page.waitForTimeout(3000);

    // 4. 检查页面内容
    console.log('\n4. 页面内容检查:');
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasStatsCards: !!document.querySelector('.stats-card, [class*="stat-card"]'),
        hasTable: !!document.querySelector('.el-table'),
        bodyText: document.body?.innerText?.substring(0, 300) || ''
      };
    });
    console.log('   URL:', pageInfo.url);
    console.log('   统计卡片:', pageInfo.hasStatsCards ? '✅' : '❌');
    console.log('   数据表格:', pageInfo.hasTable ? '✅' : '❌');
    console.log('   页面内容:', pageInfo.bodyText.replace(/\s+/g, ' ').substring(0, 200));

    // 5. 检查API调用
    console.log('\n5. API调用检查:');
    const statsApis = apiCalls.filter(a =>
      a.url.includes('/notifications/statistics') ||
      a.url.includes('/notification-center/statistics')
    );
    console.log('   统计API调用:', statsApis.length);
    statsApis.forEach(api => {
      console.log(`   - ${api.status}: ${api.url.substring(0, 80)}...`);
    });

    // 6. 错误检查
    console.log('\n6. 错误检查:');
    const criticalErrors = errors.filter(e =>
      !e.includes('WebSocket') &&
      !e.includes('ws://') &&
      !e.includes('401') &&
      !e.includes('Token') &&
      !e.includes('favicon')
    );
    console.log('   关键错误:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(e => console.log('   -', e.substring(0, 150)));
    }

    // 7. 网络错误
    console.log('   网络错误:', networkErrors.length);
    if (networkErrors.length > 0) {
      networkErrors.forEach(e => console.log('   -', e));
    }

    // 8. 测试结果
    console.log('\n=== 测试结果 ===');
    const success = pageInfo.hasStatsCards || pageInfo.hasTable || statsApis.length > 0;
    if (success && criticalErrors.length === 0) {
      console.log('✅ 测试通过');
    } else if (statsApis.length === 0) {
      console.log('⚠️ API未调用 - 可能需要修复后端路由');
    } else {
      console.log('❌ 测试失败');
    }
    console.log('- 登录状态: ✅');
    console.log('- 页面访问: ✅');
    console.log('- 通知统计API: ' + (statsApis.length > 0 ? `✅ ${statsApis.length}次调用` : '❌ 0次调用'));

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
