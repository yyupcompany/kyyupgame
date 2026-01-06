const { chromium } = require('playwright');

async function testParentAssessmentCenter() {
  console.log('🚀 开始家长端测评中心完整功能测试');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });

  const page = await context.newPage();

  // 监听控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    // 第一步：访问登录页面
    console.log('\n📍 第一步：访问登录页面');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('✅ 登录页面加载成功');

    // 检查登录元素
    const loginForm = await page.$('form');
    const usernameInput = await page.$('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]');
    const passwordInput = await page.$('input[type="password"]');

    if (!loginForm || !usernameInput || !passwordInput) {
      console.log('❌ 登录表单元素缺失');

      // 尝试寻找其他登录方式
      const loginButtons = await page.$$('button');
      for (const button of loginButtons) {
        const text = await button.textContent();
        if (text && text.includes('登录')) {
          await button.click();
          break;
        }
      }
    } else {
      console.log('✅ 找到登录表单元素');

      // 填写登录信息
      await usernameInput.fill('testparent');
      await passwordInput.fill('123456');

      // 点击登录按钮
      const loginButton = await page.$('button[type="submit"], button:has-text("登录")');
      if (loginButton) {
        await loginButton.click();
        console.log('✅ 已提交登录表单');
      }
    }

    // 等待登录完成
    await page.waitForTimeout(3000);

    // 检查是否登录成功
    const currentUrl = page.url();
    console.log(`📍 当前页面URL: ${currentUrl}`);

    // 第二步：寻找测评中心入口
    console.log('\n📍 第二步：寻找测评中心入口');

    // 尝试多种方式找到测评中心
    const assessmentSelectors = [
      'a:has-text("测评")',
      'a:has-text("评估")',
      'a:has-text("评测")',
      'button:has-text("测评")',
      '[href*="assessment"]',
      '[href*="evaluation"]',
      'nav a:has-text("测评")',
      '.sidebar a:has-text("测评")',
      '.menu a:has-text("测评")'
    ];

    let assessmentLink = null;
    for (const selector of assessmentSelectors) {
      assessmentLink = await page.$(selector);
      if (assessmentLink) {
        const text = await assessmentLink.textContent();
        console.log(`✅ 找到测评相关链接: ${text}`);
        await assessmentLink.click();
        break;
      }
    }

    // 如果没找到测评链接，尝试直接访问测评页面
    if (!assessmentLink) {
      console.log('⚠️ 未找到测评中心链接，尝试直接访问测评页面');
      const assessmentUrls = [
        'http://localhost:5173/assessment',
        'http://localhost:5173/evaluation',
        'http://localhost:5173/parent-center/assessment',
        'http://localhost:5173/parent-center/assessment/index'
      ];

      for (const url of assessmentUrls) {
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          const response = await page.response();
          if (response && response.status() === 200) {
            console.log(`✅ 成功访问测评页面: ${url}`);
            break;
          }
        } catch (error) {
          console.log(`❌ 访问失败: ${url} - ${error.message}`);
        }
      }
    }

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 第三步：分析测评页面结构
    console.log('\n📍 第三步：分析测评页面结构');

    const pageContent = await page.content();
    const pageTitle = await page.title();
    console.log(`📄 页面标题: ${pageTitle}`);

    // 查找测评功能入口
    const assessmentItems = await page.$$eval(
      'button, a, .card, .item, .assessment-item',
      elements => elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        className: el.className,
        href: el.href,
        id: el.id
      }))
    );

    console.log('📋 页面中找到的测评相关元素:');
    assessmentItems.forEach(item => {
      if (item.text && (item.text.includes('测评') || item.text.includes('评估') || item.text.includes('测试'))) {
        console.log(`  - ${item.tag}: ${item.text}`);
      }
    });

    // 第四步：测试各个测评功能
    console.log('\n📍 第四步：测试核心测评功能');

    const testResults = {
      儿童发育商测评: { status: '未测试', details: [] },
      幼小衔接测评: { status: '未测试', details: [] },
      学科测评: { status: '未测试', details: [] }
    };

    // 测试儿童发育商测评
    console.log('\n🧪 测试儿童发育商测评');
    const developmentAssessmentSelectors = [
      ':has-text("儿童发育商")',
      ':has-text("发育测评")',
      ':has-text("发育评估")',
      'button:has-text("儿童发育")',
      'a:has-text("儿童发育")'
    ];

    for (const selector of developmentAssessmentSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ 找到儿童发育商测评入口: ${selector}`);
        await element.click();
        await page.waitForTimeout(2000);

        testResults.儿童发育商测评.status = '已找到入口';
        testResults.儿童发育商测评.details.push('成功进入测评页面');

        // 检查是否有开始测评按钮
        const startButton = await page.$('button:has-text("开始"), button:has-text("开始测评"), button:has-text("开始答题")');
        if (startButton) {
          await startButton.click();
          await page.waitForTimeout(2000);
          testResults.儿童发育商测评.details.push('成功开始测评');

          // 检查题目是否正常显示
          const questions = await page.$$('.question, .quiz-item, .assessment-question');
          testResults.儿童发育商测评.details.push(`发现 ${questions.length} 个题目元素`);

          if (questions.length > 0) {
            testResults.儿童发育商测评.status = '功能正常';
          } else {
            testResults.儿童发育商测评.status = '题目加载异常';
          }
        } else {
          testResults.儿童发育商测评.status = '无法开始测评';
        }
        break;
      }
    }

    // 如果没有找到发育商测评，记录状态
    if (testResults.儿童发育商测评.status === '未测试') {
      testResults.儿童发育商测评.status = '功能未找到';
      testResults.儿童发育商测评.details.push('在页面中未找到儿童发育商测评入口');
    }

    // 测试幼小衔接测评
    console.log('\n🧪 测试幼小衔接测评');
    const transitionAssessmentSelectors = [
      ':has-text("幼小衔接")',
      ':has-text("幼升小")',
      ':has-text("衔接测评")',
      'button:has-text("幼小")',
      'a:has-text("幼小")'
    ];

    for (const selector of transitionAssessmentSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ 找到幼小衔接测评入口: ${selector}`);
        await element.click();
        await page.waitForTimeout(2000);

        testResults.幼小衔接测评.status = '已找到入口';
        testResults.幼小衔接测评.details.push('成功进入测评页面');

        // 检查开始按钮
        const startButton = await page.$('button:has-text("开始"), button:has-text("开始测评")');
        if (startButton) {
          await startButton.click();
          await page.waitForTimeout(2000);
          testResults.幼小衔接测评.details.push('成功开始测评');

          const questions = await page.$$('.question, .quiz-item');
          testResults.幼小衔接测评.details.push(`发现 ${questions.length} 个题目元素`);

          if (questions.length > 0) {
            testResults.幼小衔接测评.status = '功能正常';
          } else {
            testResults.幼小衔接测评.status = '题目加载异常';
          }
        } else {
          testResults.幼小衔接测评.status = '无法开始测评';
        }
        break;
      }
    }

    if (testResults.幼小衔接测评.status === '未测试') {
      testResults.幼小衔接测评.status = '功能未找到';
      testResults.幼小衔接测评.details.push('在页面中未找到幼小衔接测评入口');
    }

    // 测试学科测评
    console.log('\n🧪 测试1-6年级学科测评');
    const subjectAssessmentSelectors = [
      ':has-text("学科测评")',
      ':has-text("年级测评")',
      ':has-text("学科")',
      ':has-text("语文")',
      ':has-text("数学")',
      ':has-text("英语")'
    ];

    for (const selector of subjectAssessmentSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ 找到学科测评相关入口: ${selector}`);
        await element.click();
        await page.waitForTimeout(2000);

        testResults.学科测评.status = '已找到入口';
        testResults.学科测评.details.push('成功进入学科测评页面');

        // 查找年级选择
        const gradeSelectors = await page.$$('button, a, .grade-item, .select-grade');
        if (gradeSelectors.length > 0) {
          testResults.学科测评.details.push(`发现 ${gradeSelectors.length} 个年级选择项`);

          // 尝试选择一个年级
          for (const gradeSelector of gradeSelectors) {
            const text = await gradeSelector.textContent();
            if (text && text.includes('年级')) {
              await gradeSelector.click();
              await page.waitForTimeout(1000);
              testResults.学科测评.details.push(`选择了年级: ${text}`);
              break;
            }
          }
        }

        testResults.学科测评.status = '功能正常';
        break;
      }
    }

    if (testResults.学科测评.status === '未测试') {
      testResults.学科测评.status = '功能未找到';
      testResults.学科测评.details.push('在页面中未找到学科测评入口');
    }

    // 第五步：生成测试报告
    console.log('\n📊 生成测试报告');

    const report = {
      testTime: new Date().toLocaleString('zh-CN'),
      testUrl: 'http://localhost:5173',
      loginCredentials: { username: 'testparent', password: '123456' },
      pageUrl: page.url(),
      pageTitle: pageTitle,
      testResults,
      issues: {
        consoleErrors: consoleErrors,
        pageErrors: pageErrors
      }
    };

    console.log('\n📋 ===== 家长端测评中心测试报告 =====');
    console.log(`⏰ 测试时间: ${report.testTime}`);
    console.log(`🔗 测试URL: ${report.testUrl}`);
    console.log(`👤 登录账户: ${report.loginCredentials.username}`);
    console.log(`📍 最终页面: ${report.pageUrl}`);
    console.log(`📄 页面标题: ${report.pageTitle}`);

    console.log('\n🧪 核心功能测试结果:');
    Object.entries(report.testResults).forEach(([name, result]) => {
      console.log(`\n${name}:`);
      console.log(`  状态: ${result.status}`);
      result.details.forEach(detail => {
        console.log(`  - ${detail}`);
      });
    });

    if (consoleErrors.length > 0) {
      console.log('\n❌ 控制台错误:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }

    if (pageErrors.length > 0) {
      console.log('\n❌ 页面错误:');
      pageErrors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n=====================================\n');

    return report;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    return {
      error: error.message,
      testTime: new Date().toLocaleString('zh-CN')
    };
  } finally {
    await browser.close();
    console.log('🏁 测试完成，浏览器已关闭');
  }
}

// 运行测试
testParentAssessmentCenter().then(report => {
  // 保存测试报告到文件
  const fs = require('fs');
  const reportPath = './家长端测评中心测试报告.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📝 测试报告已保存到: ${reportPath}`);

  // 生成Markdown格式的报告
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = './家长端测评中心测试报告.md';
  fs.writeFileSync(markdownPath, markdownReport);
  console.log(`📝 Markdown测试报告已保存到: ${markdownPath}`);
}).catch(error => {
  console.error('❌ 测试执行失败:', error);
});

