#!/usr/bin/env node

/**
 * 生产模式登录页面并发性能测试
 * 测试真实生产环境构建版本在高并发下的性能表现
 */

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');

class ProductionConcurrencyTest {
  constructor() {
    this.browser = null;
    this.productionURL = 'http://localhost:4173/login';
    this.testResults = [];
    this.maxConcurrency = 200; // 最大并发数
    this.stepSize = 10; // 每次增加的并发数
  }

  async init() {
    console.log('🚀 初始化生产模式并发性能测试...');

    // 检查生产环境服务
    try {
      const response = await fetch(this.productionURL);
      if (!response.ok) {
        throw new Error(`生产环境服务响应异常: ${response.status}`);
      }
      console.log('✅ 生产环境服务正常');
    } catch (error) {
      console.error('❌ 生产环境服务不可用:', error.message);
      process.exit(1);
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

  async testConcurrency(concurrency) {
    console.log(`\n🔄 测试并发数: ${concurrency} 个用户...`);

    const results = [];
    const startTime = performance.now();

    // 创建并发测试
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.testSingleUser(i + 1));
    }

    // 等待所有测试完成
    const concurrentResults = await Promise.all(promises);
    const endTime = performance.now();

    // 统计结果
    const successCount = concurrentResults.filter(r => r.success).length;
    const failureCount = concurrency - successCount;
    const totalTime = Math.round(endTime - startTime);
    const avgLoadTime = successCount > 0
      ? Math.round(concurrentResults.filter(r => r.success).reduce((sum, r) => sum + r.totalTime, 0) / successCount)
      : 0;

    const summary = {
      concurrency,
      successCount,
      failureCount,
      successRate: Math.round((successCount / concurrency) * 100),
      totalTime,
      avgLoadTime,
      results: concurrentResults
    };

    console.log(`  ✅ 成功: ${successCount}/${concurrency} (${summary.successRate}%)`);
    console.log(`  ⏱️  总耗时: ${totalTime}ms`);
    console.log(`  📊 平均加载时间: ${avgLoadTime}ms`);

    if (failureCount > 0) {
      const errors = concurrentResults.filter(r => !r.success).map(r => r.error).slice(0, 3);
      console.log(`  ❌ 主要错误: ${errors.join(', ')}`);
    }

    return summary;
  }

