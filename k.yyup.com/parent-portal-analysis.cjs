const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function analyzeParentPortal() {
  console.log('🚀 开始分析幼儿园管理系统家长中心...');

  // 启动浏览器 - 必须使用无头模式
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    // 1. 访问登录页面
    console.log('📍 访问登录页面: http://localhost:5173');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 2. 获取登录页面截图和HTML内容
    console.log('📸 捕获登录页面截图...');
    await page.screenshot({
      path: 'login-page-screenshot.png',
      fullPage: true
    });

    console.log('📄 获取登录页面HTML内容...');
    const loginHTML = await page.content();
    fs.writeFileSync('login-page-content.html', loginHTML);

    // 3. 分析登录页面结构
    console.log('🔍 分析登录页面结构...');

    // 查找页面标题
    const title = await page.title();
    console.log(`   页面标题: ${title}`);

    // 查找登录表单元素
    const loginForm = await page.locator('form').first();
    const hasLoginForms = await loginForm.count();
    console.log(`   登录表单数量: ${hasLoginForms}`);

    // 查找用户角色选择
    const roleSelectors = [
      'select[name="role"]',
      '.role-selector',
      '.user-type',
      '[data-testid*="role"]',
      'el-radio-group',
      '.tab-item',
      '.role-tab'
    ];

    let foundRoles = [];
    for (const selector of roleSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`   找到角色选择器: ${selector} (${elements.length}个元素)`);
          for (const element of elements) {
            const text = await element.textContent();
            if (text && text.trim()) {
              foundRoles.push(text.trim());
            }
          }
        }
      } catch (e) {
        // 忽略选择器错误
      }
    }

    // 查找快速体验登录
    const quickLoginSelectors = [
      'text=快速体验',
      'text=体验登录',
      'text=游客登录',
      'text=试用',
      '.quick-login',
      '.demo-login',
      '.experience-login',
      '[data-testid*="quick"]',
      '[data-testid*="demo"]'
    ];

    let quickLoginFound = false;
    for (const selector of quickLoginSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`   ✅ 找到快速体验登录: ${selector}`);
          quickLoginFound = true;

          // 获取快速体验登录的具体选项
          const quickOptions = await page.locator(selector).locator('..').locator('li, .option, .role-option').all();
          if (quickOptions.length > 0) {
            console.log('   快速体验登录选项:');
            for (const option of quickOptions) {
              const optionText = await option.textContent();
              if (optionText && optionText.trim()) {
                console.log(`     - ${optionText.trim()}`);
              }
            }
          }
          break;
        }
      } catch (e) {
        // 忽略选择器错误
      }
    }

    // 查找家长相关的登录选项
    const parentKeywords = ['家长', 'parent', '监护人', '家庭'];
    const pageContent = await page.textContent('body');
    const parentOptions = [];

    for (const keyword of parentKeywords) {
      if (pageContent.includes(keyword)) {
        console.log(`   ✅ 页面包含家长相关关键词: ${keyword}`);

        // 尝试查找包含该关键词的元素
        try {
          const elements = await page.locator(`text=${keyword}`).all();
          for (const element of elements) {
            const text = await element.textContent();
            if (text && text.trim()) {
              parentOptions.push(text.trim());
            }
          }
        } catch (e) {
          // 忽略错误
        }
      }
    }

    console.log('   家长相关选项:', parentOptions);

    // 4. 尝试登录 - 如果有快速体验，使用家长角色
    let loginSuccess = false;

    if (quickLoginFound) {
      console.log('🔐 尝试使用快速体验登录（家长角色）...');

      // 尝试点击家长相关的快速登录选项
      const parentLoginSelectors = [
        'text=家长体验',
        'text=家长快速登录',
        'text=家长试用',
        'li:has-text("家长")',
        '.role-option:has-text("家长")',
        '[data-role="parent"]'
      ];

      for (const selector of parentLoginSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            console.log(`   点击家长登录选项: ${selector}`);
            await element.click();
            await page.waitForTimeout(3000);
            break;
          }
        } catch (e) {
          console.log(`   无法点击 ${selector}: ${e.message}`);
        }
      }

      // 检查是否登录成功（查看是否跳转到主界面）
      const currentUrl = page.url();
      if (!currentUrl.includes('/login') && !currentUrl === 'http://localhost:5173/') {
        loginSuccess = true;
        console.log('   ✅ 登录成功！');
      } else {
        // 尝试查找并点击登录按钮
        try {
          const loginButton = await page.locator('button[type="submit"], .login-btn, [data-testid*="login"]').first();
          if (await loginButton.isVisible()) {
            await loginButton.click();
            await page.waitForTimeout(5000);

            const newUrl = page.url();
            if (!newUrl.includes('/login')) {
              loginSuccess = true;
              console.log('   ✅ 登录成功！');
            }
          }
        } catch (e) {
          console.log('   ❌ 登录失败:', e.message);
        }
      }
    } else {
      console.log('⚠️  未找到快速体验登录，尝试传统登录方式...');

      // 尝试查找用户名密码输入框
      try {
        const usernameInput = await page.locator('input[name="username"], input[placeholder*="用户"], input[type="text"]').first();
        const passwordInput = await page.locator('input[name="password"], input[placeholder*="密码"], input[type="password"]').first();

        if (await usernameInput.isVisible() && await passwordInput.isVisible()) {
          // 查找测试用户信息
          console.log('   查找测试用户信息...');
          const pageText = await page.textContent('body');

          // 常见的测试账号信息
          const testCredentials = [
            { username: 'parent', password: '123456' },
            { username: '家长', password: '123456' },
            { username: 'test', password: '123456' }
          ];

          for (const cred of testCredentials) {
            try {
              await usernameInput.fill(cred.username);
              await passwordInput.fill(cred.password);

              const loginButton = await page.locator('button[type="submit"], .login-btn').first();
              if (await loginButton.isVisible()) {
                await loginButton.click();
                await page.waitForTimeout(5000);

                const newUrl = page.url();
                if (!newUrl.includes('/login')) {
                  loginSuccess = true;
                  console.log(`   ✅ 使用测试账号登录成功: ${cred.username}`);
                  break;
                }
              }
            } catch (e) {
              console.log(`   测试账号 ${cred.username} 登录失败`);
            }
          }
        }
      } catch (e) {
        console.log('   ❌ 传统登录方式也失败:', e.message);
      }
    }

    // 5. 如果登录成功，分析侧边栏导航结构
    if (loginSuccess) {
      console.log('📊 分析侧边栏导航结构...');

      // 等待页面完全加载
      await page.waitForTimeout(5000);

      // 获取登录后的页面截图
      await page.screenshot({
        path: 'dashboard-screenshot.png',
        fullPage: true
      });

      // 查找侧边栏
      const sidebarSelectors = [
        '.sidebar',
        '.nav-sidebar',
        '.el-menu',
        '.menu-sidebar',
        '[data-testid*="sidebar"]',
        '.navigation',
        '.nav-menu'
      ];

      let sidebarFound = false;
      let navigationStructure = [];

      for (const selector of sidebarSelectors) {
        try {
          const sidebar = await page.locator(selector).first();
          if (await sidebar.isVisible()) {
            console.log(`   ✅ 找到侧边栏: ${selector}`);
            sidebarFound = true;

            // 获取导航结构
            const menuItems = await sidebar.locator('li, .menu-item, .el-menu-item').all();
            console.log(`   发现 ${menuItems.length} 个菜单项`);

            for (let i = 0; i < Math.min(menuItems.length, 50); i++) { // 限制最多50个
              try {
                const item = menuItems[i];
                const text = await item.textContent();
                const href = await item.locator('a').getAttribute('href');
                const hasChildren = await item.locator('ul, .submenu').count() > 0;

                if (text && text.trim()) {
                  navigationStructure.push({
                    text: text.trim(),
                    href: href || null,
                    hasChildren,
                    index: i
                  });
                }
              } catch (e) {
                // 忽略单个项目错误
              }
            }
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      // 输出导航结构
      console.log('\n📋 导航菜单结构:');
      navigationStructure.forEach((item, index) => {
        const prefix = item.hasChildren ? '📁' : '📄';
        const href = item.href ? ` (${item.href})` : '';
        console.log(`   ${prefix} ${index + 1}. ${item.text}${href}`);
      });

      // 6. 查找家长中心相关页面
      console.log('\n🏠 查找家长中心相关功能...');
      const parentCenterKeywords = [
        '家长中心',
        '家长',
        '我的孩子',
        '孩子信息',
        '班级信息',
        '成绩',
        '考勤',
        '通知',
        '作业',
        '课程表',
        '照片',
        '视频',
        '费用',
        '请假',
        '沟通',
        'parent',
        'student',
        'children'
      ];

      const parentCenterPages = [];

      for (const keyword of parentCenterKeywords) {
        const matchingItems = navigationStructure.filter(item =>
          item.text.includes(keyword) ||
          (item.href && item.href.includes(keyword))
        );

        if (matchingItems.length > 0) {
          matchingItems.forEach(item => {
            parentCenterPages.push({
              keyword,
              page: item.text,
              href: item.href,
              index: item.index
            });
          });
        }
      }

      // 输出家长中心页面
      if (parentCenterPages.length > 0) {
        console.log('\n🎯 发现的家长中心相关页面:');
        parentCenterPages.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page.page} ${page.href ? `(链接: ${page.href})` : ''}`);
        });
      } else {
        console.log('\n❌ 未找到明显的家长中心相关页面');
      }

      // 7. 尝试点击家长相关页面（如果找到）
      if (parentCenterPages.length > 0) {
        console.log('\n🔍 尝试访问家长中心页面...');

        for (let i = 0; i < Math.min(3, parentCenterPages.length); i++) { // 最多尝试3个页面
          const targetPage = parentCenterPages[i];

          try {
            console.log(`   访问: ${targetPage.page}`);

            // 尝试点击菜单项
            const menuItem = await page.locator('text=' + targetPage.page).first();
            if (await menuItem.isVisible()) {
              await menuItem.click();
              await page.waitForTimeout(3000);

              // 获取页面截图
              const pageName = targetPage.page.replace(/[^\w\u4e00-\u9fa5]/g, '_');
              await page.screenshot({
                path: `parent-center-${pageName}.png`,
                fullPage: true
              });

              console.log(`     ✅ 成功访问并截图: ${targetPage.page}`);
            }
          } catch (e) {
            console.log(`     ❌ 无法访问 ${targetPage.page}: ${e.message}`);
          }
        }
      }

    } else {
      console.log('❌ 登录失败，无法分析侧边栏和家长中心功能');
    }

    // 8. 生成分析报告
    console.log('\n📊 生成详细分析报告...');

    const report = {
      timestamp: new Date().toISOString(),
      pageTitle: title,
      loginPageAnalysis: {
        hasLoginForm: hasLoginForms > 0,
        quickLoginAvailable: quickLoginFound,
        parentOptionsFound: parentOptions,
        foundRoles: foundRoles
      },
      loginStatus: {
        success: loginSuccess,
        method: quickLoginFound ? '快速体验登录' : '传统登录'
      },
      navigationAnalysis: loginSuccess ? {
        sidebarFound,
        totalMenuItems: navigationStructure.length,
        parentCenterPages: parentCenterPages.length
      } : null,
      parentCenterPages: parentCenterPages,
      fullNavigationStructure: navigationStructure,
      screenshots: [
        'login-page-screenshot.png',
        loginSuccess ? 'dashboard-screenshot.png' : null
      ].filter(Boolean)
    };

    // 确保变量已定义
    if (typeof parentCenterPages === 'undefined') {
      parentCenterPages = [];
    }
    if (typeof navigationStructure === 'undefined') {
      navigationStructure = [];
    }

    // 保存报告
    fs.writeFileSync('parent-portal-analysis-report.json', JSON.stringify(report, null, 2));

    console.log('\n✅ 分析完成！生成的文件:');
    console.log('   - login-page-screenshot.png (登录页面截图)');
    if (loginSuccess) {
      console.log('   - dashboard-screenshot.png (主界面截图)');
    }
    console.log('   - login-page-content.html (登录页面HTML)');
    console.log('   - parent-portal-analysis-report.json (详细分析报告)');

  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);

    // 即使出错也尝试截图
    try {
      await page.screenshot({
        path: 'error-screenshot.png',
        fullPage: true
      });
      console.log('   📸 已保存错误截图: error-screenshot.png');
    } catch (screenshotError) {
      console.log('   无法保存错误截图');
    }

  } finally {
    await browser.close();
    console.log('\n🏁 分析任务完成');
  }
}

// 运行分析
analyzeParentPortal().catch(console.error);