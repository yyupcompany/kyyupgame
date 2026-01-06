import { chromium } from 'playwright';

async function testThemeForcedRefresh() {
  console.log('🚀 开始强制刷新主题测试...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    console.log('🌐 访问应用主页...');
    // 强制刷新页面，绕过缓存
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 强制刷新页面确保获取最新代码
    console.log('🔄 强制刷新页面...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('📸 截取登录页面...');
    await page.screenshot({ path: 'theme-force-login.png' });

    // 快速登录
    console.log('🔐 执行快速登录...');
    const adminButton = await page.$('.admin-btn, button:has-text("系统管理员")');
    if (adminButton) {
      console.log('✅ 找到管理员登录按钮');
      await adminButton.click();
      console.log('⏳ 等待页面跳转...');
      await page.waitForTimeout(6000);

      // 等待页面完全加载
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // 再次强制刷新确保组件更新
      console.log('🔄 登录后再次刷新...');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
    }

    console.log('📸 截取登录后页面...');
    await page.screenshot({ path: 'theme-force-logged-in.png' });

    // 查找主题切换器按钮
    console.log('🔍 查找主题切换器按钮...');
    const themeButton = await page.$('.theme-toggle-btn, .theme-btn, button[title*="主题"]');

    if (themeButton) {
      console.log('✅ 找到主题切换器按钮');

      // 获取按钮标题
      const title = await themeButton.getAttribute('title');
      console.log(`按钮标题: ${title}`);

      // 点击主题切换器
      console.log('🖱️ 点击主题切换器...');
      await themeButton.click();
      await page.waitForTimeout(2000);

      console.log('📸 截取下拉菜单...');
      await page.screenshot({ path: 'theme-force-dropdown.png' });

      // 查找所有主题选项
      const themeOptions = await page.$$('.el-dropdown-item, .theme-option');
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
        } catch (e) {
          console.log(`   选项 ${i+1}: 无法获取文本`);
        }
      }

      // 检查是否包含新添加的主题
      const expectedThemes = ['默认主题', '暗黑主题', '自定义主题', '玻璃态主题', '赛博朋克', '自然森林', '深海海洋', '夕阳余晖', '午夜星空'];
      const newThemesFound = themeNames.filter(name =>
        expectedThemes.some(theme => name.includes(theme))
      );

      console.log('\n🎨 发现的主题选项:');
      themeNames.forEach(name => console.log(`   - ${name}`));

      if (newThemesFound.length >= 5) {
        console.log('\n✅ 成功发现所有新添加的主题!');
        newThemesFound.forEach(theme => console.log(`   🎉 ${theme}`));

        // 测试前5个主题
        console.log('\n🧪 测试前5个主题切换...');
        for (let i = 0; i < Math.min(5, themeOptions.length); i++) {
          try {
            console.log(`🎨 测试切换到主题: ${themeNames[i]}`);

            // 重新打开下拉菜单（如果需要）
            const dropdownVisible = await page.$('.el-dropdown-menu:visible');
            if (!dropdownVisible) {
              await themeButton.click();
              await page.waitForTimeout(1000);
            }

            // 点击主题选项
            await themeOptions[i].click();
            await page.waitForTimeout(2000);

            // 截图
            const filename = `theme-force-test-${i+1}.png`;
            await page.screenshot({ path: filename });
            console.log(`   📸 已保存截图: ${filename}`);

            // 检查主题是否应用
            const htmlClasses = await page.evaluate(() => {
              return {
                html: document.documentElement.className,
                dataTheme: document.documentElement.getAttribute('data-theme')
              };
            });

            console.log(`   📊 HTML类: ${htmlClasses.html}`);
            console.log(`   📊 Data主题: ${htmlClasses.dataTheme}`);
          } catch (e) {
            console.log(`   ⚠️ 测试主题 ${themeNames[i]} 时出错: ${e.message}`);
          }
        }
      } else {
        console.log(`\n⚠️ 只发现 ${newThemesFound.length} 个新主题，期望 5 个`);
        console.log('期望的主题:', expectedThemes);
      }

    } else {
      console.log('❌ 未找到主题切换器按钮');
      await page.screenshot({ path: 'theme-force-debug.png' });

      // 输出页面上所有按钮信息
      const buttons = await page.$$('button');
      console.log(`页面上共有 ${buttons.length} 个按钮:`);
      for (let i = 0; i < Math.min(10, buttons.length); i++) {
        try {
          const text = await buttons[i].textContent();
          const title = await buttons[i].getAttribute('title');
          const classes = await buttons[i].getAttribute('class');
          console.log(`   按钮${i+1}: text='${text?.trim()}', title='${title}', class='${classes}'`);
        } catch (e) {
          console.log(`   按钮${i+1}: 无法获取信息`);
        }
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('✅ 强制刷新测试完成');
}

testThemeForcedRefresh().catch(console.error);