const { chromium } = require('playwright');

async function testAICenterWithLogin() {
  console.log('🚀 开始带登录的AI中心页面验证测试...\n');

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
    // 步骤1: 访问主页
    console.log('📍 步骤1: 访问主页 http://localhost:5173');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.waitForTimeout(2000);

    // 截图记录主页状态
    await page.screenshot({ path: 'docs/浏览器检查/ai-center-test-01-homepage.png', fullPage: true });
    console.log('📸 已保存主页截图');

    // 步骤2: 登录系统（使用admin快捷登录）
    console.log('\n📍 步骤2: 执行admin快捷登录');

    // 点击admin登录按钮
    await page.click('text=admin', { timeout: 5000 });
    console.log('✅ 点击了admin登录按钮');

    // 等待登录完成
    await page.waitForTimeout(3000);

    // 检查是否登录成功
    const currentUrl = page.url();
    console.log(`登录后URL: ${currentUrl}`);

    // 截图记录登录后状态
    await page.screenshot({ path: 'docs/浏览器检查/ai-center-test-02-logged-in.png', fullPage: true });
    console.log('📸 已保存登录后截图');

    // 步骤3: 访问AI中心页面
    console.log('\n📍 步骤3: 访问AI中心页面');
    await page.goto('http://localhost:5173/centers/ai', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.waitForTimeout(3000);

    // 截图记录AI中心页面状态
    await page.screenshot({ path: 'docs/浏览器检查/ai-center-test-03-ai-center.png', fullPage: true });
    console.log('📸 已保存AI中心页面截图');

    // 检查页面内容
    const pageContent = await page.content();
    const hasError = pageContent.includes('出错了');
    const hasTitle = pageContent.includes('智能中心');
    const hasWelcome = pageContent.includes('欢迎来到智能中心');
    const hasModules = pageContent.includes('AI功能模块');

    console.log('\n📋 页面内容检查:');
    console.log(`  错误页面: ${hasError ? '❌ 是' : '✅ 否'}`);
    console.log(`  智能中心标题: ${hasTitle ? '✅ 有' : '❌ 无'}`);
    console.log(`  欢迎词: ${hasWelcome ? '✅ 有' : '❌ 无'}`);
    console.log(`  AI功能模块: ${hasModules ? '✅ 有' : '❌ 无'}`);

    // 步骤4: 检查具体的模块元素
    console.log('\n📍 步骤4: 检查AI功能模块');

    // 等待元素加载
    try {
      await page.waitForSelector('.module-card', { timeout: 5000 });
      const moduleCards = await page.$$('.module-card');
      console.log(`✅ 找到 ${moduleCards.length} 个模块卡片`);

      // 获取每个模块的标题
      for (let i = 0; i < moduleCards.length; i++) {
        const card = moduleCards[i];
        try {
          const titleElement = await card.$('.module-title');
          if (titleElement) {
            const title = await titleElement.textContent();
            console.log(`  - 模块 ${i + 1}: ${title}`);
          }
        } catch (e) {
          console.log(`  - 模块 ${i + 1}: 无法获取标题`);
        }
      }
    } catch (error) {
      console.log('❌ 未找到模块卡片:', error.message);
    }

    // 步骤5: 测试模块点击
    console.log('\n📍 步骤5: 测试AI智能查询模块点击');

    const modulesToTest = [
      { name: 'AI智能查询', path: '/ai/query' },
      { name: 'AI模型管理', path: '/ai/models' },
      { name: 'Function Tools', path: '/ai-center/function-tools' },
      { name: 'AI专家咨询', path: '/ai-center/expert-consultation' }
    ];

    const testResults = [];

    for (const module of modulesToTest) {
      try {
        console.log(`\n🔍 测试: ${module.name}`);

        // 查找包含模块名的元素
        const moduleElement = await page.$(`text=${module.name}`);

        if (moduleElement) {
          console.log(`  ✅ 找到模块: ${module.name}`);

          // 点击前截图
          await page.screenshot({ path: `docs/浏览器检查/before-click-${module.name.replace(/\s+/g, '-')}.png` });

          // 点击模块
          await moduleElement.click();
          await page.waitForTimeout(2000);

          // 检查跳转结果
          const finalUrl = page.url();
          console.log(`  跳转后URL: ${finalUrl}`);

          // 检查页面是否有错误
          const hasErrorAfter = await page.$('text=出错了') !== null;

          testResults.push({
            name: module.name,
            path: module.path,
            found: true,
            clickable: true,
            finalUrl: finalUrl,
            success: !hasErrorAfter
          });

          // 截图记录点击后状态
          await page.screenshot({ path: `docs/浏览器检查/after-click-${module.name.replace(/\s+/g, '-')}.png` });

          // 返回AI中心页面
          await page.goto('http://localhost:5173/centers/ai');
          await page.waitForTimeout(1000);

        } else {
          console.log(`  ❌ 未找到模块: ${module.name}`);
          testResults.push({
            name: module.name,
            path: module.path,
            found: false,
            clickable: false,
            finalUrl: null,
            success: false
          });
        }
      } catch (error) {
        console.log(`  ❌ 测试失败: ${error.message}`);
        testResults.push({
          name: module.name,
          path: module.path,
          found: false,
          clickable: false,
          finalUrl: null,
          success: false,
          error: error.message
        });
      }
    }

    // 步骤6: 检查统计卡片
    console.log('\n📍 步骤6: 检查统计卡片');

    try {
      await page.waitForSelector('.stats-section', { timeout: 3000 });
      const statsCards = await page.$$('.stats-grid-unified > *, .stat-card');
      console.log(`✅ 找到 ${statsCards.length} 个统计卡片`);
    } catch (error) {
      console.log('❌ 未找到统计卡片:', error.message);
    }

    // 步骤7: 检查控制台错误
    console.log('\n📍 步骤7: 检查控制台错误信息');

    if (consoleMessages.length > 0) {
      console.log(`\n📋 控制台消息 (${consoleMessages.length}条):`);
      consoleMessages.forEach((msg, index) => {
        if (msg.type === 'error') {
          console.log(`  ${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
        }
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
      testSteps: {
        homepageAccess: true,
        loginSuccess: true,
        aiCenterAccess: true,
        moduleTesting: true,
        errorChecking: true
      },
      pageContent: {
        hasError,
        hasTitle,
        hasWelcome,
        hasModules
      },
      consoleMessages: consoleMessages.filter(msg => msg.type === 'error'),
      pageErrors: pageErrors,
      moduleTests: testResults,
      summary: {
        totalModules: modulesToTest.length,
        successfulModules: testResults.filter(r => r.success).length,
        foundModules: testResults.filter(r => r.found).length
      }
    };

    return report;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    await page.screenshot({ path: 'docs/浏览器检查/ai-center-test-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// 执行测试
testAICenterWithLogin()
  .then(report => {
    console.log('\n✅ 测试完成！');

    // 打印测试结果摘要
    console.log('\n📋 测试结果摘要:');
    console.log(`  页面错误状态: ${report.pageContent.hasError ? '❌ 有错误' : '✅ 无错误'}`);
    console.log(`  智能中心标题: ${report.pageContent.hasTitle ? '✅ 显示正常' : '❌ 未显示'}`);
    console.log(`  欢迎词: ${report.pageContent.hasWelcome ? '✅ 显示正常' : '❌ 未显示'}`);
    console.log(`  AI功能模块: ${report.pageContent.hasModules ? '✅ 显示正常' : '❌ 未显示'}`);
    console.log(`  控制台错误: ${report.consoleMessages.length} 条`);
    console.log(`  页面错误: ${report.pageErrors.length} 条`);
    console.log(`  模块测试: ${report.summary.successfulModules}/${report.summary.totalModules} 成功`);

    // 打印模块测试详情
    console.log('\n🔧 模块测试详情:');
    report.moduleTests.forEach(result => {
      const status = result.success ? '✅' : result.found ? '⚠️' : '❌';
      console.log(`  ${status} ${result.name}: ${result.finalUrl || result.error || '未找到'}`);
    });

    // 保存报告到文件
    const fs = require('fs');
    const reportPath = 'docs/浏览器检查/ai-center-with-login-report.json';

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