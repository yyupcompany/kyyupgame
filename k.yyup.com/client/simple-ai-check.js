import { chromium } from 'playwright';

async function simpleAICheck() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('正在尝试访问仪表板页面...');

    // 先在localStorage中设置模拟的用户登录状态
    await page.addInitScript(() => {
      localStorage.setItem('kindergarten_token', 'mock-token-for-testing');
      localStorage.setItem('kindergarten_user_info', JSON.stringify({
        id: 1,
        username: 'admin',
        realName: '管理员',
        role: 'admin',
        permissions: ['dashboard', 'ai-assistant'],
        isAdmin: true
      }));
      localStorage.setItem('sidebarCollapsed', 'false');
    });

    // 访问仪表板页面
    await page.goto('http://localhost:5173/dashboard');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 额外等待确保组件渲染完成

    console.log('页面已加载，正在查找AI助手按钮...');

    // 截图整个页面
    await page.screenshot({
      path: 'dashboard-full-screenshot.png',
      fullPage: true
    });
    console.log('📸 已保存完整页面截图: dashboard-full-screenshot.png');

    // 查找AI助手按钮 - 使用更精确的选择器
    const aiButtonSelectors = [
      '.ai-assistant-btn',
      '.header-action-btn.ai-assistant-btn',
      'button.ai-assistant-btn',
      '[class*="ai-assistant"]',
      '.header-right button:has(.unified-icon)',
      '.header-action-btn:has([class*="ai"])'
    ];

    let aiButton = null;
    let foundSelector = null;

    for (const selector of aiButtonSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible()) {
            aiButton = element;
            foundSelector = selector;
            console.log(`✅ 找到AI助手按钮: ${selector}`);
            break;
          }
        }
        if (aiButton) break;
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

      // 截图聚焦AI按钮
      if (boundingBox) {
        await page.screenshot({
          path: 'ai-button-closeup.png',
          clip: {
            x: boundingBox.x - 10,
            y: boundingBox.y - 10,
            width: boundingBox.width + 20,
            height: boundingBox.height + 20
          }
        });
        console.log('📸 已保存AI按钮特写: ai-button-closeup.png');
      }

      // 检查按钮内的图标
      const iconSelector = `${foundSelector} .unified-icon`;
      const icon = await page.locator(iconSelector).first();
      if (await icon.isVisible()) {
        console.log('✅ 找到UnifiedIcon图标');

        // 获取图标详细信息
        const iconClass = await icon.getAttribute('class');
        const iconName = await icon.getAttribute('class');
        console.log(`图标类名: ${iconClass}`);

        // 检查SVG元素
        const svg = await icon.locator('svg').first();
        if (await svg.isVisible()) {
          console.log('✅ SVG图标可见');

          // 检查path元素
          const path = await svg.locator('path').first();
          if (await path.isVisible()) {
            const pathD = await path.getAttribute('d');
            console.log(`✅ SVG路径: ${pathD ? pathD.substring(0, 50) + '...' : 'N/A'}`);

            // 检查是否是我们期望的ai-center图标路径
            if (pathD && pathD.includes('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10')) {
              console.log('✅ 检测到ai-center图标路径！');
            }
          }
        }
      }

    } else {
      console.log('❌ 未找到AI助手按钮');

      // 检查头部区域是否存在
      const header = await page.locator('.app-header').first();
      if (await header.isVisible()) {
        console.log('✅ 找到头部区域');

        // 检查头部右侧按钮
        const headerRight = await page.locator('.header-right').first();
        if (await headerRight.isVisible()) {
          console.log('✅ 找到头部右侧区域');

          const buttons = await headerRight.locator('button').all();
          console.log(`找到 ${buttons.length} 个头部按钮`);

          for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            if (await btn.isVisible()) {
              const btnClass = await btn.getAttribute('class');
              const btnTitle = await btn.getAttribute('title');
              console.log(`按钮 ${i + 1}: class="${btnClass}" title="${btnTitle}"`);
            }
          }
        }
      }

      // 检查所有AI相关元素
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

    // 等待一段时间以便观察
    console.log('等待10秒以便观察页面...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    await browser.close();
  }
}

simpleAICheck().catch(console.error);