const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  baseURL: 'http://localhost:5173',
  timeout: 30000,
  screenshotDir: './admin-permission-test-screenshots',
  reportFile: './admin-sidebar-permission-test-report.md'
};

// 创建截图目录
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir);
}

// 测试结果记录
const testResults = {
  timestamp: new Date().toISOString(),
  loginStatus: null,
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

async function waitForPageLoad(page, timeout = 10000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
    return true;
  } catch (error) {
    console.log('页面加载超时，继续执行...');
    return false;
  }
}

async function detectPageStatus(page) {
  try {
    const url = page.url();
    const title = await page.title();

    // 检查是否有错误页面
    const has404 = await page.locator('text=404').count() > 0;
    const has403 = await page.locator('text=403').count() > 0 ||
                  await page.locator('text=权限不足').count() > 0;
    const hasError = await page.locator('text=错误').count() > 0;

    // 检查页面主要内容
    const hasMainContent = await page.locator('.el-main, .main-content, .app-main, main').count() > 0;
    const hasLoading = await page.locator('.loading, .el-loading, [class*="loading"]').count() > 0;

    return {
      url,
      title,
      status: has404 ? '404' : has403 ? '403' : hasError ? 'ERROR' : 'OK',
      hasContent: hasMainContent,
      isLoading: hasLoading
    };
  } catch (error) {
    console.error('页面状态检测失败:', error.message);
    return {
      url: page.url(),
      title: 'Unknown',
      status: 'DETECT_ERROR',
      hasContent: false,
      isLoading: false
    };
  }
}

async function getSidebarMenus(page) {
  try {
    console.log('正在获取侧边栏菜单...');

    // 等待侧边栏加载
    await page.waitForSelector('.sidebar, .el-menu, [class*="sidebar"], [class*="menu"]', { timeout: 10000 });

    // 获取所有菜单项
    const menuItems = await page.evaluate(() => {
      const selectors = [
        '.sidebar .el-menu-item',
        '.el-menu .el-menu-item',
        '[class*="sidebar"] [class*="menu-item"]',
        '[class*="menu"] [class*="item"]',
        '.nav-item',
        '.menu-item'
      ];

      let menus = [];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach((el, index) => {
            const text = el.textContent?.trim() || '';
            const href = el.getAttribute('href') || el.getAttribute('to') || '';
            const onclick = el.getAttribute('onclick') || '';

            if (text && text.length > 0 && !text.includes('+') && !text.includes('展开')) {
              menus.push({
                index,
                text,
                href,
                onclick,
                selector,
                element: el.tagName.toLowerCase()
              });
            }
          });
          break; // 找到菜单后退出循环
        }
      }

      return menus;
    });

    console.log(`发现 ${menuItems.length} 个菜单项`);
    return menuItems;

  } catch (error) {
    console.error('获取侧边栏菜单失败:', error.message);
    return [];
  }
}

