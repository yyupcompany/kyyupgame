/**
 * 全面AI工具测试脚本
 * 测试所有后端AI工具，记录返回值和性能
 */

const http = require('http');
const fs = require('fs');

// 测试配置
const testConfig = {
  baseUrl: 'http://localhost:3000',
  endpoint: '/api/ai/unified/stream-chat',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjM1NjA1NTAsImV4cCI6MTc2MzY0Njk1MH0.70XBVCs8-jf8GwMAkJcOban7IXqniXj0loxYKH_mV_k'
};

// 测试结果记录
let testResults = {
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalTime: 0,
    startTime: new Date().toISOString()
  },
  tools: [],
  errors: [],
  performance: {
    fastest: null,
    slowest: null,
    averageTime: 0
  }
};

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
  {
    name: 'delete_data_record',
    category: 'database_crud',
    description: '删除数据记录工具',
    testQuery: '删除测试用户记录',
    expectedTool: 'delete_data_record',
    complexity: 'high'
  },
  {
    name: 'batch_import_data',
    category: 'database_crud',
    description: '批量导入数据工具',
    testQuery: '批量导入学生数据',
    expectedTool: 'batch_import_data',
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
    name: 'update_todo_task',
    category: 'workflow',
    description: '更新待办任务工具',
    testQuery: '更新任务状态为已完成',
    expectedTool: 'update_todo_task',
    complexity: 'medium'
  },
  {
    name: 'delete_todo_task',
    category: 'workflow',
    description: '删除待办任务工具',
    testQuery: '删除已完成的任务',
    expectedTool: 'delete_todo_task',
    complexity: 'medium'
  },
  {
    name: 'analyze_task_complexity',
    category: 'workflow',
    description: '分析任务复杂度工具',
    testQuery: '分析这个项目的复杂度',
    expectedTool: 'analyze_task_complexity',
    complexity: 'medium'
  },
  {
    name: 'import_teacher_data',
    category: 'workflow',
    description: '导入教师数据工具',
    testQuery: '导入教师基本信息数据',
    expectedTool: 'import_teacher_data',
    complexity: 'high'
  },
  {
    name: 'import_parent_data',
    category: 'workflow',
    description: '导入家长数据工具',
    testQuery: '导入家长联系信息数据',
    expectedTool: 'import_parent_data',
    complexity: 'high'
  },
  {
    name: 'generate_complete_activity_plan',
    category: 'workflow',
    description: '生成完整活动计划工具',
    testQuery: '生成一个亲子活动方案',
    expectedTool: 'generate_complete_activity_plan',
    complexity: 'high'
  },
  {
    name: 'execute_activity_workflow',
    category: 'workflow',
    description: '执行活动工作流工具',
    testQuery: '执行活动报名流程',
    expectedTool: 'execute_activity_workflow',
    complexity: 'high'
  },

  // UI显示工具
  {
    name: 'render_component',
    category: 'ui_display',
    description: '渲染组件工具',
    testQuery: '渲染一个学生列表组件',
    expectedTool: 'render_component',
    complexity: 'medium'
  },
  {
    name: 'generate_html_preview',
    category: 'ui_display',
    description: '生成HTML预览工具',
    testQuery: '生成页面预览HTML',
    expectedTool: 'generate_html_preview',
    complexity: 'medium'
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
    name: 'type_text',
    category: 'web_operation',
    description: '输入文本工具',
    testQuery: '在搜索框中输入关键词',
    expectedTool: 'type_text',
    complexity: 'low'
  },
  {
    name: 'fill_form',
    category: 'web_operation',
    description: '填写表单工具',
    testQuery: '填写学生注册表单',
    expectedTool: 'fill_form',
    complexity: 'medium'
  },
  {
    name: 'select_option',
    category: 'web_operation',
    description: '选择选项工具',
    testQuery: '选择班级下拉选项',
    expectedTool: 'select_option',
    complexity: 'low'
  },
  {
    name: 'submit_form',
    category: 'web_operation',
    description: '提交表单工具',
    testQuery: '提交学生信息表单',
    expectedTool: 'submit_form',
    complexity: 'medium'
  },
  {
    name: 'get_page_structure',
    category: 'web_operation',
    description: '获取页面结构工具',
    testQuery: '分析当前页面结构',
    expectedTool: 'get_page_structure',
    complexity: 'medium'
  },
  {
    name: 'wait_for_element',
    category: 'web_operation',
    description: '等待元素工具',
    testQuery: '等待页面加载完成',
    expectedTool: 'wait_for_element',
    complexity: 'low'
  },
  {
    name: 'capture_screen',
    category: 'web_operation',
    description: '截屏工具',
    testQuery: '截取当前页面屏幕',
    expectedTool: 'capture_screen',
    complexity: 'low'
  },
  {
    name: 'web_search',
    category: 'web_operation',
    description: '网络搜索工具',
    testQuery: '搜索幼儿园教育相关信息',
    expectedTool: 'web_search',
    complexity: 'medium'
  },
  {
    name: 'get_accessible_pages',
    category: 'web_operation',
    description: '获取可访问页面工具',
    testQuery: '列出所有可访问的管理页面',
    expectedTool: 'get_accessible_pages',
    complexity: 'medium'
  },
  {
    name: 'validate_page_state',
    category: 'web_operation',
    description: '验证页面状态工具',
    testQuery: '验证页面元素是否正确显示',
    expectedTool: 'validate_page_state',
    complexity: 'medium'
  },
  {
    name: 'console_monitor',
    category: 'web_operation',
    description: '控制台监控工具',
    testQuery: '检查浏览器控制台错误',
    expectedTool: 'console_monitor',
    complexity: 'low'
  },
  {
    name: 'wait_for_condition',
    category: 'web_operation',
    description: '等待条件工具',
    testQuery: '等待数据加载完成',
    expectedTool: 'wait_for_condition',
    complexity: 'medium'
  },
  {
    name: 'navigate_back',
    category: 'web_operation',
    description: '返回导航工具',
    testQuery: '返回上一页面',
    expectedTool: 'navigate_back',
    complexity: 'low'
  }
];

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
          events,
          query
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

