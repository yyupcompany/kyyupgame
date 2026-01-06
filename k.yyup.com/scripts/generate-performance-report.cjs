#!/usr/bin/env node

/**
 * AI模型性能测试报告生成器
 * 将JSON结果转换为可视化HTML报告
 */

const fs = require('fs');
const path = require('path');

class PerformanceReportGenerator {
  constructor(jsonFile = 'ai-model-performance-results.json') {
    // 支持命令行参数指定文件
    if (process.argv[2]) {
      jsonFile = process.argv[2];
    }
    this.jsonFile = path.join(__dirname, jsonFile);
    this.outputFile = path.join(__dirname, jsonFile.replace('.json', '-report.html'));
  }

  /**
   * 生成HTML报告
   */
  generateReport() {
    try {
      // 读取测试结果
      if (!fs.existsSync(this.jsonFile)) {
        console.error('❌ 测试结果文件不存在:', this.jsonFile);
        console.log('💡 请先运行性能测试: ./scripts/run-ai-performance-test.sh');
        return;
      }

      const results = JSON.parse(fs.readFileSync(this.jsonFile, 'utf8'));
      
      // 生成HTML内容
      const html = this.generateHTML(results);
      
      // 保存HTML文件
      fs.writeFileSync(this.outputFile, html, 'utf8');
      
      console.log('✅ HTML报告生成成功!');
      console.log(`📄 报告文件: ${this.outputFile}`);
      console.log(`🌐 在浏览器中打开: file://${this.outputFile}`);
      
    } catch (error) {
      console.error('❌ 生成报告失败:', error.message);
    }
  }

