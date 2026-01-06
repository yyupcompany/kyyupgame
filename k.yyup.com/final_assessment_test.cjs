const { chromium } = require('playwright');

async function runFinalAssessmentTest() {
  console.log('🚀 开始家长端测评中心最终测试 - 使用正确路径');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });

  const page = await context.newPage();

  // 监听所有错误和日志
  const errors = [];
  const apiCalls = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', message: msg.text() });
    }
  });

  page.on('pageerror', error => {
    errors.push({ type: 'page', message: error.message });
  });

  page.on('response', response => {
    if (response.url().includes('/api/assessment')) {
      apiCalls.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method()
      });
    }
  });

  try {
    // 登录
    console.log('\n🔐 步骤1: 登录系统');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    const usernameInput = await page.$('input[type="text"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"], .el-button--primary');

    if (usernameInput && passwordInput && loginButton) {
      await usernameInput.fill('testparent');
      await passwordInput.fill('123456');
      await loginButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 登录成功');
    } else {
      throw new Error('登录元素未找到');
    }

    // 正确的测评路径测试
    const assessmentUrls = [
      '/parent-center/assessment',              // 测评中心主页
      '/parent-center/assessment/development',   // 儿童发育商测评
      '/parent-center/assessment/start',         // 开始测评
      '/parent-center/assessment/school-readiness', // 幼小衔接测评
      '/parent-center/assessment/academic',      // 学科测评
      '/parent-center/assessment/growth-trajectory' // 成长轨迹
    ];

    const testResults = {
      testTime: new Date().toLocaleString('zh-CN'),
      features: {},
      summary: { success: 0, failed: 0, partial: 0 }
    };

    console.log('\n🧪 步骤2: 测试各个测评功能页面');

    for (const urlPath of assessmentUrls) {
      const featureName = getFeatureName(urlPath);
      console.log(`\n📍 测试: ${featureName} (${urlPath})`);

      try {
        await page.goto(`http://localhost:5173${urlPath}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        const pageTitle = await page.title();
        const pageContent = await page.content();

        const featureResult = {
          url: urlPath,
          title: pageTitle,
          accessible: !pageTitle.includes('页面不存在') && !pageTitle.includes('权限不足'),
          contentFound: false,
          interactiveElements: 0,
          issues: []
        };

        if (featureResult.accessible) {
          console.log(`✅ 页面可访问: ${pageTitle}`);
          featureResult.contentFound = true;

          // 查找关键元素
          const buttons = await page.$$('button');
          const forms = await page.$$('form');
          const inputs = await page.$$('input');
          const cards = await page.$$('.el-card, .card');

          featureResult.interactiveElements = buttons.length + forms.length + inputs.length;

          console.log(`📊 元素统计: 按钮${buttons.length}, 表单${forms.length}, 输入框${inputs.length}`);

          // 根据不同页面类型检查特定内容
          await checkSpecificContent(page, featureName, featureResult);

          if (featureResult.issues.length === 0) {
            testResults.summary.success++;
            console.log(`✅ ${featureName} 功能正常`);
          } else {
            testResults.summary.partial++;
            console.log(`🟡 ${featureName} 部分功能正常`);
          }
        } else {
          console.log(`❌ 页面不可访问: ${pageTitle}`);
          featureResult.issues.push('页面无法访问');
          testResults.summary.failed++;
        }

        testResults.features[featureName] = featureResult;

      } catch (error) {
        console.log(`❌ ${featureName} 测试失败: ${error.message}`);
        testResults.features[featureName] = {
          url: urlPath,
          accessible: false,
          issues: [`测试异常: ${error.message}`]
        };
        testResults.summary.failed++;
      }
    }

    // 特别测试儿童发育商测评的完整流程
    console.log('\n🎯 步骤3: 测试儿童发育商测评完整流程');
    await testDevelopmentAssessmentFlow(page, testResults);

    console.log('\n📊 ===== 测试结果汇总 =====');
    console.log(`✅ 完全正常: ${testResults.summary.success} 个功能`);
    console.log(`🟡 部分正常: ${testResults.summary.partial} 个功能`);
    console.log(`❌ 完全异常: ${testResults.summary.failed} 个功能`);
    console.log(`🔧 API调用次数: ${apiCalls.length}`);

    if (apiCalls.length > 0) {
      console.log('\n📡 API调用记录:');
      apiCalls.forEach(call => {
        console.log(`  ${call.method} ${call.url} - ${call.status}`);
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ 发现的错误:');
      errors.forEach(error => {
        console.log(`  [${error.type}] ${error.message}`);
      });
    }

    return { testResults, apiCalls, errors };

  } catch (error) {
    console.error('❌ 测试过程发生严重错误:', error.message);
    return { error: error.message, testResults: null };
  } finally {
    await browser.close();
    console.log('\n🏁 测试完成');
  }
}

function getFeatureName(urlPath) {
  const mapping = {
    '/parent-center/assessment': '测评中心主页',
    '/parent-center/assessment/development': '儿童发育商测评',
    '/parent-center/assessment/start': '开始测评页面',
    '/parent-center/assessment/school-readiness': '幼小衔接测评',
    '/parent-center/assessment/academic': '学科测评',
    '/parent-center/assessment/growth-trajectory': '成长轨迹'
  };
  return mapping[urlPath] || urlPath;
}

async function checkSpecificContent(page, featureName, result) {
  try {
    switch (featureName) {
      case '儿童发育商测评':
        // 查找测评相关元素
        const startButton = await page.$('button:has-text("立即开始测评"), button:has-text("开始测评")');
        if (!startButton) {
          result.issues.push('未找到开始测评按钮');
        }

        // 检查是否包含2-6岁测评相关内容
        const content = await page.textContent('body');
        if (!content || !content.includes('2-6岁')) {
          result.issues.push('页面内容不包含2-6岁测评信息');
        }
        break;

      case '开始测评页面':
        // 检查表单元素
        const nameInput = await page.$('input[placeholder*="孩子姓名"]');
        const ageInput = await page.$('input[placeholder*="年龄"]');
        const phoneInput = await page.$('input[placeholder*="电话"]');

        if (!nameInput) result.issues.push('未找到姓名输入框');
        if (!ageInput) result.issues.push('未找到年龄输入框');
        if (!phoneInput) result.issues.push('未找到电话输入框');
        break;

      case '幼小衔接测评':
        // 检查幼小衔接相关内容
        const readinessContent = await page.textContent('body');
        if (!readinessContent || !readinessContent.includes('幼小衔接')) {
          result.issues.push('页面内容不包含幼小衔接信息');
        }
        break;

      case '学科测评':
        // 检查年级和学科选择
        const gradeButtons = await page.$$('el-radio-button, .grade-selector');
        const subjectCards = await page.$$('.subject-card, .subject-selector');

        if (gradeButtons.length === 0) {
          result.issues.push('未找到年级选择按钮');
        }
        if (subjectCards.length === 0) {
          result.issues.push('未找到学科选择卡片');
        }
        break;
    }
  } catch (error) {
    result.issues.push(`内容检查异常: ${error.message}`);
  }
}

async function testDevelopmentAssessmentFlow(page, testResults) {
  try {
    console.log('🔄 测试测评流程...');

    // 访问发育商测评页面
    await page.goto('http://localhost:5173/parent-center/assessment/development', {
      waitUntil: 'networkidle'
    });

    // 尝试点击开始按钮
    const startButton = await page.$('button:has-text("立即开始测评"), button:has-text("开始测评")');
    if (startButton) {
      await startButton.click();
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      if (currentUrl.includes('/start')) {
        console.log('✅ 成功跳转到开始页面');

        // 尝试填写表单
        const nameInput = await page.$('input[placeholder*="孩子姓名"]');
        if (nameInput) {
          await nameInput.fill('测试儿童');
        }

        const ageInput = await page.$('input[placeholder*="年龄"]');
        if (ageInput) {
          await ageInput.fill('48');
        }

        const phoneInput = await page.$('input[placeholder*="电话"]');
        if (phoneInput) {
          await phoneInput.fill('13800138000');
        }

        console.log('✅ 表单填写测试完成');
      }
    } else {
      console.log('❌ 未找到开始测评按钮');
    }
  } catch (error) {
    console.log(`❌ 流程测试失败: ${error.message}`);
  }
}

// 运行测试并生成最终报告
runFinalAssessmentTest().then(results => {
  // 保存JSON报告
  const fs = require('fs');
  const jsonReportPath = './final_assessment_test_report.json';
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  console.log(`\n📝 JSON报告已保存到: ${jsonReportPath}`);

  // 生成Markdown报告
  const markdownReport = generateFinalMarkdownReport(results);
  const markdownReportPath = './家长端测评中心最终测试报告.md';
  fs.writeFileSync(markdownReportPath, markdownReport);
  console.log(`📝 Markdown报告已保存到: ${markdownReportPath}`);

}).catch(error => {
  console.error('❌ 最终测试执行失败:', error);
});

function generateFinalMarkdownReport(results) {
  let markdown = `# 家长端测评中心最终功能测试报告

## 测试概览
- **测试时间**: ${results.testResults ? results.testResults.testTime : new Date().toLocaleString('zh-CN')}
- **测试环境**: Playwright Chromium (无头模式)
- **测试账户**: testparent / 123456

## 测试结果摘要

### 总体统计
`;

  if (results.testResults) {
    const summary = results.testResults.summary;
    markdown += `- ✅ **功能正常**: ${summary.success} 个
- 🟡 **部分正常**: ${summary.partial} 个
- ❌ **功能异常**: ${summary.failed} 个
- 📊 **API调用**: ${results.apiCalls.length} 次

### 详细功能测试结果
`;

    Object.entries(results.testResults.features).forEach(([name, feature]) => {
      const status = feature.accessible && feature.issues.length === 0 ? '✅ 正常' :
                     feature.accessible ? '🟡 部分正常' : '❌ 异常';

      markdown += `#### ${name} ${status}
- **访问地址**: \`${feature.url}\`
- **页面标题**: ${feature.title || '未加载'}
- **可访问性**: ${feature.accessible ? '✅ 可访问' : '❌ 不可访问'}
- **交互元素数量**: ${feature.interactiveElements || 0}
`;

      if (feature.issues && feature.issues.length > 0) {
        markdown += `- **发现问题**:\n`;
        feature.issues.forEach(issue => {
          markdown += `  - ❌ ${issue}\n`;
        });
      }
      markdown += '\n';
    });
  }

  if (results.apiCalls && results.apiCalls.length > 0) {
    markdown += `### API调用记录
`;
    results.apiCalls.forEach(call => {
      markdown += `- **${call.method}** \`${call.url}\` - 状态码: ${call.status}\n`;
    });
    markdown += '\n';
  }

  if (results.errors && results.errors.length > 0) {
    markdown += `### 发现的错误
`;
    results.errors.forEach(error => {
      markdown += `- **[${error.type}]** ${error.message}\n`;
    });
    markdown += '\n';
  }

  markdown += `## 结论和建议

### 主要发现
`;

  if (results.testResults) {
    if (results.testResults.summary.success === 0 && results.testResults.summary.failed > 0) {
      markdown += `- ❌ 所有核心测评功能都存在严重问题，需要紧急修复\n`;
    } else if (results.testResults.summary.partial > 0) {
      markdown += `- ⚠️ 部分功能可用，但需要完善用户体验\n`;
    } else {
      markdown += `- ✅ 测评功能基本可用\n`;
    }

    markdown += `### 修复优先级

1. **高优先级** - 修复页面访问权限问题
2. **高优先级** - 完善儿童发育商测评表单功能
3. **中优先级** - 添加幼小衔接测评交互功能
4. **中优先级** - 完善学科测评年级选择功能
5. **低优先级** - UI优化和错误处理完善

### 建议后续操作
1. 检查用户权限配置，确保家长角色可以访问测评页面
2. 测试API端点的可用性
3. 完善前端表单验证和错误提示
4. 进行用户体验测试
5. 添加单元测试和集成测试

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*`;

  return markdown;
}