async function testMenuItem(page, menuItem) {
  try {
    console.log(`\n测试菜单: ${menuItem.text}`);

    // 点击菜单项
    const element = page.locator(menuItem.selector).nth(menuItem.index);
    await element.click();

    // 等待页面加载
    await waitForPageLoad(page, 8000);

    // 检测页面状态
    const pageStatus = detectPageStatus(page);

    // 记录结果
    const result = {
      menuText: menuItem.text,
      menuSelector: menuItem.selector,
      menuIndex: menuItem.index,
      url: pageStatus.url,
      status: pageStatus.status,
      hasContent: pageStatus.hasContent,
      timestamp: new Date().toISOString()
    };

    // 截图
    const screenshotName = `menu-${menuItem.text.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}`;
    result.screenshot = await takeScreenshot(page, screenshotName);

    // 检查控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    result.consoleErrors = consoleErrors;

    // 分类结果
    if (pageStatus.status === 'OK' && pageStatus.hasContent) {
      testResults.successfulMenus.push(result);
      console.log(`✓ 菜单访问成功: ${menuItem.text}`);
    } else {
      testResults.failedMenus.push(result);
      testResults.permissionIssues.push({
        menu: menuItem.text,
        issue: pageStatus.status,
        url: pageStatus.url,
        details: result
      });
      console.log(`❌ 菜单访问失败: ${menuItem.text} - ${pageStatus.status}`);
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
  console.log('开始Admin用户侧边栏权限测试...');

  const browser = await chromium.launch({
    headless: true, // 使用无头模式
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
    await takeScreenshot(page, 'login-page');

    // 第二步：查找并点击admin快捷登录
    console.log('\n=== 第二步：Admin快捷登录 ===');
    try {
      // 查找admin快捷登录按钮的各种可能选择器
      const adminSelectors = [
        'button:has-text("admin")',
        'button:has-text("管理员")',
        'button:has-text("快捷登录")',
        '.admin-login',
        '[class*="admin"] button',
        'button[onclick*="admin"]'
      ];

      let adminButtonFound = false;
      for (const selector of adminSelectors) {
        try {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`找到admin登录按钮: ${selector}`);
            await page.locator(selector).first().click();
            adminButtonFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!adminButtonFound) {
        // 如果找不到快捷登录，尝试手动登录
        console.log('未找到快捷登录按钮，尝试手动登录...');

        // 查找用户名和密码输入框
        await page.fill('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"], #username', 'admin');
        await page.fill('input[type="password"], input[placeholder*="密码"], #password', 'admin123');

        // 点击登录按钮
        await page.click('button[type="submit"], button:has-text("登录"), .login-btn');
      }

      // 等待登录完成
      await page.waitForTimeout(3000);
      await waitForPageLoad(page, 10000);

      // 验证登录状态
      const loginPageStatus = await detectPageStatus(page);
      testResults.loginStatus = {
        success: !loginPageStatus.url.includes('/login') && loginPageStatus.status === 'OK',
        url: loginPageStatus.url,
        status: loginPageStatus.status
      };

      if (testResults.loginStatus.success) {
        console.log('✓ 登录成功');
        await takeScreenshot(page, 'after-login');
      } else {
        console.log('❌ 登录失败');
        await takeScreenshot(page, 'login-failed');
        throw new Error('登录失败，无法继续测试');
      }

    } catch (loginError) {
      console.error('登录过程出错:', loginError.message);
      await takeScreenshot(page, 'login-error');
      throw loginError;
    }

    // 第三步：获取侧边栏菜单
    console.log('\n=== 第三步：获取侧边栏菜单 ===');
    const sidebarMenus = await getSidebarMenus(page);
    testResults.sidebarMenus = sidebarMenus;

    if (sidebarMenus.length === 0) {
      console.log('⚠️  未找到侧边栏菜单，尝试截图当前页面...');
      await takeScreenshot(page, 'no-menus-found');
      throw new Error('未找到侧边栏菜单');
    }

    console.log(`发现 ${sidebarMenus.length} 个菜单项:`);
    sidebarMenus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.text} (${menu.selector})`);
    });

    // 第四步：逐个测试菜单项
    console.log('\n=== 第四步：测试菜单项权限 ===');

    for (let i = 0; i < sidebarMenus.length; i++) {
      const menuItem = sidebarMenus[i];
      console.log(`\n进度: ${i + 1}/${sidebarMenus.length}`);

      await testMenuItem(page, menuItem);

      // 每测试5个菜单后稍作休息，避免过快操作
      if ((i + 1) % 5 === 0) {
        await page.waitForTimeout(2000);
      }
    }

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
  const report = `# Admin用户侧边栏权限测试报告

## 测试信息
- **测试时间**: ${testResults.timestamp}
- **测试地址**: ${CONFIG.baseURL}
- **登录状态**: ${testResults.loginStatus?.success ? '成功' : '失败'}

## 测试概览
- **总菜单数**: ${testResults.sidebarMenus.length}
- **成功访问**: ${testResults.successfulMenus.length}
- **失败访问**: ${testResults.failedMenus.length}
- **成功率**: ${((testResults.successfulMenus.length / testResults.sidebarMenus.length) * 100).toFixed(1)}%

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
${testResults.successfulMenus.map(menu =>
  `- **${menu.menuText}**: ${menu.url} (${menu.screenshot ? '有截图' : '无截图'})`
).join('\n')}

### ❌ 失败访问的菜单 (${testResults.failedMenus.length})
${testResults.failedMenus.map(menu =>
  `- **${menu.menuText}**: ${menu.status} - ${menu.error || menu.url} (${menu.screenshot ? '有截图' : '无截图'})`
).join('\n')}

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
`;

  fs.writeFileSync(CONFIG.reportFile, report, 'utf8');
  console.log(`\n📋 测试报告已生成: ${CONFIG.reportFile}`);
  console.log(`📸 截图目录: ${CONFIG.screenshotDir}`);

  // 输出总结
  console.log('\n=== 测试总结 ===');
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