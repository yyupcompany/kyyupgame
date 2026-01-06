import { chromium } from 'playwright';

async function testSidebarColors() {
  console.log('🎨 开始FullPageSidebar颜色详细分析...');

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

    // 详细分析FullPageSidebar的所有颜色
    console.log('🔍 分析FullPageSidebar颜色详情...');
    const colorAnalysis = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return {};

      const results = {
        dataTheme: document.documentElement.getAttribute('data-theme'),
        elements: []
      };

      // 获取sidebar内部所有主要元素
      const elements = sidebar.querySelectorAll(
        '.sidebar-header, .sidebar-menu, .primary-section, .menu-section-header, ' +
        '.menu-group, .menu-group-label, .el-menu-item, .el-button, .unified-icon'
      );

      elements.forEach((element) => {
        const style = window.getComputedStyle(element);
        const computedStyle = window.getComputedStyle(element);

        // 获取颜色值并分析
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;

        // 分析RGB值
        const analyzeColor = (colorStr) => {
          if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)') return null;

          const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (!rgbMatch) return { original: colorStr, isWhite: false, isLight: false };

          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;

          // 判断是否为白色或浅色
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          const isWhite = r >= 240 && g >= 240 && b >= 240;
          const isLight = brightness >= 128;

          return {
            original: colorStr,
            rgb: { r, g, b, a },
            brightness,
            isWhite,
            isLight,
            hex: `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
          };
        };

        const bgColorInfo = analyzeColor(bgColor);
        const textColorInfo = analyzeColor(textColor);

        if (bgColorInfo || textColorInfo) {
          results.elements.push({
            element: element.tagName.toLowerCase() +
                     (element.className ? '.' + element.className.split(' ').slice(0, 3).join('.') : ''),
            className: element.className || '',
            textContent: element.textContent?.slice(0, 50) || '',
            bgColor: bgColorInfo,
            textColor: textColorInfo
          });
        }
      });

      return results;
    });

    console.log('\n🎨 FullPageSidebar颜色分析结果:');
    console.log(`  Data主题: ${colorAnalysis.dataTheme || '无'}`);

    colorAnalysis.elements.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.element}`);
      if (item.textContent) {
        console.log(`   内容: "${item.textContent}"`);
      }

      if (item.bgColor) {
        console.log(`   背景色: ${item.bgColor.original}`);
        console.log(`   RGB: (${item.bgColor.rgb.r}, ${item.bgColor.rgb.g}, ${item.bgColor.rgb.b})`);
        console.log(`   亮度: ${item.bgColor.brightness.toFixed(0)}`);
        if (item.bgColor.isWhite) {
          console.log(`   ⚠️ 这是纯白色!`);
        } else if (item.bgColor.isLight) {
          console.log(`   ℹ️ 这是浅色`);
        } else {
          console.log(`   ✓ 这是合适的主题色`);
        }
      }

      if (item.textColor) {
        console.log(`   文字色: ${item.textColor.original}`);
        console.log(`   RGB: (${item.textColor.rgb.r}, ${item.textColor.rgb.g}, ${item.textColor.rgb.b})`);
        console.log(`   亮度: ${item.textColor.brightness.toFixed(0)}`);
        if (item.textColor.isWhite) {
          console.log(`   ⚠️ 这是纯白色文字!`);
        } else if (item.textColor.isLight) {
          console.log(`   ℹ️ 这是浅色文字`);
        } else {
          console.log(`   ✓ 这是合适的文字色`);
        }
      }
    });

    // 特别查找可能看起来是白色但实际上是主题色的元素
    const nearWhiteElements = colorAnalysis.elements.filter(item =>
      (item.bgColor?.isLight && !item.bgColor?.isWhite) ||
      (item.textColor?.isLight && !item.textColor?.isWhite)
    );

    if (nearWhiteElements.length > 0) {
      console.log(`\n🔍 可能看起来是白色的元素 (${nearWhiteElements.length}个):`);
      nearWhiteElements.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.element}: ${item.bgColor?.original || item.textColor?.original}`);
        console.log(`      可能原因: 主题色在暗黑模式下显示为浅色`);
      });
    }

    // 生成最终截图
    console.log('\n📸 生成最终FullPageSidebar截图...');
    await page.screenshot({ path: 'full-sidebar-final-colors.png' });
    console.log('   📸 截图保存: full-sidebar-final-colors.png');

  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ FullPageSidebar颜色分析完成');
}

testSidebarColors().catch(console.error);