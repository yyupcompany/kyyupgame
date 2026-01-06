const puppeteer = require('puppeteer');
const path = require('path');

async function testParentSchoolCommunication() {
  console.log('🚀 开始家校沟通页面功能测试...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  try {
    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // 监听页面错误
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push({
        message: error.message,
        stack: error.stack
      });
    });

    // 1. 访问系统
    console.log('📱 访问系统首页...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 2. 截取首页
    await page.screenshot({ path: 'test-01-homepage.png', fullPage: true });
    console.log('✅ 已保存首页截图');

    // 3. 查找并点击家长中心
    console.log('🔍 查找家长中心菜单...');

    // 等待侧边栏加载
    await page.waitForSelector('.el-menu-vertical', { timeout: 10000 });

    // 查找家长中心菜单项
    const parentCenterLink = await page.evaluate(() => {
      const menuItems = document.querySelectorAll('.el-menu-item');
      for (let item of menuItems) {
        if (item.textContent.includes('家长中心')) {
          return item;
        }
      }
      return null;
    });

    if (parentCenterLink) {
      console.log('✅ 找到家长中心菜单');
      await parentCenterLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('❌ 未找到家长中心菜单，尝试其他方式...');
      // 尝试直接通过URL访问
      await page.goto('http://localhost:5173/#/parent-center/school-communication', { waitUntil: 'networkidle0' });
    }

    // 4. 查找家校沟通页面
    console.log('🔍 查找家校沟通页面...');

    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 查找家校沟通链接
    const communicationLink = await page.evaluate(() => {
      const links = document.querySelectorAll('a, .el-menu-item, .router-link');
      for (let link of links) {
        if (link.textContent.includes('家校沟通') || link.textContent.includes('沟通') ||
            link.href && link.href.includes('communication')) {
          return link;
        }
      }
      return null;
    });

    if (communicationLink) {
      console.log('✅ 找到家校沟通链接');
      await communicationLink.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('⚠️ 未找到家校沟通链接，直接访问URL');
      await page.goto('http://localhost:5173/#/parent-center/school-communication', { waitUntil: 'networkidle0' });
    }

    // 5. 等待家校沟通页面加载
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.screenshot({ path: 'test-02-communication-page.png', fullPage: true });
    console.log('✅ 已保存家校沟通页面截图');

    // 6. 分析页面结构
    const pageStructure = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasChatList: !!document.querySelector('.chat-list, .teacher-list, .contact-list'),
        hasChatArea: !!document.querySelector('.chat-area, .message-area, .conversation'),
        hasInputBox: !!document.querySelector('textarea, input[type="text"], .message-input'),
        hasSendButton: !!document.querySelector('.send-btn, .send-button, button[type="submit"]'),
        hasMultimediaButtons: !!document.querySelector('.multimedia-btn, .media-btn, .file-btn, .image-btn, .voice-btn'),
        hasCallButtons: !!document.querySelector('.call-btn, .video-call, .voice-call'),
        teacherCount: document.querySelectorAll('.teacher-item, .chat-item, .contact-item')?.length || 0,
        messagesCount: document.querySelectorAll('.message, .chat-message')?.length || 0
      };
    });

    console.log('📊 页面结构分析:', pageStructure);

    // 7. 测试老师列表
    if (pageStructure.teacherCount > 0) {
      console.log(`✅ 发现 ${pageStructure.teacherCount} 位老师`);

      // 点击第一位老师
      const firstTeacher = await page.$('.teacher-item, .chat-item, .contact-item');
      if (firstTeacher) {
        console.log('👆 点击第一位老师...');
        await firstTeacher.click();
        await new Promise(resolve => setTimeout(resolve, 3000));

        await page.screenshot({ path: 'test-03-chat-opened.png', fullPage: true });
        console.log('✅ 已保存聊天界面截图');
      }
    } else {
      console.log('⚠️ 未找到老师列表');
    }

    // 8. 测试消息输入功能
    if (pageStructure.hasInputBox) {
      console.log('✅ 找到消息输入框');

      // 输入测试消息
      await page.type('textarea, input[type="text"], .message-input', '这是一条测试消息，用于验证家校沟通功能。', { delay: 100 });

      await page.screenshot({ path: 'test-04-message-typed.png', fullPage: true });
      console.log('✅ 已保存输入消息截图');

      // 发送消息
      if (pageStructure.hasSendButton) {
        console.log('📤 点击发送按钮...');
        await page.click('.send-btn, .send-button, button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));

        await page.screenshot({ path: 'test-05-message-sent.png', fullPage: true });
        console.log('✅ 已保存发送消息截图');
      }
    } else {
      console.log('❌ 未找到消息输入框');
    }

    // 9. 测试多媒体功能
    if (pageStructure.hasMultimediaButtons) {
      console.log('✅ 发现多媒体按钮');

      // 截图多媒体按钮区域
      const mediaButtons = await page.$('.multimedia-btn, .media-btn, .file-btn, .image-btn, .voice-btn');
      if (mediaButtons) {
        await mediaButtons.click();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await page.screenshot({ path: 'test-06-media-buttons.png', fullPage: true });
        console.log('✅ 已保存多媒体按钮截图');
      }
    }

    // 10. 测试响应式设计
    console.log('📱 测试响应式设计...');

    // 平板尺寸
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-07-responsive-tablet.png', fullPage: true });

    // 手机尺寸
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-08-responsive-mobile.png', fullPage: true });

    // 恢复桌面尺寸
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 11. 收集测试结果
    const finalMessages = await page.evaluate(() => {
      return {
        currentUrl: window.location.href,
        pageTitle: document.title,
        hasErrors: !!document.querySelector('.error-message, .error, .alert-danger'),
        consoleErrors: Array.from(document.querySelectorAll('.console-error')).length,
        networkErrors: Array.from(document.querySelectorAll('.network-error')).length
      };
    });

    console.log('📋 最终测试结果:', finalMessages);

    // 12. 生成测试报告
    const testReport = {
      timestamp: new Date().toISOString(),
      pageInfo: pageStructure,
      finalStatus: finalMessages,
      consoleMessages: consoleMessages.filter(msg => msg.type === 'error'),
      pageErrors: pageErrors,
      screenshots: [
        'test-01-homepage.png',
        'test-02-communication-page.png',
        'test-03-chat-opened.png',
        'test-04-message-typed.png',
        'test-05-message-sent.png',
        'test-06-media-buttons.png',
        'test-07-responsive-tablet.png',
        'test-08-responsive-mobile.png'
      ]
    };

    // 保存测试报告
    const fs = require('fs');
    fs.writeFileSync('test-report-school-communication.json', JSON.stringify(testReport, null, 2));

    console.log('✅ 测试完成！生成报告文件: test-report-school-communication.json');
    console.log('📊 控制台错误数量:', consoleMessages.filter(msg => msg.type === 'error').length);
    console.log('📊 页面错误数量:', pageErrors.length);

    if (pageErrors.length > 0 || consoleMessages.some(msg => msg.type === 'error')) {
      console.log('⚠️ 发现以下错误:');
      pageErrors.forEach(error => console.log('  -', error.message));
      consoleMessages.filter(msg => msg.type === 'error').forEach(msg => console.log('  -', msg.text));
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }
}

testParentSchoolCommunication().catch(console.error);