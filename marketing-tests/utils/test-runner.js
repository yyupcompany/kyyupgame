/**
 * 测试运行器
 * 提供统一的测试执行和报告功能
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const TestDataSetup = require('../scripts/setup');
const TestDataCleanup = require('../scripts/cleanup');

class TestRunner {
  constructor() {
    this.config = require('../config/test-config');
    this.results = {
      startTime: null,
      endTime: null,
      duration: 0,
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
  }

  /**
   * 执行命令并返回Promise
   */
  async executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 执行命令: ${command} ${args.join(' ')}`);

      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ code, stdout, stderr });
        } else {
          reject(new Error(`命令执行失败，退出码: ${code}\n${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`命令执行错误: ${error.message}`));
      });
    });
  }

  /**
   * 检查测试环境
   */
  async checkEnvironment() {
    console.log('🔍 检查测试环境...');

    const checks = [
      {
        name: 'Node.js版本',
        check: () => {
          const version = process.version;
          const majorVersion = parseInt(version.slice(1).split('.')[0]);
          return majorVersion >= 18;
        },
        message: 'Node.js版本需要 >= 18.0.0'
      },
      {
        name: '依赖包',
        check: () => {
          const packageJsonPath = path.join(__dirname, '../package.json');
          return fs.existsSync(packageJsonPath);
        },
        message: '缺少package.json文件'
      },
      {
        name: 'Jest配置',
        check: () => {
          const jestConfigPath = path.join(__dirname, '../jest.config.js');
          return fs.existsSync(jestConfigPath);
        },
        message: '缺少Jest配置文件'
      },
      {
        name: '测试配置',
        check: () => {
          const testConfigPath = path.join(__dirname, '../config/test-config.js');
          return fs.existsSync(testConfigPath);
        },
        message: '缺少测试配置文件'
      }
    ];

    let allPassed = true;

    for (const check of checks) {
      try {
        const passed = check.check();
        if (passed) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`❌ ${check.name}: ${check.message}`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${check.name}: 检查失败 - ${error.message}`);
        allPassed = false;
      }
    }

    if (!allPassed) {
      throw new Error('测试环境检查失败');
    }

    console.log('✅ 测试环境检查通过');
  }

  /**
   * 安装测试依赖
   */
  async installDependencies() {
    console.log('📦 安装测试依赖...');

    try {
      await this.executeCommand('npm', ['install'], {
        cwd: path.join(__dirname, '..')
      });

      console.log('✅ 依赖安装完成');
    } catch (error) {
      console.error('❌ 依赖安装失败:', error.message);
      throw error;
    }
  }

  /**
   * 设置测试数据
   */
  async setupTestData() {
    console.log('🔧 设置测试数据...');

    const setup = new TestDataSetup();

    try {
      const testData = await setup.setup();
      await setup.saveTestDataToFile();

      console.log('✅ 测试数据设置完成');
      return testData;
    } catch (error) {
      console.error('❌ 测试数据设置失败:', error.message);
      throw error;
    } finally {
      await setup.close();
    }
  }

  /**
   * 运行单元测试
   */
  async runUnitTests() {
    console.log('\n🧪 运行单元测试...');

    try {
      const result = await this.executeCommand('npx', [
        'jest',
        'unit',
        '--verbose',
        '--coverage',
        '--coverageDirectory=coverage/unit',
        '--testPathIgnorePatterns=integration,e2e'
      ], {
        cwd: path.join(__dirname, '..')
      });

      this.results.tests.unit = {
        status: 'passed',
        duration: Date.now() - this.results.startTime,
        output: result.stdout
      };

      console.log('✅ 单元测试完成');
      return result;
    } catch (error) {
      this.results.tests.unit = {
        status: 'failed',
        duration: Date.now() - this.results.startTime,
        output: error.message
      };

      console.error('❌ 单元测试失败:', error.message);
      throw error;
    }
  }

  /**
   * 运行集成测试
   */
  async runIntegrationTests() {
    console.log('\n🔗 运行集成测试...');

    try {
      const result = await this.executeCommand('npx', [
        'jest',
        'integration',
        '--verbose',
        '--coverage',
        '--coverageDirectory=coverage/integration',
        '--testPathIgnorePatterns=unit,e2e'
      ], {
        cwd: path.join(__dirname, '..')
      });

      this.results.tests.integration = {
        status: 'passed',
        duration: Date.now() - this.results.startTime,
        output: result.stdout
      };

      console.log('✅ 集成测试完成');
      return result;
    } catch (error) {
      this.results.tests.integration = {
        status: 'failed',
        duration: Date.now() - this.results.startTime,
        output: error.message
      };

      console.error('❌ 集成测试失败:', error.message);
      throw error;
    }
  }

  /**
   * 运行端到端测试
   */
  async runE2ETests() {
    console.log('\n🎭 运行端到端测试...');

    try {
      const result = await this.executeCommand('npx', [
        'jest',
        'e2e',
        '--verbose',
        '--detectOpenHandles',
        '--forceExit',
        '--testTimeout=60000'
      ], {
        cwd: path.join(__dirname, '..')
      });

      this.results.tests.e2e = {
        status: 'passed',
        duration: Date.now() - this.results.startTime,
        output: result.stdout
      };

      console.log('✅ 端到端测试完成');
      return result;
    } catch (error) {
      this.results.tests.e2e = {
        status: 'failed',
        duration: Date.now() - this.results.startTime,
        output: error.message
      };

      console.error('❌ 端到端测试失败:', error.message);
      throw error;
    }
  }

  /**
   * 运行特定类型的测试
   */
  async runTestType(testType, options = {}) {
    const testTypes = {
      unit: () => this.runUnitTests(),
      integration: () => this.runIntegrationTests(),
      e2e: () => this.runE2ETests()
    };

    if (!testTypes[testType]) {
      throw new Error(`未知的测试类型: ${testType}`);
    }

    return testTypes[testType]();
  }

  /**
   * 生成测试报告
   */
  async generateReport() {
    console.log('\n📊 生成测试报告...');

    const reportPath = path.join(__dirname, '../reports/test-report.json');

    try {
      // 确保报告目录存在
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      // 计算测试统计
      Object.values(this.results.tests).forEach(test => {
        this.results.summary.total++;
        if (test.status === 'passed') {
          this.results.summary.passed++;
        } else if (test.status === 'failed') {
          this.results.summary.failed++;
        } else {
          this.results.summary.skipped++;
        }
      });

      // 生成详细报告
      const report = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        },
        ...this.results,
        coverage: await this.getCoverageInfo()
      };

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`✅ 测试报告已保存到: ${reportPath}`);

      // 打印简要报告
      this.printSummary();

      return report;
    } catch (error) {
      console.error('❌ 生成报告失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取覆盖率信息
   */
  async getCoverageInfo() {
    const coverageDirs = [
      path.join(__dirname, '../coverage/unit'),
      path.join(__dirname, '../coverage/integration')
    ];

    const coverageInfo = {};

    for (const dir of coverageDirs) {
      const coverageFile = path.join(dir, 'coverage-summary.json');
      if (fs.existsSync(coverageFile)) {
        try {
          const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
          const dirName = path.basename(dir);
          coverageInfo[dirName] = coverage;
        } catch (error) {
          console.warn(`⚠️  读取覆盖率文件失败: ${coverageFile}`);
        }
      }
    }

    return coverageInfo;
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    console.log('\n📋 测试执行摘要');
    console.log('='.repeat(50));

    Object.entries(this.results.tests).forEach(([type, test]) => {
      const status = test.status === 'passed' ? '✅' : '❌';
      const duration = test.duration ? `(${test.duration}ms)` : '';
      console.log(`${status} ${type.padEnd(15)} ${duration}`);
    });

    console.log('-'.repeat(50));
    console.log(`总计: ${this.results.summary.total} 个测试`);
    console.log(`通过: ${this.results.summary.passed} 个`);
    console.log(`失败: ${this.results.summary.failed} 个`);
    console.log(`跳过: ${this.results.summary.skipped} 个`);

    const successRate = this.results.summary.total > 0
      ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)
      : '0.0';

    console.log(`成功率: ${successRate}%`);

    if (this.results.duration > 0) {
      console.log(`总耗时: ${this.results.duration}ms`);
    }
  }

  /**
   * 清理测试环境
   */
  async cleanup() {
    console.log('\n🧹 清理测试环境...');

    const cleanup = new TestDataCleanup();

    try {
      await cleanup.quickCleanup();
      console.log('✅ 测试环境清理完成');
    } catch (error) {
      console.warn('⚠️  清理过程中出现警告:', error.message);
    } finally {
      await cleanup.close();
    }
  }

  /**
   * 运行完整的测试套件
   */
  async runFullSuite(options = {}) {
    console.log('🚀 开始运行完整测试套件...');
    this.results.startTime = Date.now();

    const {
      skipSetup = false,
      skipCleanup = false,
      testTypes = ['unit', 'integration', 'e2e']
    } = options;

    try {
      // 环境检查
      await this.checkEnvironment();

      // 设置测试数据
      if (!skipSetup) {
        await this.setupTestData();
      }

      // 运行测试
      for (const testType of testTypes) {
        try {
          await this.runTestType(testType);
        } catch (error) {
          console.error(`❌ ${testType} 测试失败:`, error.message);
          // 继续运行其他测试，除非是单元测试
          if (testType === 'unit') {
            throw error;
          }
        }
      }

      // 生成报告
      this.results.endTime = Date.now();
      this.results.duration = this.results.endTime - this.results.startTime;
      await this.generateReport();

      // 清理
      if (!skipCleanup) {
        await this.cleanup();
      }

      console.log('\n🎉 测试套件执行完成!');
      return this.results;
    } catch (error) {
      console.error('\n💥 测试套件执行失败:', error.message);
      this.results.endTime = Date.now();
      this.results.duration = this.results.endTime - this.results.startTime;

      // 即使失败也尝试生成报告
      try {
        await this.generateReport();
      } catch (reportError) {
        console.warn('⚠️  生成失败报告时出错:', reportError.message);
      }

      if (!skipCleanup) {
        await this.cleanup();
      }

      throw error;
    }
  }
}

/**
 * 命令行执行
 */
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();

  try {
    let options = {};

    if (args.includes('--skip-setup')) {
      options.skipSetup = true;
    }

    if (args.includes('--skip-cleanup')) {
      options.skipCleanup = true;
    }

    if (args.includes('--unit-only')) {
      options.testTypes = ['unit'];
    } else if (args.includes('--integration-only')) {
      options.testTypes = ['integration'];
    } else if (args.includes('--e2e-only')) {
      options.testTypes = ['e2e'];
    }

    await runner.runFullSuite(options);
    process.exit(0);
  } catch (error) {
    console.error('\n💥 测试运行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = TestRunner;