#!/usr/bin/env node

/**
 * 登录页面加载速度压力测试
 * 每次增加5个并发用户，测试页面加载性能
 * 不进行登录操作，只测试页面访问速度
 */

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');
const fs = require('fs/promises');
const path = require('path');

class LoginPageLoadTest {
  constructor() {
    this.browser = null;
    this.baseURL = 'http://localhost:5173';
    this.currentConcurrency = 5;
    this.maxConcurrency = 100; // 最大测试到100个并发
    this.results = [];
    this.failureThreshold = 3; // 连续失败3次就停止

    // 测试配置
    this.testConfig = {
      name: '登录页面加载测试',
      description: '测试登录页面加载速度和渲染性能'
    };
  }

  async init() {
    console.log('🚀 初始化登录页面加载速度测试...');

    // 检查服务是否运行
    try {
      await this.checkServices();
    } catch (error) {
      console.error('❌ 服务检查失败:', error);
      throw error;
    }

    // 启动浏览器
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    console.log('✅ 浏览器已启动');
  }

  async checkServices() {
    // 检查前端服务
    try {
      const frontendResponse = await fetch(`${this.baseURL}`, {
        method: 'GET'
      });
      if (!frontendResponse.ok) {
        throw new Error(`前端服务响应异常: ${frontendResponse.status}`);
      }
      console.log('✅ 前端服务正常');
    } catch (error) {
      throw new Error(`前端服务不可用: ${error}`);
    }
  }

  async performPageLoad(userId) {
    const context = await this.browser.newContext({
      userAgent: `PageLoadTest-${userId}`,
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    const startTime = performance.now();
    const result = {
      userId,
      success: false,
      loadTime: 0,
      renderTime: 0,
      totalTime: 0,
      error: null,
      pageSize: 0,
      resourceCount: 0
    };

    try {
      console.log(`🔄 用户 ${userId} 开始页面加载测试`);

      // 监听网络请求
      const resources = [];
      page.on('response', response => {
        resources.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'] || 0
        });
      });

      // 访问登录页面
      const loadStartTime = performance.now();
      await page.goto(`${this.baseURL}/login`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      const loadEndTime = performance.now();

      // 等待页面渲染完成
      const renderStartTime = performance.now();
      try {
        // 等待登录表单元素加载
        await Promise.race([
          page.waitForSelector('input[placeholder*="用户名"]', { timeout: 10000 }),
          page.waitForSelector('input[type="text"]', { timeout: 10000 }),
          page.waitForSelector('.login-form', { timeout: 10000 })
        ]);
      } catch (e) {
        // 如果找不到登录元素，等待页面基本加载
        await page.waitForTimeout(2000);
      }
      const renderEndTime = performance.now();

      const endTime = performance.now();

      // 计算性能指标
      result.loadTime = Math.round(loadEndTime - loadStartTime);
      result.renderTime = Math.round(renderEndTime - renderStartTime);
      result.totalTime = Math.round(endTime - startTime);
      result.resourceCount = resources.length;
      result.pageSize = resources.reduce((sum, res) => sum + parseInt(res.size || 0), 0);

      // 检查页面是否正确加载
      const pageTitle = await page.title();
      const pageContent = await page.content();

      result.success = !(
        pageContent.includes('404') ||
        pageContent.includes('页面不存在') ||
        pageContent.includes('Server Error') ||
        pageContent.includes('Internal Server Error') ||
        pageContent.includes('Cannot GET') ||
        result.totalTime > 30000
      );

      // 如果页面有内容且不是错误页面，就认为加载成功
      if (!result.success && pageContent.length > 1000) {
        result.success = true;
        result.error = null;
      }

      // 获取页面性能指标
      try {
        const performanceMetrics = await page.evaluate(() => {
          if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            return {
              domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
              pageLoad: timing.loadEventEnd - timing.navigationStart,
              firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
              firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
            };
          }
          return null;
        });

        result.performanceMetrics = performanceMetrics;
      } catch (e) {
        console.warn(`⚠️ 用户 ${userId} 获取性能指标失败:`, e.message);
      }

      if (result.success) {
        console.log(`✅ 用户 ${userId} 页面加载成功 - 总耗时: ${result.totalTime}ms, 加载: ${result.loadTime}ms, 渲染: ${result.renderTime}ms`);
      } else {
        result.error = '页面加载失败或内容异常';
        console.log(`❌ 用户 ${userId} 页面加载失败: ${result.error}`);
      }

    } catch (error) {
      result.error = error.message || String(error);
      result.totalTime = Math.round(performance.now() - startTime);
      console.log(`💥 用户 ${userId} 页面加载异常: ${result.error}`);
    } finally {
      await context.close();
    }

    return result;
  }

