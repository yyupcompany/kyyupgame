const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testParentCenterPages() {
  console.log('=== PC端家长中心页面检查 ===');

  const browser = await chromium.launch({
    headless: true, // 必须使用无头模式
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }, // PC端分辨率
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  const page = await context.newPage();

  // 监听控制台消息和错误
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  try {
    // 1. 访问首页
    console.log('📍 步骤1: 访问幼儿园管理系统首页');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 截图保存首页
    await page.screenshot({
      path: 'pc-parent-center/01-homepage.png',
      fullPage: true
    });
    console.log('✅ 首页截图已保存');

    // 2. 查找并使用快速体验登录
    console.log('📍 步骤2: 寻找快速体验登录入口');

    // 等待页面加载完成
    await page.waitForTimeout(2000);

    // 尝试多种可能的快速登录选择器
    const quickLoginSelectors = [
      'text=快速体验',
      'text=快速登录',
      'text=体验登录',
      '.quick-login',
      '.quick-experience',
      '[data-testid="quick-login"]',
      'button:has-text("快速")',
      'a:has-text("快速")'
    ];

    let quickLoginButton = null;
    for (const selector of quickLoginSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        quickLoginButton = await page.$(selector);
        if (quickLoginButton) {
          console.log(`找到快速登录按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!quickLoginButton) {
      // 如果没找到快速登录，检查是否已经登录或有其他登录选项
      console.log('未找到快速登录按钮，检查页面状态...');
      await page.screenshot({
        path: 'pc-parent-center/02-no-quick-login.png',
        fullPage: true
      });

      // 尝试查找登录相关元素
      const loginElements = await page.$$eval('button, a', elements =>
        elements.map(el => ({ text: el.textContent.trim(), tag: el.tagName }))
      );
      console.log('页面按钮和链接:', loginElements);
    }

    // 3. 如果找到快速登录，点击并选择家长角色
    if (quickLoginButton) {
      console.log('📍 步骤3: 点击快速登录按钮');
      await quickLoginButton.click();
      await page.waitForTimeout(2000);

      // 截图登录选择界面
      await page.screenshot({
        path: 'pc-parent-center/03-login-selection.png',
        fullPage: true
      });

      // 查找家长角色选项
      const parentRoleSelectors = [
        'text=家长',
        'text=parent',
        '[data-role="parent"]',
        '.role-parent',
        'button:has-text("家长")',
        'div:has-text("家长")'
      ];

      let parentRoleButton = null;
      for (const selector of parentRoleSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          parentRoleButton = await page.$(selector);
          if (parentRoleButton) {
            console.log(`找到家长角色选项: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (parentRoleButton) {
        console.log('点击家长角色选项');
        await parentRoleButton.click();
        await page.waitForTimeout(3000);

        // 截图登录后的首页
        await page.screenshot({
          path: 'pc-parent-center/04-after-login.png',
          fullPage: true
        });
      } else {
        console.log('未找到家长角色选项');
      }
    }

    // 4. 检查当前URL和页面状态
    const currentUrl = page.url();
    console.log('当前页面URL:', currentUrl);

    // 5. 查找家长中心导航
    console.log('📍 步骤4: 查找家长中心导航');

    // 等待页面稳定
    await page.waitForTimeout(3000);

    // 查找家长中心相关的导航项
    const parentCenterSelectors = [
      'text=家长中心',
      'text=家长',
      'parent-center',
      '.parent-center',
      '[data-menu="parent-center"]',
      'a:has-text("家长中心")',
      'li:has-text("家长")'
    ];

    let parentCenterLink = null;
    for (const selector of parentCenterSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          parentCenterLink = elements[0];
          console.log(`找到家长中心导航: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    // 6. 如果找到家长中心，点击进入
    if (parentCenterLink) {
      console.log('点击家长中心导航');
      await parentCenterLink.click();
      await page.waitForTimeout(3000);

      // 截图家长中心首页
      await page.screenshot({
        path: 'pc-parent-center/05-parent-center-home.png',
        fullPage: true
      });

      // 7. 查找所有家长中心子页面
      console.log('📍 步骤5: 查找家长中心子页面导航');

      const parentSubPages = [
        '/parent-center/dashboard',
        '/parent-center/children',
        '/parent-center/activities',
        '/parent-center/assessment',
        '/parent-center/communication',
        '/parent-center/messages',
        '/parent-center/notifications',
        '/parent-center/settings',
        '/parent-center/profile',
        '/parent-center/assignments',
        '/parent-center/attendance',
        '/parent-center/fees',
        '/parent-center/reports'
      ];

      // 检查当前可用的家长中心子页面
      const availableSubPages = [];

      for (const subPage of parentSubPages) {
        try {
          // 构建完整URL
          const fullUrl = `http://localhost:5173#${subPage}`;
          console.log(`尝试访问: ${fullUrl}`);

          const response = await page.goto(fullUrl, {
            waitUntil: 'networkidle',
            timeout: 10000
          });

          if (response && response.status() === 200) {
            await page.waitForTimeout(2000);

            const fileName = `pc-parent-center/subpage-${subPage.replace(/\//g, '-')}.png`;
            await page.screenshot({
              path: fileName,
              fullPage: true
            });

            availableSubPages.push({
              path: subPage,
              url: fullUrl,
              status: response.status(),
              screenshot: fileName
            });

            console.log(`✅ 成功访问: ${subPage}`);
          } else {
            console.log(`❌ 无法访问: ${subPage} (状态: ${response?.status()})`);
          }
        } catch (error) {
          console.log(`❌ 访问失败: ${subPage} - ${error.message}`);
        }
      }

      // 8. 检查页面导航菜单中的实际链接
      console.log('📍 步骤6: 检查页面导航菜单中的家长中心链接');

      const navigationLinks = await page.$$eval('a, li[role="menuitem"], .nav-item', elements =>
        elements.map(el => ({
          text: el.textContent?.trim() || '',
          href: el.href || '',
          className: el.className || '',
          id: el.id || ''
        }))
      );

      const parentRelatedLinks = navigationLinks.filter(link =>
        link.text.includes('家长') ||
        link.href.includes('parent') ||
        link.className.includes('parent')
      );

      console.log('家长相关导航链接:', parentRelatedLinks);

    } else {
      console.log('未找到家长中心导航，尝试直接访问家长中心URL');

      // 尝试直接访问家长中心URL
      const directUrls = [
        'http://localhost:5173#/parent-center',
        'http://localhost:5173#/parent-center/dashboard',
        'http://localhost:5173#/parent'
      ];

      for (const url of directUrls) {
        try {
          console.log(`尝试直接访问: ${url}`);
          const response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 10000
          });

          if (response && response.status() === 200) {
            await page.waitForTimeout(2000);
            await page.screenshot({
              path: `pc-parent-center/direct-${Date.now()}.png`,
              fullPage: true
            });
            console.log(`✅ 直接访问成功: ${url}`);
            break;
          }
        } catch (error) {
          console.log(`❌ 直接访问失败: ${url} - ${error.message}`);
        }
      }
    }

    // 9. 最终截图和分析
    console.log('📍 步骤7: 最终页面状态分析');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'pc-parent-center/09-final-state.png',
      fullPage: true
    });

    // 获取页面标题
    const pageTitle = await page.title();
    console.log('页面标题:', pageTitle);

    // 获取当前URL
    const finalUrl = page.url();
    console.log('最终URL:', finalUrl);

    // 分析控制台消息
    console.log('\n=== 控制台消息分析 ===');
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');

    console.log(`总控制台消息: ${consoleMessages.length}`);
    console.log(`错误消息: ${errorMessages.length}`);
    console.log(`警告消息: ${warningMessages.length}`);

    if (errorMessages.length > 0) {
      console.log('\n错误详情:');
      errorMessages.forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
      });
    }

    // 分析页面错误
    console.log('\n=== 页面错误分析 ===');
    console.log(`页面错误数量: ${pageErrors.length}`);

    if (pageErrors.length > 0) {
      console.log('页面错误详情:');
      pageErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
      });
    }

    // 生成分析报告
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'PC端家长中心页面检查',
      browser: 'Chromium (Headless)',
      viewport: '1920x1080',
      finalUrl: finalUrl,
      pageTitle: pageTitle,
      consoleMessages: {
        total: consoleMessages.length,
        errors: errorMessages.length,
        warnings: warningMessages.length,
        details: errorMessages
      },
      pageErrors: {
        total: pageErrors.length,
        details: pageErrors
      },
      screenshots: [
        'pc-parent-center/01-homepage.png',
        'pc-parent-center/02-no-quick-login.png',
        'pc-parent-center/03-login-selection.png',
        'pc-parent-center/04-after-login.png',
        'pc-parent-center/05-parent-center-home.png',
        'pc-parent-center/09-final-state.png'
      ]
    };

    // 保存报告
    if (!fs.existsSync('pc-parent-center')) {
      fs.mkdirSync('pc-parent-center', { recursive: true });
    }

    fs.writeFileSync(
      'pc-parent-center/test-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n✅ 测试完成，报告已保存到 pc-parent-center/test-report.json');

  } catch (error) {
    console.error('测试过程中发生错误:', error);

    // 错误时也截图
    try {
      await page.screenshot({
        path: 'pc-parent-center/error-state.png',
        fullPage: true
      });
    } catch (e) {
      console.log('无法保存错误截图');
    }
  } finally {
    await browser.close();
  }
}

// 确保目录存在
if (!fs.existsSync('pc-parent-center')) {
  fs.mkdirSync('pc-parent-center', { recursive: true });
}

// 运行测试
testParentCenterPages().catch(console.error);