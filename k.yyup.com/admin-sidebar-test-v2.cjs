const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  baseURL: 'http://localhost:5173',
  apiURL: 'http://localhost:3000',
  timeout: 30000,
  screenshotDir: './admin-sidebar-test-v2-screenshots',
  reportFile: './admin-sidebar-test-v2-report.md'
};

// 创建截图目录
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir);
}

// 测试结果记录
const testResults = {
  timestamp: new Date().toISOString(),
  loginStatus: null,
  loginAttempts: [],
  sidebarMenus: [],
  permissionIssues: [],
  successfulMenus: [],
  failedMenus: []
};

async function takeScreenshot(page, name) {
  try {
    const screenshotPath = path.join(CONFIG.screenshotDir, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ 截图保存: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error(`❌ 截图失败 ${name}:`, error.message);
    return null;
  }
}

async function checkServerStatus() {
  try {
    // 检查前端服务
    const frontendResponse = await fetch(`${CONFIG.baseURL}`);
    const frontendOK = frontendResponse.ok;

    // 检查后端服务
    const backendResponse = await fetch(`${CONFIG.apiURL}/api-docs`);
    const backendOK = backendResponse.ok;

    console.log(`前端服务状态: ${frontendOK ? '✅ 正常' : '❌ 异常'}`);
    console.log(`后端服务状态: ${backendOK ? '✅ 正常' : '❌ 异常'}`);

    return { frontendOK, backendOK };
  } catch (error) {
    console.error('服务状态检查失败:', error.message);
    return { frontendOK: false, backendOK: false };
  }
}

async function tryQuickLogin(page) {
  const quickLoginMethods = [
    // 方法1：查找admin快捷登录按钮
    {
      name: 'admin快捷登录按钮',
      action: async () => {
        const selectors = [
          'button:has-text("admin")',
          'button:has-text("管理员")',
          'button:has-text("快捷登录")',
          '.admin-login',
          '[class*="admin"] button',
          'button[onclick*="admin"]'
        ];

        for (const selector of selectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`找到快捷登录按钮: ${selector}`);
            await page.locator(selector).first().click();
            return true;
          }
        }
        return false;
      }
    },
    // 方法2：查找任意包含登录关键词的按钮
    {
      name: '通用登录按钮',
      action: async () => {
        const loginSelectors = [
          'button:has-text("登录")',
          '.login-btn',
          '.btn-login',
          '[type="submit"]',
          'button[class*="login"]'
        ];

        for (const selector of loginSelectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`找到登录按钮: ${selector}`);
            await page.locator(selector).first().click();
            return true;
          }
        }
        return false;
      }
    }
  ];

  for (const method of quickLoginMethods) {
    try {
      console.log(`尝试方法: ${method.name}`);
      const success = await method.action();
      if (success) {
        console.log(`✓ ${method.name} 成功`);
        await page.waitForTimeout(3000);

        // 检查是否登录成功
        const currentURL = page.url();
        if (!currentURL.includes('/login')) {
          return true;
        }
      }
    } catch (error) {
      console.log(`✗ ${method.name} 失败: ${error.message}`);
    }
  }

  return false;
}

async function tryManualLogin(page) {
  try {
    console.log('尝试手动登录...');

    // 查找用户名输入框
    const usernameSelectors = [
      'input[type="text"]',
      'input[placeholder*="用户"]',
      'input[placeholder*="账号"]',
      'input[name="username"]',
      'input[name="user"]',
      '#username',
      'input[placeholder*="Username"]'
    ];

    let usernameFound = false;
    for (const selector of usernameSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`找到用户名输入框: ${selector}`);
        await page.locator(selector).first().fill('admin');
        usernameFound = true;
        break;
      }
    }

    if (!usernameFound) {
      console.log('未找到用户名输入框');
      return false;
    }

    // 查找密码输入框
    const passwordSelectors = [
      'input[type="password"]',
      'input[placeholder*="密码"]',
      'input[name="password"]',
      '#password',
      'input[placeholder*="Password"]'
    ];

    let passwordFound = false;
    for (const selector of passwordSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`找到密码输入框: ${selector}`);
        await page.locator(selector).first().fill('admin123');
        passwordFound = true;
        break;
      }
    }

    if (!passwordFound) {
      console.log('未找到密码输入框');
      return false;
    }

    // 查找并点击登录按钮
    const loginButtonSelectors = [
      'button[type="submit"]',
      'button:has-text("登录")',
      '.login-btn',
      '.btn-login',
      'input[type="submit"]',
      'button[class*="submit"]'
    ];

    let loginButtonFound = false;
    for (const selector of loginButtonSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`找到登录按钮: ${selector}`);
        await page.locator(selector).first().click();
        loginButtonFound = true;
        break;
      }
    }

    if (!loginButtonFound) {
      console.log('未找到登录按钮');
      return false;
    }

    // 等待登录完成
    await page.waitForTimeout(5000);

    // 检查是否登录成功
    const currentURL = page.url();
    console.log(`登录后URL: ${currentURL}`);

    // 检查是否有登录成功的标志
    const hasMainContent = await page.locator('.el-main, .main-content, .app-main, main').count() > 0;
    const hasDashboard = await page.locator('*:has-text("仪表板"), *:has-text("Dashboard")').count() > 0;

    return !currentURL.includes('/login') && (hasMainContent || hasDashboard);

  } catch (error) {
    console.error('手动登录失败:', error.message);
    return false;
  }
}

