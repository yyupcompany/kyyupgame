const { chromium } = require('playwright');
const path = require('path');

async function checkAlbumCenter() {
  console.log('启动浏览器...');
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 访问首页
    console.log('访问 http://localhost:5173 ...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 截图首页
    await page.screenshot({ path: '01-homepage.png', fullPage: true });
    console.log('已保存首页截图: 01-homepage.png');

    // 查找登录按钮
    console.log('查找登录入口...');
    try {
      // 尝试不同的登录按钮选择器
      const loginSelectors = [
        'text=登录',
        'text=登录系统',
        'button:has-text("登录")',
        'a:has-text("登录")',
        '.login-btn',
        '[data-testid="login"]'
      ];

      let loginButton = null;
      for (const selector of loginSelectors) {
        try {
          loginButton = await page.waitForSelector(selector, { timeout: 2000 });
          if (loginButton) {
            console.log(`找到登录按钮: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!loginButton) {
        console.log('未找到明显的登录按钮，检查页面内容...');
        const pageContent = await page.textContent('body');
        console.log('页面内容片段:', pageContent.substring(0, 200));

        // 查找所有可点击的元素
        const clickables = await page.$$eval('a, button', elements =>
          elements.map(el => ({ tag: el.tagName, text: el.textContent?.trim(), class: el.className }))
        );
        console.log('可点击元素:', clickables.slice(0, 10));
      } else {
        await loginButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '02-login-page.png', fullPage: true });
        console.log('已保存登录页面截图: 02-login-page.png');
      }
    } catch (error) {
      console.log('处理登录页面时出错:', error.message);
    }

    // 尝试直接访问相册中心
    console.log('尝试直接访问相册中心...');
    try {
      await page.goto('http://localhost:5173/album-center', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      await page.screenshot({ path: '03-album-center.png', fullPage: true });
      console.log('已保存相册中心截图: 03-album-center.png');

      // 检查相册中心的内容
      const albumCenterContent = await page.textContent('body');
      console.log('相册中心页面内容片段:', albumCenterContent.substring(0, 300));

      // 查找统计数据
      const statsElements = await page.$$eval('.stat-card, .data-card, .number, .count', elements =>
        elements.map(el => ({ text: el.textContent?.trim(), class: el.className }))
      );
      console.log('统计元素:', statsElements);

    } catch (error) {
      console.log('访问相册中心时出错:', error.message);
    }

    // 检查是否已登录并查找侧边栏
    console.log('检查侧边栏...');
    try {
      const sidebar = await page.$('.sidebar, .menu, .nav-menu');
      if (sidebar) {
        console.log('找到侧边栏');

        // 查找相册中心链接
        const albumLink = await page.$('a:has-text("相册"), a:has-text("相册中心"), [data-route*="album"]');
        if (albumLink) {
          console.log('找到相册中心链接');
          await albumLink.click();
          await page.waitForTimeout(3000);

          await page.screenshot({ path: '04-album-center-from-sidebar.png', fullPage: true });
          console.log('已保存从侧边栏访问的相册中心截图: 04-album-center-from-sidebar.png');
        }
      } else {
        console.log('未找到侧边栏');
      }
    } catch (error) {
      console.log('处理侧边栏时出错:', error.message);
    }

    // 最后再截一个当前页面状态
    await page.screenshot({ path: '05-final-state.png', fullPage: true });
    console.log('已保存最终状态截图: 05-final-state.png');

  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkAlbumCenter().then(() => {
  console.log('检查完成');
}).catch(error => {
  console.error('检查失败:', error);
});