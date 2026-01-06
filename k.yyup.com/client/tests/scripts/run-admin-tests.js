/**
 * Admin角色测试运行脚本
 *
 * 提供完整的Admin角色测试执行和覆盖率报告
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class AdminTestRunner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.testResults = {
      e2e: { passed: 0, failed: 0, total: 0 },
      unit: { passed: 0, failed: 0, total: 0 },
      coverage: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0
      }
    };
  }

  /**
   * 运行Admin角色E2E测试
   */
  async runE2ETests() {
    console.log('🚀 开始运行Admin角色E2E测试...\n');

    return new Promise((resolve, reject) => {
      const testFiles = [
        'e2e/admin-sidebar-complete.spec.ts',
        'e2e/admin-permissions-comprehensive.spec.ts'
      ];

      const playwrightProcess = spawn('npx', [
        'playwright', 'test',
        ...testFiles,
        '--config=playwright.config.ts',
        '--reporter=line',
        '--reporter=html',
        '--output-dir=test-results/admin-e2e'
      ], {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: {
          ...process.env,
          CI: 'true',
          PWDEBUG: '0'
        }
      });

      playwrightProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Admin E2E测试完成');
          resolve({ success: true, exitCode: code });
        } else {
          console.error(`❌ Admin E2E测试失败，退出码: ${code}`);
          reject(new Error(`E2E测试失败，退出码: ${code}`));
        }
      });

      playwrightProcess.on('error', (error) => {
        console.error('❌ E2E测试进程错误:', error);
        reject(error);
      });
    });
  }

  /**
   * 运行Admin角色单元测试
   */
  async runUnitTests() {
    console.log('🧪 开始运行Admin角色单元测试...\n');

    return new Promise((resolve, reject) => {
      const vitestProcess = spawn('npx', [
        'vitest', 'run',
        'unit/admin-system-management.test.ts',
        '--config=vitest.config.ts',
        '--reporter=verbose',
        '--coverage'
      ], {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: {
          ...process.env,
          CI: 'true',
          VITEST_COVERAGE: 'true'
        }
      });

      vitestProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Admin单元测试完成');
          resolve({ success: true, exitCode: code });
        } else {
          console.error(`❌ Admin单元测试失败，退出码: ${code}`);
          reject(new Error(`单元测试失败，退出码: ${code}`));
        }
      });

      vitestProcess.on('error', (error) => {
        console.error('❌ 单元测试进程错误:', error);
        reject(error);
      });
    });
  }

  /**
   * 生成测试覆盖率报告
   */
  async generateCoverageReport() {
    console.log('📊 生成Admin测试覆盖率报告...\n');

    try {
      // 读取覆盖率数据
      const coveragePath = path.join(this.projectRoot, 'coverage', 'coverage-final.json');

      if (fs.existsSync(coveragePath)) {
        const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

        // 计算覆盖率指标
        const totalStatements = coverageData.total?.statements?.pct || 0;
        const totalBranches = coverageData.total?.branches?.pct || 0;
        const totalFunctions = coverageData.total?.functions?.pct || 0;
        const totalLines = coverageData.total?.lines?.pct || 0;

        this.testResults.coverage = {
          statements: totalStatements,
          branches: totalBranches,
          functions: totalFunctions,
          lines: totalLines
        };

        console.log('📈 测试覆盖率统计:');
        console.log(`   语句覆盖率: ${totalStatements}%`);
        console.log(`   分支覆盖率: ${totalBranches}%`);
        console.log(`   函数覆盖率: ${totalFunctions}%`);
        console.log(`   行覆盖率: ${totalLines}%`);

        // 生成HTML覆盖率报告
        console.log('📄 生成HTML覆盖率报告...');
        const coverageReport = spawn('npx', [
          'nyc', 'report',
          '--reporter=html',
          '--reporter=text',
          '--report-dir=coverage/admin-report'
        ], {
          cwd: this.projectRoot,
          stdio: 'inherit'
        });

        await new Promise((resolve) => {
          coverageReport.on('close', resolve);
        });

      } else {
        console.warn('⚠️ 覆盖率数据文件不存在，跳过覆盖率报告生成');
      }
    } catch (error) {
      console.error('❌ 生成覆盖率报告失败:', error);
    }
  }

  /**
   * 生成Admin测试报告
   */
  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testSuite: 'Admin角色测试套件',
      summary: {
        e2eTests: this.testResults.e2e,
        unitTests: this.testResults.unit,
        coverage: this.testResults.coverage,
        totalTests: this.testResults.e2e.total + this.testResults.unit.total,
        totalPassed: this.testResults.e2e.passed + this.testResults.unit.passed,
        totalFailed: this.testResults.e2e.failed + this.testResults.unit.failed
      },
      modules: {
        systemManagement: {
          name: '系统管理模块',
          pages: [
            '系统概览',
            '用户管理',
            '角色管理',
            '权限管理',
            '系统日志',
            '系统设置',
            '备份管理',
            '消息模板',
            '安全管理'
          ],
          coverage: this.testResults.coverage
        },
        advancedManagement: {
          name: '高级管理模块',
          pages: [
            'AI模型配置',
            'VOS配置管理',
            '来电账户管理',
            '语音配置管理',
            '扩展配置管理',
            '维护调度器',
            'AI快捷方式'
          ],
          coverage: this.testResults.coverage
        },
        adminOnly: {
          name: 'Admin专用模块',
          pages: [
            '图片替换管理器',
            '图片替换'
          ],
          coverage: this.testResults.coverage
        }
      },
      qualityMetrics: {
        coverageThreshold: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85
        },
        actualCoverage: this.testResults.coverage,
        passedThreshold: this.checkCoverageThreshold()
      }
    };

    const reportPath = path.join(this.projectRoot, 'test-results', 'admin-test-report.json');

    // 确保目录存在
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📋 Admin测试报告已生成:', reportPath);
    this.printSummary(report);
  }

  /**
   * 检查覆盖率是否达到阈值
   */
  checkCoverageThreshold() {
    const threshold = {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    };

    const coverage = this.testResults.coverage;

    return {
      statements: coverage.statements >= threshold.statements,
      branches: coverage.branches >= threshold.branches,
      functions: coverage.functions >= threshold.functions,
      lines: coverage.lines >= threshold.lines,
      overall: Object.values(coverage).every((value, index) =>
        value >= Object.values(threshold)[index]
      )
    };
  }

  /**
   * 打印测试摘要
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Admin角色测试套件执行报告');
    console.log('='.repeat(60));

    console.log(`⏰ 执行时间: ${report.timestamp}`);
    console.log(`🧪 E2E测试: ${report.summary.e2eTests.passed}/${report.summary.e2eTests.total} 通过`);
    console.log(`🔬 单元测试: ${report.summary.unitTests.passed}/${report.summary.unitTests.total} 通过`);
    console.log(`📈 总体测试: ${report.summary.totalPassed}/${report.summary.totalTests} 通过`);

    console.log('\n📊 覆盖率统计:');
    console.log(`   语句覆盖率: ${report.summary.coverage.statements}%`);
    console.log(`   分支覆盖率: ${report.summary.coverage.branches}%`);
    console.log(`   函数覆盖率: ${report.summary.coverage.functions}%`);
    console.log(`   行覆盖率: ${report.summary.coverage.lines}%`);

    const thresholdPassed = report.qualityMetrics.passedThreshold;
    console.log(`\n${thresholdPassed.overall ? '✅' : '❌'} 覆盖率阈值: ${thresholdPassed.overall ? '通过' : '未达到'}`);

    if (!thresholdPassed.overall) {
      console.log('\n⚠️ 未达到覆盖率阈值，需要增加测试用例:');
      if (!thresholdPassed.statements) {
        console.log(`   - 语句覆盖率: ${report.summary.coverage.statements}% < 85%`);
      }
      if (!thresholdPassed.branches) {
        console.log(`   - 分支覆盖率: ${report.summary.coverage.branches}% < 80%`);
      }
      if (!thresholdPassed.functions) {
        console.log(`   - 函数覆盖率: ${report.summary.coverage.functions}% < 85%`);
      }
      if (!thresholdPassed.lines) {
        console.log(`   - 行覆盖率: ${report.summary.coverage.lines}% < 85%`);
      }
    }

    console.log('\n📁 测试报告文件:');
    console.log(`   - JSON报告: test-results/admin-test-report.json`);
    console.log(`   - E2E报告: test-results/admin-e2e/index.html`);
    console.log(`   - 覆盖率报告: coverage/admin-report/index.html`);

    console.log('='.repeat(60));
  }

  /**
   * 运行完整的Admin测试套件
   */
  async runCompleteTestSuite() {
    console.log('🎯 开始执行Admin角色100%测试覆盖套件\n');

    try {
      // 1. 运行单元测试
      console.log('\n1️⃣ 运行Admin单元测试...');
      await this.runUnitTests();

      // 2. 生成覆盖率报告
      console.log('\n2️⃣ 生成测试覆盖率报告...');
      await this.generateCoverageReport();

      // 3. 运行E2E测试
      console.log('\n3️⃣ 运行Admin E2E测试...');
      await this.runE2ETests();

      // 4. 生成完整测试报告
      console.log('\n4️⃣ 生成Admin测试报告...');
      this.generateTestReport();

      console.log('\n🎉 Admin角色测试套件执行完成！');

    } catch (error) {
      console.error('\n❌ Admin测试套件执行失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 仅运行快速测试（跳过E2E）
   */
  async runQuickTests() {
    console.log('⚡ 运行Admin快速测试套件（单元测试 + 覆盖率）\n');

    try {
      await this.runUnitTests();
      await this.generateCoverageReport();
      this.generateTestReport();

      console.log('\n⚡ Admin快速测试完成！');
    } catch (error) {
      console.error('\n❌ Admin快速测试失败:', error.message);
      process.exit(1);
    }
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const testRunner = new AdminTestRunner();

if (args.includes('--quick') || args.includes('-q')) {
  testRunner.runQuickTests();
} else if (args.includes('--e2e-only')) {
  testRunner.runE2ETests();
} else if (args.includes('--unit-only')) {
  testRunner.runUnitTests();
} else {
  testRunner.runCompleteTestSuite();
}