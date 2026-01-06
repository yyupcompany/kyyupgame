/**
 * Admin页面智能检测脚本（改进版）
 * 准确区分：页面404、路由错误、组件错误、API错误
 */

const { chromium } = require('playwright');
const fs = require('fs');

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
  outputFile: '/home/zhgue/kyyupgame/k.yyup.com/smart-admin-page-errors.json',
  screenshotDir: '/home/zhgue/kyyupgame/k.yyup.com/test-screenshots/smart-test'
};

async function smartTestPages() {
  console.log('🚀 开始Admin页面智能检测...\n');

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
      pageLoadSuccess: 0,
      pageNotFound: 0,
      routeErrors: 0,
      componentErrors: 0,
      apiErrors: 0
    },
    items: []
  };

  try {
    // 监听所有请求和响应
    const apiErrors = [];
    page.on('response', response => {
      if (response.status() === 404) {
        const url = response.url();
        // 只记录API请求的404，不记录页面本身的404
        if (url.includes('/api/') || !url.endsWith('.html')) {
          apiErrors.push({
            type: 'API_404',
            url: url,
            status: response.status()
          });
        }
      }
    });

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

    // 注入mock token
    console.log('📝 访问首页并注入Mock Token...');
    await page.goto(CONFIG.baseURL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);

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
      apiErrors.length = 0;

      const itemResult = {
        title: menuItem.title,
        path: menuItem.path,
        component: menuItem.component,
        pageLoadSuccess: false,
        pageNotFound: false,
        hasRouteError: false,
        hasComponentError: false,
        apiErrors: [],
        consoleErrors: [],
        pageInfo: {}
      };

      try {
        const url = CONFIG.baseURL + menuItem.path;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(3000);

        // 获取详细的页面状态
        const pageStatus = await page.evaluate(() => {
          const body = document.body;

          return {
            // 页面基本信息
            title: document.title,
            url: window.location.href,

            // 检查是否有真实的404页面（不是路由组件）
            has404Page: body.textContent.includes('404') &&
                       (body.textContent.includes('Not Found') ||
                        body.textContent.includes('页面不存在') ||
                        body.textContent.includes('无法找到')),

            // 检查是否有路由错误
            hasRouteError: body.textContent.includes('Failed to resolve component') ||
                          body.textContent.includes('No route matches'),

            // 检查是否有组件错误
            hasComponentError: body.textContent.includes('Cannot read') ||
                               body.textContent.includes('TypeError') ||
                               body.textContent.includes('ReferenceError') ||
                               body.textContent.includes('Unexpected token'),

            // 页面结构检查
            hasLayout: !!document.querySelector('.layout, #app, main'),
            hasSidebar: !!document.querySelector('.sidebar, aside, [class*="sidebar"]'),
            hasContent: !!document.querySelector('main, .main-content, [class*="content"], .page-content'),

            // 页面是否基本可渲染
            elementCount: document.querySelectorAll('*').length,
            hasVueApp: !!document.querySelector('#app'),
            bodyTextLength: body.textContent.length
          };
        });

        // 判断页面状态
        itemResult.pageNotFound = pageStatus.has404Page;
        itemResult.hasRouteError = pageStatus.hasRouteError;
        itemResult.hasComponentError = pageStatus.hasComponentError;
        itemResult.pageInfo = pageStatus;
        itemResult.apiErrors = [...apiErrors];
        itemResult.consoleErrors = [...consoleErrors];

        // 判断页面是否加载成功
        // 成功标准：有布局结构 + 没有404页面错误
        const pageLoadSuccess = pageStatus.hasLayout &&
                               !pageStatus.has404Page &&
                               !pageStatus.hasRouteError;

        itemResult.pageLoadSuccess = pageLoadSuccess;

        if (pageLoadSuccess) {
          results.summary.pageLoadSuccess++;
          console.log(`   ✅ 页面加载成功`);
        } else {
          if (pageStatus.has404Page) {
            results.summary.pageNotFound++;
            console.error(`   ❌ 页面404`);
          } else if (pageStatus.hasRouteError) {
            results.summary.routeErrors++;
            console.error(`   ❌ 路由错误`);
          } else if (pageStatus.hasComponentError) {
            results.summary.componentErrors++;
            console.error(`   ❌ 组件错误`);
          }
        }

        // API错误统计
        if (apiErrors.length > 0) {
          results.summary.apiErrors += apiErrors.length;
          console.log(`   ⚠️  API错误: ${apiErrors.length}个`);
        }

      } catch (error) {
        itemResult.pageLoadSuccess = false;
        itemResult.error = error.message;
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
    console.log(`   - 页面加载成功: ${results.summary.pageLoadSuccess}`);
    console.log(`   - 页面404: ${results.summary.pageNotFound}`);
    console.log(`   - 路由错误: ${results.summary.routeErrors}`);
    console.log(`   - 组件错误: ${results.summary.componentErrors}`);
    console.log(`   - API错误: ${results.summary.apiErrors}`);
    console.log(`\n📄 详细报告已保存到: ${CONFIG.outputFile}`);

    // 输出成功页面列表
    const successItems = results.items.filter(item => item.pageLoadSuccess);
    if (successItems.length > 0) {
      console.log('\n✅ 成功加载的页面:');
      successItems.forEach(item => {
        console.log(`   - ${item.title} (${item.path})`);
      });
    }

    // 输出失败页面列表
    const failedItems = results.items.filter(item => !item.pageLoadSuccess);
    if (failedItems.length > 0) {
      console.log('\n❌ 加载失败的页面:');
      failedItems.forEach(item => {
        const errorType = item.pageNotFound ? '404' :
                         item.hasRouteError ? '路由错误' :
                         item.hasComponentError ? '组件错误' : '未知错误';
        console.log(`   - ${item.title} (${item.path}) - ${errorType}`);
      });
    }

  } catch (error) {
    console.error('\n❌ 检测过程中发生错误:', error);
  } finally {
    await browser.close();
  }

  return results;
}

// 运行检测
smartTestPages().then(results => {
  const failedCount = results.items.filter(item => !item.pageLoadSuccess).length;
  process.exit(failedCount > 0 ? 1 : 0);
}).catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
});
