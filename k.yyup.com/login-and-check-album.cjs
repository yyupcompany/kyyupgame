const { chromium } = require('playwright');

async function loginAndCheckAlbum() {
  console.log('登录并检查相册中心...');
  let browser;

  try {
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 监听网络请求
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          method: request.method(),
          url: request.url(),
          time: new Date().toISOString()
        });
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const request = apiRequests.find(r => r.url === response.url());
        if (request) {
          request.status = response.status();
          request.success = response.ok();
        }
      }
    });

    // 访问首页
    console.log('访问首页...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // 尝试使用快速体验功能
    console.log('尝试快速体验...');

    // 查找快速体验按钮
    const quickExperienceBtn = await page.$('text=快速体验');
    if (quickExperienceBtn) {
      console.log('找到快速体验按钮，点击...');
      await quickExperienceBtn.click();
      await page.waitForTimeout(2000);
    }

    // 查找角色选择选项
    const adminRole = await page.$('text=系统管理员');
    if (adminRole) {
      console.log('选择系统管理员角色...');
      await adminRole.click();
      await page.waitForTimeout(3000);
    }

    // 等待页面加载完成
    await page.waitForTimeout(5000);

    // 检查当前URL
    const currentUrl = page.url();
    console.log('当前URL:', currentUrl);

    // 如果还是在登录页，尝试传统登录
    if (currentUrl.includes('login')) {
      console.log('尝试传统登录...');

      // 查找用户名输入框
      const usernameInput = await page.$('input[type="text"], input[placeholder*="用户"]');
      if (usernameInput) {
        await usernameInput.fill('admin');
        console.log('输入用户名: admin');
      }

      // 查找密码输入框
      const passwordInput = await page.$('input[type="password"], input[placeholder*="密码"]');
      if (passwordInput) {
        await passwordInput.fill('admin123');
        console.log('输入密码: admin123');
      }

      // 查找登录按钮
      const loginBtn = await page.$('button[type="submit"], button:has-text("登录"), .login-btn');
      if (loginBtn) {
        await loginBtn.click();
        console.log('点击登录按钮...');
        await page.waitForTimeout(5000);
      }
    }

    // 再次检查URL
    const newUrl = page.url();
    console.log('登录后URL:', newUrl);

    // 如果登录成功，访问媒体中心
    if (!newUrl.includes('login')) {
      console.log('登录成功，查找媒体中心...');

      // 截图登录后的页面
      await page.screenshot({ path: 'after-login.png', fullPage: true });
      console.log('已保存登录后截图: after-login.png');

      // 查找侧边栏
      const sidebar = await page.$('.sidebar, .nav-menu, [class*="menu"]');
      if (sidebar) {
        console.log('找到侧边栏');

        // 查找媒体中心或相册中心的链接
        const mediaCenterSelectors = [
          'a:has-text("媒体中心")',
          'a:has-text("相册中心")',
          'a:has-text("媒体管理")',
          'a[href*="media"]',
          'a[href*="album"]',
          '[data-route*="media"]',
          '[data-route*="album"]'
        ];

        let foundMediaCenter = false;
        for (const selector of mediaCenterSelectors) {
          try {
            const link = await page.$(selector);
            if (link) {
              console.log(`找到媒体链接: ${selector}`);
              await link.click();
              foundMediaCenter = true;
              await page.waitForTimeout(3000);
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (!foundMediaCenter) {
          console.log('未在侧边栏找到媒体中心，尝试直接访问...');
          await page.goto('http://localhost:5173/media-center', { waitUntil: 'networkidle' });
          await page.waitForTimeout(3000);
        }
      } else {
        console.log('未找到侧边栏，直接访问媒体中心...');
        await page.goto('http://localhost:5173/media-center', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
      }

      // 截图媒体中心页面
      await page.screenshot({ path: 'media-center-final.png', fullPage: true });
      console.log('已保存媒体中心页面截图: media-center-final.png');

      // 获取媒体中心页面的内容
      const pageText = await page.textContent('body');
      console.log('\n媒体中心页面内容长度:', pageText.length);

      // 显示页面的前500个字符
      console.log('\n页面内容预览:');
      console.log(pageText.substring(0, 500));

      // 查找统计数据
      const statsData = await page.$$eval('[class*="stat"], [class*="number"], [class*="count"]', elements =>
        elements.map(el => ({
          text: el.textContent?.trim(),
          class: el.className
        }))
      );

      console.log('\n找到的统计数据:');
      statsData.forEach((item, i) => {
        if (item.text && item.text.length < 100) {
          console.log(`  ${i+1}. ${item.text}`);
        }
      });

      // 显示API请求记录
      console.log('\nAPI请求记录:');
      apiRequests.forEach((req, i) => {
        console.log(`  ${i+1}. ${req.method} ${req.url} - ${req.status || 'pending'} ${req.success ? '✅' : '❌'}`);
      });

    } else {
      console.log('登录失败，仍在登录页面');
      await page.screenshot({ path: 'login-failed.png', fullPage: true });
    }

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

loginAndCheckAlbum().then(() => {
  console.log('\n测试完成');
}).catch(error => {
  console.error('测试失败:', error);
});