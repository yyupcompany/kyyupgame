const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 检查结果记录
const checkResults = {
  timestamp: new Date().toISOString(),
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

async function runSystematicSidebarCheck() {
  console.log('🚀 开始系统性侧边栏页面检查...');
  console.log('📍 前端地址: http://localhost:5173');
  console.log('📍 后端地址: http://localhost:3000');

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
        console.log(`🔍 [${msg.type()}] ${currentUrl}: ${msg.text()}`);
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
        console.log(`🌐 [${response.status()}] ${response.url()}`);
      }
    });

    // 监听页面错误
    page.on('pageerror', (error) => {
      const currentUrl = page.url();
      console.log(`⚠️ 页面错误 [${currentUrl}]: ${error.message}`);
    });

    // 第一步：访问登录页面
    console.log('\n📝 第一步：访问登录页面');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // 检查是否已经登录或需要登录
    const loginPage = await checkLoginPage(page);

    if (!loginPage.isLoggedIn) {
      console.log('🔐 需要登录，尝试使用admin用户登录...');
      const loginSuccess = await performLogin(page);
      if (!loginSuccess) {
        console.error('❌ 登录失败，无法继续检查');
        return;
      }
    } else {
      console.log('✅ 已经登录，直接进入系统');
    }

    // 等待页面加载完成
    await page.waitForTimeout(3000);

    // 第二步：获取侧边栏菜单
    console.log('\n📋 第二步：获取侧边栏菜单结构');
    const sidebarMenu = await getSidebarMenu(page);

    if (!sidebarMenu || sidebarMenu.length === 0) {
      console.error('❌ 无法获取侧边栏菜单，可能登录失败或页面结构有问题');
      return;
    }

    console.log(`📊 发现 ${sidebarMenu.length} 个一级菜单项`);
    sidebarMenu.forEach((menu, index) => {
      console.log(`   ${index + 1}. ${menu.name} - ${menu.url}`);
    });

    // 第三步：系统性检查每个页面
    console.log('\n🔍 第三步：系统性检查每个页面');

    for (let i = 0; i < sidebarMenu.length; i++) {
      const menuItem = sidebarMenu[i];
      console.log(`\n📄 检查页面 ${i + 1}/${sidebarMenu.length}: ${menuItem.name}`);
      console.log(`   URL: ${menuItem.url}`);

      const pageCheck = await checkPage(page, menuItem);
      checkResults.pages.push(pageCheck);
      checkResults.summary.totalPages++;

      // 分类记录结果
      if (pageCheck.status === 'normal') {
        checkResults.normalPages.push(pageCheck);
        checkResults.summary.normalPages++;
        console.log(`   ✅ 页面正常`);
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
        console.log(`   ❌ 页面有问题: ${pageCheck.status}`);
      }
    }

    // 第四步：生成详细报告
    console.log('\n📊 第四步：生成详细报告');
    await generateReport();

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

async function checkLoginPage(page) {
  try {
    // 检查当前页面URL
    const currentUrl = page.url();
    console.log(`当前页面: ${currentUrl}`);

    // 等待页面元素加载
    await page.waitForTimeout(2000);

    // 检查是否有登录表单
    const hasLoginForm = await page.$('.login-form, .el-form, form') !== null;
    const hasUsernameInput = await page.$('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"]') !== null;
    const hasPasswordInput = await page.$('input[type="password"]') !== null;

    // 检查是否已经登录（是否有侧边栏或仪表板）
    const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
    const hasDashboard = await page.$('.dashboard, .main-content, .app-main') !== null;

    const isLoggedIn = hasSidebar || hasDashboard;

    console.log(`登录状态检查:`);
    console.log(`  - 有登录表单: ${hasLoginForm}`);
    console.log(`  - 有用户名输入: ${hasUsernameInput}`);
    console.log(`  - 有密码输入: ${hasPasswordInput}`);
    console.log(`  - 有侧边栏: ${hasSidebar}`);
    console.log(`  - 有仪表板: ${hasDashboard}`);
    console.log(`  - 已登录: ${isLoggedIn}`);

    return {
      hasLoginForm,
      hasUsernameInput,
      hasPasswordInput,
      hasSidebar,
      hasDashboard,
      isLoggedIn,
      currentUrl
    };
  } catch (error) {
    console.error('检查登录页面时出错:', error);
    return {
      hasLoginForm: false,
      hasUsernameInput: false,
      hasPasswordInput: false,
      hasSidebar: false,
      hasDashboard: false,
      isLoggedIn: false,
      currentUrl: page.url()
    };
  }
}

