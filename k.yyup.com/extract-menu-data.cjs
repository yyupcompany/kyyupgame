const { chromium } = require('playwright');
const fs = require('fs');

async function extractMenuData() {
  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 步骤1：登录系统...');

    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // 填写登录信息
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('🚀 步骤2：访问dashboard页面...');

    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    console.log('🚀 步骤3：提取菜单数据...');

    // 从页面提取菜单数据
    const menuData = await page.evaluate(() => {
      // 尝试从多个可能的位置获取菜单数据
      const stores = window.__PINIA_STORES__ || {};
      const menuStore = stores.menu;

      // 或者从Vue实例中获取
      const app = window.__VUE_APP__;

      // 返回菜单数据
      return {
        fromStore: menuStore ? {
          menuItems: menuStore.menuItems,
          menuGroups: menuStore.menuGroups
        } : null,
        fromWindow: {
          menuItems: window.__MENU_ITEMS__,
          menuGroups: window.__MENU_GROUPS__
        }
      };
    });

    console.log('\n📋 菜单数据提取结果:\n');
    console.log('='.repeat(80));
    console.log(JSON.stringify(menuData, null, 2));

    // 如果没有从store获取到，尝试拦截API响应
    console.log('\n🚀 步骤4：拦截API响应...');

    let menuApiResponse = null;

    page.on('response', async response => {
      if (response.url().includes('/auth-permissions/menu')) {
        try {
          const data = await response.json();
          menuApiResponse = data;
        } catch (e) {
          console.log('无法解析菜单API响应');
        }
      }
    });

    // 刷新页面以触发API请求
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    if (menuApiResponse) {
      console.log('\n📋 从API响应中提取的菜单数据:\n');
      console.log('='.repeat(80));
      console.log(JSON.stringify(menuApiResponse, null, 2));

      // 保存到文件
      fs.writeFileSync(
        '/home/zhgue/kyyupgame/k.yyup.com/menu-data.json',
        JSON.stringify(menuApiResponse, null, 2)
      );
      console.log('\n✅ 菜单数据已保存到: menu-data.json');

      // 分析菜单结构
      if (menuApiResponse.data) {
        const menuItems = menuApiResponse.data;
        console.log('\n📊 菜单结构分析:\n');
        console.log('='.repeat(80));
        console.log(`总菜单项数量: ${menuItems.length}`);

        // 按分类统计
        const categories = {};
        menuItems.forEach(item => {
          const category = item.category || '未分类';
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push(item);
        });

        console.log('\n📂 菜单分类统计:\n');
        Object.keys(categories).forEach((category, index) => {
          console.log(`${index + 1}. ${category}: ${categories[category].length} 个菜单项`);
          categories[category].forEach((item, idx) => {
            console.log(`   ${idx + 1}) ${item.title || item.name} (${item.path})`);
          });
          console.log('');
        });

        // 显示前2个菜单项的详细信息
        console.log('\n🔍 前2个菜单项详细信息:\n');
        console.log('='.repeat(80));
        menuItems.slice(0, 2).forEach((item, index) => {
          console.log(`\n菜单项 ${index + 1}:`);
          console.log(JSON.stringify(item, null, 2));
        });
      }
    } else {
      console.log('\n⚠️ 未能拦截到菜单API响应');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

extractMenuData();
