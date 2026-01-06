const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
  });

  try {
    console.log('=== 登录并访问Dashboard ===');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');

    const loginButton = await page.$('button[type="submit"], .el-button--primary');
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(3000);
    }

    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    // 截图
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/dashboard-final-check.png',
      fullPage: true
    });

    // 详细分析所有图标
    console.log('\n=== 详细图标分析 ===');
    const allIcons = await page.evaluate(() => {
      const results = {
        sidebar: [],
        header: [],
        content: [],
        unifiedIcons: [],
        byType: {
          svg: 0,
          'i[class*="icon"]': 0,
          'div[class*="icon"]': 0,
          other: 0
        },
        problems: []
      };

      // 检查各个区域的图标
      const regions = [
        { name: 'sidebar', selector: '.sidebar, aside, [class*="sidebar"]' },
        { name: 'header', selector: 'header, .header, nav, .navbar' }
      ];

      regions.forEach(region => {
        const element = document.querySelector(region.selector);
        if (element) {
          const icons = element.querySelectorAll('svg, i[class*="icon"], [class*="icon"]');
          icons.forEach(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            results[region.name].push({
              tagName: el.tagName,
              className: typeof el.className === 'string' ? el.className : '',
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity
            });
          });
        }
      });

      // 检查内容区所有图标
      const allIconElements = document.querySelectorAll('svg, i[class*="icon"], [class*="icon"], .unified-icon');
      allIconElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        const iconInfo = {
          tagName: el.tagName,
          className: typeof el.className === 'string' ? el.className : '',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          region: 'content'
        };

        results.content.push(iconInfo);

        // 统计类型
        if (el.tagName === 'SVG') {
          results.byType.svg++;
        } else if (el.className && el.className.includes && el.className.includes('el-icon')) {
          results.byType['i[class*="icon"]']++;
        } else if (el.className && el.className.includes && el.className.includes('icon')) {
          results.byType['div[class*="icon"]']++;
        } else {
          results.byType.other++;
        }

        // 检查问题（只有真正的显示问题才记录）
        if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') {
          results.problems.push({
            ...iconInfo,
            issue: rect.width === 0 || rect.height === 0 ? 'zero-size' : 'hidden'
          });
        }
      });

      // 特别检查UnifiedIcon组件
      document.querySelectorAll('.unified-icon').forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        results.unifiedIcons.push({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          className: typeof el.className === 'string' ? el.className : ''
        });
      });

      return results;
    });

    console.log('\n📊 图标统计结果:');
    console.log(`   侧边栏图标: ${allIcons.sidebar.length}个`);
    console.log(`   顶部导航栏图标: ${allIcons.header.length}个`);
    console.log(`   内容区图标: ${allIcons.content.length}个`);
    console.log(`   UnifiedIcon组件: ${allIcons.unifiedIcons.length}个`);

    console.log(`\n📈 图标类型分布:`);
    console.log(`   SVG图标: ${allIcons.byType.svg}个`);
    console.log(`   i标签图标: ${allIcons.byType['i[class*="icon"]']}个`);
    console.log(`   div标签图标: ${allIcons.byType['div[class*="icon"]']}个`);
    console.log(`   其他: ${allIcons.byType.other}个`);

    console.log(`\n❌ 发现的真正问题图标: ${allIcons.problems.length}个`);

    if (allIcons.problems.length > 0) {
      allIcons.problems.forEach((problem, idx) => {
        console.log(`\n--- 问题图标 #${idx + 1} ---`);
        console.log(`类型: ${problem.tagName}`);
        console.log(`类名: ${problem.className}`);
        console.log(`尺寸: ${problem.width}x${problem.height}`);
        console.log(`问题: ${problem.issue}`);
        console.log(`显示状态: ${problem.display}, ${problem.visibility}, opacity=${problem.opacity}`);
      });
    }

    // 侧边栏详细分析
    console.log('\n🔍 侧边栏图标详细:');
    if (allIcons.sidebar.length > 0) {
      allIcons.sidebar.forEach((icon, idx) => {
        console.log(`  ${idx + 1}. ${icon.tagName} - ${icon.className} - ${icon.width}x${icon.height} - ${icon.display}`);
      });
    }

    // 顶部导航栏详细分析
    console.log('\n🔍 顶部导航栏图标详细:');
    if (allIcons.header.length > 0) {
      allIcons.header.slice(0, 15).forEach((icon, idx) => {
        console.log(`  ${idx + 1}. ${icon.tagName} - ${icon.className} - ${icon.width}x${icon.height} - ${icon.display}`);
      });
    }

    // UnifiedIcon详细分析
    console.log('\n🔍 UnifiedIcon组件详细:');
    if (allIcons.unifiedIcons.length > 0) {
      const workingUnified = allIcons.unifiedIcons.filter(icon => icon.width > 0 && icon.height > 0);
      const brokenUnified = allIcons.unifiedIcons.filter(icon => icon.width === 0 || icon.height === 0);

      console.log(`  ✅ 正常显示: ${workingUnified.length}个`);
      console.log(`  ❌ 显示异常: ${brokenUnified.length}个`);

      if (brokenUnified.length > 0) {
        brokenUnified.forEach((icon, idx) => {
          console.log(`\n  --- 异常UnifiedIcon #${idx + 1} ---`);
          console.log(`  类名: ${icon.className}`);
          console.log(`  尺寸: ${icon.width}x${icon.height}`);
          console.log(`  状态: ${icon.display}, ${icon.visibility}`);
        });
      }
    }

    // 检查控制台错误
    console.log('\n🔍 控制台消息 (与图标相关):');
    const iconRelatedMessages = consoleMessages.filter(msg =>
      msg.toLowerCase().includes('icon') ||
      msg.toLowerCase().includes('font') ||
      msg.toLowerCase().includes('svg') ||
      msg.includes('error')
    );

    if (iconRelatedMessages.length > 0) {
      iconRelatedMessages.slice(-10).forEach(msg => {
        console.log(`  ${msg}`);
      });
    } else {
      console.log('  ✅ 无图标相关的控制台错误');
    }

    // 最终结论
    console.log('\n' + '='.repeat(60));
    console.log('📋 最终检查报告');
    console.log('='.repeat(60));

    const totalIcons = allIcons.sidebar.length + allIcons.header.length + allIcons.content.length;
    const visibleIcons = totalIcons - allIcons.problems.length;

    console.log(`\n总计检查图标: ${totalIcons}个`);
    console.log(`正常显示图标: ${visibleIcons}个 (${((visibleIcons / totalIcons) * 100).toFixed(1)}%)`);
    console.log(`异常显示图标: ${allIcons.problems.length}个`);

    if (allIcons.problems.length === 0) {
      console.log('\n✅ 结论: Dashboard页面的图标系统工作正常，所有图标都能正常显示！');
      console.log('\n💡 如果您在浏览器中看到图标未显示，建议尝试:');
      console.log('   1. 硬刷新页面: Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac)');
      console.log('   2. 清除浏览器缓存');
      console.log('   3. 检查浏览器开发者工具的Network面板，确认图标资源加载成功');
      console.log('   4. 确认浏览器支持SVG显示');
    } else {
      console.log('\n⚠️  发现部分图标显示问题，请查看上述详细信息');
    }

    console.log('\n📄 截图已保存: dashboard-final-check.png');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
