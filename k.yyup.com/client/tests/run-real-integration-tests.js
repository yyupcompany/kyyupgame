/**
 * 真实环境集成测试运行脚本
 * 验证所有真实环境集成测试的执行和覆盖率
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  // 测试文件模式
  INTEGRATION_TESTS: 'tests/integration/*.test.ts',
  E2E_TESTS: 'tests/e2e/*.test.ts',
  ENVIRONMENT_TESTS: 'tests/environment/*.test.ts',

  // 覆盖率阈值
  COVERAGE_THRESHOLDS: {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90
  },

  // 性能基准
  PERFORMANCE_BENCHMARKS: {
    maxExecutionTime: 300000, // 5分钟
    maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
    minTestPassRate: 95
  }
};

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logStep(step) {
  log(`\n📋 ${step}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'magenta');
}

// 执行命令并返回结果
function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    return { success: true, output: result, error: null };
  } catch (error) {
    return {
      success: false,
      output: error.stdout,
      error: error.stderr || error.message
    };
  }
}

// 检查服务状态
function checkServices() {
  logStep('检查服务状态');

  // 检查前端服务
  const frontendResult = execCommand('curl -f http://localhost:5173 > /dev/null 2>&1');
  if (!frontendResult.success) {
    logWarning('前端服务未运行 (localhost:5173)');
    logInfo('请先启动前端服务: npm run start:frontend');
    return false;
  }
  logSuccess('前端服务运行正常');

  // 检查后端服务
  const backendResult = execCommand('curl -f http://localhost:3000/api/health > /dev/null 2>&1');
  if (!backendResult.success) {
    logWarning('后端服务未运行 (localhost:3000)');
    logInfo('请先启动后端服务: npm run start:backend');
    return false;
  }
  logSuccess('后端服务运行正常');

  return true;
}

// 运行集成测试
function runIntegrationTests() {
  logStep('运行真实环境集成测试');

  const startTime = Date.now();

  const testCommand = `npm run test:integration -- --run ${TEST_CONFIG.INTEGRATION_TESTS}`;
  logInfo(`执行命令: ${testCommand}`);

  const result = execCommand(testCommand);
  const executionTime = Date.now() - startTime;

  if (result.success) {
    logSuccess(`集成测试完成 (${executionTime}ms)`);
    console.log(result.output);
    return { success: true, executionTime, output: result.output };
  } else {
    logError(`集成测试失败 (${executionTime}ms)`);
    console.error(result.error);
    return { success: false, executionTime, error: result.error };
  }
}

// 运行E2E测试
function runE2ETests() {
  logStep('运行真实场景E2E测试');

  const startTime = Date.now();

  const testCommand = `npm run test:e2e -- ${TEST_CONFIG.E2E_TESTS}`;
  logInfo(`执行命令: ${testCommand}`);

  const result = execCommand(testCommand);
  const executionTime = Date.now() - startTime;

  if (result.success) {
    logSuccess(`E2E测试完成 (${executionTime}ms)`);
    console.log(result.output);
    return { success: true, executionTime, output: result.output };
  } else {
    logError(`E2E测试失败 (${executionTime}ms)`);
    console.error(result.error);
    return { success: false, executionTime, error: result.error };
  }
}

// 运行环境一致性测试
function runEnvironmentTests() {
  logStep('运行环境一致性验证测试');

  const startTime = Date.now();

  const testCommand = `npm run test -- --run ${TEST_CONFIG.ENVIRONMENT_TESTS}`;
  logInfo(`执行命令: ${testCommand}`);

  const result = execCommand(testCommand);
  const executionTime = Date.now() - startTime;

  if (result.success) {
    logSuccess(`环境一致性测试完成 (${executionTime}ms)`);
    console.log(result.output);
    return { success: true, executionTime, output: result.output };
  } else {
    logError(`环境一致性测试失败 (${executionTime}ms)`);
    console.error(result.error);
    return { success: false, executionTime, error: result.error };
  }
}

// 生成覆盖率报告
function generateCoverageReport() {
  logStep('生成测试覆盖率报告');

  const coverageCommand = 'npm run test:coverage';
  const result = execCommand(coverageCommand);

  if (result.success) {
    logSuccess('覆盖率报告生成完成');

    // 检查覆盖率阈值
    const coverageSummary = extractCoverageSummary(result.output);
    validateCoverageThresholds(coverageSummary);

    return { success: true, coverage: coverageSummary };
  } else {
    logError('覆盖率报告生成失败');
    return { success: false, error: result.error };
  }
}

// 提取覆盖率摘要
function extractCoverageSummary(output) {
  const coverageLines = output.split('\n');
  const summary = {};

  for (const line of coverageLines) {
    if (line.includes('All files')) {
      const parts = line.trim().split(/\s+/).filter(p => p && p !== '|');
      if (parts.length >= 5) {
        summary.statements = parseFloat(parts[1]);
        summary.branches = parseFloat(parts[2]);
        summary.functions = parseFloat(parts[3]);
        summary.lines = parseFloat(parts[4]);
      }
      break;
    }
  }

  return summary;
}

// 验证覆盖率阈值
function validateCoverageThresholds(coverage) {
  logInfo('验证测试覆盖率阈值');

  const thresholds = TEST_CONFIG.COVERAGE_THRESHOLDS;
  let allPassed = true;

  for (const [metric, threshold] of Object.entries(thresholds)) {
    const value = coverage[metric];
    if (value !== undefined) {
      if (value >= threshold) {
        logSuccess(`${metric}: ${value.toFixed(1)}% (阈值: ${threshold}%)`);
      } else {
        logError(`${metric}: ${value.toFixed(1)}% (阈值: ${threshold}%)`);
        allPassed = false;
      }
    } else {
      logWarning(`${metric}: 未找到覆盖率数据`);
    }
  }

  return allPassed;
}

// 性能基准测试
function runPerformanceBenchmarks() {
  logStep('运行性能基准测试');

  const startTime = Date.now();

  // 内存使用测试
  const memoryBefore = process.memoryUsage();

  // 运行所有测试来测量性能
  const allTestCommand = `npm run test:all -- --run --reporter=json`;
  const result = execCommand(allTestCommand);

  const memoryAfter = process.memoryUsage();
  const executionTime = Date.now() - startTime;

  // 分析性能
  const memoryDelta = memoryAfter.heapUsed - memoryBefore.heapUsed;

  logInfo(`执行时间: ${executionTime}ms`);
  logInfo(`内存使用变化: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);

  const performanceReport = {
    executionTime,
    memoryDelta,
    withinTimeLimit: executionTime < TEST_CONFIG.PERFORMANCE_BENCHMARKS.maxExecutionTime,
    withinMemoryLimit: memoryDelta < TEST_CONFIG.PERFORMANCE_BENCHMARKS.maxMemoryUsage
  };

  if (performanceReport.withinTimeLimit) {
    logSuccess('执行时间在基准范围内');
  } else {
    logWarning('执行时间超出基准范围');
  }

  if (performanceReport.withinMemoryLimit) {
    logSuccess('内存使用在基准范围内');
  } else {
    logWarning('内存使用超出基准范围');
  }

  return performanceReport;
}

// 生成测试报告
function generateTestReport(results) {
  logStep('生成综合测试报告');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.total,
      passedTests: results.passed,
      failedTests: results.failed,
      passRate: ((results.passed / results.total) * 100).toFixed(1) + '%',
      executionTime: results.totalExecutionTime + 'ms'
    },
    coverage: results.coverage,
    performance: results.performance,
    testSuites: {
      integration: results.integration?.success ? 'PASSED' : 'FAILED',
      e2e: results.e2e?.success ? 'PASSED' : 'FAILED',
      environment: results.environment?.success ? 'PASSED' : 'FAILED'
    }
  };

  // 保存报告到文件
  const reportPath = path.join(__dirname, 'real-integration-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  logSuccess(`测试报告已保存: ${reportPath}`);

  // 输出报告摘要
  logSection('测试报告摘要');
  log(`总测试数: ${report.summary.totalTests}`, 'bright');
  log(`通过测试: ${report.summary.passedTests}`, 'green');
  log(`失败测试: ${report.summary.failedTests}`, 'red');
  log(`通过率: ${report.summary.passRate}`, report.summary.passRate === '100.0%' ? 'green' : 'yellow');
  log(`执行时间: ${report.summary.executionTime}`, 'blue');

  if (report.coverage) {
    logSection('覆盖率报告');
    log(`语句覆盖率: ${report.coverage.statements?.toFixed(1) || 'N/A'}%`,
         report.coverage.statements >= TEST_CONFIG.COVERAGE_THRESHOLDS.statements ? 'green' : 'yellow');
    log(`分支覆盖率: ${report.coverage.branches?.toFixed(1) || 'N/A'}%`,
         report.coverage.branches >= TEST_CONFIG.COVERAGE_THRESHOLDS.branches ? 'green' : 'yellow');
    log(`函数覆盖率: ${report.coverage.functions?.toFixed(1) || 'N/A'}%`,
         report.coverage.functions >= TEST_CONFIG.COVERAGE_THRESHOLDS.functions ? 'green' : 'yellow');
    log(`行覆盖率: ${report.coverage.lines?.toFixed(1) || 'N/A'}%`,
         report.coverage.lines >= TEST_CONFIG.COVERAGE_THRESHOLDS.lines ? 'green' : 'yellow');
  }

  return report;
}

// 主执行函数
async function main() {
  try {
    logSection('真实环境集成测试验证器');
    logInfo('开始验证所有真实环境集成测试的执行和覆盖率...');

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      totalExecutionTime: 0,
      integration: null,
      e2e: null,
      environment: null,
      coverage: null,
      performance: null
    };

    // 1. 检查服务状态
    if (!checkServices()) {
      logError('服务检查失败，退出测试');
      process.exit(1);
    }

    // 2. 运行集成测试
    results.integration = runIntegrationTests();
    if (results.integration.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    results.total++;
    results.totalExecutionTime += results.integration.executionTime || 0;

    // 3. 运行E2E测试
    results.e2e = runE2ETests();
    if (results.e2e.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    results.total++;
    results.totalExecutionTime += results.e2e.executionTime || 0;

    // 4. 运行环境一致性测试
    results.environment = runEnvironmentTests();
    if (results.environment.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    results.total++;
    results.totalExecutionTime += results.environment.executionTime || 0;

    // 5. 生成覆盖率报告
    results.coverage = generateCoverageReport();

    // 6. 运行性能基准测试
    results.performance = runPerformanceBenchmarks();

    // 7. 生成综合报告
    const report = generateTestReport(results);

    // 8. 最终状态判断
    logSection('测试完成状态');

    const allTestsPassed = results.integration?.success &&
                          results.e2e?.success &&
                          results.environment?.success;

    const coverageMeetsThresholds = results.coverage?.success;

    const performanceWithinLimits = results.performance?.withinTimeLimit &&
                                   results.performance?.withinMemoryLimit;

    if (allTestsPassed && coverageMeetsThresholds && performanceWithinLimits) {
      logSuccess('🎉 所有真实环境集成测试验证通过！');
      logSuccess('✅ 测试覆盖率达标');
      logSuccess('✅ 性能指标在基准范围内');
      process.exit(0);
    } else {
      logError('❌ 部分测试验证失败');

      if (!allTestsPassed) {
        logError('- 存在失败的测试套件');
      }

      if (!coverageMeetsThresholds) {
        logError('- 测试覆盖率未达标');
      }

      if (!performanceWithinLimits) {
        logError('- 性能指标超出基准范围');
      }

      process.exit(1);
    }

  } catch (error) {
    logError(`测试执行过程中发生错误: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logError(`未捕获的异常: ${error.message}`);
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`未处理的Promise拒绝: ${reason}`);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  runIntegrationTests,
  runE2ETests,
  runEnvironmentTests,
  generateCoverageReport,
  generateTestReport,
  TEST_CONFIG
};