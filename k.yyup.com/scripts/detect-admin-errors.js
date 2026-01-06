/**
 * Admin角色菜单错误检测脚本（基于配置文件）
 * 根据static-menu.ts配置直接检测所有admin可访问的页面
 */

const { chromium } = require('playwright');
const fs = require('fs');

// Admin角色菜单配置（从static-menu.ts提取）
const ADMIN_MENU_ITEMS = [
  { title: '仪表板', path: '/dashboard', component: 'Dashboard' },
  { title: '人员管理', path: '/centers/personnel', component: 'centers/PersonnelCenter' },
  { title: '文案管理', path: '/centers/script', component: 'centers/ScriptCenter' },
  { title: 'AI中心', path: '/centers/ai', component: 'centers/AICenter' },
  { title: '活动管理', path: '/centers/activity', component: 'centers/ActivityCenter' },
  { title: '测评总览', path: '/assessment-analytics/overview', component: 'assessment-analytics/overview' },
  { title: '测评记录', path: '/assessment-analytics/records', component: 'assessment-analytics/records' },
  { title: '测评报告', path: '/assessment-analytics/reports', component: 'assessment-analytics/reports' },
  { title: '数据趋势', path: '/assessment-analytics/trends', component: 'assessment-analytics/trends' },
  { title: '招生管理', path: '/centers/enrollment', component: 'centers/EnrollmentCenter' },
  { title: '财务管理', path: '/centers/finance', component: 'centers/FinanceCenter' },
  { title: '系统管理', path: '/centers/system', component: 'centers/SystemCenter' },
  { title: '工作台', path: '/teacher-center/dashboard', component: 'teacher-center/Dashboard' },
  { title: '教学管理', path: '/teacher-center/teaching', component: 'teacher-center/Teaching' },
  { title: '考勤管理', path: '/teacher-center/attendance', component: 'teacher-center/Attendance' },
  { title: '活动管理', path: '/teacher-center/activities', component: 'teacher-center/Activities' },
  { title: '任务管理', path: '/teacher-center/tasks', component: 'teacher-center/Tasks' },
  { title: '学生测评', path: '/teacher-center/student-assessment', component: 'teacher-center/student-assessment' },
  { title: '工作台', path: '/parent-center/dashboard', component: 'parent-center/Dashboard' },
  { title: '孩子管理', path: '/parent-center/children', component: 'parent-center/Children' },
  { title: '招生活动', path: '/parent-center/activities', component: 'parent-center/Activities' },
  { title: '成长评估', path: '/parent-center/assessment', component: 'parent-center/Assessment' },
  { title: '家校沟通', path: '/parent-center/communication', component: 'parent-center/Communication' },
  { title: '智能助手', path: '/ai/assistant', component: 'ai/AIAssistant' },
  { title: '智能查询', path: '/ai/query', component: 'ai/AIQuery' }
];

const CONFIG = {
  baseURL: 'http://localhost:5173',
  outputFile: '/home/zhgue/kyyupgame/k.yyup.com/admin-menu-errors-detailed.json',
  screenshotDir: '/home/zhgue/kyyupgame/k.yyup.com/test-screenshots/admin-menu'
};

