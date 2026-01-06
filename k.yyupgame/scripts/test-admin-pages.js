/**
 * Admin Centers 页面自动化测试脚本
 * 使用 Playwright 测试所有 admin 页面
 */

const TEST_RESULTS = [];
const BASE_URL = 'http://localhost:5173';

// 定义所有要测试的页面
const PAGES_TO_TEST = [
  // 核心导航和高优先级页面
  { name: 'CentersIndex', route: '/centers/index', priority: 'high', category: '导航' },
  { name: 'EnrollmentCenter', route: '/centers/enrollment', priority: 'high', category: '基础管理' },
  { name: 'PersonnelCenter', route: '/centers/personnel', priority: 'high', category: '基础管理' },
  { name: 'TaskCenter', route: '/centers/task', priority: 'high', category: '业务管理' },
  { name: 'TeachingCenter', route: '/centers/teaching', priority: 'high', category: '教学管理' },
  { name: 'ActivityCenter', route: '/centers/activity', priority: 'high', category: '业务管理' },
  { name: 'MarketingCenter', route: '/centers/marketing', priority: 'high', category: '业务管理' },
  { name: 'SystemCenter', route: '/centers/system', priority: 'high', category: '系统管理' },
  { name: 'AttendanceCenter', route: '/centers/attendance', priority: 'high', category: '基础管理' },
  { name: 'DocumentCenter', route: '/centers/document-center', priority: 'high', category: '文档管理' },

  // 第二优先级页面
  { name: 'FinanceCenter', route: '/centers/finance', priority: 'medium', category: '财务管理' },
  { name: 'CustomerPoolCenter', route: '/centers/customer-pool', priority: 'medium', category: '业务管理' },
  { name: 'BusinessCenter', route: '/centers/business', priority: 'medium', category: '业务管理' },
  { name: 'InspectionCenter', route: '/centers/inspection', priority: 'medium', category: '业务管理' },
  { name: 'AssessmentCenter', route: '/centers/assessment', priority: 'medium', category: '教学管理' },
  { name: 'MediaCenter', route: '/centers/media', priority: 'medium', category: '教学管理' },
  { name: 'AICenter', route: '/centers/ai', priority: 'medium', category: 'AI智能' },
  { name: 'AnalyticsCenter', route: '/centers/analytics', priority: 'medium', category: '数据分析' },
  { name: 'CallCenter', route: '/centers/call', priority: 'low', category: '业务管理' },
  { name: 'UsageCenter', route: '/centers/usage', priority: 'low', category: '系统管理' },

  // 文档管理页面
  { name: 'DocumentCollaboration', route: '/centers/document-collaboration', priority: 'medium', category: '文档管理' },
  { name: 'DocumentEditor', route: '/centers/document-editor', priority: 'medium', category: '文档管理' },
  { name: 'DocumentTemplateCenter', route: '/centers/document-template', priority: 'low', category: '文档管理' },
  { name: 'DocumentInstanceList', route: '/centers/document-instances', priority: 'low', category: '文档管理' },
  { name: 'DocumentStatistics', route: '/centers/document-statistics', priority: 'low', category: '文档管理' },

  // 辅助工具页面
  { name: 'TaskForm', route: '/centers/task/form', priority: 'medium', category: '任务管理' },
  { name: 'TemplateDetail', route: '/centers/template/detail', priority: 'low', category: '文档管理' },
  { name: 'MarketingPerformance', route: '/centers/marketing/performance', priority: 'low', category: '营销管理' },
];

// 测试单个页面
async function testPage(page, pageConfig) {
  const url = `${BASE_URL}${pageConfig.route}`;
  const result = {
    name: pageConfig.name,
    route: pageConfig.route,
    category: pageConfig.category,
    priority: pageConfig.priority,
    timestamp: new Date().toISOString(),
    status: 'pending',
    checks: {},
    issues: [],
    consoleErrors: [],
    networkErrors: []
  };

  try {
    // 1. 导航到页面
    console.log(`🔍 测试页面: ${pageConfig.name} (${pageConfig.route})`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

    // 2. 等待页面稳定
    await page.waitForTimeout(2000);

    // 3. 检查页面标题
    const title = await page.title();
    result.checks.pageTitle = title !== '';

    // 4. 检查页面内容
    const content = await page.content();
    result.checks.hasContent = content.length > 1000;

    // 5. 检查是否有主要内容元素
    const mainContent = await page.$('main');
    result.checks.hasMainContent = mainContent !== null;

    // 6. 检查是否有错误提示（500错误等）
    const errorElements = await page.$$('.el-message--error, .error, .alert-danger');
    result.checks.hasVisibleErrors = errorElements.length === 0;

    // 7. 检查按钮元素
    const buttons = await page.$$('button:not([disabled]), .el-button:not(.is-disabled)');
    result.checks.buttonCount = buttons.length;

    // 8. 检查列表/表格元素
    const tables = await page.$$('table, .el-table');
    const lists = await page.$$('ul, ol, .el-list');
    result.checks.dataDisplayCount = tables.length + lists.length;

    // 9. 检查卡片元素
    const cards = await page.$$('.el-card, .card, .stat-card');
    result.checks.cardCount = cards.length;

    // 10. 检查是否有加载状态
    const loadingElements = await page.$('.el-loading, .loading, [class*="loading"]');
    result.checks.isLoading = loadingElements.length > 0;

    // 11. 检查页面是否有空白状态
    const emptyStates = await page.$('.el-empty, .empty, [class*="empty"]');
    result.checks.hasEmptyState = emptyStates.length > 0;

    // 12. 判断页面状态
    if (!result.checks.hasContent) {
      result.status = 'fail';
      result.issues.push('P0: 空白页面 - 页面内容不足');
    } else if (!result.checks.hasMainContent) {
      result.status = 'fail';
      result.issues.push('P0: 页面结构异常 - 缺少main元素');
    } else if (errorElements.length > 0) {
      result.status = 'partial';
      result.issues.push(`P1: 发现${errorElements.length}个错误提示`);
    } else if (result.checks.buttonCount === 0) {
      result.status = 'partial';
      result.issues.push('P2: 未发现任何可点击按钮');
    } else {
      result.status = 'pass';
    }

  } catch (error) {
    result.status = 'fail';
    result.issues.push(`P0: 页面加载失败 - ${error.message}`);
  }

  return result;
}

// 生成测试报告
function generateReport(results) {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const partial = results.filter(r => r.status === 'partial').length;
  const total = results.length;

  const report = {
    summary: {
      total,
      passed,
      failed,
      partial,
      passRate: ((passed / total) * 100).toFixed(2) + '%',
      timestamp: new Date().toISOString()
    },
    failedPages: results.filter(r => r.status === 'fail').map(r => ({
      name: r.name,
      route: r.route,
      issues: r.issues
    })),
    partialPages: results.filter(r => r.status === 'partial').map(r => ({
      name: r.name,
      route: r.route,
      issues: r.issues
    })),
    allResults: results
  };

  return report;
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PAGES_TO_TEST, testPage, generateReport };
}

// 在浏览器控制台中运行
if (typeof window !== 'undefined') {
  window.ADMIN_TEST = { PAGES_TO_TEST, testPage, generateReport };
  console.log('✅ Admin测试工具已加载');
  console.log('📋 可用命令:');
  console.log('  - ADMIN_TEST.PAGES_TO_TEST: 查看所有待测试页面');
  console.log('  - ADMIN_TEST.generateReport(results): 生成测试报告');
}
