const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知统计页面测试（全新登录）===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: undefined // 不使用任何已保存的状态
  });
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
    // 1. 使用全新的浏览器上下文（无任何缓存状态）
    console.log('1. 访问登录页面（全新状态）...');
    await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('   当前URL:', page.url());

    // 2. 点击园长登录按钮
    console.log('\n2. 点击园长登录按钮...');

    // 先检查按钮是否存在
    const btnCheck = await page.evaluate(() => {
      const btns = document.querySelectorAll('.quick-btn');
      return {
        count: btns.length,
        btnClasses: Array.from(btns).map(b => b.className)
      };
    });
    console.log('   快捷按钮数量:', btnCheck.count);
    console.log('   按钮CSS类:', btnCheck.btnClasses);

    const loginResult = await page.evaluate(() => {
      const btns = document.querySelectorAll('.principal-btn');
      if (btns.length > 0) {
        btns[0].click();
        return 'clicked';
      }
      return 'not-found';
    });
    console.log('   点击结果:', loginResult);

    // 3. 等待登录完成
    console.log('\n3. 等待登录...');
    let loggedIn = false;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      const url = page.url();
      if (!url.includes('/login')) {
        loggedIn = true;
        console.log(`   ✅ 登录成功 (${i+1}秒)`);
        break;
      }
      if (i === 14) {
        console.log(`   ⚠️ 15秒后仍在登录页`);
      }
    }

    await page.waitForTimeout(2000);

    // 4. 检查登录状态
    console.log('\n4. 登录状态检查:');
    const currentUrl = page.url();
    console.log('   当前URL:', currentUrl);

    const tokenInfo = await page.evaluate(() => {
      return {
        kindergarten_token: !!localStorage.getItem('kindergarten_token'),
        userInfo: !!localStorage.getItem('userInfo')
      };
    });
    console.log('   Token存在:', tokenInfo.kindergarten_token ? '✅' : '❌');
    console.log('   UserInfo存在:', tokenInfo.userInfo ? '✅' : '❌');

    if (!tokenInfo.kindergarten_token) {
      console.log('\n❌ 登录失败，停止测试');
      await browser.close();
      return;
    }

    // 5. 访问通知页面
    console.log('\n5. 访问通知页面...');
    await page.goto('http://localhost:5174/notifications', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('   当前URL:', page.url());

    // 6. 点击"通知统计"标签
    console.log('\n6. 点击"通知统计"标签...');
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

    // 7. 检查页面内容
    console.log('\n7. 页面内容检查:');
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasStatsCards: !!document.querySelector('.stats-card, [class*="stat-card"]'),
        hasTable: !!document.querySelector('.el-table'),
        bodyText: document.body?.innerText?.substring(0, 500) || ''
      };
    });
    console.log('   URL:', pageInfo.url);
    console.log('   统计卡片:', pageInfo.hasStatsCards ? '✅' : '❌');
    console.log('   数据表格:', pageInfo.hasTable ? '✅' : '❌');
    console.log('   页面内容:', pageInfo.bodyText.replace(/\s+/g, ' ').substring(0, 200));

    // 8. 检查API调用
    console.log('\n8. API调用检查:');
    const statsApis = apiCalls.filter(a =>
      a.url.includes('/statistics') &&
      (a.url.includes('/notifications') || a.url.includes('/notification-center'))
    );
    console.log('   统计API调用:', statsApis.length);
    statsApis.forEach(api => {
      console.log(`   - ${api.status}: ${api.url.substring(0, 100)}`);
    });

    // 9. 错误检查
    console.log('\n9. 错误检查:');
    const criticalErrors = errors.filter(e =>
      !e.includes('WebSocket') &&
      !e.includes('ws://') &&
      !e.includes('401') &&
      !e.includes('Token') &&
      !e.includes('favicon') &&
      !e.includes('Unexpected response code')
    );
    console.log('   关键错误:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(e => console.log('   -', e.substring(0, 150)));
    }

    // 10. 测试结果
    console.log('\n=== 测试结果 ===');
    const hasData = pageInfo.hasStatsCards || pageInfo.hasTable;
    const apiSuccess = statsApis.length > 0 && statsApis.every(a => a.status < 400);

    if (apiSuccess && !hasData) {
      console.log('⚠️ API成功但页面未渲染');
    } else if (apiSuccess && hasData) {
      console.log('✅ 测试通过 - 通知统计功能正常');
    } else if (statsApis.length === 0) {
      console.log('❌ API未调用 - 后端路由可能有问题');
    } else {
      console.log('❌ 测试失败');
    }

    console.log('- 登录状态: ✅');
    console.log('- 页面访问: ✅');
    console.log('- 统计API: ' + (apiSuccess ? '✅ 调用成功' : '❌ 调用失败'));

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
