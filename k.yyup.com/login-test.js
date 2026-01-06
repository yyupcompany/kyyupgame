const { chromium } = require('playwright');

(async () => {
  console.log('启动浏览器并登录...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 访问登录页面
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    console.log('页面标题:', await page.title());

    // 等待页面加载完成
    await page.waitForTimeout(2000);

    console.log('填写登录信息...');

    // 查找用户名输入框并填写
    const usernameInput = await page.locator('input[placeholder*="用户"], input[type="text"], .el-input__inner').first();
    await usernameInput.fill('admin');
    console.log('用户名已填写: admin');

    // 查找密码输入框并填写
    const passwordInput = await page.locator('input[placeholder*="密码"], input[type="password"]').first();
    await passwordInput.fill('123456');
    console.log('密码已填写: 123456');

    // 等待一下确保表单填写完成
    await page.waitForTimeout(1000);

    // 查找并点击登录按钮
    const loginButton = await page.locator('button:has-text("登录"), .el-button--primary, button[type="submit"]').first();
    console.log('找到登录按钮');

    await loginButton.click();
    console.log('点击登录按钮...');

    // 等待登录完成
    console.log('等待登录完成...');
    await page.waitForTimeout(5000);

    console.log('登录后页面标题:', await page.title());
    console.log('登录后URL:', page.url());

    // 截图保存登录后页面
    await page.screenshot({ path: 'dashboard-page.png', fullPage: true });
    console.log('登录后页面截图已保存: dashboard-page.png');

    // 查找AI助手按钮
    console.log('查找AI助手...');
    const aiAssistantSelectors = [
      'button:has-text("AI")',
      'button:has-text("助手")',
      'button:has-text("智能")',
      '.ai-assistant-btn',
      '[class*="ai"]',
      'button[title*="AI"]'
    ];

    let aiButton = null;
    for (const selector of aiAssistantSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log('找到AI助手按钮:', selector);
          aiButton = element;
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (aiButton) {
      console.log('点击AI助手按钮...');
      await aiButton.click();
      await page.waitForTimeout(3000);

      console.log('AI助手页面标题:', await page.title());
      console.log('AI助手页面URL:', page.url());

      // 截图保存AI助手页面
      await page.screenshot({ path: 'ai-assistant-page.png', fullPage: true });
      console.log('AI助手页面截图已保存: ai-assistant-page.png');

    } else {
      console.log('未找到AI助手按钮，截图当前页面以便调试');
      await page.screenshot({ path: 'dashboard-debug.png', fullPage: true });
    }

  } catch (error) {
    console.error('登录过程中出错:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }

  await browser.close();
})();
