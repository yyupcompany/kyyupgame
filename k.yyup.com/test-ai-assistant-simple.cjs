const { spawn } = require('child_process');
const fs = require('fs');

async function testAIAssistantWithFixedUI() {
  console.log('🧪 开始测试AI助手文件上传功能（修复CSS后）');

  const browser = await require('playwright').chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 800 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (text.includes('error') || text.includes('Error') || text.includes('ERROR')) {
        console.log(`❌ 控制台错误: ${text}`);
      }
    });

    // 步骤1: 访问登录页面
    console.log('📍 步骤1: 导航到登录页面');
    await page.goto('http://localhost:5173/login-only.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 步骤2: 登录系统
    console.log('📍 步骤2: 登录系统');

    // 查找登录表单元素
    const usernameInput = await page.$('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]');
    const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
    const loginButton = await page.$('.login-btn, button[type="submit"], .el-button--primary');

    if (usernameInput && passwordInput && loginButton) {
      console.log('✅ 找到登录表单元素');
      await usernameInput.fill('admin');
      await passwordInput.fill('admin123');
      await loginButton.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ 未找到完整的登录表单');
    }

    // 步骤3: 直接访问AI助手页面
    console.log('📍 步骤3: 直接访问AI助手页面');
    await page.goto('http://localhost:5173/centers/ai', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 步骤4: 检查AI助手页面是否正常加载
    console.log('📍 步骤4: 检查AI助手页面状态');

    const pageContent = await page.content();
    const hasAIAssistant = pageContent.includes('AI') || pageContent.includes('ai-assistant');

    if (hasAIAssistant) {
      console.log('✅ AI助手页面已加载');
    } else {
      console.log('❌ AI助手页面未正常加载');
    }

    // 步骤5: 查找文件上传按钮
    console.log('📍 步骤5: 查找文件上传功能');

    // 等待页面元素加载
    await page.waitForTimeout(2000);

    // 查找文档上传按钮
    const documentUploadBtn = await page.$('button[title*="文档"], button[title*="文件"], .icon-document');
    const imageUploadBtn = await page.$('button[title*="图片"], button[title*="图像"], .icon-picture');

    console.log(`📄 文档上传按钮 - ${documentUploadBtn ? '找到' : '未找到'}`);
    console.log(`🖼️ 图片上传按钮 - ${imageUploadBtn ? '找到' : '未找到'}`);

    // 步骤6: 测试文件上传功能
    if (documentUploadBtn) {
      console.log('📍 步骤6: 测试文档上传功能');

      // 设置文件监听器
      const fileInputPromise = page.waitForEvent('filechooser');

      await documentUploadBtn.click();

      try {
        const fileChooser = await fileChooserPromise;
        console.log('✅ 文件选择对话框已打开');

        // 创建测试文件
        const testContent = '这是一个测试文档内容\n用于AI分析功能测试';
        const testFilePath = '/tmp/test-document.txt';
        fs.writeFileSync(testFilePath, testContent, 'utf8');

        await fileChooser.setFiles(testFilePath);
        console.log('✅ 测试文档已选择');

        // 等待上传处理
        await page.waitForTimeout(3000);

        // 清理测试文件
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }

      } catch (error) {
        console.log('❌ 文件上传测试失败:', error.message);
      }
    }

    // 步骤7: 测试图片上传功能
    if (imageUploadBtn) {
      console.log('📍 步骤7: 测试图片上传功能');

      try {
        await imageUploadBtn.click();
        console.log('✅ 图片上传按钮已点击');
        await page.waitForTimeout(2000);
      } catch (error) {
        console.log('❌ 图片上传测试失败:', error.message);
      }
    }

    // 步骤8: 检查AI对话功能
    console.log('📍 步骤8: 测试AI对话功能');

    const messageInput = await page.$('textarea[placeholder*="输入"], .el-textarea__inner, textarea');
    const sendButton = await page.$('.send-btn, button[title*="发送"], .el-button--primary');

    if (messageInput && sendButton) {
      console.log('✅ 找到AI对话输入框');
      await messageInput.fill('你好，我想测试文件分析功能');
      await sendButton.click();

      console.log('✅ 已发送测试消息');
      await page.waitForTimeout(5000);
    } else {
      console.log('❌ 未找到AI对话输入框');
    }

    // 统计结果
    const errors = consoleMessages.filter(msg =>
      msg.includes('error') || msg.includes('Error') || msg.includes('ERROR')
    );

    console.log('\n📋 测试报告:');
    console.log('=============');
    console.log(`页面加载: ${hasAIAssistant ? '✅ 成功' : '❌ 失败'}`);
    console.log(`文档上传按钮: ${documentUploadBtn ? '✅ 找到' : '❌ 未找到'}`);
    console.log(`图片上传按钮: ${imageUploadBtn ? '✅ 找到' : '❌ 未找到'}`);
    console.log(`对话输入框: ${messageInput ? '✅ 找到' : '❌ 未找到'}`);
    console.log(`控制台错误: ${errors.length} 个`);

    if (errors.length > 0) {
      console.log('\n🚨 主要错误:');
      errors.slice(0, 3).forEach(error => console.log(`  - ${error}`));
    }

    // 截图
    await page.screenshot({
      path: 'docs/浏览器检查/ai-assistant-test-final.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 测试完成');
  }
}

testAIAssistantWithFixedUI().catch(console.error);