#!/usr/bin/env node

/**
 * AI工具测试和日志分析脚本
 * 测试各个工具并分析后端实现
 */

const fs = require('fs');
const path = require('path');

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

// 工具测试用例
const TOOL_TESTS = [
  {
    name: 'any_query',
    description: '任意查询工具',
    category: 'database-query',
    testMessage: '帮我查询一下数据库中用户表的总记录数',
    expectedParams: {
      query_type: 'custom_query',
      custom_query: 'SELECT COUNT(*) as total FROM Users',
      return_format: 'json'
    }
  },
  {
    name: 'read_data_record',
    description: '读取数据记录工具',
    category: 'database-crud',
    testMessage: '帮我读取用户数据，限制5条记录',
    expectedParams: {
      table_name: 'Users',
      filters: { role: 'parent' },
      limit: 5
    }
  },
  {
    name: 'create_data_record',
    description: '创建数据记录工具',
    category: 'database-crud',
    testMessage: '创建一个测试记录',
    expectedParams: {
      table_name: 'TestRecords',
      data: {
        name: '测试记录',
        description: '这是一个测试记录',
        test_type: 'api_test'
      }
    }
  },
  {
    name: 'generate_html_preview',
    description: '生成HTML预览工具',
    category: 'ui-display',
    testMessage: '生成一个简单的HTML预览',
    expectedParams: {
      title: '测试预览',
      content: '<p>这是一个测试HTML预览</p>',
      style: 'modern'
    }
  },
  {
    name: 'analyze_task_complexity',
    description: '分析任务复杂度工具',
    category: 'workflow',
    testMessage: '分析创建幼儿园活动方案的复杂度',
    expectedParams: {
      task_description: '创建一个完整的幼儿园春季活动方案，包括安全检查、物资准备、人员安排',
      context: '幼儿园春季运动会',
      experience_level: 'intermediate'
    }
  }
];

// 生成测试报告
function generateTestReport() {
  colorLog('blue', '🔍 生成AI工具测试报告');

  const report = {
    test_summary: {
      total_tools: TOOL_TESTS.length,
      timestamp: new Date().toISOString(),
      test_environment: {
        backend_url: 'http://localhost:3000',
        frontend_url: 'http://localhost:5173',
        test_user_id: '121'
      }
    },
    tools_analysis: TOOL_TESTS.map(tool => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      test_message: tool.testMessage,
      expected_parameters: tool.expectedParams,
      file_location: `server/src/services/ai/tools/${tool.category}/${tool.name}.tool.ts`,
      curl_command: generateCurlCommand(tool),
      implementation_status: analyzeImplementation(tool)
    })),
    recommendations: generateRecommendations()
  };

  // 保存报告
  const reportPath = path.join(__dirname, 'ai-tools-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  colorLog('green', `✅ 测试报告已生成: ${reportPath}`);

  // 显示报告摘要
  displayReportSummary(report);

  return report;
}

// 生成curl命令
function generateCurlCommand(tool) {
  const payload = {
    message: tool.testMessage,
    userId: '121',
    single_tool_mode: true,
    specific_tool: tool.name,
    tool_params: tool.expectedParams,
    context: {
      requestType: 'single_tool_test'
    }
  };

  return `curl -X POST http://localhost:3000/api/ai/unified/stream-chat-single \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}'`;
}

// 分析工具实现
function analyzeImplementation(tool) {
  const toolPath = path.join(__dirname, 'server/src/services/ai/tools', tool.category, `${tool.name}.tool.ts`);

  if (fs.existsSync(toolPath)) {
    const content = fs.readFileSync(toolPath, 'utf8');

    return {
      file_exists: true,
      has_export: content.includes(`export default`),
      has_name: content.includes(`name: "${tool.name}"`),
      has_description: content.includes('description:'),
      has_parameters: content.includes('parameters:'),
      has_implementation: content.includes('implementation:'),
      estimated_size: content.length,
      line_count: content.split('\n').length
    };
  } else {
    return {
      file_exists: false,
      message: '工具文件不存在'
    };
  }
}

// 生成建议
function generateRecommendations() {
  return [
    '建议检查所有工具文件的完整性',
    '验证工具参数定义是否正确',
    '测试工具的异常处理机制',
    '确认工具与数据库的连接',
    '检查工具的权限设置',
    '验证工具的返回值格式'
  ];
}

// 显示报告摘要
function displayReportSummary(report) {
  colorLog('cyan', '\n📊 工具测试报告摘要:');
  colorLog('blue', `   总工具数: ${report.test_summary.total_tools}`);

  let fileExistsCount = 0;
  let hasImplementationCount = 0;

  report.tools_analysis.forEach(tool => {
    if (tool.implementation_status.file_exists) fileExistsCount++;
    if (tool.implementation_status.has_implementation) hasImplementationCount++;
  });

  colorLog('green', `   文件存在: ${fileExistsCount}/${report.test_summary.total_tools}`);
  colorLog('green', `   有实现: ${hasImplementationCount}/${report.test_summary.total_tools}`);

  colorLog('cyan', '\n🔧 测试命令示例:');

  // 显示第一个工具的curl命令
  if (report.tools_analysis.length > 0) {
    const firstTool = report.tools_analysis[0];
    colorLog('yellow', `   ${firstTool.name}:`);
    console.log(`   ${firstTool.curl_command}`);
  }
}

// 检查后端日志
function checkBackendLogs() {
  colorLog('blue', '\n🔍 检查后端日志...');

  const logPaths = [
    path.join(__dirname, 'server/logs'),
    path.join(__dirname, 'server/logs/app.log'),
    path.join(__dirname, 'server/logs/ai-service.log')
  ];

  let foundLogs = [];

  logPaths.forEach(logPath => {
    if (fs.existsSync(logPath)) {
      foundLogs.push(logPath);
      const stats = fs.statSync(logPath);
      colorLog('green', `   ✓ ${path.basename(logPath)} (${Math.round(stats.size / 1024)}KB)`);
    }
  });

  if (foundLogs.length === 0) {
    colorLog('yellow', '   ⚠️ 未找到日志文件');
  } else {
    colorLog('cyan', `   📝 找到 ${foundLogs.length} 个日志文件`);
  }

  return foundLogs;
}

// 主函数
function main() {
  colorLog('blue', '🚀 AI工具实现分析');

  // 生成测试报告
  const report = generateTestReport();

  // 检查后端日志
  const logFiles = checkBackendLogs();

  // 输出建议
  colorLog('cyan', '\n💡 建议:');
  report.recommendations.forEach((rec, index) => {
    colorLog('yellow', `   ${index + 1}. ${rec}`);
  });

  colorLog('green', '\n✅ 分析完成！');
}

if (require.main === module) {
  main().catch(error => {
    colorLog('red', `💥 分析失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { generateTestReport, checkBackendLogs };