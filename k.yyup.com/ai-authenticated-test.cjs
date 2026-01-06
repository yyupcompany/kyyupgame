const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 创建测试结果目录
const testResultsDir = path.join(__dirname, 'test-results', 'authenticated-ai-test');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// 使用真实登录的AI测试脚本
async function authenticatedAITest() {
  console.log('🚀 开始已认证的AI助手测试');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();

    // 监听控制台消息
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`❌ 页面错误: ${text}`);
      } else if (type === 'log' && text.includes('登录成功')) {
        console.log(`✅ ${text}`);
      }
    });

    // 监听网络请求
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/') && response.status() === 401) {
        console.log(`⚠️ API认证失败: ${url}`);
      } else if (url.includes('/api/ai') || url.includes('/ai/')) {
        console.log(`🤖 AI API调用: ${url} - ${response.status()}`);
      }
    });

    // 访问登录页面
    console.log('📍 访问登录页面');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(testResultsDir, '01-login-page.png') });

    // 等待页面加载完成
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 查找并点击系统管理员快捷登录按钮
    console.log('🔐 使用系统管理员快捷登录');
    try {
      const adminButton = await page.$('button.admin-btn');
      if (adminButton) {
        await adminButton.click();
        console.log('✅ 已点击系统管理员快捷登录按钮');

        // 等待登录处理
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 检查是否登录成功（跳转或页面变化）
        const currentUrl = page.url();
        console.log(`📍 当前URL: ${currentUrl}`);

        if (!currentUrl.includes('/login')) {
          console.log('✅ 登录成功，已跳转到主页');
        } else {
          console.log('⚠️ 仍在登录页面，可能登录失败');
        }

        await page.screenshot({ path: path.join(testResultsDir, '02-after-login.png') });
      } else {
        console.log('❌ 未找到系统管理员快捷登录按钮');

        // 尝试手动登录
        console.log('🔄 尝试手动登录...');
        await page.type('input[data-testid="username-input"], input[placeholder*="用户名"]', 'admin');
        await page.type('input[data-testid="password-input"], input[placeholder*="密码"]', '123456');
        await page.click('button[data-testid="login-button"]');

        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.screenshot({ path: path.join(testResultsDir, '02-manual-login.png') });
      }
    } catch (error) {
      console.log(`❌ 登录过程出错: ${error.message}`);
    }

    // 访问AI助手页面
    console.log('🤖 访问AI助手页面');
    const aiPageUrls = [
      'http://localhost:5173/centers/ai',
      'http://localhost:5173/ai-assistant',
      'http://localhost:5173/ai',
      'http://localhost:5173/assistant'
    ];

    let aiPageFound = false;
    for (const url of aiPageUrls) {
      try {
        console.log(`🔍 尝试访问: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));

        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          console.log(`✅ 成功访问AI页面: ${url}`);
          await page.screenshot({ path: path.join(testResultsDir, `03-ai-page-${path.basename(url)}.png`) });
          aiPageFound = true;
          break;
        } else {
          console.log(`⚠️ 访问 ${url} 被重定向到登录页`);
        }
      } catch (error) {
        console.log(`❌ 访问 ${url} 失败: ${error.message}`);
      }
    }

    if (!aiPageFound) {
      console.log('⚠️ 无法直接访问AI页面，尝试从导航进入');

      // 尝试查找AI相关的导航链接
      try {
        const aiLinks = await page.$$('a[href*="ai"], button:contains("AI"), span:contains("AI")');
        console.log(`🔍 找到 ${aiLinks.length} 个AI相关链接`);

        for (let i = 0; i < aiLinks.length; i++) {
          try {
            await aiLinks[i].click();
            await new Promise(resolve => setTimeout(resolve, 3000));

            const currentUrl = page.url();
            if (!currentUrl.includes('/login')) {
              console.log(`✅ 通过导航访问AI页面成功`);
              await page.screenshot({ path: path.join(testResultsDir, '03-nav-ai-page.png') });
              aiPageFound = true;
              break;
            }
          } catch (error) {
            console.log(`❌ 点击AI链接失败: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`❌ 查找AI导航链接失败: ${error.message}`);
      }
    }

    // 如果找到了AI页面，进行功能测试
    if (aiPageFound) {
      console.log('🧪 开始AI功能测试');

      // 等待页面完全加载
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 分析页面元素
      const pageAnalysis = await page.evaluate(() => {
        const analysis = {
          title: document.title,
          url: window.location.href,
          inputElements: {
            textInputs: document.querySelectorAll('input[type="text"]').length,
            textareas: document.querySelectorAll('textarea').length,
            fileInputs: document.querySelectorAll('input[type="file"]').length,
            allInputs: document.querySelectorAll('input').length
          },
          aiFeatures: {
            chatInterfaces: document.querySelectorAll('.chat, .message, [class*="chat"], [class*="message"]').length,
            uploadInterfaces: document.querySelectorAll('.upload, [class*="upload"], input[type="file"]').length,
            aiButtons: document.querySelectorAll('button:contains("AI"), button:contains("助手"), [class*="ai"]').length
          },
          buttons: document.querySelectorAll('button').length,
          links: document.querySelectorAll('a').length,
          hasError: document.querySelector('.error, .alert, [class*="error"]') !== null
        };

        // 查找文本输入框的占位符
        const textareas = document.querySelectorAll('textarea');
        const placeholders = [];
        textareas.forEach(textarea => {
          if (textarea.placeholder) {
            placeholders.push(textarea.placeholder);
          }
        });

        analysis.textareaPlaceholders = placeholders;

        return analysis;
      });

      console.log('📊 页面分析结果:');
      console.log(JSON.stringify(pageAnalysis, null, 2));

      // 尝试找到聊天输入框并发送测试消息
      const textareas = await page.$$('textarea');
      if (textareas.length > 0) {
        console.log(`💬 找到 ${textareas.length} 个文本输入框`);

        for (let i = 0; i < textareas.length; i++) {
          const placeholder = await page.evaluate(el => el.placeholder, textareas[i]);
          console.log(`📝 文本框 ${i + 1} 占位符: ${placeholder}`);

          if (placeholder && (
            placeholder.includes('输入') ||
            placeholder.includes('消息') ||
            placeholder.includes('提问') ||
            placeholder.includes('聊天') ||
            placeholder.includes('请输入')
          )) {
            console.log('✅ 找到聊天输入框，尝试发送测试消息');

            try {
              await textareas[i].click();
              await page.keyboard.type('你好，我想了解一下幼儿园招生的相关信息');

              await page.screenshot({ path: path.join(testResultsDir, '04-message-typed.png') });

              // 查找发送按钮
              const sendButtons = await page.$$('button');
              for (const button of sendButtons) {
                const buttonText = await page.evaluate(el => el.textContent, button);
                if (buttonText && (
                  buttonText.includes('发送') ||
                  buttonText.includes('提交') ||
                  buttonText.includes('发送消息')
                )) {
                  console.log(`📤 找到发送按钮: ${buttonText}`);
                  await button.click();
                  console.log('✅ 已点击发送按钮');

                  // 等待AI响应
                  await new Promise(resolve => setTimeout(resolve, 10000));
                  await page.screenshot({ path: path.join(testResultsDir, '05-message-sent-response.png') });
                  break;
                }
              }

              break;
            } catch (error) {
              console.log(`❌ 发送消息失败: ${error.message}`);
            }
          }
        }
      }

      // 测试文件上传功能
      const fileInputs = await page.$$('input[type="file"]');
      if (fileInputs.length > 0) {
        console.log(`📁 找到 ${fileInputs.length} 个文件上传输入框`);

        try {
          // 创建一个测试文件
          const testFilePath = path.join(__dirname, 'test-image.txt');
          fs.writeFileSync(testFilePath, 'This is a test file for AI upload');

          await fileInputs[0].inputFile(testFilePath);
          console.log('✅ 已上传测试文件');

          await page.screenshot({ path: path.join(testResultsDir, '06-file-uploaded.png') });

          // 清理测试文件
          fs.unlinkSync(testFilePath);
        } catch (error) {
          console.log(`❌ 文件上传失败: ${error.message}`);
        }
      }

    } else {
      console.log('❌ 未能找到AI页面进行测试');
    }

    // 最终截图
    await page.screenshot({ path: path.join(testResultsDir, '07-final-state.png'), fullPage: true });
    console.log('📸 已保存最终状态截图');

    // 生成测试报告
    const testReport = {
      timestamp: new Date().toISOString(),
      testType: 'Authenticated AI Assistant Test',
      results: {
        loginSuccess: aiPageFound,
        aiPageFound: aiPageFound,
        screenshotCount: 7
      },
      environment: {
        frontend: 'http://localhost:5173',
        backend: 'http://localhost:3000',
        browser: 'Puppeteer'
      }
    };

    const reportPath = path.join(testResultsDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));

    console.log('📋 测试报告已生成:', reportPath);

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    await browser.close();
    console.log('🎉 测试完成');
  }
}

// 运行测试
authenticatedAITest().catch(console.error);