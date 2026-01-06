// 使用内置的fetch (Node.js 18+) 或者降级处理
let fetch;
try {
  fetch = globalThis.fetch;
  if (!fetch) {
    // 如果没有内置fetch，尝试导入node-fetch
    fetch = require('node-fetch');
  }
} catch (error) {
  console.error('❌ 无法加载fetch，请确保Node.js版本>=18或安装node-fetch');
  process.exit(1);
}

class APIToolsTestSuite {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.token = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 启动API工具调用测试套件');
    
    // 登录获取token
    await this.login();
  }

  async login() {
    console.log('🔐 登录获取认证token...');
    
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.data?.token) {
        this.token = result.data.token;
        console.log('✅ 登录成功，获取到认证token');
      } else {
        throw new Error('登录失败: ' + (result.message || '未知错误'));
      }
      
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      throw error;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, finalOptions);
      const result = await response.json();
      
      return {
        success: response.ok,
        status: response.status,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testUnifiedChatAPI() {
    console.log('\n📡 测试统一智能对话API...');
    
    const testCases = [
      {
        name: '基础查询测试',
        message: '查询学生总数',
        expectedKeywords: ['学生', '总数', '统计']
      },
      {
        name: '复杂查询测试',
        message: '统计每个班级的学生人数和平均年龄',
        expectedKeywords: ['班级', '学生', '人数', '年龄']
      },
      {
        name: '活动查询测试',
        message: '查询最近一个月的活动数据',
        expectedKeywords: ['活动', '数据', '最近']
      }
    ];
    
    for (const testCase of testCases) {
      try {
        console.log(`\n🧪 测试: ${testCase.name}`);
        console.log(`📝 消息: "${testCase.message}"`);
        
        const startTime = Date.now();
        
        const response = await this.makeRequest('/ai/unified/unified-chat', {
          method: 'POST',
          body: JSON.stringify({
            message: testCase.message,
            userId: 'test_user_001',
            context: {
              enableTools: true,
              userRole: 'admin'
            }
          })
        });
        
        const duration = Date.now() - startTime;
        
        const result = {
          testName: testCase.name,
          message: testCase.message,
          success: response.success,
          status: response.status,
          duration: duration,
          hasData: !!response.data,
          timestamp: new Date().toISOString()
        };
        
        if (response.success && response.data) {
          // 检查响应内容
          const content = JSON.stringify(response.data).toLowerCase();
          const hasExpectedContent = testCase.expectedKeywords.some(keyword => 
            content.includes(keyword.toLowerCase())
          );
          
          result.hasExpectedContent = hasExpectedContent;
          result.responseLength = JSON.stringify(response.data).length;
          
          console.log(`✅ ${testCase.name} - 成功`);
          console.log(`   响应时间: ${duration}ms`);
          console.log(`   响应长度: ${result.responseLength}字符`);
          console.log(`   包含期望内容: ${hasExpectedContent ? '✅' : '❌'}`);
        } else {
          console.log(`❌ ${testCase.name} - 失败`);
          console.log(`   状态码: ${response.status}`);
          console.log(`   错误: ${response.error || '未知错误'}`);
        }
        
        this.testResults.push(result);
        
        // 等待一下再进行下一个测试
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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

  async testStreamChatAPI() {
    console.log('\n🌊 测试流式对话API...');
    
    // 注意：这里简化了流式测试，实际应该使用SSE
    const testMessage = '执行复杂查询：统计各班级学生分布';
    
    try {
      console.log(`📝 流式消息: "${testMessage}"`);
      
      const startTime = Date.now();
      
      const response = await this.makeRequest('/ai/unified/stream-chat', {
        method: 'POST',
        body: JSON.stringify({
          message: testMessage,
          userId: 'test_user_001',
          context: { enableTools: true }
        })
      });
      
      const duration = Date.now() - startTime;
      
      const result = {
        testName: '流式对话测试',
        message: testMessage,
        success: response.success,
        duration: duration,
        timestamp: new Date().toISOString()
      };
      
      if (response.success) {
        console.log(`✅ 流式对话测试 - 成功`);
        console.log(`   响应时间: ${duration}ms`);
      } else {
        console.log(`❌ 流式对话测试 - 失败`);
        console.log(`   错误: ${response.error}`);
      }
      
      this.testResults.push(result);
      
    } catch (error) {
      console.log(`❌ 流式对话测试 - 异常: ${error.message}`);
    }
  }

  async testToolRegistry() {
    console.log('\n🔧 测试工具注册API...');
    
    try {
      const response = await this.makeRequest('/ai/function-tools/available-tools');
      
      if (response.success && response.data) {
        const tools = response.data;
        
        console.log('✅ 工具注册API - 成功');
        console.log(`   可用工具分类: ${Object.keys(tools).length}个`);
        
        // 统计各类工具数量
        Object.entries(tools).forEach(([category, toolList]) => {
          if (Array.isArray(toolList)) {
            console.log(`   - ${category}: ${toolList.length}个工具`);
          }
        });
        
        this.testResults.push({
          testName: '工具注册测试',
          success: true,
          toolCategories: Object.keys(tools).length,
          timestamp: new Date().toISOString()
        });
        
      } else {
        console.log('❌ 工具注册API - 失败');
        console.log(`   错误: ${response.error}`);
        
        this.testResults.push({
          testName: '工具注册测试',
          success: false,
          error: response.error,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.log(`❌ 工具注册测试 - 异常: ${error.message}`);
    }
  }

  async testSystemStatus() {
    console.log('\n📊 测试系统状态API...');
    
    const statusEndpoints = [
      { name: '统一智能系统状态', endpoint: '/ai/unified/status' },
      { name: '统一智能系统能力', endpoint: '/ai/unified/capabilities' }
    ];
    
    for (const test of statusEndpoints) {
      try {
        const response = await this.makeRequest(test.endpoint);
        
        const result = {
          testName: test.name,
          endpoint: test.endpoint,
          success: response.success,
          status: response.status,
          timestamp: new Date().toISOString()
        };
        
        if (response.success) {
          console.log(`✅ ${test.name} - 成功`);
        } else {
          console.log(`❌ ${test.name} - 失败 (状态码: ${response.status})`);
        }
        
        this.testResults.push(result);
        
      } catch (error) {
        console.log(`❌ ${test.name} - 异常: ${error.message}`);
      }
    }
  }

  async testErrorHandling() {
    console.log('\n❌ 测试错误处理...');
    
    const errorTests = [
      {
        name: '无效消息测试',
        endpoint: '/ai/unified/unified-chat',
        data: { message: '', userId: 'test' },
        expectError: true
      },
      {
        name: '无权限测试',
        endpoint: '/ai/unified/unified-chat',
        data: { message: '删除所有数据', userId: 'guest' },
        expectError: true
      }
    ];
    
    for (const test of errorTests) {
      try {
        const response = await this.makeRequest(test.endpoint, {
          method: 'POST',
          body: JSON.stringify(test.data)
        });
        
        const hasError = !response.success || response.status >= 400;
        const testPassed = test.expectError === hasError;
        
        const result = {
          testName: test.name,
          expectError: test.expectError,
          actualError: hasError,
          success: testPassed,
          timestamp: new Date().toISOString()
        };
        
        console.log(`${testPassed ? '✅' : '❌'} ${test.name}`);
        console.log(`   期望错误: ${test.expectError}, 实际错误: ${hasError}`);
        
        this.testResults.push(result);
        
      } catch (error) {
        console.log(`❌ ${test.name} - 异常: ${error.message}`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 生成API测试报告...');
    
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const successRate = Math.round((successfulTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 API工具调用测试报告');
    console.log('='.repeat(60));
    console.log(`📊 总测试数: ${totalTests}`);
    console.log(`✅ 成功测试: ${successfulTests}`);
    console.log(`❌ 失败测试: ${totalTests - successfulTests}`);
    console.log(`📈 成功率: ${successRate}%`);
    console.log('='.repeat(60));
    
    // 详细结果
    console.log('\n📋 详细测试结果:');
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${index + 1}. ${status} ${result.testName}${duration}`);
      
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });
    
    // 性能统计
    const performanceResults = this.testResults.filter(r => r.duration);
    if (performanceResults.length > 0) {
      console.log('\n⚡ 性能统计:');
      const avgDuration = Math.round(
        performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length
      );
      console.log(`平均响应时间: ${avgDuration}ms`);
      
      const maxDuration = Math.max(...performanceResults.map(r => r.duration));
      const minDuration = Math.min(...performanceResults.map(r => r.duration));
      console.log(`最长响应时间: ${maxDuration}ms`);
      console.log(`最短响应时间: ${minDuration}ms`);
    }
    
    return {
      totalTests,
      successfulTests,
      successRate,
      results: this.testResults
    };
  }

  async runAllTests() {
    try {
      await this.setup();
      
      // 执行所有API测试
      await this.testUnifiedChatAPI();
      await this.testStreamChatAPI();
      await this.testToolRegistry();
      await this.testSystemStatus();
      await this.testErrorHandling();
      
      // 生成报告
      const report = this.generateReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ API测试套件执行失败:', error);
      throw error;
    }
  }
}

// 执行测试
async function runAPIToolsTest() {
  const testSuite = new APIToolsTestSuite();
  
  try {
    const report = await testSuite.runAllTests();
    
    console.log('\n🎉 API测试完成！');
    console.log(`总体成功率: ${report.successRate}%`);
    
    if (report.successRate >= 80) {
      console.log('✅ API测试通过！后端AI工具调用系统运行正常');
    } else {
      console.log('⚠️ API测试发现问题，需要进一步检查');
    }
    
  } catch (error) {
    console.error('❌ API测试执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAPIToolsTest();
}

module.exports = { APIToolsTestSuite };