async function performLogin(page) {
  try {
    console.log('🔑 尝试登录...');

    // 等待登录表单加载
    await page.waitForSelector('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"]', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // 填写用户名
    await page.fill('input[type="text"], input[placeholder*="用户"], input[placeholder*="账号"]', 'admin');

    // 填写密码
    await page.fill('input[type="password"]', 'admin123');

    // 点击登录按钮
    const loginButton = await page.$('button[type="submit"], .el-button--primary, button:has-text("登录")');
    if (loginButton) {
      await loginButton.click();
    } else {
      // 尝试按回车键
      await page.keyboard.press('Enter');
    }

    // 等待登录完成
    await page.waitForTimeout(5000);

    // 检查是否登录成功
    const currentUrl = page.url();
    const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
    const hasDashboard = await page.$('.dashboard, .main-content, .app-main') !== null;

    const loginSuccess = hasSidebar || hasDashboard || !currentUrl.includes('login');

    console.log(`登录结果:`);
    console.log(`  - 当前URL: ${currentUrl}`);
    console.log(`  - 有侧边栏: ${hasSidebar}`);
    console.log(`  - 有仪表板: ${hasDashboard}`);
    console.log(`  - 登录成功: ${loginSuccess}`);

    return loginSuccess;
  } catch (error) {
    console.error('登录过程中出错:', error);
    return false;
  }
}

async function getSidebarMenu(page) {
  try {
    // 等待侧边栏加载
    await page.waitForSelector('.sidebar, .el-menu, .main-sidebar', { timeout: 10000 });

    // 获取所有菜单项
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
                text !== '首页' && // 首页通常已经在显示
                text.length < 20) { // 过滤掉过长的文本

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
      });

      return items;
    });

    console.log(`找到 ${menuItems.length} 个菜单项`);
    menuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} - ${item.url}`);
    });

    return menuItems;
  } catch (error) {
    console.error('获取侧边栏菜单时出错:', error);
    return [];
  }
}

async function checkPage(page, menuItem) {
  try {
    console.log(`   🔄 导航到: ${menuItem.url}`);

    // 清除之前的错误记录
    const currentUrl = page.url();
    consoleErrors.delete(currentUrl);
    networkErrors.delete(currentUrl);

    // 导航到目标页面
    const response = await page.goto(menuItem.url, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // 等待页面稳定
    await page.waitForTimeout(3000);

    // 收集页面信息
    const pageUrl = page.url();
    const pageTitle = await page.title();

    // 检查页面是否为空白
    const isBlank = await page.evaluate(() => {
      const body = document.body;
      const hasContent = body && (
        body.children.length > 0 ||
        body.textContent.trim().length > 50
      );

      // 检查是否有主要内容元素
      const hasMainContent = document.querySelector('.main-content, .app-main, .content, .page-content') !== null;

      // 检查是否有错误页面
      const hasError = document.querySelector('.error-page, .not-found, .error') !== null;

      return {
        hasContent,
        hasMainContent,
        hasError,
        bodyText: body ? body.textContent.trim() : ''
      };
    });

    // 获取控制台错误
    const consoleErrorsList = consoleErrors.get(pageUrl) || [];

    // 获取网络错误
    const networkErrorsList = networkErrors.get(pageUrl) || [];

    // 检查页面响应状态
    const responseStatus = response ? response.status() : 0;

    // 判断页面状态
    let status = 'normal';
    if (responseStatus >= 400) {
      status = 'http_error';
    } else if (consoleErrorsList.length > 0) {
      status = 'console_error';
    } else if (!isBlank.hasContent && !isBlank.hasMainContent) {
      status = 'blank';
    } else if (networkErrorsList.length > 0) {
      status = 'network_error';
    } else if (isBlank.hasError) {
      status = 'error_page';
    }

    const pageCheck = {
      name: menuItem.name,
      url: menuItem.url,
      finalUrl: pageUrl,
      title: pageTitle,
      status: status,
      isBlank: !isBlank.hasContent && !isBlank.hasMainContent,
      responseStatus: responseStatus,
      consoleErrors: consoleErrorsList,
      networkErrors: networkErrorsList,
      pageContent: isBlank.bodyText.substring(0, 200),
      loadTime: Date.now()
    };

    console.log(`   📊 检查结果: ${status}`);
    if (consoleErrorsList.length > 0) {
      console.log(`   ⚠️ 控制台错误: ${consoleErrorsList.length} 个`);
    }
    if (networkErrorsList.length > 0) {
      console.log(`   🌐 网络错误: ${networkErrorsList.length} 个`);
    }
    if (pageCheck.isBlank) {
      console.log(`   📄 页面内容: 空白或极简`);
    }

    return pageCheck;
  } catch (error) {
    console.error(`   ❌ 检查页面 ${menuItem.name} 时出错:`, error.message);

    return {
      name: menuItem.name,
      url: menuItem.url,
      finalUrl: page.url(),
      title: await page.title().catch(() => 'Unknown'),
      status: 'load_error',
      isBlank: true,
      responseStatus: 0,
      consoleErrors: [],
      networkErrors: [],
      pageContent: '',
      loadError: error.message,
      loadTime: Date.now()
    };
  }
}

async function generateReport() {
  console.log('\n📋 生成详细检查报告...');

  const reportContent = `
# 系统性侧边栏页面检查报告

**检查时间**: ${new Date().toLocaleString('zh-CN')}

## 📊 检查摘要

- **总页面数**: ${checkResults.summary.totalPages}
- **正常页面**: ${checkResults.summary.normalPages}
- **问题页面**: ${checkResults.summary.errorPages}
  - 控制台错误页面: ${checkResults.summary.consoleErrorPages}
  - 空白页面: ${checkResults.summary.blankPages}
  - 网络错误页面: ${checkResults.summary.networkErrorPages}

