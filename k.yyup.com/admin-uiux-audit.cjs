/**
 * Admin UI/UX 布局审计脚本
 * 使用 Playwright 浏览器进行自动化测试
 */

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const { chromium } = require('playwright');

// 要审计的页面列表（Center 页面）
const PAGES_TO_TEST = [
  { path: '/centers/index', name: 'IndexCenter', role: 'admin' },
  { path: '/centers/enrollment', name: 'EnrollmentCenter', role: 'admin' },
  { path: '/centers/personnel', name: 'PersonnelCenter', role: 'admin' },
  { path: '/centers/task', name: 'TaskCenter', role: 'admin' },
  { path: '/centers/teaching', name: 'TeachingCenter', role: 'admin' },
  { path: '/centers/activity', name: 'ActivityCenter', role: 'admin' },
  { path: '/centers/marketing', name: 'MarketingCenter', role: 'admin' },
  { path: '/centers/system', name: 'SystemCenter', role: 'admin' },
  { path: '/centers/attendance', name: 'AttendanceCenter', role: 'admin' },
  { path: '/centers/document-center', name: 'DocumentCenter', role: 'admin' },
  { path: '/centers/finance', name: 'FinanceCenter', role: 'admin' },
  { path: '/centers/customer-pool', name: 'CustomerPoolCenter', role: 'admin' },
  { path: '/centers/business', name: 'BusinessCenter', role: 'admin' },
  { path: '/centers/inspection', name: 'InspectionCenter', role: 'admin' },
  { path: '/centers/assessment', name: 'AssessmentCenter', role: 'admin' },
  { path: '/centers/media', name: 'MediaCenter', role: 'admin' },
  { path: '/centers/ai', name: 'AICenter', role: 'admin' },
  { path: '/centers/analytics', name: 'AnalyticsCenter', role: 'admin' },
  { path: '/centers/call', name: 'CallCenter', role: 'admin' },
  { path: '/centers/usage', name: 'UsageCenter', role: 'admin' },
  { path: '/centers/document-collaboration', name: 'DocumentCollaboration', role: 'admin' },
  { path: '/centers/document-editor', name: 'DocumentEditor', role: 'admin' },
  { path: '/centers/document-template', name: 'DocumentTemplateCenter', role: 'admin' },
  { path: '/centers/document-instances', name: 'DocumentInstanceList', role: 'admin' },
  { path: '/centers/document-statistics', name: 'DocumentStatistics', role: 'admin' },
  { path: '/centers/task/form', name: 'TaskForm', role: 'admin' },
  { path: '/centers/marketing/performance', name: 'MarketingPerformance', role: 'admin' },
  { path: '/centers/template/detail', name: 'TemplateDetail', role: 'admin' },
];

// UI/UX 检查项目
const UI_UX_CHECKLIST = {
  layout: [
    '页面容器是否完整',
    '侧边栏是否正常显示',
    '头部导航是否正确',
    '内容区域是否居中',
    '响应式布局是否正常',
  ],
  styles: [
    '字体大小是否一致',
    '颜色主题是否统一',
    '间距是否规范',
    '边框样式是否一致',
    '按钮样式是否统一',
  ],
  components: [
    '表格样式是否一致',
    '表单布局是否规范',
    '卡片组件是否统一',
    '弹窗样式是否一致',
    '图标是否正常显示',
  ],
  accessibility: [
    '颜色对比度是否足够',
    '焦点状态是否可见',
    '交互元素是否可点击',
    '加载状态是否明显',
    '错误提示是否清晰',
  ],
};

/**
 * 登录管理员账号
 */
