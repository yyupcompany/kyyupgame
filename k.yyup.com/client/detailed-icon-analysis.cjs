const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('启动深入图标分析...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('访问页面: http://localhost:5173/dashboard');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

    console.log('等待页面完全加载...');
    await page.waitForTimeout(5000);

    // 详细分析样式和图标加载情况
    const detailedAnalysis = await page.evaluate(() => {
      const results = {
        stylesheets: [],
        elementPlusDetected: false,
        iconFonts: [],
        iconElements: [],
        computedStyles: [],
        networkResources: [],
        errors: []
      };

      // 检查所有样式表
      Array.from(document.styleSheets).forEach((sheet, index) => {
        const sheetInfo = {
          index,
          href: sheet.href || 'inline',
          rules: sheet.cssRules ? sheet.cssRules.length : 0,
          ownerNode: sheet.ownerNode ? sheet.ownerNode.tagName : 'unknown'
        };
        results.stylesheets.push(sheetInfo);

        // 检查是否包含 Element Plus 相关样式
        if (sheet.href && (
          sheet.href.includes('element-plus') ||
          sheet.href.includes('element-plus-icons')
        )) {
          results.elementPlusDetected = true;
        }

        // 检查图标字体相关规则
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.cssText && (
              rule.cssText.includes('font-family') &&
              rule.cssText.includes('icon')
            )) {
              results.iconFonts.push(rule.cssText);
            }
          });
        }
      });

      // 查找所有图标相关元素
      const iconSelectors = [
        'el-icon',
        '.el-icon',
        '[class*="el-icon"]',
        '[class*="icon"]',
        '.icon',
        'i[class*="el-"]',
        '[class*="icon"]'
      ];

      iconSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        Array.from(elements).forEach(el => {
          const computed = window.getComputedStyle(el);
          results.iconElements.push({
            selector,
            tagName: el.tagName,
            className: el.className,
            innerHTML: el.innerHTML?.substring(0, 100),
            before: computed.content || '',
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            color: computed.color,
            display: computed.display,
            visibility: computed.visibility
          });
        });
      });

      // 检查特定的 Element Plus 图标组件
      const elIcons = document.querySelectorAll('el-icon');
      results.elIconComponents = Array.from(elIcons).map(el => ({
        tagName: el.tagName,
        innerHTML: el.innerHTML,
        className: el.className,
        shadowRoot: el.shadowRoot ? 'has-shadow-root' : 'no-shadow-root'
      }));

      // 获取所有已加载的资源
      const performanceEntries = performance.getEntriesByType('resource');
      results.networkResources = performanceEntries.map(entry => ({
        name: entry.name,
        type: entry.initiatorType,
        duration: entry.duration,
        size: entry.transferSize || 0
      }));

      return results;
    });

    console.log('=== 详细分析结果 ===');
    console.log('样式表数量:', detailedAnalysis.stylesheets.length);
    console.log('Element Plus 检测:', detailedAnalysis.elementPlusDetected);
    console.log('图标元素数量:', detailedAnalysis.iconElements.length);
    console.log('El-Icon 组件数量:', detailedAnalysis.elIconComponents?.length || 0);

    console.log('\n=== 样式表信息 ===');
    detailedAnalysis.stylesheets.forEach(sheet => {
      console.log(`样式表 ${sheet.index}: ${sheet.href}`);
      console.log(`  规则数量: ${sheet.rules}`);
      console.log(`  所有者节点: ${sheet.ownerNode}`);
    });

    console.log('\n=== 图标元素信息 ===');
    detailedAnalysis.iconElements.slice(0, 5).forEach((icon, index) => {
      console.log(`图标 ${index + 1}:`);
      console.log(`  选择器: ${icon.selector}`);
      console.log(`  类名: ${icon.className}`);
      console.log(`  字体: ${icon.fontFamily}`);
      console.log(`  Before内容: '${icon.before}'`);
      console.log(`  显示: ${icon.display}`);
      console.log(`  可见性: ${icon.visibility}`);
      console.log('---');
    });

    console.log('\n=== 网络资源信息 ===');
    const elementPlusResources = detailedAnalysis.networkResources.filter(r =>
      r.name.includes('element-plus')
    );
    console.log('Element Plus 相关资源:');
    elementPlusResources.forEach(resource => {
      console.log(`  ${resource.name} (${resource.type}) - ${resource.size} bytes`);
    });

    // 保存详细分析报告
    const detailedReport = {
      timestamp: new Date().toISOString(),
      pageUrl: 'http://localhost:5173/dashboard',
      analysis: detailedAnalysis
    };

    fs.writeFileSync('detailed-icon-analysis.json', JSON.stringify(detailedReport, null, 2));
    console.log('\n详细分析报告已保存为 detailed-icon-analysis.json');

    // 截图
    await page.screenshot({
      path: 'detailed-dashboard-screenshot.png',
      fullPage: true
    });

    console.log('详细截图已保存为 detailed-dashboard-screenshot.png');

  } catch (error) {
    console.error('分析过程中出错:', error.message);
  } finally {
    await browser.close();
  }
})();