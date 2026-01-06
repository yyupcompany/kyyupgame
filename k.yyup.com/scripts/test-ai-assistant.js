#!/usr/bin/env node

/**
 * AI助手功能测试脚本
 * 测试智能代理、快速查询、队列显示等核心功能
 */

import axios from 'axios';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:3000';
let authToken = null;

// 创建API客户端
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 登录获取token
async function login() {
  try {
    console.log(chalk.blue('🔐 正在登录获取认证token...'));

    const response = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      // 更新API客户端的认证头
      api.defaults.headers['Authorization'] = `Bearer ${authToken}`;
      console.log(chalk.green('✅ 登录成功'));
      return true;
    } else {
      console.log(chalk.red('❌ 登录失败:', response.data.message));
      return false;
    }
  } catch (error) {
    console.log(chalk.red('❌ 登录错误:', error.message));
    return false;
  }
}

console.log(chalk.blue('🤖 开始AI助手功能测试...\n'));

// 测试用例
const testCases = [
  {
    name: '智能代理 - 创建活动工作流',
    query: '策划一个活动',
    expectedAction: 'create_activity_workflow',
    description: '测试智能代理是否能正确调用创建活动工作流'
  },
  {
    name: '快速查询 - 学生总数',
    query: '学生总数',
    expectedAction: 'count_students',
    description: '测试快速查询功能是否正常工作'
  },
  {
    name: '快速查询 - 今日活动',
    query: '今日活动',
    expectedAction: 'get_today_activities',
    description: '测试活动查询功能'
  },
  {
    name: '快速查询 - 教师总数',
    query: '教师总数',
    expectedAction: 'count_teachers',
    description: '测试教师统计功能'
  },
  {
    name: '导航功能 - 学生列表',
    query: '学生列表',
    expectedAction: 'navigate_to_student_list',
    description: '测试页面导航功能'
  }
];

async function testAIQuery(testCase) {
  try {
    console.log(chalk.yellow(`📝 测试: ${testCase.name}`));
    console.log(chalk.gray(`   查询: "${testCase.query}"`));
    
    const response = await api.post('/api/ai-assistant-optimized/query', {
      query: testCase.query,
      conversationId: `test-${Date.now()}`,
      userId: 1,
      enableTools: true
    });

    if (response.data.success) {
      const { action, response: aiResponse, level } = response.data.data;
      
      console.log(chalk.green(`   ✅ 成功`));
      console.log(chalk.gray(`   动作: ${action}`));
      console.log(chalk.gray(`   级别: ${level}`));
      console.log(chalk.gray(`   响应: ${aiResponse?.substring(0, 50)}...`));
      
      // 验证是否匹配预期动作
      if (action === testCase.expectedAction) {
        console.log(chalk.green(`   🎯 动作匹配正确`));
      } else {
        console.log(chalk.red(`   ❌ 动作不匹配，期望: ${testCase.expectedAction}, 实际: ${action}`));
      }
      
      return true;
    } else {
      console.log(chalk.red(`   ❌ 失败: ${response.data.message}`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ 错误: ${error.message}`));
    return false;
  }
}

async function testUnifiedIntelligence() {
  try {
    console.log(chalk.yellow(`🧠 测试统一智能服务 - 复杂任务处理`));
    
    const response = await api.post('/api/ai/unified/unified-chat', {
      message: '创建一个完整的六一儿童节活动策划方案，包括活动流程、物料准备、人员安排等',
      userId: 1,
      conversationId: 'test-' + Date.now(),
      enableTools: true,
      userRole: 'admin'
    });

    if (response.data.success) {
      console.log(chalk.green(`   ✅ 统一智能服务响应成功`));
      console.log(chalk.gray(`   响应长度: ${response.data.response?.length || 0} 字符`));
      console.log(chalk.gray(`   Token使用: ${response.data.tokensUsed || 0}`));
      
      // 检查是否有工具执行
      if (response.data.data?.tool_executions?.length > 0) {
        console.log(chalk.green(`   🔧 工具执行: ${response.data.data.tool_executions.length} 个`));
      }
      
      // 检查是否有TodoList
      if (response.data.data?.todo_list?.length > 0) {
        console.log(chalk.green(`   ✅ TodoList创建: ${response.data.data.todo_list.length} 个任务`));
      }
      
      return true;
    } else {
      console.log(chalk.red(`   ❌ 失败: ${response.data.message}`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ 错误: ${error.message}`));
    return false;
  }
}

async function testHealthCheck() {
  try {
    console.log(chalk.yellow(`🏥 测试服务健康状态`));
    
    const response = await api.get('/api/ai-assistant-optimized/health');
    
    if (response.data.success) {
      console.log(chalk.green(`   ✅ AI服务健康状态正常`));
      return true;
    } else {
      console.log(chalk.red(`   ❌ AI服务健康检查失败`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`   ❌ 无法连接到AI服务: ${error.message}`));
    return false;
  }
}

async function runAllTests() {
  let passedTests = 0;
  let totalTests = 0;

  // 0. 先登录
  if (!(await login())) {
    console.log(chalk.red('❌ 无法登录，测试终止'));
    return;
  }

  console.log(''); // 空行分隔

  // 1. 健康检查
  totalTests++;
  if (await testHealthCheck()) {
    passedTests++;
  }
  
  console.log(''); // 空行分隔
  
  // 2. 快速查询测试
  for (const testCase of testCases) {
    totalTests++;
    if (await testAIQuery(testCase)) {
      passedTests++;
    }
    console.log(''); // 每个测试后空行
  }
  
  // 3. 统一智能服务测试
  totalTests++;
  if (await testUnifiedIntelligence()) {
    passedTests++;
  }
  
  // 生成测试报告
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold('🤖 AI助手功能测试报告'));
  console.log('='.repeat(60));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过: ${chalk.green(passedTests)}`);
  console.log(`失败: ${chalk.red(totalTests - passedTests)}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  if (passedTests === totalTests) {
    console.log(chalk.green('🎉 所有测试通过！AI助手功能正常'));
  } else {
    console.log(chalk.yellow('⚠️ 部分测试失败，请检查相关功能'));
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error(chalk.red('测试执行失败:'), error);
  process.exit(1);
});
