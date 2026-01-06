const { chromium } = require('playwright');

async function runComprehensiveAssessmentTest() {
  console.log('🚀 开始家长端测评中心完整功能测试 - 全面版');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });

  const page = await context.newPage();

  // 监听控制台和页面错误
  const consoleErrors = [];
  const pageErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    }
  });

  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    });
  });

  try {
    const testResults = {
      testTime: new Date().toLocaleString('zh-CN'),
      testUrl: 'http://localhost:5173',
      loginStatus: 'pending',
      assessmentFeatures: {
        儿童发育商测评: { status: 'pending', details: [], issues: [] },
        幼小衔接测评: { status: 'pending', details: [], issues: [] },
        学科测评: { status: 'pending', details: [], issues: [] }
      },
      navigationIssues: [],
      technicalIssues: {
        consoleErrors: [],
        pageErrors: [],
        networkErrors: []
      }
    };

    // 第一步：登录测试
    console.log('\n📍 第一步：登录测试');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // 检查登录页面
    const loginPageTitle = await page.title();
    console.log(`📄 登录页面标题: ${loginPageTitle}`);

    // 尝试填写登录表单
    const usernameInput = await page.$('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]');
    const passwordInput = await page.$('input[type="password"]');

    if (usernameInput && passwordInput) {
      await usernameInput.fill('testparent');
      await passwordInput.fill('123456');

      // 点击登录按钮
      const loginButton = await page.$('button[type="submit"], button:has-text("登录"), .el-button--primary');
      if (loginButton) {
        await loginButton.click();
        await page.waitForTimeout(3000);
        testResults.loginStatus = 'success';
        console.log('✅ 登录成功');
      } else {
        testResults.loginStatus = 'login_button_not_found';
        testResults.navigationIssues.push('未找到登录按钮');
        console.log('❌ 未找到登录按钮');
      }
    } else {
      testResults.loginStatus = 'login_form_not_found';
      testResults.navigationIssues.push('未找到登录表单');
      console.log('❌ 未找到登录表单');
    }

    // 第二步：直接访问测评页面
    console.log('\n📍 第二步：访问测评页面');

    const assessmentUrls = [
      '/parent-center/assessment',
      '/parent-center/assessment/index',
      '/parent-center/assessment/start',
      '/parent-center/assessment/school-readiness',
      '/parent-center/assessment/academic'
    ];

    for (const urlPath of assessmentUrls) {
      const fullUrl = `http://localhost:5173${urlPath}`;
      try {
        console.log(`🔗 尝试访问: ${fullUrl}`);
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 10000 });

        const pageTitle = await page.title();
        const pageContent = await page.content();

        // 检查页面是否正常加载
        if (pageTitle.includes('页面不存在') || pageTitle.includes('404')) {
          console.log(`❌ 页面不存在: ${fullUrl}`);
          testResults.navigationIssues.push(`页面不存在: ${urlPath}`);
        } else {
          console.log(`✅ 页面加载成功: ${fullUrl}`);
          console.log(`📄 页面标题: ${pageTitle}`);

          // 检查页面内容
          if (pageContent.includes('2-6岁儿童发育商测评')) {
            console.log('✅ 发现儿童发育商测评内容');
            testResults.assessmentFeatures.儿童发育商测评.status = 'found';
            testResults.assessmentFeatures.儿童发育商测评.details.push('找到测评页面');
          }

          if (pageContent.includes('幼小衔接测评')) {
            console.log('✅ 发现幼小衔接测评内容');
            testResults.assessmentFeatures.幼小衔接测评.status = 'found';
            testResults.assessmentFeatures.幼小衔接测评.details.push('找到幼小衔接测评');
          }

          if (pageContent.includes('学科测评')) {
            console.log('✅ 发现学科测评内容');
            testResults.assessmentFeatures.学科测评.status = 'found';
            testResults.assessmentFeatures.学科测评.details.push('找到学科测评');
          }
        }
      } catch (error) {
        console.log(`❌ 访问失败: ${fullUrl} - ${error.message}`);
        testResults.navigationIssues.push(`访问失败: ${urlPath} - ${error.message}`);
      }
    }

    // 第三步：测试儿童发育商测评功能
    console.log('\n📍 第三步：测试儿童发育商测评功能');
    await page.goto('http://localhost:5173/parent-center/assessment/index', { waitUntil: 'networkidle' });

    try {
      // 查找开始测评按钮
      const startButton = await page.$('button:has-text("立即开始测评"), button:has-text("开始测评"), .el-button--primary');
      if (startButton) {
        console.log('✅ 找到开始测评按钮');
        await startButton.click();
        await page.waitForTimeout(2000);

        // 检查是否跳转到开始页面
        const currentUrl = page.url();
        if (currentUrl.includes('/parent-center/assessment/start')) {
          console.log('✅ 成功跳转到测评开始页面');
          testResults.assessmentFeatures.儿童发育商测评.details.push('成功进入开始页面');

          // 尝试填写表单
          const childNameInput = await page.$('input[placeholder*="孩子姓名"]');
          const childAgeInput = await page.$('input[placeholder*="年龄"]');
          const phoneInput = await page.$('input[placeholder*="电话"]');

          if (childNameInput && childAgeInput && phoneInput) {
            console.log('✅ 找到测评表单');
            await childNameInput.fill('测试儿童');
            await childAgeInput.fill('48'); // 4岁
            await phoneInput.fill('13800138000');

            // 选择性别
            const genderRadio = await page.$('input[type="radio"][value="male"]');
            if (genderRadio) {
              await genderRadio.click();
            }

            testResults.assessmentFeatures.儿童发育商测评.details.push('成功填写测评表单');

            // 尝试提交表单
            const submitButton = await page.$('button:has-text("开始测评"), .el-button--primary');
            if (submitButton) {
              console.log('✅ 找到提交按钮');

              // 检查是否有API调用
              const apiPromises = [];
              page.on('response', response => {
                if (response.url().includes('/api/assessment')) {
                  apiPromises.push(response.text());
                }
              });

              await submitButton.click();
              await page.waitForTimeout(3000);

              // 检查是否成功提交
              const newUrl = page.url();
              if (newUrl.includes('/doing/')) {
                console.log('✅ 成功进入测评答题页面');
                testResults.assessmentFeatures.儿童发育商测评.status = 'functional';
                testResults.assessmentFeatures.儿童发育商测评.details.push('成功进入答题页面');
              } else {
                testResults.assessmentFeatures.儿童发育商测评.issues.push('提交表单后未跳转到答题页面');
              }
            } else {
              testResults.assessmentFeatures.儿童发育商测评.issues.push('未找到提交按钮');
            }
          } else {
            testResults.assessmentFeatures.儿童发育商测评.issues.push('测评表单元素缺失');
          }
        } else {
          testResults.assessmentFeatures.儿童发育商测评.issues.push('点击开始按钮后未跳转');
        }
      } else {
        testResults.assessmentFeatures.儿童发育商测评.issues.push('未找到开始测评按钮');
      }
    } catch (error) {
      testResults.assessmentFeatures.儿童发育商测评.issues.push(`测试异常: ${error.message}`);
      console.log(`❌ 儿童发育商测评测试异常: ${error.message}`);
    }

    // 第四步：测试幼小衔接测评
    console.log('\n📍 第四步：测试幼小衔接测评');
    await page.goto('http://localhost:5173/parent-center/assessment/school-readiness', { waitUntil: 'networkidle' });

    try {
      const pageTitle = await page.title();
      if (pageTitle.includes('幼小衔接测评')) {
        console.log('✅ 幼小衔接测评页面加载成功');
        testResults.assessmentFeatures.幼小衔接测评.status = 'found';
        testResults.assessmentFeatures.幼小衔接测评.details.push('页面加载成功');

        // 查找选择孩子的下拉菜单
        const childSelect = await page.$('el-select, select');
        if (childSelect) {
          console.log('✅ 找到孩子选择器');
          testResults.assessmentFeatures.幼小衔接测评.details.push('找到孩子选择功能');
        } else {
          testResults.assessmentFeatures.幼小衔接测评.issues.push('未找到孩子选择器');
        }

        // 查找开始测评按钮
        const startButton = await page.$('button:has-text("开始测评"), button:has-text("立即开始")');
        if (startButton) {
          console.log('✅ 找到幼小衔接开始测评按钮');
          testResults.assessmentFeatures.幼小衔接测评.status = 'functional';
          testResults.assessmentFeatures.幼小衔接测评.details.push('找到开始测评按钮');
        } else {
          testResults.assessmentFeatures.幼小衔接测评.issues.push('未找到开始测评按钮');
        }
      } else {
        testResults.assessmentFeatures.幼小衔接测评.issues.push('幼小衔接测评页面未正确加载');
      }
    } catch (error) {
      testResults.assessmentFeatures.幼小衔接测评.issues.push(`测试异常: ${error.message}`);
      console.log(`❌ 幼小衔接测评测试异常: ${error.message}`);
    }

    // 第五步：测试学科测评
    console.log('\n📍 第五步：测试学科测评');
    await page.goto('http://localhost:5173/parent-center/assessment/academic', { waitUntil: 'networkidle' });

    try {
      const pageTitle = await page.title();
      if (pageTitle.includes('学科测评')) {
        console.log('✅ 学科测评页面加载成功');
        testResults.assessmentFeatures.学科测评.status = 'found';
        testResults.assessmentFeatures.学科测评.details.push('页面加载成功');

        // 查找年级选择按钮
        const gradeButtons = await page.$$('el-radio-button, .el-radio-button');
        if (gradeButtons.length > 0) {
          console.log(`✅ 找到 ${gradeButtons.length} 个年级选择按钮`);
          testResults.assessmentFeatures.学科测评.details.push(`找到 ${gradeButtons.length} 个年级选项`);

          // 尝试点击一个年级
          if (gradeButtons.length >= 1) {
            await gradeButtons[0].click();
            await page.waitForTimeout(1000);
            testResults.assessmentFeatures.学科测评.details.push('成功选择年级');
          }
        } else {
          testResults.assessmentFeatures.学科测评.issues.push('未找到年级选择按钮');
        }

        // 查找学科选择
        const subjectCards = await page.$$('.subject-card, .el-card');
        if (subjectCards.length > 0) {
          console.log(`✅ 找到 ${subjectCards.length} 个学科选项`);
          testResults.assessmentFeatures.学科测评.status = 'functional';
          testResults.assessmentFeatures.学科测评.details.push('找到学科选择功能');
        } else {
          testResults.assessmentFeatures.学科测评.issues.push('未找到学科选择卡片');
        }
      } else {
        testResults.assessmentFeatures.学科测评.issues.push('学科测评页面未正确加载');
      }
    } catch (error) {
      testResults.assessmentFeatures.学科测评.issues.push(`测试异常: ${error.message}`);
      console.log(`❌ 学科测评测试异常: ${error.message}`);
    }

    // 收集技术问题
    testResults.technicalIssues.consoleErrors = consoleErrors;
    testResults.technicalIssues.pageErrors = pageErrors;
    testResults.technicalIssues.networkErrors = networkErrors;

    return testResults;

  } catch (error) {
    console.error('❌ 测试过程中发生严重错误:', error.message);
    return {
      error: error.message,
      testTime: new Date().toLocaleString('zh-CN'),
      technicalIssues: {
        consoleErrors,
        pageErrors,
        networkErrors
      }
    };
  } finally {
    await browser.close();
    console.log('🏁 测试完成，浏览器已关闭');
  }
}

