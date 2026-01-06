#!/usr/bin/env node

/**
 * 增强版测试覆盖持续监控和报告脚本
 * 集成扫描、生成、监控和自动化的完整解决方案
 */

const fs = require('fs');
const path = require('path');

// 检查并安装依赖
try {
  require('node-cron');
} catch (error) {
  console.log('⚠️  需要安装 node-cron 依赖: npm install node-cron');
  process.exit(1);
}

const cron = require('node-cron');
const TestCoverageScanner = require('./test-coverage-scanner');
const HTMLDashboardGenerator = require('./generate-coverage-dashboard');
const AutoTestGenerator = require('./auto-generate-tests');

class EnhancedCoverageMonitor {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'coverage-config.json');
    this.historyPath = path.join(this.projectRoot, 'coverage-history.json');
    this.alertsPath = path.join(this.projectRoot, 'coverage-alerts.json');

    this.config = this.loadConfig();
    this.history = this.loadHistory();
    this.alerts = this.loadAlerts();

    this.scanner = new TestCoverageScanner();
    this.dashboardGenerator = new HTMLDashboardGenerator();
    this.testGenerator = new AutoTestGenerator();

    this.isRunning = false;
    this.lastRun = null;
  }

  /**
   * 加载配置
   */
  loadConfig() {
    const defaultConfig = {
      monitoring: {
        enabled: true,
        interval: '0 9 * * 1-5', // 工作日上午9点
        thresholds: {
          critical: 70,
          warning: 85,
          target: 90
        },
        autoGenerateTests: false,
        generateReports: true,
        notifications: {
          enabled: true,
          email: false,
          webhook: false,
          console: true
        }
      },
      reports: {
        formats: ['html', 'json', 'markdown'],
        outputDir: 'coverage-reports',
        keepHistory: 30,
        compareWithPrevious: true
      },
      alerts: {
        enabled: true,
        channels: ['console'],
        thresholds: {
          coverageDrop: 5,
          highRiskComponents: 10,
          criticalUncovered: 5
        }
      },
      automation: {
        enabled: false,
        generateTestsOnCriticalAlert: true,
        createGitHubIssues: false,
        sendSlackNotifications: false
      }
    };

    if (fs.existsSync(this.configPath)) {
      try {
        return { ...defaultConfig, ...JSON.parse(fs.readFileSync(this.configPath, 'utf8')) };
      } catch (error) {
        console.warn('⚠️  配置文件加载失败，使用默认配置:', error.message);
      }
    }

    // 创建默认配置文件
    fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('📝 创建了默认配置文件: coverage-config.json');

    return defaultConfig;
  }

  /**
   * 加载历史记录
   */
  loadHistory() {
    if (fs.existsSync(this.historyPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.historyPath, 'utf8'));
      } catch (error) {
        console.warn('⚠️  历史记录加载失败:', error.message);
      }
    }

    return { records: [], metadata: { created: new Date().toISOString() } };
  }

  /**
   * 加载告警记录
   */
  loadAlerts() {
    if (fs.existsSync(this.alertsPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.alertsPath, 'utf8'));
      } catch (error) {
        console.warn('⚠️  告警记录加载失败:', error.message);
      }
    }

    return { active: [], resolved: [], metadata: { created: new Date().toISOString() } };
  }

  /**
   * 保存配置
   */
  saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * 保存历史记录
   */
  saveHistory() {
    fs.writeFileSync(this.historyPath, JSON.stringify(this.history, null, 2));
  }

  /**
   * 保存告警记录
   */
  saveAlerts() {
    fs.writeFileSync(this.alertsPath, JSON.stringify(this.alerts, null, 2));
  }

  /**
   * 执行完整的覆盖监控
   */
  async runMonitoring() {
    if (this.isRunning) {
      console.log('⚠️  监控正在运行中，跳过本次执行');
      return null;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🔍 开始测试覆盖监控...');
      const timestamp = new Date().toISOString();

      // 1. 运行覆盖扫描
      console.log('📊 执行覆盖扫描...');
      const coverageData = await this.scanner.run();

      // 2. 生成监控报告
      console.log('📋 生成监控报告...');
      const report = await this.generateMonitoringReport(coverageData, timestamp);

      // 3. 检查告警条件
      console.log('⚠️  检查告警条件...');
      const alerts = await this.checkAlerts(coverageData);

      // 4. 生成可视化报告
      if (this.config.reports.formats.includes('html')) {
        console.log('🎨 生成HTML报告...');
        await this.dashboardGenerator.generateDashboard();
      }

      // 5. 保存历史记录
      console.log('💾 保存历史记录...');
      this.saveToHistory(coverageData, report, alerts, timestamp);

      // 6. 发送通知
      if (this.config.monitoring.notifications.enabled) {
        console.log('📢 发送通知...');
        await this.sendNotifications(report, alerts);
      }

      // 7. 自动化处理
      if (this.config.automation.enabled) {
        console.log('🤖 执行自动化处理...');
        await this.handleAutomation(alerts, coverageData);
      }

      const duration = Date.now() - startTime;
      this.lastRun = { timestamp, duration, success: true };

      console.log(`✅ 监控完成，耗时: ${duration}ms`);

      return {
        timestamp,
        coverageData,
        report,
        alerts,
        summary: this.generateSummary(coverageData, alerts),
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.lastRun = { timestamp: new Date().toISOString(), duration, success: false, error: error.message };
      console.error('❌ 监控执行失败:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 生成监控报告
   */
  async generateMonitoringReport(coverageData, timestamp) {
    const previousRecord = this.getPreviousRecord();
    const comparison = previousRecord ? this.compareWithPrevious(coverageData, previousRecord.coverageData) : null;

    const report = {
      timestamp,
      summary: {
        overall: coverageData.summary,
        trends: comparison ? this.calculateTrends(comparison) : null,
        quality: this.assessQuality(coverageData.summary.coverageRate),
        health: this.calculateHealthScore(coverageData)
      },
      details: {
        categoryBreakdown: coverageData.categoryBreakdown,
        riskAnalysis: coverageData.riskAnalysis,
        uncoveredComponents: coverageData.uncoveredComponents,
        metrics: this.calculateDetailedMetrics(coverageData)
      },
      recommendations: this.generateRecommendations(coverageData, comparison),
      actions: this.generateActionItems(coverageData, comparison),
      predictions: this.generatePredictions(coverageData, this.history.records)
    };

    // 保存不同格式的报告
    await this.saveReports(report);

    return report;
  }

  /**
   * 检查告警条件
   */
  async checkAlerts(coverageData) {
    const alerts = [];
    const thresholds = this.config.alerts.thresholds;

    // 检查覆盖率下降
    const previousRecord = this.getPreviousRecord();
    if (previousRecord) {
      const previousRate = parseFloat(previousRecord.coverageData.summary.coverageRate);
      const currentRate = parseFloat(coverageData.summary.coverageRate);
      const drop = previousRate - currentRate;

      if (drop >= thresholds.coverageDrop) {
        alerts.push({
          id: this.generateAlertId(),
          type: 'coverage_drop',
          severity: 'critical',
          message: `覆盖率下降 ${drop.toFixed(1)}% (从 ${previousRate.toFixed(1)}% 到 ${currentRate.toFixed(1)}%)`,
          data: { previousRate, currentRate, drop },
          timestamp: new Date().toISOString(),
          status: 'active'
        });
      }
    }

    // 检查高风险组件数量
    if (coverageData.riskAnalysis.highRiskUncovered >= thresholds.highRiskComponents) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'high_risk_components',
        severity: 'warning',
        message: `发现 ${coverageData.riskAnalysis.highRiskUncovered} 个高风险组件未覆盖测试`,
        data: { count: coverageData.riskAnalysis.highRiskUncovered },
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    }

    // 检查关键未覆盖组件
    const criticalComponents = coverageData.uncoveredComponents.filter(c =>
      ['system', 'admin', 'finance'].includes(c.category)
    );

    if (criticalComponents.length >= thresholds.criticalUncovered) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'critical_uncovered',
        severity: 'critical',
        message: `${criticalComponents.length} 个关键组件未覆盖测试`,
        data: {
          components: criticalComponents.map(c => ({ name: c.name, category: c.category })),
          count: criticalComponents.length
        },
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    }

    // 检查覆盖率阈值
    const currentRate = parseFloat(coverageData.summary.coverageRate);
    if (currentRate < this.config.monitoring.thresholds.critical) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'low_coverage',
        severity: 'critical',
        message: `覆盖率 ${currentRate.toFixed(1)}% 低于临界值 ${this.config.monitoring.thresholds.critical}%`,
        data: { currentRate, threshold: this.config.monitoring.thresholds.critical },
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    } else if (currentRate < this.config.monitoring.thresholds.warning) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'medium_coverage',
        severity: 'warning',
        message: `覆盖率 ${currentRate.toFixed(1)}% 低于警告值 ${this.config.monitoring.thresholds.warning}%`,
        data: { currentRate, threshold: this.config.monitoring.thresholds.warning },
        timestamp: new Date().toISOString(),
        status: 'active'
      });
    }

    // 保存新的告警
    this.alerts.active.push(...alerts);
    this.saveAlerts();

    return alerts;
  }

  /**
   * 保存不同格式的报告
   */
  async saveReports(report) {
    const outputDir = path.join(this.projectRoot, this.config.reports.outputDir);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = Date.now();

    // JSON格式
    if (this.config.reports.formats.includes('json')) {
      const jsonPath = path.join(outputDir, `coverage-report-${timestamp}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    }

    // Markdown格式
    if (this.config.reports.formats.includes('markdown')) {
      const markdownPath = path.join(outputDir, `coverage-report-${timestamp}.md`);
      const markdownContent = this.generateMarkdownReport(report);
      fs.writeFileSync(markdownPath, markdownContent);
    }

    // 最新报告（固定名称）
    const latestJsonPath = path.join(outputDir, 'latest-coverage-report.json');
    fs.writeFileSync(latestJsonPath, JSON.stringify(report, null, 2));

    // CSV格式（便于数据分析）
    if (this.config.reports.formats.includes('csv')) {
      const csvPath = path.join(outputDir, `coverage-data-${timestamp}.csv`);
      const csvContent = this.generateCSVReport(report);
      fs.writeFileSync(csvPath, csvContent);
    }
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(report) {
    const { summary, details, recommendations, actions, predictions } = report;

    return `# 测试覆盖监控报告

**生成时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}

## 📊 覆盖率摘要

| 指标 | 数值 | 状态 |
|------|------|------|
| 总组件数 | ${summary.overall.totalComponents} | - |
| 已覆盖组件 | ${summary.overall.coveredComponents} | ✅ |
| 未覆盖组件 | ${summary.overall.uncoveredComponents} | ⚠️ |
| 覆盖率 | ${summary.overall.coverageRate} | ${summary.quality.grade} |
| 健康评分 | ${summary.health.score}/100 | ${summary.health.status} |

### 质量评估
**等级**: ${summary.quality.grade}
**评分**: ${summary.quality.score}/100
**描述**: ${summary.quality.description}

### 健康状态
**评分**: ${summary.health.score}/100
**状态**: ${summary.health.status}
**建议**: ${summary.health.recommendation}

${summary.trends ? `
## 📈 覆盖趋势

- 整体趋势: ${summary.trends.overall}
- 组件变化: ${summary.trends.componentChange > 0 ? '+' : ''}${summary.trends.componentChange}
- 覆盖率变化: ${summary.trends.coverageChange > 0 ? '+' : ''}${summary.trends.coverageChange}%
- 趋势强度: ${summary.trends.strength}
` : ''}

## ⚠️ 风险分析

| 风险等级 | 数量 | 百分比 | 影响 |
|----------|------|--------|------|
| 高风险 | ${details.riskAnalysis.highRiskUncovered} | ${this.calculatePercentage(details.riskAnalysis.highRiskUncovered, details.riskAnalysis.highRiskUncovered + details.riskAnalysis.mediumRiskUncovered + details.riskAnalysis.lowRiskUncovered)}% | 严重 |
| 中风险 | ${details.riskAnalysis.mediumRiskUncovered} | ${this.calculatePercentage(details.riskAnalysis.mediumRiskUncovered, details.riskAnalysis.highRiskUncovered + details.riskAnalysis.mediumRiskUncovered + details.riskAnalysis.lowRiskUncovered)}% | 中等 |
| 低风险 | ${details.riskAnalysis.lowRiskUncovered} | ${this.calculatePercentage(details.riskAnalysis.lowRiskUncovered, details.riskAnalysis.highRiskUncovered + details.riskAnalysis.mediumRiskUncovered + details.riskAnalysis.lowRiskUncovered)}% | 较轻 |

## 📂 分类覆盖情况

${Object.entries(details.categoryBreakdown).map(([category, stats]) =>
`### ${category}
- 总数: ${stats.total}
- 已覆盖: ${stats.covered}
- 未覆盖: ${stats.uncovered}
- 覆盖率: ${((stats.covered / stats.total) * 100).toFixed(1)}%
- 风险等级: ${this.getCategoryRiskLevel(stats)}`
).join('\n')}

## 📈 详细指标

${Object.entries(details.metrics).map(([metric, value]) =>
`- **${metric}**: ${typeof value === 'object' ? JSON.stringify(value) : value}`
).join('\n')}

${predictions ? `
## 🔮 预测分析

### 覆盖率预测
- **7天后预测**: ${predictions.coverage.week}%
- **30天后预测**: ${predictions.coverage.month}%
- **达到90%目标**: ${predictions.coverage.targetDate}

### 趋势分析
- **趋势方向**: ${predictions.trend.direction}
- **置信度**: ${predictions.trend.confidence}%
- **关键因素**: ${predictions.trend.factors.join(', ')}
` : ''}

## 💡 改进建议

${recommendations.map((rec, index) =>
`${index + 1}. **${rec.title}** (${rec.priority})
   - ${rec.description}
   - 影响: ${rec.impact}
   - 预期收益: ${rec.benefit}`
).join('\n')}

## 🎯 行动计划

${actions.map((action, index) =>
`${index + 1}. **${action.title}** (${action.priority})
   - 步骤: ${action.steps.join(' → ')}
   - 预期时间: ${action.estimatedTime}
   - 负责人: ${action.assignee || '待分配'}
   - 成功指标: ${action.successMetrics}`
).join('\n')}

## 📋 未覆盖组件详情

${details.uncoveredComponents.slice(0, 20).map(component =>
`### ${component.name}
- **路径**: \`${component.path}\`
- **分类**: ${component.category}
- **风险等级**: ${component.riskLevel}
- **建议测试**: ${component.suggestions.slice(0, 3).join('、')}
- **优先级**: ${this.getComponentPriority(component)}`
).join('\n')}

${details.uncoveredComponents.length > 20 ? `
... 还有 ${details.uncoveredComponents.length - 20} 个组件未在报告中显示
` : ''}

---
*此报告由增强版测试覆盖监控系统自动生成*
`;
  }

  /**
   * 生成CSV报告
   */
  generateCSVReport(report) {
    const { summary, details } = report;

    let csv = 'timestamp,total_components,covered_components,uncovered_components,coverage_rate,quality_grade,health_score,high_risk,medium_risk,low_risk\n';

    csv += `${report.timestamp},${summary.overall.totalComponents},${summary.overall.coveredComponents},${summary.overall.uncoveredComponents},${summary.overall.coverageRate},${summary.quality.grade},${summary.health.score},${details.riskAnalysis.highRiskUncovered},${details.riskAnalysis.mediumRiskUncovered},${details.riskAnalysis.lowRiskUncovered}\n`;

    // 添加分类数据
    csv += '\nCategory Statistics\n';
    csv += 'category,total,covered,uncovered,coverage_rate\n';

    Object.entries(details.categoryBreakdown).forEach(([category, stats]) => {
      const coverageRate = ((stats.covered / stats.total) * 100).toFixed(1);
      csv += `${category},${stats.total},${stats.covered},${stats.uncovered},${coverageRate}%\n`;
    });

    return csv;
  }

  /**
   * 自动化处理
   */
  async handleAutomation(alerts, coverageData) {
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

    if (criticalAlerts.length > 0 && this.config.automation.generateTestsOnCriticalAlert) {
      console.log('🤖 检测到严重告警，自动生成测试用例...');

      try {
        const result = await this.testGenerator.generateAllMissingTests({
          targetRiskLevel: 'high',
          dryRun: false,
          includeUnit: true,
          includeE2E: true,
          includeIntegration: true
        });

        console.log(`✅ 自动生成了 ${result.summary.totalGenerated} 个测试文件`);

        // 创建自动化处理记录
        const autoGenAlert = {
          id: this.generateAlertId(),
          type: 'auto_generated_tests',
          severity: 'info',
          message: `自动生成了 ${result.summary.totalGenerated} 个测试用例来响应严重告警`,
          data: {
            alertsTriggered: criticalAlerts.length,
            testsGenerated: result.summary.totalGenerated,
            componentsCovered: result.summary.totalComponents
          },
          timestamp: new Date().toISOString(),
          status: 'resolved'
        };

        this.alerts.active.push(autoGenAlert);
        this.saveAlerts();

      } catch (error) {
        console.error('❌ 自动生成测试失败:', error);
      }
    }

    // 这里可以扩展其他自动化功能
    if (this.config.automation.createGitHubIssues) {
      await this.createGitHubIssues(alerts);
    }

    if (this.config.automation.sendSlackNotifications) {
      await this.sendSlackNotifications(alerts, coverageData);
    }
  }

  /**
   * 启动定时监控
   */
  startScheduledMonitoring() {
    if (!this.config.monitoring.enabled) {
      console.log('⚠️  监控功能已禁用');
      return;
    }

    console.log('⏰ 启动增强版定时监控...');
    console.log(`📅 监控频率: ${this.config.monitoring.interval}`);

    // 验证cron表达式
    if (!cron.validate(this.config.monitoring.interval)) {
      console.error('❌ 无效的cron表达式:', this.config.monitoring.interval);
      return;
    }

    // 立即执行一次
    this.runMonitoring().catch(error => {
      console.error('❌ 初始监控失败:', error);
    });

    // 设置定时任务
    const task = cron.schedule(this.config.monitoring.interval, () => {
      console.log('⏰ 执行定时监控...');
      this.runMonitoring().catch(error => {
        console.error('❌ 定时监控失败:', error);
      });
    });

    console.log('✅ 增强版定时监控已启动');

    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('\n🛑 停止监控守护进程');
      task.stop();
      process.exit(0);
    });

    return task;
  }

  /**
   * 辅助方法
   */
  getPreviousRecord() {
    return this.history.records.length > 0 ?
      this.history.records[this.history.records.length - 1] : null;
  }

  compareWithPrevious(current, previous) {
    const currentRate = parseFloat(current.summary.coverageRate);
    const previousRate = parseFloat(previous.summary.coverageRate);

    return {
      coverageChange: currentRate - previousRate,
      componentChange: current.summary.totalComponents - previous.summary.totalComponents,
      uncoveredChange: current.summary.uncoveredComponents - previous.summary.uncoveredComponents
    };
  }

  calculateTrends(comparison) {
    const { coverageChange, componentChange, uncoveredChange } = comparison;

    let overall = 'stable';
    let strength = 'weak';

    if (coverageChange > 5) {
      overall = 'improving';
      strength = 'strong';
    } else if (coverageChange > 2) {
      overall = 'improving';
      strength = 'moderate';
    } else if (coverageChange < -5) {
      overall = 'declining';
      strength = 'strong';
    } else if (coverageChange < -2) {
      overall = 'declining';
      strength = 'moderate';
    }

    return {
      overall,
      coverageChange,
      componentChange,
      uncoveredChange,
      strength
    };
  }

  assessQuality(coverageRate) {
    const rate = parseFloat(coverageRate);

    let grade = 'F';
    let score = 0;
    let description = '需要大幅改进';

    if (rate >= 95) {
      grade = 'A+';
      score = 100;
      description = '优秀 - 超出目标';
    } else if (rate >= 90) {
      grade = 'A';
      score = 90 + (rate - 90) * 2;
      description = '良好 - 达到目标';
    } else if (rate >= 85) {
      grade = 'B';
      score = 80 + (rate - 85) * 2;
      description = '中等 - 接近目标';
    } else if (rate >= 70) {
      grade = 'C';
      score = 70 + (rate - 70);
      description = '需要改进';
    } else {
      grade = 'D';
      score = rate;
      description = '需要大幅改进';
    }

    return { grade, score: Math.round(score), description };
  }

  calculateHealthScore(coverageData) {
    let score = 0;
    let maxScore = 100;

    // 覆盖率得分 (60%)
    const rate = parseFloat(coverageData.summary.coverageRate);
    score += (rate / 100) * 60;

    // 风险控制得分 (30%)
    const totalRisk = coverageData.riskAnalysis.highRiskUncovered +
                    coverageData.riskAnalysis.mediumRiskUncovered +
                    coverageData.riskAnalysis.lowRiskUncovered;
    const riskRatio = totalRisk > 0 ?
      (coverageData.riskAnalysis.lowRiskUncovered / totalRisk) : 1;
    score += riskRatio * 30;

    // 分类覆盖均衡性得分 (10%)
    const categories = Object.values(coverageData.categoryBreakdown);
    const avgCoverage = categories.reduce((sum, cat) =>
      sum + (cat.total > 0 ? cat.covered / cat.total : 0), 0) / categories.length;
    score += avgCoverage * 10;

    let status = 'critical';
    if (score >= 90) status = 'excellent';
    else if (score >= 80) status = 'good';
    else if (score >= 70) status = 'fair';
    else if (score >= 60) status = 'poor';

    let recommendation = '需要立即采取行动提升测试覆盖率';
    if (score >= 90) recommendation = '测试覆盖状态优秀，继续保持';
    else if (score >= 80) recommendation = '测试覆盖状态良好，可继续优化';
    else if (score >= 70) recommendation = '测试覆盖状态一般，需要改进';

    return {
      score: Math.round(score),
      status,
      recommendation,
      components: {
        coverage: Math.round((rate / 100) * 60),
        riskControl: Math.round(riskRatio * 30),
        balance: Math.round(avgCoverage * 10)
      }
    };
  }

  calculateDetailedMetrics(coverageData) {
    const totalComponents = coverageData.summary.totalComponents;
    const coveredComponents = coverageData.summary.coveredComponents;

    return {
      coverageEfficiency: totalComponents > 0 ? (coveredComponents / totalComponents * 100).toFixed(1) + '%' : '0%',
      riskDistribution: {
        high: ((coverageData.riskAnalysis.highRiskUncovered / totalComponents) * 100).toFixed(1) + '%',
        medium: ((coverageData.riskAnalysis.mediumRiskUncovered / totalComponents) * 100).toFixed(1) + '%',
        low: ((coverageData.riskAnalysis.lowRiskUncovered / totalComponents) * 100).toFixed(1) + '%'
      },
      categoryBalance: this.calculateCategoryBalance(coverageData.categoryBreakdown),
      testDebt: this.calculateTestDebt(coverageData.uncoveredComponents)
    };
  }

  calculateCategoryBreakdown(categoryBreakdown) {
    const categories = Object.values(categoryBreakdown);
    if (categories.length === 0) return 0;

    const coverages = categories.map(cat => cat.total > 0 ? cat.covered / cat.total : 0);
    const avgCoverage = coverages.reduce((sum, cov) => sum + cov, 0) / coverages.length;

    const variance = coverages.reduce((sum, cov) => sum + Math.pow(cov - avgCoverage, 2), 0) / coverages.length;
    const stdDev = Math.sqrt(variance);

    return {
      average: (avgCoverage * 100).toFixed(1) + '%',
      standardDeviation: stdDev.toFixed(3),
      balance: stdDev < 0.1 ? 'excellent' : stdDev < 0.2 ? 'good' : 'needs_improvement'
    };
  }

  calculateTestDebt(uncoveredComponents) {
    const highRiskDebt = uncoveredComponents.filter(c => c.riskLevel === 'high').length * 3;
    const mediumRiskDebt = uncoveredComponents.filter(c => c.riskLevel === 'medium').length * 2;
    const lowRiskDebt = uncoveredComponents.filter(c => c.riskLevel === 'low').length * 1;

    const totalDebt = highRiskDebt + mediumRiskDebt + lowRiskDebt;

    return {
      total: totalDebt,
      highRisk: highRiskDebt,
      mediumRisk: mediumRiskDebt,
      lowRisk: lowRiskDebt,
      level: totalDebt > 30 ? 'critical' : totalDebt > 15 ? 'high' : totalDebt > 5 ? 'medium' : 'low'
    };
  }

  generatePredictions(coverageData, history) {
    if (history.length < 3) {
      return null;
    }

    // 简单的线性预测
    const recentRecords = history.slice(-5);
    const coverageRates = recentRecords.map(record =>
      parseFloat(record.coverageData.summary.coverageRate)
    );

    const trend = this.calculateTrend(coverageRates);
    const currentRate = coverageRates[coverageRates.length - 1] || 0;

    const weekPrediction = Math.min(100, Math.max(0, currentRate + trend * 7));
    const monthPrediction = Math.min(100, Math.max(0, currentRate + trend * 30));

    // 计算达到90%目标所需时间
    const targetRate = 90;
    const daysToTarget = trend > 0 ? Math.ceil((targetRate - currentRate) / trend) : null;

    return {
      coverage: {
        week: weekPrediction.toFixed(1),
        month: monthPrediction.toFixed(1),
        targetDate: daysToTarget ? `${daysToTarget}天后` : '无法预测'
      },
      trend: {
        direction: trend > 0.5 ? '上升' : trend < -0.5 ? '下降' : '稳定',
        confidence: Math.min(95, Math.max(10, (1 - Math.abs(trend) / 2) * 100)).toFixed(0),
        factors: this.identifyTrendFactors(coverageData, recentRecords)
      }
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;

    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope || 0;
  }

  identifyTrendFactors(coverageData, history) {
    const factors = [];

    const componentChange = coverageData.summary.totalComponents - (history[0]?.coverageData.summary.totalComponents || 0);
    if (componentChange > 5) factors.push('组件数量增加');
    if (componentChange < -5) factors.push('组件数量减少');

    const riskChange = coverageData.riskAnalysis.highRiskUncovered - (history[0]?.coverageData.riskAnalysis.highRiskUncovered || 0);
    if (riskChange > 0) factors.push('高风险组件增加');
    if (riskChange < 0) factors.push('风险控制改善');

    return factors.length > 0 ? factors : ['常规变化'];
  }

  generateRecommendations(coverageData, comparison) {
    const recommendations = [];
    const rate = parseFloat(coverageData.summary.coverageRate);

    if (rate < this.config.monitoring.thresholds.critical) {
      recommendations.push({
        title: '立即提升覆盖率',
        priority: 'critical',
        description: `当前覆盖率 ${rate.toFixed(1)}% 低于临界值，需要立即采取行动`,
        impact: '高风险组件缺乏保护',
        benefit: '大幅降低系统风险'
      });
    }

    if (coverageData.riskAnalysis.highRiskUncovered > 0) {
      recommendations.push({
        title: '优先覆盖高风险组件',
        priority: 'critical',
        description: `${coverageData.riskAnalysis.highRiskUncovered} 个高风险组件需要立即测试覆盖`,
        impact: '核心业务功能缺乏保障',
        benefit: '保护关键业务流程'
      });
    }

    if (comparison && comparison.coverageChange < -5) {
      recommendations.push({
        title: '调查覆盖率下降原因',
        priority: 'high',
        description: `覆盖率下降了 ${Math.abs(comparison.coverageChange).toFixed(1)}%`,
        impact: '代码质量可能存在问题',
        benefit: '防止质量进一步恶化'
      });
    }

    if (rate >= this.config.monitoring.thresholds.target) {
      recommendations.push({
        title: '保持高质量标准',
        priority: 'medium',
        description: '当前覆盖率已达目标，重点转向维持质量',
        impact: '防止质量回退',
        benefit: '维持系统稳定性'
      });
    }

    return recommendations;
  }

  generateActionItems(coverageData, comparison) {
    const actions = [];

    // 高风险组件行动
    if (coverageData.riskAnalysis.highRiskUncovered > 0) {
      actions.push({
        title: '为高风险组件创建测试',
        priority: 'high',
        steps: [
          '识别高风险组件',
          '创建单元测试',
          '添加E2E测试',
          '验证覆盖率提升'
        ],
        estimatedTime: '2-3天',
        assignee: '测试工程师',
        successMetrics: `覆盖率提升至至少${(parseFloat(coverageData.summary.coverageRate) + 5).toFixed(1)}%`
      });
    }

    // 覆盖率提升行动
    const rate = parseFloat(coverageData.summary.coverageRate);
    if (rate < this.config.monitoring.thresholds.target) {
      actions.push({
        title: '制定覆盖率提升计划',
        priority: 'medium',
        steps: [
          '分析未覆盖组件',
          '制定测试优先级',
          '分配测试任务',
          '设置里程碑'
        ],
        estimatedTime: '1-2周',
        assignee: '技术负责人',
        successMetrics: `${this.config.monitoring.thresholds.target}天内达到${this.config.monitoring.thresholds.target}%覆盖率`
      });
    }

    return actions;
  }

  saveToHistory(coverageData, report, alerts, timestamp) {
    const record = {
      timestamp,
      coverageData,
      report: {
        summary: report.summary,
        alertsCount: alerts.length
      },
      alerts: alerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message
      }))
    };

    this.history.records.push(record);

    // 保持历史记录数量在限制范围内
    const maxRecords = this.config.reports.keepHistory;
    if (this.history.records.length > maxRecords) {
      this.history.records = this.history.records.slice(-maxRecords);
    }

    this.saveHistory();
  }

  async sendNotifications(report, alerts) {
    const channels = this.config.monitoring.notifications;

    if (channels.console && alerts.length > 0) {
      console.log('\n🚨 测试覆盖告警:');
      alerts.forEach(alert => {
        const icon = alert.severity === 'critical' ? '🔴' : '🟡';
        console.log(`${icon} ${alert.message}`);
      });
    }

    // 这里可以扩展其他通知方式
  }

  async createGitHubIssues(alerts) {
    // GitHub Issues 创建逻辑
    console.log('📝 创建GitHub Issues功能待实现');
  }

  async sendSlackNotifications(alerts, coverageData) {
    // Slack 通知逻辑
    console.log('💬 Slack通知功能待实现');
  }

  generateSummary(coverageData, alerts) {
    return {
      coverageRate: coverageData.summary.coverageRate,
      totalComponents: coverageData.summary.totalComponents,
      uncoveredComponents: coverageData.summary.uncoveredComponents,
      highRiskCount: coverageData.riskAnalysis.highRiskUncovered,
      alertsCount: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      quality: this.assessQuality(coverageData.summary.coverageRate),
      health: this.calculateHealthScore(coverageData)
    };
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculatePercentage(value, total) {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  }

  getCategoryRiskLevel(stats) {
    const uncoveredRatio = stats.uncovered / stats.total;
    if (uncoveredRatio > 0.5) return '高风险';
    if (uncoveredRatio > 0.2) return '中风险';
    return '低风险';
  }

  getComponentPriority(component) {
    if (component.riskLevel === 'high') return 'P0 - 立即处理';
    if (component.riskLevel === 'medium') return 'P1 - 本周处理';
    return 'P2 - 下周处理';
  }

  /**
   * 获取监控状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      config: this.config,
      historyCount: this.history.records.length,
      activeAlertsCount: this.alerts.active.length
    };
  }
}

// CLI入口
if (require.main === module) {
  const monitor = new EnhancedCoverageMonitor();
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
增强版测试覆盖监控系统

用法:
  node enhanced-coverage-monitor.js [选项]

选项:
  --run-now          立即执行一次监控
  --start-daemon     启动定时监控守护进程
  --status           显示监控状态
  --config           显示当前配置
  --history          显示历史记录
  --alerts           显示活跃告警
  --generate-tests   自动生成缺失的测试
  --dashboard        仅生成HTML仪表板
  --help, -h         显示帮助信息

示例:
  node enhanced-coverage-monitor.js --run-now
  node enhanced-coverage-monitor.js --start-daemon
  node enhanced-coverage-monitor.js --status
    `);
    process.exit(0);
  }

  if (args.includes('--status')) {
    const status = monitor.getStatus();
    console.log('📊 监控状态:');
    console.log(JSON.stringify(status, null, 2));
    process.exit(0);
  }

  if (args.includes('--config')) {
    console.log('⚙️  当前配置:');
    console.log(JSON.stringify(monitor.config, null, 2));
    process.exit(0);
  }

  if (args.includes('--history')) {
    console.log('📈 历史记录:');
    console.log(JSON.stringify(monitor.history, null, 2));
    process.exit(0);
  }

  if (args.includes('--alerts')) {
    console.log('🚨 活跃告警:');
    console.log(JSON.stringify(monitor.alerts.active, null, 2));
    process.exit(0);
  }

  if (args.includes('--generate-tests')) {
    console.log('🤖 自动生成测试...');
    monitor.testGenerator.generateAllMissingTests({
      dryRun: false,
      includeUnit: true,
      includeE2E: true,
      includeIntegration: true
    }).then(result => {
      console.log('✅ 测试生成完成:', result.summary);
    }).catch(error => {
      console.error('❌ 测试生成失败:', error);
      process.exit(1);
    });
    process.exit(0);
  }

  if (args.includes('--dashboard')) {
    console.log('🎨 生成HTML仪表板...');
    monitor.dashboardGenerator.generateDashboard()
      .then(() => {
        console.log('✅ 仪表板生成完成');
      })
      .catch(error => {
        console.error('❌ 仪表板生成失败:', error);
        process.exit(1);
      });
    process.exit(0);
  }

  if (args.includes('--start-daemon')) {
    console.log('🚀 启动增强版监控守护进程...');
    monitor.startScheduledMonitoring();

  } else {
    // 默认执行一次监控
    console.log('🚀 执行增强版单次监控...');
    monitor.runMonitoring()
      .then(result => {
        if (result) {
          console.log('\n📊 监控摘要:');
          console.log(`覆盖率: ${result.summary.coverageRate}`);
          console.log(`未覆盖组件: ${result.summary.uncoveredComponents}`);
          console.log(`告警数量: ${result.summary.alertsCount}`);
          console.log(`质量等级: ${result.summary.quality.grade}`);
          console.log(`健康评分: ${result.summary.health.score}/100`);

          if (result.summary.criticalAlerts > 0) {
            console.log(`\n🚨 发现 ${result.summary.criticalAlerts} 个严重告警！`);
          }

          console.log(`⏱️  执行耗时: ${result.duration}ms`);
        }
      })
      .catch(error => {
        console.error('❌ 监控执行失败:', error);
        process.exit(1);
      });
  }
}

module.exports = EnhancedCoverageMonitor;