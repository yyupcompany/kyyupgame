#!/usr/bin/env node

/**
 * 登录页面性能对比测试
 * 对比优化前后的登录页面加载速度
 */

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');

class LoginPerformanceComparison {
  constructor() {
    this.browser = null;
    this.baseURL = 'http://localhost:5173';
    this.testResults = {
      original: [],
      optimized: []
    };
  }

  async init() {
    console.log('🚀 初始化登录页面性能对比测试...');

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

  async testLoginPage(url, testName) {
    console.log(`\n🔄 测试 ${testName} 登录页面...`);

    const results = [];
    const testCount = 5; // 测试5次取平均值

    for (let i = 0; i < testCount; i++) {
      const context = await this.browser.newContext({
        userAgent: `PerformanceTest-${testName}-${i}`,
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      const startTime = performance.now();
      const result = {
        testNum: i + 1,
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

        // 访问登录页面
        const loadStartTime = performance.now();
        await page.goto(url, {
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
                         !pageContent.includes('Server Error');

        // 获取性能指标
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
          // 忽略性能指标获取失败
        }

        console.log(`  ✅ 测试 ${i + 1}: 总时间 ${result.totalTime}ms, 加载 ${result.loadTime}ms, 资源 ${result.resourceCount}个`);

      } catch (error) {
        result.error = error.message || String(error);
        result.totalTime = Math.round(performance.now() - startTime);
        console.log(`  ❌ 测试 ${i + 1}: 失败 - ${result.error}`);
      } finally {
        await context.close();
      }

      results.push(result);
    }

    return results;
  }

  async runComparison() {
    console.log('🧪 开始性能对比测试...\n');

    // 测试原始登录页面
    console.log('📊 测试原始登录页面 (包含完整应用初始化)');
    const originalResults = await this.testLoginPage(`${this.baseURL}/login`, '原始版本');
    this.testResults.original = originalResults;

    // 等待一会儿
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 测试优化后的登录页面
    console.log('\n📊 测试优化后的登录页面 (最小化初始化)');
    const optimizedResults = await this.testLoginPage(`${this.baseURL}/login-only.html`, '优化版本');
    this.testResults.optimized = optimizedResults;

    // 分析结果
    this.analyzeResults();
  }

  analyzeResults() {
    console.log('\n📈 性能对比分析\n');

    const originalSuccess = this.testResults.original.filter(r => r.success);
    const optimizedSuccess = this.testResults.optimized.filter(r => r.success);

    if (originalSuccess.length === 0 || optimizedSuccess.length === 0) {
      console.log('❌ 测试失败，无法进行对比');
      return;
    }

    // 计算平均值
    const originalAvg = {
      totalTime: Math.round(originalSuccess.reduce((sum, r) => sum + r.totalTime, 0) / originalSuccess.length),
      loadTime: Math.round(originalSuccess.reduce((sum, r) => sum + r.loadTime, 0) / originalSuccess.length),
      renderTime: Math.round(originalSuccess.reduce((sum, r) => sum + r.renderTime, 0) / originalSuccess.length),
      resourceCount: Math.round(originalSuccess.reduce((sum, r) => sum + r.resourceCount, 0) / originalSuccess.length),
      pageSize: Math.round(originalSuccess.reduce((sum, r) => sum + r.pageSize, 0) / originalSuccess.length)
    };

    const optimizedAvg = {
      totalTime: Math.round(optimizedSuccess.reduce((sum, r) => sum + r.totalTime, 0) / optimizedSuccess.length),
      loadTime: Math.round(optimizedSuccess.reduce((sum, r) => sum + r.loadTime, 0) / optimizedSuccess.length),
      renderTime: Math.round(optimizedSuccess.reduce((sum, r) => sum + r.renderTime, 0) / optimizedSuccess.length),
      resourceCount: Math.round(optimizedSuccess.reduce((sum, r) => sum + r.resourceCount, 0) / optimizedSuccess.length),
      pageSize: Math.round(optimizedSuccess.reduce((sum, r) => sum + r.pageSize, 0) / optimizedSuccess.length)
    };

    // 计算提升百分比
    const improvements = {
      totalTime: Math.round(((originalAvg.totalTime - optimizedAvg.totalTime) / originalAvg.totalTime) * 100),
      loadTime: Math.round(((originalAvg.loadTime - optimizedAvg.loadTime) / originalAvg.loadTime) * 100),
      renderTime: Math.round(((originalAvg.renderTime - optimizedAvg.renderTime) / originalAvg.renderTime) * 100),
      resourceCount: Math.round(((originalAvg.resourceCount - optimizedAvg.resourceCount) / originalAvg.resourceCount) * 100),
      pageSize: Math.round(((originalAvg.pageSize - optimizedAvg.pageSize) / originalAvg.pageSize) * 100)
    };

    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                    性能对比结果                              │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 指标         │ 原始版本    │ 优化版本    │ 提升幅度      │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log(`│ 总时间       │ ${originalAvg.totalTime.toString().padStart(6)}ms  │ ${optimizedAvg.totalTime.toString().padStart(6)}ms  │ ${improvements.totalTime > 0 ? '+' : ''}${improvements.totalTime}%`.padEnd(11) + '     │');
    console.log(`│ 加载时间     │ ${originalAvg.loadTime.toString().padStart(6)}ms  │ ${optimizedAvg.loadTime.toString().padStart(6)}ms  │ ${improvements.loadTime > 0 ? '+' : ''}${improvements.loadTime}%`.padEnd(11) + '     │');
    console.log(`│ 渲染时间     │ ${originalAvg.renderTime.toString().padStart(6)}ms  │ ${optimizedAvg.renderTime.toString().padStart(6)}ms  │ ${improvements.renderTime > 0 ? '+' : ''}${improvements.renderTime}%`.padEnd(11) + '     │');
    console.log(`│ 资源数量     │ ${originalAvg.resourceCount.toString().padStart(6)}    │ ${optimizedAvg.resourceCount.toString().padStart(6)}    │ ${improvements.resourceCount > 0 ? '+' : ''}${improvements.resourceCount}%`.padEnd(11) + '     │');
    console.log(`│ 页面大小     │ ${(originalAvg.pageSize / 1024).toFixed(1).padStart(6)}KB │ ${(optimizedAvg.pageSize / 1024).toFixed(1).padStart(6)}KB │ ${improvements.pageSize > 0 ? '+' : ''}${improvements.pageSize}%`.padEnd(11) + '     │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    // 总结
    console.log('\n🎯 优化效果总结:');
    if (improvements.totalTime > 0) {
      console.log(`✅ 总加载时间提升 ${improvements.totalTime}%`);
    }
    if (improvements.resourceCount > 0) {
      console.log(`✅ 资源请求数量减少 ${improvements.resourceCount}%`);
    }
    if (improvements.pageSize > 0) {
      console.log(`✅ 页面大小减少 ${improvements.pageSize}%`);
    }

    const overallImprovement = improvements.totalTime;
    if (overallImprovement > 50) {
      console.log('🚀 优化效果显著！建议采用优化方案');
    } else if (overallImprovement > 20) {
      console.log('👍 优化效果良好，可以考虑部署');
    } else {
      console.log('📊 优化效果有限，需要进一步分析');
    }
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
  const test = new LoginPerformanceComparison();

  try {
    await test.init();
    await test.runComparison();
  } catch (error) {
    console.error('❌ 性能对比测试失败:', error);
    process.exit(1);
  } finally {
    await test.cleanup();
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = LoginPerformanceComparison;