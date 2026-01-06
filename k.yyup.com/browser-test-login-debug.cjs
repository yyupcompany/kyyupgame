/**
 * 调试登录流程
 */

const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🚀 调试登录流程');
  console.log('='.repeat(60));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // 启用详细日志
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('🌐 [浏览器]', msg.text());
      }
    });

    console.log('\n📍 访问登录页');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 截图登录页
    await page.screenshot({ path: '/home/zhgue/kyyupgame/k.yyup.com/login-page-initial.png' });
    console.log('✅ 截图已保存: login-page-initial.png');

    // 查找并点击管理员按钮
    console.log('\n📍 查找管理员按钮');
    const buttons = await page.$$('button, .el-button, [role="button"]');
    console.log(`   找到 ${buttons.length} 个按钮`);

    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), btn);
      console.log(`   - "${text}"`);
    }

    // 找到管理员按钮并点击
    const adminBtn = await page.$('button:has-text("系统管理员")');
    if (adminBtn) {
      console.log('\n✅ 找到管理员按钮，点击...');
      await adminBtn.click();
      await sleep(3000);

      // 截图点击后
      await page.screenshot({ path: '/home/zhgue/kyyupgame/k.yyup.com/login-page-after-click.png' });
      console.log('✅ 截图已保存: login-page-after-click.png');

      // 检查URL变化
      const urlAfterClick = page.url();
      console.log(`   点击后URL: ${urlAfterClick}`);

      // 等待跳转
      await sleep(5000);

      const finalUrl = page.url();
      console.log(`   最终URL: ${finalUrl}`);

      if (finalUrl !== urlAfterClick) {
        console.log('✅ 页面发生跳转！');
      } else {
        console.log('⚠️  页面未跳转');
      }
    } else {
      console.log('❌ 未找到管理员按钮');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 调试完成！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 调试失败:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();
