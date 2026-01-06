#!/usr/bin/env node

/**
 * 移动端测试运行脚本
 * 运行所有移动端测试并生成详细报告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  // 测试目录
  testDirs: [
    'client/src/tests/mobile',
    'client/tests/mobile',
    'client/src/tests/unit/pages/mobile'
  ],

  // 测试文件模式
  testPatterns: [
    '**/*.test.ts',
    '**/*.spec.ts'
  ],

  // 排除模式
  excludePatterns: [
    '**/*.d.ts',
    '**/node_modules/**',
    '**/coverage/**'
  ],

  // 输出目录
  outputDir: 'mobile-test-reports',

  // 覆盖率阈值
  coverageThresholds: {
    statements: 85,
    branches: 80,
    functions: 85,
    lines: 85
  }
};

// 颜色输出
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

// 创建输出目录
function ensureOutputDir() {
  if (!fs.existsSync(TEST_CONFIG.outputDir)) {
    fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
  }
}

// 查找所有移动端测试文件
function findMobileTestFiles() {
  const testFiles = [];

  TEST_CONFIG.testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = findFilesRecursive(dir, TEST_CONFIG.testPatterns, TEST_CONFIG.excludePatterns);
      testFiles.push(...files);
    }
  });

  return [...new Set(testFiles)]; // 去重
}

// 递归查找文件
function findFilesRecursive(dir, patterns, excludePatterns) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      // 检查排除模式
      if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
        continue;
      }

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        // 检查文件模式匹配
        if (patterns.some(pattern => fullPath.endsWith(pattern.replace('**/', '')))) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

// 运行测试
function runTests(testFiles, coverage = true) {
  log('\n🚀 开始运行移动端测试...', 'cyan');
  log(`📁 找到 ${testFiles.length} 个测试文件`, 'blue');

  const vitestConfig = path.join(process.cwd(), 'client/vitest.config.ts');
  const coverageDir = path.join(process.cwd(), TEST_CONFIG.outputDir, 'coverage');

  let command = `cd client && npx vitest run`;

  if (coverage) {
    command += ` --coverage --coverage.reporters=text,json --coverage.outputDirectory=${coverageDir}`;
  }

  // 添加配置文件
  if (fs.existsSync(vitestConfig)) {
    command += ` --config=${vitestConfig}`;
  }

  // 添加测试文件
  if (testFiles.length > 0) {
    const relativeFiles = testFiles.map(file => path.relative(path.join(process.cwd(), 'client'), file));
    command += ` ${relativeFiles.join(' ')}`;
  }

  try {
    log(`\n📋 执行命令: ${command}`, 'yellow');
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: process.cwd()
    });

    return { success: true, output };
  } catch (error) {
    log(`\n❌ 测试执行失败: ${error.message}`, 'red');
    return {
      success: false,
      output: error.output || error.stdout || error.stderr,
      error: error.message
    };
  }
}

