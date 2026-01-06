/**
 * AI助手全屏模式完整链条测试
 * 测试前端发送提示词到后端流式响应的完整流程
 */

const { chromium } = require('playwright');
const { EventEmitter } = require('events');

// 测试配置
const CONFIG = {
  FRONTEND_URL: 'http://localhost:5173',
  BACKEND_URL: 'http://localhost:3000',
  AI_ASSISTANT_URL: 'http://localhost:5173/ai/assistant?mode=fullpage',
  TEST_MESSAGES: [
    '查询当前在园所有人数',
    '查询小班学生详细信息',
    '获取今天的考勤统计',
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

// 延迟函数
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主测试函数
async function runAIAssistantFullChainTest() {
  console.log('🚀 开始AI助手全屏模式完整链条测试...');

  const results = new TestResults();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 步骤1: 检查后端Mock服务状态
    console.log('\n📍 步骤1: 检查后端Mock服务状态');

    try {
      const mockStatusResponse = await fetch(`${CONFIG.BACKEND_URL}/api/ai-mock/status`);
      const mockStatus = await mockStatusResponse.json();
      results.addResult('backend_mock_status', mockStatus);
      console.log('📊 后端Mock服务状态:', mockStatus.data);
    } catch (error) {
      results.addResult('backend_mock_status', {
        success: false,
        error: error.message
      });
    }

    // 步骤2: 测试后端流式聊天API
    console.log('\n📍 步骤2: 测试后端流式聊天API');

    for (const message of CONFIG.TEST_MESSAGES) {
      console.log(`💬 测试消息: "${message}"`);

      try {
        const streamResponse = await fetch(`${CONFIG.BACKEND_URL}/api/ai-mock/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            mode: 'detailed'
          })
        });

        if (streamResponse.body) {
          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder();
          const events = [];

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
                    events.push(data);
                    console.log(`📡 后端事件: ${data.event || 'unknown'}`);
                  } catch (e) {
                    // 忽略解析错误
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          results.addResult('backend_stream_chat', {
            message,
            events: events.length,
            hasThinking: events.some(e => e.event === 'thinking'),
            hasToolCall: events.some(e => e.event === 'tool_call_start'),
            hasAnswer: events.some(e => e.event === 'answer_chunk'),
            success: events.length > 0
          });
        }
      } catch (error) {
        results.addResult('backend_stream_chat', {
          message,
          success: false,
          error: error.message
        });
      }
    }

    // 步骤3: 访问前端AI助手全屏页面
    console.log('\n📍 步骤3: 访问前端AI助手全屏页面');

    try {
      await page.goto(CONFIG.AI_ASSISTANT_URL, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      // 等待页面加载
      await page.waitForTimeout(2000);

      // 检查页面是否正确加载
      const pageUrl = page.url();
      const pageTitle = await page.title();

      results.addResult('frontend_page_load', {
        url: pageUrl,
        title: pageTitle,
        hasAIAssistant: pageUrl.includes('/ai/assistant'),
        success: pageUrl.includes('/ai/assistant')
      });

      console.log('📱 前端页面加载:', pageUrl);
    } catch (error) {
      results.addResult('frontend_page_load', {
        success: false,
        error: error.message
      });
    }

    // 步骤4: 测试前端AI输入功能
    console.log('\n📍 步骤4: 测试前端AI输入功能');

    try {
      // 查找AI输入框
      const aiInputSelectors = [
        'textarea[placeholder*="请输入"]',
        '.el-textarea__inner',
        '[data-testid="ai-input"]',
        'textarea',
        '.message-input',
        '.chat-input'
      ];

      let inputElement = null;
      for (const selector of aiInputSelectors) {
        try {
          inputElement = await page.$(selector);
          if (inputElement) {
            console.log(`🎯 找到输入框: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (inputElement) {
        // 测试输入
        const testMessage = '查询当前在园学生人数统计';
        await inputElement.fill(testMessage);

        results.addResult('frontend_input_found', {
          success: true,
          inputFound: true,
          testMessage
        });

        // 查找发送按钮
        const sendButtonSelectors = [
          'button[type="submit"]',
          '.send-button',
          '[data-testid="send-button"]',
          '.el-button--primary',
          '.chat-send',
          'button:has-text("发送")'
        ];

        let sendButton = null;
        for (const selector of sendButtonSelectors) {
          try {
            sendButton = await page.$(selector);
            if (sendButton) {
              console.log(`🎯 找到发送按钮: ${selector}`);
              break;
            }
          } catch (e) {
            // 继续尝试下一个选择器
          }
        }

        if (sendButton) {
          // 点击发送按钮
          await sendButton.click();

          results.addResult('frontend_send_clicked', {
            success: true,
            message: testMessage
          });

          // 等待响应
          await page.waitForTimeout(3000);

          // 检查是否有响应显示
          const responseSelectors = [
            '.ai-response',
            '.message-content',
            '.response-content',
            '.chat-message',
            '.assistant-message'
          ];

          let hasResponse = false;
          for (const selector of responseSelectors) {
            try {
              const response = await page.$(selector);
              if (response) {
                hasResponse = true;
                console.log(`🎯 找到响应内容: ${selector}`);
                break;
              }
            } catch (e) {
              // 继续尝试下一个选择器
            }
          }

          results.addResult('frontend_ai_response', {
            hasResponse,
            message: testMessage,
            success: hasResponse
          });

        } else {
          results.addResult('frontend_send_clicked', {
            success: false,
            error: '发送按钮未找到'
          });
        }

      } else {
        results.addResult('frontend_input_found', {
          success: false,
          error: 'AI输入框未找到'
        });
      }

    } catch (error) {
      results.addResult('frontend_input_test', {
        success: false,
        error: error.message
      });
    }

    // 步骤5: 捕获前端网络请求
    console.log('\n📍 步骤5: 捕获前端网络请求');

    try {
      // 设置请求监听
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('/ai') || request.url().includes('/chat')) {
          requests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            timestamp: new Date().toISOString()
          });
        }
      });

      // 设置响应监听
      const responses = [];
      page.on('response', response => {
        if (response.url().includes('/ai') || response.url().includes('/chat')) {
          responses.push({
            url: response.url(),
            status: response.status(),
            timestamp: new Date().toISOString()
          });
        }
      });

      // 再次尝试发送消息以捕获请求
      const inputElement = await page.$('textarea, .el-textarea__inner');
      if (inputElement) {
        await inputElement.fill('测试网络请求捕获');
        const sendButton = await page.$('button[type="submit"], .el-button--primary');
        if (sendButton) {
          await sendButton.click();
          await page.waitForTimeout(2000);
        }
      }

      results.addResult('network_requests', {
        requests: requests.length,
        responses: responses.length,
        requestUrls: requests.map(r => r.url),
        responseStatuses: responses.map(r => ({ url: r.url, status: r.status })),
        success: requests.length > 0
      });

    } catch (error) {
      results.addResult('network_requests', {
        success: false,
        error: error.message
      });
    }

    // 步骤6: 检查页面控制台错误
    console.log('\n📍 步骤6: 检查页面控制台错误');

    try {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push({
            text: msg.text(),
            location: msg.location(),
            timestamp: new Date().toISOString()
          });
        }
      });

      // 等待一秒收集可能的错误
      await page.waitForTimeout(1000);

      results.addResult('console_errors', {
        errors: consoleErrors.length,
        errorDetails: consoleErrors,
        success: consoleErrors.length === 0
      });

      if (consoleErrors.length > 0) {
        console.log('⚠️ 控制台错误:', consoleErrors);
      }

    } catch (error) {
      results.addResult('console_errors', {
        success: false,
        error: error.message
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
    console.log('\n📊 ===== AI助手全屏模式完整链条测试报告 =====');

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
      config: CONFIG
    };

    // 保存到文件
    const fs = require('fs');
    fs.writeFileSync(
      './ai-fullchain-test-report.json',
      JSON.stringify(reportData, null, 2),
      'utf8'
    );

    console.log('\n💾 测试报告已保存到: ai-fullchain-test-report.json');

    if (failedTests > 0) {
      console.log('\n⚠️ 存在失败的测试，请查看详细报告');
      process.exit(1);
    } else {
      console.log('\n🎉 所有测试通过！AI助手全屏模式完整链条工作正常！');
    }
  }
}

// 运行测试
if (require.main === module) {
  runAIAssistantFullChainTest().catch(error => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}