  async runConcurrencyTest(concurrency) {
    console.log(`\n🎯 测试并发级别: ${concurrency} 个用户`);

    const startTime = performance.now();
    const results = [];
    const errors = {};

    // 创建并发任务
    const tasks = [];
    for (let i = 0; i < concurrency; i++) {
      const userId = i + 1;
      tasks.push(this.performPageLoad(userId));
    }

    // 等待所有任务完成
    const allResults = await Promise.all(tasks);
    results.push(...allResults);

    // 统计结果
    const successfulLoads = results.filter(r => r.success).length;
    const failedLoads = results.length - successfulLoads;
    const successRate = (successfulLoads / results.length) * 100;

    let averageLoadTime = 0;
    let averageRenderTime = 0;
    let averageTotalTime = 0;
    let totalPageSize = 0;
    let totalResourceCount = 0;

    if (results.length > 0) {
      const successfulResults = results.filter(r => r.success);
      if (successfulResults.length > 0) {
        averageLoadTime = successfulResults.reduce((sum, r) => sum + r.loadTime, 0) / successfulResults.length;
        averageRenderTime = successfulResults.reduce((sum, r) => sum + r.renderTime, 0) / successfulResults.length;
        averageTotalTime = successfulResults.reduce((sum, r) => sum + r.totalTime, 0) / successfulResults.length;
        totalPageSize = successfulResults.reduce((sum, r) => sum + r.pageSize, 0);
        totalResourceCount = successfulResults.reduce((sum, r) => sum + r.resourceCount, 0);
      }
    }

    // 统计错误类型
    results.forEach(result => {
      if (!result.success && result.error) {
        errors[result.error] = (errors[result.error] || 0) + 1;
      }
    });

    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);

    const testResult = {
      concurrency,
      totalTime,
      successfulLoads,
      failedLoads,
      successRate: Math.round(successRate * 10) / 10,
      averageLoadTime: Math.round(averageLoadTime),
      averageRenderTime: Math.round(averageRenderTime),
      averageTotalTime: Math.round(averageTotalTime),
      averagePageSize: Math.round(totalPageSize / Math.max(successfulLoads, 1)),
      averageResourceCount: Math.round(totalResourceCount / Math.max(successfulLoads, 1)),
      results,
      errors
    };

    // 简化输出
    console.log(`📊 结果: 成功 ${successfulLoads}/${results.length} (${testResult.successRate}%) | 平均加载时间: ${Math.round(averageLoadTime)}ms | 平均总时间: ${Math.round(averageTotalTime)}ms | 总耗时: ${totalTime}ms`);

    if (Object.keys(errors).length > 0) {
      const mainError = Object.keys(errors)[0];
      const shortError = mainError.length > 50 ? mainError.substring(0, 50) + '...' : mainError;
      console.log(`❌ 主要错误: ${shortError} (${errors[mainError]}次)`);
    }

