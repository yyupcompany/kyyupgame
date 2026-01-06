/**
 * Admin角色侧边栏菜单错误检测脚本
 *
 * 功能：
 * 1. 使用admin账号登录系统
 * 2. 获取左侧侧边栏的所有菜单项结构
 * 3. 依次访问每个菜单项，检测控制台错误和404错误
 * 4. 生成详细的错误报告
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseURL: 'http://localhost:5173',
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  screenshotDir: path.join(__dirname, '../test-screenshots'),
  reportFile: path.join(__dirname, '../admin-sidebar-error-report.json'),
  timeout: 10000
};

// 确保目录存在
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// 存储结果
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    totalMenus: 0,
    successMenus: 0,
    errorMenus: 0,
    consoleErrors: 0,
    pageErrors: 0
  },
  menuStructure: [],
  errors: []
};

// 存储控制台错误
const consoleErrors = [];

/**
 * 登录系统
 */
async function login(page) {
  console.log('🔐 正在登录系统...');

  // 访问登录页面
  await page.goto(CONFIG.baseURL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 检查是否需要登录
  const currentUrl = page.url();
  console.log('当前URL:', currentUrl);

  if (currentUrl.includes('/login') || currentUrl === CONFIG.baseURL + '/') {
    console.log('📝 需要登录，正在输入账号密码...');

    // 尝试多种选择器查找输入框
    try {
      // 等待登录表单出现
      await page.waitForSelector('input', { timeout: 5000 });

      // 查找所有输入框
      const inputs = await page.$$('input');
      console.log(`找到 ${inputs.length} 个输入框`);

      if (inputs.length >= 2) {
        await inputs[0].fill(CONFIG.admin.username);
        await inputs[1].fill(CONFIG.admin.password);
      } else {
        throw new Error('未找到足够的输入框');
      }

      // 尝试多种方式点击登录按钮
      const loginButton = await page.$('button[type="submit"]') ||
                          await page.$('button:has-text("登录")') ||
                          await page.$('.el-button--primary');

      if (loginButton) {
        await loginButton.click();
      } else {
        throw new Error('未找到登录按钮');
      }

      // 等待页面变化或导航
      await page.waitForTimeout(5000);

    } catch (error) {
      console.error('登录过程出错:', error.message);
      throw error;
    }
  }

  console.log('✅ 登录成功');
}

/**
 * 获取侧边栏菜单结构
 */
async function getSidebarMenuStructure(page) {
  console.log('📋 正在获取侧边栏菜单结构...');
  console.log('等待页面加载...');

  // 等待更长时间让页面完全加载
  await page.waitForTimeout(5000);

  // 截图用于调试
  await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'after-login.png'), fullPage: true });

  // 检查页面URL
  const currentUrl = page.url();
  console.log('当前页面URL:', currentUrl);

  // 获取页面内容
  const pageContent = await page.content();
  const hasSidebar = pageContent.includes('sidebar') || pageContent.includes('el-menu') || pageContent.includes('aside');
  console.log('页面是否包含侧边栏:', hasSidebar);

  // 尝试等待侧边栏出现，但使用更灵活的方式
  try {
    await page.waitForSelector('.sidebar, .el-menu, aside, [class*="sidebar"], [class*="menu"]', { timeout: 10000 });
    console.log('✅ 侧边栏已加载');
  } catch (error) {
    console.warn('⚠️  侧边栏选择器未找到，尝试继续...');
    // 继续执行，可能侧边栏使用了不同的类名
  }

  // 再等待一会儿
  await page.waitForTimeout(3000);

  // 使用JavaScript提取菜单结构
  const menuStructure = await page.evaluate(() => {
    const menus = [];

    // 尝试多种选择器
    const selectors = [
      '.el-menu-item',
      '.el-sub-menu__title',
      '[role="menuitem"]',
      '.menu-item',
      '.sidebar .item',
      'aside .item'
    ];

    let allItems = [];

    for (const selector of selectors) {
      const items = Array.from(document.querySelectorAll(selector));
      if (items.length > 0) {
        console.log(`使用选择器 ${selector} 找到 ${items.length} 个菜单项`);
        allItems = allItems.concat(items);
      }
    }

    // 如果还是没找到，尝试通过文本内容查找
    if (allItems.length === 0) {
      const allLinks = Array.from(document.querySelectorAll('a, [role="button"], div[class*="menu"]'));
      console.log(`尝试通过通用元素查找，找到 ${allLinks.length} 个元素`);
      allItems = allLinks.filter(item => {
        const text = item.textContent?.trim() || '';
        return text.length > 0 && text.length < 50; // 过滤掉太长的文本
      }).slice(0, 100); // 限制数量
    }

    allItems.forEach((item, index) => {
      const text = item.textContent?.trim() || '';
      const className = item.className || '';
      const ariaLabel = item.getAttribute('aria-label') || '';
      const routerLink = item.getAttribute('data-router-link') || '';
      const href = item.getAttribute('href') || '';

      // 获取父菜单信息（如果是子菜单）
      const parentSubMenu = item.closest('.el-sub-menu, [class*="submenu"], [class*="sub-menu"]');
      const parentText = parentSubMenu?.querySelector('.el-sub-menu__title, [class*="title"]')?.textContent?.trim() || '';

      // 只保留有文本的项目
      if (text && text.length > 0) {
        menus.push({
          index,
          text,
          parentText,
          ariaLabel,
          routerLink,
          href,
          className,
          element: item.tagName.toLowerCase()
        });
      }
    });

    return menus;
  });

  console.log(`✅ 找到 ${menuStructure.length} 个菜单项`);

  // 输出前5个菜单项用于调试
  menuStructure.slice(0, 5).forEach(m => {
    console.log(`   - ${m.text} (class: ${m.className})`);
  });

  results.menuStructure = menuStructure;
  results.summary.totalMenus = menuStructure.length;

  return menuStructure;
}

