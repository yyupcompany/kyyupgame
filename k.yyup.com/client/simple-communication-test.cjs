const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testSchoolCommunicationPage() {
  console.log('🚀 开始家校沟通页面简化测试...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: { width: 1920, height: 1080 },
    slowMo: 100
  });

  const page = await browser.newPage();

  try {
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

    // 1. 访问家校沟通页面（直接通过URL）
    console.log('📱 直接访问家校沟通页面...');
    await page.goto('http://localhost:5173/#/parent-center/school-communication', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // 2. 截取初始状态
    await page.screenshot({ path: 'communication-01-initial.png', fullPage: true });
    console.log('✅ 已保存初始页面截图');

    // 3. 检查页面元素
    const pageAnalysis = await page.evaluate(() => {
      const getElementsByText = (text) => {
        const elements = [];
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          if (el.textContent && el.textContent.includes(text)) {
            elements.push({
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              text: el.textContent.substring(0, 100)
            });
          }
        }
        return elements;
      };

      return {
        url: window.location.href,
        title: document.title,
        pageTitle: document.querySelector('h1, h2, .page-title, .title')?.textContent || '未找到页面标题',

        // 检查关键元素
        hasSidebar: !!document.querySelector('.sidebar, .el-menu, .nav-menu'),
        hasHeader: !!document.querySelector('.header, .navbar, .app-header'),

        // 家校沟通相关元素
        hasChatContainer: !!document.querySelector('.chat-container, .communication-container, .school-communication'),
        hasTeacherList: !!document.querySelector('.teacher-list, .chat-list, .contact-list, .user-list'),
        hasChatArea: !!document.querySelector('.chat-area, .message-area, .conversation-area'),
        hasMessageInput: !!document.querySelector('textarea, input[type="text"], .message-input, .chat-input'),
        hasSendButton: !!document.querySelector('.send-btn, .send-button, button[class*="send"], button[type="submit"]'),

        // 多媒体和通话功能
        hasImageBtn: !!document.querySelector('[class*="image"], [class*="picture"], .file-upload'),
        hasFileBtn: !!document.querySelector('[class*="file"], .attachment'),
        hasVoiceBtn: !!document.querySelector('[class*="voice"], [class*="audio"], .mic-btn'),
        hasVideoCall: !!document.querySelector('[class*="video"], [class*="call-video"]'),
        hasVoiceCall: !!document.querySelector('[class*="call"], [class*="phone"]'),

        // 计算元素数量
        teacherItems: document.querySelectorAll('.teacher-item, .chat-item, .contact-item, .user-item').length,
        messages: document.querySelectorAll('.message, .chat-message, .msg-item').length,

        // 检查文本内容
        foundTexts: {
          communication: getElementsByText('家校沟通').length > 0,
          teacher: getElementsByText('老师').length > 0,
          message: getElementsByText('消息').length > 0,
          chat: getElementsByText('聊天').length > 0
        },

        // 检查错误元素
        hasError404: document.body.textContent.includes('404') || document.body.textContent.includes('页面未找到'),
        hasErrorGeneral: !!document.querySelector('.error-message, .error, .alert-danger'),

        // 页面加载状态
        bodyText: document.body.textContent.substring(0, 200)
      };
    });

    console.log('📊 页面分析结果:');
    console.log('  URL:', pageAnalysis.url);
    console.log('  页面标题:', pageAnalysis.pageTitle);
    console.log('  侧边栏:', pageAnalysis.hasSidebar ? '✅' : '❌');
    console.log('  聊天容器:', pageAnalysis.hasChatContainer ? '✅' : '❌');
    console.log('  老师列表:', pageAnalysis.hasTeacherList ? '✅' : '❌');
    console.log('  聊天区域:', pageAnalysis.hasChatArea ? '✅' : '❌');
    console.log('  消息输入框:', pageAnalysis.hasMessageInput ? '✅' : '❌');
    console.log('  发送按钮:', pageAnalysis.hasSendButton ? '✅' : '❌');
    console.log('  图片按钮:', pageAnalysis.hasImageBtn ? '✅' : '❌');
    console.log('  文件按钮:', pageAnalysis.hasFileBtn ? '✅' : '❌');
    console.log('  语音按钮:', pageAnalysis.hasVoiceBtn ? '✅' : '❌');
    console.log('  视频通话:', pageAnalysis.hasVideoCall ? '✅' : '❌');
    console.log('  语音通话:', pageAnalysis.hasVoiceCall ? '✅' : '❌');
    console.log('  老师数量:', pageAnalysis.teacherItems);
    console.log('  消息数量:', pageAnalysis.messages);

    if (pageAnalysis.hasError404) {
      console.log('⚠️ 页面显示404错误');
    }
    if (pageAnalysis.hasErrorGeneral) {
      console.log('⚠️ 页面显示一般错误');
    }

    // 4. 如果没有找到内容，可能需要登录
    if (pageAnalysis.hasError404 || !pageAnalysis.hasSidebar) {
      console.log('⚠️ 可能需要先登录，尝试访问登录页面...');
      await page.goto('http://localhost:5173/#/login', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));

      await page.screenshot({ path: 'communication-02-login-page.png', fullPage: true });
      console.log('✅ 已保存登录页面截图');

      // 检查是否需要登录
      const loginPageCheck = await page.evaluate(() => {
        return {
          hasLoginForm: !!document.querySelector('form, input[type="text"], input[type="password"]'),
          hasLoginButton: !!document.querySelector('button[type="submit"], .login-btn, .btn-login'),
          pageText: document.body.textContent.substring(0, 200)
        };
      });

      console.log('📊 登录页面分析:', loginPageCheck);

      if (loginPageCheck.hasLoginForm) {
        console.log('✅ 找到登录表单');
        // 这里可以尝试自动登录，但需要用户名密码
        console.log('⚠️ 需要手动登录后再测试');
      }
    } else {
      // 5. 测试交互功能
      console.log('🎯 开始测试交互功能...');

      // 如果有老师列表，点击第一个老师
      if (pageAnalysis.teacherItems > 0) {
        console.log('👆 点击第一个老师...');
        try {
          await page.click('.teacher-item, .chat-item, .contact-item, .user-item', { timeout: 5000 });
          await new Promise(resolve => setTimeout(resolve, 3000));
          await page.screenshot({ path: 'communication-03-teacher-selected.png', fullPage: true });
          console.log('✅ 已保存选择老师后的截图');
        } catch (e) {
          console.log('⚠️ 无法点击老师项目:', e.message);
        }
      }

      // 测试消息输入
      if (pageAnalysis.hasMessageInput) {
        console.log('✏️ 测试消息输入...');
        try {
          await page.focus('textarea, input[type="text"], .message-input, .chat-input');
          await page.type('textarea, input[type="text"], .message-input, .chat-input', '这是一条测试消息', { delay: 100 });
          await new Promise(resolve => setTimeout(resolve, 2000));
          await page.screenshot({ path: 'communication-04-message-typed.png', fullPage: true });
          console.log('✅ 已保存输入消息后的截图');

          // 尝试发送消息
          if (pageAnalysis.hasSendButton) {
            console.log('📤 尝试发送消息...');
            await page.click('.send-btn, .send-button, button[class*="send"], button[type="submit"]');
            await new Promise(resolve => setTimeout(resolve, 3000));
            await page.screenshot({ path: 'communication-05-message-sent.png', fullPage: true });
            console.log('✅ 已保存发送消息后的截图');
          }
        } catch (e) {
          console.log('⚠️ 消息输入测试失败:', e.message);
        }
      }

      // 6. 测试响应式设计
      console.log('📱 测试响应式设计...');

      // 平板视图
      await page.setViewport({ width: 768, height: 1024 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: 'communication-06-tablet-view.png', fullPage: true });
      console.log('✅ 已保存平板视图截图');

      // 手机视图
      await page.setViewport({ width: 375, height: 667 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: 'communication-07-mobile-view.png', fullPage: true });
      console.log('✅ 已保存手机视图截图');

      // 恢复桌面视图
      await page.setViewport({ width: 1920, height: 1080 });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 7. 生成测试报告
    const testReport = {
      timestamp: new Date().toISOString(),
      pageAnalysis: pageAnalysis,
      consoleMessages: consoleMessages,
      pageErrors: pageErrors,
      screenshots: [
        'communication-01-initial.png',
        'communication-02-login-page.png',
        'communication-03-teacher-selected.png',
        'communication-04-message-typed.png',
        'communication-05-message-sent.png',
        'communication-06-tablet-view.png',
        'communication-07-mobile-view.png'
      ],
      summary: {
        pageLoaded: !pageAnalysis.hasError404,
        hasRequiredElements: pageAnalysis.hasChatContainer && pageAnalysis.hasMessageInput,
        hasTeachers: pageAnalysis.teacherItems > 0,
        hasMultimediaSupport: pageAnalysis.hasImageBtn || pageAnalysis.hasFileBtn || pageAnalysis.hasVoiceBtn,
        hasCallSupport: pageAnalysis.hasVideoCall || pageAnalysis.hasVoiceCall,
        errorsCount: pageErrors.length + consoleMessages.filter(m => m.type === 'error').length
      }
    };

    // 保存测试报告
    fs.writeFileSync('school-communication-test-report.json', JSON.stringify(testReport, null, 2));

    console.log('\n📋 测试总结:');
    console.log('  页面加载成功:', testReport.summary.pageLoaded ? '✅' : '❌');
    console.log('  必要元素存在:', testReport.summary.hasRequiredElements ? '✅' : '❌');
    console.log('  找到老师列表:', testReport.summary.hasTeachers ? '✅' : '❌');
    console.log('  多媒体功能支持:', testReport.summary.hasMultimediaSupport ? '✅' : '❌');
    console.log('  通话功能支持:', testReport.summary.hasCallSupport ? '✅' : '❌');
    console.log('  错误数量:', testReport.summary.errorsCount);
    console.log('  📄 详细报告: school-communication-test-report.json');

    return testReport;

  } catch (error) {
    console.error('❌ 测试过程中出现严重错误:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// 运行测试
testSchoolCommunicationPage().catch(console.error);