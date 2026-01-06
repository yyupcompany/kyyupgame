/**
 * 测试统一智能服务重构
 * 验证简单查询和复杂查询的不同处理流程
 */

const unifiedIntelligenceService = require('./server/src/services/ai-operator/unified-intelligence.service.ts');

async function testUnifiedIntelligence() {
  console.log('🧪 开始测试统一智能服务重构...\n');

  // 模拟请求对象
  const createMockRequest = (content, enableTools = true) => ({
    content,
    enableTools,
    userId: 'test-user',
    sessionId: 'test-session',
    role: 'admin',
    currentPage: 'dashboard'
  });

  // 模拟响应对象
  const createMockResponse = () => {
    const events = [];
    return {
      writeHead: () => {},
      write: (data) => {
        if (data.includes('data: ') && !data.includes('[DONE]')) {
          try {
            const jsonStr = data.replace(/^data: /, '').replace(/\n\n$/, '');
            const eventData = JSON.parse(jsonStr);
            events.push(eventData);
            console.log(`📡 收到事件: ${eventData.event}`);
            if (eventData.message) console.log(`   💬 ${eventData.message}`);
          } catch (error) {
            console.log(`📡 原始数据: ${data.trim()}`);
          }
        }
      },
      end: () => {
        console.log('\n🏁 SSE连接结束');
        console.log(`📊 总共收到 ${events.length} 个事件`);
        console.log(`📋 事件序列: ${events.map(e => e.event).join(' -> ')}`);
      }
    };
  };

  // 测试用例
  const testCases = [
    {
      name: '简单查询（应该只返回3个基本事件）',
      request: createMockRequest('你好'),
      expectedEvents: ['thinking_start', 'final_answer', 'complete']
    },
    {
      name: '复杂查询（应该触发完整的7个事件序列）',
      request: createMockRequest('查询所有学生信息并生成统计报告'),
      expectedEvents: ['thinking_start', 'tool_intent', 'tool_call_start', 'tool_call_complete', 'tools_complete', 'final_answer', 'complete']
    },
    {
      name: '中等复杂度查询',
      request: createMockRequest('显示最近的活动数据'),
      expectedEvents: ['thinking_start', 'final_answer', 'complete'] // 可能触发工具，但不一定
    }
  ];

  // 获取服务状态
  console.log('📋 服务状态:');
  const status = unifiedIntelligenceService.unifiedIntelligenceService.getServiceStatus();
  console.log(`   版本: ${status.version}`);
  console.log(`   核心功能: ${status.features.join(', ')}`);
  console.log(`   集成服务: ${status.integrations.length}个`);
  console.log(`   支持事件: ${status.supportedEvents.length}个\n`);

  // 执行测试用例
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 测试用例 ${i + 1}: ${testCase.name}`);
    console.log(`📝 输入: "${testCase.request.content}"`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      await unifiedIntelligenceService.unifiedIntelligenceService.processUserRequestStreamSingleRound(
        testCase.request,
        createMockResponse()
      );
    } catch (error) {
      console.error(`❌ 测试用例 ${i + 1} 执行失败:`, error);
    }

    // 等待一下再执行下一个测试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 所有测试用例执行完成！');
}

// 运行测试
if (require.main === module) {
  testUnifiedIntelligence().catch(console.error);
}

module.exports = { testUnifiedIntelligence };