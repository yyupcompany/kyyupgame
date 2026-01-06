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

  // 监听控制台错误和消息
  const consoleMessages = [];
  const consoleErrors = [];
  const networkRequests = [];
  const failedResponses = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('request', request => {
    const url = request.url();
    if (url.includes('icon') || url.includes('.svg') || url.includes('.woff') || url.includes('.ttf') || url.includes('font')) {
      networkRequests.push(url);
    }
  });

  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (status >= 400 && (url.includes('icon') || url.includes('.svg') || url.includes('.woff') || url.includes('.ttf'))) {
      failedResponses.push({ url, status });
    }
  });

  try {
    console.log('=== 步骤 1: 访问登录页面 ===');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    console.log('=== 步骤 2: 使用正确凭据登录 ===');
    // 使用正确的管理员凭据
    await page.fill('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="名"]', 'admin');
    await page.fill('input[type="password"], input[name="password"], input[placeholder*="密码"]', 'admin123');

    const loginButton = await page.$('button[type="submit"], .el-button--primary, button:has-text("登录"), button:has-text("登 录")');
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      console.log(`登录后URL: ${currentUrl}`);

      if (currentUrl.includes('dashboard')) {
        console.log('✅ 登录成功!');
      } else {
        console.log('⚠️  登录后未跳转到dashboard，继续访问...');
      }
    }

    console.log('\n=== 步骤 3: 访问Dashboard页面 ===');
    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    const finalUrl = page.url();
    console.log(`最终URL: ${finalUrl}`);

    if (finalUrl.includes('login')) {
      console.log('❌ 仍在登录页面，跳过图标检查');
      return;
    }

    console.log('✅ 成功访问Dashboard页面');

    // 等待所有图标加载
    await page.waitForTimeout(3000);

    console.log('\n=== 步骤 4: 全页截图 ===');
    await page.screenshot({
      path: '/home/zhgue/kyyupgame/k.yyup.com/dashboard-with-icons.png',
      fullPage: true
    });

    console.log('\n=== 步骤 5: 详细检查图标元素 ===');
    const iconAnalysis = await page.evaluate(() => {
      const results = {
        totalElements: 0,
        displayIcons: [],
        hiddenIcons: [],
        brokenIcons: [],
        elIcons: [],
        svgIcons: [],
        customIcons: []
      };

      // 检查所有图标相关元素
      const checkElement = (el, selector, index) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const display = style.display;
        const visibility = style.visibility;
        const opacity = style.opacity;

        // 收集元素信息
        const elementInfo = {
          selector,
          index,
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          display,
          visibility,
          opacity,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          textContent: (el.textContent || '').trim(),
          innerHTML: el.innerHTML.substring(0, 150),
          attributes: Array.from(el.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          hasContent: false,
          parentTag: el.parentElement?.tagName || null,
          parentClass: el.parentElement?.className || null
        };

        // 判断是否有内容
        if (el.tagName === 'SVG') {
          elementInfo.hasContent = el.children.length > 0 || el.getAttribute('viewBox') !== null;
        } else if (el.tagName === 'USE') {
          elementInfo.hasContent = el.getAttribute('href') !== null || el.getAttribute('xlink:href') !== null;
        } else {
          elementInfo.hasContent = elementInfo.textContent !== '' || el.children.length > 0;
        }

        return elementInfo;
      };

      // 检查不同类型的图标
      const selectors = [
        { name: 'SVG图标', selector: 'svg' },
        { name: 'Element Plus图标', selector: 'i[class*="el-icon"]' },
        { name: '自定义图标', selector: 'i[class*="icon"]:not([class*="el-icon"])' },
        { name: '带icon类的元素', selector: '[class*="icon"]' },
        { name: '所有el-icon元素', selector: '.el-icon' }
      ];

      selectors.forEach(({ name, selector }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, idx) => {
          const info = checkElement(el, selector, idx);
          results.totalElements++;

          // 分类图标
          if (info.display !== 'none' && info.visibility !== 'hidden' && info.opacity !== '0') {
            if (info.width > 0 && info.height > 0 && info.hasContent) {
              results.displayIcons.push({ ...info, type: name });
            } else {
              results.brokenIcons.push({ ...info, type: name });
            }
          } else {
            results.hiddenIcons.push({ ...info, type: name });
          }

          // 特殊分类
          if (name === 'Element Plus图标') {
            results.elIcons.push(info);
          } else if (name === 'SVG图标') {
            results.svgIcons.push(info);
          }
        });
      });

      return results;
    });

    console.log(`\n📊 图标统计总览:`);
    console.log(`   总元素数: ${iconAnalysis.totalElements}`);
    console.log(`   正常显示: ${iconAnalysis.displayIcons.length}`);
    console.log(`   隐藏状态: ${iconAnalysis.hiddenIcons.length}`);
    console.log(`   破损图标: ${iconAnalysis.brokenIcons.length}`);
    console.log(`   Element Plus: ${iconAnalysis.elIcons.length}`);
    console.log(`   SVG图标: ${iconAnalysis.svgIcons.length}`);

    // 显示破损图标详情
    if (iconAnalysis.brokenIcons.length > 0) {
      console.log(`\n❌ 破损图标详情 (前15个):`);
      iconAnalysis.brokenIcons.slice(0, 15).forEach((icon, idx) => {
        console.log(`\n--- 破损图标 #${idx + 1} [${icon.type}] ---`);
        console.log(`标签: ${icon.tagName}`);
        console.log(`类名: ${icon.className || '无'}`);
        console.log(`坐标: (${icon.x}, ${icon.y})`);
        console.log(`尺寸: ${icon.width}x${icon.height}`);
        console.log(`状态: display=${icon.display}, visibility=${icon.visibility}, opacity=${icon.opacity}`);

        if (icon.tagName === 'SVG') {
          if (icon.attributes.viewBox) {
            console.log(`SVG viewBox: ${icon.attributes.viewBox}`);
          }
          if (icon.attributes.href) {
            console.log(`引用: ${icon.attributes.href}`);
          }
          if (icon.attributes['xlink:href']) {
            console.log(`xlink引用: ${icon.attributes['xlink:href']}`);
          }
          console.log(`SVG内容长度: ${icon.innerHTML.length} 字符`);
        } else if (icon.tagName === 'I') {
          if (icon.className.includes('el-icon-')) {
            const iconClass = icon.className.split(' ').find(c => c.startsWith('el-icon-'));
            console.log(`Element Plus图标类: ${iconClass}`);
          }
        }

        if (icon.textContent) {
          console.log(`文本内容: ${icon.textContent.substring(0, 50)}`);
        }
      });
    }

    // 检查Element Plus图标问题
    if (iconAnalysis.elIcons.length > 0) {
      const brokenElIcons = iconAnalysis.elIcons.filter(icon =>
        icon.width === 0 ||
        icon.height === 0 ||
        (!icon.hasContent && icon.textContent === '')
      );

      if (brokenElIcons.length > 0) {
        console.log(`\n⚠️  Element Plus图标问题 (前10个):`);
        brokenElIcons.slice(0, 10).forEach((icon, idx) => {
          const iconClass = icon.className.split(' ').find(c => c.startsWith('el-icon-'));
          console.log(`\n--- Element Plus图标问题 #${idx + 1} ---`);
          console.log(`图标类: ${iconClass || '未知'}`);
          console.log(`完整类名: ${icon.className}`);
          console.log(`尺寸: ${icon.width}x${icon.height}`);
          console.log(`状态: ${icon.display}, ${icon.visibility}, ${icon.opacity}`);
          console.log(`文本内容: ${icon.textContent || '无'}`);
        });
      } else {
        console.log('\n✅ Element Plus图标显示正常');
      }
    }

    // 检查网络请求
    console.log('\n=== 步骤 6: 网络资源检查 ===');
    console.log(`\n图标/字体相关请求 (${networkRequests.length}个):`);
    networkRequests.slice(0, 20).forEach((req, idx) => {
      console.log(`  ${idx + 1}. ${req}`);
    });

    if (failedResponses.length > 0) {
      console.log(`\n❌ 失败的资源加载:`);
      failedResponses.forEach((req, idx) => {
        console.log(`  ${idx + 1}. ${req.url} (状态: ${req.status})`);
      });
    } else {
      console.log(`\n✅ 所有图标资源加载成功`);
    }

    // 检查控制台
    console.log('\n=== 步骤 7: 控制台信息 ===');
    if (consoleErrors.length > 0) {
      console.log(`\n❌ 控制台错误 (${consoleErrors.length}个):`);
      consoleErrors.slice(0, 10).forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    } else {
      console.log('\n✅ 无控制台错误');
    }

    console.log('\n=== 步骤 8: 生成修复建议 ===');

    if (iconAnalysis.brokenIcons.length > 0) {
      console.log('\n🔧 修复建议:');

      // 检查是否缺少字体文件
      const hasIconFont = networkRequests.some(req =>
        req.includes('.woff') || req.includes('.ttf') || req.includes('iconfont')
      );

      if (!hasIconFont) {
        console.log('\n1. 图标字体文件缺失:');
        console.log('   - 检查是否正确引入了图标字体文件 (如 iconfont.woff)');
        console.log('   - 确认CSS中包含 @font-face 定义');
      }

      // 检查Element Plus图标
      const hasElIconIssues = iconAnalysis.elIcons.some(icon =>
        icon.width === 0 || icon.height === 0
      );

      if (hasElIconIssues) {
        console.log('\n2. Element Plus图标问题:');
        console.log('   - 检查是否正确安装并引入了Element Plus Icons');
        console.log('   - 确认在main.js/ts中正确注册了图标组件');
        console.log('   - 检查图标类名是否正确 (如 el-icon-xxx)');
      }

      // 检查CSS问题
      const hasDisplayNone = iconAnalysis.brokenIcons.some(icon =>
        icon.display === 'none'
      );

      const hasInvisible = iconAnalysis.brokenIcons.some(icon =>
        icon.visibility === 'hidden'
      );

      if (hasDisplayNone) {
        console.log('\n3. CSS显示问题:');
        console.log('   - 检查CSS中是否有 display: none 的设置');
        console.log('   - 确认图标容器没有错误的样式覆盖');
      }

      if (hasInvisible) {
        console.log('\n4. 可见性问题:');
        console.log('   - 检查是否有 visibility: hidden 的设置');
        console.log('   - 确认父元素没有隐藏子元素');
      }

      // 检查SVG符号
      const hasSvgUse = iconAnalysis.brokenIcons.some(icon =>
        icon.tagName === 'USE'
      );

      if (hasSvgUse) {
        console.log('\n5. SVG符号问题:');
        console.log('   - 检查SVG符号库是否正确定义');
        console.log('   - 确认use元素的href/xlink:href指向正确的symbol');
        console.log('   - 检查symbol的id是否唯一');
      }
    } else {
      console.log('\n✅ 未发现明显图标问题');
    }

    console.log('\n=== 检查完成 ===');
    console.log('请查看生成的截图: dashboard-with-icons.png');

  } catch (error) {
    console.error('❌ 脚本执行失败:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
