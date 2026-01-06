/**
 * 统一流处理接口全面测试 - 10个简单查询 + 10个复杂查询
 * 使用MCP浏览器环境测试
 */

const http = require('http');

// 测试配置
const testConfig = {
  baseUrl: 'http://localhost:3000',
  endpoint: '/api/ai/unified/stream-chat',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjM1NjA1NTAsImV4cCI6MTc2MzY0Njk1MH0.70XBVCs8-jf8GwMAkJcOban7IXqniXj0loxYKH_mV_k'
};

// 简单查询测试用例 (10个)
const simpleQueries = [
  {
    query: "你好",
    description: "基础问候",
    category: "simple_chat"
  },
  {
    query: "今天天气怎么样",
    description: "闲聊天气",
    category: "simple_chat"
  },
  {
    query: "谢谢你的帮助",
    description: "感谢表达",
    category: "simple_chat"
  },
  {
    query: "再见",
    description: "告别语",
    category: "simple_chat"
  },
  {
    query: "现在几点了",
    description: "时间询问",
    category: "simple_chat"
  },
  {
    query: "介绍一下你自己",
    description: "自我介绍请求",
    category: "simple_chat"
  },
  {
    query: "你叫什么名字",
    description: "身份询问",
    category: "simple_chat"
  },
  {
    query: "你能做什么",
    description: "能力询问",
    category: "simple_chat"
  },
  {
    query: "早上好",
    description: "问候语",
    category: "simple_chat"
  },
  {
    query: "周末愉快",
    description: "祝福语",
    category: "simple_chat"
  }
];

// 复杂查询测试用例 (10个) - 包含工作流创建和页面导航
const complexQueries = [
  {
    query: "查询所有幼儿园的人数统计",
    description: "数据统计查询",
    category: "data_query",
    expectedTools: ["database_query", "statistics"]
  },
  {
    query: "生成本月招生数据分析报告",
    description: "报告生成",
    category: "report_generation",
    expectedTools: ["data_analysis", "report_generation"]
  },
  {
    query: "创建招生咨询跟进工作流",
    description: "工作流创建",
    category: "workflow_creation",
    expectedTools: ["workflow_builder", "task_management"]
  },
  {
    query: "导航到教师管理页面",
    description: "页面导航",
    category: "page_navigation",
    expectedTools: ["navigate_to_page", "render_component"]
  },
  {
    query: "列出所有教师的基本信息和教学科目",
    description: "教师信息查询",
    category: "teacher_management",
    expectedTools: ["database_query", "teacher_data"]
  },
  {
    query: "统计各班级的学生人数和男女比例",
    description: "班级统计",
    category: "class_analysis",
    expectedTools: ["database_query", "statistics", "gender_analysis"]
  },
  {
    query: "分析最近30天的招生趋势和转化率",
    description: "招生分析",
    category: "enrollment_analysis",
    expectedTools: ["data_analysis", "trend_analysis", "conversion_calculation"]
  },
  {
    query: "创建客户跟进提醒任务",
    description: "任务创建",
    category: "task_management",
    expectedTools: ["create_task", "notification_system"]
  },
  {
    query: "检查所有即将到期的活动报名",
    description: "活动管理",
    category: "activity_management",
    expectedTools: ["database_query", "deadline_check", "activity_data"]
  },
  {
    query: "生成财务收支月报表",
    description: "财务管理",
    category: "financial_management",
    expectedTools: ["financial_data", "report_generation", "accounting"]
  }
];

