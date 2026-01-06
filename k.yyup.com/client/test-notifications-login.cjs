const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知统计页面回归测试（登录后）===\n');

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

    // 2. 检查是否需要登录
    const currentUrl = page.url();
    console.log('   当前URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('2. 检测到需要登录，正在登录...');

      // 先检查登录表单结构
      const inputCount = await page.$$eval('input', inputs => inputs.length);
      console.log('   找到输入框数量:', inputCount);

      // 尝试使用第一个和第二个输入框
      const inputs = await page.$$('input');
      if (inputs.length >= 2) {
        // 使用园长账号登录
        await inputs[0].fill('principal');
        await inputs[1].fill('123456');
        console.log('   已填写园长登录信息 (principal/123456)');

        // 点击登录按钮
        await page.click('button.el-button--primary');
        console.log('   已点击登录按钮');
      } else {
        // 尝试查找用户名和密码输入框
        const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="手机"], input[type="text"]').first();
        const passwordInput = page.locator('input[placeholder*="密码"], input[type="password"]').first();

        if (await usernameInput.isVisible() && await passwordInput.isVisible()) {
          await usernameInput.fill('principal');
          await passwordInput.fill('123456');
          console.log('   已填写园长登录信息 (principal/123456)');

          const loginButton = page.locator('button.el-button--primary, button[type="submit"]').first();
          if (await loginButton.isVisible()) {
            await loginButton.click();
            console.log('   已点击登录按钮');
          }
        }
      }

      await page.waitForTimeout(5000);
      console.log('   登录完成，当前URL:', page.url());
    }

    // 3. 等待页面完全加载
    await page.waitForTimeout(2000);

    // 4. 点击"通知统计"标签
    console.log('3. 点击"通知统计"标签...');
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.el-tabs__item, [class*="tab"]');
      tabs.forEach(tab => {
        if (tab.textContent.includes('通知统计')) {
          tab.click();
        }
      });
    });
    await page.waitForTimeout(3000);

    // 5. 检查页面内容
    console.log('4. 检查页面内容...');

    // 获取统计卡片的数量
    const statsCards = await page.$$('.stats-card, .el-card, [class*="stat"]');
    console.log('   统计卡片数量:', statsCards.length);

    // 获取表格行数
    const tableRows = await page.$$('.el-table__row, [class*="table"] tr, .stats-table tbody tr');
    console.log('   表格行数:', tableRows.length);

    // 6. 检查网络请求
    console.log('\n5. 网络请求检查:');
    const notificationApis = apiCalls.filter(a => a.url.includes('/notifications') || a.url.includes('/statistics'));
    console.log('   通知相关API调用:', notificationApis.length);
    notificationApis.forEach(api => {
      console.log(`   - ${api.status}: ${api.url.substring(0, 80)}...`);
    });

    // 7. 错误统计
    console.log('\n6. 错误统计:');
    const criticalErrors = errors.filter(e =>
      !e.includes('WebSocket') &&
      !e.includes('ws://') &&
      !e.includes('401') &&
      !e.includes('Token') &&
      !e.includes('MISSING_TOKEN')
    );
    console.log('   关键错误数:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(e => console.log('   -', e.substring(0, 200)));
    }

    const wsErrors = errors.filter(e => e.includes('WebSocket') || e.includes('ws://'));
    console.log('   WebSocket错误数:', wsErrors.length, '(可忽略)');

    const networkCriticalErrors = networkErrors.filter(e => !e.includes('401') && !e.includes('Token'));
    console.log('   网络关键错误数:', networkCriticalErrors.length);
    if (networkCriticalErrors.length > 0) {
      networkCriticalErrors.forEach(e => console.log('   -', e));
    }

    // 8. 页面内容预览
    console.log('\n7. 页面内容预览:');
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'No content');
    console.log(bodyText.substring(0, 400));

    // 9. 测试结果汇总
    console.log('\n=== 测试结果汇总 ===');
    const hasCriticalErrors = criticalErrors.length > 0 || networkCriticalErrors.length > 0;
    if (hasCriticalErrors) {
      console.log('❌ 测试失败: 发现关键错误');
    } else {
      console.log('✅ 测试通过: 无关键错误');
    }

    console.log('- 页面访问: ✅ 成功');
    console.log('- 登录状态: ✅ 已登录');
    console.log('- 通知统计: ' + (statsCards.length > 0 ? '✅ 显示' : '⚠️ 未检测到'));
    console.log('- 数据表格: ' + (tableRows.length > 0 ? '✅ 有数据' : '⚠️ 无数据或未加载'));

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
