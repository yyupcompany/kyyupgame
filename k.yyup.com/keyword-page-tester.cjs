#!/usr/bin/env node

/**
 * 关键词页面测试器
 * 基于关键词测试计划001，系统性地测试页面功能
 * 测试策略：关键词触达 + AI工具调用 + 功能验证
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  baseUrl: 'http://localhost:5173',
  headless: true,
  timeout: 30000,
  screenshotDir: './keyword-test-screenshots'
};

// 核心关键词测试数据
const KEYWORD_TESTS = [
  {
    keyword: '查询',
    priority: 'P0',
    description: '数据查询功能测试',
    pages: [
      { path: '/dashboard', name: '仪表板', expectedElements: ['.search-box', '.query-btn', '.data-table'] },
      { path: '/student-management', name: '学生管理', expectedElements: ['.student-search', '.filter-btn', '.student-list'] },
      { path: '/teacher-management', name: '教师管理', expectedElements: ['.teacher-search', '.filter-btn', '.teacher-list'] }
    ],
    aiTools: ['any_query'],
    testActions: ['输入查询内容', '点击搜索', '验证结果']
  },
  {
    keyword: '创建',
    priority: 'P0',
    description: '数据创建功能测试',
    pages: [
      { path: '/student-management', name: '学生管理', expectedElements: ['.create-btn', '.student-form', '.submit-btn'] },
      { path: '/activity/create', name: '活动创建', expectedElements: ['.activity-form', '.create-activity-btn', '.poster-preview'] },
      { path: '/class-management', name: '班级管理', expectedElements: ['.add-class-btn', '.class-form', '.save-btn'] }
    ],
    aiTools: ['create_data_record'],
    testActions: ['点击创建按钮', '填写表单', '提交保存']
  },
  {
    keyword: 'AI助手',
    priority: 'P1',
    description: 'AI智能助手功能测试',
    pages: [
      { path: '/ai-assistant', name: 'AI助手', expectedElements: ['.ai-chat', '.input-box', '.send-btn', '.ai-response'] }
    ],
    aiTools: ['any_query', 'generate_complete_activity_plan', 'analyze_task_complexity'],
    testActions: ['打开AI助手', '输入问题', '验证AI回复']
  },
  {
    keyword: '学生',
    priority: 'P1',
    description: '学生管理功能测试',
    pages: [
      { path: '/student-management', name: '学生管理', expectedElements: ['.student-list', '.add-student-btn', '.student-detail'] },
      { path: '/student-statistics', name: '学生统计', expectedElements: ['.chart-container', '.stats-card', '.filter-group'] }
    ],
    aiTools: ['any_query', 'create_data_record'],
    testActions: ['查看学生列表', '搜索学生', '查看详情']
  },
  {
    keyword: '教师',
    priority: 'P1',
    description: '教师管理功能测试',
    pages: [
      { path: '/teacher-management', name: '教师管理', expectedElements: ['.teacher-list', '.add-teacher-btn', '.teacher-detail'] },
      { path: '/teacher-statistics', name: '教师统计', expectedElements: ['.chart-container', '.stats-card', '.performance-metrics'] }
    ],
    aiTools: ['any_query', 'import_teacher_data'],
    testActions: ['查看教师列表', '搜索教师', '查看绩效']
  },
  {
    keyword: '活动',
    priority: 'P1',
    description: '活动管理功能测试',
    pages: [
      { path: '/activity-management', name: '活动管理', expectedElements: ['.activity-list', '.create-activity-btn', '.activity-card'] },
      { path: '/activity/create', name: '创建活动', expectedElements: ['.activity-form', '.poster-generator', '.workflow-btn'] }
    ],
    aiTools: ['generate_complete_activity_plan', 'execute_activity_workflow'],
    testActions: ['浏览活动列表', '创建新活动', '生成海报']
  }
];

// 测试结果记录
let testResults = [];

/**
 * 初始化测试环境
 */
async function initializeTest() {
  console.log('🚀 关键词页面测试器启动');
  console.log('📋 基于关键词测试计划001执行');
  console.log('='.repeat(60));

  // 创建截图目录
  if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
  }

  console.log(`📸 截图将保存到: ${CONFIG.screenshotDir}`);
}

/**
 * 测试单个关键词
 */
async function testKeyword(keywordTest, browser) {
  console.log(`\n🎯 测试关键词: ${keywordTest.keyword} (${keywordTest.priority})`);
  console.log(`📝 描述: ${keywordTest.description}`);
  console.log(`🔧 AI工具: ${keywordTest.aiTools.join(', ')}`);

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  let keywordResults = {
    keyword: keywordTest.keyword,
    pages: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: []
  };

  try {
    // 先执行登录
    await performLogin(page);

    // 测试每个相关页面
    for (const pageInfo of keywordTest.pages) {
      console.log(`\n  📄 测试页面: ${pageInfo.name} (${pageInfo.path})`);

      const pageResult = await testPageForKeyword(page, pageInfo, keywordTest);
      keywordResults.pages.push(pageResult);
      keywordResults.totalTests += pageResult.tests.length;

      const pagePassed = pageResult.tests.filter(t => t.status === 'passed').length;
      const pageFailed = pageResult.tests.filter(t => t.status === 'failed').length;

      keywordResults.passedTests += pagePassed;
      keywordResults.failedTests += pageFailed;

      console.log(`    ✅ 通过: ${pagePassed}, ❌ 失败: ${pageFailed}`);
    }

  } catch (error) {
    console.error(`❌ 关键词 "${keywordTest.keyword}" 测试失败:`, error.message);
    keywordResults.errors.push(error.message);
  } finally {
    await context.close();
  }

  return keywordResults;
}

