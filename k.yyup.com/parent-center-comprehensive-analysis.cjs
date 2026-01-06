const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function parentCenterAnalysis() {
  console.log('🎯 家长中心用户体验分析开始...');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });

  const page = await context.newPage();
  const consoleMessages = [];
  const screenshots = [];

  // 监听控制台消息
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    if (msg.type() === 'error') {
      console.log(`❌ 控制台错误: ${msg.text()}`);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.log(`💥 页面错误: ${error.message}`);
    consoleMessages.push({
      type: 'pageerror',
      text: error.message,
      location: { url: page.url(), lineNumber: 0 }
    });
  });

  try {
    console.log('📱 第一步：访问应用首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 截图：首页
    await page.screenshot({
      path: 'screenshots/01-homepage.png',
      fullPage: true
    });
    screenshots.push('01-homepage.png');
    console.log('✅ 首页截图完成');

    console.log('🔑 第二步：查找并使用快速体验登录...');

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    // 查找快速登录相关的元素
    const quickLoginSelectors = [
      'text=快速体验',
      'text=体验登录',
      'text=快速体验登录',
      '.quick-login',
      '.experience-login',
      '[class*="quick"]',
      '[class*="experience"]',
      '.el-button:has-text("快速")',
      '.el-button:has-text("体验")',
      'button:has-text("快速")',
      'button:has-text("体验")'
    ];

    let quickLoginButton = null;
    for (const selector of quickLoginSelectors) {
      try {
        quickLoginButton = await page.$(selector);
        if (quickLoginButton) {
          console.log(`✅ 找到快速登录按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (quickLoginButton) {
      await quickLoginButton.click();
      await page.waitForTimeout(2000);

      // 查找家长角色选项
      const parentRoleSelectors = [
        'text=家长',
        'text=parent',
        '[role*="parent"]',
        '[class*="parent"]',
        '.el-radio:has-text("家长")',
        '.el-checkbox:has-text("家长")',
        'label:has-text("家长")',
        '.role-item:has-text("家长")'
      ];

      let parentRoleOption = null;
      for (const selector of parentRoleSelectors) {
        try {
          parentRoleOption = await page.$(selector);
          if (parentRoleOption) {
            console.log(`✅ 找到家长角色选项: ${selector}`);
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      if (parentRoleOption) {
        await parentRoleOption.click();
        await page.waitForTimeout(1000);

        // 查找确认登录按钮
        const loginConfirmSelectors = [
          'text=确认',
          'text=登录',
          'text=进入',
          'text=开始',
          '.el-button--primary',
          'button[type="submit"]',
          '.login-btn',
          '.confirm-btn'
        ];

        for (const selector of loginConfirmSelectors) {
          try {
            const confirmButton = await page.$(selector);
            if (confirmButton) {
              await confirmButton.click();
              break;
            }
          } catch (e) {
            // 继续尝试下一个选择器
          }
        }

        await page.waitForTimeout(3000);

        // 截图：登录后页面
        await page.screenshot({
          path: 'screenshots/02-after-login.png',
          fullPage: true
        });
        screenshots.push('02-after-login.png');
        console.log('✅ 登录后页面截图完成');

      } else {
        console.log('❌ 未找到家长角色选项，尝试手动设置认证信息...');
        // 手动设置家长角色的认证信息
        await page.evaluate(() => {
          localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIyLCJwaG9uZSI6IjE4NjExMTQxMTMyIiwicm9sZSI6InBhcmVudCIsImlzRGVtbyI6dHJ1ZSwiaWF0IjoxNzY0ODc2ODQ4LCJleHAiOjE3NjU0ODE2NDh9.test');
          localStorage.setItem('userInfo', JSON.stringify({
            "id": 122,
            "username": "parent_test",
            "email": "parent@test.com",
            "realName": "测试家长",
            "phone": "18611141132",
            "role": "parent",
            "isParent": true,
            "status": "active"
          }));
          sessionStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIyLCJwaG9uZSI6IjE4NjExMTQxMTMyIiwicm9sZSI6InBhcmVudCIsImlzRGVtbyI6dHJ1ZSwiaWF0IjoxNzY0ODc2ODQ4LCJleHAiOjE3NjU0ODE2NDh9.test');
        });
        await page.goto('http://localhost:5173');
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('❌ 未找到快速登录按钮，尝试手动设置认证信息...');
      // 手动设置家长角色的认证信息
      await page.evaluate(() => {
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIyLCJwaG9uZSI6IjE4NjExMTQxMTMyIiwicm9sZSI6InBhcmVudCIsImlzRGVtbyI6dHJ1ZSwiaWF0IjoxNzY0ODc2ODQ4LCJleHAiOjE3NjU0ODE2NDh9.test');
        localStorage.setItem('userInfo', JSON.stringify({
          "id": 122,
          "username": "parent_test",
          "email": "parent@test.com",
          "realName": "测试家长",
          "phone": "18611141132",
          "role": "parent",
          "isParent": true,
          "status": "active"
        }));
        sessionStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIyLCJwaG9uZSI6IjE4NjExMTQxMTMyIiwicm9sZSI6InBhcmVudCIsImlzRGVtbyI6dHJ1ZSwiaWF0IjoxNzY0ODc2ODQ4LCJleHAiOjE3NjU0ODE2NDh9.test');
      });
      await page.goto('http://localhost:5173');
      await page.waitForTimeout(3000);
    }

    console.log('🎯 第三步：查找家长中心导航...');

    // 查找家长中心相关的导航
    const parentCenterSelectors = [
      'text=家长中心',
      'text=家长工作台',
      'text=家长管理',
      'a[href*="parent"]',
      '[class*="parent"]',
      '.el-menu-item:has-text("家长")',
      'a:has-text("家长")',
      '.nav-item:has-text("家长")'
    ];

    let parentCenterLink = null;
    let foundSelector = null;

    for (const selector of parentCenterSelectors) {
      try {
        parentCenterLink = await page.$(selector);
        if (parentCenterLink) {
          foundSelector = selector;
          console.log(`✅ 找到家长中心链接: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (parentCenterLink) {
      await parentCenterLink.click();
      await page.waitForTimeout(2000);

      // 截图：家长中心页面
      await page.screenshot({
        path: 'screenshots/03-parent-center.png',
        fullPage: true
      });
      screenshots.push('03-parent-center.png');
      console.log('✅ 家长中心页面截图完成');
    }

    console.log('📋 第四步：逐一测试家长中心子页面...');

    // 家长中心子页面列表
    const parentCenterPages = [
      { path: '/parent-center/dashboard', name: '家长中心工作台' },
      { path: '/parent-center/children', name: '孩子管理' },
      { path: '/parent-center/activities', name: '活动管理' },
      { path: '/parent-center/assessment', name: '成长评估' },
      { path: '/parent-center/communication', name: '家校沟通' },
      { path: '/parent-center/messages', name: '消息中心' },
      { path: '/parent-center/notifications', name: '通知管理' },
      { path: '/parent-center/settings', name: '设置管理' },
      { path: '/parent-center/profile', name: '个人资料' },
      { path: '/parent-center/assignments', name: '作业管理' },
      { path: '/parent-center/attendance', name: '考勤管理' },
      { path: '/parent-center/fees', name: '费用管理' },
      { path: '/parent-center/reports', name: '报告管理' }
    ];

    const pageAnalysisResults = [];

    for (let i = 0; i < parentCenterPages.length; i++) {
      const pageInfo = parentCenterPages[i];
      console.log(`\n🔍 测试页面 ${i + 1}/${parentCenterPages.length}: ${pageInfo.name}`);
      console.log(`路径: ${pageInfo.path}`);

      try {
        const consoleErrorsBefore = consoleMessages.filter(msg => msg.type === 'error').length;

        // 访问页面
        await page.goto(`http://localhost:5173${pageInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });
        await page.waitForTimeout(3000);

        // 页面分析
        const currentUrl = page.url();
        const pageTitle = await page.title();

        // 检查是否跳转到错误页面
        const isErrorPage = currentUrl.includes('/404') ||
                           currentUrl.includes('/error') ||
                           currentUrl.includes('/login');

        // 检查页面内容
        let pageContent = '';
        let hasMainContent = false;

        try {
          pageContent = await page.$eval('body', el => el.innerText.substring(0, 200));
          hasMainContent = pageContent.length > 50;
        } catch (e) {
          pageContent = '无法获取页面内容';
        }

        // 检查是否有页面加载错误
        const pageErrors = await page.$$eval('.el-error, .error-message, .error-page',
          errors => errors.length > 0
        ).catch(() => false);

        // 截图
        const screenshotName = `04-page-${i + 1}-${pageInfo.name.replace(/[\/\s]/g, '-')}.png`;
        const screenshotPath = `screenshots/${screenshotName}`;

        try {
          await page.screenshot({
            path: screenshotPath,
            fullPage: true
          });
          screenshots.push(screenshotName);
        } catch (e) {
          console.log(`⚠️ 截图失败: ${e.message}`);
        }

        // 检查新的控制台错误
        const newConsoleErrors = consoleMessages.slice(consoleErrorsBefore);
        const hasConsoleErrors = newConsoleErrors.length > 0;

        // 记录结果
        const result = {
          page: pageInfo.name,
          path: pageInfo.path,
          url: currentUrl,
          title: pageTitle,
          success: !isErrorPage && hasMainContent,
          hasErrors: hasConsoleErrors || pageErrors,
          errorCount: newConsoleErrors.length,
          contentLength: pageContent.length,
          hasMainContent: hasMainContent,
          screenshot: screenshotPath,
          errors: newConsoleErrors.map(e => e.text)
        };

        pageAnalysisResults.push(result);

        // 输出结果
        if (result.success) {
          console.log(`✅ 成功访问: ${pageInfo.name}`);
          console.log(`   URL: ${currentUrl}`);
          console.log(`   标题: ${pageTitle}`);
          if (result.hasErrors) {
            console.log(`⚠️ 发现 ${result.errorCount} 个控制台错误`);
          }
        } else {
          console.log(`❌ 访问失败: ${pageInfo.name}`);
          console.log(`   原因: ${isErrorPage ? '页面重定向' : '内容为空'}`);
          console.log(`   URL: ${currentUrl}`);
        }

      } catch (error) {
        console.log(`💥 页面访问异常: ${pageInfo.name} - ${error.message}`);

        pageAnalysisResults.push({
          page: pageInfo.name,
          path: pageInfo.path,
          success: false,
          hasErrors: true,
          errorCount: 1,
          errorMessage: error.message,
          errors: [error.message]
        });
      }
    }

    // 创建截图目录
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    // 生成分析报告
    console.log('\n📊 生成分析报告...');

    const report = generateAnalysisReport(pageAnalysisResults, screenshots, consoleMessages);

    // 保存报告到文件
    fs.writeFileSync('parent-center-analysis-report.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      pages: pageAnalysisResults,
      screenshots: screenshots,
      consoleMessages: consoleMessages,
      summary: {
        totalPages: parentCenterPages.length,
        successfulPages: pageAnalysisResults.filter(r => r.success).length,
        failedPages: pageAnalysisResults.filter(r => !r.success).length,
        pagesWithErrors: pageAnalysisResults.filter(r => r.hasErrors).length,
        totalConsoleErrors: consoleMessages.filter(msg => msg.type === 'error').length
      }
    }, null, 2));

    console.log('✅ 分析报告已保存到 parent-center-analysis-report.json');

  } catch (error) {
    console.error('💥 分析过程出错:', error.message);
  } finally {
    await browser.close();
  }

  // 生成控制台报告
  return pageAnalysisResults;
}

function generateAnalysisReport(results, screenshots, consoleMessages) {
  const successfulPages = results.filter(r => r.success);
  const failedPages = results.filter(r => !r.success);
  const pagesWithErrors = results.filter(r => r.hasErrors);

  console.log('\n📋 ===== 家长中心用户体验分析报告 =====');
  console.log(`📊 总体统计:`);
  console.log(`   - 总页面数: ${results.length}`);
  console.log(`   - 成功访问: ${successfulPages.length} (${(successfulPages.length/results.length*100).toFixed(1)}%)`);
  console.log(`   - 访问失败: ${failedPages.length} (${(failedPages.length/results.length*100).toFixed(1)}%)`);
  console.log(`   - 有错误页面: ${pagesWithErrors.length} (${(pagesWithErrors.length/results.length*100).toFixed(1)}%)`);
  console.log(`   - 控制台错误总数: ${consoleMessages.filter(msg => msg.type === 'error').length}`);

  console.log('\n✅ 成功访问的页面:');
  successfulPages.forEach(page => {
    console.log(`   ✅ ${page.name} - ${page.path}`);
  });

  if (failedPages.length > 0) {
    console.log('\n❌ 访问失败的页面:');
    failedPages.forEach(page => {
      console.log(`   ❌ ${page.name} - ${page.path}`);
      if (page.errorMessage) {
        console.log(`      错误: ${page.errorMessage}`);
      }
    });
  }

  if (pagesWithErrors.length > 0) {
    console.log('\n⚠️ 有控制台错误的页面:');
    pagesWithErrors.forEach(page => {
      console.log(`   ⚠️ ${page.name} - ${page.path} (${page.errorCount}个错误)`);
      page.errors.forEach(error => {
        console.log(`      - ${error}`);
      });
    });
  }

  console.log('\n📸 截图文件:');
  screenshots.forEach(screenshot => {
    console.log(`   📸 ${screenshot}`);
  });

  return {
    summary: {
      total: results.length,
      successful: successfulPages.length,
      failed: failedPages.length,
      withErrors: pagesWithErrors.length,
      successRate: (successfulPages.length/results.length*100).toFixed(1)
    },
    details: results
  };
}

// 运行分析
parentCenterAnalysis().catch(console.error);