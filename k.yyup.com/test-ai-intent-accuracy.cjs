#!/usr/bin/env node

/**
 * 🧪 AI意图判断准确性自动化测试脚本
 * 测试豆包AI模型在30个场景下的意图判断准确率
 */

const axios = require('axios');
const EventSource = require('eventsource');

// 测试场景配置
const testScenarios = {
  simple: [
    { id: 1, prompt: "你好", category: "问候", expectedBehavior: "direct_reply" },
    { id: 2, prompt: "早上好", category: "问候", expectedBehavior: "direct_reply" },
    { id: 3, prompt: "谢谢", category: "礼貌用语", expectedBehavior: "direct_reply" },
    { id: 4, prompt: "再见", category: "礼貌用语", expectedBehavior: "direct_reply" },
    { id: 5, prompt: "你是谁", category: "自我介绍", expectedBehavior: "direct_reply" },
    { id: 6, prompt: "今天天气怎么样", category: "常识问答", expectedBehavior: "direct_reply" },
    { id: 7, prompt: "现在几点了", category: "常识问答", expectedBehavior: "direct_reply" },
    { id: 8, prompt: "我很开心", category: "情感表达", expectedBehavior: "direct_reply" },
    { id: 9, prompt: "帮我加油打气", category: "情感表达", expectedBehavior: "direct_reply" },
    { id: 10, prompt: "周末愉快", category: "礼貌用语", expectedBehavior: "direct_reply" }
  ],

  tool_call: [
    { id: 1, prompt: "查询当前在园人数", category: "数据查询", expectedTool: "query_data_record", expectedBehavior: "tool_call" },
    { id: 2, prompt: "显示所有教师信息", category: "数据查询", expectedTool: "read_data_record", expectedBehavior: "tool_call" },
    { id: 3, prompt: "查看今天的课程安排", category: "数据查询", expectedTool: "query_data_record", expectedBehavior: "tool_call" },
    { id: 4, prompt: "统计各班级学生数量", category: "数据分析", expectedTool: "any_query", expectedBehavior: "tool_call" },
    { id: 5, prompt: "新增一个学生张三", category: "数据操作", expectedTool: "create_data_record", expectedBehavior: "tool_call" },
    { id: 6, prompt: "更新李四的班级为大一班", category: "数据操作", expectedTool: "update_data_record", expectedBehavior: "tool_call" },
    { id: 7, prompt: "删除已毕业的学生记录", category: "数据操作", expectedTool: "update_data_record", expectedBehavior: "tool_call" },
    { id: 8, prompt: "查看最近的家长反馈", category: "数据查询", expectedTool: "read_data_record", expectedBehavior: "tool_call" },
    { id: 9, prompt: "生成今天的考勤报告", category: "数据分析", expectedTool: "any_query", expectedBehavior: "tool_call" },
    { id: 10, prompt: "检查哪些孩子今天请假了", category: "数据查询", expectedTool: "query_data_record", expectedBehavior: "tool_call" }
  ],

  complex: [
    { id: 1, prompt: "生成月度出勤统计报告并制作图表", category: "数据分析可视化", expectedTools: ["any_query", "render_component"], expectedBehavior: "complex_call" },
    { id: 2, prompt: "分析各年龄段孩子的身高体重分布并生成对比图表", category: "数据分析可视化", expectedTools: ["any_query", "render_component"], expectedBehavior: "complex_call" },
    { id: 3, prompt: "查看本月收入情况并生成财务报表", category: "财务分析", expectedTools: ["any_query", "render_component"], expectedBehavior: "complex_call" },
    { id: 4, prompt: "制作学生信息总览表，包含基本信息、出勤情况和家长联系方式", category: "综合报表", expectedTools: ["read_data_record", "query_data_record"], expectedBehavior: "complex_call" },
    { id: 5, prompt: "查看活跃教师的工作量统计和绩效评估", category: "教师管理", expectedTools: ["any_query", "query_data_record"], expectedBehavior: "complex_call" },
    { id: 6, prompt: "为新入园的孩子自动分配班级并通知相关老师", category: "业务流程", expectedTools: ["query_data_record", "update_data_record"], expectedBehavior: "complex_call" },
    { id: 7, prompt: "处理退园流程：更新状态、计算费用、生成退园证明", category: "业务流程", expectedTools: ["update_data_record", "any_query"], expectedBehavior: "complex_call" },
    { id: 8, prompt: "分析近半年的招生趋势，包含来源渠道、转化率和推荐统计", category: "招生分析", expectedTools: ["any_query", "render_component"], expectedBehavior: "complex_call" },
    { id: 9, prompt: "评估教师教学效果：学生进步、家长满意度、课程完成率", category: "教学评估", expectedTools: ["any_query", "read_data_record"], expectedBehavior: "complex_call" },
    { id: 10, prompt: "进行系统健康检查：用户活跃度、数据完整性、性能指标分析", category: "系统管理", expectedTools: ["any_query", "render_component"], expectedBehavior: "complex_call" }
  ]
};

