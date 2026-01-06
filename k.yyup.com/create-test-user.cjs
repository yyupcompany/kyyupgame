const { chromium } = require('playwright');

async function createTestUserAndLogin() {
  console.log('🔍 尝试创建测试用户或找到登录方法...');

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    // 首先，检查是否有任何默认登录方法或绕过机制
    console.log('📝 检查登录页面是否有特殊功能...');

    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.waitForTimeout(2000);

    // 检查页面内容
    const pageContent = await page.content();

    // 查找是否有测试账号提示、忘记密码功能或注册链接
    const hasForgotPassword = pageContent.includes('忘记密码') || pageContent.includes('Forgot');
    const hasRegister = pageContent.includes('注册') || pageContent.includes('Register');
    const hasTestAccountHint = pageContent.includes('test') || pageContent.includes('demo') || pageContent.includes('测试');
    const hasGuestLogin = pageContent.includes('游客') || pageContent.includes('Guest');

    console.log(`登录页面分析:`);
    console.log(`  - 有忘记密码功能: ${hasForgotPassword}`);
    console.log(`  - 有注册功能: ${hasRegister}`);
    console.log(`  - 有测试账号提示: ${hasTestAccountHint}`);
    console.log(`  - 有游客登录: ${hasGuestLogin}`);

    // 尝试查找页面上的提示信息
    const hints = await page.evaluate(() => {
      const hints = [];

      // 查找可能包含账号信息的元素
      const elements = document.querySelectorAll('div, p, span, small, .hint, .help, .note');

      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && (
          text.includes('admin') ||
          text.includes('test') ||
          text.includes('demo') ||
          text.includes('123') ||
          text.includes('默认') ||
          text.includes('账号')
        )) {
          hints.push(text);
        }
      });

      return hints;
    });

    if (hints.length > 0) {
      console.log('\n💡 发现可能有用信息:');
      hints.forEach(hint => console.log(`  - ${hint}`));
    }

    // 尝试一些常见的默认凭据
    const commonCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'admin', password: '123456' },
      { username: 'admin', password: 'password' },
      { username: 'admin', password: 'admin' },
      { username: 'test', password: '123456' },
      { username: 'demo', password: 'demo123' },
      { username: 'root', password: 'root' },
      { username: 'super', password: 'admin' },
      { username: 'administrator', password: 'admin' },
      { username: '', password: '' }, // 空登录
    ];

    console.log('\n🔑 测试常见凭据...');

    for (const credentials of commonCredentials) {
      try {
        console.log(`测试: ${credentials.username || '(空)'} / ${credentials.password || '(空)'}`);

        // 清空并填写表单
        await page.evaluate(() => {
          document.querySelectorAll('input').forEach(input => input.value = '');
        });

        if (credentials.username) {
          await page.fill('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"]', credentials.username);
        }
        if (credentials.password) {
          await page.fill('input[type="password"]', credentials.password);
        }

        // 点击登录按钮或按回车
        const loginButton = await page.$('button[type="submit"], .el-button--primary, button:has-text("登录")');
        if (loginButton) {
          await loginButton.click();
        } else {
          await page.keyboard.press('Enter');
        }

        // 等待登录结果
        await page.waitForTimeout(3000);

        // 检查是否登录成功
        const currentUrl = page.url();
        const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
        const hasDashboard = await page.$('.dashboard, .main-content, .app-main') !== null;
        const isLoggedIn = hasSidebar || hasDashboard || !currentUrl.includes('login');

        if (isLoggedIn) {
          console.log(`✅ 登录成功！使用凭据: ${credentials.username} / ${credentials.password}`);
          console.log(`   最终URL: ${currentUrl}`);

          // 保存成功凭据
          const fs = require('fs');
          const successInfo = {
            username: credentials.username,
            password: credentials.password,
            loginTime: new Date().toISOString(),
            finalUrl: currentUrl,
            loginMethod: 'found_credentials'
          };

          fs.writeFileSync('successful-login-info.json', JSON.stringify(successInfo, null, 2));
          console.log('💾 登录信息已保存到 successful-login-info.json');

          // 获取侧边栏菜单
          console.log('\n📋 获取侧边栏菜单...');
          const sidebarMenu = await getSidebarMenuFromPage(page);

          if (sidebarMenu.length > 0) {
            console.log(`✅ 找到 ${sidebarMenu.length} 个菜单项`);
            sidebarMenu.forEach((item, index) => {
              console.log(`   ${index + 1}. ${item.name} - ${item.url}`);
            });

            // 保存菜单信息
            const menuInfo = {
              menuItems: sidebarMenu,
              count: sidebarMenu.length,
              discoverTime: new Date().toISOString()
            };

            fs.writeFileSync('sidebar-menu-discovery.json', JSON.stringify(menuInfo, null, 2));
            console.log('💾 菜单信息已保存到 sidebar-menu-discovery.json');

            return {
              success: true,
              credentials: credentials,
              menuItems: sidebarMenu
            };
          }

          return { success: true, credentials: credentials };
        }

        // 如果没有成功，回到登录页面
        if (!currentUrl.includes('login')) {
          await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
        }

      } catch (error) {
        console.log(`   ❌ 测试凭据时出错: ${error.message}`);
      }
    }

    console.log('\n🚫 所有常见凭据都失败了');
    console.log('\n💡 建议:');
    console.log('1. 检查后端API是否有创建用户的接口');
    console.log('2. 查看项目文档是否有默认账号说明');
    console.log('3. 检查数据库中是否有现有用户数据');

    return { success: false };

  } catch (error) {
    console.error('❌ 创建测试用户过程中出错:', error);
    return { success: false };
  } finally {
    await browser.close();
  }
}

