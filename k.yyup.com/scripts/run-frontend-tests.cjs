#!/usr/bin/env node

/**
 * 前端测试运行脚本
 * 运行整合后的前端测试套件
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FrontendTestRunner {
  constructor() {
    this.testDir = './tests/frontend';
    this.results = {};
  }

  /**
   * 运行所有前端测试
   */
  async runAll() {
    console.log('🚀 开始运行整合后的前端测试...\n');

    try {
      // 1. 检查测试目录
      await this.checkTestDirectory();

      // 2. 安装依赖（如果需要）
      await this.installDependencies();

      // 3. 运行各类测试
      await this.runTestSuites();

      // 4. 生成报告
      await this.generateReport();

      console.log('✅ 前端测试完成！');

    } catch (error) {
      console.error('❌ 前端测试失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查测试目录
   */
  async checkTestDirectory() {
    console.log('📁 检查测试目录...');

    if (!fs.existsSync(this.testDir)) {
      throw new Error(`测试目录不存在: ${this.testDir}`);
    }

    const subdirs = ['unit', 'integration', 'e2e', 'api', 'components', 'pages', 'utils'];
    subdirs.forEach(dir => {
      const fullPath = path.join(this.testDir, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(f => f.includes('.test.') || f.includes('.spec.'));
        console.log(`  ✅ ${dir}: ${files.length} 个测试文件`);
      } else {
        console.log(`  ⚠️ ${dir}: 目录不存在`);
      }
    });

    console.log('');
  }

  /**
   * 安装依赖
   */
  async installDependencies() {
    console.log('📦 检查依赖...');

    const packageJsonPath = path.join(this.testDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('⚠️ 未找到package.json，跳过依赖安装');
      return;
    }

    const nodeModulesPath = path.join(this.testDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('📥 安装测试依赖...');
      try {
        execSync('npm install', {
          cwd: this.testDir,
          stdio: 'inherit'
        });
        console.log('✅ 依赖安装完成');
      } catch (error) {
        console.log('⚠️ 依赖安装失败，使用全局依赖');
      }
    } else {
      console.log('✅ 依赖已存在');
    }

    console.log('');
  }

  /**
   * 运行测试套件
   */
  async runTestSuites() {
    const testSuites = [
      { name: '单元测试', command: 'npm run test:unit', dir: 'unit' },
      { name: 'API测试', command: 'npm run test:api', dir: 'api' },
      { name: '组件测试', command: 'npm run test:components', dir: 'components' },
      { name: '页面测试', command: 'npm run test:pages', dir: 'pages' },
      { name: '工具测试', command: 'npm run test:utils', dir: 'utils' },
      { name: '集成测试', command: 'npm run test:integration', dir: 'integration' },
      { name: 'E2E测试', command: 'npm run test:e2e', dir: 'e2e' }
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }
  }

  /**
   * 运行单个测试套件
   */
  async runTestSuite(suite) {
    console.log(`🧪 运行 ${suite.name}...`);

    // 检查是否有测试文件
    const suiteDir = path.join(this.testDir, suite.dir);
    if (!fs.existsSync(suiteDir)) {
      console.log(`  ⚠️ 目录不存在: ${suite.dir}，跳过`);
      this.results[suite.name] = { skipped: true, reason: '目录不存在' };
      return;
    }

    const testFiles = fs.readdirSync(suiteDir).filter(f => 
      f.includes('.test.') || f.includes('.spec.')
    );

    if (testFiles.length === 0) {
      console.log(`  ⚠️ 没有测试文件: ${suite.dir}，跳过`);
      this.results[suite.name] = { skipped: true, reason: '没有测试文件' };
      return;
    }

    console.log(`  📝 发现 ${testFiles.length} 个测试文件`);

    const startTime = Date.now();
    
    try {
      // 尝试使用本地npm脚本
      let command = suite.command;
      let cwd = this.testDir;

      // 如果本地没有package.json，使用全局vitest
      const packageJsonPath = path.join(this.testDir, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        command = `vitest run ${suite.dir}/`;
        cwd = this.testDir;
      }

      const result = execSync(command, {
        cwd: cwd,
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 300000 // 5分钟超时
      });

      const duration = Date.now() - startTime;
      this.results[suite.name] = {
        success: true,
        duration,
        output: result,
        testFiles: testFiles.length
      };

      console.log(`  ✅ ${suite.name} 完成 (${(duration / 1000).toFixed(2)}s)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.results[suite.name] = {
        success: false,
        duration,
        error: error.message,
        output: error.stdout || error.stderr || '',
        testFiles: testFiles.length
      };

      console.log(`  ❌ ${suite.name} 失败 (${(duration / 1000).toFixed(2)}s)`);
      console.log(`     错误: ${error.message.split('\n')[0]}`);
    }

    console.log('');
  }

  /**
   * 生成报告
   */
  async generateReport() {
    console.log('📊 生成测试报告...');

    const report = {
      timestamp: new Date().toISOString(),
      testDirectory: this.testDir,
      results: this.results,
      summary: this.generateSummary()
    };

    // 保存JSON报告
    const reportPath = './test-results/frontend-test-report.json';
    
    // 确保目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    await this.generateHtmlReport(report);

    console.log(`✅ 测试报告已保存: ${reportPath}`);

    // 显示摘要
    console.log('\n📋 测试摘要:');
    console.log(`  总测试套件: ${report.summary.totalSuites}`);
    console.log(`  成功: ${report.summary.successSuites}`);
    console.log(`  失败: ${report.summary.failedSuites}`);
    console.log(`  跳过: ${report.summary.skippedSuites}`);
    console.log(`  总测试文件: ${report.summary.totalTestFiles}`);
    console.log(`  总执行时间: ${(report.summary.totalDuration / 1000).toFixed(2)}s`);
  }

  /**
   * 生成测试摘要
   */
  generateSummary() {
    let totalSuites = 0;
    let successSuites = 0;
    let failedSuites = 0;
    let skippedSuites = 0;
    let totalTestFiles = 0;
    let totalDuration = 0;

    Object.values(this.results).forEach(result => {
      totalSuites++;
      totalTestFiles += result.testFiles || 0;
      totalDuration += result.duration || 0;

      if (result.skipped) {
        skippedSuites++;
      } else if (result.success) {
        successSuites++;
      } else {
        failedSuites++;
      }
    });

    return {
      totalSuites,
      successSuites,
      failedSuites,
      skippedSuites,
      totalTestFiles,
      totalDuration,
      successRate: totalSuites > 0 ? ((successSuites / totalSuites) * 100).toFixed(2) : 0
    };
  }

  /**
   * 生成HTML报告
   */
  async generateHtmlReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>前端测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .suite { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #e9e9e9; padding: 10px; font-weight: bold; }
        .suite-content { padding: 10px; }
        .success { color: green; }
        .failure { color: red; }
        .skipped { color: orange; }
        .output { background: #f8f8f8; padding: 10px; border-radius: 3px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; }
    </style>
</head>
<body>
    <h1>前端测试报告</h1>
    <div class="summary">
        <h2>测试摘要</h2>
        <p>总测试套件: ${report.summary.totalSuites}</p>
        <p>成功: ${report.summary.successSuites}</p>
        <p>失败: ${report.summary.failedSuites}</p>
        <p>跳过: ${report.summary.skippedSuites}</p>
        <p>总测试文件: ${report.summary.totalTestFiles}</p>
        <p>成功率: ${report.summary.successRate}%</p>
        <p>总执行时间: ${(report.summary.totalDuration / 1000).toFixed(2)}秒</p>
        <p>测试时间: ${report.timestamp}</p>
    </div>
    
    <h2>详细结果</h2>
    ${Object.entries(report.results).map(([name, result]) => `
        <div class="suite">
            <div class="suite-header ${result.skipped ? 'skipped' : result.success ? 'success' : 'failure'}">
                ${result.skipped ? '⚠️' : result.success ? '✅' : '❌'} ${name}
                ${result.duration ? ` (${(result.duration / 1000).toFixed(2)}s)` : ''}
                ${result.testFiles ? ` - ${result.testFiles} 个测试文件` : ''}
            </div>
            <div class="suite-content">
                ${result.skipped ? 
                    `<p>跳过原因: ${result.reason}</p>` :
                    result.success ? 
                        '<p>测试通过</p>' :
                        `<p>错误: ${result.error}</p>`
                }
                ${result.output ? `<div class="output">${result.output.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
        </div>
    `).join('')}
</body>
</html>`;

    const htmlPath = './test-results/frontend-test-report.html';
    fs.writeFileSync(htmlPath, html);
  }
}

// 运行测试
if (require.main === module) {
  const runner = new FrontendTestRunner();
  runner.runAll().catch(error => {
    console.error('前端测试运行器失败:', error);
    process.exit(1);
  });
}

module.exports = FrontendTestRunner;