  /**
   * 生成HTML内容
   */
  generateHTML(results) {
    const { thinking, flash } = results.models;
    const comparison = results.summary;
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI模型性能对比测试报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #667eea;
            font-size: 1.1em;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .comparison-table th,
        .comparison-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        .comparison-table th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        .comparison-table tr:hover {
            background: #f8f9fa;
        }
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
        .recommendation {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .recommendation h3 {
            color: #2e7d32;
            margin: 0 0 10px 0;
        }
        .improvement {
            color: #4caf50;
            font-weight: bold;
        }
        .degradation {
            color: #f44336;
            font-weight: bold;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI模型性能对比测试报告</h1>
            <p>豆包 Thinking vs Flash 模式性能分析</p>
            <p>测试时间: ${new Date(results.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="content">
            ${this.generateOverviewSection(results)}
            ${this.generateComparisonSection(comparison)}
            ${this.generateDetailedResultsSection(thinking, flash)}
            ${this.generateChartsSection(thinking, flash)}
            ${this.generateRecommendationSection(comparison)}
        </div>
        
        <div class="footer">
            <p>报告生成时间: ${new Date().toLocaleString()}</p>
            <p>测试配置: ${results.testConfig.testRounds} 轮测试，超时 ${results.testConfig.timeout/1000} 秒</p>
        </div>
    </div>

    <script>
        ${this.generateChartScript(thinking, flash)}
    </script>
</body>
</html>`;
  }

  /**
   * 生成概览部分
   */
  generateOverviewSection(results) {
    const { thinking, flash } = results.models;
    
    return `
    <div class="section">
        <h2>📊 测试概览</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>测试模型</h3>
                <div class="stat-value">2</div>
                <div class="stat-label">Thinking + Flash</div>
            </div>
            <div class="stat-card">
                <h3>测试用例</h3>
                <div class="stat-value">${Object.keys(results.testConfig).length > 0 ? '9' : 'N/A'}</div>
                <div class="stat-label">简单 + 中等 + 复杂</div>
            </div>
            <div class="stat-card">
                <h3>测试轮数</h3>
                <div class="stat-value">${results.testConfig.testRounds}</div>
                <div class="stat-label">每个用例</div>
            </div>
            <div class="stat-card">
                <h3>总测试次数</h3>
                <div class="stat-value">${thinking && flash ? (thinking.summary.totalTests + flash.summary.totalTests) : 'N/A'}</div>
                <div class="stat-label">API调用次数</div>
            </div>
        </div>
    </div>`;
  }

  /**
   * 生成对比部分
   */
  generateComparisonSection(comparison) {
    if (!comparison || comparison.error) {
      return `
      <div class="section">
          <h2>⚠️ 对比分析</h2>
          <p>无法生成对比分析: ${comparison?.error || '缺少测试数据'}</p>
      </div>`;
    }

    return `
    <div class="section">
        <h2>🏆 性能对比</h2>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>查询类型</th>
                    <th>Thinking模式 (ms)</th>
                    <th>Flash模式 (ms)</th>
                    <th>性能提升</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>简单查询</td>
                    <td>${comparison.speedComparison.simple.thinking}</td>
                    <td>${comparison.speedComparison.simple.flash}</td>
                    <td class="${comparison.speedComparison.simple.improvement.startsWith('-') ? 'degradation' : 'improvement'}">
                        ${comparison.speedComparison.simple.improvement}
                    </td>
                </tr>
                <tr>
                    <td>中等查询</td>
                    <td>${comparison.speedComparison.medium.thinking}</td>
                    <td>${comparison.speedComparison.medium.flash}</td>
                    <td class="${comparison.speedComparison.medium.improvement.startsWith('-') ? 'degradation' : 'improvement'}">
                        ${comparison.speedComparison.medium.improvement}
                    </td>
                </tr>
                <tr>
                    <td>复杂查询</td>
                    <td>${comparison.speedComparison.complex.thinking}</td>
                    <td>${comparison.speedComparison.complex.flash}</td>
                    <td class="${comparison.speedComparison.complex.improvement.startsWith('-') ? 'degradation' : 'improvement'}">
                        ${comparison.speedComparison.complex.improvement}
                    </td>
                </tr>
            </tbody>
        </table>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Thinking 平均响应</h3>
                <div class="stat-value">${comparison.overallComparison.thinkingAvg}ms</div>
                <div class="stat-label">成功率: ${comparison.overallComparison.thinkingSuccessRate}</div>
            </div>
            <div class="stat-card">
                <h3>Flash 平均响应</h3>
                <div class="stat-value">${comparison.overallComparison.flashAvg}ms</div>
                <div class="stat-label">成功率: ${comparison.overallComparison.flashSuccessRate}</div>
            </div>
            <div class="stat-card">
                <h3>总体速度提升</h3>
                <div class="stat-value ${comparison.overallComparison.speedImprovement.startsWith('-') ? 'degradation' : 'improvement'}">
                    ${comparison.overallComparison.speedImprovement}
                </div>
                <div class="stat-label">Flash vs Thinking</div>
            </div>
        </div>
    </div>`;
  }

  /**
   * 生成详细结果部分
   */
  generateDetailedResultsSection(thinking, flash) {
    return `
    <div class="section">
        <h2>📋 详细测试结果</h2>
        ${thinking ? this.generateModelDetails('Thinking模式', thinking) : ''}
        ${flash ? this.generateModelDetails('Flash模式', flash) : ''}
    </div>`;
  }

  /**
   * 生成单个模型的详细信息
   */
  generateModelDetails(title, modelData) {
    return `
    <h3>${title} - ${modelData.displayName}</h3>
    <div class="stats-grid">
        <div class="stat-card">
            <h3>简单查询</h3>
            <div class="stat-value">${modelData.summary.simpleQueryAvg}ms</div>
            <div class="stat-label">平均响应时间</div>
        </div>
        <div class="stat-card">
            <h3>中等查询</h3>
            <div class="stat-value">${modelData.summary.mediumQueryAvg}ms</div>
            <div class="stat-label">平均响应时间</div>
        </div>
        <div class="stat-card">
            <h3>复杂查询</h3>
            <div class="stat-value">${modelData.summary.complexQueryAvg}ms</div>
            <div class="stat-label">平均响应时间</div>
        </div>
        <div class="stat-card">
            <h3>总体成功率</h3>
            <div class="stat-value">${(modelData.summary.overallSuccessRate * 100).toFixed(1)}%</div>
            <div class="stat-label">${modelData.summary.successfulTests}/${modelData.summary.totalTests} 成功</div>
        </div>
    </div>`;
  }

  /**
   * 生成图表部分
   */
  generateChartsSection(thinking, flash) {
    return `
    <div class="section">
        <h2>📈 可视化分析</h2>
        <div class="chart-container">
            <canvas id="performanceChart"></canvas>
        </div>
    </div>`;
  }

  /**
   * 生成建议部分
   */
  generateRecommendationSection(comparison) {
    if (!comparison || comparison.error) {
      return '';
    }

    return `
    <div class="section">
        <div class="recommendation">
            <h3>💡 使用建议</h3>
            <p>${comparison.recommendation}</p>
        </div>
    </div>`;
  }

  /**
   * 生成图表JavaScript代码
   */
  generateChartScript(thinking, flash) {
    if (!thinking || !flash) {
      return 'console.log("缺少图表数据");';
    }

    return `
    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['简单查询', '中等查询', '复杂查询'],
            datasets: [{
                label: 'Thinking模式 (ms)',
                data: [${thinking.summary.simpleQueryAvg}, ${thinking.summary.mediumQueryAvg}, ${thinking.summary.complexQueryAvg}],
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }, {
                label: 'Flash模式 (ms)',
                data: [${flash.summary.simpleQueryAvg}, ${flash.summary.mediumQueryAvg}, ${flash.summary.complexQueryAvg}],
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '响应时间 (毫秒)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'AI模型响应时间对比'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });`;
  }
}

// 运行报告生成器
if (require.main === module) {
  const generator = new PerformanceReportGenerator();
  generator.generateReport();
}

module.exports = PerformanceReportGenerator;
