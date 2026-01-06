// 侧边栏错误检测主任务管理脚本
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 确保测试结果目录存在
const resultsDir = './test-results/sidebar-error-detection';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// 测试脚本配置
const TEST_SCRIPTS = [
  {
    name: 'Centers Directory Test',
    script: './test-centers-comprehensive.cjs',
    category: 'centers',
    description: '测试所有centers目录的中心页面',
    priority: 1,
    expectedPages: 20
  },
  {
    name: 'Teacher Center Test',
    script: './test-teacher-center.cjs',
    category: 'teacher-center',
    description: '测试教师中心相关页面',
    priority: 2,
    expectedPages: 25
  },
  {
    name: 'Parent Center Test',
    script: './test-parent-center.cjs',
    category: 'parent-center',
    description: '测试家长中心相关页面',
    priority: 3,
    expectedPages: 35
  }
];

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 执行单个测试脚本
async function runTestScript(testConfig) {
  return new Promise((resolve, reject) => {
    colorLog('blue', `\n🚀 开始执行: ${testConfig.name}`);
    colorLog('cyan', `📝 描述: ${testConfig.description}`);
    colorLog('yellow', `📂 类别: ${testConfig.category}`);
    colorLog('yellow', `⭐ 优先级: ${testConfig.priority}`);

    const startTime = Date.now();

    try {
      const result = execSync(`node ${testConfig.script}`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000 // 5分钟超时
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      colorLog('green', `✅ ${testConfig.name} 执行完成 (耗时: ${duration}ms)`);

      resolve({
        name: testConfig.name,
        category: testConfig.category,
        success: true,
        duration: duration,
        output: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      colorLog('red', `❌ ${testConfig.name} 执行失败 (耗时: ${duration}ms)`);
      colorLog('red', `错误: ${error.message}`);

      resolve({
        name: testConfig.name,
        category: testConfig.category,
        success: false,
        duration: duration,
        error: error.message,
        output: error.stdout || '',
        timestamp: new Date().toISOString()
      });
    }
  });
}

// 解析测试报告
function parseTestReport(category, reportPath) {
  try {
    if (fs.existsSync(reportPath)) {
      const reportData = fs.readFileSync(reportPath, 'utf8');
      const report = JSON.parse(reportData);

      return {
        total: report.summary.total || 0,
        success: report.summary.success || 0,
        failed: report.summary.failed || 0,
        withErrors: report.summary.withErrors || 0,
        with404: report.summary.with404 || 0,
        totalErrors: report.summary.totalErrors || 0,
        categoryStats: report.summary.categoryStats || {},
        functionalCoverage: report.summary.functionalCoverage || {}
      };
    }
  } catch (error) {
    colorLog('yellow', `⚠️  无法解析 ${category} 的测试报告: ${error.message}`);
  }

  return null;
}

// 生成汇总报告
function generateSummaryReport(testResults) {
  const timestamp = new Date().toISOString();

  let markdown = `# 侧边栏错误检测汇总报告\n\n`;
  markdown += `**生成时间**: ${new Date(timestamp).toLocaleString()}\n`;
  markdown += `**测试总数**: ${TEST_SCRIPTS.length}\n`;
  markdown += `**测试URL**: http://localhost:5173\n\n`;

  markdown += `## 📊 总体执行结果\n\n`;
  markdown += `| 测试名称 | 类别 | 优先级 | 执行状态 | 耗时 | 结果 |\n`;
  markdown += `|----------|------|--------|----------|------|------|\n`;

  testResults.forEach(result => {
    const status = result.success ? '✅ 成功' : '❌ 失败';
    const duration = result.duration ? `${result.duration}ms` : 'N/A';
    markdown += `| ${result.name} | ${result.category} | ${getPriorityEmoji(result.priority)} | ${status} | ${duration} | ${getEmojiForResult(result)} |\n`;
  });

  markdown += `\n## 📈 各类别详细统计\n\n`;

  // 按类别分组统计
  const categoryResults = {};
  testResults.forEach(result => {
    const category = TEST_SCRIPTS.find(t => t.name === result.name)?.category;
    if (category) {
      if (!categoryResults[category]) {
        categoryResults[category] = {
          tests: [],
          totalErrors: 0,
          total404: 0,
          totalSuccess: 0,
          totalFailed: 0
        };
      }
      categoryResults[category].tests.push(result);
    }
  });

  // 为每个类别解析测试报告
  Object.entries(categoryResults).forEach(([category, data]) => {
    const reportPath = `./test-results/${category}/${category}-test-report.json`;
    const reportData = parseTestReport(category, reportPath);

    if (reportData) {
      markdown += `### ${category.toUpperCase()} 统计\n\n`;
      markdown += `- **总页面数**: ${reportData.total}\n`;
      markdown += `- **成功页面**: ${reportData.success} (${((reportData.success/reportData.total)*100).toFixed(1)}%)\n`;
      markdown += `- **失败页面**: ${reportData.failed}\n`;
      markdown += `- **有错误的页面**: ${reportData.withErrors}\n`;
      markdown += `- **404页面**: ${reportData.with404}\n`;
      markdown += `- **总错误数**: ${reportData.totalErrors}\n\n`;

      // 功能覆盖统计
      if (Object.keys(reportData.functionalCoverage).length > 0) {
        markdown += `#### 功能模块覆盖\n\n`;
        markdown += `| 功能模块 | 覆盖情况 |\n`;
        markdown += `|----------|----------|\n`;

        Object.entries(reportData.functionalCoverage).forEach(([func, coverage]) => {
          markdown += `| ${func} | ${coverage} |\n`;
        });
        markdown += `\n`;
      }
    }
  });

  // 问题汇总
  markdown += `## ⚠️ 问题汇总\n\n`;

  const allProblems = [];
  testResults.forEach(result => {
    if (!result.success) {
      allProblems.push({
        category: result.category,
        name: result.name,
        issue: result.error || '执行失败'
      });
    }
  });

  // 从报告中收集404和错误页面
  Object.keys(categoryResults).forEach(category => {
    const reportPath = `./test-results/${category}/${category}-test-report.json`;
    const reportData = parseTestReport(category, reportPath);

    if (reportData && (reportData.with404 > 0 || reportData.withErrors > 0)) {
      allProblems.push({
        category: category,
        issue: `发现${reportData.with404}个404页面和${reportData.withErrors}个错误页面`
      });
    }
  });

  if (allProblems.length > 0) {
    markdown += `| 类别 | 问题描述 |\n`;
    markdown += `|------|----------|\n`;
    allProblems.forEach(problem => {
      markdown += `| ${problem.category} | ${problem.issue} |\n`;
    });
  } else {
    markdown += `✅ 未发现问题，所有测试通过！\n`;
  }

  markdown += `\n## 📝 修复建议\n\n`;
  markdown += `基于测试结果，建议按以下优先级进行修复：\n\n`;

  markdown += `### 高优先级修复\n`;
  markdown += `1. **404错误修复** - 检查前后端路由配置\n`;
  markdown += `2. **控制台错误修复** - 检查组件导入和数据初始化\n`;
  markdown += `3. **页面加载失败** - 检查网络请求和API响应\n\n`;

  markdown += `### 中优先级修复\n`;
  markdown += `1. **样式问题修复** - 确保页面布局正常\n`;
  markdown += `2. **功能完整性** - 检查业务功能是否正常\n`;
  markdown += `3. **性能优化** - 减少页面加载时间\n\n`;

  markdown += `### 低优先级修复\n`;
  markdown += `1. **用户体验优化** - 改进交互设计\n`;
  markdown += `2. **移动端适配** - 优化移动设备显示\n`;
  markdown += `3. **代码质量** - 重构和优化代码结构\n\n`;

  markdown += `## 🔍 详细报告链接\n\n`;
  Object.keys(categoryResults).forEach(category => {
    const jsonReport = `./test-results/${category}/${category}-test-report.json`;
    const mdReport = `./test-results/${category}/${category}-test-report.md`;
    markdown += `- **${category.toUpperCase()}**: [JSON报告](${jsonReport}) | [Markdown报告](${mdReport})\n`;
  });

  markdown += `\n## 📸 截图目录\n\n`;
  Object.keys(categoryResults).forEach(category => {
    markdown += `- **${category.toUpperCase()}**: ./test-results/${category}/\n`;
  });

  return markdown;
}

function getPriorityEmoji(priority) {
  const emojis = { 1: '🔴', 2: '🟡', 3: '🟢' };
  return emojis[priority] || '⚪';
}

function getEmojiForResult(result) {
  if (!result.success) return '❌';
  if (result.duration > 60000) return '⚠️'; // 超过1分钟
  return '✅';
}

// 主函数
async function main() {
  const startTime = new Date();

  colorLog('magenta', '=' .repeat(60));
  colorLog('magenta', '🔍 侧边栏错误检测系统');
  colorLog('magenta', '=' .repeat(60));

  colorLog('blue', `\n📋 将执行 ${TEST_SCRIPTS.length} 个测试脚本:\n`);

  TEST_SCRIPTS.forEach((script, index) => {
    colorLog('cyan', `${index + 1}. ${script.name}`);
    colorLog('white', `   类别: ${script.category}`);
    colorLog('white', `   描述: ${script.description}`);
    colorLog('white', `   优先级: ${getPriorityEmoji(script.priority)} ${script.priority}`);
  });

  // 检查测试脚本是否存在
  colorLog('\nyellow', '🔍 检查测试脚本...');
  const missingScripts = TEST_SCRIPTS.filter(config => !fs.existsSync(config.script));

  if (missingScripts.length > 0) {
    colorLog('red', '\n❌ 以下测试脚本不存在:');
    missingScripts.forEach(script => {
      colorLog('red', `  - ${script.name}: ${script.script}`);
    });
    process.exit(1);
  }

  colorLog('green', '✅ 所有测试脚本都存在\n');

  // 执行测试脚本
  const testResults = [];

  for (const testConfig of TEST_SCRIPTS) {
    const result = await runTestScript(testConfig);
    testResults.push(result);

    // 添加脚本间的延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 生成汇总报告
  colorLog('\ncyan', '📊 生成汇总报告...');
  const summaryReport = generateSummaryReport(testResults);

  const summaryPath = `${resultsDir}/sidebar-error-detection-summary-${Date.now()}.md`;
  fs.writeFileSync(summaryPath, summaryReport);

  colorLog('green', `✅ 汇总报告已保存到: ${summaryPath}`);

  // 显示最终统计
  const endTime = new Date();
  const totalTime = endTime - startTime;

  colorLog('\nmagenta', '=' .repeat(60));
  colorLog('magenta', '📊 测试完成统计');
  colorLog('magenta', '=' .repeat(60));

  const successCount = testResults.filter(r => r.success).length;
  const failureCount = testResults.length - successCount;

  colorLog('green', `✅ 成功: ${successCount}/${testResults.length}`);
  colorLog('red', `❌ 失败: ${failureCount}/${testResults.length}`);
  colorLog('blue', `⏱️  总耗时: ${totalTime}ms`);

  if (failureCount > 0) {
    colorLog('\nyellow', '⚠️ 失败的测试:');
    testResults.filter(r => !r.success).forEach(result => {
      colorLog('red', `  - ${result.name}: ${result.error}`);
    });
  }

  colorLog('\ncyan', '📝 建议后续操作:');
  colorLog('white', '1. 查看汇总报告了解整体情况');
  colorLog('white', '2. 查看各个类别的详细报告');
  colorLog('white', '3. 按优先级修复发现的问题');
  colorLog('white', '4. 重新运行测试验证修复效果');
  colorLog('white', '5. 持续监控和改进系统质量');

  process.exit(failureCount > 0 ? 1 : 0);
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  colorLog('red', `❌ 未捕获的异常: ${error.message}`);
  colorLog('red', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  colorLog('red', `❌ 未处理的Promise拒绝: ${reason}`);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    colorLog('red', `❌ 主函数执行失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTestScript, generateSummaryReport, TEST_SCRIPTS };