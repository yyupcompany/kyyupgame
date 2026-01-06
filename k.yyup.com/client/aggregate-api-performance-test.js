const puppeteer = require('puppeteer');

/**
 * 集合API性能对比测试
 * 对比原始多个API调用 vs 新的集合API调用的性能差异
 */

const BASE_URL = 'http://localhost:5173';
const API_BASE_URL = 'http://localhost:3000';

// 测试配置
const TEST_CONFIG = {
  // 中心页面列表
  centerPages: [
    { path: '/centers/system', name: '系统中心' },
    { path: '/centers/activity', name: '活动中心' },
    { path: '/centers/analytics', name: '分析中心' }
  ],
  // 测试次数
  testRounds: 3,
  // 页面加载超时时间
  pageTimeout: 30000,
  // API超时时间
  apiTimeout: 10000,
  // 是否启用无头模式
  headless: true
};

// 集合API端点
const AGGREGATE_APIS = {
  system: '/api/centers/system/overview',
  activity: '/api/centers/activity/overview',
  analytics: '/api/centers/analytics/overview'
};

/**
 * 测试单个API响应时间
 */
async function testApiResponse(apiUrl, description) {
  console.log(`\n🔍 测试API: ${description}`);
  console.log(`URL: ${apiUrl}`);

  const startTime = Date.now();

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // 如果需要认证
      }
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ API响应成功 - ${responseTime}ms`);
    console.log(`📊 数据大小: ${JSON.stringify(data).length} 字符`);

    return {
      success: true,
      responseTime,
      dataSize: JSON.stringify(data).length,
      data
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`❌ API响应失败 - ${responseTime}ms`);
    console.log(`🚨 错误: ${error.message}`);

    return {
      success: false,
      responseTime,
      error: error.message,
      dataSize: 0
    };
  }
}

/**
 * 测试页面加载时间
 */
async function testPageLoad(browser, pageUrl, description) {
  console.log(`\n🖥️  测试页面: ${description}`);
  console.log(`URL: ${pageUrl}`);

  const page = await browser.newPage();

  try {
    // 设置超时时间
    page.setDefaultTimeout(TEST_CONFIG.pageTimeout);
    page.setDefaultNavigationTimeout(TEST_CONFIG.pageTimeout);

    // 监控网络请求
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const request = apiRequests.find(req => req.url === response.url());
        if (request) {
          request.responseTime = Date.now() - request.timestamp;
          request.status = response.status();
          request.success = response.ok();
        }
      }
    });

    const startTime = Date.now();

    // 导航到页面
    await page.goto(pageUrl, {
      waitUntil: 'networkidle2',
      timeout: TEST_CONFIG.pageTimeout
    });

    // 等待页面主要内容加载
    await page.waitForSelector('.center-container, .main-content, .el-container', { timeout: 10000 });

    const endTime = Date.now();
    const pageLoadTime = endTime - startTime;

    // 获取页面性能指标
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });

    // 统计API请求
    const successfulApis = apiRequests.filter(req => req.success);
    const failedApis = apiRequests.filter(req => !req.success);
    const totalApiTime = successfulApis.reduce((sum, req) => sum + req.responseTime, 0);

    console.log(`✅ 页面加载成功 - ${pageLoadTime}ms`);
    console.log(`📊 API请求统计:`);
    console.log(`   - 总请求数: ${apiRequests.length}`);
    console.log(`   - 成功请求: ${successfulApis.length}`);
    console.log(`   - 失败请求: ${failedApis.length}`);
    console.log(`   - API总耗时: ${totalApiTime}ms`);
    console.log(`   - 平均API响应时间: ${successfulApis.length > 0 ? Math.round(totalApiTime / successfulApis.length) : 0}ms`);

    return {
      success: true,
      pageLoadTime,
      apiRequests: apiRequests.length,
      successfulApis: successfulApis.length,
      failedApis: failedApis.length,
      totalApiTime,
      averageApiTime: successfulApis.length > 0 ? Math.round(totalApiTime / successfulApis.length) : 0,
      performanceMetrics
    };
  } catch (error) {
    const endTime = Date.now();
    const pageLoadTime = endTime - startTime;

    console.log(`❌ 页面加载失败 - ${pageLoadTime}ms`);
    console.log(`🚨 错误: ${error.message}`);

    return {
      success: false,
      pageLoadTime,
      error: error.message,
      apiRequests: 0,
      successfulApis: 0,
      failedApis: 0,
      totalApiTime: 0,
      averageApiTime: 0
    };
  } finally {
    await page.close();
  }
}

/**
 * 运行完整的性能对比测试
 */
async function runPerformanceComparison() {
  console.log('🚀 集合API性能对比测试开始');
  console.log('='.repeat(60));

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: TEST_CONFIG.headless,
    devtools: !TEST_CONFIG.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 第一阶段：测试原始API性能（多个独立API调用）
    console.log('\n📊 第一阶段：测试原始API性能');
    console.log('-'.repeat(40));

    const originalApiResults = {};

    for (const [center, apiUrl] of Object.entries(AGGREGATE_APIS)) {
      const result = await testApiResponse(apiUrl, `${center} 集合API`);
      originalApiResults[center] = result;
    }

    // 第二阶段：测试页面加载性能（包含多个API调用）
    console.log('\n📊 第二阶段：测试页面加载性能');
    console.log('-'.repeat(40));

    const pageLoadResults = [];

    for (const pageConfig of TEST_CONFIG.centerPages) {
      const pageUrl = `${BASE_URL}${pageConfig.path}`;

      // 多轮测试取平均值
      const roundResults = [];
      for (let round = 1; round <= TEST_CONFIG.testRounds; round++) {
        console.log(`\n第 ${round}/${TEST_CONFIG.testRounds} 轮测试`);
        const result = await testPageLoad(browser, pageUrl, pageConfig.name);
        roundResults.push(result);

        // 轮次间隔
        if (round < TEST_CONFIG.testRounds) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // 计算平均值
      const averageResult = {
        ...pageConfig,
        pageLoadTime: Math.round(roundResults.reduce((sum, r) => sum + (r.pageLoadTime || 0), 0) / roundResults.length),
        apiRequests: Math.round(roundResults.reduce((sum, r) => sum + (r.apiRequests || 0), 0) / roundResults.length),
        successfulApis: Math.round(roundResults.reduce((sum, r) => sum + (r.successfulApis || 0), 0) / roundResults.length),
        failedApis: Math.round(roundResults.reduce((sum, r) => sum + (r.failedApis || 0), 0) / roundResults.length),
        totalApiTime: Math.round(roundResults.reduce((sum, r) => sum + (r.totalApiTime || 0), 0) / roundResults.length),
        averageApiTime: Math.round(roundResults.reduce((sum, r) => sum + (r.averageApiTime || 0), 0) / roundResults.length),
        successRate: (roundResults.filter(r => r.success).length / roundResults.length) * 100
      };

      pageLoadResults.push(averageResult);

      console.log(`\n📈 ${pageConfig.name} 平均性能:`);
      console.log(`   - 页面加载时间: ${averageResult.pageLoadTime}ms`);
      console.log(`   - API请求数量: ${averageResult.apiRequests}`);
      console.log(`   - API总耗时: ${averageResult.totalApiTime}ms`);
      console.log(`   - 成功率: ${averageResult.successRate.toFixed(1)}%`);
    }

    // 第三阶段：生成性能报告
    console.log('\n📊 第三阶段：生成性能对比报告');
    console.log('-'.repeat(40));

    const report = generatePerformanceReport(originalApiResults, pageLoadResults);

    // 保存报告到文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `./aggregate-api-performance-report-${timestamp}.json`;

    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 性能报告已保存: ${reportPath}`);

    // 显示总结
    console.log('\n🎯 性能优化总结:');
    console.log('='.repeat(60));
    console.log(report.summary);

    return report;

  } finally {
    await browser.close();
    console.log('\n🏁 性能对比测试完成');
  }
}

