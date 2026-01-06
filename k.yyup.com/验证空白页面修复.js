const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const results = {
    passed: [],
    failed: [],
    blank: []
  };

  try {
    console.log('=== 前端空白页面修复验证测试 ===\n');

    // 1. 访问登录页面
    console.log('1. 访问登录页面...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);

    // 2. 登录admin
    console.log('2. 登录admin账户...');
    const usernameInput = await page.$('input[type="text"], input[name="username"]');
    if (usernameInput) {
      await usernameInput.type('admin', { delay: 100 });
    }

    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.type('admin123', { delay: 100 });
    }

    const loginButton = await page.$('button[type="submit"], button:has-text("登录")');
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(3000);
    }

    await page.waitForLoadState('networkidle0');
    console.log('登录完成\n');

    // 3. 需要测试的路由列表（基于分析报告）
    const routesToTest = [
      { path: '/dashboard', name: '数据概览' },
      { path: '/activities', name: '活动管理' },
      { path: '/classes', name: '班级管理' },
      { path: '/teachers', name: '教师管理' },
      { path: '/students', name: '学生管理' },
      { path: '/parents', name: '家长管理' },
      { path: '/system', name: '系统管理' },
      { path: '/enrollment-plans', name: '招生计划' },
      { path: '/enrollment-applications', name: '招生申请' },
      { path: '/enrollment-consultations', name: '招生咨询' },
      { path: '/customer-pool', name: '客户池' },
      { path: '/analytics', name: '分析报告' },
      { path: '/statistics', name: '统计分析' },
      { path: '/marketing-campaigns', name: '营销活动' },
      { path: '/performance-evaluations', name: '绩效评估' },
      { path: '/principal', name: '园长工作台' },
      { path: '/ai/query', name: 'AI智能查询' },
      { path: '/chat', name: 'AI聊天' },
      { path: '/aiassistant', name: 'AI助手' } // 这个应该正常
    ];

    // 4. 测试每个路由
    console.log('3. 开始测试所有路由...\n');

    for (const route of routesToTest) {
      console.log(`测试: ${route.name} (${route.path})`);

      try {
        await page.goto(`http://localhost:5173${route.path}`, {
          waitUntil: 'networkidle0',
          timeout: 10000
        });

        await page.waitForTimeout(2000);

        // 检查页面内容
        const content = await page.evaluate(() => {
          const bodyText = document.body.textContent || '';
          const hasError = !!document.querySelector('.error, .alert-error, .el-message, [class*="error"]');
          const has404 = bodyText.includes('404') || bodyText.includes('Not Found');
          const hasEmpty = bodyText.trim().length < 100;

          return {
            length: bodyText.trim().length,
            has404,
            hasError,
            hasEmpty,
            title: document.title
          };
        });

        if (content.has404) {
          results.failed.push({
            name: route.name,
            path: route.path,
            reason: '404页面未找到'
          });
          console.log(`  ❌ 404页面未找到`);
        } else if (content.hasEmpty) {
          results.blank.push({
            name: route.name,
            path: route.path,
            reason: '页面内容为空'
          });
          console.log(`  ⚠️  页面内容为空`);
        } else {
          results.passed.push({
            name: route.name,
            path: route.path
          });
          console.log(`  ✅ 正常 (内容长度: ${content.length})`);
        }

      } catch (error) {
        results.failed.push({
          name: route.name,
          path: route.path,
          reason: error.message
        });
        console.log(`  ❌ 错误: ${error.message}`);
      }
    }

    // 5. 输出测试结果
    console.log('\n\n=== 测试结果汇总 ===');
    console.log(`✅ 通过: ${results.passed.length} 个`);
    console.log(`⚠️  空白: ${results.blank.length} 个`);
    console.log(`❌ 失败: ${results.failed.length} 个`);
    console.log(`📊 总计: ${routesToTest.length} 个`);

    if (results.passed.length > 0) {
      console.log('\n✅ 正常工作的页面:');
      results.passed.forEach(item => {
        console.log(`  - ${item.name} (${item.path})`);
      });
    }

    if (results.blank.length > 0) {
      console.log('\n⚠️  仍是空白的页面:');
      results.blank.forEach(item => {
        console.log(`  - ${item.name} (${item.path})`);
      });
    }

    if (results.failed.length > 0) {
      console.log('\n❌ 测试失败的页面:');
      results.failed.forEach(item => {
        console.log(`  - ${item.name} (${item.path})`);
        console.log(`    原因: ${item.reason}`);
      });
    }

    // 6. 生成修复建议
    console.log('\n\n=== 修复建议 ===');
    if (results.blank.length > 0 || results.failed.length > 0) {
      console.log('仍有页面需要修复，建议：');
      console.log('1. 检查 navigation.ts 中的路径是否正确');
      console.log('2. 在 optimized-routes.ts 中添加缺失的路由');
      console.log('3. 确保路由指向的组件文件存在');
      console.log('4. 检查权限配置是否正确');
    } else {
      console.log('🎉 所有页面都正常工作！修复成功！');
    }

  } catch (error) {
    console.error('测试执行失败:', error);
  } finally {
    await browser.close();
  }
})();