// 生成测试报告
function generateTestReport(testResults, coverageData) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(process.cwd(), TEST_CONFIG.outputDir, `mobile-test-report-${timestamp}.json`);

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: testResults.total || 0,
      passedTests: testResults.passed || 0,
      failedTests: testResults.failed || 0,
      skippedTests: testResults.skipped || 0,
      successRate: testResults.total ? Math.round((testResults.passed / testResults.total) * 100) : 0,
      duration: testResults.duration || 0
    },
    coverage: coverageData || {},
    testFiles: findMobileTestFiles(),
    config: TEST_CONFIG,
    recommendations: generateRecommendations(testResults, coverageData)
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📊 测试报告已生成: ${reportPath}`, 'green');

  return report;
}

// 生成改进建议
function generateRecommendations(testResults, coverageData) {
  const recommendations = [];

  // 测试通过率建议
  if (testResults.total && testResults.passed / testResults.total < 0.95) {
    recommendations.push({
      type: 'test_quality',
      priority: 'high',
      message: '测试通过率低于95%，建议检查失败的测试用例',
      action: '修复失败的测试用例，确保代码质量'
    });
  }

  // 覆盖率建议
  if (coverageData.coverageMap) {
    const { statements, branches, functions, lines } = TEST_CONFIG.coverageThresholds;

    if (coverageData.coverageMap.statements?.pct < statements) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        message: `语句覆盖率${coverageData.coverageMap.statements?.pct}%低于阈值${statements}%`,
        action: '增加测试用例以提高语句覆盖率'
      });
    }

    if (coverageData.coverageMap.branches?.pct < branches) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        message: `分支覆盖率${coverageData.coverageMap.branches?.pct}%低于阈值${branches}%`,
        action: '增加分支测试用例以提高分支覆盖率'
      });
    }
  }

  // 测试文件数量建议
  const mobileVueFiles = findFilesRecursive('client/src/pages/mobile', ['**/*.vue'], ['**/node_modules/**']);
  const mobileTestFiles = findMobileTestFiles();

  if (mobileTestFiles.length < mobileVueFiles.length * 0.8) {
    recommendations.push({
      type: 'test_coverage',
      priority: 'high',
      message: `移动端测试文件数量(${mobileTestFiles.length})相对于Vue文件数量(${mobileVueFiles.length})不足`,
      action: '为缺少测试的移动端页面创建测试用例'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'congratulations',
      priority: 'info',
      message: '移动端测试质量优秀！继续保持。',
      action: '定期运行测试以保持代码质量'
    });
  }

  return recommendations;
}

// 读取覆盖率数据
function readCoverageData() {
  const coveragePath = path.join(process.cwd(), TEST_CONFIG.outputDir, 'coverage', 'coverage-final.json');

  if (fs.existsSync(coveragePath)) {
    try {
      const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      return { coverageMap: coverageData };
    } catch (error) {
      log(`⚠️  读取覆盖率数据失败: ${error.message}`, 'yellow');
    }
  }

  return {};
}

// 解析测试结果
function parseTestResults(output) {
  // 简化的测试结果解析
  const lines = output.split('\n');
  const result = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  };

  lines.forEach(line => {
    // 解析 Vitest 输出格式
    const testMatch = line.match(/Test Files\s+(\d+)\s+passed\s*\((\d+)\)/);
    if (testMatch) {
      result.total = parseInt(testMatch[1]);
      result.passed = parseInt(testMatch[2]);
    }

    const failMatch = line.match(/(\d+)\s+failed/);
    if (failMatch) {
      result.failed = parseInt(failMatch[1]);
    }

    const skipMatch = line.match(/(\d+)\s+skipped/);
    if (skipMatch) {
      result.skipped = parseInt(skipMatch[1]);
    }

    const timeMatch = line.match(/Test Files\s+(\d+)\s+\((\d+)\)\s+\[(\d+\.?\d*)\s*s\]/);
    if (timeMatch) {
      result.duration = parseFloat(timeMatch[3]);
    }
  });

  return result;
}

// 显示摘要报告
function displaySummary(testResults, report) {
  log('\n' + '='.repeat(60), 'cyan');
  log('📱 移动端测试摘要报告', 'bright');
  log('='.repeat(60), 'cyan');

  log(`\n📊 测试结果:`, 'blue');
  log(`   总测试数: ${testResults.total}`, 'reset');
  log(`   ✅ 通过: ${testResults.passed}`, 'green');
  log(`   ❌ 失败: ${testResults.failed}`, 'red');
  log(`   ⏭️  跳过: ${testResults.skipped}`, 'yellow');
  log(`   📈 通过率: ${testResults.successRate}%`, testResults.successRate >= 95 ? 'green' : 'yellow');

  log(`\n⚡ 执行时间: ${testResults.duration.toFixed(2)}秒`, 'blue');

  log(`\n📁 测试覆盖:`, 'blue');
  const mobileVueFiles = findFilesRecursive('client/src/pages/mobile', ['**/*.vue'], ['**/node_modules/**']);
  log(`   Vue页面: ${mobileVueFiles.length} 个`, 'reset');
  log(`   测试文件: ${findMobileTestFiles().length} 个`, 'reset');

  if (report.coverage.coverageMap) {
    const cov = report.coverage.coverageMap;
    log(`\n📊 覆盖率:`, 'blue');
    log(`   语句: ${cov.statements?.pct || 0}%`, cov.statements?.pct >= 85 ? 'green' : 'yellow');
    log(`   分支: ${cov.branches?.pct || 0}%`, cov.branches?.pct >= 80 ? 'green' : 'yellow');
    log(`   函数: ${cov.functions?.pct || 0}%`, cov.functions?.pct >= 85 ? 'green' : 'yellow');
    log(`   行数: ${cov.lines?.pct || 0}%`, cov.lines?.pct >= 85 ? 'green' : 'yellow');
  }

  if (report.recommendations.length > 0) {
    log(`\n💡 改进建议:`, 'yellow');
    report.recommendations.forEach((rec, index) => {
      const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵';
      log(`   ${index + 1}. ${priorityIcon} ${rec.message}`, 'reset');
    });
  }

  log('\n' + '='.repeat(60), 'cyan');
}

// 主函数
function main() {
  try {
    log('🎯 移动端测试自动化工具', 'bright');
    log('🚀 开始运行移动端完整测试套件...\n', 'cyan');

    // 确保输出目录存在
    ensureOutputDir();

    // 查找测试文件
    const testFiles = findMobileTestFiles();

    if (testFiles.length === 0) {
      log('⚠️  未找到移动端测试文件', 'yellow');
      log('请检查测试文件路径配置', 'yellow');
      process.exit(1);
    }

    // 运行测试
    const testResult = runTests(testFiles, true);

    if (!testResult.success) {
      log('❌ 测试执行失败', 'red');
    }

    // 解析测试结果
    const testResults = parseTestResults(testResult.output || '');

    // 读取覆盖率数据
    const coverageData = readCoverageData();

    // 生成报告
    const report = generateTestReport(testResults, coverageData);

    // 显示摘要
    displaySummary(testResults, report);

    // 根据结果设置退出码
    if (testResults.failed > 0 || testResults.successRate < 95) {
      log('\n❌ 存在测试失败或通过率不足，请检查并修复', 'red');
      process.exit(1);
    } else {
      log('\n✅ 所有测试通过，移动端测试质量优秀！', 'green');
      process.exit(0);
    }

  } catch (error) {
    log(`\n💥 执行过程中发生错误: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📱 移动端测试运行工具

用法: node scripts/run-mobile-tests.js [选项]

选项:
  --help, -h     显示帮助信息
  --no-coverage 跳过覆盖率测试
  --watch       监听模式

示例:
  node scripts/run-mobile-tests.js
  node scripts/run-mobile-tests.js --no-coverage
`);
  process.exit(0);
}

if (args.includes('--watch')) {
  log('👀 启动监听模式...', 'cyan');
  execSync('cd client && npx vitest', { stdio: 'inherit' });
} else {
  const runCoverage = !args.includes('--no-coverage');
  main();
}