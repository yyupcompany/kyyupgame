/**
 * API集成测试运行器
 * 
 * 功能：
 * - 自动化API测试执行
 * - 测试报告生成
 * - 覆盖率统计
 * - 性能监控
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  testSuite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  errors: string[];
}

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  tested: boolean;
  testFile?: string;
}

class APITestRunner {
  private testResults: TestResult[] = [];
  private apiEndpoints: APIEndpoint[] = [];
  private startTime: number = 0;

  constructor() {
    this.loadAPIEndpoints();
  }

  /**
   * 加载API端点列表
   */
  private loadAPIEndpoints(): void {
    // 这里应该从路由文件或API文档中自动提取端点
    this.apiEndpoints = [
      // 认证API
      { method: 'POST', path: '/api/auth/login', description: '用户登录', tested: false },
      { method: 'POST', path: '/api/auth/logout', description: '用户登出', tested: false },
      { method: 'GET', path: '/api/auth/user-info', description: '获取用户信息', tested: false },
      { method: 'POST', path: '/api/auth/refresh-token', description: '刷新Token', tested: false },

      // 用户管理API
      { method: 'GET', path: '/api/users', description: '获取用户列表', tested: false },
      { method: 'POST', path: '/api/users', description: '创建用户', tested: false },
      { method: 'GET', path: '/api/users/:id', description: '获取用户详情', tested: false },
      { method: 'PUT', path: '/api/users/:id', description: '更新用户', tested: false },
      { method: 'DELETE', path: '/api/users/:id', description: '删除用户', tested: false },

      // 学生管理API
      { method: 'GET', path: '/api/students', description: '获取学生列表', tested: false },
      { method: 'POST', path: '/api/students', description: '创建学生', tested: false },
      { method: 'GET', path: '/api/students/:id', description: '获取学生详情', tested: false },
      { method: 'PUT', path: '/api/students/:id', description: '更新学生', tested: false },
      { method: 'DELETE', path: '/api/students/:id', description: '删除学生', tested: false },

      // 教师管理API
      { method: 'GET', path: '/api/teachers', description: '获取教师列表', tested: false },
      { method: 'POST', path: '/api/teachers', description: '创建教师', tested: false },
      { method: 'GET', path: '/api/teachers/:id', description: '获取教师详情', tested: false },
      { method: 'PUT', path: '/api/teachers/:id', description: '更新教师', tested: false },
      { method: 'DELETE', path: '/api/teachers/:id', description: '删除教师', tested: false },

      // 班级管理API
      { method: 'GET', path: '/api/classes', description: '获取班级列表', tested: false },
      { method: 'POST', path: '/api/classes', description: '创建班级', tested: false },
      { method: 'GET', path: '/api/classes/:id', description: '获取班级详情', tested: false },
      { method: 'PUT', path: '/api/classes/:id', description: '更新班级', tested: false },
      { method: 'DELETE', path: '/api/classes/:id', description: '删除班级', tested: false },

      // 活动管理API
      { method: 'GET', path: '/api/activities', description: '获取活动列表', tested: false },
      { method: 'POST', path: '/api/activities', description: '创建活动', tested: false },
      { method: 'GET', path: '/api/activities/:id', description: '获取活动详情', tested: false },
      { method: 'PUT', path: '/api/activities/:id', description: '更新活动', tested: false },
      { method: 'DELETE', path: '/api/activities/:id', description: '删除活动', tested: false },
      { method: 'POST', path: '/api/activity-registrations', description: '活动报名', tested: false },

      // AI功能API
      { method: 'GET', path: '/api/ai/health', description: 'AI服务健康检查', tested: false },
      { method: 'GET', path: '/api/ai/models', description: '获取AI模型列表', tested: false },
      { method: 'POST', path: '/api/ai/conversations', description: '创建AI对话', tested: false },
      { method: 'GET', path: '/api/ai/conversations', description: '获取AI对话列表', tested: false },
      { method: 'POST', path: '/api/ai/conversations/:id/messages', description: '发送AI消息', tested: false },

      // 招生管理API
      { method: 'GET', path: '/api/enrollment-plans', description: '获取招生计划', tested: false },
      { method: 'POST', path: '/api/enrollment-plans', description: '创建招生计划', tested: false },
      { method: 'POST', path: '/api/enrollment-applications', description: '提交招生申请', tested: false },
      { method: 'GET', path: '/api/enrollment-applications', description: '获取招生申请列表', tested: false },

      // 仪表盘API
      { method: 'GET', path: '/api/dashboard/stats', description: '获取仪表盘统计', tested: false },
      { method: 'GET', path: '/api/dashboard/charts', description: '获取图表数据', tested: false },

      // 系统管理API
      { method: 'GET', path: '/api/system/health', description: '系统健康检查', tested: false },
      { method: 'GET', path: '/api/system/info', description: '系统信息', tested: false },
      { method: 'GET', path: '/api/system/logs', description: '系统日志', tested: false }
    ];
  }

  /**
   * 运行所有API测试
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 开始运行API集成测试...\n');
    this.startTime = Date.now();

    try {
      // 运行主要的集成测试
      await this.runTestSuite('API Integration Tests', 'api-integration.test.ts');
      
      // 运行特定模块测试
      await this.runTestSuite('Authentication Tests', 'auth-api.test.ts');
      await this.runTestSuite('User Management Tests', 'user-api.test.ts');
      await this.runTestSuite('Student Management Tests', 'student-api.test.ts');
      await this.runTestSuite('AI Features Tests', 'ai-api.test.ts');
      
      // 生成测试报告
      await this.generateTestReport();
      
      // 生成覆盖率报告
      await this.generateCoverageReport();
      
      console.log('\n✅ 所有API测试完成！');
      
    } catch (error) {
      console.error('\n❌ API测试执行失败:', error);
      process.exit(1);
    }
  }

  /**
   * 运行单个测试套件
   */
  private async runTestSuite(suiteName: string, testFile: string): Promise<void> {
    console.log(`📋 运行测试套件: ${suiteName}`);
    
    return new Promise((resolve, reject) => {
      const testPath = path.join(__dirname, testFile);
      
      // 检查测试文件是否存在
      if (!fs.existsSync(testPath)) {
        console.log(`⚠️  测试文件不存在: ${testFile}，跳过...`);
        resolve();
        return;
      }

      const startTime = Date.now();
      const jest = spawn('npx', ['jest', testPath, '--verbose', '--json'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      jest.stdout.on('data', (data) => {
        output += data.toString();
      });

      jest.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      jest.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        try {
          // 解析Jest输出
          const result = this.parseJestOutput(output, errorOutput);
          
          this.testResults.push({
            testSuite: suiteName,
            passed: result.passed,
            failed: result.failed,
            skipped: result.skipped,
            duration,
            errors: result.errors
          });

          if (code === 0) {
            console.log(`✅ ${suiteName} 完成 (${duration}ms)`);
            console.log(`   通过: ${result.passed}, 失败: ${result.failed}, 跳过: ${result.skipped}\n`);
          } else {
            console.log(`❌ ${suiteName} 失败 (${duration}ms)`);
            console.log(`   通过: ${result.passed}, 失败: ${result.failed}, 跳过: ${result.skipped}`);
            if (result.errors.length > 0) {
              console.log(`   错误: ${result.errors.slice(0, 3).join(', ')}\n`);
            }
          }
          
          resolve();
        } catch (error) {
          console.error(`❌ 解析测试结果失败: ${error.message}`);
          reject(error);
        }
      });

      jest.on('error', (error) => {
        console.error(`❌ 运行测试失败: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * 解析Jest输出
   */
  private parseJestOutput(output: string, errorOutput: string): {
    passed: number;
    failed: number;
    skipped: number;
    errors: string[];
  } {
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
      // 尝试解析JSON输出
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (result.testResults) {
          result.testResults.forEach((testResult: any) => {
            passed += testResult.numPassingTests || 0;
            failed += testResult.numFailingTests || 0;
            skipped += testResult.numPendingTests || 0;
            
            if (testResult.failureMessage) {
              errors.push(testResult.failureMessage);
            }
          });
        }
      } else {
        // 回退到文本解析
        const passedMatch = output.match(/(\d+) passing/);
        const failedMatch = output.match(/(\d+) failing/);
        const skippedMatch = output.match(/(\d+) pending/);
        
        passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        failed = failedMatch ? parseInt(failedMatch[1]) : 0;
        skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
      }
    } catch (error) {
      console.warn('解析测试输出时出现警告:', error.message);
    }

    // 如果有错误输出，添加到错误列表
    if (errorOutput) {
      errors.push(errorOutput);
    }

    return { passed, failed, skipped, errors };
  }

  /**
   * 生成测试报告
   */
  private async generateTestReport(): Promise<void> {
    const totalDuration = Date.now() - this.startTime;
    const totalPassed = this.testResults.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.testResults.reduce((sum, result) => sum + result.failed, 0);
    const totalSkipped = this.testResults.reduce((sum, result) => sum + result.skipped, 0);
    const totalTests = totalPassed + totalFailed + totalSkipped;

    const report = {
      summary: {
        totalTests,
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        passRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0',
        duration: totalDuration,
        timestamp: new Date().toISOString()
      },
      testSuites: this.testResults,
      apiCoverage: this.calculateAPICoverage(),
      recommendations: this.generateRecommendations()
    };

    // 保存报告到文件
    const reportPath = path.join(__dirname, '../reports/api-integration-report.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    await this.generateHTMLReport(report, reportPath.replace('.json', '.html'));

    console.log('\n📊 测试报告生成完成:');
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过: ${totalPassed} (${report.summary.passRate}%)`);
    console.log(`   失败: ${totalFailed}`);
    console.log(`   跳过: ${totalSkipped}`);
    console.log(`   总耗时: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`   报告文件: ${reportPath}`);
  }

  /**
   * 计算API覆盖率
   */
  private calculateAPICoverage(): {
    total: number;
    tested: number;
    coverage: string;
    untested: APIEndpoint[];
  } {
    const total = this.apiEndpoints.length;
    const tested = this.apiEndpoints.filter(endpoint => endpoint.tested).length;
    const coverage = total > 0 ? ((tested / total) * 100).toFixed(2) : '0';
    const untested = this.apiEndpoints.filter(endpoint => !endpoint.tested);

    return { total, tested, coverage, untested };
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const failedTests = this.testResults.filter(result => result.failed > 0);
    if (failedTests.length > 0) {
      recommendations.push('修复失败的测试用例，确保API功能正常');
    }

    const coverage = this.calculateAPICoverage();
    if (parseFloat(coverage.coverage) < 80) {
      recommendations.push('提高API测试覆盖率，目标达到80%以上');
    }

    const slowTests = this.testResults.filter(result => result.duration > 5000);
    if (slowTests.length > 0) {
      recommendations.push('优化慢速测试，提高测试执行效率');
    }

    if (coverage.untested.length > 0) {
      recommendations.push(`为以下API端点添加测试: ${coverage.untested.slice(0, 5).map(e => e.path).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * 生成HTML报告
   */
  private async generateHTMLReport(report: any, filePath: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>API集成测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>API集成测试报告</h1>
    
    <div class="summary">
        <h2>测试摘要</h2>
        <p><strong>总测试数:</strong> ${report.summary.totalTests}</p>
        <p><strong>通过:</strong> <span class="passed">${report.summary.passed}</span></p>
        <p><strong>失败:</strong> <span class="failed">${report.summary.failed}</span></p>
        <p><strong>跳过:</strong> <span class="skipped">${report.summary.skipped}</span></p>
        <p><strong>通过率:</strong> ${report.summary.passRate}%</p>
        <p><strong>总耗时:</strong> ${(report.summary.duration / 1000).toFixed(2)}s</p>
        <p><strong>生成时间:</strong> ${new Date(report.summary.timestamp).toLocaleString()}</p>
    </div>

    <h2>测试套件详情</h2>
    <table>
        <tr>
            <th>测试套件</th>
            <th>通过</th>
            <th>失败</th>
            <th>跳过</th>
            <th>耗时(ms)</th>
        </tr>
        ${report.testSuites.map((suite: any) => `
        <tr>
            <td>${suite.testSuite}</td>
            <td class="passed">${suite.passed}</td>
            <td class="failed">${suite.failed}</td>
            <td class="skipped">${suite.skipped}</td>
            <td>${suite.duration}</td>
        </tr>
        `).join('')}
    </table>

    <h2>API覆盖率</h2>
    <p><strong>总API数:</strong> ${report.apiCoverage.total}</p>
    <p><strong>已测试:</strong> ${report.apiCoverage.tested}</p>
    <p><strong>覆盖率:</strong> ${report.apiCoverage.coverage}%</p>

    <div class="recommendations">
        <h2>改进建议</h2>
        <ul>
            ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
    `;

    fs.writeFileSync(filePath, html);
  }

  /**
   * 生成覆盖率报告
   */
  private async generateCoverageReport(): Promise<void> {
    console.log('\n📈 生成覆盖率报告...');
    
    // 这里可以集成Istanbul/nyc等覆盖率工具
    // 暂时生成简单的覆盖率统计
    
    const coverage = this.calculateAPICoverage();
    console.log(`   API覆盖率: ${coverage.coverage}% (${coverage.tested}/${coverage.total})`);
    
    if (coverage.untested.length > 0) {
      console.log(`   未测试的API端点: ${coverage.untested.length}个`);
      coverage.untested.slice(0, 5).forEach(endpoint => {
        console.log(`     - ${endpoint.method} ${endpoint.path}`);
      });
      if (coverage.untested.length > 5) {
        console.log(`     ... 还有 ${coverage.untested.length - 5} 个`);
      }
    }
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  const runner = new APITestRunner();
  runner.runAllTests().catch(console.error);
}

export { APITestRunner };