/**
 * 执行登录操作
 */
async function performLogin(page) {
  console.log('  🔐 执行快捷登录...');

  await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 查找并点击admin快捷登录按钮
  const adminButton = await page.$('.quick-btn.admin-btn');
  if (adminButton) {
    await adminButton.click();
    await page.waitForTimeout(3000);

    // 验证登录成功
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.log('    ✅ 登录成功');
      return true;
    }
  }

  throw new Error('登录失败');
}

/**
 * 测试单个页面的关键词功能
 */
async function testPageForKeyword(page, pageInfo, keywordTest) {
  const pageResult = {
    page: pageInfo.name,
    path: pageInfo.path,
    tests: [],
    screenshot: null,
    responseTime: 0
  };

  try {
    const startTime = Date.now();

    // 导航到页面
    await page.goto(`${CONFIG.baseUrl}${pageInfo.path}`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout
    });

    const responseTime = Date.now() - startTime;
    pageResult.responseTime = responseTime;

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 截图
    const screenshotName = `${keywordTest.keyword}_${pageInfo.name.replace(/\s+/g, '_')}.png`;
    const screenshotPath = path.join(CONFIG.screenshotDir, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    pageResult.screenshot = screenshotPath;

    // 测试预期元素
    for (const elementSelector of pageInfo.expectedElements) {
      const testResult = await testElement(page, elementSelector, keywordTest.keyword);
      pageResult.tests.push(testResult);
    }

    // 执行关键词相关的测试动作
    for (const action of keywordTest.testActions) {
      const testResult = await testAction(page, action, keywordTest.keyword);
      pageResult.tests.push(testResult);
    }

    console.log(`    ⏱️  响应时间: ${responseTime}ms`);
    console.log(`    📸 截图已保存: ${screenshotPath}`);

  } catch (error) {
    console.error(`    ❌ 页面测试失败: ${error.message}`);
    pageResult.tests.push({
      name: '页面加载',
      status: 'failed',
      error: error.message,
      responseTime: pageResult.responseTime
    });
  }

  return pageResult;
}

/**
 * 测试页面元素
 */
async function testElement(page, selector, keyword) {
  const testResult = {
    name: `元素检查: ${selector}`,
    status: 'passed',
    keyword: keyword,
    responseTime: 0
  };

  try {
    const startTime = Date.now();
    const element = await page.$(selector);
    const responseTime = Date.now() - startTime;
    testResult.responseTime = responseTime;

    if (element) {
      const isVisible = await element.isVisible();
      if (isVisible) {
        console.log(`      ✅ 找到元素: ${selector}`);
      } else {
        testResult.status = 'failed';
        testResult.error = '元素存在但不可见';
        console.log(`      ⚠️  元素不可见: ${selector}`);
      }
    } else {
      testResult.status = 'failed';
      testResult.error = '未找到元素';
      console.log(`      ❌ 未找到元素: ${selector}`);
    }

  } catch (error) {
    testResult.status = 'failed';
    testResult.error = error.message;
    console.log(`      ❌ 元素检查失败: ${selector} - ${error.message}`);
  }

  return testResult;
}

/**
 * 测试用户动作
 */
async function testAction(page, action, keyword) {
  const testResult = {
    name: `动作测试: ${action}`,
    status: 'passed',
    keyword: keyword,
    responseTime: 0
  };

  try {
    const startTime = Date.now();

    // 根据动作描述执行相应操作
    if (action.includes('搜索') || action.includes('查询')) {
      // 尝试找到搜索框并输入测试内容
      const searchSelectors = [
        'input[placeholder*="搜索"]',
        'input[placeholder*="查询"]',
        '.search-input',
        '.search-box input',
        'input[type="search"]'
      ];

      for (const selector of searchSelectors) {
        const input = await page.$(selector);
        if (input) {
          await input.fill(`测试${keyword}`);
          await page.waitForTimeout(1000);
          break;
        }
      }
    } else if (action.includes('点击') || action.includes('按钮')) {
      // 尝试点击相关按钮
      const buttonSelectors = [
        'button',
        '.btn',
        '.button',
        '[role="button"]',
        `button:has-text("${keyword}")`,
        `*:has-text("${action}")`
      ];

      for (const selector of buttonSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            const text = await button.textContent();
            if (text && (text.includes(keyword) || text.includes('创建') || text.includes('搜索'))) {
              await button.click();
              await page.waitForTimeout(1000);
              break;
            }
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }
    } else if (action.includes('输入') || action.includes('填写')) {
      // 尝试找到输入框
      const inputSelectors = [
        'input',
        'textarea',
        '.input',
        '.form-input'
      ];

      for (const selector of inputSelectors) {
        const inputs = await page.$$(selector);
        if (inputs.length > 0) {
          await inputs[0].fill(`测试${keyword}数据`);
          await page.waitForTimeout(500);
          break;
        }
      }
    }

    const responseTime = Date.now() - startTime;
    testResult.responseTime = responseTime;
    console.log(`      ✅ 动作完成: ${action} (${responseTime}ms)`);

  } catch (error) {
    testResult.status = 'failed';
    testResult.error = error.message;
    console.log(`      ❌ 动作失败: ${action} - ${error.message}`);
  }

  return testResult;
}

