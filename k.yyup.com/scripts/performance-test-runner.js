#!/usr/bin/env node

/**
 * 性能测试执行器
 * 
 * 功能：
 * - 运行Artillery负载测试
 * - 执行Lighthouse性能测试
 * - 生成综合性能报告
 * - 性能数据对比和趋势分析
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PerformanceTestRunner {
  constructor(options = {}) {
    this.options = {
      environment: process.env.NODE_ENV || 'test',
      baseUrl: process.env.BASE_URL || 'http://localhost:5173',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      outputDir: path.join(process.cwd(), 'performance-results'),
      enableLoadTest: true,
      enableLighthouse: true,
      enableComparison: false,
      ...options
    };
    
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.results = {
      timestamp: this.timestamp,
      environment: this.options.environment,
      loadTest: null,
      lighthouse: null,
      summary: null
    };
    
    // 确保输出目录存在
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }
  }

  /**
   * 运行所有性能测试
   */
  async runAll() {
    console.log('🚀 开始性能测试套件...');
    console.log(`📍 环境: ${this.options.environment}`);
    console.log(`🌐 前端URL: ${this.options.baseUrl}`);
    console.log(`🔗 API URL: ${this.options.apiBaseUrl}`);
    
    try {
      // 检查服务是否运行
      await this.waitForServices();
      
      // 运行负载测试
      if (this.options.enableLoadTest) {
        await this.runLoadTest();
      }
      
      // 运行Lighthouse测试  
      if (this.options.enableLighthouse) {
        await this.runLighthouseTest();
      }
      
      // 生成综合报告
      await this.generateSummaryReport();
      
      // 性能对比（如果启用）
      if (this.options.enableComparison) {
        await this.performanceComparison();
      }
      
      console.log('✅ 性能测试套件完成');
      console.log(`📊 报告位置: ${this.options.outputDir}`);
      
      return this.results;
      
    } catch (error) {
      console.error('❌ 性能测试失败:', error.message);
      throw error;
    }
  }

  /**
   * 等待服务启动
   */
  async waitForServices() {
    console.log('⏰ 等待服务启动...');
    
    const services = [
      { name: '前端服务', url: this.options.baseUrl },
      { name: 'API服务', url: `${this.options.apiBaseUrl}/health` }
    ];
    
    for (const service of services) {
      await this.waitForUrl(service.url, service.name);
    }
    
    console.log('✅ 所有服务已就绪');
  }

  /**
   * 等待URL可访问
   */
  async waitForUrl(url, serviceName, timeout = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const { execSync } = require('child_process');
        execSync(`curl -s ${url}`, { timeout: 5000 });
        console.log(`✅ ${serviceName} 已启动: ${url}`);
        return;
      } catch (error) {
        console.log(`⏰ 等待 ${serviceName} 启动...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error(`${serviceName} 在${timeout}ms内未启动: ${url}`);
  }

  /**
   * 运行Artillery负载测试
   */
  async runLoadTest() {
    console.log('📈 开始负载测试...');
    
    const configPath = path.join(__dirname, '..', 'tests', 'performance', 'load-test.yml');
    const reportPath = path.join(this.options.outputDir, `load-test-${this.timestamp}.json`);
    const htmlReportPath = path.join(this.options.outputDir, `load-test-${this.timestamp}.html`);
    
    try {
      // 安装Artillery（如果未安装）
      try {
        execSync('artillery version', { stdio: 'ignore' });
      } catch (error) {
        console.log('📦 安装Artillery...');
        execSync('npm install -g artillery', { stdio: 'inherit' });
      }
      
      // 运行负载测试
      const command = `artillery run ${configPath} --output ${reportPath}`;
      console.log(`⚡ 执行: ${command}`);
      
      execSync(command, {
        stdio: 'inherit',
        env: {
          ...process.env,
          API_BASE_URL: this.options.apiBaseUrl
        }
      });
      
      // 生成HTML报告
      const htmlCommand = `artillery report ${reportPath} --output ${htmlReportPath}`;
      execSync(htmlCommand, { stdio: 'inherit' });
      
      // 读取结果
      if (fs.existsSync(reportPath)) {
        const loadTestData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        this.results.loadTest = {
          reportPath,
          htmlReportPath,
          summary: this.extractLoadTestSummary(loadTestData)
        };
        
        console.log('✅ 负载测试完成');
        console.log(`📊 报告: ${htmlReportPath}`);
      }
      
    } catch (error) {
      console.error('❌ 负载测试失败:', error.message);
      this.results.loadTest = { error: error.message };
    }
  }

  /**
   * 运行Lighthouse测试
   */
  async runLighthouseTest() {
    console.log('💡 开始Lighthouse性能测试...');
    
    try {
      // 安装Lighthouse CI（如果未安装）
      try {
        execSync('lhci --version', { stdio: 'ignore' });
      } catch (error) {
        console.log('📦 安装Lighthouse CI...');
        execSync('npm install -g @lhci/cli', { stdio: 'inherit' });
      }
      
      // 运行Lighthouse CI
      const command = 'lhci autorun';
      console.log(`💡 执行: ${command}`);
      
      execSync(command, {
        stdio: 'inherit',
        env: {
          ...process.env,
          LHCI_BUILD_CONTEXT__CURRENT_HASH: process.env.GITHUB_SHA || 'local',
          LHCI_BUILD_CONTEXT__CURRENT_BRANCH: process.env.GITHUB_REF || 'local'
        }
      });
      
      // 处理Lighthouse结果
      const lighthouseDir = './lighthouse-results';
      if (fs.existsSync(lighthouseDir)) {
        const reports = fs.readdirSync(lighthouseDir)
          .filter(file => file.endsWith('.json'))
          .map(file => path.join(lighthouseDir, file));
          
        this.results.lighthouse = {
          reportsDir: lighthouseDir,
          reports: reports,
          summary: await this.extractLighthouseSummary(reports)
        };
        
        console.log('✅ Lighthouse测试完成');
        console.log(`📊 报告目录: ${lighthouseDir}`);
      }
      
    } catch (error) {
      console.error('❌ Lighthouse测试失败:', error.message);
      this.results.lighthouse = { error: error.message };
    }
  }

  /**
   * 生成综合性能报告
   */
  async generateSummaryReport() {
    console.log('📊 生成综合性能报告...');
    
    const summary = {
      testInfo: {
        timestamp: this.timestamp,
        environment: this.options.environment,
        system: {
          platform: os.platform(),
          arch: os.arch(),
          nodeVersion: process.version,
          memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
        }
      },
      
      loadTest: this.results.loadTest?.summary || null,
      lighthouse: this.results.lighthouse?.summary || null,
      
      // 整体评估
      overall: this.calculateOverallScore()
    };
    
    // 保存JSON报告
    const summaryPath = path.join(this.options.outputDir, `performance-summary-${this.timestamp}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // 生成Markdown报告
    const markdownReport = this.generateMarkdownReport(summary);
    const markdownPath = path.join(this.options.outputDir, `performance-summary-${this.timestamp}.md`);
    fs.writeFileSync(markdownPath, markdownReport);
    
    this.results.summary = {
      jsonPath: summaryPath,
      markdownPath: markdownPath,
      data: summary
    };
    
    console.log('✅ 综合报告生成完成');
    console.log(`📄 JSON: ${summaryPath}`);
    console.log(`📝 Markdown: ${markdownPath}`);
  }

  /**
   * 提取负载测试摘要
   */
  extractLoadTestSummary(data) {
    const aggregate = data.aggregate;
    
    return {
      duration: aggregate.counters?.['vusers.created'] || 0,
      totalRequests: aggregate.counters?.['http.requests'] || 0,
      successfulRequests: (aggregate.counters?.['http.requests'] || 0) - (aggregate.counters?.['http.request_rate'] || 0),
      failedRequests: aggregate.counters?.['http.codes.4xx'] + aggregate.counters?.['http.codes.5xx'] || 0,
      
      responseTime: {
        min: aggregate.latency?.min || 0,
        max: aggregate.latency?.max || 0,
        median: aggregate.latency?.median || 0,
        p95: aggregate.latency?.p95 || 0,
        p99: aggregate.latency?.p99 || 0
      },
      
      rps: aggregate.rates?.['http.request_rate'] || 0,
      
      errors: data.intermediate?.map(phase => phase.errors || {}).reduce((acc, errors) => {
        Object.keys(errors).forEach(key => {
          acc[key] = (acc[key] || 0) + errors[key];
        });
        return acc;
      }, {})
    };
  }

  /**
   * 提取Lighthouse摘要
   */
  async extractLighthouseSummary(reportPaths) {
    if (!reportPaths.length) return null;
    
    const summaries = [];
    
    for (const reportPath of reportPaths) {
      try {
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const categories = reportData.categories || {};
        
        summaries.push({
          url: reportData.finalUrl,
          scores: {
            performance: Math.round((categories.performance?.score || 0) * 100),
            accessibility: Math.round((categories.accessibility?.score || 0) * 100),
            bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
            seo: Math.round((categories.seo?.score || 0) * 100),
            pwa: Math.round((categories.pwa?.score || 0) * 100)
          },
          metrics: {
            fcp: reportData.audits?.['first-contentful-paint']?.numericValue || 0,
            lcp: reportData.audits?.['largest-contentful-paint']?.numericValue || 0,
            cls: reportData.audits?.['cumulative-layout-shift']?.numericValue || 0,
            tbt: reportData.audits?.['total-blocking-time']?.numericValue || 0,
            tti: reportData.audits?.['interactive']?.numericValue || 0,
            si: reportData.audits?.['speed-index']?.numericValue || 0
          }
        });
      } catch (error) {
        console.warn(`⚠️ 无法解析Lighthouse报告: ${reportPath}`);
      }
    }
    
    return {
      totalReports: summaries.length,
      averageScores: this.calculateAverageScores(summaries),
      reports: summaries
    };
  }

  /**
   * 计算平均分数
   */
  calculateAverageScores(summaries) {
    if (!summaries.length) return null;
    
    const totals = summaries.reduce((acc, summary) => {
      Object.keys(summary.scores).forEach(key => {
        acc[key] = (acc[key] || 0) + summary.scores[key];
      });
      return acc;
    }, {});
    
    const averages = {};
    Object.keys(totals).forEach(key => {
      averages[key] = Math.round(totals[key] / summaries.length);
    });
    
    return averages;
  }

  /**
   * 计算整体评分
   */
  calculateOverallScore() {
    const scores = [];
    
    // 负载测试评分
    if (this.results.loadTest?.summary) {
      const lt = this.results.loadTest.summary;
      let loadScore = 100;
      
      // 响应时间惩罚
      if (lt.responseTime.p95 > 2000) loadScore -= 20;
      if (lt.responseTime.p99 > 5000) loadScore -= 20;
      
      // 错误率惩罚
      const errorRate = lt.failedRequests / lt.totalRequests;
      if (errorRate > 0.01) loadScore -= 30; // 1%以上错误率
      if (errorRate > 0.05) loadScore -= 50; // 5%以上错误率
      
      scores.push({ category: 'Load Test', score: Math.max(0, loadScore) });
    }
    
    // Lighthouse评分
    if (this.results.lighthouse?.summary?.averageScores) {
      const lh = this.results.lighthouse.summary.averageScores;
      const lighthouseScore = Math.round(
        (lh.performance + lh.accessibility + lh.bestPractices + lh.seo) / 4
      );
      
      scores.push({ category: 'Lighthouse', score: lighthouseScore });
    }
    
    // 计算总分
    const overallScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : 0;
    
    return {
      overallScore,
      breakdown: scores,
      grade: this.getGrade(overallScore)
    };
  }

  /**
   * 获取评级
   */
  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(summary) {
    return `# 性能测试报告

## 📊 测试概览

- **测试时间**: ${new Date(summary.testInfo.timestamp).toLocaleString()}
- **测试环境**: ${summary.testInfo.environment}
- **系统信息**: ${summary.testInfo.system.platform} ${summary.testInfo.system.arch}, Node.js ${summary.testInfo.system.nodeVersion}

## 🎯 整体评分

**总分**: ${summary.overall?.overallScore || 0}/100 (${summary.overall?.grade || 'N/A'})

${summary.overall?.breakdown?.map(item => `- **${item.category}**: ${item.score}/100`).join('\n') || ''}

## 📈 负载测试结果

${summary.loadTest ? `
- **总请求数**: ${summary.loadTest.totalRequests.toLocaleString()}
- **成功请求**: ${summary.loadTest.successfulRequests.toLocaleString()}
- **失败请求**: ${summary.loadTest.failedRequests.toLocaleString()}
- **请求成功率**: ${((summary.loadTest.successfulRequests / summary.loadTest.totalRequests) * 100).toFixed(2)}%

### 响应时间分布
- **最小值**: ${summary.loadTest.responseTime.min}ms
- **中位数**: ${summary.loadTest.responseTime.median}ms  
- **95百分位**: ${summary.loadTest.responseTime.p95}ms
- **99百分位**: ${summary.loadTest.responseTime.p99}ms
- **最大值**: ${summary.loadTest.responseTime.max}ms

### 每秒请求数
- **RPS**: ${summary.loadTest.rps.toFixed(2)}
` : '❌ 负载测试未执行或失败'}

## 💡 Lighthouse测试结果

${summary.lighthouse ? `
### 平均分数
- **性能**: ${summary.lighthouse.averageScores.performance}/100
- **可访问性**: ${summary.lighthouse.averageScores.accessibility}/100
- **最佳实践**: ${summary.lighthouse.averageScores.bestPractices}/100
- **SEO**: ${summary.lighthouse.averageScores.seo}/100
- **PWA**: ${summary.lighthouse.averageScores.pwa}/100

### 测试页面
${summary.lighthouse.reports.map(report => `
#### ${report.url}
- 性能: ${report.scores.performance}/100
- 可访问性: ${report.scores.accessibility}/100
- 最佳实践: ${report.scores.bestPractices}/100
- SEO: ${report.scores.seo}/100

**核心Web指标**:
- FCP: ${Math.round(report.metrics.fcp)}ms
- LCP: ${Math.round(report.metrics.lcp)}ms
- CLS: ${report.metrics.cls.toFixed(3)}
- TBT: ${Math.round(report.metrics.tbt)}ms
- TTI: ${Math.round(report.metrics.tti)}ms
`).join('\n')}
` : '❌ Lighthouse测试未执行或失败'}

## 📋 测试结论

${this.generateConclusions(summary)}

---
*报告生成时间: ${new Date().toISOString()}*
`;
  }

  /**
   * 生成测试结论
   */
  generateConclusions(summary) {
    const conclusions = [];
    
    // 整体评分结论
    const overallScore = summary.overall?.overallScore || 0;
    if (overallScore >= 80) {
      conclusions.push('✅ 系统整体性能良好，满足生产环境要求');
    } else if (overallScore >= 60) {
      conclusions.push('⚠️ 系统性能一般，建议进行优化');
    } else {
      conclusions.push('❌ 系统性能不佳，需要立即优化');
    }
    
    // 负载测试结论
    if (summary.loadTest) {
      const errorRate = summary.loadTest.failedRequests / summary.loadTest.totalRequests;
      const p95 = summary.loadTest.responseTime.p95;
      
      if (errorRate < 0.01 && p95 < 2000) {
        conclusions.push('✅ 负载测试表现优秀，系统稳定性良好');
      } else if (errorRate < 0.05 && p95 < 5000) {
        conclusions.push('⚠️ 负载测试表现一般，建议优化响应时间或错误处理');
      } else {
        conclusions.push('❌ 负载测试表现不佳，存在稳定性或性能问题');
      }
    }
    
    // Lighthouse结论
    if (summary.lighthouse?.averageScores) {
      const perf = summary.lighthouse.averageScores.performance;
      const acc = summary.lighthouse.averageScores.accessibility;
      
      if (perf >= 80 && acc >= 90) {
        conclusions.push('✅ 前端性能和可访问性表现优秀');
      } else if (perf >= 60 && acc >= 80) {
        conclusions.push('⚠️ 前端性能和可访问性需要改进');
      } else {
        conclusions.push('❌ 前端性能和可访问性存在严重问题');
      }
    }
    
    return conclusions.join('\n\n');
  }
}

// 命令行执行
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // 解析命令行参数
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    
    if (key && value) {
      if (value === 'true') options[key] = true;
      else if (value === 'false') options[key] = false;
      else options[key] = value;
    }
  }
  
  const runner = new PerformanceTestRunner(options);
  
  runner.runAll()
    .then(results => {
      console.log('\n🎉 性能测试完成!');
      console.log(`📊 整体评分: ${results.summary?.data?.overall?.overallScore || 0}/100`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 性能测试失败:', error.message);
      process.exit(1);
    });
}

module.exports = PerformanceTestRunner;