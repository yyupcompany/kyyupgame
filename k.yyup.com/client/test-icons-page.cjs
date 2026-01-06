const { chromium } = require('playwright');

(async () => {
  console.log('🎯 测试 UnifiedIcon 测试页面...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('📱 访问测试图标页面...');
    await page.goto('http://localhost:5173/test-icons', { waitUntil: 'networkidle' });

    console.log('⏳ 等待页面完全加载...');
    await page.waitForTimeout(3000);

    // 检查页面是否加载成功
    const pageTitle = await page.title();
    console.log(`📄 页面标题: ${pageTitle}`);

    // 检查 UnifiedIcon 组件
    const iconResults = await page.evaluate(() => {
      const results = {
        unifiedIconCount: 0,
        svgCount: 0,
        gridItems: 0,
        iconData: [],
        errors: []
      };

      try {
        // 统计 UnifiedIcon 组件
        const unifiedIcons = document.querySelectorAll('.unified-icon');
        results.unifiedIconCount = unifiedIcons.length;

        // 统计 SVG 元素
        const svgs = document.querySelectorAll('svg');
        results.svgCount = svgs.length;

        // 统计网格项目
        const gridItems = document.querySelectorAll('.icon-item');
        results.gridItems = gridItems.length;

        // 收集图标数据
        results.iconData = Array.from(unifiedIcons).map((el, index) => {
          const svg = el.querySelector('svg');
          const path = svg?.querySelector('path');

          return {
            index,
            className: el.className,
            width: svg?.getAttribute('width'),
            height: svg?.getAttribute('height'),
            viewBox: svg?.getAttribute('viewBox'),
            pathD: path?.getAttribute('d'),
            hasPath: !!path,
            fillColor: path?.getAttribute('fill'),
            strokeColor: path?.getAttribute('stroke'),
            strokeWidth: path?.getAttribute('stroke-width')
          };
        });

      } catch (e) {
        results.errors.push(`图标检查错误: ${e.message}`);
      }

      return results;
    });

    console.log('✅ 测试结果:');
    console.log(`  🔧 UnifiedIcon 组件: ${iconResults.unifiedIconCount} 个`);
    console.log(`  🎨 SVG 元素: ${iconResults.svgCount} 个`);
    console.log(`  📊 网格项目: ${iconResults.gridItems} 个`);
    console.log(`  ⚠️  错误: ${iconResults.errors.length} 个`);

    if (iconResults.iconData.length > 0) {
      console.log('\n📋 图标详情:');
      iconResults.iconData.slice(0, 5).forEach((icon, index) => {
        console.log(`  ${index + 1}. ${icon.className}`);
        console.log(`     尺寸: ${icon.width}×${icon.height}`);
        console.log(`     ViewBox: ${icon.viewBox}`);
        console.log(`     有Path: ${icon.hasPath ? '✅' : '❌'}`);
        console.log(`     填充: ${icon.fillColor} | 描边: ${icon.strokeColor}`);
        if (icon.pathD) {
          console.log(`     Path: ${icon.pathD.substring(0, 40)}...`);
        }
        console.log('');
      });
    }

    // 截图
    await page.screenshot({
      path: 'test-icons-page-screenshot.png',
      fullPage: true
    });

    console.log('📸 测试截图已保存为 test-icons-page-screenshot.png');

    // 成功标准检查
    const success = iconResults.unifiedIconCount >= 20 && iconResults.svgCount >= 20;

    if (success) {
      console.log('🎉 UnifiedIcon 图标系统测试成功！');
    } else {
      console.log('❌ UnifiedIcon 图标系统测试失败，组件数量不足');
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 测试完成');
  }
})();