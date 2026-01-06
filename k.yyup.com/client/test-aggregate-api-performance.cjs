const puppeteer = require('puppeteer');

/**
 * 集合API性能测试脚本
 * 测试新开发的集合API是否有效提升页面加载速度
 */

const testPages = [
  // 测试集合API端点
  { name: '系统中心集合API', url: 'http://localhost:3000/api/centers/system/overview', type: 'api' },
  { name: '财务中心集合API', url: 'http://localhost:3000/api/centers/finance/overview', type: 'api' },
  { name: '活动中心集合API', url: 'http://localhost:3000/api/centers/activity/overview', type: 'api' },
  { name: '教师中心集合API', url: 'http://localhost:3000/api/centers/teacher/dashboard/overview', type: 'api' },
  { name: '分析中心集合API', url: 'http://localhost:3000/api/centers/analytics/overview', type: 'api' },

  // 测试关键页面（已优化）
  { name: '系统中心页面', url: 'http://localhost:5173/centers/system', type: 'page' },
  { name: '财务中心页面', url: 'http://localhost:5173/centers/finance', type: 'page' },
  { name: '活动中心页面', url: 'http://localhost:5173/centers/activity', type: 'page' },
  { name: '教师中心仪表板', url: 'http://localhost:5173/teacher-center/dashboard', type: 'page' }
];

async function testAggregateAPIPerformance() {
  console.log('🚀 开始集合API性能测试...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  for (const pageConfig of testPages) {
    console.log(`📊 测试: ${pageConfig.name}`);

    const times = [];

    // 每个页面测试3次取平均值
    for (let i = 0; i < 3; i++) {
      const page = await browser.newPage();

      try {
        const startTime = Date.now();

        if (pageConfig.type === 'api') {
          // 测试API响应时间
          const response = await page.evaluate(async (url) => {
            const response = await fetch(url, {
              headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
              }
            });
            return {
              status: response.status,
              text: await response.text()
            };
          }, pageConfig.url);

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          console.log(`   尝试 ${i + 1}: ${responseTime}ms (状态: ${response.status})`);
          times.push(responseTime);

        } else {
          // 测试页面加载时间
          const metrics = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('页面加载超时'));
            }, 30000);

            page.once('load', () => {
              clearTimeout(timeout);
              resolve(page.metrics());
            });
          });

          await page.goto(pageConfig.url, {
            waitUntil: 'networkidle0',
            timeout: 30000
          });

          const endTime = Date.now();
          const loadTime = endTime - startTime;

          console.log(`   尝试 ${i + 1}: ${loadTime}ms`);
          times.push(loadTime);
        }

      } catch (error) {
        console.log(`   尝试 ${i + 1}: 失败 - ${error.message}`);
        times.push(30000); // 超时时间
      } finally {
        await page.close();
      }

      // 等待一下避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    results.push({
      name: pageConfig.name,
      type: pageConfig.type,
      avgTime,
      minTime,
      maxTime,
      times
    });

    console.log(`   平均: ${avgTime}ms (最快: ${minTime}ms, 最慢: ${maxTime}ms)\n`);
  }

  await browser.close();

  // 生成性能报告
  console.log('📈 集合API性能测试报告');
  console.log('=' .repeat(60));

  const apiResults = results.filter(r => r.type === 'api');
  const pageResults = results.filter(r => r.type === 'page');

  console.log('\n🔧 API端点性能:');
  apiResults.forEach(result => {
    const grade = result.avgTime < 500 ? 'A' : result.avgTime < 1000 ? 'B' : result.avgTime < 2000 ? 'C' : 'D';
    const icon = grade === 'A' ? '🟢' : grade === 'B' ? '🟡' : grade === 'C' ? '🟠' : '🔴';
    console.log(`  ${icon} ${result.name}: ${result.avgTime}ms (等级: ${grade})`);
  });

  console.log('\n🌐 页面加载性能:');
  pageResults.forEach(result => {
    const grade = result.avgTime < 2000 ? 'A' : result.avgTime < 3000 ? 'B' : result.avgTime < 5000 ? 'C' : 'D';
    const icon = grade === 'A' ? '🟢' : grade === 'B' ? '🟡' : grade === 'C' ? '🟠' : '🔴';
    console.log(`  ${icon} ${result.name}: ${result.avgTime}ms (等级: ${grade})`);
  });

  // 性能分析
  const apiAvgTime = apiResults.reduce((sum, r) => sum + r.avgTime, 0) / apiResults.length;
  const pageAvgTime = pageResults.reduce((sum, r) => sum + r.avgTime, 0) / pageResults.length;

  console.log('\n📊 性能统计:');
  console.log(`  🎯 API平均响应时间: ${Math.round(apiAvgTime)}ms`);
  console.log(`  🌐 页面平均加载时间: ${Math.round(pageAvgTime)}ms`);
  console.log(`  📈 API响应速度: ${apiAvgTime < 500 ? '优秀' : apiAvgTime < 1000 ? '良好' : '需要优化'}`);
  console.log(`  📈 页面加载速度: ${pageAvgTime < 2000 ? '优秀' : pageAvgTime < 3000 ? '良好' : '需要优化'}`);

  // 性能建议
  console.log('\n💡 性能优化建议:');
  if (apiAvgTime < 500) {
    console.log('  ✅ API响应时间优秀，集合API优化效果显著');
  } else if (apiAvgTime < 1000) {
    console.log('  🔶 API响应时间良好，建议进一步优化数据库查询');
  } else {
    console.log('  ❌ API响应时间较慢，需要重点优化');
  }

  if (pageAvgTime < 2000) {
    console.log('  ✅ 页面加载速度优秀，前端优化效果明显');
  } else if (pageAvgTime < 3000) {
    console.log('  🔶 页面加载速度良好，建议优化资源加载');
  } else {
    console.log('  ❌ 页面加载速度较慢，需要全面优化');
  }

  return results;
}

// 运行测试
testAggregateAPIPerformance()
  .then(results => {
    console.log('\n🎉 集合API性能测试完成！');

    // 保存结果到文件
    const fs = require('fs');
    const reportData = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        apiAvgTime: results.filter(r => r.type === 'api').reduce((sum, r) => sum + r.avgTime, 0) / results.filter(r => r.type === 'api').length,
        pageAvgTime: results.filter(r => r.type === 'page').reduce((sum, r) => sum + r.avgTime, 0) / results.filter(r => r.type === 'page').length
      }
    };

    fs.writeFileSync('./aggregate-api-performance-report.json', JSON.stringify(reportData, null, 2));
    console.log('📄 详细报告已保存到: aggregate-api-performance-report.json');

    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  });