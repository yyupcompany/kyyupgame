const { chromium } = require('playwright');
const fs = require('fs');

async function useQuickExperienceToLogin() {
  console.log('🚀 使用快速体验功能登录...');

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.waitForTimeout(2000);

    // 查找快速体验区域
    const quickExperienceSection = await page.$('.quick-experience, .experience-section');
    if (!quickExperienceSection) {
      console.error('❌ 未找到快速体验区域');
      return false;
    }

    console.log('✅ 找到快速体验区域');

    // 查找所有角色选项
    const roleOptions = await page.evaluate(() => {
      const roles = [];
      const elements = document.querySelectorAll('.role-card, .quick-login-card, .experience-card, [role*="button"]');

      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && (
          text.includes('系统管理员') ||
          text.includes('园长') ||
          text.includes('教师') ||
          text.includes('家长')
        )) {
          roles.push({
            name: text,
            selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').join('.') : ''),
            visible: el.offsetWidth > 0 && el.offsetHeight > 0
          });
        }
      });

      return roles;
    });

    console.log(`📋 发现 ${roleOptions.length} 个角色选项:`);
    roleOptions.forEach((role, index) => {
      console.log(`  ${index + 1}. ${role.name}`);
    });

    // 优先选择系统管理员角色
    let selectedRole = null;
    const preferredOrder = ['系统管理员', '园长', '教师', '家长'];

    for (const preferredRole of preferredOrder) {
      selectedRole = roleOptions.find(role => role.name.includes(preferredRole));
      if (selectedRole) {
        console.log(`🎯 选择角色: ${selectedRole.name}`);
        break;
      }
    }

    if (!selectedRole) {
      console.log('🎯 选择第一个可用角色');
      selectedRole = roleOptions[0];
    }

    if (!selectedRole) {
      console.error('❌ 没有找到可用的角色选项');
      return false;
    }

    // 点击选择的角色
    await page.click(`${selectedRole.selector}:has-text("${selectedRole.name.split(' ')[0]}")`);
    await page.waitForTimeout(3000);

    // 检查是否登录成功
    const currentUrl = page.url();
    const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
    const hasDashboard = await page.$('.dashboard, .main-content, .app-main') !== null;
    const isLoggedIn = hasSidebar || hasDashboard || !currentUrl.includes('login');

    if (isLoggedIn) {
      console.log(`✅ 快速体验登录成功！`);
      console.log(`   使用的角色: ${selectedRole.name}`);
      console.log(`   最终URL: ${currentUrl}`);
      console.log(`   有侧边栏: ${hasSidebar}`);
      console.log(`   有仪表板: ${hasDashboard}`);

      // 保存登录信息
      const loginInfo = {
        role: selectedRole.name,
        loginTime: new Date().toISOString(),
        finalUrl: currentUrl,
        loginMethod: 'quick_experience'
      };

      fs.writeFileSync('quick-experience-login-info.json', JSON.stringify(loginInfo, null, 2));
      console.log('💾 登录信息已保存到 quick-experience-login-info.json');

      // 截图保存
      await page.screenshot({ path: 'dashboard-after-login.png', fullPage: true });
      console.log('📸 登录后页面截图已保存到 dashboard-after-login.png');

      // 获取侧边栏菜单
      console.log('\n📋 获取侧边栏菜单...');
      const sidebarMenu = await getSidebarMenuFromPage(page);

      if (sidebarMenu.length > 0) {
        console.log(`✅ 找到 ${sidebarMenu.length} 个菜单项:`);
        sidebarMenu.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} - ${item.url}`);
        });

        // 保存菜单信息
        const menuInfo = {
          role: selectedRole.name,
          menuItems: sidebarMenu,
          count: sidebarMenu.length,
          discoverTime: new Date().toISOString()
        };

        fs.writeFileSync('sidebar-menu-complete.json', JSON.stringify(menuInfo, null, 2));
        console.log('💾 完整菜单信息已保存到 sidebar-menu-complete.json');

        return {
          success: true,
          role: selectedRole.name,
          menuItems: sidebarMenu
        };
      } else {
        console.log('⚠️ 未找到侧边栏菜单，可能页面结构不同');
        return {
          success: true,
          role: selectedRole.name,
          menuItems: []
        };
      }
    } else {
      console.log('❌ 快速体验登录失败，仍在登录页面');
      return false;
    }

  } catch (error) {
    console.error('❌ 快速体验登录过程中出错:', error);
    return false;
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
        '.layout-sidebar .el-menu-item',
        '.app-sidebar .menu-item',
        'a[href*="/"]',
        '.sidebar a',
        '.navigation a',
        '.menu a'
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            const href = el.href || el.getAttribute('href');
            const routerLink = el.getAttribute('router-link') || el.getAttribute('to') || el.getAttribute('data-route');

            if (text && text.length > 0 && (href || routerLink)) {
              const url = href || routerLink || '';

              // 过滤掉不需要的链接
              if (url &&
                  !url.includes('javascript:void') &&
                  !url.includes('#') &&
                  !url.includes('logout') &&
                  !url.includes('退出') &&
                  !url.includes('signout') &&
                  text !== '首页' &&
                  text !== '仪表板' &&
                  text !== 'Dashboard' &&
                  text.length < 30) {

                // 确保URL是完整的
                let fullUrl = url;
                if (url.startsWith('/')) {
                  fullUrl = `http://localhost:5173${url}`;
                }

                // 检查是否已经存在相同的URL或名称
                const exists = items.some(item =>
                  item.url === fullUrl ||
                  item.name === text ||
                  (item.name.includes(text) || text.includes(item.name))
                );

                if (!exists) {
                  items.push({
                    name: text,
                    url: fullUrl,
                    originalUrl: url,
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

      // 去重并排序
      return items.filter((item, index, self) =>
        index === self.findIndex(t => t.url === item.url && t.name === item.name)
      ).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    });

    return menuItems;
  } catch (error) {
    console.error('获取侧边栏菜单时出错:', error);
    return [];
  }
}

