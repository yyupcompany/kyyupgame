#!/usr/bin/env node

/**
 * render_component工具调用行为验证测试
 * 验证修复后的AI是否只在明确要求时才调用render_component
 */

import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:3000';
const SOCKET_URL = 'http://localhost:3000';

// 测试用例配置 - 基于院长/老百姓的实际说话方式
const testCases = [
  {
    name: '普通查询测试 - 不应调用render_component',
    query: '查询一下我们幼儿园有多少个孩子、多少个老师',
    expectRenderComponent: false,
    description: '用户只是查询统计数据，应该使用Markdown回复'
  },
  {
    name: '明确报表需求 - 应该调用render_component',
    query: '我要一个学生报表，显示所有学生的信息',
    expectRenderComponent: true,
    description: '院长明确要求报表，应该调用render_component'
  },
  {
    name: '明确表格需求 - 应该调用render_component',
    query: '给我做一个学生表格，显示所有学生',
    expectRenderComponent: true,
    description: '院长明确要求表格展示，应该调用render_component'
  },
  {
    name: '明确图表需求 - 应该调用render_component',
    query: '我要一个图表显示学生年龄分布',
    expectRenderComponent: true,
    description: '院长明确要求图表，应该调用render_component'
  },
  {
    name: '明确任务列表需求 - 应该调用render_component',
    query: '给我显示待办任务列表',
    expectRenderComponent: true,
    description: '院长明确要求任务列表，应该调用render_component'
  }
];

