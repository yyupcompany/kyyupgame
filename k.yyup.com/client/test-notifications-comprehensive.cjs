const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知页面综合验证测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  const networkErrors = [];
  const apiCalls = [];

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || type === 'warning') {
      consoleErrors.push({
        type,
        text,
        location: msg.location()
      });
    }
    // 输出所有控制台消息以便调试
    if (type === 'log' || type === 'info') {
      console.log(`[Browser ${type}]`, text.substring(0, 100));
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

  // 监听响应
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
  const uiIssues = [];

  try {
    console.log('1. 导航到通知页面 (http://localhost:5176/notifications)...');
    await page.goto('http://localhost:5176/notifications', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待页面加载完成
    await page.waitForTimeout(3000);
    pageLoadSuccess = true;
    console.log('   ✓ 页面导航成功\n');

    // 检查页面标题
    const title = await page.title();
    console.log('2. 页面标题:', title);

    // 检查URL
    const url = page.url();
    console.log('   当前URL:', url);

    // 检查页面内容
    console.log('\n3. 检查页面内容...');

    // 检查主要内容区域
    const mainContent = await page.locator('main, #app, .main-content').first().isVisible();
    if (mainContent) {
      console.log('   ✓ 发现主要内容区域');
    } else {
      console.log('   ⚠ 未发现主要内容区域');
    }

    // 检查是否有导航或侧边栏
    const hasNavigation = await page.locator('nav, .nav, .sidebar').first().isVisible();
    console.log('   导航栏:', hasNavigation ? '✓ 可见' : '⚠ 不可见');

    // 检查通知相关元素
    console.log('\n4. 检查通知特定元素...');

    // 查找可能的通知容器
    const notificationSelectors = [
      '[data-testid*="notification"]',
      '.notification',
      '.el-notification',
      '.notice',
      '[class*="notify"]',
      '[class*="alert"]',
      'ul.notification-list',
      '.notification-container'
    ];

    let foundNotifications = false;
    for (const selector of notificationSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        foundNotifications = true;
        console.log(`   ✓ 使用选择器 "${selector}" 发现 ${elements.length} 个通知元素`);

        // 检查元素是否可见
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const isVisible = await elements[i].isVisible();
          const text = await elements[i].innerText();
          console.log(`     - 元素 ${i + 1}: ${isVisible ? '可见' : '隐藏'}, 文本: "${text?.substring(0, 50) || 'N/A'}"`);
        }
        break;
      }
    }

    if (!foundNotifications) {
      console.log('   ⚠ 未发现标准通知容器元素');
      notificationsVisible = false;
    } else {
      notificationsVisible = true;
    }

    // 检查图标
    console.log('\n5. 检查图标元素...');
    const iconSelectors = [
      'i[class*="icon"]',
      '.el-icon svg',
      '[data-testid*="icon"]',
      'svg.icon',
      '.icon'
    ];

    let totalIcons = 0;
    for (const selector of iconSelectors) {
      const icons = await page.$$(selector);
      if (icons.length > 0) {
        totalIcons += icons.length;
        console.log(`   ✓ 使用选择器 "${selector}" 发现 ${icons.length} 个图标`);
      }
    }

    if (totalIcons > 0) {
      iconsVisible = true;
      console.log(`   总计发现 ${totalIcons} 个图标元素`);
    } else {
      console.log('   ⚠ 未发现图标元素');
    }

    // 检查按钮
    console.log('\n6. 检查交互元素...');
    const buttons = await page.$$('button, .el-button, [role="button"], a.button');
    console.log(`   按钮元素: ${buttons.length} 个`);

    // 检查列表项
    const listItems = await page.$$('li, .el-menu-item, .notification-item, [data-testid*="item"]');
    console.log(`   列表项: ${listItems.length} 个`);

    // 检查输入框
    const inputs = await page.$$('input, textarea, select');
    console.log(`   输入元素: ${inputs.length} 个`);

    // 检查表格
    const tables = await page.$$('table, .el-table');
    console.log(`   表格: ${tables.length} 个`);

    // 检查API调用
    console.log('\n7. API调用统计...');
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

      // 显示失败的API调用
      const failedCalls = apiCalls.filter(call => !call.status.startsWith('2'));
      if (failedCalls.length > 0) {
        console.log('\n   失败的API调用:');
        failedCalls.forEach(call => {
          console.log(`     - ${call.status} ${call.method} ${call.url}`);
        });
      }
    } else {
      console.log('   ⚠ 未发现API调用');
    }

    // 网络错误
    console.log('\n8. 网络错误检查...');
    if (networkErrors.length > 0) {
      console.log(`   ✗ 发现 ${networkErrors.length} 个网络错误:`);
      networkErrors.forEach(error => {
        console.log(`     - ${error.status} ${error.statusText}: ${error.url}`);
      });
    } else {
      console.log('   ✓ 未发现网络错误');
    }

    // 控制台错误
    console.log('\n9. 控制台错误检查...');
    if (consoleErrors.length > 0) {
      console.log(`   ✗ 发现 ${consoleErrors.length} 个控制台错误/警告:`);

      // 按类型分组
      const errorTypes = {};
      consoleErrors.forEach(error => {
        const key = error.type;
        errorTypes[key] = (errorTypes[key] || 0) + 1;
      });

      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`\n   ${type.toUpperCase()} (${count} 个):`);
        consoleErrors
          .filter(e => e.type === type)
          .slice(0, 5) // 只显示前5个
          .forEach(error => {
            console.log(`     - ${error.text?.substring(0, 150) || 'N/A'}`);
          });
        if (consoleErrors.filter(e => e.type === type).length > 5) {
          console.log(`     ... 还有 ${consoleErrors.filter(e => e.type === type).length - 5} 个`);
        }
      });
    } else {
      console.log('   ✓ 未发现控制台错误或警告');
    }

    // 页面截图
    console.log('\n10. 保存调试截图...');
    try {
      await page.screenshot({ path: '/tmp/notifications-page-debug.png', fullPage: true });
      console.log('    ✓ 已保存完整页面截图到 /tmp/notifications-page-debug.png');
    } catch (e) {
      console.log('    ⚠ 截图保存失败:', e.message);
    }

    // 检查页面是否为空
    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '');
    console.log('\n11. 页面内容预览...');
    if (bodyText.length > 0) {
      console.log('   页面有内容 (前200字符):');
      console.log('   ' + bodyText.substring(0, 200).replace(/\n/g, ' '));
    } else {
      console.log('   ⚠ 页面内容为空');
    }

  } catch (error) {
    console.log('\n✗ 测试执行过程中发生错误:', error.message);
    console.log('错误堆栈:', error.stack);
    pageLoadSuccess = false;
  }

  // 生成最终报告
  console.log('\n' + '='.repeat(50));
  console.log('=== 最终测试报告 ===');
  console.log('='.repeat(50));
  console.log('页面加载状态:', pageLoadSuccess ? '✓ 成功' : '✗ 失败');
  console.log('控制台错误:', consoleErrors.length === 0 ? '✓ 无' : `✗ ${consoleErrors.length} 个`);
  console.log('网络错误:', networkErrors.length === 0 ? '✓ 无' : `✗ ${networkErrors.length} 个`);
  console.log('API调用失败:', (apiCalls.filter(c => !c.status.startsWith('2')).length === 0) ? '✓ 无' : `✗ ${apiCalls.filter(c => !c.status.startsWith('2')).length} 个`);
  console.log('图标显示:', iconsVisible ? '✓ 正常' : '⚠ 未检测到或未显示');
  console.log('通知列表:', notificationsVisible ? '✓ 正常' : '⚠ 未检测到或未显示');

  // 总体评估
  const criticalIssues = !pageLoadSuccess ? 1 : 0;
  const warnings = (!iconsVisible ? 1 : 0) + (!notificationsVisible ? 1 : 0);
  const allChecksPass = pageLoadSuccess && consoleErrors.length === 0 && networkErrors.length === 0;

  console.log('\n问题严重程度:');
  console.log(`  严重问题: ${criticalIssues} 个`);
  console.log(`  警告: ${warnings} 个`);
  console.log(`  错误: ${consoleErrors.length} 个`);

  console.log('\n总体状态:', allChecksPass ? '✓ 所有关键检查通过' : '⚠ 存在问题需要关注');

  await browser.close();

  // 设置退出码
  process.exit(allChecksPass ? 0 : 1);
})();
