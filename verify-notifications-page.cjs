const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知页面验证测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  const networkErrors = [];
  const apiCalls = [];

  // 监听控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    }
  });

  // 监听页面错误
  page.on('pageerror', err => {
    consoleErrors.push({
      type: 'pageerror',
      text: err.message,
      stack: err.stack
    });
  });

  // 监听网络错误
  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }

    // 记录API调用
    if (response.url().includes('/api/')) {
      apiCalls.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method()
      });
    }
  });

  let pageLoadSuccess = false;
  let notificationsVisible = false;
  let iconsVisible = false;
  let uiIssues = [];

  try {
    console.log('1. 导航到通知页面...');
    await page.goto('http://localhost:5176/notifications', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    pageLoadSuccess = true;
    console.log('   ✓ 页面加载成功\n');

    // 检查页面标题
    const title = await page.title();
    console.log('2. 页面标题:', title);

    // 检查主要元素
    console.log('3. 检查页面元素...');

    // 检查是否有通知容器
    const notificationContainers = await page.$$('[data-testid*="notification"], .notification, .el-notification');
    if (notificationContainers.length > 0) {
      notificationsVisible = true;
      console.log(`   ✓ 发现 ${notificationContainers.length} 个通知容器`);
    } else {
      console.log('   ⚠ 未发现通知容器');
    }

    // 检查通知图标
    const icons = await page.$$('i[class*="icon"], .el-icon svg, [data-testid*="icon"]');
    if (icons.length > 0) {
      iconsVisible = true;
      console.log(`   ✓ 发现 ${icons.length} 个图标元素`);
    } else {
      console.log('   ⚠ 未发现图标元素');
    }

    // 检查按钮和交互元素
    const buttons = await page.$$('button, .el-button, [role="button"]');
    console.log(`   ✓ 发现 ${buttons.length} 个按钮元素`);

    // 检查列表项
    const listItems = await page.$$('li, .el-menu-item, .notification-item, [data-testid*="item"]');
    console.log(`   ✓ 发现 ${listItems.length} 个列表项`);

    // 检查UI问题
    console.log('\n4. 检查UI问题...');

    // 检查隐藏元素
    const hiddenElements = await page.$$('*');
    for (const element of hiddenElements) {
      const isVisible = await element.isVisible();
      const hasContent = await element.evaluate(el => el.textContent?.trim().length > 0);
      if (!isVisible && hasContent) {
        uiIssues.push('发现隐藏但有内容的元素');
      }
    }

    // 检查重复ID
    const allElements = await page.$$('*');
    const ids = new Set();
    for (const element of allElements) {
      const id = await element.getAttribute('id');
      if (id) {
        if (ids.has(id)) {
          uiIssues.push(`发现重复ID: ${id}`);
        }
        ids.add(id);
      }
    }

    if (uiIssues.length === 0) {
      console.log('   ✓ 未发现明显UI问题');
    } else {
      console.log(`   ⚠ 发现 ${uiIssues.length} 个UI问题:`);
      uiIssues.forEach(issue => console.log(`     - ${issue}`));
    }

    // 检查API调用
    console.log('\n5. API调用统计...');
    if (apiCalls.length > 0) {
      console.log(`   总计 ${apiCalls.length} 个API调用:`);
      const statusCounts = {};
      apiCalls.forEach(call => {
        const key = `${call.status}`;
        statusCounts[key] = (statusCounts[key] || 0) + 1;
      });

      Object.entries(statusCounts).forEach(([status, count]) => {
        const icon = status.startsWith('2') ? '✓' : status.startsWith('4') || status.startsWith('5') ? '✗' : '?';
        console.log(`   ${icon} ${status}: ${count} 次调用`);
      });
    } else {
      console.log('   ⚠ 未发现API调用');
    }

    // 网络错误
    console.log('\n6. 网络错误检查...');
    if (networkErrors.length > 0) {
      console.log(`   ✗ 发现 ${networkErrors.length} 个网络错误:`);
      networkErrors.forEach(error => {
        console.log(`     - ${error.status} ${error.statusText}: ${error.url}`);
      });
    } else {
      console.log('   ✓ 未发现网络错误');
    }

    // 控制台错误
    console.log('\n7. 控制台错误检查...');
    if (consoleErrors.length > 0) {
      console.log(`   ✗ 发现 ${consoleErrors.length} 个控制台错误/警告:`);
      consoleErrors.forEach(error => {
        console.log(`     [${error.type}] ${error.text.substring(0, 200)}`);
      });
    } else {
      console.log('   ✓ 未发现控制台错误或警告');
    }

    // 页面截图（用于调试）
    try {
      await page.screenshot({ path: '/tmp/notifications-page.png', fullPage: true });
      console.log('\n   ✓ 已保存页面截图到 /tmp/notifications-page.png');
    } catch (e) {
      console.log('\n   ⚠ 截图保存失败:', e.message);
    }

  } catch (error) {
    console.log('\n✗ 页面加载失败:', error.message);
    pageLoadSuccess = false;
  }

  // 生成报告
  console.log('\n=== 测试报告 ===');
  console.log('页面加载状态:', pageLoadSuccess ? '✓ 成功' : '✗ 失败');
  console.log('控制台错误:', consoleErrors.length === 0 ? '✓ 无' : `✗ ${consoleErrors.length} 个`);
  console.log('网络错误:', networkErrors.length === 0 ? '✓ 无' : `✗ ${networkErrors.length} 个`);
  console.log('图标显示:', iconsVisible ? '✓ 正常' : '⚠ 未检测到');
  console.log('通知列表:', notificationsVisible ? '✓ 正常' : '⚠ 未检测到');
  console.log('UI问题:', uiIssues.length === 0 ? '✓ 无' : `⚠ ${uiIssues.length} 个`);

  // 总体状态
  const allChecksPass = pageLoadSuccess &&
                       consoleErrors.length === 0 &&
                       networkErrors.length === 0;

  console.log('\n总体状态:', allChecksPass ? '✓ 所有检查通过' : '⚠ 存在问题');

  await browser.close();

  // 设置退出码
  process.exit(allChecksPass ? 0 : 1);
})();
