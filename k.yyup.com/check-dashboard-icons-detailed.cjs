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

  // 监听控制台错误
  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  // 监听网络请求
  const allRequests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('icon') || url.includes('font') || url.includes('.svg') || url.includes('.woff') || url.includes('.ttf')) {
      allRequests.push(url);
    }
  });

  const failedResources = [];
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    if (status >= 400 && (url.includes('icon') || url.includes('font') || url.includes('.svg'))) {
      failedResources.push({ url, status });
    }
  });

  try {
    console.log('正在访问 dashboard 页面...');
    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('等待页面加载完成...');
    await page.waitForTimeout(5000);

    // 检查是否有登录页面重定向
    const currentUrl = page.url();
    console.log(`当前URL: ${currentUrl}`);

    if (currentUrl.includes('login')) {
      console.log('检测到需要登录，正在尝试登录...');
      // 尝试快速登录
      await page.fill('input[placeholder*="用户名"], input[type="text"], input[name="username"]', 'admin');
      await page.fill('input[placeholder*="密码"], input[type="password"]', '123456');
      await page.click('button[type="submit"], .el-button--primary, button:has-text("登录")');
      await page.waitForTimeout(3000);
    }

    // 全页截图
    console.log('\n=== 全页截图 ===');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/dashboard-full-page.png',
      fullPage: true
    });

    // 详细检查所有可能显示图标的元素
    console.log('\n=== 详细图标元素检查 ===');
    const allElements = await page.evaluate(() => {
      const results = [];

      // 查找所有可能有图标的元素
      const selectors = [
        'svg',
        'i[class*="icon"]',
        'i[class*="el-icon"]',
        '[class*="icon"]',
        '.el-icon',
        'span[class*="icon"]',
        'div[class*="icon"]',
        'button[class*="icon"]',
        'a[class*="icon"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, idx) => {
          const computedStyle = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          const display = computedStyle.display;
          const visibility = computedStyle.visibility;
          const opacity = computedStyle.opacity;

          // 检查实际渲染内容
          let actualContent = '';
          if (el.tagName === 'svg') {
            actualContent = el.innerHTML.substring(0, 100);
          } else if (el.textContent) {
            actualContent = el.textContent.trim().substring(0, 50);
          }

          const parent = el.parentElement;
          const parentInfo = parent ? {
            tagName: parent.tagName,
            className: parent.className
          } : null;

          results.push({
            selector,
            index: idx,
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            display,
            visibility,
            opacity,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            actualContent,
            parent: parentInfo,
            attributes: Array.from(el.attributes).reduce((acc, a) => {
              acc[a.name] = a.value;
              return acc;
            }, {})
          });
        });
      });

      return results;
    });

    console.log(`\n总共找到 ${allElements.length} 个潜在图标元素`);

    // 分析和分类图标
    const displayIcons = allElements.filter(el =>
      el.display !== 'none' &&
      el.visibility !== 'hidden' &&
      el.opacity !== '0' &&
      (el.actualContent || el.tagName === 'svg' || el.className.includes('icon'))
    );

    const hiddenIcons = allElements.filter(el =>
      el.display === 'none' ||
      el.visibility === 'hidden' ||
      el.opacity === '0'
    );

    const emptyIcons = allElements.filter(el =>
      el.display !== 'none' &&
      el.visibility !== 'hidden' &&
      el.opacity !== '0' &&
      !el.actualContent &&
      el.tagName !== 'svg' &&
      !el.className.includes('icon') &&
      el.width === 0 &&
      el.height === 0
    );

    console.log(`\n📊 图标分类统计:`);
    console.log(`   正常显示: ${displayIcons.length}`);
    console.log(`   隐藏状态: ${hiddenIcons.length}`);
    console.log(`   空白图标: ${emptyIcons.length}`);

    // 显示问题图标详情
    if (emptyIcons.length > 0 || hiddenIcons.length > 0) {
      console.log(`\n❌ 问题图标详情:`);

      const problems = [...hiddenIcons, ...emptyIcons].slice(0, 20);
      problems.forEach((icon, idx) => {
        console.log(`\n--- 问题 #${idx + 1} ---`);
        console.log(`位置: ${icon.selector} (第${icon.index}个)`);
        console.log(`标签: ${icon.tagName}`);
        console.log(`类名: ${icon.className || '无'}`);
        console.log(`ID: ${icon.id || '无'}`);
        console.log(`显示状态: display=${icon.display}, visibility=${icon.visibility}, opacity=${icon.opacity}`);
        console.log(`尺寸: ${icon.width}x${icon.height}`);
        console.log(`内容: ${icon.actualContent || '无'}`);

        if (Object.keys(icon.attributes).length > 0) {
          console.log(`属性: ${JSON.stringify(icon.attributes)}`);
        }

        if (icon.parent) {
          console.log(`父元素: ${icon.parent.tagName}.${icon.parent.className}`);
        }

        if (icon.width === 0 && icon.height === 0) {
          console.log(`⚠️  问题: 元素尺寸为0，可能未正确加载`);
        }

        if (!icon.actualContent && icon.tagName !== 'svg') {
          console.log(`⚠️  问题: 无渲染内容`);
        }
      });
    }

    // 检查常见的图标库使用情况
    console.log(`\n=== 图标库使用情况 ===`);

    const iconLibraries = await page.evaluate(() => {
      const libInfo = {
        elementPlus: false,
        iconify: false,
        custom: false,
        elIcons: []
      };

      // 检查Element Plus图标
      const elIconElements = document.querySelectorAll('[class*="el-icon"]');
      if (elIconElements.length > 0) {
        libInfo.elementPlus = true;
        elIconElements.forEach(el => {
          const classes = el.className.split(' ').filter(c => c.startsWith('el-icon-'));
          if (classes.length > 0) {
            libInfo.elIcons.push(classes[0]);
          }
        });
      }

      // 检查Iconify
      const iconifyElements = document.querySelectorAll('[data-icon], [data-iconify]');
      if (iconifyElements.length > 0) {
        libInfo.iconify = true;
      }

      // 检查自定义图标
      const customIconElements = document.querySelectorAll('[class*="icon-"]:not([class*="el-icon"])');
      if (customIconElements.length > 0) {
        libInfo.custom = true;
      }

      return libInfo;
    });

    console.log(`Element Plus: ${iconLibraries.elementPlus ? '✅ 使用' : '❌ 未使用'}`);
    if (iconLibraries.elIcons.length > 0) {
      console.log(`  发现图标: ${[...new Set(iconLibraries.elIcons)].join(', ')}`);
    }

    console.log(`Iconify: ${iconLibraries.iconify ? '✅ 使用' : '❌ 未使用'}`);
    console.log(`自定义图标: ${iconLibraries.custom ? '✅ 使用' : '❌ 未使用'}`);

    // 检查CSS和字体文件
    console.log(`\n=== 资源加载情况 ===`);
    console.log(`\n所有图标/字体相关请求:`);
    allRequests.slice(0, 20).forEach((req, idx) => {
      console.log(`  ${idx + 1}. ${req}`);
    });

    if (failedResources.length > 0) {
      console.log(`\n❌ 失败的资源加载:`);
      failedResources.forEach((req, idx) => {
        console.log(`  ${idx + 1}. ${req.url} (${req.status})`);
      });
    }

    // 检查控制台警告
    if (consoleWarnings.length > 0) {
      console.log(`\n⚠️  控制台警告:`);
      consoleWarnings.slice(0, 10).forEach((warn, idx) => {
        console.log(`  ${idx + 1}. ${warn}`);
      });
    }

    // 生成修复建议
    console.log(`\n=== 修复建议 ===`);

    if (hiddenIcons.length > 0) {
      console.log(`\n1. 隐藏图标的CSS问题:`);
      console.log(`   - 检查CSS中是否设置了 display: none, visibility: hidden 或 opacity: 0`);
      console.log(`   - 确认图标容器是否有正确的宽度和高度`);
      console.log(`   - 检查父元素是否影响了图标的显示`);
    }

    if (emptyIcons.length > 0) {
      console.log(`\n2. 空白图标问题:`);
      console.log(`   - 检查图标字体是否正确加载`);
      console.log(`   - 确认图标类名是否正确应用`);
      console.log(`   - 检查图标库版本兼容性`);
    }

    if (allRequests.length === 0) {
      console.log(`\n3. 未检测到图标资源加载:`);
      console.log(`   - 页面可能使用了内联图标或SVG符号`);
      console.log(`   - 检查是否正确引入了图标字体文件`);
    }

    console.log(`\n=== 检查完成 ===`);

  } catch (error) {
    console.error('❌ 页面访问失败:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
