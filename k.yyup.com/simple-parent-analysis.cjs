const { chromium } = require('playwright');
const fs = require('fs');

async function simpleParentAnalysis() {
  console.log('🚀 开始简化版家长中心分析...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 访问登录页面
    console.log('📍 访问登录页面: http://localhost:5173');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // 截图
    await page.screenshot({
      path: 'login-analysis.png',
      fullPage: true
    });

    console.log('📸 登录页面截图已保存: login-analysis.png');

    // 获取页面标题
    const title = await page.title();
    console.log(`   页面标题: ${title}`);

    // 查找所有可见文本
    const bodyText = await page.textContent('body');

    console.log('\n🔍 页面内容分析:');

    // 查找登录相关元素
    const loginElements = {
      '用户名输入框': 'input[name="username"], input[placeholder*="用户"], input[type="text"]',
      '密码输入框': 'input[name="password"], input[placeholder*="密码"], input[type="password"]',
      '登录按钮': 'button[type="submit"], .login-btn, [data-testid*="login"]',
      '快速体验': 'text=快速体验',
      '家长选项': 'text=家长'
    };

    for (const [name, selector] of Object.entries(loginElements)) {
      try {
        const element = await page.locator(selector).first();
        const visible = await element.isVisible();
        const count = await page.locator(selector).count();
        console.log(`   ${name}: ${visible ? '✅ 可见' : '❌ 不可见'} (数量: ${count})`);

        if (visible && name === '家长选项') {
          const parentText = await element.textContent();
          console.log(`     内容: "${parentText}"`);
        }
      } catch (e) {
        console.log(`   ${name}: ❌ 未找到`);
      }
    }

    // 查找所有包含"家长"的元素
    console.log('\n👨‍👩‍👧‍👦 查找家长相关功能:');
    const parentElements = await page.locator('text=家长').all();
    console.log(`   找到 ${parentElements.length} 个包含"家长"的元素`);

    for (let i = 0; i < Math.min(parentElements.length, 5); i++) {
      try {
        const element = parentElements[i];
        const text = await element.textContent();
        const parent = await element.locator('..').textContent();
        console.log(`   ${i + 1}. "${text}" (上下文: "${parent.substring(0, 50)}...")`);
      } catch (e) {
        console.log(`   ${i + 1}. 无法获取内容`);
      }
    }

    // 查找快速体验登录的具体选项
    console.log('\n⚡ 快速体验登录选项:');
    const quickLoginContainers = ['.quick-login', '.demo-login', '.experience-login'];

    for (const container of quickLoginContainers) {
      try {
        const containerElement = await page.locator(container).first();
        if (await containerElement.isVisible()) {
          console.log(`   ✅ 找到快速体验容器: ${container}`);

          // 查找选项
          const options = await containerElement.locator('li, .option, .role-option, button, .item').all();
          console.log(`   选项数量: ${options.length}`);

          for (let i = 0; i < Math.min(options.length, 10); i++) {
            const option = options[i];
            const text = await option.textContent();
            if (text && text.trim()) {
              console.log(`     - ${text.trim()}`);
            }
          }
        }
      } catch (e) {
        // 继续尝试下一个容器
      }
    }

    // 尝试点击快速体验
    console.log('\n🔐 尝试使用快速体验登录...');

    const quickLoginButton = await page.locator('text=快速体验').first();
    if (await quickLoginButton.isVisible()) {
      console.log('   点击快速体验按钮...');
      await quickLoginButton.click();
      await page.waitForTimeout(3000);

      // 查看是否出现角色选择
      const roleOptions = await page.locator('li, .role-option, [data-role]').all();
      if (roleOptions.length > 0) {
        console.log(`   ✅ 发现 ${roleOptions.length} 个角色选项:`);

        for (let i = 0; i < Math.min(roleOptions.length, 10); i++) {
          const option = roleOptions[i];
          const text = await option.textContent();
          if (text && text.trim()) {
            console.log(`     - ${text.trim()}`);

            // 如果找到家长选项，尝试点击
            if (text.includes('家长')) {
              console.log(`   👆 点击家长选项: "${text.trim()}"`);
              await option.click();
              await page.waitForTimeout(5000);

              // 检查是否登录成功
              const currentUrl = page.url();
              console.log(`   当前页面: ${currentUrl}`);

              if (!currentUrl.includes('/login')) {
                console.log('   ✅ 登录成功！');

                // 截图登录后的页面
                await page.screenshot({
                  path: 'parent-dashboard.png',
                  fullPage: true
                });
                console.log('   📸 家长中心截图已保存: parent-dashboard.png');

                // 查找侧边栏
                const sidebar = await page.locator('.sidebar, .el-menu, .nav-menu').first();
                if (await sidebar.isVisible()) {
                  console.log('   ✅ 找到侧边栏导航');

                  // 获取菜单项
                  const menuItems = await sidebar.locator('li, .menu-item, .el-menu-item').all();
                  console.log(`   菜单项数量: ${menuItems.length}`);

                  console.log('   📋 侧边栏菜单:');
                  for (let i = 0; i < Math.min(menuItems.length, 20); i++) {
                    const item = menuItems[i];
                    const text = await item.textContent();
                    if (text && text.trim()) {
                      console.log(`     ${i + 1}. ${text.trim()}`);
                    }
                  }
                }
              }
              break;
            }
          }
        }
      }
    }

    // 保存HTML内容
    const htmlContent = await page.content();
    fs.writeFileSync('login-page-analysis.html', htmlContent);
    console.log('\n📄 页面HTML已保存: login-page-analysis.html');

  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);

    // 错误截图
    try {
      await page.screenshot({
        path: 'analysis-error.png',
        fullPage: true
      });
      console.log('   📸 错误截图已保存: analysis-error.png');
    } catch (screenshotError) {
      console.log('   无法保存错误截图');
    }

  } finally {
    await browser.close();
    console.log('\n🏁 分析任务完成');
  }
}

// 运行分析
simpleParentAnalysis().catch(console.error);