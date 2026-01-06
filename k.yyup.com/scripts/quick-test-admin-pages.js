/**
 * Admin页面快速检测脚本（使用Mock Token）
 *
 * 策略：
 * 1. 直接访问页面，不进行登录
 * 2. 使用localStorage注入mock token绕过前端认证
 * 3. 检测页面是否正常加载，记录真实的404和组件错误
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
  { title: '老师工作台', path: '/teacher-center/dashboard', component: 'teacher-center/Dashboard' },
  { title: '教学管理', path: '/teacher-center/teaching', component: 'teacher-center/Teaching' },
  { title: '考勤管理', path: '/teacher-center/attendance', component: 'teacher-center/Attendance' },
  { title: '老师活动管理', path: '/teacher-center/activities', component: 'teacher-center/Activities' },
  { title: '任务管理', path: '/teacher-center/tasks', component: 'teacher-center/Tasks' },
  { title: '学生测评', path: '/teacher-center/student-assessment', component: 'teacher-center/student-assessment' },
  { title: '家长工作台', path: '/parent-center/dashboard', component: 'parent-center/Dashboard' },
  { title: '孩子管理', path: '/parent-center/children', component: 'parent-center/Children' },
  { title: '家长招生活动', path: '/parent-center/activities', component: 'parent-center/Activities' },
  { title: '成长评估', path: '/parent-center/assessment', component: 'parent-center/Assessment' },
  { title: '家校沟通', path: '/parent-center/communication', component: 'parent-center/Communication' },
  { title: '智能助手', path: '/ai/assistant', component: 'ai/AIAssistant' },
  { title: '智能查询', path: '/ai/query', component: 'ai/AIQuery' }
];

const CONFIG = {
  baseURL: 'http://localhost:5173',
  outputFile: '/home/zhgue/kyyupgame/k.yyup.com/quick-admin-page-errors.json',
  screenshotDir: '/home/zhgue/kyyupgame/k.yyup.com/test-screenshots/quick-test'
};

async function quickTestPages() {
  console.log('🚀 开始Admin页面快速检测（Mock Token模式）...\n');

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
      has404: 0,
      hasConsoleErrors: 0,
      hasComponentErrors: 0
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

    // 访问首页并注入mock token
    console.log('📝 访问首页并注入Mock Token...');
    await page.goto(CONFIG.baseURL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);

    // 注入mock token到localStorage
    await page.evaluate(() => {
      const mockToken = 'mock_dev_token_admin_1234567890';
      const mockUser = {
        id: 121,
        username: 'admin',
        role: 'admin',
        roles: [{ code: 'admin', name: '管理员' }],
        permissions: ['*'],
        email: 'admin@example.com',
        realName: '管理员',
        phone: '13800138000',
        status: 'active',
        isAdmin: true,
        kindergartenId: 1
      };

      // 设置localStorage
      localStorage.setItem('kindergarten_token', mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('kindergarten_user_info', JSON.stringify(mockUser));
      localStorage.setItem('userInfo', JSON.stringify(mockUser));

      console.log('✅ Mock Token已注入');
    });

    await page.waitForTimeout(1000);

    // 依次检测每个页面
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
        hasRouteError: false,
        hasComponentError: false,
        consoleErrors: [],
        pageErrors: [],
        pageContent: '',
        screenshot: null
      };

      try {
        // 直接访问页面
        const url = CONFIG.baseURL + menuItem.path;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(3000);

        // 获取页面信息
        const pageTitle = await page.title();
        const pageContent = await page.content();
        const finalUrl = page.url();

        // 检查页面状态
        const pageInfo = await page.evaluate(() => {
          return {
            hasSidebar: !!document.querySelector('.sidebar, aside, [class*="sidebar"]'),
            hasContent: !!document.querySelector('main, .main-content, [class*="content"]'),
            hasError: document.body.textContent.includes('404') ||
                     document.body.textContent.includes('Not Found') ||
                     document.body.textContent.includes('页面不存在'),
            elementCount: document.querySelectorAll('*').length,
            bodyText: document.body.textContent.substring(0, 200)
          };
        });

        // 判断错误类型
        const has404 = pageInfo.hasError ||
                       pageContent.includes('404') ||
                       finalUrl.includes('404');

        const hasRouteError = pageContent.includes('Failed to resolve component') ||
                             pageContent.includes('No route matches');

        const hasComponentError = pageContent.includes('Cannot read') ||
                                  pageContent.includes('TypeError') ||
                                  pageContent.includes('ReferenceError');

        itemResult.has404 = has404;
        itemResult.hasRouteError = hasRouteError;
        itemResult.hasComponentError = hasComponentError;
        itemResult.consoleErrors = [...consoleErrors];
        itemResult.pageErrors = consoleErrors.filter(e => e.type === 'pageerror');
        itemResult.pageContent = pageInfo.bodyText;
        itemResult.pageInfo = pageInfo;

        // 判断是否成功
        const hasErrors = has404 || hasRouteError || hasComponentError || consoleErrors.length > 0;

        if (hasErrors) {
          itemResult.success = false;
          results.summary.has404 += has404 ? 1 : 0;
          results.summary.hasConsoleErrors += consoleErrors.length;
          results.summary.hasComponentErrors += hasRouteError || hasComponentError ? 1 : 0;

          console.error(`   ❌ 发现错误:`);
          console.error(`      - 404错误: ${has404}`);
          console.error(`      - 路由错误: ${hasRouteError}`);
          console.error(`      - 组件错误: ${hasComponentError}`);
          console.error(`      - 控制台错误: ${consoleErrors.length}个`);

          // 截图
          const screenshotFile = `${CONFIG.screenshotDir}/${i + 1}-${menuItem.title.replace(/\s+/g, '-')}.png`;
          await page.screenshot({ path: screenshotFile, fullPage: true });
          itemResult.screenshot = screenshotFile;

          // 记录错误详情
          if (consoleErrors.length > 0) {
            console.error(`      - 错误详情:`);
            consoleErrors.slice(0, 3).forEach((err, idx) => {
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
        itemResult.hasRouteError = true;

        console.error(`   ❌ 访问失败: ${error.message}`);
      }

      results.items.push(itemResult);
    }

    // 保存结果
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));

    // 生成摘要报告
    console.log('\n📊 检测完成！');
    console.log('\n📈 统计摘要:');
    console.log(`   - 总页面数: ${results.summary.total}`);
    console.log(`   - 正常页面: ${results.summary.success}`);
    console.log(`   - 404错误: ${results.summary.has404}`);
    console.log(`   - 组件错误: ${results.summary.hasComponentErrors}`);
    console.log(`   - 控制台错误: ${results.summary.hasConsoleErrors}`);
    console.log(`\n📄 详细报告已保存到: ${CONFIG.outputFile}`);
    console.log(`📸 截图目录: ${CONFIG.screenshotDir}`);

    // 输出错误页面列表
    const errorItems = results.items.filter(item => !item.success);
    if (errorItems.length > 0) {
      console.log('\n❌ 错误页面列表:');
      errorItems.forEach((item, idx) => {
        console.log(`\n[${idx + 1}] ${item.title}`);
        console.log(`    路径: ${item.path}`);
        console.log(`    组件: ${item.component}`);
        console.log(`    错误类型: ${item.has404 ? '404' : item.hasRouteError ? '路由错误' : item.hasComponentError ? '组件错误' : '控制台错误'}`);
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
quickTestPages().then(results => {
  const errorCount = results.items.filter(item => !item.success).length;
  process.exit(errorCount > 0 ? 1 : 0);
}).catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
});
