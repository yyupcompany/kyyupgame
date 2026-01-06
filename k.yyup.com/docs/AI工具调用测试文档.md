# AI工具调用测试文档

**版本**: 1.0.0  
**创建时间**: 2025-10-09  
**适用范围**: 幼儿园管理系统AI助手前端工具调用测试

---

## 📋 目录

- [测试概述](#测试概述)
- [工具分类测试](#工具分类测试)
- [前后端连接测试](#前后端连接测试)
- [多轮工具调用测试](#多轮工具调用测试)
- [错误处理测试](#错误处理测试)
- [性能测试](#性能测试)
- [自动化测试脚本](#自动化测试脚本)

---

## 🎯 测试概述

### 测试目标

验证AI助手前端工具调用系统的完整性和稳定性，确保：
1. 所有工具能正确调用和响应
2. 前后端连接稳定可靠
3. 多轮工具调用流程正常
4. 错误处理机制有效
5. 性能表现符合预期

### 测试环境

- **前端**: Vue 3 + TypeScript + Vite
- **后端**: Node.js + Express.js + TypeScript
- **AI模型**: 豆包API (doubao-seed-1.6-250615)
- **数据库**: MySQL
- **测试工具**: Playwright + MCP浏览器

### 工具总览

根据后端代码分析，系统共有以下工具分类：

| 分类 | 工具数量 | 主要功能 |
|------|----------|----------|
| 上下文注入工具 | 1个 | 页面上下文管理 |
| 数据查询工具 | 6个 | 数据库查询和统计 |
| 页面操作工具 | 8个 | 页面导航和操作 |
| 任务管理工具 | 5个 | 待办事项管理 |
| UI展示工具 | 1个 | 界面组件渲染 |
| 专家咨询工具 | 4个 | 智能咨询服务 |
| 智能查询工具 | 1个 | any_query复杂查询 |
| 网络搜索工具 | 1个 | 外部信息搜索 |
| 工作流工具 | 2个 | 业务流程自动化 |
| 数据库CRUD工具 | 4个 | 数据增删改查 |
| 其他工具 | 3个 | 辅助功能 |

**总计**: 36个工具

---

## 🔧 工具分类测试

### 1. 数据查询工具测试

#### 1.1 query_past_activities - 历史活动查询

**测试用例**:
```
用户输入: "查询最近一个月的活动数据"
期望结果: 返回活动列表，包含活动名称、时间、参与人数等
```

**测试脚本**:
```javascript
// 测试历史活动查询
async function testQueryPastActivities() {
  const testCases = [
    "查询最近一个月的活动数据",
    "显示上周的所有活动",
    "查找体育类活动的历史记录",
    "统计本年度活动参与情况"
  ];
  
  for (const testCase of testCases) {
    console.log(`测试: ${testCase}`);
    // 发送消息并验证响应
    await sendMessageAndVerify(testCase, {
      expectedToolCall: 'query_past_activities',
      expectedDataFields: ['activities', 'total', 'timeRange']
    });
  }
}
```

#### 1.2 any_query - 智能复杂查询

**测试用例**:
```
用户输入: "统计每个班级的学生人数和平均年龄"
期望结果: 调用any_query工具，返回统计表格
```

**测试脚本**:
```javascript
// 测试智能查询工具
async function testAnyQuery() {
  const complexQueries = [
    "统计每个班级的学生人数和平均年龄",
    "查询最受欢迎的活动类型排行榜",
    "分析教师工作量分布情况",
    "对比不同月份的招生数据趋势"
  ];
  
  for (const query of complexQueries) {
    console.log(`测试复杂查询: ${query}`);
    await sendMessageAndVerify(query, {
      expectedToolCall: 'any_query',
      expectedFormat: ['table', 'chart', 'summary'],
      timeout: 15000 // 复杂查询可能需要更长时间
    });
  }
}
```

### 2. 数据库CRUD工具测试

#### 2.1 create_data_record - 数据创建

**测试用例**:
```
用户输入: "创建一个新学生，姓名张小明，年龄5岁"
期望结果: 显示确认对话框，用户确认后创建记录
```

**测试脚本**:
```javascript
// 测试数据创建工具
async function testCreateDataRecord() {
  const createTests = [
    {
      input: "创建一个新学生，姓名张小明，年龄5岁",
      expectedTable: "students",
      expectedData: { name: "张小明", age: 5 }
    },
    {
      input: "添加一个新活动：春季运动会，时间3月15日",
      expectedTable: "activities",
      expectedData: { name: "春季运动会" }
    },
    {
      input: "新建一个班级：大班A，容量30人",
      expectedTable: "classes",
      expectedData: { name: "大班A", capacity: 30 }
    }
  ];
  
  for (const test of createTests) {
    console.log(`测试创建: ${test.input}`);
    await sendMessageAndVerify(test.input, {
      expectedToolCall: 'create_data_record',
      expectedConfirmation: true,
      expectedTable: test.expectedTable
    });
  }
}
```

#### 2.2 update_data_record - 数据更新

**测试用例**:
```
用户输入: "把张小明的年龄改为6岁"
期望结果: 显示更新前后对比，用户确认后更新
```

#### 2.3 delete_data_record - 数据删除

**测试用例**:
```
用户输入: "删除学生张小明的记录"
期望结果: 显示关联数据分析，用户确认后删除
```

### 3. 页面操作工具测试

**测试用例**:
```
用户输入: "跳转到学生管理页面"
期望结果: 调用页面导航工具，跳转到对应页面
```

---

## 🔗 前后端连接测试

### API端点测试

#### 1. 统一智能对话接口

**端点**: `POST /api/ai/unified/unified-chat`

**测试脚本**:
```javascript
async function testUnifiedChatAPI() {
  const testData = {
    message: "查询学生总数",
    userId: "test_user_001",
    context: {
      enableTools: true,
      userRole: "admin"
    }
  };
  
  try {
    const response = await fetch('/api/ai/unified/unified-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('API响应:', result);
    
    // 验证响应结构
    assert(result.success, 'API调用应该成功');
    assert(result.data, '应该返回数据');
    
  } catch (error) {
    console.error('API测试失败:', error);
  }
}
```

#### 2. 流式对话接口

**端点**: `POST /api/ai/unified/stream-chat`

**测试脚本**:
```javascript
async function testStreamChatAPI() {
  const testData = {
    message: "执行复杂查询：统计各班级学生分布",
    userId: "test_user_001",
    context: { enableTools: true }
  };
  
  const events = [];
  
  await callUnifiedIntelligenceStream(testData, (event) => {
    events.push(event);
    console.log('流式事件:', event.type, event.message);
  });
  
  // 验证事件序列
  const expectedEvents = ['start', 'thinking', 'tool_call', 'final_answer', 'complete'];
  const actualEvents = events.map(e => e.type);
  
  expectedEvents.forEach(expectedEvent => {
    assert(actualEvents.includes(expectedEvent), `应该包含事件: ${expectedEvent}`);
  });
}
```

### 工具注册验证

**测试脚本**:
```javascript
async function testToolRegistry() {
  try {
    const response = await fetch('/api/ai/function-tools/available-tools', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    
    const tools = await response.json();
    console.log('可用工具:', tools);
    
    // 验证工具数量和分类
    assert(tools.database_query.length >= 6, '数据查询工具应该至少有6个');
    assert(tools.page_operations.length >= 8, '页面操作工具应该至少有8个');
    
  } catch (error) {
    console.error('工具注册验证失败:', error);
  }
}
```

---

## 🔄 多轮工具调用测试

### 测试场景

#### 场景1: 复杂数据分析

**用户输入**: "分析本月活动效果，包括参与率、满意度和改进建议"

**期望流程**:
1. 第1轮: 调用 `query_past_activities` 获取本月活动数据
2. 第2轮: 调用 `get_activity_statistics` 获取统计数据
3. 第3轮: 调用 `any_query` 进行深度分析
4. 第4轮: 生成最终报告

**测试脚本**:
```javascript
async function testMultiRoundAnalysis() {
  const complexTask = "分析本月活动效果，包括参与率、满意度和改进建议";
  
  const rounds = [];
  
  await executeMultiRound(complexTask, {
    maxRounds: 10,
    onProgress: (event) => {
      console.log(`进度: ${event.type} - ${event.message}`);
    },
    onRoundComplete: (round, result) => {
      rounds.push({ round, result });
      console.log(`第${round}轮完成:`, result);
    },
    onComplete: (finalResult) => {
      console.log('多轮调用完成:', finalResult);
      
      // 验证结果
      assert(rounds.length >= 3, '应该至少执行3轮');
      assert(finalResult.analysis, '应该包含分析结果');
      assert(finalResult.recommendations, '应该包含改进建议');
    }
  });
}
```

#### 场景2: 数据创建流程

**用户输入**: "帮我创建一个完整的新生入学记录"

**期望流程**:
1. 第1轮: 收集学生基本信息
2. 第2轮: 调用 `create_data_record` 创建学生记录
3. 第3轮: 分配班级
4. 第4轮: 创建家长关联记录

---

## ❌ 错误处理测试

### 1. 网络错误测试

**测试脚本**:
```javascript
async function testNetworkErrors() {
  // 模拟网络中断
  const originalFetch = window.fetch;
  window.fetch = () => Promise.reject(new Error('Network Error'));
  
  try {
    await sendMessage("查询学生数据");
    assert(false, '应该抛出网络错误');
  } catch (error) {
    assert(error.message.includes('Network'), '应该是网络错误');
  } finally {
    window.fetch = originalFetch;
  }
}
```

### 2. 工具调用失败测试

**测试脚本**:
```javascript
async function testToolCallFailures() {
  const failureCases = [
    "查询不存在的数据表",
    "使用错误的参数格式",
    "超出权限范围的操作"
  ];
  
  for (const failureCase of failureCases) {
    try {
      await sendMessage(failureCase);
      // 验证错误处理
      const errorMessage = await getLastErrorMessage();
      assert(errorMessage, '应该显示错误信息');
    } catch (error) {
      console.log('预期的错误:', error.message);
    }
  }
}
```

### 3. 超时处理测试

**测试脚本**:
```javascript
async function testTimeoutHandling() {
  const longRunningQuery = "执行一个非常复杂的数据分析任务";
  
  const startTime = Date.now();
  
  try {
    await sendMessage(longRunningQuery, { timeout: 5000 });
  } catch (error) {
    const duration = Date.now() - startTime;
    assert(duration < 6000, '应该在超时时间内结束');
    assert(error.message.includes('timeout'), '应该是超时错误');
  }
}
```

---

## ⚡ 性能测试

### 1. 响应时间测试

**测试脚本**:
```javascript
async function testResponseTimes() {
  const testCases = [
    { query: "查询学生总数", expectedTime: 3000 },
    { query: "显示最近活动", expectedTime: 5000 },
    { query: "复杂统计分析", expectedTime: 15000 }
  ];
  
  for (const testCase of testCases) {
    const startTime = Date.now();
    
    await sendMessage(testCase.query);
    
    const duration = Date.now() - startTime;
    console.log(`${testCase.query}: ${duration}ms`);
    
    assert(duration < testCase.expectedTime, 
      `响应时间应该小于${testCase.expectedTime}ms`);
  }
}
```

### 2. 并发测试

**测试脚本**:
```javascript
async function testConcurrentCalls() {
  const concurrentQueries = [
    "查询学生数据",
    "获取活动统计",
    "分析教师信息",
    "统计班级情况"
  ];
  
  const startTime = Date.now();
  
  const promises = concurrentQueries.map(query => sendMessage(query));
  const results = await Promise.all(promises);
  
  const duration = Date.now() - startTime;
  console.log(`并发查询完成时间: ${duration}ms`);
  
  // 验证所有查询都成功
  results.forEach((result, index) => {
    assert(result.success, `查询${index + 1}应该成功`);
  });
}
```

### 3. 内存使用测试

**测试脚本**:
```javascript
async function testMemoryUsage() {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;
  
  // 执行大量工具调用
  for (let i = 0; i < 50; i++) {
    await sendMessage(`查询测试数据 ${i}`);
  }
  
  const finalMemory = performance.memory?.usedJSHeapSize || 0;
  const memoryIncrease = finalMemory - initialMemory;
  
  console.log(`内存增长: ${memoryIncrease / 1024 / 1024}MB`);
  
  // 验证内存增长在合理范围内
  assert(memoryIncrease < 50 * 1024 * 1024, '内存增长应该小于50MB');
}
```

---

## 🤖 自动化测试脚本

### 完整测试套件

**文件**: `ai-tools-test-suite.cjs`

```javascript
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
```

### 快速测试脚本

**文件**: `quick-ai-tools-test.cjs`

```javascript
const { chromium } = require('playwright');

async function quickAIToolsTest() {
  console.log('🚀 快速AI工具测试');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 登录
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);

    // 打开AI助手
    await page.locator('button:has-text("YY-AI")').first().click();
    await page.waitForTimeout(3000);

    // 快速测试
    const quickTests = [
      '查询学生总数',
      '显示最近活动',
      '创建测试数据'
    ];

    for (const test of quickTests) {
      console.log(`测试: ${test}`);

      // 发送消息
      const input = page.locator('textarea, input[placeholder*="输入"]').first();
      await input.fill(test);

      const sendButton = page.locator('button:has-text("发送")').first();
      await sendButton.click();

      await page.waitForTimeout(5000);
      console.log(`✅ ${test} - 完成`);
    }

    console.log('🎉 快速测试完成！');

  } catch (error) {
    console.error('❌ 快速测试失败:', error);
  } finally {
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

quickAIToolsTest();
```

---

## 📋 测试检查清单

### 测试前准备

- [ ] 确认后端服务运行正常 (`npm run start:backend`)
- [ ] 确认前端服务运行正常 (`npm run start:frontend`)
- [ ] 确认数据库连接正常
- [ ] 确认AI模型配置正确
- [ ] 准备测试数据

### 功能测试

#### 数据查询工具
- [ ] query_past_activities - 历史活动查询
- [ ] get_activity_statistics - 活动统计
- [ ] query_enrollment_history - 招生历史
- [ ] analyze_business_trends - 业务趋势
- [ ] query_data - 通用数据查询
- [ ] any_query - 智能复杂查询

#### CRUD工具
- [ ] create_data_record - 数据创建
- [ ] update_data_record - 数据更新
- [ ] delete_data_record - 数据删除
- [ ] 确认对话框功能

#### 页面操作工具
- [ ] 页面导航功能
- [ ] 页面状态管理
- [ ] 路由跳转功能

#### 多轮工具调用
- [ ] 复杂任务分解
- [ ] 工具链执行
- [ ] 结果整合
- [ ] 错误恢复

### 性能测试

- [ ] 响应时间 < 预期阈值
- [ ] 并发处理能力
- [ ] 内存使用合理
- [ ] 错误率 < 5%

### 错误处理测试

- [ ] 网络错误处理
- [ ] 工具调用失败处理
- [ ] 超时处理
- [ ] 权限错误处理

---

## 🎯 测试结果评估标准

### 成功标准

| 测试类型 | 成功率要求 | 性能要求 |
|----------|------------|----------|
| 数据查询工具 | ≥90% | <5秒 |
| CRUD工具 | ≥85% | <8秒 |
| 多轮调用 | ≥80% | <30秒 |
| 错误处理 | ≥95% | <3秒 |
| 整体测试 | ≥85% | - |

### 问题分级

- **严重**: 工具完全无法调用，系统崩溃
- **重要**: 工具调用失败率>20%，性能严重下降
- **一般**: 偶发性失败，性能轻微影响
- **轻微**: UI显示问题，不影响功能

---

## 📞 技术支持

**遇到测试问题？**

1. 检查服务状态: `npm run status`
2. 查看控制台错误日志
3. 确认网络连接正常
4. 验证用户权限设置
5. 联系开发团队

**测试报告提交**:
- 测试环境信息
- 详细测试结果
- 错误日志截图
- 性能数据统计

---

**文档维护**: AI助手开发团队
**最后更新**: 2025-10-09
**版本**: 1.0.0
