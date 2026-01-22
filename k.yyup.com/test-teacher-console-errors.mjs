/**
 * 教师侧边栏页面控制台错误详细检测脚本
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

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

async function testConsoleErrors() {
  console.log('🔍 详细检测教师侧边栏页面控制台错误...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const allErrors = [];

  try {
    // 登录
    console.log('📍 登录教师账号...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    if (page.url().includes('/login')) {
      await page.locator('button:has-text("教师")').click();
      await page.waitForTimeout(3000);
      console.log('   ✅ 登录完成\n');
    }

    // 逐个测试页面
    for (const pageData of TEACHER_PAGES) {
      console.log(`📍 测试: ${pageData.name}`);

      const pageErrors = [];

      // 监听网络请求错误
      page.on('response', response => {
        if (response.status() >= 400) {
          const url = response.url();
          // 忽略7242端口的错误
          if (!url.includes('7242')) {
            pageErrors.push({
              type: 'HTTP错误',
              status: response.status(),
              url: url,
              method: response.request().method()
            });
          }
        }
      });

      // 监听控制台错误
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('ERR_CONNECTION_REFUSED') && !text.includes('7242')) {
            pageErrors.push({
              type: '控制台错误',
              text: text
            });
          }
        }
      });

      await page.goto(BASE_URL + pageData.path, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      await page.waitForTimeout(2000);

      if (pageErrors.length > 0) {
        console.log(`   ⚠️  发现 ${pageErrors.length} 个错误:`);

        // 分类显示错误
        const httpErrors = pageErrors.filter(e => e.type === 'HTTP错误');
        const consoleErrs = pageErrors.filter(e => e.type === '控制台错误');

        if (httpErrors.length > 0) {
          console.log(`   HTTP错误 (${httpErrors.length}个):`);
          httpErrors.forEach(err => {
            console.log(`     - [${err.status}] ${err.method} ${err.url.substring(0, 80)}`);
          });
        }

        if (consoleErrs.length > 0) {
          console.log(`   控制台错误 (${consoleErrs.length}个):`);
          consoleErrs.forEach(err => {
            console.log(`     - ${err.text.substring(0, 100)}`);
          });
        }

        allErrors.push({
          page: pageData.name,
          path: pageData.path,
          errors: pageErrors
        });
      } else {
        console.log(`   ✅ 无错误`);
      }

      console.log('');
    }

    // 汇总报告
    console.log('\n' + '='.repeat(80));
    console.log('错误汇总报告');
    console.log('='.repeat(80));

    if (allErrors.length === 0) {
      console.log('✅ 所有页面均无错误！');
    } else {
      console.log(`⚠️  ${allErrors.length} 个页面存在错误:\n`);

      allErrors.forEach(item => {
        console.log(`📍 ${item.page} (${item.path})`);
        console.log(`   错误总数: ${item.errors.length}个`);

        const httpErrors = item.errors.filter(e => e.type === 'HTTP错误');
        const consoleErrs = item.errors.filter(e => e.type === '控制台错误');

        if (httpErrors.length > 0) {
          console.log(`   HTTP错误: ${httpErrors.length}个`);
        }

        if (consoleErrs.length > 0) {
          console.log(`   控制台错误: ${consoleErrs.length}个`);
        }

        console.log('');
      });

      // 统计常见错误
      console.log('\n📊 错误统计:');

      const errorUrls = {};
      allErrors.forEach(item => {
        item.errors.forEach(err => {
          if (err.type === 'HTTP错误') {
            const key = `${err.status} - ${err.url.substring(0, 60)}`;
            errorUrls[key] = (errorUrls[key] || 0) + 1;
          }
        });
      });

      console.log('\n最频繁的HTTP错误:');
      Object.entries(errorUrls)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([url, count]) => {
          console.log(`  ${count}次: ${url}`);
        });
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

testConsoleErrors().catch(console.error);
