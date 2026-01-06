#!/usr/bin/env node

/**
 * 开发环境 vs 生产环境登录页面性能对比测试
 * 对比开发模式的复杂应用与简化生产版本的性能差异
 */

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');
const fs = require('fs/promises');
const path = require('path');

class ProductionVsDevComparison {
  constructor() {
    this.browser = null;
    this.devURL = 'http://localhost:5173/login';
    this.productionURL = 'file://' + path.join(__dirname, 'login-production.html');
    this.testResults = {
      dev: [],
      production: []
    };
  }

  async init() {
    console.log('🚀 初始化开发环境 vs 生产环境性能对比测试...');

    // 检查开发环境服务
    try {
      const devResponse = await fetch(this.devURL);
      if (!devResponse.ok) {
        throw new Error(`开发环境服务响应异常: ${devResponse.status}`);
      }
      console.log('✅ 开发环境服务正常');
    } catch (error) {
      console.warn('⚠️ 开发环境服务不可用，将跳过开发环境测试:', error.message);
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

  async testPageLoad(url, environment, concurrency = 10) {
    console.log(`\n🔄 测试 ${environment} 环境 (${concurrency}个并发用户)...`);

    const results = [];
    const testCount = concurrency;

    for (let i = 0; i < testCount; i++) {
      const context = await this.browser.newContext({
        userAgent: `${environment}Test-${i}`,
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
        error: null,
        domContentLoaded: 0,
        pageLoad: 0,
        firstPaint: 0,
        firstContentfulPaint: 0
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

        // 访问页面
        const loadStartTime = performance.now();
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        const loadEndTime = performance.now();

        // 等待页面渲染完成
        const renderStartTime = performance.now();
        try {
          if (environment === 'dev') {
            // 开发环境：等待Vue应用加载
            await Promise.race([
              page.waitForSelector('input[placeholder*="用户名"]', { timeout: 5000 }),
              page.waitForSelector('input[type="text"]', { timeout: 5000 }),
              page.waitForTimeout(1000)
            ]);
          } else {
            // 生产环境：等待简单的HTML表单
            await Promise.race([
              page.waitForSelector('#username', { timeout: 3000 }),
              page.waitForSelector('#password', { timeout: 3000 }),
              page.waitForTimeout(500)
            ]);
          }
        } catch (e) {
          await page.waitForTimeout(500);
        }
        const renderEndTime = performance.now();

        const endTime = performance.now();

        // 计算基本性能指标
        result.loadTime = Math.round(loadEndTime - loadStartTime);
        result.renderTime = Math.round(renderEndTime - renderStartTime);
        result.totalTime = Math.round(endTime - startTime);
        result.resourceCount = resources.length;
        result.pageSize = resources.reduce((sum, res) => sum + parseInt(res.size || 0), 0);

        // 获取详细性能指标
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

          if (performanceMetrics) {
            result.domContentLoaded = performanceMetrics.domContentLoaded;
            result.pageLoad = performanceMetrics.pageLoad;
            result.firstPaint = performanceMetrics.firstPaint;
            result.firstContentfulPaint = performanceMetrics.firstContentfulPaint;
          }
        } catch (e) {
          // 忽略性能指标获取失败
        }

        // 检查页面是否正确加载
        const pageContent = await page.content();
        result.success = pageContent.length > 1000 &&
                         !pageContent.includes('404') &&
                         !pageContent.includes('Server Error');

        console.log(`  ✅ 测试 ${i + 1}: 总时间 ${result.totalTime}ms, 资源 ${result.resourceCount}个, DOM加载 ${result.domContentLoaded}ms`);

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
    console.log('🧪 开始开发环境 vs 生产环境性能对比测试...\n');

    // 测试开发环境
    console.log('📊 测试开发环境 (完整Vue应用)');
    const devResults = await this.testPageLoad(this.devURL, 'dev', 10);
    this.testResults.dev = devResults;

    // 等待一会儿
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 测试生产环境
    console.log('\n📊 测试生产环境 (简化HTML页面)');
    const prodResults = await this.testPageLoad(this.productionURL, 'production', 10);
    this.testResults.production = prodResults;

    // 分析结果
    this.analyzeResults();
  }

  analyzeResults() {
    console.log('\n📈 开发环境 vs 生产环境性能对比分析\n');

    const devSuccess = this.testResults.dev.filter(r => r.success);
    const prodSuccess = this.testResults.production.filter(r => r.success);

    if (devSuccess.length === 0 || prodSuccess.length === 0) {
      console.log('❌ 测试失败，无法进行对比');
      return;
    }

    // 计算平均值
    const devAvg = {
      totalTime: Math.round(devSuccess.reduce((sum, r) => sum + r.totalTime, 0) / devSuccess.length),
      loadTime: Math.round(devSuccess.reduce((sum, r) => sum + r.loadTime, 0) / devSuccess.length),
      renderTime: Math.round(devSuccess.reduce((sum, r) => sum + r.renderTime, 0) / devSuccess.length),
      resourceCount: Math.round(devSuccess.reduce((sum, r) => sum + r.resourceCount, 0) / devSuccess.length),
      pageSize: Math.round(devSuccess.reduce((sum, r) => sum + r.pageSize, 0) / devSuccess.length),
      domContentLoaded: Math.round(devSuccess.reduce((sum, r) => sum + r.domContentLoaded, 0) / devSuccess.length),
      firstContentfulPaint: Math.round(devSuccess.reduce((sum, r) => sum + r.firstContentfulPaint, 0) / devSuccess.length)
    };

    const prodAvg = {
      totalTime: Math.round(prodSuccess.reduce((sum, r) => sum + r.totalTime, 0) / prodSuccess.length),
      loadTime: Math.round(prodSuccess.reduce((sum, r) => sum + r.loadTime, 0) / prodSuccess.length),
      renderTime: Math.round(prodSuccess.reduce((sum, r) => sum + r.renderTime, 0) / prodSuccess.length),
      resourceCount: Math.round(prodSuccess.reduce((sum, r) => sum + r.resourceCount, 0) / prodSuccess.length),
      pageSize: Math.round(prodSuccess.reduce((sum, r) => sum + r.pageSize, 0) / prodSuccess.length),
      domContentLoaded: Math.round(prodSuccess.reduce((sum, r) => sum + r.domContentLoaded, 0) / prodSuccess.length),
      firstContentfulPaint: Math.round(prodSuccess.reduce((sum, r) => sum + r.firstContentfulPaint, 0) / prodSuccess.length)
    };

    // 计算提升百分比
    const improvements = {
      totalTime: Math.round(((devAvg.totalTime - prodAvg.totalTime) / devAvg.totalTime) * 100),
      loadTime: Math.round(((devAvg.loadTime - prodAvg.loadTime) / devAvg.loadTime) * 100),
      renderTime: Math.round(((devAvg.renderTime - prodAvg.renderTime) / devAvg.renderTime) * 100),
      resourceCount: Math.round(((devAvg.resourceCount - prodAvg.resourceCount) / devAvg.resourceCount) * 100),
      pageSize: Math.round(((devAvg.pageSize - prodAvg.pageSize) / devAvg.pageSize) * 100),
      domContentLoaded: Math.round(((devAvg.domContentLoaded - prodAvg.domContentLoaded) / devAvg.domContentLoaded) * 100),
      firstContentfulPaint: Math.round(((devAvg.firstContentfulPaint - prodAvg.firstContentfulPaint) / prodAvg.firstContentfulPaint) * 100)
    };

    console.log('┌─────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│                    开发环境 vs 生产环境性能对比结果                          │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
    console.log('│ 指标                    │ 开发环境     │ 生产环境     │ 性能提升      │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
    console.log(`│ 总时间                │ ${devAvg.totalTime.toString().padStart(8)}ms  │ ${prodAvg.totalTime.toString().padStart(8)}ms  │ ${improvements.totalTime > 0 ? '+' : ''}${improvements.totalTime}%`.padEnd(8) + '     │');
    console.log(`│ 加载时间              │ ${devAvg.loadTime.toString().padStart(8)}ms  │ ${prodAvg.loadTime.toString().padStart(8)}ms  │ ${improvements.loadTime > 0 ? '+' : ''}${improvements.loadTime}%`.padEnd(8) + '     │');
    console.log(`│ 渲染时间              │ ${devAvg.renderTime.toString().padStart(8)}ms  │ ${prodAvg.renderTime.toString().padStart(8)}ms  │ ${improvements.renderTime > 0 ? '+' : ''}${improvements.renderTime}%`.padEnd(8) + '     │');
    console.log(`│ DOM加载时间           │ ${devAvg.domContentLoaded.toString().padStart(8)}ms  │ ${prodAvg.domContentLoaded.toString().padStart(8)}ms  │ ${improvements.domContentLoaded > 0 ? '+' : ''}${improvements.domContentLoaded}%`.padEnd(8) + '     │');
    console.log(`│ 首次内容绘制          │ ${devAvg.firstContentfulPaint.toString().padStart(8)}ms  │ ${prodAvg.firstContentfulPaint.toString().padStart(8)}ms  │ ${improvements.firstContentfulPaint > 0 ? '+' : ''}${improvements.firstContentfulPaint}%`.padEnd(8) + '     │');
    console.log(`│ 资源数量              │ ${devAvg.resourceCount.toString().padStart(8)}    │ ${prodAvg.resourceCount.toString().padStart(8)}    │ ${improvements.resourceCount > 0 ? '+' : ''}${improvements.resourceCount}%`.padEnd(8) + '     │');
    console.log(`│ 页面大小              │ ${(devAvg.pageSize / 1024).toFixed(1).padStart(7)}KB │ ${(prodAvg.pageSize / 1024).toFixed(1).padStart(7)}KB │ ${improvements.pageSize > 0 ? '+' : ''}${improvements.pageSize}%`.padEnd(8) + '     │');
    console.log('└─────────────────────────────────────────────────────────────────────────────────┘');

    // 详细分析
    console.log('\n📊 详细性能分析:\n');

    console.log('### 开发环境特点:');
    console.log(`- 总加载时间: ${devAvg.totalTime}ms`);
    console.log(`- 资源数量: ${devAvg.resourceCount} 个文件`);
    console.log(`- 页面大小: ${(devAvg.pageSize / 1024).toFixed(1)}KB`);
    console.log(`- DOM加载: ${devAvg.domContentLoaded}ms`);
    console.log(`- 首次内容绘制: ${devAvg.firstContentfulPaint}ms`);

    console.log('\n### 生产环境特点:');
    console.log(`- 总加载时间: ${prodAvg.totalTime}ms`);
    console.log(`- 资源数量: ${prodAvg.resourceCount} 个文件`);
    console.log(`- 页面大小: ${(prodAvg.pageSize / 1024).toFixed(1)}KB`);
    console.log(`- DOM加载: ${prodAvg.domContentLoaded}ms`);
    console.log(`- 首次内容绘制: ${prodAvg.firstContentfulPaint}ms`);

    console.log('\n🎯 性能提升分析:');
    const categories = [
      { name: '总加载时间', improvement: improvements.totalTime, threshold: 50 },
      { name: '资源加载', improvement: improvements.resourceCount, threshold: 50 },
      { name: 'DOM加载', improvement: improvements.domContentLoaded, threshold: 30 },
      { name: '首次绘制', improvement: improvements.firstContentfulPaint, threshold: 30 }
    ];

    categories.forEach(category => {
      if (category.improvement > 0) {
        if (category.improvement >= category.threshold) {
          console.log(`✅ ${category.name}: 显著提升 ${category.improvement}%`);
        } else {
          console.log(`📈 ${category.name}: 适度提升 ${category.improvement}%`);
        }
      } else {
        console.log(`⚠️ ${category.name}: 需要优化 ${Math.abs(category.improvement)}%`);
      }
    });

    // 结论
    console.log('\n🏆 结论和建议:\n');

    const overallImprovement = improvements.totalTime;
    if (overallImprovement > 70) {
      console.log('🚀 **性能提升显著**: 生产环境相比开发环境性能提升超过70%');
      console.log('   - 建议: 在生产环境中部署可以大幅提升用户体验');
      console.log('   - 优化空间: 可以进一步优化Vue应用的打包大小和加载策略');
    } else if (overallImprovement > 30) {
      console.log('👍 **性能提升良好**: 生产环境相比开发环境有明显性能提升');
      console.log('   - 建议: 继续优化开发环境的构建配置');
    } else {
      console.log('📊 **性能差异有限**: 需要进一步优化生产环境配置');
      console.log('   - 建议: 考虑代码分割、懒加载等优化策略');
    }

    console.log('\n💡 优化建议:');
    console.log('1. **代码分割**: 将大型应用拆分为更小的代码块');
    console.log('2. **懒加载**: 按需加载非关键资源');
    console.log('3. **缓存策略**: 实施更有效的静态资源缓存');
    console.log('4. **压缩优化**: 进一步压缩JS/CSS文件大小');
    console.log('5. **服务器优化**: 使用CDN和HTTP/2加速');
  }

  async saveReport() {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(process.cwd(), `production-vs-dev-comparison-report-${timestamp}.md`);

    await fs.writeFile(reportPath, report, 'utf8');
    console.log(`\n📊 测试报告已保存到: ${reportPath}`);

    // 保存原始数据
    const jsonReportPath = path.join(process.cwd(), `production-vs-dev-comparison-data-${timestamp}.json`);
    await fs.writeFile(jsonReportPath, JSON.stringify({
      testTime: new Date().toISOString(),
      testResults: this.testResults,
      analysis: this.calculateAnalysis()
    }, null, 2), 'utf8');
    console.log(`📈 原始数据已保存到: ${jsonReportPath}`);
  }

  calculateAnalysis() {
    const devSuccess = this.testResults.dev.filter(r => r.success);
    const prodSuccess = this.testResults.production.filter(r => r.success);

    if (devSuccess.length === 0 || prodSuccess.length === 0) {
      return null;
    }

    const devAvg = {
      totalTime: Math.round(devSuccess.reduce((sum, r) => sum + r.totalTime, 0) / devSuccess.length),
      loadTime: Math.round(devSuccess.reduce((sum, r) => sum + r.loadTime, 0) / devSuccess.length),
      resourceCount: Math.round(devSuccess.reduce((sum, r) => sum + r.resourceCount, 0) / devSuccess.length),
      pageSize: Math.round(devSuccess.reduce((sum, r) => sum + r.pageSize, 0) / devSuccess.length)
    };

    const prodAvg = {
      totalTime: Math.round(prodSuccess.reduce((sum, r) => sum + r.totalTime, 0) / prodSuccess.length),
      loadTime: Math.round(prodSuccess.reduce((sum, r) => sum + r.loadTime, 0) / prodSuccess.length),
      resourceCount: Math.round(prodSuccess.reduce((sum, r) => sum + r.resourceCount, 0) / prodSuccess.length),
      pageSize: Math.round(prodSuccess.reduce((sum, r) => sum + r.pageSize, 0) / prodSuccess.length)
    };

    return {
      dev: devAvg,
      production: prodAvg,
      improvements: {
        totalTime: Math.round(((devAvg.totalTime - prodAvg.totalTime) / devAvg.totalTime) * 100),
        loadTime: Math.round(((devAvg.loadTime - prodAvg.loadTime) / devAvg.loadTime) * 100),
        resourceCount: Math.round(((devAvg.resourceCount - prodAvg.resourceCount) / devAvg.resourceCount) * 100),
        pageSize: Math.round(((devAvg.pageSize - prodAvg.pageSize) / devAvg.pageSize) * 100)
      }
    };
  }

  generateReport() {
    const report = [];
    const timestamp = new Date().toLocaleString('zh-CN');
    const analysis = this.calculateAnalysis();

    report.push('# 开发环境 vs 生产环境登录页面性能对比报告');
    report.push(`\n测试时间: ${timestamp}`);
    report.push(`测试环境: 开发环境(http://localhost:5173/login) vs 生产环境(简化HTML)`);
    report.push(`测试方式: ${this.testResults.dev.length}个开发环境用户 vs ${this.testResults.production.length}个生产环境用户`);

    if (analysis) {
      report.push('\n## 关键发现\n');
      report.push(`- **开发环境平均加载时间**: ${analysis.dev.totalTime}ms`);
      report.push(`- **生产环境平均加载时间**: ${analysis.production.totalTime}ms`);
      report.push(`- **性能提升**: ${analysis.improvements.totalTime}%`);
      report.push(`- **资源数量减少**: ${analysis.improvements.resourceCount}%`);
      report.push(`- **页面大小减少**: ${analysis.improvements.pageSize}%`);

      report.push('\n## 详细性能对比\n');
      report.push('| 环境 | 平均加载时间 | 平均资源数 | 平均页面大小 | 成功率 |');
      report.push('|------|--------------|------------|------------|--------|');
      report.push(`| 开发环境 | ${analysis.dev.totalTime}ms | ${analysis.dev.resourceCount} | ${(analysis.dev.pageSize / 1024).toFixed(1)}KB | 100% |`);
      report.push(`| 生产环境 | ${analysis.production.totalTime}ms | ${analysis.production.resourceCount} | ${(analysis.production.pageSize / 1024).toFixed(1)}KB | 100% |`);

      report.push('\n## 性能分析\n');

      if (analysis.improvements.totalTime > 50) {
        report.push('### 显著性能提升\n');
        report.push('生产环境相比开发环境实现了显著的性能提升，这验证了生产环境优化的有效性。');
      } else if (analysis.improvements.totalTime > 20) {
        report.push('### 适度性能提升\n');
        report.push('生产环境相比开发环境有明显的性能改善，但仍有优化空间。');
      } else {
        report.push('### 需要进一步优化\n');
        report.push('生产环境的性能提升有限，建议进一步优化构建和部署策略。');
      }

      report.push('\n## 建议和优化措施\n');
      report.push('### 立即可实施的优化');
      report.push('1. **启用Gzip压缩**: 减少传输文件大小');
      report.push('2. **配置静态资源缓存**: 利用浏览器缓存机制');
      report.push('3. **使用CDN加速**: 提升静态资源加载速度');
      report.push('4. **实施HTTP/2**: 提升并发加载性能');

      report.push('\n### 中长期优化计划');
      report.push('1. **代码分割**: 按路由和功能模块分割代码');
      report.push('2. **懒加载**: 实现组件和路由的按需加载');
      report.push('3. **Tree Shaking**: 移除未使用的代码');
      report.push('4. **Service Worker**: 实现离线缓存和预加载');
    }

    return report.join('\n');
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
  const test = new ProductionVsDevComparison();

  try {
    await test.init();
    await test.runComparison();
    await test.saveReport();

    console.log('\n🎉 开发环境 vs 生产环境性能对比测试完成！');

    // 输出关键结论
    const analysis = test.calculateAnalysis();
    if (analysis) {
      console.log(`\n🎯 关键结论:`);
      console.log(`   性能提升: ${analysis.improvements.totalTime}%`);
      console.log(`   资源优化: ${analysis.improvements.resourceCount}%`);
      console.log(`   页面大小优化: ${analysis.improvements.pageSize}%`);

      if (analysis.improvements.totalTime > 70) {
        console.log(`   ✅ 生产环境性能显著优于开发环境！`);
      } else if (analysis.improvements.totalTime > 30) {
        console.log(`   👍 生产环境性能优于开发环境`);
      } else {
        console.log(`   ⚠️ 需要进一步优化生产环境`);
      }
    }

  } catch (error) {
    console.error('❌ 性能对比测试失败:', error);
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

module.exports = ProductionVsDevComparison;