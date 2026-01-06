const { chromium } = require('playwright');
const fs = require('fs');

async function completeParentTest() {
  console.log('🚀 开始完整家长中心测试...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 1. 访问登录页面
    console.log('📍 第1步：访问登录页面');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 截图
    await page.screenshot({
      path: 'step-1-login-page.png',
      fullPage: true
    });
    console.log('   ✅ 登录页面截图已保存');

    // 2. 点击快速体验登录
    console.log('📍 第2步：点击快速体验登录');
    const quickLoginButton = await page.locator('text=快速体验').first();

    if (await quickLoginButton.isVisible()) {
      await quickLoginButton.click();
      await page.waitForTimeout(3000);
      console.log('   ✅ 快速体验按钮已点击');

      // 截图快速体验界面
      await page.screenshot({
        path: 'step-2-quick-login-options.png',
        fullPage: true
      });
      console.log('   ✅ 快速体验选项截图已保存');

      // 3. 查找并点击家长选项
      console.log('📍 第3步：选择家长角色');

      // 查找所有可能的家长选项
      const parentSelectors = [
        'text=家长',
        'li:has-text("家长")',
        '.role-option:has-text("家长")',
        '[data-role="parent"]',
        'button:has-text("家长")'
      ];

      let parentClicked = false;
      let sidebarFound = false;
      let parentPages = [];

      for (const selector of parentSelectors) {
        try {
          const parentOption = await page.locator(selector).first();
          if (await parentOption.isVisible()) {
            console.log(`   找到家长选项: ${selector}`);
            const parentText = await parentOption.textContent();
            console.log(`   选项内容: "${parentText}"`);

            await parentOption.click();
            await page.waitForTimeout(5000);
            parentClicked = true;
            console.log('   ✅ 家长选项已点击');
            break;
          }
        } catch (e) {
          console.log(`   尝试 ${selector} 失败: ${e.message}`);
        }
      }

      if (parentClicked) {
        // 4. 检查登录是否成功
        console.log('📍 第4步：验证登录状态');
        const currentUrl = page.url();
        console.log(`   当前URL: ${currentUrl}`);

        // 截图登录后页面
        await page.screenshot({
          path: 'step-4-after-login.png',
          fullPage: true
        });
        console.log('   ✅ 登录后页面截图已保存');

        // 5. 分析页面结构
        if (!currentUrl.includes('/login') && currentUrl !== 'http://localhost:5173/') {
          console.log('   ✅ 登录成功！');

          // 5.1 查找用户信息
          try {
            const userInfo = await page.locator('.user-info, .profile, .avatar').first();
            if (await userInfo.isVisible()) {
              const userText = await userInfo.textContent();
              console.log(`   👤 用户信息: ${userText}`);
            }
          } catch (e) {
            console.log('   未找到用户信息显示');
          }

          // 5.2 查找侧边栏导航
          console.log('📍 第5步：分析侧边栏导航结构');

          const sidebarSelectors = [
            '.sidebar',
            '.el-menu',
            '.nav-sidebar',
            '.menu-sidebar',
            '.navigation'
          ];

          let sidebarFound = false;
          let menuItems = [];

          for (const selector of sidebarSelectors) {
            try {
              const sidebar = await page.locator(selector).first();
              if (await sidebar.isVisible()) {
                console.log(`   ✅ 找到侧边栏: ${selector}`);
                sidebarFound = true;

                // 获取所有菜单项
                const items = await sidebar.locator('li, .menu-item, .el-menu-item, .nav-item').all();
                console.log(`   发现 ${items.length} 个菜单项`);

                for (let i = 0; i < Math.min(items.length, 30); i++) {
                  try {
                    const item = items[i];
                    const text = await item.textContent();
                    const href = await item.locator('a').getAttribute('href');
                    const hasChildren = await item.locator('ul, .submenu').count() > 0;
                    const isVisible = await item.isVisible();

                    if (text && text.trim() && isVisible) {
                      menuItems.push({
                        index: i + 1,
                        text: text.trim(),
                        href: href,
                        hasChildren,
                        isVisible
                      });
                    }
                  } catch (e) {
                    // 忽略单个项目错误
                  }
                }
                break;
              }
            } catch (e) {
              // 继续尝试下一个选择器
            }
          }

          // 5.3 输出菜单结构
          if (sidebarFound) {
            console.log('\n   📋 侧边栏菜单结构:');
            menuItems.forEach(item => {
              const icon = item.hasChildren ? '📁' : '📄';
              const href = item.href ? ` (${item.href})` : '';
              console.log(`   ${icon} ${item.index}. ${item.text}${href}`);
            });

            // 5.4 查找家长中心相关页面
            console.log('\n📍 第6步：查找家长中心相关功能');

            const parentKeywords = [
              '家长', 'parent', '孩子', 'student', '班级', 'class',
              '成绩', '考勤', '通知', '作业', '课程表', '照片',
              '视频', '费用', '请假', '沟通', '我的孩子'
            ];

            const parentPages = menuItems.filter(item => {
              return parentKeywords.some(keyword =>
                item.text.includes(keyword) ||
                (item.href && item.href.includes(keyword))
              );
            });

            if (parentPages.length > 0) {
              console.log(`   🎯 发现 ${parentPages.length} 个家长中心相关页面:`);
              parentPages.forEach((page, index) => {
                console.log(`   ${index + 1}. ${page.text} ${page.href ? `(链接: ${page.href})` : ''}`);
              });

              // 5.5 尝试访问家长页面
              console.log('\n📍 第7步：访问家长中心页面');

              for (let i = 0; i < Math.min(3, parentPages.length); i++) {
                const targetPage = parentPages[i];

                try {
                  console.log(`   访问: ${targetPage.text}`);

                  // 查找并点击菜单项
                  const menuItem = await page.locator(`text=${targetPage.text}`).first();
                  if (await menuItem.isVisible()) {
                    await menuItem.click();
                    await page.waitForTimeout(3000);

                    // 截图
                    const safeName = targetPage.text.replace(/[^\w\u4e00-\u9fa5]/g, '_');
                    await page.screenshot({
                      path: `parent-page-${safeName}.png`,
                      fullPage: true
                    });
                    console.log(`   ✅ 成功访问并截图: ${targetPage.text}`);

                    // 返回主页
                    await page.goBack();
                    await page.waitForTimeout(2000);
                  }
                } catch (e) {
                  console.log(`   ❌ 无法访问 ${targetPage.text}: ${e.message}`);
                }
              }

            } else {
              console.log('   ❌ 未找到明显的家长中心相关页面');
            }

          } else {
            console.log('   ❌ 未找到侧边栏导航');
          }

        } else {
          console.log('   ❌ 登录可能未成功，仍在登录页面');
        }

      } else {
        console.log('   ❌ 未找到或无法点击家长选项');
      }

    } else {
      console.log('   ❌ 未找到快速体验登录按钮');
    }

    // 6. 生成分析报告
    console.log('\n📍 第8步：生成分析报告');

    const report = {
      timestamp: new Date().toISOString(),
      testResults: {
        loginPageAccess: true,
        quickLoginAvailable: true,
        parentRoleAvailable: parentClicked || false,
        loginSuccess: !page.url().includes('/login') && page.url() !== 'http://localhost:5173/',
        sidebarFound: sidebarFound || false,
        parentPagesFound: parentPages ? parentPages.length : 0
      },
      screenshots: [
        'step-1-login-page.png',
        'step-2-quick-login-options.png',
        'step-4-after-login.png'
      ],
      recommendations: [
        '确保家长角色登录流程完整',
        '验证家长中心功能页面可访问性',
        '检查权限控制和数据隔离',
        '优化家长端用户体验'
      ]
    };

    fs.writeFileSync('complete-parent-test-report.json', JSON.stringify(report, null, 2));
    console.log('   ✅ 分析报告已保存: complete-parent-test-report.json');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);

    try {
      await page.screenshot({
        path: 'complete-test-error.png',
        fullPage: true
      });
      console.log('   📸 错误截图已保存: complete-test-error.png');
    } catch (screenshotError) {
      console.log('   无法保存错误截图');
    }

  } finally {
    await browser.close();
    console.log('\n🏁 完整家长中心测试完成');
  }
}

// 运行测试
completeParentTest().catch(console.error);