const { chromium } = require('playwright');

(async () => {
  console.log('启动浏览器测试 AI 助手页面...');

  const browser = await chromium.launch({
    headless: true,  // 使用无头模式
    devtools: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  // 监听控制台日志
  const consoleLogs = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push({ type, text });
    if (type === 'error') {
      console.log(`❌ [控制台错误] ${text}`);
    } else if (type === 'warning') {
      console.log(`⚠️ [控制台警告] ${text}`);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.log(`❌ [页面错误] ${error.message}`);
  });

  try {
    console.log('\n📍 第1步：访问登录页面...');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ 登录页面加载成功');

    console.log('\n📍 第2步：使用管理员账户登录...');
    await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="text"], input[type="email"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"], button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ 登录成功');

    console.log('\n📍 第3步：访问AI助手页面...');
    await page.goto('http://localhost:5173/ai', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ AI页面导航成功');

    console.log('\n📍 第4步：检查页面加载状态...');
    const pageTitle = await page.title();
    console.log(`✅ 页面标题: ${pageTitle}`);

    // 等待页面完全渲染
    await page.waitForTimeout(2000);

    console.log('\n📍 第5步：检查页面布局和组件...');

    // 检查是否存在主要容器
    const mainContainer = await page.locator('body').first().isVisible();
    if (mainContainer) {
      console.log('✅ 主容器存在');
    }

    // 检查是否有错误信息
    const errorAlerts = await page.locator('.el-alert--error, [role="alert"], .error').count();
    if (errorAlerts > 0) {
      console.log(`⚠️ 发现 ${errorAlerts} 个错误提示`);
      const errorText = await page.locator('.el-alert--error, [role="alert"], .error').first().textContent();
      console.log(`错误内容: ${errorText}`);
    } else {
      console.log('✅ 未发现错误提示');
    }

    // 检查AI助手相关元素
    const aiElements = {
      '输入框': await page.locator('input, textarea').count(),
      '发送按钮': await page.locator('button:has-text("发送"), button[type="submit"]').count(),
      '消息列表': await page.locator('[class*="message"], [class*="chat"], [class*="conversation"]').count(),
    };

    console.log('\n📊 AI界面元素统计:');
    for (const [key, count] of Object.entries(aiElements)) {
      console.log(`  - ${key}: ${count} 个`);
    }

    console.log('\n📍 第6步：截图保存...');
    await page.screenshot({ path: '/tmp/ai-page-screenshot.png', fullPage: true });
    console.log('✅ 截图已保存: /tmp/ai-page-screenshot.png');

    console.log('\n📍 第7步：测试发送消息功能...');

    // 尝试找到输入框并发送测试消息
    const messageInput = await page.locator('input, textarea').first();
    if (await messageInput.isVisible({ timeout: 3000 })) {
      console.log('✅ 找到输入框');
      await messageInput.fill('你好，测试消息');
      await page.waitForTimeout(500);

      const sendButton = await page.locator('button:has-text("发送"), button[type="submit"]').first();
      if (await sendButton.isVisible({ timeout: 3000 })) {
        console.log('✅ 找到发送按钮');
        await sendButton.click();
        await page.waitForTimeout(2000);

        // 检查是否有响应
        const newMessages = await page.locator('[class*="message"], [class*="chat"], [class*="conversation"]').count();
        console.log(`✅ 发送消息后，页面显示 ${newMessages} 个消息元素`);
      } else {
        console.log('⚠️ 未找到发送按钮');
      }
    } else {
      console.log('⚠️ 未找到输入框');
    }

    console.log('\n📍 第8步：检查控制台错误...');
    const errors = consoleLogs.filter(log => log.type === 'error');
    const warnings = consoleLogs.filter(log => log.type === 'warning');

    if (errors.length > 0) {
      console.log(`❌ 发现 ${errors.length} 个错误:`);
      errors.forEach(err => console.log(`   - ${err.text}`));
    } else {
      console.log('✅ 无JavaScript错误');
    }

    if (warnings.length > 0) {
      console.log(`⚠️ 发现 ${warnings.length} 个警告:`);
      warnings.forEach(warn => console.log(`   - ${warn.text}`));
    } else {
      console.log('✅ 无警告');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ AI助手页面测试完成');
    console.log('='.repeat(60));

    // 等待3秒确保所有异步操作完成
    await page.waitForTimeout(3000);

  } catch (error) {
    console.log('\n❌ 测试过程中发生错误:');
    console.log(error.message);
    console.log(error.stack);
  } finally {
    await browser.close();
    console.log('\n🔚 浏览器已关闭');
  }
})();
