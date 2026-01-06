const { chromium } = require('playwright');

async function realLoginTest() {
  console.log('尝试真实登录测试...');
  let browser;

  try {
    browser = await chromium.launch({
      headless: false,  // 使用有头模式以便操作
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 监听网络请求
    const apiLog = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/auth/login')) {
        try {
          const data = await response.json();
          apiLog.push({
            url: url,
            status: response.status(),
            data: data
          });
          console.log('登录API响应:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('登录API响应状态:', response.status());
        }
      }
    });

    // 访问首页
    console.log('访问首页...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // 尝试快速体验
    console.log('尝试快速体验登录...');
    const quickExperienceBtn = await page.$('text=快速体验');
    if (quickExperienceBtn) {
      await quickExperienceBtn.click();
      await page.waitForTimeout(2000);
    }

    // 选择系统管理员角色
    const adminRole = await page.$('text=系统管理员');
    if (adminRole) {
      await adminRole.click();
      await page.waitForTimeout(5000);
    }

    // 检查是否登录成功
    const currentUrl = page.url();
    console.log('当前URL:', currentUrl);

    if (!currentUrl.includes('login')) {
      console.log('登录成功！现在测试相册API...');

      // 获取登录后的token
      const token = await page.evaluate(() => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
      });

      console.log('获取到token:', token ? token.substring(0, 50) + '...' : 'null');

      if (token) {
        // 测试相册统计API
        console.log('测试相册统计API...');
        const albumResponse = await page.evaluate(async (authToken) => {
          try {
            const response = await fetch('/api/albums/statistics', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            return { status: response.status, data: data };
          } catch (error) {
            return { error: error.message };
          }
        }, token);

        console.log('相册统计API结果:');
        console.log('状态码:', albumResponse.status);
        console.log('数据:', JSON.stringify(albumResponse.data, null, 2));

        // 测试媒体中心统计API
        console.log('\n测试媒体中心统计API...');
        const mediaResponse = await page.evaluate(async (authToken) => {
          try {
            const response = await fetch('/api/media-center/statistics', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            return { status: response.status, data: data };
          } catch (error) {
            return { error: error.message };
          }
        }, token);

        console.log('媒体中心统计API结果:');
        console.log('状态码:', mediaResponse.status);
        console.log('数据:', JSON.stringify(mediaResponse.data, null, 2));

        // 访问媒体中心页面
        console.log('\n访问媒体中心页面...');
        await page.goto('http://localhost:5173/media-center', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // 截图页面
        await page.screenshot({ path: 'media-center-real-login.png', fullPage: true });
        console.log('已保存媒体中心页面截图: media-center-real-login.png');

        // 查找统计数据
        const statsData = await page.$$eval('[class*="stat"], [class*="number"], [class*="count"], .el-statistic', elements =>
          elements.map(el => ({
            text: el.textContent?.trim(),
            class: el.className
          }))
        );

        console.log('\n页面中的统计数据:');
        statsData.forEach((item, i) => {
          if (item.text && /\d+/.test(item.text) && item.text.length < 100) {
            console.log(`  ${i+1}. ${item.text}`);
          }
        });

      } else {
        console.log('未找到token，可能登录失败');
      }

    } else {
      console.log('仍在登录页面，尝试手动登录...');

      // 等待用户手动操作
      console.log('请在浏览器中手动登录，脚本将等待30秒...');
      await page.waitForTimeout(30000);

      // 再次检查登录状态
      const finalUrl = page.url();
      if (!finalUrl.includes('login')) {
        console.log('手动登录成功！');
        await page.screenshot({ path: 'manual-login-success.png', fullPage: true });
      } else {
        console.log('手动登录可能失败');
        await page.screenshot({ path: 'manual-login-failed.png', fullPage: true });
      }
    }

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 不立即关闭浏览器，以便查看结果
    console.log('\n测试完成，浏览器将保持开启30秒...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    if (browser) {
      await browser.close();
    }
  }
}

realLoginTest().then(() => {
  console.log('最终完成');
}).catch(error => {
  console.error('执行失败:', error);
});