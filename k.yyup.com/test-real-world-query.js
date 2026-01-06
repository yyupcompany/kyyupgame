#!/usr/bin/env node

/**
 * 真实世界查询测试
 * 测试院长实际的说话方式是否能正确触发render_component工具调用
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// 真实世界的院长查询测试用例
const realWorldQueries = [
  {
    name: '查询班级数量（纯数据查询）',
    query: '检查我有多少班级',
    expectRenderComponent: false,
    description: '院长只是查询数量，应该用Markdown回复'
  },
  {
    name: '查询班级列表（明确要求列表显示）',
    query: '检查我有多少班级，用列表显示出来',
    expectRenderComponent: true,
    description: '院长明确要求"用列表显示"，应该调用render_component'
  },
  {
    name: '查询学生报表（明确要求报表）',
    query: '给我一个学生报表',
    expectRenderComponent: true,
    description: '院长明确要求报表，应该调用render_component'
  },
  {
    name: '查询教师数量（纯数据查询）',
    query: '查询有多少个老师',
    expectRenderComponent: false,
    description: '院长只是查询数量，应该用Markdown回复'
  },
  {
    name: '查询教师表格（明确要求表格）',
    query: '我要一个教师表格显示',
    expectRenderComponent: true,
    description: '院长明确要求表格，应该调用render_component'
  },
  {
    name: '查询活动图表（明确要求图表）',
    query: '做一个活动统计图表',
    expectRenderComponent: true,
    description: '院长明确要求图表，应该调用render_component'
  },
  {
    name: '查询任务列表（明确要求列表）',
    query: '显示我的待办任务列表',
    expectRenderComponent: true,
    description: '院长明确要求任务列表，应该调用render_component'
  },
  {
    name: '查询幼儿园情况（一般查询）',
    query: '我们幼儿园的基本情况',
    expectRenderComponent: false,
    description: '一般性查询，应该用Markdown回复'
  }
];

class RealWorldQueryTest {
  constructor() {
    this.testResults = [];
    this.authToken = null;
  }

  // 获取认证令牌
  async getAuthToken() {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });

      this.authToken = response.data.token;
      console.log('✅ 获取认证令牌成功');
      return true;
    } catch (error) {
      console.error('❌ 获取认证令牌失败:', error.message);
      return false;
    }
  }

  // 发送查询并监控工具调用
  async sendQuery(query, testName) {
    try {
      console.log(`\n🚀 开始查询: ${query}`);

      const response = await axios.post(`${API_BASE}/api/ai/unified/stream-chat`, {
        message: query,
        userId: '121',
        conversationId: `test-real-world-${Date.now()}`,
        mode: 'agent',
        context: {
          enableTools: true,
          role: 'admin'
        }
      }, {
        timeout: 60000,
        responseType: 'stream',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      return new Promise((resolve, reject) => {
        let toolCallEvents = [];
        let finalAnswer = '';
        let responseText = '';

        response.data.on('data', (chunk) => {
          const chunkStr = chunk.toString();
          responseText += chunkStr;

          // 解析SSE事件
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));

                // 记录工具调用事件
                if (data.type === 'tool_call_start') {
                  toolCallEvents.push({
                    tool: data.toolName,
                    status: 'start',
                    timestamp: new Date().toISOString()
                  });
                  console.log(`🔧 工具调用开始: ${data.toolName}`);
                } else if (data.type === 'tool_call_complete') {
                  toolCallEvents.push({
                    tool: data.toolName,
                    status: 'complete',
                    timestamp: new Date().toISOString()
                  });
                  console.log(`✅ 工具调用完成: ${data.toolName}`);
                } else if (data.type === 'final_answer') {
                  finalAnswer = data.content || '';
                  console.log(`📝 最终答案生成`);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve({
            toolCallEvents,
            finalAnswer,
            responseText,
            success: true
          });
        });

        response.data.on('error', (error) => {
          reject(error);
        });
      });

    } catch (error) {
      console.error(`❌ 查询失败: ${error.message}`);
      return {
        toolCallEvents: [],
        finalAnswer: '',
        responseText: '',
        success: false,
        error: error.message
      };
    }
  }

  // 运行单个测试
  async runTest(testCase) {
    console.log(`\n🧪 开始测试: ${testCase.name}`);
    console.log(`📝 查询内容: ${testCase.query}`);
    console.log(`🎯 期望结果: ${testCase.expectRenderComponent ? '应该调用' : '不应该调用'} render_component`);

    try {
      // 发送查询
      const result = await this.sendQuery(testCase.query, testCase.name);

      if (!result.success) {
        this.testResults.push({
          testCase: testCase.name,
          query: testCase.query,
          expectRenderComponent: testCase.expectRenderComponent,
          error: result.error,
          success: false
        });
        console.log(`❌ 测试失败: ${result.error}`);
        return;
      }

      // 分析工具调用结果
      const renderComponentCalls = result.toolCallEvents.filter(
        event => event.tool === 'render_component'
      );

      const actualCalled = renderComponentCalls.length > 0;
      const passed = actualCalled === testCase.expectRenderComponent;

      this.testResults.push({
        testCase: testCase.name,
        query: testCase.query,
        expectRenderComponent: testCase.expectRenderComponent,
        actual: {
          renderComponentCalled: actualCalled,
          toolCallEvents: result.toolCallEvents,
          finalAnswer: result.finalAnswer.substring(0, 200) + '...'
        },
        success: passed,
        description: testCase.description
      });

      console.log(`${passed ? '✅ 测试通过' : '❌ 测试失败'}`);
      console.log(`🔧 工具调用次数: ${result.toolCallEvents.length}`);
      console.log(`📊 render_component调用次数: ${renderComponentCalls.length}`);

      if (result.toolCallEvents.length > 0) {
        console.log(`🔧 调用的工具: ${result.toolCallEvents.map(e => e.tool).join(', ')}`);
      }

      if (!passed) {
        const reason = actualCalled && !testCase.expectRenderComponent
          ? '不应该调用render_component但调用了'
          : '应该调用render_component但没有调用';
        console.log(`💡 失败原因: ${reason}`);
      }

    } catch (error) {
      console.error(`❌ 测试执行失败: ${error.message}`);
      this.testResults.push({
        testCase: testCase.name,
        query: testCase.query,
        error: error.message,
        success: false
      });
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🎯 真实世界查询测试开始');
    console.log('=' .repeat(60));

    // 获取认证令牌
    const authSuccess = await this.getAuthToken();
    if (!authSuccess) {
      console.error('❌ 无法获取认证令牌，测试终止');
      return;
    }

    // 逐个运行测试
    for (let i = 0; i < realWorldQueries.length; i++) {
      const testCase = realWorldQueries[i];
      await this.runTest(testCase);

      // 测试间隔，避免过快请求
      if (i < realWorldQueries.length - 1) {
        console.log('\n⏳ 等待3秒后进行下一个测试...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    this.printSummary();
  }

  // 打印测试总结
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 真实世界查询测试结果总结');
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
        console.log(`   ❌ 失败 - ${result.error || '工具调用行为不符合预期'}`);
      }
      console.log(`   查询: ${result.query}`);
      console.log(`   期望: ${result.expectRenderComponent ? '调用render_component' : '不调用render_component'}`);

      if (result.actual) {
        console.log(`   实际: ${result.actual.renderComponentCalled ? '调用了render_component' : '未调用render_component'}`);
        if (result.actual.toolCallEvents.length > 0) {
          console.log(`   工具调用: ${result.actual.toolCallEvents.map(e => e.tool).join(', ')}`);
        }
      }
    });

    // 验证效果
    console.log('\n🎯 效果验证:');

    const componentRequests = this.testResults.filter(r => r.expectRenderComponent === true);
    const componentRequestsPassed = componentRequests.filter(r => r.success).length;

    const dataQueries = this.testResults.filter(r => r.expectRenderComponent === false);
    const dataQueriesPassed = dataQueries.filter(r => r.success).length;

    console.log(`可视化需求测试通过: ${componentRequestsPassed}/${componentRequests.length}`);
    console.log(`数据查询测试通过: ${dataQueriesPassed}/${dataQueries.length}`);

    if (componentRequestsPassed === componentRequests.length &&
        dataQueriesPassed === dataQueries.length) {
      console.log('🎉 完美！系统能正确理解院长的实际需求');
    } else {
      console.log('⚠️ 系统还需要进一步优化');
    }

    // 显示关键测试案例
    console.log('\n🔍 关键测试案例分析:');
    const keyTests = this.testResults.filter(r =>
      r.query.includes('用列表显示') ||
      r.query.includes('报表') ||
      r.query.includes('表格')
    );

    keyTests.forEach(test => {
      console.log(`\n📝 "${test.query}"`);
      console.log(`   结果: ${test.success ? '✅' : '❌'} ${test.actual?.renderComponentCalled ? '调用了' : '未调用'}render_component`);
    });
  }
}

// 运行测试
async function main() {
  const tester = new RealWorldQueryTest();

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

export default RealWorldQueryTest;