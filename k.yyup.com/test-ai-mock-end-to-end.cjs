/**
 * AI Mock服务端到端测试脚本
 * 测试完整的用户交互流程：登录 → AI助手 → 工具调用 → 数据查询
 */

const { chromium } = require('playwright');
const { EventEmitter } = require('events');

// 测试配置
const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:5173',
  TEST_TIMEOUT: 30000,
  MOCK_MESSAGES: [
    '你好，请查询当前在园所有人数',
    '查询小班的学生信息',
    '获取今天的考勤记录',
    '查看近期活动安排'
  ]
};

// 测试结果收集器
class TestResults extends EventEmitter {
  constructor() {
    super();
    this.results = [];
  }

  addResult(type, data) {
    const result = {
      timestamp: new Date().toISOString(),
      type,
      data,
      success: data.success !== false
    };
    this.results.push(result);
    this.emit('result', result);
    console.log(`✅ [测试结果] ${type}:`, data);
  }
}

// 测试工具函数
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.warn(`⚠️ 请求失败，重试 ${i + 1}/${retries}:`, error.message);
      if (i === retries - 1) throw error;
      await delay(1000);
    }
  }
}

// 主测试函数
async function runEndToEndTest() {
  console.log('🚀 开始AI Mock服务端到端测试...');

  const results = new TestResults();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 步骤1: 测试Mock服务状态
    console.log('\n📍 步骤1: 检查Mock服务状态');

    const mockStatusResponse = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/status`);
    const mockStatus = await mockStatusResponse.json();
    results.addResult('mock_status', mockStatus);

    console.log('📊 Mock服务状态:', mockStatus.data);

    // 步骤2: 启用Mock模式
    console.log('\n📍 步骤2: 启用Mock模式');

    const toggleResponse = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true })
    });

    const toggleResult = await toggleResponse.json();
    results.addResult('mock_toggle', toggleResult);

    // 步骤3: 测试Mock配置
    console.log('\n📍 步骤3: 配置Mock参数');

    const configResponse = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'detailed',
        delay: 500,
        enableThinking: true,
        enableStreaming: true
      })
    });

    const configResult = await configResponse.json();
    results.addResult('mock_config', configResult);

    // 步骤4: 测试基础Mock聊天
    console.log('\n📍 步骤4: 测试基础Mock聊天');

    for (const message of CONFIG.TEST_MESSAGES) {
      console.log(`💬 测试消息: "${message}"`);

      const chatResponse = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          mode: 'detailed'
        })
      });

      const chatResult = await chatResponse.json();
      results.addResult('mock_chat', {
        message,
        response: chatResult,
        hasToolCalls: !!chatResult.data?.mock_metadata?.responses?.some(r => r.type === 'tool_call'),
        responseTime: Date.now() - Date.now()
      });

      console.log(`✅ 响应: ${chatResult.data.choices[0]?.message?.content?.substring(0, 100)}...`);
    }

    // 步骤5: 测试流式Mock响应
    console.log('\n📍 步骤5: 测试流式Mock响应');

    const streamTestMessage = '流式测试：查询在园学生详细信息';
    console.log(`💬 流式测试消息: "${streamTestMessage}"`);

    const streamResponse = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (streamResponse.body) {
      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      const streamEvents = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                streamEvents.push(data);
                console.log(`📡 流式事件:`, data.event || 'unknown');
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      results.addResult('mock_stream', {
        message: streamTestMessage,
        events: streamEvents,
        totalEvents: streamEvents.length
      });
    }

    // 步骤6: 测试完整的前端流程
    console.log('\n📍 步骤6: 测试前端完整流程');

    // 访问前端登录页面
    await page.goto(`${CONFIG.FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');

    // 尝试登录（即使失败也可以测试Mock功能）
    try {
      await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], #username, [data-testid="username-input"]', 'admin');
      await page.fill('input[placeholder*="密码"], #password, [data-testid="password-input"]', '123456');

      const loginButton = await page.$('button[type="submit"], .el-button--primary, .login-button, [data-testid="login-button"]');
      if (loginButton) {
        await loginButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('⚠️ 登录失败，继续测试Mock功能:', error.message);
    }

    // 直接访问AI助手页面
    await page.goto(`${CONFIG.FRONTEND_URL}/ai/assistant?mode=fullpage`);
    await page.waitForLoadState('networkidle');

    // 测试前端AI交互
    try {
      const aiInput = await page.$('textarea[placeholder*="请输入"], .el-textarea__inner, [data-testid="ai-input"]');
      if (aiInput) {
        await aiInput.fill('Mock测试：查询幼儿园统计信息');

        const sendButton = await page.$('button[type="submit"], .send-button, [data-testid="send-button"]');
        if (sendButton) {
          await sendButton.click();
          await page.waitForTimeout(3000);

          // 检查是否有AI响应
          const aiResponse = await page.$('.ai-response, .message-content, .response-content');
          results.addResult('frontend_ai_interaction', {
            hasInput: !!aiInput,
            hasSendButton: !!sendButton,
            hasResponse: !!aiResponse,
            success: !!aiInput && !!sendButton
          });
        }
      }
    } catch (error) {
      console.log('⚠️ 前端AI交互失败:', error.message);
      results.addResult('frontend_ai_interaction', {
        success: false,
        error: error.message
      });
    }

    // 步骤7: 性能测试
    console.log('\n📍 步骤7: 性能测试');

    const startTime = Date.now();
    const performanceTestMessages = ['测试消息1', '测试消息2', '测试消息3'];

    for (const message of performanceTestMessages) {
      const perfStart = Date.now();

      const perfResponse = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const perfResult = await perfResponse.json();
      const perfTime = Date.now() - perfStart;

      results.addResult('performance_test', {
        message,
        responseTime: perfTime,
        success: perfResult.success
      });
    }

    const totalTime = Date.now() - startTime;
    results.addResult('performance_summary', {
      totalMessages: performanceTestMessages.length,
      totalTime,
      averageTime: totalTime / performanceTestMessages.length
    });

    // 步骤8: 验证Mock特性
    console.log('\n📍 步骤8: 验证Mock特性');

    const featureTests = [
      {
        name: 'thinking_process',
        test: async () => {
          const response = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '需要深度分析的问题' })
          });
          const result = await response.json();
          return result.data.mock_metadata?.responses?.some(r => r.type === 'thinking');
        }
      },
      {
        name: 'tool_calling',
        test: async () => {
          const response = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '查询在园所有人数' })
          });
          const result = await response.json();
          return result.data.mock_metadata?.responses?.some(r => r.type === 'tool_call');
        }
      },
      {
        name: 'data_return',
        test: async () => {
          const response = await fetchWithRetry(`${CONFIG.BASE_URL}/api/ai-mock/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '查询学生信息' })
          });
          const result = await response.json();
          const toolResults = result.data.mock_metadata?.responses?.filter(r => r.type === 'tool_call');
          return toolResults?.some(t => t.data?.result?.totalStudents > 0);
        }
      }
    ];

    for (const test of featureTests) {
      const featureResult = await test.test();
      results.addResult('feature_test', {
        feature: test.name,
        success: featureResult
      });
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    results.addResult('test_error', {
      error: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();

    // 生成测试报告
    console.log('\n📊 ===== 测试报告 =====');

    const totalTests = results.results.length;
    const passedTests = results.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${failedTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

    console.log('\n📋 详细结果:');
    results.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} [${result.type}] ${JSON.stringify(result.data).substring(0, 200)}...`);
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
      results: results.results,
      config: {
        baseUrl: CONFIG.BASE_URL,
        frontendUrl: CONFIG.FRONTEND_URL,
        testMessages: CONFIG.TEST_MESSAGES
      }
    };

    // 保存到文件
    const fs = require('fs');
    fs.writeFileSync(
      './ai-mock-test-report.json',
      JSON.stringify(reportData, null, 2),
      'utf8'
    );

    console.log('\n💾 测试报告已保存到: ai-mock-test-report.json');

    if (failedTests > 0) {
      console.log('\n⚠️ 存在失败的测试，请查看详细报告');
      process.exit(1);
    } else {
      console.log('\n🎉 所有测试通过！AI Mock服务工作正常！');
    }
  }
}

// 运行测试
if (require.main === module) {
  runEndToEndTest().catch(error => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}