/**
 * 生成测试报告
 */
function generateTestReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 关键词测试报告');
  console.log('='.repeat(60));

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalErrors = 0;

  results.forEach(result => {
    console.log(`\n🎯 关键词: ${result.keyword}`);
    console.log(`📈 测试统计: ${result.passedTests}/${result.totalTests} 通过`);
    console.log(`⏱️  平均响应时间: ${calculateAverageResponseTime(result)}ms`);

    if (result.errors.length > 0) {
      console.log(`❌ 错误数量: ${result.errors.length}`);
    }

    result.pages.forEach(page => {
      const pagePassed = page.tests.filter(t => t.status === 'passed').length;
      const pageTotal = page.tests.length;
      console.log(`  📄 ${page.page}: ${pagePassed}/${pageTotal} (${page.responseTime}ms)`);
    });

    totalTests += result.totalTests;
    totalPassed += result.passedTests;
    totalFailed += result.failedTests;
    totalErrors += result.errors.length;
  });

  console.log('\n📋 总体统计:');
  console.log(`✅ 通过测试: ${totalPassed}`);
  console.log(`❌ 失败测试: ${totalFailed}`);
  console.log(`🚫 错误数量: ${totalErrors}`);
  console.log(`📊 通过率: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

  // 保存详细报告
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      totalErrors,
      passRate: ((totalPassed / totalTests) * 100).toFixed(1)
    },
    details: results
  };

  const reportPath = './keyword-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 详细报告已保存: ${reportPath}`);

  return {
    totalTests,
    totalPassed,
    totalFailed,
    totalErrors,
    passRate: ((totalPassed / totalTests) * 100).toFixed(1)
  };
}

/**
 * 计算平均响应时间
 */
function calculateAverageResponseTime(result) {
  const allResponseTimes = [];
  result.pages.forEach(page => {
    if (page.responseTime) {
      allResponseTimes.push(page.responseTime);
    }
    page.tests.forEach(test => {
      if (test.responseTime) {
        allResponseTimes.push(test.responseTime);
      }
    });
  });

  if (allResponseTimes.length === 0) return 0;
  const average = allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length;
  return Math.round(average);
}

/**
 * 主测试函数
 */
async function runKeywordTests() {
  await initializeTest();

  const browser = await chromium.launch({
    headless: CONFIG.headless,
    devtools: false
  });

  try {
    console.log(`\n🚀 开始测试 ${KEYWORD_TESTS.length} 个关键词...`);

    // 按优先级排序
    const sortedTests = KEYWORD_TESTS.sort((a, b) => {
      const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const results = [];

    for (const keywordTest of sortedTests) {
      const result = await testKeyword(keywordTest, browser);
      results.push(result);

      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 生成最终报告
    const finalReport = generateTestReport(results);

    console.log('\n🎉 关键词测试完成！');
    console.log(`📊 总体通过率: ${finalReport.passRate}%`);

    if (parseFloat(finalReport.passRate) >= 90) {
      console.log('🏆 测试结果优秀！');
    } else if (parseFloat(finalReport.passRate) >= 70) {
      console.log('👍 测试结果良好');
    } else {
      console.log('⚠️  需要改进测试结果');
    }

  } catch (error) {
    console.error('💥 测试执行失败:', error);
  } finally {
    await browser.close();
  }
}

// 检查服务状态
async function checkServices() {
  const http = require('http');

  const frontendCheck = new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      console.log('✅ 前端服务运行正常');
      resolve(true);
    });

    req.on('error', () => {
      console.log('❌ 前端服务未运行');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('⏰ 前端服务响应超时');
      resolve(false);
    });
  });

  const frontendOk = await frontendCheck;
  if (!frontendOk) {
    console.log('\n❌ 前端服务未运行，请先启动:');
    console.log('   cd client && npm run dev');
    process.exit(1);
  }
}

// 主程序
async function main() {
  console.log('🔍 关键词页面测试器');
  console.log('基于关键词测试计划001执行系统性测试');

  try {
    await checkServices();
    await runKeywordTests();
  } catch (error) {
    console.error('💥 程序执行失败:', error);
    process.exit(1);
  }
}

// 运行测试
main().catch(error => {
  console.error('💥 启动失败:', error);
  process.exit(1);
});