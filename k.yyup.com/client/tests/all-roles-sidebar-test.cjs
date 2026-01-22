/**
 * 四角色侧边栏完整测试脚本
 * 测试 ADMIN、园长、家长、教师 四个角色的所有侧边栏按钮
 *
 * 登录快捷按钮:
 * - 系统管理员 (ref=e352)
 * - 园长 (ref=e361)
 * - 教师 (ref=e371)
 * - 家长 (ref=e380)
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5173';

// ADMIN/园长 菜单配置
const ADMIN_MENUS = [
  { name: '管理控制台', path: '/dashboard' },
  // 业务管理
  { name: '业务中心', path: '/centers/business' },
  { name: '活动中心', path: '/centers/activity' },
  { name: '招生中心', path: '/centers/enrollment' },
  { name: '客户池中心', path: '/centers/customer-pool' },
  { name: '任务中心', path: '/centers/task' },
  { name: '文档中心', path: '/centers/document-center' },
  { name: '财务中心', path: '/centers/finance' },
  // 营销管理
  { name: '营销中心', path: '/centers/marketing' },
  { name: '呼叫中心', path: '/centers/call' },
  { name: '相册中心', path: '/centers/media' },
  { name: '新媒体中心', path: '/principal/media-center' },
  // 人事与教学管理
  { name: '人员中心', path: '/centers/personnel' },
  { name: '教学中心', path: '/centers/teaching' },
  { name: '测评中心', path: '/centers/assessment' },
  { name: '考勤中心', path: '/centers/attendance' },
  // 数据与分析管理
  { name: '数据分析中心', path: '/centers/analytics' },
  { name: '用量中心', path: '/centers/usage' },
  // 治理与集团管理
  { name: '集团中心', path: '/group' },
  { name: '督查中心', path: '/centers/inspection' },
  // 系统与AI管理
  { name: '系统中心', path: '/centers/system' },
  { name: 'AI中心', path: '/centers/ai' }
];

// 教师 菜单配置
const TEACHER_MENUS = [
  { name: '教师工作台', path: '/teacher-center/dashboard' },
  { name: '通知中心', path: '/teacher-center/notifications' },
  { name: '任务中心', path: '/teacher-center/tasks' },
  { name: '活动中心', path: '/teacher-center/activities' },
  { name: '招生中心', path: '/teacher-center/enrollment' },
  { name: '教学中心', path: '/teacher-center/teaching' },
  { name: '客户跟踪', path: '/teacher-center/customer-tracking' },
  { name: 'AI互动课堂', path: '/teacher-center/creative-curriculum' },
  { name: '绩效中心', path: '/teacher-center/performance-rewards' }
];

// 家长 菜单配置
const PARENT_MENUS = [
  { name: '我的首页', path: '/parent-center/dashboard' },
  { name: '我的孩子', path: '/parent-center/children' },
  { name: '成长报告', path: '/parent-center/child-growth' },
  { name: '能力测评', path: '/parent-center/assessment' },
  { name: '游戏大厅', path: '/parent-center/games' },
  { name: 'AI育儿助手', path: '/parent-center/ai-assistant' },
  { name: '活动列表', path: '/parent-center/activities' },
  { name: '家园沟通', path: '/parent-center/communication' },
  { name: '相册中心', path: '/parent-center/photo-album' },
  { name: '园所奖励', path: '/parent-center/kindergarten-rewards' },
  { name: '最新通知', path: '/parent-center/notifications' }
];

// 测试结果收集
const testResults = {
  admin: { passed: 0, failed: 0, menus: [] },
  principal: { passed: 0, failed: 0, menus: [] },
  teacher: { passed: 0, failed: 0, menus: [] },
  parent: { passed: 0, failed: 0, menus: [] }
};

// 测试单个菜单项
async function testMenuItem(page, menu, role) {
  const startTime = Date.now();

  try {
    // 先回到首页/仪表板
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(500);

    // 导航到目标页面
    await page.goto(BASE_URL + menu.path, { waitUntil: 'networkidle', timeout: 20000 });

    // 等待页面加载
    await page.waitForTimeout(1500);

    // 检查是否有错误（排除favicon等无关错误）
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });

    // 等待收集错误
    await page.waitForTimeout(1000);

    const duration = Date.now() - startTime;
    // 过滤掉非关键错误
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('ERR_NAME_NOT_RESOLVED') &&
      !e.includes('net::ERR')
    );

    const success = criticalErrors.length === 0;

    return {
      name: menu.name,
      path: menu.path,
      status: success ? 'PASS' : 'FAIL',
      duration: `${duration}ms`,
      errors: success ? [] : criticalErrors.slice(0, 3)
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name: menu.name,
      path: menu.path,
      status: 'ERROR',
      duration: `${duration}ms`,
      errors: [error.message]
    };
  }
}

// 测试角色
async function testRole(browser, roleName, loginRef, menus, resultKey) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`开始测试 ${roleName} 角色 - ${menus.length}个菜单项`);
  console.log('='.repeat(50));

  const page = await browser.newPage();

  try {
    // 访问登录页
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 15000 });
    console.log(`✅ 访问登录页成功`);

    // 点击快捷登录按钮
    const loginButton = await page.$(`button[ref="${loginRef}"]`);
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(3000);
      console.log(`✅ 点击 ${roleName} 快捷登录按钮成功`);

      // 检查当前URL确认登录成功
      const currentUrl = page.url();
      console.log(`   当前URL: ${currentUrl}`);
    } else {
      console.log(`⚠️ 未找到 ${roleName} 登录按钮，尝试直接访问`);
    }

    // 测试每个菜单
    for (const menu of menus) {
      const result = await testMenuItem(page, menu, roleName);
      testResults[resultKey].menus.push(result);

      if (result.status === 'PASS') {
        testResults[resultKey].passed++;
        console.log(`✅ ${result.name} (${result.path}) - ${result.duration}`);
      } else if (result.status === 'FAIL') {
        testResults[resultKey].failed++;
        console.log(`❌ ${result.name} (${result.path}) - ${result.duration}`);
        if (result.errors.length > 0) {
          console.log(`   错误: ${result.errors[0].substring(0, 100)}`);
        }
      } else {
        testResults[resultKey].failed++;
        console.log(`🚨 ${result.name} (${result.path}) - ERROR: ${result.errors[0].substring(0, 100)}`);
      }
    }
  } catch (error) {
    console.error(`❌ ${roleName} 测试出错:`, error.message);
  } finally {
    await page.close();
  }
}

// 主测试函数
async function runAllTests() {
  console.log('\n🚀 开始四角色侧边栏完整测试\n');
  console.log(`测试地址: ${BASE_URL}`);
  console.log(`时间: ${new Date().toLocaleString()}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    // 测试 ADMIN (使用系统管理员登录)
    await testRole(browser, 'ADMIN', 'e352', ADMIN_MENUS, 'admin');

    // 测试 园长
    await testRole(browser, '园长', 'e361', ADMIN_MENUS, 'principal');

    // 测试 教师
    await testRole(browser, '教师', 'e371', TEACHER_MENUS, 'teacher');

    // 测试 家长
    await testRole(browser, '家长', 'e380', PARENT_MENUS, 'parent');

  } finally {
    await browser.close();
  }

  // 输出测试报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 四角色侧边栏测试报告');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;

  for (const [role, data] of Object.entries(testResults)) {
    const total = data.passed + data.failed;
    totalPassed += data.passed;
    totalFailed += data.failed;

    console.log(`\n${role.toUpperCase()}:`);
    console.log(`  通过: ${data.passed}/${total}`);
    console.log(`  失败: ${data.failed}/${total}`);

    if (data.failed > 0) {
      console.log(`  失败的页面:`);
      data.menus
        .filter(m => m.status !== 'PASS')
        .forEach(m => console.log(`    - ${m.name} (${m.path})`));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`总计: 通过 ${totalPassed} 个, 失败 ${totalFailed} 个`);
  console.log(`测试完成时间: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));

  return testResults;
}

// 运行测试
runAllTests().catch(console.error);

module.exports = { runAllTests, ADMIN_MENUS, TEACHER_MENUS, PARENT_MENUS };
