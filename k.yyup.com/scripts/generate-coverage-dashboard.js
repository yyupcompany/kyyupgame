#!/usr/bin/env node

/**
 * HTML可视化仪表板生成器
 * 基于测试覆盖扫描器数据生成丰富的可视化报告
 */

const fs = require('fs');
const path = require('path');
const TestCoverageScanner = require('./test-coverage-scanner');

class HTMLDashboardGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.outputDir = path.join(this.projectRoot, 'coverage-reports');
    this.scanner = new TestCoverageScanner();
  }

  /**
   * 生成完整的HTML仪表板
   */
  async generateDashboard() {
    console.log('🎨 生成HTML可视化仪表板...');

    try {
      // 确保输出目录存在
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // 运行扫描器获取数据
      const coverageData = await this.scanner.run();

      // 生成HTML内容
      const htmlContent = this.generateHTMLContent(coverageData);

      // 保存HTML文件
      const dashboardPath = path.join(this.outputDir, 'test-coverage-dashboard.html');
      fs.writeFileSync(dashboardPath, htmlContent, 'utf8');

      // 生成JSON数据文件
      const jsonPath = path.join(this.outputDir, 'coverage-data.json');
      fs.writeFileSync(jsonPath, JSON.stringify(coverageData, null, 2), 'utf8');

      console.log(`✅ HTML仪表板已生成: ${dashboardPath}`);
      console.log(`📊 JSON数据已保存: ${jsonPath}`);

      return { dashboardPath, jsonPath, coverageData };
    } catch (error) {
      console.error('❌ 生成仪表板失败:', error);
      throw error;
    }
  }

  /**
   * 生成HTML内容
   */
  generateHTMLContent(data) {
    const timestamp = new Date().toLocaleString('zh-CN');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>幼儿园管理系统 - 测试覆盖仪表板</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .header .subtitle {
            color: #666;
            font-size: 1.1rem;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .metric-card h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }

        .progress-container {
            background: #f0f0f0;
            border-radius: 20px;
            height: 25px;
            overflow: hidden;
            margin: 15px 0;
            position: relative;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            border-radius: 20px;
            transition: width 1s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.9rem;
        }

        .progress-bar.low {
            background: linear-gradient(90deg, #f44336, #FF9800);
        }

        .progress-bar.medium {
            background: linear-gradient(90deg, #FF9800, #FFC107);
        }

        .progress-bar.high {
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 10px 0;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .metric-details {
            color: #666;
            font-size: 0.9rem;
            margin-top: 10px;
        }

        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            margin-bottom: 30px;
        }

        .chart-container h3 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.4rem;
        }

        .chart-wrapper {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }

        .risk-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .risk-high { background-color: #f44336; }
        .risk-medium { background-color: #ff9800; }
        .risk-low { background-color: #4CAF50; }
        .risk-covered { background-color: #2196F3; }

        .data-table {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            margin-bottom: 30px;
        }

        .data-table h3 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.4rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }

        th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-weight: 600;
        }

        tr:hover {
            background: rgba(102, 126, 234, 0.05);
        }

        .recommendations {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        .recommendations h3 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.4rem;
        }

        .recommendation-item {
            background: linear-gradient(135deg, #667eea15, #764ba215);
            border-left: 4px solid;
            border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
        }

        .recommendation-item.high {
            border-left-color: #f44336;
            background: rgba(244, 67, 54, 0.05);
        }

        .recommendation-item.medium {
            border-left-color: #ff9800;
            background: rgba(255, 152, 0, 0.05);
        }

        .recommendation-item h4 {
            color: #333;
            margin-bottom: 8px;
        }

        .recommendation-item p {
            color: #666;
            font-size: 0.9rem;
        }

        .footer {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 40px;
            padding: 20px;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: rgba(255, 255, 255, 0.9);
        }

        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }

            .dashboard-grid {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="loading" id="loading">
        <div class="spinner"></div>
        <h2>正在生成测试覆盖报告...</h2>
    </div>

    <div class="container" id="dashboard" style="display: none;">
        <!-- 页面头部 -->
        <div class="header">
            <h1>🎯 幼儿园管理系统</h1>
            <div class="subtitle">测试覆盖仪表板</div>
            <div style="margin-top: 15px; color: #666; font-size: 0.9rem;">
                生成时间: ${timestamp}
            </div>
        </div>

        <!-- 关键指标卡片 -->
        <div class="dashboard-grid">
            <div class="metric-card">
                <h3>📊 总体覆盖率</h3>
                <div class="metric-value">${data.summary.coverageRate}</div>
                <div class="progress-container">
                    <div class="progress-bar ${this.getProgressClass(data.summary.coverageRate)}"
                         style="width: ${data.summary.coverageRate}">
                        ${data.summary.coverageRate}
                    </div>
                </div>
                <div class="metric-details">
                    ${data.summary.coveredComponents} / ${data.summary.totalComponents} 组件已覆盖
                </div>
            </div>

            <div class="metric-card">
                <h3>⚠️ 风险分析</h3>
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 10px;">
                        <span class="risk-indicator risk-high"></span>
                        高风险未覆盖: <strong>${data.riskAnalysis.highRiskUncovered}</strong>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span class="risk-indicator risk-medium"></span>
                        中风险未覆盖: <strong>${data.riskAnalysis.mediumRiskUncovered}</strong>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span class="risk-indicator risk-low"></span>
                        低风险未覆盖: <strong>${data.riskAnalysis.lowRiskUncovered}</strong>
                    </div>
                </div>
                <div class="metric-details">
                    总计 ${data.summary.uncoveredComponents} 个组件需要关注
                </div>
            </div>

            <div class="metric-card">
                <h3>📈 覆盖趋势</h3>
                <div class="metric-value">
                    ${data.summary.uncoveredComponents === 0 ? '✅' : '🔄'}
                </div>
                <div class="progress-container">
                    <div class="progress-bar high" style="width: ${Math.max(20, 100 - data.summary.uncoveredComponents * 2)}%">
                        ${data.summary.uncoveredComponents === 0 ? '完成' : '进行中'}
                    </div>
                </div>
                <div class="metric-details">
                    ${data.summary.uncoveredComponents === 0 ? '所有组件已覆盖测试' : '还有 ' + data.summary.uncoveredComponents + ' 个组件待测试'}
                </div>
            </div>

            <div class="metric-card">
                <h3>🎯 质量目标</h3>
                <div class="metric-value">${this.getQualityGrade(data.summary.coverageRate)}</div>
                <div class="metric-details">
                    目标: 90% 覆盖率<br>
                    当前: ${data.summary.coverageRate}<br>
                    ${this.getRemainingWork(data.summary.coverageRate)}
                </div>
            </div>
        </div>

        <!-- 覆盖分布图表 -->
        <div class="chart-container">
            <h3>📊 组件分类覆盖情况</h3>
            <div class="chart-wrapper">
                <canvas id="categoryChart"></canvas>
            </div>
        </div>

        <!-- 风险分布图表 -->
        <div class="chart-container">
            <h3>⚠️ 风险等级分布</h3>
            <div class="chart-wrapper">
                <canvas id="riskChart"></canvas>
            </div>
        </div>

        <!-- 未覆盖组件详情表 -->
        <div class="data-table">
            <h3>📋 未覆盖组件详情</h3>
            <table id="uncoveredTable">
                <thead>
                    <tr>
                        <th>组件名称</th>
                        <th>路径</th>
                        <th>分类</th>
                        <th>风险等级</th>
                        <th>建议测试</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.generateUncoveredTableRows(data.uncoveredComponents)}
                </tbody>
            </table>
        </div>

        <!-- 改进建议 -->
        <div class="recommendations">
            <h3>💡 改进建议</h3>
            ${this.generateRecommendations(data)}
        </div>

        <!-- 页面底部 -->
        <div class="footer">
            <p>🚀 幼儿园管理系统测试覆盖报告 | 自动生成于 ${timestamp}</p>
            <p style="margin-top: 10px; font-size: 0.8rem;">
                基于 Vue 3 + Vitest + Playwright 测试框架
            </p>
        </div>
    </div>

    <script>
        // 覆盖数据
        const coverageData = ${JSON.stringify(data, null, 2)};

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                initializeCharts();
            }, 1500);
        });

        function initializeCharts() {
            // 分类覆盖图表
            const categoryCtx = document.getElementById('categoryChart').getContext('2d');
            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: ${JSON.stringify(Object.keys(data.categoryBreakdown))},
                    datasets: [{
                        label: '已覆盖',
                        data: ${JSON.stringify(Object.values(data.categoryBreakdown).map(cat => cat.covered))},
                        backgroundColor: 'rgba(76, 175, 80, 0.8)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 2
                    }, {
                        label: '未覆盖',
                        data: ${JSON.stringify(Object.values(data.categoryBreakdown).map(cat => cat.uncovered))},
                        backgroundColor: 'rgba(244, 67, 54, 0.8)',
                        borderColor: 'rgba(244, 67, 54, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return \`\${label}: \${value} (\${percentage}%)\`;
                                }
                            }
                        }
                    }
                }
            });

            // 风险分布图表
            const riskCtx = document.getElementById('riskChart').getContext('2d');
            new Chart(riskCtx, {
                type: 'bar',
                data: {
                    labels: ['高风险', '中风险', '低风险'],
                    datasets: [{
                        label: '未覆盖组件数量',
                        data: [
                            coverageData.riskAnalysis.highRiskUncovered,
                            coverageData.riskAnalysis.mediumRiskUncovered,
                            coverageData.riskAnalysis.lowRiskUncovered
                        ],
                        backgroundColor: [
                            'rgba(244, 67, 54, 0.8)',
                            'rgba(255, 152, 0, 0.8)',
                            'rgba(76, 175, 80, 0.8)'
                        ],
                        borderColor: [
                            'rgba(244, 67, 54, 1)',
                            'rgba(255, 152, 0, 1)',
                            'rgba(76, 175, 80, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return \`未覆盖: \${context.parsed.y} 个组件\`;
                                }
                            }
                        }
                    }
                }
            });

            // 表格排序功能
            makeTableSortable('uncoveredTable');
        }

        function makeTableSortable(tableId) {
            const table = document.getElementById(tableId);
            const headers = table.querySelectorAll('th');

            headers.forEach((header, index) => {
                if (index < 4) { // 前4列可排序
                    header.style.cursor = 'pointer';
                    header.addEventListener('click', () => sortTable(table, index));
                }
            });
        }

        function sortTable(table, columnIndex) {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            rows.sort((a, b) => {
                const aValue = a.cells[columnIndex].textContent.trim();
                const bValue = b.cells[columnIndex].textContent.trim();

                if (columnIndex === 3) { // 风险等级列
                    const riskOrder = { '高风险': 3, '中风险': 2, '低风险': 1 };
                    return (riskOrder[bValue] || 0) - (riskOrder[aValue] || 0);
                }

                return aValue.localeCompare(bValue, 'zh-CN');
            });

            tbody.innerHTML = '';
            rows.forEach(row => tbody.appendChild(row));
        }

        function exportToCSV() {
            const csv = convertToCSV(coverageData.uncoveredComponents);
            downloadFile('test-coverage-report.csv', csv, 'text/csv');
        }

        function convertToCSV(data) {
            const headers = ['组件名称', '路径', '分类', '风险等级', '建议测试'];
            const rows = data.map(item => [
                item.name,
                item.path,
                item.category,
                item.riskLevel,
                item.suggestions.join('; ')
            ]);

            return [headers, ...rows].map(row => row.join(',')).join('\\n');
        }

        function downloadFile(filename, content, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
  }

  /**
   * 获取进度条样式类
   */
  getProgressClass(coverageRate) {
    const rate = parseFloat(coverageRate);
    if (rate < 60) return 'low';
    if (rate < 80) return 'medium';
    return 'high';
  }

  /**
   * 获取质量等级
   */
  getQualityGrade(coverageRate) {
    const rate = parseFloat(coverageRate);
    if (rate >= 95) return 'A+';
    if (rate >= 90) return 'A';
    if (rate >= 85) return 'B+';
    if (rate >= 80) return 'B';
    if (rate >= 70) return 'C';
    return 'D';
  }

  /**
   * 获取剩余工作量
   */
  getRemainingWork(coverageRate) {
    const rate = parseFloat(coverageRate);
    const remaining = Math.max(0, 90 - rate);
    if (remaining === 0) return '已达到目标';
    return `还需提升 ${remaining.toFixed(1)}% 达到目标`;
  }

  /**
   * 生成未覆盖组件表格行
   */
  generateUncoveredTableRows(components) {
    if (components.length === 0) {
      return '<tr><td colspan="5" style="text-align: center; color: #4CAF50;">🎉 所有组件都已覆盖测试！</td></tr>';
    }

    return components.map(component => `
      <tr>
        <td><strong>${component.name}</strong></td>
        <td><code style="font-size: 0.85rem; background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${component.path}</code></td>
        <td>${component.category}</td>
        <td>
          <span class="risk-indicator risk-${component.riskLevel}"></span>
          ${component.riskLevel === 'high' ? '高风险' : component.riskLevel === 'medium' ? '中风险' : '低风险'}
        </td>
        <td>${component.suggestions.slice(0, 2).join('、')}</td>
      </tr>
    `).join('');
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(data) {
    const recommendations = [];

    if (data.riskAnalysis.highRiskUncovered > 0) {
      recommendations.push({
        priority: 'high',
        title: '立即处理高风险组件',
        description: `发现 ${data.riskAnalysis.highRiskUncovered} 个高风险组件未覆盖测试，建议优先处理这些核心业务组件。`
      });
    }

    if (data.riskAnalysis.mediumRiskUncovered > 0) {
      recommendations.push({
        priority: 'medium',
        title: '关注中风险组件',
        description: `${data.riskAnalysis.mediumRiskUncovered} 个中风险组件需要补充测试，这些组件影响用户体验。`
      });
    }

    const coverageRate = parseFloat(data.summary.coverageRate);
    if (coverageRate < 90) {
      recommendations.push({
        priority: 'high',
        title: '提升整体覆盖率',
        description: `当前覆盖率 ${data.summary.coverageRate}，建议制定计划提升到 90% 的目标。`
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        title: '持续改进',
        description: '测试覆盖率良好，建议定期监控并维护测试质量。'
      });
    }

    return recommendations.map(rec => `
      <div class="recommendation-item ${rec.priority}">
        <h4>${rec.priority === 'high' ? '🚨' : rec.priority === 'medium' ? '⚠️' : '💡'} ${rec.title}</h4>
        <p>${rec.description}</p>
      </div>
    `).join('');
  }

  /**
   * 生成并启动本地服务器
   */
  async startDashboardServer(port = 3001) {
    const http = require('http');
    const url = require('url');

    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);

      if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/dashboard') {
        const dashboardPath = path.join(this.outputDir, 'test-coverage-dashboard.html');

        if (fs.existsSync(dashboardPath)) {
          const content = fs.readFileSync(dashboardPath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Dashboard not found. Please run generate first.');
        }
      } else if (parsedUrl.pathname === '/data') {
        const jsonPath = path.join(this.outputDir, 'coverage-data.json');

        if (fs.existsSync(jsonPath)) {
          const content = fs.readFileSync(jsonPath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(content);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Data not found. Please run generate first.');
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });

    server.listen(port, () => {
      console.log(`🌐 仪表板服务器已启动: http://localhost:${port}`);
      console.log(`📊 访问仪表板: http://localhost:${port}/dashboard`);
      console.log(`📡 API数据: http://localhost:${port}/data`);
    });

    return server;
  }
}