// 运行测试并生成报告
runComprehensiveAssessmentTest().then(results => {
  console.log('\n📊 ===== 家长端测评中心完整测试报告 =====');

  console.log(`\n⏰ 测试时间: ${results.testTime}`);
  console.log(`🔗 测试URL: ${results.testUrl}`);
  console.log(`🔐 登录状态: ${results.loginStatus}`);

  console.log('\n🎯 核心功能测试结果:');
  Object.entries(results.assessmentFeatures).forEach(([name, feature]) => {
    const status = feature.status === 'functional' ? '✅ 功能正常' :
                   feature.status === 'found' ? '🟡 找到入口' :
                   feature.status === 'pending' ? '⚠️ 未测试' : '❌ 未找到';

    console.log(`\n${name}: ${status}`);
    if (feature.details.length > 0) {
      console.log('  ✅ 详情:');
      feature.details.forEach(detail => {
        console.log(`    - ${detail}`);
      });
    }
    if (feature.issues.length > 0) {
      console.log('  ❌ 问题:');
      feature.issues.forEach(issue => {
        console.log(`    - ${issue}`);
      });
    }
  });

  if (results.navigationIssues.length > 0) {
    console.log('\n🧭 导航问题:');
    results.navigationIssues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }

  if (results.technicalIssues.consoleErrors.length > 0) {
    console.log('\n🔧 控制台错误:');
    results.technicalIssues.consoleErrors.forEach(error => {
      console.log(`  - ${error.text}`);
    });
  }

  if (results.technicalIssues.pageErrors.length > 0) {
    console.log('\n💥 页面错误:');
    results.technicalIssues.pageErrors.forEach(error => {
      console.log(`  - ${error.message}`);
    });
  }

  if (results.technicalIssues.networkErrors.length > 0) {
    console.log('\n🌐 网络错误:');
    results.technicalIssues.networkErrors.forEach(error => {
      console.log(`  - ${error.url}: ${error.failure?.errorText}`);
    });
  }

  console.log('\n=====================================\n');

  // 保存详细报告
  const fs = require('fs');
  const reportPath = './comprehensive_assessment_test_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📝 详细测试报告已保存到: ${reportPath}`);

  // 生成Markdown报告
  const markdownReport = generateDetailedMarkdownReport(results);
  const markdownPath = './家长端测评中心完整测试报告.md';
  fs.writeFileSync(markdownPath, markdownReport);
  console.log(`📝 Markdown测试报告已保存到: ${markdownPath}`);

}).catch(error => {
  console.error('❌ 测试执行失败:', error);
});