async function detectErrors() {
  console.log('🚀 开始检测Admin角色菜单错误...\n');

  // 确保截图目录存在
  if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: ADMIN_MENU_ITEMS.length,
      success: 0,
      hasErrors: 0,
      has404: 0,
      consoleErrors: 0
    },
    items: []
  };

  try {
    // 监听控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack
      });
    });

    // 访问登录页面
    console.log('📝 访问登录页面...');
    await page.goto(CONFIG.baseURL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(3000);

    // 尝试登录
    console.log('🔑 尝试登录...');
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill('admin');
      await inputs[1].fill('admin123');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
    }

    // 检查是否登录成功
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('⚠️  登录失败，将直接访问各页面进行检测...\n');
    }

    // 依次检测每个菜单项
    for (let i = 0; i < ADMIN_MENU_ITEMS.length; i++) {
      const menuItem = ADMIN_MENU_ITEMS[i];
      console.log(`[${i + 1}/${ADMIN_MENU_ITEMS.length}] 检测: ${menuItem.title} (${menuItem.path})`);

      // 清空错误
      consoleErrors.length = 0;

      const itemResult = {
        title: menuItem.title,
        path: menuItem.path,
        component: menuItem.component,
        success: false,
        has404: false,
        consoleErrors: [],
        pageErrors: [],
        screenshot: null
      };

      try {
        // 直接访问页面
        const url = CONFIG.baseURL + menuItem.path;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(3000);

        // 检查页面内容
        const pageTitle = await page.title();
        const pageContent = await page.content();
        const finalUrl = page.url();

        // 判断是否有404错误
        const has404 = pageContent.includes('404') ||
                       pageTitle.includes('404') ||
                       finalUrl.includes('404') ||
                       pageContent.includes('页面不存在') ||
                       pageContent.includes('Not Found');

        itemResult.has404 = has404;
        itemResult.consoleErrors = [...consoleErrors];
        itemResult.pageErrors = consoleErrors.filter(e => e.type === 'pageerror');
        itemResult.finalUrl = finalUrl;
        itemResult.pageTitle = pageTitle;

        if (has404 || consoleErrors.length > 0) {
          itemResult.success = false;
          results.summary.hasErrors++;
          if (has404) results.summary.has404++;
          results.summary.consoleErrors += consoleErrors.length;

          console.error(`   ❌ 发现错误:`);
          console.error(`      - 404错误: ${has404}`);
          console.error(`      - 控制台错误: ${consoleErrors.length}个`);

          // 截图
          const screenshotFile = `${CONFIG.screenshotDir}/${i + 1}-${menuItem.title.replace(/\s+/g, '-')}.png`;
          await page.screenshot({ path: screenshotFile, fullPage: true });
          itemResult.screenshot = screenshotFile;

          // 记录错误详情
          if (consoleErrors.length > 0) {
            console.error(`      - 错误详情:`);
            consoleErrors.forEach((err, idx) => {
              console.error(`         [${idx + 1}] ${err.text || err.message}`);
            });
          }
        } else {
          itemResult.success = true;
          results.summary.success++;
          console.log(`   ✅ 正常`);
        }

      } catch (error) {
        itemResult.success = false;
        itemResult.error = error.message;
        results.summary.hasErrors++;

        console.error(`   ❌ 访问失败: ${error.message}`);
      }

      results.items.push(itemResult);
    }

    // 保存详细结果
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));

    // 生成摘要报告
    console.log('\n📊 检测完成！');
    console.log('\n📈 统计摘要:');
    console.log(`   - 总菜单数: ${results.summary.total}`);
    console.log(`   - 正常页面: ${results.summary.success}`);
    console.log(`   - 错误页面: ${results.summary.hasErrors}`);
    console.log(`   - 404错误: ${results.summary.has404}`);
    console.log(`   - 控制台错误: ${results.summary.consoleErrors}`);
    console.log(`\n📄 详细报告已保存到: ${CONFIG.outputFile}`);
    console.log(`📸 截图目录: ${CONFIG.screenshotDir}`);

    // 输出所有错误页面
    const errorItems = results.items.filter(item => !item.success || item.has404 || item.consoleErrors.length > 0);
    if (errorItems.length > 0) {
      console.log('\n❌ 错误页面列表:');
      errorItems.forEach((item, idx) => {
        console.log(`\n[${idx + 1}] ${item.title}`);
        console.log(`    路径: ${item.path}`);
        console.log(`    组件: ${item.component}`);
        console.log(`    状态: ${item.has404 ? '404错误' : '控制台错误'}`);
        if (item.consoleErrors.length > 0) {
          console.log(`    错误数: ${item.consoleErrors.length}`);
        }
      });
    } else {
      console.log('\n✅ 所有页面都正常！');
    }

  } catch (error) {
    console.error('\n❌ 检测过程中发生错误:', error);
  } finally {
    await browser.close();
  }

  return results;
}

// 运行检测
detectErrors().then(results => {
  const errorCount = results.summary.hasErrors;
  process.exit(errorCount > 0 ? 1 : 0);
}).catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
});
