/**
 * 快速测试修复后的AI流处理接口
 */

const http = require('http');

// 测试配置
const testConfig = {
  baseUrl: 'http://localhost:3000',
  endpoint: '/api/ai/unified/stream-chat',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjM1NjA1NTAsImV4cCI6MTc2MzY0Njk1MH0.70XBVCs8-jf8GwMAkJcOban7IXqniXj0loxYKH_mV_k'
};

// 发送流式请求的函数
function sendStreamRequest(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: query,
      context: {
        enableTools: true,
        role: "admin",
        userId: 121
      }
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: testConfig.endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${testConfig.token}`
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      let events = [];

      res.on('data', (chunk) => {
        responseData += chunk;

        // 解析SSE数据 - 修复后的版本
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              events.push({ type: 'done', data: null });
            } else {
              try {
                const parsed = JSON.parse(data);
                events.push({
                  type: parsed.event || 'data',
                  data: parsed,
                  timestamp: new Date().toISOString()
                });
              } catch (e) {
                events.push({ type: 'raw', data: data, timestamp: new Date().toISOString() });
              }
            }
          }
        }
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          events,
          query
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 分析工具执行结果
function analyzeToolExecution(response, toolTest) {
  const analysis = {
    toolCalled: false,
    toolName: null,
    events: response.events.length,
    hasError: false,
    errorMessage: null,
    executionTime: 0,
    responseQuality: 'unknown',
    eventsSequence: [],
    hasThinking: false,
    hasFinalAnswer: false,
    toolUsedCount: 0
  };

  // 分析事件序列
  response.events.forEach(event => {
    analysis.eventsSequence.push(event.type);

    // 检查思考开始事件
    if (event.type === 'thinking_start' || (event.data && event.data.message && event.data.message.includes('开始思考'))) {
      analysis.hasThinking = true;
    }

    // 检查最终回答事件
    if (event.type === 'final_answer' || (event.data && event.data.content)) {
      analysis.hasFinalAnswer = true;
      analysis.toolUsedCount = event.data?.toolUsed || 0;

      // 检查是否调用了工具
      if (analysis.toolUsedCount > 0) {
        analysis.toolCalled = true;
      }
    }

    // 检查错误事件
    if (event.type === 'error' || (event.data && event.data.error)) {
      analysis.hasError = true;
      analysis.errorMessage = event.data?.message || event.data?.error || '未知错误';
    }
  });

  // 检查最终回答质量
  const finalAnswerEvent = response.events.find(e => e.type === 'final_answer' || (e.data && e.data.content));
  if (finalAnswerEvent && finalAnswerEvent.data) {
    const content = finalAnswerEvent.data.content || '';
    if (content.length > 100) {
      analysis.responseQuality = 'good';
    } else if (content.length > 20) {
      analysis.responseQuality = 'medium';
    } else if (content.length > 0) {
      analysis.responseQuality = 'poor';
    }
  }

  return analysis;
}

// 测试简单查询
async function testSimpleQuery() {
  console.log('\n🧪 测试简单查询: "你好"');

  try {
    const response = await sendStreamRequest('你好');
    console.log(`✅ 状态码: ${response.status}`);
    console.log(`📊 事件数量: ${response.events.length}`);

    const analysis = analyzeToolExecution(response, { name: 'simple_test' });

    console.log(`🎭 事件序列: ${analysis.eventsSequence.join(' → ')}`);
    console.log(`🤔 思考事件: ${analysis.hasThinking ? '是' : '否'}`);
    console.log(`💬 最终回答: ${analysis.hasFinalAnswer ? '是' : '否'}`);
    console.log(`🔧 工具调用: ${analysis.toolCalled ? '是' : '否'} (${analysis.toolUsedCount}个)`);
    console.log(`📈 响应质量: ${analysis.responseQuality}`);

    // 显示最终回答
    const finalAnswerEvent = response.events.find(e => e.type === 'final_answer' || (e.data && e.data.content));
    if (finalAnswerEvent) {
      console.log(`💬 AI回答: ${finalAnswerEvent.data?.content?.substring(0, 100)}...`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 测试复杂查询（可能触发工具）
async function testComplexQuery() {
  console.log('\n🧪 测试复杂查询: "请帮我创建一个待办事项列表，包含今日要完成的3个任务"');

  try {
    const response = await sendStreamRequest('请帮我创建一个待办事项列表，包含今日要完成的3个任务');
    console.log(`✅ 状态码: ${response.status}`);
    console.log(`📊 事件数量: ${response.events.length}`);

    const analysis = analyzeToolExecution(response, { name: 'complex_test' });

    console.log(`🎭 事件序列: ${analysis.eventsSequence.join(' → ')}`);
    console.log(`🤔 思考事件: ${analysis.hasThinking ? '是' : '否'}`);
    console.log(`💬 最终回答: ${analysis.hasFinalAnswer ? '是' : '否'}`);
    console.log(`🔧 工具调用: ${analysis.toolCalled ? '是' : '否'} (${analysis.toolUsedCount}个)`);
    console.log(`📈 响应质量: ${analysis.responseQuality}`);

    // 显示最终回答
    const finalAnswerEvent = response.events.find(e => e.type === 'final_answer' || (e.data && e.data.content));
    if (finalAnswerEvent) {
      console.log(`💬 AI回答: ${finalAnswerEvent.data?.content?.substring(0, 200)}...`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始修复验证测试...');

  await testSimpleQuery();
  await testComplexQuery();

  console.log('\n🏁 测试完成');
}

runTests().catch(console.error);