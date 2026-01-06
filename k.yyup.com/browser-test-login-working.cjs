/**
 * 修复后的登录测试
 */

const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🚀 修复后的登录测试');
  console.log('='.repeat(60));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('\n📍 访问登录页');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 查找包含"系统管理员"的按钮
    console.log('\n📍 查找并点击管理员按钮');
    const buttons = await page.$$('button, .el-button, [role="button"]');
    console.log(`   找到 ${buttons.length} 个按钮`);

    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), btn);
      if (text.includes('系统管理员')) {
        console.log(`\n✅ 找到管理员按钮: "${text}"`);
        console.log('   点击按钮...');
        await btn.click();
        await sleep(3000);

        // 截图点击后
        await page.screenshot({ path: '/home/zhgue/kyyupgame/k.yyup.com/login-page-clicked.png' });
        console.log('   截图已保存');

        // 检查URL变化
        const url = page.url();
        console.log(`   点击后URL: ${url}`);

        // 等待登录处理
        console.log('   等待登录处理...');
        await sleep(5000);

        const finalUrl = page.url();
        console.log(`   最终URL: ${finalUrl}`);

        // 如果跳转了，说明登录成功
        if (!finalUrl.includes('/login')) {
          console.log('\n✅ 登录成功！页面已跳转');
          console.log(`   跳转到: ${finalUrl}`);

          // 尝试访问AI助手页面
          console.log('\n📍 访问AI助手页面');
          await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle2', timeout: 30000 });
          await sleep(3000);

          const aiUrl = page.url();
          console.log(`   AI页面URL: ${aiUrl}`);

          if (!aiUrl.includes('/login')) {
            console.log('✅ AI助手页面访问成功！');

            // 检查页面元素
            const hasAI = await page.$('.ai-assistant-container, [data-testid*="ai"]');
            if (hasAI) {
              console.log('✅ AI助手组件已加载');
            } else {
              console.log('⚠️  AI助手组件未找到（可能正在加载）');
            }

            // 最终截图
            await page.screenshot({ path: '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-success.png', fullPage: true });
            console.log('   最终截图已保存: aiassistant-success.png');
          } else {
            console.log('⚠️  AI助手页面重定向到登录（未登录）');
          }

          break;
        } else {
          console.log('⚠️  登录可能失败，页面仍在登录页');
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();
