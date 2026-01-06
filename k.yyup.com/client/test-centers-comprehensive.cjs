// 测试 centers 目录所有中心页面的自动化脚本
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 确保测试结果目录存在
const resultsDir = './test-results/centers';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 收集控制台消息
  const allErrors = [];
  const allConsoleMsgs = [];

  page.on('console', msg => {
    const text = msg.text();
    allConsoleMsgs.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });

    if (msg.type() === 'error') {
      allErrors.push({
        type: 'console',
        text: text,
        location: msg.location(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // 收集网络错误
  page.on('response', response => {
    if (!response.ok()) {
      allErrors.push({
        type: 'network',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // 收集页面错误
  page.on('pageerror', error => {
    allErrors.push({
      type: 'page',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  // centers目录的所有页面
  const pages = [
    { name: 'Business Center', url: '/centers/business', category: 'business' },
    { name: 'Activity Center', url: '/centers/activity', category: 'activity' },
    { name: 'Script Center', url: '/centers/script', category: 'script' },
    { name: 'System Center', url: '/centers/system', category: 'system' },
    { name: 'Analytics Center', url: '/centers/analytics', category: 'analytics' },
    { name: 'Finance Center', url: '/centers/finance', category: 'finance' },
    { name: 'Marketing Center', url: '/centers/marketing', category: 'marketing' },
    { name: 'Personnel Center', url: '/centers/personnel', category: 'personnel' },
    { name: 'Call Center', url: '/centers/call', category: 'call' },
    { name: 'Customer Pool Center', url: '/centers/customer', category: 'customer' },
    { name: 'Teaching Center', url: '/centers/teaching', category: 'teaching' },
    { name: 'Inspection Center', url: '/centers/inspection', category: 'inspection' },
    { name: 'Media Center', url: '/centers/media', category: 'media' },
    { name: 'Attendance Center', url: '/centers/attendance', category: 'attendance' },
    { name: 'Task Center', url: '/centers/task', category: 'task' },
    { name: 'Enrollment Center', url: '/centers/enrollment', category: 'enrollment' },
    { name: 'Assessment Center', url: '/centers/assessment', category: 'assessment' },
    { name: 'Document Collaboration', url: '/centers/document-collaboration', category: 'document' },
    { name: 'Document Template Center', url: '/centers/document-template', category: 'document' },
    { name: 'AI Center', url: '/centers/ai', category: 'ai' }
  ];

  console.log('🚀 开始测试 centers 目录的所有页面...\n');
  console.log(`📋 总计 ${pages.length} 个页面需要测试\n`);

  const results = [];
  const startTime = new Date();

  for (const pageInfo of pages) {
    console.log(`📄 测试页面: ${pageInfo.name} (${pageInfo.url})`);
    console.log(`📂 类别: ${pageInfo.category}`);

    const pageErrors = [];
    const startErrorsCount = allErrors.length;
    const pageStartTime = Date.now();

    try {
      // 访问页面
      const response = await page.goto(`http://localhost:5173${pageInfo.url}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const status = response.status();
      const loadTime = Date.now() - pageStartTime;
      console.log(`  ✅ HTTP状态码: ${status} (加载时间: ${loadTime}ms)`);

      // 检查页面基本元素
      await page.waitForTimeout(2000);

      const bodyText = await page.textContent('body');
      const has404Text = bodyText.includes('404') ||
                        bodyText.includes('Not Found') ||
                        bodyText.includes('页面不存在') ||
                        bodyText.includes('Page not found');

      const hasApp = await page.$('#app') !== null;
      const hasContent = bodyText.trim().length > 100; // 要求有实际内容
      const hasErrorText = bodyText.includes('Error') ||
                          bodyText.includes('错误') ||
                          bodyText.includes('Exception');

      // 检查是否有中心页面的特征元素
      const hasMainContent = await page.$('.main-content, .page-container, .center-container, .dashboard') !== null;
      const hasSidebar = await page.$('.sidebar, .nav-menu, .menu-container') !== null;

      console.log(`  📦 #app元素: ${hasApp ? '存在' : '不存在'}`);
      console.log(`  📄 页面内容: ${hasContent ? '有内容' : '空白或很少'}`);
      console.log(`  ⚠️  包含404文本: ${has404Text ? '是' : '否'}`);
      console.log(`  ❌ 包含错误文本: ${hasErrorText ? '是' : '否'}`);
      console.log(`  🏗️  主要内容区: ${hasMainContent ? '存在' : '不存在'}`);
      console.log(`  📋 侧边栏: ${hasSidebar ? '存在' : '不存在'}`);

      // 截取页面截图
      const screenshotPath = `${resultsDir}/${pageInfo.category}_${pageInfo.name.replace(/\s+/g, '_')}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`  📸 截图已保存: ${screenshotPath}`);

      // 统计该页面的错误
      const pageSpecificErrors = allErrors.slice(startErrorsCount);
      console.log(`  🚨 新增错误: ${pageSpecificErrors.length} 个`);

      if (pageSpecificErrors.length > 0) {
        console.log('    错误详情:');
        pageSpecificErrors.slice(0, 3).forEach(err => {
          if (err.type === 'network') {
            console.log(`      - [网络 ${err.status}] ${err.url}`);
          } else if (err.type === 'page') {
            console.log(`      - [页面错误] ${err.message.substring(0, 100)}...`);
          } else {
            console.log(`      - [控制台] ${err.text.substring(0, 100)}...`);
          }
        });
      }

      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        category: pageInfo.category,
        status: status,
        loadTime: loadTime,
        has404Text: has404Text,
        hasApp: hasApp,
        hasContent: hasContent,
        hasErrorText: hasErrorText,
        hasMainContent: hasMainContent,
        hasSidebar: hasSidebar,
        errorCount: pageSpecificErrors.length,
        errors: pageSpecificErrors,
        screenshot: screenshotPath,
        success: status === 200 && !has404Text && hasApp && hasContent && !hasErrorText
      });

    } catch (error) {
      const loadTime = Date.now() - pageStartTime;
      console.log(`  ❌ 加载失败 (耗时: ${loadTime}ms): ${error.message}`);

      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        category: pageInfo.category,
        error: error.message,
        loadTime: loadTime,
        errorCount: allErrors.length - startErrorsCount,
        success: false
      });
    }

    // 添加页面间的延迟，避免过快切换
    await page.waitForTimeout(1000);
  }

  const endTime = new Date();
  const totalTime = endTime - startTime;

  // 生成详细测试报告
  console.log('\n\n📊 === CENTERS 目录测试报告 ===\n');
  console.log(`⏱️  测试时间: ${totalTime}ms`);
  console.log(`📋 总页面数: ${pages.length}`);
  console.log(`✅ 成功页面: ${results.filter(r => r.success).length}`);
  console.log(`❌ 失败页面: ${results.filter(r => !r.success).length}`);
  console.log(`⚠️  有错误的页面: ${results.filter(r => r.errorCount > 0).length}`);
  console.log(`🚫 显示404内容的页面: ${results.filter(r => r.has404Text).length}`);
  console.log(`🚨 显示错误内容的页面: ${results.filter(r => r.hasErrorText).length}`);
  console.log(`📊 总错误数: ${allErrors.length}\n`);

  // 按类别统计
  const categoryStats = {};
  results.forEach(r => {
    if (!categoryStats[r.category]) {
      categoryStats[r.category] = { total: 0, success: 0, errors: 0 };
    }
    categoryStats[r.category].total++;
    if (r.success) categoryStats[r.category].success++;
    if (r.errorCount > 0) categoryStats[r.category].errors++;
  });

  console.log('📈 分类统计:');
  Object.entries(categoryStats).forEach(([category, stats]) => {
    console.log(`  ${category}: ${stats.success}/${stats.total} 成功, ${stats.errors} 个错误`);
  });

  // 列出有问题的页面
  const problemPages = results.filter(r => !r.success || r.errorCount > 0);
  if (problemPages.length > 0) {
    console.log('\n⚠️ 有问题的页面:');
    problemPages.forEach(r => {
      const issues = [];
      if (r.error) issues.push('加载失败');
      if (r.has404Text) issues.push('404错误');
      if (r.hasErrorText) issues.push('页面错误');
      if (r.errorCount > 0) issues.push(`${r.errorCount}个错误`);
      console.log(`  - ${r.name} (${r.url}): ${issues.join(', ')}`);
    });
  }

  // 保存详细报告到文件
  const report = {
    testInfo: {
      timestamp: startTime.toISOString(),
      duration: totalTime,
      category: 'centers',
      baseUrl: 'http://localhost:5173'
    },
    summary: {
      total: pages.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      withErrors: results.filter(r => r.errorCount > 0).length,
      with404: results.filter(r => r.has404Text).length,
      withErrorText: results.filter(r => r.hasErrorText).length,
      totalErrors: allErrors.length,
      categoryStats: categoryStats
    },
    results: results,
    errors: allErrors,
    consoleMessages: allConsoleMsgs
  };

  const reportPath = `${resultsDir}/centers-test-report.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 生成简化的Markdown报告
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = `${resultsDir}/centers-test-report.md`;
  fs.writeFileSync(markdownPath, markdownReport);

  console.log(`\n📄 详细JSON报告已保存到: ${reportPath}`);
  console.log(`📝 Markdown报告已保存到: ${markdownPath}`);
  console.log(`📸 页面截图已保存到: ${resultsDir}/`);

  await browser.close();
})();

// 生成Markdown报告的函数
function generateMarkdownReport(report) {
  const { testInfo, summary, results } = report;

  let markdown = `# Centers 目录测试报告\n\n`;
  markdown += `**测试时间**: ${new Date(testInfo.timestamp).toLocaleString()}\n`;
  markdown += `**测试持续时间**: ${testInfo.duration}ms\n`;
  markdown += `**测试URL**: ${testInfo.baseUrl}\n\n`;

  markdown += `## 📊 总体统计\n\n`;
  markdown += `- **总页面数**: ${summary.total}\n`;
  markdown += `- **成功页面**: ${summary.success} (${((summary.success/summary.total)*100).toFixed(1)}%)\n`;
  markdown += `- **失败页面**: ${summary.failed} (${((summary.failed/summary.total)*100).toFixed(1)}%)\n`;
  markdown += `- **有错误的页面**: ${summary.withErrors}\n`;
  markdown += `- **404页面**: ${summary.with404}\n`;
  markdown += `- **显示错误的页面**: ${summary.withErrorText}\n`;
  markdown += `- **总错误数**: ${summary.totalErrors}\n\n`;

  markdown += `## 📈 分类统计\n\n`;
  markdown += `| 类别 | 总数 | 成功 | 成功率 | 错误数 |\n`;
  markdown += `|------|------|------|--------|--------|\n`;

  Object.entries(summary.categoryStats).forEach(([category, stats]) => {
    const successRate = ((stats.success/stats.total)*100).toFixed(1);
    markdown += `| ${category} | ${stats.total} | ${stats.success} | ${successRate}% | ${stats.errors} |\n`;
  });

  markdown += `\n## 📋 页面详情\n\n`;
  markdown += `| 页面名称 | URL | 状态 | 加载时间 | 错误数 | 成功 |\n`;
  markdown += `|----------|-----|------|----------|--------|------|\n`;

  results.forEach(r => {
    const status = r.status || 'Failed';
    const loadTime = r.loadTime || 0;
    const success = r.success ? '✅' : '❌';
    markdown += `| ${r.name} | ${r.url} | ${status} | ${loadTime}ms | ${r.errorCount || 0} | ${success} |\n`;
  });

  markdown += `\n## ⚠️ 有问题的页面\n\n`;
  const problemPages = results.filter(r => !r.success || r.errorCount > 0);
  if (problemPages.length > 0) {
    problemPages.forEach(r => {
      markdown += `### ${r.name}\n`;
      markdown += `- **URL**: ${r.url}\n`;
      markdown += `- **类别**: ${r.category}\n`;
      if (r.error) markdown += `- **错误**: ${r.error}\n`;
      if (r.has404Text) markdown += `- **404错误**: 是\n`;
      if (r.hasErrorText) markdown += `- **页面错误**: 是\n`;
      if (r.errorCount > 0) markdown += `- **错误数量**: ${r.errorCount}\n`;
      markdown += `- **截图**: ${r.screenshot || '无'}\n\n`;
    });
  } else {
    markdown += `✅ 所有页面都测试通过！\n`;
  }

  return markdown;
}