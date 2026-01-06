import { chromium } from 'playwright';

async function testThemeSelector() {
  console.log('🚀 开始主题选择器测试...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    console.log('🌐 访问应用主页...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    console.log('📸 截取登录页面...');
    await page.screenshot({ path: 'theme-login.png' });

    // 快速登录（点击管理员按钮）
    console.log('🔐 执行快速登录...');
    const adminButton = await page.$('.admin-btn, button:has-text("系统管理员")');
    if (adminButton) {
      console.log('✅ 找到管理员登录按钮');
      await adminButton.click();
      console.log('⏳ 等待页面跳转...');
      await page.waitForTimeout(5000);

      // 等待页面加载完成，检查是否已经进入主界面
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 检查是否有主题切换器（表示已登录）
      const themeBtnAfterLogin = await page.$('.theme-toggle-btn, button[title*="主题"]');
      if (themeBtnAfterLogin) {
        console.log('✅ 登录成功，已进入主界面');
      } else {
        console.log('⚠️ 可能还在登录页面，继续等待...');
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('⚠️ 未找到管理员登录按钮，尝试其他方式登录');
      // 尝试其他登录按钮
      const anyLoginBtn = await page.$('.quick-btn');
      if (anyLoginBtn) {
        await anyLoginBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    console.log('📸 截取登录后页面...');
    await page.screenshot({ path: 'theme-logged-in.png' });

    // 查找主题切换器按钮
    console.log('🔍 查找主题切换器按钮...');

    // 尝试多种选择器
    const themeButtonSelectors = [
      '.theme-toggle-btn',
      'button[title*="主题"]',
      'button[title*="当前主题"]',
      'button.el-button--circle[title]',
      '.el-button--circle'
    ];

    let themeButton = null;
    for (const selector of themeButtonSelectors) {
      try {
        themeButton = await page.$(selector);
        if (themeButton) {
          const title = await themeButton.getAttribute('title');
          console.log(`✅ 找到按钮: ${selector}, 标题: ${title}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (!themeButton) {
      // 查找所有按钮
      const buttons = await page.$$('button');
      console.log(`📋 页面上共有 ${buttons.length} 个按钮`);

      for (let i = 0; i < Math.min(10, buttons.length); i++) {
        try {
          const text = await buttons[i].textContent();
          const title = await buttons[i].getAttribute('title');
          const classes = await buttons[i].getAttribute('class');

          console.log(`   按钮${i+1}: text="${text}", title="${title}", class="${classes}"`);

          // 检查是否是主题相关按钮
          if (title && (title.includes('主题') || title.includes('theme'))) {
            themeButton = buttons[i];
            console.log(`✅ 找到主题按钮: ${title}`);
            break;
          }

          // 检查class是否包含theme相关
          if (classes && (classes.includes('theme') || classes.includes('Theme'))) {
            themeButton = buttons[i];
            console.log(`✅ 找到主题按钮: ${classes}`);
            break;
          }
        } catch (e) {
          console.log(`   按钮${i+1}: 无法获取信息`);
        }
      }
    }

    if (themeButton) {
      console.log('🖱️ 点击主题切换器...');
      await themeButton.click();
      await page.waitForTimeout(1000);

      console.log('📸 截取下拉菜单...');
      await page.screenshot({ path: 'theme-dropdown.png' });

      // 查找主题选项
      const themeOptions = await page.$$('.theme-option, .el-dropdown-item');
      console.log(`📋 找到 ${themeOptions.length} 个主题选项`);

      const themeNames = [];
      for (let i = 0; i < themeOptions.length; i++) {
        try {
          const option = themeOptions[i];
          const text = await option.textContent();
          if (text) {
            themeNames.push(text.trim());
            console.log(`   ${i+1}. ${text.trim()}`);
          }

          // 测试前3个主题
          if (i < 3) {
            console.log(`🎨 测试切换到主题: ${text.trim() || '选项' + (i+1)}`);

            // 重新打开下拉菜单（如果已关闭）
            const dropdownVisible = await page.$('.el-dropdown-menu:visible, .theme-dropdown:visible');
            if (!dropdownVisible) {
              await themeButton.click();
              await page.waitForTimeout(500);
            }

            // 点击主题选项
            await option.click();
            await page.waitForTimeout(2000);

            // 截图
            const filename = `theme-test-${i+1}.png`;
            await page.screenshot({ path: filename });
            console.log(`   📸 已保存截图: ${filename}`);

            // 检查主题是否应用
            const htmlClasses = await page.evaluate(() => {
              return {
                html: document.documentElement.className,
                body: document.body.className,
                dataTheme: document.documentElement.getAttribute('data-theme')
              };
            });

            console.log(`   📊 HTML类: ${htmlClasses.html}`);
            console.log(`   📊 Body类: ${htmlClasses.body}`);
            console.log(`   📊 Data主题: ${htmlClasses.dataTheme}`);
          }
        } catch (e) {
          console.log(`   ⚠️ 测试选项 ${i+1} 时出错: ${e.message}`);
        }
      }

      // 检查新主题
      const expectedThemes = ['赛博朋克', '自然森林', '深海海洋', '夕阳余晖', '午夜星空'];
      const newThemesFound = themeNames.filter(name =>
        expectedThemes.some(theme => name.includes(theme))
      );

      console.log('\n🎨 发现的主题选项:');
      themeNames.forEach(name => console.log(`   - ${name}`));

      if (newThemesFound.length > 0) {
        console.log('\n✅ 发现新添加的主题:');
        newThemesFound.forEach(theme => console.log(`   🎉 ${theme}`));
      } else {
        console.log('\n⚠️ 未发现新添加的主题');
        console.log('期望的主题:', expectedThemes);
      }

    } else {
      console.log('❌ 未找到主题切换器按钮');
      await page.screenshot({ path: 'theme-debug.png' });
      console.log('📸 已保存调试截图: theme-debug.png');
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('✅ 测试完成');
}

testThemeSelector().catch(console.error);