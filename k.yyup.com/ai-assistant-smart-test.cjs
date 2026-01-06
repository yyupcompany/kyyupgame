const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试结果存储
let testResults = {
  loginStatus: null,
  pageLoad: null,
  fileUploadElements: [],
  uploadTests: [],
  consoleErrors: [],
  networkRequests: [],
  aiFeatures: [],
  screenshots: []
};

async function testAIAssistantWithAutoLogin() {
  console.log('开始AI助手智能测试（自动登录版本）...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    };
    testResults.consoleErrors.push(logEntry);

    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.log('页面错误:', error.message);
    testResults.consoleErrors.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack
    });
  });

  // 监听网络请求
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/ai') ||
        url.includes('/api/upload') ||
        url.includes('/api/file') ||
        url.includes('/api/auth') ||
        url.includes('/api/ai-query')) {
      const requestInfo = {
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      };
      testResults.networkRequests.push(requestInfo);
      console.log('API请求:', request.method(), url);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/ai') ||
        url.includes('/api/upload') ||
        url.includes('/api/file') ||
        url.includes('/api/auth') ||
        url.includes('/api/ai-query')) {
      const responseInfo = {
        url: url,
        status: response.status(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      };
      testResults.networkRequests.push(responseInfo);
      console.log('API响应:', response.status(), url);
    }
  });

  try {
    console.log('1. 访问登录页面...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 尝试自动登录
    console.log('2. 尝试自动登录...');

    // 等待页面加载完成
    await page.waitForSelector('input[placeholder*="用户名"], input[name="username"]', { timeout: 10000 });

    // 填写用户名
    await page.fill('input[placeholder*="用户名"], input[name="username"]', 'admin');
    console.log('✓ 填写用户名: admin');

    // 填写密码
    await page.fill('input[placeholder*="密码"], input[name="password"]', '123456');
    console.log('✓ 填写密码: ******');

    // 点击登录按钮
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
      page.click('button[type="submit"], .login-btn, button:has-text("登录")')
    ]);

    console.log('✓ 点击登录按钮');

    // 检查登录是否成功
    const currentUrl = page.url();
    console.log('登录后URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 登录可能失败，仍在登录页面');
    } else {
      console.log('✅ 登录成功，已导航到:', currentUrl);
      testResults.loginStatus = 'success';
    }

    // 等待页面稳定
    await page.waitForTimeout(3000);

    console.log('3. 导航到AI助手页面...');

    // 尝试直接访问AI助手页面
    await page.goto('http://localhost:5173/centers/ai', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // 检查是否被重定向回登录页面
    const aiPageUrl = page.url();
    if (aiPageUrl.includes('/login')) {
      console.log('⚠️ 被重定向到登录页面，权限可能不足');

      // 尝试使用快捷登录按钮
      console.log('4. 尝试快捷登录...');
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // 查找快捷登录按钮
      const quickLoginButtons = [
        '.quick-btn.admin-btn',
        'button:has-text("系统管理员")',
        '.quick-btn'
      ];

      for (const selector of quickLoginButtons) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible()) {
            console.log('找到快捷登录按钮:', selector);
            await button.click();
            await page.waitForTimeout(3000);
            break;
          }
        } catch (error) {
          console.log('快捷登录按钮未找到:', selector);
        }
      }

      // 再次尝试访问AI助手页面
      await page.goto('http://localhost:5173/centers/ai', { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
    }

    // 最终检查页面
    const finalUrl = page.url();
    console.log('最终页面URL:', finalUrl);

    // 截图记录
    const screenshot1 = await page.screenshot({
      path: 'ai-assistant-final-page.png',
      fullPage: true
    });
    testResults.screenshots.push({
      name: 'AI助手最终页面',
      file: 'ai-assistant-final-page.png'
    });

    console.log('5. 深入分析AI助手页面结构...');

    // 全面的AI相关元素查找
    const aiElementSelectors = [
      // 文件上传相关
      'input[type="file"]',
      'input[type="file"][style*="display: none"]',
      'input[type="file"][hidden]',
      '.el-upload',
      '.el-upload__input',
      '[class*="upload"]',
      '[id*="upload"]',
      '[class*="file"]',
      '[id*="file"]',

      // AI助手相关组件
      '[class*="ai"]',
      '[id*="ai"]',
      '[class*="assistant"]',
      '[id*="assistant"]',
      '[class*="chat"]',
      '[id*="chat"]',
      '.chat-container',
      '.message-input',
      '.send-button',

      // 文本输入区域（可能支持拖拽）
      'textarea',
      '.content-input',
      '.message-input',
      '[contenteditable="true"]',
      '.editor',

      // 按钮和交互元素
      'button',
      '.el-button',
      '[role="button"]',
      '.clickable'
    ];

    let aiElements = [];

    for (const selector of aiElementSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`找到元素 ${selector}: ${elements.length}个`);

          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const isVisible = await element.isVisible();
            const isEnabled = await element.isEnabled();
            const boundingBox = await element.boundingBox();
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const type = await element.evaluate(el => el.type || '');
            const className = await element.evaluate(el => el.className);
            const id = await element.evaluate(el => el.id);
            const textContent = await element.evaluate(el => el.textContent?.trim() || '');

            aiElements.push({
              selector,
              index: i,
              tagName,
              type,
              className,
              id,
              isVisible,
              isEnabled,
              boundingBox,
              textContent
            });

            if (isVisible) {
              console.log(`  ✓ 可见元素: ${tagName} (${type}) - ${textContent.substring(0, 50)}`);
            }
          }
        }
      } catch (error) {
        // 忽略选择器错误
      }
    }

    testResults.fileUploadElements = aiElements;

    console.log('6. 检查AI功能特性...');

    // 检查页面中的AI功能
    const pageFeatures = await page.evaluate(() => {
      const features = {
        hasFileInput: !!document.querySelector('input[type="file"]'),
        hasUploadComponent: !!document.querySelector('.el-upload, [class*="upload"]'),
        hasChatComponent: !!document.querySelector('[class*="chat"], [id*="chat"]'),
        hasMessageInput: !!document.querySelector('textarea, .message-input, [contenteditable="true"]'),
        hasSendButton: !!document.querySelector('button:has-text("发送"), .send-btn'),
        hasAIComponent: !!document.querySelector('[class*="ai"], [id*="ai"]'),
        vueApps: document.querySelectorAll('[data-v-app], [data-v-]').length,
        elComponents: document.querySelectorAll('[class*="el-"]').length
      };

      // 检查可能的拖拽区域
      const dropZones = document.querySelectorAll('textarea, .content-area, .message-input, [contenteditable="true"]');
      features.dropZoneCount = dropZones.length;

      // 检查所有按钮
      const buttons = document.querySelectorAll('button, .el-button, [role="button"]');
      features.buttonCount = buttons.length;

      return features;
    });

    testResults.aiFeatures = pageFeatures;
    console.log('AI功能特性:', pageFeatures);

    console.log('7. 创建测试文件...');

    // 创建测试文件
    const testTextContent = `这是一个测试文档，用于AI助手文件上传功能测试。

测试内容：
1. 文本分析能力
2. 内容理解能力
3. 智能响应能力

创建时间: ${new Date().toISOString()}
测试目的: 验证AI助手能够正确处理和分析上传的文档内容。`;

    // 创建测试文本文件
    fs.writeFileSync('test-document.txt', testTextContent, 'utf8');
    console.log('✓ 创建测试文档: test-document.txt');

    // 创建测试图片（使用SVG）
    const testImageContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f8ff"/>
      <text x="200" y="50" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">AI测试图片</text>
      <circle cx="100" cy="100" r="30" fill="#ff6b6b"/>
      <rect x="250" y="80" width="60" height="40" fill="#4ecdc4"/>
      <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
        这是一个测试图片，包含基本图形和文字
      </text>
      <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">
        用于测试AI图片识别功能
      </text>
    </svg>`;

    fs.writeFileSync('test-image.svg', testImageContent, 'utf8');
    console.log('✓ 创建测试图片: test-image.svg');

    console.log('8. 测试文件上传功能...');

    // 查找所有可能的文件输入
    const fileInputs = await page.locator('input[type="file"]').all();
    console.log(`找到 ${fileInputs.length} 个文件输入元素`);

    if (fileInputs.length > 0) {
      for (let i = 0; i < fileInputs.length; i++) {
        const fileInput = fileInputs[i];
        const isVisible = await fileInput.isVisible();
        const isEnabled = await fileInput.isEnabled();

        console.log(`文件输入 ${i + 1}: 可见=${isVisible}, 启用=${isEnabled}`);

        if (isEnabled) {
          try {
            // 尝试上传文本文件
            await fileInput.setInputFiles('test-document.txt');
            console.log(`✓ 文件输入 ${i + 1} 上传文本文件成功`);

            await page.waitForTimeout(2000);

            // 检查是否有响应
            const hasResponse = await page.evaluate(() => {
              const messages = document.querySelectorAll('[class*="message"], [class*="response"]');
              return messages.length > 0;
            });

            if (hasResponse) {
              console.log(`✓ 文件输入 ${i + 1} 有响应反馈`);
            }

          } catch (error) {
            console.log(`✗ 文件输入 ${i + 1} 上传失败:`, error.message);
          }
        }
      }
    } else {
      console.log('⚠️ 未找到文件输入元素，尝试其他方式...');

      // 尝试拖拽上传
      const dropZones = await page.locator('textarea, .content-input, [contenteditable="true"]').all();
      console.log(`找到 ${dropZones.length} 个可能的拖拽区域`);

      if (dropZones.length > 0) {
        for (let i = 0; i < Math.min(dropZones.length, 3); i++) {
          const dropZone = dropZones[i];
          if (await dropZone.isVisible()) {
            try {
              console.log(`尝试拖拽到区域 ${i + 1}`);

              // 创建一个临时的文件输入元素来触发上传
              await dropZone.evaluate((zone) => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.style.display = 'none';
                fileInput.onchange = (e) => {
                  console.log('文件选择事件触发:', e.target.files);
                };
                zone.appendChild(fileInput);
                return fileInput;
              });

              await page.waitForTimeout(1000);

            } catch (error) {
              console.log(`拖拽区域 ${i + 1} 测试失败:`, error.message);
            }
          }
        }
      }
    }

    console.log('9. 测试AI交互功能...');

    // 查找并测试文本输入区域
    const textInputs = await page.locator('textarea, .message-input, [contenteditable="true"]').all();

    if (textInputs.length > 0) {
      const textInput = textInputs[0];
      if (await textInput.isVisible()) {
        console.log('找到文本输入区域，测试AI交互...');

        try {
          // 输入测试消息
          const testMessage = '你好，我是AI助手测试。请介绍一下你的功能。';

          if (await textInput.evaluate(el => el.contentEditable === 'true')) {
            await textInput.fill('');
            await textInput.type(testMessage);
            console.log('✓ 输入测试消息到可编辑区域');
          } else {
            await textInput.fill(testMessage);
            console.log('✓ 输入测试消息到文本区域');
          }

          await page.waitForTimeout(1000);

          // 查找发送按钮
          const sendButtons = await page.locator('button:has-text("发送"), .send-btn, .el-button--primary').all();

          if (sendButtons.length > 0) {
            for (const sendButton of sendButtons) {
              if (await sendButton.isVisible()) {
                console.log('找到发送按钮，点击发送...');
                await sendButton.click();
                await page.waitForTimeout(3000);
                break;
              }
            }
          } else {
            console.log('未找到发送按钮，尝试按回车发送');
            await textInput.press('Enter');
            await page.waitForTimeout(3000);
          }

          // 检查是否有AI响应
          const hasAIResponse = await page.evaluate(() => {
            const messages = document.querySelectorAll('[class*="message"], [class*="response"], [class*="chat-message"]');
            let responseTexts = [];
            messages.forEach(msg => {
              const text = msg.textContent?.trim();
              if (text && text.length > 10) {
                responseTexts.push(text.substring(0, 100));
              }
            });
            return responseTexts;
          });

          if (hasAIResponse.length > 0) {
            console.log('✓ AI响应成功!');
            hasAIResponse.forEach((response, index) => {
              console.log(`  响应 ${index + 1}: ${response}`);
            });
          } else {
            console.log('⚠️ 未检测到AI响应');
          }

        } catch (error) {
          console.log('✗ AI交互测试失败:', error.message);
        }
      }
    }

    console.log('10. 最终页面分析...');

    // 获取页面最终状态
    const finalPageState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasAnyMessages: document.querySelectorAll('[class*="message"]').length > 0,
        hasErrors: document.querySelectorAll('.error, .alert-error').length > 0,
        totalElements: document.querySelectorAll('*').length,
        inputCount: document.querySelectorAll('input, textarea').length,
        buttonCount: document.querySelectorAll('button').length
      };
    });

    testResults.pageLoad = {
      url: finalPageState.url,
      title: finalPageState.title,
      timestamp: new Date().toISOString(),
      hasAnyMessages: finalPageState.hasAnyMessages,
      hasErrors: finalPageState.hasErrors,
      totalElements: finalPageState.totalElements,
      inputCount: finalPageState.inputCount,
      buttonCount: finalPageState.buttonCount
    };

    // 最后截图
    await page.screenshot({
      path: 'ai-assistant-final-state.png',
      fullPage: true
    });

    console.log('测试完成!');

  } catch (error) {
    console.error('测试过程中发生错误:', error);
    testResults.error = {
      message: error.message,
      stack: error.stack
    };
  } finally {
    await browser.close();
  }

  return testResults;
}

// 启动测试
testAIAssistantWithAutoLogin().then(results => {
  console.log('\n=== 智能测试结果 ===');

  console.log('登录状态:', results.loginStatus);
  console.log('页面加载状态:', results.pageLoad);
  console.log('发现的上传相关元素:', results.fileUploadElements.length);
  console.log('控制台错误:', results.consoleErrors.filter(e => e.type === 'error' || e.type === 'warn').length);
  console.log('网络请求:', results.networkRequests.length);
  console.log('AI功能特性:', results.aiFeatures);

  // 输出文件上传元素详情
  if (results.fileUploadElements.length > 0) {
    console.log('\n=== 文件上传相关元素 ===');
    results.fileUploadElements.forEach((el, index) => {
      if (el.isVisible) {
        console.log(`${index + 1}. ${el.tagName} (${el.type})`);
        console.log(`   选择器: ${el.selector}`);
        console.log(`   类名: ${el.className}`);
        console.log(`   可见: ${el.isVisible}, 启用: ${el.isEnabled}`);
        if (el.textContent) {
          console.log(`   文本: ${el.textContent.substring(0, 50)}...`);
        }
      }
    });
  }

  // 输出网络请求
  if (results.networkRequests.length > 0) {
    console.log('\n=== AI相关API请求 ===');
    results.networkRequests.forEach((req, index) => {
      if (req.method) {
        console.log(`${index + 1}. ${req.method} ${req.url}`);
      } else {
        console.log(`${index + 1}. RESPONSE ${req.status} ${req.url}`);
      }
    });
  }

  // 输出AI功能特性
  if (results.aiFeatures) {
    console.log('\n=== AI功能特性分析 ===');
    Object.entries(results.aiFeatures).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  }

  // 输出控制台错误
  const errors = results.consoleErrors.filter(e => e.type === 'error' || e.type === 'warn');
  if (errors.length > 0) {
    console.log('\n=== 重要错误和警告 ===');
    errors.forEach(error => {
      console.log(`[${error.type.toUpperCase()}] ${error.text}`);
    });
  }

  // 保存详细结果
  const detailedResults = {
    ...results,
    summary: {
      loginSuccess: results.loginStatus === 'success',
      fileUploadElementsFound: results.fileUploadElements.length,
      visibleUploadElements: results.fileUploadElements.filter(e => e.isVisible).length,
      networkRequestsCount: results.networkRequests.length,
      consoleErrorsCount: errors.length,
      hasFileInput: results.aiFeatures?.hasFileInput || false,
      hasUploadComponent: results.aiFeatures?.hasUploadComponent || false,
      hasChatComponent: results.aiFeatures?.hasChatComponent || false,
      testCompleted: true
    }
  };

  fs.writeFileSync(
    'ai-assistant-smart-test-results.json',
    JSON.stringify(detailedResults, null, 2)
  );

  console.log('\n详细测试结果已保存到 ai-assistant-smart-test-results.json');

  // 输出测试总结
  console.log('\n=== 测试总结 ===');
  console.log(`✅ 登录状态: ${detailedResults.summary.loginSuccess ? '成功' : '失败'}`);
  console.log(`📁 文件上传元素: ${detailedResults.summary.fileUploadElementsFound} 个 (${detailedResults.summary.visibleUploadElements} 个可见)`);
  console.log(`🌐 API请求: ${detailedResults.summary.networkRequestsCount} 个`);
  console.log(`⚠️  错误/警告: ${detailedResults.summary.consoleErrorsCount} 个`);
  console.log(`🔧 功能特性:`);
  console.log(`   - 文件输入: ${detailedResults.summary.hasFileInput ? '✓' : '✗'}`);
  console.log(`   - 上传组件: ${detailedResults.summary.hasUploadComponent ? '✓' : '✗'}`);
  console.log(`   - 聊天组件: ${detailedResults.summary.hasChatComponent ? '✓' : '✗'}`);

}).catch(error => {
  console.error('智能测试执行失败:', error);
});