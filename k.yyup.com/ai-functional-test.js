const axios = require('axios');

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
  },
  {
    name: "数据查询测试 - 活动信息",
    input: "查询最近10个活动的基本信息",
    expectedEvents: ["start", "thinking", "tool_call_start", "tool_call_complete", "answer", "complete"],
    timeout: 20000
  },
  {
    name: "数据分析测试 - 班级统计",
    input: "统计每个班级的学生数量，用图表展示",
    expectedEvents: ["start", "thinking", "tool_call_start", "tool_call_complete", "answer", "complete"],
    timeout: 20000
  }
];

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
    const response = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Host': 'localhost:5173' // 模拟demo系统
      },
      body: JSON.stringify({
        message: testCase.input,
        conversationId: `test_${Date.now()}`,
        userId: 121
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
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
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, runTest };