async function loginAdmin(page) {
  console.log('正在尝试登录管理员账号...');

  try {
    // 访问登录页面
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 检查是否已经登录（检查是否存在侧边栏）
    const sidebar = await page.$('.sidebar, .el-aside, [class*="sidebar"]');
    if (sidebar) {
      console.log('已经登录，跳过登录步骤');
      return true;
    }

    // 查找登录表单
    const usernameInput = await page.$('input[type="text"], input[name="username"], .el-input__inner[type="text"]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    const loginButton = await page.$('button[type="submit"], .el-button--primary');

    if (usernameInput && passwordInput && loginButton) {
      // 使用测试账号登录
      await usernameInput.fill('test_admin');
      await passwordInput.fill('test123456');
      await loginButton.click();

      // 等待登录完成
      await page.waitForTimeout(2000);

      // 验证登录成功
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('登录可能失败，尝试其他账号...');
        return false;
      }

      console.log('登录成功');
      return true;
    }

    console.log('未找到登录表单，可能已登录');
    return true;
  } catch (error) {
    console.error('登录过程出错:', error.message);
    return false;
  }
}

/**
 * 检查页面布局
 */
async function checkPageLayout(page, pageInfo) {
  const results = {
    page: pageInfo.name,
    path: pageInfo.path,
    issues: [],
    score: 100,
  };

  try {
    // 1. 检查页面是否加载
    const body = await page.$('body');
    if (!body) {
      results.issues.push('页面 body 元素不存在');
      results.score = 0;
      return results;
    }

    // 2. 检查页面高度
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    if (pageHeight < 100) {
      results.issues.push('页面内容可能为空');
      results.score -= 20;
    }

    // 3. 检查主要容器
    const mainContent = await page.$('.main-content, .el-main, [class*="main-content"], [class*="content"]');
    if (!mainContent) {
      results.issues.push('未找到主要内容容器');
      results.score -= 15;
    }

    // 4. 检查侧边栏
    const sidebar = await page.$('.sidebar, .el-aside, [class*="sidebar"]');
    if (!sidebar) {
      results.issues.push('未找到侧边栏');
      results.score -= 10;
    }

    // 5. 检查头部
    const header = await page.$('.header, .el-header, [class*="header"], [class*="navbar"]');
    if (!header) {
      results.issues.push('未找到头部导航');
      results.score -= 5;
    }

    // 6. 检查是否存在明显的布局问题
    const overlappingElements = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const overlaps = [];

      for (let i = 0; i < allElements.length; i++) {
        const el1 = allElements[i].getBoundingClientRect();
        if (el1.width === 0 || el1.height === 0) continue;

        for (let j = i + 1; j < allElements.length; j++) {
          const el2 = allElements[j].getBoundingClientRect();
          if (el2.width === 0 || el2.height === 0) continue;

          // 检查重叠
          const overlapX = !(el1.right < el2.left || el1.left > el2.right);
          const overlapY = !(el1.bottom < el2.top || el1.top > el2.bottom);

          if (overlapX && overlapY) {
            const overlapArea = Math.max(0, Math.min(el1.right, el2.right) - Math.max(el1.left, el2.left)) *
                              Math.max(0, Math.min(el1.bottom, el2.bottom) - Math.max(el1.top, el2.top));

            if (overlapArea > 1000) { // 重叠面积大于1000px²
              overlaps.push({
                tag1: allElements[i].tagName,
                tag2: allElements[j].tagName,
                overlapArea: overlapArea.toFixed(2)
              });
            }
          }
        }
      }

      return overlaps.slice(0, 5); // 只返回前5个
    });

    if (overlappingElements.length > 0) {
      results.issues.push(`发现 ${overlappingElements.length} 个可能重叠的元素`);
      results.score -= overlappingElements.length * 5;
    }

    // 7. 检查是否存在滚动条异常
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasHorizontalScroll) {
      results.issues.push('页面存在异常的水平滚动');
      results.score -= 5;
    }

  } catch (error) {
    results.issues.push(`检查过程出错: ${error.message}`);
    results.score -= 10;
  }

  return results;
}

/**
 * 检查样式一致性
 */
