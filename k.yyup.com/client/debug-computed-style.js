import { chromium } from 'playwright';

async function debugComputedStyle() {
  console.log('🔍 调试计算样式和CSS规则优先级...');

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

    // 深度调试计算样式
    const styleDebug = await page.evaluate(() => {
      const sidebar = document.querySelector('.full-page-sidebar');
      if (!sidebar) return { error: 'Sidebar not found' };

      const results = {
        cssVariables: {},
        sidebarHeader: {},
        appliedRules: []
      };

      // 获取CSS变量
      const rootStyle = window.getComputedStyle(document.documentElement);
      results.cssVariables = {
        textPrimary: rootStyle.getPropertyValue('--text-primary').trim(),
        textOnPrimary: rootStyle.getPropertyValue('--text-on-primary').trim()
      };

      // 检查sidebar header的计算样式和匹配的CSS规则
      const sidebarHeader = sidebar.querySelector('.sidebar-header span');
      if (sidebarHeader) {
        const computedStyle = window.getComputedStyle(sidebarHeader);
        results.sidebarHeader = {
          text: sidebarHeader.textContent,
          color: computedStyle.color,
          fontFamily: computedStyle.fontFamily,
          fontSize: computedStyle.fontSize,
          fontWeight: computedStyle.fontWeight
        };

        // 获取所有匹配的CSS规则
        try {
          const sheets = Array.from(document.styleSheets);
          sheets.forEach(sheet => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              rules.forEach(rule => {
                if (rule.style) {
                  const selectorText = rule.selectorText;
                  if (selectorText && sidebarHeader.matches(selectorText)) {
                    results.appliedRules.push({
                      selector: selectorText,
                      color: rule.style.color || 'NOT_SET',
                      sheet: sheet.href || 'inline'
                    });
                  }
                }
              });
            } catch (e) {
              // 跨域CSS文件无法访问
            }
          });
        } catch (e) {
          results.appliedRules.push({ error: e.message });
        }
      }

      return results;
    });

    console.log('\n🎨 CSS调试结果:');
    console.log(`  CSS变量:`);
    console.log(`    --text-primary: ${styleDebug.cssVariables.textPrimary}`);
    console.log(`    --text-on-primary: ${styleDebug.cssVariables.textOnPrimary}`);

    if (styleDebug.error) {
      console.log(`  ❌ 错误: ${styleDebug.error}`);
      return;
    }

    console.log(`\n🎯 Sidebar Header:`);
    console.log(`  文字: "${styleDebug.sidebarHeader.text}"`);
    console.log(`  实际颜色: ${styleDebug.sidebarHeader.color}`);

    // 分析RGB值
    const colorMatch = styleDebug.sidebarHeader.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (colorMatch) {
      const r = parseInt(colorMatch[1]);
      const g = parseInt(colorMatch[2]);
      const b = parseInt(colorMatch[3]);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      console.log(`  RGB: (${r}, ${g}, ${b})`);
      console.log(`  HEX: ${hex}`);
      console.log(`  亮度: ${brightness.toFixed(0)}`);
      console.log(`  是否太亮: ${brightness >= 200 ? '是' : '否'}`);
    }

    console.log(`\n📋 应用的CSS规则 (${styleDebug.appliedRules.length}个):`);
    styleDebug.appliedRules.forEach((rule, index) => {
      if (rule.error) {
        console.log(`  ${index + 1}. 错误: ${rule.error}`);
      } else {
        console.log(`  ${index + 1}. ${rule.selector}`);
        console.log(`     color: ${rule.color}`);
        console.log(`     来源: ${rule.sheet}`);
      }
    });

  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  } finally {
    await browser.close();
  }

  console.log('\n✅ 计算样式调试完成');
}

debugComputedStyle().catch(console.error);