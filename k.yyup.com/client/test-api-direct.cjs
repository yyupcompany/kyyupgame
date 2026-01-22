const { chromium } = require('playwright');

(async () => {
  console.log('=== 直接API测试 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 登录
    console.log('1. 登录园长账号...');
    await page.goto('http://localhost:5174/login', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(5000);

    await page.evaluate(() => {
      const btns = document.querySelectorAll('.principal-btn');
      if (btns.length > 0) {
        btns[0].click();
      }
    });

    // 等待登录
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      const url = page.url();
      if (!url.includes('/login')) {
        console.log(`   登录成功 (${i+1}秒)`);
        break;
      }
    }

    // 2. 获取token
    console.log('\n2. 获取token...');
    const token = await page.evaluate(() => {
      return localStorage.getItem('kindergarten_token');
    });
    console.log('   Token:', token ? token.substring(0, 50) + '...' : '❌ 未找到');

    if (!token) {
      console.log('\n❌ 登录失败，测试终止');
      await browser.close();
      return;
    }

    // 3. 直接调用后端API
    console.log('\n3. 调用通知统计API...');
    const response = await page.evaluate(async (token) => {
      const res = await fetch('http://localhost:3000/api/principal/notifications/statistics?page=1&pageSize=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return {
        status: res.status,
        text: await res.text()
      };
    }, token);

    console.log('   响应状态:', response.status);
    console.log('   响应内容:', response.text.substring(0, 300));

    // 4. 测试结果
    console.log('\n=== 测试结果 ===');
    if (response.status === 200) {
      console.log('✅ API调用成功');
      try {
        const data = JSON.parse(response.text);
        console.log('   数据:', JSON.stringify(data, null, 2).substring(0, 200));
      } catch (e) {}
    } else if (response.status === 401) {
      console.log('⚠️ 需要认证 - 这是正常的');
    } else if (response.status === 404) {
      console.log('❌ 路由未找到');
    } else {
      console.log(`❌ 未知错误 (${response.status})`);
    }

  } catch (e) {
    console.log('\n❌ 测试异常:', e.message);
  }

  await browser.close();
})();
