/**
 * 教师侧边栏页面错误检测脚本
 * 检测所有教师侧边栏页面的控制台错误和404错误
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

// 教师侧边栏页面列表
const TEACHER_PAGES = [
  { path: '/teacher-center/dashboard', name: '教师工作台' },
  { path: '/teacher-center/notifications', name: '通知中心' },
  { path: '/teacher-center/tasks', name: '任务中心' },
  { path: '/teacher-center/activities', name: '活动中心' },
  { path: '/teacher-center/enrollment', name: '招生中心' },
  { path: '/teacher-center/teaching', name: '教学中心' },
  { path: '/teacher-center/customer-tracking', name: '客户跟踪' },
  { path: '/teacher-center/creative-curriculum', name: 'AI互动课堂' },
  { path: '/teacher-center/performance-rewards', name: '绩效中心' }
];

async function testTeacherSidebarPages() {
  console.log('🚀 开始检测教师侧边栏页面错误...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 收集控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // 忽略ERR_CONNECTION_REFUSED错误（7242端口的监控服务）
      if (!text.includes('ERR_CONNECTION_REFUSED')) {
        consoleErrors.push({
          page: page.url(),
          text: text,
          type: msg.type()
        });
      }
    }
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      page: page.url(),
      message: error.message,
      stack: error.stack
    });
  });

  const results = [];

  try {
    // 1. 访问登录页并登录教师账号
    console.log('📍 步骤1: 登录教师账号...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 检查是否在登录页
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('   在登录页，使用快捷登录...');

      // 点击教师快捷登录按钮
      await page.locator('button:has-text("教师")').click();
      await page.waitForTimeout(3000);
      console.log('   ✅ 教师账号登录完成\n');
    } else {
      console.log('   ✅ 已登录\n');
    }

    // 2. 逐个测试教师侧边栏页面
    console.log('📍 步骤2: 逐个测试教师侧边栏页面...\n');

    for (const pageData of TEACHER_PAGES) {
      console.log(`   测试: ${pageData.name} (${pageData.path})`);

      // 清空之前的错误记录
      const currentPageErrors = [];
      const currentPageConsoleErrors = [];

      // 监听当前页面的错误
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('ERR_CONNECTION_REFUSED')) {
            currentPageConsoleErrors.push(text);
          }
        }
      });

      page.on('pageerror', error => {
        currentPageErrors.push(error.message);
      });

      try {
        // 导航到页面
        await page.goto(BASE_URL + pageData.path, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        await page.waitForTimeout(2000);

        // 获取当前URL
        const finalUrl = page.url();
        const isRedirected = !finalUrl.includes(pageData.path);

        // 检查是否有404或403错误
        const is404 = finalUrl.includes('/404');
        const is403 = finalUrl.includes('/403');

        // 获取页面标题
        const title = await page.title();

        // 检查页面内容是否包含错误信息
        const hasPermissionError = await page.locator('text=权限不足, text=没有权限, text=无权访问').count() > 0;

        let status = '✅ 正常';
        let issues = [];

        if (is404) {
          status = '❌ 404错误';
          issues.push('页面不存在');
        } else if (is403) {
          status = '⚠️  403权限错误';
          issues.push('权限不足');
        } else if (isRedirected) {
          status = '⚠️  重定向';
          issues.push(`重定向到: ${finalUrl}`);
        } else if (hasPermissionError) {
          status = '⚠️  权限错误';
          issues.push('显示权限不足信息');
        }

        // 检查控制台错误
        if (currentPageConsoleErrors.length > 0) {
          status = '⚠️  控制台错误';
          issues.push(`${currentPageConsoleErrors.length}个控制台错误`);
        }

        // 检查页面错误
        if (currentPageErrors.length > 0) {
          status = '⚠️  页面错误';
          issues.push(`${currentPageErrors.length}个页面错误`);
        }

        results.push({
          name: pageData.name,
          path: pageData.path,
          status: status,
          url: finalUrl,
          is404,
          is403,
          isRedirected,
          consoleErrors: currentPageConsoleErrors,
          pageErrors: currentPageErrors,
          issues: issues
        });

        console.log(`   状态: ${status}`);
        if (issues.length > 0) {
          console.log(`   问题: ${issues.join(', ')}`);
        }
        console.log('');

      } catch (error) {
        results.push({
          name: pageData.name,
          path: pageData.path,
          status: '❌ 访问失败',
          url: page.url(),
          is404: false,
          is403: false,
          isRedirected: false,
          consoleErrors: [],
          pageErrors: [error.message],
          issues: [error.message]
        });
        console.log(`   状态: ❌ 访问失败 - ${error.message}\n`);
      }
    }

    // 3. 生成报告
    console.log('\n📍 步骤3: 生成检测报告...\n');
    console.log('='.repeat(80));
    console.log('教师侧边栏页面错误检测报告');
    console.log('='.repeat(80));
    console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`测试页面: ${TEACHER_PAGES.length}个`);
    console.log('='.repeat(80));

    // 统计结果
    const normalCount = results.filter(r => r.status === '✅ 正常').length;
    const error404Count = results.filter(r => r.is404).length;
    const error403Count = results.filter(r => r.is403).length;
    const redirectCount = results.filter(r => r.isRedirected && !r.is403 && !r.is404).length;
    const consoleErrorCount = results.filter(r => r.consoleErrors.length > 0).length;
    const pageErrorCount = results.filter(r => r.pageErrors.length > 0).length;

    console.log('\n📊 统计摘要:');
    console.log(`   正常页面: ${normalCount}个`);
    console.log(`   404错误: ${error404Count}个`);
    console.log(`   403权限错误: ${error403Count}个`);
    console.log(`   重定向: ${redirectCount}个`);
    console.log(`   控制台错误: ${consoleErrorCount}个`);
    console.log(`   页面错误: ${pageErrorCount}个`);

    // 详细结果表格
    console.log('\n📋 详细结果:');
    console.log('-'.repeat(80));
    console.log(sprintf('%-25s %-35s %-15s', '页面名称', '路径', '状态'));
    console.log('-'.repeat(80));

    for (const result of results) {
      console.log(sprintf('%-25s %-35s %-15s',
        result.name,
        result.path,
        result.status
      ));

      if (result.issues.length > 0) {
        console.log(sprintf('  %-77s', `问题: ${result.issues.join('; ')}`));
      }

      if (result.consoleErrors.length > 0) {
        console.log(sprintf('  %-77s', `控制台错误: ${result.consoleErrors.length}个`));
        result.consoleErrors.slice(0, 2).forEach(err => {
          console.log(sprintf('    %-75s', `- ${err.substring(0, 70)}`));
        });
      }

      if (result.pageErrors.length > 0) {
        console.log(sprintf('  %-77s', `页面错误: ${result.pageErrors.length}个`));
        result.pageErrors.slice(0, 2).forEach(err => {
          console.log(sprintf('    %-75s', `- ${err.substring(0, 70)}`));
        });
      }

      console.log('-'.repeat(80));
    }

    // 问题汇总
    const problemPages = results.filter(r => r.status !== '✅ 正常');
    if (problemPages.length > 0) {
      console.log('\n⚠️  需要修复的页面:');
      problemPages.forEach(page => {
        console.log(`   - ${page.name}: ${page.issues.join(', ')}`);
      });
    } else {
      console.log('\n✅ 所有页面检测通过！');
    }

    console.log('\n' + '='.repeat(80));
    console.log('检测完成！');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

// 简单的sprintf函数
function sprintf(format, ...args) {
  let i = 0;
  return format.replace(/%[-+0-9]*s/g, () => {
    return args[i++] || '';
  });
}

// 运行测试
testTeacherSidebarPages().catch(console.error);
