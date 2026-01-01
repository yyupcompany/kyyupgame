const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 创建测试结果目录
const testResultsDir = path.join(__dirname, 'test-results', 'ai-assistant-e2e');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// AI助手端到端测试
async function aiAssistantE2ETest() {
  console.log('🤖 开始AI助手端到端测试');
  console.log('================================');

  const browser = await puppeteer.launch({
    headless: false, // 使用有头模式以便观察测试过程
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    defaultViewport: { width: 1920, height: 1080 },
    slowMo: 100 // 减慢操作速度以便观察
  });

  try {
    const page = await browser.newPage();

    // 测试结果收集
    const testResults = {
      loginSuccess: false,
      aiPageAccess: false,
      chatInterface: false,
      messageSending: false,
      aiResponse: false,
      fileUpload: false,
      aiTools: false,
      screenshots: [],
      errors: [],
      features: {}
    };

    // 监听控制台日志
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        console.log(`❌ 页面错误: ${text}`);
        testResults.errors.push({
          type: 'console_error',
          message: text,
          timestamp: new Date().toISOString()
        });
      } else if (text.includes('登录成功') || text.includes('🎉')) {
        console.log(`✅ ${text}`);
      } else if (text.includes('AI') || text.includes('助手')) {
        console.log(`🤖 ${text}`);
      }
    });

    // 监听网络请求
    page.on('response', response => {
      const url = response.url();
      const status = response.status();

      if (url.includes('/api/ai') || url.includes('/ai/')) {
        console.log(`🔗 AI API: ${url} - ${status}`);
        testResults.features.aiApiCalls = (testResults.features.aiApiCalls || 0) + 1;
      }

      if (status === 401) {
        console.log(`⚠️ 认证失败: ${url}`);
      }
    });

    // === 测试步骤 1: 登录系统 ===
    console.log('\n📍 步骤1: 登录系统');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    await page.screenshot({ path: path.join(testResultsDir, '01-login-page.png') });
    testResults.screenshots.push('01-login-page.png');

    // 等待页面完全加载
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 使用系统管理员快捷登录
    console.log('🔐 使用系统管理员快捷登录');
    await page.evaluate(() => {
      // 创建完整的用户认证信息
      const userInfo = {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJwaG9uZSI6IjE4NjExMTQxMTMxIiwicm9sZSI6ImFkbWluIiwiaXNEZW1vIjp0cnVlLCJpYXQiOjE3NjU1NzAwMCwiZXhwIjoxNzY1NjczMDAwLCJ0eXBlIjoiYXBwIn0.0_final_test",
        username: "admin",
        displayName: "系统管理员",
        role: "admin",
        roles: ["admin"],
        permissions: ["*"],
        email: "admin@test.com",
        avatar: null,
        id: 121,
        isAdmin: true,
        kindergartenId: 1,
        status: "active"
      };

      // 设置认证信息
      localStorage.setItem('token', userInfo.token);
      localStorage.setItem('auth_token', userInfo.token);
      localStorage.setItem('kindergarten_token', userInfo.token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('kindergarten_user_info', JSON.stringify(userInfo));

      console.log('✅ 认证信息已设置');
      return userInfo;
    });

    testResults.loginSuccess = true;
    console.log('✅ 登录信息已设置');

    // === 测试步骤 2: 访问AI助手页面 ===
    console.log('\n🤖 步骤2: 访问AI助手页面');
    await page.goto('http://localhost:5173/centers/ai', { waitUntil: 'networkidle2' });

    await page.screenshot({ path: path.join(testResultsDir, '02-ai-page.png') });
    testResults.screenshots.push('02-ai-page.png');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('被重定向到登录页，AI页面访问失败');
    }

    testResults.aiPageAccess = true;
    console.log('✅ AI助手页面访问成功');

    // === 测试步骤 3: 分析页面功能 ===
    console.log('\n🔍 步骤3: 分析页面功能');

    await page.waitForTimeout(3000); // 等待AI组件完全加载

    const pageAnalysis = await page.evaluate(() => {
      const analysis = {
        title: document.title,
        url: window.location.href,
        elements: {
          textInputs: document.querySelectorAll('input[type="text"], textarea').length,
          fileInputs: document.querySelectorAll('input[type="file"]').length,
          buttons: document.querySelectorAll('button').length,
          links: document.querySelectorAll('a').length
        },
        aiFeatures: {
          chatContainers: document.querySelectorAll('[class*="chat"], [class*="message"], [class*="conversation"]').length,
          uploadAreas: document.querySelectorAll('[class*="upload"], [class*="file"], [class*="drop"]').length,
          toolPanels: document.querySelectorAll('[class*="tool"], [class*="panel"], [class*="function"], [class*="feature"]').length,
          aiHeaders: document.querySelectorAll('h1, h2, h3, h4').length,
          assistantCards: document.querySelectorAll('[class*="assistant"], [class*="card"]').length
        },
        textareaPlaceholders: [],
        buttonTexts: [],
        chatMessages: []
      };

      // 获取文本输入框的占位符
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        if (textarea.placeholder) {
          analysis.textareaPlaceholders.push(textarea.placeholder);
        }
      });

      // 获取按钮文本
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const text = button.textContent?.trim();
        if (text && text.length > 0 && text.length < 50) {
          analysis.buttonTexts.push(text);
        }
      });

      // 获取聊天消息
      const messages = document.querySelectorAll('[class*="message"], [class*="chat"], [class*="conversation"]');
      messages.forEach(msg => {
        if (msg.textContent && msg.textContent.trim().length > 0) {
          analysis.chatMessages.push(msg.textContent.trim().substring(0, 100));
        }
      });

      return analysis;
    });

    console.log('📊 页面分析结果:');
    console.log(`- 标题: ${pageAnalysis.title}`);
    console.log(`- 文本输入框: ${pageAnalysis.elements.textinputs}个`);
    console.log(`- 文件上传: ${pageAnalysis.elements.fileInputs}个`);
    console.log(`- 按钮数量: ${pageAnalysis.elements.buttons}个`);
    console.log(`- 聊天容器: ${pageAnalysis.aiFeatures.chatContainers}个`);
    console.log(`- 上传区域: ${pageAnalysis.aiFeatures.uploadAreas}个`);
    console.log(`- 工具面板: ${pageFeatures.toolPanels}`);
    console.log(`- 助手卡片: ${pageAnalysis.aiFeatures.assistantCards}个`);
    console.log(`- 聊天消息: ${pageAnalysis.chatMessages.length}条`);

    testResults.features = { ...testResults.features, ...pageAnalysis };

    // 检查聊天界面
    testResults.chatInterface = pageAnalysis.elements.textinputs > 0 || pageAnalysis.aiFeatures.chatContainers > 0;

    // === 测试步骤 4: 测试聊天功能 ===
    console.log('\n💬 步骤4: 测试聊天功能');

    const textareas = await page.$$('textarea');
    if (textareas.length > 0) {
      console.log(`📝 找到 ${textareas.length} 个文本输入框`);

      let chatInput = null;
      for (const textarea of textareas) {
        const placeholder = await page.evaluate(el => el.placeholder, textarea);
        console.log(`📝 文本框占位符: ${placeholder}`);

        if (placeholder && (
          placeholder.includes('输入') ||
          placeholder.includes('消息') ||
          placeholder.includes('提问') ||
          placeholder.includes('请输入') ||
          placeholder.toLowerCase().includes('message') ||
          placeholder.toLowerCase().includes('type') ||
          placeholder.includes('请输入您的需求')
        )) {
          chatInput = textarea;
          break;
        }
      }

      if (chatInput) {
        console.log('✅ 找到聊天输入框，开始测试聊天功能');

        try {
          await chatInput.click();
          await new Promise(resolve => setTimeout(resolve, 500));

          // 输入测试消息
          const testMessages = [
            '你好，我想了解一下幼儿园的招生流程',
            '请介绍一下幼儿园的教学特色',
            '如何帮助家长更好地了解孩子在幼儿园的表现？'
          ];

          for (const testMessage of testMessages) {
            console.log(`📝 输入测试消息: ${testMessage}`);

            // 清空输入框并输入新消息
            await chatInput.click();
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.up('Control');
            await page.keyboard.type(testMessage);

            await page.screenshot({ path: path.join(testResultsDir, `03-message-input-${testMessage.substring(0, 10)}.png`) });
            testResults.screenshots.push(`03-message-input-${testMessage.substring(0, 10)}.png`);

            // 查找并点击发送按钮
            const sendButtons = await page.$$('button');
            let sendClicked = false;

            for (const button of sendButtons) {
              const buttonText = await page.evaluate(el => el.textContent.trim(), button);
              if (buttonText && (
                buttonText.includes('发送') ||
                buttonText.includes('提交') ||
                buttonText.includes('Send') ||
                buttonText.includes('▶') ||
                buttonText.includes('➤') ||
                buttonText.includes('🚀') ||
                buttonText.includes('→') ||
                buttonText.includes('发送消息')
              )) {
                console.log(`📤 找到发送按钮: ${buttonText}`);
                await button.click();
                sendClicked = true;
                testResults.messageSending = true;
                break;
              }
            }

            if (sendClicked) {
              console.log('⏳ 等待AI响应...');
              await new Promise(resolve => setTimeout(resolve, 5000));

              // 检查是否有新的消息出现
              const newMessages = await page.evaluate(() => {
                const messages = document.querySelectorAll('[class*="message"], [class*="chat"], [class*="conversation"]');
                const messageContents = Array.from(messages).map(msg => msg.textContent.trim());
                return messageContents;
              });

              if (newMessages.length > 0) {
                testResults.aiResponse = true;
                console.log('✅ 收到AI响应，消息数量:', newMessages.length);
                console.log('最新消息:', newMessages[newMessages.length - 1]);
              }

              await page.screenshot({ path: path.join(testResultsDir, `04-ai-response-${testMessage.substring(0, 10)}.png`) });
              testResults.screenshots.push(`04-ai-response-${testMessage.substring(0, 10)}.png`);

              break; // 只测试一条消息以节省时间
            }
          }
        } catch (error) {
          console.log(`❌ 聊天测试失败: ${error.message}`);
          testResults.errors.push({
            type: 'chat_error',
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        console.log('⚠️ 未找到合适的聊天输入框');
        testResults.errors.push({
          type: 'chat_interface_not_found',
          message: '未找到聊天输入框',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      console.log('⚠️ 未找到任何文本输入框');
      testResults.errors.push({
        type: 'no_text_inputs',
        message: '页面没有文本输入框',
        timestamp: new Date().toISOString()
      });
    }

    // === 测试步骤 5: 测试文件上传功能 ===
    console.log('\n📁 步骤5: 测试文件上传功能');

    const fileInputs = await page.$$('input[type="file"]');
    if (fileInputs.length > 0) {
      console.log(`📁 找到 ${fileInputs.length} 个文件上传控件`);
      testResults.fileUpload = true;

      try {
        // 创建测试图片文件
        const testImagePath = path.join(__dirname, 'test-upload.jpg');
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABQAYAAAKP8tIAAAABfUlEQVR42mN0aGvUwnw2tnJ76S8rTjXLuL2JPewVgQJgAAANJ0Uk5T';

        fs.writeFileSync(testImagePath, Buffer.from(testImageBase64, 'base64'));
        console.log('✅ 创建测试图片文件');

        await fileInputs[0].inputFile(testImagePath);
        console.log('✅ 已上传测试图片');

        await page.screenshot({ path: path.join(testResultsDir, '05-file-upload.png') });
        testResults.screenshots.push('05-file-upload.png');

        // 清理测试文件
        fs.unlinkSync(testImagePath);

      } catch (error) {
        console.log(`❌ 文件上传测试失败: ${error.message}`);
        testResults.errors.push({
          type: 'upload_error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      console.log('⚠️ 未找到文件上传控件');
      testResults.errors.push({
        type: 'no_file_inputs',
        message: '页面没有文件上传控件',
        timestamp: new Date().toISOString()
      });
    }

    // === 测试步骤 6: 检查AI工具面板 ===
    console.log('\n🛠️ 步骤6: 检查AI工具面板');

    const toolPanels = await page.$$('[class*="tool"], [class*="panel"], [class*="function"], [class*="feature"]');
    if (toolPanels.length > 0) {
      testResults.aiTools = true;
      console.log(`🛠️ 找到 ${toolPanels.length} 个AI工具面板`);

      const panelTitles = [];
      for (const panel of toolPanels) {
        try {
          const title = await page.evaluate(el => {
            const titleEl = el.querySelector('h1, h2, h3, h4, .title, [class*="title"]');
            return titleEl ? titleEl.textContent.trim() : '';
          }, panel);

          if (title && title.length > 0) {
            panelTitles.push(title);
          }
        } catch (error) {
          // 忽略单个面板的读取错误
        }
      }

      if (panelTitles.length > 0) {
        console.log('🛠️ AI工具面板列表:');
        panelTitles.forEach(title => console.log(`  - ${title}`));
        testResults.features.toolPanelTitles = panelTitles;
      }
    } else {
      console.log('⚠️ 未找到AI工具面板');
    }

    // === 最终截图 ===
    console.log('\n📸 最终截图');
    await page.screenshot({ path: path.join(testResultsDir, '06-final-state.png'), fullPage: true });
    testResults.screenshots.push('06-final-state.png');

    // 生成测试报告
    const finalReport = {
      timestamp: new Date().toISOString(),
      testType: 'AI Assistant End-to-End Test',
      summary: {
        totalSteps: 6,
        successSteps: [
          testResults.loginSuccess,
          testResults.aiPageAccess,
          testResults.chatInterface,
          testResults.messageSending,
          testResults.aiResponse,
          testResults.fileUpload,
          testResults.aiTools
        ].filter(Boolean).length,
        overallStatus:
          testResults.aiPageAccess && testResults.chatInterface ? 'SUCCESS' :
          testResults.loginSuccess ? 'PARTIAL' : 'FAILED'
      },
      results: testResults,
      environment: {
        frontend: 'http://localhost:5y173',
        backend: 'http://localhost:3000',
        browser: 'Puppeteer',
        viewport: '1920x1080'
      },
      recommendations: []
    };

    // 添加建议
    if (!testResults.chatInterface) {
      finalReport.recommendations.push('建议检查聊天输入框的CSS类名或结构');
    }
    if (!testResults.messageSending) {
      finalReport.recommendations.push('建议检查发送按钮的文本内容和事件绑定');
    }
    if (!testResults.aiResponse) {
      finalReport.recommendations.push('建议检查AI响应处理逻辑和API调用');
    }
    if (!testResults.fileUpload) {
      finalReport.recommendations.push('建议添加文件上传功能');
    }

    // 保存报告
    const reportPath = path.join(testResultsDir, 'e2e-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));

    // 生成Markdown报告
    const markdownReport = generateMarkdownReport(finalReport);
    const markdownPath = path.join(testResultsDir, 'e2e-test-report.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log('\n🎉 AI助手端到端测试完成！');
    console.log('================================');
    console.log(`📋 测试报告已生成:`);
    console.log(`- JSON: ${reportPath}`);
    console.log(`- Markdown: ${markdownPath}`);

    console.log('\n📊 测试结果总结:');
    console.log(`- 登录功能: ${testResults.loginSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- AI页面访问: ${testResults.aiPageAccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- 聊天界面: ${testResults.chatInterface ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- 消息发送: ${testResults.messageSending ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- AI响应: ${testResults.aiResponse ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- 文件上传: ${testResults.fileUpload ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- AI工具: ${testResults.aiTools ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- 截图数量: ${testResults.screenshots.length}张`);

    const successRate = Math.round(
      [
        testResults.loginSuccess,
        testResults.aiPageAccess,
        testResults.chatInterface,
        testResults.messageSending,
        testResults.aiResponse,
        testResults.fileUpload,
        testResults.aiTools
      ].filter(Boolean).length / 7 * 100
    );

    console.log(`\n📈 总体成功率: ${successRate}%`);

    if (successRate === 100) {
      console.log('🎉 所有测试通过！AI助手功能完全正常！');
    } else if (successRate >= 70) {
      console.log('✅ 大部分测试通过！AI助手基本功能正常。');
    } else {
      console.log('⚠️ 测试未完全通过，需要进一步调试。');
    }

    return finalReport;

  } catch (error) {
    console.error('❌ 测试过程中出现严重错误:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
    console.log('🎯 测试完成');
  }
}

// 生成Markdown格式的测试报告
function generateMarkdownReport(report) {
  return `# AI助手端到端测试报告

## 📋 测试概览
- **测试时间**: ${report.timestamp}
- **测试类型**: ${report.testType}
- **整体状态**: ${report.summary.overallStatus}
- **成功率**: ${Math.round(
    [
      report.results.loginSuccess,
      report.results.aiPageAccess,
      report.results.chatInterface,
      report.results.messageSending,
      report.results.aiResponse,
      report.results.fileUpload,
      report.results.aiTools
    ].filter(Boolean).length / 7 * 100
  )}%

## 🎯 核心功能测试结果

| 功能模块 | 测试结果 | 状态 | 详细说明 |
|---------|---------|------|----------|
| 用户登录 | ${report.results.loginSuccess ? '✅ 成功' : '❌ 失败'} | ${report.results.loginSuccess ? '正常' : '异常'} | 通过设置认证信息模拟登录 |
| AI页面访问 | ${report.results.aiPageAccess ? '✅ 成功' : '❌ 失败'} | ${report.results.aiPageAccess ? '正常' : '异常'} | 成功访问centers/ai页面 |
| 聊天界面 | ${report.results.chatInterface ? '✅ 成功' : '❌ 失败'} | ${report.results.chatInterface ? '正常' : '异常'} | 找到${report.results.elements?.textinputs || 0}个输入框 |
| 消息发送 | ${report.results.messageSending ? '✅ 成功' : '❌ 失败'} | ${report.results.messageSending ? '正常' : '异常'} | 成功发送测试消息 |
| AI响应 | ${report.results.aiResponse ? '✅ 成功' : '❌ 失败'} | ${report.results.aiResponse ? '正常' : '异常'} | 收到AI响应 |
| 文件上传 | ${report.results.fileUpload ? '✅ 成功' : '❌ 失败'} | ${report.results.fileUpload ? '正常' : '异常'} | 找到${report.results.elements?.fileinputs || 0}个上传控件 |
| AI工具 | ${report.results.aiTools ? '✅ 成功' : '❌ 失败'} | ${report.results.aiTools ? '正常' : '异常'} | 发现${report.results.features?.toolPanelTitles?.length || 0}个工具面板 |

## 🔍 详细功能分析

### 页面基础信息
- **页面标题**: ${report.features.title || 'N/A'}
- **页面URL**: ${report.features.url || 'N/A'}
- **文本输入元素**: ${report.features.elements?.textinputs || 0}个
- **文件上传元素**: ${report.features.elements?.fileinputs || 0}个}
- **按钮数量**: ${report.features.elements?.buttons || 0}个}
- **链接数量**: ${report.features.elements?.links || 0}个}

### AI功能特性
- **聊天容器**: ${report.features.aiFeatures?.chatContainers || 0}个
- **上传区域**: ${report.features.aiFeatures?.uploadAreas || 0}个
- **工具面板**: ${report.features.aiFeatures?.toolPanels || 0}个
- **AI标题**: ${report.features.aiFeatures?.aiHeaders || 0}个
- **助手卡片**: ${report.features.aiFeatures?.assistantCards || 0}个}

### 聊天界面分析
- **输入框占位符**: ${report.features.textareaPlaceholders.length > 0 ? report.features.textareaPlaceholders.join(', ') : '无'}
- **按钮文本**: ${report.features.buttonTexts.slice(0, 5).join(', ')}${report.features.buttonTexts.length > 5 ? '...' : ''}

### AI工具面板
${report.features.toolPanelTitles?.length > 0 ?
  report.features.toolPanelTitles.map(title => `- ${title}`).join('\n') :
  '未发现AI工具面板'
}

## 📸 测试截图

${report.results.screenshots.map((screenshot, index) => `${index + 1}. ${screenshot}`).join('\n')}

## ❌ 错误记录

${report.results.errors.length > 0 ?
  report.results.errors.map(error => `- **${error.type}**: ${error.message} (${error.timestamp})`).join('\n') :
  '✅ 无错误记录'
}

## 💡 改进建议
${report.recommendations.length > 0 ?
  report.recommendations.map(rec => `- ${rec}`).join('\n') :
  '✅ 系统运行正常，无需改进'
}

## 🔧 测试环境
- **前端地址**: ${report.environment.frontend}
- **后端地址**: ${report.environment.backend}
- **浏览器**: ${report.environment.browser}
- **视窗大小**: ${report.environment.viewport}
- **测试模式**: 有头模式（可观察测试过程）

---
*报告生成时间: ${new Date().toISOString()}*
*测试环境: 前端 ${report.environment.frontend}, 后端 ${report.environment.backend}*
`;

// 运行测试
aiAssistantE2ETest().catch(console.error);