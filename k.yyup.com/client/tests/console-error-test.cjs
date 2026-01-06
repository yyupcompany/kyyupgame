/**
 * 控制台错误检测测试
 * 测试 admin、园长、老师、家长 四个角色的侧边栏页面
 * 检测重复属性、Vue编译错误和其他控制台错误
 */

const { chromium } = require('playwright');

const ROLES = {
  admin: {
    username: 'admin',
    password: 'admin123',
    expectedRoutes: [
      '/centers/analytics',
      '/centers/finance',
      '/centers/system',
      '/centers/enrollment',
      '/centers/marketing',
      '/centers/business',
      '/centers/ai-center',
      '/centers/teacher-center',
      '/centers/call-center',
      '/centers/document-collaboration',
      '/centers/task-center',
      '/aiassistant',
      '/dashboard'
    ]
  },
  principal: {
    username: 'principal',
    password: 'principal123',
    expectedRoutes: [
      '/dashboard',
      '/centers/analytics',
      '/centers/enrollment',
      '/centers/marketing',
      '/centers/teacher-center',
      '/aiassistant'
    ]
  },
  teacher: {
    username: 'teacher',
    password: 'teacher123',
    expectedRoutes: [
      '/teacher-center/dashboard',
      '/teacher-center/teaching',
      '/teacher-center/activities',
      '/teacher-center/attendance',
      '/teacher-center/enrollment',
      '/teacher-center/tasks',
      '/teacher-center/notifications',
      '/aiassistant'
    ]
  },
  parent: {
    username: 'parent',
    password: 'parent123',
    expectedRoutes: [
      '/parent-center/dashboard',
      '/parent-center/children',
      '/parent-center/activities',
      '/parent-center/ai-assistant',
      '/parent-center/feedback',
      '/parent-center/profile',
      '/aiassistant'
    ]
  }
};

class ConsoleErrorDetector {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.vueErrors = [];
  }

  clear() {
    this.errors = [];
    this.warnings = [];
    this.vueErrors = [];
  }

  getResults() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      totalVueErrors: this.vueErrors.length,
      errors: this.errors,
      warnings: this.warnings,
      vueErrors: this.vueErrors
    };
  }

  formatResults(role, route, results) {
    const output = [];
    output.push(`\n🔍 ${role.toUpperCase()} - ${route}`);
    output.push(`❌ 错误: ${results.totalErrors}`);
    output.push(`⚠️  警告: ${results.totalWarnings}`);
    output.push(`🔧 Vue错误: ${results.totalVueErrors}`);

    if (results.errors.length > 0) {
      output.push('\n📋 错误详情:');
      results.errors.forEach((error, index) => {
        output.push(`  ${index + 1}. ${error}`);
      });
    }

    if (results.vueErrors.length > 0) {
      output.push('\n🔧 Vue错误详情:');
      results.vueErrors.forEach((error, index) => {
        output.push(`  ${index + 1}. ${error}`);
      });
    }

    if (results.warnings.length > 0) {
      output.push('\n⚠️  警告详情:');
      results.warnings.forEach((warning, index) => {
        output.push(`  ${index + 1}. ${warning}`);
      });
    }

    return output.join('\n');
  }
}

