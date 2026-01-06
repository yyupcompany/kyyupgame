/**
 * 检查localStorage中的模拟认证数据
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 检查localStorage模拟认证数据...\n');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 1. 访问首页
    console.log('📍 步骤1: 访问首页');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    await page.waitForTimeout(5000);
    console.log('✅ 首页加载完成\n');

    // 2. 检查localStorage
    console.log('📍 步骤2: 检查localStorage');
    const storageData = await page.evaluate(() => {
      const token = localStorage.getItem('kindergarten_token');
      const userInfoStr = localStorage.getItem('kindergarten_user_info');
      let userInfo = null;

      if (userInfoStr) {
        try {
          userInfo = JSON.parse(userInfoStr);
        } catch (e) {
          console.error('解析用户信息失败:', e);
        }
      }

      return {
        token: token ? token.substring(0, 20) + '...' : null,
        userInfo: userInfo
      };
    });

    console.log('localStorage数据:', JSON.stringify(storageData, null, 2), '\n');

    // 3. 检查用户store状态
    console.log('📍 步骤3: 检查用户store状态');
    const userStoreState = await page.evaluate(() => {
      // 尝试获取用户store
      const userStore = window.__PINIA__?.stores?.user;
      if (userStore) {
        return {
          isLoggedIn: userStore.isLoggedIn,
          isAuthenticated: userStore.isAuthenticated,
          token: userStore.token ? userStore.token.substring(0, 20) + '...' : null,
          user: userStore.user
        };
      }
      return null;
    });

    console.log('用户Store状态:', JSON.stringify(userStoreState, null, 2), '\n');

    // 4. 访问AI助手页面
    console.log('📍 步骤4: 访问AI助手页面');
    await page.goto('http://localhost:5173/aiassistant', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    await page.waitForTimeout(10000);
    console.log('✅ AI助手页面加载完成\n');

    // 5. 再次检查URL和localStorage
    const currentUrl = page.url();
    console.log('📍 步骤5: 当前URL:', currentUrl, '\n');

    if (currentUrl.includes('aiassistant')) {
      // 6. 检查页面元素
      console.log('📍 步骤6: 检查页面元素');
      const elements = await page.evaluate(() => {
        return {
          aiAssistantPage: !!document.querySelector('.ai-assistant-page'),
          sidebar: !!document.querySelector('.sidebar'),
          sidebarHeader: !!document.querySelector('.sidebar-header'),
          menuTitles: document.querySelectorAll('.menu-section-title').length,
          menuItems: document.querySelectorAll('.el-menu-item').length
        };
      });

      console.log('页面元素:', JSON.stringify(elements, null, 2), '\n');

      // 7. 截图
      console.log('📍 步骤7: 截图');
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-success-verification.png',
        fullPage: true
      });
      console.log('✅ 成功截图已保存\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 模拟认证数据检查完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (storageData.token && storageData.userInfo) {
      console.log('✅ 模拟认证数据已正确存储');
      console.log('  - Token存在:', !!storageData.token);
      console.log('  - 用户信息:', storageData.userInfo.username);
    } else {
      console.log('⚠️ 模拟认证数据未找到');
    }

    if (currentUrl.includes('aiassistant')) {
      console.log('✅ 成功访问AI助手页面');
    } else {
      console.log('⚠️ 仍重定向到登录页');
      console.log('  - 原因可能是前端路由守卫执行时机问题');
      console.log('  - 或者前端热重载未完全生效');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);

    try {
      await page.screenshot({
        path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-storage-check-error.png',
        fullPage: true
      });
      console.log('✅ 错误截图已保存\n');
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
})();
