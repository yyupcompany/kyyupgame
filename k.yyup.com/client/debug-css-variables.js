import { chromium } from 'playwright';

async function debugCSSVariables() {
  console.log('🔍 调试CSS变量实际值...');

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

    // 详细的CSS变量调试
    const cssDebug = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return { error: 'Sidebar not found' };

      // 获取计算后的CSS变量值
      const rootStyle = window.getComputedStyle(document.documentElement);
      const sidebarStyle = window.getComputedStyle(sidebar);

      const variables = [
        '--text-primary',
        '--text-regular',
        '--text-secondary',
        '--text-on-primary',
        '--text-on-primary-secondary',
        '--sidebar-text',
        '--sidebar-text-hover'
      ];

      const results = {
        theme: document.documentElement.getAttribute('data-theme'),
        computedValues: {},
        sidebarHeaderColor: '',
        sidebarHeaderStyle: {}
      };

      // 检查每个CSS变量的实际计算值
      variables.forEach(variable => {
        const value = rootStyle.getPropertyValue(variable).trim();
        results.computedValues[variable] = value || 'NOT_SET';
      });

      // 检查sidebar header的实际计算样式
      const sidebarHeader = sidebar.querySelector('.sidebar-header');
      if (sidebarHeader) {
        const headerStyle = window.getComputedStyle(sidebarHeader);
        results.sidebarHeaderColor = headerStyle.color;
        results.sidebarHeaderStyle = {
          backgroundColor: headerStyle.backgroundColor,
          color: headerStyle.color,
          fontFamily: headerStyle.fontFamily,
          fontSize: headerStyle.fontSize,
          fontWeight: headerStyle.fontWeight
        };
      }

      return results;
    });

    console.log('\n🎨 CSS变量调试结果:');
    console.log(`  当前主题: ${cssDebug.theme}`);
    console.log('\n📝 CSS变量实际值:');

    Object.entries(cssDebug.computedValues).forEach(([variable, value]) => {
      console.log(`  ${variable}: ${value}`);
    });

    console.log('\n🎯 Sidebar Header实际样式:');
    console.log(`  颜色: ${cssDebug.sidebarHeaderColor}`);
    if (cssDebug.sidebarHeaderStyle.color) {
      const rgbMatch = cssDebug.sidebarHeaderStyle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        console.log(`  RGB: (${r}, ${g}, ${b})`);
        console.log(`  亮度: ${brightness.toFixed(0)}`);
        console.log(`  太亮? ${brightness > 200 ? '是' : '否'}`);
      }
    }

    // 检查所有CSS文件中可能定义这些变量的地方
    console.log('\n🔍 检查可能影响这些变量的CSS规则...');

    const allRules = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      const results = [];

      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.style) {
              const text = rule.cssText;
              if (text.includes('--text-primary') || text.includes('--text-on-primary')) {
                results.push({
                  selectorText: rule.selectorText,
                  cssText: text.substring(0, 200) + (text.length > 200 ? '...' : '')
                });
              }
            }
          });
        } catch (e) {
          // 跨域CSS文件无法访问
        }
      });

      return results;
    });

    allRules.forEach((rule, index) => {
      console.log(`\n${index + 1}. ${rule.selectorText}`);
      console.log(`   ${rule.cssText}`);
    });

  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ CSS变量调试完成');
}

debugCSSVariables().catch(console.error);