#!/usr/bin/env node

/**
 * 移动端测试运行脚本
 * 用于执行教师端和管理中心的所有测试用例
 * 支持单独运行或批量运行测试
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  testFiles: {
    teacherCenter: [
      'TC-011-教师工作台测试.spec.js',
      'TC-012-教学活动管理测试.spec.js',
      'TC-013-考勤管理测试.spec.js',
      'TC-014-任务管理测试.spec.js',
      'TC-015-客户跟进测试.spec.js'
    ],
    centers: [
      'TC-016-活动中心管理测试.spec.js'
      // 可以添加更多管理中心测试文件
    ]
  },
  testPaths: {
    teacherCenter: 'tests/mobile/teacher-center',
    centers: 'tests/mobile/centers'
  },
  coverageThreshold: {
    statements: 85,
    branches: 80,
    functions: 85,
    lines: 85
  }
};

class MobileTestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      coverage: {},
      duration: 0
    };
    this.startTime = Date.now();
  }

  /**
   * 运行教师端测试
   */
  async runTeacherCenterTests() {
    console.log('🎓 开始运行教师端测试用例...\n');

    const testFiles = TEST_CONFIG.testFiles.teacherCenter;
    const testPath = TEST_CONFIG.testPaths.teacherCenter;

    for (const testFile of testFiles) {
      await this.runSingleTest(testPath, testFile, '教师端');
    }
  }

  /**
   * 运行管理中心测试
   */
  async runCentersTests() {
    console.log('🏢 开始运行管理中心测试用例...\n');

    const testFiles = TEST_CONFIG.testFiles.centers;
    const testPath = TEST_CONFIG.testPaths.centers;

    for (const testFile of testFiles) {
      await this.runSingleTest(testPath, testFile, '管理中心');
    }
  }

  /**
   * 运行单个测试文件
   */
  async runSingleTest(testPath, testFile, category) {
    const fullPath = path.join('src', testPath, testFile);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  测试文件不存在: ${fullPath}`);
      return;
    }

    console.log(`📋 运行测试: ${category} - ${testFile}`);

    try {
      const startTime = Date.now();

      // 执行测试
      const result = execSync(`npm run test ${fullPath}`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000 // 60秒超时
      });

      const duration = Date.now() - startTime;

      // 解析测试结果
      const testResult = this.parseTestResult(result);

      this.results.total += testResult.total;
      this.results.passed += testResult.passed;
      this.results.failed += testResult.failed;

      console.log(`✅ ${category} - ${testFile}: ${testResult.passed}/${testResult.total} 通过 (${duration}ms)\n`);

    } catch (error) {
      console.log(`❌ ${category} - ${testFile}: 测试失败`);
      console.log(`错误信息: ${error.message}\n`);

      this.results.total += 1;
      this.results.failed += 1;
    }
  }

  /**
   * 解析测试结果
   */
  parseTestResult(output) {
    // 简单的Vitest输出解析
    const lines = output.split('\n');
    const summaryLine = lines.find(line => line.includes('Test Files') || line.includes('Tests'));

    if (summaryLine) {
      const match = summaryLine.match(/(\d+)\s+passed\s+(\d+)\s+failed/);
      if (match) {
        return {
          total: parseInt(match[1]) + parseInt(match[2]),
          passed: parseInt(match[1]),
          failed: parseInt(match[2])
        };
      }
    }

    // 默认返回
    return {
      total: 1,
      passed: 1,
      failed: 0
    };
  }

  /**
   * 生成测试覆盖率报告
   */
  async generateCoverageReport() {
    console.log('📊 生成测试覆盖率报告...\n');

    try {
      // 运行覆盖率测试
      const coverageResult = execSync('npm run test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log('✅ 覆盖率报告生成完成');
      console.log('📈 查看详细报告: file:///coverage/lcov-report/index.html\n');

      // 解析覆盖率数据
      const coverage = this.parseCoverageResult(coverageResult);
      this.results.coverage = coverage;

    } catch (error) {
      console.log('❌ 覆盖率报告生成失败');
      console.log(`错误信息: ${error.message}\n`);
    }
  }

  /**
   * 解析覆盖率结果
   */
  parseCoverageResult(output) {
    const coverage = {};
    const lines = output.split('\n');

    lines.forEach(line => {
      if (line.includes('Statements')) {
        const match = line.match(/Statements\s+:\s+([\d.]+)/);
        if (match) coverage.statements = parseFloat(match[1]);
      }
      if (line.includes('Branches')) {
        const match = line.match(/Branches\s+:\s+([\d.]+)/);
        if (match) coverage.branches = parseFloat(match[1]);
      }
      if (line.includes('Functions')) {
        const match = line.match(/Functions\s+:\s+([\d.]+)/);
        if (match) coverage.functions = parseFloat(match[1]);
      }
      if (line.includes('Lines')) {
        const match = line.match(/Lines\s+:\s+([\d.]+)/);
        if (match) coverage.lines = parseFloat(match[1]);
      }
    });

    return coverage;
  }

  /**
   * 验证测试覆盖率
   */
  validateCoverage() {
    const threshold = TEST_CONFIG.coverageThreshold;
    const coverage = this.results.coverage;

    if (!coverage || Object.keys(coverage).length === 0) {
      console.log('⚠️  无法获取覆盖率数据');
      return false;
    }

    let allPassed = true;

    Object.keys(threshold).forEach(metric => {
      const actual = coverage[metric] || 0;
      const required = threshold[metric];

      if (actual < required) {
        console.log(`❌ ${metric} 覆盖率不达标: ${actual}% (要求: ${required}%)`);
        allPassed = false;
      } else {
        console.log(`✅ ${metric} 覆盖率达标: ${actual}%`);
      }
    });

    return allPassed;
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    this.results.duration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(50));
    console.log('📋 测试执行摘要');
    console.log('='.repeat(50));
    console.log(`总测试数: ${this.results.total}`);
    console.log(`通过: ${this.results.passed}`);
    console.log(`失败: ${this.results.failed}`);
    console.log(`成功率: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
    console.log(`总耗时: ${this.results.duration}ms`);
    console.log('='.repeat(50));

    if (Object.keys(this.results.coverage).length > 0) {
      console.log('\n📊 测试覆盖率:');
      Object.entries(this.results.coverage).forEach(([metric, value]) => {
        console.log(`  ${metric}: ${value}%`);
      });
    }
  }

  /**
   * 验证严格性要求
   */
  validateStrictness() {
    console.log('\n🔍 验证严格性要求...');

    const strictnessChecks = [
      {
        name: '测试覆盖率要求',
        check: () => this.validateCoverage()
      },
      {
        name: '测试文件完整性',
        check: () => this.validateTestFileCompleteness()
      },
      {
        name: '验证工具函数存在',
        check: () => this.validateValidationHelpers()
      }
    ];

    let allPassed = true;

    strictnessChecks.forEach(({ name, check }) => {
      try {
        const passed = check();
        if (passed) {
          console.log(`✅ ${name}: 通过`);
        } else {
          console.log(`❌ ${name}: 失败`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${name}: 错误 - ${error.message}`);
        allPassed = false;
      }
    });

    return allPassed;
  }

  /**
   * 验证测试文件完整性
   */
  validateTestFileCompleteness() {
    const requiredFiles = [
      'TC-011-教师工作台测试.spec.js',
      'TC-016-活动中心管理测试.spec.js',
      '../utils/validation-helpers.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join('src', 'tests', file);
      if (!fs.existsSync(filePath)) {
        console.log(`缺少必需文件: ${filePath}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 验证验证工具函数
   */
  validateValidationHelpers() {
    const helpersPath = path.join('src', 'tests', 'utils', 'validation-helpers.js');

    if (!fs.existsSync(helpersPath)) {
      return false;
    }

    const content = fs.readFileSync(helpersPath, 'utf8');
    const requiredFunctions = [
      'validateRequiredFields',
      'validateFieldTypes',
      'strictValidationWrapper'
    ];

    return requiredFunctions.every(func => content.includes(`export function ${func}`));
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始运行移动端测试套件...\n');

    try {
      // 运行教师端测试
      await this.runTeacherCenterTests();

      // 运行管理中心测试
      await this.runCentersTests();

      // 生成覆盖率报告
      await this.generateCoverageReport();

      // 打印摘要
      this.printSummary();

      // 验证严格性要求
      const strictnessPassed = this.validateStrictness();

      // 退出码
      const exitCode = (this.results.failed === 0 && strictnessPassed) ? 0 : 1;

      if (exitCode === 0) {
        console.log('\n🎉 所有测试通过，严格性要求满足！');
      } else {
        console.log('\n❌ 测试失败或严格性要求不满足');
      }

      process.exit(exitCode);

    } catch (error) {
      console.log('\n💥 测试执行出现严重错误:');
      console.log(error.message);
      process.exit(1);
    }
  }
}

// 命令行参数处理
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    teacher: false,
    centers: false,
    coverage: false,
    help: false
  };

  args.forEach(arg => {
    switch (arg) {
      case '--teacher':
      case '-t':
        options.teacher = true;
        break;
      case '--centers':
      case '-c':
        options.centers = true;
        break;
      case '--coverage':
        options.coverage = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        console.log(`未知参数: ${arg}`);
        options.help = true;
    }
  });

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
📱 移动端测试运行器

用法:
  node run-mobile-tests.js [选项]

选项:
  -t, --teacher     只运行教师端测试
  -c, --centers     只运行管理中心测试
  --coverage        生成覆盖率报告
  -h, --help        显示此帮助信息

示例:
  node run-mobile-tests.js              # 运行所有测试
  node run-mobile-tests.js -t           # 只运行教师端测试
  node run-mobile-tests.js -c           # 只运行管理中心测试
  node run-mobile-tests.js --coverage   # 运行测试并生成覆盖率报告
`);
}

// 主程序
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  const runner = new MobileTestRunner();

  try {
    if (!options.teacher && !options.centers) {
      // 运行所有测试
      await runner.runAllTests();
    } else {
      if (options.teacher) {
        await runner.runTeacherCenterTests();
      }
      if (options.centers) {
        await runner.runCentersTests();
      }
      if (options.coverage) {
        await runner.generateCoverageReport();
      }
      runner.printSummary();
    }
  } catch (error) {
    console.error('测试运行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('程序执行失败:', error);
    process.exit(1);
  });
}

module.exports = MobileTestRunner;