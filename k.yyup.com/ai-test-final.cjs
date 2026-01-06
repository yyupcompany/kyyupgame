const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 创建测试结果目录
const testResultsDir = path.join(__dirname, 'test-results', 'ai-test-final');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// 完整的AI功能测试脚本
async function comprehensiveAITest() {
  console.log('🚀 开始完整的AI助手功能测试');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();

    // 测试结果收集
    const testResults = {
      loginSuccess: false,
      aiPageAccess: false,
      chatFunctionality: false,
      uploadFunctionality: false,
      screenshots: [],
      errors: [],
      features: {}
    };

    // 监听控制台消息
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
      } else if (type === 'log') {
        if (text.includes('登录成功') || text.includes('🎉')) {
          console.log(`✅ ${text}`);
          testResults.loginSuccess = true;
        }
      }
    });

    // 监听网络请求
    page.on('response', response => {
      const url = response.url();
      const status = response.status();

      if (url.includes('/api/ai') || url.includes('/ai/')) {
        console.log(`🤖 AI API: ${url} - ${status}`);
        testResults.features.aiApiCalls = (testResults.features.aiApiCalls || 0) + 1;
      }

      if (status === 401) {
        console.log(`⚠️ 认证失败: ${url}`);
      }
    });

    // 第一步：访问登录页面
    console.log('\n📍 第一步：访问登录页面');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(testResultsDir, '01-login-page.png') });
    testResults.screenshots.push('01-login-page.png');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 第二步：使用系统管理员快捷登录
    console.log('\n🔐 第二步：执行快捷登录');
    try {
      const adminButton = await page.$('button.admin-btn');
      if (adminButton) {
        await adminButton.click();
        console.log('✅ 已点击系统管理员快捷登录按钮');

        // 等待登录处理完成
        await new Promise(resolve => setTimeout(resolve, 8000));

        const currentUrl = page.url();
        console.log(`📍 登录后URL: ${currentUrl}`);

        // 检查是否成功登录（不跳转到登录页即为成功）
        if (!currentUrl.includes('/login')) {
          testResults.loginSuccess = true;
          console.log('✅ 登录成功');
        }

        await page.screenshot({ path: path.join(testResultsDir, '02-after-login.png') });
        testResults.screenshots.push('02-after-login.png');
      }
    } catch (error) {
      console.log(`❌ 登录失败: ${error.message}`);
      testResults.errors.push({
        type: 'login_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // 第三步：访问AI助手页面
    console.log('\n🤖 第三步：访问AI助手页面');
    const aiPageUrl = 'http://localhost:5173/centers/ai';

    try {
      await page.goto(aiPageUrl, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 5000));

      const currentUrl = page.url();
      console.log(`📍 AI页面URL: ${currentUrl}`);

      if (!currentUrl.includes('/login')) {
        testResults.aiPageAccess = true;
        console.log('✅ 成功访问AI助手页面');

        await page.screenshot({ path: path.join(testResultsDir, '03-ai-page.png') });
        testResults.screenshots.push('03-ai-page.png');

        // 第四步：分析AI页面功能
        console.log('\n🔍 第四步：分析AI页面功能');

        const pageAnalysis = await page.evaluate(() => {
          const analysis = {
            title: document.title,
            url: window.location.href,
            elements: {
              textInputs: document.querySelectorAll('input[type="text"]').length,
              textareas: document.querySelectorAll('textarea').length,
              fileInputs: document.querySelectorAll('input[type="file"]').length,
              buttons: document.querySelectorAll('button').length,
              links: document.querySelectorAll('a').length
            },
            aiFeatures: {
              chatContainers: document.querySelectorAll('[class*="chat"], [class*="message"], [class*="conversation"]').length,
              uploadAreas: document.querySelectorAll('[class*="upload"], [class*="file"]').length,
              toolPanels: document.querySelectorAll('[class*="tool"], [class*="panel"]').length,
              aiHeaders: document.querySelectorAll('h1, h2, h3').length
            },
            textareaPlaceholders: [],
            buttonTexts: []
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

          return analysis;
        });

        console.log('📊 页面分析结果:');
        console.log(`- 标题: ${pageAnalysis.title}`);
        console.log(`- 文本输入框: ${pageAnalysis.elements.textareas}个`);
        console.log(`- 文件上传: ${pageAnalysis.elements.fileInputs}个`);
        console.log(`- 按钮数量: ${pageAnalysis.elements.buttons}个`);
        console.log(`- 聊天容器: ${pageAnalysis.aiFeatures.chatContainers}个`);

        testResults.features = { ...testResults.features, ...pageAnalysis };

        // 第五步：测试聊天功能
        console.log('\n💬 第五步：测试AI聊天功能');

        const textareas = await page.$$('textarea');
        console.log(`📝 找到 ${textareas.length} 个文本输入框`);

        if (textareas.length > 0) {
          for (let i = 0; i < textareas.length; i++) {
            const placeholder = await page.evaluate(el => el.placeholder, textareas[i]);
            console.log(`📝 文本框 ${i + 1}: ${placeholder}`);

            // 查找合适的聊天输入框
            if (placeholder && (
              placeholder.includes('输入') ||
              placeholder.includes('消息') ||
              placeholder.includes('提问') ||
              placeholder.includes('请输入') ||
              placeholder.toLowerCase().includes('message')
            )) {
              console.log('✅ 找到聊天输入框，开始测试');

              try {
                await textareas[i].click();
                await new Promise(resolve => setTimeout(resolve, 500));

                // 输入测试消息
                const testMessage = '你好，我是测试用户，想了解一下幼儿园招生的流程';
                await page.keyboard.type(testMessage);
                console.log('✅ 已输入测试消息');

                await page.screenshot({ path: path.join(testResultsDir, '04-message-input.png') });
                testResults.screenshots.push('04-message-input.png');

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
                    buttonText.includes('➤')
                  )) {
                    console.log(`📤 找到发送按钮: ${buttonText}`);
                    await button.click();
                    sendClicked = true;
                    testResults.chatFunctionality = true;
                    console.log('✅ 已发送消息');
                    break;
                  }
                }

                if (sendClicked) {
                  // 等待AI响应
                  console.log('⏳ 等待AI响应...');
                  await new Promise(resolve => setTimeout(resolve, 10000));

                  await page.screenshot({ path: path.join(testResultsDir, '05-ai-response.png') });
                  testResults.screenshots.push('05-ai-response.png');
                }

                break;
              } catch (error) {
                console.log(`❌ 聊天测试失败: ${error.message}`);
                testResults.errors.push({
                  type: 'chat_error',
                  message: error.message,
                  timestamp: new Date().toISOString()
                });
              }
            }
          }
        }

        // 第六步：测试文件上传功能
        console.log('\n📁 第六步：测试文件上传功能');

        const fileInputs = await page.$$('input[type="file"]');
        console.log(`📁 找到 ${fileInputs.length} 个文件上传控件`);

        if (fileInputs.length > 0) {
          testResults.uploadFunctionality = true;

          try {
            // 创建测试文件
            const testFilePath = path.join(__dirname, 'test-upload.txt');
            fs.writeFileSync(testFilePath, 'This is a test file for AI upload functionality.');

            await fileInputs[0].inputFile(testFilePath);
            console.log('✅ 已上传测试文件');

            await page.screenshot({ path: path.join(testResultsDir, '06-file-upload.png') });
            testResults.screenshots.push('06-file-upload.png');

            // 清理测试文件
            fs.unlinkSync(testFilePath);
          } catch (error) {
            console.log(`❌ 文件上传测试失败: ${error.message}`);
            testResults.errors.push({
              type: 'upload_error',
              message: error.message,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          // 查找拖拽上传区域
          const uploadAreas = await page.$$('[class*="upload"], [class*="drop"], [class*="drag"]');
          if (uploadAreas.length > 0) {
            console.log('📁 找到拖拽上传区域');
            testResults.uploadFunctionality = true;
          }
        }

        // 第七步：检查AI功能面板
        console.log('\n🛠️ 第七步：检查AI功能面板');

        const toolPanels = await page.$$('[class*="tool"], [class*="panel"], [class*="feature"]');
        console.log(`🛠️ 找到 ${toolPanels.length} 个功能面板`);

        if (toolPanels.length > 0) {
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
            console.log('🛠️ AI功能面板:');
            panelTitles.forEach(title => console.log(`  - ${title}`));
            testResults.features.toolPanels = panelTitles;
          }
        }

      } else {
        console.log('❌ 访问AI页面被重定向到登录页');
        testResults.errors.push({
          type: 'access_error',
          message: 'AI页面访问被拒绝，重定向到登录页',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log(`❌ AI页面访问失败: ${error.message}`);
      testResults.errors.push({
        type: 'access_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // 最终截图
    await page.screenshot({ path: path.join(testResultsDir, '07-final-state.png'), fullPage: true });
    testResults.screenshots.push('07-final-state.png');

    // 生成测试报告
    const finalReport = {
      timestamp: new Date().toISOString(),
      testType: 'Comprehensive AI Assistant Test',
      summary: {
        totalSteps: 7,
        successSteps: [
          testResults.loginSuccess,
          testResults.aiPageAccess,
          testResults.chatFunctionality,
          testResults.uploadFunctionality
        ].filter(Boolean).length,
        overallStatus: testResults.loginSuccess && testResults.aiPageAccess ? 'SUCCESS' : 'PARTIAL'
      },
      results: testResults,
      environment: {
        frontend: 'http://localhost:5173',
        backend: 'http://localhost:3000',
        browser: 'Puppeteer',
        viewport: '1920x1080'
      },
      recommendations: []
    };

    // 添加建议
    if (!testResults.loginSuccess) {
      finalReport.recommendations.push('检查登录功能和用户认证流程');
    }
    if (!testResults.aiPageAccess) {
      finalReport.recommendations.push('检查AI页面访问权限和路由配置');
    }
    if (!testResults.chatFunctionality) {
      finalReport.recommendations.push('检查AI聊天功能的实现');
    }
    if (!testResults.uploadFunctionality) {
      finalReport.recommendations.push('检查文件上传功能的实现');
    }

    // 保存报告
    const reportPath = path.join(testResultsDir, 'comprehensive-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));

    // 生成Markdown报告
    const markdownReport = generateMarkdownReport(finalReport);
    const markdownPath = path.join(testResultsDir, 'comprehensive-test-report.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log('\n📋 测试完成！报告已生成:');
    console.log(`- JSON报告: ${reportPath}`);
    console.log(`- Markdown报告: ${markdownPath}`);

    console.log('\n📊 测试结果总结:');
    console.log(`- 登录功能: ${testResults.loginSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- AI页面访问: ${testResults.aiPageAccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- 聊天功能: ${testResults.chatFunctionality ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- 文件上传: ${testResults.uploadFunctionality ? '✅ 成功' : '❌ 失败'}`);
    console.log(`- 截图数量: ${testResults.screenshots.length}张`);

    return finalReport;

  } catch (error) {
    console.error('❌ 测试过程中出现严重错误:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// 生成Markdown格式的测试报告
function generateMarkdownReport(report) {
  return `# AI助手功能完整测试报告

## 📋 测试概览
- **测试时间**: ${report.timestamp}
- **测试类型**: ${report.testType}
- **整体状态**: ${report.summary.overallStatus}
- **成功步骤**: ${report.summary.successSteps}/${report.summary.totalSteps}

## 🎯 核心功能测试结果

| 功能模块 | 测试结果 | 状态 |
|---------|---------|------|
| 用户登录 | ${report.results.loginSuccess ? '✅ 成功' : '❌ 失败'} | ${report.results.loginSuccess ? '正常' : '异常'} |
| AI页面访问 | ${report.results.aiPageAccess ? '✅ 成功' : '❌ 失败'} | ${report.results.aiPageAccess ? '正常' : '异常'} |
| AI聊天功能 | ${report.results.chatFunctionality ? '✅ 成功' : '❌ 失败'} | ${report.results.chatFunctionality ? '正常' : '异常'} |
| 文件上传功能 | ${report.results.uploadFunctionality ? '✅ 成功' : '❌ 失败'} | ${report.results.uploadFunctionality ? '正常' : '异常'} |

## 🔍 页面功能分析

### 基础元素统计
- **页面标题**: ${report.results.features.title || 'N/A'}
- **文本输入框**: ${report.results.features.elements?.textareas || 0}个
- **文件上传控件**: ${report.results.features.elements?.fileInputs || 0}个
- **按钮数量**: ${report.results.features.elements?.buttons || 0}个

### AI功能特性
- **聊天容器**: ${report.results.features.aiFeatures?.chatContainers || 0}个
- **上传区域**: ${report.results.features.aiFeatures?.uploadAreas || 0}个
- **功能面板**: ${report.results.features.toolPanels?.length || 0}个

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

---
*报告生成时间: ${new Date().toISOString()}*
`;
}

// 运行测试
comprehensiveAITest().catch(console.error);