const { chromium } = require('playwright');

async function runSimpleFinalTest() {
  console.log('🚀 开始家长端测评中心最终测试');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const page = await browser.newPage();

  try {
    // 登录
    console.log('\n🔐 步骤1: 登录系统');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    const usernameInput = await page.$('input[type="text"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"]');

    if (usernameInput && passwordInput && loginButton) {
      await usernameInput.fill('testparent');
      await passwordInput.fill('123456');
      await loginButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 登录成功');
    } else {
      throw new Error('登录元素未找到');
    }

    // 正确路径测试
    const testUrls = [
      { path: '/parent-center/assessment/development', name: '儿童发育商测评' },
      { path: '/parent-center/assessment/start', name: '开始测评页面' },
      { path: '/parent-center/assessment/school-readiness', name: '幼小衔接测评' },
      { path: '/parent-center/assessment/academic', name: '学科测评' }
    ];

    const results = {
      testTime: new Date().toLocaleString('zh-CN'),
      features: {},
      summary: { success: 0, failed: 0 }
    };

    console.log('\n🧪 步骤2: 测试各个测评功能页面');

    for (const url of testUrls) {
      console.log(`\n📍 测试: ${url.name} (${url.path})`);

      try {
        await page.goto(`http://localhost:5173${url.path}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        const pageTitle = await page.title();
        const accessible = !pageTitle.includes('页面不存在') && !pageTitle.includes('权限不足');

        const result = {
          path: url.path,
          title: pageTitle,
          accessible: accessible,
          interactiveElements: 0
        };

        if (accessible) {
          console.log(`✅ 页面可访问: ${pageTitle}`);

          const buttons = await page.$$('button');
          const forms = await page.$$('form');
          result.interactiveElements = buttons.length + forms.length;

          console.log(`📊 交互元素: 按钮${buttons.length}, 表单${forms.length}`);
          results.summary.success++;
        } else {
          console.log(`❌ 页面不可访问: ${pageTitle}`);
          results.summary.failed++;
        }

        results.features[url.name] = result;

      } catch (error) {
        console.log(`❌ ${url.name} 测试失败: ${error.message}`);
        results.features[url.name] = {
          path: url.path,
          accessible: false,
          error: error.message
        };
        results.summary.failed++;
      }
    }

    // 特别测试发育商测评流程
    console.log('\n🎯 步骤3: 测试儿童发育商测评流程');
    try {
      await page.goto('http://localhost:5173/parent-center/assessment/development', {
        waitUntil: 'networkidle'
      });

      const startButton = await page.$('button:has-text("立即开始测评")');
      if (startButton) {
        console.log('✅ 找到开始测评按钮');
        await startButton.click();
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        if (currentUrl.includes('/start')) {
          console.log('✅ 成功跳转到开始页面');

          const nameInput = await page.$('input[placeholder*="孩子姓名"]');
          if (nameInput) {
            await nameInput.fill('测试儿童');
            console.log('✅ 成功填写姓名');
          }
        }
      } else {
        console.log('❌ 未找到开始测评按钮');
      }
    } catch (error) {
      console.log(`❌ 流程测试失败: ${error.message}`);
    }

    console.log('\n📊 ===== 测试结果汇总 =====');
    console.log(`✅ 功能正常: ${results.summary.success} 个`);
    console.log(`❌ 功能异常: ${results.summary.failed} 个`);

    return results;

  } catch (error) {
    console.error('❌ 测试过程发生严重错误:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
    console.log('\n🏁 测试完成');
  }
}

// 运行测试
runSimpleFinalTest().then(results => {
  console.log('\n📝 生成测试报告...');

  const fs = require('fs');

  // 保存JSON报告
  const jsonPath = './simple_final_test_report.json';
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`📝 JSON报告已保存到: ${jsonPath}`);

  // 生成Markdown报告
  let markdown = `# 家长端测评中心最终测试报告

## 测试概览
- **测试时间**: ${results.testTime}
- **测试账户**: testparent / 123456

## 测试结果

### 功能测试统计
- ✅ **功能正常**: ${results.summary.success} 个
- ❌ **功能异常**: ${results.summary.failed} 个

### 详细结果
`;

  Object.entries(results.features).forEach(([name, feature]) => {
    const status = feature.accessible ? '✅ 可访问' : '❌ 不可访问';
    markdown += `#### ${name} ${status}
- **路径**: \`${feature.path}\`
- **页面标题**: ${feature.title}
- **交互元素**: ${feature.interactiveElements || 0}
`;

    if (feature.error) {
      markdown += `- **错误**: ${feature.error}\n`;
    }
    markdown += '\n';
  });

  markdown += `## 结论
`;

  if (results.summary.success > 0) {
    markdown += `✅ 部分测评功能可以正常访问和使用\n`;
  }

  if (results.summary.failed > 0) {
    markdown += `❌ 存在访问问题，需要检查权限配置和路由设置\n`;
  }

  markdown += `### 建议修复内容
1. 检查家长用户权限配置
2. 确保测评页面路由正确注册
3. 完善表单验证和错误处理
4. 添加加载状态和错误提示

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*`;

  const mdPath = './家长端测评中心最终测试报告.md';
  fs.writeFileSync(mdPath, markdown);
  console.log(`📝 Markdown报告已保存到: ${mdPath}`);

}).catch(error => {
  console.error('❌ 测试执行失败:', error);
});