/**
 * 详细调试登录过程
 */

const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🚀 详细调试登录过程');
  console.log('='.repeat(60));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // 监听所有console消息
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'log' || type === 'info' || type === 'warn' || type === 'error') {
        console.log(`[${type.toUpperCase()}] ${text}`);
      }
    });

    // 监听网络请求
    page.on('request', request => {
      if (request.url().includes('/api/auth')) {
        console.log(`🌐 [网络] ${request.method()} ${request.url()}`);
      }
    });

    console.log('\n📍 步骤 1: 访问首页');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    console.log('\n📍 步骤 2: 查找并点击管理员按钮');
    const buttons = await page.$$('button, .el-button, [role="button"]');

    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), btn);
      if (text.includes('系统管理员')) {
        console.log(`   ✅ 找到按钮: "${text}"`);
        console.log('   📍 点击前URL:', page.url());

        // 在点击前检查用户store状态
        const userBefore = await page.evaluate(() => {
          return window?.$pinia?.state.value?.user?.userInfo || null;
        });
        console.log('   📊 点击前用户状态:', userBefore);

        await btn.click();
        console.log('   ✅ 按钮已点击');
        await sleep(1000);

        // 检查localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));
        const userInfo = await page.evaluate(() => localStorage.getItem('userInfo'));
        console.log('   💾 点击后token:', token ? '已设置' : '未设置');
        console.log('   💾 点击后userInfo:', userInfo ? '已设置' : '未设置');

        await sleep(5000); // 等待模拟登录处理

        console.log('\n📍 步骤 3: 检查登录结果');
        const url = page.url();
        console.log('   📍 当前URL:', url);

        // 检查用户store状态
        const userAfter = await page.evaluate(() => {
          return window?.$pinia?.state.value?.user?.userInfo || null;
        });
        console.log('   📊 登录后用户状态:', userAfter);

        if (!url.includes('/login')) {
          console.log('\n✅ 登录成功！页面已跳转');
          console.log(`   🎯 跳转到: ${url}`);

          // 尝试访问AI助手页面
          console.log('\n📍 步骤 4: 访问AI助手页面');
          await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle2', timeout: 30000 });
          await sleep(3000);

          const aiUrl = page.url();
          console.log('   📍 AI页面URL:', aiUrl);

          if (!aiUrl.includes('/login')) {
            console.log('\n🎉 AI助手页面访问成功！');

            // 检查Vue组件
            const appHTML = await page.evaluate(() => document.querySelector('#app')?.innerHTML.substring(0, 500));
            console.log('   📄 页面内容预览:', appHTML);

            await page.screenshot({ path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-working.png', fullPage: true });
            console.log('   📸 截图已保存: aiassistant-working.png');
          } else {
            console.log('\n⚠️  AI助手页面重定向到登录');
          }
        } else {
          console.log('\n❌ 登录失败，页面仍在登录页');

          // 检查是否有错误消息
          const errorMsg = await page.$('.el-message, .error-message');
          if (errorMsg) {
            const errorText = await page.evaluate(el => el.textContent, errorMsg);
            console.log('   🚨 错误消息:', errorText);
          }
        }

        break;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 详细调试完成！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 调试失败:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) await browser.close();
  }
})();