// CLI入口
if (require.main === module) {
  const generator = new HTMLDashboardGenerator();

  const args = process.argv.slice(2);
  const shouldServe = args.includes('--serve');
  const port = parseInt(args.find(arg => arg.startsWith('--port='))?.split('=')[1]) || 3001;

  generator.generateDashboard()
    .then(({ dashboardPath, jsonPath, coverageData }) => {
      console.log('\n🎉 仪表板生成完成！');
      console.log(`📊 HTML报告: ${dashboardPath}`);
      console.log(`📋 JSON数据: ${jsonPath}`);

      console.log('\n📈 覆盖率摘要:');
      console.log(`总组件数: ${coverageData.summary.totalComponents}`);
      console.log(`已覆盖: ${coverageData.summary.coveredComponents}`);
      console.log(`覆盖率: ${coverageData.summary.coverageRate}`);
      console.log(`高风险未覆盖: ${coverageData.riskAnalysis.highRiskUncovered}`);

      if (shouldServe) {
        console.log('\n🌐 启动本地服务器...');
        generator.startDashboardServer(port).catch(error => {
          console.error('❌ 启动服务器失败:', error);
          process.exit(1);
        });
      } else {
        console.log('\n💡 提示: 使用 --serve 参数可启动本地服务器查看报告');
      }
    })
    .catch(error => {
      console.error('❌ 生成仪表板失败:', error);
      process.exit(1);
    });
}

module.exports = HTMLDashboardGenerator;