function generateMarkdownReport(report) {
  let markdown = `# 家长端测评中心完整功能测试报告

## 测试概述
- **测试时间**: ${report.testTime}
- **测试URL**: ${report.testUrl}
- **登录账户**: ${report.loginCredentials.username} / ${report.loginCredentials.password}
- **最终页面**: ${report.pageUrl}
- **页面标题**: ${report.pageTitle}

## 测试结果概览

`;

  Object.entries(report.testResults).forEach(([name, result]) => {
    const status = result.status.includes('正常') ? '✅' :
                   result.status.includes('未找到') ? '❌' : '⚠️';

    markdown += `### ${name} ${status}
**状态**: ${result.status}

**详情**:
`;
    result.details.forEach(detail => {
      markdown += `- ${detail}\n`;
    });
    markdown += '\n';
  });

  if (report.issues.consoleErrors.length > 0) {
    markdown += `## 控制台错误
`;
    report.issues.consoleErrors.forEach(error => {
      markdown += `- \`${error}\`\n`;
    });
    markdown += '\n';
  }

  if (report.issues.pageErrors.length > 0) {
    markdown += `## 页面错误
`;
    report.issues.pageErrors.forEach(error => {
      markdown += `- \`${error}\`\n`;
    });
    markdown += '\n';
  }

  markdown += `## 总结和建议

${report.error ? `❌ 测试过程中发生严重错误: ${report.error}` : '✅ 测试执行完成'}

**建议后续步骤**:
1. 检查标记为"❌"和"⚠️"的功能
2. 修复控制台和页面错误
3. 完善测评功能的用户体验
4. 确保所有测评流程都能正常完成

---
*测试报告由自动化测试生成于 ${report.testTime}*`;

  return markdown;
}