## ✅ 正常页面 (${checkResults.normalPages.length} 个)

${checkResults.normalPages.map(page =>
  `- [${page.name}](${page.url}) - ${page.title}`
).join('\n')}

## ❌ 问题页面详细分析

### 1. 控制台错误页面 (${checkResults.errorCategories.consoleErrors.length} 个)

${checkResults.errorCategories.consoleErrors.map(page => `
#### ${page.name}
- **URL**: ${page.url}
- **最终URL**: ${page.finalUrl}
- **错误数量**: ${page.consoleErrors.length}

**错误详情**:
${page.consoleErrors.map(error =>
  `- [${error.type}] ${error.text}`
).join('\n')}
`).join('\n')}

### 2. 空白页面 (${checkResults.errorCategories.blankPages.length} 个)

${checkResults.errorCategories.blankPages.map(page => `
#### ${page.name}
- **URL**: ${page.url}
- **最终URL**: ${page.finalUrl}
- **响应状态**: ${page.responseStatus}
- **页面内容预览**: ${page.pageContent}
`).join('\n')}

### 3. 网络错误页面 (${checkResults.errorCategories.networkErrors.length} 个)

${checkResults.errorCategories.networkErrors.map(page => `
#### ${page.name}
- **URL**: ${page.url}
- **最终URL**: ${page.finalUrl}

**网络错误**:
${page.networkErrors.map(error =>
  `- [${error.status}] ${error.url}`
).join('\n')}
`).join('\n')}

## 📈 修复优先级建议

### 高优先级 (立即修复)
1. **空白页面** - 用户体验严重影响
   ${checkResults.errorCategories.blankPages.map(page => `- ${page.name}`).join('\n   ')}

### 中优先级 (近期修复)
1. **控制台错误页面** - 可能影响功能
   ${checkResults.errorCategories.consoleErrors.map(page => `- ${page.name}`).join('\n   ')}

### 低优先级 (后续优化)
1. **网络错误页面** - 部分功能可能受影响
   ${checkResults.errorCategories.networkErrors.map(page => `- ${page.name}`).join('\n   ')}

## 🔧 修复建议

### 通用修复方案
1. **检查路由配置** - 确认页面路由是否正确配置
2. **验证组件导入** - 确认Vue组件是否正确导入和注册
3. **检查API端点** - 确认后端API是否正常工作
4. **验证权限配置** - 确认页面权限配置是否正确

### 具体修复步骤
1. **空白页面修复**
   - 检查路由映射: \`client/src/router/dynamic-routes.ts\`
   - 验证组件文件是否存在: \`client/src/pages/\`
   - 检查组件导入语法

2. **控制台错误修复**
   - 修复JavaScript语法错误
   - 检查API调用参数
   - 验证数据格式

3. **网络错误修复**
   - 检查后端API端点: \`server/src/routes/\`
   - 验证API服务器状态
   - 检查跨域配置

## 📋 详细页面检查结果

${checkResults.pages.map(page => `
### ${page.name}
- **状态**: ${page.status}
- **URL**: ${page.url}
- **最终URL**: ${page.finalUrl}
- **响应状态**: ${page.responseStatus}
- **控制台错误**: ${page.consoleErrors.length}
- **网络错误**: ${page.networkErrors.length}
- **是否空白**: ${page.isBlank}
- **页面内容**: ${page.pageContent.substring(0, 100)}...
${page.loadError ? `- **加载错误**: ${page.loadError}` : ''}
`).join('\n')}
`;

  // 保存报告到文件
  const reportFileName = `sidebar-systematic-check-report-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
  const reportFilePath = path.join(process.cwd(), reportFileName);

  fs.writeFileSync(reportFilePath, reportContent, 'utf8');
  console.log(`\n📄 详细报告已保存到: ${reportFilePath}`);

  // 保存JSON格式的原始数据
  const jsonReportFileName = `sidebar-systematic-check-data-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const jsonReportFilePath = path.join(process.cwd(), jsonReportFileName);

  fs.writeFileSync(jsonReportFilePath, JSON.stringify(checkResults, null, 2), 'utf8');
  console.log(`📊 原始数据已保存到: ${jsonReportFilePath}`);

  // 输出关键统计信息
  console.log('\n📊 检查完成统计:');
  console.log(`✅ 正常页面: ${checkResults.summary.normalPages}/${checkResults.summary.totalPages}`);
  console.log(`❌ 问题页面: ${checkResults.summary.errorPages}/${checkResults.summary.totalPages}`);
  console.log(`   - 控制台错误: ${checkResults.summary.consoleErrorPages}`);
  console.log(`   - 空白页面: ${checkResults.summary.blankPages}`);
  console.log(`   - 网络错误: ${checkResults.summary.networkErrorPages}`);
  console.log(`📈 成功率: ${((checkResults.summary.normalPages / checkResults.summary.totalPages) * 100).toFixed(1)}%`);
}

// 运行检查
runSystematicSidebarCheck().catch(console.error);