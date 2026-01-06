/**
 * 侧边栏页面控制台错误检测脚本 (最终版)
 */
const { chromium } = require('playwright');

async function testSidebar() {
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const jsErrors = [];
  const pageErrors = [];
  const errorPages = [];

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // 排除预期错误
      if (text.includes('401') || text.includes('Unauthorized') ||
          text.includes('favicon') || text.includes('Network Error') ||
          text.includes('Failed to load resource')) {
        return;
      }
      // 收集真正的JS错误
      if (text.includes('ReferenceError') || text.includes('TypeError') ||
          text.includes('SyntaxError') || text.includes('RangeError') ||
          (text.includes('Error:') && !text.includes('Response error'))) {
        jsErrors.push(text);
      }
    }
  });

  try {
    console.log('1. 访问页面...');
    await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('   页面标题:', await page.title());
    console.log('   当前URL:', page.url());

    // 获取所有菜单项
    console.log('\n2. 获取菜单列表...');
    const menuItems = await page.$$('.nav-item, .nav-item center-item');
    console.log(`   找到 ${menuItems.length} 个菜单项`);

    // 获取菜单文本
    const menuTexts = [];
    for (let i = 0; i < menuItems.length; i++) {
      try {
        const text = await menuItems[i].textContent().then(t => t?.trim().replace(/\s+/g, ' ') || 'Unknown');
        menuTexts.push({ index: i, text });
      } catch (e) {
        menuTexts.push({ index: i, text: 'Error' });
      }
    }

    console.log('   菜单列表:');
    menuTexts.forEach(m => console.log(`     ${m.index + 1}. ${m.text}`));

    // 点击每个菜单项
    console.log('\n3. 点击菜单项...');
    let clickCount = 0;
    for (let i = 0; i < menuItems.length; i++) {
      try {
        const text = menuTexts[i]?.text || `菜单${i}`;
        const currentUrl = page.url();

        // 使用JS点击
        await page.evaluate((idx) => {
          const items = document.querySelectorAll('.nav-item, .nav-item center-item');
          if (items[idx]) {
            items[idx].click();
          }
        }, i);

        console.log(`   点击 ${i + 1}/${menuItems.length}: ${text.substring(0, 30)}...`);
        await page.waitForTimeout(2000);

        // 检查URL变化
        const newUrl = page.url();
        if (newUrl !== currentUrl) {
          console.log(`     -> 跳转到: ${newUrl}`);
        }

        clickCount++;
      } catch (e) {
        console.log(`   点击失败: ${e.message}`);
      }
    }

    // 展开子菜单并点击
    console.log('\n4. 展开侧边栏分类...');
    const toggles = await page.$$('.category-toggle, .category-title');
    console.log(`   找到 ${toggles.length} 个分类展开按钮`);

    for (let i = 0; i < Math.min(toggles.length, 20); i++) {
      try {
        await toggles[i].click();
        await page.waitForTimeout(500);
        console.log(`   展开分类 ${i + 1}`);
      } catch (e) {}
    }

    // 获取展开后的子菜单
    await page.waitForTimeout(1000);
    const subItems = await page.$$('.nav-item, .sidebar-link, [class*="nav-item"]');
    console.log(`\n5. 子菜单项: ${subItems.length} 个`);

    // 获取子菜单文本
    const subTexts = [];
    for (let i = 0; i < Math.min(subItems.length, 50); i++) {
      try {
        const text = await subItems[i].textContent().then(t => t?.trim().replace(/\s+/g, ' ') || 'Unknown');
        if (text.length > 1 && text.length < 50) {
          subTexts.push({ index: subTexts.length, text });
        }
      } catch (e) {}
    }

    // 去重并显示
    const uniqueSubTexts = subTexts.filter((v, i, a) => a.findIndex(t => t.text === v.text) === i);
    console.log('   子菜单:');
    uniqueSubTexts.slice(0, 20).forEach(m => console.log(`     - ${m.text}`));

    // 点击子菜单（排除已点击的）
    console.log(`\n6. 点击子菜单 (${uniqueSubTexts.length} 个)...`);
    for (let i = 0; i < Math.min(uniqueSubTexts.length, 30); i++) {
      try {
        const text = uniqueSubTexts[i]?.text || `菜单${i}`;
        const currentUrl = page.url();

        await page.evaluate((txt) => {
          const items = document.querySelectorAll('.nav-item, .sidebar-link, [class*="nav-item"]');
          for (const item of items) {
            if (item.textContent?.trim().includes(txt.substring(0, 10))) {
              item.click();
              break;
            }
          }
        }, text);

        console.log(`   点击子菜单: ${text.substring(0, 25)}...`);
        await page.waitForTimeout(1500);

        const newUrl = page.url();
        if (newUrl !== currentUrl) {
          errorPages.push({ page: text, url: newUrl });
        }
      } catch (e) {
        console.log(`   点击失败: ${e.message}`);
      }
    }

    await page.waitForTimeout(2000);

    // 最终检查
    console.log('\n========== 测试结果 ==========');
    console.log(`点击主菜单: ${clickCount} 个`);
    console.log(`点击子菜单: ${uniqueSubTexts.length} 个`);
    console.log(`JavaScript错误: ${jsErrors.length}`);
    console.log(`页面错误: ${pageErrors.length}`);

    if (jsErrors.length > 0) {
      console.log('\nJavaScript错误详情:');
      jsErrors.slice(0, 10).forEach((err, idx) => console.log(`${idx + 1}. ${err}`));
      if (jsErrors.length > 10) console.log(`... 还有 ${jsErrors.length - 10} 个错误`);
    }

    if (pageErrors.length > 0) {
      console.log('\n页面错误详情:');
      pageErrors.forEach((err, idx) => console.log(`${idx + 1}. ${err}`));
    }

    if (errorPages.length > 0) {
      console.log('\n访问的页面:');
      errorPages.forEach((p, idx) => console.log(`${idx + 1}. ${p.page} -> ${p.url}`));
    }

    if (jsErrors.length === 0 && pageErrors.length === 0) {
      console.log('\n✅ 没有发现JavaScript错误！所有侧边栏页面正常。');
    } else {
      console.log(`\n⚠️ 发现 ${jsErrors.length + pageErrors.length} 个错误需要修复。`);
    }

  } catch (e) {
    console.error('测试出错:', e.message);
  } finally {
    await browser.close();
  }
}

testSidebar();
