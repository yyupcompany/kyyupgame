const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testSchoolCommunication() {
  console.log('🚀 开始家校沟通页面完整功能测试...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    };
    consoleMessages.push(message);

    if (msg.type() === 'error') {
      console.log(`🔴 控制台错误: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      console.log(`🟡 控制台警告: ${msg.text()}`);
    }
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    const errorInfo = {
      message: error.message,
      stack: error.stack
    };
    pageErrors.push(errorInfo);
    console.log(`❌ 页面错误: ${error.message}`);
  });

  try {
    // 1. 访问首页
    console.log('📱 访问应用首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 2. 尝试快捷登录
    console.log('🔑 尝试快捷登录（家长角色）...');

    let loginSuccess = false;
    let userRole = '';

    // 查找家长快捷登录选项
    const loginOptions = [
      { role: '家长', selector: ':text("家长")' },
      { role: '教师', selector: ':text("教师")' },
      { role: '园长', selector: ':text("园长")' },
      { role: '系统管理员', selector: ':text("系统管理员")' }
    ];

    for (const option of loginOptions) {
      try {
        console.log(`🎯 尝试以${option.role}身份登录...`);
        const loginBtn = await page.$(option.selector);

        if (loginBtn) {
          console.log(`✅ 找到${option.role}登录按钮`);
          await loginBtn.click();
          await page.waitForTimeout(3000);

          // 检查登录结果
          const currentUrl = page.url();

          if (!currentUrl.includes('/login')) {
            console.log(`✅ ${option.role}登录成功！`);
            loginSuccess = true;
            userRole = option.role;
            break;
          } else {
            console.log(`❌ ${option.role}登录失败，仍在登录页面`);
          }
        } else {
          console.log(`❌ 未找到${option.role}登录按钮`);
        }
      } catch (error) {
        console.log(`💥 ${option.role}登录测试出错: ${error.message}`);
      }
    }

    if (!loginSuccess) {
      console.log('⚠️ 快捷登录失败，尝试手动登录...');

      // 尝试手动登录（使用测试账号）
      try {
        await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]', 'admin');
        await page.fill('input[placeholder*="密码"], input[name="password"]', '123456');
        await page.click('button[type="submit"], .login-btn, :text("登录")');
        await page.waitForTimeout(5000);

        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          console.log('✅ 手动登录成功！');
          loginSuccess = true;
          userRole = '手动登录用户';
        }
      } catch (error) {
        console.log('❌ 手动登录也失败了:', error.message);
      }
    }

    if (!loginSuccess) {
      throw new Error('无法登录系统，跳过后续测试');
    }

    // 3. 截取登录后首页
    await page.screenshot({ path: 'communication-test-01-dashboard.png', fullPage: true });
    console.log('✅ 已保存登录后首页截图');

    // 4. 查找家长中心或相关导航
    console.log('🔍 查找家校沟通相关菜单...');

    let communicationPageFound = false;

    // 尝试多种方式找到家校沟通页面
    const navigationStrategies = [
      {
        name: '侧边栏菜单',
        action: async () => {
          const menuItems = await page.$$('a[href], .el-menu-item, .nav-item, [role="menuitem"]');

          for (const item of menuItems) {
            const text = await item.textContent();
            const href = await item.getAttribute('href');

            if (text && (
              text.includes('家校沟通') ||
              text.includes('沟通') ||
              text.includes('家长中心') ||
              text.includes('消息') ||
              text.includes('聊天')
            )) {
              console.log(`✅ 找到菜单项: ${text}`);

              if (href) {
                await page.goto(`http://localhost:5173${href}`);
              } else {
                await item.click();
              }

              await page.waitForTimeout(3000);
              return true;
            }
          }
          return false;
        }
      },
      {
        name: '直接URL访问',
        action: async () => {
          const possibleUrls = [
            '/#/parent-center/school-communication',
            '/#/school-communication',
            '/#/communication',
            '/#/parent/communication',
            '/#/chat'
          ];

          for (const url of possibleUrls) {
            try {
              console.log(`🔗 尝试访问URL: ${url}`);
              await page.goto(`http://localhost:5173${url}`, {
                waitUntil: 'networkidle',
                timeout: 10000
              });

              await page.waitForTimeout(3000);

              // 检查是否成功到达沟通页面
              const hasCommunicationElements = await page.evaluate(() => {
                return !!(
                  document.querySelector('.chat-container') ||
                  document.querySelector('.communication-container') ||
                  document.querySelector('[class*="chat"]') ||
                  document.querySelector('[class*="communication"]') ||
                  document.body.textContent.includes('家校沟通') ||
                  document.body.textContent.includes('老师')
                );
              });

              if (hasCommunicationElements) {
                console.log('✅ 成功到达家校沟通页面');
                return true;
              }
            } catch (error) {
              console.log(`❌ 访问${url}失败:`, error.message);
            }
          }
          return false;
        }
      }
    ];

    for (const strategy of navigationStrategies) {
      try {
        console.log(`🎯 尝试策略: ${strategy.name}`);
        const success = await strategy.action();

        if (success) {
          communicationPageFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ 策略"${strategy.name}"失败:`, error.message);
      }
    }

    if (!communicationPageFound) {
      console.log('⚠️ 未找到家校沟通页面，将测试当前页面...');
    }

    // 5. 分析当前页面
    const pageAnalysis = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasChatElements: !!(
          document.querySelector('.chat-container') ||
          document.querySelector('.communication-container') ||
          document.querySelector('[class*="chat"]') ||
          document.querySelector('[class*="communication"]')
        ),
        hasTeacherList: !!(
          document.querySelector('.teacher-list') ||
          document.querySelector('.user-list') ||
          document.querySelector('.contact-list')
        ),
        hasMessageArea: !!(
          document.querySelector('.message-area') ||
          document.querySelector('.chat-area') ||
          document.querySelector('textarea')
        ),
        hasSendButton: !!(
          document.querySelector('.send-btn') ||
          document.querySelector('[class*="send"]')
        ),
        hasMultimediaButtons: !!(
          document.querySelector('[class*="image"]') ||
          document.querySelector('[class*="file"]') ||
          document.querySelector('[class*="voice"]')
        ),
        hasCallButtons: !!(
          document.querySelector('[class*="video"]') ||
          document.querySelector('[class*="call"]')
        ),
        bodyText: document.body.textContent.substring(0, 500)
      };
    });

    console.log('📊 页面分析结果:');
    console.log('  当前URL:', pageAnalysis.url);
    console.log('  聊天相关元素:', pageAnalysis.hasChatElements ? '✅' : '❌');
    console.log('  老师列表:', pageAnalysis.hasTeacherList ? '✅' : '❌');
    console.log('  消息区域:', pageAnalysis.hasMessageArea ? '✅' : '❌');
    console.log('  发送按钮:', pageAnalysis.hasSendButton ? '✅' : '❌');
    console.log('  多媒体按钮:', pageAnalysis.hasMultimediaButtons ? '✅' : '❌');
    console.log('  通话按钮:', pageAnalysis.hasCallButtons ? '✅' : '❌');

    // 6. 截取当前页面
    await page.screenshot({ path: 'communication-test-02-current-page.png', fullPage: true });
    console.log('✅ 已保存当前页面截图');

    // 7. 如果找到沟通相关元素，进行功能测试
    if (pageAnalysis.hasChatElements || pageAnalysis.hasMessageArea) {
      console.log('🎯 开始功能测试...');

      // 测试点击老师/用户
      if (pageAnalysis.hasTeacherList) {
        try {
          const firstUser = await page.$('.teacher-item, .user-item, .contact-item, [class*="item"]');
          if (firstUser) {
            console.log('👆 点击第一个用户...');
            await firstUser.click();
            await page.waitForTimeout(3000);

            await page.screenshot({ path: 'communication-test-03-user-selected.png', fullPage: true });
            console.log('✅ 已保存选择用户后的截图');
          }
        } catch (error) {
          console.log('⚠️ 点击用户失败:', error.message);
        }
      }

      // 测试消息输入
      if (pageAnalysis.hasMessageArea) {
        try {
          console.log('✏️ 测试消息输入...');

          const inputSelector = 'textarea, input[type="text"], [class*="input"]';
          await page.focus(inputSelector);
          await page.fill(inputSelector, '这是一条测试消息，用于验证家校沟通功能是否正常工作。');

          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'communication-test-04-message-input.png', fullPage: true });
          console.log('✅ 已保存输入消息后的截图');

          // 测试发送消息
          if (pageAnalysis.hasSendButton) {
            console.log('📤 测试发送消息...');
            await page.click('.send-btn, [class*="send"], button[type="submit"]');
            await page.waitForTimeout(3000);

            await page.screenshot({ path: 'communication-test-05-message-sent.png', fullPage: true });
            console.log('✅ 已保存发送消息后的截图');
          }
        } catch (error) {
          console.log('⚠️ 消息功能测试失败:', error.message);
        }
      }

      // 测试多媒体按钮
      if (pageAnalysis.hasMultimediaButtons) {
        try {
          console.log('📎 测试多媒体按钮...');
          const mediaBtn = await page.$('[class*="image"], [class*="file"], [class*="voice"]');
          if (mediaBtn) {
            await mediaBtn.click();
            await page.waitForTimeout(2000);

            await page.screenshot({ path: 'communication-test-06-media-click.png', fullPage: true });
            console.log('✅ 已保存点击多媒体按钮后的截图');
          }
        } catch (error) {
          console.log('⚠️ 多媒体按钮测试失败:', error.message);
        }
      }

      // 测试通话按钮
      if (pageAnalysis.hasCallButtons) {
        try {
          console.log('📞 测试通话按钮...');
          const callBtn = await page.$('[class*="video"], [class*="call"]');
          if (callBtn) {
            await callBtn.click();
            await page.waitForTimeout(2000);

            await page.screenshot({ path: 'communication-test-07-call-click.png', fullPage: true });
            console.log('✅ 已保存点击通话按钮后的截图');
          }
        } catch (error) {
          console.log('⚠️ 通话按钮测试失败:', error.message);
        }
      }
    }

    // 8. 测试响应式设计
    console.log('📱 测试响应式设计...');

    // 平板视图
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'communication-test-08-tablet-view.png', fullPage: true });
    console.log('✅ 已保存平板视图截图');

    // 手机视图
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'communication-test-09-mobile-view.png', fullPage: true });
    console.log('✅ 已保存手机视图截图');

    // 恢复桌面视图
    await page.setViewport({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);

    // 9. 生成测试报告
    const testReport = {
      timestamp: new Date().toISOString(),
      userRole: userRole,
      loginSuccess: loginSuccess,
      communicationPageFound: communicationPageFound,
      pageAnalysis: pageAnalysis,
      consoleMessages: consoleMessages,
      pageErrors: pageErrors,
      screenshots: [
        'communication-test-01-dashboard.png',
        'communication-test-02-current-page.png',
        'communication-test-03-user-selected.png',
        'communication-test-04-message-input.png',
        'communication-test-05-message-sent.png',
        'communication-test-06-media-click.png',
        'communication-test-07-call-click.png',
        'communication-test-08-tablet-view.png',
        'communication-test-09-mobile-view.png'
      ],
      summary: {
        totalConsoleMessages: consoleMessages.length,
        consoleErrors: consoleMessages.filter(m => m.type === 'error').length,
        consoleWarnings: consoleMessages.filter(m => m.type === 'warning').length,
        pageErrors: pageErrors.length,
        featuresWorking: {
          login: loginSuccess,
          pageLoad: communicationPageFound,
          chatInterface: pageAnalysis.hasChatElements,
          teacherList: pageAnalysis.hasTeacherList,
          messageInput: pageAnalysis.hasMessageArea,
          sendButton: pageAnalysis.hasSendButton,
          multimediaSupport: pageAnalysis.hasMultimediaButtons,
          callSupport: pageAnalysis.hasCallButtons
        }
      }
    };

    // 保存详细报告
    fs.writeFileSync('school-communication-detailed-report.json', JSON.stringify(testReport, null, 2));

    // 生成人类可读的摘要报告
    const summaryReport = `
# 家校沟通页面测试报告

## 测试基本信息
- 测试时间: ${testReport.timestamp}
- 登录角色: ${testReport.userRole}
- 登录状态: ${testReport.loginSuccess ? '✅ 成功' : '❌ 失败'}
- 页面访问: ${testReport.communicationPageFound ? '✅ 成功' : '❌ 失败'}

## 功能测试结果
- 聊天界面: ${testReport.summary.featuresWorking.chatInterface ? '✅' : '❌'}
- 老师列表: ${testReport.summary.featuresWorking.teacherList ? '✅' : '❌'}
- 消息输入: ${testReport.summary.featuresWorking.messageInput ? '✅' : '❌'}
- 发送按钮: ${testReport.summary.featuresWorking.sendButton ? '✅' : '❌'}
- 多媒体支持: ${testReport.summary.featuresWorking.multimediaSupport ? '✅' : '❌'}
- 通话功能: ${testReport.summary.featuresWorking.callSupport ? '✅' : '❌'}

## 错误统计
- 控制台错误: ${testReport.summary.consoleErrors}
- 控制台警告: ${testReport.summary.consoleWarnings}
- 页面错误: ${testReport.summary.pageErrors}

## 测试截图
${testReport.screenshots.map((screenshot, index) => `${index + 1}. ${screenshot}`).join('\n')}

## 详细信息
详细的测试数据已保存在: school-communication-detailed-report.json
`;

    fs.writeFileSync('school-communication-test-summary.md', summaryReport);

    console.log('\n📋 测试总结:');
    console.log('=====================================');
    console.log(`登录状态: ${testReport.loginSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`页面访问: ${testReport.communicationPageFound ? '✅ 成功' : '❌ 失败'}`);
    console.log(`聊天界面: ${testReport.summary.featuresWorking.chatInterface ? '✅ 正常' : '❌ 异常'}`);
    console.log(`消息功能: ${testReport.summary.featuresWorking.messageInput && testReport.summary.featuresWorking.sendButton ? '✅ 正常' : '❌ 异常'}`);
    console.log(`多媒体功能: ${testReport.summary.featuresWorking.multimediaSupport ? '✅ 正常' : '❌ 异常'}`);
    console.log(`通话功能: ${testReport.summary.featuresWorking.callSupport ? '✅ 正常' : '❌ 异常'}`);
    console.log(`控制台错误: ${testReport.summary.consoleErrors} 个`);
    console.log(`页面错误: ${testReport.summary.pageErrors} 个`);
    console.log('=====================================');
    console.log('📄 详细报告: school-communication-detailed-report.json');
    console.log('📊 摘要报告: school-communication-test-summary.md');

    return testReport;

  } catch (error) {
    console.error('❌ 测试过程中出现严重错误:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// 运行测试
testSchoolCommunication().catch(console.error);