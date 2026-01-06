import { chromium } from 'playwright';

async function checkAIButton() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('正在访问首页...');

    // 先访问首页，看看是否需要登录
    await page.goto('http://localhost:5173/');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 额外等待确保组件渲染完成

    console.log('检查当前页面状态...');
    const currentUrl = page.url();
    console.log('当前URL:', currentUrl);

    // 如果被重定向到登录页面，我们可能需要使用测试用户登录
    if (currentUrl.includes('/login')) {
      console.log('当前在登录页面，尝试登录测试用户...');

      // 查找登录表单元素
      const usernameInput = await page.locator('input[placeholder*="用户"], input[placeholder*="账号"], input[type="text"]').first();
      const passwordInput = await page.locator('input[placeholder*="密码"], input[type="password"]').first();
      const loginButton = await page.locator('button[type="submit"], button:has-text("登录"), .login-btn').first();

      if (await usernameInput.isVisible() && await passwordInput.isVisible()) {
        await usernameInput.fill('admin');
        await passwordInput.fill('123456');
        await loginButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        console.log('登录尝试完成');
      }
    }

    // 尝试访问仪表板
    console.log('正在访问仪表板页面...');
    await page.goto('http://localhost:5173/dashboard');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 额外等待确保组件渲染完成

    console.log('页面已加载，正在查找AI助手按钮...');

    // 查找AI助手按钮的多种可能选择器
    const aiButtonSelectors = [
      '[data-testid="ai-assistant-button"]',
      '.ai-assistant-button',
      '.ai-center-button',
      'button[title*="AI"]',
      'button[title*="ai"]',
      '.ai-fab-button',
      '[class*="ai"][class*="button"]',
      '[class*="ai-center"]'
    ];

    let aiButton = null;
    let foundSelector = null;

    for (const selector of aiButtonSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          aiButton = element;
          foundSelector = selector;
          console.log(`找到AI助手按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (aiButton) {
      console.log('✅ AI助手按钮可见！');

      // 获取按钮的详细信息
      const boundingBox = await aiButton.boundingBox();
      const textContent = await aiButton.textContent();
      const className = await aiButton.getAttribute('class');
      const title = await aiButton.getAttribute('title');

      console.log('按钮详细信息:');
      console.log(`- 位置: ${JSON.stringify(boundingBox)}`);
      console.log(`- 文本: ${textContent}`);
      console.log(`- 类名: ${className}`);
      console.log(`- 标题: ${title}`);

      // 截图
      await page.screenshot({
        path: 'ai-button-screenshot.png',
        fullPage: false
      });
      console.log('📸 已保存截图: ai-button-screenshot.png');

      // 如果按钮有图标，检查图标
      const iconSelectors = [
        `${foundSelector} i`,
        `${foundSelector} svg`,
        `${foundSelector} .icon`,
        `${foundSelector} [class*="icon"]`
      ];

      for (const iconSelector of iconSelectors) {
        try {
          const icon = await page.locator(iconSelector).first();
          if (await icon.isVisible()) {
            const iconClass = await icon.getAttribute('class');
            console.log(`找到图标: ${iconClass}`);
            break;
          }
        } catch (e) {
          // 继续尝试
        }
      }

    } else {
      console.log('❌ 未找到AI助手按钮');

      // 截图用于调试
      await page.screenshot({
        path: 'dashboard-no-ai-button.png',
        fullPage: true
      });
      console.log('📸 已保存页面截图: dashboard-no-ai-button.png');

      // 检查页面中是否有任何AI相关元素
      const aiElements = await page.locator('[class*="ai"], [id*="ai"], [title*="ai"], [title*="AI"]').all();
      console.log(`找到 ${aiElements.length} 个AI相关元素`);

      for (let i = 0; i < Math.min(aiElements.length, 5); i++) {
        try {
          const element = aiElements[i];
          const tagName = await element.evaluate(el => el.tagName);
          const className = await element.getAttribute('class');
          const id = await element.getAttribute('id');
          console.log(`AI元素 ${i + 1}: <${tagName}> class="${className}" id="${id}"`);
        } catch (e) {
          console.log(`AI元素 ${i + 1}: 无法获取详细信息`);
        }
      }
    }

  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    await browser.close();
  }
}

checkAIButton().catch(console.error);