const { chromium } = require('playwright');
const fs = require('fs');

// 读取菜单信息
let sidebarMenu = [];
try {
  const menuData = JSON.parse(fs.readFileSync('sidebar-menu-simple.json', 'utf8'));
  sidebarMenu = menuData.menuItems;
  console.log(`📋 加载了 ${sidebarMenu.length} 个菜单项`);
} catch (error) {
  console.log('❌ 无法加载菜单信息，请先运行快速登录脚本');
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

async function runFinalCheck() {
  console.log('🚀 开始系统性侧边栏页面检查...');
  console.log(`📊 检查 ${sidebarMenu.length} 个页面`);

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

    // 第一步：快速登录
    console.log('\n📝 第一步：快速登录');
    await quickLogin(page);

    // 第二步：系统性检查每个页面
    console.log(`\n🔍 第二步：系统性检查 ${sidebarMenu.length} 个页面`);

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

    // 第三步：生成报告
    console.log('\n📊 第三步：生成报告');
    await generateReport();

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

async function quickLogin(page) {
  await page.goto('http://localhost:5173/login', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForTimeout(3000);

  await page.click('text=系统管理员');
  await page.waitForTimeout(3000);

  const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
  if (!hasSidebar) {
    throw new Error('快速登录失败');
  }
  console.log('✅ 快速登录成功');
}

async function checkPage(page, menuItem) {
  try {
    console.log(`   🔄 导航到: ${menuItem.name}`);

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

      const hasMainContent = document.querySelector('.main-content, .app-main, .content, .page-content') !== null;
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
  console.log('\n📋 生成详细报告...');

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

### 🔥 高优先级 (立即修复)
1. **空白页面** - 用户体验严重影响
   ${checkResults.errorCategories.blankPages.map(page => `- ${page.name}`).join('\n   ')}

### 🔶 中优先级 (近期修复)
1. **控制台错误页面** - 可能影响功能
   ${checkResults.errorCategories.consoleErrors.map(page => `- ${page.name}`).join('\n   ')}

### 🔷 低优先级 (后续优化)
1. **网络错误页面** - 部分功能可能受影响
   ${checkResults.errorCategories.networkErrors.map(page => `- ${page.name}`).join('\n   ')}

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

## 📊 详细页面检查结果

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

---

**报告生成时间**: ${new Date().toLocaleString('zh-CN')}
**检查工具**: Playwright自动化测试
**系统版本**: 幼儿园管理系统 v1.0
`;

  // 保存报告到文件
  const reportFileName = `系统性侧边栏页面检查报告-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
  const reportFilePath = `${process.cwd()}/${reportFileName}`;

  fs.writeFileSync(reportFilePath, reportContent, 'utf8');
  console.log(`\n📄 报告已保存到: ${reportFilePath}`);

  // 保存JSON格式的原始数据
  const jsonReportFileName = `系统性侧边栏检查数据-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const jsonReportFilePath = `${process.cwd()}/${jsonReportFileName}`;

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

  // 输出关键问题页面
  if (checkResults.summary.errorPages > 0) {
    console.log('\n🚨 需要重点关注的页面:');

    if (checkResults.errorCategories.blankPages.length > 0) {
      console.log('\n📄 空白页面 (高优先级):');
      checkResults.errorCategories.blankPages.forEach(page => {
        console.log(`   - ${page.name}: ${page.url}`);
      });
    }

    if (checkResults.errorCategories.consoleErrors.length > 0) {
      console.log('\n⚠️ 控制台错误页面 (中优先级):');
      checkResults.errorCategories.consoleErrors.forEach(page => {
        console.log(`   - ${page.name}: ${page.consoleErrors.length} 个错误`);
      });
    }

    if (checkResults.errorCategories.networkErrors.length > 0) {
      console.log('\n🌐 网络错误页面 (低优先级):');
      checkResults.errorCategories.networkErrors.forEach(page => {
        console.log(`   - ${page.name}: ${page.networkErrors.length} 个错误`);
      });
    }
  }

  console.log('\n🎯 修复建议:');
  console.log('1. 优先修复空白页面，这些页面完全无法使用');
  console.log('2. 检查路由配置和组件导入');
  console.log('3. 验证API端点是否正常工作');
  console.log('4. 修复控制台错误，提升用户体验');
}

// 运行检查
runFinalCheck().catch(console.error);