/**
 * 生成性能报告
 */
function generatePerformanceReport(apiResults, pageResults) {
  const totalOriginalApiTime = Object.values(apiResults).reduce((sum, result) => sum + (result.responseTime || 0), 0);
  const totalPageLoadTime = pageResults.reduce((sum, result) => sum + (result.pageLoadTime || 0), 0);
  const totalApiRequests = pageResults.reduce((sum, result) => sum + (result.apiRequests || 0), 0);

  const averageOriginalApiTime = Object.keys(apiResults).length > 0 ?
    Math.round(totalOriginalApiTime / Object.keys(apiResults).length) : 0;

  const averagePageLoadTime = pageResults.length > 0 ?
    Math.round(totalPageLoadTime / pageResults.length) : 0;

  const improvement = averagePageLoadTime > 0 ?
    Math.round(((averagePageLoadTime - averageOriginalApiTime) / averagePageLoadTime) * 100) : 0;

  return {
    timestamp: new Date().toISOString(),
    testConfig: TEST_CONFIG,
    results: {
      originalApis: apiResults,
      pageLoads: pageResults
    },
    metrics: {
      totalOriginalApiTime,
      totalPageLoadTime,
      totalApiRequests,
      averageOriginalApiTime,
      averagePageLoadTime,
      performanceImprovement: improvement
    },
    summary: {
      averageOriginalApiTime: `${averageOriginalApiTime}ms`,
      averagePageLoadTime: `${averagePageLoadTime}ms`,
      totalApiRequests: `${totalApiRequests} 个`,
      performanceImprovement: `${improvement}%`,
      conclusion: improvement > 0 ?
        `✅ 集合API相比原始页面加载提升了 ${improvement}% 的性能` :
        `⚠️ 需要进一步优化集合API性能`,
      recommendations: generateRecommendations(apiResults, pageResults)
    }
  };
}

/**
 * 生成优化建议
 */
function generateRecommendations(apiResults, pageResults) {
  const recommendations = [];

  // 分析API结果
  Object.entries(apiResults).forEach(([center, result]) => {
    if (!result.success) {
      recommendations.push(`${center} API失败，需要检查服务端实现`);
    } else if (result.responseTime > 2000) {
      recommendations.push(`${center} API响应时间过长(${result.responseTime}ms)，建议优化数据库查询`);
    }
  });

  // 分析页面结果
  pageResults.forEach(pageResult => {
    if (pageResult.apiRequests > 5) {
      recommendations.push(`${pageResult.name} 页面发起了 ${pageResult.apiRequests} 个API请求，建议使用集合API优化`);
    }

    if (pageResult.failedApis > 0) {
      recommendations.push(`${pageResult.name} 页面有 ${pageResult.failedApis} 个API请求失败，需要检查错误处理`);
    }

    if (pageResult.pageLoadTime > 5000) {
      recommendations.push(`${pageResult.name} 页面加载时间过长(${pageResult.pageLoadTime}ms)，需要优化`);
    }
  });

  return recommendations;
}

// 运行测试
if (require.main === module) {
  runPerformanceComparison()
    .then(report => {
      console.log('\n✅ 测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceComparison, testApiResponse, testPageLoad };