function generateDetailedMarkdownReport(results) {
  let markdown = `# 家长端测评中心完整功能测试报告

## 测试概览
- **测试时间**: ${results.testTime}
- **测试URL**: ${results.testUrl}
- **登录状态**: ${results.loginStatus}

## 测试环境
- **浏览器**: Playwright (Chromium)
- **测试模式**: 无头模式
- **视口大小**: 1366x768

## 功能测试结果

### 登录功能
\`${results.loginStatus === 'success' ? '✅ 成功' : '❌ 失败'}\` - ${results.loginStatus}

`;

  Object.entries(results.assessmentFeatures).forEach(([name, feature]) => {
    const status = feature.status === 'functional' ? '✅ 功能正常' :
                   feature.status === 'found' ? '🟡 找到入口' :
                   feature.status === 'pending' ? '⚠️ 未测试' : '❌ 未找到';

    markdown += `### ${name}
**状态**: ${status}

`;

    if (feature.details.length > 0) {
      markdown += `**测试详情**:
`;
      feature.details.forEach(detail => {
        markdown += `- ✅ ${detail}\n`;
      });
      markdown += '\n';
    }

    if (feature.issues.length > 0) {
      markdown += `**发现问题**:
`;
      feature.issues.forEach(issue => {
        markdown += `- ❌ ${issue}\n`;
      });
      markdown += '\n';
    }
  });

  if (results.navigationIssues.length > 0) {
    markdown += `## 导航问题
`;
    results.navigationIssues.forEach(issue => {
      markdown += `- ❌ ${issue}\n`;
    });
    markdown += '\n';
  }

  if (results.technicalIssues.consoleErrors.length > 0) {
    markdown += `## 技术问题

### 控制台错误
`;
    results.technicalIssues.consoleErrors.forEach(error => {
      markdown += `- \`${error.text}\`\n`;
      if (error.location) {
        markdown += `  - 位置: ${error.location.url}:${error.location.lineNumber}\n`;
      }
    });
    markdown += '\n';
  }

  if (results.technicalIssues.pageErrors.length > 0) {
    markdown += `### 页面错误
`;
    results.technicalIssues.pageErrors.forEach(error => {
      markdown += `- \`${error.message}\`\n`;
      if (error.stack) {
        markdown += `  - 堆栈: \`\`\`\n${error.stack}\n\`\`\`\n`;
      }
    });
    markdown += '\n';
  }

  if (results.technicalIssues.networkErrors.length > 0) {
    markdown += `### 网络错误
`;
    results.technicalIssues.networkErrors.forEach(error => {
      markdown += `- **URL**: ${error.url}\n`;
      markdown += `  - **错误**: ${error.failure?.errorText || 'Unknown error'}\n`;
    });
    markdown += '\n';
  }

  // 添加总结和建议
  markdown += `## 总结和建议

### 功能完整性分析
`;

  const functionalCount = Object.values(results.assessmentFeatures).filter(f => f.status === 'functional').length;
  const foundCount = Object.values(results.assessmentFeatures).filter(f => f.status === 'found').length;
  const totalCount = Object.keys(results.assessmentFeatures).length;

  markdown += `- **完全功能正常**: ${functionalCount}/${totalCount}
- **找到入口但功能不完整**: ${foundCount}/${totalCount}
- **总体可用性**: ${Math.round((functionalCount + foundCount * 0.5) / totalCount * 100)}%

### 主要发现
`;

  if (results.loginStatus !== 'success') {
    markdown += `- ❌ 登录功能存在问题，可能影响后续测试\n`;
  }

  Object.entries(results.assessmentFeatures).forEach(([name, feature]) => {
    if (feature.status === 'pending' || feature.status === '未找到') {
      markdown += `- ❌ ${name}功能缺失或无法访问\n`;
    }
  });

  if (results.technicalIssues.consoleErrors.length > 0 || results.technicalIssues.pageErrors.length > 0) {
    markdown += `- ⚠️ 存在技术错误，需要修复以提高稳定性\n`;
  }

  markdown += `### 建议修复优先级

1. **高优先级** - 登录功能修复
2. **高优先级** - 儿童发育商测评功能完善
3. **中优先级** - 幼小衔接测评功能完善
4. **中优先级** - 学科测评功能完善
5. **低优先级** - UI优化和用户体验提升

### 后续测试建议
- 在修复核心问题后重新进行完整测试
- 增加移动端兼容性测试
- 进行性能测试和压力测试
- 添加用户接受度测试

---
*测试报告由自动化测试生成于 ${results.testTime}*`;

  return markdown;
}