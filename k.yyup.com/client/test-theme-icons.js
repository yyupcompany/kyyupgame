import { chromium } from 'playwright';

async function testThemeIcons() {
  console.log('🚀 开始主题图标测试...');

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
    console.log('🔐 执行快速登录...');
    const adminButton = await page.$('.admin-btn, button:has-text("系统管理员")');
    if (adminButton) {
      await adminButton.click();
      console.log('⏳ 等待页面跳转...');
      await page.waitForTimeout(6000);
      await page.waitForLoadState('networkidle');
    }

    console.log('🔍 查找主题切换器按钮...');
    // 尝试多种选择器
    let themeButton = await page.$('.theme-btn');
    if (!themeButton) {
      themeButton = await page.$('.header-action-btn.theme-btn');
    }
    if (!themeButton) {
      themeButton = await page.$('button:has-text("主题")');
    }
    if (!themeButton) {
      // 查找所有带"主题"文字的按钮
      const allButtons = await page.$$('button');
      for (const btn of allButtons) {
        const text = await btn.textContent();
        if (text && text.includes('主题')) {
          themeButton = btn;
          break;
        }
      }
    }

    if (themeButton) {
      console.log('✅ 找到主题切换器按钮');

      // 点击主题切换器
      console.log('🖱️ 点击主题切换器...');
      await themeButton.click();
      await page.waitForTimeout(2000);

      console.log('📸 截取下拉菜单...');
      await page.screenshot({ path: 'theme-icons-dropdown.png' });

      // 检查图标元素
      const themeIcons = await page.$$('.theme-icon .unified-icon');
      console.log(`📋 找到 ${themeIcons.length} 个主题图标`);

      // 检查每个图标是否可见
      for (let i = 0; i < Math.min(themeIcons.length, 9); i++) {
        try {
          const icon = themeIcons[i];
          const isVisible = await icon.isVisible();
          const bbox = await icon.boundingBox();

          console.log(`   图标${i+1}: 可见=${isVisible}, 位置=${bbox ? `(${bbox.x}, ${bbox.y})` : 'N/A'}`);
        } catch (e) {
          console.log(`   图标${i+1}: 检查失败 - ${e.message}`);
        }
      }

      // 测试悬停效果
      console.log('\n🎨 测试图标悬停效果...');
      const themeOptions = await page.$$('.theme-option');
      for (let i = 0; i < Math.min(3, themeOptions.length); i++) {
        try {
          await themeOptions[i].hover();
          await page.waitForTimeout(500);
          const filename = `theme-icon-hover-${i+1}.png`;
          await page.screenshot({ path: filename });
          console.log(`   📸 悬停截图 ${i+1}: ${filename}`);
        } catch (e) {
          console.log(`   ⚠️ 悬停测试 ${i+1} 失败: ${e.message}`);
        }
      }

      console.log('\n✅ 主题图标测试完成！');
      console.log('📁 生成的截图:');
      console.log('   - theme-icons-dropdown.png: 下拉菜单截图');
      console.log('   - theme-icon-hover-1.png ~ 3.png: 悬停效果截图');

    } else {
      console.log('❌ 未找到主题切换器按钮');
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }
}

testThemeIcons().catch(console.error);