async function analyzePageContent(page) {
  try {
    const pageContent = await page.content();
    const title = await page.title();
    const url = page.url();

    console.log(`页面分析:`);
    console.log(`- 标题: ${title}`);
    console.log(`- URL: ${url}`);
    console.log(`- 内容长度: ${pageContent.length} 字符`);

    // 检查页面中的关键元素
    const hasLoginForm = pageContent.includes('登录') || pageContent.includes('login') || pageContent.includes('Login');
    const hasLoginForm2 = await page.locator('form, .login-form, .auth-form').count() > 0;
    const hasInputFields = await page.locator('input').count() > 0;
    const hasButtons = await page.locator('button').count() > 0;

    console.log(`- 包含登录表单: ${hasLoginForm || hasLoginForm2}`);
    console.log(`- 包含输入框: ${hasInputFields}`);
    console.log(`- 包含按钮: ${hasButtons}`);

    return {
      title,
      url,
      contentLength: pageContent.length,
      hasLoginForm: hasLoginForm || hasLoginForm2,
      hasInputFields,
      hasButtons
    };
  } catch (error) {
    console.error('页面内容分析失败:', error.message);
    return null;
  }
}

async function getSidebarMenus(page) {
  try {
    console.log('正在获取侧边栏菜单...');

    // 等待侧边栏加载
    await page.waitForTimeout(2000);

    // 尝试多种方式获取菜单
    const menuSelectors = [
      '.sidebar .el-menu-item',
      '.el-menu .el-menu-item',
      '[class*="sidebar"] [class*="menu-item"]',
      '[class*="menu"] [class*="item"]',
      '.nav-item',
      '.menu-item',
      '.sidebar a',
      '.nav a',
      '.menu a',
      '.el-menu a',
      '[role="menuitem"]'
    ];

    let menus = [];
    for (const selector of menuSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`使用选择器 ${selector} 找到 ${count} 个元素`);

          const menuItems = await page.evaluate((sel) => {
            const elements = document.querySelectorAll(sel);
            return Array.from(elements).map((el, index) => {
              const text = el.textContent?.trim() || '';
              const href = el.getAttribute('href') || el.getAttribute('to') || '';
              const onclick = el.getAttribute('onclick') || '';

              return {
                index,
                text,
                href,
                onclick,
                element: el.tagName.toLowerCase()
              };
            }).filter(item => item.text && item.text.length > 0 && !item.text.includes('+'));
          }, selector);

          if (menuItems.length > 0) {
            menus = menuItems;
            console.log(`成功获取 ${menus.length} 个菜单项`);
            break;
          }
        }
      } catch (error) {
        console.log(`选择器 ${selector} 失败: ${error.message}`);
      }
    }

    // 如果还是找不到，尝试获取页面中所有可点击的文本元素
    if (menus.length === 0) {
      console.log('尝试获取所有可点击的菜单元素...');

      try {
        const clickableItems = await page.evaluate(() => {
          const elements = document.querySelectorAll('a, button, [role="button"], [onclick]');
          return Array.from(elements).map((el, index) => {
            const text = el.textContent?.trim() || '';
            const href = el.getAttribute('href') || el.getAttribute('to') || '';

            if (text && text.length > 0 && text.length < 50 &&
                !text.includes('+') && !text.includes('展开') &&
                !text.includes('收起') && !text.includes('×')) {
              return {
                index,
                text,
                href,
                element: el.tagName.toLowerCase(),
                selector: el.tagName.toLowerCase()
              };
            }
          }).filter(item => item && item.text);
        });

        if (clickableItems.length > 0) {
          menus = clickableItems;
          console.log(`通过通用方法找到 ${menus.length} 个可点击元素`);
        }
      } catch (error) {
        console.log('通用方法失败:', error.message);
      }
    }

    return menus;

  } catch (error) {
    console.error('获取侧边栏菜单失败:', error.message);
    return [];
  }
}

