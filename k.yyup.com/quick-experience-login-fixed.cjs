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

    await page.waitForTimeout(3000);

    // 根据HTML结构查找快速体验按钮
    console.log('🔍 查找快速体验按钮...');

    // 尝试点击系统管理员按钮
    const adminButtonSelectors = [
      '.quick-btn.admin-btn',
      'button.admin-btn',
      '.admin-btn',
      'button[title*="系统管理员"]',
      'button:has-text("系统管理员")'
    ];

    let buttonClicked = false;
    for (const selector of adminButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`✅ 找到系统管理员按钮: ${selector}`);
          await button.click();
          buttonClicked = true;
          break;
        }
      } catch (error) {
        console.log(`   尝试选择器 ${selector} 失败: ${error.message}`);
      }
    }

    if (!buttonClicked) {
      // 尝试通过文本内容查找
      try {
        await page.click('text=系统管理员');
        console.log('✅ 通过文本点击系统管理员按钮');
        buttonClicked = true;
      } catch (error) {
        console.log(`   通过文本点击失败: ${error.message}`);
      }
    }

    if (!buttonClicked) {
      console.log('❌ 未找到系统管理员按钮，尝试其他角色...');

      // 尝试其他角色
      const otherRoles = ['园长', '教师', '家长'];
      for (const role of otherRoles) {
        try {
          await page.click(`text=${role}`);
          console.log(`✅ 点击 ${role} 按钮`);
          buttonClicked = true;
          break;
        } catch (error) {
          console.log(`   点击 ${role} 失败: ${error.message}`);
        }
      }
    }

    if (!buttonClicked) {
      console.log('❌ 无法点击任何快速体验按钮');
      return false;
    }

    // 等待登录完成
    await page.waitForTimeout(5000);

    // 检查是否登录成功
    const currentUrl = page.url();
    const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
    const hasDashboard = await page.$('.dashboard, .main-content, .app-main') !== null;
    const isLoggedIn = hasSidebar || hasDashboard || !currentUrl.includes('login');

    if (isLoggedIn) {
      console.log(`✅ 快速体验登录成功！`);
      console.log(`   最终URL: ${currentUrl}`);
      console.log(`   有侧边栏: ${hasSidebar}`);
      console.log(`   有仪表板: ${hasDashboard}`);

      // 保存登录信息
      const loginInfo = {
        loginTime: new Date().toISOString(),
        finalUrl: currentUrl,
        loginMethod: 'quick_experience_fixed',
        hasSidebar,
        hasDashboard
      };

      fs.writeFileSync('quick-experience-login-success.json', JSON.stringify(loginInfo, null, 2));
      console.log('💾 登录信息已保存到 quick-experience-login-success.json');

      // 截图保存
      await page.screenshot({ path: 'dashboard-after-quick-login.png', fullPage: true });
      console.log('📸 登录后页面截图已保存到 dashboard-after-quick-login.png');

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
          menuItems: sidebarMenu,
          count: sidebarMenu.length,
          discoverTime: new Date().toISOString()
        };

        fs.writeFileSync('sidebar-menu-final.json', JSON.stringify(menuInfo, null, 2));
        console.log('💾 完整菜单信息已保存到 sidebar-menu-final.json');

        return {
          success: true,
          menuItems: sidebarMenu,
          loginInfo: loginInfo
        };
      } else {
        console.log('⚠️ 未找到侧边栏菜单，可能页面结构不同');
        return {
          success: true,
          menuItems: [],
          loginInfo: loginInfo
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
    await page.waitForTimeout(3000);

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
        '.el-menu-vertical .el-menu-item',
        '.el-menu--collapse .el-menu-item',
        'a[href*="/"]',
        '.sidebar a',
        '.navigation a',
        '.menu a',
        '.el-submenu__title',
        '.el-menu-item'
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            const href = el.href || el.getAttribute('href');
            const routerLink = el.getAttribute('router-link') || el.getAttribute('to') || el.getAttribute('data-route');
            const isSubMenu = el.classList.contains('el-submenu__title');

            if (text && text.length > 0 && (href || routerLink || isSubMenu)) {
              const url = href || routerLink || '';

              // 过滤掉不需要的链接
              if (!isSubMenu && url &&
                  !url.includes('javascript:void') &&
                  !url.includes('#') &&
                  !url.includes('logout') &&
                  !url.includes('退出') &&
                  !url.includes('signout') &&
                  text !== '首页' &&
                  text !== '仪表板' &&
                  text !== 'Dashboard' &&
                  text !== '' &&
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
                    selector: selector,
                    isSubMenu: isSubMenu
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
    console.log(`发现的菜单项: ${result.menuItems.length} 个`);

    if (result.menuItems.length > 0) {
      console.log('\n🚀 现在可以运行完整的系统性侧边栏检查:');
      console.log('node sidebar-systematic-check-final.cjs');

      // 创建最终的检查脚本
      createFinalCheckScript();
    } else {
      console.log('\n⚠️ 虽然登录成功，但没有找到菜单项');
      console.log('可能需要等待页面完全加载或检查页面结构');
    }
  } else {
    console.log('\n💡 建议:');
    console.log('1. 检查页面是否正确加载');
    console.log('2. 尝试使用有头模式调试');
    console.log('3. 检查是否有JavaScript错误');
  }
}).catch(console.error);

function createFinalCheckScript() {
  const scriptContent = `
const { chromium } = require('playwright');
const fs = require('fs');

// 读取菜单信息
let sidebarMenu = [];
try {
  const menuData = JSON.parse(fs.readFileSync('sidebar-menu-final.json', 'utf8'));
  sidebarMenu = menuData.menuItems;
  console.log(\`📋 加载了 \${sidebarMenu.length} 个菜单项\`);
} catch (error) {
  console.log('❌ 无法加载菜单信息，请先运行快速体验登录');
  process.exit(1);
}

// 检查结果记录
const checkResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalPages: 0,
    normalPages: 0,
    errorPages: 0,
    blankPages: 0,
    consoleErrorPages: 0,
    networkErrorPages: 0,
    redirectedPages: 0
  },
  pages: [],
  errorCategories: {
    consoleErrors: [],
    blankPages: [],
    networkErrors: [],
    loadErrors: [],
    redirectedPages: []
  },
  normalPages: []
};

// 控制台错误收集
const consoleErrors = new Map();
const networkErrors = new Map();

async function runFinalSystematicCheck() {
  console.log('🚀 开始最终系统性侧边栏页面检查...');
  console.log(\`📊 检查 \${sidebarMenu.length} 个页面\`);

  const browser = await chromium.launch({
    headless: true,
    devtools: false,
    slowMo: 300
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
        if (pageCheck.status === 'redirected') {
          checkResults.errorCategories.redirectedPages.push(pageCheck);
          checkResults.summary.redirectedPages++;
        }
        checkResults.summary.errorPages++;
        console.log(\`   ❌ 页面有问题: \${pageCheck.status}\`);
      }

      // 每检查5个页面就休息一下，避免过载
      if ((i + 1) % 5 === 0) {
        console.log(\`   ⏸️ 已检查 \${i + 1} 个页面，休息一下...\`);
        await page.waitForTimeout(2000);
      }
    }

    // 第三步：生成最终报告
    console.log('\\n📊 第三步：生成最终报告');
    await generateFinalReport();

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

  await page.waitForTimeout(3000);

  // 点击系统管理员按钮
  try {
    await page.click('.quick-btn.admin-btn, button.admin-btn, text=系统管理员');
    await page.waitForTimeout(3000);

    // 验证登录成功
    const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
    if (!hasSidebar) {
      throw new Error('快速体验登录失败');
    }
    console.log('✅ 快速体验登录成功');
  } catch (error) {
    console.log('❌ 快速体验登录失败:', error.message);
    throw error;
  }
}

async function checkPage(page, menuItem) {
  try {
    console.log(\`   🔄 导航到: \${menuItem.name}\`);

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

    // 检查页面是否重定向
    const isRedirected = pageUrl !== menuItem.url;

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
      const hasError = document.querySelector('.error-page, .not-found, .error, .el-empty') !== null;

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
    } else if (isRedirected) {
      status = 'redirected';
    }

    const pageCheck = {
      name: menuItem.name,
      url: menuItem.url,
      finalUrl: pageUrl,
      title: pageTitle,
      status: status,
      isRedirected: isRedirected,
      isBlank: !isBlank.hasContent && !isBlank.hasMainContent,
      responseStatus: responseStatus,
      consoleErrors: consoleErrorsList,
      networkErrors: networkErrorsList,
      pageContent: isBlank.bodyText.substring(0, 200),
      loadTime: Date.now()
    };

    console.log(\`   📊 检查结果: \${status}\`);
    if (isRedirected) {
      console.log(\`   🔄 重定向到: \${pageUrl}\`);
    }
    if (consoleErrorsList.length > 0) {
      console.log(\`   ⚠️ 控制台错误: \${consoleErrorsList.length} 个\`);
    }
    if (networkErrorsList.length > 0) {
      console.log(\`   🌐 网络错误: \${networkErrorsList.length} 个\`);
    }
    if (pageCheck.isBlank) {
      console.log(\`   📄 页面内容: 空白或极简\`);
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
      isRedirected: false,
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

async function generateFinalReport() {
  console.log('\\n📋 生成最终检查报告...');

  const reportContent = \`
# 系统性侧边栏页面检查 - 最终报告

**检查时间**: \${new Date().toLocaleString('zh-CN')}

## 📊 检查摘要

- **总页面数**: \${checkResults.summary.totalPages}
- **正常页面**: \${checkResults.summary.normalPages}
- **问题页面**: \${checkResults.summary.errorPages}
  - 控制台错误页面: \${checkResults.summary.consoleErrorPages}
  - 空白页面: \${checkResults.summary.blankPages}
  - 网络错误页面: \${checkResults.summary.networkErrorPages}
  - 重定向页面: \${checkResults.summary.redirectedPages}

## ✅ 正常页面 (\${checkResults.normalPages.length} 个)

\${checkResults.normalPages.map(page =>
  \`- [\${page.name}](\${page.url}) - \${page.title}\`
).join('\\n')}

## ❌ 问题页面详细分析

### 1. 控制台错误页面 (\${checkResults.errorCategories.consoleErrors.length} 个)

\${checkResults.errorCategories.consoleErrors.map(page => \`
#### \${page.name}
- **URL**: \${page.url}
- **最终URL**: \${page.finalUrl}
- **错误数量**: \${page.consoleErrors.length}

**错误详情**:
\${page.consoleErrors.map(error =>
  \`- [\${error.type}] \${error.text}\`
).join('\\n')}
\`).join('\\n')}

### 2. 空白页面 (\${checkResults.errorCategories.blankPages.length} 个)

\${checkResults.errorCategories.blankPages.map(page => \`
#### \${page.name}
- **URL**: \${page.url}
- **最终URL**: \${page.finalUrl}
- **响应状态**: \${page.responseStatus}
- **页面内容预览**: \${page.pageContent}
\`).join('\\n')}

### 3. 网络错误页面 (\${checkResults.errorCategories.networkErrors.length} 个)

\${checkResults.errorCategories.networkErrors.map(page => \`
#### \${page.name}
- **URL**: \${page.url}
- **最终URL**: \${page.finalUrl}

**网络错误**:
\${page.networkErrors.map(error =>
  \`- [\${error.status}] \${error.url}\`
).join('\\n')}
\`).join('\\n')}

### 4. 重定向页面 (\${checkResults.errorCategories.redirectedPages.length} 个)

\${checkResults.errorCategories.redirectedPages.map(page => \`
#### \${page.name}
- **原URL**: \${page.url}
- **最终URL**: \${page.finalUrl}
- **响应状态**: \${page.responseStatus}
\`).join('\\n')}

## 📈 修复优先级建议

### 🔥 高优先级 (立即修复)
1. **空白页面** - 用户体验严重影响
   \${checkResults.errorCategories.blankPages.map(page => \`- \${page.name}\`).join('\\n   ')}

2. **控制台错误页面** - 可能影响功能
   \${checkResults.errorCategories.consoleErrors.map(page => \`- \${page.name}\`).join('\\n   ')}

### 🔶 中优先级 (近期修复)
1. **网络错误页面** - 部分功能可能受影响
   \${checkResults.errorCategories.networkErrors.map(page => \`- \${page.name}\`).join('\\n   ')}

### 🔷 低优先级 (后续优化)
1. **重定向页面** - 需要确认是否为预期行为
   \${checkResults.errorCategories.redirectedPages.map(page => \`- \${page.name}\`).join('\\n   ')}

## 🔧 修复建议

### 通用修复步骤
1. **检查路由配置** - 确认页面路由是否正确配置
   - 文件: \`client/src/router/dynamic-routes.ts\`
   - 文件: \`client/src/router/optimized-routes.ts\`

2. **验证组件导入** - 确认Vue组件是否正确导入和注册
   - 检查: \`client/src/pages/\` 目录
   - 检查: \`client/src/components/\` 目录

3. **检查API端点** - 确认后端API是否正常工作
   - 文件: \`server/src/routes/\`
   - 验证API服务状态

4. **验证权限配置** - 确认页面权限配置是否正确
   - 检查: \`client/src/router/dynamic-routes.ts\`
   - 后端权限服务

### 具体修复方案

#### 空白页面修复
1. 检查组件文件是否存在
2. 验证组件导入语法
3. 检查路由映射配置
4. 确认数据初始化是否正确

#### 控制台错误修复
1. 修复JavaScript语法错误
2. 检查API调用参数
3. 验证数据格式
4. 检查依赖组件是否正确加载

#### 网络错误修复
1. 检查后端API端点实现
2. 验证API服务器状态
3. 检查跨域配置
4. 确认API认证配置

## 📊 详细页面检查结果

\${checkResults.pages.map(page => \`
### \${page.name}
- **状态**: \${page.status}
- **URL**: \${page.url}
- **最终URL**: \${page.finalUrl}
- **响应状态**: \${page.responseStatus}
- **控制台错误**: \${page.consoleErrors.length}
- **网络错误**: \${page.networkErrors.length}
- **是否空白**: \${page.isBlank}
- **是否重定向**: \${page.isRedirected}
- **页面内容**: \${page.pageContent.substring(0, 100)}...\${page.loadError ? \`\\n- **加载错误**: \${page.loadError}\` : ''}
\`).join('\\n')}

## 📋 修复检查清单

### 📁 需要检查的文件
- [ ] \`client/src/router/dynamic-routes.ts\` - 动态路由配置
- [ ] \`client/src/router/optimized-routes.ts\` - 优化路由配置
- [ ] \`client/src/pages/\` - 页面组件目录
- [ ] \`client/src/api/\` - API调用目录
- [ ] \`server/src/routes/\` - 后端路由目录
- [ ] \`server/src/controllers/\` - 控制器目录

### 🔧 需要验证的功能
- [ ] 所有页面组件都能正常加载
- [ ] API端点都能正常响应
- [ ] 权限配置正确生效
- [ ] 数据初始化正常完成

### ✅ 修复后验证
- [ ] 重新运行系统性检查
- [ ] 所有页面都能正常显示
- [ ] 控制台无错误信息
- [ ] 所有功能都能正常使用

---

**报告生成时间**: \${new Date().toLocaleString('zh-CN')}
**检查工具**: Playwright自动化测试
**系统版本**: 幼儿园管理系统 v1.0
\`;

  // 保存报告到文件
  const reportFileName = \`系统性侧边栏页面检查-最终报告-\${new Date().toISOString().replace(/[:.]/g, '-')}.md\`;
  const reportFilePath = path.join(process.cwd(), reportFileName);

  fs.writeFileSync(reportFilePath, reportContent, 'utf8');
  console.log(\`\\n📄 最终报告已保存到: \${reportFilePath}\`);

  // 保存JSON格式的原始数据
  const jsonReportFileName = \`系统性侧边栏检查-最终数据-\${new Date().toISOString().replace(/[:.]/g, '-')}.json\`;
  const jsonReportFilePath = path.join(process.cwd(), jsonReportFileName);

  fs.writeFileSync(jsonReportFilePath, JSON.stringify(checkResults, null, 2), 'utf8');
  console.log(\`📊 原始数据已保存到: \${jsonReportFilePath}\`);

  // 输出关键统计信息
  console.log('\\n📊 检查完成统计:');
  console.log(\`✅ 正常页面: \${checkResults.summary.normalPages}/\${checkResults.summary.totalPages}\`);
  console.log(\`❌ 问题页面: \${checkResults.summary.errorPages}/\${checkResults.summary.totalPages}\`);
  console.log(\`   - 控制台错误: \${checkResults.summary.consoleErrorPages}\`);
  console.log(\`   - 空白页面: \${checkResults.summary.blankPages}\`);
  console.log(\`   - 网络错误: \${checkResults.summary.networkErrorPages}\`);
  console.log(\`   - 重定向页面: \${checkResults.summary.redirectedPages}\`);
  console.log(\`📈 成功率: \${((checkResults.summary.normalPages / checkResults.summary.totalPages) * 100).toFixed(1)}%\`);
}

// 运行最终检查
runFinalSystematicCheck().catch(console.error);
`;

  fs.writeFileSync('sidebar-systematic-check-final.cjs', scriptContent);
  console.log('💾 已创建最终检查脚本: sidebar-systematic-check-final.cjs');
  console.log('\n🚀 现在运行最终检查:');
  console.log('node sidebar-systematic-check-final.cjs');
}