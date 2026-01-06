const { chromium } = require('playwright');

async function detailedTest() {
  console.log('🔍 详细测试开始...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    if (msg.type() === 'error') {
      console.log(`❌ 控制台错误: ${msg.text()}`);
    }
  });

  try {
    // 访问首页
    console.log('📱 访问应用首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 检查页面状态
    console.log('🔍 检查页面状态...');
    const url = page.url();
    console.log(`当前URL: ${url}`);

    // 检查是否有登录表单
    const hasLoginModal = await page.$('.login-modal, .el-dialog, [role="dialog"]');
    const hasLoginForm = await page.$('input[type="password"]');
    console.log(`是否有登录弹窗: ${!!hasLoginModal}`);
    console.log(`是否有登录表单: ${!!hasLoginForm}`);

    if (hasLoginModal && hasLoginForm) {
      console.log('🔑 发现登录弹窗，尝试登录...');

      // 填写admin用户名
      const usernameInput = await page.$('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]');
      if (usernameInput) {
        await usernameInput.fill('admin');
        console.log('✅ 已填写用户名');
      }

      // 填写密码
      const passwordInput = await page.$('input[type="password"]');
      if (passwordInput) {
        await passwordInput.fill('123456');
        console.log('✅ 已填写密码');
      }

      // 点击登录按钮
      const loginBtn = await page.$('button:has-text("登录"), .login-btn, button[type="submit"]');
      if (loginBtn) {
        console.log('🔑 点击登录按钮...');
        await loginBtn.click();
        await page.waitForTimeout(5000);

        // 检查登录结果
        const currentUrl = page.url();
        console.log(`登录后URL: ${currentUrl}`);

        // 检查是否有错误提示
        const errorMsg = await page.$('.el-message--error, .error-message');
        if (errorMsg) {
          const errorText = await errorMsg.textContent();
          console.log(`❌ 登录错误: ${errorText}`);
        }
      }
    }

    // 检查页面是否已登录
    console.log('🔍 检查登录状态...');
    const userInfo = await page.evaluate(() => {
      return {
        hasToken: !!(localStorage.getItem('token') || localStorage.getItem('kindergarten_token')),
        userInfo: localStorage.getItem('userInfo'),
        token: localStorage.getItem('token'),
        kindergartenToken: localStorage.getItem('kindergarten_token')
      };
    });
    console.log('用户信息:', userInfo);

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 查找侧边栏
    console.log('📋 查找侧边栏...');
    const sidebarSelectors = [
      '.sidebar',
      'aside',
      '[class*="sidebar"]',
      '.el-menu',
      '.nav-menu',
      '[class*="menu"]'
    ];

    let sidebar = null;
    for (const selector of sidebarSelectors) {
      sidebar = await page.$(selector);
      if (sidebar) {
        console.log(`✅ 找到侧边栏: ${selector}`);
        break;
      }
    }

    if (sidebar) {
      // 查找所有链接
      const links = await page.$$eval('a[href]', links =>
        links.map(link => ({
          href: link.href,
          text: link.textContent?.trim(),
          className: link.className
        }))
      );

      console.log(`🔗 找到 ${links.length} 个链接`);

      // 显示所有链接
      links.forEach((link, index) => {
        console.log(`${index + 1}. ${link.text} -> ${link.href}`);
      });

      // 过滤出主要的导航链接
      const navLinks = links.filter(link =>
        link.href.includes('localhost:5173') &&
        !link.href.includes('#') &&
        link.text.trim().length > 0
      );

      console.log(`📊 主要导航链接数量: ${navLinks.length}`);

      // 测试前5个导航链接
      for (let i = 0; i < Math.min(5, navLinks.length); i++) {
        const link = navLinks[i];
        console.log(`\n🔗 测试链接 ${i + 1}: ${link.text} (${link.href})`);

        try {
          const consoleErrorsBefore = consoleMessages.filter(msg => msg.type === 'error').length;

          await page.goto(link.href, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);

          const newErrors = consoleMessages.slice(consoleErrorsBefore);
          if (newErrors.length > 0) {
            console.log(`❌ 发现 ${newErrors.length} 个新错误:`);
            newErrors.forEach(error => {
              console.log(`   ${error.text}`);
            });
          } else {
            console.log(`✅ 无错误`);
          }

          // 返回首页
          await page.goto('http://localhost:5173');
          await page.waitForTimeout(1000);

        } catch (error) {
          console.log(`💥 链接访问失败: ${error.message}`);
        }
      }

    } else {
      console.log('❌ 未找到侧边栏');

      // 查找页面内容
      const bodyText = await page.$eval('body', el => el.innerText.substring(0, 200));
      console.log('页面内容预览:', bodyText);

      // 查找可能的菜单或导航元素
      const navElements = await page.$$eval('nav, .menu, .nav, [class*="nav"]', elems =>
        elems.map(el => ({
          tag: el.tagName,
          className: el.className,
          textContent: el.textContent?.substring(0, 100)
        }))
      );
      console.log('导航元素:', navElements);
    }

  } catch (error) {
    console.error('💥 测试过程出错:', error.message);
  } finally {
    await browser.close();

    // 输出总结
    console.log('\n📊 测试总结:');
    console.log(`- 总共控制台消息: ${consoleMessages.length}`);
    console.log(`- 控制台错误: ${consoleMessages.filter(msg => msg.type === 'error').length}`);

    if (consoleMessages.filter(msg => msg.type === 'error').length > 0) {
      console.log('\n❌ 所有控制台错误:');
      consoleMessages.filter(msg => msg.type === 'error').forEach(msg => {
        console.log(`- ${msg.text} (位置: ${msg.location?.url}:${msg.location?.lineNumber})`);
      });
    }
  }
}

detailedTest().catch(console.error);