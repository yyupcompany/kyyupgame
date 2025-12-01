/**
 * AI助手综合测试脚本
 * 测试直接沟通和CRUD工具调用
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  TENANT_BACKEND: 'http://192.168.1.103:3000',
  UNIFIED_BACKEND: 'http://192.168.1.103:4001',
  TEST_ACCOUNT: {
    phone: '18611141133',
    password: '123456',
    tenantCode: 'k004'
  },
  OUTPUT_FILE: '/home/zhgue/kyyupgame/ai-test-report.md'
};

// 测试数据
const TEST_CASES = {
  // 10个直接沟通的提示词
  directChat: [
    '你好，请介绍一下你自己',
    '今天是几月几号？',
    '幼儿园管理系统有哪些主要功能？',
    '如何提高幼儿园的教学质量？',
    '请给我一些家长沟通的建议',
    '幼儿园安全管理的要点有哪些？',
    '如何组织一次成功的亲子活动？',
    '教师队伍建设有什么好的方法？',
    '幼儿园招生宣传有哪些技巧？',
    '如何处理家长投诉？'
  ],
  
  // 10个幼儿园园长常用的CRUD提示词
  crudOperations: [
    '查询一下当前有多少个班级',
    '帮我查看所有在职教师的信息',
    '统计一下本学期的学生人数',
    '查询最近一周的考勤记录',
    '帮我看看今天有哪些活动安排',
    '查询本月的收费情况',
    '帮我统计各班级的人数分布',
    '查看最近的家长反馈记录',
    '帮我查询教师的课程安排',
    '统计本周的餐饮消费情况'
  ]
};

// 日志收集器
class LogCollector {
  constructor() {
    this.logs = [];
    this.testResults = [];
    this.startTime = new Date();
  }

  log(category, level, message, data = null) {
    // 安全序列化，避免循环引用
    const safeData = data ? this.safeStringify(data) : null;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      level,
      message,
      data: safeData
    };
    this.logs.push(logEntry);
    
    // 同时输出到控制台
    const emoji = level === 'SUCCESS' ? '✅' : level === 'ERROR' ? '❌' : level === 'WARNING' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${category}] ${message}`);
    if (safeData) {
      console.log(safeData);
    }
  }

  safeStringify(obj) {
    try {
      // 简单对象直接返回
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'number') return obj;
      
      // 处理循环引用
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }, 2);
    } catch (e) {
      return String(obj);
    }
  }

  addTestResult(testName, success, duration, details) {
    this.testResults.push({
      testName,
      success,
      duration,
      details,
      timestamp: new Date().toISOString()
    });
  }

  generateMarkdownReport() {
    const endTime = new Date();
    const totalDuration = (endTime - this.startTime) / 1000;

    let md = `# AI助手综合测试报告\n\n`;
    md += `**测试时间**: ${this.startTime.toLocaleString('zh-CN')}\n\n`;
    md += `**总耗时**: ${totalDuration.toFixed(2)}秒\n\n`;
    md += `**测试账号**: ${CONFIG.TEST_ACCOUNT.phone}\n\n`;
    md += `---\n\n`;

    // 测试概览
    const totalTests = this.testResults.length;
    const successTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - successTests;
    const successRate = ((successTests / totalTests) * 100).toFixed(1);

    md += `## 📊 测试概览\n\n`;
    md += `| 指标 | 数值 |\n`;
    md += `|------|------|\n`;
    md += `| 总测试数 | ${totalTests} |\n`;
    md += `| 成功 | ${successTests} |\n`;
    md += `| 失败 | ${failedTests} |\n`;
    md += `| 成功率 | ${successRate}% |\n\n`;

    // 直接沟通测试结果
    md += `## 💬 直接沟通测试 (10个)\n\n`;
    const chatTests = this.testResults.filter(r => r.testName.includes('直接沟通'));
    chatTests.forEach((test, index) => {
      const status = test.success ? '✅' : '❌';
      md += `### ${index + 1}. ${status} ${test.details.question}\n\n`;
      md += `**耗时**: ${test.duration}ms\n\n`;
      if (test.details.response) {
        md += `**AI回复**:
\`\`\`
${test.details.response.substring(0, 500)}${test.details.response.length > 500 ? '...' : ''}
\`\`\`

`;
      }
      if (test.details.error) {
        md += `**错误**: ${test.details.error}\n\n`;
      }
      md += `---\n\n`;
    });

    // CRUD工具调用测试结果
    md += `## 🔧 CRUD工具调用测试 (10个)\n\n`;
    const crudTests = this.testResults.filter(r => r.testName.includes('CRUD'));
    crudTests.forEach((test, index) => {
      const status = test.success ? '✅' : '❌';
      md += `### ${index + 1}. ${status} ${test.details.question}\n\n`;
      md += `**耗时**: ${test.duration}ms\n\n`;
      
      if (test.details.toolCalls && test.details.toolCalls.length > 0) {
        md += `**工具调用记录** (${test.details.toolCalls.length}次):\n\n`;
        test.details.toolCalls.forEach((tool, i) => {
          md += `${i + 1}. **${tool.name}**\n`;
          md += `   - 参数: \`${JSON.stringify(tool.arguments)}\`\n`;
          if (tool.result) {
            md += `   - 结果: \`${JSON.stringify(tool.result).substring(0, 200)}...\`\n`;
          }
          md += `\n`;
        });
      }
      
      if (test.details.response) {
        md += `**AI最终回复**:
\`\`\`
${test.details.response.substring(0, 500)}${test.details.response.length > 500 ? '...' : ''}
\`\`\`

`;
      }
      
      if (test.details.error) {
        md += `**错误**: ${test.details.error}\n\n`;
      }
      md += `---\n\n`;
    });

    // 详细日志
    md += `## 📝 详细日志\n\n`;
    md += `<details>\n<summary>点击展开完整日志 (${this.logs.length}条)</summary>\n\n`;
    md += `\`\`\`json\n`;
    md += JSON.stringify(this.logs, null, 2);
    md += `\n\`\`\`\n\n`;
    md += `</details>\n\n`;

    // 统计信息
    md += `## 📈 性能统计\n\n`;
    const durations = this.testResults.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    md += `| 指标 | 数值 |\n`;
    md += `|------|------|\n`;
    md += `| 平均响应时间 | ${avgDuration.toFixed(0)}ms |\n`;
    md += `| 最快响应 | ${minDuration}ms |\n`;
    md += `| 最慢响应 | ${maxDuration}ms |\n\n`;

    return md;
  }

  saveReport() {
    const markdown = this.generateMarkdownReport();
    fs.writeFileSync(CONFIG.OUTPUT_FILE, markdown, 'utf8');
    this.log('REPORT', 'SUCCESS', `测试报告已保存: ${CONFIG.OUTPUT_FILE}`);
  }
}

const logger = new LogCollector();

// 直接使用统一认证登录（绕过租户代理问题）
async function directUnifiedLogin() {
  logger.log('AUTH', 'INFO', '开始直接统一认证登录...');

  try {
    // 直接调用统一认证系统
    const response = await axios.post(`${CONFIG.UNIFIED_BACKEND}/api/auth/login`, {
      phone: CONFIG.TEST_ACCOUNT.phone,
      password: CONFIG.TEST_ACCOUNT.password
    });

    if (response.data.success && response.data.data.token) {
      const token = response.data.data.token;
      logger.log('AUTH', 'SUCCESS', '统一认证登录成功', {
        user: response.data.data.user.realName || response.data.data.user.username,
        token: token.substring(0, 20) + '...'
      });
      return token;
    } else {
      throw new Error(response.data.message || '登录失败');
    }
  } catch (error) {
    logger.log('AUTH', 'ERROR', '统一认证登录失败', {
      error: error.message,
      details: error.response?.data
    });
    throw error;
  }
}

// SSE流式对话（收集完整响应和工具调用）
async function chatWithAI(token, question, conversationId = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let fullResponse = '';
    let toolCalls = [];
    let currentToolCall = null;

    logger.log('AI_CHAT', 'INFO', `发送问题: "${question}"`);

    const requestData = {
      message: question,
      conversationId: conversationId,
      stream: true
    };

    axios.post(
      `${CONFIG.TENANT_BACKEND}/api/ai/unified/stream-chat`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        responseType: 'stream',
        timeout: 120000,
        maxRedirects: 5
      }
    ).then(response => {
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).trim();
            
            if (data === '[DONE]') {
              const duration = Date.now() - startTime;
              logger.log('AI_CHAT', 'SUCCESS', `对话完成，耗时 ${duration}ms`, {
                responseLength: fullResponse.length,
                toolCallsCount: toolCalls.length
              });
              resolve({
                response: fullResponse,
                toolCalls: toolCalls,
                duration: duration
              });
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              // 处理不同类型的消息
              if (parsed.type === 'content' && parsed.content) {
                fullResponse += parsed.content;
              } else if (parsed.type === 'tool_call_start') {
                currentToolCall = {
                  name: parsed.toolName,
                  arguments: parsed.arguments,
                  result: null
                };
                logger.log('TOOL_CALL', 'INFO', `开始调用工具: ${parsed.toolName}`, parsed.arguments);
              } else if (parsed.type === 'tool_call_result') {
                if (currentToolCall) {
                  currentToolCall.result = parsed.result;
                  toolCalls.push(currentToolCall);
                  logger.log('TOOL_CALL', 'SUCCESS', `工具调用完成: ${currentToolCall.name}`, {
                    result: parsed.result
                  });
                  currentToolCall = null;
                }
              } else if (parsed.type === 'error') {
                logger.log('AI_CHAT', 'ERROR', '对话出错', parsed);
              }
            } catch (e) {
              // 忽略非JSON行
            }
          }
        }
      });

      response.data.on('end', () => {
        if (fullResponse || toolCalls.length > 0) {
          const duration = Date.now() - startTime;
          resolve({
            response: fullResponse,
            toolCalls: toolCalls,
            duration: duration
          });
        } else {
          reject(new Error('未收到任何响应'));
        }
      });

      response.data.on('error', (error) => {
        logger.log('AI_CHAT', 'ERROR', '流式响应错误', error.message);
        reject(error);
      });
    }).catch(error => {
      logger.log('AI_CHAT', 'ERROR', '请求失败', {
        message: error.message,
        response: error.response?.data
      });
      reject(error);
    });
  });
}

// 执行测试
async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║         AI助手综合测试 - 20个测试用例                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. 登录
    const token = await directUnifiedLogin();
    
    console.log('\n' + '='.repeat(60));
    console.log('  第一部分: 直接沟通测试 (10个)');
    console.log('='.repeat(60) + '\n');

    // 2. 直接沟通测试
    for (let i = 0; i < TEST_CASES.directChat.length; i++) {
      const question = TEST_CASES.directChat[i];
      console.log(`\n[测试 ${i + 1}/10] ${question}`);
      
      try {
        const result = await chatWithAI(token, question);
        logger.addTestResult(
          `直接沟通-${i + 1}`,
          true,
          result.duration,
          {
            question: question,
            response: result.response,
            toolCalls: result.toolCalls
          }
        );
        
        // 短暂延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.addTestResult(
          `直接沟通-${i + 1}`,
          false,
          0,
          {
            question: question,
            error: error.message
          }
        );
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('  第二部分: CRUD工具调用测试 (10个)');
    console.log('='.repeat(60) + '\n');

    // 3. CRUD工具调用测试
    for (let i = 0; i < TEST_CASES.crudOperations.length; i++) {
      const question = TEST_CASES.crudOperations[i];
      console.log(`\n[测试 ${i + 1}/10] ${question}`);
      
      try {
        const result = await chatWithAI(token, question);
        logger.addTestResult(
          `CRUD工具-${i + 1}`,
          true,
          result.duration,
          {
            question: question,
            response: result.response,
            toolCalls: result.toolCalls
          }
        );
        
        // 短暂延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.addTestResult(
          `CRUD工具-${i + 1}`,
          false,
          0,
          {
            question: question,
            error: error.message
          }
        );
      }
    }

    // 4. 生成报告
    console.log('\n' + '='.repeat(60));
    console.log('  生成测试报告');
    console.log('='.repeat(60) + '\n');
    
    logger.saveReport();
    
    console.log('\n✅ 所有测试完成！');
    console.log(`📄 测试报告已生成: ${CONFIG.OUTPUT_FILE}\n`);

  } catch (error) {
    logger.log('TEST', 'ERROR', '测试执行失败', error.message);
    logger.saveReport();
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
