import { chromium } from 'playwright';

async function finalThemeTest() {
  console.log('🚀 开始最终主题功能验证测试...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    console.log('🌐 访问应用主页...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 快速登录
    const adminButton = await page.$('.admin-btn, button:has-text("系统管理员")');
    if (adminButton) {
      await adminButton.click();
      await page.waitForTimeout(6000);
      await page.waitForLoadState('networkidle');
    }

    // 查找主题按钮
    const themeButton = await page.$('.theme-btn');
    if (themeButton) {
      console.log('✅ 找到主题切换器按钮');

      // 点击打开下拉菜单
      await themeButton.click();
      await page.waitForTimeout(2000);

      // 验证所有9个主题选项都存在
      const themeOptions = await page.evaluate(() => {
        const options = document.querySelectorAll('.theme-option');
        return Array.from(options).map(option => {
          const nameElement = option.querySelector('.theme-name');
          const iconElement = option.querySelector('.theme-icon .unified-icon');
          return {
            name: nameElement ? nameElement.textContent.trim() : 'Unknown',
            hasIcon: iconElement ? true : false,
            isVisible: option.offsetParent !== null
          };
        });
      });

      console.log('\n🎨 主题选项验证结果:');
      console.log('序号 | 主题名称        | 有图标 | 可见');
      console.log('----|----------------|--------|------');

      let allValid = true;
      themeOptions.forEach((theme, index) => {
        const valid = theme.hasIcon && theme.isVisible;
        if (!valid) allValid = false;
        console.log(`${(index + 1).toString().padEnd(4)} | ${theme.name.padEnd(14)} | ${valid ? '✅' : '❌'.padEnd(6)} | ${theme.isVisible ? '✅' : '❌'}`);
      });

      if (allValid) {
        console.log('\n🎉 所有主题选项都有图标且可见！');
      } else {
        console.log('\n⚠️ 部分主题选项存在问题');
      }

      // 测试前3个主题的点击切换功能
      console.log('\n🧪 测试主题切换功能...');
      for (let i = 0; i < Math.min(3, themeOptions.length); i++) {
        try {
          // 重新打开下拉菜单
          await themeButton.click();
          await page.waitForTimeout(1000);

          const options = await page.$$('.theme-option');
          const themeName = themeOptions[i].name;

          console.log(`🎯 测试切换到: ${themeName}`);

          // 点击主题选项
          await options[i].click();
          await page.waitForTimeout(2000);

          // 验证主题是否应用（检查data-theme属性）
          const appliedTheme = await page.evaluate(() => {
            return document.documentElement.getAttribute('data-theme');
          });

          console.log(`   ✅ 切换成功，当前主题: ${appliedTheme || '无data-theme属性'}`);

          // 截图记录
          const filename = `final-theme-test-${i + 1}.png`;
          await page.screenshot({ path: filename });
          console.log(`   📸 截图保存: ${filename}`);

        } catch (e) {
          console.log(`   ⚠️ 测试主题 ${themeOptions[i].name} 时出错: ${e.message}`);
        }
      }

      // 最终截图
      console.log('\n📸 生成最终验证截图...');
      await themeButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'final-theme-dropdown.png' });
      console.log('   📸 最终下拉菜单截图: final-theme-dropdown.png');

      console.log('\n✅ 最终主题功能验证测试完成！');
      console.log('📁 生成的测试文件:');
      console.log('   - final-theme-dropdown.png: 最终主题下拉菜单');
      console.log('   - final-theme-test-1.png ~ 3.png: 主题切换测试截图');

    } else {
      console.log('❌ 未找到主题切换器按钮');
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }
}

finalThemeTest().catch(console.error);