// 问题页面快速测试脚本
import { chromium } from 'playwright';
import fs from 'fs';

// 重点问题页面 - 根据之前的测试结果
const problemPages = [
  { name: 'activity', url: '/centers/activity', description: 'Activity Center (404 errors)' },
  { name: 'system', url: '/centers/system', description: 'System Center (requestFunc errors)' },
  { name: 'inspection', url: '/centers/inspection', description: 'Inspection Center (500 errors)' },
  { name: 'enrollment', url: '/centers/enrollment', description: 'Enrollment Center (500 errors)' }
];

(async () => {
  console.log('🚀 快速测试问题页面\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 收集错误
  const allErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      allErrors.push({
        type: 'console',
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });

  page.on('response', response => {
    if (!response.ok()) {
      allErrors.push({
        type: 'network',
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });

  for (const pageInfo of problemPages) {
    console.log(`\n📄 测试: ${pageInfo.description}`);
    const startErrorsCount = allErrors.length;

    try {
      const response = await page.goto(`http://localhost:5173${pageInfo.url}`, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      const status = response.status();
      await page.waitForTimeout(1000);

      const pageSpecificErrors = allErrors.slice(startErrorsCount);
      console.log(`  ✅ HTTP状态码: ${status}`);
      console.log(`  🚨 错误数量: ${pageSpecificErrors.length}`);

      if (pageSpecificErrors.length > 0) {
        const networkErrors = pageSpecificErrors.filter(e => e.type === 'network');
        const consoleErrors = pageSpecificErrors.filter(e => e.type === 'console');

        if (networkErrors.length > 0) {
          console.log(`    🔗 网络错误: ${networkErrors.length} 个`);
          networkErrors.slice(0, 3).forEach(err => {
            console.log(`      [${err.status}] ${err.url}`);
          });
        }

        if (consoleErrors.length > 0) {
          console.log(`    📝 控制台错误: ${consoleErrors.length} 个`);
          consoleErrors.slice(0, 2).forEach(err => {
            console.log(`      ${err.text}`);
          });
        }
      }

    } catch (error) {
      console.log(`  ❌ 加载失败: ${error.message}`);
    }
  }

  await browser.close();

  // 汇总报告
  console.log('\n📊 === 问题页面汇总 ===');
  const totalPages = problemPages.length;
  const pagesWithErrors = allErrors.length > 0 ? totalPages : 0;
  console.log(`测试页面数: ${totalPages}`);
  console.log(`有错误的页面: ${pagesWithErrors}`);
  console.log(`总错误数: ${allErrors.length}`);

  if (allErrors.length > 0) {
    console.log('\n🔍 错误分类:');
    const networkErrors = allErrors.filter(e => e.type === 'network');
    const consoleErrors = allErrors.filter(e => e.type === 'console');

    console.log(`网络错误: ${networkErrors.length} 个`);
    console.log(`控制台错误: ${consoleErrors.length} 个`);

    // 分析常见错误模式
    const errorPatterns = {};
    networkErrors.forEach(err => {
      const url = new URL(err.url);
      const endpoint = url.pathname;
      errorPatterns[endpoint] = (errorPatterns[endpoint] || 0) + 1;
    });

    if (Object.keys(errorPatterns).length > 0) {
      console.log('\n📍 缺失的API端点:');
      Object.entries(errorPatterns).forEach(([endpoint, count]) => {
        console.log(`  ${endpoint} (${count} 次请求)`);
      });
    }
  }
})();