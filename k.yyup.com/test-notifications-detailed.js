import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testNotificationsPage() {
  const browser = await chromium.launch({
    headless: true,
    devtools: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];
  const apiRequests = [];
  const apiResponses = [];

  // 监听控制台错误
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      if (!text.includes('WebSocket') && !text.includes('ws://') && !text.includes('Websocket')) {
        consoleErrors.push({
          type: msg.type(),
          text: text,
          location: msg.location()
        });
        console.log('⚠️ 控制台错误:', text);
      }
    } else if (msg.type() === 'warn') {
      console.log('⚠️ 控制台警告:', text);
    }
  });

  // 监听网络请求
  page.on('request', request => {
    const url = request.url();
    // 捕获所有HTTP请求，包括认证API
    if (url.includes('/api/') || url.includes('localhost:3000')) {
      apiRequests.push({
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()?.substring(0, 200) || null
      });

      // 如果是认证相关请求，输出详细信息
      if (url.includes('/auth/login') || url.includes('login')) {
        console.log('🔐 认证API请求:', request.method(), url);
        console.log('  数据:', request.postData()?.substring(0, 200));
      } else {
        console.log('📡 API请求:', request.method(), url);
      }
    }
  });

  // 监听网络响应
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/')) {
      try {
        const status = response.status();
        const text = await response.text();
        apiResponses.push({
          url: url,
          status: status,
          statusText: response.statusText(),
          body: text.substring(0, 500) // 只保存前500字符
        });

        if (!response.ok()) {
          networkErrors.push({
            url: url,
            status: status,
            statusText: response.statusText(),
            body: text.substring(0, 200)
          });
          console.log('❌ API错误:', status, url);
        } else {
          console.log('✅ API响应:', status, url);
        }
      } catch (e) {
        console.log('⚠️ 无法读取响应:', url, e.message);
      }
    }
  });

  const testResults = {
    timestamp: new Date().toISOString(),
    steps: [],
    loginStatus: 'pending',
    loginSuccess: false,
    pageUrl: '',
    pageContent: '',
    consoleErrors: [],
    networkErrors: [],
    apiRequests: [],
    apiResponses: [],
    statisticsData: null,
    summary: {}
  };

  try {
    console.log('🔍 开始详细测试通知统计页面...\n');

    // 步骤1: 访问登录页面
    console.log('📄 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    testResults.pageUrl = page.url();
    testResults.steps.push({
      step: 1,
      action: '访问登录页面',
      url: page.url(),
      success: true
    });

    await page.waitForTimeout(2000);

    // 检查页面内容
    const pageTitle = await page.title();
    console.log('📄 页面标题:', pageTitle);

    // 步骤2: 查找并填写登录表单
    console.log('\n🔑 步骤2: 填写登录表单');

    // 检查是否有表单
    const formExists = await page.$('form');
    console.log('📋 表单存在:', !!formExists);

    const usernameInput = await page.$('input[placeholder*="用户名"], input[data-testid="username-input"], input[type="text"]');
    if (!usernameInput) {
      throw new Error('未找到用户名输入框');
    }

    await usernameInput.fill('principal');
    console.log('✅ 用户名已填写');

    const passwordInput = await page.$('input[type="password"]');
    if (!passwordInput) {
      throw new Error('未找到密码输入框');
    }

    await passwordInput.fill('123456');
    console.log('✅ 密码已填写');

    testResults.steps.push({
      step: 2,
      action: '填写登录表单',
      data: { username: 'principal', password: '***' },
      success: true
    });

    // 步骤3: 点击登录按钮
    console.log('\n🚀 步骤3: 点击登录按钮');
    const loginButton = await page.$('button[type="submit"], .login-button, button:has-text("登录")');
    if (!loginButton) {
      throw new Error('未找到登录按钮');
    }

    console.log('✅ 找到登录按钮');
    await loginButton.click();

    testResults.steps.push({
      step: 3,
      action: '点击登录按钮',
      success: true
    });

    // 等待登录响应
    console.log('\n⏳ 等待登录响应...');
    await page.waitForTimeout(8000);

    // 检查登录状态
    const currentUrl = page.url();
    testResults.pageUrl = currentUrl;

    console.log('📍 当前URL:', currentUrl);

    // 检查是否有错误信息
    const errorMessage = await page.$('.error-message, .el-message, .alert-error');
    if (errorMessage) {
      const errorText = await errorMessage.textContent();
      console.log('❌ 登录失败，错误信息:', errorText);
      testResults.loginError = errorText;
    }

    // 检查页面内容
    const bodyText = await page.textContent('body');
    testResults.pageContent = bodyText.substring(0, 500);

    if (currentUrl.includes('/dashboard') || currentUrl.includes('/notifications') || currentUrl.includes('/notifications') || !currentUrl.includes('/login')) {
      testResults.loginStatus = 'success';
      testResults.loginSuccess = true;
      console.log('✅ 登录成功！当前页面:', currentUrl);
    } else if (currentUrl.includes('/login')) {
      testResults.loginStatus = 'failed';
      testResults.loginSuccess = false;
      console.log('❌ 登录失败，页面仍停留在登录页');

      // 检查是否需要注册或选择租户
      const needsRegistration = bodyText.includes('注册') || bodyText.includes('tenant');
      const needsTenantSelection = bodyText.includes('选择租户') || bodyText.includes('tenant');
      testResults.loginNeedsRegistration = needsRegistration;
      testResults.loginNeedsTenantSelection = needsTenantSelection;

      if (needsRegistration) {
        console.log('ℹ️ 用户需要注册到租户');
      }
      if (needsTenantSelection) {
        console.log('ℹ️ 需要选择租户');
      }
    } else {
      testResults.loginStatus = 'unknown';
      testResults.loginSuccess = false;
      console.log('⚠️ 登录状态未知，当前页面:', currentUrl);
    }

    // 步骤4: 尝试访问通知统计页面
    console.log('\n📊 步骤4: 尝试访问通知统计页面');

    if (!testResults.loginSuccess) {
      console.log('⚠️ 登录失败，尝试直接访问通知页面');
    }

    try {
      await page.goto('http://localhost:5173/notifications', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      testResults.pageUrl = page.url();
      testResults.steps.push({
        step: 4,
        action: '访问通知统计页面',
        url: page.url(),
        success: true
      });

      console.log('📍 当前URL:', page.url());

      // 等待页面渲染
      await page.waitForTimeout(5000);

      // 检查是否被重定向回登录页
      if (page.url().includes('/login')) {
        console.log('❌ 被重定向回登录页，可能需要权限或登录');
        testResults.redirectedToLogin = true;
      } else {
        console.log('✅ 成功访问通知页面');

        // 步骤5: 检查页面内容
        console.log('\n📄 步骤5: 检查页面内容');
        const notificationsText = await page.textContent('body');
        testResults.pageContent = notificationsText.substring(0, 1000);

        console.log('📄 页面内容预览:', notificationsText.substring(0, 200));

        // 步骤6: 查找标签页
        console.log('\n🏷️ 步骤6: 查找标签页');
        const tabs = await page.$$('.el-tabs__item, .tab-item, [role="tab"]');
        console.log('📋 找到标签数量:', tabs.length);

        if (tabs.length > 0) {
          const tabTexts = [];
          for (let i = 0; i < Math.min(tabs.length, 5); i++) {
            const text = await tabs[i].textContent();
            tabTexts.push(text);
          }
          console.log('📋 标签文本:', tabTexts);
          testResults.foundTabs = tabTexts;
        }

        // 点击通知统计标签
        const statsTab = await page.$('text=通知统计, .tab-stats, [data-tab="stats"]');
        if (statsTab) {
          await statsTab.click();
          await page.waitForTimeout(2000);
          console.log('✅ 已点击通知统计标签');
        } else {
          console.log('⚠️ 未找到"通知统计"标签');
        }

        // 步骤7: 等待数据加载
        console.log('\n⏳ 步骤7: 等待数据加载');
        await page.waitForTimeout(5000);

        // 步骤8: 检查统计卡片
        console.log('\n📋 步骤8: 检查统计卡片');
        const statCards = await page.$$('.stat-card, .statistics-card, .card, .el-card');
        console.log('📊 找到统计卡片数量:', statCards.length);

        testResults.statisticsData = {
          statCardsCount: statCards.length,
          statCards: []
        };

        for (let i = 0; i < Math.min(statCards.length, 10); i++) {
          const card = statCards[i];
          try {
            const title = await card.$eval('.card-title, .stat-title, h3, h4, .title', el => el.textContent.trim());
            const value = await card.$eval('.card-value, .stat-value, .value, .number', el => el.textContent.trim());
            testResults.statisticsData.statCards.push({ title, value });
            console.log(`  📊 卡片 ${i + 1}: ${title} = ${value}`);
          } catch (e) {
            console.log(`  ⚠️ 无法读取卡片 ${i + 1}`);
          }
        }

        // 步骤9: 检查数据表格
        console.log('\n📊 步骤9: 检查数据表格');
        const dataTables = await page.$$('table, .data-table, .el-table, .el-data-table');
        console.log('📋 找到表格数量:', dataTables.length);

        testResults.statisticsData.dataTables = [];

        for (let i = 0; i < dataTables.length; i++) {
          const table = dataTables[i];
          try {
            const rows = await table.$$eval('tbody tr', rows => rows.length);
            const columns = await table.$$eval('thead th', cols => cols.length);
            testResults.statisticsData.dataTables.push({
              rowsCount: rows,
              columnsCount: columns,
              hasData: rows > 0
            });
            console.log(`  📋 表格 ${i + 1}: ${rows} 行, ${columns} 列`);
          } catch (e) {
            console.log(`  ⚠️ 无法读取表格 ${i + 1}`);
          }
        }

        // 步骤10: 检查API调用
        console.log('\n🌐 步骤10: 检查API调用');
        const statisticsApi = apiRequests.find(req =>
          req.url.includes('/api/principal/notifications/statistics') ||
          req.url.includes('/api/notifications/statistics')
        );

        testResults.statisticsData.apiCall = statisticsApi ? {
          found: true,
          url: statisticsApi.url,
          method: statisticsApi.method
        } : {
          found: false,
          note: '未找到 /api/principal/notifications/statistics API调用'
        };

        console.log('📡 找到统计API:', testResults.statisticsData.apiCall.found);

        if (testResults.statisticsData.apiCall.found) {
          console.log('  URL:', testResults.statisticsData.apiCall.url);
          console.log('  方法:', testResults.statisticsData.apiCall.method);
        }
      }

    } catch (error) {
      console.log('❌ 访问通知页面失败:', error.message);
      testResults.steps.push({
        step: 4,
        action: '访问通知统计页面',
        success: false,
        error: error.message
      });
    }

    // 步骤11: 截图
    console.log('\n📸 步骤11: 截图保存');
    const screenshotPath = path.join(__dirname, 'test-notifications-detailed-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    testResults.screenshot = screenshotPath;
    console.log('✅ 截图已保存:', screenshotPath);

    testResults.steps.push({
      step: 11,
      action: '截图保存',
      success: true,
      path: screenshotPath
    });

    // 保存API请求和响应
    testResults.apiRequests = apiRequests;
    testResults.apiResponses = apiResponses;

    // 生成摘要
    testResults.summary = {
      loginStatus: testResults.loginStatus,
      loginSuccess: testResults.loginSuccess,
      pageUrl: testResults.pageUrl,
      redirectedToLogin: testResults.redirectedToLogin || false,
      needsRegistration: testResults.loginNeedsRegistration || false,
      needsTenantSelection: testResults.loginNeedsTenantSelection || false,
      consoleErrorsCount: consoleErrors.length,
      networkErrorsCount: networkErrors.length,
      apiRequestsCount: apiRequests.length,
      statCardsCount: testResults.statisticsData?.statCardsCount || 0,
      dataTablesCount: testResults.statisticsData?.dataTables?.length || 0,
      hasStatisticsApiCall: testResults.statisticsData?.apiCall?.found || false
    };

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
    console.error('堆栈:', error.stack);
    testResults.error = {
      message: error.message,
      stack: error.stack
    };
    testResults.steps.push({
      step: 'error',
      action: '测试执行',
      success: false,
      error: error.message
    });
  } finally {
    // 收集错误信息
    testResults.consoleErrors = consoleErrors;
    testResults.networkErrors = networkErrors;

    // 保存测试结果
    const resultsPath = path.join(__dirname, 'test-notifications-detailed-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('📊 详细测试结果摘要');
    console.log('='.repeat(60));
    console.log('登录状态:', testResults.loginStatus);
    console.log('登录成功:', testResults.loginSuccess ? '✅ 是' : '❌ 否');
    console.log('当前URL:', testResults.pageUrl);
    if (testResults.redirectedToLogin) {
      console.log('状态:', '❌ 被重定向回登录页');
    }
    if (testResults.loginNeedsRegistration) {
      console.log('状态:', '⚠️ 需要注册到租户');
    }
    if (testResults.loginNeedsTenantSelection) {
      console.log('状态:', '⚠️ 需要选择租户');
    }
    console.log('控制台错误:', consoleErrors.length, '个');
    console.log('网络错误:', networkErrors.length, '个');
    console.log('API请求数:', apiRequests.length, '个');
    console.log('统计卡片数:', testResults.statisticsData?.statCardsCount || 0);
    console.log('数据表格数:', testResults.statisticsData?.dataTables?.length || 0);
    console.log('API调用:', testResults.statisticsData?.apiCall?.found ? '✅ 找到' : '❌ 未找到');
    console.log('='.repeat(60));

    if (consoleErrors.length > 0) {
      console.log('\n⚠️ 控制台错误详情:');
      consoleErrors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. [${err.type}] ${err.text}`);
      });
    }

    if (networkErrors.length > 0) {
      console.log('\n⚠️ 网络错误详情:');
      networkErrors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. [${err.status}] ${err.url}`);
        console.log(`     ${err.body.substring(0, 100)}...`);
      });
    }

    if (testResults.statisticsData?.statCards?.length > 0) {
      console.log('\n📊 统计卡片详情:');
      testResults.statisticsData.statCards.forEach((card, idx) => {
        console.log(`  ${idx + 1}. ${card.title}: ${card.value}`);
      });
    }

    if (testResults.statisticsData?.dataTables?.length > 0) {
      console.log('\n📋 数据表格详情:');
      testResults.statisticsData.dataTables.forEach((table, idx) => {
        console.log(`  ${idx + 1}. ${table.rowsCount} 行 x ${table.columnsCount} 列 (有数据: ${table.hasData ? '是' : '否'})`);
      });
    }

    console.log('\n✅ 测试完成！详细结果已保存到:', resultsPath);
    console.log('📸 截图已保存到:', testResults.screenshot);

    await browser.close();

    return testResults;
  }
}

// 运行测试
testNotificationsPage().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
