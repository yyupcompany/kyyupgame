/**
 * 页面性能测试套件
 * 测试所有165个页面的加载速度和性能指标
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class PagePerformanceTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = [];
    this.isLoggedIn = false;
    
    // 测试账号配置
    this.testCredentials = {
      admin: { username: 'admin', password: 'admin123' }
    };
    
    // 配置
    this.config = {
      frontendUrl: 'http://localhost:5173',
      backendUrl: 'http://localhost:3000',
      timeout: 30000,
      pageLoadTimeout: 15000,
      headless: true,
      slowMo: 0
    };
    
    // 性能阈值配置
    this.thresholds = {
      excellent: {
        loadTime: 1000,      // 1秒
        domReady: 800,       // 0.8秒
        firstPaint: 500,     // 0.5秒
        firstContentfulPaint: 800,  // 0.8秒
        largestContentfulPaint: 2500 // 2.5秒
      },
      good: {
        loadTime: 2000,
        domReady: 1500,
        firstPaint: 1000,
        firstContentfulPaint: 1500,
        largestContentfulPaint: 4000
      },
      acceptable: {
        loadTime: 3000,
        domReady: 2500,
        firstPaint: 1500,
        firstContentfulPaint: 2500,
        largestContentfulPaint: 6000
      }
    };
  }

  /**
   * 加载页面配置
   */
  loadPageConfigs() {
    try {
      const { extractPagesConfig } = require('../consoletest/extract-pages-config.cjs');
      const pages = extractPagesConfig();
      console.log(`✅ 成功加载 ${pages.length} 个页面配置`);
      return pages;
    } catch (error) {
      console.error('❌ 加载页面配置失败:', error.message);
      return [];
    }
  }

  /**
   * 检查服务状态
   */
  async checkServices() {
    console.log('🔍 检查服务状态...');
    
    try {
      // 检查前端服务
      let frontendOk = false;
      try {
        const frontendResponse = await fetch('http://localhost:5173', { 
          timeout: 5000,
          headers: { 'Accept': 'text/html' }
        });
        frontendOk = frontendResponse.status === 200;
      } catch (error) {
        frontendOk = false;
      }
      
      // 检查后端服务
      let backendOk = false;
      try {
        const backendResponse = await fetch('http://localhost:3000/api/health', { timeout: 5000 });
        backendOk = backendResponse.ok;
      } catch (error) {
        backendOk = false;
      }
      
      console.log(`前端服务: ${frontendOk ? '✅ 运行中' : '❌ 未启动'}`);
      console.log(`后端服务: ${backendOk ? '✅ 运行中' : '❌ 未启动'}`);
      
      if (!frontendOk) {
        console.log('💡 请先启动前端服务: npm run dev');
      }
      
      if (!backendOk) {
        console.log('💡 请先启动后端服务: cd server && npm run dev');
      }
      
      return frontendOk && backendOk;
    } catch (error) {
      console.error('❌ 检查服务失败:', error.message);
      return false;
    }
  }

  /**
   * 启动浏览器
   */
  async startBrowser() {
    console.log('🌐 启动浏览器...');
    
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await this.context.newPage();
    console.log('✅ 浏览器启动成功');
  }

  /**
   * 执行快捷登录
   */
  async performQuickLogin(role = 'admin') {
    if (this.isLoggedIn) {
      return true;
    }

    try {
      console.log(`🔐 执行快捷登录 (${role})...`);
      
      await this.page.goto(`${this.config.frontendUrl}/login`, { 
        waitUntil: 'networkidle',
        timeout: this.config.pageLoadTimeout 
      });

      await this.page.waitForTimeout(2000);

      const roleButtonMap = {
        admin: '.admin-btn',
        principal: '.principal-btn', 
        teacher: '.teacher-btn',
        parent: '.parent-btn'
      };

      const buttonSelector = roleButtonMap[role];
      if (buttonSelector) {
        const quickButton = await this.page.$(buttonSelector);
        if (quickButton) {
          await quickButton.click();
          console.log(`✅ 点击了${role}快捷登录按钮`);
        }
      }

      await this.page.waitForTimeout(5000);
      
      let currentUrl = this.page.url();
      let retries = 0;
      const maxRetries = 3;
      
      while (currentUrl.includes('/login') && retries < maxRetries) {
        console.log(`⏳ 等待登录跳转... (${retries + 1}/${maxRetries})`);
        await this.page.waitForTimeout(2000);
        currentUrl = this.page.url();
        retries++;
      }
      
      if (!currentUrl.includes('/login')) {
        this.isLoggedIn = true;
        console.log(`✅ 登录成功，当前页面: ${currentUrl}`);
        return true;
      } else {
        console.log('❌ 登录失败，仍在登录页面');
        return false;
      }

    } catch (error) {
      console.error('❌ 登录过程出错:', error.message);
      return false;
    }
  }

  /**
   * 测试单个页面性能
   */
  async testPagePerformance(pageConfig) {
    const startTime = Date.now();
    
    try {
      const url = `${this.config.frontendUrl}${pageConfig.path}`;
      
      // 收集性能指标
      const metrics = {
        pageName: pageConfig.name,
        pagePath: pageConfig.path,
        module: pageConfig.module,
        url: url,
        timestamp: new Date().toISOString()
      };

      // 导航到页面并测量时间
      const navigationStart = Date.now();

      // 对于海报相关页面，使用 domcontentloaded 而不是 networkidle
      // 因为这些页面可能有持续的网络活动（图片加载等）
      const isPosterPage = pageConfig.name.includes('Poster');
      const waitStrategy = isPosterPage ? 'domcontentloaded' : 'networkidle';

      await this.page.goto(url, {
        waitUntil: waitStrategy,
        timeout: this.config.pageLoadTimeout
      });

      const navigationEnd = Date.now();
      metrics.navigationTime = navigationEnd - navigationStart;

      // 等待页面稳定
      await this.page.waitForTimeout(1000);

      // 获取性能指标
      const performanceMetrics = await this.page.evaluate(() => {
        const perf = window.performance;
        const timing = perf.timing;
        const navigation = perf.getEntriesByType('navigation')[0];
        const paint = perf.getEntriesByType('paint');
        
        return {
          // 基础时间指标
          loadTime: timing.loadEventEnd - timing.navigationStart,
          domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
          domInteractive: timing.domInteractive - timing.navigationStart,
          
          // 网络时间
          dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
          tcpTime: timing.connectEnd - timing.connectStart,
          requestTime: timing.responseStart - timing.requestStart,
          responseTime: timing.responseEnd - timing.responseStart,
          
          // 渲染时间
          domParseTime: timing.domComplete - timing.domLoading,
          
          // Paint指标
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          
          // Navigation Timing API v2
          transferSize: navigation?.transferSize || 0,
          encodedBodySize: navigation?.encodedBodySize || 0,
          decodedBodySize: navigation?.decodedBodySize || 0
        };
      });

      Object.assign(metrics, performanceMetrics);

      // 评估性能等级
      metrics.performanceGrade = this.evaluatePerformance(metrics);
      metrics.success = true;
      metrics.testDuration = Date.now() - startTime;

      console.log(`✅ [${pageConfig.module}] ${pageConfig.name} - ${metrics.loadTime}ms (${metrics.performanceGrade})`);
      
      return metrics;

    } catch (error) {
      console.error(`❌ [${pageConfig.module}] ${pageConfig.name} - ${error.message}`);
      
      return {
        pageName: pageConfig.name,
        pagePath: pageConfig.path,
        module: pageConfig.module,
        url: `${this.config.frontendUrl}${pageConfig.path}`,
        success: false,
        error: error.message,
        testDuration: Date.now() - startTime,
        performanceGrade: 'FAILED'
      };
    }
  }

  /**
   * 评估性能等级
   */
  evaluatePerformance(metrics) {
    const { loadTime, domReady, firstPaint, firstContentfulPaint } = metrics;

    // 优秀
    if (loadTime <= this.thresholds.excellent.loadTime &&
        domReady <= this.thresholds.excellent.domReady &&
        firstContentfulPaint <= this.thresholds.excellent.firstContentfulPaint) {
      return 'EXCELLENT';
    }

    // 良好
    if (loadTime <= this.thresholds.good.loadTime &&
        domReady <= this.thresholds.good.domReady &&
        firstContentfulPaint <= this.thresholds.good.firstContentfulPaint) {
      return 'GOOD';
    }

    // 可接受
    if (loadTime <= this.thresholds.acceptable.loadTime &&
        domReady <= this.thresholds.acceptable.domReady &&
        firstContentfulPaint <= this.thresholds.acceptable.firstContentfulPaint) {
      return 'ACCEPTABLE';
    }

    // 需要优化
    return 'NEEDS_OPTIMIZATION';
  }

  /**
   * 运行所有页面性能测试
   */
  async runAllTests() {
    const pages = this.loadPageConfigs();

    if (pages.length === 0) {
      console.error('❌ 没有找到页面配置');
      return;
    }

    console.log(`\n📊 开始测试 ${pages.length} 个页面的性能...\n`);

    const totalPages = pages.length;
    let completedPages = 0;

    for (const pageConfig of pages) {
      completedPages++;
      console.log(`[${completedPages}/${totalPages}] 测试: ${pageConfig.name}`);

      const result = await this.testPagePerformance(pageConfig);
      this.results.push(result);

      // 短暂延迟，避免过快请求
      await this.page.waitForTimeout(500);
    }

    console.log('\n✅ 所有页面测试完成！');
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    const successResults = this.results.filter(r => r.success);
    const failedResults = this.results.filter(r => !r.success);

    // 按性能等级分组
    const byGrade = {
      EXCELLENT: successResults.filter(r => r.performanceGrade === 'EXCELLENT'),
      GOOD: successResults.filter(r => r.performanceGrade === 'GOOD'),
      ACCEPTABLE: successResults.filter(r => r.performanceGrade === 'ACCEPTABLE'),
      NEEDS_OPTIMIZATION: successResults.filter(r => r.performanceGrade === 'NEEDS_OPTIMIZATION')
    };

    // 计算平均性能指标
    const avgMetrics = this.calculateAverageMetrics(successResults);

    // 找出最快和最慢的页面
    const sortedByLoadTime = [...successResults].sort((a, b) => a.loadTime - b.loadTime);
    const fastest = sortedByLoadTime.slice(0, 10);
    const slowest = sortedByLoadTime.slice(-10).reverse();

    const report = {
      summary: {
        testType: 'Page Performance Test',
        timestamp: new Date().toISOString(),
        totalPages: this.results.length,
        successPages: successResults.length,
        failedPages: failedResults.length,
        successRate: ((successResults.length / this.results.length) * 100).toFixed(1) + '%',

        performanceDistribution: {
          excellent: byGrade.EXCELLENT.length,
          good: byGrade.GOOD.length,
          acceptable: byGrade.ACCEPTABLE.length,
          needsOptimization: byGrade.NEEDS_OPTIMIZATION.length
        },

        averageMetrics: avgMetrics
      },

      fastest: fastest,
      slowest: slowest,

      byGrade: {
        excellent: byGrade.EXCELLENT,
        good: byGrade.GOOD,
        acceptable: byGrade.ACCEPTABLE,
        needsOptimization: byGrade.NEEDS_OPTIMIZATION
      },

      failed: failedResults,

      allResults: this.results
    };

    return report;
  }

  /**
   * 计算平均性能指标
   */
  calculateAverageMetrics(results) {
    if (results.length === 0) return {};

    const sum = results.reduce((acc, r) => ({
      loadTime: acc.loadTime + (r.loadTime || 0),
      domReady: acc.domReady + (r.domReady || 0),
      domInteractive: acc.domInteractive + (r.domInteractive || 0),
      firstPaint: acc.firstPaint + (r.firstPaint || 0),
      firstContentfulPaint: acc.firstContentfulPaint + (r.firstContentfulPaint || 0),
      navigationTime: acc.navigationTime + (r.navigationTime || 0)
    }), {
      loadTime: 0,
      domReady: 0,
      domInteractive: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      navigationTime: 0
    });

    const count = results.length;

    return {
      loadTime: Math.round(sum.loadTime / count),
      domReady: Math.round(sum.domReady / count),
      domInteractive: Math.round(sum.domInteractive / count),
      firstPaint: Math.round(sum.firstPaint / count),
      firstContentfulPaint: Math.round(sum.firstContentfulPaint / count),
      navigationTime: Math.round(sum.navigationTime / count)
    };
  }

  /**
   * 保存报告
   */
  async saveReport(report) {
    const reportDir = path.join(__dirname);

    // 保存JSON报告
    const jsonPath = path.join(reportDir, 'performance-test-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 JSON报告已保存: ${jsonPath}`);

    // 生成并保存HTML报告
    const htmlReport = this.generateHtmlReport(report);
    const htmlPath = path.join(reportDir, 'performance-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`📄 HTML报告已保存: ${htmlPath}`);
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport(report) {
    const { summary, fastest, slowest, byGrade } = report;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面性能测试报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f7fa; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .card h3 { color: #333; margin-bottom: 15px; font-size: 18px; }
    .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .metric:last-child { border-bottom: none; }
    .metric-label { color: #666; }
    .metric-value { font-weight: bold; color: #333; }
    .grade-excellent { color: #10b981; }
    .grade-good { color: #3b82f6; }
    .grade-acceptable { color: #f59e0b; }
    .grade-needs-optimization { color: #ef4444; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; color: #333; }
    .table td { padding: 12px; border-bottom: 1px solid #eee; }
    .table tr:hover { background: #f8f9fa; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-excellent { background: #d1fae5; color: #065f46; }
    .badge-good { background: #dbeafe; color: #1e40af; }
    .badge-acceptable { background: #fef3c7; color: #92400e; }
    .badge-needs-optimization { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 页面性能测试报告</h1>
      <p>测试时间: ${summary.timestamp}</p>
      <p>测试页面: ${summary.totalPages} 个</p>
    </div>

    <div class="summary">
      <div class="card">
        <h3>📊 测试概览</h3>
        <div class="metric">
          <span class="metric-label">总页面数</span>
          <span class="metric-value">${summary.totalPages}</span>
        </div>
        <div class="metric">
          <span class="metric-label">成功测试</span>
          <span class="metric-value grade-excellent">${summary.successPages}</span>
        </div>
        <div class="metric">
          <span class="metric-label">失败测试</span>
          <span class="metric-value grade-needs-optimization">${summary.failedPages}</span>
        </div>
        <div class="metric">
          <span class="metric-label">成功率</span>
          <span class="metric-value">${summary.successRate}</span>
        </div>
      </div>

      <div class="card">
        <h3>⚡ 性能分布</h3>
        <div class="metric">
          <span class="metric-label">优秀 (EXCELLENT)</span>
          <span class="metric-value grade-excellent">${summary.performanceDistribution.excellent}</span>
        </div>
        <div class="metric">
          <span class="metric-label">良好 (GOOD)</span>
          <span class="metric-value grade-good">${summary.performanceDistribution.good}</span>
        </div>
        <div class="metric">
          <span class="metric-label">可接受 (ACCEPTABLE)</span>
          <span class="metric-value grade-acceptable">${summary.performanceDistribution.acceptable}</span>
        </div>
        <div class="metric">
          <span class="metric-label">需优化 (NEEDS_OPTIMIZATION)</span>
          <span class="metric-value grade-needs-optimization">${summary.performanceDistribution.needsOptimization}</span>
        </div>
      </div>

      <div class="card">
        <h3>📈 平均性能指标</h3>
        <div class="metric">
          <span class="metric-label">页面加载时间</span>
          <span class="metric-value">${summary.averageMetrics.loadTime}ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">DOM就绪时间</span>
          <span class="metric-value">${summary.averageMetrics.domReady}ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">首次绘制</span>
          <span class="metric-value">${summary.averageMetrics.firstPaint}ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">首次内容绘制</span>
          <span class="metric-value">${summary.averageMetrics.firstContentfulPaint}ms</span>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <h3>🏆 最快的10个页面</h3>
      <table class="table">
        <thead>
          <tr>
            <th>排名</th>
            <th>页面名称</th>
            <th>模块</th>
            <th>加载时间</th>
            <th>DOM就绪</th>
            <th>首次内容绘制</th>
            <th>性能等级</th>
          </tr>
        </thead>
        <tbody>
          ${fastest.map((page, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${page.pageName}</td>
              <td>${page.module}</td>
              <td>${page.loadTime}ms</td>
              <td>${page.domReady}ms</td>
              <td>${page.firstContentfulPaint}ms</td>
              <td><span class="badge badge-${page.performanceGrade.toLowerCase().replace('_', '-')}">${page.performanceGrade}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3>🐌 最慢的10个页面</h3>
      <table class="table">
        <thead>
          <tr>
            <th>排名</th>
            <th>页面名称</th>
            <th>模块</th>
            <th>加载时间</th>
            <th>DOM就绪</th>
            <th>首次内容绘制</th>
            <th>性能等级</th>
          </tr>
        </thead>
        <tbody>
          ${slowest.map((page, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${page.pageName}</td>
              <td>${page.module}</td>
              <td>${page.loadTime}ms</td>
              <td>${page.domReady}ms</td>
              <td>${page.firstContentfulPaint}ms</td>
              <td><span class="badge badge-${page.performanceGrade.toLowerCase().replace('_', '-')}">${page.performanceGrade}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 打印控制台报告
   */
  printConsoleReport(report) {
    const { summary, fastest, slowest } = report;

    console.log('\n' + '='.repeat(80));
    console.log('📊 页面性能测试报告');
    console.log('='.repeat(80));

    console.log('\n📈 测试概览:');
    console.log(`   总页面数: ${summary.totalPages}`);
    console.log(`   成功测试: ${summary.successPages}`);
    console.log(`   失败测试: ${summary.failedPages}`);
    console.log(`   成功率: ${summary.successRate}`);

    console.log('\n⚡ 性能分布:');
    console.log(`   优秀 (EXCELLENT): ${summary.performanceDistribution.excellent}`);
    console.log(`   良好 (GOOD): ${summary.performanceDistribution.good}`);
    console.log(`   可接受 (ACCEPTABLE): ${summary.performanceDistribution.acceptable}`);
    console.log(`   需优化 (NEEDS_OPTIMIZATION): ${summary.performanceDistribution.needsOptimization}`);

    console.log('\n📊 平均性能指标:');
    console.log(`   页面加载时间: ${summary.averageMetrics.loadTime}ms`);
    console.log(`   DOM就绪时间: ${summary.averageMetrics.domReady}ms`);
    console.log(`   首次绘制: ${summary.averageMetrics.firstPaint}ms`);
    console.log(`   首次内容绘制: ${summary.averageMetrics.firstContentfulPaint}ms`);

    console.log('\n🏆 最快的5个页面:');
    fastest.slice(0, 5).forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.pageName} - ${page.loadTime}ms (${page.performanceGrade})`);
    });

    console.log('\n🐌 最慢的5个页面:');
    slowest.slice(0, 5).forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.pageName} - ${page.loadTime}ms (${page.performanceGrade})`);
    });

    console.log('\n' + '='.repeat(80));
  }

  /**
   * 清理资源
   */
  async cleanup() {
    console.log('\n🧹 清理资源...');

    if (this.page) {
      await this.page.close();
    }

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ 资源清理完成');
  }

  /**
   * 运行完整测试流程
   */
  async run() {
    try {
      console.log('🚀 页面性能测试开始...\n');

      // 1. 检查服务
      const servicesReady = await this.checkServices();
      if (!servicesReady) {
        console.error('❌ 服务未就绪，无法进行测试');
        return null;
      }

      // 2. 启动浏览器
      await this.startBrowser();

      // 3. 执行登录
      console.log('🔐 执行登录以获取动态权限...');
      const loginSuccess = await this.performQuickLogin('admin');
      if (!loginSuccess) {
        console.warn('⚠️ 登录失败，测试可能会有更多错误');
      }

      // 4. 运行测试
      await this.runAllTests();

      // 5. 生成报告
      const report = this.generateReport();

      // 6. 保存报告
      await this.saveReport(report);

      // 7. 打印控制台报告
      this.printConsoleReport(report);

      return report;

    } catch (error) {
      console.error('💥 测试失败:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

module.exports = { PagePerformanceTest };

// 如果直接运行此文件
if (require.main === module) {
  const test = new PagePerformanceTest();

  // 解析命令行参数
  const args = process.argv.slice(2);
  if (args.includes('--headless')) {
    test.config.headless = true;
  }
  if (args.includes('--headed')) {
    test.config.headless = false;
  }

  test.run()
    .then(() => {
      console.log('\n✅ 测试完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 测试失败:', error);
      process.exit(1);
    });
}

