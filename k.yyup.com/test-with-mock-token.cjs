const { chromium } = require('playwright');

async function testWithMockToken() {
  console.log('使用模拟token测试相册中心...');
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
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // 在页面中执行登录和API测试
    const testResults = await page.evaluate(async () => {
      const results = [];

      // 模拟设置token到localStorage
      const mockToken = `mock_dev_token_${Date.now()}`;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('refreshToken', `refresh_${mockToken}`);

      // 创建模拟用户信息
      const mockUser = {
        id: 1,
        username: 'admin',
        real_name: '系统管理员',
        kindergartenId: 1,
        roles: ['admin', 'kindergarten_admin'],
        permissions: ['*']
      };
      localStorage.setItem('userInfo', JSON.stringify(mockUser));

      results.push({
        step: '模拟登录',
        status: 'success',
        data: { token: mockToken.substring(0, 20) + '...', user: mockUser.username }
      });

      // 测试相册统计API
      try {
        const albumResponse = await fetch('/api/albums/statistics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        });

        const albumData = await albumResponse.json();
        results.push({
          step: '相册统计API',
          status: albumResponse.ok ? 'success' : 'error',
          status_code: albumResponse.status,
          data: albumData
        });
      } catch (error) {
        results.push({
          step: '相册统计API',
          status: 'error',
          error: error.message
        });
      }

      // 测试媒体中心统计API
      try {
        const mediaResponse = await fetch('/api/media-center/statistics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        });

        const mediaData = await mediaResponse.json();
        results.push({
          step: '媒体中心统计API',
          status: mediaResponse.ok ? 'success' : 'error',
          status_code: mediaResponse.status,
          data: mediaData
        });
      } catch (error) {
        results.push({
          step: '媒体中心统计API',
          status: 'error',
          error: error.message
        });
      }

      // 测试相册列表API
      try {
        const albumListResponse = await fetch('/api/albums', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        });

        const albumListData = await albumListResponse.json();
        results.push({
          step: '相册列表API',
          status: albumListResponse.ok ? 'success' : 'error',
          status_code: albumListResponse.status,
          data: albumListData
        });
      } catch (error) {
        results.push({
          step: '相册列表API',
          status: 'error',
          error: error.message
        });
      }

      return results;
    });

    // 显示测试结果
    console.log('\n测试结果:');
    testResults.forEach((result, i) => {
      console.log(`\n${i+1}. ${result.step}`);
      console.log(`   状态: ${result.status}`);
      if (result.status_code) {
        console.log(`   状态码: ${result.status_code}`);
      }
      if (result.data) {
        if (typeof result.data === 'object') {
          console.log(`   数据: ${JSON.stringify(result.data, null, 6)}`);
        } else {
          console.log(`   数据: ${result.data}`);
        }
      }
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });

    // 尝试访问媒体中心页面
    console.log('\n尝试访问媒体中心页面...');
    await page.goto('http://localhost:5173/media-center', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 截图页面
    await page.screenshot({ path: 'media-center-with-token.png', fullPage: true });
    console.log('已保存媒体中心页面截图: media-center-with-token.png');

    // 获取页面内容
    const pageContent = await page.textContent('body');
    console.log('页面内容长度:', pageContent.length);

    // 查找统计数字
    const statsElements = await page.$$eval('[class*="stat"], [class*="number"], [class*="count"], .el-statistic', elements =>
      elements.map(el => ({
        text: el.textContent?.trim(),
        class: el.className
      }))
    );

    if (statsElements.length > 0) {
      console.log('\n页面中找到的统计数据:');
      statsElements.forEach((el, i) => {
        if (el.text && /\d+/.test(el.text)) {
          console.log(`  ${i+1}. ${el.text}`);
        }
      });
    }

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testWithMockToken().then(() => {
  console.log('\n测试完成');
}).catch(error => {
  console.error('测试执行失败:', error);
});