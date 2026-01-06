#!/usr/bin/env node

/**
 * 全面回归测试 - 使用Puppeteer测试所有页面和CRUD功能
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 测试配置
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

// 错误记录
const testErrors = [];
const testWarnings = [];
const testPassed = [];

// 所有需要测试的页面
const testPages = [
  // 工作台
  { name: '工作台-仪表板', route: '/dashboard', category: '工作台', priority: 'high' },
  { name: '工作台-园区概览', route: '/dashboard/campus-overview', category: '工作台', priority: 'medium' },
  { name: '工作台-数据统计', route: '/dashboard/data-statistics', category: '工作台', priority: 'medium' },
  { name: '工作台-日程管理', route: '/dashboard/schedule', category: '工作台', priority: 'low' },
  { name: '工作台-重要通知', route: '/dashboard/important-notices', category: '工作台', priority: 'low' },
  
  // 业务中心
  { name: '人员中心', route: '/centers/personnel', category: '业务中心', priority: 'high' },
  { name: '招生中心', route: '/centers/enrollment', category: '业务中心', priority: 'high' },
  { name: '营销中心', route: '/centers/marketing', category: '业务中心', priority: 'high' },
  { name: '活动中心', route: '/centers/activity', category: '业务中心', priority: 'high' },
  { name: '任务中心', route: '/centers/task', category: '业务中心', priority: 'medium' },
  { name: '教学中心', route: '/centers/teaching', category: '业务中心', priority: 'medium' },
  { name: 'AI中心', route: '/centers/ai', category: '业务中心', priority: 'medium' },
  { name: '分析中心', route: '/centers/analytics', category: '业务中心', priority: 'medium' },
  { name: '财务中心', route: '/centers/finance', category: '业务中心', priority: 'high' },
  { name: '系统中心', route: '/centers/system', category: '业务中心', priority: 'medium' },
  
  // 学生管理
  { name: '学生列表', route: '/student', category: '学生管理', priority: 'high', hasCRUD: true },
  
  // 教师管理
  { name: '教师列表', route: '/teacher', category: '教师管理', priority: 'high', hasCRUD: true },
  
  // 家长管理
  { name: '家长列表', route: '/parent', category: '家长管理', priority: 'high', hasCRUD: true },
  
  // 班级管理
  { name: '班级列表', route: '/class', category: '班级管理', priority: 'high', hasCRUD: true },
  
  // 招生管理
  { name: '招生计划', route: '/enrollment-plan', category: '招生管理', priority: 'high', hasCRUD: true },
  { name: '招生活动', route: '/enrollment', category: '招生管理', priority: 'high', hasCRUD: true },
  
  // 活动管理
  { name: '活动列表', route: '/activity', category: '活动管理', priority: 'high', hasCRUD: true },
  
  // 客户管理
  { name: '客户列表', route: '/customer', category: '客户管理', priority: 'high', hasCRUD: true },
  { name: '客户池', route: '/principal/customer-pool', category: '客户管理', priority: 'medium' },
  
  // 入园申请
  { name: '入园申请', route: '/application', category: '入园申请', priority: 'high', hasCRUD: true },
  
  // 广告管理
  { name: '广告管理', route: '/advertisement', category: '营销管理', priority: 'medium', hasCRUD: true },
  
  // 园长功能
  { name: '园长仪表板', route: '/principal/dashboard', category: '园长功能', priority: 'high' },
  { name: '基本资料', route: '/principal/basic-info', category: '园长功能', priority: 'medium' },
  { name: '绩效管理', route: '/principal/performance', category: '园长功能', priority: 'medium' },
  { name: '新媒体中心', route: '/principal/media-center', category: '园长功能', priority: 'low' },
  
  // 系统管理
  { name: '用户管理', route: '/system/users', category: '系统管理', priority: 'high', hasCRUD: true },
  { name: '角色管理', route: '/system/roles', category: '系统管理', priority: 'high', hasCRUD: true },
  { name: '权限管理', route: '/system/permissions', category: '系统管理', priority: 'high', hasCRUD: true },
];

// 记录错误
function recordError(page, category, error, severity = 'medium') {
  testErrors.push({
    page,
    category,
    error,
    severity,
    timestamp: new Date().toISOString()
  });
}

// 记录警告
function recordWarning(page, category, warning) {
  testWarnings.push({
    page,
    category,
    warning,
    timestamp: new Date().toISOString()
  });
}

// 记录通过
function recordPassed(page, category, details = '') {
  testPassed.push({
    page,
    category,
    details,
    timestamp: new Date().toISOString()
  });
}

// 登录
async function login(page) {
  try {
    console.log('🔐 正在登录...');
    console.log(`  访问登录页面: ${BASE_URL}/login`);

    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('  等待页面加载...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 等待登录表单
    console.log('  查找登录表单...');
    await page.waitForSelector('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"], input[placeholder*="密码"]', { timeout: 10000 });

    // 输入凭证
    console.log('  输入用户名和密码...');
    const usernameInput = await page.$('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]');
    const passwordInput = await page.$('input[type="password"], input[placeholder*="密码"]');

    await usernameInput.type(TEST_USER.username, { delay: 100 });
    await passwordInput.type(TEST_USER.password, { delay: 100 });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 点击登录按钮
    console.log('  点击登录按钮...');
    const loginButton = await page.$('button[type="submit"], button:has-text("登录")');
    await loginButton.click();

    // 等待跳转到仪表板
    console.log('  等待跳转...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const currentUrl = page.url();
    console.log(`  当前URL: ${currentUrl}`);

    if (currentUrl.includes('/dashboard') || currentUrl.includes('/centers')) {
      console.log('✅ 登录成功');
      return true;
    } else {
      recordError('登录页面', '登录', `登录后未跳转到仪表板，当前URL: ${currentUrl}`, 'critical');
      return false;
    }
  } catch (error) {
    recordError('登录页面', '登录', `登录失败: ${error.message}`, 'critical');
    console.error('❌ 登录失败:', error.message);
    return false;
  }
}

// 测试单个页面
async function testPage(page, pageInfo) {
  const startTime = Date.now();
  console.log(`\n📄 测试页面: ${pageInfo.name} (${pageInfo.route})`);
  
  try {
    // 监听控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 导航到页面
    const response = await page.goto(`${BASE_URL}${pageInfo.route}`, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // 检查HTTP状态
    if (response.status() !== 200) {
      recordError(pageInfo.name, '页面访问', `HTTP状态码: ${response.status()}`, 'high');
      console.log(`  ❌ HTTP状态码异常: ${response.status()}`);
      return false;
    }
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 检查是否是404页面
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('404') || bodyText.includes('页面不存在') || bodyText.includes('Not Found')) {
      recordError(pageInfo.name, '页面访问', '页面返回404错误', 'critical');
      console.log('  ❌ 页面不存在 (404)');
      return false;
    }
    
    // 检查页面是否有主要内容
    const hasContent = await page.evaluate(() => {
      const selectors = ['main', '.main-content', '.page-container', '.el-main', '[class*="content"]'];
      return selectors.some(selector => document.querySelector(selector) !== null);
    });
    
    if (!hasContent) {
      recordWarning(pageInfo.name, '页面结构', '页面缺少主要内容容器');
      console.log('  ⚠️  页面缺少主要内容容器');
    }
    
    // 检查控制台错误
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => {
        recordWarning(pageInfo.name, '控制台错误', error);
      });
      console.log(`  ⚠️  发现 ${consoleErrors.length} 个控制台错误`);
    }
    
    // 截图
    const screenshotDir = path.join(__dirname, '../test-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, `${pageInfo.category}-${pageInfo.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    const duration = Date.now() - startTime;
    recordPassed(pageInfo.name, '页面访问', `加载时间: ${duration}ms`);
    console.log(`  ✅ 页面加载成功 (${duration}ms)`);
    
    return true;
    
  } catch (error) {
    recordError(pageInfo.name, '页面访问', `访问失败: ${error.message}`, 'critical');
    console.error(`  ❌ 页面访问失败: ${error.message}`);
    return false;
  }
}

// 测试CRUD功能
async function testCRUD(page, pageInfo) {
  console.log(`\n🔧 测试CRUD功能: ${pageInfo.name}`);
  
  try {
    await page.goto(`${BASE_URL}${pageInfo.route}`, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const crudResults = {
      hasTable: false,
      hasCreate: false,
      hasEdit: false,
      hasDelete: false,
      hasSearch: false
    };
    
    // 检查表格 (Read)
    crudResults.hasTable = await page.evaluate(() => {
      const selectors = ['table', '.el-table', '.data-table', '[class*="table"]'];
      return selectors.some(selector => document.querySelector(selector) !== null);
    });
    
    // 检查创建按钮 (Create)
    crudResults.hasCreate = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, .el-button'));
      return buttons.some(btn => 
        btn.textContent.includes('新增') || 
        btn.textContent.includes('添加') || 
        btn.textContent.includes('创建')
      );
    });
    
    // 检查编辑按钮 (Update)
    crudResults.hasEdit = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, .el-button'));
      return buttons.some(btn => btn.textContent.includes('编辑'));
    });
    
    // 检查删除按钮 (Delete)
    crudResults.hasDelete = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, .el-button'));
      return buttons.some(btn => btn.textContent.includes('删除'));
    });
    
    // 检查搜索功能
    crudResults.hasSearch = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.some(input => 
        input.placeholder?.includes('搜索') || 
        input.placeholder?.includes('查询') ||
        input.placeholder?.includes('搜寻')
      );
    });
    
    // 记录结果
    const missingFeatures = [];
    if (!crudResults.hasTable) missingFeatures.push('数据表格');
    if (!crudResults.hasCreate) missingFeatures.push('创建按钮');
    if (!crudResults.hasEdit) missingFeatures.push('编辑按钮');
    if (!crudResults.hasDelete) missingFeatures.push('删除按钮');
    if (!crudResults.hasSearch) missingFeatures.push('搜索功能');
    
    if (missingFeatures.length > 0) {
      recordWarning(pageInfo.name, 'CRUD功能', `缺少功能: ${missingFeatures.join(', ')}`);
      console.log(`  ⚠️  缺少功能: ${missingFeatures.join(', ')}`);
    } else {
      recordPassed(pageInfo.name, 'CRUD功能', '所有CRUD功能完整');
      console.log('  ✅ 所有CRUD功能完整');
    }
    
    return crudResults;
    
  } catch (error) {
    recordError(pageInfo.name, 'CRUD测试', `CRUD测试失败: ${error.message}`, 'high');
    console.error(`  ❌ CRUD测试失败: ${error.message}`);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('\n========================================');
  console.log('🧪 开始全面回归测试');
  console.log('========================================\n');
  console.log(`测试页面数量: ${testPages.length}`);
  console.log(`CRUD测试数量: ${testPages.filter(p => p.hasCRUD).length}\n`);
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // 登录
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      throw new Error('登录失败，无法继续测试');
    }
    
    // 测试所有页面
    console.log('\n========================================');
    console.log('📄 开始页面访问测试');
    console.log('========================================');
    
    for (const pageInfo of testPages) {
      await testPage(page, pageInfo);
      await new Promise(resolve => setTimeout(resolve, 500)); // 短暂延迟
    }
    
    // 测试CRUD功能
    console.log('\n========================================');
    console.log('🔧 开始CRUD功能测试');
    console.log('========================================');
    
    const crudPages = testPages.filter(p => p.hasCRUD);
    for (const pageInfo of crudPages) {
      await testCRUD(page, pageInfo);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    console.error('\n❌ 测试执行失败:', error.message);
  } finally {
    await browser.close();
  }
  
  // 生成报告
  generateReport();
}

// 生成报告
function generateReport() {
  console.log('\n========================================');
  console.log('📊 生成测试报告');
  console.log('========================================\n');
  
  const totalTests = testPassed.length + testErrors.length + testWarnings.length;
  const passRate = totalTests > 0 ? ((testPassed.length / totalTests) * 100).toFixed(2) : 0;
  
  // 生成Markdown报告
  let report = `# 幼儿园管理系统 - 全面回归测试报告

## 📋 测试概览

- **测试日期**: ${new Date().toLocaleString('zh-CN')}
- **测试类型**: 全面回归测试
- **测试范围**: ${testPages.length} 个页面 + CRUD功能测试
- **测试工具**: Puppeteer

## 📊 测试统计

| 指标 | 数量 | 百分比 |
|------|------|--------|
| ✅ 通过 | ${testPassed.length} | ${passRate}% |
| ❌ 失败 | ${testErrors.length} | ${totalTests > 0 ? ((testErrors.length / totalTests) * 100).toFixed(2) : 0}% |
| ⚠️ 警告 | ${testWarnings.length} | ${totalTests > 0 ? ((testWarnings.length / totalTests) * 100).toFixed(2) : 0}% |
| 📝 总计 | ${totalTests} | 100% |

`;

  // 添加评级
  if (passRate >= 95) {
    report += `**评级**: 🌟🌟🌟🌟🌟 优秀 (${passRate}%)\n\n`;
  } else if (passRate >= 85) {
    report += `**评级**: 🌟🌟🌟🌟 良好 (${passRate}%)\n\n`;
  } else if (passRate >= 70) {
    report += `**评级**: 🌟🌟🌟 中等 (${passRate}%)\n\n`;
  } else {
    report += `**评级**: 🌟🌟 需要改进 (${passRate}%)\n\n`;
  }

  // 错误详情
  if (testErrors.length > 0) {
    report += `## ❌ 失败的测试 (${testErrors.length})\n\n`;

    const errorsByCategory = {};
    testErrors.forEach(error => {
      if (!errorsByCategory[error.category]) {
        errorsByCategory[error.category] = [];
      }
      errorsByCategory[error.category].push(error);
    });

    Object.keys(errorsByCategory).forEach(category => {
      report += `### ${category}\n\n`;
      errorsByCategory[category].forEach((error, index) => {
        report += `#### ${index + 1}. ${error.page}\n\n`;
        report += `- **严重程度**: ${error.severity}\n`;
        report += `- **错误信息**: ${error.error}\n`;
        report += `- **时间**: ${new Date(error.timestamp).toLocaleString('zh-CN')}\n\n`;
      });
    });
  }

  // 警告详情
  if (testWarnings.length > 0) {
    report += `## ⚠️ 警告信息 (${testWarnings.length})\n\n`;

    const warningsByCategory = {};
    testWarnings.forEach(warning => {
      if (!warningsByCategory[warning.category]) {
        warningsByCategory[warning.category] = [];
      }
      warningsByCategory[warning.category].push(warning);
    });

    Object.keys(warningsByCategory).forEach(category => {
      report += `### ${category}\n\n`;
      warningsByCategory[category].forEach((warning, index) => {
        report += `${index + 1}. **${warning.page}**: ${warning.warning}\n`;
      });
      report += `\n`;
    });
  }

  // 通过的测试摘要
  if (testPassed.length > 0) {
    report += `## ✅ 通过的测试 (${testPassed.length})\n\n`;

    const passedByCategory = {};
    testPassed.forEach(test => {
      if (!passedByCategory[test.category]) {
        passedByCategory[test.category] = 0;
      }
      passedByCategory[test.category]++;
    });

    Object.keys(passedByCategory).forEach(category => {
      report += `- **${category}**: ${passedByCategory[category]} 个测试通过\n`;
    });
    report += `\n`;
  }

  // 问题分类统计
  report += `## 📈 问题分类统计\n\n`;

  const issueCategories = {
    '页面访问': 0,
    '页面结构': 0,
    'CRUD功能': 0,
    '控制台错误': 0,
    '登录': 0,
    '其他': 0
  };

  testErrors.forEach(error => {
    let categorized = false;
    Object.keys(issueCategories).forEach(category => {
      if (error.category.includes(category)) {
        issueCategories[category]++;
        categorized = true;
      }
    });
    if (!categorized) {
      issueCategories['其他']++;
    }
  });

  report += `| 问题类型 | 数量 |\n`;
  report += `|---------|------|\n`;
  Object.keys(issueCategories).forEach(category => {
    if (issueCategories[category] > 0) {
      report += `| ${category} | ${issueCategories[category]} |\n`;
    }
  });
  report += `\n`;

  // 修复建议
  report += `## 💡 修复建议\n\n`;

  if (testErrors.length > 0) {
    report += `### 优先级排序\n\n`;

    const criticalErrors = testErrors.filter(e => e.severity === 'critical');
    const highErrors = testErrors.filter(e => e.severity === 'high');
    const mediumErrors = testErrors.filter(e => e.severity === 'medium');
    const lowErrors = testErrors.filter(e => e.severity === 'low');

    if (criticalErrors.length > 0) {
      report += `1. **🔴 Critical (严重)**: ${criticalErrors.length} 个问题 - 立即修复\n`;
      criticalErrors.forEach(error => {
        report += `   - ${error.page}: ${error.error}\n`;
      });
      report += `\n`;
    }

    if (highErrors.length > 0) {
      report += `2. **🟠 High (高)**: ${highErrors.length} 个问题 - 优先修复\n`;
      highErrors.forEach(error => {
        report += `   - ${error.page}: ${error.error}\n`;
      });
      report += `\n`;
    }

    if (mediumErrors.length > 0) {
      report += `3. **🟡 Medium (中)**: ${mediumErrors.length} 个问题 - 计划修复\n`;
    }

    if (lowErrors.length > 0) {
      report += `4. **🟢 Low (低)**: ${lowErrors.length} 个问题 - 后续优化\n`;
    }

    report += `\n`;
  }

  // 下一步行动
  report += `## 📝 下一步行动\n\n`;
  report += `- [ ] 修复所有Critical级别的问题\n`;
  report += `- [ ] 修复所有High级别的问题\n`;
  report += `- [ ] 处理警告信息\n`;
  report += `- [ ] 重新运行回归测试验证修复\n`;
  report += `- [ ] 更新测试用例\n\n`;

  report += `## 📸 测试截图\n\n`;
  report += `测试截图保存在: \`test-screenshots/\`\n\n`;

  report += `---\n\n`;
  report += `*报告生成时间: ${new Date().toISOString()}*\n`;
  report += `*测试工具: Puppeteer*\n`;

  const reportPath = path.join(__dirname, '../错误记录文档001.md');
  fs.writeFileSync(reportPath, report, 'utf-8');

  console.log(`✅ 报告已生成: ${reportPath}`);
  console.log(`\n📊 测试结果:`);
  console.log(`   ✅ 通过: ${testPassed.length}`);
  console.log(`   ❌ 失败: ${testErrors.length}`);
  console.log(`   ⚠️  警告: ${testWarnings.length}`);
  console.log(`   📝 总计: ${totalTests}\n`);
}

// 运行测试
runTests().catch(console.error);