async function checkStyleConsistency(page, pageInfo) {
  const results = {
    page: pageInfo.name,
    path: pageInfo.path,
    styles: {
      fonts: [],
      colors: [],
      spacing: [],
      components: [],
    },
    issues: [],
  };

  try {
    // 1. 获取所有元素的字体信息
    const fontInfo = await page.evaluate(() => {
      const fonts = new Set();
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.fontSize && style.fontSize !== '0px') {
          fonts.add(style.fontSize);
        }
      });
      return Array.from(fonts).slice(0, 10); // 最多返回10种字体大小
    });
    results.styles.fonts = fontInfo;

    // 2. 获取所有元素的颜色信息
    const colorInfo = await page.evaluate(() => {
      const colors = new Set();
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.color && style.color !== 'rgb(0, 0, 0)') {
          colors.add(style.color);
        }
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'rgb(255, 255, 255)') {
          colors.add(`bg:${style.backgroundColor}`);
        }
      });
      return Array.from(colors).slice(0, 15); // 最多返回15种颜色
    });
    results.styles.colors = colorInfo;

    // 3. 检查按钮样式一致性
    const buttonStyles = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, .el-button, [class*="btn"]');
      const styles = new Map();

      buttons.forEach((btn, index) => {
        const style = window.getComputedStyle(btn);
        const key = `${style.backgroundColor}-${style.color}-${style.borderRadius}`;
        if (!styles.has(key)) {
          styles.set(key, { count: 0, example: btn.tagName });
        }
        styles.get(key).count++;
      });

      return Object.fromEntries(styles);
    });
    results.styles.components.buttons = buttonStyles;

    // 4. 检查表格样式
    const tableStyles = await page.evaluate(() => {
      const tables = document.querySelectorAll('.el-table, table, [class*="table"]');
      const styles = [];

      tables.forEach(table => {
        const style = window.getComputedStyle(table);
        styles.push({
          hasBorder: style.borderStyle !== 'none',
          borderColor: style.borderColor,
        });
      });

      return styles;
    });
    results.styles.components.tables = tableStyles;

    // 5. 检查卡片样式
    const cardStyles = await page.evaluate(() => {
      const cards = document.querySelectorAll('.el-card, .card, [class*="card"]');
      return {
        count: cards.length,
        styles: cards.length > 0 ? 'found' : 'not-found'
      };
    });
    results.styles.components.cards = cardStyles;

  } catch (error) {
    results.issues.push(`样式检查出错: ${error.message}`);
  }

  return results;
}

/**
 * 检查响应式布局
 */
async function checkResponsiveLayout(page) {
  const results = {
    breakpoints: [],
    issues: [],
  };

  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop Large' },
    { width: 1366, height: 768, name: 'Desktop Normal' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' },
  ];

  for (const viewport of viewports) {
    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      const pageInfo = await page.evaluate((width) => {
        // 检查内容是否溢出
        const overflowX = document.documentElement.scrollWidth > width;
        const container = document.querySelector('.el-container, #app, main');
        const containerWidth = container ? container.getBoundingClientRect().width : 0;

        return {
          overflowX,
          containerWidth: Math.round(containerWidth),
          scrollWidth: document.documentElement.scrollWidth,
        };
      }, viewport.width);

      results.breakpoints.push({
        viewport: viewport.name,
        width: viewport.width,
        containerWidth: pageInfo.containerWidth,
        hasOverflow: pageInfo.overflowX,
      });

      if (pageInfo.overflowX) {
        results.issues.push(`${viewport.name}: 存在水平溢出`);
      }

    } catch (error) {
      results.issues.push(`${viewport.name} 检查出错: ${error.message}`);
    }
  }

  // 恢复默认视口
  await page.setViewportSize({ width: 1280, height: 720 });

  return results;
}

/**
 * 检查无障碍访问
 */
