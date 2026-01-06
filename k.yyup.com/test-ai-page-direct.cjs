const { chromium } = require('playwright');

(async () => {
  console.log('🚀 启动AI助手页面直接测试...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', error => {
    consoleLogs.push({ type: 'error', text: error.message });
  });

  try {
    console.log('📍 第1步：直接访问AI页面...');
    await page.goto('http://localhost:5173/ai', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ 页面导航成功\n');

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`📍 当前URL: ${currentUrl}\n`);

    // 检查是否被重定向到登录页
    if (currentUrl.includes('/login')) {
      console.log('⚠️ 页面需要登录，正在执行登录流程...\n');

      console.log('📍 第2步：执行登录...');
      await page.waitForSelector('input[type="text"], input[type="email"], .el-input__inner', { timeout: 5000 });

      const usernameInput = page.locator('input[type="text"], input[type="email"], .el-input__inner').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"], .el-button--primary, button:has-text("登录")').first();

      await usernameInput.fill('admin');
      await passwordInput.fill('123456');
      await submitButton.click();

      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ 登录成功\n');

      console.log('📍 第3步：导航到AI页面...');
      await page.goto('http://localhost:5173/ai', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      console.log('✅ AI页面加载成功\n');
    } else {
      console.log('✅ 页面无需登录，直接访问\n');
    }

    console.log('📍 第4步：页面状态检查...');
    const pageTitle = await page.title();
    console.log(`   页面标题: "${pageTitle}"`);

    const url = page.url();
    console.log(`   当前地址: ${url}`);

    // 检查网络错误
    const response = await page.request.get('http://localhost:5173/ai');
    console.log(`   HTTP状态: ${response.status()}\n`);

    console.log('📍 第5步：分析页面结构...');

    // 检查主要容器
    const bodyHTML = await page.locator('body').innerHTML();
    const bodyText = await page.locator('body').textContent();

    console.log(`   页面内容长度: ${bodyText.length} 字符`);
    console.log(`   页面是否包含AI相关文本: ${bodyText.toLowerCase().includes('ai') || bodyText.toLowerCase().includes('智能')}`);

    // 检查React/Vue应用是否加载
    const vueApp = await page.locator('[id*="app"], #app, [class*="app"]').count();
    console.log(`   应用容器: ${vueApp} 个\n`);

    console.log('📍 第6步：检查UI组件...');

    // 检查常见UI元素
    const elements = {
      '输入框': await page.locator('input, textarea').count(),
      '按钮': await page.locator('button').count(),
      '表格': await page.locator('table, .el-table').count(),
      '卡片': await page.locator('.el-card, [class*="card"]').count(),
      '对话框': await page.locator('.el-dialog, [role="dialog"]').count(),
      '加载指示器': await page.locator('.el-loading, [loading], .loading').count(),
    };

    for (const [name, count] of Object.entries(elements)) {
      console.log(`   ${name}: ${count} 个`);
    }

    console.log('\n📍 第7步：检查错误提示...');

    const errorSelectors = [
      '.el-alert--error',
      '.error-message',
      '[role="alert"]',
      '.el-message--error',
      'text=404',
      'text=500',
      'text=Error'
    ];

    let totalErrors = 0;
    for (const selector of errorSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        totalErrors += count;
        console.log(`   ⚠️ 发现 ${count} 个错误: ${selector}`);
      }
    }

    if (totalErrors === 0) {
      console.log('   ✅ 未发现错误提示');
    }

    console.log('\n📍 第8步：检查AI助手特定元素...');

    const aiSelectors = [
      'text=AI助手',
      'text=智能助手',
      'text=Chat',
      '[class*="ai-assistant"]',
      '[class*="chat"]',
      '[class*="message"]',
      '[class*="conversation"]',
    ];

    let aiElementsFound = 0;
    for (const selector of aiSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        aiElementsFound += count;
        console.log(`   ✅ 发现 ${count} 个AI相关元素: ${selector}`);
      }
    }

    if (aiElementsFound === 0) {
      console.log('   ⚠️ 未发现明确的AI助手界面元素');
    }

    console.log('\n📍 第9步：测试交互功能...');

    // 尝试找到输入框
    const inputSelectors = ['input', 'textarea', '[contenteditable="true"]'];
    let inputFound = false;

    for (const selector of inputSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`   ✅ 找到 ${count} 个输入框 (${selector})`);
        inputFound = true;

        // 尝试在第一个输入框中输入测试文本
        try {
          const firstInput = page.locator(selector).first();
          await firstInput.fill('测试消息');
          console.log(`   ✅ 输入功能正常`);
          await page.waitForTimeout(1000);

          // 检查是否有发送按钮
          const sendButtonSelectors = [
            'button:has-text("发送")',
            'button:has-text("提交")',
            'button[type="submit"]',
            '[class*="send"]',
          ];

          let sendButtonFound = false;
          for (const btnSelector of sendButtonSelectors) {
            const btnCount = await page.locator(btnSelector).count();
            if (btnCount > 0) {
              console.log(`   ✅ 找到 ${btnCount} 个发送按钮`);
              sendButtonFound = true;

              // 尝试点击发送按钮
              try {
                await page.locator(btnSelector).first().click();
                await page.waitForTimeout(2000);
                console.log(`   ✅ 发送按钮点击成功`);
              } catch (e) {
                console.log(`   ⚠️ 发送按钮点击失败: ${e.message}`);
              }
              break;
            }
          }

          if (!sendButtonFound) {
            console.log(`   ⚠️ 未找到发送按钮`);
          }

          break;
        } catch (e) {
          console.log(`   ⚠️ 输入功能测试失败: ${e.message}`);
        }
      }
    }

    if (!inputFound) {
      console.log(`   ⚠️ 未找到输入框`);
    }

    console.log('\n📍 第10步：检查控制台日志...');

    const errors = consoleLogs.filter(log => log.type === 'error');
    const warnings = consoleLogs.filter(log => log.type === 'warning');

    if (errors.length > 0) {
      console.log(`   ❌ 发现 ${errors.length} 个JavaScript错误:`);
      errors.slice(0, 10).forEach(err => {
        console.log(`      - ${err.text.substring(0, 100)}`);
      });
    } else {
      console.log('   ✅ 无JavaScript错误');
    }

    if (warnings.length > 0) {
      console.log(`   ⚠️ 发现 ${warnings.length} 个警告:`);
      warnings.slice(0, 5).forEach(warn => {
        console.log(`      - ${warn.text.substring(0, 100)}`);
      });
    }

    console.log('\n📍 第11步：生成截图...');
    const screenshotPath = '/tmp/ai-page-test-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   ✅ 截图已保存: ${screenshotPath}\n`);

    console.log('='.repeat(70));
    console.log('🎉 AI助手页面测试完成');
    console.log('='.repeat(70));

    // 等待最后一批异步操作
    await page.waitForTimeout(3000);

  } catch (error) {
    console.log('\n❌ 测试过程发生异常:');
    console.log(`   错误: ${error.message}`);
    if (error.stack) {
      console.log(`\n   堆栈信息:\n${error.stack.substring(0, 500)}`);
    }
  } finally {
    await browser.close();
    console.log('\n🔚 浏览器已关闭\n');
  }
})();