// 运行单个工具测试
async function runToolTest(toolTest, index, total) {
  console.log(`\\n🧪 [${index + 1}/${total}] 测试工具: ${toolTest.name} (${toolTest.category})`);
  console.log(`📝 描述: ${toolTest.description}`);
  console.log(`🎯 测试查询: "${toolTest.testQuery}"`);

  const startTime = Date.now();

  try {
    const response = await sendStreamRequest(toolTest.testQuery);
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`⏱️  响应时间: ${executionTime}ms`);
    console.log(`📊 状态码: ${response.status}`);
    console.log(`🎭 事件数量: ${response.events.length}`);

    const analysis = analyzeToolExecution(response, toolTest);

    const testResult = {
      ...toolTest,
      executionTime,
      status: response.status,
      eventsCount: response.events.length,
      eventsSequence: analysis.eventsSequence,
      toolCalled: analysis.toolCalled,
      toolName: analysis.toolName,
      hasError: analysis.hasError,
      errorMessage: analysis.errorMessage,
      responseQuality: analysis.responseQuality,
      timestamp: new Date().toISOString()
    };

    // 记录最终回答内容
    const finalAnswerEvent = response.events.find(e => e.type === 'final_answer');
    if (finalAnswerEvent) {
      testResult.finalAnswer = finalAnswerEvent.data?.content?.substring(0, 500) + '...';
    }

    // 显示结果
    if (analysis.hasError) {
      console.log(`❌ 错误: ${analysis.errorMessage}`);
      testResults.errors.push({
        tool: toolTest.name,
        error: analysis.errorMessage,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`✅ 工具调用: ${analysis.toolCalled ? '是' : '否'}`);
      if (analysis.toolCalled) {
        console.log(`🔧 使用的工具: ${analysis.toolName}`);
        console.log(`📈 响应质量: ${analysis.responseQuality}`);
      }
    }

    // 更新统计
    testResults.summary.totalTests++;
    if (!analysis.hasError) {
      testResults.summary.passedTests++;
    } else {
      testResults.summary.failedTests++;
    }

    testResults.summary.totalTime += executionTime;
    testResults.tools.push(testResult);

    // 更新性能统计
    if (!testResults.performance.fastest || executionTime < testResults.performance.fastest.time) {
      testResults.performance.fastest = { tool: toolTest.name, time: executionTime };
    }
    if (!testResults.performance.slowest || executionTime > testResults.performance.slowest.time) {
      testResults.performance.slowest = { tool: toolTest.name, time: executionTime };
    }

    return testResult;

  } catch (error) {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`❌ 测试失败: ${error.message}`);

    const failedResult = {
      ...toolTest,
      executionTime,
      status: 'error',
      eventsCount: 0,
      hasError: true,
      errorMessage: error.message,
      timestamp: new Date().toISOString()
    };

    testResults.summary.totalTests++;
    testResults.summary.failedTests++;
    testResults.summary.totalTime += executionTime;
    testResults.tools.push(failedResult);
    testResults.errors.push({
      tool: toolTest.name,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return failedResult;
  }
}

// 生成测试报告
function generateTestReport() {
  testResults.summary.endTime = new Date().toISOString();
  testResults.summary.averageTime = testResults.summary.totalTests > 0 ?
    Math.round(testResults.summary.totalTime / testResults.summary.totalTests) : 0;

  const report = `# AI工具全面测试报告

## 📊 测试概览
- **测试时间**: ${testResults.summary.startTime} - ${testResults.summary.endTime}
- **总测试数**: ${testResults.summary.totalTests}
- **成功测试**: ${testResults.summary.passedTests}
- **失败测试**: ${testResults.summary.failedTests}
- **成功率**: ${((testResults.summary.passedTests / testResults.summary.totalTests) * 100).toFixed(1)}%
- **总耗时**: ${testResults.summary.totalTime}ms
- **平均响应时间**: ${testResults.summary.averageTime}ms

## 🏆 性能统计
- **最快响应**: ${testResults.performance.fastest?.tool || 'N/A'} (${testResults.performance.fastest?.time || 0}ms)
- **最慢响应**: ${testResults.performance.slowest?.tool || 'N/A'} (${testResults.performance.slowest?.time || 0}ms)

## 📈 按类别统计

### 数据库查询工具
${testResults.tools.filter(t => t.category === 'database_query').map(t =>
  `- **${t.name}**: ${t.hasError ? '❌' : '✅'} (${t.executionTime}ms) ${t.responseQuality ? `质量: ${t.responseQuality}` : ''}`
).join('\\n')}

### 数据库CRUD工具
${testResults.tools.filter(t => t.category === 'database_crud').map(t =>
  `- **${t.name}**: ${t.hasError ? '❌' : '✅'} (${t.executionTime}ms) ${t.responseQuality ? `质量: ${t.responseQuality}` : ''}`
).join('\\n')}

### 工作流工具
${testResults.tools.filter(t => t.category === 'workflow').map(t =>
  `- **${t.name}**: ${t.hasError ? '❌' : '✅'} (${t.executionTime}ms) ${t.responseQuality ? `质量: ${t.responseQuality}` : ''}`
).join('\\n')}

### UI显示工具
${testResults.tools.filter(t => t.category === 'ui_display').map(t =>
  `- **${t.name}**: ${t.hasError ? '❌' : '✅'} (${t.executionTime}ms) ${t.responseQuality ? `质量: ${t.responseQuality}` : ''}`
).join('\\n')}

### Web操作工具
${testResults.tools.filter(t => t.category === 'web_operation').map(t =>
  `- **${t.name}**: ${t.hasError ? '❌' : '✅'} (${t.executionTime}ms) ${t.responseQuality ? `质量: ${t.responseQuality}` : ''}`
).join('\\n')}

## ❌ 错误详情
${testResults.errors.map(e =>
  `- **${e.tool}**: ${e.error}`
).join('\\n')}

## 📋 详细结果
${testResults.tools.map(t => `
### ${t.name}
- **类别**: ${t.category}
- **描述**: ${t.description}
- **状态**: ${t.hasError ? '❌ 失败' : '✅ 成功'}
- **响应时间**: ${t.executionTime}ms
- **事件数量**: ${t.eventsCount}
- **事件序列**: ${t.eventsSequence.join(' → ')}
- **工具调用**: ${t.toolCalled ? '是' : '否'} ${t.toolName ? `(${t.toolName})` : ''}
- **响应质量**: ${t.responseQuality || 'N/A'}
- **最终回答**: ${t.finalAnswer || 'N/A'}
${t.errorMessage ? `- **错误信息**: ${t.errorMessage}` : ''}
`).join('\\n')}
`;

  return report;
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始AI工具全面测试...');
  console.log(`📋 总计 ${aiToolsTestCases.length} 个工具待测试`);
  console.log('=' .repeat(80));

  const totalTests = aiToolsTestCases.length;

  for (let i = 0; i < totalTests; i++) {
    const toolTest = aiToolsTestCases[i];
    await runToolTest(toolTest, i, totalTests);

    // 短暂延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\\n' + '=' .repeat(80));
  console.log('📊 测试完成，生成报告...');

  const report = generateTestReport();

  // 保存报告到文件
  const reportFileName = `ai-tools-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
  fs.writeFileSync(reportFileName, report, 'utf8');

  console.log(`📄 报告已保存: ${reportFileName}`);

  // 显示简要统计
  console.log('\\n🎯 测试结果摘要:');
  console.log(`✅ 成功: ${testResults.summary.passedTests}/${testResults.summary.totalTests}`);
  console.log(`❌ 失败: ${testResults.summary.failedTests}/${testResults.summary.totalTests}`);
  console.log(`📈 成功率: ${((testResults.summary.passedTests / testResults.summary.totalTests) * 100).toFixed(1)}%`);
  console.log(`⏱️  平均响应时间: ${testResults.summary.averageTime}ms`);

  if (testResults.errors.length > 0) {
    console.log(`\\n⚠️  发现 ${testResults.errors.length} 个错误，请查看详细报告`);
  } else {
    console.log('\\n🎉 所有测试都通过了！');
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error('💥 测试脚本运行失败:', error);
  process.exit(1);
});