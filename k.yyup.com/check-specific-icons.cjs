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
    console.log('=== 使用正确凭据登录 ===');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.fill('input[type="text"], input[name="username"]', 'admin');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');

    const loginButton = await page.$('button[type="submit"], .el-button--primary');
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(3000);
    }

    console.log('=== 访问Dashboard页面 ===');
    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    // 详细检查各个区域的图标
    console.log('\n=== 检查侧边栏图标 ===');
    const sidebarIcons = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar, aside, [class*="sidebar"], [class*="aside"]');
      if (!sidebar) return { found: false, icons: [] };

      const icons = [];
      const elements = sidebar.querySelectorAll('svg, i[class*="icon"], [class*="icon"], use, UnifiedIcon');

      elements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        icons.push({
          index: idx,
          tagName: el.tagName,
          className: el.className,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          hasContent: el.tagName === 'SVG' ? el.children.length > 0 : (el.textContent?.trim() || '') !== '',
          attributes: Array.from(el.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {})
        });
      });

      return { found: true, icons };
    });

    if (sidebarIcons.found) {
      console.log(`找到侧边栏，包含 ${sidebarIcons.icons.length} 个图标元素`);

      const sidebarProblems = sidebarIcons.icons.filter(icon =>
        icon.width === 0 ||
        icon.height === 0 ||
        icon.display === 'none' ||
        icon.visibility === 'hidden'
      );

      if (sidebarProblems.length > 0) {
        console.log(`⚠️  发现 ${sidebarProblems.length} 个侧边栏图标问题:`);
        sidebarProblems.slice(0, 10).forEach((icon, idx) => {
          console.log(`\n--- 侧边栏图标问题 #${idx + 1} ---`);
          console.log(`标签: ${icon.tagName}`);
          console.log(`类名: ${icon.className}`);
          console.log(`尺寸: ${icon.width}x${icon.height}`);
          console.log(`状态: ${icon.display}, ${icon.visibility}`);
        });
      } else {
        console.log('✅ 侧边栏图标显示正常');
      }
    } else {
      console.log('未找到侧边栏元素');
    }

    // 检查顶部导航栏图标
    console.log('\n=== 检查顶部导航栏图标 ===');
    const headerIcons = await page.evaluate(() => {
      const header = document.querySelector('header, .header, [class*="header"], nav, .navbar, [class*="nav"]');
      if (!header) return { found: false, icons: [] };

      const icons = [];
      const elements = header.querySelectorAll('svg, i[class*="icon"], [class*="icon"], use');

      elements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        icons.push({
          index: idx,
          tagName: el.tagName,
          className: el.className,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity
        });
      });

      return { found: true, icons };
    });

    if (headerIcons.found) {
      console.log(`找到顶部导航栏，包含 ${headerIcons.icons.length} 个图标元素`);
      const headerProblems = headerIcons.icons.filter(icon =>
        icon.width === 0 || icon.height === 0 || icon.display === 'none'
      );

      if (headerProblems.length > 0) {
        console.log(`⚠️  发现 ${headerProblems.length} 个顶部导航栏图标问题`);
      } else {
        console.log('✅ 顶部导航栏图标显示正常');
      }
    } else {
      console.log('未找到顶部导航栏元素');
    }

    // 检查卡片图标
    console.log('\n=== 检查卡片和内容区图标 ===');
    const contentIcons = await page.evaluate(() => {
      const contentAreas = document.querySelectorAll('.card, .el-card, [class*="card"], [class*="stat"], [class*="quick"]');

      const allIcons = [];
      contentAreas.forEach((area, areaIdx) => {
        const icons = area.querySelectorAll('svg, i[class*="icon"], [class*="icon"], use, UnifiedIcon');

        icons.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);

          allIcons.push({
            areaIndex: areaIdx,
            areaClass: area.className,
            index: idx,
            tagName: el.tagName,
            className: el.className,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            hasContent: el.tagName === 'SVG' ? el.children.length > 0 : (el.textContent?.trim() || '') !== ''
          });
        });
      });

      return allIcons;
    });

    console.log(`在卡片和内容区找到 ${contentIcons.length} 个图标元素`);

    const contentProblems = contentIcons.filter(icon =>
      icon.width === 0 ||
      icon.height === 0 ||
      icon.display === 'none' ||
      icon.visibility === 'hidden' ||
      (!icon.hasContent && icon.tagName !== 'I')
    );

    if (contentProblems.length > 0) {
      console.log(`⚠️  发现 ${contentProblems.length} 个内容区图标问题 (显示前10个):`);
      contentProblems.slice(0, 10).forEach((icon, idx) => {
        console.log(`\n--- 内容区图标问题 #${idx + 1} ---`);
        console.log(`所属区域: ${icon.areaClass || '未知'}`);
        console.log(`标签: ${icon.tagName}`);
        console.log(`类名: ${icon.className || '无'}`);
        console.log(`尺寸: ${icon.width}x${icon.height}`);
        console.log(`状态: ${icon.display}, ${icon.visibility}, opacity=${icon.opacity}`);
      });
    } else {
      console.log('✅ 内容区图标显示正常');
    }

    // 检查具体的图标组件
    console.log('\n=== 检查UnifiedIcon组件使用 ===');
    const unifiedIcons = await page.evaluate(() => {
      // 查找所有可能使用UnifiedIcon的地方
      const elements = document.querySelectorAll('*');
      const unifiedIconUses = [];

      elements.forEach(el => {
        // 检查是否使用了UnifiedIcon (通过类名或标签)
        if (el.tagName === 'UNIFIEDICON' || el.className?.includes('UnifiedIcon')) {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);

          unifiedIconUses.push({
            tagName: el.tagName,
            className: el.className,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            attributes: Array.from(el.attributes).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {})
          });
        }

        // 检查vue组件 (可能显示为实际的SVG)
        if (el.children.length > 0) {
          const svgChild = el.querySelector('svg');
          if (svgChild && el.className?.includes('icon')) {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            unifiedIconUses.push({
              type: 'wrapper-with-svg',
              wrapperClass: el.className,
              svgClass: svgChild.className,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              svgPath: svgChild.innerHTML.substring(0, 100)
            });
          }
        }
      });

      return unifiedIconUses;
    });

    console.log(`找到 ${unifiedIcons.length} 个UnifiedIcon相关元素`);

    if (unifiedIcons.length > 0) {
      const unifiedProblems = unifiedIcons.filter(icon =>
        icon.width === 0 ||
        icon.height === 0 ||
        icon.display === 'none' ||
        icon.visibility === 'hidden'
      );

      if (unifiedProblems.length > 0) {
        console.log(`⚠️  发现 ${unifiedProblems.length} 个UnifiedIcon问题:`);
        unifiedProblems.slice(0, 10).forEach((icon, idx) => {
          console.log(`\n--- UnifiedIcon问题 #${idx + 1} ---`);
          console.log(`标签: ${icon.tagName}`);
          console.log(`类名: ${icon.className}`);
          console.log(`尺寸: ${icon.width}x${icon.height}`);
          console.log(`状态: ${icon.display}, ${icon.visibility}`);

          if (icon.attributes && Object.keys(icon.attributes).length > 0) {
            console.log(`属性: ${JSON.stringify(icon.attributes, null, 2)}`);
          }
        });
      } else {
        console.log('✅ UnifiedIcon组件显示正常');
      }
    }

    // 截图保存
    console.log('\n=== 保存详细截图 ===');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/dashboard-detailed-icons.png',
      fullPage: true
    });

    // 特别检查一些可能的问题点
    console.log('\n=== 检查常见问题点 ===');

    // 检查是否有隐藏的SVG symbol定义
    const svgSymbols = await page.evaluate(() => {
      const symbols = document.querySelectorAll('symbol, svg defs');
      return symbols.length;
    });

    console.log(`找到 ${svgSymbols} 个SVG symbol/defs 定义`);

    // 检查图标字体加载
    const iconFonts = consoleMessages.filter(msg =>
      msg.includes('font') || msg.includes('woff') || msg.includes('ttf')
    );

    if (iconFonts.length > 0) {
      console.log(`\n字体加载相关消息 (${iconFonts.length}条):`);
      iconFonts.slice(-5).forEach(msg => {
        console.log(`  ${msg}`);
      });
    }

    // 生成最终报告
    console.log('\n=== 最终分析报告 ===');
    console.log(`\n📋 Dashboard图标系统检查总结:`);
    console.log(`   侧边栏图标: ${sidebarIcons.found ? `${sidebarIcons.icons.length}个` : '未找到侧边栏'}`);
    console.log(`   顶部导航栏图标: ${headerIcons.found ? `${headerIcons.icons.length}个` : '未找到导航栏'}`);
    console.log(`   内容区图标: ${contentIcons.length}个`);
    console.log(`   UnifiedIcon组件: ${unifiedIcons.length}个`);
    console.log(`   SVG Symbols: ${svgSymbols}个`);

    console.log(`\n🔍 问题统计:`);
    console.log(`   侧边栏问题: ${sidebarIcons.icons.filter(icon => icon.width === 0 || icon.height === 0).length}个`);
    console.log(`   内容区问题: ${contentProblems.length}个`);
    console.log(`   UnifiedIcon问题: ${unifiedIcons.filter(icon => icon.width === 0 || icon.height === 0).length}个`);

    if (sidebarIcons.icons.length > 0 && sidebarIcons.icons.every(icon => icon.width > 0 && icon.height > 0) &&
        contentIcons.length > 0 && contentProblems.length === 0 &&
        unifiedIcons.length > 0 && unifiedIcons.every(icon => icon.width > 0 && icon.height > 0)) {
      console.log('\n✅ 结论: 所有图标显示正常，未发现明显问题');
      console.log('\n💡 如果您看到图标未显示，可能的原因:');
      console.log('   1. 浏览器缓存问题 - 尝试硬刷新 (Ctrl+F5 或 Ctrl+Shift+R)');
      console.log('   2. CSS样式冲突 - 检查是否有自定义CSS覆盖了图标样式');
      console.log('   3. 颜色问题 - 图标可能使用了当前文字颜色，如果文字不可见则图标也不可见');
      console.log('   4. 特定浏览器兼容性问题 - 尝试使用其他浏览器测试');
    } else {
      console.log('\n❌ 发现图标显示问题，请查看上述详细信息');
    }

    console.log('\n=== 检查完成 ===');

  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