async function testMenuItem(page, menuItem) {
  try {
    console.log(`\n测试菜单: ${menuItem.text}`);

    // 截图当前状态
    await takeScreenshot(page, `before-click-${menuItem.text.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}`);

    // 尝试点击菜单项
    if (menuItem.selector) {
      await page.locator(menuItem.selector).nth(menuItem.index).click();
    } else {
      // 使用文本查找并点击
      await page.locator(`text=${menuItem.text}`).first().click();
    }

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 截图点击后状态
    await takeScreenshot(page, `after-click-${menuItem.text.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}`);

    // 检测页面状态
    const url = page.url();
    const title = await page.title();

    // 检查是否有错误页面
    const has404 = await page.locator('text=404').count() > 0;
    const has403 = await page.locator('text=403').count() > 0 ||
                  await page.locator('text=权限不足').count() > 0;
    const hasError = await page.locator('text=错误').count() > 0;

    // 检查页面主要内容
    const hasMainContent = await page.locator('.el-main, .main-content, .app-main, main').count() > 0;

    const result = {
      menuText: menuItem.text,
      url: url,
      title: title,
      status: has404 ? '404' : has403 ? '403' : hasError ? 'ERROR' : 'OK',
      hasContent: hasMainContent,
      timestamp: new Date().toISOString()
    };

    // 分类结果
    if (result.status === 'OK' && result.hasContent) {
      testResults.successfulMenus.push(result);
      console.log(`✓ 菜单访问成功: ${menuItem.text}`);
    } else {
      testResults.failedMenus.push(result);
      testResults.permissionIssues.push({
        menu: menuItem.text,
        issue: result.status,
        url: result.url,
        details: result
      });
      console.log(`❌ 菜单访问失败: ${menuItem.text} - ${result.status}`);
    }

    return result;

  } catch (error) {
    console.error(`测试菜单 ${menuItem.text} 时出错:`, error.message);

    const result = {
      menuText: menuItem.text,
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    };

    testResults.failedMenus.push(result);
    testResults.permissionIssues.push({
      menu: menuItem.text,
      issue: 'CLICK_ERROR',
      error: error.message
    });

    return result;
  }
}

