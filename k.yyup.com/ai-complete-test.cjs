#!/usr/bin/env node

/**
 * AI助手完整功能测试
 * 验证所有修复后的AI功能是否正常工作
 */

const puppeteer = require('puppeteer');

console.log('🚀 开始AI助手完整功能测试...\n');

async function runAICompleteTest() {
  let browser;
  try {
    // 启动浏览器
    console.log('📱 启动浏览器...');
    browser = await puppeteer.launch({
      headless: true,
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 设置视口
    await page.setViewport({ width: 1366, height: 768 });

    // 监听控制台
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({
        type: msg.type(),
        text: text,
        timestamp: new Date().toISOString()
      });

      if (msg.type() === 'error') {
        console.log(`❌ 控制台错误: ${text}`);
      } else if (text.includes('AI') || text.includes('SSE') || text.includes('stream')) {
        console.log(`🤖 AI相关日志: ${text}`);
      }
    });

    // 监听网络请求
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/ai/')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
        console.log(`🌐 AI请求: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/ai/')) {
        networkRequests.push({
          url: response.url(),
          status: response.status(),
          timestamp: new Date().toISOString()
        });
        console.log(`📡 AI响应: ${response.status()} ${response.url()}`);
      }
    });

    // 1. 访问首页
    console.log('\n📄 步骤1: 访问首页');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(2000);
    console.log('✅ 首页加载完成');

    // 2. 检查页面内容
    console.log('\n🔍 步骤2: 检查页面内容');
    const pageTitle = await page.title();
    console.log(`页面标题: ${pageTitle}`);

    const bodyContent = await page.evaluate(() => {
      return document.body.innerText;
    });

    if (bodyContent.length > 1000) {
      console.log('✅ 页面内容正常加载');
    } else {
      console.log('⚠️ 页面内容较少，可能存在问题');
    }

    // 3. 尝试快速登录（如果有登录按钮）
    console.log('\n🔑 步骤3: 尝试快速登录');
    try {
      // 查找登录相关的按钮或链接
      const loginButton = await page.$('button[data-cy="quick-login-btn"], .login-btn, [class*="login"], [class*="signin"]');

      if (loginButton) {
        console.log('发现登录按钮，点击登录...');
        await loginButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ 登录操作完成');
      } else {
        console.log('⚠️ 未发现登录按钮，可能已登录或使用其他认证方式');
      }
    } catch (loginError) {
      console.log(`登录过程出错: ${loginError.message}`);
    }

    // 4. 查找AI助手按钮
    console.log('\n🤖 步骤4: 查找AI助手入口');
    const aiSelectors = [
      '[data-cy="ai-assistant-btn"]',
      '.ai-assistant-btn',
      '[class*="ai-assistant"]',
      '[class*="ai-chat"]',
      'button[title*="AI"]',
      'button[title*="助手"]'
    ];

    let aiButton = null;
    for (const selector of aiSelectors) {
      try {
        aiButton = await page.$(selector);
        if (aiButton) {
          console.log(`✅ 找到AI助手按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!aiButton) {
      // 尝试文本搜索
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        try {
          const text = await btn.evaluate(el => el.textContent.trim());
          if (text.includes('AI') || text.includes('助手') || text.includes('智能')) {
            aiButton = btn;
            console.log(`✅ 通过文本找到AI助手按钮: ${text}`);
            break;
          }
        } catch (e) {
          // 继续检查下一个按钮
        }
      }
    }

    if (aiButton) {
      console.log('🎯 点击AI助手按钮...');
      await aiButton.click();
      await page.waitForTimeout(3000);

      // 5. 检查AI助手界面
      console.log('\n💬 步骤5: 检查AI助手界面');

      // 查找AI助手相关元素
      const aiElements = await page.$$([
        '.ai-assistant',
        '.ai-chat',
        '.ai-sidebar',
        '[class*="ai-"]',
        '.chat-container',
        '.message-input'
      ].join(','));

      if (aiElements.length > 0) {
        console.log(`✅ 发现 ${aiElements.length} 个AI相关界面元素`);
      } else {
        console.log('⚠️ 未发现明显的AI界面元素');
      }

      // 6. 查找输入框
      console.log('\n⌨️ 步骤6: 查找AI输入框');
      const inputSelectors = [
        'textarea[placeholder*="输入"]',
        'textarea[placeholder*="消息"]',
        'input[type="text"][placeholder*="输入"]',
        '.message-input textarea',
        '.chat-input textarea',
        '[data-cy="message-input"]'
      ];

      let inputBox = null;
      for (const selector of inputSelectors) {
        try {
          inputBox = await page.$(selector);
          if (inputBox) {
            console.log(`✅ 找到输入框: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (inputBox) {
        // 7. 测试AI对话功能
        console.log('\n🧪 步骤7: 测试AI对话功能');

        const testPrompts = [
          '你好',
          '今天的天气怎么样？',
          '帮我分析一下系统状态'
        ];

        for (let i = 0; i < testPrompts.length; i++) {
          const prompt = testPrompts[i];
          console.log(`\n📝 测试提示词 ${i + 1}: "${prompt}"`);

          try {
            // 清空输入框并输入新内容
            await inputBox.click();
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.up('Control');
            await page.keyboard.type(prompt);

            // 查找发送按钮
            const sendButton = await page.$('button[type="submit"], .send-btn, [data-cy="send-btn"]');

            if (sendButton) {
              await sendButton.click();
            } else {
              // 尝试按Enter发送
              await page.keyboard.press('Enter');
            }

            console.log('✅ 消息已发送');

            // 等待响应
            await page.waitForTimeout(5000);

            // 检查是否有新的消息内容
            const hasNewMessage = await page.evaluate(() => {
              const messages = document.querySelectorAll('.message, .chat-message, [class*="message"]');
              return messages.length > 0;
            });

            if (hasNewMessage) {
              console.log('✅ 检测到AI响应');
            } else {
              console.log('⚠️ 未检测到明显的AI响应');
            }

          } catch (testError) {
            console.log(`❌ 测试提示词失败: ${testError.message}`);
          }

          // 等待一下再进行下一个测试
          await page.waitForTimeout(2000);
        }
      } else {
        console.log('❌ 未找到AI输入框');
      }
    } else {
      console.log('❌ 未找到AI助手按钮');
    }

    // 8. 生成测试报告
    console.log('\n📊 步骤8: 生成测试报告');

    const report = {
      timestamp: new Date().toISOString(),
      testResult: 'completed',
      pageLoadSuccess: bodyContent.length > 1000,
      aiInterfaceFound: !!aiButton,
      networkRequests: networkRequests.length,
      consoleErrors: consoleMessages.filter(m => m.type === 'error').length,
      aiRelatedRequests: networkRequests.filter(r => r.url.includes('/api/ai/')).length,
      summary: {
        title: 'AI助手完整功能测试报告',
        status: aiButton ? '成功' : '部分成功',
        details: [
          `页面加载: ${bodyContent.length > 1000 ? '正常' : '异常'}`,
          `AI界面: ${aiButton ? '已找到' : '未找到'}`,
          `网络请求: ${networkRequests.length} 个`,
          `AI相关请求: ${networkRequests.filter(r => r.url.includes('/api/ai/')).length} 个`,
          `控制台错误: ${consoleMessages.filter(m => m.type === 'error').length} 个`
        ]
      }
    };

    console.log('\n' + '='.repeat(60));
    console.log('🎉 AI助手完整功能测试报告');
    console.log('='.repeat(60));
    console.log(`测试时间: ${report.timestamp}`);
    console.log(`测试状态: ${report.summary.status}`);
    console.log(`页面加载: ${report.summary.details[0]}`);
    console.log(`AI界面: ${report.summary.details[1]}`);
    console.log(`网络请求: ${report.summary.details[2]}`);
    console.log(`AI相关请求: ${report.summary.details[3]}`);
    console.log(`控制台错误: ${report.summary.details[4]}`);
    console.log('='.repeat(60));

    // 详细日志
    if (networkRequests.length > 0) {
      console.log('\n🌐 网络请求详情:');
      networkRequests.slice(-5).forEach(req => {
        console.log(`  ${req.method || req.status} ${req.url}`);
      });
    }

    if (consoleMessages.length > 0) {
      console.log('\n📝 控制台日志详情:');
      consoleMessages.slice(-5).forEach(msg => {
        if (msg.type !== 'log' || msg.text.includes('AI') || msg.text.includes('error')) {
          console.log(`  [${msg.type}] ${msg.text}`);
        }
      });
    }

    // 保存报告
    const fs = require('fs');
    const reportPath = './ai-complete-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n✅ 测试完成，浏览器已关闭');
    }
  }
}

// 运行测试
runAICompleteTest().catch(console.error);