async function checkAccessibility(page) {
  const results = {
    issues: [],
    score: 100,
  };

  try {
    // 1. 检查图片 alt 属性
    const missingAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let count = 0;
      images.forEach(img => {
        if (!img.alt || img.alt.trim() === '') {
          count++;
        }
      });
      return count;
    });

    if (missingAlt > 0) {
      results.issues.push(`${missingAlt} 个图片缺少 alt 属性`);
      results.score -= missingAlt * 2;
    }

    // 2. 检查按钮的可点击区域
    const smallButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, .el-button, [role="button"]');
      let count = 0;
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          count++;
        }
      });
      return count;
    });

    if (smallButtons > 0) {
      results.issues.push(`${smallButtons} 个按钮尺寸小于 44x44px`);
      results.score -= smallButtons * 3;
    }

    // 3. 检查表单标签
    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      let count = 0;
      inputs.forEach(input => {
        const id = input.id;
        if (!id || !document.querySelector(`label[for="${id}"]`)) {
          count++;
        }
      });
      return count;
    });

    if (inputsWithoutLabels > 0) {
      results.issues.push(`${inputsWithoutLabels} 个表单元素缺少关联标签`);
      results.score -= inputsWithoutLabels * 5;
    }

    // 4. 检查颜色对比度（简单的检查）
    const lowContrast = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, div, a, h1, h2, h3, h4, h5, h6');
      let count = 0;

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // 简单的对比度检查（如果是浅色背景上的浅色文字）
        if (color.includes('rgba') && color.includes(', 0.5') || color.includes(', 0.6')) {
          count++;
        }
      });

      return Math.min(count, 10); // 最多报告10个
    });

    if (lowContrast > 0) {
      results.issues.push(`${lowContrast} 个元素可能存在低对比度问题`);
      results.score -= lowContrast * 2;
    }

  } catch (error) {
    results.issues.push(`无障碍检查出错: ${error.message}`);
    results.score -= 10;
  }

  return results;
}

/**
 * 测量页面性能
 */
async function measurePerformance(page) {
  const results = {
    timing: {},
    metrics: {},
  };

  try {
    const perfData = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];

      return {
        // 时间指标
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseStart - timing.requestStart,
        domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
        fullPageLoad: timing.loadEventEnd - timing.navigationStart,

        // 资源指标
        resourceCount: performance.getEntriesByType('resource').length,
        totalResourceSize: performance.getEntriesByType('resource')
          .reduce((sum, r) => sum + (r.transferSize || 0), 0),
      };
    });

    results.timing = perfData;

    // 计算性能评分
    let perfScore = 100;
    if (perfData.fullPageLoad > 3000) perfScore -= 10;
    if (perfData.fullPageLoad > 5000) perfScore -= 10;
    if (perfData.serverResponse > 1000) perfScore -= 10;
    if (perfData.resourceCount > 100) perfScore -= 5;

    results.metrics = {
      score: Math.max(0, perfScore),
      loadTime: `${(perfData.fullPageLoad / 1000).toFixed(2)}s`,
      resourceCount: perfData.resourceCount,
    };

  } catch (error) {
    results.metrics = { error: error.message };
  }

  return results;
}

/**
 * 检测控制台错误
 */
async function checkConsoleErrors(page) {
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  // 等待一段时间收集错误
  await page.waitForTimeout(2000);

  // 过滤掉无关的错误
  const relevantErrors = errors.filter(err => {
    const ignorePatterns = [
      'favicon.ico',
      'ResizeObserver',
      'layout.css',
      '404',
    ];
    return !ignorePatterns.some(pattern => err.toLowerCase().includes(pattern.toLowerCase()));
  });

  return {
    errors: relevantErrors,
    warnings: warnings.slice(0, 10), // 最多返回10个警告
    errorCount: relevantErrors.length,
  };
}

/**
 * 主测试函数
 */
