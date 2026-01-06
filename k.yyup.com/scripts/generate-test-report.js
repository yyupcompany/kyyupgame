#!/usr/bin/env node

/**
 * 综合测试报告生成器
 * 
 * 功能：
 * - 汇总所有测试结果
 * - 生成综合测试报告
 * - 创建PR评论内容
 * - 生成测试趋势分析
 * - 输出测试质量指标
 */

import fs from 'fs';
import path from 'path';

class TestReportGenerator {
  constructor() {
    this.config = {
      inputDir: 'test-results',
      outputDir: 'reports',
      summaryFile: 'test-summary.json',
      htmlReportFile: 'test-report.html',
      markdownReportFile: 'test-report.md',
      prCommentFile: 'pr-comment.md'
    };
    
    this.ensureDirectories();
  }

  /**
   * 确保输出目录存在
   */
  ensureDirectories() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * 查找匹配模式的文件
   */
  findFiles(dir, pattern) {
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);
    const regex = new RegExp(pattern.replace('*', '.*'));

    return files
      .filter(file => regex.test(file))
      .map(file => path.join(dir, file));
  }

  /**
   * 收集所有测试结果
   */
  collectTestResults() {
    console.log('📊 收集测试结果...');
    
    const results = {
      unit: this.collectUnitTestResults(),
      integration: this.collectIntegrationTestResults(),
      e2e: this.collectE2ETestResults(),
      performance: this.collectPerformanceTestResults(),
      coverage: this.collectCoverageResults()
    };
    
    return results;
  }

  /**
   * 收集单元测试结果
   */
  collectUnitTestResults() {
    const unitResults = {
      client: null,
      server: null,
      total: { passed: 0, failed: 0, skipped: 0, total: 0 }
    };
    
    // 客户端单元测试
    const clientResultFile = path.join(this.config.inputDir, 'client', 'test-results.json');
    if (fs.existsSync(clientResultFile)) {
      unitResults.client = JSON.parse(fs.readFileSync(clientResultFile, 'utf8'));
    }
    
    // 服务端单元测试
    const serverResultFile = path.join(this.config.inputDir, 'server', 'test-results.json');
    if (fs.existsSync(serverResultFile)) {
      unitResults.server = JSON.parse(fs.readFileSync(serverResultFile, 'utf8'));
    }
    
    // 汇总统计
    [unitResults.client, unitResults.server].forEach(result => {
      if (result && result.stats) {
        unitResults.total.passed += result.stats.passed || 0;
        unitResults.total.failed += result.stats.failed || 0;
        unitResults.total.skipped += result.stats.skipped || 0;
        unitResults.total.total += result.stats.total || 0;
      }
    });
    
    return unitResults;
  }

  /**
   * 收集集成测试结果
   */
  collectIntegrationTestResults() {
    const integrationResultFile = path.join(this.config.inputDir, 'integration-results.json');
    
    if (fs.existsSync(integrationResultFile)) {
      return JSON.parse(fs.readFileSync(integrationResultFile, 'utf8'));
    }
    
    return null;
  }

  /**
   * 收集E2E测试结果
   */
  collectE2ETestResults() {
    const e2eResults = {
      browsers: {},
      total: { passed: 0, failed: 0, skipped: 0, total: 0 }
    };
    
    // 查找所有E2E测试结果文件
    const e2eFiles = this.findFiles(path.join(this.config.inputDir), 'e2e-results-*.json');
    
    e2eFiles.forEach(file => {
      const browserName = path.basename(file, '.json').replace('e2e-results-', '');
      const result = JSON.parse(fs.readFileSync(file, 'utf8'));
      
      e2eResults.browsers[browserName] = result;
      
      if (result.stats) {
        e2eResults.total.passed += result.stats.passed || 0;
        e2eResults.total.failed += result.stats.failed || 0;
        e2eResults.total.skipped += result.stats.skipped || 0;
        e2eResults.total.total += result.stats.total || 0;
      }
    });
    
    return e2eResults;
  }

  /**
   * 收集性能测试结果
   */
  collectPerformanceTestResults() {
    const performanceResultFile = path.join(this.config.inputDir, 'performance-results.json');
    
    if (fs.existsSync(performanceResultFile)) {
      return JSON.parse(fs.readFileSync(performanceResultFile, 'utf8'));
    }
    
    return null;
  }

  /**
   * 收集覆盖率结果
   */
  collectCoverageResults() {
    const coverageResults = {
      client: null,
      server: null,
      combined: null
    };
    
    // 客户端覆盖率
    const clientCoverageFile = path.join('client', 'coverage', 'coverage-summary.json');
    if (fs.existsSync(clientCoverageFile)) {
      const data = JSON.parse(fs.readFileSync(clientCoverageFile, 'utf8'));
      coverageResults.client = data.total;
    }
    
    // 服务端覆盖率
    const serverCoverageFile = path.join('server', 'coverage', 'coverage-summary.json');
    if (fs.existsSync(serverCoverageFile)) {
      const data = JSON.parse(fs.readFileSync(serverCoverageFile, 'utf8'));
      coverageResults.server = data.total;
    }
    
    // 计算合并覆盖率
    if (coverageResults.client && coverageResults.server) {
      coverageResults.combined = {
        statements: { pct: (coverageResults.client.statements.pct + coverageResults.server.statements.pct) / 2 },
        branches: { pct: (coverageResults.client.branches.pct + coverageResults.server.branches.pct) / 2 },
        functions: { pct: (coverageResults.client.functions.pct + coverageResults.server.functions.pct) / 2 },
        lines: { pct: (coverageResults.client.lines.pct + coverageResults.server.lines.pct) / 2 }
      };
    }
    
    return coverageResults;
  }

  /**
   * 生成测试摘要
   */
  generateSummary(results) {
    console.log('📋 生成测试摘要...');
    
    const summary = {
      timestamp: new Date().toISOString(),
      overall: {
        status: 'unknown',
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        passRate: 0,
        duration: 0
      },
      breakdown: {
        unit: this.summarizeTestType(results.unit?.total),
        integration: this.summarizeTestType(results.integration),
        e2e: this.summarizeTestType(results.e2e?.total),
        performance: this.summarizeTestType(results.performance)
      },
      coverage: {
        client: results.coverage?.client?.statements?.pct || 0,
        server: results.coverage?.server?.statements?.pct || 0,
        combined: results.coverage?.combined?.statements?.pct || 0
      },
      quality: {
        score: 0,
        grade: 'F'
      }
    };
    
    // 计算总体统计
    Object.values(summary.breakdown).forEach(breakdown => {
      if (breakdown) {
        summary.overall.totalTests += breakdown.total || 0;
        summary.overall.passedTests += breakdown.passed || 0;
        summary.overall.failedTests += breakdown.failed || 0;
        summary.overall.skippedTests += breakdown.skipped || 0;
        summary.overall.duration += breakdown.duration || 0;
      }
    });
    
    // 计算通过率
    if (summary.overall.totalTests > 0) {
      summary.overall.passRate = (summary.overall.passedTests / summary.overall.totalTests) * 100;
    }
    
    // 确定总体状态
    summary.overall.status = summary.overall.failedTests === 0 ? 'passed' : 'failed';
    
    // 计算质量分数
    summary.quality = this.calculateQualityScore(summary);
    
    return summary;
  }

  /**
   * 汇总测试类型统计
   */
  summarizeTestType(testResult) {
    if (!testResult) return null;
    
    return {
      total: testResult.total || 0,
      passed: testResult.passed || 0,
      failed: testResult.failed || 0,
      skipped: testResult.skipped || 0,
      duration: testResult.duration || 0,
      passRate: testResult.total > 0 ? (testResult.passed / testResult.total) * 100 : 0
    };
  }

  /**
   * 计算质量分数
   */
  calculateQualityScore(summary) {
    let score = 0;
    let maxScore = 100;
    
    // 测试通过率权重 40%
    score += (summary.overall.passRate / 100) * 40;
    
    // 覆盖率权重 40%
    const avgCoverage = summary.coverage.combined || 
                       ((summary.coverage.client + summary.coverage.server) / 2);
    score += (avgCoverage / 100) * 40;
    
    // 测试完整性权重 20%
    let completeness = 0;
    if (summary.breakdown.unit) completeness += 5;
    if (summary.breakdown.integration) completeness += 5;
    if (summary.breakdown.e2e) completeness += 5;
    if (summary.breakdown.performance) completeness += 5;
    score += completeness;
    
    // 确定等级
    let grade = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    
    return {
      score: Math.round(score),
      grade: grade
    };
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport(results, summary) {
    console.log('🌐 生成HTML报告...');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Comprehensive Test Report</title>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; }
        .status-passed { background: #28a745; }
        .status-failed { background: #dc3545; }
        .quality-score { font-size: 48px; font-weight: bold; margin: 20px 0; }
        .grade-A { color: #28a745; }
        .grade-B { color: #17a2b8; }
        .grade-C { color: #ffc107; }
        .grade-D { color: #fd7e14; }
        .grade-F { color: #dc3545; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .metric-value { font-weight: bold; }
        .progress-bar { width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .progress-success { background: #28a745; }
        .progress-warning { background: #ffc107; }
        .progress-danger { background: #dc3545; }
        .test-breakdown { margin: 20px 0; }
        .test-type { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Comprehensive Test Report</h1>
            <p><strong>Generated:</strong> ${summary.timestamp}</p>
            <div class="status-badge ${summary.overall.status === 'passed' ? 'status-passed' : 'status-failed'}">
                ${summary.overall.status === 'passed' ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}
            </div>
            <div class="quality-score grade-${summary.quality.grade}">
                Quality Score: ${summary.quality.score}/100 (${summary.quality.grade})
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📊 Overall Statistics</h3>
                <div class="metric">
                    <span>Total Tests:</span>
                    <span class="metric-value">${summary.overall.totalTests}</span>
                </div>
                <div class="metric">
                    <span>Passed:</span>
                    <span class="metric-value" style="color: #28a745">${summary.overall.passedTests}</span>
                </div>
                <div class="metric">
                    <span>Failed:</span>
                    <span class="metric-value" style="color: #dc3545">${summary.overall.failedTests}</span>
                </div>
                <div class="metric">
                    <span>Skipped:</span>
                    <span class="metric-value" style="color: #6c757d">${summary.overall.skippedTests}</span>
                </div>
                <div class="metric">
                    <span>Pass Rate:</span>
                    <span class="metric-value">${summary.overall.passRate.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${summary.overall.passRate >= 90 ? 'progress-success' : summary.overall.passRate >= 70 ? 'progress-warning' : 'progress-danger'}" 
                         style="width: ${summary.overall.passRate}%"></div>
                </div>
            </div>

            <div class="card">
                <h3>📈 Coverage Summary</h3>
                <div class="metric">
                    <span>Client Coverage:</span>
                    <span class="metric-value">${summary.coverage.client.toFixed(1)}%</span>
                </div>
                <div class="metric">
                    <span>Server Coverage:</span>
                    <span class="metric-value">${summary.coverage.server.toFixed(1)}%</span>
                </div>
                <div class="metric">
                    <span>Combined Coverage:</span>
                    <span class="metric-value">${summary.coverage.combined.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${summary.coverage.combined >= 90 ? 'progress-success' : summary.coverage.combined >= 70 ? 'progress-warning' : 'progress-danger'}" 
                         style="width: ${summary.coverage.combined}%"></div>
                </div>
            </div>
        </div>

        <div class="card">
            <h3>🔍 Test Breakdown</h3>
            <div class="test-breakdown">
                ${this.generateTestBreakdownHtml(summary.breakdown)}
            </div>
        </div>

        ${summary.overall.failedTests > 0 ? `
        <div class="card">
            <h3>❌ Failed Tests</h3>
            <p>Please check the detailed test results for failure information.</p>
        </div>
        ` : ''}
    </div>
</body>
</html>`;
    
    const htmlFile = path.join(this.config.outputDir, this.config.htmlReportFile);
    fs.writeFileSync(htmlFile, html);
    
    return htmlFile;
  }

  /**
   * 生成测试分解HTML
   */
  generateTestBreakdownHtml(breakdown) {
    return Object.entries(breakdown)
      .filter(([_, data]) => data !== null)
      .map(([type, data]) => `
        <div class="test-type">
            <h4>${this.getTestTypeIcon(type)} ${this.getTestTypeName(type)}</h4>
            <div class="metric">
                <span>Tests:</span>
                <span class="metric-value">${data.total}</span>
            </div>
            <div class="metric">
                <span>Passed:</span>
                <span class="metric-value" style="color: #28a745">${data.passed}</span>
            </div>
            <div class="metric">
                <span>Failed:</span>
                <span class="metric-value" style="color: #dc3545">${data.failed}</span>
            </div>
            <div class="metric">
                <span>Pass Rate:</span>
                <span class="metric-value">${data.passRate.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${data.passRate >= 90 ? 'progress-success' : data.passRate >= 70 ? 'progress-warning' : 'progress-danger'}" 
                     style="width: ${data.passRate}%"></div>
            </div>
        </div>
      `).join('');
  }

  /**
   * 获取测试类型图标
   */
  getTestTypeIcon(type) {
    const icons = {
      unit: '🧪',
      integration: '🔗',
      e2e: '🎭',
      performance: '⚡'
    };
    return icons[type] || '📋';
  }

  /**
   * 获取测试类型名称
   */
  getTestTypeName(type) {
    const names = {
      unit: 'Unit Tests',
      integration: 'Integration Tests',
      e2e: 'End-to-End Tests',
      performance: 'Performance Tests'
    };
    return names[type] || type;
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(results, summary) {
    console.log('📝 生成Markdown报告...');
    
    const markdown = `# 🧪 Comprehensive Test Report

**Generated:** ${summary.timestamp}

## 📊 Summary

**Status:** ${summary.overall.status === 'passed' ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}  
**Quality Score:** ${summary.quality.score}/100 (Grade: ${summary.quality.grade})

## 📈 Overall Statistics

| Metric | Value |
|--------|-------|
| Total Tests | ${summary.overall.totalTests} |
| Passed | ${summary.overall.passedTests} |
| Failed | ${summary.overall.failedTests} |
| Skipped | ${summary.overall.skippedTests} |
| Pass Rate | ${summary.overall.passRate.toFixed(1)}% |

## 📊 Coverage Summary

| Component | Coverage |
|-----------|----------|
| Client | ${summary.coverage.client.toFixed(1)}% |
| Server | ${summary.coverage.server.toFixed(1)}% |
| Combined | ${summary.coverage.combined.toFixed(1)}% |

## 🔍 Test Breakdown

${Object.entries(summary.breakdown)
  .filter(([_, data]) => data !== null)
  .map(([type, data]) => `
### ${this.getTestTypeIcon(type)} ${this.getTestTypeName(type)}

- **Total:** ${data.total}
- **Passed:** ${data.passed}
- **Failed:** ${data.failed}
- **Skipped:** ${data.skipped}
- **Pass Rate:** ${data.passRate.toFixed(1)}%
`).join('')}

## 🏷️ Coverage Badges

![Client Coverage](https://img.shields.io/badge/coverage--client-${summary.coverage.client.toFixed(1)}%25-${this.getCoverageBadgeColor(summary.coverage.client)})
![Server Coverage](https://img.shields.io/badge/coverage--server-${summary.coverage.server.toFixed(1)}%25-${this.getCoverageBadgeColor(summary.coverage.server)})
![Combined Coverage](https://img.shields.io/badge/coverage--combined-${summary.coverage.combined.toFixed(1)}%25-${this.getCoverageBadgeColor(summary.coverage.combined)})

${summary.overall.failedTests > 0 ? `
## ❌ Action Required

This build has **${summary.overall.failedTests} failing tests**. Please review the detailed test results and fix the failing tests before merging.
` : `
## ✅ All Tests Passing

Great job! All tests are passing and coverage looks good.
`}
`;
    
    const markdownFile = path.join(this.config.outputDir, this.config.markdownReportFile);
    fs.writeFileSync(markdownFile, markdown);
    
    return markdownFile;
  }

  /**
   * 生成PR评论内容
   */
  generatePRComment(summary) {
    console.log('💬 生成PR评论内容...');
    
    const comment = `## 🧪 Test Results

${summary.overall.status === 'passed' ? '✅' : '❌'} **${summary.overall.status === 'passed' ? 'All tests passed!' : 'Some tests failed!'}**

### 📊 Summary
- **Total Tests:** ${summary.overall.totalTests}
- **Pass Rate:** ${summary.overall.passRate.toFixed(1)}%
- **Quality Score:** ${summary.quality.score}/100 (${summary.quality.grade})

### 📈 Coverage
- **Client:** ${summary.coverage.client.toFixed(1)}%
- **Server:** ${summary.coverage.server.toFixed(1)}%
- **Combined:** ${summary.coverage.combined.toFixed(1)}%

### 🔍 Test Breakdown
${Object.entries(summary.breakdown)
  .filter(([_, data]) => data !== null)
  .map(([type, data]) => `- **${this.getTestTypeName(type)}:** ${data.passed}/${data.total} passed (${data.passRate.toFixed(1)}%)`)
  .join('\n')}

${summary.overall.failedTests > 0 ? `
### ⚠️ Action Required
Please fix the ${summary.overall.failedTests} failing test${summary.overall.failedTests > 1 ? 's' : ''} before merging.
` : ''}

<details>
<summary>📋 View detailed report</summary>

[View full HTML report](./reports/test-report.html)
</details>
`;
    
    const commentFile = path.join(this.config.outputDir, this.config.prCommentFile);
    fs.writeFileSync(commentFile, comment);
    
    return commentFile;
  }

  /**
   * 获取覆盖率徽章颜色
   */
  getCoverageBadgeColor(percentage) {
    if (percentage >= 90) return 'brightgreen';
    if (percentage >= 80) return 'green';
    if (percentage >= 70) return 'yellow';
    if (percentage >= 60) return 'orange';
    return 'red';
  }

  /**
   * 运行报告生成
   */
  async run() {
    try {
      console.log('🚀 开始生成综合测试报告...');
      
      // 收集测试结果
      const results = this.collectTestResults();
      
      // 生成摘要
      const summary = this.generateSummary(results);
      
      // 保存摘要
      const summaryFile = path.join(this.config.outputDir, this.config.summaryFile);
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
      
      // 生成各种格式的报告
      const htmlFile = this.generateHtmlReport(results, summary);
      const markdownFile = this.generateMarkdownReport(results, summary);
      const prCommentFile = this.generatePRComment(summary);
      
      console.log('✅ 综合测试报告生成完成');
      console.log(`📊 质量分数: ${summary.quality.score}/100 (${summary.quality.grade})`);
      console.log(`📈 总体通过率: ${summary.overall.passRate.toFixed(1)}%`);
      console.log(`📋 HTML报告: ${htmlFile}`);
      console.log(`📝 Markdown报告: ${markdownFile}`);
      console.log(`💬 PR评论: ${prCommentFile}`);
      
      return {
        summary,
        files: {
          html: htmlFile,
          markdown: markdownFile,
          prComment: prCommentFile,
          summary: summaryFile
        }
      };
    } catch (error) {
      console.error('❌ 生成测试报告失败:', error);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new TestReportGenerator();
  generator.run();
}

export default TestReportGenerator;