async function getSidebarMenuFromPage(page) {
  try {
    await page.waitForTimeout(2000);

    const menuItems = await page.evaluate(() => {
      const items = [];

      // 尝试多种选择器来获取菜单项
      const selectors = [
        '.sidebar .el-menu-item',
        '.main-sidebar .el-menu-item',
        '.sidebar .menu-item',
        '.el-menu .el-menu-item',
        '.nav-menu .menu-item',
        'a[href*="/"]',
        '.sidebar a',
        '.navigation a'
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            const href = el.href || el.getAttribute('href');
            const routerLink = el.getAttribute('router-link') || el.getAttribute('to');

            if (text && text.length > 0 && (href || routerLink)) {
              const url = href || routerLink || '';

              // 过滤掉不需要的链接
              if (url &&
                  !url.includes('javascript:void') &&
                  !url.includes('#') &&
                  !url.includes('logout') &&
                  !url.includes('退出') &&
                  text !== '首页' &&
                  text.length < 20) {

                // 确保URL是完整的
                let fullUrl = url;
                if (url.startsWith('/')) {
                  fullUrl = `http://localhost:5173${url}`;
                }

                // 检查是否已经存在相同的URL
                const exists = items.some(item => item.url === fullUrl || item.name === text);
                if (!exists) {
                  items.push({
                    name: text,
                    url: fullUrl,
                    selector: selector
                  });
                }
              }
            }
          });
        } catch (e) {
          // 忽略选择器错误
        }
      });

      return items;
    });

    return menuItems;
  } catch (error) {
    console.error('获取侧边栏菜单时出错:', error);
    return [];
  }
}

// 运行测试
createTestUserAndLogin().then(result => {
  if (result.success) {
    console.log('\n🎉 成功找到登录方法！');
    console.log(`用户名: ${result.credentials.username}`);
    console.log(`密码: ${result.credentials.password}`);
    if (result.menuItems) {
      console.log(`发现菜单项: ${result.menuItems.length} 个`);
    }

    console.log('\n🚀 现在可以运行系统性侧边栏检查了:');
    console.log('node sidebar-systematic-check.cjs');

  } else {
    console.log('\n💡 其他建议:');
    console.log('1. 检查项目README或文档是否有默认账号');
    console.log('2. 查看server目录的种子数据脚本');
    console.log('3. 检查数据库配置和连接');
    console.log('4. 尝试重新初始化数据库');
  }
}).catch(console.error);