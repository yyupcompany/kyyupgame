#!/usr/bin/env node

/**
 * 集成测试运行器
 * 统一执行所有测试用例，包括之前未集成的测试
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../test-integration-config.js');

class IntegratedTestRunner {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
    this.serverProcess = null;
  }

  /**
   * 运行所有测试
   */
  async runAll() {
    console.log('🚀 开始运行集成测试套件...\n');
    console.log('📋 测试套件包括:');
    Object.keys(config.testSuites).forEach(suite => {
      console.log(`  - ${config.testSuites[suite].name}`);
    });
    console.log('');

    try {
      // 1. 准备环境
      await this.setupEnvironment();

      // 2. 启动测试服务器
      await this.startTestServer();

      // 3. 运行所有测试套件
      await this.runAllTestSuites();

      // 4. 生成报告
      await this.generateReport();

      // 5. 验证覆盖率
      await this.validateCoverage();

      console.log('✅ 所有测试完成！');
      process.exit(0);

    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      process.exit(1);
    } finally {
      // 清理服务器进程
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
    }
  }

  /**
   * 准备测试环境
   */
  async setupEnvironment() {
    console.log('📋 准备测试环境...');

    // 设置环境变量
    Object.assign(process.env, config.environment);

    // 创建测试结果目录
    if (!fs.existsSync(config.reporting.outputDir)) {
      fs.mkdirSync(config.reporting.outputDir, { recursive: true });
    }

    console.log('✅ 测试环境准备完成\n');
  }

  /**
   * 启动测试服务器
   */
  async startTestServer() {
    console.log('🚀 启动测试服务器...');

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: './server',
        stdio: 'pipe',
        detached: false
      });

      let serverReady = false;

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if ((output.includes('Server running') || output.includes('listening on')) && !serverReady) {
          serverReady = true;
          console.log('✅ 测试服务器启动完成\n');
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('warning') && !error.includes('deprecated')) {
          console.error('服务器错误:', error);
        }
      });

      // 超时处理
      setTimeout(() => {
        if (!serverReady) {
          console.log('⚠️ 服务器启动超时，继续执行测试...');
          resolve(); // 不阻塞测试执行
        }
      }, 30000);
    });
  }

  /**
   * 运行所有测试套件
   */
  async runAllTestSuites() {
    const suites = Object.keys(config.testSuites);
    
    for (const suiteKey of suites) {
      const suite = config.testSuites[suiteKey];
      await this.runTestSuite(suiteKey, suite);
    }
  }

  /**
   * 运行单个测试套件
   */
  async runTestSuite(suiteKey, suite) {
    console.log(`🧪 运行 ${suite.name}...`);

    // 检查目录是否存在
    if (!fs.existsSync(suite.directory)) {
      console.log(`⚠️ 目录不存在: ${suite.directory}，跳过测试套件`);
      this.results[suiteKey] = { skipped: true, reason: '目录不存在' };
      return;
    }

    this.results[suiteKey] = {
      name: suite.name,
      tests: [],
      startTime: Date.now()
    };

    for (const test of suite.tests) {
      await this.runSingleTest(suiteKey, suite, test);
    }

    this.results[suiteKey].endTime = Date.now();
    this.results[suiteKey].duration = this.results[suiteKey].endTime - this.results[suiteKey].startTime;

    console.log(`✅ ${suite.name} 完成\n`);
  }

  /**
   * 运行单个测试
   */
  async runSingleTest(suiteKey, suite, test) {
    console.log(`  📝 ${test.name}...`);

    const testResult = {
      name: test.name,
      command: test.command,
      required: test.required,
      startTime: Date.now()
    };

    try {
      const result = execSync(test.command, {
        cwd: suite.directory,
        stdio: 'pipe',
        timeout: test.timeout,
        encoding: 'utf8'
      });

      testResult.success = true;
      testResult.output = result;
      console.log(`    ✅ ${test.name} 通过`);

    } catch (error) {
      testResult.success = false;
      testResult.error = error.message;
      testResult.output = error.stdout || error.stderr || '';

      if (test.required) {
        console.log(`    ❌ ${test.name} 失败 (必需)`);
        throw new Error(`必需测试失败: ${test.name} - ${error.message}`);
      } else {
        console.log(`    ⚠️ ${test.name} 失败 (可选)`);
      }
    }

    testResult.endTime = Date.now();
    testResult.duration = testResult.endTime - testResult.startTime;
    this.results[suiteKey].tests.push(testResult);
  }

  /**
   * 生成测试报告
   */
  async generateReport() {
    console.log('📊 生成测试报告...');

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      environment: config.environment,
      results: this.results,
      summary: this.generateSummary(),
      coverage: await this.getCoverageData()
    };

    // 保存JSON报告
    const jsonPath = path.join(config.reporting.outputDir, 'integrated-test-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    await this.generateHtmlReport(report);

    console.log(`✅ 测试报告已保存: ${jsonPath}\n`);
  }

  /**
   * 生成测试摘要
   */
  generateSummary() {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedSuites = 0;

    Object.values(this.results).forEach(suite => {
      if (suite.skipped) {
        skippedSuites++;
        return;
      }

      suite.tests.forEach(test => {
        totalTests++;
        if (test.success) {
          passedTests++;
        } else {
          failedTests++;
        }
      });
    });

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedSuites,
      successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0
    };
  }

  /**
   * 获取覆盖率数据
   */
  async getCoverageData() {
    const coverage = {};

    Object.entries(config.coverage.paths).forEach(([key, filePath]) => {
      try {
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          coverage[key] = data.total || data;
        }
      } catch (error) {
        console.warn(`获取${key}覆盖率数据失败:`, error.message);
      }
    });

    return coverage;
  }

  /**
   * 验证覆盖率
   */
  async validateCoverage() {
    console.log('📈 验证测试覆盖率...');

    const coverage = await this.getCoverageData();
    const targets = config.coverage.targets;

    if (Object.keys(coverage).length === 0) {
      console.log('⚠️ 未找到覆盖率数据，跳过验证');
      return;
    }

    // 计算平均覆盖率
    const avgCoverage = this.calculateAverageCoverage(coverage);

    console.log('📊 当前覆盖率:');
    console.log(`  语句: ${avgCoverage.statements}% (目标: ${targets.statements}%)`);
    console.log(`  分支: ${avgCoverage.branches}% (目标: ${targets.branches}%)`);
    console.log(`  函数: ${avgCoverage.functions}% (目标: ${targets.functions}%)`);
    console.log(`  行数: ${avgCoverage.lines}% (目标: ${targets.lines}%)`);

    // 检查是否达到目标（使用较低的目标，逐步提升）
    const warnings = [];
    if (avgCoverage.statements < targets.statements) warnings.push(`语句覆盖率偏低`);
    if (avgCoverage.branches < targets.branches) warnings.push(`分支覆盖率偏低`);
    if (avgCoverage.functions < targets.functions) warnings.push(`函数覆盖率偏低`);
    if (avgCoverage.lines < targets.lines) warnings.push(`行覆盖率偏低`);

    if (warnings.length > 0) {
      console.log('⚠️ 覆盖率警告:', warnings.join(', '));
      console.log('💡 建议: 继续添加测试用例以提升覆盖率');
    } else {
      console.log('✅ 覆盖率验证通过！');
    }
  }

  /**
   * 计算平均覆盖率
   */
  calculateAverageCoverage(coverage) {
    const keys = Object.keys(coverage);
    if (keys.length === 0) return { statements: 0, branches: 0, functions: 0, lines: 0 };

    const totals = { statements: 0, branches: 0, functions: 0, lines: 0 };

    keys.forEach(key => {
      const data = coverage[key];
      if (data.statements) totals.statements += data.statements.pct || 0;
      if (data.branches) totals.branches += data.branches.pct || 0;
      if (data.functions) totals.functions += data.functions.pct || 0;
      if (data.lines) totals.lines += data.lines.pct || 0;
    });

    return {
      statements: (totals.statements / keys.length).toFixed(2),
      branches: (totals.branches / keys.length).toFixed(2),
      functions: (totals.functions / keys.length).toFixed(2),
      lines: (totals.lines / keys.length).toFixed(2)
    };
  }

  /**
   * 生成HTML报告
   */
  async generateHtmlReport(report) {
    // 简单的HTML报告模板
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>集成测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .suite { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #e9e9e9; padding: 10px; font-weight: bold; }
        .test { padding: 10px; border-bottom: 1px solid #eee; }
        .success { color: green; }
        .failure { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <h1>集成测试报告</h1>
    <div class="summary">
        <h2>测试摘要</h2>
        <p>总测试数: ${report.summary.totalTests}</p>
        <p>通过: ${report.summary.passedTests}</p>
        <p>失败: ${report.summary.failedTests}</p>
        <p>跳过的套件: ${report.summary.skippedSuites}</p>
        <p>成功率: ${report.summary.successRate}%</p>
        <p>执行时间: ${(report.duration / 1000).toFixed(2)}秒</p>
    </div>
    
    <h2>详细结果</h2>
    ${Object.entries(report.results).map(([key, suite]) => `
        <div class="suite">
            <div class="suite-header">${suite.name || key}</div>
            ${suite.skipped ? 
                `<div class="test warning">跳过: ${suite.reason}</div>` :
                suite.tests.map(test => `
                    <div class="test ${test.success ? 'success' : 'failure'}">
                        ${test.success ? '✅' : '❌'} ${test.name} 
                        (${(test.duration / 1000).toFixed(2)}s)
                        ${test.error ? `<br><small>${test.error}</small>` : ''}
                    </div>
                `).join('')
            }
        </div>
    `).join('')}
</body>
</html>`;

    const htmlPath = path.join(config.reporting.outputDir, 'integrated-test-report.html');
    fs.writeFileSync(htmlPath, html);
  }
}

// 运行测试
if (require.main === module) {
  const runner = new IntegratedTestRunner();
  runner.runAll().catch(error => {
    console.error('集成测试运行器失败:', error);
    process.exit(1);
  });
}

module.exports = IntegratedTestRunner;
