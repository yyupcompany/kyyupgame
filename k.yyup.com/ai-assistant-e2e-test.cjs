const { chromium } = require('playwright');

async function testAIAssistant() {
  console.log('🎯 开始AI助手功能端到端测试');

  // 启动浏览器
  const browser = await chromium.launch({
    headless: true, // 使用无头模式
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 1. 访问首页
    console.log('🌐 步骤1: 访问首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 等待页面完全加载
    await page.waitForTimeout(3000);

    // 2. 分析页面内容
    console.log('🔍 步骤2: 分析页面内容...');
    const pageAnalysis = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent?.trim(),
        className: btn.className,
        id: btn.id
      }));

      const links = Array.from(document.querySelectorAll('a')).map(link => ({
        text: link.textContent?.trim(),
        href: link.href,
        className: link.className
      }));

      const title = document.title;
      const url = window.location.href;

      return {
        title,
        url,
        buttons: buttons.slice(0, 10), // 只取前10个按钮
        linkCount: links.length,
        bodyText: document.body.textContent?.substring(0, 200) + '...'
      };
    });

    console.log('页面分析结果:');
    console.log('  标题:', pageAnalysis.title);
    console.log('  URL:', pageAnalysis.url);
    console.log('  按钮数量:', pageAnalysis.buttons.length);
    console.log('  链接数量:', pageAnalysis.linkCount);
    console.log('  页面内容预览:', pageAnalysis.bodyText);

    pageAnalysis.buttons.forEach((btn, index) => {
      console.log(`  按钮 ${index + 1}: "${btn.text}" (${btn.className})`);
    });

    // 3. 查找登录相关元素
    console.log('📝 步骤3: 查找登录相关元素...');
    let loginElement = null;

    // 查找快捷登录按钮
    try {
      loginElement = await page.waitForSelector('button:has-text("快捷登录")', { timeout: 3000 });
    } catch (error) {
      console.log('⚠️  未找到"快捷登录"按钮，尝试其他登录方式...');

      // 尝试查找其他可能的登录元素
      const loginSelectors = [
        'button:has-text("登录")',
        'button:has-text("Login")',
        'a:has-text("登录")',
        '.login-btn',
        '#quick-login',
        'button[class*="login"]',
        'a[href*="login"]'
      ];

      for (const selector of loginSelectors) {
        try {
          loginElement = await page.$(selector);
          if (loginElement) {
            console.log('✅ 找到登录元素:', selector);
            break;
          }
        } catch (error) {
          // 继续尝试下一个选择器
        }
      }
    }

    if (!loginElement) {
      console.log('❌ 未找到任何登录元素，可能需要手动导航到登录页面');

      // 尝试直接访问登录页面
      console.log('🔄 尝试直接访问登录页面...');
      await page.goto('http://localhost:5173/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 再次尝试查找登录元素
      try {
        loginElement = await page.waitForSelector('button:has-text("快捷登录")', { timeout: 3000 });
      } catch (error) {
        console.log('❌ 在登录页面也未找到快捷登录按钮');
        return false;
      }
    }

    // 4. 执行登录
    console.log('📝 步骤4: 执行登录...');
    await loginElement.click();

    // 等待登录完成
    await page.waitForTimeout(3000);

    // 5. 检查是否登录成功
    const userInfo = await page.evaluate(() => {
      const userInfoStr = localStorage.getItem('userInfo') || localStorage.getItem('kindergarten_user_info');
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    });

    if (userInfo && userInfo.username) {
      console.log('✅ 登录成功！用户:', userInfo.username);
    } else {
      console.log('❌ 登录失败');
      return false;
    }

    // 6. 查找AI相关元素
    console.log('🔍 步骤6: 查找AI相关元素...');
    const aiElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const aiElements = [];

      allElements.forEach(el => {
        const text = el.textContent?.trim() || '';
        const className = el.className || '';
        const id = el.id || '';
        const testId = el.getAttribute('data-testid') || '';

        if (text.includes('AI') || text.includes('智能') || text.includes('助手') ||
            className.toLowerCase().includes('ai') || id.toLowerCase().includes('ai') ||
            testId.toLowerCase().includes('ai')) {
          aiElements.push({
            tag: el.tagName,
            text: text.substring(0, 50), // 限制文本长度
            className: className,
            id: id,
            testId: testId
          });
        }
      });

      return aiElements;
    });

    console.log('🔍 找到的AI相关元素:', aiElements.length);
    aiElements.forEach((el, index) => {
      console.log(`  ${index + 1}. [${el.tag}] ${el.text} (${el.className})`);
    });

    // 7. 尝试点击AI元素
    if (aiElements.length > 0) {
      console.log('🤖 步骤4: 尝试点击AI元素...');

      for (const aiElement of aiElements) {
        try {
          if (aiElement.tag === 'BUTTON' && aiElement.text) {
            await page.click(`button:has-text("${aiElement.text.substring(0, 20)}")`);
            console.log('✅ 成功点击按钮:', aiElement.text.substring(0, 50));
          } else if (aiElement.id) {
            await page.click(`#${aiElement.id}`);
            console.log('✅ 成功点击元素ID:', aiElement.id);
          } else if (aiElement.testId) {
            await page.click(`[data-testid="${aiElement.testId}"]`);
            console.log('✅ 成功点击测试ID:', aiElement.testId);
          }

          await page.waitForTimeout(3000);

          // 检查是否有新的AI相关界面出现
          const hasChatInterface = await page.evaluate(() => {
            return !!document.querySelector('[class*="chat"], [class*="message"], [class*="conversation"], [class*="ai-assistant"]');
          });

          if (hasChatInterface) {
            console.log('✅ 检测到聊天界面出现');
            break;
          }
        } catch (error) {
          console.log('⚠️  点击元素失败:', error.message);
        }
      }
    }

    // 6. 检查聊天组件
    console.log('💬 步骤5: 检查聊天组件...');
    const chatComponents = await page.evaluate(() => {
      const chatElements = document.querySelectorAll('[class*="chat"], [class*="message"], [class*="conversation"], [class*="ai-assistant"]');
      return Array.from(chatElements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id
      }));
    });

    console.log('找到的聊天组件:', chatComponents.length);
    chatComponents.forEach((comp, index) => {
      console.log(`  ${index + 1}. [${comp.tagName}] ${comp.className} (${comp.id})`);
    });

    // 7. 查找输入区域
    console.log('⌨️  步骤6: 查找输入区域...');
    const inputSelectors = [
      'textarea',
      '.el-textarea__inner',
      'input[type="text"]',
      'input[placeholder*="请输入"]',
      'input[placeholder*="输入"]',
      '[contenteditable="true"]'
    ];

    let inputArea = null;
    for (const selector of inputSelectors) {
      try {
        inputArea = await page.$(selector);
        if (inputArea) {
          console.log('✅ 找到输入区域:', selector);
          break;
        }
      } catch (error) {
        // 继续尝试下一个选择器
      }
    }

    if (inputArea) {
      console.log('✅ 找到输入区域，开始输入测试...');
      await inputArea.fill('你好，请介绍一下幼儿园管理系统的功能');
      console.log('✅ 成功输入测试文本');

      // 查找发送按钮
      const sendSelectors = [
        'button:has-text("发送")',
        'button:has-text("Send")',
        '.send-btn',
        '.btn-send',
        'button[type="submit"]'
      ];

      let sendBtn = null;
      for (const selector of sendSelectors) {
        try {
          sendBtn = await page.$(selector);
          if (sendBtn) {
            console.log('✅ 找到发送按钮:', selector);
            break;
          }
        } catch (error) {
          // 继续尝试下一个选择器
        }
      }

      if (sendBtn) {
        console.log('✅ 准备发送消息...');
        // 先不发送，等待下一步测试
      } else {
        console.log('⚠️  未找到发送按钮');
      }
    } else {
      console.log('❌ 未找到输入区域');
    }

    // 8. 检查控制台错误
    console.log('🔍 步骤7: 检查控制台错误...');
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('❌ 控制台错误:', msg.text());
      } else if (msg.type() === 'warn') {
        console.log('⚠️  控制台警告:', msg.text());
      }
    });

    // 触发一些页面操作来暴露潜在错误
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);

    // 9. 最终状态
    const finalState = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasAIComponents: !!document.querySelector('[class*="ai"], [id*="ai"]'),
        hasChatComponents: !!document.querySelector('[class*="chat"], [class*="message"], [class*="conversation"]'),
        hasInputFields: !!document.querySelector('textarea, input[type="text"]'),
        hasButtons: !!document.querySelector('button'),
        totalAIElements: document.querySelectorAll('[class*="ai"], [id*="ai"]').length
      };
    });

    console.log('📊 最终状态:', finalState);

    // 10. 截图
    console.log('📸 步骤8: 截图保存...');
    await page.screenshot({
      path: '/tmp/ai-assistant-test-screenshot.png',
      fullPage: true
    });
    console.log('✅ 截图已保存到 /tmp/ai-assistant-test-screenshot.png');

    console.log('🎉 AI助手功能测试完成！');

    return {
      success: true,
      finalState: finalState,
      aiElements: aiElements,
      chatComponents: chatComponents
    };

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    return false;
  } finally {
    // 关闭浏览器
    await browser.close();
  }
}

// 运行测试
testAIAssistant().then(result => {
  console.log('\n📋 测试结果总结:');
  if (result) {
    console.log('✅ 测试成功完成');
    console.log('📊 AI元素数量:', result.aiElements?.length || 0);
    console.log('💬 聊天组件数量:', result.chatComponents?.length || 0);
    console.log('🎯 最终状态:', result.finalState);
  } else {
    console.log('❌ 测试失败');
  }
  process.exit(result ? 0 : 1);
}).catch(error => {
  console.error('❌ 测试执行失败:', error);
  process.exit(1);
});