// 测试结果记录
const testResults = {
  simple: { total: 0, correct: 0, incorrect: 0, details: [] },
  tool_call: { total: 0, correct: 0, incorrect: 0, details: [] },
  complex: { total: 0, correct: 0, incorrect: 0, details: [] }
};

/**
 * 执行单个测试场景
 */
async function runTestScenario(scenario, category) {
  console.log(`\n🧪 测试场景 ${category}/${scenario.id}: "${scenario.prompt}"`);

  return new Promise((resolve) => {
    const startTime = Date.now();
    const events = [];
    let hasToolCall = false;
    let hasContent = false;
    let hasThinking = false;
    let finalResult = null;

    // 创建SSE连接
    const eventSource = new EventSource('http://localhost:3000/api/ai-unified/stream-chat', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    // 监听事件
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        events.push({ type: event.type, data: data, timestamp: Date.now() });

        switch (event.type) {
          case 'thinking':
            hasThinking = true;
            console.log(`  💭 思考事件: ${data.message?.substring(0, 50)}...`);
            break;

          case 'content':
            hasContent = true;
            finalResult = data.content;
            console.log(`  📝 内容事件: ${data.content?.substring(0, 50)}...`);
            break;

          case 'tool_call':
            hasToolCall = true;
            console.log(`  🔧 工具调用: ${data.tool_name}`);
            break;

          case 'tool_result':
            console.log(`  ✅ 工具结果: ${data.tool_name} - ${data.success ? '成功' : '失败'}`);
            break;

          case 'error':
            console.log(`  ❌ 错误事件: ${data.message}`);
            break;
        }
      } catch (error) {
        console.log(`  ⚠️ 事件解析错误: ${error.message}`);
      }
    };

    eventSource.onerror = (error) => {
      console.log(`  ❌ SSE连接错误: ${error.message}`);
      eventSource.close();

      // 评估测试结果
      const result = evaluateTestResult(scenario, category, {
        hasToolCall,
        hasContent,
        hasThinking,
        finalResult,
        events,
        duration: Date.now() - startTime
      });

      resolve(result);
    };

    // 发送测试请求
    setTimeout(() => {
      try {
        fetch('http://localhost:3000/api/ai-unified/stream-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            content: scenario.prompt,
            context: {
              userId: 'test-user',
              sessionId: 'test-session',
              role: 'admin',
              enableTools: true,
              currentPage: 'ai-assistant'
            }
          })
        }).catch(error => {
          console.log(`  ❌ 请求发送失败: ${error.message}`);
          eventSource.close();

          resolve({
            scenario,
            category,
            success: false,
            error: 'Request failed',
            hasToolCall: false,
            hasContent: false,
            duration: Date.now() - startTime
          });
        });
      } catch (error) {
        console.log(`  ❌ 请求创建失败: ${error.message}`);
        eventSource.close();

        resolve({
          scenario,
          category,
          success: false,
          error: 'Request creation failed',
          hasToolCall: false,
          hasContent: false,
          duration: Date.now() - startTime
        });
      }
    }, 100);

    // 设置超时
    setTimeout(() => {
      console.log(`  ⏰ 测试超时`);
      eventSource.close();

      resolve({
        scenario,
        category,
        success: false,
        error: 'Timeout',
        hasToolCall,
        hasContent,
        duration: Date.now() - startTime
      });
    }, 30000); // 30秒超时
  });
}

