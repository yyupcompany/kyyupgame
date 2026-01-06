/**
 * Admin Centers 批量测试脚本
 * 快速测试所有30个PC端Centers页面
 */

// 定义所有要测试的页面路由（按优先级排序）
const PAGE_ROUTES = [
  // 第1批：核心导航和高优先级（10个）
  '/centers/index',
  '/centers/enrollment',
  '/centers/personnel',
  '/centers/task',
  '/centers/teaching',
  '/centers/activity',
  '/centers/marketing',
  '/centers/system',
  '/centers/attendance',
  '/centers/document-center',

  // 第2批：业务功能页面（10个）
  '/centers/finance',
  '/centers/customer-pool',
  '/centers/business',
  '/centers/inspection',
  '/centers/assessment',
  '/centers/media',
  '/centers/ai',
  '/centers/analytics',
  '/centers/call',
  '/centers/usage',

  // 第3批：文档和辅助页面（10个）
  '/centers/document-collaboration',
  '/centers/document-editor',
  '/centers/document-template',
  '/centers/document-instances',
  '/centers/document-statistics',
  '/centers/task/form',
  '/centers/template/detail',
  '/centers/marketing/performance'
];

// 快速页面测试函数
async function quickTestPage(route) {
  const startTime = Date.now();
  const result = {
    route,
    timestamp: new Date().toISOString(),
    status: 'unknown',
    loadTime: 0,
    errors: []
  };

  try {
    // 导航到页面
    await page.goto(`http://localhost:5173${route}`, {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // 等待页面稳定
    await page.waitForTimeout(2000);

    // 快速检查
    const pageData = await page.evaluate(() => {
      const main = document.querySelector('main');
      const buttons = document.querySelectorAll('button:not([disabled])');
      const errors = document.querySelectorAll('.el-message--error, .error');
      const title = document.title;

      return {
        hasMain: !!main,
        buttonCount: buttons.length,
        errorCount: errors.length,
        title: title,
        url: window.location.href
      };
    });

    result.loadTime = Date.now() - startTime;
    result.pageData = pageData;

    // 判断状态
    if (!pageData.hasMain) {
      result.status = 'FAIL';
      result.errors.push('P0: 空白页面 - 缺少main元素');
    } else if (pageData.errorCount > 0) {
      result.status = 'PARTIAL';
      result.errors.push(`P1: 发现${pageData.errorCount}个错误提示`);
    } else if (pageData.buttonCount === 0) {
      result.status = 'PARTIAL';
      result.errors.push('P2: 未发现任何按钮');
    } else {
      result.status = 'PASS';
    }

  } catch (error) {
    result.status = 'FAIL';
    result.errors.push(`P0: 页面加载失败 - ${error.message}`);
    result.loadTime = Date.now() - startTime;
  }

  return result;
}

// 批量测试所有页面
async function batchTestAllPages() {
  const results = [];

  console.log('🚀 开始批量测试所有Admin页面...');
  console.log(`📋 共${PAGE_ROUTES.length}个页面待测试\n`);

  for (let i = 0; i < PAGE_ROUTES.length; i++) {
    const route = PAGE_ROUTES[i];
    const pageNum = i + 1;

    console.log(`[${pageNum}/${PAGE_ROUTES.length}] 测试: ${route}`);

    const result = await quickTestPage(route);
    results.push(result);

    const icon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${icon} ${result.status} - ${result.loadTime}ms`);

    if (result.errors.length > 0) {
      result.errors.forEach(err => console.log(`   - ${err}`));
    }
  }

  // 生成报告
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;

  console.log('\n📊 测试完成！');
  console.log(`✅ 通过: ${passed}`);
  console.log(`⚠️  部分通过: ${partial}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed / results.length) * 100).toFixed(1)}%`);

  return {
    summary: { total: results.length, passed, failed, partial },
    results
  };
}

// 导出函数
window.ADMIN_BATCH_TEST = {
  PAGE_ROUTES,
  quickTestPage,
  batchTestAllPages
};

console.log('✅ Admin批量测试工具已加载');
console.log('📋 使用方法: ADMIN_BATCH_TEST.batchTestAllPages()');

