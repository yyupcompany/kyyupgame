#!/usr/bin/env node

/**
 * 检查中心API端到端测试脚本
 *
 * 测试所有检查中心相关的API端点
 */

import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:3000/api';
const TEST_TOKEN = 'test-token'; // 需要替换为实际的JWT token

// 测试结果统计
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};

// 测试结果详情
const results = [];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 测试辅助函数
async function testAPI(name, method, url, data = null, expectedStatus = 200) {
  stats.total++;
  
  try {
    logInfo(`测试: ${name}`);
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      stats.passed++;
      logSuccess(`${name} - 通过`);
      results.push({
        name,
        status: 'PASSED',
        method,
        url,
        responseStatus: response.status,
        responseData: response.data
      });
      return response.data;
    } else {
      stats.failed++;
      logError(`${name} - 失败: 期望状态码 ${expectedStatus}, 实际 ${response.status}`);
      results.push({
        name,
        status: 'FAILED',
        method,
        url,
        expectedStatus,
        actualStatus: response.status,
        error: `状态码不匹配`
      });
      return null;
    }
  } catch (error) {
    stats.failed++;
    logError(`${name} - 失败: ${error.message}`);
    results.push({
      name,
      status: 'FAILED',
      method,
      url,
      error: error.message,
      details: error.response?.data
    });
    return null;
  }
}

// 主测试函数
async function runTests() {
  log('\n========================================', 'blue');
  log('检查中心API端到端测试', 'blue');
  log('========================================\n', 'blue');
  
  // 1. 文档模板API测试
  log('\n📋 1. 文档模板API测试', 'yellow');
  log('----------------------------------------', 'yellow');
  
  await testAPI(
    '获取文档模板列表',
    'GET',
    '/document-templates?page=1&pageSize=10'
  );
  
  await testAPI(
    '搜索文档模板',
    'GET',
    '/document-templates/search?keyword=检查&limit=5'
  );
  
  await testAPI(
    '获取模板分类',
    'GET',
    '/document-templates/categories'
  );
  
  await testAPI(
    '获取推荐模板',
    'GET',
    '/document-templates/recommend?limit=5'
  );
  
  // 2. 文档实例API测试
  log('\n📄 2. 文档实例API测试', 'yellow');
  log('----------------------------------------', 'yellow');
  
  await testAPI(
    '获取文档实例列表',
    'GET',
    '/document-instances?page=1&pageSize=10'
  );
  
  // 3. 文档统计API测试
  log('\n📊 3. 文档统计API测试', 'yellow');
  log('----------------------------------------', 'yellow');
  
  await testAPI(
    '获取统计概览',
    'GET',
    '/document-statistics/overview'
  );
  
  await testAPI(
    '获取趋势数据',
    'GET',
    '/document-statistics/trends?period=week'
  );
  
  await testAPI(
    '获取模板排行',
    'GET',
    '/document-statistics/template-ranking?limit=10'
  );
  
  await testAPI(
    '获取完成率统计',
    'GET',
    '/document-statistics/completion-rate'
  );
  
  // 4. 检查类型API测试
  log('\n🔍 4. 检查类型API测试', 'yellow');
  log('----------------------------------------', 'yellow');
  
  await testAPI(
    '获取检查类型列表',
    'GET',
    '/inspection-types?page=1&pageSize=10'
  );
  
  // 5. 检查计划API测试
  log('\n📅 5. 检查计划API测试', 'yellow');
  log('----------------------------------------', 'yellow');
  
  await testAPI(
    '获取检查计划列表',
    'GET',
    '/inspection-plans?page=1&pageSize=10'
  );
  
  // 6. 检查任务API测试
  log('\n✅ 6. 检查任务API测试', 'yellow');
  log('----------------------------------------', 'yellow');
  
  await testAPI(
    '获取检查任务列表',
    'GET',
    '/inspection-tasks?page=1&pageSize=10'
  );
  
  // 打印测试结果
  printTestResults();
}

function printTestResults() {
  log('\n========================================', 'blue');
  log('测试结果汇总', 'blue');
  log('========================================\n', 'blue');
  
  log(`总测试数: ${stats.total}`, 'cyan');
  log(`通过: ${stats.passed}`, 'green');
  log(`失败: ${stats.failed}`, 'red');
  log(`跳过: ${stats.skipped}`, 'yellow');
  
  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
  log(`\n通过率: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
  
  // 打印失败的测试
  const failedTests = results.filter(r => r.status === 'FAILED');
  if (failedTests.length > 0) {
    log('\n失败的测试:', 'red');
    failedTests.forEach((test, index) => {
      log(`\n${index + 1}. ${test.name}`, 'red');
      log(`   方法: ${test.method}`, 'reset');
      log(`   URL: ${test.url}`, 'reset');
      log(`   错误: ${test.error}`, 'reset');
      if (test.details) {
        log(`   详情: ${JSON.stringify(test.details, null, 2)}`, 'reset');
      }
    });
  }
  
  log('\n========================================\n', 'blue');
  
  // 退出码
  process.exit(stats.failed > 0 ? 1 : 0);
}

// 运行测试
runTests().catch(error => {
  logError(`测试执行失败: ${error.message}`);
  console.error(error);
  process.exit(1);
});

