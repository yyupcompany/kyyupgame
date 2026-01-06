const { chromium } = require('playwright');
const fs = require('fs');

async function analyzePage() {
  console.log('启动浏览器分析...');
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

    // 监听控制台输出
    page.on('console', msg => {
      console.log('浏览器控制台:', msg.type(), msg.text());
    });

    // 监听网络请求
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('API请求:', request.method(), request.url());
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log('API响应:', response.status(), response.url());
      }
    });

    // 访问首页
    console.log('访问 http://localhost:5173 ...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

    // 等待更长时间让页面完全加载
    await page.waitForTimeout(5000);

    // 检查页面HTML
    const html = await page.content();
    console.log('页面HTML长度:', html.length);

    // 检查是否有错误
    const hasError = await page.$$eval('.error, .error-page', els => els.length > 0);
    if (hasError) {
      console.log('页面显示错误');
    }

    // 检查是否有加载状态
    const hasLoading = await page.$$eval('.loading, .spinner', els => els.length > 0);
    if (hasLoading) {
      console.log('页面正在加载中');
    }

    // 尝试使用管理员凭据登录
    console.log('尝试使用管理员账号登录...');

    // 查找用户名输入框
    try {
      const usernameInput = await page.waitForSelector('input[type="text"], input[name="username"], input[placeholder*="用户"], input[placeholder*="账号"]', { timeout: 5000 });
      await usernameInput.fill('admin');

      // 查找密码输入框
      const passwordInput = await page.waitForSelector('input[type="password"], input[name="password"], input[placeholder*="密码"]', { timeout: 5000 });
      await passwordInput.fill('admin123');

      // 查找登录按钮
      const loginButton = await page.waitForSelector('button[type="submit"], button:has-text("登录"), .login-btn', { timeout: 5000 });
      await loginButton.click();

      console.log('已提交登录表单，等待响应...');
      await page.waitForTimeout(5000);

      // 检查登录是否成功
      const currentUrl = page.url();
      console.log('登录后URL:', currentUrl);

      // 截图登录后页面
      await page.screenshot({ path: '06-logged-in.png', fullPage: true });
      console.log('已保存登录后截图: 06-logged-in.png');

      // 如果登录成功，查找侧边栏和相册中心
      if (!currentUrl.includes('login')) {
        console.log('登录成功，查找相册中心...');

        // 等待侧边栏加载
        await page.waitForSelector('.sidebar, .nav-menu, [class*="menu"]', { timeout: 5000 }).catch(() => console.log('未找到侧边栏'));

        // 尝试多种方式查找相册中心
        const albumSelectors = [
          'a:has-text("相册")',
          'a:has-text("相册中心")',
          '[data-route*="album"]',
          'a[href*="album"]',
          '.menu-item:has-text("相册")'
        ];

        for (const selector of albumSelectors) {
          try {
            const albumLink = await page.$(selector);
            if (albumLink) {
              console.log(`找到相册链接: ${selector}`);
              await albumLink.click();
              await page.waitForTimeout(3000);

              // 截图相册中心页面
              await page.screenshot({ path: '07-album-center-detail.png', fullPage: true });
              console.log('已保存相册中心详细截图: 07-album-center-detail.png');

              // 分析相册中心内容
              const pageText = await page.textContent('body');
              console.log('相册中心页面文本内容长度:', pageText.length);
              console.log('页面内容片段:', pageText.substring(0, 500));

              // 查找统计数据
              const statsData = await page.$$eval('[class*="stat"], [class*="count"], [class*="number"], .el-statistic', elements =>
                elements.map(el => ({
                  text: el.textContent?.trim(),
                  class: el.className
                }))
              );
              console.log('统计数据:', statsData);

              break;
            }
          } catch (e) {
            continue;
          }
        }
      }

    } catch (error) {
      console.log('登录过程出错:', error.message);
    }

  } catch (error) {
    console.error('分析过程中出错:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

analyzePage().then(() => {
  console.log('分析完成');
}).catch(error => {
  console.error('分析失败:', error);
});