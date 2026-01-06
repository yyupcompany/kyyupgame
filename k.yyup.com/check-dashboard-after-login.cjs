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
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  try {
    console.log('=== 步骤 1: 访问登录页面 ===');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // 查找并填写登录表单
    console.log('=== 步骤 2: 尝试登录 ===');
    const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"], input[name="username"]');
    const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');

    if (usernameInput && passwordInput) {
      // 尝试多种可能的用户名密码组合
      const credentials = [
        { username: 'admin', password: '123456' },
        { username: 'admin', password: 'admin' },
        { username: 'test', password: 'test' },
        { username: 'teacher', password: 'teacher' }
      ];

      let loginSuccess = false;
      for (const cred of credentials) {
        console.log(`尝试登录: ${cred.username} / ${cred.password}`);

        await usernameInput.fill(cred.username);
        await passwordInput.fill(cred.password);

        const loginButton = await page.$('button[type="submit"], .el-button--primary, button:has-text("登录"), button:has-text("登 录")');
        if (loginButton) {
          await loginButton.click();
          await page.waitForTimeout(3000);

          // 检查是否成功跳转到dashboard
          const currentUrl = page.url();
          console.log(`登录后URL: ${currentUrl}`);

          if (currentUrl.includes('dashboard') || currentUrl === 'http://localhost:5173/') {
            console.log('✅ 登录成功!');
            loginSuccess = true;
            break;
          }
        }
      }

      if (!loginSuccess) {
        console.log('❌ 登录失败或需要验证码');
        // 继续访问dashboard看是否有其他方式
      }
    } else {
      console.log('未找到登录表单元素');
    }

    // 尝试直接访问dashboard
    console.log('\n=== 步骤 3: 访问Dashboard页面 ===');
    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`当前URL: ${currentUrl}`);

    if (currentUrl.includes('login')) {
      console.log('仍停留在登录页面，可能需要有效凭据');
      // 截图登录页面
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/login-page.png',
        fullPage: true
      });
    } else {
      console.log('✅ 成功访问Dashboard页面');

      // 等待页面完全加载
      await page.waitForTimeout(5000);

      // 全页截图
      console.log('\n=== 步骤 4: 截图Dashboard页面 ===');
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/dashboard-page.png',
        fullPage: true
      });

      // 详细检查图标元素
      console.log('\n=== 步骤 5: 检查图标元素 ===');
      const iconElements = await page.evaluate(() => {
        const results = [];

        // 检查所有可能显示图标的元素
        const selectors = [
          'svg',
          'i[class*="icon"]',
          'i[class*="el-icon"]',
          '[class*="icon"]',
          '.el-icon',
          'span[class*="icon"]',
          'div[class*="icon"]',
          'button[class*="icon"]',
          'a[class*="icon"]',
          'use[href*="icon"]',
          'symbol[id*="icon"]'
        ];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el, idx) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            results.push({
              selector,
              index: idx,
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              hasContent: el.tagName === 'svg' ? el.innerHTML.length > 0 : (el.textContent?.trim() || '') !== '',
              innerHTML: el.innerHTML.substring(0, 200),
              attributes: Array.from(el.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {})
            });
          });
        });

        return results;
      });

      console.log(`\n找到 ${iconElements.length} 个图标相关元素`);

      // 分析问题图标
      const problems = iconElements.filter(el => {
        return (
          el.display === 'none' ||
          el.visibility === 'hidden' ||
          el.opacity === '0' ||
          (el.width === 0 && el.height === 0 && el.tagName !== 'symbol')
        );
      });

      const emptySVGs = iconElements.filter(el =>
        el.tagName === 'svg' &&
        !el.hasContent &&
        el.display !== 'none' &&
        el.visibility !== 'hidden'
      );

      console.log(`\n📊 图标状态统计:`);
      console.log(`   总元素: ${iconElements.length}`);
      console.log(`   问题图标: ${problems.length}`);
      console.log(`   空白SVG: ${emptySVGs.length}`);

      if (problems.length > 0) {
        console.log(`\n❌ 问题图标详情 (前10个):`);
        problems.slice(0, 10).forEach((icon, idx) => {
          console.log(`\n--- 问题 #${idx + 1} ---`);
          console.log(`位置: ${icon.selector} (${icon.index})`);
          console.log(`标签: ${icon.tagName}`);
          console.log(`类名: ${icon.className || '无'}`);
          console.log(`坐标: (${icon.x}, ${icon.y})`);
          console.log(`尺寸: ${icon.width}x${icon.height}`);
          console.log(`显示: ${icon.display}, ${icon.visibility}, ${icon.opacity}`);

          if (Object.keys(icon.attributes).length > 0) {
            console.log(`属性: ${JSON.stringify(icon.attributes, null, 2)}`);
          }
        });
      }

      if (emptySVGs.length > 0) {
        console.log(`\n⚠️  空白SVG图标 (前10个):`);
        emptySVGs.slice(0, 10).forEach((icon, idx) => {
          console.log(`\n--- 空白SVG #${idx + 1} ---`);
          console.log(`类名: ${icon.className}`);
          console.log(`坐标: (${icon.x}, ${icon.y})`);
          console.log(`尺寸: ${icon.width}x${icon.height}`);
          if (icon.attributes.href) {
            console.log(`引用: ${icon.attributes.href}`);
          }
        });
      }

      // 检查Element Plus图标
      console.log('\n=== Element Plus 图标检查 ===');
      const elIcons = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="el-icon"]');
        const icons = [];

        elements.forEach(el => {
          const classes = el.className.split(' ').filter(c => c.startsWith('el-icon-'));
          if (classes.length > 0) {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            icons.push({
              className: el.className,
              iconClass: classes[0],
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              hasContent: el.textContent?.trim() !== '' || el.children.length > 0
            });
          }
        });

        return icons;
      });

      if (elIcons.length > 0) {
        console.log(`找到 ${elIcons.length} 个Element Plus图标元素`);

        const brokenElIcons = elIcons.filter(icon =>
          icon.width === 0 ||
          icon.height === 0 ||
          !icon.hasContent
        );

        if (brokenElIcons.length > 0) {
          console.log(`❌ 发现 ${brokenElIcons.length} 个Element Plus图标问题:`);
          brokenElIcons.slice(0, 10).forEach((icon, idx) => {
            console.log(`\n--- Element Plus图标问题 #${idx + 1} ---`);
            console.log(`图标类: ${icon.iconClass}`);
            console.log(`完整类名: ${icon.className}`);
            console.log(`尺寸: ${icon.width}x${icon.height}`);
            console.log(`状态: ${icon.display}, ${icon.visibility}, ${icon.opacity}`);
          });
        } else {
          console.log('✅ 所有Element Plus图标显示正常');
        }
      } else {
        console.log('未找到Element Plus图标');
      }

      // 检查自定义图标系统
      console.log('\n=== 自定义图标系统检查 ===');
      const customIcons = await page.evaluate(() => {
        const unifiedIconElements = document.querySelectorAll('UnifiedIcon, [data-testid*="icon"], [class*="UnifiedIcon"]');
        return unifiedIconElements.length;
      });

      if (customIcons > 0) {
        console.log(`发现 ${customIcons} 个自定义图标组件`);
      }

      // 检查网络请求中的图标资源
      console.log('\n=== 资源加载检查 ===');
      console.log('控制台消息 (前15条):');
      consoleMessages.slice(-15).forEach(msg => {
        console.log(`  ${msg}`);
      });

      if (consoleErrors.length > 0) {
        console.log('\n❌ 控制台错误:');
        consoleErrors.forEach(err => {
          console.log(`  ${err}`);
        });
      }
    }

    console.log('\n=== 检查完成 ===');

  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
