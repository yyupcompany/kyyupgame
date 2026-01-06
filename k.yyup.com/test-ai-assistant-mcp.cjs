const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAIAssistantFunctionality() {
  console.log('🤖 开始测试AI助手功能');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    devtools: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 创建测试报告
  const testReport = {
    startTime: new Date().toISOString(),
    steps: [],
    screenshots: [],
    errors: [],
    observations: [],
    toolCalls: [],
    success: false
  };

  try {
    console.log('\n=== 步骤1：访问系统首页 ===');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 截图保存首页状态
    const homepageScreenshot = path.join(__dirname, 'test-results', 'homepage.png');
    await page.screenshot({ path: homepageScreenshot, fullPage: true });
    testReport.screenshots.push({
      name: 'homepage',
      path: homepageScreenshot,
      timestamp: new Date().toISOString()
    });

    testReport.steps.push({
      step: 1,
      action: '访问系统首页',
      status: 'success',
      url: page.url(),
      timestamp: new Date().toISOString()
    });

    console.log('✅ 系统首页加载成功');

    console.log('\n=== 步骤2：登录系统 ===');

    // 检查是否已经在登录页面
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      // 如果不是登录页面，尝试导航到登录页
      await page.goto('http://localhost:5173/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // 等待登录表单加载
    await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    // 尝试多种登录凭证
    const loginAttempts = [
      { username: 'admin', password: 'admin123' },
      { username: 'admin', password: '123456' },
      { username: 'teacher', password: '123456' },
      { username: 'parent', password: '123456' }
    ];

    let loginSuccess = false;
    let usedCredentials = null;

    for (const credentials of loginAttempts) {
      try {
        console.log(`尝试登录凭证: ${credentials.username} / ${credentials.password}`);

        // 填写登录表单
        await page.fill('input[type="text"], input[type="email"]', credentials.username);
        await page.fill('input[type="password"]', credentials.password);

        // 点击登录按钮
        const submitButton = await page.$('button[type="submit"], button:has-text("登录"), .login-btn');
        if (submitButton) {
          await submitButton.click();
        } else {
          // 尝试回车提交
          await page.press('input[type="password"]', 'Enter');
        }

        // 等待登录处理
        await page.waitForTimeout(5000);

        // 检查是否登录成功（URL变化或出现dashboard元素）
        const currentUrlAfterLogin = page.url();
        const hasDashboardElements = await page.$('.dashboard, .main-content, .el-container') !== null;

        if (currentUrlAfterLogin.includes('/dashboard') ||
            currentUrlAfterLogin.includes('/main') ||
            hasDashboardElements) {
          loginSuccess = true;
          usedCredentials = credentials;
          console.log(`✅ 登录成功！使用凭证: ${credentials.username}`);
          break;
        } else {
          // 检查是否有错误消息
          const errorElement = await page.$('.error, .el-message--error, [role="alert"]');
          if (errorElement) {
            const errorText = await errorElement.textContent();
            console.log(`登录失败: ${errorText}`);
          }

          // 重新访问登录页面
          await page.goto('http://localhost:5173/login');
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log(`登录凭证 ${credentials.username} 尝试失败:`, error.message);
      }
    }

    if (!loginSuccess) {
      throw new Error('所有登录凭证都失败，无法登录系统');
    }

    testReport.steps.push({
      step: 2,
      action: '登录系统',
      status: 'success',
      credentials: usedCredentials,
      url: page.url(),
      timestamp: new Date().toISOString()
    });

    console.log('\n=== 步骤3：寻找AI助手入口 ===');

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 多种方式寻找AI助手入口
    const aiEntrySelectors = [
      'button:has-text("AI")',
      'button:has-text("YY-AI")',
      '.ai-assistant-btn',
      '[class*="ai"]',
      'button:has-text("助手")',
      '.el-button:has-text("AI")',
      'nav a:has-text("AI")',
      '.sidebar a:has-text("AI")',
      '.menu-item:has-text("AI")'
    ];

    let aiEntryFound = false;
    let aiEntrySelector = null;

    for (const selector of aiEntrySelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          const isEnabled = await element.isEnabled();
          if (isVisible && isEnabled) {
            aiEntryFound = true;
            aiEntrySelector = selector;
            console.log(`✅ 找到AI助手入口: ${selector}`);
            break;
          }
        }
      } catch (error) {
        // 忽略选择器错误，继续尝试下一个
      }
    }

    if (!aiEntryFound) {
      // 尝试直接访问AI助手页面URL
      const aiPageUrls = [
        'http://localhost:5173/ai/memory',
        'http://localhost:5173/ai',
        'http://localhost:5173/assistant',
        'http://localhost:5173/ai-assistant'
      ];

      for (const url of aiPageUrls) {
        try {
          await page.goto(url);
          await page.waitForTimeout(3000);

          // 检查是否成功加载AI相关页面
          const hasAIElements = await page.$('.ai-assistant, .ai-chat, [class*="ai"]') !== null;
          if (hasAIElements) {
            aiEntryFound = true;
            console.log(`✅ 直接访问AI页面成功: ${url}`);
            break;
          }
        } catch (error) {
          console.log(`访问AI页面 ${url} 失败:`, error.message);
        }
      }
    } else {
      // 点击AI助手入口
      await page.click(aiEntrySelector);
      await page.waitForTimeout(5000);
    }

    if (!aiEntryFound) {
      throw new Error('未找到AI助手入口，无法进行测试');
    }

    // 截图保存AI页面状态
    const aiPageScreenshot = path.join(__dirname, 'test-results', 'ai-page.png');
    await page.screenshot({ path: aiPageScreenshot, fullPage: true });
    testReport.screenshots.push({
      name: 'ai-page',
      path: aiPageScreenshot,
      timestamp: new Date().toISOString()
    });

    testReport.steps.push({
      step: 3,
      action: '进入AI助手页面',
      status: 'success',
      url: page.url(),
      selector: aiEntrySelector,
      timestamp: new Date().toISOString()
    });

    console.log('\n=== 步骤4：检查AI助手页面结构 ===');

    // 检查AI助手页面的关键元素
    const pageStructure = await page.evaluate(() => {
      const elements = {
        chatContainer: !!document.querySelector('.chat-container, .ai-chat, [class*="chat"]'),
        inputArea: !!document.querySelector('textarea, input[type="text"], .message-input'),
        sendButton: !!document.querySelector('button:has-text("发送"), .send-btn, [class*="send"]'),
        messageList: !!document.querySelector('.message-list, .messages, [class*="message"]'),
        loadingIndicator: !!document.querySelector('.loading, .el-loading, [class*="loading"]'),
        toolPanel: !!document.querySelector('.tool-panel, [class*="tool"], .right-sidebar'),
        expertSelector: !!document.querySelector('.expert-selector, [class*="expert"]'),
        conversationSidebar: !!document.querySelector('.conversations-sidebar, [class*="conversation"]')
      };

      // 检查是否有错误元素
      const errorElements = document.querySelectorAll('.error, .el-alert--error, [role="alert"]');
      const errors = Array.from(errorElements).map(el => el.textContent?.trim()).filter(Boolean);

      return {
        elements,
        errors,
        url: window.location.href,
        title: document.title,
        bodyClasses: document.body.className
      };
    });

    testReport.observations.push({
      type: 'page-structure',
      data: pageStructure,
      timestamp: new Date().toISOString()
    });

    console.log('AI助手页面结构检查:');
    Object.entries(pageStructure.elements).forEach(([key, exists]) => {
      console.log(`  ${key}: ${exists ? '✅' : '❌'}`);
    });

    if (pageStructure.errors.length > 0) {
      console.log('发现的错误:');
      pageStructure.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
        testReport.errors.push({
          type: 'page-error',
          message: error,
          timestamp: new Date().toISOString()
        });
      });
    }

    console.log('\n=== 步骤5：测试AI对话功能 ===');

    // 等待输入区域就绪
    const inputSelector = await page.waitForSelector('textarea, input[type="text"], .message-input', {
      timeout: 10000
    });

    if (!inputSelector) {
      throw new Error('未找到消息输入区域');
    }

    // 发送测试消息
    const testMessages = [
      '你好，请简单介绍一下系统的主要功能',
      '现在的时间是什么？',
      '请帮我列出今天的待办事项'
    ];

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`发送测试消息 ${i + 1}: ${message}`);

      try {
        // 清空输入框并输入消息
        await inputSelector.fill('');
        await inputSelector.fill(message);

        // 查找发送按钮
        const sendButton = await page.$('button:has-text("发送"), .send-btn, [class*="send"]');
        if (sendButton) {
          await sendButton.click();
        } else {
          // 尝试回车发送
          await inputSelector.press('Enter');
        }

        console.log('消息已发送，等待AI响应...');

        // 等待响应（检查加载指示器）
        let responseReceived = false;
        let loadingStarted = false;

        for (let waitTime = 0; waitTime < 30000; waitTime += 1000) {
          const isLoading = await page.$('.loading, .el-loading, [class*="loading"], .ai-thinking') !== null;

          if (isLoading && !loadingStarted) {
            loadingStarted = true;
            console.log('检测到AI开始思考...');
          }

          if (loadingStarted && !isLoading) {
            console.log('AI响应完成');
            responseReceived = true;
            break;
          }

          // 检查是否出现新的消息
          const messages = await page.$$('.message, [class*="message"], .ai-response');
          if (messages.length > i) {
            responseReceived = true;
            break;
          }

          await page.waitForTimeout(1000);
        }

        if (!responseReceived) {
          console.log('⚠️ 未收到AI响应或响应超时');
          testReport.errors.push({
            type: 'no-response',
            message: `消息 "${message}" 未收到AI响应`,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('✅ 收到AI响应');
          testReport.steps.push({
            step: `5-${i + 1}`,
            action: `发送测试消息: ${message}`,
            status: 'success',
            timestamp: new Date().toISOString()
          });
        }

        // 等待一段时间再发送下一条消息
        await page.waitForTimeout(3000);

        // 截图保存对话状态
        const chatScreenshot = path.join(__dirname, 'test-results', `chat-${i + 1}.png`);
        await page.screenshot({ path: chatScreenshot, fullPage: true });
        testReport.screenshots.push({
          name: `chat-${i + 1}`,
          path: chatScreenshot,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error(`发送消息 "${message}" 时出错:`, error.message);
        testReport.errors.push({
          type: 'send-error',
          message: `发送消息失败: ${error.message}`,
          data: { message: message },
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log('\n=== 步骤6：监控控制台错误 ===');

    // 收集控制台错误和警告
    const consoleMessages = await page.evaluate(() => {
      const messages = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      // 返回当前页面中的控制台信息（如果有的话）
      return {
        errors: [],
        warnings: [],
        logs: []
      };
    });

    // 监听后续的控制台消息
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('控制台错误:', msg.text());
        testReport.errors.push({
          type: 'console-error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      } else if (msg.type() === 'warning') {
        console.log('控制台警告:', msg.text());
        testReport.observations.push({
          type: 'console-warning',
          data: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      console.log('页面错误:', error.message);
      testReport.errors.push({
        type: 'page-error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // 监听请求失败
    page.on('requestfailed', request => {
      console.log('请求失败:', request.url(), request.failure()?.errorText);
      testReport.errors.push({
        type: 'request-failed',
        message: `请求失败: ${request.url()}`,
        data: {
          url: request.url(),
          error: request.failure()?.errorText
        },
        timestamp: new Date().toISOString()
      });
    });

    console.log('\n=== 步骤7：检查工具调用情况 ===');

    // 检查是否有工具调用相关的UI元素或网络请求
    const toolCallInfo = await page.evaluate(() => {
      // 检查是否有工具面板
      const toolPanels = document.querySelectorAll('.tool-panel, [class*="tool"], .right-sidebar');
      const functionCallElements = document.querySelectorAll('[class*="function"], [class*="tool-call"]');
      const expertElements = document.querySelectorAll('.expert-selector, [class*="expert"]');

      return {
        toolPanels: toolPanels.length,
        functionCallElements: functionCallElements.length,
        expertElements: expertElements.length,
        hasRightSidebar: !!document.querySelector('.right-sidebar'),
        toolPanelVisible: Array.from(toolPanels).some(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
      };
    });

    testReport.observations.push({
      type: 'tool-call-ui',
      data: toolCallInfo,
      timestamp: new Date().toISOString()
    });

    console.log('工具调用UI检查:');
    Object.entries(toolCallInfo).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('\n=== 步骤8：最终截图和总结 ===');

    // 最终截图
    const finalScreenshot = path.join(__dirname, 'test-results', 'final-state.png');
    await page.screenshot({ path: finalScreenshot, fullPage: true });
    testReport.screenshots.push({
      name: 'final-state',
      path: finalScreenshot,
      timestamp: new Date().toISOString()
    });

    // 标记测试完成
    testReport.success = true;
    testReport.endTime = new Date().toISOString();

    console.log('✅ AI助手功能测试完成');

    return testReport;

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);

    testReport.errors.push({
      type: 'critical-error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // 错误时也截图
    try {
      const errorScreenshot = path.join(__dirname, 'test-results', 'error-state.png');
      await page.screenshot({ path: errorScreenshot, fullPage: true });
      testReport.screenshots.push({
        name: 'error-state',
        path: errorScreenshot,
        timestamp: new Date().toISOString()
      });
    } catch (screenshotError) {
      console.log('错误截图失败:', screenshotError.message);
    }

    testReport.endTime = new Date().toISOString();
    return testReport;

  } finally {
    console.log('\n⏳ 保持浏览器打开30秒供手动检查...');
    await page.waitForTimeout(30000);
    await browser.close();
    console.log('✅ 测试完成，浏览器已关闭');
  }
}

// 保存测试报告
async function saveTestReport(report) {
  const reportDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `ai-assistant-test-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  // 生成Markdown格式的可读报告
  const markdownReport = generateMarkdownReport(report);
  const markdownFile = path.join(reportDir, `ai-assistant-test-${Date.now()}.md`);
  fs.writeFileSync(markdownFile, markdownReport);

  console.log(`📋 测试报告已保存:`);
  console.log(`  JSON: ${reportFile}`);
  console.log(`  Markdown: ${markdownFile}`);

  return { reportFile, markdownFile };
}

// 生成Markdown格式报告
function generateMarkdownReport(report) {
  const startTime = new Date(report.startTime).toLocaleString('zh-CN');
  const endTime = new Date(report.endTime).toLocaleString('zh-CN');

  let markdown = `# AI助手功能测试报告\n\n`;
  markdown += `**测试时间**: ${startTime} - ${endTime}\n`;
  markdown += `**测试结果**: ${report.success ? '✅ 成功' : '❌ 失败'}\n\n`;

  markdown += `## 测试步骤\n\n`;
  report.steps.forEach((step, i) => {
    markdown += `${i + 1}. **${step.action}** - ${step.status}\n`;
    if (step.url) markdown += `   - URL: ${step.url}\n`;
    if (step.credentials) markdown += `   - 使用凭证: ${step.credentials.username}\n`;
    if (step.selector) markdown += `   - 选择器: ${step.selector}\n`;
    markdown += `   - 时间: ${new Date(step.timestamp).toLocaleString('zh-CN')}\n\n`;
  });

  if (report.observations.length > 0) {
    markdown += `## 观察记录\n\n`;
    report.observations.forEach((obs, i) => {
      markdown += `### ${i + 1}. ${obs.type}\n`;
      markdown += `\`\`\`json\n${JSON.stringify(obs.data, null, 2)}\n\`\`\`\n\n`;
    });
  }

  if (report.errors.length > 0) {
    markdown += `## 错误记录\n\n`;
    report.errors.forEach((error, i) => {
      markdown += `### ${i + 1}. ${error.type}\n`;
      markdown += `**错误信息**: ${error.message}\n`;
      if (error.data) markdown += `**详细数据**: \`${JSON.stringify(error.data)}\`\n`;
      if (error.stack) markdown += `**堆栈信息**: \n\`\`\`\n${error.stack}\n\`\`\`\n`;
      markdown += `**时间**: ${new Date(error.timestamp).toLocaleString('zh-CN')}\n\n`;
    });
  }

  if (report.screenshots.length > 0) {
    markdown += `## 截图记录\n\n`;
    report.screenshots.forEach((screenshot, i) => {
      markdown += `${i + 1}. **${screenshot.name}**\n`;
      markdown += `   - 路径: ${screenshot.path}\n`;
      markdown += `   - 时间: ${new Date(screenshot.timestamp).toLocaleString('zh-CN')}\n\n`;
    });
  }

  return markdown;
}

// 如果直接运行此文件
if (require.main === module) {
  testAIAssistantFunctionality()
    .then(report => {
      return saveTestReport(report);
    })
    .then(({ reportFile, markdownFile }) => {
      console.log('\n🎯 测试完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = { testAIAssistantFunctionality };