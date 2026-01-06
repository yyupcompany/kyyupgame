const { chromium } = require('playwright');

async function testAssessmentRoutes() {
  console.log('🚀 开始测评路由测试');

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 先登录
    console.log('📍 步骤1: 登录');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'testparent');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const loginUrl = page.url();
    console.log('登录后URL:', loginUrl);

    if (!loginUrl.includes('/login')) {
      console.log('✅ 登录成功');

      // 测试发现的测评路由
      const assessmentRoutes = ['/assessment', '/evaluation'];

      for (const route of assessmentRoutes) {
        try {
          console.log(`\n📍 测试路由: ${route}`);
          await page.goto(`http://localhost:5173${route}`);
          await page.waitForTimeout(3000);

          const routeUrl = page.url();
          console.log(`访问结果: ${routeUrl}`);

          // 截图
          const filename = 'route-' + route.replace('/', '') + '.png';
          await page.screenshot({ path: filename });
          console.log('📸 截图已保存');

          // 获取页面标题
          const title = await page.title();
          console.log('页面标题:', title);

          // 检查页面内容
          const pageContent = await page.content();
          const hasAssessmentContent = pageContent.includes('测评') ||
                                     pageContent.includes('评估') ||
                                     pageContent.includes('测试') ||
                                     pageContent.includes('发育') ||
                                     pageContent.includes('幼小');

          console.log(`包含测评内容: ${hasAssessmentContent ? '✅' : '❌'}`);

        } catch (error) {
          console.log(`❌ 访问路由 ${route} 失败: ${error.message}`);
        }
      }

      // 返回仪表板查找功能
      console.log('\n📍 返回仪表板查找功能');
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(2000);

      const allLinks = await page.$$eval('a, button', els =>
        els.map(el => ({
          text: el.textContent?.trim() || '',
          href: el.href || ''
        })).filter(item => item.text && item.text.length > 0)
      );

      console.log('\n📋 仪表板可用功能:');
      allLinks.slice(0, 15).forEach((link, index) => {
        console.log(`${index + 1}. ${link.text}`);
      });

      // 查找可能的家长功能
      const parentFunctions = allLinks.filter(link =>
        link.text.includes('家长') ||
        link.text.includes('孩子') ||
        link.text.includes('成长') ||
        link.text.includes('测评')
      );

      if (parentFunctions.length > 0) {
        console.log('\n👨‍👩‍👧‍👦 家长相关功能:');
        parentFunctions.forEach((func, index) => {
          console.log(`${index + 1}. ${func.text}`);
        });
      }

    } else {
      console.log('❌ 登录失败');
    }

    await browser.close();
    console.log('\n🎉 路由测试完成');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAssessmentRoutes();