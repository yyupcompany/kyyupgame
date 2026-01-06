const { chromium } = require('playwright');

async function getAlbumData() {
  console.log('获取相册中心数据...');
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

    // 监听所有网络请求和响应
    const networkLog = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('localhost:3000') || url.includes('/api/')) {
        networkLog.push({
          type: 'request',
          method: request.method(),
          url: url,
          headers: request.headers(),
          timestamp: new Date().toISOString()
        });
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('localhost:3000') || url.includes('/api/')) {
        response.text().then(body => {
          networkLog.push({
            type: 'response',
            method: response.request().method(),
            url: url,
            status: response.status(),
            statusText: response.statusText(),
            body: body.substring(0, 500), // 只记录前500个字符
            timestamp: new Date().toISOString()
          });
        }).catch(() => {
          networkLog.push({
            type: 'response',
            method: response.request().method(),
            url: url,
            status: response.status(),
            statusText: response.statusText(),
            body: '[无法读取响应体]',
            timestamp: new Date().toISOString()
          });
        });
      }
    });

    // 访问首页，等待页面加载
    console.log('访问首页...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

    // 等待页面完成加载
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // 获取当前页面状态
    console.log('当前URL:', page.url());

    // 检查页面内容
    const pageContent = await page.content();
    console.log('页面HTML长度:', pageContent.length);

    // 查找相册或媒体相关的API调用
    const albumAPIs = networkLog.filter(log =>
      log.url.includes('album') ||
      log.url.includes('media') ||
      log.url.includes('photo')
    );

    if (albumAPIs.length > 0) {
      console.log('\n找到相册/媒体相关API调用:');
      albumAPIs.forEach((api, i) => {
        console.log(`\n${i+1}. ${api.type.toUpperCase()}: ${api.method} ${api.url}`);
        if (api.status) {
          console.log(`   状态: ${api.status} ${api.statusText}`);
          if (api.body) {
            console.log(`   响应: ${api.body}`);
          }
        }
      });
    }

    // 尝试直接访问相册API并使用已有的模拟token
    console.log('\n尝试直接调用相册统计API...');

    // 使用页面内置的模拟token
    const mockToken = `mock_dev_token_${Date.now()}`;

    const directResponse = await page.evaluate(async (token) => {
      try {
        const response = await fetch('/api/albums/statistics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        return {
          status: response.status,
          ok: response.ok,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    }, mockToken);

    console.log('相册统计API响应:');
    console.log(JSON.stringify(directResponse, null, 2));

    // 尝试调用媒体中心API
    console.log('\n尝试调用媒体中心统计API...');
    const mediaCenterResponse = await page.evaluate(async (token) => {
      try {
        const response = await fetch('/api/media-center/statistics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        return {
          status: response.status,
          ok: response.ok,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    }, mockToken);

    console.log('媒体中心统计API响应:');
    console.log(JSON.stringify(mediaCenterResponse, null, 2));

    // 显示所有网络日志
    console.log('\n所有API调用记录:');
    const allAPIs = networkLog.filter(log => log.url.includes('/api/'));
    allAPIs.forEach((api, i) => {
      console.log(`\n${i+1}. ${api.type.toUpperCase()}: ${api.method} ${api.url}`);
      if (api.status) {
        console.log(`   状态: ${api.status} ${api.statusText}`);
      }
    });

    // 截图当前页面
    await page.screenshot({ path: 'current-page-state.png', fullPage: true });
    console.log('\n已保存当前页面截图: current-page-state.png');

  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

getAlbumData().then(() => {
  console.log('\n获取完成');
}).catch(error => {
  console.error('获取失败:', error);
});