// 发送流式请求的函数
function sendStreamRequest(query, description, category, enableTools = true) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: query,
      context: {
        enableTools: enableTools,
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

        // 解析SSE数据
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
          headers: res.headers,
          responseData,
          events,
          query,
          description,
          category
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

// 运行单个测试
async function runTest(testCase, index, total) {
  console.log(`\n🧪 测试 ${index + 1}/${total}: ${testCase.description}`);
  console.log(`📝 查询: "${testCase.query}"`);
  console.log(`🏷️  类别: ${testCase.category}`);

  try {
    const startTime = Date.now();
    const response = await sendStreamRequest(testCase.query, testCase.description, testCase.category);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log(`📊 状态码: ${response.status}`);

    // 分析响应事件 - 检查7个完整事件
    const hasThinkingStart = response.events.some(e => e.type === 'thinking_start');
    const hasToolIntent = response.events.some(e => e.type === 'tool_intent');
    const hasToolCallStart = response.events.some(e => e.type === 'tool_call_start');
    const hasToolCallComplete = response.events.some(e => e.type === 'tool_call_complete');
    const hasToolsComplete = response.events.some(e => e.type === 'tools_complete');
    const hasFinalAnswer = response.events.some(e => e.type === 'final_answer');
    const hasComplete = response.events.some(e => e.type === 'complete');
    const hasError = response.events.some(e => e.type === 'error');

    const eventCount = response.events.length;

    console.log(`🎭 事件类型检查 (7个事件):`);
    console.log(`   1. thinking_start: ${hasThinkingStart ? '✅' : '❌'}`);
    console.log(`   2. tool_intent: ${hasToolIntent ? '✅' : '❌'}`);
    console.log(`   3. tool_call_start: ${hasToolCallStart ? '✅' : '❌'}`);
    console.log(`   4. tool_call_complete: ${hasToolCallComplete ? '✅' : '❌'}`);
    console.log(`   5. tools_complete: ${hasToolsComplete ? '✅' : '❌'}`);
    console.log(`   6. final_answer: ${hasFinalAnswer ? '✅' : '❌'}`);
    console.log(`   7. complete: ${hasComplete ? '✅' : '❌'}`);
    console.log(`   ⚠️  error: ${hasError ? '❌' : '✅'}`);
    console.log(`📈 总事件数量: ${eventCount}`);

    // 显示最终回答内容
    const finalAnswerEvent = response.events.find(e => e.type === 'final_answer');
    if (finalAnswerEvent) {
      console.log(`💬 最终回答: ${finalAnswerEvent.data?.content?.substring(0, 150)}...`);
    }

    // 显示错误信息
    const errorEvent = response.events.find(e => e.type === 'error');
    if (errorEvent) {
      console.log(`❌ 错误信息: ${errorEvent.data?.message || errorEvent.data?.error}`);
    }

    // 计算完整度
    const eventTypes = [hasThinkingStart, hasToolIntent, hasToolCallStart, hasToolCallComplete, hasToolsComplete, hasFinalAnswer, hasComplete];
    const completeEvents = eventTypes.filter(Boolean).length;
    const completenessPercentage = (completeEvents / 7) * 100;

    return {
      success: response.status === 200 && !hasError,
      duration,
      eventCount,
      completenessPercentage,
      hasThinkingStart,
      hasToolIntent,
      hasToolCallStart,
      hasToolCallComplete,
      hasToolsComplete,
      hasFinalAnswer,
      hasComplete,
      hasError,
      response
    };

  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    return {
      success: false,
      error: error.message,
      duration: 0,
      eventCount: 0,
      completenessPercentage: 0,
      hasThinkingStart: false,
      hasToolIntent: false,
      hasToolCallStart: false,
      hasToolCallComplete: false,
      hasToolsComplete: false,
      hasFinalAnswer: false,
      hasComplete: false,
      hasError: false
    };
  }
}

// 运行测试套件
async function runTestSuite() {
  console.log('🚀 开始统一流处理接口全面测试 - MCP浏览器环境');
  console.log('=' .repeat(80));

  const allTests = [
    ...simpleQueries.map((q, i) => ({ ...q, type: 'simple', index: i + 1 })),
    ...complexQueries.map((q, i) => ({ ...q, type: 'complex', index: i + 1 }))
  ];

  const totalTests = allTests.length;
  const results = {
    simple: { total: simpleQueries.length, passed: 0, failed: 0, avgDuration: 0, avgCompleteness: 0, totalCompleteness: 0 },
    complex: { total: complexQueries.length, passed: 0, failed: 0, avgDuration: 0, avgCompleteness: 0, totalCompleteness: 0 },
    overall: { total: totalTests, passed: 0, failed: 0, avgDuration: 0, avgCompleteness: 0, totalCompleteness: 0 }
  };

  let totalDuration = 0;

  for (let i = 0; i < allTests.length; i++) {
    const testCase = allTests[i];
    const result = await runTest(testCase, i, totalTests);

    if (result.success) {
      results[testCase.type].passed++;
      results.overall.passed++;
    } else {
      results[testCase.type].failed++;
      results.overall.failed++;
    }

    totalDuration += result.duration;
    results[testCase.type].totalCompleteness += result.completenessPercentage;
    results.overall.totalCompleteness += result.completenessPercentage;

    // 短暂延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 计算平均响应时间和完整度
  results.overall.avgDuration = Math.round(totalDuration / totalTests);
  results.simple.avgCompleteness = results.simple.total > 0 ?
    Math.round(results.simple.totalCompleteness / results.simple.total * 10) / 10 : 0;
  results.complex.avgCompleteness = results.complex.total > 0 ?
    Math.round(results.complex.totalCompleteness / results.complex.total * 10) / 10 : 0;
  results.overall.avgCompleteness = results.overall.total > 0 ?
    Math.round(results.overall.totalCompleteness / results.overall.total * 10) / 10 : 0;

  console.log('\n' + '=' .repeat(80));
  console.log('📊 测试结果统计');
  console.log('=' .repeat(80));

  console.log(`\n🔹 简单查询测试:`);
  console.log(`   总数: ${results.simple.total}`);
  console.log(`   通过: ${results.simple.passed}`);
  console.log(`   失败: ${results.simple.failed}`);
  console.log(`   成功率: ${((results.simple.passed / results.simple.total) * 100).toFixed(1)}%`);
  console.log(`   平均事件完整度: ${results.simple.avgCompleteness}%`);

  console.log(`\n🔸 复杂查询测试:`);
  console.log(`   总数: ${results.complex.total}`);
  console.log(`   通过: ${results.complex.passed}`);
  console.log(`   失败: ${results.complex.failed}`);
  console.log(`   成功率: ${((results.complex.passed / results.complex.total) * 100).toFixed(1)}%`);
  console.log(`   平均事件完整度: ${results.complex.avgCompleteness}%`);

  console.log(`\n📈 总体统计:`);
  console.log(`   总测试数: ${results.overall.total}`);
  console.log(`   总通过数: ${results.overall.passed}`);
  console.log(`   总失败数: ${results.overall.failed}`);
  console.log(`   总成功率: ${((results.overall.passed / results.overall.total) * 100).toFixed(1)}%`);
  console.log(`   平均响应时间: ${results.overall.avgDuration}ms`);
  console.log(`   平均事件完整度: ${results.overall.avgCompleteness}%`);

  // 详细结果分析
  console.log(`\n🎯 测试结论:`);
  const overallSuccessRate = ((results.overall.passed / results.overall.total) * 100);
  if (overallSuccessRate >= 90) {
    console.log(`   ✅ 接口表现优秀！成功率达到${overallSuccessRate.toFixed(1)}%`);
  } else if (overallSuccessRate >= 70) {
    console.log(`   ⚠️  接口表现良好，但仍有改进空间。成功率${overallSuccessRate.toFixed(1)}%`);
  } else {
    console.log(`   ❌ 接口需要优化，成功率仅为${overallSuccessRate.toFixed(1)}%`);
  }

  if (results.overall.avgDuration <= 2000) {
    console.log(`   ⚡ 响应速度优秀！平均${results.overall.avgDuration}ms`);
  } else if (results.overall.avgDuration <= 5000) {
    console.log(`   🐢 响应速度可接受，平均${results.overall.avgDuration}ms`);
  } else {
    console.log(`   🐌 响应速度较慢，平均${results.overall.avgDuration}ms，建议优化`);
  }

  // 事件完整度分析
  console.log(`\n📊 事件完整度分析:`);
  if (results.overall.avgCompleteness >= 90) {
    console.log(`   🎖️  事件完整度非常优秀！平均完整度${results.overall.avgCompleteness}%`);
  } else if (results.overall.avgCompleteness >= 70) {
    console.log(`   ✅ 事件完整度良好，平均完整度${results.overall.avgCompleteness}%`);
  } else {
    console.log(`   ⚠️  事件完整度需要改进，平均完整度仅为${results.overall.avgCompleteness}%`);
  }

  // 工具调用分析
  if (results.complex.avgCompleteness > results.simple.avgCompleteness) {
    console.log(`   🔧 复杂查询的工具调用流程表现更好，完整度差距${(results.complex.avgCompleteness - results.simple.avgCompleteness).toFixed(1)}%`);
  } else if (results.complex.avgCompleteness === results.simple.avgCompleteness) {
    console.log(`   ⚖️  简单查询和复杂查询的完整度相当`);
  } else {
    console.log(`   🤔 简单查询的完整度反而更高，可能工具调用流程有问题`);
  }

  return results;
}

// 运行测试
runTestSuite().catch(console.error);