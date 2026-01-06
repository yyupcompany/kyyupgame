const { chromium } = require('playwright');

async function testAICenterFinal() {
  console.log('🚀 AI中心页面最终验证测试...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
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
    console.log('📍 步骤1: 访问主页');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.waitForTimeout(2000);

    // 截图主页状态
    await page.screenshot({ path: 'docs/浏览器检查/final-test-01-homepage.png', fullPage: true });

    // 步骤2: 使用快捷登录按钮登录
    console.log('\n📍 步骤2: 使用admin快捷登录');

    // 点击admin快捷登录按钮
    try {
      await page.click('.admin-btn', { timeout: 10000 });
      console.log('✅ 点击了admin快捷登录按钮');
    } catch (error) {
      console.log('❌ 无法点击admin按钮，尝试其他方式...');
      // 尝试通过文本查找
      await page.click('button:has-text("系统管理员")', { timeout: 5000 });
      console.log('✅ 点击了系统管理员按钮');
    }

    // 等待登录完成
    await page.waitForTimeout(3000);

    // 检查是否登录成功
    const currentUrl = page.url();
    console.log(`登录后URL: ${currentUrl}`);

    // 截图登录后状态
    await page.screenshot({ path: 'docs/浏览器检查/final-test-02-logged-in.png', fullPage: true });

    // 步骤3: 直接访问AI中心页面
    console.log('\n📍 步骤3: 访问AI中心页面');
    await page.goto('http://localhost:5173/centers/ai', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    await page.waitForTimeout(5000); // 增加等待时间让页面完全加载

    // 截图AI中心页面
    await page.screenshot({ path: 'docs/浏览器检查/final-test-03-ai-center.png', fullPage: true });
    console.log('📸 已保存AI中心页面截图');

    // 步骤4: 检查页面内容
    console.log('\n📍 步骤4: 检查页面内容');

    const pageContent = await page.content();
    const contentChecks = {
      hasError: pageContent.includes('出错了'),
      hasIntelligentCenter: pageContent.includes('智能中心'),
      hasWelcome: pageContent.includes('欢迎来到智能中心'),
      hasModules: pageContent.includes('AI功能模块'),
      hasModuleCards: pageContent.includes('module-card'),
      hasStats: pageContent.includes('统计'),
      hasGrid: pageContent.includes('modules-grid')
    };

    console.log('\n📋 页面内容检查结果:');
    console.log(`  错误页面: ${contentChecks.hasError ? '❌ 有' : '✅ 无'}`);
    console.log(`  智能中心标题: ${contentChecks.hasIntelligentCenter ? '✅ 有' : '❌ 无'}`);
    console.log(`  欢迎词: ${contentChecks.hasWelcome ? '✅ 有' : '❌ 无'}`);
    console.log(`  AI功能模块标题: ${contentChecks.hasModules ? '✅ 有' : '❌ 无'}`);
    console.log(`  模块卡片: ${contentChecks.hasModuleCards ? '✅ 有' : '❌ 无'}`);
    console.log(`  统计区域: ${contentChecks.hasStats ? '✅ 有' : '❌ 无'}`);
    console.log(`  网格布局: ${contentChecks.hasGrid ? '✅ 有' : '❌ 无'}`);

    // 步骤5: 查找并分析模块卡片
    console.log('\n📍 步骤5: 分析模块卡片');

    try {
      // 等待模块卡片加载
      await page.waitForSelector('.module-card', { timeout: 10000 });
      const moduleCards = await page.$$('.module-card');
      console.log(`✅ 找到 ${moduleCards.length} 个模块卡片`);

      if (moduleCards.length > 0) {
        console.log('\n🔧 模块详情:');
        for (let i = 0; i < Math.min(moduleCards.length, 9); i++) {
          try {
            const card = moduleCards[i];

            // 获取模块标题
            const titleElement = await card.$('.module-title');
            const title = titleElement ? await titleElement.textContent() : '未知';

            // 获取模块描述
            const descElement = await card.$('.module-description');
            const description = descElement ? await descElement.textContent().trim().substring(0, 50) + '...' : '无描述';

            // 获取模块图标
            const iconElement = await card.$('.module-icon');
            const icon = iconElement ? await iconElement.textContent() : '📦';

            console.log(`  ${i + 1}. ${icon} ${title}`);
            console.log(`     描述: ${description}`);
          } catch (e) {
            console.log(`  ${i + 1}. 无法获取模块信息`);
          }
        }
      }
    } catch (error) {
      console.log('❌ 未找到模块卡片:', error.message);

      // 尝试查找其他可能的元素
      const allDivs = await page.$$eval('div', divs =>
        divs.filter(div =>
          div.textContent &&
          (div.textContent.includes('AI') || div.textContent.includes('查询') || div.textContent.includes('管理'))
        ).slice(0, 10)
      );
      console.log(`尝试查找包含AI相关文本的元素: ${allDivs.length} 个`);
    }

    // 步骤6: 测试模块点击功能
    console.log('\n📍 步骤6: 测试模块点击功能');

    const modulesToTest = [
      'AI智能查询',
      'AI模型管理',
      'Function Tools',
      'AI专家咨询',
      'AI数据分析',
      'AI自动化',
      'AI预测分析',
      'AI性能监控',
      'AI自动配图'
    ];

    const testResults = [];

    for (const moduleName of modulesToTest) {
      try {
        console.log(`\n🔍 测试模块: ${moduleName}`);

        // 查找包含模块名的元素
        const moduleElement = await page.$(`text=${moduleName}`);

        if (moduleElement) {
          console.log(`  ✅ 找到模块: ${moduleName}`);

          // 记录当前URL
          const beforeUrl = page.url();

          // 点击模块
          await moduleElement.click();
          await page.waitForTimeout(2000);

          // 检查跳转结果
          const afterUrl = page.url();
          const navigated = beforeUrl !== afterUrl;

          // 检查页面是否有错误
          const hasErrorAfter = await page.$('text=出错了') !== null;

          testResults.push({
            name: moduleName,
            found: true,
            clicked: true,
            navigated,
            beforeUrl,
            afterUrl,
            success: navigated && !hasErrorAfter
          });

          console.log(`  跳转: ${navigated ? '✅ 成功' : '❌ 失败'}`);
          console.log(`  目标URL: ${afterUrl}`);

          // 如果成功导航，截图并返回
          if (navigated && !hasErrorAfter) {
            await page.screenshot({ path: `docs/浏览器检查/module-${moduleName.replace(/\s+/g, '-')}.png`, fullPage: true });
          }

          // 返回AI中心页面继续测试其他模块
          await page.goto('http://localhost:5173/centers/ai');
          await page.waitForTimeout(1000);

        } else {
          console.log(`  ❌ 未找到模块: ${moduleName}`);
          testResults.push({
            name: moduleName,
            found: false,
            clicked: false,
            navigated: false,
            success: false
          });
        }
      } catch (error) {
        console.log(`  ❌ 测试失败: ${error.message}`);
        testResults.push({
          name: moduleName,
          found: false,
          clicked: false,
          navigated: false,
          success: false,
          error: error.message
        });
      }
    }

    // 步骤7: 检查统计卡片和API调用
    console.log('\n📍 步骤7: 检查统计数据加载');

    try {
      // 查找统计卡片
      await page.waitForSelector('.stats-section, .stat-card, [class*="stat"]', { timeout: 5000 });
      const statCards = await page.$$('.stats-grid-unified > *, .stat-card');
      console.log(`✅ 找到 ${statCards.length} 个统计卡片`);
    } catch (error) {
      console.log('❌ 未找到统计卡片:', error.message);
    }

    // 步骤8: 检查控制台和页面错误
    console.log('\n📍 步骤8: 检查错误信息');

    const errorMessages = consoleMessages.filter(msg => msg.type === 'error' || msg.type === 'warning');
    if (errorMessages.length > 0) {
      console.log(`\n⚠️ 控制台错误/警告 (${errorMessages.length}条):`);
      errorMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
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

    // 生成最终报告
    const finalReport = {
      timestamp: new Date().toISOString(),
      testUrl: 'http://localhost:5173/centers/ai',
      pageContent: contentChecks,
      moduleTests: testResults,
      errors: {
        consoleErrors: errorMessages,
        pageErrors: pageErrors
      },
      summary: {
        totalModules: modulesToTest.length,
        foundModules: testResults.filter(r => r.found).length,
        successfulModules: testResults.filter(r => r.success).length,
        hasPageErrors: contentChecks.hasError,
        hasConsoleErrors: errorMessages.length > 0
      }
    };

    return finalReport;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    await page.screenshot({ path: 'docs/浏览器检查/final-test-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// 执行测试
testAICenterFinal()
  .then(report => {
    console.log('\n✅ AI中心页面验证测试完成！');

    // 打印最终结果
    console.log('\n📋 最终验证结果:');
    console.log(`====================================`);
    console.log(`🔍 页面加载状态:`);
    console.log(`  错误页面: ${report.pageContent.hasError ? '❌ 仍有错误' : '✅ 修复成功'}`);
    console.log(`  智能中心标题: ${report.pageContent.hasIntelligentCenter ? '✅ 显示正常' : '❌ 未显示'}`);
    console.log(`  欢迎词: ${report.pageContent.hasWelcome ? '✅ 显示正常' : '❌ 未显示'}`);
    console.log(`  AI功能模块: ${report.pageContent.hasModules ? '✅ 显示正常' : '❌ 未显示'}`);
    console.log(`  模块卡片: ${report.pageContent.hasModuleCards ? '✅ 显示正常' : '❌ 未显示'}`);

    console.log(`\n🎯 功能测试结果:`);
    console.log(`  模块总数: ${report.summary.totalModules}`);
    console.log(`  发现模块: ${report.summary.foundModules}`);
    console.log(`  成功模块: ${report.summary.successfulModules}`);
    console.log(`  成功率: ${((report.summary.successfulModules / report.summary.totalModules) * 100).toFixed(1)}%`);

    console.log(`\n🐛 错误状态:`);
    console.log(`  控制台错误: ${report.errors.consoleErrors.length} 条`);
    console.log(`  页面错误: ${report.errors.pageErrors.length} 条`);

    // 打印详细模块测试结果
    console.log(`\n🔧 模块测试详情:`);
    report.moduleTests.forEach(result => {
      if (result.found) {
        const status = result.success ? '✅' : result.navigated ? '⚠️' : '❌';
        console.log(`  ${status} ${result.name}: ${result.navigated ? '可跳转' : '无法跳转'}`);
        if (result.afterUrl && result.afterUrl !== 'http://localhost:5173/centers/ai') {
          console.log(`      → ${result.afterUrl}`);
        }
      } else {
        console.log(`  ❌ ${result.name}: 未找到`);
      }
    });

    // 保存报告
    const fs = require('fs');
    const reportPath = 'docs/浏览器检查/ai-center-final-verification-report.json';

    if (!fs.existsSync('docs/浏览器检查')) {
      fs.mkdirSync('docs/浏览器检查', { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存至: ${reportPath}`);

    // 生成人类可读的报告
    const humanReadableReport = `# AI中心页面修复验证报告

## 测试时间
${new Date(report.timestamp).toLocaleString('zh-CN')}

## 页面加载状态
- **错误页面**: ${report.pageContent.hasError ? '❌ 仍有错误' : '✅ 修复成功'}
- **智能中心标题**: ${report.pageContent.hasIntelligentCenter ? '✅ 显示正常' : '❌ 未显示'}
- **欢迎词**: ${report.pageContent.hasWelcome ? '✅ 显示正常' : '❌ 未显示'}
- **AI功能模块**: ${report.pageContent.hasModules ? '✅ 显示正常' : '❌ 未显示'}
- **模块卡片**: ${report.pageContent.hasModuleCards ? '✅ 显示正常' : '❌ 未显示'}

## 功能测试结果
- **模块总数**: ${report.summary.totalModules}
- **发现模块**: ${report.summary.foundModules}
- **成功模块**: ${report.summary.successfulModules}
- **成功率**: ${((report.summary.successfulModules / report.summary.totalModules) * 100).toFixed(1)}%

## 模块测试详情
${report.moduleTests.map(result => {
  if (result.found) {
    const status = result.success ? '✅' : result.navigated ? '⚠️' : '❌';
    return `- ${status} ${result.name}: ${result.navigated ? '可跳转' : '无法跳转'}${result.afterUrl && result.afterUrl !== 'http://localhost:5173/centers/ai' ? ` (${result.afterUrl})` : ''}`;
  } else {
    return `- ❌ ${result.name}: 未找到`;
  }
}).join('\n')}

## 错误状态
- **控制台错误**: ${report.errors.consoleErrors.length} 条
- **页面错误**: ${report.errors.pageErrors.length} 条

${report.errors.consoleErrors.length > 0 ? `
### 控制台错误详情
${report.errors.consoleErrors.map((msg, index) => `${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`).join('\n')}
` : ''}

${report.errors.pageErrors.length > 0 ? `
### 页面错误详情
${report.errors.pageErrors.map((error, index) => `${index + 1}. ${error.message}`).join('\n')}
` : ''}

## 总结
${report.pageContent.hasError ?
  '❌ AI中心页面仍有"出错了"错误，需要进一步修复' :
  report.pageContent.hasModuleCards && report.summary.foundModules > 0 ?
  '✅ AI中心页面修复成功，功能模块可正常访问' :
  '⚠️ AI中心页面不再显示错误，但内容加载不完整'
}
`;

    const readableReportPath = 'docs/浏览器检查/AI中心页面修复验证报告.md';
    fs.writeFileSync(readableReportPath, humanReadableReport);
    console.log(`📋 可读性报告已保存至: ${readableReportPath}`);

  })
  .catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  });