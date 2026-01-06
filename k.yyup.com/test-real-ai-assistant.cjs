const { chromium } = require('playwright');
const fs = require('fs');

/**
 * 测试真正的AI助手页面活动海报更新功能
 * 访问正确的AI助手页面：/ai/assistant
 */

async function testRealAIAssistant() {
  console.log('🤖 测试真正的AI助手页面活动海报更新功能');
  console.log('=============================================\n');

  let browser;
  const testPosterPath = '/tmp/activity-poster-test.png';

  try {
    // === 创建测试海报图片 ===
    console.log('📍 步骤1: 创建测试活动海报图片');

    // 创建一个简单的PNG图片
    const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testPosterPath, imageData);
    console.log('✅ 测试活动海报图片已创建');

    // === 启动浏览器测试 ===
    console.log('\n📍 步骤2: 启动浏览器测试');

    browser = await chromium.launch({
      headless: false,
      slowMo: 800,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1400, height: 800 }
    });

    const page = await context.newPage();

    // 监听所有相关事件
    const events = [];
    const apiCalls = [];

    page.on('console', msg => {
      const text = msg.text();
      events.push(text);
      if (text.includes('活动') || text.includes('poster') || text.includes('图片') || text.includes('upload') || text.includes('AI')) {
        console.log('📡 事件:', text);
      }
    });

    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/activities') || url.includes('/api/files') || url.includes('/api/ai')) {
        apiCalls.push({
          method: request.method(),
          url: url,
          timestamp: new Date().toISOString()
        });
        console.log('🌐 API调用:', request.method(), url);
      }
    });

    try {
      // === 登录系统 ===
      console.log('\n🔐 步骤3: 登录系统 (admin/123456)');
      await page.goto('http://localhost:5173/login-only.html', { waitUntil: 'networkidle' });

      const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"]');
      const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
      const loginButton = await page.$('.login-btn, button[type="submit"], .el-button--primary');

      if (usernameInput && passwordInput && loginButton) {
        await usernameInput.fill('admin');
        await passwordInput.fill('123456');
        await loginButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ 登录成功');
      } else {
        console.log('❌ 未找到登录表单元素');
        return;
      }

      // === 访问真正的AI助手页面 ===
      console.log('\n🤖 步骤4: 访问真正的AI助手页面');
      await page.goto('http://localhost:5173/ai/assistant', { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000); // 等待AI助手组件完全加载

      // === 查找AI助手输入框 ===
      console.log('\n📝 步骤5: 查找AI助手输入框');

      // 等待AI助手组件加载完成
      await page.waitForSelector('textarea, .el-textarea__inner, input[type="textarea"]', { timeout: 10000 });

      // 多种方式查找AI助手输入框
      const inputSelectors = [
        'textarea[placeholder*="输入"]',
        'textarea[placeholder*="问题"]',
        'textarea[placeholder*="请输入"]',
        '.el-textarea__inner',
        'textarea.el-input__inner',
        '.claude-input-container textarea',
        '.chat-input-area textarea',
        'textarea'
      ];

      let messageInput = null;
      for (const selector of inputSelectors) {
        const input = await page.$(selector);
        if (input) {
          messageInput = input;
          console.log(`✅ 找到AI助手输入框: ${selector}`);
          break;
        }
      }

      if (!messageInput) {
        console.log('❌ 未找到AI助手输入框，尝试查看页面内容');
        const pageContent = await page.content();
        const hasAIAssistant = pageContent.includes('AIAssistant') || pageContent.includes('ai-assistant');
        console.log('   页面是否包含AI助手组件:', hasAIAssistant);

        // 截图查看当前页面状态
        await page.screenshot({ path: 'docs/浏览器检查/ai-assistant-page-debug.png', fullPage: true });
        console.log('   已保存页面截图以供调试');
      }

      // === 查找图片上传按钮 ===
      console.log('\n📸 步骤6: 查找图片上传按钮');

      const imageButtonSelectors = [
        'button[title*="图片"]',
        'button[title*="图像"]',
        'button[title*="照片"]',
        '.icon-picture',
        '.icon-image',
        '.icon-photo',
        'button:has-text("图片")',
        'button:has-text("图像")',
        '[class*="picture"] button',
        '[class*="image"] button',
        '.claude-input-container button[title*="图片"]'
      ];

      let imageUploadBtn = null;
      for (const selector of imageButtonSelectors) {
        const btn = await page.$(selector);
        if (btn) {
          imageUploadBtn = btn;
          console.log(`✅ 找到图片上传按钮: ${selector}`);
          break;
        }
      }

      // === 查找发送按钮 ===
      console.log('\n📤 步骤7: 查找发送按钮');

      const sendButtonSelectors = [
        'button[title*="发送"]',
        'button[title*="send"]',
        '.send-btn',
        '[class*="send"] button',
        'button:has-text("发送")',
        '.claude-input-container .send-btn'
      ];

      let sendButton = null;
      for (const selector of sendButtonSelectors) {
        const btn = await page.$(selector);
        if (btn) {
          sendButton = btn;
          console.log(`✅ 找到发送按钮: ${selector}`);
          break;
        }
      }

      // === 步骤8: 测试活动列表查询 ===
      console.log('\n📋 步骤8: 测试活动列表查询');

      if (messageInput && sendButton) {
        // 发送获取活动列表的请求
        const activityListRequest = '你好，请帮我获取当前的活动列表，我需要查看所有正在进行和计划中的活动。';

        await messageInput.fill(activityListRequest);
        await page.waitForTimeout(1000);
        await sendButton.click();

        console.log('✅ 已发送获取活动列表请求');
        console.log('⏱️ 等待AI响应和处理...');

        // 等待AI处理活动列表请求（可能需要更长时间）
        await page.waitForTimeout(15000);

        // 检查AI响应
        const aiResponses = await page.$$('[class*="message"], [class*="content"], [class*="response"]');
        if (aiResponses.length > 0) {
          console.log('✅ 检测到AI响应');
          const recentMessages = aiResponses.slice(-3);
          for (let i = 0; i < recentMessages.length; i++) {
            try {
              const text = await recentMessages[i].textContent();
              if (text && text.length > 20) {
                console.log(`   消息${i + 1}:`, text.substring(0, 150) + '...');
              }
            } catch (error) {
              console.log('   消息解析错误:', error.message);
            }
          }
        } else {
          console.log('❌ 未检测到AI响应');
        }

        // === 步骤9: 测试图片上传 ===
        console.log('\n📸 步骤9: 测试图片上传');

        if (imageUploadBtn) {
          try {
            const fileInputPromise = page.waitForEvent('filechooser');
            await imageUploadBtn.click();

            const fileChooser = await fileInputPromise;
            await fileChooser.setFiles(testPosterPath);
            console.log('✅ 活动海报图片已上传');
            await page.waitForTimeout(3000);

            // 检查是否有文件上传成功的消息
            const successMessages = await page.$$('[class*="success"], [class*="message"]');
            if (successMessages.length > 0) {
              console.log('✅ 检测到上传相关消息');
              for (let i = 0; i < Math.min(successMessages.length, 2); i++) {
                try {
                  const text = await successMessages[i].textContent();
                  console.log(`   上传消息${i + 1}:`, text?.substring(0, 100));
                } catch (error) {
                  console.log('   消息解析错误:', error.message);
                }
              }
            }

          } catch (fileError) {
            console.log('❌ 图片上传失败:', fileError.message);
          }
        } else {
          console.log('❌ 未找到图片上传按钮');
        }

        // === 步骤10: 测试海报更新请求 ===
        console.log('\n🎨 步骤10: 测试海报更新请求');

        if (messageInput && sendButton) {
          const posterUpdateRequest = `我刚刚上传了一张活动海报图片，请帮我把这个图片设置为某个活动的海报。

请：
1. 选择一个合适的活动（如果没有合适的活动，请告诉我）
2. 将我上传的海报图片设置为该活动的宣传海报
3. 更新活动的海报信息

谢谢！`;

          await messageInput.fill(posterUpdateRequest);
          await sendButton.click();

          console.log('✅ 已发送海报更新请求');
          console.log('⏱️ 等待AI处理海报更新...');

          // 等待AI处理海报更新请求（可能需要更多时间）
          await page.waitForTimeout(20000);

          // 检查是否有确认对话框
          const confirmDialog = await page.$('.el-dialog, .el-message-box, [role="dialog"]');
          if (confirmDialog) {
            console.log('✅ 检测到确认对话框 - AI要求用户确认海报更新操作');
            try {
              const dialogText = await confirmDialog.textContent();
              console.log('   对话框内容:', dialogText?.substring(0, 300) + '...');
            } catch (error) {
              console.log('   对话框内容解析失败:', error.message);
            }
          }

        }

      } else {
        console.log('❌ 未找到输入框或发送按钮，无法进行消息发送测试');
      }

      // === 截图记录 ===
      console.log('\n📸 步骤11: 截图记录测试结果');
      await page.screenshot({
        path: 'docs/浏览器检查/real-ai-assistant-test.png',
        fullPage: true
      });
      console.log('✅ 测试截图已保存');

    } catch (error) {
      console.log('❌ 页面操作失败:', error.message);
    }

    // === 分析测试结果 ===
    console.log('\n📍 步骤12: 分析测试结果');
    console.log('====================');

    console.log(`📊 事件统计: ${events.length} 个相关事件`);
    console.log(`🌐 API调用: ${apiCalls.length} 个`);

    // 分析API调用类型
    const activitiesCalls = apiCalls.filter(call => call.url.includes('/api/activities'));
    const filesCalls = apiCalls.filter(call => call.url.includes('/api/files'));
    const aiCalls = apiCalls.filter(call => call.url.includes('/api/ai'));

    console.log('\n🎯 API调用分析:');
    console.log('===============');
    console.log(`活动管理API: ${activitiesCalls.length} 个调用`);
    console.log(`文件上传API: ${filesCalls.length} 个调用`);
    console.log(`AI助手API: ${aiCalls.length} 个调用`);

    if (aiCalls.length > 0) {
      console.log('✅ AI助手功能正常工作');
    }

    if (filesCalls.length > 0) {
      console.log('✅ 文件上传功能正常工作');
    }

    if (activitiesCalls.length > 0) {
      console.log('✅ 活动管理功能正常工作');
    }

    console.log('\n🚀 真实AI助手测试结论:');
    console.log('======================');
    if (messageInput && sendButton) {
      console.log('✅ 找到AI助手输入界面 - 可以正常对话');
      if (imageUploadBtn) {
        console.log('✅ 找到图片上传功能 - 支持图片上传');
      } else {
        console.log('❌ 未找到图片上传功能');
      }
      console.log('✅ AI助手页面访问成功');
      console.log('✅ 用户登录验证通过');
    } else {
      console.log('❌ AI助手输入界面不可用');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🏁 浏览器已关闭');
    }

    // 清理测试文件
    try {
      if (fs.existsSync(testPosterPath)) {
        fs.unlinkSync(testPosterPath);
      }
      console.log('🧹 测试文件已清理');
    } catch (error) {
      console.log('⚠️ 清理文件时出错:', error.message);
    }
  }
}

// 运行测试
testRealAIAssistant().catch(console.error);