/**
 * 性能测试脚本 - 验证修复效果
 * 重点测试之前发现的慢页面
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PerformanceTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.baseUrl = 'http://localhost:5173';
    
    // 重点测试的慢页面
    this.slowPages = [
      { route: '/system/settings', name: '系统设置页面' },
      { route: '/system/users', name: '用户管理页面' },
      { route: '/dashboard', name: '仪表板页面' },
      { route: '/teacher', name: '教师管理页面' },
      { route: '/student', name: '学生管理页面' }
    ];
  }

  async init() {
    console.log('🚀 启动性能测试...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // 设置页面大小
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 模拟网络条件
    await this.page.setCacheEnabled(false);
    
    // 设置超时时间
    this.page.setDefaultTimeout(15000);
    
    // 监听控制台错误
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ 控制台错误:', msg.text());
      }
    });
    
    // 监听页面错误
    this.page.on('pageerror', error => {
      console.log('❌ 页面错误:', error.message);
    });
  }

  async testPagePerformance(route, name) {
    console.log(`\n📊 测试页面: ${name} (${route})`);
    
    const startTime = Date.now();
    
    try {
      // 开始性能监控
      await this.page.coverage.startJSCoverage();
      
      // 导航到页面
      const navigationStart = Date.now();
      const response = await this.page.goto(`${this.baseUrl}${route}`, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });
      const navigationTime = Date.now() - navigationStart;
      
      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }
      
      // 等待页面稳定
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取性能指标
      const metrics = await this.page.metrics();
      const performanceTimings = await this.page.evaluate(() => {
        return JSON.parse(JSON.stringify(performance.timing));
      });
      
      // 检查页面内容加载
      const contentLoaded = await this.page.evaluate(() => {
        return {
          hasContent: document.body.innerHTML.length > 1000,
          hasErrors: document.querySelectorAll('.error-message, .el-alert--error').length > 0,
          hasLoading: document.querySelectorAll('.el-skeleton, .el-loading-mask').length > 0
        };
      });
      
      // 结束性能监控
      const jsCoverage = await this.page.coverage.stopJSCoverage();
      
      const totalTime = Date.now() - startTime;
      
      const result = {
        route,
        name,
        navigationTime,
        totalTime,
        metrics: {
          jsHeapUsedSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024 * 100) / 100,
          jsHeapTotalSize: Math.round(metrics.JSHeapTotalSize / 1024 / 1024 * 100) / 100,
          domContentLoaded: performanceTimings.domContentLoadedEventEnd - performanceTimings.navigationStart,
          loadComplete: performanceTimings.loadEventEnd - performanceTimings.navigationStart
        },
        contentStatus: contentLoaded,
        jsFilesCount: jsCoverage.length,
        status: totalTime < 5000 ? 'good' : totalTime < 10000 ? 'acceptable' : 'slow'
      };
      
      console.log(`  ✅ 导航时间: ${navigationTime}ms`);
      console.log(`  ✅ 总加载时间: ${totalTime}ms`);
      console.log(`  ✅ 内存使用: ${result.metrics.jsHeapUsedSize}MB`);
      console.log(`  ✅ 页面状态: ${result.status}`);
      console.log(`  ✅ 内容加载: ${contentLoaded.hasContent ? '正常' : '异常'}`);
      console.log(`  ✅ 错误状态: ${contentLoaded.hasErrors ? '有错误' : '无错误'}`);
      
      return result;
      
    } catch (error) {
      console.log(`  ❌ 测试失败: ${error.message}`);
      return {
        route,
        name,
        error: error.message,
        navigationTime: -1,
        totalTime: Date.now() - startTime,
        status: 'error'
      };
    }
  }

  async runAllTests() {
    console.log('\n🔄 开始性能测试...');
    
    for (const pageConfig of this.slowPages) {
      const result = await this.testPagePerformance(pageConfig.route, pageConfig.name);
      this.results.push(result);
      
      // 等待一下避免过快请求
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `reports/performance-test-${timestamp}.json`);
    
    // 确保reports目录存在
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        goodPerformance: this.results.filter(r => r.status === 'good').length,
        acceptablePerformance: this.results.filter(r => r.status === 'acceptable').length,
        slowPerformance: this.results.filter(r => r.status === 'slow').length,
        errors: this.results.filter(r => r.status === 'error').length,
        averageLoadTime: Math.round(this.results.reduce((sum, r) => sum + (r.totalTime || 0), 0) / this.results.length)
      },
      results: this.results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 性能测试报告:');
    console.log(`总测试页面: ${report.summary.totalTests}`);
    console.log(`良好性能: ${report.summary.goodPerformance} 页面`);
    console.log(`可接受性能: ${report.summary.acceptablePerformance} 页面`);
    console.log(`慢页面: ${report.summary.slowPerformance} 页面`);
    console.log(`错误页面: ${report.summary.errors} 页面`);
    console.log(`平均加载时间: ${report.summary.averageLoadTime}ms`);
    console.log(`\n报告已保存到: ${reportPath}`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 主函数
async function main() {
  const test = new PerformanceTest();
  
  try {
    await test.init();
    await test.runAllTests();
    const report = test.generateReport();
    
    // 输出关键性能指标
    console.log('\n🎯 关键性能指标:');
    test.results.forEach(result => {
      if (result.route === '/system/settings') {
        console.log(`📈 系统设置页面优化效果:`);
        console.log(`   - 加载时间: ${result.totalTime}ms ${result.totalTime < 5000 ? '✅ 已优化' : '❌ 仍需优化'}`);
        console.log(`   - 内存使用: ${result.metrics?.jsHeapUsedSize || 'N/A'}MB`);
        console.log(`   - 页面状态: ${result.status}`);
      }
    });
    
    // 检查是否有显著改进
    const systemSettingsResult = test.results.find(r => r.route === '/system/settings');
    if (systemSettingsResult && systemSettingsResult.totalTime < 5000) {
      console.log('\n🎉 系统设置页面性能优化成功！');
    } else if (systemSettingsResult && systemSettingsResult.totalTime > 10000) {
      console.log('\n⚠️  系统设置页面仍需进一步优化');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  } finally {
    await test.cleanup();
  }
}

// 运行测试
main().catch(console.error);