/**
 * AI工具调用功能单元测试
 * 测试后端是否能正确返回思考过程和工具调用步骤
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000/api',
  timeout: 60000,
  credentials: {
    username: 'admin',
    password: 'admin123'
  }
};

// 测试结果存储
let testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  },
  toolCallAnalysis: {
    totalToolCalls: 0,
    successfulParsing: 0,
    successfulExecution: 0,
    thinkingProcessDetected: 0,
    multiRoundConversations: 0
  }
};

/**
 * 日志记录函数
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '📝';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

/**
 * 分析工具调用和思考过程
 */
function analyzeToolCallsAndThinking(responseData) {
  const analysis = {
    hasToolCallMarkers: false,
    toolCallsParsed: 0,
    toolsExecuted: 0,
    hasThinkingProcess: false,
    multiRoundConversation: false,
    thinkingContent: '',
    toolCallDetails: [],
    conversationRounds: 0
  };

  if (responseData && responseData.message) {
    const message = responseData.message;

    // 检查是否包含工具调用标记
    const toolCallRegex = /<\|FunctionCallBegin\|>(.*?)<\|FunctionCallEnd\|>/g;
    const toolCallMatches = message.match(toolCallRegex);

    if (toolCallMatches && toolCallMatches.length > 0) {
      analysis.hasToolCallMarkers = true;
      analysis.toolCallsParsed = toolCallMatches.length;
      testResults.toolCallAnalysis.totalToolCalls += toolCallMatches.length;
      testResults.toolCallAnalysis.successfulParsing++;

      // 解析每个工具调用
      toolCallMatches.forEach((match, index) => {
        try {
          const content = match.replace(/<\|FunctionCallBegin\|>/, '').replace(/<\|FunctionCallEnd\|>/, '');
          const toolCall = JSON.parse(content);
          analysis.toolCallDetails.push({
            index: index + 1,
            toolCall: toolCall,
            raw: match
          });
        } catch (e) {
          log(`工具调用解析失败: ${e.message}`, 'error');
        }
      });
    }

    // 检查是否有思考过程（工具调用前后的文本内容）
    const textWithoutToolCalls = message.replace(toolCallRegex, '').trim();
    if (textWithoutToolCalls.length > 20) {
      analysis.hasThinkingProcess = true;
      analysis.thinkingContent = textWithoutToolCalls;
      testResults.toolCallAnalysis.thinkingProcessDetected++;
    }

    // 检查是否是多轮对话（通过消息长度和结构判断）
    if (message.length > 500 || (analysis.hasToolCallMarkers && analysis.hasThinkingProcess)) {
      analysis.multiRoundConversation = true;
      testResults.toolCallAnalysis.multiRoundConversations++;
    }
  }

  return analysis;
}

/**
 * 添加测试结果
 */
function addTestResult(testName, passed, data, error = null) {
  const result = {
    testName,
    passed,
    timestamp: new Date().toISOString(),
    data,
    error: error ? error.message : null
  };

  testResults.tests.push(result);
  testResults.summary.total++;

  if (passed) {
    testResults.summary.passed++;
    log(`测试通过: ${testName}`, 'success');
  } else {
    testResults.summary.failed++;
    log(`测试失败: ${testName} - ${error?.message}`, 'error');
  }
}

/**
 * 获取认证Token
 */
