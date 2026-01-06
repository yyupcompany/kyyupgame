import { chromium } from 'playwright';

async function finalColorTest() {
  console.log('🎨 最终颜色测试和验证...');

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

    // 最终颜色分析
    const finalAnalysis = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return { error: 'Sidebar not found' };

      const results = {
        dataTheme: document.documentElement.getAttribute('data-theme'),
        cssVariables: {},
        textElements: [],
        success: false
      };

      // 获取CSS变量
      const rootStyle = window.getComputedStyle(document.documentElement);
      ['--text-primary', '--text-on-primary', '--text-secondary', '--sidebar-text'].forEach(variable => {
        results.cssVariables[variable] = rootStyle.getPropertyValue(variable).trim();
      });

      // 分析关键文字元素
      const textElements = [
        { selector: '.sidebar-header span', name: 'Sidebar Header' },
        { selector: '.primary-title', name: 'Primary Title' },
        { selector: '.menu-section-title', name: 'Menu Section Title' },
        { selector: '.menu-group-label', name: 'Menu Group Label' },
        { selector: '.el-menu-item span', name: 'Menu Item' }
      ];

      textElements.forEach(item => {
        const elements = sidebar.querySelectorAll(item.selector);
        elements.forEach(element => {
          const style = window.getComputedStyle(element);
          const color = style.color;

          const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            results.textElements.push({
              name: item.name,
              selector: item.selector,
              text: element.textContent?.slice(0, 30) || '',
              color,
              rgb: { r, g, b },
              brightness,
              isGood: brightness < 200 && brightness > 100,
              isTooDark: brightness <= 100,
              isTooBright: brightness >= 200
            });
          }
        });
      });

      // 判断整体效果
      const goodCount = results.textElements.filter(item => item.isGood).length;
      const tooBrightCount = results.textElements.filter(item => item.isTooBright).length;
      const tooDarkCount = results.textElements.filter(item => item.isTooDark).length;

      results.success = goodCount > results.textElements.length / 2;
      results.summary = {
        total: results.textElements.length,
        good: goodCount,
        tooBright: tooBrightCount,
        tooDark: tooDarkCount
      };

      return results;
    });

    console.log('\n🎯 最终颜色分析结果:');
    console.log(`  当前主题: ${finalAnalysis.dataTheme || '未知'}`);

    if (finalAnalysis.error) {
      console.log(`  ❌ 错误: ${finalAnalysis.error}`);
      return;
    }

    console.log('\n📝 CSS变量值:');
    Object.entries(finalAnalysis.cssVariables).forEach(([variable, value]) => {
      console.log(`  ${variable}: ${value}`);
    });

    console.log(`\n📊 文字颜色统计:`);
    console.log(`  总元素数: ${finalAnalysis.summary.total}`);
    console.log(`  ✅ 亮度适中: ${finalAnalysis.summary.good}`);
    console.log(`  ⚠️  太亮: ${finalAnalysis.summary.tooBright}`);
    console.log(`  🔲 太暗: ${finalAnalysis.summary.tooDark}`);

    console.log(`\n📝 详细分析:`);
    finalAnalysis.textElements.forEach((item, index) => {
      let status = '🔲';
      if (item.isGood) status = '✅';
      else if (item.isTooBright) status = '⚠️';
      else if (item.isTooDark) status = '🔲';

      console.log(`  ${status} ${index + 1}. ${item.name}`);
      console.log(`     文字: "${item.text}"`);
      console.log(`     颜色: ${item.color}`);
      console.log(`     亮度: ${item.brightness.toFixed(0)}`);
    });

    if (finalAnalysis.success) {
      console.log('\n🎉 暗黑主题颜色优化成功！');
    } else {
      console.log('\n⚠️  暗黑主题颜色仍需进一步优化');
    }

    // 生成最终截图
    console.log('\n📸 生成最终验证截图...');
    await page.screenshot({
      path: 'dark-theme-final-result.png',
      fullPage: false
    });
    console.log('   📸 截图保存: dark-theme-final-result.png');

    return finalAnalysis.success;

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    return false;
  } finally {
    await browser.close();
  }
}

finalColorTest().then(success => {
  console.log(`\n${success ? '✅' : '❌'} 暗黑主题颜色修复${success ? '成功' : '需要进一步调整'}`);
});