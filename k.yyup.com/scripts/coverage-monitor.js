#!/usr/bin/env node

/**
 * 测试覆盖率监控系统
 * 
 * 功能：
 * - 收集和分析覆盖率数据
 * - 生成覆盖率趋势报告
 * - 覆盖率阈值检查
 * - 覆盖率徽章生成
 * - 覆盖率告警
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class CoverageMonitor {
  constructor() {
    this.config = {
      thresholds: {
        global: {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90
        },
        client: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85
        },
        server: {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95
        }
      },
      outputDir: 'coverage-reports',
      historyFile: 'coverage-history.json',
      badgesDir: 'coverage-badges'
    };
    
    this.ensureDirectories();
  }

  /**
   * 确保必要的目录存在
   */
  ensureDirectories() {
    const dirs = [
      this.config.outputDir,
      this.config.badgesDir,
      'test-results'
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 收集覆盖率数据
   */
  async collectCoverage() {
    console.log('📊 收集覆盖率数据...');
    
    const coverage = {
      timestamp: new Date().toISOString(),
      client: await this.getCoverageData('client'),
      server: await this.getCoverageData('server'),
      combined: null
    };
    
    // 计算合并覆盖率
    coverage.combined = this.combineCoverage(coverage.client, coverage.server);
    
    return coverage;
  }

  /**
   * 获取指定组件的覆盖率数据
   */
  async getCoverageData(component) {
    const coverageFile = path.join(component, 'coverage', 'coverage-summary.json');
    
    if (!fs.existsSync(coverageFile)) {
      console.warn(`⚠️ 覆盖率文件不存在: ${coverageFile}`);
      return null;
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
      return {
        statements: data.total.statements.pct,
        branches: data.total.branches.pct,
        functions: data.total.functions.pct,
        lines: data.total.lines.pct,
        files: Object.keys(data).length - 1, // 排除total
        details: data
      };
    } catch (error) {
      console.error(`❌ 读取覆盖率数据失败: ${component}`, error);
      return null;
    }
  }

  /**
   * 合并客户端和服务端覆盖率
   */
  combineCoverage(clientCoverage, serverCoverage) {
    if (!clientCoverage || !serverCoverage) {
      return clientCoverage || serverCoverage;
    }
    
    return {
      statements: (clientCoverage.statements + serverCoverage.statements) / 2,
      branches: (clientCoverage.branches + serverCoverage.branches) / 2,
      functions: (clientCoverage.functions + serverCoverage.functions) / 2,
      lines: (clientCoverage.lines + serverCoverage.lines) / 2,
      files: clientCoverage.files + serverCoverage.files
    };
  }

  /**
   * 检查覆盖率阈值
   */
  checkThresholds(coverage) {
    console.log('🎯 检查覆盖率阈值...');
    
    const results = {
      passed: true,
      failures: [],
      warnings: []
    };
    
    // 检查全局阈值
    if (coverage.combined) {
      const globalFailures = this.checkComponentThresholds(
        coverage.combined, 
        this.config.thresholds.global, 
        'global'
      );
      results.failures.push(...globalFailures);
    }
    
    // 检查客户端阈值
    if (coverage.client) {
      const clientFailures = this.checkComponentThresholds(
        coverage.client, 
        this.config.thresholds.client, 
        'client'
      );
      results.failures.push(...clientFailures);
    }
    
    // 检查服务端阈值
    if (coverage.server) {
      const serverFailures = this.checkComponentThresholds(
        coverage.server, 
        this.config.thresholds.server, 
        'server'
      );
      results.failures.push(...serverFailures);
    }
    
    results.passed = results.failures.length === 0;
    
    return results;
  }

  /**
   * 检查单个组件的阈值
   */
  checkComponentThresholds(coverage, thresholds, component) {
    const failures = [];
    
    Object.keys(thresholds).forEach(metric => {
      const actual = coverage[metric];
      const required = thresholds[metric];
      
      if (actual < required) {
        failures.push({
          component,
          metric,
          actual: actual.toFixed(2),
          required,
          difference: (required - actual).toFixed(2)
        });
      }
    });
    
    return failures;
  }

  /**
   * 保存覆盖率历史
   */
  saveCoverageHistory(coverage) {
    console.log('💾 保存覆盖率历史...');
    
    let history = [];
    
    if (fs.existsSync(this.config.historyFile)) {
      try {
        history = JSON.parse(fs.readFileSync(this.config.historyFile, 'utf8'));
      } catch (error) {
        console.warn('⚠️ 读取历史文件失败，创建新的历史记录');
      }
    }
    
    history.push(coverage);
    
    // 只保留最近100条记录
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    fs.writeFileSync(this.config.historyFile, JSON.stringify(history, null, 2));
  }

  /**
   * 生成覆盖率徽章
   */
  generateBadges(coverage) {
    console.log('🏷️ 生成覆盖率徽章...');
    
    const badges = [];
    
    if (coverage.combined) {
      badges.push(this.createBadge('overall', coverage.combined.statements));
    }
    
    if (coverage.client) {
      badges.push(this.createBadge('client', coverage.client.statements));
    }
    
    if (coverage.server) {
      badges.push(this.createBadge('server', coverage.server.statements));
    }
    
    return badges;
  }

  /**
   * 创建单个徽章
   */
  createBadge(name, percentage) {
    const color = this.getBadgeColor(percentage);
    const badge = {
      schemaVersion: 1,
      label: `coverage-${name}`,
      message: `${percentage.toFixed(1)}%`,
      color: color
    };
    
    const badgeFile = path.join(this.config.badgesDir, `${name}-coverage.json`);
    fs.writeFileSync(badgeFile, JSON.stringify(badge, null, 2));
    
    return {
      name,
      percentage,
      color,
      file: badgeFile
    };
  }

  /**
   * 根据覆盖率百分比获取徽章颜色
   */
  getBadgeColor(percentage) {
    if (percentage >= 90) return 'brightgreen';
    if (percentage >= 80) return 'green';
    if (percentage >= 70) return 'yellow';
    if (percentage >= 60) return 'orange';
    return 'red';
  }

  /**
   * 生成覆盖率报告
   */
  generateReport(coverage, thresholdResults, badges) {
    console.log('📋 生成覆盖率报告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: thresholdResults.passed,
        totalFailures: thresholdResults.failures.length,
        coverage: coverage.combined
      },
      details: {
        client: coverage.client,
        server: coverage.server,
        combined: coverage.combined
      },
      thresholds: {
        results: thresholdResults,
        config: this.config.thresholds
      },
      badges: badges,
      trends: this.calculateTrends()
    };
    
    // 保存JSON报告
    const reportFile = path.join(this.config.outputDir, 'coverage-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // 生成HTML报告
    this.generateHtmlReport(report);
    
    // 生成Markdown报告
    this.generateMarkdownReport(report);
    
    return report;
  }

  /**
   * 计算覆盖率趋势
   */
  calculateTrends() {
    if (!fs.existsSync(this.config.historyFile)) {
      return null;
    }
    
    try {
      const history = JSON.parse(fs.readFileSync(this.config.historyFile, 'utf8'));
      
      if (history.length < 2) {
        return null;
      }
      
      const current = history[history.length - 1];
      const previous = history[history.length - 2];
      
      return {
        client: this.calculateTrendForComponent(current.client, previous.client),
        server: this.calculateTrendForComponent(current.server, previous.server),
        combined: this.calculateTrendForComponent(current.combined, previous.combined)
      };
    } catch (error) {
      console.warn('⚠️ 计算趋势失败:', error);
      return null;
    }
  }

  /**
   * 计算单个组件的趋势
   */
  calculateTrendForComponent(current, previous) {
    if (!current || !previous) return null;
    
    return {
      statements: (current.statements - previous.statements).toFixed(2),
      branches: (current.branches - previous.branches).toFixed(2),
      functions: (current.functions - previous.functions).toFixed(2),
      lines: (current.lines - previous.lines).toFixed(2)
    };
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; }
        .metric { margin: 10px 0; }
        .pass { color: green; }
        .fail { color: red; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; color: white; font-size: 12px; }
        .badge.brightgreen { background: #4c1; }
        .badge.green { background: #97ca00; }
        .badge.yellow { background: #dfb317; }
        .badge.orange { background: #fe7d37; }
        .badge.red { background: #e05d44; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Coverage Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p class="${report.summary.passed ? 'pass' : 'fail'}">
            Status: ${report.summary.passed ? '✅ PASSED' : '❌ FAILED'}
        </p>
    </div>
    
    <div class="summary">
        <div class="card">
            <h3>Client Coverage</h3>
            ${this.generateMetricsHtml(report.details.client)}
        </div>
        <div class="card">
            <h3>Server Coverage</h3>
            ${this.generateMetricsHtml(report.details.server)}
        </div>
        <div class="card">
            <h3>Combined Coverage</h3>
            ${this.generateMetricsHtml(report.details.combined)}
        </div>
    </div>
    
    ${report.thresholds.results.failures.length > 0 ? `
    <div class="card">
        <h3>Threshold Failures</h3>
        ${report.thresholds.results.failures.map(f => `
            <div class="fail">
                ${f.component} ${f.metric}: ${f.actual}% (required: ${f.required}%)
            </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>`;
    
    const htmlFile = path.join(this.config.outputDir, 'coverage-report.html');
    fs.writeFileSync(htmlFile, html);
  }

  /**
   * 生成指标HTML
   */
  generateMetricsHtml(coverage) {
    if (!coverage) return '<p>No data available</p>';
    
    return `
        <div class="metric">Statements: ${coverage.statements.toFixed(2)}%</div>
        <div class="metric">Branches: ${coverage.branches.toFixed(2)}%</div>
        <div class="metric">Functions: ${coverage.functions.toFixed(2)}%</div>
        <div class="metric">Lines: ${coverage.lines.toFixed(2)}%</div>
    `;
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(report) {
    const markdown = `# Coverage Report

Generated: ${report.timestamp}

## Summary

Status: ${report.summary.passed ? '✅ PASSED' : '❌ FAILED'}

## Coverage Details

| Component | Statements | Branches | Functions | Lines |
|-----------|------------|----------|-----------|-------|
| Client | ${report.details.client?.statements.toFixed(2) || 'N/A'}% | ${report.details.client?.branches.toFixed(2) || 'N/A'}% | ${report.details.client?.functions.toFixed(2) || 'N/A'}% | ${report.details.client?.lines.toFixed(2) || 'N/A'}% |
| Server | ${report.details.server?.statements.toFixed(2) || 'N/A'}% | ${report.details.server?.branches.toFixed(2) || 'N/A'}% | ${report.details.server?.functions.toFixed(2) || 'N/A'}% | ${report.details.server?.lines.toFixed(2) || 'N/A'}% |
| Combined | ${report.details.combined?.statements.toFixed(2) || 'N/A'}% | ${report.details.combined?.branches.toFixed(2) || 'N/A'}% | ${report.details.combined?.functions.toFixed(2) || 'N/A'}% | ${report.details.combined?.lines.toFixed(2) || 'N/A'}% |

${report.thresholds.results.failures.length > 0 ? `
## Threshold Failures

${report.thresholds.results.failures.map(f => 
  `- **${f.component}** ${f.metric}: ${f.actual}% (required: ${f.required}%)`
).join('\n')}
` : ''}

## Badges

${report.badges.map(b => 
  `![${b.name} coverage](https://img.shields.io/badge/coverage--${b.name}-${b.percentage.toFixed(1)}%25-${b.color})`
).join('\n')}
`;
    
    const markdownFile = path.join(this.config.outputDir, 'coverage-report.md');
    fs.writeFileSync(markdownFile, markdown);
  }

  /**
   * 运行完整的覆盖率监控
   */
  async run() {
    try {
      console.log('🚀 开始覆盖率监控...');
      
      // 收集覆盖率数据
      const coverage = await this.collectCoverage();
      
      // 检查阈值
      const thresholdResults = this.checkThresholds(coverage);
      
      // 生成徽章
      const badges = this.generateBadges(coverage);
      
      // 保存历史
      this.saveCoverageHistory(coverage);
      
      // 生成报告
      const report = this.generateReport(coverage, thresholdResults, badges);
      
      console.log('✅ 覆盖率监控完成');
      console.log(`📊 总体覆盖率: ${coverage.combined?.statements.toFixed(2) || 'N/A'}%`);
      console.log(`🎯 阈值检查: ${thresholdResults.passed ? '通过' : '失败'}`);
      
      // 如果阈值检查失败，退出码为1
      if (!thresholdResults.passed) {
        console.error('❌ 覆盖率未达到要求的阈值');
        process.exit(1);
      }
      
      return report;
    } catch (error) {
      console.error('❌ 覆盖率监控失败:', error);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new CoverageMonitor();
  monitor.run();
}

export default CoverageMonitor;
