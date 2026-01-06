#!/usr/bin/env ts-node

/**
 * 移动端测试执行脚本
 * 提供完整的移动端测试执行和报告生成功能
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 测试配置
interface TestConfig {
  testType: 'authentication' | 'parent-center' | 'all';
  environment: 'development' | 'staging' | 'production';
  coverage: boolean;
  watch: boolean;
  reporters: string[];
  outputDir: string;
}

// 测试结果
interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

// 完整测试报告
interface TestReport {
  executionTime: {
    start: Date;
    end: Date;
    duration: number;
  };
  environment: string;
  config: TestConfig;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    totalCoverage: {
      lines: number;
      functions: number;
      branches: number;
      statements: number;
    };
  };
  recommendations: string[];
}

class MobileTestRunner {
  private config: TestConfig;
  private results: TestResult[] = [];
  private startTime: Date = new Date();

  constructor(config: Partial<TestConfig> = {}) {
    this.config = {
      testType: 'all',
      environment: 'development',
      coverage: true,
      watch: false,
      reporters: ['verbose', 'json', 'html'],
      outputDir: './test-results',
      ...config
    };
  }

  /**
   * 运行移动端测试
   */
  async runTests(): Promise<TestReport> {
    console.log('🚀 开始执行移动端测试...');
    console.log(`📋 测试配置: ${JSON.stringify(this.config, null, 2)}`);

    try {
      // 创建输出目录
      this.createOutputDirectory();

      // 设置测试环境
      this.setupTestEnvironment();

      // 运行测试
      if (this.config.testType === 'all') {
        await this.runAllTests();
      } else if (this.config.testType === 'authentication') {
        await this.runAuthenticationTests();
      } else if (this.config.testType === 'parent-center') {
        await this.runParentCenterTests();
      }

      // 生成测试报告
      const report = await this.generateReport();

      // 输出结果
      this.outputResults(report);

      return report;
    } catch (error) {
      console.error('❌ 测试执行失败:', error);
      throw error;
    }
  }

  /**
   * 创建输出目录
   */
  private createOutputDirectory(): void {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    const subDirs = ['coverage', 'reports', 'screenshots'];
    subDirs.forEach(dir => {
      const fullPath = path.join(this.config.outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  /**
   * 设置测试环境
   */
  private setupTestEnvironment(): void {
    process.env.NODE_ENV = this.config.environment;
    process.env.VITEST_ENVIRONMENT = 'jsdom';
    process.env.MOCK_API = 'true';

    // 设置移动端环境变量
    process.env.TEST_MOBILE = 'true';
    process.env.TEST_VIEWPORT_WIDTH = '375';
    process.env.TEST_VIEWPORT_HEIGHT = '812';
  }

  /**
   * 运行所有测试
   */
  private async runAllTests(): Promise<void> {
    console.log('📱 运行所有移动端测试...');

    await this.runTestSuite('认证测试', 'mobile/authentication/**/*.test.ts');
    await this.runTestSuite('家长端测试', 'mobile/parent-center/**/*.test.ts');
  }

  /**
   * 运行认证测试
   */
  private async runAuthenticationTests(): Promise<void> {
    console.log('🔐 运行认证测试...');

    await this.runTestSuite('用户登录功能', 'mobile/authentication/TC-001*.test.ts');
    await this.runTestSuite('角色权限控制', 'mobile/authentication/TC-002*.test.ts');
    await this.runTestSuite('设备检测路由', 'mobile/authentication/TC-003*.test.ts');
    await this.runTestSuite('JWT令牌管理', 'mobile/authentication/TC-004*.test.ts');
    await this.runTestSuite('安全登录防护', 'mobile/authentication/TC-005*.test.ts');
  }

  /**
   * 运行家长端测试
   */
  private async runParentCenterTests(): Promise<void> {
    console.log('👨‍👩‍👧‍👦 运行家长端测试...');

    await this.runTestSuite('家长仪表板', 'mobile/parent-center/TC-006*.test.ts');
    await this.runTestSuite('孩子管理功能', 'mobile/parent-center/TC-007*.test.ts');
    await this.runTestSuite('活动报名功能', 'mobile/parent-center/TC-008*.test.ts');
    await this.runTestSuite('成长评估系统', 'mobile/parent-center/TC-009*.test.ts');
    await this.runTestSuite('AI助手交互', 'mobile/parent-center/TC-010*.test.ts');
  }

  /**
   * 运行测试套件
   */
  private async runTestSuite(name: string, pattern: string): Promise<void> {
    console.log(`\n🧪 运行测试套件: ${name}`);

    const startTime = Date.now();

    try {
      const vitestCommand = this.buildVitestCommand(pattern);

      console.log(`执行命令: ${vitestCommand}`);
      const output = execSync(vitestCommand, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd()
      });

      const duration = Date.now() - startTime;

      // 解析测试结果
      const result = this.parseTestOutput(name, output, duration);
      this.results.push(result);

      console.log(`✅ ${name} - 通过 (${duration}ms)`);

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        name,
        status: 'failed',
        duration,
        error: error.message
      };
      this.results.push(result);

      console.log(`❌ ${name} - 失败 (${duration}ms)`);
      console.log(`错误: ${error.message}`);
    }
  }

  /**
   * 构建Vitest命令
   */
  private buildVitestCommand(pattern: string): string {
    let command = `npx vitest run --config ./client/src/tests/mobile/config/vitest.config.ts "${pattern}"`;

    if (this.config.coverage) {
      command += ' --coverage';
    }

    if (this.config.watch) {
      command = command.replace('run', '');
    }

    command += ` --reporter=${this.config.reporters.join(',')}`;
    command += ` --outputFile=${this.config.outputDir}/results.json`;

    return command;
  }

  /**
   * 解析测试输出
   */
  private parseTestOutput(name: string, output: string, duration: number): TestResult {
    // 简单解析测试输出
    const passed = output.includes('PASS') || !output.includes('FAIL');

    // 提取覆盖率信息（如果存在）
    let coverage;
    if (output.includes('Coverage')) {
      const lines = output.split('\n');
      const coverageLine = lines.find(line => line.includes('All files'));
      if (coverageLine) {
        const match = coverageLine.match(/(\d+\.\d+)/g);
        if (match && match.length >= 4) {
          coverage = {
            statements: parseFloat(match[0]),
            branches: parseFloat(match[1]),
            functions: parseFloat(match[2]),
            lines: parseFloat(match[3])
          };
        }
      }
    }

    return {
      name,
      status: passed ? 'passed' : 'failed',
      duration,
      coverage
    };
  }

  /**
   * 生成测试报告
   */
  private async generateReport(): Promise<TestReport> {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      passRate: 0,
      totalCoverage: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
    };

    summary.passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;

    // 计算平均覆盖率
    const coverageResults = this.results
      .filter(r => r.coverage)
      .map(r => r.coverage!);

    if (coverageResults.length > 0) {
      summary.totalCoverage = {
        lines: coverageResults.reduce((sum, c) => sum + c.lines, 0) / coverageResults.length,
        functions: coverageResults.reduce((sum, c) => sum + c.functions, 0) / coverageResults.length,
        branches: coverageResults.reduce((sum, c) => sum + c.branches, 0) / coverageResults.length,
        statements: coverageResults.reduce((sum, c) => sum + c.statements, 0) / coverageResults.length
      };
    }

    const recommendations = this.generateRecommendations(summary);

    const report: TestReport = {
      executionTime: {
        start: this.startTime,
        end: endTime,
        duration
      },
      environment: this.config.environment,
      config: this.config,
      results: this.results,
      summary,
      recommendations
    };

    // 保存报告文件
    await this.saveReport(report);

    return report;
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(summary: any): string[] {
    const recommendations: string[] = [];

    if (summary.passRate < 90) {
      recommendations.push('测试通过率较低，建议检查失败的测试用例');
    }

    if (summary.totalCoverage.lines < 85) {
      recommendations.push('代码覆盖率偏低，建议增加测试用例以提高覆盖率');
    }

    if (summary.failed > 0) {
      recommendations.push(`有 ${summary.failed} 个测试失败，建议优先修复`);
    }

    const avgCoverage = Object.values(summary.totalCoverage).reduce((sum: number, val: any) => sum + val, 0) / 4;
    if (avgCoverage < 80) {
      recommendations.push('整体测试覆盖率偏低，需要补充更多测试用例');
    }

    if (recommendations.length === 0) {
      recommendations.push('所有测试通过，覆盖率达标，测试质量良好！');
    }

    return recommendations;
  }

  /**
   * 保存测试报告
   */
  private async saveReport(report: TestReport): Promise<void> {
    const reportPath = path.join(this.config.outputDir, 'mobile-test-report.json');
    const htmlReportPath = path.join(this.config.outputDir, 'mobile-test-report.html');

    // 保存JSON报告
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    const htmlReport = this.generateHTMLReport(report);
    fs.writeFileSync(htmlReportPath, htmlReport);

    console.log(`\n📊 测试报告已保存:`);
    console.log(`  - JSON: ${reportPath}`);
    console.log(`  - HTML: ${htmlReportPath}`);
  }

  /**
   * 生成HTML测试报告
   */
  private generateHTMLReport(report: TestReport): string {
    const { summary, results, executionTime } = report;

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>移动端测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #28a745; }
        .metric-label { color: #6c757d; margin-top: 5px; }
        .results { margin-top: 30px; }
        .result-item { background: white; border: 1px solid #dee2e6; border-radius: 8px; margin: 10px 0; padding: 15px; }
        .result-passed { border-left: 4px solid #28a745; }
        .result-failed { border-left: 4px solid #dc3545; }
        .result-name { font-weight: bold; margin-bottom: 5px; }
        .result-status { color: #6c757d; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .coverage-bar { background: #e9ecef; border-radius: 4px; height: 20px; margin: 10px 0; }
        .coverage-fill { background: #28a745; height: 100%; border-radius: 4px; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📱 移动端测试报告</h1>
        <p>执行时间: ${executionTime.start.toLocaleString()} - ${executionTime.end.toLocaleString()}</p>
        <p>总耗时: ${(executionTime.duration / 1000).toFixed(2)}秒</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${summary.total}</div>
            <div class="metric-label">总测试数</div>
        </div>
        <div class="metric">
            <div class="metric-value" style="color: #28a745;">${summary.passed}</div>
            <div class="metric-label">通过</div>
        </div>
        <div class="metric">
            <div class="metric-value" style="color: #dc3545;">${summary.failed}</div>
            <div class="metric-label">失败</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.passRate.toFixed(1)}%</div>
            <div class="metric-label">通过率</div>
        </div>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${summary.totalCoverage.statements.toFixed(1)}%</div>
            <div class="metric-label">语句覆盖率</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.totalCoverage.branches.toFixed(1)}%</div>
            <div class="metric-label">分支覆盖率</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.totalCoverage.functions.toFixed(1)}%</div>
            <div class="metric-label">函数覆盖率</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.totalCoverage.lines.toFixed(1)}%</div>
            <div class="metric-label">行覆盖率</div>
        </div>
    </div>

    <div class="results">
        <h2>📋 测试结果详情</h2>
        ${results.map(result => `
            <div class="result-item result-${result.status}">
                <div class="result-name">${result.name}</div>
                <div class="result-status">
                    状态: ${result.status === 'passed' ? '✅ 通过' : '❌ 失败'}
                    | 耗时: ${(result.duration / 1000).toFixed(2)}秒
                    ${result.coverage ? `| 覆盖率: ${result.coverage.statements.toFixed(1)}%` : ''}
                </div>
                ${result.error ? `<div style="color: #dc3545; margin-top: 10px;">错误: ${result.error}</div>` : ''}
            </div>
        `).join('')}
    </div>

    <div class="recommendations">
        <h3>💡 改进建议</h3>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
  }

  /**
   * 输出测试结果
   */
  private outputResults(report: TestReport): void {
    console.log('\n📊 测试执行完成！');
    console.log('=' .repeat(50));
    console.log(`总测试数: ${report.summary.total}`);
    console.log(`✅ 通过: ${report.summary.passed}`);
    console.log(`❌ 失败: ${report.summary.failed}`);
    console.log(`⏭️  跳过: ${report.summary.skipped}`);
    console.log(`📈 通过率: ${report.summary.passRate.toFixed(1)}%`);
    console.log(`⏱️  总耗时: ${(report.executionTime.duration / 1000).toFixed(2)}秒`);

    if (report.summary.totalCoverage.lines > 0) {
      console.log('\n📊 覆盖率统计:');
      console.log(`  语句: ${report.summary.totalCoverage.statements.toFixed(1)}%`);
      console.log(`  分支: ${report.summary.totalCoverage.branches.toFixed(1)}%`);
      console.log(`  函数: ${report.summary.totalCoverage.functions.toFixed(1)}%`);
      console.log(`  行数: ${report.summary.totalCoverage.lines.toFixed(1)}%`);
    }

    if (report.recommendations.length > 0 && !report.recommendations[0].includes('良好')) {
      console.log('\n💡 改进建议:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    console.log('=' .repeat(50));
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);

  // 解析命令行参数
  const config: Partial<TestConfig> = {};

  if (args.includes('--auth')) {
    config.testType = 'authentication';
  } else if (args.includes('--parent')) {
    config.testType = 'parent-center';
  } else if (args.includes('--no-coverage')) {
    config.coverage = false;
  } else if (args.includes('--watch')) {
    config.watch = true;
  }

  const testRunner = new MobileTestRunner(config);

  try {
    await testRunner.runTests();
    process.exit(0);
  } catch (error) {
    console.error('测试执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { MobileTestRunner, TestConfig, TestResult, TestReport };