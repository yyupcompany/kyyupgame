const { chromium } = require('playwright');

class AIToolsTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 启动AI工具调用测试套件');
    
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500
    });
    
    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await context.newPage();
    
    // 监听控制台消息
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 控制台错误: ${msg.text()}`);
      }
    });
    
    // 登录系统
    await this.login();
  }

  async login() {
    console.log('🔐 登录系统...');
    
    await this.page.goto('http://localhost:5173');
    await this.page.waitForTimeout(2000);
    
    await this.page.locator('input[type="text"]').first().fill('admin');
    await this.page.locator('input[type="password"]').first().fill('admin123');
    await this.page.locator('button[type="submit"]').first().click();
    
    await this.page.waitForTimeout(5000);
    console.log('✅ 登录成功');
  }

  async openAIAssistant() {
    console.log('🤖 打开AI助手...');
    
    const aiButton = this.page.locator('button:has-text("YY-AI")').first();
    await aiButton.click();
    await this.page.waitForTimeout(3000);
    
    console.log('✅ AI助手已打开');
  }

  async sendMessage(message, options = {}) {
    console.log(`📝 发送消息: "${message}"`);
    
    // 查找输入框
    const inputSelector = '.message-input, .chat-input, textarea[placeholder*="输入"], input[placeholder*="输入"]';
    const input = this.page.locator(inputSelector).first();
    
    await input.fill(message);
    
    // 查找发送按钮
    const sendSelector = 'button:has-text("发送"), button[type="submit"], .send-button';
    const sendButton = this.page.locator(sendSelector).first();
    
    await sendButton.click();
    
    // 等待响应
    const timeout = options.timeout || 30000;
    await this.page.waitForTimeout(Math.min(timeout, 5000));
    
    return await this.getLastResponse();
  }

  async getLastResponse() {
    // 获取最后一条AI响应
    const responseSelector = '.ai-message, .assistant-message, .message.assistant';
    const responses = await this.page.locator(responseSelector).all();
    
    if (responses.length > 0) {
      const lastResponse = responses[responses.length - 1];
      const content = await lastResponse.textContent();
      return { success: true, content };
    }
    
    return { success: false, content: null };
  }

  async testDataQueryTools() {
    console.log('\n📊 测试数据查询工具...');
    
    const testCases = [
      {
        name: '历史活动查询',
        input: '查询最近一个月的活动数据',
        expectedTool: 'query_past_activities'
      },
      {
        name: '学生统计查询',
        input: '统计每个班级的学生人数',
        expectedTool: 'any_query'
      },
      {
        name: '活动统计分析',
        input: '分析本月活动参与情况',
        expectedTool: 'get_activity_statistics'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        console.log(`\n🧪 测试: ${testCase.name}`);
        
        const response = await this.sendMessage(testCase.input);
        
        const result = {
          testName: testCase.name,
          input: testCase.input,
          success: response.success,
          hasContent: !!response.content,
          contentLength: response.content?.length || 0,
          timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (response.success) {
          console.log(`✅ ${testCase.name} - 成功`);
        } else {
          console.log(`❌ ${testCase.name} - 失败`);
        }
        
        await this.page.waitForTimeout(2000);
        
      } catch (error) {
        console.log(`❌ ${testCase.name} - 异常: ${error.message}`);
        this.testResults.push({
          testName: testCase.name,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async testCRUDTools() {
    console.log('\n🔧 测试CRUD工具...');
    
    const crudTests = [
      {
        name: '数据创建测试',
        input: '创建一个测试学生，姓名测试小明，年龄5岁',
        expectedTool: 'create_data_record',
        expectConfirmation: true
      },
      {
        name: '数据更新测试',
        input: '更新学生信息，把年龄改为6岁',
        expectedTool: 'update_data_record',
        expectConfirmation: true
      },
      {
        name: '数据查询测试',
        input: '查询刚才创建的学生信息',
        expectedTool: 'any_query'
      }
    ];
    
    for (const test of crudTests) {
      try {
        console.log(`\n🧪 测试: ${test.name}`);
        
        const response = await this.sendMessage(test.input, { timeout: 15000 });
        
        // 如果期望确认对话框
        if (test.expectConfirmation) {
          await this.page.waitForTimeout(3000);
          
          // 查找确认按钮
          const confirmButton = this.page.locator('button:has-text("确认"), button:has-text("确定"), .confirm-button').first();
          const confirmExists = await confirmButton.count() > 0;
          
          if (confirmExists) {
            console.log('📋 发现确认对话框，点击确认...');
            await confirmButton.click();
            await this.page.waitForTimeout(2000);
          }
        }
        
        const result = {
          testName: test.name,
          input: test.input,
          success: response.success,
          hasConfirmation: test.expectConfirmation,
          timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        console.log(`${response.success ? '✅' : '❌'} ${test.name}`);
        
      } catch (error) {
        console.log(`❌ ${test.name} - 异常: ${error.message}`);
      }
    }
  }

  async testMultiRoundCalling() {
    console.log('\n🔄 测试多轮工具调用...');
    
    const complexTask = '分析本月活动效果，包括参与率、满意度，并给出改进建议';
    
    try {
      console.log(`🧪 测试复杂任务: ${complexTask}`);
      
      const startTime = Date.now();
      const response = await this.sendMessage(complexTask, { timeout: 60000 });
      const duration = Date.now() - startTime;
      
      const result = {
        testName: '多轮工具调用',
        input: complexTask,
        success: response.success,
        duration: duration,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      
      console.log(`${response.success ? '✅' : '❌'} 多轮调用测试 (耗时: ${duration}ms)`);
      
    } catch (error) {
      console.log(`❌ 多轮调用测试异常: ${error.message}`);
    }
  }

  async testErrorHandling() {
    console.log('\n❌ 测试错误处理...');
    
    const errorTests = [
      {
        name: '无效查询测试',
        input: '查询不存在的数据表xyz123',
        expectError: true
      },
      {
        name: '权限测试',
        input: '删除所有学生数据',
        expectError: true
      },
      {
        name: '格式错误测试',
        input: '创建学生：无效格式数据',
        expectError: true
      }
    ];
    
    for (const test of errorTests) {
      try {
        console.log(`🧪 测试: ${test.name}`);
        
        const response = await this.sendMessage(test.input);
        
        // 检查是否有错误信息
        const hasError = response.content?.includes('错误') || 
                        response.content?.includes('失败') ||
                        response.content?.includes('无法') ||
                        !response.success;
        
        const result = {
          testName: test.name,
          input: test.input,
          expectError: test.expectError,
          actualError: hasError,
          success: test.expectError === hasError,
          timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        console.log(`${result.success ? '✅' : '❌'} ${test.name}`);
        
      } catch (error) {
        console.log(`❌ ${test.name} - 异常: ${error.message}`);
      }
    }
  }

  async testPerformance() {
    console.log('\n⚡ 测试性能...');
    
    const performanceTests = [
      { query: '查询学生总数', expectedTime: 5000 },
      { query: '显示最近活动', expectedTime: 8000 },
      { query: '复杂统计分析', expectedTime: 15000 }
    ];
    
    for (const test of performanceTests) {
      try {
        console.log(`🧪 性能测试: ${test.query}`);
        
        const startTime = Date.now();
        const response = await this.sendMessage(test.query);
        const duration = Date.now() - startTime;
        
        const withinExpected = duration <= test.expectedTime;
        
        const result = {
          testName: `性能测试-${test.query}`,
          duration: duration,
          expectedTime: test.expectedTime,
          withinExpected: withinExpected,
          success: response.success && withinExpected,
          timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        console.log(`${withinExpected ? '✅' : '⚠️'} ${test.query}: ${duration}ms (期望: <${test.expectedTime}ms)`);
        
      } catch (error) {
        console.log(`❌ 性能测试异常: ${error.message}`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 生成测试报告...');
    
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const successRate = Math.round((successfulTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 AI工具调用测试报告');
    console.log('='.repeat(60));
    console.log(`📊 总测试数: ${totalTests}`);
    console.log(`✅ 成功测试: ${successfulTests}`);
    console.log(`❌ 失败测试: ${totalTests - successfulTests}`);
    console.log(`📈 成功率: ${successRate}%`);
    console.log('='.repeat(60));
    
    return {
      totalTests,
      successfulTests,
      successRate,
      results: this.testResults
    };
  }

  async cleanup() {
    console.log('\n🧹 清理测试环境...');
    
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('✅ 测试环境清理完成');
  }

  async runAllTests() {
    try {
      await this.setup();
      await this.openAIAssistant();
      
      // 执行所有测试
      await this.testDataQueryTools();
      await this.testCRUDTools();
      await this.testMultiRoundCalling();
      await this.testErrorHandling();
      await this.testPerformance();
      
      // 生成报告
      const report = this.generateReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ 测试套件执行失败:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 执行测试
async function runAIToolsTest() {
  const testSuite = new AIToolsTestSuite();
  
  try {
    const report = await testSuite.runAllTests();
    
    console.log('\n🎉 测试完成！');
    console.log(`总体成功率: ${report.successRate}%`);
    
    if (report.successRate >= 80) {
      console.log('✅ 测试通过！AI工具调用系统运行正常');
    } else {
      console.log('⚠️ 测试发现问题，需要进一步检查');
    }
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAIToolsTest();
}

module.exports = { AIToolsTestSuite };
