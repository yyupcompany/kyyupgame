/**
 * 简化的控制台错误检测测试
 * 直接访问页面检测Vue编译错误、重复属性等问题
 */

const { chromium } = require('playwright');

const PAGES_TO_TEST = [
  'http://localhost:5173/login',
  'http://localhost:5173/dashboard',
  'http://localhost:5173/centers/analytics',
  'http://localhost:5173/centers/finance',
  'http://localhost:5173/centers/system',
  'http://localhost:5173/centers/enrollment',
  'http://localhost:5173/centers/marketing',
  'http://localhost:5173/centers/business',
  'http://localhost:5173/centers/ai-center',
  'http://localhost:5173/aiassistant',
  'http://localhost:5173/teacher-center/dashboard',
  'http://localhost:5173/parent-center/dashboard'
];

class ConsoleErrorDetector {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.vueErrors = [];
    this.duplicateAttributes = [];
  }

  clear() {
    this.errors = [];
    this.warnings = [];
    this.vueErrors = [];
    this.duplicateAttributes = [];
  }

  getResults() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      totalVueErrors: this.vueErrors.length,
      totalDuplicateAttributes: this.duplicateAttributes.length,
      errors: this.errors,
      warnings: this.warnings,
      vueErrors: this.vueErrors,
      duplicateAttributes: this.duplicateAttributes
    };
  }

  categorizeError(text) {
    // 检测Vue特定错误
    if (text.includes('Duplicate attribute') ||
        text.includes('Element is missing end tag') ||
        text.includes('Invalid end tag') ||
        text.includes('v-model') && text.includes('directive')) {
      this.vueErrors.push(text);

      if (text.includes('Duplicate attribute')) {
        this.duplicateAttributes.push(text);
      }
    } else if (text.includes('[vue]')) {
      this.vueErrors.push(text);
    } else if (text.includes('Error:')) {
      this.errors.push(text);
    } else if (text.includes('Warning:')) {
      this.warnings.push(text);
    }
  }
}

async function testSinglePage(url) {
  const detector = new ConsoleErrorDetector();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`🔍 测试页面: ${url}`);

  // 监听控制台输出
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      detector.categorizeError(text);
    } else if (type === 'warning') {
      detector.categorizeError(text);
    }
  });

  page.on('pageerror', (error) => {
    detector.categorizeError(`Page Error: ${error.message}`);
  });

  try {
    // 访问页面
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // 等待页面完全加载

    const results = detector.getResults();

    await browser.close();

    return {
      url,
      ...results,
      success: true
    };

  } catch (error) {
    await browser.close();
    return {
      url,
      error: error.message,
      totalErrors: 1,
      totalWarnings: 0,
      totalVueErrors: 0,
      totalDuplicateAttributes: 0,
      success: false
    };
  }
}

async function runConsoleErrorTest() {
  console.log('🎯 开始控制台错误检测测试...');
  console.log('=====================================');

  const allResults = [];
  let grandTotalErrors = 0;
  let grandTotalWarnings = 0;
  let grandTotalVueErrors = 0;
  let grandTotalDuplicateAttributes = 0;

  // 依次测试每个页面
  for (const url of PAGES_TO_TEST) {
    const results = await testSinglePage(url);
    allResults.push(results);

    grandTotalErrors += results.totalErrors;
    grandTotalWarnings += results.totalWarnings;
    grandTotalVueErrors += results.totalVueErrors;
    grandTotalDuplicateAttributes += results.totalDuplicateAttributes;

    // 打印当前页面结果
    console.log(`\n📊 ${results.url}`);
    console.log(`  - 成功访问: ${results.success ? '✅' : '❌'}`);
    console.log(`  - 总错误: ${results.totalErrors}`);
    console.log(`  - 总警告: ${results.totalWarnings}`);
    console.log(`  - Vue错误: ${results.totalVueErrors}`);
    console.log(`  - 重复属性: ${results.totalDuplicateAttributes}`);

    if (results.error) {
      console.log(`  - 错误信息: ${results.error}`);
    }

    if (results.vueErrors && results.vueErrors.length > 0) {
      console.log(`  🔧 Vue错误:`);
      results.vueErrors.slice(0, 3).forEach((error, index) => {
        console.log(`    ${index + 1}. ${error.substring(0, 150)}...`);
      });
    }

    if (results.duplicateAttributes && results.duplicateAttributes.length > 0) {
      console.log(`  ⚠️  重复属性:`);
      results.duplicateAttributes.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error.substring(0, 100)}...`);
      });
    }
  }

  // 生成最终报告
  console.log('\n🏆 全页面测试完成 - 最终报告');
  console.log('=====================================');
  console.log(`📊 总体统计:`);
  console.log(`  - 总错误数: ${grandTotalErrors}`);
  console.log(`  - 总警告数: ${grandTotalWarnings}`);
  console.log(`  - Vue错误数: ${grandTotalVueErrors}`);
  console.log(`  - 重复属性数: ${grandTotalDuplicateAttributes}`);

  // 按错误数量排序
  const sortedResults = allResults
    .filter(r => r.totalErrors > 0 || r.totalVueErrors > 0)
    .sort((a, b) => (b.totalErrors + b.totalVueErrors) - (a.totalErrors + a.totalVueErrors));

  if (sortedResults.length > 0) {
    console.log(`\n🔥 需要修复的页面 (按错误数量排序):`);
    sortedResults.forEach((result, index) => {
      const totalProblems = result.totalErrors + result.totalVueErrors + result.totalDuplicateAttributes;
      console.log(`  ${index + 1}. ${result.url}: ${totalProblems} 个问题`);
    });

    console.log(`\n🔧 需要修复的问题详情:`);
    let issueIndex = 1;

    for (const result of sortedResults) {
      if (result.duplicateAttributes && result.duplicateAttributes.length > 0) {
        console.log(`\n  ${issueIndex}. ${result.url} - 重复属性错误:`);
        result.duplicateAttributes.forEach(error => {
          const match = error.match(/(\/[^:]+):(\d+):/);
          const location = match ? `${match[1]}:${match[2]}` : '未知位置';
          console.log(`     - ${location}: ${error.substring(0, 120)}...`);
        });
        issueIndex++;
      }

      if (result.vueErrors && result.vueErrors.length > 0) {
        const otherVueErrors = result.vueErrors.filter(e => !e.includes('Duplicate attribute'));
        if (otherVueErrors.length > 0) {
          console.log(`\n  ${issueIndex}. ${result.url} - 其他Vue错误:`);
          otherVueErrors.slice(0, 2).forEach(error => {
            console.log(`     - ${error.substring(0, 120)}...`);
          });
          issueIndex++;
        }
      }
    }
  } else {
    console.log(`\n✅ 所有页面测试通过，没有发现严重错误！`);
  }

  return {
    summary: {
      totalErrors: grandTotalErrors,
      totalWarnings: grandTotalWarnings,
      totalVueErrors: grandTotalVueErrors,
      totalDuplicateAttributes: grandTotalDuplicateAttributes,
      pagesTested: allResults.length
    },
    results: allResults
  };
}

// 运行测试
if (require.main === module) {
  runConsoleErrorTest().catch(console.error);
}

module.exports = {
  runConsoleErrorTest,
  testSinglePage,
  ConsoleErrorDetector,
  PAGES_TO_TEST
};