async function getAuthToken() {
  try {
    log('开始获取认证Token...');
    
    const response = await axios.post(`${TEST_CONFIG.baseURL}/auth/login`, {
      username: TEST_CONFIG.credentials.username,
      password: TEST_CONFIG.credentials.password
    }, {
      timeout: TEST_CONFIG.timeout
    });
    
    if (response.data.success && response.data.data.token) {
      log('认证Token获取成功');
      return response.data.data.token;
    } else {
      throw new Error('登录响应格式错误');
    }
  } catch (error) {
    log(`认证失败: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * 测试1: 基础AI聊天功能
 */
async function testBasicAIChat(token) {
  const testName = '基础AI聊天功能';
  
  try {
    log(`开始测试: ${testName}`);
    
    const response = await axios.post(`${TEST_CONFIG.baseURL}/ai/unified/unified-chat`, {
      message: "你好，请简单介绍一下自己",
      context: {
        enableTools: false,
        enableWebSearch: false
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: TEST_CONFIG.timeout
    });
    
    const data = response.data;
    const passed = data.success && data.data && data.data.message;
    
    addTestResult(testName, passed, {
      success: data.success,
      hasMessage: !!data.data?.message,
      messageLength: data.data?.message?.length || 0,
      metadata: data.metadata
    }, passed ? null : new Error('响应格式不正确'));
    
    return passed;
  } catch (error) {
    addTestResult(testName, false, null, error);
    return false;
  }
}

/**
 * 测试2: 单工具调用功能
 */
async function testSingleToolCall(token) {
  const testName = '单工具调用功能';
  
  try {
    log(`开始测试: ${testName}`);
    
    const response = await axios.post(`${TEST_CONFIG.baseURL}/ai/unified/unified-chat`, {
      message: "请查询一下学生总数",
      context: {
        enableTools: true,
        enableWebSearch: false
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: TEST_CONFIG.timeout
    });
    
    const data = response.data;
    const passed = data.success && data.data && data.data.message;
    
    addTestResult(testName, passed, {
      success: data.success,
      hasMessage: !!data.data?.message,
      messageLength: data.data?.message?.length || 0,
      metadata: data.metadata,
      toolsUsed: data.metadata?.toolsUsed || [],
      processingLevel: data.metadata?.level
    }, passed ? null : new Error('单工具调用失败'));
    
    return passed;
  } catch (error) {
    addTestResult(testName, false, null, error);
    return false;
  }
}

/**
 * 测试3: 多工具调用功能（重点测试）
 */
async function testMultiToolCall(token) {
  const testName = '多工具调用功能';

  try {
    log(`开始测试: ${testName}`);

    const response = await axios.post(`${TEST_CONFIG.baseURL}/ai/unified/unified-chat`, {
      message: "请帮我查询最近一个月的活动统计数据，然后分析活动参与度趋势，最后创建一个关于提升活动参与度的TodoList",
      context: {
        enableTools: true,
        enableWebSearch: false,
        levelOverride: 'level-3', // 强制进入Level-3处理
        toolCallGuidance: {
          enabled: true,
          style: 'cursor',
          requirements: {
            thinkingMode: 'minimal',
            toolDescription: 'single_sentence',
            progressUpdates: true
          }
        }
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: TEST_CONFIG.timeout
    });

    const data = response.data;
    const passed = data.success && data.data;

    // 检查是否包含思考过程
    const hasThinking = data.data?.thinking || data.data?.message?.includes('思考') || data.data?.message?.includes('分析');

    // 检查是否有工具调用相关信息
    const hasToolInfo = data.metadata?.toolsUsed || data.metadata?.level || data.data?.toolCalls;

    addTestResult(testName, passed, {
      success: data.success,
      hasMessage: !!data.data?.message,
      hasThinking: hasThinking,
      hasToolInfo: !!hasToolInfo,
      messageLength: data.data?.message?.length || 0,
      metadata: data.metadata,
      toolsUsed: data.metadata?.toolsUsed || [],
      processingLevel: data.metadata?.level,
      fullResponse: data.data
    }, passed ? null : new Error('多工具调用失败'));

    return passed;
  } catch (error) {
    addTestResult(testName, false, null, error);
    return false;
  }
}

/**
 * 测试5: 工具调用解析验证（重点测试）
 */
async function testToolCallParsing(token) {
  const testName = '工具调用解析验证';

  try {
    log(`开始测试: ${testName}`);

    const response = await axios.post(`${TEST_CONFIG.baseURL}/ai/unified/unified-chat`, {
      message: "请查询学生总数",
      context: {
        enableTools: true,
        enableWebSearch: false,
        levelOverride: 'level-3' // 强制进入Level-3处理
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: TEST_CONFIG.timeout
    });

    const data = response.data;
    const passed = data.success && data.data;

    // 分析工具调用和思考过程
    const analysis = analyzeToolCallsAndThinking(data.data);

    // 验证关键指标
    const hasValidToolCalls = analysis.hasToolCallMarkers && analysis.toolCallsParsed > 0;
    const hasThinkingProcess = analysis.hasThinkingProcess;
    const isLevel3 = data.metadata?.level === 'level-3';

    const testPassed = passed && hasValidToolCalls && isLevel3;

    addTestResult(testName, testPassed, {
      success: data.success,
      isLevel3: isLevel3,
      toolCallAnalysis: analysis,
      hasValidToolCalls: hasValidToolCalls,
      hasThinkingProcess: hasThinkingProcess,
      metadata: data.metadata,
      rawMessage: data.data?.message,
      messageLength: data.data?.message?.length || 0
    }, testPassed ? null : new Error('工具调用解析验证失败'));

    return testPassed;
  } catch (error) {
    addTestResult(testName, false, null, error);
    return false;
  }
}

/**
 * 测试6: TodoList工具调用验证（修复后）
 */
async function testTodoListCreation(token) {
  const testName = 'TodoList工具调用验证（修复后）';

  try {
    log(`开始测试: ${testName}`);

    const response = await axios.post(`${TEST_CONFIG.baseURL}/ai/unified/unified-chat`, {
      message: "请帮我策划一个六一儿童节亲子活动，包括活动准备、场地安排、物料采购、人员分工等，并创建一个详细的TodoList",
      context: {
        enableTools: true,
        enableWebSearch: false,
        levelOverride: 'level-3' // 强制进入Level-3处理
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: TEST_CONFIG.timeout
    });

    const data = response.data;
    const passed = data.success && data.data;

    // 分析工具调用和思考过程
    const analysis = analyzeToolCallsAndThinking(data.data);

    // 检查是否调用了analyze_task_complexity
    const hasComplexityAnalysis = data.metadata?.tools_used?.includes('analyze_task_complexity');

    // 检查是否调用了create_todo_list
    const hasCreateTodoList = data.metadata?.tools_used?.includes('create_todo_list');

    // 检查工具执行顺序
    const toolExecutions = data.data?.tool_executions || [];
    const complexityExecution = toolExecutions.find(exec => exec.name === 'analyze_task_complexity');
    const todoListExecution = toolExecutions.find(exec => exec.name === 'create_todo_list');

    // 验证复杂度分析结果
    const complexityResult = complexityExecution?.result?.result;
    const needsTodoList = complexityResult?.needsTodoList;
    const autoAction = complexityResult?.auto_action;

    // 检查是否有TodoList相关的UI指令
    const hasTodoListUI = data.data?.message?.includes('todo') ||
                         data.data?.message?.includes('任务清单') ||
                         todoListExecution?.result?.result?.ui_instruction?.type === 'render_todo_list';

    // 测试通过条件：
    // 1. 调用了复杂度分析
    // 2. 复杂度分析返回needsTodoList=true
    // 3. 调用了create_todo_list工具
    const testPassed = passed && hasComplexityAnalysis && needsTodoList && hasCreateTodoList;

    addTestResult(testName, testPassed, {
      success: data.success,
      hasComplexityAnalysis: hasComplexityAnalysis,
      hasCreateTodoList: hasCreateTodoList,
      needsTodoList: needsTodoList,
      autoAction: autoAction,
      hasTodoListUI: hasTodoListUI,
      toolCallAnalysis: analysis,
      metadata: data.metadata,
      toolsUsed: data.metadata?.tools_used || [],
      toolExecutions: toolExecutions,
      complexityResult: complexityResult,
      todoListResult: todoListExecution?.result?.result,
      rawMessage: data.data?.message,
      messageLength: data.data?.message?.length || 0
    }, testPassed ? null : new Error(`TodoList工具调用验证失败: 复杂度分析=${hasComplexityAnalysis}, 需要TodoList=${needsTodoList}, 创建TodoList=${hasCreateTodoList}`));

    return testPassed;
  } catch (error) {
    addTestResult(testName, false, null, error);
    return false;
  }
}

/**
 * 测试7: 强制Level-3处理（真正的工具调用测试）
 */
async function testLevel3Processing(token) {
  const testName = '强制Level-3处理';

  try {
    log(`开始测试: ${testName}`);

    const response = await axios.post(`${TEST_CONFIG.baseURL}/ai/unified/unified-chat`, {
      message: "请查询学生总数，然后生成一个学生统计报告",
      context: {
        enableTools: true,
        enableWebSearch: false,
        levelOverride: 'level-3' // 强制进入Level-3处理
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: TEST_CONFIG.timeout
    });

    const data = response.data;
    const passed = data.success && data.data;

    // 检查是否真正进入了Level-3
    const isLevel3 = data.metadata?.level === 'level-3';

    // 检查是否有真正的工具调用
    const hasRealToolCalls = data.data?.toolExecutions && data.data.toolExecutions.length > 0;

    addTestResult(testName, passed, {
      success: data.success,
      isLevel3: isLevel3,
      hasRealToolCalls: hasRealToolCalls,
      toolExecutions: data.data?.toolExecutions || [],
      metadata: data.metadata,
      approach: data.metadata?.approach,
      fullResponse: data.data
    }, passed ? null : new Error('Level-3处理失败'));

    return passed;
  } catch (error) {
    addTestResult(testName, false, null, error);
    return false;
  }
}

/**
 * 测试4: SSE流式响应功能
 */
async function testSSEStreamResponse(token) {
  const testName = 'SSE流式响应功能';
  
  try {
    log(`开始测试: ${testName}`);
    
    const response = await axios.post(`${TEST_CONFIG.baseURL}/ai/unified/unified-chat-stream`, {
      message: "请分析一下幼儿园的整体运营情况",
      context: {
        enableTools: true,
        enableWebSearch: false
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: TEST_CONFIG.timeout
    });
    
    const data = response.data;
    const passed = data.success;
    
    addTestResult(testName, passed, {
      success: data.success,
      hasSessionId: !!data.data?.sessionId,
      sessionId: data.data?.sessionId,
      message: data.message
    }, passed ? null : new Error('SSE流式响应失败'));
    
    return passed;
  } catch (error) {
    addTestResult(testName, false, null, error);
    return false;
  }
}

/**
 * 保存测试结果到JSON文件
 */
function saveTestResults() {
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const filename = `ai-tool-calling-test-${Date.now()}.json`;
  const filepath = path.join(resultsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(testResults, null, 2), 'utf8');
  log(`测试结果已保存到: ${filepath}`, 'success');
  
  return filepath;
}

/**
 * 主测试函数
 */
async function runTests() {
  log('🚀 开始AI工具调用功能测试');
  
  try {
    // 获取认证Token
    const token = await getAuthToken();
    
    // 运行所有测试
    await testBasicAIChat(token);
    await testSingleToolCall(token);
    await testToolCallParsing(token);  // 新增：工具调用解析验证
    await testMultiToolCall(token);
    await testTodoListCreation(token); // 新增：TodoList工具调用验证
    await testLevel3Processing(token);
    await testSSEStreamResponse(token);
    
    // 保存结果
    const resultFile = saveTestResults();
    
    // 输出测试摘要
    log('\n📊 测试摘要:');
    log(`总测试数: ${testResults.summary.total}`);
    log(`通过: ${testResults.summary.passed}`, 'success');
    log(`失败: ${testResults.summary.failed}`, testResults.summary.failed > 0 ? 'error' : 'info');
    log(`成功率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);

    // 输出工具调用分析摘要
    log('\n🔧 工具调用分析摘要:');
    log(`总工具调用数: ${testResults.toolCallAnalysis.totalToolCalls}`);
    log(`成功解析数: ${testResults.toolCallAnalysis.successfulParsing}`);
    log(`检测到思考过程: ${testResults.toolCallAnalysis.thinkingProcessDetected}`);
    log(`多轮对话数: ${testResults.toolCallAnalysis.multiRoundConversations}`);

    // 输出详细的工具调用解析测试结果
    const toolCallTest = testResults.tests.find(t => t.testName === '工具调用解析验证');
    if (toolCallTest) {
      log('\n🔍 工具调用解析测试详情:');
      console.log(JSON.stringify(toolCallTest.data, null, 2));
    }

    // 输出详细的多工具调用测试结果
    const multiToolTest = testResults.tests.find(t => t.testName === '多工具调用功能');
    if (multiToolTest) {
      log('\n🔍 多工具调用测试详情:');
      console.log(JSON.stringify(multiToolTest.data, null, 2));
    }
    
    return testResults;
    
  } catch (error) {
    log(`测试运行失败: ${error.message}`, 'error');
    throw error;
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testResults
};