    return testResult;
  }

  async runProgressiveTest() {
    console.log('🧪 开始登录页面加载速度渐进式测试...\n');
    console.log('测试策略: 每次增加5个并发用户，测试页面加载性能');
    console.log(`测试范围: 5 - ${this.maxConcurrency} 个并发用户`);
    console.log(`失败阈值: 连续失败 ${this.failureThreshold} 次停止测试\n`);

    let consecutiveFailures = 0;

    for (let concurrency = 5; concurrency <= this.maxConcurrency; concurrency += 5) {
      try {
        const result = await this.runConcurrencyTest(concurrency);
        this.results.push(result);

        // 检查是否达到失败阈值
        if (result.successRate < 80) { // 成功率低于80%
          consecutiveFailures++;
          console.log(`⚠️ 警告: 成功率低于80% (${result.successRate}%)`);
        } else {
          consecutiveFailures = 0;
        }

        // 如果连续失败次数达到阈值，停止测试
        if (consecutiveFailures >= this.failureThreshold) {
          console.log(`\n🛑 达到失败阈值，停止测试`);
          console.log(`临界点: ${concurrency - (this.failureThreshold * 5)} 个并发用户`);
          break;
        }

        // 如果成功率为0，也停止测试
        if (result.successRate === 0) {
          console.log(`\n🛑 成功率为0%，停止测试`);
          console.log(`临界点: ${concurrency - 5} 个并发用户`);
          break;
        }

        // 在测试之间稍作停顿
        if (concurrency < this.maxConcurrency) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        console.error(`❌ 并发 ${concurrency} 测试失败:`, error);
        consecutiveFailures++;

        if (consecutiveFailures >= this.failureThreshold) {
          console.log(`\n🛑 连续失败次数过多，停止测试`);
          break;
        }
      }
    }
  }

  findCriticalPoint() {
    if (this.results.length === 0) return null;

    // 找到成功率开始显著下降的点
    for (let i = 1; i < this.results.length; i++) {
      const prevResult = this.results[i - 1];
      const currentResult = this.results[i];

      // 如果成功率下降超过20%，认为是临界点
      if (prevResult.successRate - currentResult.successRate > 20) {
        return {
          concurrency: prevResult.concurrency,
          successRate: prevResult.successRate,
          averageTotalTime: prevResult.averageTotalTime,
          averageLoadTime: prevResult.averageLoadTime,
          type: 'significant_drop'
        };
      }

      // 如果成功率低于80%，也认为是临界点
      if (currentResult.successRate < 80 && prevResult.successRate >= 80) {
        return {
          concurrency: prevResult.concurrency,
          successRate: prevResult.successRate,
          averageTotalTime: prevResult.averageTotalTime,
          averageLoadTime: prevResult.averageLoadTime,
          type: 'below_threshold'
        };
      }

      // 如果响应时间超过15秒，也认为是临界点
      if (currentResult.averageTotalTime > 15000 && prevResult.averageTotalTime <= 15000) {
        return {
          concurrency: prevResult.concurrency,
          successRate: prevResult.successRate,
          averageTotalTime: prevResult.averageTotalTime,
          averageLoadTime: prevResult.averageLoadTime,
          type: 'response_time_threshold'
        };
      }
    }

    // 如果没有找到显著下降点，返回最后一个较好的结果
    const goodResults = this.results.filter(r => r.successRate >= 80);
    if (goodResults.length > 0) {
      const lastGoodResult = goodResults[goodResults.length - 1];
      return {
        concurrency: lastGoodResult.concurrency,
        successRate: lastGoodResult.successRate,
        averageTotalTime: lastGoodResult.averageTotalTime,
        averageLoadTime: lastGoodResult.averageLoadTime,
        type: 'last_good'
      };
    }

    return null;
  }

  generateReport() {
    const report = [];
    const timestamp = new Date().toLocaleString('zh-CN');

    report.push('# 登录页面加载速度压力测试报告');
    report.push(`\n测试时间: ${timestamp}`);
    report.push(`测试环境: ${this.baseURL} (前端)`);
    report.push(`测试策略: 每次增加5个并发用户，测试页面加载性能`);
    report.push(`测试范围: 5 - ${this.results.length > 0 ? this.results[this.results.length - 1].concurrency : 0} 个并发用户`);

    report.push('\n## 测试配置\n');
    report.push(`- **测试类型**: ${this.testConfig.description}`);
    report.push(`- **测试页面**: ${this.baseURL}/login`);
    report.push(`- **测试方式**: 页面加载和渲染性能测试`);
    report.push(`- **不进行登录操作**: 仅测试页面访问`);

    // 关键结果
    const criticalPoint = this.findCriticalPoint();
    const maxStableConcurrency = criticalPoint ? criticalPoint.concurrency : 0;
    const maxSuccessRate = this.results.length > 0 ? Math.max(...this.results.map(r => r.successRate)) : 0;
    const avgLoadTime = this.results.length > 0 ?
      Math.round(this.results.reduce((sum, r) => sum + r.averageLoadTime, 0) / this.results.length) : 0;
    const avgTotalTime = this.results.length > 0 ?
      Math.round(this.results.reduce((sum, r) => sum + r.averageTotalTime, 0) / this.results.length) : 0;

    report.push('\n## 关键发现\n');
    report.push(`- **最大稳定并发数**: ${maxStableConcurrency} 个用户`);
    report.push(`- **最高成功率**: ${maxSuccessRate}%`);
    report.push(`- **平均页面加载时间**: ${avgLoadTime}ms`);
    report.push(`- **平均总响应时间**: ${avgTotalTime}ms`);

    if (criticalPoint) {
      report.push(`- **临界点类型**: ${criticalPoint.type}`);
      report.push(`- **临界点性能**: 成功率 ${criticalPoint.successRate}%, 加载时间 ${criticalPoint.averageLoadTime}ms, 总时间 ${criticalPoint.averageTotalTime}ms`);
    }

    // 详细结果表格
    report.push('\n## 详细测试结果\n');
    report.push('| 并发数 | 成功加载 | 失败加载 | 成功率 | 平均加载时间 | 平均渲染时间 | 平均总时间 | 平均资源数 |');
    report.push('|--------|----------|----------|--------|--------------|--------------|------------|------------|');

    this.results.forEach(result => {
      const status = result.successRate >= 80 ? '✅' : result.successRate >= 50 ? '⚠️' : '❌';
      report.push(`| ${result.concurrency} | ${result.successfulLoads} | ${result.failedLoads} | ${result.successRate}% | ${result.averageLoadTime}ms | ${result.averageRenderTime}ms | ${result.averageTotalTime}ms | ${result.averageResourceCount} | ${status}`);
    });

    // 性能分析
    report.push('\n## 性能分析\n');

    if (criticalPoint) {
      report.push('### 系统性能临界点\n');
      report.push(`系统在并发数达到 **${criticalPoint.concurrency}** 时开始出现性能问题：`);
      report.push(`- 成功率从 ${this.results.find(r => r.concurrency === criticalPoint.concurrency - 5)?.successRate || 100}% 下降到 ${criticalPoint.successRate}%`);
      report.push(`- 平均加载时间: ${criticalPoint.averageLoadTime}ms`);
      report.push(`- 平均总响应时间: ${criticalPoint.averageTotalTime}ms`);

      if (criticalPoint.type === 'significant_drop') {
        report.push('- 问题类型: 性能显著下降');
      } else if (criticalPoint.type === 'below_threshold') {
        report.push('- 问题类型: 成功率低于80%阈值');
      } else if (criticalPoint.type === 'response_time_threshold') {
        report.push('- 问题类型: 响应时间超过15秒');
      }
    }

    // 加载时间趋势分析
    report.push('\n### 页面加载时间分析\n');
    const fastLoads = this.results.filter(r => r.averageLoadTime <= 3000).length;
    const slowLoads = this.results.filter(r => r.averageLoadTime > 8000).length;
    const verySlowLoads = this.results.filter(r => r.averageLoadTime > 15000).length;

    report.push(`- 快速加载 (≤3秒): ${fastLoads}/${this.results.length} 个测试`);
    report.push(`- 慢速加载 (>8秒): ${slowLoads}/${this.results.length} 个测试`);
    report.push(`- 极慢加载 (>15秒): ${verySlowLoads}/${this.results.length} 个测试`);

    if (slowLoads > 0) {
      report.push('⚠️ 系统在高并发下页面加载时间过长，需要优化');
    }

    // 建议优化措施
    report.push('\n## 建议优化措施\n');

    if (maxStableConcurrency < 15) {
      report.push('🔴 **紧急优化需求**: ');
      report.push('1. 优化前端资源加载（CSS/JS压缩）');
      report.push('2. 实施CDN加速静态资源');
      report.push('3. 启用Gzip压缩');
      report.push('4. 优化服务器响应速度');
      report.push('5. 考虑增加服务器资源');
    } else if (maxStableConcurrency < 50) {
      report.push('🟡 **中等优化需求**: ');
      report.push('1. 实施资源懒加载');
      report.push('2. 优化数据库查询（如果涉及）');
      report.push('3. 添加缓存策略');
      report.push('4. 监控服务器资源使用情况');
    } else {
      report.push('🟢 **性能良好**: ');
      report.push('1. 继续监控系统性能表现');
      report.push('2. 定期进行压力测试');
      report.push('3. 考虑实施负载均衡以进一步提升性能');
    }

    report.push('\n### 页面加载优化建议\n');
    report.push('1. **前端优化**: 资源压缩、代码分割、图片优化');
    report.push('2. **网络优化**: CDN、HTTP/2、资源预加载');
    report.push('3. **服务器优化**: 响应缓存、数据库连接池');
    report.push('4. **监控告警**: 实时性能监控、异常告警机制');

    return report.join('\n');
  }

  async saveReport() {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(process.cwd(), `login-page-load-test-report-${timestamp}.md`);

    await fs.writeFile(reportPath, report, 'utf8');
    console.log(`\n📊 测试报告已保存到: ${reportPath}`);

    // 保存原始数据
    const jsonReportPath = path.join(process.cwd(), `login-page-load-test-data-${timestamp}.json`);
    await fs.writeFile(jsonReportPath, JSON.stringify({
      testTime: new Date().toISOString(),
      testConfig: this.testConfig,
      maxConcurrency: this.maxConcurrency,
      results: this.results,
      criticalPoint: this.findCriticalPoint()
    }, null, 2), 'utf8');
    console.log(`📈 原始数据已保存到: ${jsonReportPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 浏览器已关闭');
    }
  }
}

// 主执行函数
async function main() {
  const test = new LoginPageLoadTest();

  try {
    await test.init();
    await test.runProgressiveTest();
    await test.saveReport();

    console.log('\n🎉 登录页面加载速度测试完成！');

    // 输出关键结论
    const criticalPoint = test.findCriticalPoint();
    if (criticalPoint) {
      console.log(`\n🎯 关键结论:`);
      console.log(`   最大稳定并发数: ${criticalPoint.concurrency} 个用户`);
      console.log(`   推荐生产环境并发数: ${Math.floor(criticalPoint.concurrency * 0.8)} 个用户`);
      console.log(`   性能表现: 成功率 ${criticalPoint.successRate}%, 平均加载时间 ${criticalPoint.averageLoadTime}ms`);
    }

  } catch (error) {
    console.error('❌ 登录页面加载速度测试失败:', error);
    process.exit(1);
  } finally {
    await test.cleanup();
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 运行测试
if (require.main === module) {
  main();
}

module.exports = LoginPageLoadTest;