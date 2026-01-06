import { chromium } from 'playwright';

async function quickColorTest() {
  console.log('⚡ 快速颜色测试 - 检查硬编码颜色是否生效...');

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

    // 检查颜色
    const colorCheck = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return { error: 'Sidebar not found' };

      const elements = {
        header: sidebar.querySelector('.sidebar-header span'),
        primaryTitle: sidebar.querySelector('.primary-title'),
        sectionTitle: sidebar.querySelector('.menu-section-title'),
        groupLabel: sidebar.querySelector('.menu-group-label'),
        menuItem: sidebar.querySelector('.el-menu-item span')
      };

      const results = {};

      Object.entries(elements).forEach(([key, element]) => {
        if (element) {
          const style = window.getComputedStyle(element);
          const color = style.color;
          const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

            results[key] = {
              text: element.textContent?.slice(0, 20) || '',
              color,
              hex,
              brightness,
              isFixed: hex === '#d1d5db'
            };
          }
        }
      });

      return results;
    });

    console.log('\n🎯 颜色检查结果:');
    Object.entries(colorCheck).forEach(([key, item]) => {
      if (colorCheck.error) {
        console.log(`  ❌ 错误: ${colorCheck.error}`);
        return;
      }

      const status = item.isFixed ? '✅' : '❌';
      console.log(`  ${status} ${key}: ${item.color} (${item.hex})`);
      console.log(`      文字: "${item.text}"`);
      console.log(`      亮度: ${item.brightness.toFixed(0)}`);
    });

    const fixedCount = Object.values(colorCheck).filter(item => item.isFixed).length;
    const totalCount = Object.keys(colorCheck).length;

    console.log(`\n📊 修复状态: ${fixedCount}/${totalCount} 个元素已修复`);

    if (fixedCount === totalCount) {
      console.log('🎉 所有元素颜色已成功修复！');
    } else {
      console.log('⚠️  部分元素仍需进一步调整');
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ 快速颜色测试完成');
}

quickColorTest().catch(console.error);