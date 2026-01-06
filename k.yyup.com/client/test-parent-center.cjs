// 测试 parent-center 相关页面的自动化脚本
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 确保测试结果目录存在
const resultsDir = './test-results/parent-center';
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

  // parent-center相关的所有页面
  const pages = [
    // 主要功能页面
    { name: 'Parent Center Dashboard', url: '/parent-center/dashboard', category: 'dashboard' },
    { name: 'Parent Center Children', url: '/parent-center/children', category: 'children' },
    { name: 'Parent Center Assessment', url: '/parent-center/assessment', category: 'assessment' },
    { name: 'Parent Center Activities', url: '/parent-center/activities', category: 'activities' },
    { name: 'Parent Center Games', url: '/parent-center/games', category: 'games' },
    { name: 'Parent Center AI Assistant', url: '/parent-center/ai-assistant', category: 'ai-assistant' },
    { name: 'Parent Center Communication', url: '/parent-center/communication', category: 'communication' },
    { name: 'Parent Center Feedback', url: '/parent-center/feedback', category: 'feedback' },
    { name: 'Parent Center Profile', url: '/parent-center/profile', category: 'profile' },
    { name: 'Parent Center Share Stats', url: '/parent-center/share-stats', category: 'share-stats' },

    // Assessment 子页面
    { name: 'Parent Assessment Start', url: '/parent-center/assessment/start', category: 'assessment' },
    { name: 'Parent Assessment Doing', url: '/parent-center/assessment/doing', category: 'assessment' },
    { name: 'Parent Assessment Report', url: '/parent-center/assessment/report', category: 'assessment' },
    { name: 'Parent Assessment Growth Trajectory', url: '/parent-center/assessment/growth-trajectory', category: 'assessment' },

    // Children 子页面
    { name: 'Parent Children Growth', url: '/parent-center/children/growth', category: 'children' },
    { name: 'Parent Children Follow Up', url: '/parent-center/children/follow-up', category: 'children' },

    // Games 子页面
    { name: 'Parent Games Records', url: '/parent-center/games/records', category: 'games' },
    { name: 'Parent Games Achievements', url: '/parent-center/games/achievements', category: 'games' },

    // Games Play 子页面
    { name: 'Animal Observer Game', url: '/parent-center/games/play/animal-observer', category: 'games' },
    { name: 'Color Sorting Game', url: '/parent-center/games/play/color-sorting', category: 'games' },
    { name: 'Dinosaur Memory Game', url: '/parent-center/games/play/dinosaur-memory', category: 'games' },
    { name: 'Dollhouse Tidy Game', url: '/parent-center/games/play/dollhouse-tidy', category: 'games' },
    { name: 'Fruit Sequence Game', url: '/parent-center/games/play/fruit-sequence', category: 'games' },
    { name: 'Princess Garden Game', url: '/parent-center/games/play/princess-garden', category: 'games' },
    { name: 'Princess Memory Game', url: '/parent-center/games/play/princess-memory', category: 'games' },
    { name: 'Robot Factory Game', url: '/parent-center/games/play/robot-factory', category: 'games' },
    { name: 'Space Treasure Game', url: '/parent-center/games/play/space-treasure', category: 'games' },

    // 其他家长相关页面
    { name: 'Parent Index', url: '/parent', category: 'general' },
    { name: 'Parent List', url: '/parent/list', category: 'general' },
    { name: 'Parent Edit', url: '/parent/edit', category: 'general' },
    { name: 'Parent Search', url: '/parent/search', category: 'general' },
    { name: 'Parent Statistics', url: '/parent/statistics', category: 'statistics' },
    { name: 'Parent Detail', url: '/parent/detail', category: 'general' },
    { name: 'Parent Profile Page', url: '/parent/profile', category: 'general' },
    { name: 'Parent Communication Hub', url: '/parent/communication/smart-hub', category: 'communication' },
    { name: 'Parent Children List', url: '/parent/children', category: 'children' },
    { name: 'Parent Child Growth', url: '/parent/child-growth', category: 'children' },
    { name: 'Parent Feedback Page', url: '/parent/feedback', category: 'feedback' }
  ];

  console.log('🚀 开始测试 parent-center 相关的所有页面...\n');
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
      const hasContent = bodyText.trim().length > 100;
      const hasErrorText = bodyText.includes('Error') ||
                          bodyText.includes('错误') ||
                          bodyText.includes('Exception');

      // 检查家长页面的特征元素
      const hasMainContent = await page.$('.main-content, .page-container, .parent-container, .dashboard') !== null;
      const hasSidebar = await page.$('.sidebar, .nav-menu, .menu-container') !== null;
      const hasParentSpecific = await page.$('.parent-portal, .parent-dashboard, .parent-panel, .family-container') !== null;

      // 检查移动端适配
      const hasMobileViewport = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta ? meta.getAttribute('content') : null;
      });

      console.log(`  📦 #app元素: ${hasApp ? '存在' : '不存在'}`);
      console.log(`  📄 页面内容: ${hasContent ? '有内容' : '空白或很少'}`);
      console.log(`  ⚠️  包含404文本: ${has404Text ? '是' : '否'}`);
      console.log(`  ❌ 包含错误文本: ${hasErrorText ? '是' : '否'}`);
      console.log(`  🏗️  主要内容区: ${hasMainContent ? '存在' : '不存在'}`);
      console.log(`  📋 侧边栏: ${hasSidebar ? '存在' : '不存在'}`);
      console.log(`  👨‍👩‍👧‍👦 家长专用元素: ${hasParentSpecific ? '存在' : '不存在'}`);
      console.log(`  📱 移动端适配: ${hasMobileViewport ? '已配置' : '未配置'}`);

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
        hasParentSpecific: hasParentSpecific,
        hasMobileViewport: hasMobileViewport,
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

    // 添加页面间的延迟
    await page.waitForTimeout(1000);
  }

  const endTime = new Date();
  const totalTime = endTime - startTime;

  // 生成详细测试报告
  console.log('\n\n📊 === PARENT CENTER 测试报告 ===\n');
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
      categoryStats[r.category] = { total: 0, success: 0, errors: 0, parentSpecific: 0, mobileReady: 0 };
    }
    categoryStats[r.category].total++;
    if (r.success) categoryStats[r.category].success++;
    if (r.errorCount > 0) categoryStats[r.category].errors++;
    if (r.hasParentSpecific) categoryStats[r.category].parentSpecific++;
    if (r.hasMobileViewport) categoryStats[r.category].mobileReady++;
  });

  console.log('📈 分类统计:');
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const successRate = ((stats.success/stats.total)*100).toFixed(1);
    const mobileRate = ((stats.mobileReady/stats.total)*100).toFixed(1);
    console.log(`  ${category}: ${stats.success}/${stats.total} 成功 (${successRate}%), ${stats.errors} 个错误, ${stats.parentSpecific} 个家长专用, ${stats.mobileReady} 个移动端适配`);
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

  // 统计功能覆盖情况
  const functionalCoverage = {
    dashboard: results.filter(r => r.category === 'dashboard' && r.success).length,
    'children-management': results.filter(r => r.category === 'children' && r.success).length,
    assessment: results.filter(r => r.category === 'assessment' && r.success).length,
    activities: results.filter(r => r.category === 'activities' && r.success).length,
    games: results.filter(r => r.category === 'games' && r.success).length,
    'ai-assistant': results.filter(r => r.category === 'ai-assistant' && r.success).length,
    communication: results.filter(r => r.category === 'communication' && r.success).length,
    feedback: results.filter(r => r.category === 'feedback' && r.success).length,
    'profile-management': results.filter(r => r.category === 'profile' && r.success).length,
    'social-sharing': results.filter(r => r.category === 'share-stats' && r.success).length
  };

  console.log('\n🎯 功能覆盖统计:');
  Object.entries(functionalCoverage).forEach(([func, count]) => {
    const total = results.filter(r => r.category === func).length;
    const rate = total > 0 ? ((count/total)*100).toFixed(1) : '0.0';
    console.log(`  ${func}: ${count}/${total} 页面正常 (${rate}%)`);
  });

  // 统计移动端适配情况
  const mobileStats = {
    total: results.length,
    configured: results.filter(r => r.hasMobileViewport).length,
    parentSpecific: results.filter(r => r.hasParentSpecific && r.hasMobileViewport).length
  };
  console.log('\n📱 移动端适配统计:');
  console.log(`  总页面: ${mobileStats.total}`);
  console.log(`  已配置移动端适配: ${mobileStats.configured} (${((mobileStats.configured/mobileStats.total)*100).toFixed(1)}%)`);
  console.log(`  家长专用页面已适配: ${mobileStats.parentSpecific}`);

  // 保存详细报告到文件
  const report = {
    testInfo: {
      timestamp: startTime.toISOString(),
      duration: totalTime,
      category: 'parent-center',
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
      categoryStats: categoryStats,
      functionalCoverage: functionalCoverage,
      mobileStats: mobileStats
    },
    results: results,
    errors: allErrors,
    consoleMessages: allConsoleMsgs
  };

  const reportPath = `${resultsDir}/parent-center-test-report.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 生成简化的Markdown报告
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = `${resultsDir}/parent-center-test-report.md`;
  fs.writeFileSync(markdownPath, markdownReport);

  console.log(`\n📄 详细JSON报告已保存到: ${reportPath}`);
  console.log(`📝 Markdown报告已保存到: ${markdownPath}`);
  console.log(`📸 页面截图已保存到: ${resultsDir}/`);

  await browser.close();
})();

// 生成Markdown报告的函数
function generateMarkdownReport(report) {
  const { testInfo, summary, results } = report;

  let markdown = `# Parent Center 测试报告\n\n`;
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
  markdown += `| 类别 | 总数 | 成功 | 成功率 | 错误数 | 家长专用 | 移动端适配 |\n`;
  markdown += `|------|------|------|--------|--------|----------|------------|\n`;

  Object.entries(summary.categoryStats).forEach(([category, stats]) => {
    const successRate = ((stats.success/stats.total)*100).toFixed(1);
    const mobileRate = ((stats.mobileReady/stats.total)*100).toFixed(1);
    markdown += `| ${category} | ${stats.total} | ${stats.success} | ${successRate}% | ${stats.errors} | ${stats.parentSpecific} | ${stats.mobileReady} (${mobileRate}%) |\n`;
  });

  markdown += `\n## 🎯 功能覆盖统计\n\n`;
  markdown += `| 功能模块 | 正常页面数 | 总页面数 | 覆盖率 |\n`;
  markdown += `|----------|------------|----------|--------|\n`;

  Object.entries(summary.functionalCoverage).forEach(([func, count]) => {
    const total = results.filter(r => r.category === func).length;
    const coverage = total > 0 ? ((count/total)*100).toFixed(1) : '0.0';
    markdown += `| ${func} | ${count} | ${total} | ${coverage}% |\n`;
  });

  markdown += `\n## 📱 移动端适配统计\n\n`;
  markdown += `- **总页面数**: ${summary.mobileStats.total}\n`;
  markdown += `- **已配置移动端适配**: ${summary.mobileStats.configured} (${((summary.mobileStats.configured/summary.mobileStats.total)*100).toFixed(1)}%)\n`;
  markdown += `- **家长专用页面已适配**: ${summary.mobileStats.parentSpecific}\n\n`;

  markdown += `## 📋 页面详情\n\n`;
  markdown += `| 页面名称 | URL | 类别 | 状态 | 加载时间 | 错误数 | 成功 | 移动端 |\n`;
  markdown += `|----------|-----|------|------|----------|--------|------|--------|\n`;

  results.forEach(r => {
    const status = r.status || 'Failed';
    const loadTime = r.loadTime || 0;
    const success = r.success ? '✅' : '❌';
    const mobile = r.hasMobileViewport ? '✅' : '❌';
    markdown += `| ${r.name} | ${r.url} | ${r.category} | ${status} | ${loadTime}ms | ${r.errorCount || 0} | ${success} | ${mobile} |\n`;
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
    markdown += `✅ 所有家长中心页面都测试通过！\n`;
  }

  return markdown;
}