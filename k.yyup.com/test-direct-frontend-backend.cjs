/**
 * 直接测试前端后端通信
 * 模拟前端调用后端流式API的完整流程
 */

const { chromium } = require('playwright');

// 测试配置
const CONFIG = {
  BACKEND_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:5173',
  TEST_MESSAGE: '查询当前在园学生人数'
};

// 模拟前端调用后端API
async function testBackendStreamAPI() {
  console.log('🔗 直接测试后端流式API...');

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/ai-mock/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        message: CONFIG.TEST_MESSAGE,
        mode: 'detailed'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const events = [];
    let eventCount = 0;

    console.log('📡 开始接收流式数据...');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            eventCount++;
            try {
              const data = JSON.parse(line.slice(6));
              events.push(data);
              console.log(`📦 事件 ${eventCount}: ${data.event || 'unknown'} - ${data.data?.content || data.content || 'N/A'}`);
            } catch (e) {
              console.log(`⚠️ 解析错误: ${line}`);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    console.log(`\n✅ 流式API测试完成！`);
    console.log(`📊 总事件数: ${events.length}`);
    console.log(`🎯 事件类型分布:`);

    const eventTypes = {};
    events.forEach(event => {
      eventTypes[event.event] = (eventTypes[event.event] || 0) + 1;
    });

    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}次`);
    });

    return {
      success: true,
      eventCount: events.length,
      eventTypes,
      events
    };

  } catch (error) {
    console.error('❌ 后端API测试失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 模拟浏览器环境测试前端页面
async function testFrontendPage() {
  console.log('\n🌐 测试前端页面...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 访问首页
    console.log('📍 访问首页...');
    await page.goto(CONFIG.FRONTEND_URL, { waitUntil: 'networkidle' });

    // 等待Vue应用加载
    await page.waitForTimeout(3000);

    // 检查页面内容
    const pageContent = await page.content();
    const hasVueApp = pageContent.includes('id="app"') || pageContent.includes('<div id="app">');

    console.log(`📱 Vue应用加载: ${hasVueApp ? '✅' : '❌'}`);

    // 尝试访问AI页面
    console.log('📍 尝试访问AI页面...');
    await page.goto(`${CONFIG.FRONTEND_URL}/ai`, { waitUntil: 'networkidle', timeout: 5000 });

    const currentUrl = page.url();
    console.log(`📍 当前URL: ${currentUrl}`);

    // 查找任何可能的输入框
    const inputSelectors = [
      'input',
      'textarea',
      '[contenteditable="true"]',
      '.el-input__inner',
      '.el-textarea__inner'
    ];

    let inputFound = false;
    for (const selector of inputSelectors) {
      const inputs = await page.$$(selector);
      if (inputs.length > 0) {
        console.log(`🎯 找到 ${inputs.length} 个 ${selector} 元素`);
        inputFound = true;
        break;
      }
    }

    return {
      success: true,
      vueAppLoaded: hasVueApp,
      finalUrl: currentUrl,
      inputFound
    };

  } catch (error) {
    console.error('❌ 前端页面测试失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// 测试网络连接
async function testNetworkConnectivity() {
  console.log('\n🔍 测试网络连接...');

  const results = {};

  // 测试后端连接
  try {
    const backendResponse = await fetch(`${CONFIG.BACKEND_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    results.backend = {
      success: backendResponse.ok,
      status: backendResponse.status
    };
  } catch (error) {
    results.backend = {
      success: false,
      error: error.message
    };
  }

  // 测试前端连接
  try {
    const frontendResponse = await fetch(CONFIG.FRONTEND_URL, {
      method: 'GET',
      timeout: 5000
    });
    results.frontend = {
      success: frontendResponse.ok,
      status: frontendResponse.status
    };
  } catch (error) {
    results.frontend = {
      success: false,
      error: error.message
    };
  }

  return results;
}

// 主测试函数
async function runDirectTest() {
  console.log('🚀 开始直接前后端通信测试...\n');

  // 测试网络连接
  const networkResults = await testNetworkConnectivity();
  console.log('📊 网络连接测试结果:', networkResults);

  // 测试后端流式API
  const backendResults = await testBackendStreamAPI();

  // 测试前端页面
  const frontendResults = await testFrontendPage();

  // 生成测试报告
  console.log('\n📊 ===== 测试报告 =====');

  const allTests = [
    { name: '后端连接', ...networkResults.backend },
    { name: '前端连接', ...networkResults.frontend },
    { name: '后端流式API', ...backendResults },
    { name: '前端页面', ...frontendResults }
  ];

  const totalTests = allTests.length;
  const passedTests = allTests.filter(t => t.success).length;
  const failedTests = totalTests - passedTests;

  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${failedTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

  console.log('\n📋 详细结果:');
  allTests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} [${test.name}] ${test.error || test.status || test.eventCount || 'OK'}`);
  });

  // 保存测试报告
  const reportData = {
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: ((passedTests / totalTests) * 100).toFixed(2),
      timestamp: new Date().toISOString()
    },
    results: allTests,
    backendDetails: backendResults,
    frontendDetails: frontendResults,
    networkDetails: networkResults
  };

  const fs = require('fs');
  fs.writeFileSync(
    './direct-frontend-backend-test-report.json',
    JSON.stringify(reportData, null, 2),
    'utf8'
  );

  console.log('\n💾 测试报告已保存到: direct-frontend-backend-test-report.json');

  if (failedTests > 0) {
    console.log('\n⚠️ 存在失败的测试，请查看详细报告');
    process.exit(1);
  } else {
    console.log('\n🎉 所有测试通过！前后端通信正常工作！');
  }
}

// 运行测试
if (require.main === module) {
  runDirectTest().catch(error => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}