const { chromium } = require('playwright');

async function checkSidebarIconsAfterLogin() {
  console.log('=== 带登录的侧边栏图标检查开始 ===');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 首先访问登录页面
    console.log('🌐 访问登录页面...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 检查是否在登录页面
    const currentUrl = page.url();
    console.log(`📍 当前URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('🔐 需要登录，尝试自动登录...');

      // 查找用户名和密码输入框
      const usernameSelectors = [
        'input[name="username"]',
        'input[placeholder*="用户名"]',
        'input[placeholder*="账号"]',
        'input[type="text"]'
      ];

      const passwordSelectors = [
        'input[name="password"]',
        'input[placeholder*="密码"]',
        'input[type="password"]'
      ];

      let usernameInput = null;
      let passwordInput = null;

      // 查找用户名输入框
      for (const selector of usernameSelectors) {
        try {
          usernameInput = await page.$(selector);
          if (usernameInput) {
            console.log(`✅ 找到用户名输入框: ${selector}`);
            break;
          }
        } catch (err) {
          continue;
        }
      }

      // 查找密码输入框
      for (const selector of passwordSelectors) {
        try {
          passwordInput = await page.$(selector);
          if (passwordInput) {
            console.log(`✅ 找到密码输入框: ${selector}`);
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (usernameInput && passwordInput) {
        // 尝试使用测试账号登录
        await usernameInput.fill('admin');
        await passwordInput.fill('123456');

        console.log('📝 输入登录信息: admin / 123456');

        // 查找登录按钮
        const loginButtonSelectors = [
          'button[type="submit"]',
          'button:has-text("登录")',
          '.el-button:has-text("登录")',
          'button:has-text("Sign in")',
          '.login-btn'
        ];

        let loginButton = null;
        for (const selector of loginButtonSelectors) {
          try {
            loginButton = await page.$(selector);
            if (loginButton) {
              console.log(`✅ 找到登录按钮: ${selector}`);
              break;
            }
          } catch (err) {
            continue;
          }
        }

        if (loginButton) {
          await loginButton.click();
          console.log('🖱️ 点击登录按钮');

          // 等待登录完成
          await page.waitForTimeout(5000);

          // 检查是否登录成功
          const newUrl = page.url();
          console.log(`🔄 登录后URL: ${newUrl}`);

          if (!newUrl.includes('/login')) {
            console.log('✅ 登录成功！');
          } else {
            console.log('❌ 登录可能失败，仍在登录页面');
          }
        } else {
          console.log('❌ 未找到登录按钮');
        }
      } else {
        console.log('❌ 未找到登录表单输入框');
      }
    }

    // 现在尝试访问dashboard页面
    console.log('🎯 访问 dashboard 页面...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 检查当前页面
    const dashboardUrl = page.url();
    console.log(`📍 Dashboard页面URL: ${dashboardUrl}`);

    if (dashboardUrl.includes('/login')) {
      console.log('⚠️ 被重定向到登录页面，登录可能失败');
      // 尝试其他登录方式或者直接查看页面内容
    }

    // 等待页面完全加载
    await page.waitForTimeout(3000);

    // 截图当前状态
    await page.screenshot({ path: 'dashboard-current-state.png', fullPage: true });

    // 查找侧边栏
    const sidebarSelectors = [
      '.sidebar',
      '.aside',
      '[class*="sidebar"]',
      '[class*="aside"]',
      '.el-aside',
      '.el-menu',
      '.nav-sidebar'
    ];

    let foundSidebar = null;
    for (const selector of sidebarSelectors) {
      try {
        const sidebar = await page.$(selector);
        if (sidebar) {
          const isVisible = await sidebar.isVisible();
          if (isVisible) {
            foundSidebar = sidebar;
            console.log(`✅ 找到可见侧边栏: ${selector}`);
            break;
          }
        }
      } catch (err) {
        continue;
      }
    }

    if (!foundSidebar) {
      console.log('❌ 未找到可见的侧边栏');
    } else {
      // 查找侧边栏中的图标
      const sidebarIcons = await foundSidebar.$$('i, svg, [class*="icon"], [class*="el-icon"]');
      console.log(`📊 侧边栏中发现图标数量: ${sidebarIcons.length}`);

      // 检查前几个图标的样式
      for (let i = 0; i < Math.min(5, sidebarIcons.length); i++) {
        const icon = sidebarIcons[i];
        try {
          const isVisible = await icon.isVisible();
          const className = await icon.getAttribute('class');
          const boundingBox = await icon.boundingBox();

          console.log(`🔍 侧边栏图标 ${i + 1}:`);
          console.log(`   - 可见: ${isVisible}`);
          console.log(`   - 位置: ${boundingBox ? `(${boundingBox.x}, ${boundingBox.y})` : 'N/A'}`);
          console.log(`   - 大小: ${boundingBox ? `${boundingBox.width}x${boundingBox.height}` : 'N/A'}`);
          console.log(`   - 类名: ${className || 'N/A'}`);

          // 检查计算样式
          const computedStyle = await icon.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              color: style.color,
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor,
              fill: style.fill,
              stroke: style.stroke,
              strokeWidth: style.strokeWidth
            };
          });

          console.log(`   - 样式:`, computedStyle);
        } catch (err) {
          console.log(`   - 检查失败: ${err.message}`);
        }
      }
    }

    // 查找菜单项
    const menuItems = await page.$$('[class*="menu-item"], [class*="nav-item"], .el-menu-item');
    console.log(`📋 发现菜单项数量: ${menuItems.length}`);

    if (menuItems.length > 0) {
      for (let i = 0; i < Math.min(5, menuItems.length); i++) {
        const item = menuItems[i];
        try {
          const text = await item.textContent();
          const isVisible = await item.isVisible();

          // 检查菜单项中的图标
          const itemIcon = await item.$('i, svg, [class*="icon"]');
          const hasIcon = !!itemIcon;

          console.log(`📝 菜单项 ${i + 1}: "${text?.trim()}" (可见: ${isVisible}, 有图标: ${hasIcon})`);
        } catch (err) {
          console.log(`   - 菜单项检查失败: ${err.message}`);
        }
      }
    }

    // 检查控制台错误
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      }
    });

    await page.waitForTimeout(2000); // 等待收集控制台消息

    if (consoleMessages.length > 0) {
      console.log('⚠️ 控制台消息:');
      consoleMessages.forEach(msg => console.log(`   ${msg}`));
    }

    // 最终截图
    await page.screenshot({ path: 'sidebar-icons-final-check.png', fullPage: true });
    console.log('📸 最终截图已保存: sidebar-icons-final-check.png');

    // 尝试检查不同的侧边栏组件
    console.log('\n🔍 检查特定的侧边栏组件...');

    const componentSelectors = [
      'ImprovedSidebar',
      'TeacherSidebar',
      'ParentSidebar'
    ];

    for (const componentName of componentSelectors) {
      const componentElement = await page.$$(`[class*="${componentName.toLowerCase()}"], [data-component*="${componentName.toLowerCase()}"]`);
      if (componentElement.length > 0) {
        console.log(`✅ 找到 ${componentName} 组件: ${componentElement.length} 个`);
      } else {
        console.log(`❌ 未找到 ${componentName} 组件`);
      }
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    await browser.close();
    console.log('=== 侧边栏图标检查完成 ===');
  }
}

// 运行检查
checkSidebarIconsAfterLogin().catch(console.error);