/**
 * 核心对话功能测试脚本
 * 测试幼儿园AI系统的对话能力
 */
const axios = require('axios');

// 测试配置
const API_BASE = 'http://localhost:3000';
const TEST_USER_ID = '121';

// 测试用例
const DIALOGUE_TEST_CASES = [
  {
    name: '基础问候测试',
    message: 'hi',
    expectedType: 'greeting',
    description: '测试AI的基础问候响应能力'
  },
  {
    name: '招生咨询测试',
    message: '我想了解一下幼儿园的招生情况',
    expectedType: 'enrollment',
    description: '测试AI对招生相关问题的专业回答'
  },
  {
    name: '活动策划测试',
    message: '帮我设计一个亲子活动',
    expectedType: 'activity_planning',
    description: '测试AI的活动策划建议能力'
  },
  {
    name: '教育咨询测试',
    message: '3岁孩子应该如何进行早期教育？',
    expectedType: 'education',
    description: '测试AI的教育专业知识回答'
  },
  {
    name: '中文对话测试',
    message: '你好，请介绍一下幼儿园的特色课程',
    expectedType: 'curriculum',
    description: '测试AI的中文对话和课程介绍能力'
  }
];

/**
 * 执行对话测试
 */
async function runDialogueTest(testCase) {
  try {
    console.log(`\n🧪 执行测试: ${testCase.name}`);
    console.log(`📝 描述: ${testCase.description}`);
    console.log(`💬 输入: "${testCase.message}"`);

    const startTime = Date.now();

    // 尝试不同的API端点进行测试
    const endpoints = [
      '/api/ai-assistant-optimized/query',
      '/api/ai/unified/direct-chat'
    ];

    let response = null;
    let usedEndpoint = '';

    // 尝试每个端点
    for (const endpoint of endpoints) {
      try {
        console.log(`🔗 尝试端点: ${endpoint}`);

        const requestData = endpoint.includes('optimized')
          ? { message: testCase.message, userId: TEST_USER_ID }
          : { message: testCase.message, userId: TEST_USER_ID, context: {} };

        response = await axios.post(`${API_BASE}${endpoint}`, requestData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        });

        usedEndpoint = endpoint;
        break;
      } catch (err) {
        console.log(`❌ 端点 ${endpoint} 失败: ${err.response?.status || err.message}`);
        continue;
      }
    }

    if (!response) {
      console.log('❌ 所有端点都失败了');
      return { success: false, error: '无可用端点' };
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // 分析响应
    const responseData = response.data;
    const responseText = responseData.data?.message || responseData.message || responseData.data?.content || '';

    console.log(`✅ 使用端点: ${usedEndpoint}`);
    console.log(`⏱️  响应时间: ${responseTime}ms`);
    const truncated = responseText.substring(0, 100) + (responseText.length > 100 ? '...' : '');
    console.log(`📤 AI回复: "${truncated}"`);

    // 评估回复质量
    const quality = evaluateResponse(responseText, testCase);
    console.log(`🎯 质量评分: ${quality.score}/100`);
    console.log(`📊 评估: ${quality.assessment}`);

    return {
      success: true,
      testCase: testCase.name,
      endpoint: usedEndpoint,
      responseTime,
      responseText,
      quality
    };

  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    return {
      success: false,
      testCase: testCase.name,
      error: error.message
    };
  }
}

/**
 * 评估AI回复质量
 */
