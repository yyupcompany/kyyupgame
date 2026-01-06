// 测试所有中心页面的自动化脚本
const { chromium } = require('playwright');

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
        timestamp: new Date().toISOString()
      });
    }
  });

  // 要测试的所有中心页面
  const pages = [
    { name: 'Business Center', url: '/centers/business' },
    { name: 'Activity Center', url: '/centers/activity' },
    { name: 'Script Center', url: '/centers/script' },
    { name: 'System Center', url: '/centers/system' },
    { name: 'Analytics Center', url: '/centers/analytics' },
    { name: 'Finance Center', url: '/centers/finance' },
    { name: 'Marketing Center', url: '/centers/marketing' },
    { name: 'Personnel Center', url: '/centers/personnel' },
    { name: 'Call Center', url: '/centers/call' },
    { name: 'Customer Pool', url: '/centers/customer' },
    { name: 'Teaching Center', url: '/centers/teaching' },
    { name: 'Inspection Center', url: '/centers/inspection' },
    { name: 'Media Center', url: '/centers/media' },
    { name: 'Attendance Center', url: '/centers/attendance' },
    { name: 'Task Center', url: '/centers/task' },
    { name: 'Enrollment Center', url: '/centers/enrollment' },
    { name: 'Assessment Center', url: '/centers/assessment' }
  ];

  console.log('🚀 开始测试所有中心页面...\n');

  const results = [];

  for (const pageInfo of pages) {
    console.log(`\n📄 测试页面: ${pageInfo.name} (${pageInfo.url})`);
    
    const pageErrors = [];
    const startErrorsCount = allErrors.length;

    try {
      // 访问页面
      const response = await page.goto(`http://localhost:5173${pageInfo.url}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const status = response.status();
      console.log(`  ✅ HTTP状态码: ${status}`);

      // 等待页面加载
      await page.waitForTimeout(2000);

      // 检查是否有404错误
      const bodyText = await page.textContent('body');
      const has404Text = bodyText.includes('404') || bodyText.includes('Not Found');
      const hasApp = await page.$('#app') !== null;
      const hasContent = bodyText.trim().length > 0;

      console.log(`  📦 #app元素: ${hasApp ? '存在' : '不存在'}`);
      console.log(`  📄 页面内容: ${hasContent ? '有内容' : '空白'}`);
      console.log(`  ⚠️  包含404文本: ${has404Text ? '是' : '否'}`);

      // 截取页面截图
      await page.screenshot({
        path: `./test-results/${pageInfo.name.replace(/\s+/g, '_')}.png`
      });

      // 统计该页面的错误
      const pageSpecificErrors = allErrors.slice(startErrorsCount);
      console.log(`  🚨 新增错误: ${pageSpecificErrors.length} 个`);

      if (pageSpecificErrors.length > 0) {
        console.log('    错误详情:');
        pageSpecificErrors.slice(0, 3).forEach(err => {
          console.log(`      - ${err.type}: ${err.text || err.url || err.status}`);
        });
      }

      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        status: status,
        has404Text: has404Text,
        hasApp: hasApp,
        hasContent: hasContent,
        errorCount: pageSpecificErrors.length,
        errors: pageSpecificErrors
      });

    } catch (error) {
      console.log(`  ❌ 加载失败: ${error.message}`);
      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        error: error.message,
        errorCount: allErrors.length - startErrorsCount
      });
    }
  }

  // 生成测试报告
  console.log('\n\n📊 === 测试报告 ===\n');
  console.log(`总页面数: ${pages.length}`);
  console.log(`成功加载: ${results.filter(r => !r.error).length}`);
  console.log(`失败: ${results.filter(r => r.error).length}`);
  console.log(`有错误的页面: ${results.filter(r => r.errorCount > 0).length}`);
  console.log(`显示404内容的页面: ${results.filter(r => r.has404Text).length}`);
  console.log(`总错误数: ${allErrors.length}\n`);

  // 列出有错误的页面
  const pagesWithErrors = results.filter(r => r.errorCount > 0);
  if (pagesWithErrors.length > 0) {
    console.log('⚠️ 有错误的页面:');
    pagesWithErrors.forEach(r => {
      console.log(`  - ${r.name}: ${r.errorCount} 个错误`);
    });
    console.log('');
  }

  // 列出404页面
  const pagesWith404 = results.filter(r => r.has404Text);
  if (pagesWith404.length > 0) {
    console.log('❌ 显示404内容的页面:');
    pagesWith404.forEach(r => {
      console.log(`  - ${r.name} (${r.url})`);
    });
    console.log('');
  }

  // 显示所有控制台错误
  if (allErrors.length > 0) {
    console.log('🚨 所有错误详情:');
    allErrors.slice(0, 20).forEach((err, index) => {
      if (err.type === 'network') {
        console.log(`  ${index + 1}. [NETWORK ${err.status}] ${err.url}`);
      } else {
        console.log(`  ${index + 1}. [${err.type}] ${err.text}`);
      }
    });
    if (allErrors.length > 20) {
      console.log(`  ... 还有 ${allErrors.length - 20} 个错误`);
    }
  }

  await browser.close();

  // 保存详细报告到文件
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: pages.length,
      success: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      withErrors: results.filter(r => r.errorCount > 0).length,
      with404: results.filter(r => r.has404Text).length,
      totalErrors: allErrors.length
    },
    results: results,
    errors: allErrors
  };

  fs.writeFileSync('./test-results/test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 详细报告已保存到 ./test-results/test-report.json');
  console.log('📸 页面截图已保存到 ./test-results/*.png');

})();
