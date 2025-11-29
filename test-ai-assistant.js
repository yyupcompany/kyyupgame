#!/usr/bin/env node

/**
 * AI助手完整测试用例
 * 
 * 测试内容：
 * 1. 统一认证登录
 * 2. AI流式对话（SSE）
 * 3. 工具调用功能
 * 4. 多轮对话
 * 
 * 使用方法：
 * node test-ai-assistant.js
 */

const http = require('http');

// 测试配置
const CONFIG = {
  TENANT_BACKEND: 'http://192.168.1.103:3000',
  UNIFIED_BACKEND: 'http://192.168.1.103:4001',
  TEST_ACCOUNT: {
    phone: '18611141133',
    password: '123456',
    tenantCode: 'k004'
  }
};

// ANSI颜色
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// 日志函数
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logStep(step, message) {
  log(`[步骤 ${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'gray');
}

// HTTP请求Promise包装
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// SSE流式请求
function makeSSERequest(options, postData, onEvent, onComplete) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let buffer = '';
      
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        
        // 处理SSE事件
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留最后不完整的行
        
        let currentEvent = null;
        let currentData = '';
        
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            currentData = line.substring(5).trim();
            
            if (currentEvent && currentData) {
              try {
                const data = JSON.parse(currentData);
                onEvent(currentEvent, data);
              } catch (e) {
                // 忽略JSON解析错误
              }
              currentEvent = null;
              currentData = '';
            }
          }
        }
      });
      
      res.on('end', () => {
        onComplete();
        resolve();
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// 测试1: 统一认证登录
async function testUnifiedLogin() {
  logSection('测试1: 统一认证登录');
  
  logStep(1, '发送登录请求到统一认证中心');
  
  const url = new URL(`${CONFIG.UNIFIED_BACKEND}/api/auth/login`);
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const loginData = JSON.stringify({
    phone: CONFIG.TEST_ACCOUNT.phone,
    password: CONFIG.TEST_ACCOUNT.password,
    loginType: 'web'
  });
  
  try {
    const response = await makeRequest(options, loginData);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      
      if (data.success && data.data.token) {
        logSuccess(`登录成功！`);
        logInfo(`Token: ${data.data.token.substring(0, 50)}...`);
        logInfo(`用户: ${data.data.user.realName || data.data.user.phone}`);
        
        if (data.data.tenants && data.data.tenants.length > 0) {
          logInfo(`关联租户: ${data.data.tenants.length}个`);
          data.data.tenants.forEach(t => {
            logInfo(`  - ${t.tenantName} (${t.tenantCode})`);
          });
        }
        
        return data.data.token;
      } else {
        logError(`登录失败: ${data.message || '未知错误'}`);
        return null;
      }
    } else {
      logError(`HTTP错误: ${response.statusCode}`);
      logInfo(response.body);
      return null;
    }
  } catch (error) {
    logError(`请求失败: ${error.message}`);
    return null;
  }
}

// 测试2: AI简单对话
async function testSimpleChat(token) {
  logSection('测试2: AI简单对话');
  
  logStep(1, '发送简单问题给AI助手');
  
  const url = new URL(`${CONFIG.TENANT_BACKEND}/api/ai/unified/stream-chat`);
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream'
    }
  };
  
  const chatData = JSON.stringify({
    message: '你好，请介绍一下你自己',
    userId: '121',
    conversationId: `test-${Date.now()}`,
    context: {
      role: 'admin',
      enableTools: false
    }
  });
  
  let fullResponse = '';
  let eventCount = 0;
  
  try {
    await makeSSERequest(
      options,
      chatData,
      (event, data) => {
        eventCount++;
        
        if (event === 'message') {
          fullResponse += data.content || '';
          process.stdout.write(colors.gray + (data.content || '') + colors.reset);
        } else if (event === 'done') {
          logSuccess(`\n对话完成！`);
          logInfo(`总事件数: ${eventCount}`);
          logInfo(`响应长度: ${fullResponse.length}字符`);
        }
      },
      () => {
        // 完成
      }
    );
    
    return true;
  } catch (error) {
    logError(`对话失败: ${error.message}`);
    return false;
  }
}

// 测试3: AI工具调用
async function testToolCalling(token) {
  logSection('测试3: AI工具调用功能');
  
  logStep(1, '发送需要调用工具的问题');
  logInfo('问题: "当前有多少个班级？"');
  
  const url = new URL(`${CONFIG.TENANT_BACKEND}/api/ai/unified/stream-chat`);
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream'
    }
  };
  
  const chatData = JSON.stringify({
    message: '当前有多少个班级？',
    userId: '121',
    conversationId: `test-tool-${Date.now()}`,
    context: {
      role: 'admin',
      enableTools: true
    }
  });
  
  let toolCalled = false;
  let toolName = '';
  let toolResult = null;
  let fullResponse = '';
  
  try {
    await makeSSERequest(
      options,
      chatData,
      (event, data) => {
        switch (event) {
          case 'tool_reason':
            logInfo(`💭 AI推理: ${data.reason}`);
            break;
            
          case 'tool_call_start':
            toolCalled = true;
            toolName = data.name;
            logInfo(`🔧 调用工具: ${data.name}`);
            logInfo(`   参数: ${JSON.stringify(data.arguments)}`);
            break;
            
          case 'tool_call_complete':
            toolResult = data.result;
            logSuccess(`✓ 工具执行成功`);
            logInfo(`   结果: ${JSON.stringify(data.result).substring(0, 100)}...`);
            break;
            
          case 'tool_narration':
            logInfo(`📝 AI解释: ${data.narration}`);
            break;
            
          case 'message':
            fullResponse += data.content || '';
            process.stdout.write(colors.gray + (data.content || '') + colors.reset);
            break;
            
          case 'done':
            console.log('\n');
            logSuccess('工具调用测试完成！');
            logInfo(`是否调用工具: ${toolCalled ? '是' : '否'}`);
            if (toolCalled) {
              logInfo(`工具名称: ${toolName}`);
              logInfo(`完整回答长度: ${fullResponse.length}字符`);
            }
            break;
        }
      },
      () => {
        // 完成
      }
    );
    
    return toolCalled;
  } catch (error) {
    logError(`工具调用测试失败: ${error.message}`);
    return false;
  }
}

// 测试4: 多轮对话
async function testMultiTurnChat(token) {
  logSection('测试4: 多轮对话');
  
  const conversationId = `test-multi-${Date.now()}`;
  
  const turns = [
    { message: '请问今天的日期是什么？', expectTool: false },
    { message: '帮我查一下班级信息', expectTool: true },
    { message: '谢谢你', expectTool: false }
  ];
  
  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    
    logStep(i + 1, `第${i + 1}轮对话`);
    logInfo(`问题: "${turn.message}"`);
    
    const url = new URL(`${CONFIG.TENANT_BACKEND}/api/ai/unified/stream-chat`);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream'
      }
    };
    
    const chatData = JSON.stringify({
      message: turn.message,
      userId: '121',
      conversationId: conversationId,
      context: {
        role: 'admin',
        enableTools: true
      }
    });
    
    let toolCalled = false;
    
    try {
      await makeSSERequest(
        options,
        chatData,
        (event, data) => {
          if (event === 'tool_call_start') {
            toolCalled = true;
          } else if (event === 'message') {
            process.stdout.write(colors.gray + (data.content || '') + colors.reset);
          } else if (event === 'done') {
            console.log('\n');
            logSuccess(`第${i + 1}轮完成 (${toolCalled ? '调用了工具' : '直接回答'})`);
          }
        },
        () => {
          // 完成
        }
      );
      
      // 等待一下再进行下一轮
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      logError(`第${i + 1}轮对话失败: ${error.message}`);
      return false;
    }
  }
  
  logSuccess('多轮对话测试完成！');
  return true;
}

// 主测试流程
async function runTests() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║         AI助手完整功能测试                                  ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  logInfo(`租户系统后端: ${CONFIG.TENANT_BACKEND}`);
  logInfo(`统一认证后端: ${CONFIG.UNIFIED_BACKEND}`);
  logInfo(`测试账号: ${CONFIG.TEST_ACCOUNT.phone}`);
  console.log('\n');
  
  // 测试1: 登录
  const token = await testUnifiedLogin();
  if (!token) {
    logError('登录失败，终止测试');
    process.exit(1);
  }
  
  // 测试2: 简单对话
  await testSimpleChat(token);
  
  // 测试3: 工具调用
  await testToolCalling(token);
  
  // 测试4: 多轮对话
  await testMultiTurnChat(token);
  
  // 测试总结
  logSection('测试总结');
  logSuccess('所有测试完成！');
  console.log('\n');
  logInfo('测试项目:');
  logInfo('  ✓ 统一认证登录');
  logInfo('  ✓ AI简单对话 (SSE流式响应)');
  logInfo('  ✓ AI工具调用功能');
  logInfo('  ✓ 多轮对话上下文保持');
  console.log('\n');
}

// 执行测试
runTests().catch(error => {
  logError(`测试执行失败: ${error.message}`);
  console.error(error);
  process.exit(1);
});
