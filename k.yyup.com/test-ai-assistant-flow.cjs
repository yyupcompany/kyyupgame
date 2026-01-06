#!/usr/bin/env node

/**
 * AI助手端到端测试模拟器
 * 模拟前端调用后端AI助手的完整流程
 */

const http = require('http');
const querystring = require('querystring');

// 配置
const config = {
  backendUrl: 'http://localhost:3000',
  apiEndpoint: '/api/ai/unified/stream-chat',
  // 使用admin快捷登录的token（模拟）
  token: 'MOCK_JWT_TOKEN_FOR_TEST',
  testQuery: '查询幼儿园所有人员数量',
  userId: '1',
  conversationId: 'test-conversation-001',
  context: {
    role: 'admin',
    enableTools: true,
    currentPage: '/aiassistant',
    currentRound: 1
  }
};

// 颜色日志输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  let color = colors.white;
  let prefix = '';

  switch(level) {
    case 'REQUEST':
      color = colors.blue;
      prefix = '🚀 [请求]';
      break;
    case 'RESPONSE':
      color = colors.green;
      prefix = '📡 [响应]';
      break;
    case 'EVENT':
      color = colors.magenta;
      prefix = '📢 [事件]';
      break;
    case 'THINKING':
      color = colors.yellow;
      prefix = '🤔 [思考]';
      break;
    case 'TOOL':
      color = colors.cyan;
      prefix = '🔧 [工具]';
      break;
    case 'ERROR':
      color = colors.red;
      prefix = '❌ [错误]';
      break;
    case 'SUCCESS':
      color = colors.green;
      prefix = '✅ [成功]';
      break;
    default:
      color = colors.white;
      prefix = 'ℹ️  [信息]';
  }

  console.log(`${color}${prefix} ${timestamp}${colors.reset}`);
  console.log(`${color}   ${message}${colors.reset}`);

  if (data) {
    if (typeof data === 'object') {
      console.log(`${color}   数据: ${JSON.stringify(data, null, 2)}${colors.reset}`);
    } else {
      console.log(`${color}   数据: ${data}${colors.reset}`);
    }
  }
  console.log('');
}

// 模拟前端事件处理器
class FrontendEventHandler {
  constructor() {
    this.events = [];
    this.startTime = Date.now();
  }

  handleEvent(event, data) {
    const timestamp = Date.now() - this.startTime;
    this.events.push({ event, data, timestamp });

    log('EVENT', `接收到事件: ${event}`, { timestamp: `${timestamp}ms`, data });

    // 模拟前端对不同事件的处理
    switch(event) {
      case 'start':
        this.handleStart(data);
        break;
      case 'thinking_start':
        this.handleThinkingStart(data);
        break;
      case 'thinking_update':
        this.handleThinkingUpdate(data);
        break;
      case 'thinking_complete':
        this.handleThinkingComplete(data);
        break;
      case 'tool_narration':
        this.handleToolNarration(data);
        break;
      case 'tool_call_start':
        this.handleToolCallStart(data);
        break;
      case 'tool_call_complete':
        this.handleToolCallComplete(data);
        break;
      case 'tool_call_error':
        this.handleToolCallError(data);
        break;
      case 'tools_complete':
        this.handleToolsComplete(data);
        break;
      case 'content_update':
        this.handleContentUpdate(data);
        break;
      case 'complete':
        this.handleComplete(data);
        break;
      case 'error':
        this.handleError(data);
        break;
      default:
        log('EVENT', `未处理的事件类型: ${event}`, data);
    }
  }

  handleStart(data) {
    log('RESPONSE', '🔗 AI服务连接成功');
  }

  handleThinkingStart(data) {
    log('THINKING', 'AI开始思考过程...');
    // 前端显示思考动画
    console.log('   [前端UI] 显示思考加载动画...');
  }

  handleThinkingUpdate(data) {
    log('THINKING', '思考内容更新', data.delta || data.content?.substring(0, 100) + '...');
    // 前端实时更新思考内容
    console.log('   [前端UI] 更新思考内容显示');
  }

  handleThinkingComplete(data) {
    log('THINKING', 'AI思考完成', data.message);
    // 前端隐藏思考动画，显示完整思考内容
    console.log('   [前端UI] 隐藏思考动画，显示完整思考过程');
  }

  handleToolNarration(data) {
    log('TOOL', `工具意图说明: ${data.toolName}`, data.narration?.substring(0, 150) + '...');
    // 前端显示工具使用意图
    console.log('   [前端UI] 显示工具意图说明卡片');
  }

  handleToolCallStart(data) {
    log('TOOL', `开始执行工具: ${data.name}`, data.description);
    // 前端显示工具调用进度
    console.log(`   [前端UI] 显示工具 ${data.name} 执行中...`);
  }

  handleToolCallComplete(data) {
    log('SUCCESS', `工具执行完成: ${data.name}`, { success: data.success });
    // 前端更新工具调用状态
    console.log(`   [前端UI] ${data.name} 执行完成 ✅`);
  }