class RenderComponentTest {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.events = [];
  }

  // 记录测试事件
  logEvent(message, data = null) {
    const event = {
      timestamp: new Date().toISOString(),
      message,
      data
    };
    this.events.push(event);
    console.log(`[${event.timestamp}] ${message}`, data || '');
  }

  // 运行单个测试
  async runTest(testCase) {
    this.logEvent(`\n🧪 开始测试: ${testCase.name}`);
    this.logEvent(`📝 查询内容: ${testCase.query}`);
    this.logEvent(`🎯 期望结果: ${testCase.expectRenderComponent ? '应该调用' : '不应该调用'} render_component`);

    this.currentTest = testCase;
    this.events = [];

    try {
      // 1. 创建测试会话
      const conversationId = `test-render-component-${Date.now()}`;
      this.logEvent(`📞 创建测试会话: ${conversationId}`);

      // 2. 发送查询请求
      const response = await this.sendQuery(testCase.query, conversationId);

      // 3. 分析结果
      const analysis = this.analyzeResponse(response, testCase);

      this.testResults.push({
        testCase: testCase.name,
        query: testCase.query,
        expectRenderComponent: testCase.expectRenderComponent,
        actual: analysis,
        success: analysis.passed,
        events: [...this.events]
      });

      this.logEvent(`${analysis.passed ? '✅ 测试通过' : '❌ 测试失败'}`);
      if (!analysis.passed) {
        this.logEvent(`失败原因: ${analysis.reason}`);
      }

    } catch (error) {
      this.logEvent(`❌ 测试执行失败: ${error.message}`);
      this.testResults.push({
        testCase: testCase.name,
        query: testCase.query,
        error: error.message,
        success: false,
        events: [...this.events]
      });
    }
  }

  // 发送查询请求
  async sendQuery(query, conversationId) {
    const startTime = Date.now();

    try {
      const response = await axios.post(`${API_BASE}/api/ai/unified/stream-chat-single`, {
        message: query,
        userId: '121',
        conversationId: conversationId,
        mode: 'agent',
        context: {
          enableTools: true,
          role: 'admin'
        }
      }, {
        timeout: 120000, // 2分钟超时
        responseType: 'stream',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjI1NDU5NjQsImV4cCI6MTc2MjYzMjM2NH0.xnK6bgrf_ETXOtPo5h7FJQNL8yXrlB05PBRmIhdrHiI',
          'Content-Type': 'application/json'
        }
      });

      this.logEvent('📡 已发送请求，开始接收流式响应');

      // 收集流式响应
      const chunks = [];
      response.data.on('data', (chunk) => {
        const chunkStr = chunk.toString();
        chunks.push(chunkStr);

        // 解析SSE事件
        this.parseSSEEvents(chunkStr);
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          const duration = Date.now() - startTime;
          this.logEvent(`🏁 响应接收完成，耗时: ${duration}ms`);
          resolve({ chunks, duration });
        });

        response.data.on('error', (error) => {
          reject(error);
        });
      });

    } catch (error) {
      this.logEvent(`❌ 请求失败: ${error.message}`);
      throw error;
    }
  }

  // 解析SSE事件
  parseSSEEvents(chunkStr) {
    const lines = chunkStr.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          this.handleSSEEvent(data);
        } catch (error) {
          // 忽略解析错误
        }
      }
    }
  }

  // 处理SSE事件
  handleSSEEvent(data) {
    switch (data.type) {
      case 'start':
        this.logEvent('🚀 对话开始');
        break;

      case 'tool_call_start':
        this.logEvent(`🔧 工具调用开始: ${data.toolName}`, data);
        if (data.toolName === 'render_component') {
          this.logEvent('⚠️ 检测到render_component工具调用！');
        }
        break;

      case 'tool_call_complete':
        this.logEvent(`✅ 工具调用完成: ${data.toolName}`, data);
        break;

      case 'final_answer':
        this.logEvent('📝 最终答案生成');
        break;

      case 'complete':
        this.logEvent('🏁 对话完成');
        break;

      default:
        if (data.type && data.type.startsWith('tool_')) {
          this.logEvent(`🔧 工具事件: ${data.type}`, data);
        }
    }
  }

  // 分析响应结果
  analyzeResponse(response, testCase) {
    const renderComponentCalls = this.events.filter(
      event => event.message.includes('render_component')
    );

    const actualCalled = renderComponentCalls.length > 0;
    const expected = testCase.expectRenderComponent;
    const passed = actualCalled === expected;

    return {
      passed,
      expected,
      actualCalled,
      renderComponentEvents: renderComponentCalls,
      totalEvents: this.events.length,
      reason: passed ? null :
        actualCalled && !expected ? '不应该调用render_component但调用了' :
        !actualCalled && expected ? '应该调用render_component但没有调用' :
        '未知原因'
    };
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🎯 render_component工具调用行为验证测试开始');
    console.log('=' .repeat(60));

    for (const testCase of testCases) {
      await this.runTest(testCase);
      // 等待一下再进行下一个测试
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.printSummary();
  }

  // 打印测试总结
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试结果总结');
    console.log('='.repeat(60));

    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;

    console.log(`✅ 通过: ${passed}/${total}`);
    console.log(`❌ 失败: ${total - passed}/${total}`);
    console.log(`📈 通过率: ${((passed / total) * 100).toFixed(1)}%`);

    console.log('\n📋 详细结果:');
    this.testResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.testCase}`);
      if (result.success) {
        console.log(`   ✅ 通过`);
      } else {
        console.log(`   ❌ 失败 - ${result.reason || result.error}`);
      }
      console.log(`   查询: ${result.query}`);

      if (result.actual) {
        console.log(`   实际: ${result.actual.actualCalled ? '调用了' : '未调用'} render_component`);
        console.log(`   期望: ${result.actual.expected ? '应该调用' : '不应该调用'} render_component`);
      }
    });

    // 验证修复效果
    console.log('\n🎯 修复效果验证:');
    const criticalTests = this.testResults.filter(r =>
      r.testCase.includes('普通查询') || r.testCase.includes('模糊表格')
    );

    const criticalPassed = criticalTests.filter(r => r.success).length;
    console.log(`关键测试通过: ${criticalPassed}/${criticalTests.length}`);

    if (criticalPassed === criticalTests.length) {
      console.log('🎉 修复成功！AI不再过度调用render_component工具');
    } else {
      console.log('⚠️ 修复未完全成功，仍存在问题');
    }
  }
}

// 运行测试
async function main() {
  const tester = new RenderComponentTest();

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default RenderComponentTest;