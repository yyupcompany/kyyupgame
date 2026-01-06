const { chromium } = require('playwright');

async function testAICenterPage() {
  console.log('🚀 开始验证AI中心页面修复状态...\n');

  const browser = await chromium.launch({
    headless: false, // 设置为false以查看浏览器操作
    slowMo: 500 // 减慢操作速度以便观察
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  try {
    // 步骤1: 访问AI中心页面
    console.log('📍 步骤1: 访问AI中心页面 http://localhost:5173/centers/ai');
    await page.goto('http://localhost:5173/centers/ai', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 截图记录页面状态
    await page.screenshot({ path: 'docs/浏览器检查/ai-center-initial-load.png', fullPage: true });
    console.log('📸 已保存页面初始加载截图');

    // 检查是否显示"出错了"页面
    const errorElement = await page.$('text=出错了');
    if (errorElement) {
      console.log('❌ 页面仍显示"出错了"错误');
      await page.screenshot({ path: 'docs/浏览器检查/ai-center-error-state.png', fullPage: true });
    } else {
      console.log('✅ 页面没有显示"出错了"错误');
    }

    // 步骤2: 验证页面标题和主要内容
    console.log('\n📍 步骤2: 验证页面标题和主要内容');

    // 检查"智能中心"标题
    const titleElement = await page.$('h1:has-text("智能中心")');
    const pageTitle = titleElement ? await titleElement.textContent() : null;
    console.log(`页面标题: ${pageTitle || '未找到'}`);

    // 检查统计卡片区域
    const statsCards = await page.$$('.stat-card, .stats-card, [class*="stat"], [class*="card"]');
    console.log(`统计卡片数量: ${statsCards.length}`);

    // 检查AI功能模块卡片
    const aiModules = await page.$$('[class*="ai-module"], [class*="module"], [class*="function-card"]');
    console.log(`AI功能模块数量: ${aiModules.length}`);

    // 获取所有链接和按钮
    const links = await page.$$eval('a', links => links.map(link => ({
      text: link.textContent.trim(),
      href: link.href,
      class: link.className
    })));

    console.log('\n🔗 页面链接列表:');
    links.filter(link => link.text && link.href).forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.text} -> ${link.href}`);
    });

    // 截图记录当前状态
    await page.screenshot({ path: 'docs/浏览器检查/ai-center-content-analysis.png', fullPage: true });

    // 步骤3: 测试主要AI功能模块的可点击性
    console.log('\n📍 步骤3: 测试主要AI功能模块的可点击性');

    const modulesToTest = [
      { name: 'AI智能查询', selector: 'a[href*="/ai/query"]' },
      { name: 'AI专家咨询', selector: 'a[href*="/ai-center/expert-consultation"]' },
      { name: 'AI模型管理', selector: 'a[href*="/ai/models"]' },
      { name: 'Function Tools', selector: 'a[href*="/ai-center/function-tools"]' }
    ];

    const testResults = [];

    for (const module of modulesToTest) {
      try {
        console.log(`\n🔍 测试模块: ${module.name}`);

        const element = await page.$(module.selector);
        if (element) {
          const text = await element.textContent();
          const href = await element.getAttribute('href');

          console.log(`  找到元素: ${text}`);
          console.log(`  链接地址: ${href}`);

          if (href && !href.includes('javascript:void')) {
            // 点击前截图
            await page.screenshot({ path: `docs/浏览器检查/before-click-${module.name}.png` });

            // 点击元素
            await element.click();

            // 等待页面响应
            await page.waitForTimeout(2000);

            // 检查是否成功跳转
            const currentUrl = page.url();
            console.log(`  跳转后URL: ${currentUrl}`);

            // 检查页面是否有错误
            const hasError = await page.$('text=出错了') !== null;

            testResults.push({
              name: module.name,
              selector: module.selector,
              found: true,
              clickable: true,
              url: href,
              finalUrl: currentUrl,
              success: !hasError,
              error: hasError
            });

            // 截图记录点击后状态
            await page.screenshot({ path: `docs/浏览器检查/after-click-${module.name}.png` });

            // 返回AI中心页面
            await page.goBack();
            await page.waitForTimeout(1000);
          } else {
            testResults.push({
              name: module.name,
              selector: module.selector,
              found: true,
              clickable: false,
              url: href,
              finalUrl: null,
              success: false,
              error: 'Invalid href'
            });
          }
        } else {
          console.log(`  ❌ 未找到元素: ${module.selector}`);
          testResults.push({
            name: module.name,
            selector: module.selector,
            found: false,
            clickable: false,
            url: null,
            finalUrl: null,
            success: false,
            error: 'Element not found'
          });
        }
      } catch (error) {
        console.log(`  ❌ 测试失败: ${error.message}`);
        testResults.push({
          name: module.name,
          selector: module.selector,
          found: false,
          clickable: false,
          url: null,
          finalUrl: null,
          success: false,
          error: error.message
        });
      }
    }

    // 步骤4: 检查控制台错误
    console.log('\n📍 步骤4: 检查控制台错误信息');

    if (consoleMessages.length > 0) {
      console.log(`\n📋 控制台消息 (${consoleMessages.length}条):`);
      consoleMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type}] ${msg.text}`);
      });
    }

    if (pageErrors.length > 0) {
      console.log(`\n❌ 页面错误 (${pageErrors.length}条):`);
      pageErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
      });
    } else {
      console.log('\n✅ 无页面错误');
    }

    // 生成测试报告
    console.log('\n📊 生成验证报告...');

    const report = {
      timestamp: new Date().toISOString(),
      testUrl: 'http://localhost:5173/centers/ai',
      pageTitle: pageTitle,
      statsCards: statsCards.length,
      aiModules: aiModules.length,
      consoleMessages: consoleMessages,
      pageErrors: pageErrors,
      moduleTests: testResults,
      summary: {
        totalModules: modulesToTest.length,
        successfulModules: testResults.filter(r => r.success).length,
        foundModules: testResults.filter(r => r.found).length,
        clickableModules: testResults.filter(r => r.clickable).length
      }
    };

    return report;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    await page.screenshot({ path: 'docs/浏览器检查/test-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// 执行测试
testAICenterPage()
  .then(report => {
    console.log('\n✅ 测试完成！');

    // 打印测试结果摘要
    console.log('\n📋 测试结果摘要:');
    console.log(`  页面标题: ${report.pageTitle || '未找到'}`);
    console.log(`  统计卡片: ${report.statsCards} 个`);
    console.log(`  AI功能模块: ${report.aiModules} 个`);
    console.log(`  控制台消息: ${report.consoleMessages.length} 条`);
    console.log(`  页面错误: ${report.pageErrors.length} 条`);
    console.log(`  模块测试: ${report.summary.successfulModules}/${report.summary.totalModules} 成功`);

    // 打印模块测试详情
    console.log('\n🔧 模块测试详情:');
    report.moduleTests.forEach(result => {
      const status = result.success ? '✅' : result.found ? '⚠️' : '❌';
      console.log(`  ${status} ${result.name}: ${result.error || '正常'}`);
    });

    // 保存报告到文件
    const fs = require('fs');
    const reportPath = 'docs/浏览器检查/ai-center-verification-report.json';

    // 确保目录存在
    if (!fs.existsSync('docs/浏览器检查')) {
      fs.mkdirSync('docs/浏览器检查', { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存至: ${reportPath}`);
  })
  .catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  });