const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('启动无头浏览器...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('访问页面: http://localhost:5173/dashboard');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

    console.log('等待页面加载完成...');
    await page.waitForTimeout(3000);

    console.log('分析页面控制台错误...');
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('控制台错误:', msg.text());
      }
    });

    console.log('检查页面图标显示问题...');

    // 查找所有图标元素
    const iconElements = await page.evaluate(() => {
      const icons = [];

      // 查找各种图标元素
      const selectors = [
        'el-icon',
        '.el-icon',
        'i[class*="el-icon"]',
        '[class*="icon"]',
        '.icon',
        'i'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          const computed = window.getComputedStyle(el);
          const hasIconContent = computed.content && computed.content !== 'none' && computed.content !== '';

          icons.push({
            selector,
            index,
            tagName: el.tagName,
            className: el.className,
            innerHTML: el.innerHTML?.substring(0, 100),
            textContent: el.textContent?.substring(0, 50),
            before: computed.content || '',
            display: computed.display,
            visibility: computed.visibility,
            fontSize: computed.fontSize,
            color: computed.color,
            width: computed.width,
            height: computed.height,
            fontFamily: computed.fontFamily,
            hasIconContent: hasIconContent
          });
        });
      });

      return icons;
    });

    console.log('页面图标分析结果:');
    iconElements.forEach((icon, index) => {
      if (icon.selector === 'el-icon' || icon.className.includes('el-icon')) {
        console.log(`Element Plus图标 ${index + 1}:`);
        console.log(`  选择器: ${icon.selector}`);
        console.log(`  类名: ${icon.className}`);
        console.log(`  显示: ${icon.display}`);
        console.log(`  可见性: ${icon.visibility}`);
        console.log(`  字体大小: ${icon.fontSize}`);
        console.log(`  颜色: ${icon.color}`);
        console.log(`  字体: ${icon.fontFamily}`);
        console.log(`  before内容: '${icon.before}'`);
        console.log(`  内容: ${icon.innerHTML?.substring(0, 50)}`);
        console.log('---');
      }
    });

    // 检查Element Plus图标系统
    const iconSystemCheck = await page.evaluate(() => {
      const results = {
        hasElPlusCSS: false,
        hasIconFont: false,
        missingIcons: [],
        iconElements: []
      };

      // 检查样式表
      Array.from(document.styleSheets).forEach(sheet => {
        if (sheet.href && sheet.href.includes('element-plus')) {
          results.hasElPlusCSS = true;
        }
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.cssText && rule.cssText.includes('element-plus-icons')) {
              results.hasIconFont = true;
            }
          });
        }
      });

      // 检查图标元素
      const iconElements = document.querySelectorAll('el-icon, [class*="el-icon"]');
      results.iconElements = Array.from(iconElements).map(el => {
        const computed = window.getComputedStyle(el);
        const hasIcon = computed.content && computed.content !== 'none' && computed.content !== '';
        const isHidden = computed.display === 'none' || computed.visibility === 'hidden';

        return {
          tagName: el.tagName,
          className: el.className,
          hasIcon: hasIcon,
          isHidden: isHidden,
          content: computed.content,
          fontFamily: computed.fontFamily
        };
      });

      results.missingIcons = results.iconElements.filter(icon => !icon.hasIcon || icon.isHidden);

      return results;
    });

    console.log('Element Plus 图标系统检查结果:');
    console.log('  Element Plus CSS已加载:', iconSystemCheck.hasElPlusCSS);
    console.log('  图标字体已加载:', iconSystemCheck.hasIconFont);
    console.log('  图标元素总数:', iconSystemCheck.iconElements.length);
    console.log('  缺失的图标数量:', iconSystemCheck.missingIcons.length);

    if (iconSystemCheck.missingIcons.length > 0) {
      console.log('缺失的图标详情:');
      iconSystemCheck.missingIcons.forEach((icon, index) => {
        console.log(`  ${index + 1}. ${icon.tagName} - ${icon.className}`);
        console.log(`     有图标: ${icon.hasIcon}, 隐藏: ${icon.isHidden}`);
        console.log(`     内容: ${icon.content}`);
        console.log(`     字体: ${icon.fontFamily}`);
      });
    }

    console.log('截图保存...');
    await page.screenshot({
      path: 'dashboard-screenshot.png',
      fullPage: true
    });

    await browser.close();
    console.log('分析完成，截图已保存为 dashboard-screenshot.png');
    console.log(`发现 ${consoleErrors.length} 个控制台错误`);

    // 写入分析报告
    const report = {
      timestamp: new Date().toISOString(),
      pageUrl: 'http://localhost:5173/dashboard',
      iconSystemCheck,
      consoleErrors,
      iconElementsCount: iconElements.length
    };

    fs.writeFileSync('icon-analysis-report.json', JSON.stringify(report, null, 2));
    console.log('详细分析报告已保存为 icon-analysis-report.json');

  } catch (error) {
    console.error('分析过程中出错:', error.message);
    await browser.close();
  }
})();