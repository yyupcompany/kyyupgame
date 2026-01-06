const { chromium } = require('playwright');

async function quickLoginTest() {
  console.log('⚡ 快捷登录测试开始...');

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
    console.log('📱 访问应用首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('🔍 查找快捷登录选项...');

    // 查找快捷登录选项
    const quickLoginOptions = [
      { text: '系统管理员', description: '全局管理' },
      { text: '园长', description: '园区管理' },
      { text: '教师', description: '教学管理' },
      { text: '家长', description: '家园互动' }
    ];

    for (const option of quickLoginOptions) {
      console.log(`\n🎯 测试快捷登录: ${option.text} - ${option.description}`);

      try {
        // 查找并点击快捷登录选项
        const quickLoginBtn = await page.$(`:text("${option.text}")`);
        if (quickLoginBtn) {
          console.log(`✅ 找到 ${option.text} 按钮，点击登录...`);
          await quickLoginBtn.click();
          await page.waitForTimeout(3000);

          // 检查登录结果
          const currentUrl = page.url();
          console.log(`登录后URL: ${currentUrl}`);

          // 检查是否有错误提示
          const errorMsg = await page.$('.el-message--error, .error-message');
          if (errorMsg) {
            const errorText = await errorMsg.textContent();
            console.log(`❌ 登录错误: ${errorText}`);
          }

          // 检查是否成功进入系统
          if (!currentUrl.includes('/login')) {
            console.log(`✅ ${option.text} 登录成功！`);

            // 检查localStorage中的token
            const userInfo = await page.evaluate(() => {
              return {
                hasToken: !!(localStorage.getItem('token') || localStorage.getItem('kindergarten_token')),
                userInfo: localStorage.getItem('userInfo'),
                token: localStorage.getItem('token'),
                kindergartenToken: localStorage.getItem('kindergarten_token')
              };
            });
            console.log('用户认证信息:', userInfo);

            // 如果登录成功，开始侧边栏测试
            if (userInfo.hasToken) {
              console.log('📋 开始侧边栏测试...');
              await testSidebar(page, consoleMessages, option.text);
              break; // 测试成功一个就够了
            }

          } else {
            console.log(`❌ ${option.text} 登录失败，仍在登录页面`);
          }

          // 返回登录页面继续测试下一个选项
          await page.goto('http://localhost:5173');
          await page.waitForTimeout(2000);

        } else {
          console.log(`❌ 未找到 ${option.text} 按钮`);
        }

      } catch (error) {
        console.log(`💥 ${option.text} 测试出错: ${error.message}`);
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(2000);
      }
    }

  } catch (error) {
    console.error('💥 测试过程出错:', error.message);
  } finally {
    await browser.close();

    // 输出总结
    console.log('\n📊 快捷登录测试总结:');
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

async function testSidebar(page, consoleMessages, role) {
  console.log(`\n🔍 为角色 ${role} 测试侧边栏...`);

  try {
    // 查找侧边栏
    const sidebarSelectors = [
      '.sidebar',
      'aside',
      '[class*="sidebar"]',
      '.el-menu',
      '.nav-menu'
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
      // 查找所有链接和菜单项
      const menuItems = await page.$$eval('a[href], .el-menu-item, [role="menuitem"], .nav-item', items =>
        items.map(item => ({
          href: item.href,
          text: item.textContent?.trim(),
          className: item.className,
          tag: item.tagName
        }))
      );

      console.log(`🔗 找到 ${menuItems.length} 个菜单项`);

      // 显示前10个菜单项
      menuItems.slice(0, 10).forEach((item, index) => {
        console.log(`${index + 1}. [${item.tag}] ${item.text} -> ${item.href || '无链接'}`);
      });

      // 过滤出可测试的导航项
      const testableItems = menuItems.filter(item =>
        (item.href && item.href.includes('localhost:5173') && !item.href.includes('#')) ||
        (item.className.includes('menu-item') && item.text.trim().length > 0)
      );

      console.log(`📊 可测试的导航项数量: ${testableItems.length}`);

      // 测试前5个导航项
      for (let i = 0; i < Math.min(5, testableItems.length); i++) {
        const item = testableItems[i];
        console.log(`\n🔗 测试菜单项 ${i + 1}: ${item.text}`);

        try {
          const consoleErrorsBefore = consoleMessages.filter(msg => msg.type === 'error').length;

          if (item.href) {
            await page.goto(item.href, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
          } else {
            // 如果没有链接，尝试点击元素
            const element = await page.$(`:text("${item.text}")`);
            if (element) {
              await element.click();
              await page.waitForTimeout(3000);
            }
          }

          const newErrors = consoleMessages.slice(consoleErrorsBefore);
          if (newErrors.length > 0) {
            console.log(`❌ 发现 ${newErrors.length} 个新错误:`);
            newErrors.forEach(error => {
              console.log(`   ${error.text}`);
            });
          } else {
            console.log(`✅ 无错误`);
          }

        } catch (error) {
          console.log(`💥 菜单项访问失败: ${error.message}`);
        }
      }

    } else {
      console.log('❌ 未找到侧边栏');

      // 获取页面内容进行分析
      const pageTitle = await page.title();
      console.log(`页面标题: ${pageTitle}`);

      const bodyText = await page.$eval('body', el => el.innerText.substring(0, 300));
      console.log('页面内容:', bodyText);
    }

  } catch (error) {
    console.error('💥 侧边栏测试出错:', error.message);
  }
}

quickLoginTest().catch(console.error);