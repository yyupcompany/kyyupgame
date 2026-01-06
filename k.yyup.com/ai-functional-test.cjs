const https = require('https');
const http = require('http');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const AI_CHAT_URL = `${BASE_URL}/api/ai/unified/stream-chat`;

// 从登录获取的token
const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJwaG9uZSI6IjE4NjExMTQxMTMxIiwicm9sZSI6ImFkbWluIiwiaXNEZW1vIjp0cnVlLCJpYXQiOjE3NjU4MTI5MjQsImV4cCI6MTc2NjQxNzcyNH0.VT9qUa8X1F4xxSBXr5dqGMG23V5Dp3AQ1IhGlc1C5BM";

// 测试用例
const testCases = [
  {
    name: "基础对话测试 - 简单问候",
    input: "你好，你是谁？",
    expectedEvents: ["start", "thinking", "answer", "complete"],
    timeout: 10000
  },
  {
    name: "专业咨询测试 - 招生策略",
    input: "如何提高幼儿园的招生效果？",
    expectedEvents: ["start", "thinking", "answer", "complete"],
    timeout: 15000
  }
];

// 发送HTTP请求
function makeRequest(url, data, headers) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/unified/stream-chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: rawData });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 执行单个测试
async function runTest(testCase) {
  console.log(`\n🧪 开始测试: ${testCase.name}`);
  console.log(`📝 输入: "${testCase.input}"`);

  const startTime = Date.now();
  const receivedEvents = [];
  let responseText = '';
  let testPassed = true;
  let errorMessage = '';

  try {
    const response = await makeRequest(AI_CHAT_URL, {
      message: testCase.input,
      conversationId: `test_${Date.now()}`,
      userId: 121
    }, {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'Host': 'localhost:5173'
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: Invalid response`);
    }

    // 解析流式响应
    const chunks = response.data.split('\n');

    for (const line of chunks) {
      if (line.trim() === '') continue;

      try {
        const data = JSON.parse(line);

        if (data.event) {
          receivedEvents.push(data.event);
          console.log(`  📡 事件: ${data.event}`);

          if (data.event === 'answer' && data.data?.text) {
            responseText += data.data.text;
          }
        }

        if (data.error) {
          errorMessage = data.error;
          console.log(`  ❌ 错误: ${data.error}`);
        }
      } catch (parseError) {
        // 忽略解析错误，可能是分块数据
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // 验证测试结果
    console.log(`  ⏱️  耗时: ${duration}ms`);
    console.log(`  📊 收到事件: [${receivedEvents.join(', ')}]`);
    console.log(`  📄 响应长度: ${responseText.length}字符`);

    // 检查是否收到预期事件
    const missingEvents = testCase.expectedEvents.filter(event => !receivedEvents.includes(event));
    if (missingEvents.length > 0) {
      testPassed = false;
      console.log(`  ❌ 缺失事件: [${missingEvents.join(', ')}]`);
    }

    if (errorMessage) {
      testPassed = false;
      console.log(`  ❌ 测试失败: ${errorMessage}`);
    }

    console.log(`  ${testPassed ? '✅' : '❌'} 测试${testPassed ? '通过' : '失败'}`);

    return {
      name: testCase.name,
      passed: testPassed,
      duration,
      events: receivedEvents,
      responseLength: responseText.length,
      missingEvents,
      errorMessage,
      responsePreview: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
    };

  } catch (error) {
    console.log(`  ❌ 测试异常: ${error.message}`);
    return {
      name: testCase.name,
      passed: false,
      duration: Date.now() - startTime,
      events: receivedEvents,
      errorMessage: error.message,
      responsePreview: ''
    };
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始AI助手功能测试');
  console.log('=' .repeat(50));

  const results = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);

    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 生成测试报告
  console.log('\n📊 测试报告');
  console.log('=' .repeat(50));

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`✅ 通过: ${passedTests}/${totalTests} (${passRate}%)`);
  console.log(`❌ 失败: ${totalTests - passedTests}/${totalTests}`);

  results.forEach(result => {
    console.log(`\n${result.passed ? '✅' : '❌'} ${result.name}`);
    console.log(`   耗时: ${result.duration}ms`);
    console.log(`   事件: [${result.events.join(', ')}]`);
    if (result.errorMessage) {
      console.log(`   错误: ${result.errorMessage}`);
    }
    if (result.responsePreview) {
      console.log(`   响应预览: ${result.responsePreview}`);
    }
  });

  return results;
}

// 执行测试
runAllTests().catch(console.error);