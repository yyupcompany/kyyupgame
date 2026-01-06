const { chromium } = require('playwright');

(async () => {
  console.log('🔍 测试 UnifiedIcon 图标系统...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('📱 访问 dashboard 页面...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

    console.log('⏳ 等待页面完全加载...');
    await page.waitForTimeout(3000);

    // 详细检查 UnifiedIcon 组件
    const iconTest = await page.evaluate(() => {
      const results = {
        unifiedIcons: [],
        svgElements: [],
        iconSystemInjected: false,
        errors: []
      };

      // 检查是否有 iconSystem 注入
      try {
        const appElement = document.querySelector('#app');
        if (appElement && appElement.__vue_app__) {
          const vueApp = appElement.__vue_app__;
          results.iconSystemInjected = true;
        }
      } catch (e) {
        results.errors.push(`检查 iconSystem 注入失败: ${e.message}`);
      }

      // 查找所有 UnifiedIcon 组件
      const unifiedIconElements = document.querySelectorAll('.unified-icon');
      results.unifiedIcons = Array.from(unifiedIconElements).map((el, index) => {
        const computed = window.getComputedStyle(el);
        const svgElement = el.querySelector('svg');
        const pathElement = el.querySelector('path');
        const gElement = el.querySelector('g');

        return {
          index,
          className: el.className,
          display: computed.display,
          visibility: computed.visibility,
          width: computed.width,
          height: computed.height,
          hasSvg: !!svgElement,
          hasPath: !!pathElement,
          hasG: !!gElement,
          svgViewBox: svgElement?.getAttribute('viewBox'),
          pathD: pathElement?.getAttribute('d'),
          gHtml: gElement?.innerHTML,
          innerHTML: el.innerHTML.substring(0, 200)
        };
      });

      // 查找所有 SVG 图标元素
      const svgElements = document.querySelectorAll('svg');
      results.svgElements = Array.from(svgElements).map((el, index) => {
        const computed = window.getComputedStyle(el);
        return {
          index,
          className: el.className,
          parentClass: el.parentElement?.className,
          display: computed.display,
          visibility: computed.visibility,
          width: computed.width,
          height: computed.height,
          viewBox: el.getAttribute('viewBox'),
          hasPath: !!el.querySelector('path'),
          pathCount: el.querySelectorAll('path').length,
          hasG: !!el.querySelector('g'),
          gCount: el.querySelectorAll('g').length
        };
      });

      return results;
    });

    console.log('✅ UnifiedIcon 测试结果:');
    console.log(`  📊 UnifiedIcon 组件数量: ${iconTest.unifiedIcons.length}`);
    console.log(`  🎨 SVG 元素数量: ${iconTest.svgElements.length}`);
    console.log(`  🔧 iconSystem 注入状态: ${iconTest.iconSystemInjected ? '✅ 成功' : '❌ 失败'}`);
    console.log(`  ⚠️  错误数量: ${iconTest.errors.length}`);

    if (iconTest.unifiedIcons.length > 0) {
      console.log('\n📋 UnifiedIcon 组件详情:');
      iconTest.unifiedIcons.forEach((icon, index) => {
        console.log(`  ${index + 1}. ${icon.className}`);
        console.log(`     显示状态: ${icon.display} | 可见性: ${icon.visibility}`);
        console.log(`     尺寸: ${icon.width} × ${icon.height}`);
        console.log(`     SVG: ${icon.hasSvg ? '✅' : '❌'} | Path: ${icon.hasPath ? '✅' : '❌'} | G: ${icon.hasG ? '✅' : '❌'}`);
        if (icon.pathD) {
          console.log(`     Path D: ${icon.pathD.substring(0, 50)}...`);
        }
        console.log('');
      });
    }

    if (iconTest.svgElements.length > 0) {
      console.log('\n🎨 SVG 元素详情:');
      iconTest.svgElements.forEach((svg, index) => {
        console.log(`  ${index + 1}. ${svg.className} (父级: ${svg.parentClass})`);
        console.log(`     显示状态: ${svg.display} | 可见性: ${svg.visibility}`);
        console.log(`     尺寸: ${svg.width} × ${svg.height}`);
        console.log(`     ViewBox: ${svg.viewBox}`);
        console.log(`     Path数量: ${svg.pathCount} | G数量: ${svg.gCount}`);
        console.log('');
      });
    }

    if (iconTest.errors.length > 0) {
      console.log('\n❌ 发现的错误:');
      iconTest.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // 截图保存
    await page.screenshot({
      path: 'unified-icon-test-screenshot.png',
      fullPage: true
    });

    console.log('📸 测试截图已保存为 unified-icon-test-screenshot.png');

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 UnifiedIcon 测试完成');
  }
})();