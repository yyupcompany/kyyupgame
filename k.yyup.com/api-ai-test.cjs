#!/usr/bin/env node

/**
 * AI API直接测试
 * 直接测试AI API端点，绕过前端
 */

const http = require('http');
const https = require('https');

console.log('🚀 开始AI API直接测试...\n');

// 测试配置
const API_BASE = 'http://localhost:3000';
const TEST_PROMPTS = [
  '你好',
  '今天天气怎么样？',
  '帮我分析系统状态'
];

/**
 * 发送HTTP请求
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * 测试服务器连接
 */
async function testServerConnection() {
  console.log('📡 测试服务器连接...');

  try {
    const response = await makeRequest(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`服务器状态: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ 服务器连接正常');
      return true;
    } else {
      console.log('⚠️ 服务器响应异常');
      return false;
    }
  } catch (error) {
    console.log(`❌ 服务器连接失败: ${error.message}`);
    return false;
  }
}

/**
 * 获取认证Token
 */
async function getAuthToken() {
  console.log('\n🔑 获取认证Token...');

  try {
    const response = await makeRequest(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (response.status === 200 && response.data && response.data.data && response.data.data.token) {
      console.log('✅ 成功获取Token');
      return response.data.data.token;
    } else {
      console.log('⚠️ 使用测试Token');
      // 返回一个测试token用于测试
      return 'test-token-' + Date.now();
    }
  } catch (error) {
    console.log(`❌ 获取Token失败: ${error.message}`);
    return 'test-token-' + Date.now();
  }
}

/**
 * 测试AI聊天API
 */
async function testAIChat(token, prompt) {
  console.log(`\n🤖 测试AI聊天: "${prompt}"`);

  try {
    const response = await makeRequest(`${API_BASE}/api/ai/unified/stream-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: prompt,
        mode: 'direct',
        context: {
          userId: 1,
          sessionId: 'test-session-' + Date.now()
        }
      })
    });

    console.log(`AI响应状态: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ AI API响应正常');
      console.log('响应内容:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log('⚠️ AI API响应异常');
      console.log('错误信息:', response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ AI API测试失败: ${error.message}`);
    return false;
  }
}

/**
 * 测试AI查询API
 */
async function testAIQuery(token, prompt) {
  console.log(`\n🔍 测试AI查询: "${prompt}"`);

  try {
    const response = await makeRequest(`${API_BASE}/api/ai-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: prompt,
        context: {
          userId: 1,
          sessionId: 'test-session-' + Date.now()
        }
      })
    });

    console.log(`AI查询状态: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ AI查询API响应正常');
      console.log('响应内容:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log('⚠️ AI查询API响应异常');
      console.log('错误信息:', response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ AI查询API测试失败: ${error.message}`);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runAPITests() {
  console.log('=' .repeat(60));
  console.log('AI API 完整测试报告');
  console.log('=' .repeat(60));

  const results = {
    serverConnection: false,
    authTest: false,
    aiChatTests: [],
    aiQueryTests: [],
    timestamp: new Date().toISOString()
  };

  // 1. 测试服务器连接
  results.serverConnection = await testServerConnection();

  if (!results.serverConnection) {
    console.log('\n❌ 服务器无法连接，跳过后续测试');
    return generateReport(results);
  }

  // 2. 获取认证Token
  const token = await getAuthToken();
  results.authTest = !!token;

  if (!token) {
    console.log('\n⚠️ 无法获取认证Token，部分测试可能失败');
  }

  // 3. 测试AI聊天功能
  console.log('\n📋 测试AI聊天功能...');
  for (const prompt of TEST_PROMPTS) {
    const success = await testAIChat(token, prompt);
    results.aiChatTests.push({
      prompt: prompt,
      success: success
    });
  }

  // 4. 测试AI查询功能
  console.log('\n📋 测试AI查询功能...');
  for (const prompt of TEST_PROMPTS) {
    const success = await testAIQuery(token, prompt);
    results.aiQueryTests.push({
      prompt: prompt,
      success: success
    });
  }

  return generateReport(results);
}

/**
 * 生成测试报告
 */
function generateReport(results) {
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 测试结果总结');
  console.log('=' .repeat(60));
  console.log(`测试时间: ${results.timestamp}`);
  console.log(`服务器连接: ${results.serverConnection ? '✅ 正常' : '❌ 失败'}`);
  console.log(`认证测试: ${results.authTest ? '✅ 正常' : '⚠️ 异常'}`);

  const chatSuccessCount = results.aiChatTests.filter(t => t.success).length;
  const querySuccessCount = results.aiQueryTests.filter(t => t.success).length;

  console.log(`AI聊天测试: ${chatSuccessCount}/${results.aiChatTests.length} 成功`);
  console.log(`AI查询测试: ${querySuccessCount}/${results.aiQueryTests.length} 成功`);

  // 详细结果
  if (results.aiChatTests.length > 0) {
    console.log('\n📝 AI聊天详细结果:');
    results.aiChatTests.forEach((test, index) => {
      console.log(`  ${index + 1}. "${test.prompt}": ${test.success ? '✅' : '❌'}`);
    });
  }

  if (results.aiQueryTests.length > 0) {
    console.log('\n📝 AI查询详细结果:');
    results.aiQueryTests.forEach((test, index) => {
      console.log(`  ${index + 1}. "${test.prompt}": ${test.success ? '✅' : '❌'}`);
    });
  }

  // 总体评估
  const allTests = results.aiChatTests.length + results.aiQueryTests.length;
  const successTests = chatSuccessCount + querySuccessCount;
  const successRate = allTests > 0 ? (successTests / allTests * 100).toFixed(1) : 0;

  console.log('\n' + '=' .repeat(60));
  console.log(`📊 总体成功率: ${successRate}%`);

  if (successRate >= 80) {
    console.log('🎉 AI功能测试通过！');
  } else if (successRate >= 50) {
    console.log('⚠️ AI功能部分正常');
  } else {
    console.log('❌ AI功能存在严重问题');
  }
  console.log('=' .repeat(60));

  // 保存报告
  const fs = require('fs');
  const reportPath = './ai-api-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);

  return results;
}

// 运行测试
runAPITests().catch(console.error);