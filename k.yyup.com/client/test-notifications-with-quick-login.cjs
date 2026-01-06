const { chromium } = require('playwright');

(async () => {
  console.log('=== 通知统计页面回归测试（快速体验登录）===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  const consoleErrors = [];
  const networkErrors = [];
  const apiCalls = [];
  let statsCards = [];
  let tableRows = [];

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || type === 'warning') {
      consoleErrors.push({
        type,
        text: text,
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

  // 监听响应
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    apiCalls.push({
      url,
      status,
      method: response.request().method()
    });

    if (status >= 400) {
      networkErrors.push({
        url,
        status,
        statusText: response.statusText()
      });
    }
  });

  try {
    // 1. 访问首页
    console.log('1. 访问首页 (http://localhost:5174)...');
    await page.goto('http://localhost:5174', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(3000);
    console.log('   ✓ 页面加载完成\n');

    // 2. 点击"快速体验"按钮
    console.log('2. 点击"快速体验"按钮...');
    const quickExperienceBtn = await page.$('text=快速体验');
    if (quickExperienceBtn) {
      await quickExperienceBtn.click();
      await page.waitForTimeout(2000);
      console.log('   ✓ 已点击快速体验\n');
    } else {
      console.log('   ⚠ 未找到快速体验按钮\n');
    }

    // 3. 选择园长角色
    console.log('3. 选择园长角色...');
    const principalRole = await page.$('text=园长');
    if (principalRole) {
      await principalRole.click();
      await page.waitForTimeout(5000);
      console.log('   ✓ 已选择园长角色\n');
    } else {
      console.log('   ⚠ 未找到园长角色选项\n');
    }

    // 4. 检查登录状态
    const currentUrl = page.url();
    console.log('4. 检查登录状态...');
    console.log('   当前URL:', currentUrl);

    if (currentUrl.includes('login')) {
      console.log('   ⚠ 仍在登录页面，登录可能失败\n');
    } else {
      console.log('   ✓ 登录成功\n');
    }

    // 5. 直接访问通知页面
    console.log('5. 直接访问通知页面...');
    await page.goto('http://localhost:5174/notifications', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(5000);
    console.log('   ✓ 已导航到通知页面\n');

    // 6. 点击"通知统计"标签
    console.log('6. 点击"通知统计"标签...');
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.el-tabs__item, [class*="tab"]');
      tabs.forEach(tab => {
        if (tab.textContent && tab.textContent.includes('通知统计')) {
          tab.click();
        }
      });
    });
    await page.waitForTimeout(3000);
    console.log('   ✓ 已点击通知统计标签\n');

    // 7. 等待数据加载
    console.log('7. 等待数据加载（3-5秒）...');
    await page.waitForTimeout(5000);
    console.log('   ✓ 数据加载完成\n');

    // 8. 检查页面元素
    console.log('8. 检查页面元素...');

    // 检查统计卡片
    const statsSelectors = [
      '[data-testid*="notification-stat"]',
      '[class*="stat-card"]',
      '[class*="statistics"]',
      '[class*="notification-stat"]',
      '.notification-stat-card',
      '.stats-container',
      '.el-statistic'
    ];

    for (const selector of statsSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        statsCards = elements;
        console.log(`   ✓ 找到 ${elements.length} 个统计卡片（选择器: ${selector}）`);
        break;
      }
    }

    // 检查表格
    const tableSelectors = [
      'table',
      '.el-table',
      '[class*="table"]'
    ];

    for (const selector of tableSelectors) {
      const rows = await page.$$(`${selector} tbody tr, ${selector} tr`);
      if (rows.length > 0) {
        tableRows = rows;
        console.log(`   ✓ 找到表格，行数: ${rows.length}（选择器: ${selector}）`);
        break;
      }
    }

    // 9. 检查API调用
    console.log('\n9. API调用统计...');
    if (apiCalls.length > 0) {
      const statusCounts = {};
      apiCalls.forEach(call => {
        const key = call.status.toString();
        statusCounts[key] = (statusCounts[key] || 0) + 1;
      });

      Object.entries(statusCounts).forEach(([status, count]) => {
        const icon = status.startsWith('2') ? '✓' : status.startsWith('4') || status.startsWith('5') ? '✗' : '?';
        console.log(`   ${icon} ${status}: ${count} 次调用`);
      });

      // 显示通知相关API调用
      const notificationAPIs = apiCalls.filter(call =>
        call.url.includes('/notification') || call.url.includes('/notify') || call.url.includes('/statistics')
      );
      if (notificationAPIs.length > 0) {
        console.log('\n   通知/统计相关API调用:');
        notificationAPIs.forEach(call => {
          console.log(`     ${call.status.toString().startsWith('2') ? '✓' : '✗'} ${call.status} ${call.method} ${call.url.substring(0, 80)}...`);
        });
      }
    }

    // 10. 网络错误检查
    console.log('\n10. 网络错误检查...');
    if (networkErrors.length > 0) {
      console.log(`   ✗ 发现 ${networkErrors.length} 个网络错误:`);
      networkErrors.forEach(error => {
        console.log(`     - ${error.status} ${error.statusText}: ${error.url}`);
      });
    } else {
      console.log('   ✓ 未发现网络错误');
    }

    // 11. 控制台错误检查（过滤WebSocket和认证警告）
    console.log('\n11. 控制台错误检查...');
    const filteredErrors = consoleErrors.filter(error => {
      const text = error.text || '';
      return !text.includes('WebSocket') &&
             !text.includes('ws://') &&
             !text.includes('401') &&
             !text.includes('Token') &&
             !text.includes('MISSING_TOKEN');
    });

    if (filteredErrors.length > 0) {
      console.log(`   ✗ 发现 ${filteredErrors.length} 个关键错误/警告:`);
      filteredErrors.slice(0, 5).forEach(error => {
        console.log(`     - ${error.type}: ${error.text?.substring(0, 150) || 'N/A'}`);
      });
      if (filteredErrors.length > 5) {
        console.log(`     ... 还有 ${filteredErrors.length - 5} 个`);
      }
    } else {
      console.log('   ✓ 未发现关键错误或警告');
    }

    const wsErrors = consoleErrors.filter(e => (e.text || '').includes('WebSocket') || (e.text || '').includes('ws://')).length;
    if (wsErrors > 0) {
      console.log(`   ℹ WebSocket错误: ${wsErrors} 个（已过滤）`);
    }

    // 12. 页面截图
    console.log('\n12. 保存调试截图...');
    try {
      await page.screenshot({
        path: '/tmp/notifications-statistics-test-result.png',
        fullPage: true
      });
      console.log('    ✓ 已保存完整页面截图');
    } catch (e) {
      console.log('    ⚠ 截图保存失败:', e.message);
    }

    // 13. 页面内容预览
    console.log('\n13. 页面内容预览...');
    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '');
    if (bodyText.length > 0) {
      console.log('   页面内容（前300字符）:');
      console.log('   ' + bodyText.substring(0, 300).replace(/\n/g, ' '));
    } else {
      console.log('   ⚠ 页面内容为空');
    }

  } catch (error) {
    console.log('\n✗ 测试执行过程中发生错误:', error.message);
    console.log('错误堆栈:', error.stack);
  }

  // 生成最终报告
  console.log('\n' + '='.repeat(70));
  console.log('           通知统计页面回归测试报告');
  console.log('='.repeat(70));

  console.log('\n【页面加载状态】');
  const finalUrl = page.url();
  console.log(`页面访问:          ✓ 成功`);
  console.log(`当前URL:           ${finalUrl}`);
  console.log(`页面认证状态:      ${finalUrl.includes('login') ? '⚠ 需要登录' : '✓ 已登录'}`);

  console.log('\n【页面元素检查】');
  console.log(`统计卡片显示:      ${statsCards.length > 0 ? `✓ 找到 ${statsCards.length} 个` : '⚠ 未找到'}`);
  console.log(`数据表格:          ${tableRows.length > 0 ? `✓ 有数据（${tableRows.length} 行）` : '⚠ 无数据或未加载'}`);

  console.log('\n【API请求检查】');
  const notificationAPIs = apiCalls.filter(call =>
    call.url.includes('/notification') || call.url.includes('/notify') || call.url.includes('/statistics')
  );
  console.log(`总API调用数:       ${apiCalls.length}`);
  console.log(`通知/统计API:      ${notificationAPIs.length}`);

  if (notificationAPIs.length > 0) {
    const successfulAPIs = notificationAPIs.filter(api => api.status.toString().startsWith('2')).length;
    console.log(`通知API成功率:     ${successfulAPIs}/${notificationAPIs.length}`);
  }

  console.log('\n【错误检查】');
  const filteredErrors = consoleErrors.filter(error => {
    const text = error.text || '';
    return !text.includes('WebSocket') &&
           !text.includes('ws://') &&
           !text.includes('401') &&
           !text.includes('Token') &&
           !text.includes('MISSING_TOKEN');
  });
  console.log(`控制台关键错误:    ${filteredErrors.length === 0 ? '✓ 无' : `✗ ${filteredErrors.length} 个`}`);
  console.log(`网络错误:          ${networkErrors.length === 0 ? '✓ 无' : `✗ ${networkErrors.length} 个`}`);

  // 总体评估
  const criticalIssues = finalUrl.includes('login') ? 1 : 0;
  const hasStats = statsCards.length > 0;
  const hasTableData = tableRows.length > 0;
  const hasCriticalErrors = filteredErrors.length > 0 || networkErrors.length > 0;

  console.log('\n【问题严重程度】');
  console.log(`严重问题:          ${criticalIssues} 个 (登录失败)`);
  console.log(`警告:              ${(!hasStats ? 1 : 0) + (!hasTableData ? 1 : 0)} 个 (元素未找到)`);
  console.log(`错误:              ${filteredErrors.length} 个 (关键错误)`);

  console.log('\n【总体状态】');
  if (!hasCriticalErrors && !criticalIssues) {
    console.log('✅ 所有关键检查通过 - 通知统计页面运行正常');
  } else if (criticalIssues) {
    console.log('⚠️ 页面需要登录认证 - 请检查登录流程');
  } else {
    console.log('⚠️ 存在问题需要关注 - 请检查上述错误和警告');
  }

  console.log('\n【建议】');
  if (criticalIssues) {
    console.log('1. 检查快速体验按钮是否可用');
    console.log('2. 验证园长角色是否正确配置');
    console.log('3. 检查认证服务是否正常运行');
  }
  if (!hasStats) {
    console.log('1. 检查通知统计数据是否正确加载');
    console.log('2. 验证API /api/principal/notifications/statistics 是否返回数据');
  }
  if (!hasTableData) {
    console.log('1. 检查通知列表数据是否存在');
    console.log('2. 验证分页和查询参数是否正确');
  }
  if (filteredErrors.length > 0 || networkErrors.length > 0) {
    console.log('1. 查看控制台错误详情并修复相关问题');
    console.log('2. 检查API端点是否正常工作');
  }

  console.log('\n' + '='.repeat(70));

  await browser.close();
  process.exit(hasCriticalErrors || criticalIssues ? 1 : 0);
})();
