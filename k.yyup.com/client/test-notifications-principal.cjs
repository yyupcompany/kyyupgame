const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知统计页面 - 园长账号快捷登录测试 ===\n');

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

    if (status >= 400) {
      if (url.includes('/notifications') || url.includes('/statistics')) {
        networkErrors.push(`${status} ${url}`);
      }
    }
  });

  try {
    // 1. 访问通知页面
    console.log('1. 访问通知页面...');
    await page.goto('http://localhost:5174/notifications', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log('   当前URL:', currentUrl);

    // 2. 检查是否需要登录
    if (currentUrl.includes('/login')) {
      console.log('2. 检测到登录页面，使用园长快捷登录...');

      // 使用正确的CSS选择器：.principal-btn 或 button.quick-btn
      const principalBtn = await page.$('.principal-btn, .quick-btn.principal-btn, button.quick-btn');
      if (principalBtn) {
        console.log('   找到园长按钮，点击登录...');
        await principalBtn.click();
        await page.waitForTimeout(3000);
        console.log('   点击后URL:', page.url());
      } else {
        console.log('   ❌ 未找到园长按钮，尝试其他方式...');
        // 尝试通过evaluate点击
        await page.evaluate(() => {
          const btn = document.querySelector('.principal-btn, button[title*="园长"]');
          if (btn) {
            btn.click();
            console.log('   已通过DOM点击园长按钮');
          }
        });
        await page.waitForTimeout(3000);
      }
    }

    // 3. 等待页面完全加载
    await page.waitForTimeout(2000);

    // 4. 检查登录状态
    const afterLoginUrl = page.url();
    console.log('\n3. 登录后URL:', afterLoginUrl);
    const isLoggedIn = !afterLoginUrl.includes('/login');
    console.log('   登录状态:', isLoggedIn ? '✅ 已登录' : '❌ 未登录');

    // 5. 点击"通知统计"标签
    console.log('\n4. 点击"通知统计"标签...');
    await page.evaluate(() => {
      const allTabs = document.querySelectorAll('.el-tabs__item, [class*="tab"]');
      allTabs.forEach(tab => {
        if (tab.textContent && tab.textContent.includes('通知统计')) {
          tab.click();
          console.log('   已点击通知统计标签');
        }
      });
    });

    await page.waitForTimeout(3000);

    // 6. 检查页面内容
    console.log('\n5. 检查页面内容...');

    // 获取统计卡片
    const statsCards = await page.$$('.stats-card, [class*="stat-card"], [class*="stat"]');
    console.log('   统计卡片数量:', statsCards.length);

    // 获取表格
    const tableRows = await page.$$('.el-table__row, [class*="table"] tr');
    console.log('   表格行数:', tableRows.length);

    // 检查是否有el-table元素
    const tables = await page.$$('.el-table');
    console.log('   ElTable组件:', tables.length);

    // 检查是否显示"通知统计"标题
    const hasStatsTitle = await page.evaluate(() => {
      const allText = document.body.innerText;
      return allText.includes('通知统计') || allText.includes('统计');
    });
    console.log('   统计标题:', hasStatsTitle ? '✅ 有' : '❌ 无');

    // 7. 网络请求检查
    console.log('\n6. 网络请求检查:');
    const notificationApis = apiCalls.filter(a =>
      a.url.includes('/notifications') &&
      a.url.includes('/statistics')
    );
    console.log('   通知统计API调用:', notificationApis.length);
    notificationApis.forEach(api => {
      console.log(`   - ${api.status}: ${api.url.substring(0, 80)}...`);
    });

    // 8. 错误统计
    console.log('\n7. 错误统计:');
    const criticalErrors = errors.filter(e =>
      !e.includes('WebSocket') &&
      !e.includes('ws://') &&
      !e.includes('401') &&
      !e.includes('Token') &&
      !e.includes('MISSING_TOKEN') &&
      !e.includes('INVALID_TOKEN') &&
      !e.includes('Unexpected response code')
    );
    console.log('   关键错误数:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(e => console.log('   -', e.substring(0, 200)));
    }

    const wsErrors = errors.filter(e => e.includes('WebSocket') || e.includes('ws://'));
    console.log('   WebSocket错误数:', wsErrors.length, '(开发环境可忽略)');

    const networkCriticalErrors = networkErrors.filter(e => !e.includes('401') && !e.includes('Token'));
    console.log('   网络关键错误数:', networkCriticalErrors.length);
    if (networkCriticalErrors.length > 0) {
      networkCriticalErrors.forEach(e => console.log('   -', e));
    }

    // 9. 页面内容预览
    console.log('\n8. 页面内容预览:');
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 800) || 'No content');
    console.log(bodyText.substring(0, 600));

    // 10. 测试结果汇总
    console.log('\n=== 测试结果汇总 ===');
    const hasCriticalErrors = criticalErrors.length > 0 || networkCriticalErrors.length > 0;

    if (isLoggedIn && !hasCriticalErrors) {
      console.log('✅ 测试通过');
    } else if (!isLoggedIn) {
      console.log('⚠️ 登录失败 - 请手动测试');
      console.log('\n请手动操作：');
      console.log('1. 打开 http://localhost:5174/login');
      console.log('2. 点击"快速体验"中的"园长"按钮');
      console.log('3. 登录成功后访问 http://localhost:5174/notifications');
      console.log('4. 点击"通知统计"标签查看统计数据');
    } else {
      console.log('❌ 测试失败: 发现关键错误');
    }

    console.log('- 页面访问: ✅');
    console.log('- 园长登录: ' + (isLoggedIn ? '✅' : '❌'));
    console.log('- 通知统计: ' + (statsCards.length > 0 ? '✅ 显示' : '⚠️ 未检测到'));
    console.log('- 数据表格: ' + (tableRows.length > 0 ? '✅ 有数据' : '⚠️ 无数据'));

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
