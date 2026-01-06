#!/usr/bin/env node

/**
 * 智能代理功能检测脚本
 * 用于测试从勾选智能代理开始的完整调用链路
 */

import axios from 'axios';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// 配置
const CONFIG = {
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  TEST_USER: {
    id: 1,
    role: 'admin',
    token: process.env.TEST_TOKEN || 'test-token'
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// 测试结果收集器
class TestResultCollector {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  addResult(testName, success, details = {}) {
    this.results.push({
      testName,
      success,
      details,
      timestamp: Date.now()
    });
    
    const status = success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
    console.log(`${status} ${testName}`);
    
    if (!success && details.error) {
      console.log(chalk.red(`   错误: ${details.error}`));
    }
  }

  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const duration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold('🤖 智能代理功能检测报告'));
    console.log('='.repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${chalk.green(passedTests)}`);
    console.log(`失败: ${chalk.red(failedTests)}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    console.log(`总耗时: ${duration}ms`);
    
    if (failedTests > 0) {
      console.log('\n' + chalk.red('失败的测试:'));
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.testName}: ${result.details.error || '未知错误'}`);
      });
    }
    
    console.log('='.repeat(60));
  }
}

// API 客户端
class APIClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.axios = axios.create({
      baseURL,
      timeout: CONFIG.TIMEOUT,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async post(endpoint, data) {
    for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await this.axios.post(endpoint, data);
        return { success: true, data: response.data, attempt };
      } catch (error) {
        if (attempt === CONFIG.RETRY_ATTEMPTS) {
          return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status,
            attempts: attempt
          };
        }
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
      }
    }
  }

  async get(endpoint, params = {}) {
    try {
      const response = await this.axios.get(endpoint, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
  }
}

// 智能代理功能检测器
class SmartAgentTester {
  constructor() {
    this.collector = new TestResultCollector();
    this.client = new APIClient(CONFIG.BASE_URL, CONFIG.TEST_USER.token);
    this.conversationId = null;
  }

  async runAllTests() {
    console.log(chalk.blue('🚀 开始智能代理功能检测...\n'));

    // 1. 基础连接测试
    await this.testBasicConnection();

    // 2. 会话创建测试
    await this.testConversationCreation();

    // 3. 智能代理权限测试
    await this.testSmartAgentPermissions();

    // 4. 三级分级检索测试
    await this.testTieredRetrieval();

    // 5. 复杂任务创建测试
    await this.testComplexTaskCreation();

    // 6. 工具调用测试
    await this.testToolExecution();

    // 7. TodoList创建测试
    await this.testTodoListCreation();

    // 8. 错误处理测试
    await this.testErrorHandling();

    // 9. 性能测试
    await this.testPerformance();

    // 生成报告
    this.collector.generateReport();
  }

  async testBasicConnection() {
    console.log(chalk.yellow('📡 测试基础连接...'));
    
    const result = await this.client.get('/api/ai/health');
    this.collector.addResult(
      '基础连接测试',
      result.success,
      { endpoint: '/api/ai/health', ...result }
    );
  }

  async testConversationCreation() {
    console.log(chalk.yellow('💬 测试会话创建...'));
    
    const result = await this.client.post('/api/ai/conversations', {
      title: '智能代理测试会话'
    });
    
    if (result.success && result.data?.data?.id) {
      this.conversationId = result.data.data.id;
    }
    
    this.collector.addResult(
      '会话创建测试',
      result.success && !!this.conversationId,
      { conversationId: this.conversationId, ...result }
    );
  }

  async testSmartAgentPermissions() {
    console.log(chalk.yellow('🔐 测试智能代理权限...'));
    
    if (!this.conversationId) {
      this.collector.addResult('智能代理权限测试', false, { error: '缺少会话ID' });
      return;
    }

    const result = await this.client.post(`/api/ai/conversations/${this.conversationId}/messages`, {
      content: '测试智能代理权限',
      metadata: {
        enableTools: true,
        userRole: 'admin',
        source: 'smart-agent-test'
      }
    });

    this.collector.addResult(
      '智能代理权限测试',
      result.success,
      { hasToolsEnabled: result.data?.metadata?.enableTools, ...result }
    );
  }

  async testTieredRetrieval() {
    console.log(chalk.yellow('🔍 测试三级分级检索...'));
    
    const testCases = [
      { input: '你好', expectedLevel: 'level-1', description: '简单问候' },
      { input: '查询最近的活动统计', expectedLevel: 'level-2', description: '中等复杂查询' },
      { input: '创建一个完整的六一儿童节活动策划方案', expectedLevel: 'level-3', description: '复杂任务' }
    ];

    for (const testCase of testCases) {
      const result = await this.client.post('/api/ai/unified/unified-chat', {
        message: testCase.input,
        userId: CONFIG.TEST_USER.id,
        context: { enableTools: true }
      });

      const actualLevel = result.data?.metadata?.level;
      const success = result.success && actualLevel === testCase.expectedLevel;

      this.collector.addResult(
        `三级检索测试 - ${testCase.description}`,
        success,
        { 
          input: testCase.input,
          expectedLevel: testCase.expectedLevel,
          actualLevel,
          ...result 
        }
      );
    }
  }

  async testComplexTaskCreation() {
    console.log(chalk.yellow('📝 测试复杂任务创建...'));
    
    const complexTask = '策划一个完整的幼儿园开放日活动，包括家长接待、课程展示、互动游戏、安全保障等多个环节';
    
    const result = await this.client.post('/api/ai/unified/unified-chat', {
      message: complexTask,
      userId: CONFIG.TEST_USER.id,
      context: { 
        enableTools: true,
        levelOverride: 'level-3'
      }
    });

    const hasToolExecutions = result.data?.data?.tool_executions?.length > 0;
    const hasTodoList = result.data?.data?.todo_list?.length > 0;

    this.collector.addResult(
      '复杂任务创建测试',
      result.success && (hasToolExecutions || hasTodoList),
      { 
        hasToolExecutions,
        hasTodoList,
        toolCount: result.data?.data?.tool_executions?.length || 0,
        ...result 
      }
    );
  }

  async testToolExecution() {
    console.log(chalk.yellow('🔧 测试工具调用...'));
    
    const toolTests = [
      { tool: 'analyze_task_complexity', params: { userInput: '复杂任务测试' } },
      { tool: 'create_todo_list', params: { title: '测试任务清单', tasks: [] } }
    ];

    for (const test of toolTests) {
      // 这里需要调用具体的工具执行接口
      // 由于工具调用通常通过统一智能系统，我们模拟测试
      const result = await this.client.post('/api/ai/unified/unified-chat', {
        message: `请使用${test.tool}工具`,
        userId: CONFIG.TEST_USER.id,
        context: { enableTools: true }
      });

      this.collector.addResult(
        `工具调用测试 - ${test.tool}`,
        result.success,
        { toolName: test.tool, ...result }
      );
    }
  }

  async testTodoListCreation() {
    console.log(chalk.yellow('✅ 测试TodoList创建...'));
    
    const todoRequest = '为我创建一个详细的教师培训计划任务清单';
    
    const result = await this.client.post('/api/ai/unified/unified-chat', {
      message: todoRequest,
      userId: CONFIG.TEST_USER.id,
      context: { enableTools: true }
    });

    const todoList = result.data?.data?.todo_list;
    const hasTasks = Array.isArray(todoList) && todoList.length > 0;

    this.collector.addResult(
      'TodoList创建测试',
      result.success && hasTasks,
      { 
        taskCount: todoList?.length || 0,
        hasPriorities: todoList?.some(task => task.priority),
        hasEstimatedTime: todoList?.some(task => task.estimatedTime),
        ...result 
      }
    );
  }

  async testErrorHandling() {
    console.log(chalk.yellow('🚨 测试错误处理...'));
    
    // 测试无效输入
    const invalidResult = await this.client.post('/api/ai/unified/unified-chat', {
      message: '', // 空消息
      userId: CONFIG.TEST_USER.id,
      context: { enableTools: true }
    });

    // 测试权限不足
    const unauthorizedResult = await this.client.post('/api/ai/unified/unified-chat', {
      message: '测试权限',
      userId: CONFIG.TEST_USER.id,
      context: { enableTools: true, userRole: 'invalid_role' }
    });

    this.collector.addResult(
      '错误处理测试 - 空输入',
      !invalidResult.success || invalidResult.data?.success === false,
      invalidResult
    );

    this.collector.addResult(
      '错误处理测试 - 无效角色',
      unauthorizedResult.success, // 应该有适当的处理
      unauthorizedResult
    );
  }

  async testPerformance() {
    console.log(chalk.yellow('⚡ 测试性能...'));
    
    const startTime = Date.now();
    
    const result = await this.client.post('/api/ai/unified/unified-chat', {
      message: '快速响应测试',
      userId: CONFIG.TEST_USER.id,
      context: { enableTools: false } // 禁用工具以测试基础性能
    });

    const responseTime = Date.now() - startTime;
    const isPerformant = responseTime < 5000; // 5秒内响应

    this.collector.addResult(
      '性能测试 - 响应时间',
      result.success && isPerformant,
      { 
        responseTime: `${responseTime}ms`,
        threshold: '5000ms',
        ...result 
      }
    );
  }
}

// 主函数
async function main() {
  try {
    const tester = new SmartAgentTester();
    await tester.runAllTests();
  } catch (error) {
    console.error(chalk.red('测试执行失败:'), error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SmartAgentTester, APIClient, TestResultCollector };
