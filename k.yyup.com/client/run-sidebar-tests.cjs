// 快速执行侧边栏测试的便捷脚本
const { execSync } = require('child_process');
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

// 显示帮助信息
function showHelp() {
  colorLog('cyan', '\n🔍 侧边栏错误检测系统 - 快速执行脚本\n');
  colorLog('white', '用法: node run-sidebar-tests.cjs [选项]\n');
  colorLog('yellow', '选项:');
  colorLog('white', '  all           - 运行所有测试脚本 (默认)');
  colorLog('white', '  centers       - 只运行centers目录测试');
  colorLog('white', '  teacher       - 只运行teacher-center测试');
  colorLog('white', '  parent        - 只运行parent-center测试');
  colorLog('white', '  report        - 只生成汇总报告');
  colorLog('white', '  help          - 显示此帮助信息\n');

  colorLog('yellow', '示例:');
  colorLog('white', '  node run-sidebar-tests.cjs           # 运行所有测试');
  colorLog('white', '  node run-sidebar-tests.cjs centers   # 只测试centers目录');
  colorLog('white', '  node run-sidebar-tests.cjs teacher   # 只测试teacher-center\n');
}

// 检查服务器状态
function checkServerStatus() {
  try {
    colorLog('blue', '🔍 检查服务器状态...');

    // 检查前端服务器
    try {
      const frontendResponse = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173', { timeout: 5000 });
      if (frontendResponse === '200') {
        colorLog('green', '✅ 前端服务器运行正常 (http://localhost:5173)');
      } else {
        colorLog('red', `❌ 前端服务器状态异常: ${frontendResponse}`);
        return false;
      }
    } catch (error) {
      colorLog('red', '❌ 无法连接到前端服务器 (http://localhost:5173)');
      colorLog('yellow', '请确保前端服务器正在运行: cd client && npm run dev');
      return false;
    }

    // 检查后端服务器
    try {
      const backendResponse = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health', { timeout: 5000 });
      if (backendResponse === '200') {
        colorLog('green', '✅ 后端服务器运行正常 (http://localhost:3000)');
      } else {
        colorLog('red', `❌ 后端服务器状态异常: ${backendResponse}`);
        return false;
      }
    } catch (error) {
      colorLog('red', '❌ 无法连接到后端服务器 (http://localhost:3000)');
      colorLog('yellow', '请确保后端服务器正在运行: cd server && npm run dev');
      return false;
    }

    return true;
  } catch (error) {
    colorLog('red', `❌ 服务器状态检查失败: ${error.message}`);
    return false;
  }
}

// 运行单个测试
function runSingleTest(testName, scriptPath) {
  try {
    colorLog('blue', `\n🚀 开始运行: ${testName}`);
    const startTime = Date.now();

    execSync(`node ${scriptPath}`, {
      stdio: 'inherit',
      timeout: 300000 // 5分钟超时
    });

    const duration = Date.now() - startTime;
    colorLog('green', `✅ ${testName} 执行完成 (耗时: ${duration}ms)`);

    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    colorLog('red', `❌ ${testName} 执行失败 (耗时: ${duration}ms): ${error.message}`);
    return false;
  }
}

// 生成汇总报告
function generateReport() {
  try {
    colorLog('blue', '\n📊 生成汇总报告...');
    execSync('node sidebar-test-manager.cjs report', { stdio: 'inherit' });
    colorLog('green', '✅ 汇总报告生成完成');
    return true;
  } catch (error) {
    colorLog('red', `❌ 汇总报告生成失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  if (command === 'help') {
    showHelp();
    return;
  }

  colorLog('cyan', '=' .repeat(50));
  colorLog('cyan', '🔍 侧边栏错误检测系统');
  colorLog('cyan', '=' .repeat(50));

  // 检查服务器状态
  if (!checkServerStatus()) {
    colorLog('red', '\n❌ 服务器状态检查失败，无法继续测试');
    colorLog('yellow', '请启动服务器后重新运行测试');
    process.exit(1);
  }

  const startTime = Date.now();
  let successCount = 0;
  let totalTests = 0;

  switch (command) {
    case 'centers':
      totalTests = 1;
      if (runSingleTest('Centers Directory Test', './test-centers-comprehensive.cjs')) {
        successCount++;
      }
      break;

    case 'teacher':
      totalTests = 1;
      if (runSingleTest('Teacher Center Test', './test-teacher-center.cjs')) {
        successCount++;
      }
      break;

    case 'parent':
      totalTests = 1;
      if (runSingleTest('Parent Center Test', './test-parent-center.cjs')) {
        successCount++;
      }
      break;

    case 'report':
      generateReport();
      return;

    case 'all':
    default:
      totalTests = 4; // 3个测试 + 1个汇总报告
      colorLog('yellow', '\n📋 执行所有测试脚本...\n');

      // 运行各个测试
      if (runSingleTest('Centers Directory Test', './test-centers-comprehensive.cjs')) {
        successCount++;
      }

      if (runSingleTest('Teacher Center Test', './test-teacher-center.cjs')) {
        successCount++;
      }

      if (runSingleTest('Parent Center Test', './test-parent-center.cjs')) {
        successCount++;
      }

      // 生成汇总报告
      colorLog('blue', '\n📊 生成汇总报告...');
      if (generateReport()) {
        successCount++;
      }
      break;
  }

  // 显示最终结果
  const totalTime = Date.now() - startTime;
  const failureCount = totalTests - successCount;

  colorLog('\ncyan', '=' .repeat(50));
  colorLog('cyan', '📊 执行完成统计');
  colorLog('cyan', '=' .repeat(50));

  colorLog('green', `✅ 成功: ${successCount}/${totalTests}`);
  colorLog('red', `❌ 失败: ${failureCount}/${totalTests}`);
  colorLog('blue', `⏱️  总耗时: ${totalTime}ms`);

  if (failureCount > 0) {
    colorLog('\nyellow', '⚠️ 部分测试失败，请查看详细报告');
    colorLog('yellow', '📁 报告位置: ./test-results/');
  } else {
    colorLog('\ngreen', '🎉 所有测试执行完成！');
    colorLog('green', '📁 查看报告: ./test-results/sidebar-error-detection/');
  }

  // 显示报告位置
  colorLog('\ncyan', '📁 生成的报告和截图:');
  colorLog('white', '- 汇总报告: ./test-results/sidebar-error-detection/sidebar-error-detection-summary-*.md');
  colorLog('white', '- Centers测试: ./test-results/centers/');
  colorLog('white', '- Teacher测试: ./test-results/teacher-center/');
  colorLog('white', '- Parent测试: ./test-results/parent-center/');

  process.exit(failureCount > 0 ? 1 : 0);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    colorLog('red', `❌ 执行失败: ${error.message}`);
    process.exit(1);
  });
}