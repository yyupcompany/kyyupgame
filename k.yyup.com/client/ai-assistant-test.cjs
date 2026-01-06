const { chromium } = require('playwright');

async function aiAssistantTest() {
  console.log('🤖 AI助手功能测试开始...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    if (msg.type() === 'error') {
      console.log(`❌ 控制台错误: ${msg.text}`);
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
      console.log(`❌ 网络错误: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('📱 访问系统...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 快捷登录
    console.log('🔧 进行系统管理员快捷登录...');
    const adminBtn = await page.$(':text("系统管理员")');
    if (adminBtn) {
      await adminBtn.click();
      await page.waitForTimeout(5000);
    } else {
      // 手动设置token
      await page.evaluate(() => {
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJwaG9uZSI6IjE4NjExMTQxMTMxIiwicm9sZSI6ImFkbWluIiwiaXNEZW1vIjp0cnVlLCJpYXQiOjE3NjQ4NzY4NDgsImV4cCI6MTc2NTQ4MTY0OH0.7rktzXj3HDkaZlyFwoiaV-m82_Aojn5aBfd_03RMQWw');
        localStorage.setItem('userInfo', JSON.stringify({
          "id": 121,
          "username": "admin",
          "email": "admin@test.com",
          "realName": "admin",
          "phone": "18611141131",
          "role": "admin",
          "isAdmin": true,
          "status": "active",
          "roles": ["admin"],
          "permissions": ["*"]
        }));
      });
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(5000);
    }

    console.log('✅ 登录成功，当前URL:', page.url());

    // 查找AI助手
    console.log('🔍 查找AI助手按钮...');

    // 可能的AI助手选择器
    const aiAssistantSelectors = [
      ':text("AI助手")',
      ':text("AI")',
      '[class*="ai"]',
      '[class*="assistant"]',
      '[class*="chat"]',
      '.ai-assistant',
      '#ai-assistant',
      '[data-testid*="ai"]'
    ];

    let aiAssistantBtn = null;
    for (const selector of aiAssistantSelectors) {
      try {
        aiAssistantBtn = await page.$(selector);
        if (aiAssistantBtn) {
          console.log(`✅ 找到AI助手按钮: ${selector}`);
          break;
        }
      } catch (error) {
        // 继续尝试下一个选择器
      }
    }

    if (!aiAssistantBtn) {
      // 尝试在页面中查找任何包含AI的文本
      const aiElements = await page.$$eval('*', elements =>
        elements.filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('ai') || text.includes('assistant') || text.includes('助手');
        }).map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          className: el.className,
          id: el.id
        }))
      );

      console.log('🔍 找到的AI相关元素:');
      aiElements.slice(0, 10).forEach((el, index) => {
        console.log(`${index + 1}. [${el.tag}] ${el.text} (class: ${el.className}, id: ${el.id})`);
      });

      if (aiElements.length > 0) {
        const firstElement = aiElements[0];
        try {
          aiAssistantBtn = await page.$(`:text("${firstElement.text}")`);
        } catch (error) {
          console.log('无法点击AI元素');
        }
      }
    }

    if (aiAssistantBtn) {
      console.log('🤖 点击AI助手按钮...');
      await aiAssistantBtn.click();
      await page.waitForTimeout(3000);

      // 截图记录点击后的页面状态
      await page.screenshot({ path: 'ai-assistant-after-click.png' });
      console.log('📸 已保存点击AI助手按钮后的页面截图');

      // 查找AI输入框
      console.log('🔍 查找AI输入框...');
      const inputSelectors = [
        'textarea[placeholder*="输入"]',
        'textarea[placeholder*="请"]',
        'input[type="text"]',
        'textarea',
        '[contenteditable="true"]',
        '.ai-input',
        '.chat-input',
        'textarea.el-textarea__inner',  // Element Plus输入框
        '.input-area textarea',           // 自定义输入区域
        '#messageInput'                  // 按ID查找
      ];

      let inputElement = null;
      for (const selector of inputSelectors) {
        try {
          inputElement = await page.$(selector);
          if (inputElement) {
            console.log(`✅ 找到输入框: ${selector}`);
            // 检查输入框是否可见和可编辑
            const isVisible = await inputElement.isVisible();
            const isEnabled = await inputElement.isEnabled();
            console.log(`   - 可见: ${isVisible}, 可用: ${isEnabled}`);
            if (isVisible && isEnabled) {
              break;
            }
          }
        } catch (error) {
          // 继续尝试下一个选择器
        }
      }

      if (inputElement) {
        console.log('📝 输入测试消息: "你好"');
        await inputElement.fill('你好');

        // 查找发送按钮
        console.log('🔍 查找发送按钮...');
        const sendSelectors = [
          ':text("发送")',
          ':text("提交")',
          'button[type="submit"]',
          '.send-btn',
          '.submit-btn',
          '[class*="send"]'
        ];

        let sendBtn = null;
        for (const selector of sendSelectors) {
          sendBtn = await page.$(selector);
          if (sendBtn) {
            console.log(`✅ 找到发送按钮: ${selector}`);
            break;
          }
        }

        if (sendBtn) {
          console.log('📤 点击发送按钮...');
          await sendBtn.click();

          // 等待AI响应
          console.log('⏳ 等待AI响应...');
          await page.waitForTimeout(5000);

          // 查找AI回复
          console.log('🔍 查找AI回复...');
          const responseSelectors = [
            '.ai-response',
            '.chat-response',
            '[class*="message"]',
            '[class*="reply"]',
            '.response-text'
          ];

          let responseElement = null;
          for (const selector of responseSelectors) {
            responseElement = await page.$(selector);
            if (responseElement) {
              console.log(`✅ 找到回复元素: ${selector}`);
              break;
            }
          }

          if (responseElement) {
            const responseText = await responseElement.textContent();
            console.log('🤖 AI回复:', responseText);
            console.log('✅ AI助手功能测试成功！');
          } else {
            console.log('❌ 未找到AI回复元素');
          }
        } else {
          console.log('❌ 未找到发送按钮，尝试按Enter键...');
          await inputElement.press('Enter');
          await page.waitForTimeout(5000);
        }
      } else {
        console.log('❌ 未找到AI输入框');
      }

    } else {
      console.log('❌ 未找到AI助手按钮');
    }

    // 记录测试结果
    console.log('\n📊 AI助手测试结果总结:');
    console.log(`- 控制台消息总数: ${consoleMessages.length}`);
    console.log(`- 控制台错误数: ${consoleMessages.filter(msg => msg.type === 'error').length}`);
    console.log(`- 网络错误数: ${networkErrors.length}`);

    if (networkErrors.length > 0) {
      console.log('\n❌ 网络错误列表:');
      networkErrors.forEach(error => {
        console.log(`- ${error.status} ${error.statusText} - ${error.url}`);
      });
    }

    if (consoleMessages.filter(msg => msg.type === 'error').length > 0) {
      console.log('\n❌ 控制台错误列表:');
      consoleMessages.filter(msg => msg.type === 'error').forEach(msg => {
        console.log(`- ${msg.text}`);
      });
    }

  } catch (error) {
    console.error('💥 测试过程出错:', error.message);
  } finally {
    await browser.close();
  }
}

aiAssistantTest().catch(console.error);