const { chromium } = require('playwright');

async function skipLoginTest() {
  console.log('⚡ 跳过登录直接测试开始...');

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
    // 首先访问登录页面获取基础页面结构
    console.log('📱 访问应用首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 在访问任何页面之前，先设置localStorage
    console.log('🔑 设置认证信息...');
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJwaG9uZSI6IjE4NjExMTQxMTMxIiwicm9sZSI6ImFkbWluIiwiaXNEZW1vIjp0cnVlLCJpYXQiOjE3NjQ4NzY4NDgsImV4cCI6MTc2NTQ4MTY0OH0.7rktzXj3HDkaZlyFwoiaV-m82_Aojn5aBfd_03RMQWw');
      localStorage.setItem('kindergarten_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJwaG9uZSI6IjE4NjExMTQxMTMxIiwicm9sZSI6ImFkbWluIiwiaXNEZW1vIjp0cnVlLCJpYXQiOjE3NjQ4NzY4NDgsImV4cCI6MTc2NTQ4MTY0OH0.7rktzXj3HDkaZlyFwoiaV-m82_Aojn5aBfd_03RMQWw');
      localStorage.setItem('userInfo', JSON.stringify({
        "id": 121,
        "username": "admin",
        "email": "admin@test.com",
        "realName": "admin",
        "phone": "18611141131",
        "role": "admin",
        "isAdmin": true,
        "status": "active"
      }));
      sessionStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJwaG9uZSI6IjE4NjExMTQxMTMxIiwicm9sZSI6ImFkbWluIiwiaXNEZW1vIjp0cnVlLCJpYXQiOjE3NjQ4NzY4NDgsImV4cCI6MTc2NTQ4MTY0OH0.7rktzXj3HDkaZlyFwoiaV-m82_Aojn5aBfd_03RMQWw');
    });

    console.log('✅ 认证信息已设置');

    // 直接访问dashboard页面
    console.log('🏠 直接访问dashboard页面...');
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 检查当前URL
    const currentUrl = page.url();
    console.log(`当前页面: ${currentUrl}`);

    // 检查是否跳转到了登录页
    if (currentUrl.includes('/login')) {
      console.log('❌ 被重定向到登录页面，认证失败');

      // 尝试其他可能的页面
      const testPages = [
        'http://localhost:5173/',
        'http://localhost:5173/admin',
        'http://localhost:5173/parent-center',
        'http://localhost:5173/teacher-center',
        'http://localhost:5173/principal-center'
      ];

      for (const testPage of testPages) {
        console.log(`🔍 尝试访问: ${testPage}`);
        await page.goto(testPage);
        await page.waitForTimeout(3000);

        const pageUrl = page.url();
        console.log(`访问结果: ${pageUrl}`);

        if (!pageUrl.includes('/login')) {
          console.log(`✅ 成功访问页面: ${testPage}`);
          break;
        }
      }
    } else {
      console.log('✅ 成功访问dashboard页面');
    }

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
      // 查找所有链接和菜单项
      const menuItems = await page.$$eval('a[href], .el-menu-item, [role="menuitem"]', items =>
        items.map(item => ({
          href: item.href,
          text: item.textContent?.trim(),
          className: item.className,
          tag: item.tagName
        }))
      );

      console.log(`🔗 找到 ${menuItems.length} 个菜单项`);

      // 显示所有菜单项
      menuItems.forEach((item, index) => {
        console.log(`${index + 1}. [${item.tag}] ${item.text} -> ${item.href || '无链接'}`);
      });

      // 过滤出可点击的导航项
      const clickableItems = menuItems.filter(item =>
        (item.href && item.href.includes('localhost:5173')) ||
        item.className.includes('menu-item') ||
        item.role === 'menuitem'
      );

      console.log(`📊 可点击的导航项数量: ${clickableItems.length}`);

      // 测试前10个导航项
      for (let i = 0; i < Math.min(10, clickableItems.length); i++) {
        const item = clickableItems[i];
        console.log(`\n🔗 测试菜单项 ${i + 1}: ${item.text}`);

        try {
          const consoleErrorsBefore = consoleMessages.filter(msg => msg.type === 'error').length;

          if (item.href) {
            await page.goto(item.href, { waitUntil: 'networkidle' });
          } else {
            // 如果没有链接，尝试点击元素
            const element = await page.$(`:text("${item.text}")`);
            if (element) {
              await element.click();
              await page.waitForTimeout(2000);
            }
          }

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

        } catch (error) {
          console.log(`💥 菜单项访问失败: ${error.message}`);
        }
      }

    } else {
      console.log('❌ 未找到侧边栏');

      // 获取页面内容进行分析
      const pageTitle = await page.title();
      console.log(`页面标题: ${pageTitle}`);

      const bodyText = await page.$eval('body', el => el.innerText.substring(0, 500));
      console.log('页面内容:', bodyText);
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

skipLoginTest().catch(console.error);