/**
 * 评估测试结果
 */
function evaluateTestResult(scenario, category, execution) {
  const { hasToolCall, hasContent, hasThinking, finalResult, duration } = execution;
  let isCorrect = false;
  let reasoning = '';
  let detectedBehavior = '';

  // 判断实际行为
  if (category === 'simple') {
    detectedBehavior = hasToolCall ? 'tool_call' : 'direct_reply';
    isCorrect = !hasToolCall && hasContent;
    reasoning = isCorrect
      ? '✅ 正确识别为简单回复，未调用工具'
      : hasToolCall
        ? '❌ 错误：简单问题调用了工具'
        : '❌ 错误：没有收到内容回复';
  }
  else if (category === 'tool_call') {
    detectedBehavior = hasToolCall ? 'tool_call' : 'direct_reply';
    isCorrect = hasToolCall;
    reasoning = isCorrect
      ? '✅ 正确识别为工具调用场景'
      : '❌ 错误：应该调用工具但直接回复了';
  }
  else if (category === 'complex') {
    detectedBehavior = hasToolCall && hasThinking ? 'complex_call' : (hasToolCall ? 'tool_call' : 'direct_reply');
    isCorrect = hasToolCall; // 复杂场景至少应该调用工具
    reasoning = isCorrect
      ? '✅ 正确识别为复杂工具调用场景'
      : '❌ 错误：复杂场景应该调用工具';
  }

  // 记录结果
  const result = {
    scenario,
    category,
    expectedBehavior: scenario.expectedBehavior,
    detectedBehavior,
    isCorrect,
    reasoning,
    duration,
    hasToolCall,
    hasContent,
    hasThinking,
    finalResult: finalResult?.substring(0, 100) + '...',
    timestamp: new Date().toISOString()
  };

  // 更新统计
  testResults[category].total++;
  if (isCorrect) {
    testResults[category].correct++;
  } else {
    testResults[category].incorrect++;
  }
  testResults[category].details.push(result);

  // 打印结果
  const statusIcon = isCorrect ? '✅' : '❌';
  const durationIcon = duration < 5000 ? '⚡' : duration < 10000 ? '🔄' : '🐌';

  console.log(`  ${statusIcon} ${durationIcon} 结果: ${reasoning}`);
  console.log(`  📊 行为检测: 期望=${scenario.expectedBehavior}, 实际=${detectedBehavior}`);
  console.log(`  ⏱️  耗时: ${duration}ms`);

  return result;
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  console.log('\n\n📊 AI意图判断准确性测试报告');
  console.log('=' .repeat(60));

  const totalTests = Object.values(testResults).reduce((sum, cat) => sum + cat.total, 0);
  const totalCorrect = Object.values(testResults).reduce((sum, cat) => sum + cat.correct, 0);
  const overallAccuracy = totalTests > 0 ? (totalCorrect / totalTests * 100).toFixed(1) : 0;

  console.log(`\n🎯 总体准确率: ${overallAccuracy}% (${totalCorrect}/${totalTests})`);

  Object.entries(testResults).forEach(([category, results]) => {
    const accuracy = results.total > 0 ? (results.correct / results.total * 100).toFixed(1) : 0;
    const categoryNames = {
      simple: '简单回复',
      tool_call: '工具调用',
      complex: '复杂调用'
    };

    console.log(`\n📋 ${categoryNames[category]}场景:`);
    console.log(`   准确率: ${accuracy}% (${results.correct}/${results.total})`);
    console.log(`   成功: ${results.correct}, 失败: ${results.incorrect}`);

    // 显示失败案例
    const failures = results.details.filter(d => !d.isCorrect);
    if (failures.length > 0) {
      console.log(`   ❌ 失败案例:`);
      failures.forEach(failure => {
        console.log(`     ${failure.scenario.id}. "${failure.scenario.prompt}"`);
        console.log(`        期望: ${failure.expectedBehavior}, 实际: ${failure.detectedBehavior}`);
        console.log(`        原因: ${failure.reasoning}`);
      });
    }
  });

  // 性能统计
  console.log(`\n⚡ 性能统计:`);
  const allDurations = Object.values(testResults).flatMap(cat =>
    cat.details.map(d => d.duration).filter(d => d)
  );

  if (allDurations.length > 0) {
    const avgDuration = (allDurations.reduce((a, b) => a + b, 0) / allDurations.length).toFixed(0);
    const minDuration = Math.min(...allDurations);
    const maxDuration = Math.max(...allDurations);

    console.log(`   平均响应时间: ${avgDuration}ms`);
    console.log(`   最快响应: ${minDuration}ms`);
    console.log(`   最慢响应: ${maxDuration}ms`);
  }

  // 建议
  console.log(`\n💡 优化建议:`);
  if (parseFloat(overallAccuracy) < 80) {
    console.log(`   ⚠️  整体准确率低于80%，建议优化提示词和工具描述`);
  }

  Object.entries(testResults).forEach(([category, results]) => {
    const accuracy = results.total > 0 ? (results.correct / results.total * 100) : 0;
    if (accuracy < 70) {
      const categoryNames = { simple: '简单回复', tool_call: '工具调用', complex: '复杂调用' };
      console.log(`   ⚠️  ${categoryNames[category]}准确率较低(${accuracy.toFixed(1)}%)，需要重点优化`);
    }
  });

  // 保存详细结果到文件
  const reportData = {
    timestamp: new Date().toISOString(),
    overallAccuracy: parseFloat(overallAccuracy),
    totalTests,
    totalCorrect,
    testResults,
    summary: {
      simple: { accuracy: testResults.simple.total > 0 ? (testResults.simple.correct / testResults.simple.total * 100) : 0, ...testResults.simple },
      tool_call: { accuracy: testResults.tool_call.total > 0 ? (testResults.tool_call.correct / testResults.tool_call.total * 100) : 0, ...testResults.tool_call },
      complex: { accuracy: testResults.complex.total > 0 ? (testResults.complex.correct / testResults.complex.total * 100) : 0, ...testResults.complex }
    }
  };

  require('fs').writeFileSync('ai-intent-test-results.json', JSON.stringify(reportData, null, 2));
  console.log(`\n📄 详细结果已保存到: ai-intent-test-results.json`);
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🚀 开始AI意图判断准确性测试...');
  console.log('测试目标: 验证豆包AI模型在30个场景下的意图判断准确率\n');

  // 检查后端服务是否可用
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    console.log('✅ 后端服务连接正常');
  } catch (error) {
    console.log('❌ 无法连接到后端服务，请确保后端服务已启动');
    console.log('   启动命令: npm run start:backend');
    process.exit(1);
  }

  // 依次测试每个类别
  const categories = ['simple', 'tool_call', 'complex'];

  for (const category of categories) {
    console.log(`\n🎯 开始测试 ${category.toUpperCase()} 场景...`);
    console.log('-'.repeat(50));

    for (const scenario of testScenarios[category]) {
      await runTestScenario(scenario, category);

      // 短暂延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 生成测试报告
  generateTestReport();
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testScenarios, testResults };