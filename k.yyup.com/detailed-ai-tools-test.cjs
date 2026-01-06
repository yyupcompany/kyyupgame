/**
 * 详细AI工具测试 - 打印每个工具的完整返回内容
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
      let rawChunks = [];

      res.on('data', (chunk) => {
        responseData += chunk;
        rawChunks.push(chunk);

        // 解析SSE数据 - 修复版本，正确提取事件类型
        const lines = chunk.toString().split('\n');
        let currentEventType = null;

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            // 提取事件类型
            currentEventType = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              events.push({ type: 'done', data: null, timestamp: new Date().toISOString() });
            } else {
              try {
                const parsed = JSON.parse(data);
                events.push({
                  type: currentEventType || parsed.event || 'data',
                  data: parsed,
                  timestamp: new Date().toISOString()
                });
              } catch (e) {
                events.push({
                  type: currentEventType || 'raw',
                  data: data,
                  timestamp: new Date().toISOString()
                });
              }
            }
            currentEventType = null; // 重置事件类型
          }
        }
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          events,
          query,
          rawData: responseData,
          rawChunks: rawChunks.map(c => c.toString())
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.write(postData);
    req.end();
  });
}

// 详细打印单个工具测试结果
async function testToolDetailed(toolTest, index, total) {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`🧪 [${index + 1}/${total}] 测试工具: ${toolTest.name} (${toolTest.category})`);
  console.log(`📝 描述: ${toolTest.description}`);
  console.log(`🎯 测试查询: "${toolTest.testQuery}"`);
  console.log(`⚡ 复杂度: ${toolTest.complexity}`);
  console.log(`${'='.repeat(100)}`);

  const startTime = Date.now();

  try {
    const response = await sendStreamRequest(toolTest.testQuery);
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`\n⏱️  响应时间: ${executionTime}ms`);
    console.log(`📊 HTTP状态码: ${response.status}`);
    console.log(`🎭 事件总数: ${response.events.length}`);
    console.log(`📦 数据块数量: ${response.rawChunks.length}`);

    // 详细打印每个事件
    console.log(`\n📋 详细事件列表:`);
    console.log('-'.repeat(80));

    response.events.forEach((event, idx) => {
      console.log(`\n🎭 事件 #${idx + 1}`);
      console.log(`🏷️  类型: ${event.type}`);
      console.log(`⏰ 时间戳: ${event.timestamp}`);
      console.log(`📄 数据内容:`);

      if (event.data) {
        console.log(JSON.stringify(event.data, null, 2));
      } else {
        console.log('(无数据)');
      }

      console.log('-'.repeat(40));
    });

    // 打印原始响应数据（用于调试）
    console.log(`\n📄 原始SSE响应数据:`);
    console.log('-'.repeat(80));
    console.log(response.rawData);

    // 分析关键信息 - 修复版本
    const thinkingEvent = response.events.find(e =>
      e.type === 'thinking_start' ||
      (e.data && e.data.message && e.data.message.includes('开始思考'))
    );

    const toolIntentEvent = response.events.find(e =>
      e.type === 'tool_intent' ||
      (e.data && e.data.message && e.data.message.includes('需要使用工具'))
    );

    const toolCallStartEvent = response.events.find(e =>
      e.type === 'tool_call_start' ||
      (e.data && e.data.message && e.data.message.includes('开始执行工具调用'))
    );

    const toolCallCompleteEvent = response.events.find(e =>
      e.type === 'tool_call_complete' ||
      (e.data && e.data.message && e.data.message.includes('工具调用执行完成'))
    );

    const finalAnswerEvent = response.events.find(e =>
      e.type === 'final_answer' ||
      (e.data && e.data.content)
    );

    const completeEvent = response.events.find(e =>
      e.type === 'complete' ||
      (e.data && e.data.totalEvents)
    );

    // 更准确的工具调用检测
    let actualToolCount = 0;
    let hasToolCall = false;
    let toolCallDetails = [];

    if (toolCallCompleteEvent && toolCallCompleteEvent.data) {
      if (toolCallCompleteEvent.data.toolResults && Array.isArray(toolCallCompleteEvent.data.toolResults)) {
        actualToolCount = toolCallCompleteEvent.data.toolResults.length;
        hasToolCall = actualToolCount > 0;

        // 提取工具调用详情
        toolCallCompleteEvent.data.toolResults.forEach((result, index) => {
          if (result.message && result.message.tool_calls && Array.isArray(result.message.tool_calls)) {
            result.message.tool_calls.forEach(call => {
              toolCallDetails.push({
                name: call.function.name,
                arguments: call.function.arguments,
                id: call.id
              });
            });
          }
        });
      }
    } else if (toolCallStartEvent && toolCallStartEvent.data && toolCallStartEvent.data.toolCount) {
      actualToolCount = toolCallStartEvent.data.toolCount;
      hasToolCall = true;
    }

    console.log(`\n🔍 关键信息摘要:`);
    console.log('-'.repeat(80));

    if (thinkingEvent) {
      console.log(`🤔 思考开始: ✅`);
      console.log(`   消息: ${thinkingEvent.data?.message || '无消息'}`);
    } else {
      console.log(`🤔 思考开始: ❌ (未检测到)`);
    }

    if (toolIntentEvent) {
      console.log(`🎯 工具意图: ✅`);
      console.log(`   复杂度: ${toolIntentEvent.data?.confidence || '未知'}`);
      console.log(`   消息: ${toolIntentEvent.data?.message || '无消息'}`);
    } else {
      console.log(`🎯 工具意图: ❌ (未检测到)`);
    }

    if (toolCallStartEvent) {
      console.log(`🚀 工具调用开始: ✅`);
      console.log(`   工具数量: ${toolCallStartEvent.data?.toolCount || '未知'}`);
      console.log(`   消息: ${toolCallStartEvent.data?.message || '无消息'}`);
    } else {
      console.log(`🚀 工具调用开始: ❌ (未检测到)`);
    }

    if (toolCallCompleteEvent) {
      console.log(`✅ 工具调用完成: ✅`);
      console.log(`   执行时间: ${toolCallCompleteEvent.data?.executionTime || '未知'}ms`);
      console.log(`   结果数量: ${toolCallCompleteEvent.data?.toolResults?.length || 0}`);
      console.log(`   消息: ${toolCallCompleteEvent.data?.message || '无消息'}`);
    } else {
      console.log(`✅ 工具调用完成: ❌ (未检测到)`);
    }

    if (finalAnswerEvent) {
      console.log(`💬 最终回答: ✅`);
      console.log(`   内容长度: ${finalAnswerEvent.data?.content?.length || 0} 字符`);
      console.log(`   工具使用数: ${finalAnswerEvent.data?.toolUsed || 0} (报告值)`);
      console.log(`   实际工具数: ${actualToolCount} (检测值)`);
      console.log(`   使用的模型: ${finalAnswerEvent.data?.modelName || '未知'}`);

      if (finalAnswerEvent.data?.content) {
        console.log(`   回答内容: ${finalAnswerEvent.data.content}`);
      }
    } else {
      console.log(`💬 最终回答: ❌ (未检测到)`);
    }

    if (completeEvent) {
      console.log(`🎉 完成事件: ✅`);
      console.log(`   总事件数: ${completeEvent.data?.totalEvents || '未知'}`);
      console.log(`   复杂度评分: ${completeEvent.data?.complexityScore || '未知'}`);
      console.log(`   完成消息: ${completeEvent.data?.message || '无消息'}`);
    } else {
      console.log(`🎉 完成事件: ❌ (未检测到)`);
    }

    console.log(`\n🔧 工具调用分析:`);
    console.log('-'.repeat(80));
    console.log(`是否调用工具: ${hasToolCall ? '✅ 是' : '❌ 否'}`);
    console.log(`检测到工具数量: ${actualToolCount}`);
    console.log(`报告的工具数量: ${finalAnswerEvent?.data?.toolUsed || 0}`);

    if (hasToolCall && toolCallDetails.length > 0) {
      console.log(`\n📋 调用的工具详情:`);
      toolCallDetails.forEach((tool, index) => {
        console.log(`  ${index + 1}. ${tool.name}(${tool.id})`);
        console.log(`     参数: ${tool.arguments}`);
      });
    }

    console.log(`\n✅ 工具测试完成: ${toolTest.name}`);
    console.log(`📊 执行统计: ${executionTime}ms, ${response.events.length}个事件`);

    return {
      toolName: toolTest.name,
      success: true,
      executionTime,
      eventCount: response.events.length,
      hasToolCall,
      toolUsedCount: actualToolCount,
      reportedToolUsedCount: finalAnswerEvent?.data?.toolUsed || 0,
      toolCallDetails,
      response
    };

  } catch (error) {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.error(`\n❌ 工具测试失败: ${toolTest.name}`);
    console.error(`⏱️  执行时间: ${executionTime}ms`);
    console.error(`💥 错误信息: ${error.message}`);
    console.error(`🔍 错误堆栈:`, error.stack);

    return {
      toolName: toolTest.name,
      success: false,
      executionTime,
      error: error.message
    };
  }
}

// 核心AI工具测试用例
const aiToolsTestCases = [
  // 数据库查询工具
  {
    name: 'any_query',
    category: 'database_query',
    description: '通用数据库查询工具',
    testQuery: '查询所有学生信息，显示姓名、年龄、班级',
    expectedTool: 'any_query',
    complexity: 'high'
  },
  {
    name: 'read_data_record',
    category: 'database_query',
    description: '读取数据记录工具',
    testQuery: '读取用户表中前5条记录',
    expectedTool: 'read_data_record',
    complexity: 'medium'
  },
  {
    name: 'api_search',
    category: 'database_query',
    description: 'API搜索工具',
    testQuery: '搜索API接口信息',
    expectedTool: 'api_search',
    complexity: 'medium'
  },

  // 数据库CRUD工具
  {
    name: 'create_data_record',
    category: 'database_crud',
    description: '创建数据记录工具',
    testQuery: '创建一个测试用户记录',
    expectedTool: 'create_data_record',
    complexity: 'high'
  },
  {
    name: 'update_data_record',
    category: 'database_crud',
    description: '更新数据记录工具',
    testQuery: '更新测试用户的邮箱地址',
    expectedTool: 'update_data_record',
    complexity: 'high'
  },

  // 工作流工具
  {
    name: 'create_todo_list',
    category: 'workflow',
    description: '创建待办事项列表工具',
    testQuery: '创建一个今日任务列表',
    expectedTool: 'create_todo_list',
    complexity: 'medium'
  },
  {
    name: 'get_todo_list',
    category: 'workflow',
    description: '获取待办事项列表工具',
    testQuery: '查看我的待办事项',
    expectedTool: 'get_todo_list',
    complexity: 'low'
  },
  {
    name: 'generate_complete_activity_plan',
    category: 'workflow',
    description: '生成完整活动计划工具',
    testQuery: '生成一个亲子活动方案',
    expectedTool: 'generate_complete_activity_plan',
    complexity: 'high'
  },

  // Web操作工具
  {
    name: 'navigate_page',
    category: 'web_operation',
    description: '页面导航工具',
    testQuery: '导航到学生管理页面',
    expectedTool: 'navigate_page',
    complexity: 'low'
  },
  {
    name: 'click_element',
    category: 'web_operation',
    description: '点击元素工具',
    testQuery: '点击提交按钮',
    expectedTool: 'click_element',
    complexity: 'low'
  },
  {
    name: 'fill_form',
    category: 'web_operation',
    description: '填写表单工具',
    testQuery: '填写学生注册表单',
    expectedTool: 'fill_form',
    complexity: 'medium'
  }
];

// 运行所有详细测试
async function runDetailedTests() {
  console.log('🚀 开始详细AI工具测试...');
  console.log(`📋 总计 ${aiToolsTestCases.length} 个工具待测试`);
  console.log('🎯 每个工具都会显示完整的返回内容和事件详情');
  console.log(`${'='.repeat(100)}`);

  const totalTests = aiToolsTestCases.length;
  const results = [];

  for (let i = 0; i < totalTests; i++) {
    const toolTest = aiToolsTestCases[i];
    const result = await testToolDetailed(toolTest, i, totalTests);
    results.push(result);

    // 工具间延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 最终汇总
  console.log(`\n${'='.repeat(100)}`);
  console.log('📊 最终测试汇总');
  console.log(`${'='.repeat(100)}`);

  const successTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;
  const toolCallTests = results.filter(r => r.hasToolCall).length;
  const totalTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0);
  const avgTime = totalTime / totalTests;

  console.log(`✅ 成功测试: ${successTests}/${totalTests}`);
  console.log(`❌ 失败测试: ${failedTests}/${totalTests}`);
  console.log(`🔧 工具调用: ${toolCallTests}/${totalTests}`);
  console.log(`⏱️  总耗时: ${totalTime}ms`);
  console.log(`📈 平均耗时: ${Math.round(avgTime)}ms`);

  // 显示调用工具的测试
  if (toolCallTests > 0) {
    console.log(`\n🔧 成功调用工具的测试:`);
    results.filter(r => r.hasToolCall).forEach(result => {
      console.log(`  ✅ ${result.toolName} (使用${result.toolUsedCount}个工具)`);
    });
  }

  // 显示失败的测试
  if (failedTests > 0) {
    console.log(`\n❌ 失败的测试:`);
    results.filter(r => !r.success).forEach(result => {
      console.log(`  ❌ ${result.toolName}: ${result.error}`);
    });
  }

  console.log(`\n🎉 详细AI工具测试完成！`);
}

// 运行测试
runDetailedTests().catch(error => {
  console.error('💥 测试脚本运行失败:', error);
  process.exit(1);
});