async function testRolePages(role) {
  const detector = new ConsoleErrorDetector();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    role,
    pages: [],
    totalErrors: 0,
    totalWarnings: 0,
    totalVueErrors: 0
  };

  try {
    console.log(`\n🚀 开始测试 ${role} 角色页面...`);

    // 监听控制台输出
    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();

      if (type === 'error') {
        detector.errors.push(text);
      } else if (type === 'warning') {
        detector.warnings.push(text);
      }

      // 检测Vue特定错误
      if (text.includes('Duplicate attribute') ||
          text.includes('Element is missing end tag') ||
          text.includes('v-model') ||
          text.includes('[vue]')) {
        detector.vueErrors.push(text);
      }
    });

    page.on('pageerror', (error) => {
      detector.errors.push(error.message);
    });

    // 登录
    console.log(`📝 登录 ${role} 角色...`);
    await page.goto('http://localhost:5173/login');

    await page.fill('[placeholder="用户名"]', role.username);
    await page.fill('[placeholder="密码"]', role.password);
    await page.click('button[type="submit"]');

    // 等待登录完成
    await page.waitForTimeout(2000);

    // 测试每个预期路由
    for (const route of role.expectedRoutes) {
      console.log(`🔍 测试路由: ${route}`);
      detector.clear();

      try {
        // 导航到路由
        await page.goto(`http://localhost:5173${route}`);
        await page.waitForTimeout(3000); // 等待页面加载完成

        const pageResults = detector.getResults();

        results.pages.push({
          route,
          ...pageResults
        });

        results.totalErrors += pageResults.totalErrors;
        results.totalWarnings += pageResults.totalWarnings;
        results.totalVueErrors += pageResults.totalVueErrors;

        // 打印当前页面结果
        console.log(detector.formatResults(role, route, pageResults));

      } catch (error) {
        console.log(`❌ 路由 ${route} 访问失败: ${error.message}`);
        results.pages.push({
          route,
          error: error.message,
          totalErrors: 1,
          totalWarnings: 0,
          totalVueErrors: 0
        });
        results.totalErrors += 1;
      }
    }

  } catch (error) {
    console.error(`❌ ${role} 角色测试失败:`, error);
  } finally {
    await browser.close();
  }

  return results;
}

async function runAllTests() {
  console.log('🎯 开始全角色控制台错误检测测试...');
  console.log('=====================================');

  const allResults = {};
  let grandTotalErrors = 0;
  let grandTotalWarnings = 0;
  let grandTotalVueErrors = 0;

  // 依次测试每个角色
  for (const [roleName, roleConfig] of Object.entries(ROLES)) {
    const results = await testRolePages(roleConfig);
    allResults[roleName] = results;

    grandTotalErrors += results.totalErrors;
    grandTotalWarnings += results.totalWarnings;
    grandTotalVueErrors += results.totalVueErrors;

    console.log(`\n📊 ${roleName} 角色测试完成:`);
    console.log(`  - 总错误: ${results.totalErrors}`);
    console.log(`  - 总警告: ${results.totalWarnings}`);
    console.log(`  - Vue错误: ${results.totalVueErrors}`);
  }

  // 生成最终报告
  console.log('\n🏆 全角色测试完成 - 最终报告');
  console.log('=====================================');
  console.log(`📊 总体统计:`);
  console.log(`  - 总错误数: ${grandTotalErrors}`);
  console.log(`  - 总警告数: ${grandTotalWarnings}`);
  console.log(`  - Vue错误数: ${grandTotalVueErrors}`);

  // 按错误数量排序
  const sortedRoles = Object.entries(allResults)
    .sort(([,a], [,b]) => b.totalErrors - a.totalErrors);

  console.log(`\n🏅 角色错误排名 (从多到少):`);
  sortedRoles.forEach(([role, results], index) => {
    const status = results.totalErrors === 0 ? '✅' : '❌';
    console.log(`  ${index + 1}. ${role}: ${results.totalErrors} 错误 ${status}`);
  });

  // 生成需要修复的问题列表
  console.log(`\n🔧 需要修复的问题:`);
  let issueIndex = 1;

  for (const [roleName, results] of Object.entries(allResults)) {
    for (const page of results.pages) {
      if (page.totalErrors > 0 || page.totalVueErrors > 0) {
        console.log(`\n  ${issueIndex}. ${roleName} - ${page.route}`);
        if (page.errors && page.errors.length > 0) {
          page.errors.slice(0, 3).forEach(error => {
            console.log(`     - ${error.substring(0, 100)}...`);
          });
        }
        if (page.vueErrors && page.vueErrors.length > 0) {
          page.vueErrors.slice(0, 3).forEach(error => {
            console.log(`     - Vue: ${error.substring(0, 100)}...`);
          });
        }
        issueIndex++;
      }
    }
  }

  return {
    summary: {
      totalErrors: grandTotalErrors,
      totalWarnings: grandTotalWarnings,
      totalVueErrors: grandTotalVueErrors
    },
    results: allResults
  };
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testRolePages,
  ConsoleErrorDetector,
  ROLES
};