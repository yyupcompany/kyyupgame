/**
 * 侧边栏错误检测脚本
 * 使用Playwright自动化测试教师和家长中心的所有侧边栏页面
 * 检测控制台错误、网络错误和Vue警告
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置参数
const CONFIG = {
  roles: ['teacher', 'parent'],
  baseUrl: 'http://localhost:5173',
  headless: true,
  outputPath: './error-reports',
  waitTime: 2000,
  credentials: {
    teacher: { username: 'teacher', password: '123456' },
    parent: { username: 'test_parent', password: '123456' }
  }
};

/**
 * 主函数
 */
async function main() {
  console.log('🚀 启动侧边栏错误检测脚本...\n');

  // 创建输出目录
  if (!fs.existsSync(CONFIG.outputPath)) {
    fs.mkdirSync(CONFIG.outputPath, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: CONFIG.headless,
    devtools: false
  });

  try {
    for (const role of CONFIG.roles) {
      console.log(`\n📋 开始检测 ${role} 角色的页面...\n`);
      const report = await testRole(browser, role);
      saveReport(report, role);
      printSummary(report);
    }
  } finally {
    await browser.close();
    console.log('\n✅ 检测脚本执行完成');
  }
}

/**
 * 测试指定角色的所有页面
 */
async function testRole(browser, role) {
  const context = await browser.newContext();
  const page = await context.newPage();

  // 错误收集器
  const errors = [];
  const consoleMessages = [];

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error' || type === 'warning') {
      consoleMessages.push({
        type: 'console',
        level: type,
        message: text,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 监听网络响应
  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      errors.push({
        type: 'network',
        level: 'error',
        statusCode: status,
        method: response.request().method(),
        url: response.url(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    errors.push({
      type: 'page',
      level: 'error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  // 登录
  await login(page, role);

  // 获取侧边栏菜单
  const menuItems = await getMenuItems(page, role);
  console.log(`   找到 ${menuItems.length} 个菜单项`);

  // 测试每个页面
  const pages = [];
  for (const menu of menuItems) {
    console.log(`   ✓ 测试页面: ${menu.name} (${menu.href})`);
    
    const pageErrors = [];
    const errorCountBefore = errors.length + consoleMessages.length;

    try {
      await page.goto(`${CONFIG.baseUrl}${menu.href}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(CONFIG.waitTime);
    } catch (error) {
      pageErrors.push({
        type: 'navigation',
        level: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    const errorCountAfter = errors.length + consoleMessages.length;
    const pageErrorCount = errorCountAfter - errorCountBefore;

    pages.push({
      name: menu.name,
      path: menu.href,
      url: `${CONFIG.baseUrl}${menu.href}`,
      errors: [...pageErrors],
      errorCount: pageErrorCount
    });
  }

  // 合并所有错误到对应页面
  const allErrors = [...errors, ...consoleMessages];
  pages.forEach(page => {
    // 简化：将所有错误归到对应页面（实际应该更精确）
    if (page.errorCount > 0) {
      const startIdx = pages.slice(0, pages.indexOf(page)).reduce((sum, p) => sum + p.errorCount, 0);
      page.errors = allErrors.slice(startIdx, startIdx + page.errorCount);
    }
  });

  await context.close();

  // 生成报告
  const errorSummary = {
    network404: allErrors.filter(e => e.statusCode === 404).length,
    network403: allErrors.filter(e => e.statusCode === 403).length,
    network500: allErrors.filter(e => e.statusCode === 500).length,
    consoleError: allErrors.filter(e => e.type === 'console' && e.level === 'error').length,
    consoleWarning: allErrors.filter(e => e.type === 'console' && e.level === 'warning').length
  };

  return {
    role,
    testTime: new Date().toISOString(),
    baseUrl: CONFIG.baseUrl,
    totalPages: pages.length,
    totalErrors: allErrors.length,
    pages,
    errorSummary
  };
}

/**
 * 登录
 */
async function login(page, role) {
  const cred = CONFIG.credentials[role];
  
  await page.goto(`${CONFIG.baseUrl}/login`);
  await page.waitForTimeout(1000);

  // 点击快捷登录按钮
  const buttonSelector = role === 'teacher' 
    ? 'button.teacher-btn' 
    : 'button.parent-btn';
  
  try {
    await page.click(buttonSelector);
    await page.waitForTimeout(2000);
    console.log(`   ✓ ${role} 登录成功`);
  } catch (error) {
    console.error(`   ✗ ${role} 登录失败:`, error.message);
    throw error;
  }
}

/**
 * 获取侧边栏菜单项
 */
async function getMenuItems(page, role) {
  const prefix = role === 'teacher' ? '/teacher-center/' : '/parent-center/';
  
  try {
    const menuItems = await page.$$eval(`nav a[href^="${prefix}"]`, links =>
      links.map(link => ({
        name: link.textContent.trim(),
        href: link.getAttribute('href')
      }))
    );
    
    // 去重
    const unique = [];
    const seen = new Set();
    for (const item of menuItems) {
      if (!seen.has(item.href)) {
        seen.add(item.href);
        unique.push(item);
      }
    }
    
    return unique;
  } catch (error) {
    console.error('   ✗ 获取菜单失败:', error.message);
    return [];
  }
}

/**
 * 保存报告
 */
function saveReport(report, role) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = path.join(CONFIG.outputPath, `${role}-center-errors-${timestamp}.json`);
  
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  console.log(`\n   💾 报告已保存: ${filename}`);
}

/**
 * 打印摘要
 */
function printSummary(report) {
  console.log('\n   📊 错误统计:');
  console.log(`      - 404错误: ${report.errorSummary.network404} 个`);
  console.log(`      - 403错误: ${report.errorSummary.network403} 个`);
  console.log(`      - 500错误: ${report.errorSummary.network500} 个`);
  console.log(`      - 控制台错误: ${report.errorSummary.consoleError} 个`);
  console.log(`      - 控制台警告: ${report.errorSummary.consoleWarning} 个`);
  console.log(`      - 总计: ${report.totalErrors} 个错误`);
}

// 执行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