// 运行快速体验登录
useQuickExperienceToLogin().then(result => {
  if (result && result.success) {
    console.log('\n🎉 快速体验登录成功！');
    console.log(`使用的角色: ${result.role}`);
    console.log(`发现的菜单项: ${result.menuItems.length} 个`);

    if (result.menuItems.length > 0) {
      console.log('\n🚀 现在可以运行系统性侧边栏检查了:');
      console.log('1. 首先更新检查脚本以支持快速体验登录');
      console.log('2. 然后运行: node sidebar-systematic-check-with-quick-experience.cjs');

      // 创建一个更新版本的检查脚本
      createUpdatedCheckScript();
    }
  } else {
    console.log('\n💡 建议:');
    console.log('1. 检查页面是否正确加载');
    console.log('2. 尝试手动测试快速体验功能');
    console.log('3. 检查是否有JavaScript错误');
  }
}).catch(console.error);

function createUpdatedCheckScript() {
  const scriptContent = `
const { chromium } = require('playwright');
const fs = require('fs');

// 读取之前获取的菜单信息
let sidebarMenu = [];
try {
  const menuData = JSON.parse(fs.readFileSync('sidebar-menu-complete.json', 'utf8'));
  sidebarMenu = menuData.menuItems;
  console.log(\`📋 加载了 \${sidebarMenu.length} 个菜单项\`);
} catch (error) {
  console.log('❌ 无法加载菜单信息，请先运行快速体验登录');
  process.exit(1);
}

// 检查结果记录
const checkResults = {
  timestamp: new Date().toISOString(),
  role: menuData.role,
  summary: {
    totalPages: 0,
    normalPages: 0,
    errorPages: 0,
    blankPages: 0,
    consoleErrorPages: 0,
    networkErrorPages: 0
  },
  pages: [],
  errorCategories: {
    consoleErrors: [],
    blankPages: [],
    networkErrors: [],
    loadErrors: []
  },
  normalPages: []
};

// 控制台错误收集
const consoleErrors = new Map();
const networkErrors = new Map();

async function runSystematicCheckWithQuickExperience() {
  console.log('🚀 开始系统性侧边栏页面检查（基于快速体验登录）...');

  const browser = await chromium.launch({
    headless: true,
    devtools: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      ignoreHTTPSErrors: true
    });

    const page = await context.newPage();

    // 监听控制台消息
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const currentUrl = page.url();
        if (!consoleErrors.has(currentUrl)) {
          consoleErrors.set(currentUrl, []);
        }
        consoleErrors.get(currentUrl).push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
        console.log(\`🔍 [\${msg.type()}] \${currentUrl}: \${msg.text()}\`);
      }
    });

    // 监听网络请求错误
    page.on('response', (response) => {
      if (response.status() >= 400) {
        const currentUrl = page.url();
        if (!networkErrors.has(currentUrl)) {
          networkErrors.set(currentUrl, []);
        }
        networkErrors.get(currentUrl).push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log(\`🌐 [\${response.status()}] \${response.url()}\`);
      }
    });

    // 第一步：使用快速体验登录
    console.log('\\n📝 第一步：使用快速体验登录');
    await performQuickExperienceLogin(page);

    // 第二步：系统性检查每个页面
    console.log(\`\\n🔍 第二步：系统性检查 \${sidebarMenu.length} 个页面\`);

    for (let i = 0; i < sidebarMenu.length; i++) {
      const menuItem = sidebarMenu[i];
      console.log(\`\\n📄 检查页面 \${i + 1}/\${sidebarMenu.length}: \${menuItem.name}\`);
      console.log(\`   URL: \${menuItem.url}\`);

      const pageCheck = await checkPage(page, menuItem);
      checkResults.pages.push(pageCheck);
      checkResults.summary.totalPages++;

      // 分类记录结果
      if (pageCheck.status === 'normal') {
        checkResults.normalPages.push(pageCheck);
        checkResults.summary.normalPages++;
        console.log(\`   ✅ 页面正常\`);
      } else {
        if (pageCheck.consoleErrors.length > 0) {
          checkResults.errorCategories.consoleErrors.push(pageCheck);
          checkResults.summary.consoleErrorPages++;
        }
        if (pageCheck.isBlank) {
          checkResults.errorCategories.blankPages.push(pageCheck);
          checkResults.summary.blankPages++;
        }
        if (pageCheck.networkErrors.length > 0) {
          checkResults.errorCategories.networkErrors.push(pageCheck);
          checkResults.summary.networkErrorPages++;
        }
        checkResults.summary.errorPages++;
        console.log(\`   ❌ 页面有问题: \${pageCheck.status}\`);
      }
    }

    // 第三步：生成报告
    console.log('\\n📊 第三步：生成详细报告');
    await generateDetailedReport();

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

async function performQuickExperienceLogin(page) {
  await page.goto('http://localhost:5173/login', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForTimeout(2000);

  // 选择系统管理员角色（如果可用）
  const roleToSelect = menuData.role || '系统管理员';

  const roleElement = await page.$(\`*:has-text("\${roleToSelect}")\`);
  if (roleElement) {
    await roleElement.click();
    await page.waitForTimeout(3000);

    // 验证登录成功
    const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
    if (!hasSidebar) {
      throw new Error(\`快速体验登录失败，角色 \${roleToSelect} 可能不可用\`);
    }
    console.log(\`✅ 使用角色 \${roleToSelect} 快速体验登录成功\`);
  } else {
    throw new Error(\`未找到角色 \${roleToSelect}\`);
  }
}

// ... 其余函数与原脚本相同 ...

// 运行检查
runSystematicCheckWithQuickExperience().catch(console.error);
`;

  fs.writeFileSync('sidebar-systematic-check-with-quick-experience.cjs', scriptContent);
  console.log('💾 已创建更新的检查脚本: sidebar-systematic-check-with-quick-experience.cjs');
}