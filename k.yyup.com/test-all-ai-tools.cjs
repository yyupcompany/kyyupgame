#!/usr/bin/env node

/**
 * AI工具全面测试脚本
 * 测试所有可用工具的单次调用，并分析后端实现
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const BASE_URL = 'http://localhost:3000';
const AI_ENDPOINT = '/api/ai/unified/stream-chat-single';

// 测试用户信息
const TEST_USER = {
  id: '121',
  role: 'parent',
  name: '测试用户'
};

// 工具测试用例定义
const TOOL_TESTS = [
  // Web操作工具
  {
    name: 'navigate_page',
    description: '页面导航工具',
    testParams: {
      url: 'http://localhost:5173/dashboard',
      wait_for_selector: '.dashboard-container',
      timeout: 5000
    }
  },
  {
    name: 'click_element',
    description: '点击元素工具',
    testParams: {
      selector: '.menu-item',
      wait_before_click: 1000,
      wait_after_click: 2000
    }
  },
  {
    name: 'type_text',
    description: '输入文本工具',
    testParams: {
      selector: 'input[type="text"]',
      text: '测试文本输入',
      clear_first: true
    }
  },
  {
    name: 'fill_form',
    description: '填写表单工具',
    testParams: {
      form_data: {
        name: '测试姓名',
        email: 'test@example.com',
        phone: '13800138000'
      }
    }
  },
  {
    name: 'submit_form',
    description: '提交表单工具',
    testParams: {
      selector: 'form',
      wait_before_submit: 1000
    }
  },
  {
    name: 'get_page_structure',
    description: '获取页面结构工具',
    testParams: {
      include_text: true,
      max_depth: 3
    }
  },
  {
    name: 'validate_page_state',
    description: '验证页面状态工具',
    testParams: {
      expectedState: {
        expected_elements: ['.header', '.main-content'],
        expected_text: ['欢迎使用'],
        url_pattern: 'dashboard'
      }
    }
  },
  {
    name: 'wait_for_element',
    description: '等待元素工具',
    testParams: {
      selector: '.loading-complete',
      timeout: 10000
    }
  },

  // 数据库查询工具
  {
    name: 'any_query',
    description: '任意查询工具',
    testParams: {
      query_type: 'custom_query',
      custom_query: 'SELECT COUNT(*) as total FROM Users WHERE role = "parent"',
      return_format: 'json'
    }
  },
  {
    name: 'read_data_record',
    description: '读取数据记录工具',
    testParams: {
      table_name: 'Users',
      filters: { role: 'parent' },
      limit: 5
    }
  },

  // 数据库CRUD工具
  {
    name: 'create_data_record',
    description: '创建数据记录工具',
    testParams: {
      table_name: 'TestRecords',
      data: {
        name: '测试记录',
        description: '这是一个测试记录',
        created_by: TEST_USER.id
      }
    }
  },
  {
    name: 'update_data_record',
    description: '更新数据记录工具',
    testParams: {
      table_name: 'TestRecords',
      record_id: 1,
      update_data: {
        name: '更新后的测试记录',
        updated_at: new Date().toISOString()
      }
    }
  },
  {
    name: 'delete_data_record',
    description: '删除数据记录工具',
    testParams: {
      table_name: 'TestRecords',
      record_id: 999, // 使用不存在的ID避免误删
      confirm_delete: false
    }
  },

  // 工作流工具
  {
    name: 'create_todo_list',
    description: '创建待办事项工具',
    testParams: {
      title: '测试待办列表',
      items: [
        { task: '完成测试任务1', priority: 'high' },
        { task: '完成测试任务2', priority: 'medium' }
      ],
      assignee_id: TEST_USER.id
    }
  },
  {
    name: 'get_todo_list',
    description: '获取待办列表工具',
    testParams: {
      user_id: TEST_USER.id,
      status: 'pending',
      limit: 10
    }
  },
  {
    name: 'analyze_task_complexity',
    description: '分析任务复杂度工具',
    testParams: {
      task_description: '创建一个完整的幼儿园活动方案，包括安全检查、物资准备、人员安排',
      context: '幼儿园春季运动会',
      experience_level: 'intermediate'
    }
  },

  // 文档生成工具
  {
    name: 'generate_pdf_report',
    description: '生成PDF报告工具',
    testParams: {
      title: '测试报告',
      content: '这是一个测试生成的PDF报告',
      template: 'standard_report'
    }
  },
  {
    name: 'generate_word_document',
    description: '生成Word文档工具',
    testParams: {
      title: '测试文档',
      content: '这是一个测试生成的Word文档',
      format: 'docx'
    }
  },

  // UI显示工具
  {
    name: 'generate_html_preview',
    description: '生成HTML预览工具',
    testParams: {
      title: '测试预览',
      content: '<p>这是一个测试HTML预览</p>',
      style: 'modern'
    }
  },

  // 搜索工具
  {
    name: 'web_search',
    description: '网络搜索工具',
    testParams: {
      query: '幼儿园安全管理最佳实践',
      max_results: 5,
      language: 'zh-CN'
    }
  }
];

// 颜色输出工具
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

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 执行单个工具测试
async function testSingleTool(tool) {
  colorLog('cyan', `\n🧪 测试工具: ${tool.name} (${tool.description})`);

  const testPayload = {
    context: {
      userId: TEST_USER.id,
      role: TEST_USER.role,
      sessionId: 'test-session-' + Date.now(),
      requestType: 'single_tool_test'
    },
    message: `请执行${tool.description}，参数：${JSON.stringify(tool.testParams)}`,
    single_tool_mode: true,
    specific_tool: tool.name,
    tool_params: tool.testParams,
    stream: false
  };

  const startTime = Date.now();
  try {
    const response = await axios.post(BASE_URL + AI_ENDPOINT, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.data && response.data.success) {
      colorLog('green', `✅ ${tool.name} 测试成功 (${responseTime}ms)`);

      // 分析响应
      const result = response.data.data;
      if (result && result.tool_calls && result.tool_calls.length > 0) {
        const toolCall = result.tool_calls[0];
        if (toolCall.name === tool.name) {
          colorLog('green', `   ✓ 工具调用正确匹配`);
          if (toolCall.status === 'success') {
            colorLog('green', `   ✓ 工具执行状态: 成功`);
          } else {
            colorLog('yellow', `   ⚠️ 工具执行状态: ${toolCall.status}`);
            if (toolCall.error) {
              colorLog('yellow', `   错误信息: ${toolCall.error}`);
            }
          }
        } else {
          colorLog('red', `   ✗ 工具调用不匹配: 期望 ${tool.name}, 实际 ${toolCall.name}`);
        }
      }

      return {
        tool: tool.name,
        status: 'success',
        responseTime,
        data: response.data
      };
    } else {
      colorLog('red', `❌ ${tool.name} 测试失败: ${response.data?.message || '未知错误'}`);
      return {
        tool: tool.name,
        status: 'failed',
        responseTime,
        error: response.data?.message || '未知错误'
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    colorLog('red', `❌ ${tool.name} 测试异常: ${error.message}`);
    if (error.response) {
      colorLog('red', `   HTTP状态码: ${error.response.status}`);
      colorLog('red', `   响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    return {
      tool: tool.name,
      status: 'error',
      responseTime,
      error: error.message
    };
  }
}

// 主测试函数
async function runAllTests() {
  colorLog('blue', '🚀 开始AI工具全面测试');
  colorLog('blue', `📊 总计测试工具数量: ${TOOL_TESTS.length}`);

  const results = [];
  const startTime = Date.now();

  // 检查服务器是否运行
  try {
    await axios.get(BASE_URL + '/health', { timeout: 5000 });
    colorLog('green', '✅ 服务器连接正常');
  } catch (error) {
    colorLog('red', '❌ 无法连接到服务器，请确保后端服务正在运行');
    process.exit(1);
  }

  // 逐个测试工具
  for (let i = 0; i < TOOL_TESTS.length; i++) {
    const tool = TOOL_TESTS[i];
    colorLog('yellow', `\n📈 进度: ${i + 1}/${TOOL_TESTS.length}`);

    const result = await testSingleTool(tool);
    results.push(result);

    // 在测试之间稍作延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const totalTime = Date.now() - startTime;

  // 生成测试报告
  generateTestReport(results, totalTime);
}

// 生成测试报告
function generateTestReport(results, totalTime) {
  colorLog('blue', '\n📋 生成测试报告...');

  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

  const report = {
    test_summary: {
      total_tools: results.length,
      success_count: successCount,
      failed_count: failedCount,
      error_count: errorCount,
      success_rate: (successCount / results.length * 100).toFixed(2) + '%',
      total_time: totalTime + 'ms',
      average_response_time: Math.round(avgResponseTime) + 'ms'
    },
    detailed_results: results,
    timestamp: new Date().toISOString(),
    test_environment: {
      base_url: BASE_URL,
      test_user: TEST_USER
    }
  };

  // 保存报告到文件
  const reportPath = path.join(__dirname, 'ai-tools-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 输出总结
  colorLog('green', '\n🎉 测试完成！');
  colorLog('blue', `📊 测试统计:`);
  colorLog('blue', `   总工具数: ${results.length}`);
  colorLog('green', `   成功: ${successCount}`);
  colorLog('red', `   失败: ${failedCount}`);
  colorLog('red', `   错误: ${errorCount}`);
  colorLog('blue', `   成功率: ${report.test_summary.success_rate}`);
  colorLog('blue', `   总耗时: ${totalTime}ms`);
  colorLog('blue', `   平均响应时间: ${report.test_summary.average_response_time}`);
  colorLog('cyan', `📄 详细报告已保存到: ${reportPath}`);

  // 输出失败的工具
  const failedTools = results.filter(r => r.status !== 'success');
  if (failedTools.length > 0) {
    colorLog('yellow', '\n⚠️ 需要关注的工具:');
    failedTools.forEach(tool => {
      colorLog('yellow', `   - ${tool.tool}: ${tool.error || '执行失败'}`);
    });
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    colorLog('red', `💥 测试脚本运行失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testSingleTool, runAllTests, TOOL_TESTS };