/**
 * Admin侧边栏菜单错误检测脚本（简化版）
 */

const { chromium } = require('playwright');
const fs = require('fs');

const CONFIG = {
  baseURL: 'http://localhost:5173',
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  outputFile: '/home/zhgue/kyyupgame/k.yyup.com/admin-sidebar-errors.json'
};

async function main() {
  console.log('🚀 启动浏览器...');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // 访问登录页面
    console.log('📝 访问登录页面...');
    await page.goto(CONFIG.baseURL, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(3000);

    // 输入用户名和密码
    console.log('🔑 输入登录信息...');
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill(CONFIG.admin.username);
      await inputs[1].fill(CONFIG.admin.password);
    }

    // 点击登录按钮
    console.log('✅ 点击登录按钮...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);

    // 获取当前URL
    const currentUrl = page.url();
    console.log('📍 当前URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.error('❌ 登录失败，仍在登录页面');
      await browser.close();
      return;
    }

    // 监听控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack
      });
    });

    // 等待侧边栏加载
    console.log('⏳ 等待侧边栏加载...');
    await page.waitForTimeout(5000);

    // 获取侧边栏菜单结构
    console.log('📋 获取侧边栏菜单结构...');
    const menuItems = await page.evaluate(() => {
      const items = [];
      const menuElements = document.querySelectorAll('.el-menu-item, .el-sub-menu__title');

      menuElements.forEach((item, index) => {
        const text = item.textContent?.trim() || '';
        const ariaLabel = item.getAttribute('aria-label') || '';
        items.push({ index, text, ariaLabel });
      });

      return items;
    });

    console.log(`✅ 找到 ${menuItems.length} 个菜单项`);
    menuItems.forEach(item => {
      console.log(`   - ${item.text}`);
    });

    // 保存菜单结构
    const results = {
      timestamp: new Date().toISOString(),
      menuItems: menuItems,
      errors: []
    };

    // 检测每个菜单项
    console.log(`\n🔍 开始检测 ${menuItems.length} 个菜单项...\n`);

    for (let i = 0; i < menuItems.length; i++) {
      const menuItem = menuItems[i];
      console.log(`[${i + 1}/${menuItems.length}] 检测: ${menuItem.text}`);

      // 清空错误
      consoleErrors.length = 0;

      // 点击菜单项
      try {
        const selector = `.el-menu-item:nth-child(${i + 1}), .el-sub-menu__title:nth-child(${i + 1})`;
        const element = await page.$(selector);

        if (element) {
          await element.click();
          await page.waitForTimeout(3000);

          const currentUrl = page.url();
          const pageTitle = await page.title();
          const pageContent = await page.content();

          const has404 = pageContent.includes('404') || pageTitle.includes('404');
          const hasErrors = consoleErrors.length > 0;

          if (has404 || hasErrors) {
            console.error(`   ❌ 发现错误:`);
            console.error(`      - 404错误: ${has404}`);
            console.error(`      - 控制台错误: ${consoleErrors.length}个`);

            results.errors.push({
              menuItem: menuItem.text,
              url: currentUrl,
              title: pageTitle,
              has404,
              consoleErrors: [...consoleErrors]
            });
          } else {
            console.log(`   ✅ 正常`);
          }
        } else {
          console.warn(`   ⚠️  未找到菜单项元素`);
        }
      } catch (error) {
        console.error(`   ❌ 访问失败: ${error.message}`);
        results.errors.push({
          menuItem: menuItem.text,
          error: error.message
        });
      }
    }

    // 保存结果
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));
    console.log(`\n📊 检测完成！结果已保存到: ${CONFIG.outputFile}`);
    console.log(`\n📈 统计信息:`);
    console.log(`   - 总菜单数: ${menuItems.length}`);
    console.log(`   - 错误菜单: ${results.errors.length}`);

  } catch (error) {
    console.error('❌ 检测过程中发生错误:', error);
  } finally {
    await browser.close();
  }
}

main();
