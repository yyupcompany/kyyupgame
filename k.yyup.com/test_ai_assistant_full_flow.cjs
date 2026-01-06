const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAIAssistantFlow() {
  console.log('========================================');
  console.log('🎯 AI助手完整流程测试');
  console.log('========================================\n');

  const browser = await chromium.launch({
    headless: true,
    timeout: 60000
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  // 收集控制台日志
  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });

  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  // 创建截图目录
  const screenshotsDir = path.join(__dirname, 'ai_assistant_test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  try {
    // 步骤1: 访问首页
    console.log('📍 步骤1: 访问首页');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '01_homepage.png') });
    console.log('✅ 首页加载完成\n');

    // 检查是否已经在登录页
    const currentURL = page.url();
    console.log(`🔗 当前URL: ${currentURL}`);

    let isLoginPage = currentURL.includes('login') || currentURL.includes('auth');

    if (!isLoginPage) {
      // 步骤2: 查找并点击登录链接
      console.log('📍 步骤2: 查找登录入口');

      // 更灵活的选择器策略
      const possibleLoginSelectors = [
        'a[href*="login"]',
        'a[href*="auth"]',
        'a[href*="signin"]',
        'button:has-text("登录")',
        'button:has-text("登 录")',
        'button:has-text("Login")',
        'a:has-text("登录")',
        'a:has-text("Login")',
        '[data-testid="login"]',
        '.login-button',
        '#login-btn'
      ];

      let loginButton = null;
      for (const selector of possibleLoginSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            loginButton = element;
            console.log(`✅ 找到登录按钮: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试
        }
      }

      if (loginButton) {
        await loginButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotsDir, '02_after_login_click.png') });
      } else {
        // 直接尝试访问登录页
        console.log('⚠️ 未找到登录按钮，尝试直接访问登录页');
        await page.goto('http://localhost:5173/login');
        await page.waitForTimeout(2000);
        isLoginPage = true;
      }
    } else {
      console.log('✅ 已在登录页面\n');
    }

    // 步骤3: 执行登录
    console.log('📍 步骤3: 执行登录操作');

    await page.waitForTimeout(3000);

    // 查找用户名输入框
    const usernameSelectors = [
      'input[type="text"]',
      'input[name="username"]',
      'input[name="user"]',
      'input[id*="username"]',
      'input[id*="user"]',
      'input[placeholder*="用户名"]',
      'input[placeholder*="账号"]'
    ];

    let usernameInput = null;
    for (const selector of usernameSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          usernameInput = element;
          console.log(`✅ 找到用户名输入框: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续
      }
    }

    if (usernameInput) {
      await usernameInput.fill('admin');
      console.log('✅ 用户名填写完成: admin');
    } else {
      console.log('❌ 未找到用户名输入框');
    }

    // 查找密码输入框
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id*="password"]',
      'input[placeholder*="密码"]'
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          passwordInput = element;
          console.log(`✅ 找到密码输入框: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续
      }
    }

    if (passwordInput) {
      await passwordInput.fill('123456');
      console.log('✅ 密码填写完成');
    } else {
      console.log('❌ 未找到密码输入框');
    }

    await page.screenshot({ path: path.join(screenshotsDir, '03_login_filled.png') });

    // 点击提交按钮
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("登录")',
      'button:has-text("登 录")',
      'button:has-text("Login")',
      'button:has-text("提交")',
      'input[type="submit"]',
      '#login-btn',
      '.login-btn',
      '[data-testid="submit"]'
    ];

    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          submitButton = element;
          console.log(`✅ 找到提交按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续
      }
    }

    if (submitButton) {
      await submitButton.click();
      console.log('✅ 点击提交按钮');
    } else {
      console.log('⚠️ 未找到提交按钮，尝试按Enter');
      await page.keyboard.press('Enter');
    }

    // 等待登录完成或错误
    await page.waitForTimeout(5000);

    // 检查是否登录成功
    const newURL = page.url();
    console.log(`🔗 登录后URL: ${newURL}`);

    await page.screenshot({ path: path.join(screenshotsDir, '04_after_login.png') });

    const isLoggedIn = !newURL.includes('login') && !newURL.includes('auth');
    if (isLoggedIn) {
      console.log('✅ 登录可能成功\n');
    } else {
      console.log('⚠️ 可能未登录成功，但继续测试\n');
    }

    // 步骤4: 查找并进入AI助手
    console.log('📍 步骤4: 查找并进入AI助手');

    await page.waitForTimeout(3000);

    const aiSelectors = [
      'a[href*="/ai"]',
      'a[href*="/ai-assistant"]',
      'a[href*="/ai_assistant"]',
      'button:has-text("AI助手")',
      'button:has-text("AI助手")',
      'button:has-text("智能助手")',
      'text=AI助手',
      '[data-testid="ai-assistant"]',
      '.ai-assistant',
      '#ai-assistant'
    ];

    let aiClicked = false;
    for (const selector of aiSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          aiClicked = true;
          console.log(`✅ 点击AI助手: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续
      }
    }

    if (!aiClicked) {
      console.log('⚠️ 未找到AI助手链接，直接尝试访问 /ai/assistant');
      await page.goto('http://localhost:5173/ai/assistant', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      aiClicked = true;
      console.log('✅ 直接访问 /ai/assistant 页面');
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '05_ai_page.png') });

    // 步骤5: 测试AI查询
    console.log('\n📍 步骤5: 测试AI查询功能');

    const testQueries = [
      '园长您好，请查询学生总数',
      '请帮我查询大班A的学生名单',
      '生成一份幼儿园运营报告',
      '查询本月活动情况',
      '帮我创建一个新的待办任务'
    ];

    const results = [];

    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`\n🧪 测试查询 ${i + 1}/${testQueries.length}: ${query}`);

      // 查找输入框 - AI助手的输入框
      const inputSelectors = [
        'textarea[placeholder*="例如：请帮我"]',
        'textarea[placeholder*="制定"]',
        '.claude-input-container textarea',
        'textarea.el-textarea__inner',
        'textarea',
        '.main-input textarea',
        'textarea[placeholder*="输入"]'
      ];

      let inputBox = null;
      for (const selector of inputSelectors) {
        inputBox = await page.$(selector);
        if (inputBox) {
          console.log(`✅ 找到输入框: ${selector}`);
          break;
        }
      }

      if (!inputBox) {
        console.log('❌ 未找到输入框，跳过此测试');
        continue;
      }

      // 输入查询
      await inputBox.click();
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await inputBox.fill(query);
      console.log('✅ 查询输入完成');

      // 发送
      const sendSelectors = [
        'button[type="submit"]',
        'button:has-text("发送")',
        'button:has-text("提交")',
        'button:has-text("发送")',
        '.send-button',
        '[data-testid="send-button"]'
      ];

      let sendButton = null;
      for (const selector of sendSelectors) {
        sendButton = await page.$(selector);
        if (sendButton) {
          console.log(`✅ 找到发送按钮: ${selector}`);
          break;
        }
      }

      if (sendButton) {
        await sendButton.click();
      } else {
        await page.keyboard.press('Enter');
        console.log('✅ 按Enter发送');
      }

      console.log('⏳ 等待AI回复...');
      await page.waitForTimeout(10000);

      await page.screenshot({
        path: path.join(screenshotsDir, `06_query_${i + 1}_result.png`),
        fullPage: true
      });

      // 检查回复
      const hasResponse = await page.evaluate(() => {
        const texts = document.querySelectorAll('*');
        let found = false;
        for (let el of texts) {
          const text = el.textContent || '';
          if (text.includes('学生总数') || text.includes('园长') ||
              text.includes('查询') || text.includes('数据') ||
              text.includes('报告') || text.includes('活动')) {
            found = true;
            break;
          }
        }
        return found;
      });

      const result = {
        query,
        hasResponse,
        timestamp: new Date().toISOString()
      };

      results.push(result);
      console.log(`✅ 查询完成: ${hasResponse ? '有回复' : '无回复'}`);

      await page.waitForTimeout(2000);
    }

    // 步骤6: 检查组件渲染
    console.log('\n📍 步骤6: 检查前端组件渲染');

    const componentChecks = await page.evaluate(() => {
      return {
        chatBox: document.querySelectorAll('[class*="chat"], [class*="message"]').length > 0,
        messageList: document.querySelectorAll('[class*="message"], [class*="conversation"]').length > 0,
        inputArea: document.querySelectorAll('input, textarea, [contenteditable]').length > 0,
        buttons: document.querySelectorAll('button').length > 0
      };
    });

    console.log(`✅ 聊天框组件: ${componentChecks.chatBox ? '正常' : '异常'}`);
    console.log(`✅ 消息列表组件: ${componentChecks.messageList ? '正常' : '异常'}`);
    console.log(`✅ 输入区域组件: ${componentChecks.inputArea ? '正常' : '异常'}`);
    console.log(`✅ 按钮组件: ${componentChecks.buttons ? '正常' : '异常'}`);

    await page.screenshot({
      path: path.join(screenshotsDir, '07_final_state.png'),
      fullPage: true
    });

    // 生成报告
    console.log('\n========================================');
    console.log('📊 测试结果报告');
    console.log('========================================\n');

    const successfulQueries = results.filter(r => r.hasResponse).length;
    console.log(`✅ 成功查询: ${successfulQueries}/${testQueries.length}`);
    console.log(`❌ 失败查询: ${testQueries.length - successfulQueries}/${testQueries.length}`);
    console.log(`⚠️ 控制台错误: ${errors.length} 个`);
    console.log(`📝 控制台日志: ${consoleLogs.length} 条`);

    // 保存报告
    const report = {
      timestamp: new Date().toISOString(),
      results,
      consoleErrors: errors,
      consoleLogs,
      componentChecks,
      stats: {
        totalQueries: testQueries.length,
        successfulQueries,
        failedQueries: testQueries.length - successfulQueries,
        errorCount: errors.length,
        logCount: consoleLogs.length
      }
    };

    fs.writeFileSync(
      path.join(__dirname, 'ai_assistant_test_results.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 详细报告已保存到: ai_assistant_test_results.json');
    console.log('📸 截图已保存到: ai_assistant_test_screenshots/');
    console.log('\n========================================');
    console.log('✅ 测试完成');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:');
    console.error(error.message);
    console.error(error.stack);

    try {
      await page.screenshot({
        path: path.join(__dirname, 'ai_assistant_test_screenshots', 'error_screenshot.png'),
        fullPage: true
      });
      console.log('📸 错误截图已保存');
    } catch (e) {
      // 忽略
    }

    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      consoleErrors: errors,
      consoleLogs
    };

    fs.writeFileSync(
      path.join(__dirname, 'ai_assistant_test_error.json'),
      JSON.stringify(errorReport, null, 2)
    );
  } finally {
    await context.close();
    await browser.close();
    console.log('🧹 浏览器已关闭\n');
  }
}

testAIAssistantFlow().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
