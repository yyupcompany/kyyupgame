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

  // 监听控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // 过滤掉WebSocket相关错误
      if (!text.includes('WebSocket') && !text.includes('ws://') && !text.includes('Websocket')) {
        consoleErrors.push({
          type: msg.type(),
          text: text,
          location: msg.location()
        });
      }
    }
  });

  // 监听网络错误
  page.on('response', response => {
    if (!response.ok()) {
      const url = response.url();
      const status = response.status();
      // 只记录API错误
      if (url.includes('/api/') && !url.includes('sockjs-node')) {
        networkErrors.push({
          url: url,
          status: status,
          statusText: response.statusText()
        });
      }
    }
  });

  // 监听API请求
  const apiRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    }
  });

  const testResults = {
    timestamp: new Date().toISOString(),
    steps: [],
    loginStatus: 'pending',
    loginSuccess: false,
    pageUrl: '',
    consoleErrors: [],
    networkErrors: [],
    statisticsData: null,
    summary: {}
  };

  try {
    console.log('🔍 开始测试通知统计页面...');

    // 步骤1: 访问登录页面
    console.log('📄 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    testResults.steps.push({
      step: 1,
      action: '访问登录页面',
      url: page.url(),
      success: true
    });
    testResults.pageUrl = page.url();

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 步骤2: 查找并填写登录表单
    console.log('🔑 步骤2: 填写登录表单');

    // 查找用户名输入框
    const usernameInput = await page.$('input[placeholder*="用户名"], input[data-testid="username-input"]');
    if (!usernameInput) {
      throw new Error('未找到用户名输入框');
    }

    // 填写用户名
    await usernameInput.fill('principal');

    // 查找密码输入框
    const passwordInput = await page.$('input[type="password"]');
    if (!passwordInput) {
      throw new Error('未找到密码输入框');
    }

    // 填写密码
    await passwordInput.fill('123456');

    testResults.steps.push({
      step: 2,
      action: '填写登录表单',
      data: { username: 'principal', password: '***' },
      success: true
    });

    // 步骤3: 点击登录按钮
    console.log('🚀 步骤3: 点击登录按钮');
    const loginButton = await page.$('button[type="submit"], .login-button, button:has-text("登录")');
    if (!loginButton) {
      throw new Error('未找到登录按钮');
    }

    // 点击登录按钮但不等待导航
    await loginButton.click();

    testResults.steps.push({
      step: 3,
      action: '点击登录按钮',
      success: true
    });

    // 等待登录完成
    console.log('⏳ 等待登录响应...');
    await page.waitForTimeout(5000);

    // 检查登录是否成功
    const currentUrl = page.url();
    testResults.pageUrl = currentUrl;

    // 检查是否有错误信息显示
    const errorMessage = await page.$('.error-message, .el-message, .alert-error');
    if (errorMessage) {
      const errorText = await errorMessage.textContent();
      console.log('❌ 登录失败，错误信息:', errorText);
    }

    if (currentUrl.includes('/dashboard') || currentUrl.includes('/notifications') || currentUrl.includes('/')) {
      testResults.loginStatus = 'success';
      testResults.loginSuccess = true;
      console.log('✅ 登录成功！当前页面:', currentUrl);
    } else if (currentUrl.includes('/login')) {
      testResults.loginStatus = 'failed';
      testResults.loginSuccess = false;
      console.log('❌ 登录失败，页面仍停留在登录页');
      // 检查是否有错误提示
      const errorText = await errorMessage?.textContent() || '未知错误';
      testResults.loginError = errorText;
    } else {
      testResults.loginStatus = 'unknown';
      testResults.loginSuccess = false;
      console.log('⚠️ 登录状态未知，当前页面:', currentUrl);
    }

    // 步骤4: 访问通知统计页面
    console.log('📊 步骤4: 访问通知统计页面');

    if (!testResults.loginSuccess) {
      console.log('⚠️ 登录失败，跳过通知统计页面测试');
      testResults.steps.push({
        step: 4,
        action: '访问通知统计页面',
        success: false,
        note: '登录失败，跳过测试'
      });
    } else {
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

      // 等待页面加载
      await page.waitForTimeout(2000);

      // 步骤5: 点击"通知统计"标签
      console.log('🏷️ 步骤5: 点击"通知统计"标签');
      const statsTab = await page.$('text=通知统计, .tab-stats, [data-tab="stats"]');
      if (statsTab) {
        await statsTab.click();
        await page.waitForTimeout(1000);
        testResults.steps.push({
          step: 5,
          action: '点击"通知统计"标签',
          success: true
        });
      } else {
        console.log('⚠️ 未找到"通知统计"标签，可能已经是统计页面');
        testResults.steps.push({
          step: 5,
          action: '点击"通知统计"标签',
          success: false,
          note: '未找到标签，可能已在统计页面'
        });
      }

      // 步骤6: 等待数据加载
      console.log('⏳ 步骤6: 等待数据加载');
      await page.waitForTimeout(5000);

      // 步骤7: 检查统计卡片
      console.log('📋 步骤7: 检查统计卡片');
      const statCards = await page.$$('.stat-card, .statistics-card, .card');
      testResults.statisticsData = {
        statCardsCount: statCards.length,
        statCards: []
      };

      for (let i = 0; i < statCards.length; i++) {
        const card = statCards[i];
        const title = await card.$eval('.card-title, .stat-title, h3, h4', el => el.textContent.trim()).catch(() => 'N/A');
        const value = await card.$eval('.card-value, .stat-value, .value', el => el.textContent.trim()).catch(() => 'N/A');
        testResults.statisticsData.statCards.push({ title, value });
      }

      testResults.steps.push({
        step: 7,
        action: '检查统计卡片',
        success: true,
        count: statCards.length
      });

      // 步骤8: 检查数据表格
      console.log('📊 步骤8: 检查数据表格');
      const dataTables = await page.$$('table, .data-table, .el-table');
      testResults.statisticsData.dataTables = [];

      for (const table of dataTables) {
        const rows = await table.$$eval('tbody tr', rows => rows.length);
        testResults.statisticsData.dataTables.push({
          rowsCount: rows,
          hasData: rows > 0
        });
      }

      testResults.steps.push({
        step: 8,
        action: '检查数据表格',
        success: true,
        tablesFound: dataTables.length
      });

      // 步骤9: 查找API调用
      console.log('🌐 步骤9: 检查API调用');
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

      // 步骤10: 截图
      console.log('📸 步骤10: 截图保存');
      const screenshotPath = path.join(__dirname, 'test-notifications-screenshot.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testResults.screenshot = screenshotPath;

      testResults.steps.push({
        step: 10,
        action: '截图保存',
        success: true,
        path: screenshotPath
      });

      // 生成摘要
      testResults.summary = {
        loginStatus: testResults.loginStatus,
        loginSuccess: testResults.loginSuccess,
        pageUrl: testResults.pageUrl,
        consoleErrorsCount: consoleErrors.length,
        networkErrorsCount: networkErrors.length,
        statCardsCount: testResults.statisticsData.statCardsCount,
        dataTablesCount: testResults.statisticsData.dataTables.length,
        hasStatisticsApiCall: testResults.statisticsData.apiCall.found
      };
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
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
    const resultsPath = path.join(__dirname, 'test-notifications-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('📊 测试结果摘要');
    console.log('='.repeat(60));
    console.log('登录状态:', testResults.loginStatus);
    console.log('登录成功:', testResults.loginSuccess ? '✅ 是' : '❌ 否');
    console.log('当前URL:', testResults.pageUrl);
    console.log('控制台错误:', consoleErrors.length, '个');
    console.log('网络错误:', networkErrors.length, '个');
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
      });
    }

    if (testResults.statisticsData) {
      console.log('\n📊 统计卡片详情:');
      testResults.statisticsData.statCards.forEach((card, idx) => {
        console.log(`  ${idx + 1}. ${card.title}: ${card.value}`);
      });

      console.log('\n📋 数据表格详情:');
      testResults.statisticsData.dataTables.forEach((table, idx) => {
        console.log(`  ${idx + 1}. 表格行数: ${table.rowsCount}, 有数据: ${table.hasData ? '是' : '否'}`);
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
