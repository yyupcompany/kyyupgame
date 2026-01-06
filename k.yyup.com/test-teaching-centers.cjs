const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testTeachingCenterPages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
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

  const pagesToTest = [
    {
      name: '教学中心主页',
      url: 'http://localhost:5173/centers',
      filename: 'teaching-center-home'
    },
    {
      name: '人事中心',
      url: 'http://localhost:5173/centers/personnel',
      filename: 'personnel-center'
    },
    {
      name: '活动中心',
      url: 'http://localhost:5173/centers/activity',
      filename: 'activity-center'
    },
    {
      name: '招生中心',
      url: 'http://localhost:5173/centers/enrollment',
      filename: 'enrollment-center'
    },
    {
      name: '营销中心',
      url: 'http://localhost:5173/centers/marketing',
      filename: 'marketing-center'
    },
    {
      name: 'AI中心',
      url: 'http://localhost:5173/centers/ai',
      filename: 'ai-center'
    },
    {
      name: '系统中心',
      url: 'http://localhost:5173/centers/system',
      filename: 'system-center'
    }
  ];

  const results = [];

  for (const pageInfo of pagesToTest) {
    console.log(`\n🧪 开始测试: ${pageInfo.name}`);
    console.log(`📍 URL: ${pageInfo.url}`);

    try {
      // 访问页面
      const response = await page.goto(pageInfo.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 等待页面加载
      await page.waitForTimeout(2000);

      // 检查HTTP状态
      const httpStatus = response.status();

      // 检查页面标题
      const title = await page.title();

      // 检查主要内容区域
      let mainContentExists = false;
      let sidebarExists = false;
      let statCardsCount = 0;
      let navigationLinksCount = 0;

      try {
        // 检查主要内容区域
        const mainContent = await page.$('.main-content, main, .page-content, .container');
        mainContentExists = !!mainContent;

        // 检查侧边栏
        const sidebar = await page.$('.sidebar, .side-bar, aside, .nav-menu');
        sidebarExists = !!sidebar;

        // 统计卡片数量
        const statCards = await page.$$('[class*="stat"], [class*="card"], [class*="metric"]');
        statCardsCount = statCards.length;

        // 导航链接数量
        const navLinks = await page.$$('a[href*="/centers/"], nav a, .nav a');
        navigationLinksCount = navLinks.length;

      } catch (error) {
        console.log(`⚠️  DOM检查时出现问题: ${error.message}`);
      }

      // 清空之前页面的控制台消息
      const currentConsoleMessages = [...consoleMessages];
      const currentPageErrors = [...pageErrors];

      // 截图
      const screenshotPath = `test-files/${pageInfo.filename}-${Date.now()}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      // 检查是否有错误信息显示在页面上
      let hasVisibleError = false;
      let errorText = '';
      try {
        const errorElements = await page.$$('.error, .alert-danger, .message-error, [class*="error"]');
        for (const element of errorElements) {
          const text = await element.textContent();
          if (text && text.trim()) {
            hasVisibleError = true;
            errorText = text.trim();
            break;
          }
        }
      } catch (error) {
        // 忽略查找错误时的错误
      }

      const result = {
        page: pageInfo.name,
        url: pageInfo.url,
        success: httpStatus === 200,
        httpStatus,
        title,
        mainContentExists,
        sidebarExists,
        statCardsCount,
        navigationLinksCount,
        hasVisibleError,
        errorText,
        consoleErrors: currentConsoleMessages.filter(msg => msg.type === 'error'),
        consoleWarnings: currentConsoleMessages.filter(msg => msg.type === 'warning'),
        pageErrors: currentPageErrors,
        screenshotPath
      };

      results.push(result);

      console.log(`✅ 状态: ${result.success ? '成功' : '失败'} (${httpStatus})`);
      console.log(`📋 标题: ${title}`);
      console.log(`🎯 主内容区域: ${mainContentExists ? '存在' : '不存在'}`);
      console.log(`📱 侧边栏: ${sidebarExists ? '存在' : '不存在'}`);
      console.log(`📊 统计卡片: ${statCardsCount}个`);
      console.log(`🔗 导航链接: ${navigationLinksCount}个`);
      console.log(`🐛 控制台错误: ${result.consoleErrors.length}个`);
      console.log(`⚠️  控制台警告: ${result.consoleWarnings.length}个`);
      console.log(`📸 截图已保存: ${screenshotPath}`);

      if (hasVisibleError) {
        console.log(`❌ 页面显示错误: ${errorText}`);
      }

      // 如果有侧边栏，测试开关功能
      if (sidebarExists) {
        try {
          console.log(`🧪 测试侧边栏开关功能...`);

          // 尝试找到侧边栏切换按钮
          const toggleButtons = await page.$$('[class*="toggle"], [class*="menu"], button[aria-label*="menu"], .hamburger');

          if (toggleButtons.length > 0) {
            await toggleButtons[0].click();
            await page.waitForTimeout(500);
            console.log(`✅ 侧边栏切换按钮点击成功`);

            // 再次点击恢复
            await toggleButtons[0].click();
            await page.waitForTimeout(500);
            console.log(`✅ 侧边栏状态恢复成功`);
          } else {
            console.log(`⚠️  未找到侧边栏切换按钮`);
          }
        } catch (error) {
          console.log(`❌ 侧边栏测试失败: ${error.message}`);
        }
      }

    } catch (error) {
      const errorResult = {
        page: pageInfo.name,
        url: pageInfo.url,
        success: false,
        error: error.message,
        screenshotPath: `test-files/${pageInfo.filename}-error-${Date.now()}.png`
      };

      try {
        await page.screenshot({ path: errorResult.screenshotPath });
      } catch (screenshotError) {
        console.log(`截图失败: ${screenshotError.message}`);
      }

      results.push(errorResult);
      console.log(`❌ 测试失败: ${error.message}`);
    }

    // 清空控制台消息，为下一个页面做准备
    consoleMessages.length = 0;
    pageErrors.length = 0;

    // 等待一段时间再测试下一个页面
    await page.waitForTimeout(1000);
  }

  await browser.close();

  // 保存测试结果
  const reportPath = `test-files/teaching-centers-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log(`\n📋 测试完成！报告已保存到: ${reportPath}`);

  // 生成汇总报告
  generateSummaryReport(results);
}

function generateSummaryReport(results) {
  console.log(`\n📊 教学中心页面测试汇总报告`);
  console.log(`=` * 60);

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.length - successCount;

  console.log(`✅ 成功页面: ${successCount}/${results.length}`);
  console.log(`❌ 失败页面: ${errorCount}/${results.length}`);
  console.log(`📈 成功率: ${((successCount / results.length) * 100).toFixed(1)}%`);

  console.log(`\n📋 详细结果:`);
  results.forEach(result => {
    console.log(`\n🌐 ${result.page}`);
    console.log(`   状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`   URL: ${result.url}`);

    if (result.success) {
      console.log(`   HTTP状态: ${result.httpStatus}`);
      console.log(`   主内容: ${result.mainContentExists ? '✅' : '❌'}`);
      console.log(`   侧边栏: ${result.sidebarExists ? '✅' : '❌'}`);
      console.log(`   统计卡片: ${result.statCardsCount}个`);
      console.log(`   控制台错误: ${result.consoleErrors.length}个`);

      if (result.hasVisibleError) {
        console.log(`   页面错误: ${result.errorText}`);
      }
    } else {
      console.log(`   错误: ${result.error}`);
    }
  });

  // 生成Markdown报告
  const markdownReport = generateMarkdownReport(results);
  const reportPath = `test-files/teaching-centers-test-report-${Date.now()}.md`;
  fs.writeFileSync(reportPath, markdownReport);
  console.log(`\n📝 Markdown报告已保存到: ${reportPath}`);
}

function generateMarkdownReport(results) {
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.length - successCount;

  let markdown = `# 教学中心页面功能测试报告\n\n`;
  markdown += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  markdown += `## 测试汇总\n\n`;
  markdown += `- **总页面数**: ${results.length}\n`;
  markdown += `- **成功页面**: ${successCount} ✅\n`;
  markdown += `- **失败页面**: ${errorCount} ❌\n`;
  markdown += `- **成功率**: ${((successCount / results.length) * 100).toFixed(1)}%\n\n`;

  markdown += `## 详细测试结果\n\n`;

  results.forEach(result => {
    markdown += `### ${result.page}\n\n`;
    markdown += `**URL**: ${result.url}\n\n`;

    if (result.success) {
      markdown += `- **状态**: ✅ 成功\n`;
      markdown += `- **HTTP状态**: ${result.httpStatus}\n`;
      markdown += `- **页面标题**: ${result.title}\n`;
      markdown += `- **主内容区域**: ${result.mainContentExists ? '✅ 存在' : '❌ 不存在'}\n`;
      markdown += `- **侧边栏**: ${result.sidebarExists ? '✅ 存在' : '❌ 不存在'}\n`;
      markdown += `- **统计卡片数量**: ${result.statCardsCount}\n`;
      markdown += `- **导航链接数量**: ${result.navigationLinksCount}\n`;
      markdown += `- **控制台错误**: ${result.consoleErrors.length}个\n`;
      markdown += `- **控制台警告**: ${result.consoleWarnings.length}个\n`;

      if (result.hasVisibleError) {
        markdown += `- **页面错误**: ❌ ${result.errorText}\n`;
      }

      if (result.consoleErrors.length > 0) {
        markdown += `\n**控制台错误详情**:\n`;
        result.consoleErrors.forEach((error, index) => {
          markdown += `${index + 1}. ${error.text}\n`;
        });
      }
    } else {
      markdown += `- **状态**: ❌ 失败\n`;
      markdown += `- **错误信息**: ${result.error}\n`;
    }

    markdown += `\n`;
  });

  return markdown;
}

// 确保test-files目录存在
if (!fs.existsSync('test-files')) {
  fs.mkdirSync('test-files');
}

// 运行测试
testTeachingCenterPages().catch(console.error);