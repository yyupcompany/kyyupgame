/**
 * 🚀 幼儿园管理系统 - 页面性能分析测试
 *
 * 专门用于性能调优，分析每个页面的加载时间
 * 提供详细的性能指标和优化建议
 */

const { chromium } = require('playwright');

// 测试页面配置（选择核心页面进行性能测试）
const PERFORMANCE_TEST_PAGES = [
  // 登录页面
  '/login',

  // 仪表板页面
  '/dashboard',
  '/dashboard/campus-overview',
  '/dashboard/data-statistics',

  // AI相关页面
  '/aiassistant',
  '/ai',
  '/ai/chat',

  // 核心中心页面
  '/centers/analytics',
  '/centers/finance',
  '/centers/system',
  '/centers/ai-center',

  // 教师中心
  '/teacher-center/dashboard',
  '/teacher-center/teaching',

  // 家长中心
  '/parent-center/dashboard',
  '/parent-center/children',

  // 业务页面
  '/activity',
  '/enrollment',
  '/customer'
];

/**
 * 页面性能测试
 */
async function testPagePerformance() {
  console.log('🚀 开始页面性能分析测试...');
  console.log(`📊 测试页面数: ${PERFORMANCE_TEST_PAGES.length}`);

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 收集所有页面性能数据
  const performanceData = [];
  const errors = [];

  // 监听控制台错误
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({
        text: msg.text(),
        url: msg.location()?.url,
        timestamp: new Date().toISOString()
      });
    }
  });

  for (let i = 0; i < PERFORMANCE_TEST_PAGES.length; i++) {
    const pageUrl = PERFORMANCE_TEST_PAGES[i];
    const fullUrl = `http://localhost:5173${pageUrl}`;

    console.log(`\n🔍 性能测试 ${i + 1}/${PERFORMANCE_TEST_PAGES.length}: ${pageUrl}`);

    try {
      // 多次测试取平均值
      const testRuns = 3;
      const runResults = [];

      for (let run = 0; run < testRuns; run++) {
        console.log(`   📊 第 ${run + 1} 次测试...`);

        const runStartTime = Date.now();

        // 清除缓存并导航
        await page.context().clearCookies();
        await page.goto(fullUrl, {
          waitUntil: 'networkidle',
          timeout: 20000
        });

        // 等待页面完全加载
        await page.waitForTimeout(3000);

        // 获取性能指标
        const metrics = await page.evaluate(() => {
          const navigation = window.performance.getEntriesByType('navigation')[0];
          const resources = window.performance.getEntriesByType('resource');

          if (navigation) {
            return {
              dnsLookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
              tcpConnect: Math.round(navigation.connectEnd - navigation.connectStart),
              sslConnect: navigation.secureConnectionStart ? Math.round(navigation.connectEnd - navigation.secureConnectionStart) : 0,
              serverResponse: Math.round(navigation.responseEnd - navigation.requestStart),
              domParse: Math.round(navigation.domContentLoadedEventStart - navigation.responseEnd),
              domInteractive: Math.round(navigation.domInteractive - navigation.domContentLoadedEventStart),
              loadComplete: Math.round(navigation.loadEventEnd - navigation.domInteractive),
              totalTime: Math.round(navigation.loadEventEnd - navigation.startTime),
              resourceCount: resources.length,
              resourceSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
              // 计算关键渲染路径
              renderBlockingResources: resources.filter(r => r.renderBlocking).length,
              compressibleResources: resources.filter(r => r.transferSize > 1024).length,
              imageResources: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length,
              cssResources: resources.filter(r => r.name.match(/\.css$/i)).length,
              jsResources: resources.filter(r => r.name.match(/\.js$/i)).length
            };
          }
          return null;
        });

        const totalRunTime = Date.now() - runStartTime;
        runResults.push({
          ...metrics,
          totalTime: totalRunTime,
          run: run + 1
        });
      }

      // 计算平均值
      const avgMetrics = {
        url: pageUrl,
        runs: testRuns,
        totalTests: testRuns,
        dnsLookup: Math.round(runResults.reduce((sum, r) => sum + (r.dnsLookup || 0), 0) / testRuns),
        tcpConnect: Math.round(runResults.reduce((sum, r) => sum + (r.tcpConnect || 0), 0) / testRuns),
        sslConnect: Math.round(runResults.reduce((sum, r) => sum + (r.sslConnect || 0), 0) / testRuns),
        serverResponse: Math.round(runResults.reduce((sum, r) => sum + (r.serverResponse || 0), 0) / testRuns),
        domParse: Math.round(runResults.reduce((sum, r) => sum + (r.domParse || 0), 0) / testRuns),
        domInteractive: Math.round(runResults.reduce((sum, r) => sum + (r.domInteractive || 0), 0) / testRuns),
        loadComplete: Math.round(runResults.reduce((sum, r) => sum + (r.loadComplete || 0), 0) / testRuns),
        totalTime: Math.round(runResults.reduce((sum, r) => sum + (r.totalTime || 0), 0) / testRuns),
        avgResourceCount: Math.round(runResults.reduce((sum, r) => sum + (r.resourceCount || 0), 0) / testRuns),
        avgResourceSize: Math.round(runResults.reduce((sum, r) => sum + (r.resourceSize || 0), 0) / testRuns),
        minTotalTime: Math.min(...runResults.map(r => r.totalTime || 0)),
        maxTotalTime: Math.max(...runResults.map(r => r.totalTime || 0)),
        stdDevTotalTime: calculateStdDev(runResults.map(r => r.totalTime || 0))
      };

      performanceData.push(avgMetrics);

      // 输出性能结果
      console.log(`   ✅ 平均耗时: ${avgMetrics.totalTime}ms (最快: ${avgMetrics.minTotalTime}ms, 最慢: ${avgMetrics.maxTotalTime}ms)`);
      console.log(`   📊 DNS: ${avgMetrics.dnsLookup}ms | TCP: ${avgMetrics.tcpConnect}ms | 服务器: ${avgMetrics.serverResponse}ms`);
      console.log(`   📦 DOM解析: ${avgMetrics.domParse}ms | DOM交互: ${avgMetrics.domInteractive}ms | 加载完成: ${avgMetrics.loadComplete}ms`);
      console.log(`   🔗 资源数量: ${avgMetrics.avgResourceCount} | 资源大小: ${Math.round(avgMetrics.avgResourceSize / 1024)}KB`);

      // 性能评级
      const grade = getPerformanceGrade(avgMetrics.totalTime);
      console.log(`   🏆 性能评级: ${grade.grade} (${grade.description})`);

      // 优化建议
      const suggestions = getOptimizationSuggestions(avgMetrics);
      if (suggestions.length > 0) {
        console.log(`   💡 优化建议: ${suggestions.join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ 测试失败: ${error.message}`);
      errors.push({
        url: pageUrl,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  await browser.close();

  return {
    performanceData,
    errors,
    summary: generatePerformanceSummary(performanceData)
  };
}

/**
 * 计算标准差
 */
function calculateStdDev(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  return Math.round(Math.sqrt(avgSquaredDiff));
}

/**
 * 性能评级
 */
function getPerformanceGrade(totalTime) {
  if (totalTime < 500) {
    return { grade: 'A+', description: '优秀 (< 0.5秒)' };
  } else if (totalTime < 1000) {
    return { grade: 'A', description: '良好 (< 1秒)' };
  } else if (totalTime < 2000) {
    return { grade: 'B', description: '一般 (1-2秒)' };
  } else if (totalTime < 3000) {
    return { grade: 'C', description: '较慢 (2-3秒)' };
  } else {
    return { grade: 'D', description: '需要优化 (> 3秒)' };
  }
}

/**
 * 获取优化建议
 */
function getOptimizationSuggestions(metrics) {
  const suggestions = [];

  if (metrics.totalTime > 3000) {
    suggestions.push('总体加载时间过长，建议优化');
  }

  if (metrics.serverResponse > 1000) {
    suggestions.push('服务器响应时间过长');
  }

  if (metrics.avgResourceCount > 100) {
    suggestions.push('资源数量过多，建议合并资源');
  }

  if (metrics.avgResourceSize > 1024 * 1024) { // 1MB
    suggestions.push('资源文件过大，建议压缩');
  }

  if (metrics.renderBlockingResources > 20) {
    suggestions.push('渲染阻塞资源过多');
  }

  if (metrics.imageResources > 50) {
    suggestions.push('图片资源过多，建议使用懒加载');
  }

  if (metrics.jsResources > 20) {
    suggestions.push('JavaScript文件过多，建议代码分割');
  }

  return suggestions;
}

/**
 * 生成性能汇总报告
 */
function generatePerformanceSummary(performanceData) {
  if (performanceData.length === 0) {
    return {
      totalPages: 0,
      avgTotalTime: 0,
      fastestPage: null,
      slowestPage: null,
      gradeDistribution: {}
    };
  }

  const totalTimes = performanceData.map(p => p.totalTime);
  const avgTotalTime = Math.round(totalTimes.reduce((sum, time) => sum + time, 0) / totalTimes.length);

  const sortedByTime = performanceData.sort((a, b) => a.totalTime - b.totalTime);
  const fastestPage = sortedByTime[0];
  const slowestPage = sortedByTime[sortedByTime.length - 1];

  // 性能等级分布
  const gradeDistribution = {};
  performanceData.forEach(page => {
    const grade = getPerformanceGrade(page.totalTime).grade;
    gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
  });

  return {
    totalPages: performanceData.length,
    avgTotalTime,
    fastestPage,
    slowestPage,
    gradeDistribution
  };
}

/**
 * 生成性能优化报告
 */
function generateOptimizationReport(summary) {
  console.log('\n📊 === 性能优化分析报告 ===');

  console.log(`\n🎯 总体统计:`);
  console.log(`  📄 测试页面数: ${summary.totalPages}`);
  console.log(`  ⏱️ 平均加载时间: ${summary.avgTotalTime}ms`);
  console.log(`  🚀 最快页面: ${summary.fastestPage?.url} (${summary.fastestPage?.totalTime}ms)`);
  console.log(`  🐌 最慢页面: ${summary.slowestPage?.url} (${summary.slowestPage?.totalTime}ms)`);

  console.log(`\n🏆 性能等级分布:`);
  const gradeOrder = ['A+', 'A', 'B', 'C', 'D'];
  gradeOrder.forEach(grade => {
    const count = summary.gradeDistribution[grade] || 0;
    if (count > 0) {
      const percentage = ((count / summary.totalPages) * 100).toFixed(1);
      console.log(`  ${grade}: ${count} 页面 (${percentage}%)`);
    }
  });

  // 性能调优建议
  console.log(`\n💡 性能调优建议:`);
  if (summary.avgTotalTime > 2000) {
    console.log(`  ⚠️ 平均加载时间 > 2秒，建议重点关注性能优化`);
  }

  if (summary.slowestPage && summary.slowestPage.totalTime > 5000) {
    console.log(`  🔥 最慢页面 (${summary.slowestPage.url}) 耗时 ${summary.slowestPage.totalTime}ms，需要立即优化`);
  }

  console.log(`\n🔧 通用优化建议:`);
  console.log(`  1. 启用Gzip压缩减少传输大小`);
  console.log(`  2. 使用CDN加速静态资源`);
  console.log(`  3. 实现图片懒加载和WebP格式`);
  console.log(`  4. 优化JavaScript代码分割`);
  console.log(`  5. 减少HTTP请求数量`);
  console.log(`  6. 优化首屏渲染性能`);
}

/**
 * 主测试函数
 */
async function runPerformanceTest() {
  console.log('🎯 开始幼儿园管理系统页面性能分析...');
  console.log('='.repeat(60));

  const startTime = Date.now();

  const result = await testPagePerformance();

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);

  console.log(`\n⏱️ 测试总耗时: ${duration} 秒`);

  // 生成优化报告
  generateOptimizationReport(result.summary);

  return result;
}

// 运行测试
if (require.main === module) {
  runPerformanceTest()
    .then((result) => {
      // 保存性能数据到文件
      const fs = require('fs');
      const reportData = {
        timestamp: new Date().toISOString(),
        testDuration: duration,
        summary: result.summary,
        details: result.performanceData,
        errors: result.errors
      };

      fs.writeFileSync(
        '/home/zhgue/kyyupgame/k.yyupgame/client/tests/performance-report.json',
        JSON.stringify(reportData, null, 2)
      );

      console.log('\n📄 性能数据已保存到: client/tests/performance-report.json');
      console.log('✅ 页面性能分析完成！');

      // 根据平均性能决定退出码
      const avgTime = result.summary.avgTotalTime;
      process.exit(avgTime > 3000 ? 1 : 0); // 如果平均时间超过3秒，返回错误码
    })
    .catch((error) => {
      console.error('❌ 性能测试失败:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceTest, PERFORMANCE_TEST_PAGES };