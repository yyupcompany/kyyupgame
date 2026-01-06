import { chromium } from 'playwright';

async function testDarkThemeColors() {
  console.log('🌙 测试暗黑主题颜色改进效果...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    console.log('🌐 访问AI助手页面...');
    await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // 快速登录
    const adminButton = await page.$('.admin-btn, button:has-text("系统管理员")');
    if (adminButton) {
      await adminButton.click();
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
      await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    // 切换到暗黑模式
    const themeButton = await page.$('.theme-btn');
    if (themeButton) {
      await themeButton.click();
      await page.waitForTimeout(2000);
      const themeOptions = await page.$$('.theme-option');
      for (let i = 0; i < themeOptions.length; i++) {
        const text = await themeOptions[i].textContent();
        if (text && text.includes('暗黑主题')) {
          await themeOptions[i].click();
          await page.waitForTimeout(3000);
          break;
        }
      }
    }

    // 测试FullPageSidebar的文字颜色
    console.log('🔍 检查FullPageSidebar的文字颜色...');
    const sidebarColorTest = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return { error: 'Sidebar not found' };

      const results = {
        dataTheme: document.documentElement.getAttribute('data-theme'),
        textElements: []
      };

      // 检查sidebar中的主要文字元素
      const textSelectors = [
        '.sidebar-header span',
        '.primary-title',
        '.menu-section-title',
        '.menu-group-label',
        '.el-menu-item span'
      ];

      textSelectors.forEach(selector => {
        const elements = sidebar.querySelectorAll(selector);
        elements.forEach(element => {
          const style = window.getComputedStyle(element);
          const color = style.color;

          // 分析颜色值
          const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            results.textElements.push({
              selector,
              text: element.textContent?.slice(0, 30) || '',
              color,
              rgb: { r, g, b },
              brightness,
              isTooBright: brightness > 200  // 亮度超过200被认为太亮
            });
          }
        });
      });

      return results;
    });

    console.log('\n🎨 暗黑主题颜色测试结果:');
    console.log(`  当前主题: ${sidebarColorTest.dataTheme || '未知'}`);

    if (sidebarColorTest.error) {
      console.log(`  ❌ 错误: ${sidebarColorTest.error}`);
    } else {
      console.log(`\n📝 文字颜色分析 (${sidebarColorTest.textElements.length}个元素):`);

      let brightCount = 0;
      sidebarColorTest.textElements.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.selector}`);
        console.log(`   文字: "${item.text}"`);
        console.log(`   颜色: ${item.color}`);
        console.log(`   RGB: (${item.rgb.r}, ${item.rgb.g}, ${item.rgb.b})`);
        console.log(`   亮度: ${item.brightness.toFixed(0)}`);

        if (item.isTooBright) {
          console.log(`   ⚠️  太亮了！建议调暗`);
          brightCount++;
        } else {
          console.log(`   ✅ 亮度合适`);
        }
      });

      if (brightCount > 0) {
        console.log(`\n⚠️  有 ${brightCount} 个元素仍然太亮`);
      } else {
        console.log(`\n✅ 所有文字颜色都适合暗黑主题！`);
      }
    }

    // 生成最终截图
    console.log('\n📸 生成暗黑主题截图...');
    await page.screenshot({
      path: 'dark-theme-colors-improved.png',
      fullPage: false
    });
    console.log('   📸 截图保存: dark-theme-colors-improved.png');

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ 暗黑主题颜色测试完成');
}

testDarkThemeColors().catch(console.error);