  async testSingleUser(testNum) {
    const context = await this.browser.newContext({
      userAgent: `ProductionTest-${testNum}`,
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    const startTime = performance.now();
    const result = {
      testNum,
      success: false,
      loadTime: 0,
      renderTime: 0,
      totalTime: 0,
      resourceCount: 0,
      pageSize: 0,
      error: null
    };

    try {
      // 监听网络请求
      const resources = [];
      page.on('response', response => {
        resources.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'] || 0
        });
      });

      // 访问生产环境登录页面
      const loadStartTime = performance.now();
      await page.goto(this.productionURL, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      const loadEndTime = performance.now();

      // 等待页面渲染完成
      const renderStartTime = performance.now();
      try {
        await Promise.race([
          page.waitForSelector('input[placeholder*="用户名"]', { timeout: 5000 }),
          page.waitForSelector('input[type="text"]', { timeout: 5000 }),
          page.waitForSelector('#username', { timeout: 5000 }),
          page.waitForTimeout(2000)
        ]);
      } catch (e) {
        await page.waitForTimeout(1000);
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
      const pageContent = await page.content();
      result.success = pageContent.length > 1000 &&
                       !pageContent.includes('404') &&
                       !pageContent.includes('Server Error') &&
                       pageContent.includes('login');

      if (!result.success) {
        result.error = '页面加载失败或内容异常';
      }

    } catch (error) {
      result.error = error.message || String(error);
      result.totalTime = Math.round(performance.now() - startTime);
    } finally {
      await context.close();
    }

    return result;
  }

  async runProgressiveTest() {
    console.log('🧪 开始生产模式渐进式并发测试...\n');

    let currentConcurrency = 10;
    let lastSuccessRate = 100;
    let performanceBottleneck = null;

    while (currentConcurrency <= this.maxConcurrency) {
      const result = await this.testConcurrency(currentConcurrency);
      this.testResults.push(result);

      // 判断是否达到性能瓶颈
      if (result.successRate < 95) {
        performanceBottleneck = currentConcurrency;
        console.log(`\n⚠️  检测到性能瓶颈: 并发 ${currentConcurrency} 时成功率降至 ${result.successRate}%`);
        break;
      }

      // 如果加载时间显著增加，也认为是瓶颈
      if (result.avgLoadTime > 5000) {
        performanceBottleneck = currentConcurrency;
        console.log(`\n⚠️  检测到性能瓶颈: 并发 ${currentConcurrency} 时平均加载时间超过5秒 (${result.avgLoadTime}ms)`);
        break;
      }

      currentConcurrency += this.stepSize;

      // 短暂休息，避免对服务器造成过大压力
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 如果没找到瓶颈，测试最大并发数
    if (!performanceBottleneck) {
      console.log(`\n🎉 生产模式性能表现优异！成功处理 ${this.testResults[this.testResults.length - 1].concurrency} 个并发用户`);
    }

    return {
      maxTestedConcurrency: this.testResults[this.testResults.length - 1]?.concurrency || 0,
      performanceBottleneck,
      results: this.testResults
    };
  }

  analyzeResults(testSummary) {
    console.log('\n📈 生产模式并发性能分析\n');

    if (this.testResults.length === 0) {
      console.log('❌ 没有测试数据可分析');
      return;
    }

    const lastResult = this.testResults[this.testResults.length - 1];
    const bestResult = this.testResults.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    );

    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│                           生产模式并发性能报告                                │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');
    console.log('│ 测试项目                │ 结果                                              │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');
    console.log(`│ 最大测试并发数          │ ${lastResult.concurrency.toString().padEnd(48)} │`);
    console.log(`│ 最大并发成功率          │ ${bestResult.successRate.toString().padEnd(48)} │`);
    console.log(`│ 性能瓶颈点              │ ${testSummary.performanceBottleneck ? testSummary.performanceBottleneck.toString() + ' 个并发用户' : '未检测到'.padEnd(48)} │`);
    console.log(`│ 最高平均加载时间        │ ${Math.max(...this.testResults.map(r => r.avgLoadTime)).toString() + 'ms'.padEnd(48)} │`);
    console.log(`│ 最低平均加载时间        │ ${Math.min(...this.testResults.map(r => r.avgLoadTime)).toString() + 'ms'.padEnd(48)} │`);
    console.log('└─────────────────────────────────────────────────────────────────────────────┘');

    // 性能评估
    console.log('\n🎯 性能评估:\n');

    if (!testSummary.performanceBottleneck) {
      console.log('🚀 **卓越性能**: 生产环境可以处理极高的并发负载');
      console.log('   - 建议可以安全地支持大量同时在线用户');
      console.log('   - 系统具有良好的扩展性');
    } else if (testSummary.performanceBottleneck >= 100) {
      console.log('✅ **优秀性能**: 生产环境可以处理高并发负载');
      console.log(`   - 建议最大并发用户数: ${testSummary.performanceBottleneck - 10}`);
      console.log('   - 适合中等规模的应用场景');
    } else if (testSummary.performanceBottleneck >= 50) {
      console.log('👍 **良好性能**: 生产环境可以处理中等并发负载');
      console.log(`   - 建议最大并发用户数: ${testSummary.performanceBottleneck - 10}`);
      console.log('   - 适合小到中等规模的应用场景');
    } else {
      console.log('📊 **需要优化**: 生产环境并发性能有待提升');
      console.log(`   - 建议最大并发用户数: ${testSummary.performanceBottleneck - 10}`);
      console.log('   - 建议考虑服务器配置优化');
    }

    // 详细数据
    console.log('\n📊 详细测试数据:\n');
    console.log('并发数 | 成功率 | 平均加载时间 | 总耗时');
    console.log('--------|--------|--------------|--------');

    this.testResults.forEach(result => {
      console.log(`${result.concurrency.toString().padStart(6)} | ${result.successRate.toString().padStart(6)}% | ${result.avgLoadTime.toString().padStart(10)}ms | ${result.totalTime.toString().padStart(6)}ms`);
    });

    return {
      maxConcurrency: lastResult.concurrency,
      maxSuccessRate: bestResult.successRate,
      bottleneck: testSummary.performanceBottleneck,
      avgLoadTime: Math.round(this.testResults.reduce((sum, r) => sum + r.avgLoadTime, 0) / this.testResults.length)
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n🧹 浏览器已关闭');
    }
  }
}

// 主执行函数
async function main() {
  const test = new ProductionConcurrencyTest();

  try {
    await test.init();
    const testSummary = await test.runProgressiveTest();
    const analysis = test.analyzeResults(testSummary);

    console.log('\n🎉 生产模式并发性能测试完成！');

    // 输出关键结论
    console.log(`\n🎯 关键结论:`);
    console.log(`   最大测试并发: ${analysis.maxConcurrency} 个用户`);
    console.log(`   最高成功率: ${analysis.maxSuccessRate}%`);
    console.log(`   性能瓶颈: ${analysis.bottleneck ? analysis.bottleneck + ' 个并发用户' : '未检测到瓶颈'}`);
    console.log(`   平均加载时间: ${analysis.avgLoadTime}ms`);

    if (!analysis.bottleneck) {
      console.log(`   ✅ 生产环境性能卓越，可支持大量并发用户！`);
    } else {
      console.log(`   👍 生产环境可安全支持 ${analysis.bottleneck - 10} 个并发用户`);
    }

  } catch (error) {
    console.error('❌ 生产模式并发测试失败:', error);
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

module.exports = ProductionConcurrencyTest;