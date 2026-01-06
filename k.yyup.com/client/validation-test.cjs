const { chromium } = require('playwright');

async function validateListComponents() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const results = {
    loginSuccess: false,
    pagesChecked: [],
    componentIssues: []
  };

  try {
    console.log('🔍 开始验证列表组件UI优化效果...');

    // 访问首页
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 截取首页
    await page.screenshot({ path: '/tmp/01-homepage.png', fullPage: true });

    // 尝试查找登录表单
    const usernameInput = await page.locator('input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]').first();
    const passwordInput = await page.locator('input[name="password"], input[placeholder*="密码"], input[type="password"]').first();
    const loginButton = await page.locator('button[type="submit"], button:has-text("登录"), .el-button:has-text("登录")').first();

    if (await usernameInput.isVisible() && await passwordInput.isVisible()) {
      console.log('📝 找到登录表单，尝试登录...');

      // 尝试几种常见的登录凭据
      const credentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'testadmin', password: 'admin123' },
        { username: 'admin', password: '123456' },
        { username: 'demo', password: 'demo' }
      ];

      let loginSuccess = false;
      for (const cred of credentials) {
        try {
          await usernameInput.fill(cred.username);
          await passwordInput.fill(cred.password);
          await loginButton.click();

          // 等待页面跳转或登录完成
          await page.waitForTimeout(3000);

          // 检查是否登录成功（URL变化或出现dashboard元素）
          const currentUrl = page.url();
          if (!currentUrl.includes('/login') && !currentUrl.includes('/auth')) {
            loginSuccess = true;
            results.loginSuccess = true;
            console.log(`✅ 登录成功！使用凭据: ${cred.username}/${cred.password}`);
            break;
          }

          // 如果还在登录页，清除表单尝试下一个
          if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
            await page.goto('http://localhost:5173');
            await page.waitForLoadState('networkidle');
          }
        } catch (error) {
          console.log(`❌ 登录失败: ${cred.username}`);
          continue;
        }
      }

      if (!loginSuccess) {
        console.log('❌ 所有登录凭据都失败了，将尝试直接访问列表页面');
        results.componentIssues.push('无法登录系统，可能影响页面验证结果');
      }
    }

    // 要验证的页面列表
    const pagesToCheck = [
      { name: '教师列表', url: 'http://localhost:5173/teacher', selector: '.el-table, .teacher-list, .data-table' },
      { name: '学生列表', url: 'http://localhost:5173/student', selector: '.el-table, .student-list, .data-table' },
      { name: '活动列表', url: 'http://localhost:5173/activity', selector: '.el-table, .activity-list, .data-table' },
      { name: '班级列表', url: 'http://localhost:5173/class', selector: '.el-table, .class-list, .data-table' },
      { name: '用户管理', url: 'http://localhost:5173/users', selector: '.el-table, .user-list, .data-table' }
    ];

    // 验证每个页面
    for (const pageConfig of pagesToCheck) {
      console.log(`🔍 检查${pageConfig.name}页面...`);

      try {
        await page.goto(pageConfig.url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // 等待页面完全加载

        // 截取页面
        const screenshotPath = `/tmp/${pagesToCheck.indexOf(pageConfig) + 2}-${pageConfig.name.replace(/\s/g, '-')}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // 检查列表组件
        const listComponent = await page.locator(pageConfig.selector).first();
        const hasListComponent = await listComponent.isVisible();

        // 检查UnifiedIcon组件
        const unifiedIcons = await page.locator('.unified-icon, [class*="UnifiedIcon"], [class*="unified-icon"]').count();

        // 检查表格样式
        const tables = await page.locator('table').count();
        const elTables = await page.locator('.el-table').count();

        // 检查响应式设计
        const viewport = page.viewportSize();
        const isMobile = viewport.width < 768;

        const pageResult = {
          name: pageConfig.name,
          url: pageConfig.url,
          screenshot: screenshotPath,
          hasListComponent,
          unifiedIconsCount: unifiedIcons,
          tablesCount: tables,
          elTablesCount: elTables,
          isMobile,
          issues: []
        };

        // 检查常见问题
        if (!hasListComponent) {
          pageResult.issues.push('未找到列表组件');
        }

        if (unifiedIcons === 0) {
          pageResult.issues.push('未检测到UnifiedIcon组件');
        }

        // 检查控制台错误
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        if (consoleErrors.length > 0) {
          pageResult.issues.push(`控制台错误: ${consoleErrors.length}个`);
          pageResult.consoleErrors = consoleErrors;
        }

        results.pagesChecked.push(pageResult);
        console.log(`✅ ${pageConfig.name}页面检查完成`);

      } catch (error) {
        console.log(`❌ ${pageConfig.name}页面检查失败: ${error.message}`);
        results.pagesChecked.push({
          name: pageConfig.name,
          url: pageConfig.url,
          error: error.message,
          issues: ['页面访问失败']
        });
      }
    }

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
    results.componentIssues.push(`验证过程错误: ${error.message}`);
  } finally {
    await browser.close();
  }

  return results;
}

// 运行验证
validateListComponents().then(results => {
  console.log('\n📊 验证结果汇总:');
  console.log('==================');
  console.log(`登录状态: ${results.loginSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`检查页面数: ${results.pagesChecked.length}`);

  results.pagesChecked.forEach(page => {
    console.log(`\n📄 ${page.name}:`);
    console.log(`  - URL: ${page.url}`);
    console.log(`  - 列表组件: ${page.hasListComponent ? '✅' : '❌'}`);
    console.log(`  - UnifiedIcon: ${page.unifiedIconsCount}个`);
    console.log(`  - 表格数量: ${page.tablesCount}个`);
    if (page.issues && page.issues.length > 0) {
      console.log(`  - 问题: ${page.issues.join(', ')}`);
    }
  });

  // 保存结果到文件
  const fs = require('fs');
  fs.writeFileSync('/tmp/validation-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 详细结果已保存到 /tmp/validation-results.json');
}).catch(error => {
  console.error('❌ 运行失败:', error);
});