function evaluateResponse(responseText, testCase) {
  if (!responseText || responseText.trim().length === 0) {
    return { score: 0, assessment: '空回复' };
  }

  if (responseText.includes('抱歉') && responseText.length < 50) {
    return { score: 20, assessment: '仅返回道歉信息，缺乏实质内容' };
  }

  let score = 40; // 基础分
  let assessmentParts = [];

  // 长度评估
  if (responseText.length > 100) {
    score += 20;
    assessmentParts.push('回复详细');
  } else if (responseText.length > 50) {
    score += 10;
    assessmentParts.push('回复适中');
  }

  // 专业性评估
  const professionalKeywords = ['建议', '方案', '分析', '专业', '经验', '效果', '优化', '设计'];
  const foundKeywords = professionalKeywords.filter(keyword => responseText.includes(keyword));
  if (foundKeywords.length > 0) {
    score += Math.min(foundKeywords.length * 5, 20);
    assessmentParts.push(`专业词汇(${foundKeywords.length}个)`);
  }

  // 结构化评估
  if (responseText.includes('•') || responseText.includes('：') || responseText.includes('1.') || responseText.includes('📊')) {
    score += 15;
    assessmentParts.push('结构化清晰');
  }

  // 类型匹配评估
  const typeKeywords = {
    greeting: ['你好', '欢迎', '帮助'],
    enrollment: ['招生', '报名', '入学', '咨询'],
    activity_planning: ['活动', '策划', '亲子', '游戏'],
    education: ['教育', '学习', '发展', '孩子'],
    curriculum: ['课程', '特色', '教学']
  };

  if (typeKeywords[testCase.expectedType]) {
    const relevantKeywords = typeKeywords[testCase.expectedType].filter(keyword => responseText.includes(keyword));
    if (relevantKeywords.length > 0) {
      score += 10;
      assessmentParts.push('内容相关');
    }
  }

  score = Math.min(score, 100);

  return {
    score,
    assessment: assessmentParts.length > 0 ? assessmentParts.join(', ') : '基础回复'
  };
}

/**
 * 主测试函数
 */
async function runCoreDialogueTests() {
  console.log('🤖 开始核心对话功能测试...');
  console.log(`🎯 测试目标: 验证AI对话系统的核心功能`);
  console.log(`📊 测试用例数: ${DIALOGUE_TEST_CASES.length}`);

  const results = [];

  for (const testCase of DIALOGUE_TEST_CASES) {
    const result = await runDialogueTest(testCase);
    results.push(result);

    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 生成测试报告
  generateTestReport(results);
}

/**
 * 生成测试报告
 */
function generateTestReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 核心对话功能测试报告');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);

  console.log(`\n📊 总体统计:`);
  console.log(`   总测试数: ${totalCount}`);
  console.log(`   成功数: ${successCount}`);
  console.log(`   成功率: ${successRate}%`);

  if (successCount > 0) {
    const avgResponseTime = results
      .filter(r => r.success && r.responseTime)
      .reduce((sum, r) => sum + r.responseTime, 0) / successCount;

    const avgQuality = results
      .filter(r => r.success && r.quality)
      .reduce((sum, r) => sum + r.quality.score, 0) / successCount;

    console.log(`   平均响应时间: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`   平均质量评分: ${avgQuality.toFixed(1)}/100`);
  }

  console.log(`\n📝 详细结果:`);
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.testCase}`);
    if (result.success) {
      console.log(`   ✅ 成功 (${result.responseTime}ms, 质量:${result.quality.score}/100)`);
      console.log(`   📍 使用端点: ${result.endpoint}`);
      console.log(`   📝 评估: ${result.quality.assessment}`);
    } else {
      console.log(`   ❌ 失败: ${result.error}`);
    }
  });

  // 问题诊断
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log(`\n🔍 问题诊断:`);
    failedTests.forEach(test => {
      console.log(`   • ${test.testCase}: ${test.error}`);
    });
  }

  // 性能评估
  console.log(`\n⚡ 性能评估:`);
  if (successCount > 0) {
    const responseTimes = results.filter(r => r.success && r.responseTime).map(r => r.responseTime);
    if (responseTimes.length > 0) {
      console.log(`   最快响应: ${Math.min(...responseTimes)}ms`);
      console.log(`   最慢响应: ${Math.max(...responseTimes)}ms`);
    }

    const qualities = results.filter(r => r.success && r.quality).map(r => r.quality.score);
    if (qualities.length > 0) {
      console.log(`   最高质量: ${Math.max(...qualities)}/100`);
      console.log(`   最低质量: ${Math.min(...qualities)}/100`);
    }
  }

  console.log('\n' + '='.repeat(60));

  if (successRate >= 80) {
    console.log('🎉 核心对话功能测试通过！');
  } else if (successRate >= 60) {
    console.log('⚠️  核心对话功能基本可用，需要优化');
  } else {
    console.log('❌ 核心对话功能存在严重问题，需要修复');
  }
}

// 执行测试
if (require.main === module) {
  runCoreDialogueTests().catch(console.error);
}

module.exports = { runCoreDialogueTests };