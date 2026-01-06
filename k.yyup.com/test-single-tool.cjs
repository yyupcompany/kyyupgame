#!/usr/bin/env node

/**
 * 单个工具测试脚本
 * 测试特定工具的调用
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const AI_ENDPOINT = '/api/ai/unified/stream-chat-single';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试单个工具
async function testTool(toolName, params) {
  colorLog('cyan', `\n🧪 测试工具: ${toolName}`);

  const payload = {
    message: `请帮我执行${toolName}工具，参数：${JSON.stringify(params)}`,
    userId: '121',
    single_tool_mode: true,
    specific_tool: toolName,
    tool_params: params,
    context: {
      requestType: 'single_tool_test'
    }
  };

  try {
    const startTime = Date.now();
    colorLog('blue', '   🚀 发送请求...');

    const response = await axios.post(`${BASE_URL}${AI_ENDPOINT}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    colorLog('green', `✅ ${toolName} 响应成功 (${responseTime}ms)`);

    if (response.data && response.data.success) {
      colorLog('green', `   ✓ API调用成功`);

      const data = response.data.data;
      if (data.tool_calls && data.tool_calls.length > 0) {
        const toolCall = data.tool_calls[0];
        if (toolCall.name === toolName) {
          colorLog('green', `   ✓ 工具调用匹配`);
          if (toolCall.status === 'success') {
            colorLog('green', `   ✓ 工具执行成功`);
          } else {
            colorLog('yellow', `   ⚠️ 工具执行状态: ${toolCall.status}`);
            if (toolCall.error) {
              colorLog('yellow', `   错误: ${toolCall.error}`);
            }
          }
        } else {
          colorLog('red', `   ✗ 工具调用不匹配: 期望 ${toolName}, 实际 ${toolCall.name}`);
        }
      } else {
        colorLog('yellow', `   ⚠️ 没有找到工具调用结果`);
      }
    } else {
      colorLog('red', `❌ API调用失败: ${response.data?.message || '未知错误'}`);
    }

    return {
      tool: toolName,
      status: response.data?.success ? 'success' : 'failed',
      responseTime,
      data: response.data
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    colorLog('red', `❌ ${toolName} 测试异常 (${responseTime}ms): ${error.message}`);

    if (error.response) {
      colorLog('red', `   HTTP状态码: ${error.response.status}`);
      colorLog('red', `   响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    return {
      tool: toolName,
      status: 'error',
      responseTime,
      error: error.message
    };
  }
}

// 主函数
async function main() {
  const toolName = process.argv[2];
  const paramsJson = process.argv[3];

  if (!toolName) {
    colorLog('red', '❌ 请提供工具名称');
    colorLog('blue', '用法: node test-single-tool.js <工具名称> [参数JSON]');
    colorLog('cyan', '示例: node test-single-tool.js navigate_page \'{"url":"http://localhost:5173"}\'');
    process.exit(1);
  }

  let params = {};
  if (paramsJson) {
    try {
      params = JSON.parse(paramsJson);
    } catch (error) {
      colorLog('red', `❌ 参数JSON解析失败: ${error.message}`);
      process.exit(1);
    }
  }

  colorLog('blue', '🚀 开始单个工具测试');
  colorLog('blue', `📊 测试工具: ${toolName}`);
  colorLog('blue', `📋 参数: ${JSON.stringify(params)}`);

  const result = await testTool(toolName, params);

  // 输出结果
  colorLog('cyan', '\n📋 测试结果:');
  colorLog('blue', `   工具: ${result.tool}`);
  colorLog('blue', `   状态: ${result.status}`);
  colorLog('blue', `   响应时间: ${result.responseTime}ms`);

  if (result.error) {
    colorLog('red', `   错误: ${result.error}`);
  }

  process.exit(result.status === 'success' ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    colorLog('red', `💥 脚本运行失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testTool };