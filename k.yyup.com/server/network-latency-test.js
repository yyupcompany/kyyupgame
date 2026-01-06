/**
 * 网络延迟和豆包API性能测试
 */

const axios = require('axios');

const DOUBAO_CONFIG = {
  endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  apiKey: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
  model: 'doubao-seed-1-6-thinking-250615'
};

/**
 * 测试不同复杂度的请求
 */
async function testRequestComplexity() {
  console.log('\n🧪 测试不同复杂度的请求');
  
  const testCases = [
    {
      name: '简单问答',
      messages: [{ role: 'user', content: '你好' }],
      maxTokens: 50
    },
    {
      name: '中等复杂度',
      messages: [
        { role: 'system', content: '你是幼儿园管理专家' },
        { role: 'user', content: '请简单介绍一下幼儿园招生策略' }
      ],
      maxTokens: 200
    },
    {
      name: '复杂分析',
      messages: [
        { role: 'system', content: '你是资深的幼儿园招生策划专家，拥有10年以上经验' },
        { role: 'user', content: '我要做一场秋季招生活动，目标是招收100名学生，预算10万元，请详细分析策划方案' }
      ],
      maxTokens: 1500
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 测试: ${testCase.name}`);
    
    const results = [];
    
    // 连续测试3次
    for (let i = 1; i <= 3; i++) {
      console.log(`  第${i}次测试...`);
      
      const startTime = Date.now();
      
      try {
        const response = await axios.post(DOUBAO_CONFIG.endpoint, {
          model: DOUBAO_CONFIG.model,
          messages: testCase.messages,
          max_tokens: testCase.maxTokens,
          temperature: 0.7,
          stream: false
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
          },
          timeout: 45000 // 45秒超时
        });

        const duration = Date.now() - startTime;
        const tokens = response.data.usage?.total_tokens || 0;
        
        results.push({
          success: true,
          duration,
          tokens,
          tokensPerSecond: tokens / (duration / 1000)
        });
        
        console.log(`    ✅ 成功: ${duration}ms, ${tokens} tokens, ${Math.round(tokens / (duration / 1000))} tokens/s`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          success: false,
          duration,
          error: error.code || error.message
        });
        
        console.log(`    ❌ 失败: ${duration}ms, ${error.code || error.message}`);
      }
      
      // 间隔1秒
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 统计结果
    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
      const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
      const avgTokens = successful.reduce((sum, r) => sum + r.tokens, 0) / successful.length;
      const avgSpeed = successful.reduce((sum, r) => sum + r.tokensPerSecond, 0) / successful.length;
      
      console.log(`  📊 ${testCase.name}统计:`);
      console.log(`    成功率: ${successful.length}/3 (${Math.round(successful.length/3*100)}%)`);
      console.log(`    平均耗时: ${Math.round(avgDuration)}ms`);
      console.log(`    平均tokens: ${Math.round(avgTokens)}`);
      console.log(`    平均速度: ${Math.round(avgSpeed)} tokens/s`);
    }
  }
}

/**
 * 测试工具调用的性能
 */
async function testToolCallPerformance() {
  console.log('\n🔧 测试工具调用性能');
  
  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_expert_advice',
        description: '获取专家建议',
        parameters: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: '咨询主题' },
            details: { type: 'string', description: '详细描述' }
          },
          required: ['topic']
        }
      }
    }
  ];

  const testMessages = [
    {
      role: 'system',
      content: '你是一个智能助手，可以调用专家工具获取建议。当用户询问专业问题时，请使用get_expert_advice工具。'
    },
    {
      role: 'user',
      content: '我要做秋季招生活动，需要专家建议'
    }
  ];

  console.log('📤 发送带工具调用的请求...');
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(DOUBAO_CONFIG.endpoint, {
      model: DOUBAO_CONFIG.model,
      messages: testMessages,
      tools: tools,
      tool_choice: 'auto',
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
      },
      timeout: 45000
    });

    const duration = Date.now() - startTime;
    const message = response.data.choices[0]?.message;
    
    console.log(`✅ 工具调用测试成功: ${duration}ms`);
    
    if (message?.tool_calls && message.tool_calls.length > 0) {
      console.log(`🔧 检测到 ${message.tool_calls.length} 个工具调用:`);
      for (const toolCall of message.tool_calls) {
        console.log(`  - ${toolCall.function.name}: ${toolCall.function.arguments}`);
      }
    } else {
      console.log('⚠️ 未检测到工具调用');
    }
    
    console.log(`📝 响应内容: ${message?.content?.substring(0, 100)}...`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ 工具调用测试失败: ${duration}ms`);
    console.log(`🔍 错误: ${error.code || error.message}`);
  }
}

/**
 * 测试并发请求
 */
async function testConcurrentRequests() {
  console.log('\n🚀 测试并发请求性能');
  
  const concurrentLevels = [1, 2, 3];
  
  for (const level of concurrentLevels) {
    console.log(`\n📊 测试 ${level} 个并发请求:`);
    
    const promises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < level; i++) {
      const promise = axios.post(DOUBAO_CONFIG.endpoint, {
        model: DOUBAO_CONFIG.model,
        messages: [
          { role: 'user', content: `并发测试请求 ${i + 1}` }
        ],
        max_tokens: 100,
        temperature: 0.7,
        stream: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
        },
        timeout: 30000
      }).then(response => ({
        success: true,
        duration: Date.now() - startTime,
        tokens: response.data.usage?.total_tokens || 0
      })).catch(error => ({
        success: false,
        duration: Date.now() - startTime,
        error: error.code || error.message
      }));
      
      promises.push(promise);
    }
    
    try {
      const results = await Promise.all(promises);
      const totalDuration = Date.now() - startTime;
      const successful = results.filter(r => r.success);
      
      console.log(`  ✅ 成功: ${successful.length}/${level}`);
      console.log(`  ⏱️ 总耗时: ${totalDuration}ms`);
      console.log(`  📈 平均每请求: ${Math.round(totalDuration / level)}ms`);
      
      if (successful.length > 0) {
        const avgTokens = successful.reduce((sum, r) => sum + r.tokens, 0) / successful.length;
        console.log(`  🔢 平均tokens: ${Math.round(avgTokens)}`);
      }
      
    } catch (error) {
      console.log(`  ❌ 并发测试失败: ${error.message}`);
    }
    
    // 等待2秒再进行下一组测试
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 豆包API网络延迟和性能测试');
  console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
  
  try {
    // 测试不同复杂度的请求
    await testRequestComplexity();
    
    // 测试工具调用性能
    await testToolCallPerformance();
    
    // 测试并发请求
    await testConcurrentRequests();
    
    console.log('\n🏁 所有测试完成！');
    
    console.log('\n💡 优化建议:');
    console.log('1. 对于复杂的专家咨询，建议设置45-60秒超时');
    console.log('2. 添加重试机制，最多重试3次');
    console.log('3. 考虑实现请求队列，避免并发过多');
    console.log('4. 添加缓存机制，减少重复请求');
    console.log('5. 实现渐进式超时：简单请求10秒，复杂请求45秒');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { testRequestComplexity, testToolCallPerformance, testConcurrentRequests };
