const { chromium } = require('playwright');

async function adminQuickLoginTest() {
  console.log('⚡ 管理员快捷登录测试开始...');

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
      console.log(`❌ 控制台错误: ${msg.text}`);
    }
  });

  try {
    console.log('📱 访问应用首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('🔍 测试管理员快捷登录...');

    // 尝试测试不同的管理员相关选项
    const adminOptions = [
      '系统管理员',
      '管理员',
      'admin',
      'Admin'
    ];

    let loginSuccess = false;

    for (const option of adminOptions) {
      console.log(`\n🎯 尝试登录: ${option}`);

      try {
        // 查找并点击管理员登录选项
        const adminBtn = await page.$(`:text("${option}")`);
        if (adminBtn) {
          console.log(`✅ 找到 ${option} 按钮，点击登录...`);
          await adminBtn.click();
          await page.waitForTimeout(3000);

          // 检查登录结果
          const currentUrl = page.url();
          console.log(`登录后URL: ${currentUrl}`);

          // 检查是否成功进入系统
          if (!currentUrl.includes('/login')) {
            console.log(`✅ ${option} 登录成功！`);
            loginSuccess = true;

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

            // 开始侧边栏测试
            await comprehensiveSidebarTest(page, consoleMessages, option);
            break;

          } else {
            console.log(`❌ ${option} 登录失败，仍在登录页面`);
          }

        } else {
          console.log(`❌ 未找到 ${option} 按钮`);
        }

        // 返回登录页面继续测试下一个选项
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(2000);

      } catch (error) {
        console.log(`💥 ${option} 测试出错: ${error.message}`);
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(2000);
      }
    }

    if (!loginSuccess) {
      console.log('❌ 所有管理员登录选项都失败，尝试手动设置token...');

      // 如果快捷登录失败，手动设置管理员token
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
          "status": "active",
          "roles": ["admin"],
          "permissions": ["*"]
        }));
      });

      console.log('✅ 手动设置token完成，尝试访问dashboard...');
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        console.log('✅ 手动登录成功！开始侧边栏测试...');
        await comprehensiveSidebarTest(page, consoleMessages, '手动设置');
      } else {
        console.log('❌ 手动设置token仍然失败');
      }
    }

  } catch (error) {
    console.error('💥 测试过程出错:', error.message);
  } finally {
    await browser.close();

    // 输出总结
    console.log('\n📊 管理员快捷登录测试总结:');
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

async function comprehensiveSidebarTest(page, consoleMessages, loginMethod) {
  console.log(`\n📋 为登录方式 "${loginMethod}" 进行综合侧边栏测试...`);

  try {
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 查找侧边栏
    const sidebarSelectors = [
      '.sidebar',
      'aside',
      '[class*="sidebar"]',
      '.el-menu',
      '.nav-menu',
      '[class*="nav"]'
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
      console.log('🔍 开始侧边栏链接测试...');

      // 查找所有可点击的元素
      const allClickable = await page.$$eval('a[href], button, .el-menu-item, [role="menuitem"], [class*="menu"], .nav-item', elements =>
        elements.map(el => ({
          href: el.href,
          text: el.textContent?.trim(),
          className: el.className,
          tag: el.tagName,
          role: el.getAttribute('role'),
          onclick: el.getAttribute('onclick')
        }))
      );

      console.log(`🔗 找到 ${allClickable.length} 个可点击元素`);

      // 过滤出有意义的导航项
      const navigationItems = allClickable.filter(item =>
        (item.href && item.href.includes('localhost:5173') && !item.href.includes('#')) ||
        (item.className.includes('menu-item') && item.text.trim().length > 0) ||
        (item.role === 'menuitem' && item.text.trim().length > 0)
      );

      console.log(`📊 可测试的导航项数量: ${navigationItems.length}`);

      // 显示所有导航项
      navigationItems.slice(0, 15).forEach((item, index) => {
        console.log(`${index + 1}. [${item.tag}] ${item.text} -> ${item.href || '无链接'}`);
      });

      // 测试前15个导航项，记录所有错误
      const testResults = [];

      for (let i = 0; i < Math.min(15, navigationItems.length); i++) {
        const item = navigationItems[i];
        console.log(`\n🔗 测试导航项 ${i + 1}/${Math.min(15, navigationItems.length)}: ${item.text}`);

        try {
          const consoleErrorsBefore = consoleMessages.filter(msg => msg.type === 'error').length;
          const currentUrl = page.url();

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
          const finalUrl = page.url();

          const result = {
            item: item.text,
            href: item.href,
            errors: newErrors.length,
            errorDetails: newErrors.map(e => e.text),
            urlChanged: currentUrl !== finalUrl,
            finalUrl: finalUrl
          };

          testResults.push(result);

          if (newErrors.length > 0) {
            console.log(`❌ 发现 ${newErrors.length} 个错误:`);
            newErrors.forEach(error => {
              console.log(`   ${error.text}`);
            });
          } else {
            console.log(`✅ 无错误`);
          }

        } catch (error) {
          console.log(`💥 导航项访问失败: ${error.message}`);
          testResults.push({
            item: item.text,
            href: item.href,
            errors: 1,
            errorDetails: [error.message],
            urlChanged: false,
            finalUrl: '访问失败'
          });
        }
      }

      // 输出测试结果总结
      console.log('\n📊 侧边栏测试结果总结:');
      const totalItems = testResults.length;
      const itemsWithErrors = testResults.filter(r => r.errors > 0).length;
      const totalErrors = testResults.reduce((sum, r) => sum + r.errors, 0);

      console.log(`- 测试项目数: ${totalItems}`);
      console.log(`- 有错误的项目: ${itemsWithErrors}`);
      console.log(`- 总错误数: ${totalErrors}`);
      console.log(`- 成功率: ${((totalItems - itemsWithErrors) / totalItems * 100).toFixed(1)}%`);

      if (itemsWithErrors > 0) {
        console.log('\n❌ 有错误的导航项:');
        testResults.filter(r => r.errors > 0).forEach(result => {
          console.log(`- ${result.item}: ${result.errors} 个错误`);
          result.errorDetails.forEach(error => {
            console.log(`   * ${error}`);
          });
        });
      }

    } else {
      console.log('❌ 未找到侧边栏，尝试查找页面内容...');

      // 尝试查找其他导航元素
      const pageTitle = await page.title();
      console.log(`页面标题: ${pageTitle}`);

      // 查找可能的菜单区域
      const menuAreas = await page.$$eval('[class*="menu"], [class*="nav"], nav, header', areas =>
        areas.map(area => ({
          className: area.className,
          tag: area.tagName,
          textContent: area.textContent?.substring(0, 100)
        }))
      );

      if (menuAreas.length > 0) {
        console.log(`🔍 找到 ${menuAreas.length} 个可能的导航区域:`);
        menuAreas.forEach((area, index) => {
          console.log(`${index + 1}. [${area.tag}] ${area.className}: ${area.textContent}`);
        });
      }

      // 获取主要内容
      const mainContent = await page.$eval('main, .main, [class*="content"], .container', el =>
        el.innerText?.substring(0, 300)
      ).catch(() => '无法获取主要内容');

      console.log('主要内容:', mainContent);
    }

  } catch (error) {
    console.error('💥 侧边栏测试出错:', error.message);
  }
}

adminQuickLoginTest().catch(console.error);