async function main() {
  console.log('开始Admin用户侧边栏权限测试 v2...');

  // 首先检查服务状态
  const serverStatus = await checkServerStatus();
  if (!serverStatus.frontendOK || !serverStatus.backendOK) {
    console.error('服务未正常运行，请检查服务器状态');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 第一步：访问登录页面
    console.log('\n=== 第一步：访问登录页面 ===');
    await page.goto(CONFIG.baseURL, { waitUntil: 'networkidle' });
    await takeScreenshot(page, 'initial-page');

    // 分析页面内容
    const pageAnalysis = await analyzePageContent(page);
    console.log('页面分析结果:', pageAnalysis);

    // 第二步：尝试登录
    console.log('\n=== 第二步：尝试登录 ===');
    let loginSuccess = false;

    // 尝试快捷登录
    loginSuccess = await tryQuickLogin(page);
    if (loginSuccess) {
      testResults.loginAttempts.push({ method: '快捷登录', success: true });
    } else {
      // 尝试手动登录
      loginSuccess = await tryManualLogin(page);
      if (loginSuccess) {
        testResults.loginAttempts.push({ method: '手动登录', success: true });
      } else {
        testResults.loginAttempts.push({ method: '手动登录', success: false });
      }
    }

    testResults.loginStatus = {
      success: loginSuccess,
      url: page.url(),
      attempts: testResults.loginAttempts
    };

    if (loginSuccess) {
      console.log('✓ 登录成功');
      await takeScreenshot(page, 'login-success');
    } else {
      console.log('❌ 登录失败，继续测试其他功能');
      await takeScreenshot(page, 'login-failed');
    }

    // 第三步：获取侧边栏菜单
    console.log('\n=== 第三步：获取侧边栏菜单 ===');
    const sidebarMenus = await getSidebarMenus(page);
    testResults.sidebarMenus = sidebarMenus;

    console.log(`发现 ${sidebarMenus.length} 个菜单项:`);
    sidebarMenus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.text}`);
    });

    if (sidebarMenus.length === 0) {
      console.log('⚠️  未找到侧边栏菜单，尝试截图当前页面...');
      await takeScreenshot(page, 'no-menus-found');
    } else {
      // 第四步：逐个测试菜单项（只测试前10个，避免时间过长）
      console.log('\n=== 第四步：测试菜单项权限（前10个）===');

      const menusToTest = sidebarMenus.slice(0, 10);
      for (let i = 0; i < menusToTest.length; i++) {
        const menuItem = menusToTest[i];
        console.log(`\n进度: ${i + 1}/${menusToTest.length}`);

        await testMenuItem(page, menuItem);

        // 每测试2个菜单后稍作休息
        if ((i + 1) % 2 === 0) {
          await page.waitForTimeout(2000);
        }
      }
    }

    // 最终截图
    await takeScreenshot(page, 'final-state');

  } catch (error) {
    console.error('\n测试过程中发生错误:', error.message);
    await takeScreenshot(page, 'test-error');
  } finally {
    await browser.close();
  }

  // 生成测试报告
  console.log('\n=== 生成测试报告 ===');
  await generateReport();
}

async function generateReport() {
  const report = `# Admin用户侧边栏权限测试报告 v2

## 测试信息
- **测试时间**: ${testResults.timestamp}
- **测试地址**: ${CONFIG.baseURL}
- **登录状态**: ${testResults.loginStatus?.success ? '成功' : '失败'}
- **登录尝试次数**: ${testResults.loginStatus?.attempts?.length || 0}

## 登录尝试详情
${testResults.loginAttempts.map(attempt =>
  `- **${attempt.method}**: ${attempt.success ? '✅ 成功' : '❌ 失败'}`
).join('\n')}

## 测试概览
- **总菜单数**: ${testResults.sidebarMenus.length}
- **成功访问**: ${testResults.successfulMenus.length}
- **失败访问**: ${testResults.failedMenus.length}
- **成功率**: ${testResults.sidebarMenus.length > 0 ? ((testResults.successfulMenus.length / testResults.sidebarMenus.length) * 100).toFixed(1) : '0'}%

## 发现的菜单项
${testResults.sidebarMenus.length > 0 ?
  testResults.sidebarMenus.map(menu => `- ${menu.text}`).join('\n') :
  '未找到菜单项'
}

## 权限问题汇总
${testResults.permissionIssues.length > 0 ?
  testResults.permissionIssues.map(issue =>
    `### ${issue.menu}
- **问题类型**: ${issue.issue}
- **访问URL**: ${issue.url || 'N/A'}
- **错误详情**: ${issue.error || 'N/A'}`
  ).join('\n\n') : '✅ 未发现权限问题'
}

## 详细测试结果

### ✅ 成功访问的菜单 (${testResults.successfulMenus.length})
${testResults.successfulMenus.length > 0 ? testResults.successfulMenus.map(menu =>
  `- **${menu.menuText}**: ${menu.url} (${menu.title})`
).join('\n') : '无'}

### ❌ 失败访问的菜单 (${testResults.failedMenus.length})
${testResults.failedMenus.length > 0 ? testResults.failedMenus.map(menu =>
  `- **${menu.menuText}**: ${menu.status} - ${menu.error || menu.url}`
).join('\n') : '无'}

## 建议修复方案
${testResults.permissionIssues.map(issue => {
  switch(issue.issue) {
    case '404':
      return `- **${issue.menu}**: 404错误 - 检查路由配置和页面组件是否存在`;
    case '403':
      return `- **${issue.menu}**: 403权限错误 - 需要为admin角色添加相关权限`;
    case 'ERROR':
      return `- **${issue.menu}**: 页面错误 - 检查页面组件是否有运行时错误`;
    case 'CLICK_ERROR':
      return `- **${issue.menu}**: 点击错误 - 检查菜单项的事件绑定`;
    default:
      return `- **${issue.menu}**: 未知问题 - 需要进一步调试`;
  }
}).join('\n')}

## 截图文件
所有测试截图保存在: ${CONFIG.screenshotDir}

## 测试建议
1. 如果登录失败，请检查：
   - 前端服务是否正常运行 (http://localhost:5173)
   - 后端服务是否正常运行 (http://localhost:3000)
   - admin用户是否存在且密码正确
   - 登录页面是否有快捷登录功能

2. 如果未找到菜单项：
   - 检查页面是否完全加载
   - 确认用户已成功登录
   - 检查侧边栏组件是否正常渲染

3. 如果菜单项访问失败：
   - 检查对应的前端路由配置
   - 检查权限配置是否正确
   - 检查页面组件是否存在
`;

  fs.writeFileSync(CONFIG.reportFile, report, 'utf8');
  console.log(`\n📋 测试报告已生成: ${CONFIG.reportFile}`);
  console.log(`📸 截图目录: ${CONFIG.screenshotDir}`);

  // 输出总结
  console.log('\n=== 测试总结 ===');
  console.log(`登录状态: ${testResults.loginStatus?.success ? '成功' : '失败'}`);
  console.log(`总菜单数: ${testResults.sidebarMenus.length}`);
  console.log(`成功访问: ${testResults.successfulMenus.length}`);
  console.log(`权限问题: ${testResults.permissionIssues.length}`);

  if (testResults.permissionIssues.length > 0) {
    console.log('\n发现的主要权限问题:');
    testResults.permissionIssues.forEach(issue => {
      console.log(`- ${issue.menu}: ${issue.issue}`);
    });
  }
}

// 运行测试
main().catch(console.error);