  handleToolCallError(data) {
    log('ERROR', `工具执行失败: ${data.name}`, data.error);
    // 前端显示错误信息
    console.log(`   [前端UI] ${data.name} 执行失败 ❌`);
  }

  handleToolsComplete(data) {
    log('SUCCESS', '所有工具调用完成', data.message);
    // 前端显示工具执行汇总
    console.log('   [前端UI] 显示工具执行汇总');
  }

  handleContentUpdate(data) {
    log('RESPONSE', '接收到内容更新', data.content?.substring(0, 100) + '...');
    // 前端实时显示AI回复内容
    console.log('   [前端UI] 实时更新AI回复内容');
  }

  handleComplete(data) {
    log('SUCCESS', '处理完成', {
      hasContent: !!data.content,
      hasTools: data.toolCalls && data.toolCalls.length > 0,
      needsContinue: data.needsContinue,
      isComplete: data.isComplete
    });

    // 前端显示最终结果
    if (data.content) {
      console.log('   [前端UI] 显示最终AI回复');
    }
    if (data.toolCalls && data.toolCalls.length > 0) {
      console.log(`   [前端UI] 显示 ${data.toolCalls.length} 个工具调用结果`);
    }
  }

  handleError(data) {
    log('ERROR', '处理过程中出现错误', data);
    // 前端显示错误信息
    console.log('   [前端UI] 显示错误提示');
  }

  getSummary() {
    const duration = Date.now() - this.startTime;
    const summary = {
      totalEvents: this.events.length,
      duration: `${duration}ms`,
      events: this.events.map(e => ({
        event: e.event,
        timestamp: `${e.timestamp}ms`,
        hasData: !!e.data
      }))
    };

    log('SUCCESS', '测试完成', summary);
    return summary;
  }
}

// 执行端到端测试
async function runEndToEndTest() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 AI助手端到端测试开始');
  console.log('='.repeat(80) + '\n');

  const eventHandler = new FrontendEventHandler();

  // 准备请求数据
  const requestData = {
    message: config.testQuery,
    userId: config.userId,
    conversationId: config.conversationId,
    context: config.context
  };

  log('REQUEST', '发送AI助手请求', requestData);

  // 发送HTTP请求
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestData);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: config.apiEndpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      log('RESPONSE', `收到响应，状态码: ${res.statusCode}`);

      if (res.statusCode !== 200) {
        log('ERROR', `HTTP错误: ${res.statusCode}`);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      // 处理SSE流式响应
      let buffer = '';
      let eventCount = 0;

      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(6).trim();

            if (lines.length > 0) {
              const nextLine = lines.find(l => l.startsWith('data: '));
              if (nextLine) {
                const dataStr = nextLine.slice(6).trim();
                let data;

                try {
                  data = JSON.parse(dataStr);
                } catch (e) {
                  data = dataStr;
                }

                eventCount++;
                eventHandler.handleEvent(eventType, data);
              }
            }
          }
        }
      });

      res.on('end', () => {
        log('SUCCESS', `SSE流结束，共接收到 ${eventCount} 个事件`);
        const summary = eventHandler.getSummary();
        resolve(summary);
      });

      res.on('error', (err) => {
        log('ERROR', '响应处理错误', err.message);
        reject(err);
      });
    });

    req.on('error', (err) => {
      log('ERROR', '请求发送失败', err.message);
      reject(err);
    });

    // 发送请求数据
    req.write(postData);
    req.end();
  });
}

// 主函数
async function main() {
  try {
    console.log('🎯 测试配置:');
    console.log(`   后端地址: ${config.backendUrl}`);
    console.log(`   API端点: ${config.apiEndpoint}`);
    console.log(`   测试查询: ${config.testQuery}`);
    console.log(`   用户角色: ${config.context.role}`);
    console.log(`   启用工具: ${config.context.enableTools}`);
    console.log('');

    const result = await runEndToEndTest();

    console.log('\n' + '='.repeat(80));
    console.log('🎉 测试成功完成！');
    console.log('='.repeat(80));
    console.log('\n📊 测试结果摘要:');
    console.log(`   • 总事件数: ${result.totalEvents}`);
    console.log(`   • 执行时长: ${result.duration}`);
    console.log(`   • 事件序列:`);

    result.events.forEach((event, index) => {
      console.log(`     ${index + 1}. ${event.event} (${event.timestamp})`);
    });

    console.log('\n✅ AI助手功能正常工作！');

  } catch (error) {
    console.error('\n💥 测试失败:', error.message);
    console.error('   请检查:');
    console.error('   1. 后端服务是否启动 (npm run start:backend)');
    console.error('   2. 端口3000是否可用');
    console.error('   3. /api/ai/unified/stream-chat 接口是否正常');
    console.error('   4. 数据库连接是否正常');

    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runEndToEndTest, FrontendEventHandler };