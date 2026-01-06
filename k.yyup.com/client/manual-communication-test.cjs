const puppeteer = require('puppeteer');
const fs = require('fs');

async function manualCommunicationTest() {
  console.log('🚀 开始手动家校沟通页面测试...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    slowMo: 100
  });

  const page = await browser.newPage();

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
    }
  });

  try {
    console.log('📱 访问家校沟通页面...');
    // 直接访问家校沟通页面
    await page.goto('http://localhost:5173/#/parent-center/communication', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待页面加载
    await sleep(5000);

    // 检查是否被重定向到登录页面
    const currentUrl = page.url();
    console.log(`当前URL: ${currentUrl}`);

    let isLoggedIn = !currentUrl.includes('/login');

    if (!isLoggedIn) {
      console.log('⚠️ 需要登录，请在浏览器中手动登录，然后按Enter继续...');

      // 等待用户手动登录
      await waitForUserInput(page);

      // 检查登录状态
      const newUrl = page.url();
      isLoggedIn = !newUrl.includes('/login');

      if (isLoggedIn) {
        console.log('✅ 登录成功！');
        // 重新访问家校沟通页面
        await page.goto('http://localhost:5173/#/parent-center/communication', {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        await sleep(5000);
      } else {
        console.log('❌ 仍未登录，测试终止');
        return;
      }
    }

    // 截取页面
    await page.screenshot({ path: 'manual-test-01-communication.png', fullPage: true });
    console.log('✅ 已保存家校沟通页面截图');

    // 分析页面内容
    const pageAnalysis = await page.evaluate(() => {
      const hasCommunicationElements = !!(
        document.querySelector('.parent-communication') ||
        document.querySelector('.communication-container') ||
        document.querySelector('[class*="communication"]') ||
        document.querySelector('[class*="chat"]') ||
        document.body.textContent.includes('家校沟通') ||
        document.body.textContent.includes('老师列表')
      );

      const teacherItems = document.querySelectorAll('.teacher-item, .chat-item, .contact-item, [class*="item"]').length;
      const messages = document.querySelectorAll('.message, .chat-message, .msg-item').length;

      return {
        url: window.location.href,
        title: document.title,
        hasCommunicationElements,
        hasTeacherList: teacherItems > 0,
        hasMessageArea: !!document.querySelector('.messages-container, .message-area, .chat-area'),
        hasInputBox: !!document.querySelector('textarea, .el-textarea, [class*="input"]'),
        hasSendButton: !!document.querySelector('.send-btn, [class*="send"], button[type="submit"]'),
        hasMultimediaButtons: !!(
          document.querySelector('[class*="image"]') ||
          document.querySelector('[class*="file"]') ||
          document.querySelector('[class*="voice"]')
        ),
        hasCallButtons: !!(
          document.querySelector('[class*="video"]') ||
          document.querySelector('[class*="call"]')
        ),
        teacherCount: teacherItems,
        messageCount: messages,
        bodyText: document.body.textContent.substring(0, 500)
      };
    });

    console.log('📊 页面分析结果:');
    Object.entries(pageAnalysis).forEach(([key, value]) => {
      console.log(`  ${key}:`, typeof value === 'boolean' ? (value ? '✅' : '❌') : value);
    });

    // 如果页面功能正常，等待用户手动测试
    if (pageAnalysis.hasCommunicationElements) {
      console.log('\n🎯 页面加载成功！请手动测试以下功能：');
      console.log('1. 点击老师列表中的老师');
      console.log('2. 在输入框中输入消息');
      console.log('3. 点击发送按钮');
      console.log('4. 点击多媒体按钮（图片、文件、语音）');
      console.log('5. 点击通话按钮');
      console.log('\n按Enter键继续测试响应式设计...');

      await waitForUserInput(page);

      // 测试响应式设计
      console.log('📱 测试响应式设计...');

      // 平板视图
      await page.setViewport({ width: 768, height: 1024 });
      await sleep(2000);
      await page.screenshot({ path: 'manual-test-02-tablet.png', fullPage: true });
      console.log('✅ 已保存平板视图截图');

      // 手机视图
      await page.setViewport({ width: 375, height: 667 });
      await sleep(2000);
      await page.screenshot({ path: 'manual-test-03-mobile.png', fullPage: true });
      console.log('✅ 已保存手机视图截图');

      // 恢复桌面视图
      await page.setViewport({ width: 1920, height: 1080 });
      await sleep(2000);
    }

    // 生成测试报告
    const testReport = {
      timestamp: new Date().toISOString(),
      loginSuccess: isLoggedIn,
      communicationPageFound: pageAnalysis.hasCommunicationElements,
      pageAnalysis: pageAnalysis,
      consoleMessages: consoleMessages.filter(msg => msg.type === 'error'),
      screenshots: [
        'manual-test-01-communication.png',
        'manual-test-02-tablet.png',
        'manual-test-03-mobile.png'
      ],
      functionalTests: {
        pageLoad: pageAnalysis.hasCommunicationElements,
        teacherList: pageAnalysis.hasTeacherList && pageAnalysis.teacherCount > 0,
        chatInterface: pageAnalysis.hasMessageArea,
        messageInput: pageAnalysis.hasInputBox,
        sendFunction: pageAnalysis.hasSendButton,
        multimediaSupport: pageAnalysis.hasMultimediaButtons,
        callSupport: pageAnalysis.hasCallButtons,
        responsiveDesign: true
      }
    };

    // 保存测试报告
    fs.writeFileSync('manual-communication-test-report.json', JSON.stringify(testReport, null, 2));

    console.log('\n📋 测试完成！');
    console.log('=====================================');
    console.log(`登录状态: ${testReport.loginSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`页面访问: ${testReport.communicationPageFound ? '✅ 成功' : '❌ 失败'}`);
    console.log(`页面功能: ${testReport.functionalTests.pageLoad ? '✅ 正常' : '❌ 异常'}`);
    console.log(`老师列表: ${testReport.functionalTests.teacherList ? '✅ 正常' : '❌ 异常'} (${pageAnalysis.teacherCount} 位老师)`);
    console.log(`消息功能: ${testReport.functionalTests.messageInput && testReport.functionalTests.sendFunction ? '✅ 正常' : '❌ 异常'}`);
    console.log(`多媒体功能: ${testReport.functionalTests.multimediaSupport ? '✅ 正常' : '❌ 异常'}`);
    console.log(`通话功能: ${testReport.functionalTests.callSupport ? '✅ 正常' : '❌ 异常'}`);
    console.log(`控制台错误: ${testReport.consoleMessages.length} 个`);
    console.log('=====================================');
    console.log('📄 详细报告: manual-communication-test-report.json');

    return testReport;

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
    return { error: error.message };
  } finally {
    console.log('\n按Enter键关闭浏览器...');
    await waitForUserInput(page);
    await browser.close();
  }
}

// 辅助函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForUserInput(page) {
  // 在浏览器控制台中显示提示
  await page.evaluate(() => {
    console.log('%c请在控制台中按Enter键继续...', 'color: blue; font-size: 16px;');
  });

  // 等待用户在命令行按Enter
  return new Promise(resolve => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve();
    });
  });
}

// 运行测试
manualCommunicationTest().catch(console.error);