/**
 * 点击菜单项并检测错误
 */
async function testMenuItem(page, menuItem, browser) {
  const { index, text, parentText } = menuItem;
  const fullMenuPath = parentText ? `${parentText} > ${text}` : text;

  console.log(`\n🔍 [${index + 1}/${results.summary.totalMenus}] 正在检测: ${fullMenuPath}`);

  // 清空之前的控制台错误
  consoleErrors.length = 0;

  // 创建新的页面上下文来监听控制台错误
  const pageErrors = [];
  const pageErrorsHandler = (error) => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  };

  page.on('pageerror', pageErrorsHandler);

  // 监听控制台消息
  const consoleMessages = [];
  const consoleHandler = (msg) => {
    if (msg.type() === 'error') {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    }
  };
  page.on('console', consoleHandler);

  try {
    // 尝试点击菜单项
    const menuItemSelector = `.el-menu-item:nth-child(${index + 1}), .el-sub-menu__title:nth-child(${index + 1})`;
    const element = await page.$(menuItemSelector);

    if (element) {
      await element.click();
      await page.waitForTimeout(3000); // 等待页面加载和错误出现

      // 检查是否有404错误
      const currentUrl = page.url();
      const pageTitle = await page.title();
      const pageContent = await page.content();

      const has404 = pageContent.includes('404') || pageTitle.includes('404') || currentUrl.includes('404');

      // 记录结果
      const result = {
        menuPath: fullMenuPath,
        url: currentUrl,
        title: pageTitle,
        has404,
        consoleErrors: [...consoleMessages],
        pageErrors: [...pageErrors],
        timestamp: new Date().toISOString()
      };

      // 判断是否有错误
      const hasErrors = has404 || consoleMessages.length > 0 || pageErrors.length > 0;

      if (hasErrors) {
        console.error(`❌ 发现错误: ${fullMenuPath}`);
        console.error(`   - 404错误: ${has404}`);
        console.error(`   - 控制台错误: ${consoleMessages.length}个`);
        console.error(`   - 页面错误: ${pageErrors.length}个`);

        results.errors.push(result);
        results.summary.errorMenus++;

        // 截图保存
        const screenshotFile = path.join(CONFIG.screenshotDir, `error-${index}-${Date.now()}.png`);
        await page.screenshot({ path: screenshotFile, fullPage: true });
        result.screenshot = screenshotFile;
      } else {
        console.log(`✅ 正常: ${fullMenuPath}`);
        results.summary.successMenus++;
      }

      // 更新统计
      results.summary.consoleErrors += consoleMessages.length;
      results.summary.pageErrors += pageErrors.length;

    } else {
      console.warn(`⚠️  未找到菜单项: ${fullMenuPath}`);
    }

  } catch (error) {
    console.error(`❌ 访问菜单项失败: ${fullMenuPath}`);
    console.error(`   错误: ${error.message}`);

    results.errors.push({
      menuPath: fullMenuPath,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    results.summary.errorMenus++;
  } finally {
    // 移除监听器
    page.off('pageerror', pageErrorsHandler);
    page.off('console', consoleHandler);
  }
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('\n📊 生成检测报告...');

  // 保存JSON报告
  fs.writeFileSync(CONFIG.reportFile, JSON.stringify(results, null, 2));

  // 生成文本报告
  const textReport = `
========================================
Admin角色侧边栏菜单错误检测报告
========================================
检测时间: ${results.timestamp}
检测地址: ${CONFIG.baseURL}

----------------------------------------
统计概览
----------------------------------------
总菜单数: ${results.summary.totalMenus}
正常菜单: ${results.summary.successMenus}
错误菜单: ${results.summary.errorMenus}
控制台错误: ${results.summary.consoleErrors}
页面错误: ${results.summary.pageErrors}

----------------------------------------
错误详情
----------------------------------------
${results.errors.length > 0 ?
  results.errors.map((err, i) => `
[${i + 1}] ${err.menuPath}
    URL: ${err.url || 'N/A'}
    404错误: ${err.has404 || 'N/A'}
    控制台错误: ${err.consoleErrors?.length || 0}个
    页面错误: ${err.pageErrors?.length || 0}个
    错误信息: ${err.error || 'N/A'}
    截图: ${err.screenshot || 'N/A'}
`).join('\n') :
  '✅ 未发现错误'
}

----------------------------------------
菜单结构
----------------------------------------
${results.menuStructure.map(m => `${m.index + 1}. ${m.parentText ? m.parentText + ' > ' : ''}${m.text}`).join('\n')}

========================================
详细报告已保存到: ${CONFIG.reportFile}
截图目录: ${CONFIG.screenshotDir}
========================================
`;

  console.log(textReport);

  // 保存文本报告
  const textReportFile = path.join(__dirname, '../admin-sidebar-error-report.txt');
  fs.writeFileSync(textReportFile, textReport);

  console.log(`\n✅ 报告已生成:`);
  console.log(`   - JSON报告: ${CONFIG.reportFile}`);
  console.log(`   - 文本报告: ${textReportFile}`);
  console.log(`   - 截图目录: ${CONFIG.screenshotDir}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始检测Admin角色侧边栏菜单错误...\n');

  let browser;
  let page;

  try {
    // 启动浏览器
    console.log('🌐 启动浏览器...');
    browser = await chromium.launch({
      headless: true,
      devtools: false
    });

    // 创建页面
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 登录系统
    await login(page);

    // 获取菜单结构
    const menuStructure = await getSidebarMenuStructure(page);

    // 依次测试每个菜单项
    console.log(`\n🔍 开始检测 ${menuStructure.length} 个菜单项...\n`);

    for (let i = 0; i < menuStructure.length; i++) {
      await testMenuItem(page, menuStructure[i], browser);
    }

    // 生成报告
    generateReport();

    console.log('\n✅ 检测完成！');

  } catch (error) {
    console.error('\n❌ 检测过程中发生错误:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, CONFIG };