async function runFullAudit() {
  console.log('==========================================');
  console.log('Admin UI/UX 布局审计测试');
  console.log('==========================================');
  console.log(`测试地址: ${BASE_URL}`);
  console.log(`测试时间: ${new Date().toISOString()}`);
  console.log(`待测试页面数: ${PAGES_TO_TEST.length}`);
  console.log('==========================================\n');

  const report = {
    summary: {
      totalPages: PAGES_TO_TEST.length,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
    layoutResults: [],
    styleResults: [],
    responsiveResults: [],
    accessibilityResults: [],
    performanceResults: [],
    consoleErrors: [],
    recommendations: [],
  };

  // 启动浏览器
  console.log('正在启动浏览器...');
  const browser = await chromium.launch({
    headless: true,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // 登录
  const loginSuccess = await loginAdmin(page);
  if (!loginSuccess) {
    console.log('警告: 登录可能失败，但仍将继续测试');
  }

  // 测试每个页面
  for (let i = 0; i < PAGES_TO_TEST.length; i++) {
    const pageInfo = PAGES_TO_TEST[i];
    console.log(`\n[${i + 1}/${PAGES_TO_TEST.length}] 测试页面: ${pageInfo.name} (${pageInfo.path})`);

    try {
      // 导航到页面
      await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // 等待页面加载
      await page.waitForTimeout(2000);

      // 检查页面是否正常加载
      const bodyContent = await page.evaluate(() => document.body.innerHTML.length);
      if (bodyContent < 100) {
        console.log(`  ⚠️ 页面内容为空或加载失败`);
        report.summary.failed++;
        continue;
      }

      // 1. 检查页面布局
      console.log('  - 检查页面布局...');
      const layoutResult = await checkPageLayout(page, pageInfo);
      report.layoutResults.push(layoutResult);

      if (layoutResult.issues.length > 0) {
        console.log(`    发现 ${layoutResult.issues.length} 个布局问题`);
        layoutResult.issues.forEach(issue => console.log(`    • ${issue}`));
      }

      // 2. 检查样式一致性
      console.log('  - 检查样式一致性...');
      const styleResult = await checkStyleConsistency(page, pageInfo);
      report.styleResults.push(styleResult);

      // 3. 检查响应式布局
      console.log('  - 检查响应式布局...');
      const responsiveResult = await checkResponsiveLayout(page);
      report.responsiveResults.push({
        page: pageInfo.name,
        ...responsiveResult
      });

      // 4. 检查无障碍访问
      console.log('  - 检查无障碍访问...');
      const accessibilityResult = await checkAccessibility(page);
      report.accessibilityResults.push({
        page: pageInfo.name,
        ...accessibilityResult
      });

      // 5. 测量性能
      console.log('  - 测量页面性能...');
      const performanceResult = await measurePerformance(page);
      report.performanceResults.push({
        page: pageInfo.name,
        ...performanceResult
      });

      // 6. 检测控制台错误
      console.log('  - 检测控制台错误...');
      const consoleResult = await checkConsoleErrors(page);
      report.consoleErrors.push({
        page: pageInfo.name,
        ...consoleResult
      });

      if (consoleResult.errorCount > 0) {
        console.log(`    发现 ${consoleResult.errorCount} 个控制台错误`);
      }

      // 更新汇总
      if (layoutResult.score >= 80 && consoleResult.errorCount === 0) {
        report.summary.passed++;
        console.log(`  ✅ 通过 (布局评分: ${layoutResult.score})`);
      } else {
        report.summary.failed++;
        console.log(`  ❌ 需要关注 (布局评分: ${layoutResult.score}, 错误数: ${consoleResult.errorCount})`);
      }

    } catch (error) {
      console.error(`  ❌ 测试出错: ${error.message}`);
      report.summary.failed++;
      report.consoleErrors.push({
        page: pageInfo.name,
        errors: [error.message],
        errorCount: 1,
      });
    }
  }

  // 关闭浏览器
  await browser.close();

  // 生成汇总建议
  report.recommendations = generateRecommendations(report);

  // 输出报告
  console.log('\n==========================================');
  console.log('审计报告汇总');
  console.log('==========================================');
  console.log(`总页面数: ${report.summary.totalPages}`);
  console.log(`通过: ${report.summary.passed}`);
  console.log(`需关注: ${report.summary.failed}`);
  console.log(`通过率: ${((report.summary.passed / report.summary.totalPages) * 100).toFixed(1)}%`);

  // 保存报告
  const fs = require('fs-extra');
  const reportPath = './ADMIN-UIUX-AUDIT-REPORT.md';
  await fs.writeFile(reportPath, generateMarkdownReport(report));
  console.log(`\n详细报告已保存到: ${reportPath}`);

  return report;
}

/**
 * 生成建议
 */
function generateRecommendations(report) {
  const recommendations = [];

  // 统计常见问题
  const layoutIssueCount = report.layoutResults.reduce((sum, r) => sum + r.issues.length, 0);
  const accessibilityIssueCount = report.accessibilityResults.reduce((sum, r) => sum + r.issues.length, 0);
  const errorCount = report.consoleErrors.reduce((sum, r) => sum + r.errorCount, 0);

  // 布局建议
  if (layoutIssueCount > 5) {
    recommendations.push({
      category: '布局优化',
      priority: '高',
      description: `${layoutIssueCount} 个页面发现布局问题，建议统一检查页面容器结构和CSS样式`,
      action: '检查所有页面的 .el-container、.el-main 容器是否正确嵌套',
    });
  }

  // 无障碍建议
  if (accessibilityIssueCount > 10) {
    recommendations.push({
      category: '无障碍优化',
      priority: '中',
      description: `${accessibilityIssueCount} 个无障碍问题，建议完善表单标签和图片alt属性`,
      action: '运行无障碍检查工具，修复所有缺少alt属性的图片和未关联标签的表单元素',
    });
  }

  // 错误建议
  if (errorCount > 0) {
    recommendations.push({
      category: '错误修复',
      priority: '高',
      description: `测试中发现 ${errorCount} 个控制台错误，需要立即修复`,
      action: '检查并修复所有JavaScript错误，确保API调用正常',
    });
  }

  // 样式一致性建议
  const uniqueFonts = new Set();
  const uniqueColors = new Set();
  report.styleResults.forEach(r => {
    r.styles.fonts.forEach(f => uniqueFonts.add(f));
    r.styles.colors.slice(0, 5).forEach(c => uniqueColors.add(c));
  });

  if (uniqueFonts.size > 8) {
    recommendations.push({
      category: '样式统一',
      priority: '中',
      description: `发现 ${uniqueFonts.size} 种不同的字体大小，建议统一设计系统`,
      action: '定义统一的设计tokens，限制字体大小种类',
    });
  }

  return recommendations;
}

/**
 * 生成 Markdown 报告
 */
function generateMarkdownReport(report) {
  let md = `# Admin UI/UX 布局审计报告\n\n`;
  md += `**审计时间**: ${new Date().toISOString()}\n`;
  md += `**测试地址**: ${BASE_URL}\n`;
  md += `**测试页面数**: ${report.summary.totalPages}\n\n`;

  // 执行摘要
  md += `## 执行摘要\n\n`;
  md += `| 指标 | 数值 |\n`;
  md += `|------|------|\n`;
  md += `| 总页面数 | ${report.summary.totalPages} |\n`;
  md += `| 通过 | ${report.summary.passed} |\n`;
  md += `| 需关注 | ${report.summary.failed} |\n`;
  md += `| 通过率 | ${((report.summary.passed / report.summary.totalPages) * 100).toFixed(1)}% |\n\n`;

  // 布局检查结果
  md += `## 布局检查结果\n\n`;
  md += `| 页面 | 布局评分 | 问题数 | 状态 |\n`;
  md += `|------|----------|--------|------|\n`;
  report.layoutResults.forEach(r => {
    const status = r.score >= 80 ? '✅ 通过' : '⚠️ 需关注';
    md += `| ${r.page} | ${r.score}/100 | ${r.issues.length} | ${status} |\n`;
  });

  // 样式一致性分析
  md += `\n## 样式一致性分析\n\n`;
  md += `### 字体大小分布\n\n`;
  const fontCounts = {};
  report.styleResults.forEach(r => {
    r.styles.fonts.forEach(f => {
      fontCounts[f] = (fontCounts[f] || 0) + 1;
    });
  });
  Object.entries(fontCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([font, count]) => {
    md += `- \`${font}\`: ${count} 个页面使用\n`;
  });

  // 响应式布局检查
  md += `\n## 响应式布局检查\n\n`;
  const viewportIssues = {};
  report.responsiveResults.forEach(r => {
    r.breakpoints.forEach(bp => {
      if (bp.hasOverflow) {
        viewportIssues[bp.name] = (viewportIssues[bp.name] || 0) + 1;
      }
    });
  });

  if (Object.keys(viewportIssues).length > 0) {
    md += `### 存在溢出的视口\n\n`;
    Object.entries(viewportIssues).forEach(([name, count]) => {
      md += `- ${name}: ${count} 个页面\n`;
    });
  } else {
    md += `✅ 所有页面在各个视口下表现正常\n`;
  }

  // 无障碍检查
  md += `\n## 无障碍检查结果\n\n`;
  let totalA11yIssues = 0;
  report.accessibilityResults.forEach(r => {
    totalA11yIssues += r.issues.length;
  });

  if (totalA11yIssues > 0) {
    md += `发现 **${totalA11yIssues}** 个无障碍问题：\n\n`;
    report.accessibilityResults.forEach(r => {
      if (r.issues.length > 0) {
        md += `### ${r.page}\n`;
        r.issues.forEach(issue => {
          md += `- ${issue}\n`;
        });
      }
    });
  } else {
    md += `✅ 所有页面无障碍检查通过\n`;
  }

  // 性能指标
  md += `\n## 性能指标\n\n`;
  const avgScore = report.performanceResults.reduce((sum, r) => sum + (r.metrics.score || 0), 0) / report.performanceResults.length;
  md += `平均性能评分: **${avgScore.toFixed(1)}/100**\n\n`;

  md += `| 页面 | 评分 | 加载时间 | 资源数 |\n`;
  md += `|------|------|----------|--------|\n`;
  report.performanceResults.forEach(r => {
    md += `| ${r.page} | ${r.metrics.score || 'N/A'} | ${r.metrics.loadTime || 'N/A'} | ${r.metrics.resourceCount || 'N/A'} |\n`;
  });

  // 控制台错误
  md += `\n## 控制台错误\n\n`;
  const totalErrors = report.consoleErrors.reduce((sum, r) => sum + r.errorCount, 0);
  if (totalErrors > 0) {
    md += `发现 **${totalErrors}** 个控制台错误：\n\n`;
    report.consoleErrors.filter(r => r.errorCount > 0).forEach(r => {
      md += `### ${r.page}\n`;
      r.errors.forEach(err => {
        md += `- \`${err.substring(0, 200)}\`\n`;
      });
    });
  } else {
    md += `✅ 无控制台错误\n`;
  }

  // 改进建议
  md += `\n## 改进建议\n\n`;
  report.recommendations.forEach(rec => {
    md += `### [${rec.priority}] ${rec.category}\n\n`;
    md += `**问题**: ${rec.description}\n\n`;
    md += `**建议**: ${rec.action}\n\n`;
  });

  return md;
}

// 导出函数供 Playwright MCP 使用
module.exports = {
  runFullAudit,
  checkPageLayout,
  checkStyleConsistency,
  checkResponsiveLayout,
  checkAccessibility,
  measurePerformance,
  checkConsoleErrors,
  UI_UX_CHECKLIST,
  PAGES_TO_TEST,
};

// 如果直接运行
if (require.main === module) {
  runFullAudit()
    .then(report => {
      console.log('\n审计完成!');
      process.exit(0);
    })
    .catch(error => {
      console.error('审计失败:', error);
      process.exit(1);
    });
}
