const { chromium } = require('playwright');
const fs = require('fs');

async function simpleQuickLogin() {
  console.log('🚀 简单快速登录测试...');

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.waitForTimeout(3000);

    // 尝试点击系统管理员快速体验按钮
    console.log('🔍 尝试点击系统管理员快速体验按钮...');

    try {
      await page.click('text=系统管理员');
      console.log('✅ 点击系统管理员按钮');
    } catch (error) {
      console.log('❌ 点击系统管理员按钮失败:', error.message);
      return false;
    }

    await page.waitForTimeout(5000);

    // 检查是否登录成功
    const currentUrl = page.url();
    const hasSidebar = await page.$('.sidebar, .el-menu, .main-sidebar') !== null;
    const isLoggedIn = hasSidebar || !currentUrl.includes('login');

    if (isLoggedIn) {
      console.log('✅ 快速体验登录成功！');
      console.log('   最终URL:', currentUrl);
      console.log('   有侧边栏:', hasSidebar);

      // 获取侧边栏菜单
      console.log('\n📋 获取侧边栏菜单...');
      const sidebarMenu = await getSidebarMenu(page);

      if (sidebarMenu.length > 0) {
        console.log(`✅ 找到 ${sidebarMenu.length} 个菜单项:`);
        sidebarMenu.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} - ${item.url}`);
        });

        // 保存菜单信息
        const menuInfo = {
          menuItems: sidebarMenu,
          count: sidebarMenu.length,
          loginTime: new Date().toISOString()
        };

        fs.writeFileSync('sidebar-menu-simple.json', JSON.stringify(menuInfo, null, 2));
        console.log('💾 菜单信息已保存到 sidebar-menu-simple.json');

        return true;
      } else {
        console.log('⚠️ 未找到侧边栏菜单');
        return false;
      }
    } else {
      console.log('❌ 快速体验登录失败');
      return false;
    }

  } catch (error) {
    console.error('❌ 快速登录过程中出错:', error);
    return false;
  } finally {
    await browser.close();
  }
}

async function getSidebarMenu(page) {
  try {
    await page.waitForTimeout(2000);

    const menuItems = await page.evaluate(() => {
      const items = [];
      const elements = document.querySelectorAll('a, .menu-item, .el-menu-item');

      elements.forEach(el => {
        const text = el.textContent?.trim();
        const href = el.href || el.getAttribute('href') || el.getAttribute('to') || el.getAttribute('router-link');

        if (text && href && text.length > 0 && text.length < 50 &&
            !text.includes('首页') &&
            !href.includes('logout') &&
            !href.includes('javascript:void') &&
            !href.includes('#')) {

          let fullUrl = href;
          if (href.startsWith('/')) {
            fullUrl = `http://localhost:5173${href}`;
          }

          const exists = items.some(item => item.name === text || item.url === fullUrl);
          if (!exists) {
            items.push({
              name: text,
              url: fullUrl
            });
          }
        }
      });

      return items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    });

    return menuItems;
  } catch (error) {
    console.error('获取菜单时出错:', error);
    return [];
  }
}

// 运行测试
simpleQuickLogin().then(success => {
  if (success) {
    console.log('\n🎉 快速登录成功！');
    console.log('现在可以运行系统性检查了。');
  } else {
    console.log('\n💡 建议检查:');
    console.log('1. 页面是否正确加载');
    console.log('2. 快速体验按钮是否可用');
    console.log('3. 网络连接是否正常');
  }
}).catch(console.error);